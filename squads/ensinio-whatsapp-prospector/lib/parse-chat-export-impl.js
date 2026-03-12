/**
 * WhatsApp Chat Export Parser Implementation
 *
 * Uses @ensinio/whatsapp-parser module for parsing logic.
 * This module replaces the inline parsing logic previously in parse-chat-export.md
 */

const { parseWhatsAppExport, validateParsedData } = require('@ensinio/whatsapp-parser');
const path = require('path');
const fs = require('fs-extra');

/**
 * Parse WhatsApp ZIP export using the parser module
 *
 * @param {string} zipPath - Path to ZIP file containing WhatsApp export
 * @returns {Promise<Object>} Parsed data with contacts and metadata
 * @throws {Error} If ZIP is invalid or cannot be parsed
 */
async function parseWhatsAppExportFile(zipPath) {
  try {
    // Validate input
    if (!zipPath || typeof zipPath !== 'string') {
      throw new Error('Invalid zip path provided');
    }

    // Check file exists
    const fileExists = await fs.pathExists(zipPath);
    if (!fileExists) {
      throw new Error(`ZIP file not found: ${zipPath}`);
    }

    // Check file is readable
    const stats = await fs.stat(zipPath);
    if (stats.size === 0) {
      throw new Error('ZIP file is empty (0 bytes)');
    }

    // Use module to parse
    const parsedData = await parseWhatsAppExport(zipPath);

    // Validate parsed data
    const validation = validateParsedData(parsedData);
    if (!validation.isValid) {
      throw new Error(`Invalid parsed data: ${validation.errors.join(', ')}`);
    }

    return parsedData;
  } catch (error) {
    throw new Error(`Parse failed for ${path.basename(zipPath)}: ${error.message}`);
  }
}

/**
 * Parse ZIP with error handling and recovery
 *
 * @param {string} zipPath - Path to ZIP file
 * @param {Object} options - Options for parsing
 * @returns {Promise<Object>} Parsed result with status
 */
async function parseWithRecovery(zipPath, options = {}) {
  const {
    maxRetries = 1,
    verbose = false,
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      if (verbose) {
        console.log(`[Parse] Attempt ${attempt} for ${path.basename(zipPath)}`);
      }

      const result = await parseWhatsAppExportFile(zipPath);

      return {
        success: true,
        data: result,
        attempt,
        error: null,
      };
    } catch (error) {
      lastError = error;

      if (verbose) {
        console.log(`[Parse] Attempt ${attempt} failed: ${error.message}`);
      }

      if (attempt < maxRetries + 1) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  return {
    success: false,
    data: null,
    attempt: maxRetries + 1,
    error: lastError?.message || 'Unknown error',
  };
}

module.exports = {
  parseWhatsAppExportFile,
  parseWithRecovery,
};
