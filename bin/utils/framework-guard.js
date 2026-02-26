/**
 * Framework Guard — Pre-commit hook that blocks commits to L1/L2 protected paths.
 *
 * Reads ALL configuration from core-config.yaml (single source of truth):
 *   - boundary.frameworkProtection: toggle (true/false)
 *   - boundary.protected: L1/L2 blocked glob patterns
 *   - boundary.exceptions: L3 allowed glob patterns
 *
 * When frameworkProtection is true (default), blocks staged changes to protected paths.
 * When false, acts as a no-op (contributor mode).
 *
 * Story: BM-3 (Epic: Boundary Mapping & Framework-Project Separation)
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Hardcoded fallbacks — used ONLY if core-config.yaml is missing or malformed.
// The canonical source is core-config.yaml boundary.protected/exceptions.
const FALLBACK_PROTECTED = [
  '.aios-core/core/**',
  '.aios-core/development/tasks/**',
  '.aios-core/development/templates/**',
  '.aios-core/development/checklists/**',
  '.aios-core/development/workflows/**',
  '.aios-core/infrastructure/**',
  '.aios-core/constitution.md',
  'bin/aios.js',
  'bin/aios-init.js',
];

const FALLBACK_EXCEPTIONS = [
  '.aios-core/data/**',
  '.aios-core/development/agents/*/MEMORY.md',
];

/**
 * Convert a glob pattern to a RegExp.
 * Supports: ** (any depth), * (single segment), literal dots.
 * @param {string} glob
 * @returns {RegExp}
 */
function globToRegex(glob) {
  let pattern = glob
    .replace(/\./g, '\\.')           // escape dots
    .replace(/\*\*/g, '\u0000')      // placeholder for **
    .replace(/\*/g, '[^/]+')         // * = single segment
    .replace(/\u0000/g, '.+');       // ** = any depth

  // If pattern ends with .+ (was **), match prefix
  if (glob.endsWith('**')) {
    return new RegExp('^' + pattern);
  }
  // Exact file match
  return new RegExp('^' + pattern + '$');
}

/**
 * Read the raw content of core-config.yaml.
 * @returns {string|null}
 */
function readConfigContent() {
  const configPath = path.resolve(__dirname, '../../.aios-core/core-config.yaml');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return fs.readFileSync(configPath, 'utf8');
}

/**
 * Parse a YAML list under a given key using simple line-based parsing.
 * Avoids js-yaml dependency for speed.
 * @param {string} content - YAML file content
 * @param {string} parentKey - Parent key (e.g., 'boundary')
 * @param {string} listKey - List key (e.g., 'protected')
 * @returns {string[]}
 */
function parseYamlList(content, parentKey, listKey) {
  const lines = content.split('\n');
  const items = [];
  let inParent = false;
  let inList = false;
  let parentIndent = -1;
  let listIndent = -1;

  for (const line of lines) {
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;

    // Find parent key (e.g., "boundary:")
    if (trimmed === parentKey + ':' || trimmed.startsWith(parentKey + ':')) {
      inParent = true;
      parentIndent = indent;
      continue;
    }

    // If we're past the parent section (back to same or lower indent)
    if (inParent && indent <= parentIndent && trimmed.length > 0 && !trimmed.startsWith('#')) {
      inParent = false;
      inList = false;
    }

    if (!inParent) continue;

    // Find list key within parent (e.g., "protected:")
    if (trimmed === listKey + ':' || trimmed.startsWith(listKey + ':')) {
      inList = true;
      listIndent = indent;
      continue;
    }

    // If we're past the list (back to same or lower indent within parent)
    if (inList && indent <= listIndent && trimmed.length > 0 && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
      inList = false;
    }

    // Collect list items
    if (inList && trimmed.startsWith('- ')) {
      items.push(trimmed.slice(2).trim());
    }
  }

  return items;
}

/**
 * Read boundary config from core-config.yaml.
 * @returns {{ enabled: boolean, protected: string[], exceptions: string[] }}
 */
function readBoundaryConfig() {
  const content = readConfigContent();
  if (!content) {
    return { enabled: true, protected: FALLBACK_PROTECTED, exceptions: FALLBACK_EXCEPTIONS };
  }

  // Read toggle
  const toggleMatch = content.match(/frameworkProtection:\s*(true|false)/);
  const enabled = toggleMatch ? toggleMatch[1] === 'true' : true;

  // Read lists
  const protectedPaths = parseYamlList(content, 'boundary', 'protected');
  const exceptionPaths = parseYamlList(content, 'boundary', 'exceptions');

  return {
    enabled,
    protected: protectedPaths.length > 0 ? protectedPaths : FALLBACK_PROTECTED,
    exceptions: exceptionPaths.length > 0 ? exceptionPaths : FALLBACK_EXCEPTIONS,
  };
}

/**
 * Check if a file path matches any pattern in the list.
 * @param {string} filePath
 * @param {RegExp[]} patterns
 * @returns {boolean}
 */
function matchesAny(filePath, patterns) {
  return patterns.some((pattern) => pattern.test(filePath));
}

/**
 * Get list of staged files from git.
 * @returns {string[]}
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function main() {
  // Step 1: Read config (single source of truth)
  const config = readBoundaryConfig();

  if (!config.enabled) {
    process.exit(0);
  }

  // Step 2: Compile glob patterns to regex
  const blockedPatterns = config.protected.map(globToRegex);
  const allowedPatterns = config.exceptions.map(globToRegex);

  // Step 3: Get staged files
  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  // Step 4: Check each staged file
  const blockedFiles = [];
  for (const file of stagedFiles) {
    // Normalize to forward slashes (Windows compat)
    const normalized = file.replace(/\\/g, '/');
    if (matchesAny(normalized, blockedPatterns) && !matchesAny(normalized, allowedPatterns)) {
      blockedFiles.push(normalized);
    }
  }

  // Step 5: Report
  if (blockedFiles.length > 0) {
    console.error('');
    console.error('Framework Guard: Commit blocked!');
    console.error('');
    console.error('The following framework files are protected (L1/L2):');
    for (const file of blockedFiles) {
      console.error(`  - ${file}`);
    }
    console.error('');
    console.error('These files are read-only in project mode (boundary.frameworkProtection: true).');
    console.error('');
    console.error('To bypass (framework contributors only):');
    console.error('  git commit --no-verify');
    console.error('');
    console.error('To disable permanently (contributors):');
    console.error('  Set boundary.frameworkProtection: false in core-config.yaml');
    console.error('');
    process.exit(1);
  }

  process.exit(0);
}

// Export for testing
module.exports = { readBoundaryConfig, globToRegex, matchesAny, getStagedFiles, FALLBACK_PROTECTED, FALLBACK_EXCEPTIONS };

// Run when executed directly
if (require.main === module) {
  main();
}
