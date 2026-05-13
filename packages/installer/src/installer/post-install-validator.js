/**
 * Post-Installation Validator
 * Validates installation integrity by comparing installed files against SIGNED manifest
 *
 * @module src/installer/post-install-validator
 * @story 6.19 - Post-Installation Validation & Integrity Verification
 * @version 2.0.0 - Security hardened
 *
 * SECURITY MODEL:
 * - Manifest MUST be cryptographically signed before any file access
 * - All paths are validated for containment before filesystem operations
 * - Symlinks are explicitly rejected
 * - Repair operations require source file hash verification
 * - Fail closed on any security violation
 *
 * Features:
 * - Validates all installed files against signed install-manifest.yaml
 * - Verifies SHA256 hashes for integrity checking
 * - Detects missing, corrupted, and extra files
 * - Provides detailed reports with actionable remediation
 * - Supports automatic repair of missing files (with verification)
 * - Cross-platform compatible (Windows, macOS, Linux)
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { hashFile, hashesMatch } = require('./file-hasher');
const { loadAndVerifyManifest } = require('./manifest-signature');

/**
 * Validation result severity levels
 * @enum {string}
 */
const Severity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
};

/**
 * Validation issue types
 * @enum {string}
 */
const IssueType = {
  MISSING_FILE: 'MISSING_FILE',
  CORRUPTED_FILE: 'CORRUPTED_FILE',
  EXTRA_FILE: 'EXTRA_FILE',
  MISSING_MANIFEST: 'MISSING_MANIFEST',
  INVALID_MANIFEST: 'INVALID_MANIFEST',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  SIZE_MISMATCH: 'SIZE_MISMATCH',
  INVALID_PATH: 'INVALID_PATH',
  SYMLINK_REJECTED: 'SYMLINK_REJECTED',
  SIGNATURE_MISSING: 'SIGNATURE_MISSING',
  SIGNATURE_INVALID: 'SIGNATURE_INVALID',
  HASH_ERROR: 'HASH_ERROR',
  SCHEMA_VIOLATION: 'SCHEMA_VIOLATION',
};

/**
 * File categories for prioritized reporting
 * @enum {string}
 */
const FileCategory = {
  CORE: 'core',
  CLI: 'cli',
  DEVELOPMENT: 'development',
  INFRASTRUCTURE: 'infrastructure',
  PRODUCT: 'product',
  WORKFLOW: 'workflow',
  WORKFLOW_INTELLIGENCE: 'workflow-intelligence',
  MONITOR: 'monitor',
  OTHER: 'other',
};

/**
 * Security limits to prevent DoS attacks
 */
const SecurityLimits = {
  MAX_MANIFEST_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_COUNT: 50000,
  MAX_SCAN_DEPTH: 50,
  MAX_SCAN_FILES: 100000,
  MAX_PATH_LENGTH: 1024,
};

/**
 * Allowed fields in manifest entries (reject unknown fields)
 */
const ALLOWED_MANIFEST_FIELDS = ['path', 'hash', 'size', 'type'];

/**
 * Allowed type values in manifest entries
 * These represent file categories, not filesystem types
 * Based on actual types used in install-manifest.yaml
 */
const ALLOWED_TYPE_VALUES = [
  // General types
  'file',
  'other',
  // Structural categories
  'cli',
  'core',
  'development',
  'infrastructure',
  'product',
  'workflow',
  'workflow-intelligence',
  'monitor',
  'data',
  'docs',
  'documentation',
  'template',
  'script',
  'config',
  // Content types
  'task',
  'agent',
  'tool',
  'checklist',
  'elicitation',
  'code',
  'manifest',
];

const PROJECT_MUTABLE_MANIFEST_PATHS = new Set([
  'core-config.yaml',
  'data/entity-registry.yaml',
]);

/**
 * Categorize a file path into its functional category
 * @param {string} filePath - Relative file path
 * @returns {FileCategory} - File category
 */
function categorizeFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();

  if (normalized.startsWith('core/')) return FileCategory.CORE;
  if (normalized.startsWith('cli/')) return FileCategory.CLI;
  if (normalized.startsWith('development/')) return FileCategory.DEVELOPMENT;
  if (normalized.startsWith('infrastructure/')) return FileCategory.INFRASTRUCTURE;
  if (normalized.startsWith('product/')) return FileCategory.PRODUCT;
  if (normalized.startsWith('workflow-intelligence/')) return FileCategory.WORKFLOW_INTELLIGENCE;
  if (normalized.startsWith('monitor/')) return FileCategory.MONITOR;
  if (normalized.includes('workflow')) return FileCategory.WORKFLOW;

  return FileCategory.OTHER;
}

/**
 * Get severity based on file category
 * @param {FileCategory} category - File category
 * @returns {Severity} - Severity level
 */
function getSeverityForCategory(category) {
  const severityMap = {
    [FileCategory.CORE]: Severity.CRITICAL,
    [FileCategory.CLI]: Severity.HIGH,
    [FileCategory.DEVELOPMENT]: Severity.HIGH,
    [FileCategory.INFRASTRUCTURE]: Severity.MEDIUM,
    [FileCategory.PRODUCT]: Severity.MEDIUM,
    [FileCategory.WORKFLOW]: Severity.MEDIUM,
    [FileCategory.WORKFLOW_INTELLIGENCE]: Severity.HIGH,
    [FileCategory.MONITOR]: Severity.MEDIUM,
    [FileCategory.OTHER]: Severity.LOW,
  };

  return severityMap[category] || Severity.LOW;
}

/**
 * Determine whether a manifest path is expected to be mutated by install/bootstrap.
 * These files still go through path/existence/symlink validation, but their content
 * is project-local after install and must not be hash-compared to the package copy.
 *
 * @param {string} filePath - Relative file path from .aiox-core
 * @returns {boolean} True when the file is project mutable
 */
function isProjectMutableManifestPath(filePath) {
  const normalized = String(filePath || '').replace(/\\/g, '/');
  return PROJECT_MUTABLE_MANIFEST_PATHS.has(normalized);
}

/**
 * Validate that a resolved path is contained within the root directory
 * Prevents path traversal attacks via malicious manifest entries
 *
 * SECURITY: Handles Windows case-insensitivity and alternate data streams
 *
 * @param {string} absolutePath - The resolved absolute path to check
 * @param {string} rootDir - The root directory that should contain the path
 * @returns {boolean} - True if path is safely contained within root
 */
function isPathContained(absolutePath, rootDir) {
  const normalizedRoot = path.resolve(rootDir);
  const normalizedPath = path.resolve(absolutePath);

  // SECURITY: Case-insensitive comparison on Windows
  const comparableRoot =
    process.platform === 'win32' ? normalizedRoot.toLowerCase() : normalizedRoot;
  const comparablePath =
    process.platform === 'win32' ? normalizedPath.toLowerCase() : normalizedPath;

  // SECURITY: Reject alternate data streams (Windows)
  // Valid format: drive letter at start only (e.g., "C:\")
  // Reject any other ':' in the path (indicates ADS like "file.txt:stream")
  const colonCount = (absolutePath.match(/:/g) || []).length;
  if (process.platform === 'win32') {
    // Windows: allow exactly one colon at position 1 (drive letter)
    if (colonCount > 1 || (colonCount === 1 && !absolutePath.match(/^[a-zA-Z]:[/\\]/))) {
      return false;
    }
  } else {
    // Unix: reject any colon (could indicate ADS-like attacks)
    if (colonCount > 0) {
      return false;
    }
  }

  // Path must be equal to root or start with root + separator
  return comparablePath === comparableRoot || comparablePath.startsWith(comparableRoot + path.sep);
}

/**
 * Validate a manifest entry against strict schema
 * SECURITY: Rejects unknown fields and invalid types
 *
 * @param {*} entry - Manifest entry to validate
 * @param {number} index - Entry index for error reporting
 * @returns {{ valid: boolean, error: string|null, sanitized: Object|null }}
 */
function validateManifestEntry(entry, index) {
  // Must be a plain object
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    return { valid: false, error: `Entry ${index}: not an object`, sanitized: null };
  }

  // SECURITY: Reject unknown fields
  for (const key of Object.keys(entry)) {
    if (!ALLOWED_MANIFEST_FIELDS.includes(key)) {
      return { valid: false, error: `Entry ${index}: unknown field '${key}'`, sanitized: null };
    }
  }

  // path: required, string, non-empty
  if (typeof entry.path !== 'string' || entry.path.length === 0) {
    return { valid: false, error: `Entry ${index}: missing or invalid 'path'`, sanitized: null };
  }

  // SECURITY: Path validation
  const pathVal = entry.path;

  // Reject null bytes
  if (pathVal.includes('\0')) {
    return { valid: false, error: `Entry ${index}: path contains null byte`, sanitized: null };
  }

  // Reject path traversal sequences
  if (pathVal.includes('..')) {
    return {
      valid: false,
      error: `Entry ${index}: path contains '..' traversal`,
      sanitized: null,
    };
  }

  // Reject absolute paths
  if (path.isAbsolute(pathVal)) {
    return { valid: false, error: `Entry ${index}: absolute path not allowed`, sanitized: null };
  }

  // Reject excessively long paths
  if (pathVal.length > SecurityLimits.MAX_PATH_LENGTH) {
    return { valid: false, error: `Entry ${index}: path exceeds maximum length`, sanitized: null };
  }

  // SECURITY: Reject alternate data streams (Windows ADS) and colons in paths
  // Colons are not valid in filenames on Windows and could indicate ADS attacks
  if (pathVal.includes(':')) {
    return {
      valid: false,
      error: `Entry ${index}: path contains ':' (potential ADS attack)`,
      sanitized: null,
    };
  }

  // hash: optional, but if present must be valid format
  if (entry.hash !== undefined && entry.hash !== null) {
    if (typeof entry.hash !== 'string') {
      return { valid: false, error: `Entry ${index}: hash must be a string`, sanitized: null };
    }
    if (!entry.hash.match(/^sha256:[a-f0-9]{64}$/i)) {
      return { valid: false, error: `Entry ${index}: invalid hash format`, sanitized: null };
    }
  }

  // size: optional, but if present must be non-negative integer
  if (entry.size !== undefined && entry.size !== null) {
    if (typeof entry.size !== 'number' || !Number.isInteger(entry.size) || entry.size < 0) {
      return {
        valid: false,
        error: `Entry ${index}: size must be non-negative integer`,
        sanitized: null,
      };
    }
  }

  // type: optional, if present must be from allowed list
  if (entry.type !== undefined && entry.type !== null) {
    if (!ALLOWED_TYPE_VALUES.includes(entry.type)) {
      return {
        valid: false,
        error: `Entry ${index}: invalid type '${entry.type}'`,
        sanitized: null,
      };
    }
  }

  // Return sanitized entry with normalized path
  return {
    valid: true,
    error: null,
    sanitized: {
      path: pathVal.replace(/\\/g, '/'),
      hash: entry.hash ? String(entry.hash).toLowerCase() : null,
      size: typeof entry.size === 'number' ? entry.size : null,
      type: entry.type || 'file',
    },
  };
}

/**
 * Post-Installation Validator Class
 * Comprehensive validation of AIOX-Core installation with security hardening
 */
class PostInstallValidator {
  /**
   * Create a new PostInstallValidator instance
   *
   * @param {string} targetDir - Directory where AIOX was installed (project root)
   * @param {string} [sourceDir] - Source directory for repairs (optional)
   * @param {Object} [options] - Validation options
   * @param {boolean} [options.verifyHashes=true] - Whether to verify file hashes
   * @param {boolean} [options.detectExtras=false] - Whether to detect extra files
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {boolean} [options.requireSignature=true] - Require manifest signature
   * @param {Function} [options.onProgress] - Progress callback (current, total, file)
   */
  constructor(targetDir, sourceDir = null, options = {}) {
    this.targetDir = path.resolve(targetDir);
    this.sourceDir = sourceDir ? path.resolve(sourceDir) : null;
    this.aioxCoreTarget = path.join(this.targetDir, '.aiox-core');
    this.aioxCoreSource = this.sourceDir ? path.join(this.sourceDir, '.aiox-core') : null;

    this.options = {
      verifyHashes: options.verifyHashes !== false,
      detectExtras: options.detectExtras === true,
      verbose: options.verbose === true,
      requireSignature: options.requireSignature !== false,
      onProgress: options.onProgress || (() => {}),
    };

    this.manifest = null;
    this.manifestVerified = false;
    this.issues = [];
    this.stats = {
      totalFiles: 0,
      validFiles: 0,
      missingFiles: 0,
      corruptedFiles: 0,
      extraFiles: 0,
      skippedFiles: 0,
    };

    // INS-2 Performance: Cache realpath of target directory (computed once, used for all files)
    // This eliminates redundant fs.realpathSync() calls - 50% reduction in syscalls
    this._realTargetDirCache = null;
  }

  /**
   * Get the real path of the target directory (cached)
   * INS-2 Performance Optimization: Reduces syscalls from 2 to 1 per file validation
   * @returns {string|null} - Real path or null if resolution fails
   */
  _getRealTargetDir() {
    if (this._realTargetDirCache === null) {
      try {
        this._realTargetDirCache = fs.realpathSync(this.aioxCoreTarget);
      } catch {
        // Will be handled by caller
        return null;
      }
    }
    return this._realTargetDirCache;
  }

  /**
   * Load, verify signature, and parse the install manifest
   * SECURITY: Signature is verified BEFORE parsing YAML
   *
   * @returns {Promise<Object|null>} - Parsed manifest or null if verification fails
   */
  async loadManifest() {
    // Determine manifest path
    const sourceManifestPath = this.aioxCoreSource
      ? path.join(this.aioxCoreSource, 'install-manifest.yaml')
      : null;
    const targetManifestPath = path.join(this.aioxCoreTarget, 'install-manifest.yaml');

    let manifestPath = targetManifestPath;

    // Prefer source manifest (has hashes)
    if (sourceManifestPath && fs.existsSync(sourceManifestPath)) {
      manifestPath = sourceManifestPath;
      this.log(`Using source manifest: ${sourceManifestPath}`);
    } else if (!fs.existsSync(targetManifestPath)) {
      this.issues.push({
        type: IssueType.MISSING_MANIFEST,
        severity: Severity.CRITICAL,
        message: 'Install manifest not found',
        details: `Expected at: ${targetManifestPath}`,
        remediation: 'Re-run installation or copy manifest from source package',
        relativePath: null,
      });
      return null;
    }

    // SECURITY [C1]: Verify signature BEFORE parsing
    if (this.options.requireSignature) {
      const verifyResult = loadAndVerifyManifest(manifestPath, {
        requireSignature: true,
      });

      if (verifyResult.error) {
        const issueType = verifyResult.error.includes('not found')
          ? IssueType.SIGNATURE_MISSING
          : IssueType.SIGNATURE_INVALID;

        this.issues.push({
          type: issueType,
          severity: Severity.CRITICAL,
          message: `Manifest signature verification failed: ${verifyResult.error}`,
          details: 'The manifest cannot be trusted without a valid signature',
          remediation: 'Obtain a properly signed manifest from the official source',
          relativePath: null,
        });
        return null; // HARD FAIL
      }

      this.manifestVerified = verifyResult.verified;

      // Parse verified content
      try {
        return this.parseManifestContent(verifyResult.content.toString('utf8'));
      } catch (error) {
        this.issues.push({
          type: IssueType.INVALID_MANIFEST,
          severity: Severity.CRITICAL,
          message: 'Failed to parse verified manifest',
          details: error.message,
          remediation: 'Re-download manifest from trusted source',
          relativePath: null,
        });
        return null;
      }
    }

    // Development mode: signature not required (NOT for production)
    this.log('WARNING: Signature verification disabled - development mode only');
    try {
      // SECURITY [DOS-3]: Check file size BEFORE reading into memory
      const manifestStat = fs.statSync(manifestPath);
      if (manifestStat.size > SecurityLimits.MAX_MANIFEST_SIZE) {
        this.issues.push({
          type: IssueType.INVALID_MANIFEST,
          severity: Severity.CRITICAL,
          message: 'Manifest file exceeds maximum size',
          details: `Size: ${manifestStat.size} bytes, Max: ${SecurityLimits.MAX_MANIFEST_SIZE} bytes`,
          remediation: 'Use a valid manifest file from the official source',
          relativePath: null,
        });
        return null;
      }

      const content = fs.readFileSync(manifestPath, 'utf8');
      return this.parseManifestContent(content);
    } catch (error) {
      this.issues.push({
        type: IssueType.INVALID_MANIFEST,
        severity: Severity.CRITICAL,
        message: 'Failed to read manifest',
        details: error.message,
        remediation: 'Re-run installation',
        relativePath: null,
      });
      return null;
    }
  }

  /**
   * Parse manifest content with strict validation
   * SECURITY [C2]: Uses FAILSAFE_SCHEMA to prevent code execution
   * SECURITY [H5]: Validates schema strictly
   *
   * @param {string} content - Raw manifest content
   * @returns {Object} Parsed and validated manifest
   */
  parseManifestContent(content) {
    // SECURITY [DOS-4]: Size limit using byte length, not character length
    // String.length counts Unicode characters, not bytes. A string with multibyte
    // characters (emojis, CJK) would have fewer characters than bytes.
    // Example: "🔒" has length 2 but is 4 bytes in UTF-8
    const byteLength = Buffer.byteLength(content, 'utf8');
    if (byteLength > SecurityLimits.MAX_MANIFEST_SIZE) {
      throw new Error(
        `Manifest exceeds maximum size (${byteLength} bytes > ${SecurityLimits.MAX_MANIFEST_SIZE} bytes)`,
      );
    }

    // SECURITY [C2]: Use FAILSAFE_SCHEMA - no custom types, no code execution
    const parsed = yaml.load(content, { schema: yaml.FAILSAFE_SCHEMA });

    // Validate root structure
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Manifest must be a valid YAML object');
    }

    if (!Array.isArray(parsed.files)) {
      throw new Error('Manifest missing required "files" array');
    }

    // SECURITY: File count limit
    if (parsed.files.length > SecurityLimits.MAX_FILE_COUNT) {
      throw new Error(
        `Manifest contains too many files (${parsed.files.length} > ${SecurityLimits.MAX_FILE_COUNT})`,
      );
    }

    // SECURITY [H5]: Validate and sanitize each entry
    const sanitizedFiles = [];
    for (let i = 0; i < parsed.files.length; i++) {
      const entry = parsed.files[i];

      // Handle string format (simple manifest)
      if (typeof entry === 'string') {
        const validation = validateManifestEntry({ path: entry }, i);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        sanitizedFiles.push(validation.sanitized);
        continue;
      }

      // SECURITY [H5-PRE]: Reject unknown fields BEFORE normalization
      // This prevents malicious fields from being silently dropped
      if (typeof entry === 'object' && entry !== null) {
        for (const key of Object.keys(entry)) {
          if (!ALLOWED_MANIFEST_FIELDS.includes(key)) {
            throw new Error(`Entry ${i}: unknown field '${key}' in manifest`);
          }
        }
      }

      // SECURITY [H5-SIZE]: Fail fast on malformed sizes instead of silently nulling
      // When size is present but invalid, reject the manifest entirely
      if (entry.size !== undefined && entry.size !== null) {
        const sizeNum = Number(entry.size);
        if (Number.isNaN(sizeNum) || !Number.isInteger(sizeNum) || sizeNum < 0) {
          throw new Error(
            `Entry ${i}: invalid size '${entry.size}' for path '${entry.path}' (must be non-negative integer)`,
          );
        }
      }

      // Object format - convert FAILSAFE_SCHEMA strings to proper types
      const normalizedEntry = {
        path: entry.path,
        hash: entry.hash,
        // FAILSAFE_SCHEMA returns all values as strings, convert size to number
        // Size already validated above, safe to convert
        size: entry.size !== undefined && entry.size !== null ? Number(entry.size) : null,
        type: entry.type,
      };

      const validation = validateManifestEntry(normalizedEntry, i);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      sanitizedFiles.push(validation.sanitized);
    }

    this.manifest = {
      ...parsed,
      files: sanitizedFiles,
    };

    this.log(
      `Loaded manifest v${this.manifest.version || 'unknown'} with ${this.manifest.files.length} files`,
    );

    return this.manifest;
  }

  /**
   * Validate a single file against manifest entry
   * SECURITY [C3]: Rejects symlinks and non-regular files
   * SECURITY [H1]: Validates path containment
   * SECURITY [H2]: Requires size in quick mode
   * SECURITY [H3]: Treats hash errors as failures
   *
   * @param {Object} entry - Validated manifest entry
   * @returns {Promise<Object>} - Validation result
   */
  async validateFile(entry) {
    const relativePath = entry.path;
    const absolutePath = path.resolve(this.aioxCoreTarget, relativePath);
    const category = categorizeFile(relativePath);

    const result = {
      path: relativePath,
      category,
      exists: false,
      hashValid: null,
      sizeValid: null,
      issue: null,
    };

    // SECURITY [H1]: Validate path containment
    if (!isPathContained(absolutePath, this.aioxCoreTarget)) {
      this.log(`SECURITY: Path traversal blocked: ${relativePath}`);
      result.issue = {
        type: IssueType.INVALID_PATH,
        severity: Severity.CRITICAL,
        message: 'Path traversal attempt blocked',
        details: 'Manifest entry attempts to access outside installation directory',
        category,
        remediation: 'This indicates a malicious or corrupted manifest',
        relativePath,
      };
      this.stats.skippedFiles++;
      return result;
    }

    // Check file existence
    let lstat;
    try {
      lstat = fs.lstatSync(absolutePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        result.issue = {
          type: IssueType.MISSING_FILE,
          severity: getSeverityForCategory(category),
          message: `Missing file: ${relativePath}`,
          details: `Expected at: ${absolutePath}`,
          category,
          remediation: this.sourceDir
            ? "Run 'aiox validate --repair' to restore"
            : 'Re-run installation',
          relativePath,
        };
        this.stats.missingFiles++;
        return result;
      }

      result.issue = {
        type: IssueType.PERMISSION_ERROR,
        severity: Severity.HIGH,
        message: `Cannot access file: ${relativePath}`,
        details: error.message,
        category,
        remediation: 'Check file permissions',
        relativePath,
      };
      this.stats.skippedFiles++;
      return result;
    }

    // SECURITY [C3]: Reject symlinks
    if (lstat.isSymbolicLink()) {
      result.issue = {
        type: IssueType.SYMLINK_REJECTED,
        severity: Severity.CRITICAL,
        message: `Symlink not allowed: ${relativePath}`,
        details: 'Symlinks are rejected to prevent path escape attacks',
        category,
        remediation: 'Replace symlink with actual file',
        relativePath,
      };
      this.stats.skippedFiles++;
      return result;
    }

    // SECURITY [C3]: Reject non-regular files
    if (!lstat.isFile()) {
      result.issue = {
        type: IssueType.INVALID_PATH,
        severity: Severity.HIGH,
        message: `Not a regular file: ${relativePath}`,
        details: `Found ${lstat.isDirectory() ? 'directory' : 'special file'} instead of file`,
        category,
        remediation: 'Only regular files are allowed',
        relativePath,
      };
      this.stats.skippedFiles++;
      return result;
    }

    // SECURITY [C3-REALPATH]: Detect symlinks in intermediate directory components
    // A file may not be a symlink itself, but a parent directory could be,
    // allowing path traversal attacks (e.g., /install/.aiox-core/symlinked-dir/../../../etc/passwd)
    //
    // NOTE: On macOS, /tmp is a symlink to /private/tmp. This is a system-level
    // symlink that shouldn't trigger security alerts. We handle this by resolving
    // both the file path AND the target directory to their real paths, then
    // comparing containment. The key security check is: does the real path of the
    // file stay within the real path of the target directory?
    //
    // INS-2 Performance: realTargetDir is now cached via _getRealTargetDir()
    // This reduces syscalls from 2 to 1 per file (50% reduction)
    try {
      const realPath = fs.realpathSync(absolutePath);
      const realTargetDir = this._getRealTargetDir();

      // Handle case where target dir resolution failed
      if (realTargetDir === null) {
        this.log('SECURITY: Cannot resolve realpath for target directory');
        result.issue = {
          type: IssueType.PERMISSION_ERROR,
          severity: Severity.CRITICAL,
          message: 'Cannot resolve real path for target directory',
          details: 'Target directory realpath resolution failed',
          category,
          remediation: 'Check directory permissions',
          relativePath,
        };
        this.stats.skippedFiles++;
        return result;
      }

      // SECURITY: Verify realpath is still contained within REAL target directory
      // This handles system symlinks like /tmp -> /private/tmp correctly
      if (!isPathContained(realPath, realTargetDir)) {
        this.log(`SECURITY: Realpath escapes target directory: ${relativePath}`);
        result.issue = {
          type: IssueType.INVALID_PATH,
          severity: Severity.CRITICAL,
          message: `Path escape via symlink detected: ${relativePath}`,
          details: `Real path ${realPath} is outside installation directory ${realTargetDir}`,
          category,
          remediation: 'This indicates a path traversal attack via symlinked directories',
          relativePath,
        };
        this.stats.skippedFiles++;
        return result;
      }

      // SECURITY: Detect symlinks in the RELATIVE portion of the path
      // Compare the relative path from target to file with the relative path
      // from realTarget to realPath. If they differ, there's a symlink attack.
      const expectedRelative = path.relative(this.aioxCoreTarget, absolutePath);
      const actualRelative = path.relative(realTargetDir, realPath);

      // Platform-aware comparison (case-insensitive on Windows)
      const comparableExpected =
        process.platform === 'win32' ? expectedRelative.toLowerCase() : expectedRelative;
      const comparableActual =
        process.platform === 'win32' ? actualRelative.toLowerCase() : actualRelative;

      if (comparableExpected !== comparableActual) {
        this.log(`SECURITY: Symlinked path component detected: ${relativePath}`);
        result.issue = {
          type: IssueType.SYMLINK_REJECTED,
          severity: Severity.CRITICAL,
          message: `Symlinked path component detected: ${relativePath}`,
          details: `Resolved relative path differs: expected '${expectedRelative}', got '${actualRelative}'`,
          category,
          remediation: 'Remove symlinks from directory structure',
          relativePath,
        };
        this.stats.skippedFiles++;
        return result;
      }
    } catch (error) {
      // realpathSync can fail if file doesn't exist or permission denied
      // File existence already checked via lstat, so this indicates permission issue
      this.log(`SECURITY: Cannot resolve realpath for: ${relativePath} - ${error.message}`);
      result.issue = {
        type: IssueType.PERMISSION_ERROR,
        severity: Severity.HIGH,
        message: `Cannot resolve real path: ${relativePath}`,
        details: error.message,
        category,
        remediation: 'Check file and directory permissions',
        relativePath,
      };
      this.stats.skippedFiles++;
      return result;
    }

    result.exists = true;

    if (isProjectMutableManifestPath(relativePath)) {
      result.projectMutable = true;
      this.stats.validFiles++;
      return result;
    }

    // SECURITY [H2]: In quick mode (no hash), size MUST be present
    if (!this.options.verifyHashes) {
      if (entry.size === null || entry.size === undefined) {
        result.issue = {
          type: IssueType.SCHEMA_VIOLATION,
          severity: Severity.HIGH,
          message: `Missing size in manifest: ${relativePath}`,
          details: 'Size is required when hash verification is disabled',
          category,
          remediation: 'Use full validation mode or update manifest with size information',
          relativePath,
        };
        this.stats.skippedFiles++;
        return result;
      }
    }

    // Verify file size
    const actualSize = lstat.size;
    if (entry.size !== null && entry.size !== undefined) {
      result.sizeValid = actualSize === entry.size;

      if (!result.sizeValid) {
        this.log(`Size mismatch: ${relativePath} (expected ${entry.size}, got ${actualSize})`);

        // In quick mode, size mismatch is a failure
        if (!this.options.verifyHashes) {
          result.issue = {
            type: IssueType.SIZE_MISMATCH,
            severity: getSeverityForCategory(category),
            message: `File size mismatch: ${relativePath}`,
            details: `Expected: ${entry.size} bytes, Got: ${actualSize} bytes`,
            category,
            remediation: this.sourceDir
              ? "Run 'aiox validate --repair' to restore"
              : 'Re-run installation',
            relativePath,
          };
          this.stats.corruptedFiles++;
          return result;
        }
      }
    }

    // SECURITY [H7]: Missing hash when hash verification is enabled is a schema violation
    // This MUST be checked BEFORE the hash verification block to prevent bypass
    if (this.options.verifyHashes && !entry.hash) {
      result.issue = {
        type: IssueType.SCHEMA_VIOLATION,
        severity: getSeverityForCategory(category),
        message: `Missing hash in manifest: ${relativePath}`,
        details: 'Hash verification enabled but no hash provided in manifest',
        category,
        remediation: 'Update manifest with file hashes or disable hash verification',
        relativePath,
      };
      this.stats.corruptedFiles++;
      return result;
    }

    // Verify hash (full validation)
    if (this.options.verifyHashes && entry.hash) {
      try {
        const actualHash = `sha256:${hashFile(absolutePath)}`;
        result.hashValid = hashesMatch(actualHash, entry.hash);

        if (!result.hashValid) {
          result.issue = {
            type: IssueType.CORRUPTED_FILE,
            severity: getSeverityForCategory(category),
            message: `Hash mismatch: ${relativePath}`,
            details: `Expected: ${entry.hash.substring(0, 24)}..., Got: ${actualHash.substring(0, 24)}...`,
            category,
            remediation: this.sourceDir
              ? "Run 'aiox validate --repair' to restore"
              : 'Re-run installation',
            relativePath,
          };
          this.stats.corruptedFiles++;
          return result;
        }
      } catch (error) {
        // SECURITY [H3]: Hash errors are failures, not skips
        result.issue = {
          type: IssueType.HASH_ERROR,
          severity: Severity.HIGH,
          message: `Hash verification error: ${relativePath}`,
          details: error.message,
          category,
          remediation: 'Check file accessibility and try again',
          relativePath,
        };
        this.stats.corruptedFiles++;
        return result;
      }
    }

    // File is valid
    this.stats.validFiles++;
    return result;
  }

  /**
   * Scan for extra files not in manifest
   * SECURITY [H6]: Implements depth and file count limits
   *
   * @returns {Promise<Array>} - List of extra file paths
   */
  async detectExtraFiles() {
    if (!this.options.detectExtras || !this.manifest) {
      return [];
    }

    // SECURITY: Only use case-insensitive comparison on Windows
    // On case-sensitive filesystems (Linux/macOS), preserve case to detect
    // malicious files that differ only by case (e.g., Malicious.js vs malicious.js)
    const isWindows = process.platform === 'win32';
    const normalizePath = (p) => (isWindows ? p.toLowerCase() : p);
    const manifestPaths = new Set(this.manifest.files.map((f) => normalizePath(f.path)));
    const extraFiles = [];
    let filesScanned = 0;

    const scanDir = async (dir, basePath, depth = 0) => {
      // SECURITY [H6]: Depth limit
      if (depth > SecurityLimits.MAX_SCAN_DEPTH) {
        this.log(`SECURITY: Max scan depth exceeded at ${dir}`);
        return;
      }

      // SECURITY [H6]: File count limit
      if (filesScanned >= SecurityLimits.MAX_SCAN_FILES) {
        this.log('SECURITY: Max scan file count exceeded');
        return;
      }

      if (!fs.existsSync(dir)) return;

      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch (error) {
        this.log(`Cannot read directory: ${dir} - ${error.message}`);
        return;
      }

      for (const entry of entries) {
        if (filesScanned >= SecurityLimits.MAX_SCAN_FILES) break;

        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');

        filesScanned++;

        if (entry.isDirectory()) {
          await scanDir(fullPath, basePath, depth + 1);
        } else if (entry.isFile()) {
          // Skip manifests
          if (
            relativePath === 'install-manifest.yaml' ||
            relativePath === 'install-manifest.yaml.minisig' ||
            relativePath === '.installed-manifest.yaml'
          ) {
            continue;
          }

          if (!manifestPaths.has(normalizePath(relativePath))) {
            extraFiles.push(relativePath);
            this.stats.extraFiles++;
          }
        }
        // Symlinks and special files are silently ignored in extra detection
      }
    };

    await scanDir(this.aioxCoreTarget, this.aioxCoreTarget);
    return extraFiles;
  }

  /**
   * Run full validation
   *
   * @returns {Promise<Object>} - Comprehensive validation report
   */
  async validate() {
    const startTime = Date.now();

    this.log('Starting post-installation validation...');

    // Reset state
    this.issues = [];
    this.manifestVerified = false;
    this.stats = {
      totalFiles: 0,
      validFiles: 0,
      missingFiles: 0,
      corruptedFiles: 0,
      extraFiles: 0,
      skippedFiles: 0,
    };

    // Check target directory
    if (!fs.existsSync(this.aioxCoreTarget)) {
      this.issues.push({
        type: IssueType.MISSING_FILE,
        severity: Severity.CRITICAL,
        message: 'AIOX-Core directory not found',
        details: `Expected at: ${this.aioxCoreTarget}`,
        remediation: 'Run `npx aiox-core install`',
        relativePath: null,
      });
      return this.generateReport(startTime);
    }

    // Load and verify manifest
    const manifest = await this.loadManifest();
    if (!manifest) {
      return this.generateReport(startTime);
    }

    this.stats.totalFiles = manifest.files.length;

    // Validate each file
    const fileResults = [];
    for (let i = 0; i < manifest.files.length; i++) {
      const entry = manifest.files[i];
      this.options.onProgress(i + 1, manifest.files.length, entry.path);

      const result = await this.validateFile(entry);
      fileResults.push(result);

      if (result.issue) {
        this.issues.push(result.issue);
      }
    }

    // Detect extra files
    const extraFiles = await this.detectExtraFiles();
    for (const extraPath of extraFiles) {
      this.issues.push({
        type: IssueType.EXTRA_FILE,
        severity: Severity.INFO,
        message: `Extra file: ${extraPath}`,
        details: 'File not in manifest',
        category: categorizeFile(extraPath),
        remediation: 'Review if this file should be kept',
        relativePath: extraPath,
      });
    }

    return this.generateReport(startTime, fileResults);
  }

  /**
   * Generate validation report
   *
   * @param {number} startTime - Start timestamp
   * @param {Array} [fileResults] - File validation results
   * @returns {Object} - Report
   */
  generateReport(startTime, _fileResults = []) {
    const duration = Date.now() - startTime;

    // Group by severity
    const issuesBySeverity = {
      [Severity.CRITICAL]: [],
      [Severity.HIGH]: [],
      [Severity.MEDIUM]: [],
      [Severity.LOW]: [],
      [Severity.INFO]: [],
    };

    for (const issue of this.issues) {
      issuesBySeverity[issue.severity].push(issue);
    }

    // Group missing by category
    const missingByCategory = {};
    for (const issue of this.issues.filter((i) => i.type === IssueType.MISSING_FILE)) {
      const category = issue.category || FileCategory.OTHER;
      if (!missingByCategory[category]) {
        missingByCategory[category] = [];
      }
      missingByCategory[category].push(issue.relativePath);
    }

    // Determine status
    let status = 'success';
    if (issuesBySeverity[Severity.CRITICAL].length > 0) {
      status = 'failed';
    } else if (
      this.stats.missingFiles > 0 ||
      this.stats.corruptedFiles > 0 ||
      issuesBySeverity[Severity.HIGH].length > 0 ||
      issuesBySeverity[Severity.MEDIUM].length > 0
    ) {
      status = 'warning';
    } else if (this.issues.length > 0) {
      status = 'info';
    }

    // Integrity score
    const integrityScore =
      this.stats.totalFiles > 0
        ? Math.round((this.stats.validFiles / this.stats.totalFiles) * 100)
        : 0;

    return {
      status,
      integrityScore,
      manifestVerified: this.manifestVerified,
      signatureRequired: this.options.requireSignature,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      manifest: this.manifest
        ? {
          version: this.manifest.version,
          generatedAt: this.manifest.generated_at,
          totalFiles: this.manifest.files.length,
        }
        : null,
      stats: { ...this.stats },
      issues: this.issues,
      issuesBySeverity,
      missingByCategory,
      summary: {
        total: this.stats.totalFiles,
        valid: this.stats.validFiles,
        missing: this.stats.missingFiles,
        corrupted: this.stats.corruptedFiles,
        extra: this.stats.extraFiles,
        skipped: this.stats.skippedFiles,
      },
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Generate recommendations
   *
   * @returns {Array<string>} - Recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (!this.manifestVerified && this.options.requireSignature) {
      recommendations.push(
        'CRITICAL: Manifest signature verification failed. Do not trust validation results.',
      );
    }

    if (this.stats.missingFiles > 0) {
      if (this.stats.missingFiles > 50) {
        recommendations.push('Consider re-running full installation.');
      } else {
        recommendations.push(
          `${this.stats.missingFiles} file(s) missing. Run 'aiox validate --repair'.`,
        );
      }
    }

    if (this.stats.corruptedFiles > 0) {
      recommendations.push(
        `${this.stats.corruptedFiles} file(s) corrupted. Run 'aiox validate --repair'.`,
      );
    }

    if (this.stats.validFiles === this.stats.totalFiles && this.stats.totalFiles > 0) {
      recommendations.push('Installation verified successfully.');
    }

    return recommendations;
  }

  /**
   * Repair installation by copying missing/corrupted files
   * SECURITY [C4]: Verifies source file hash before copying
   *
   * @param {Object} [options] - Repair options
   * @param {boolean} [options.dryRun=false] - Only report, don't copy
   * @param {Function} [options.onProgress] - Progress callback
   * @returns {Promise<Object>} - Repair result
   */
  async repair(options = {}) {
    const dryRun = options.dryRun === true;
    const onProgress = options.onProgress || (() => {});

    // SECURITY [C4]: Repair requires hash verification enabled
    if (!this.options.verifyHashes) {
      return {
        success: false,
        error: 'Repair requires hash verification to be enabled',
        repaired: [],
        failed: [],
        skipped: [],
      };
    }

    // SECURITY [C4]: Repair requires verified manifest
    if (this.options.requireSignature && !this.manifestVerified) {
      return {
        success: false,
        error: 'Repair requires a verified manifest signature',
        repaired: [],
        failed: [],
        skipped: [],
      };
    }

    if (!this.sourceDir || !fs.existsSync(this.aioxCoreSource)) {
      return {
        success: false,
        error: 'Source directory not available',
        repaired: [],
        failed: [],
        skipped: [],
      };
    }

    // Run validation first if needed
    if (this.issues.length === 0 && this.stats.totalFiles === 0) {
      await this.validate();
    }

    const repairableIssues = this.issues.filter(
      (i) =>
        i.type === IssueType.MISSING_FILE ||
        i.type === IssueType.CORRUPTED_FILE ||
        i.type === IssueType.SIZE_MISMATCH,
    );

    const result = {
      success: true,
      dryRun,
      repaired: [],
      failed: [],
      skipped: [],
    };

    for (let i = 0; i < repairableIssues.length; i++) {
      const issue = repairableIssues[i];
      // SECURITY [H4]: Use relativePath from issue, not parsed from message
      const relativePath = issue.relativePath;

      if (!relativePath) {
        result.failed.push({ path: 'unknown', reason: 'Missing path in issue' });
        continue;
      }

      const sourcePath = path.resolve(this.aioxCoreSource, relativePath);
      const targetPath = path.resolve(this.aioxCoreTarget, relativePath);

      onProgress(i + 1, repairableIssues.length, relativePath);

      // SECURITY: Path containment for source
      if (!isPathContained(sourcePath, this.aioxCoreSource)) {
        result.skipped.push({ path: relativePath, reason: 'Source path traversal blocked' });
        continue;
      }

      // SECURITY: Path containment for target
      if (!isPathContained(targetPath, this.aioxCoreTarget)) {
        result.skipped.push({ path: relativePath, reason: 'Target path traversal blocked' });
        continue;
      }

      // Check source exists
      let sourceLstat;
      try {
        sourceLstat = fs.lstatSync(sourcePath);
      } catch (_error) {
        result.failed.push({ path: relativePath, reason: 'Source file not found' });
        result.success = false;
        continue;
      }

      // SECURITY [C3]: Reject source symlinks
      if (sourceLstat.isSymbolicLink()) {
        result.skipped.push({ path: relativePath, reason: 'Source is symlink' });
        continue;
      }

      if (!sourceLstat.isFile()) {
        result.skipped.push({ path: relativePath, reason: 'Source is not a regular file' });
        continue;
      }

      // SECURITY [C4]: Verify source file hash matches manifest
      const manifestEntry = this.manifest.files.find((f) => f.path === relativePath);
      if (!manifestEntry || !manifestEntry.hash) {
        result.failed.push({ path: relativePath, reason: 'No hash in manifest for verification' });
        result.success = false;
        continue;
      }

      try {
        const sourceHash = `sha256:${hashFile(sourcePath)}`;
        if (!hashesMatch(sourceHash, manifestEntry.hash)) {
          result.failed.push({
            path: relativePath,
            reason: 'Source file hash does not match signed manifest',
          });
          result.success = false;
          continue;
        }
      } catch (error) {
        result.failed.push({ path: relativePath, reason: `Cannot hash source: ${error.message}` });
        result.success = false;
        continue;
      }

      // Dry run - just report
      if (dryRun) {
        result.repaired.push({
          path: relativePath,
          action: issue.type === IssueType.MISSING_FILE ? 'would_copy' : 'would_replace',
        });
        continue;
      }

      // SECURITY [TOCTOU]: Verify target path has no symlinks in any component
      // This prevents race condition attacks where a directory is replaced with a symlink
      // between the containment check and the actual copy operation
      try {
        const targetDir = path.dirname(targetPath);

        // Walk each path component from aioxCoreTarget to targetDir
        // and verify none are symlinks
        let currentPath = this.aioxCoreTarget;
        const relativeParts = path.relative(this.aioxCoreTarget, targetDir).split(path.sep);

        for (const part of relativeParts) {
          if (!part || part === '.') continue;
          currentPath = path.join(currentPath, part);

          // Check if this path component exists and is a symlink
          try {
            const componentStat = fs.lstatSync(currentPath);
            if (componentStat.isSymbolicLink()) {
              result.skipped.push({
                path: relativePath,
                reason: `Symlink detected in path component: ${path.relative(this.aioxCoreTarget, currentPath)}`,
              });
              continue;
            }
          } catch (_statError) {
            // Path component doesn't exist yet, will be created by ensureDir
            // This is OK - we'll create it as a real directory
            break;
          }
        }

        // Final realpath verification: ensure resolved target stays within resolved aioxCoreTarget
        // This catches any symlinks that might have been missed or created during the check
        if (fs.existsSync(targetDir)) {
          const realTargetDir = fs.realpathSync(targetDir);
          const realAioxCoreTarget = fs.realpathSync(this.aioxCoreTarget);

          if (!isPathContained(realTargetDir, realAioxCoreTarget)) {
            result.skipped.push({
              path: relativePath,
              reason: `Realpath escapes target directory: ${realTargetDir} is outside ${realAioxCoreTarget}`,
            });
            continue;
          }
        }
      } catch (toctouError) {
        result.skipped.push({
          path: relativePath,
          reason: `TOCTOU verification failed: ${toctouError.message}`,
        });
        continue;
      }

      // Perform copy
      try {
        await fs.ensureDir(path.dirname(targetPath));
        await fs.copy(sourcePath, targetPath, { overwrite: true });
        result.repaired.push({
          path: relativePath,
          action: issue.type === IssueType.MISSING_FILE ? 'copied' : 'replaced',
        });
      } catch (error) {
        result.failed.push({ path: relativePath, reason: error.message });
        result.success = false;
      }
    }

    return result;
  }

  /**
   * Log if verbose
   * @param {string} message - Message
   */
  log(message) {
    if (this.options.verbose) {
      console.log(`[PostInstallValidator] ${message}`);
    }
  }
}

/**
 * Format report for console
 *
 * @param {Object} report - Validation report
 * @param {Object} [options] - Format options
 * @returns {string} - Formatted report
 */
function formatReport(report, options = {}) {
  const useColors = options.colors !== false;
  // Note: detailed option is parsed from CLI but detailed view is handled by caller
  // eslint-disable-next-line no-unused-vars
  const detailed = options.detailed === true;

  const c = {
    reset: useColors ? '\x1b[0m' : '',
    bold: useColors ? '\x1b[1m' : '',
    dim: useColors ? '\x1b[2m' : '',
    red: useColors ? '\x1b[31m' : '',
    green: useColors ? '\x1b[32m' : '',
    yellow: useColors ? '\x1b[33m' : '',
    blue: useColors ? '\x1b[34m' : '',
    cyan: useColors ? '\x1b[36m' : '',
    gray: useColors ? '\x1b[90m' : '',
  };

  const lines = [];

  lines.push('');
  lines.push(`${c.bold}AIOX-Core Installation Validation Report${c.reset}`);
  lines.push(`${c.gray}${'─'.repeat(50)}${c.reset}`);

  // Signature status
  if (report.manifestVerified) {
    lines.push(`${c.green}✓${c.reset} Manifest signature: ${c.green}VERIFIED${c.reset}`);
  } else if (report.signatureRequired) {
    lines.push(`${c.red}✗${c.reset} Manifest signature: ${c.red}NOT VERIFIED${c.reset}`);
  } else {
    lines.push(`${c.yellow}⚠${c.reset} Manifest signature: ${c.yellow}NOT REQUIRED${c.reset}`);
  }

  // Status
  const statusIcon =
    {
      success: `${c.green}✓${c.reset}`,
      warning: `${c.yellow}⚠${c.reset}`,
      failed: `${c.red}✗${c.reset}`,
      info: `${c.blue}ℹ${c.reset}`,
    }[report.status] || '?';

  const statusText =
    {
      success: `${c.green}PASSED${c.reset}`,
      warning: `${c.yellow}WARNING${c.reset}`,
      failed: `${c.red}FAILED${c.reset}`,
      info: `${c.blue}INFO${c.reset}`,
    }[report.status] || 'UNKNOWN';

  lines.push(`${statusIcon} Status: ${statusText}`);
  lines.push(`${c.dim}  Integrity Score: ${report.integrityScore}%${c.reset}`);

  lines.push('');
  lines.push(`${c.bold}Summary${c.reset}`);
  lines.push(`  Total files:     ${report.summary.total}`);
  lines.push(`  ${c.green}Valid:${c.reset}           ${report.summary.valid}`);

  if (report.summary.missing > 0) {
    lines.push(`  ${c.red}Missing:${c.reset}         ${report.summary.missing}`);
  }
  if (report.summary.corrupted > 0) {
    lines.push(`  ${c.yellow}Corrupted:${c.reset}       ${report.summary.corrupted}`);
  }
  if (report.summary.extra > 0) {
    lines.push(`  ${c.cyan}Extra:${c.reset}           ${report.summary.extra}`);
  }
  if (report.summary.skipped > 0) {
    lines.push(`  ${c.gray}Skipped:${c.reset}         ${report.summary.skipped}`);
  }

  // Critical issues
  const criticalIssues = report.issuesBySeverity[Severity.CRITICAL] || [];
  if (criticalIssues.length > 0) {
    lines.push('');
    lines.push(`${c.red}${c.bold}Critical Issues${c.reset}`);
    for (const issue of criticalIssues.slice(0, 5)) {
      lines.push(`  ${c.red}✗${c.reset} ${issue.message}`);
      if (issue.remediation) {
        lines.push(`    ${c.dim}→ ${issue.remediation}${c.reset}`);
      }
    }
  }

  // Recommendations
  if (report.recommendations && report.recommendations.length > 0) {
    lines.push('');
    lines.push(`${c.bold}Recommendations${c.reset}`);
    for (const rec of report.recommendations) {
      lines.push(`  ${c.cyan}→${c.reset} ${rec}`);
    }
  }

  lines.push('');
  lines.push(`${c.dim}Completed in ${report.duration}${c.reset}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Quick validation helper
 *
 * @param {string} targetDir - Target directory
 * @param {Object} [options] - Options
 * @returns {Promise<Object>} - Report
 */
async function quickValidate(targetDir, options = {}) {
  const validator = new PostInstallValidator(targetDir, options.sourceDir, {
    verifyHashes: options.verifyHashes !== false,
    detectExtras: options.detectExtras === true,
    verbose: options.verbose === true,
    requireSignature: options.requireSignature !== false,
    onProgress: options.onProgress,
  });

  return validator.validate();
}

module.exports = {
  PostInstallValidator,
  formatReport,
  quickValidate,
  Severity,
  IssueType,
  FileCategory,
  SecurityLimits,
  isPathContained,
  isProjectMutableManifestPath,
  validateManifestEntry,
};
