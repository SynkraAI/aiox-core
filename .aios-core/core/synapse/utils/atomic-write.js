/**
 * Atomic Write Utility
 *
 * Writes files atomically using write-to-tmp + rename pattern.
 * Prevents file corruption on unexpected exit (crash, kill, power loss).
 *
 * Pattern:
 *   1. Write data to {filePath}.tmp.{pid}
 *   2. On Windows: unlink target if exists (rename won't overwrite)
 *   3. Rename tmp → target (atomic on POSIX, near-atomic on Windows)
 *   4. On failure: clean up tmp file
 *
 * @module core/synapse/utils/atomic-write
 * @version 1.0.0
 * @created Story NOG-12 - State Persistence Hardening
 */

'use strict';

const fs = require('fs');
const path = require('path');

const IS_WINDOWS = process.platform === 'win32';

/**
 * Write data to a file atomically.
 *
 * Writes to a temporary file first, then renames to the target path.
 * If the process crashes between write and rename, the original file
 * remains intact and the orphaned .tmp file is harmless.
 *
 * @param {string} filePath - Target file path
 * @param {string} data - Data to write
 * @param {string} [encoding='utf8'] - File encoding
 * @throws {Error} If write or rename fails (original file preserved)
 */
function atomicWriteSync(filePath, data, encoding = 'utf8') {
  const tmpPath = `${filePath}.tmp.${process.pid}`;

  try {
    // Ensure parent directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Step 1: Write to temporary file
    fs.writeFileSync(tmpPath, data, encoding);

    // Step 2: On Windows, unlink target first (rename won't overwrite)
    if (IS_WINDOWS) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
        // ENOENT = target doesn't exist yet, that's fine
      }
    }

    // Step 3: Atomic rename
    fs.renameSync(tmpPath, filePath);
  } catch (error) {
    // Clean up tmp file on failure
    try {
      fs.unlinkSync(tmpPath);
    } catch (_cleanupErr) {
      // Ignore cleanup errors
    }

    console.error(`[atomic-write] Failed to write ${filePath}: ${error.message}`);
    throw error;
  }
}

module.exports = {
  atomicWriteSync,
};
