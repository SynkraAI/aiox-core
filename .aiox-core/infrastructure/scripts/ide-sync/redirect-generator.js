/**
 * Redirect Generator - Creates redirect files for deprecated agents
 * @story 6.19 - IDE Command Auto-Sync System
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Default redirects configuration
 * Maps deprecated agent IDs to their new target IDs
 */
const DEFAULT_REDIRECTS = {
  'aiox-developer': 'aiox-master',
  'aiox-orchestrator': 'aiox-master',
  'db-sage': 'data-engineer',
  'github-devops': 'devops',
};

/**
 * Generate redirect content for a specific IDE format
 * @param {string} oldId - Deprecated agent ID
 * @param {string} newId - New target agent ID
 * @param {string} format - IDE format
 * @returns {string} - Redirect file content
 */
function generateRedirectContent(oldId, newId, format) {
  const baseContent = {
    header: `# Agent Redirect: ${oldId} → ${newId}`,
    notice: `**DEPRECATED:** This agent has been renamed/merged.`,
    instruction: `Use \`@${newId}\` instead.`,
  };

  switch (format) {
    case 'full-markdown-yaml':
      // Claude Code format
      return `${baseContent.header}

${baseContent.notice}

${baseContent.instruction}

---

## Redirect Details

| Property | Value |
|----------|-------|
| Old ID | @${oldId} |
| New ID | @${newId} |
| Status | Deprecated |

---
*AIOX Redirect - Synced automatically*
`;

    case 'xml-tagged-markdown':
      // Generic markdown format
      return `${baseContent.header}

<redirect>
Old: @${oldId}
New: @${newId}
Status: Deprecated
</redirect>

<notice>
${baseContent.notice}
${baseContent.instruction}
</notice>

---
*AIOX Redirect - Synced automatically*
`;

    case 'condensed-rules':
    case 'cursor-style':
    default:
      // Cursor/Antigravity format
      return `${baseContent.header}

> ${baseContent.notice} ${baseContent.instruction}

---
*AIOX Redirect - Synced automatically*
`;
  }
}

/**
 * Generate redirect file for a deprecated agent
 * @param {string} oldId - Deprecated agent ID
 * @param {string} newId - New target agent ID
 * @param {string} targetDir - Target directory for the redirect file
 * @param {string} format - IDE format
 * @returns {object} - Result with path and content
 */
function generateRedirect(oldId, newId, targetDir, format) {
  const filename = `${oldId}.md`;
  const filePath = path.join(targetDir, filename);
  const content = generateRedirectContent(oldId, newId, format);

  return {
    oldId,
    newId,
    filename,
    path: filePath,
    content,
  };
}

/**
 * Generate all redirects for a specific IDE
 * @param {object} redirectsConfig - Redirects configuration (oldId -> newId)
 * @param {string} targetDir - Target directory
 * @param {string} format - IDE format
 * @returns {object[]} - Array of redirect objects
 */
function generateAllRedirects(redirectsConfig, targetDir, format) {
  const redirects = redirectsConfig || DEFAULT_REDIRECTS;
  const results = [];

  for (const [oldId, newId] of Object.entries(redirects)) {
    const redirect = generateRedirect(oldId, newId, targetDir, format);
    results.push(redirect);
  }

  return results;
}

/**
 * Write redirect files to disk
 * @param {object[]} redirects - Array of redirect objects
 * @param {boolean} dryRun - If true, don't write files
 * @returns {object} - Result summary
 */
function writeRedirects(redirects, dryRun = false) {
  const results = {
    written: [],
    errors: [],
  };

  for (const redirect of redirects) {
    try {
      if (!dryRun) {
        fs.ensureDirSync(path.dirname(redirect.path));
        fs.writeFileSync(redirect.path, redirect.content, 'utf8');
      }
      results.written.push(redirect.path);
    } catch (error) {
      results.errors.push({
        path: redirect.path,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Get list of redirect filenames
 * @param {object} redirectsConfig - Redirects configuration
 * @returns {string[]} - Array of filenames
 */
function getRedirectFilenames(redirectsConfig) {
  const redirects = redirectsConfig || DEFAULT_REDIRECTS;
  return Object.keys(redirects).map(id => `${id}.md`);
}

module.exports = {
  DEFAULT_REDIRECTS,
  generateRedirectContent,
  generateRedirect,
  generateAllRedirects,
  writeRedirects,
  getRedirectFilenames,
};
