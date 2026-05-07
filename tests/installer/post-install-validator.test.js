/**
 * Post-Installation Validator Security Tests
 *
 * @module tests/installer/post-install-validator.test.js
 * @story 6.19 - Post-Installation Validation & Integrity Verification
 *
 * These tests verify security-critical behavior:
 * - Signature verification
 * - Path traversal prevention
 * - Symlink rejection
 * - Safe repair operations
 * - Quick mode safety
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const {
  PostInstallValidator,
  isPathContained,
  validateManifestEntry,
  IssueType,
  Severity,
  SecurityLimits,
  isProjectMutableManifestPath,
} = require('../../packages/installer/src/installer/post-install-validator');

describe('PostInstallValidator Security Tests', () => {
  let testDir;
  let targetDir;
  let sourceDir;

  beforeEach(async () => {
    // Create isolated test directory
    testDir = path.join(os.tmpdir(), `aiox-validator-test-${Date.now()}`);
    targetDir = path.join(testDir, 'target');
    sourceDir = path.join(testDir, 'source');

    await fs.ensureDir(path.join(targetDir, '.aiox-core'));
    await fs.ensureDir(path.join(sourceDir, '.aiox-core'));
  });

  afterEach(async () => {
    // Cleanup
    if (testDir && fs.existsSync(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe('Path Containment (isPathContained)', () => {
    test('should allow paths within root', () => {
      expect(isPathContained('/root/dir/file.txt', '/root/dir')).toBe(true);
      expect(isPathContained('/root/dir/sub/file.txt', '/root/dir')).toBe(true);
    });

    test('should reject path traversal with ..', () => {
      const root = path.resolve('/root/dir');
      const malicious = path.resolve('/root/dir/../etc/passwd');
      expect(isPathContained(malicious, root)).toBe(false);
    });

    test('should reject paths outside root', () => {
      expect(isPathContained('/etc/passwd', '/root/dir')).toBe(false);
      expect(isPathContained('/root/other/file', '/root/dir')).toBe(false);
    });

    test('should handle Windows alternate data streams', () => {
      // Alternate data streams should be rejected
      expect(isPathContained('C:\\root\\file.txt:stream', 'C:\\root')).toBe(false);
      expect(isPathContained('/root/file.txt:hidden', '/root')).toBe(false);
    });

    test('should allow root directory itself', () => {
      expect(isPathContained('/root/dir', '/root/dir')).toBe(true);
    });

    if (process.platform === 'win32') {
      test('should handle Windows case-insensitivity', () => {
        expect(isPathContained('C:\\Root\\Dir\\file.txt', 'c:\\root\\dir')).toBe(true);
        expect(isPathContained('c:\\ROOT\\DIR\\FILE.TXT', 'C:\\root\\dir')).toBe(true);
      });
    }
  });

  describe('Manifest Entry Validation (validateManifestEntry)', () => {
    test('should accept valid entry', () => {
      const result = validateManifestEntry(
        {
          path: 'core/config.js',
          hash: 'sha256:' + 'a'.repeat(64),
          size: 1234,
        },
        0,
      );
      expect(result.valid).toBe(true);
      expect(result.sanitized.path).toBe('core/config.js');
    });

    test('should reject unknown fields', () => {
      const result = validateManifestEntry(
        {
          path: 'file.txt',
          hash: 'sha256:' + 'a'.repeat(64),
          malicious: 'payload',
        },
        0,
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("unknown field 'malicious'");
    });

    test('should reject path traversal in entry', () => {
      const result = validateManifestEntry({ path: '../../../etc/passwd' }, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('..');
    });

    test('should reject null bytes in path', () => {
      const result = validateManifestEntry({ path: 'file\x00.txt' }, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('null byte');
    });

    test('should reject absolute paths', () => {
      const result = validateManifestEntry({ path: '/etc/passwd' }, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('absolute path');
    });

    test('should reject excessively long paths', () => {
      const longPath = 'a'.repeat(SecurityLimits.MAX_PATH_LENGTH + 1);
      const result = validateManifestEntry({ path: longPath }, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('maximum length');
    });

    test('should reject invalid hash format', () => {
      const result = validateManifestEntry({ path: 'file.txt', hash: 'md5:invalidhash' }, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalid hash format');
    });

    test('should reject negative size', () => {
      const result = validateManifestEntry({ path: 'file.txt', size: -1 }, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('non-negative integer');
    });

    test('should reject unknown type values', () => {
      const result = validateManifestEntry({ path: 'dir/', type: 'directory' }, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("invalid type 'directory'");
    });

    test('should reject arrays as entries', () => {
      const result = validateManifestEntry(['not', 'an', 'object'], 0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not an object');
    });
  });

  describe('Symlink Rejection', () => {
    test('should reject symlinks during validation', async () => {
      // Create a regular file and a symlink to it
      const realFile = path.join(targetDir, '.aiox-core', 'real.txt');
      const symlink = path.join(targetDir, '.aiox-core', 'link.txt');

      await fs.writeFile(realFile, 'content');

      // Create symlink (skip on Windows if not admin)
      try {
        await fs.symlink(realFile, symlink);
      } catch (e) {
        // Skip test on Windows without admin privileges
        if (e.code === 'EPERM') {
          console.log('Skipping symlink test - requires admin on Windows');
          return;
        }
        throw e;
      }

      // Create manifest pointing to symlink
      const manifest = {
        version: '1.0.0',
        files: [{ path: 'link.txt', hash: null, size: null }],
      };
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        'version: "1.0.0"\nfiles:\n  - path: link.txt',
      );

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
        verifyHashes: false,
      });

      const report = await validator.validate();

      // Should have a symlink rejection issue
      const symlinkIssue = report.issues.find((i) => i.type === IssueType.SYMLINK_REJECTED);
      expect(symlinkIssue).toBeDefined();
      expect(symlinkIssue.severity).toBe(Severity.CRITICAL);
    });
  });

  describe('Signature Verification', () => {
    test('should fail when signature is required but missing', async () => {
      // Create manifest without signature
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        'version: "1.0.0"\nfiles:\n  - path: test.txt',
      );

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: true, // Require signature
      });

      const report = await validator.validate();

      expect(report.status).toBe('failed');
      const sigIssue = report.issues.find(
        (i) => i.type === IssueType.SIGNATURE_MISSING || i.type === IssueType.SIGNATURE_INVALID,
      );
      expect(sigIssue).toBeDefined();
      expect(sigIssue.severity).toBe(Severity.CRITICAL);
    });

    test('should allow validation without signature in dev mode', async () => {
      // Create valid manifest and file
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        'version: "1.0.0"\nfiles:\n  - path: test.txt\n    size: 4',
      );
      await fs.writeFile(path.join(targetDir, '.aiox-core', 'test.txt'), 'test');

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false, // Dev mode
        verifyHashes: false,
      });

      const report = await validator.validate();

      // Should succeed without signature in dev mode
      expect(report.manifestVerified).toBe(false);
      expect(report.signatureRequired).toBe(false);
      expect(report.status).not.toBe('failed');
    });
  });

  describe('Quick Mode Safety (H2)', () => {
    test('should fail when size is missing in quick mode', async () => {
      // Create manifest without size
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        'version: "1.0.0"\nfiles:\n  - path: test.txt',
      );
      await fs.writeFile(path.join(targetDir, '.aiox-core', 'test.txt'), 'content');

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
        verifyHashes: false, // Quick mode
      });

      const report = await validator.validate();

      const schemaIssue = report.issues.find((i) => i.type === IssueType.SCHEMA_VIOLATION);
      expect(schemaIssue).toBeDefined();
      expect(schemaIssue.message).toContain('Missing size');
    });

    test('should fail on size mismatch in quick mode', async () => {
      // Create manifest with wrong size
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        'version: "1.0.0"\nfiles:\n  - path: test.txt\n    size: 999',
      );
      await fs.writeFile(path.join(targetDir, '.aiox-core', 'test.txt'), 'small');

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
        verifyHashes: false,
      });

      const report = await validator.validate();

      const sizeIssue = report.issues.find((i) => i.type === IssueType.SIZE_MISMATCH);
      expect(sizeIssue).toBeDefined();
      expect(report.stats.corruptedFiles).toBe(1);
    });
  });

  describe('Missing Hash Detection (H7)', () => {
    test('should fail when hash is missing but verifyHashes is true', async () => {
      // Create manifest without hash but with size
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        'version: "1.0.0"\nfiles:\n  - path: test.txt\n    size: 7',
      );
      await fs.writeFile(path.join(targetDir, '.aiox-core', 'test.txt'), 'content');

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
        verifyHashes: true, // Full validation mode
      });

      const report = await validator.validate();

      // Should have a schema violation for missing hash
      const schemaIssue = report.issues.find((i) => i.type === IssueType.SCHEMA_VIOLATION);
      expect(schemaIssue).toBeDefined();
      expect(schemaIssue.message).toContain('Missing hash in manifest');
      expect(schemaIssue.details).toContain('Hash verification enabled');
      expect(report.stats.corruptedFiles).toBe(1);
    });

    test('should fail when hash is empty string but verifyHashes is true', async () => {
      // Create manifest with empty hash (YAML null becomes empty after FAILSAFE parsing)
      // Using explicit empty string to test falsy hash values
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        'version: "1.0.0"\nfiles:\n  - path: test.txt\n    hash: ""\n    size: 7',
      );
      await fs.writeFile(path.join(targetDir, '.aiox-core', 'test.txt'), 'content');

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
        verifyHashes: true,
      });

      const report = await validator.validate();

      // Empty hash should fail format validation during manifest parsing
      const invalidIssue = report.issues.find((i) => i.type === IssueType.INVALID_MANIFEST);
      expect(invalidIssue).toBeDefined();
      expect(invalidIssue.details).toContain('invalid hash format');
    });

    test('should pass when hash is missing but verifyHashes is false (quick mode)', async () => {
      // Create manifest without hash but with size
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        'version: "1.0.0"\nfiles:\n  - path: test.txt\n    size: 7',
      );
      await fs.writeFile(path.join(targetDir, '.aiox-core', 'test.txt'), 'content');

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
        verifyHashes: false, // Quick mode - hash not required
      });

      const report = await validator.validate();

      // Should NOT have a schema violation for missing hash in quick mode
      const schemaIssue = report.issues.find(
        (i) => i.type === IssueType.SCHEMA_VIOLATION && i.message.includes('Missing hash'),
      );
      expect(schemaIssue).toBeUndefined();
      expect(report.stats.validFiles).toBe(1);
    });
  });

  describe('Project Mutable Install Artifacts', () => {
    test('should classify only install-mutated manifest paths as project mutable', () => {
      expect(isProjectMutableManifestPath('core-config.yaml')).toBe(true);
      expect(isProjectMutableManifestPath('data/entity-registry.yaml')).toBe(true);
      expect(isProjectMutableManifestPath('data/capability-detection.js')).toBe(false);
      expect(isProjectMutableManifestPath('core/config.js')).toBe(false);
    });

    test('should not mark installer-mutated files as corrupted after content changes', async () => {
      const manifest = `version: "1.0.0"
files:
  - path: core-config.yaml
    hash: "sha256:${'a'.repeat(64)}"
    size: 10
  - path: data/entity-registry.yaml
    hash: "sha256:${'b'.repeat(64)}"
    size: 10`;

      await fs.ensureDir(path.join(targetDir, '.aiox-core', 'data'));
      await fs.writeFile(path.join(targetDir, '.aiox-core', 'install-manifest.yaml'), manifest);
      await fs.writeFile(path.join(targetDir, '.aiox-core', 'core-config.yaml'), 'project:\n  name: generated\n');
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'data', 'entity-registry.yaml'),
        'metadata:\n  entityCount: 757\n  updatedAt: now\n',
      );

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
        verifyHashes: true,
      });

      const report = await validator.validate();

      expect(report.status).toBe('success');
      expect(report.stats.validFiles).toBe(2);
      expect(report.stats.corruptedFiles).toBe(0);
      expect(report.issues).toHaveLength(0);
    });

    test('should still report corruption for non-mutable manifest paths', async () => {
      const manifest = `version: "1.0.0"
files:
  - path: data/capability-detection.js
    hash: "sha256:${'c'.repeat(64)}"
    size: 10`;

      await fs.ensureDir(path.join(targetDir, '.aiox-core', 'data'));
      await fs.writeFile(path.join(targetDir, '.aiox-core', 'install-manifest.yaml'), manifest);
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'data', 'capability-detection.js'),
        'module.exports = {};\n',
      );

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
        verifyHashes: true,
      });

      const report = await validator.validate();

      expect(report.status).toBe('warning');
      expect(report.stats.corruptedFiles).toBe(1);
      expect(report.issues[0].type).toBe(IssueType.CORRUPTED_FILE);
    });
  });

  describe('Secure Repair (C4)', () => {
    test('should refuse repair without hash verification', async () => {
      const validator = new PostInstallValidator(targetDir, sourceDir, {
        requireSignature: false,
        verifyHashes: false, // Disabled
      });

      const result = await validator.repair();

      expect(result.success).toBe(false);
      expect(result.error).toContain('hash verification');
    });

    test('should refuse repair without verified manifest', async () => {
      // Setup manifest
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        `version: "1.0.0"\nfiles:\n  - path: test.txt\n    hash: "sha256:${'a'.repeat(64)}"\n    size: 4`,
      );

      const validator = new PostInstallValidator(targetDir, sourceDir, {
        requireSignature: true, // Requires signature
        verifyHashes: true,
      });

      // Validate first (will fail due to missing signature)
      await validator.validate();

      // Try repair
      const result = await validator.repair();

      expect(result.success).toBe(false);
      expect(result.error).toContain('verified manifest');
    });

    test('should verify source hash before copying', async () => {
      // Create source file with different content than manifest hash
      const sourceFile = path.join(sourceDir, '.aiox-core', 'test.txt');
      await fs.writeFile(sourceFile, 'wrong content');

      // Create manifest with different hash
      const manifest = `version: "1.0.0"
files:
  - path: test.txt
    hash: "sha256:${'a'.repeat(64)}"
    size: 13`;

      await fs.writeFile(path.join(targetDir, '.aiox-core', 'install-manifest.yaml'), manifest);
      await fs.writeFile(path.join(sourceDir, '.aiox-core', 'install-manifest.yaml'), manifest);

      const validator = new PostInstallValidator(targetDir, sourceDir, {
        requireSignature: false, // For testing
        verifyHashes: true,
      });

      // Manually set manifestVerified for testing
      validator.manifestVerified = true;

      // Validate (will find missing file)
      await validator.validate();

      // Manually add a missing file issue for repair
      validator.issues = [
        {
          type: IssueType.MISSING_FILE,
          relativePath: 'test.txt',
          message: 'Missing file: test.txt',
        },
      ];
      validator.manifest = {
        files: [{ path: 'test.txt', hash: `sha256:${'a'.repeat(64)}`, size: 13 }],
      };

      const result = await validator.repair();

      // Should fail because source hash doesn't match manifest
      expect(result.success).toBe(false);
      const failedItem = result.failed.find((f) => f.path === 'test.txt');
      expect(failedItem).toBeDefined();
      expect(failedItem.reason).toContain('hash does not match');
    });
  });

  describe('Hash Error Handling (H3)', () => {
    test('should treat hash errors as failures', async () => {
      // Create a file that will cause hash error (e.g., directory instead of file)
      const dirPath = path.join(targetDir, '.aiox-core', 'notafile');
      await fs.ensureDir(dirPath);

      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        `version: "1.0.0"\nfiles:\n  - path: notafile\n    hash: "sha256:${'a'.repeat(64)}"\n    size: 0`,
      );

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
        verifyHashes: true,
      });

      const report = await validator.validate();

      // Should be treated as invalid path (directory, not file)
      const issue = report.issues.find(
        (i) => i.type === IssueType.INVALID_PATH || i.type === IssueType.HASH_ERROR,
      );
      expect(issue).toBeDefined();
    });
  });

  describe('DoS Protection (H6)', () => {
    test('should enforce max file count in manifest', async () => {
      // Create manifest with too many files
      const files = [];
      for (let i = 0; i < SecurityLimits.MAX_FILE_COUNT + 1; i++) {
        files.push(`  - path: file${i}.txt`);
      }

      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        `version: "1.0.0"\nfiles:\n${files.join('\n')}`,
      );

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
      });

      const report = await validator.validate();

      expect(report.status).toBe('failed');
      const manifestIssue = report.issues.find((i) => i.type === IssueType.INVALID_MANIFEST);
      expect(manifestIssue).toBeDefined();
      expect(manifestIssue.details).toContain('too many files');
    });

    test('should enforce max manifest size', async () => {
      // Create oversized manifest
      const bigContent = 'a'.repeat(SecurityLimits.MAX_MANIFEST_SIZE + 1);

      await fs.writeFile(path.join(targetDir, '.aiox-core', 'install-manifest.yaml'), bigContent);

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
      });

      const report = await validator.validate();

      expect(report.status).toBe('failed');
    });

    test('should use byte length not character length for size check (DOS-4)', async () => {
      // Create content with multibyte characters
      // Each emoji is 4 bytes in UTF-8 but only 2 characters in JS string
      // 🔒 = 4 bytes, but "🔒".length = 2 (surrogate pair)
      const emojiCount = Math.floor(SecurityLimits.MAX_MANIFEST_SIZE / 4) + 1000;
      const emojiContent = '🔒'.repeat(emojiCount);

      // Verify our test setup: character count is less than byte limit
      expect(emojiContent.length).toBeLessThan(SecurityLimits.MAX_MANIFEST_SIZE);
      // But byte count exceeds limit
      expect(Buffer.byteLength(emojiContent, 'utf8')).toBeGreaterThan(
        SecurityLimits.MAX_MANIFEST_SIZE,
      );

      await fs.writeFile(path.join(targetDir, '.aiox-core', 'install-manifest.yaml'), emojiContent);

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
      });

      const report = await validator.validate();

      // Should fail because byte size exceeds limit, even though char count doesn't
      expect(report.status).toBe('failed');
      const manifestIssue = report.issues.find((i) => i.type === IssueType.INVALID_MANIFEST);
      expect(manifestIssue).toBeDefined();
      expect(manifestIssue.details).toContain('bytes');
    });

    test('should check file size before reading (DOS-3)', async () => {
      // This test verifies that pre-read size check works
      // We create an oversized file and ensure it's rejected before full read
      const bigContent = 'x'.repeat(SecurityLimits.MAX_MANIFEST_SIZE + 100);

      await fs.writeFile(path.join(targetDir, '.aiox-core', 'install-manifest.yaml'), bigContent);

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
      });

      const report = await validator.validate();

      expect(report.status).toBe('failed');
      const manifestIssue = report.issues.find((i) => i.type === IssueType.INVALID_MANIFEST);
      expect(manifestIssue).toBeDefined();
      expect(manifestIssue.message).toContain('exceeds maximum size');
    });
  });

  describe('Issue Model (H4)', () => {
    test('should store relativePath in issue objects', async () => {
      await fs.writeFile(
        path.join(targetDir, '.aiox-core', 'install-manifest.yaml'),
        'version: "1.0.0"\nfiles:\n  - path: missing.txt\n    size: 10',
      );

      const validator = new PostInstallValidator(targetDir, null, {
        requireSignature: false,
        verifyHashes: false,
      });

      const report = await validator.validate();

      const missingIssue = report.issues.find((i) => i.type === IssueType.MISSING_FILE);
      expect(missingIssue).toBeDefined();
      expect(missingIssue.relativePath).toBe('missing.txt');
    });
  });
});

describe('Manifest Signature Module', () => {
  const {
    parseMinisignSignature,
    verifyManifestSignature,
  } = require('../../packages/installer/src/installer/manifest-signature');

  test('should parse valid minisign signature format', () => {
    // Minisign signature blob must be at least 74 bytes:
    // 2 bytes algorithm + 8 bytes key ID + 64 bytes Ed25519 signature = 74 bytes
    // Base64 of 74 bytes = ceil(74/3)*4 = 100 characters
    const sigBlob = Buffer.alloc(74);
    sigBlob.write('Ed', 0, 2, 'ascii'); // Algorithm: 'Ed' for pure Ed25519
    sigBlob.fill(0x41, 2, 10); // Key ID: 8 bytes of 'A'
    sigBlob.fill(0x42, 10, 74); // Signature: 64 bytes of 'B'
    const sigBase64 = sigBlob.toString('base64');

    const validSig = `untrusted comment: signature from minisign
${sigBase64}
trusted comment: timestamp:1234567890
QRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/==`;

    expect(() => parseMinisignSignature(validSig)).not.toThrow();
  });

  test('should reject signature without untrusted comment', () => {
    const invalidSig = `not a valid comment
RWQBla1234567890`;

    expect(() => parseMinisignSignature(invalidSig)).toThrow('missing untrusted comment');
  });

  test('should reject signature with insufficient lines', () => {
    const invalidSig = 'untrusted comment: only one line';

    expect(() => parseMinisignSignature(invalidSig)).toThrow('insufficient lines');
  });

  test('should reject signature that is too short', () => {
    const invalidSig = `untrusted comment: test
short`;

    expect(() => parseMinisignSignature(invalidSig)).toThrow('signature too short');
  });
});

describe('Manifest Signature DoS Protection', () => {
  const {
    loadAndVerifyManifest,
    SignatureLimits,
  } = require('../../packages/installer/src/installer/manifest-signature');

  let testDir;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `sig-dos-test-${Date.now()}-${Math.random().toString(36)}`);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  test('should reject oversized manifest file before reading (DOS-1)', async () => {
    const manifestPath = path.join(testDir, 'install-manifest.yaml');

    // Create oversized manifest file
    const bigContent = 'x'.repeat(SignatureLimits.MAX_MANIFEST_SIZE + 1000);
    await fs.writeFile(manifestPath, bigContent);

    const result = loadAndVerifyManifest(manifestPath, { requireSignature: false });

    expect(result.error).toContain('exceeds maximum size');
    expect(result.content).toBeNull();
  });

  test('should reject oversized signature file before reading (DOS-2)', async () => {
    const manifestPath = path.join(testDir, 'install-manifest.yaml');
    const sigPath = manifestPath + '.minisig';

    // Create valid-sized manifest
    await fs.writeFile(manifestPath, 'version: "1.0.0"\nfiles: []');

    // Create oversized signature file
    const bigSig = 'x'.repeat(SignatureLimits.MAX_SIGNATURE_SIZE + 1000);
    await fs.writeFile(sigPath, bigSig);

    const result = loadAndVerifyManifest(manifestPath, { requireSignature: true });

    expect(result.error).toContain('Signature file exceeds maximum size');
    expect(result.content).toBeNull();
  });

  test('should allow valid-sized manifest file', async () => {
    const manifestPath = path.join(testDir, 'install-manifest.yaml');

    // Create normal manifest
    await fs.writeFile(manifestPath, 'version: "1.0.0"\nfiles: []');

    const result = loadAndVerifyManifest(manifestPath, { requireSignature: false });

    // Should succeed (no signature required)
    expect(result.error).toBeNull();
    expect(result.content).not.toBeNull();
  });
});
