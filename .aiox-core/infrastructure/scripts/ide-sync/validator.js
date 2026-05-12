/**
 * Validator - Verifies IDE sync status
 * @story 6.19 - IDE Command Auto-Sync System
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { getRedirectFilenames } = require('./redirect-generator');

/**
 * Calculate content hash for comparison
 * @param {string} content - File content
 * @returns {string} - SHA256 hash
 */
function hashContent(content) {
  // Normalize line endings for cross-platform consistency
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * Check if a file exists at target path
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Read file content if it exists
 * @param {string} filePath - Path to read
 * @returns {string|null} - File content or null
 */
function readFileIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (error) {
    // Ignore read errors
  }
  return null;
}

/**
 * Validate sync status for a single IDE
 * @param {object[]} expectedFiles - Array of {filename, content} expected
 * @param {string} targetDir - Target directory to check
 * @param {object} redirectsConfig - Redirects configuration
 * @returns {object} - Validation result
 */
function validateIdeSync(expectedFiles, targetDir, redirectsConfig) {
  const result = {
    targetDir,
    missing: [],
    drift: [],
    orphaned: [],
    synced: [],
    total: {
      expected: expectedFiles.length,
      missing: 0,
      drift: 0,
      orphaned: 0,
      synced: 0,
    },
  };

  // Track expected filenames
  const expectedFilenames = new Set(expectedFiles.map(f => f.filename));

  // Add redirect filenames to expected
  const redirectFilenames = getRedirectFilenames(redirectsConfig);
  for (const rf of redirectFilenames) {
    expectedFilenames.add(rf);
  }

  // Check each expected file
  for (const expected of expectedFiles) {
    const targetPath = path.join(targetDir, expected.filename);
    const actualContent = readFileIfExists(targetPath);

    if (actualContent === null) {
      // File is missing
      result.missing.push({
        filename: expected.filename,
        path: targetPath,
      });
      result.total.missing++;
    } else {
      // Compare content
      const expectedHash = hashContent(expected.content);
      const actualHash = hashContent(actualContent);

      if (expectedHash !== actualHash) {
        // Content differs (drift)
        result.drift.push({
          filename: expected.filename,
          path: targetPath,
          expectedHash,
          actualHash,
        });
        result.total.drift++;
      } else {
        // File is synced
        result.synced.push({
          filename: expected.filename,
          path: targetPath,
        });
        result.total.synced++;
      }
    }
  }

  // Check for orphaned files (files in target not in expected)
  if (fs.existsSync(targetDir)) {
    try {
      const actualFiles = fs.readdirSync(targetDir).filter(f => f.endsWith('.md'));

      for (const file of actualFiles) {
        if (!expectedFilenames.has(file)) {
          result.orphaned.push({
            filename: file,
            path: path.join(targetDir, file),
          });
          result.total.orphaned++;
        }
      }
    } catch (error) {
      // Ignore directory read errors
    }
  }

  return result;
}

/**
 * Validate sync status for all IDEs
 * @param {object} ideConfigs - Map of IDE name to {expectedFiles, targetDir}
 * @param {object} redirectsConfig - Redirects configuration
 * @returns {object} - Full validation result
 */
function validateAllIdes(ideConfigs, redirectsConfig) {
  const results = {
    ides: {},
    summary: {
      total: 0,
      synced: 0,
      missing: 0,
      drift: 0,
      orphaned: 0,
      pass: true,
    },
  };

  for (const [ideName, config] of Object.entries(ideConfigs)) {
    const ideResult = validateIdeSync(
      config.expectedFiles,
      config.targetDir,
      redirectsConfig
    );

    results.ides[ideName] = ideResult;

    // Update summary
    results.summary.total += ideResult.total.expected;
    results.summary.synced += ideResult.total.synced;
    results.summary.missing += ideResult.total.missing;
    results.summary.drift += ideResult.total.drift;
    results.summary.orphaned += ideResult.total.orphaned;
  }

  // Pass if no missing or drift
  results.summary.pass =
    results.summary.missing === 0 && results.summary.drift === 0;

  return results;
}

/**
 * Format validation result as report string
 * @param {object} results - Validation results
 * @param {boolean} verbose - Include detailed file lists
 * @returns {string} - Formatted report
 */
function formatValidationReport(results, verbose = false) {
  const lines = [];

  lines.push('# IDE Sync Validation Report');
  lines.push('');

  // Summary
  lines.push('## Summary');
  lines.push('');
  lines.push(`| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total Expected | ${results.summary.total} |`);
  lines.push(`| Synced | ${results.summary.synced} |`);
  lines.push(`| Missing | ${results.summary.missing} |`);
  lines.push(`| Drift | ${results.summary.drift} |`);
  lines.push(`| Orphaned | ${results.summary.orphaned} |`);
  lines.push('');

  const status = results.summary.pass ? '✅ PASS' : '❌ FAIL';
  lines.push(`**Status:** ${status}`);
  lines.push('');

  // Per-IDE details
  if (verbose) {
    lines.push('## IDE Details');
    lines.push('');

    for (const [ideName, ideResult] of Object.entries(results.ides)) {
      lines.push(`### ${ideName}`);
      lines.push('');
      lines.push(`- Target: \`${ideResult.targetDir}\``);
      lines.push(`- Synced: ${ideResult.total.synced}`);
      lines.push(`- Missing: ${ideResult.total.missing}`);
      lines.push(`- Drift: ${ideResult.total.drift}`);
      lines.push(`- Orphaned: ${ideResult.total.orphaned}`);
      lines.push('');

      if (ideResult.missing.length > 0) {
        lines.push('**Missing Files:**');
        for (const f of ideResult.missing) {
          lines.push(`- ${f.filename}`);
        }
        lines.push('');
      }

      if (ideResult.drift.length > 0) {
        lines.push('**Drifted Files:**');
        for (const f of ideResult.drift) {
          lines.push(`- ${f.filename}`);
        }
        lines.push('');
      }

      if (ideResult.orphaned.length > 0) {
        lines.push('**Orphaned Files:**');
        for (const f of ideResult.orphaned) {
          lines.push(`- ${f.filename}`);
        }
        lines.push('');
      }
    }
  }

  // Fix instructions
  if (!results.summary.pass) {
    lines.push('## How to Fix');
    lines.push('');
    lines.push('Run the following command to sync IDE files:');
    lines.push('');
    lines.push('```bash');
    lines.push('npm run sync:ide');
    lines.push('```');
    lines.push('');
    lines.push('Then commit the generated files.');
  }

  return lines.join('\n');
}

module.exports = {
  hashContent,
  fileExists,
  readFileIfExists,
  validateIdeSync,
  validateAllIdes,
  formatValidationReport,
};
