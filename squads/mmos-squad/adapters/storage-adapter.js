/**
 * Storage Adapter - MMOS Squad
 *
 * Thin wrapper that delegates to Google Drive service for cloud storage operations.
 * Uses: google-drive
 *
 * @module mmos-squad/adapters/storage-adapter
 * @version 1.0.0
 * @story STORY-10.3
 */

// Infrastructure service path
const SERVICES_PATH = '../../../.aios-core/infrastructure/services';

/**
 * StorageAdapter - Unified interface for cloud storage operations
 *
 * Supported operations:
 * - File listing and search
 * - File download/upload
 * - Spreadsheet operations (read/write)
 * - Folder management
 */
class StorageAdapter {
  /**
   * @param {Object} options - Configuration options
   * @param {string} [options.rootFolderId] - Default root folder ID
   * @param {boolean} [options.silent=false] - Suppress logs
   */
  constructor(options = {}) {
    this.options = {
      rootFolderId: options.rootFolderId ?? process.env.GOOGLE_DRIVE_ROOT_FOLDER,
      silent: options.silent ?? false,
    };

    // Lazy-load service
    this._driveService = null;
  }

  /**
   * Get GoogleDriveService instance (lazy initialization)
   * @private
   */
  get driveService() {
    if (!this._driveService) {
      const { GoogleDriveService } = require(`${SERVICES_PATH}/google-drive`);
      this._driveService = new GoogleDriveService(this.options);
    }
    return this._driveService;
  }

  // ============================================
  // File Operations
  // ============================================

  /**
   * List files in a folder
   *
   * @param {string} [folderId] - Folder ID (uses root if not provided)
   * @param {Object} [options] - List options
   * @param {string} [options.query] - Search query
   * @param {number} [options.pageSize=100] - Results per page
   * @param {string} [options.pageToken] - Pagination token
   * @returns {Promise<Object>} File list with pagination info
   */
  async listFiles(folderId, options = {}) {
    const targetFolderId = folderId ?? this.options.rootFolderId;
    return this.driveService.listFiles(targetFolderId, options);
  }

  /**
   * Search for files by query
   *
   * @param {string} query - Search query (Google Drive query format)
   * @param {Object} [options] - Search options
   * @returns {Promise<Array<Object>>} Matching files
   */
  async searchFiles(query, options = {}) {
    return this.driveService.searchFiles(query, options);
  }

  /**
   * Download a file
   *
   * @param {string} fileId - File ID to download
   * @param {string} [destPath] - Local destination path
   * @returns {Promise<Buffer|string>} File content or path
   */
  async downloadFile(fileId, destPath) {
    return this.driveService.downloadFile(fileId, destPath);
  }

  /**
   * Upload a file
   *
   * @param {string} filePath - Local file path
   * @param {Object} [options] - Upload options
   * @param {string} [options.name] - File name (defaults to local name)
   * @param {string} [options.folderId] - Destination folder ID
   * @param {string} [options.mimeType] - File MIME type
   * @returns {Promise<Object>} Uploaded file metadata
   */
  async uploadFile(filePath, options = {}) {
    const folderId = options.folderId ?? this.options.rootFolderId;
    return this.driveService.uploadFile(filePath, { ...options, folderId });
  }

  /**
   * Delete a file
   *
   * @param {string} fileId - File ID to delete
   * @returns {Promise<void>}
   */
  async deleteFile(fileId) {
    return this.driveService.deleteFile(fileId);
  }

  /**
   * Get file metadata
   *
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(fileId) {
    return this.driveService.getFileMetadata(fileId);
  }

  // ============================================
  // Spreadsheet Operations
  // ============================================

  /**
   * Read spreadsheet data
   *
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} [range] - Cell range (e.g., 'Sheet1!A1:D10')
   * @param {Object} [options] - Read options
   * @returns {Promise<Array<Array<*>>>} Spreadsheet data
   */
  async readSpreadsheet(spreadsheetId, range, options = {}) {
    return this.driveService.readSpreadsheet(spreadsheetId, range, options);
  }

  /**
   * Write data to spreadsheet
   *
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} range - Cell range
   * @param {Array<Array<*>>} values - Data to write
   * @param {Object} [options] - Write options
   * @returns {Promise<Object>} Write result
   */
  async writeSpreadsheet(spreadsheetId, range, values, options = {}) {
    return this.driveService.writeSpreadsheet(spreadsheetId, range, values, options);
  }

  /**
   * Append data to spreadsheet
   *
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} range - Target range
   * @param {Array<Array<*>>} values - Data to append
   * @returns {Promise<Object>} Append result
   */
  async appendSpreadsheet(spreadsheetId, range, values) {
    return this.driveService.appendSpreadsheet(spreadsheetId, range, values);
  }

  /**
   * Create a new spreadsheet
   *
   * @param {string} title - Spreadsheet title
   * @param {Object} [options] - Creation options
   * @param {string} [options.folderId] - Parent folder ID
   * @returns {Promise<Object>} Created spreadsheet metadata
   */
  async createSpreadsheet(title, options = {}) {
    return this.driveService.createSpreadsheet(title, options);
  }

  // ============================================
  // Folder Operations
  // ============================================

  /**
   * Create a folder
   *
   * @param {string} name - Folder name
   * @param {string} [parentId] - Parent folder ID
   * @returns {Promise<Object>} Created folder metadata
   */
  async createFolder(name, parentId) {
    const parent = parentId ?? this.options.rootFolderId;
    return this.driveService.createFolder(name, parent);
  }

  /**
   * Move a file to a folder
   *
   * @param {string} fileId - File ID to move
   * @param {string} newParentId - New parent folder ID
   * @returns {Promise<Object>} Updated file metadata
   */
  async moveFile(fileId, newParentId) {
    return this.driveService.moveFile(fileId, newParentId);
  }

  // ============================================
  // MMOS-Specific Operations
  // ============================================

  /**
   * Create MMOS project folder structure
   *
   * @param {string} projectName - Project name
   * @param {string} [parentId] - Parent folder ID
   * @returns {Promise<Object>} Created folder structure
   */
  async createMMOSProjectStructure(projectName, parentId) {
    const parent = parentId ?? this.options.rootFolderId;

    // Create main project folder
    const projectFolder = await this.createFolder(projectName, parent);

    // Create subfolders
    const subfolders = ['sources', 'processed', 'outputs', 'exports'];
    const createdFolders = { root: projectFolder };

    for (const subfolder of subfolders) {
      createdFolders[subfolder] = await this.createFolder(subfolder, projectFolder.id);
    }

    return createdFolders;
  }

  /**
   * Store processed content for a mind project
   *
   * @param {string} projectFolderId - Project folder ID
   * @param {string} filename - File name
   * @param {string|Buffer} content - Content to store
   * @param {Object} [options] - Storage options
   * @returns {Promise<Object>} Stored file metadata
   */
  async storeProcessedContent(projectFolderId, filename, content, options = {}) {
    const processedFolderId = options.processedFolderId ?? projectFolderId;

    // Create temporary file and upload
    const tempPath = require('path').join(
      require('os').tmpdir(),
      `mmos-${Date.now()}-${filename}`,
    );

    require('fs').writeFileSync(tempPath, content);

    try {
      const result = await this.uploadFile(tempPath, {
        name: filename,
        folderId: processedFolderId,
      });
      return result;
    } finally {
      // Clean up temp file
      try {
        require('fs').unlinkSync(tempPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Export mind mapping results to spreadsheet
   *
   * @param {string} projectName - Project name
   * @param {Object} data - Mind mapping data to export
   * @param {Object} [options] - Export options
   * @returns {Promise<Object>} Created spreadsheet
   */
  async exportMindToSpreadsheet(projectName, data, options = {}) {
    const spreadsheet = await this.createSpreadsheet(
      `${projectName} - Mind Map Export`,
      { folderId: options.folderId },
    );

    // Write summary sheet
    const summaryData = [
      ['Mind Map Export', projectName],
      ['Generated', new Date().toISOString()],
      ['Sources Count', data.sources?.length ?? 0],
      ['Patterns Found', data.patterns?.length ?? 0],
    ];
    await this.writeSpreadsheet(spreadsheet.id, 'Sheet1!A1:B4', summaryData);

    // Write patterns if available
    if (data.patterns?.length > 0) {
      const patternsData = [
        ['Pattern', 'Frequency', 'Source Count', 'Examples'],
        ...data.patterns.map((p) => [
          p.name,
          p.frequency ?? 0,
          p.sourceCount ?? 0,
          p.examples?.join('; ') ?? '',
        ]),
      ];
      await this.writeSpreadsheet(
        spreadsheet.id,
        'Sheet1!A6:D' + (6 + patternsData.length),
        patternsData,
      );
    }

    return spreadsheet;
  }
}

/**
 * Factory function to create StorageAdapter instance
 *
 * @param {Object} [options] - Configuration options
 * @returns {StorageAdapter} Adapter instance
 */
function createStorageAdapter(options = {}) {
  return new StorageAdapter(options);
}

module.exports = {
  StorageAdapter,
  createStorageAdapter,
};
