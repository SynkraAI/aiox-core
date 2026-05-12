/**
 * Manifest Collector — Validates manifest integrity vs. domain files.
 *
 * Checks:
 * - Every domain in manifest has a corresponding file
 * - Every domain file in .synapse/ has a manifest entry
 *
 * @module core/synapse/diagnostics/collectors/manifest-collector
 * @version 1.0.0
 * @created Story SYN-13
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseManifest } = require('../../domain/domain-loader');

/**
 * Collect manifest integrity data.
 *
 * @param {string} projectRoot - Absolute path to project root
 * @returns {{ entries: Array<{ domain: string, inManifest: string, fileExists: boolean, status: string }>, orphanedFiles: string[] }}
 */
function collectManifestIntegrity(projectRoot) {
  const synapsePath = path.join(projectRoot, '.synapse');
  const manifestPath = path.join(synapsePath, 'manifest');
  const entries = [];
  const orphanedFiles = [];

  // Parse manifest
  const manifest = parseManifest(manifestPath);

  // Check each domain in manifest has a file
  for (const [_domainName, domainConfig] of Object.entries(manifest.domains)) {
    const fileName = domainConfig.file;
    const domainFilePath = path.join(synapsePath, fileName);
    const fileExists = fs.existsSync(domainFilePath);

    const stateInfo = domainConfig.state || 'unknown';
    const triggers = [];
    if (domainConfig.agentTrigger) triggers.push(`trigger=${domainConfig.agentTrigger}`);
    if (domainConfig.workflowTrigger) triggers.push(`trigger=${domainConfig.workflowTrigger}`);
    if (domainConfig.alwaysOn) triggers.push('ALWAYS_ON');

    entries.push({
      domain: fileName,
      inManifest: `${stateInfo}${triggers.length ? ', ' + triggers.join(', ') : ''}`,
      fileExists,
      status: fileExists ? 'PASS' : 'FAIL',
    });
  }

  // Check for orphaned domain files (files not in manifest)
  const manifestFileNames = new Set(
    Object.values(manifest.domains).map((d) => d.file),
  );

  try {
    const allFiles = fs.readdirSync(synapsePath);
    const domainFiles = allFiles.filter((f) => {
      // Skip known non-domain files
      if (f === 'manifest' || f === '.gitignore' || f.startsWith('.')) return false;
      // Skip directories
      const stat = fs.statSync(path.join(synapsePath, f));
      if (stat.isDirectory()) return false;
      return true;
    });

    for (const file of domainFiles) {
      if (!manifestFileNames.has(file)) {
        orphanedFiles.push(file);
      }
    }
  } catch (_) {
    // .synapse/ not readable
  }

  return { entries, orphanedFiles };
}

module.exports = { collectManifestIntegrity };
