/**
 * Shared utility — safely reads and parses a JSON file.
 *
 * Extracted from multiple collectors to eliminate duplication.
 *
 * @module core/synapse/diagnostics/collectors/safe-read-json
 * @version 1.0.0
 * @created Story SYN-14 (QA refactor)
 */

'use strict';

const fs = require('fs');

/**
 * Safely read and parse a JSON file.
 * Returns null on any error (file not found, invalid JSON, permissions, etc.)
 *
 * @param {string} filePath - Absolute path to JSON file
 * @returns {Object|null} Parsed data or null
 */
function safeReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

module.exports = { safeReadJson };
