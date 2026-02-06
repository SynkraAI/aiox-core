/**
 * Source Adapter - MMOS Squad
 *
 * Thin wrapper that delegates to infrastructure services for source content extraction.
 * Uses: file-service, etl (v2.4.0), tiktok
 *
 * @module mmos-squad/adapters/source-adapter
 * @version 1.0.0
 * @story STORY-10.3
 */

const path = require('path');

// Infrastructure service paths (relative to project root)
const SERVICES_PATH = '../../../.aios-core/infrastructure/services';

/**
 * SourceAdapter - Unified interface for content extraction from multiple sources
 *
 * Supported source types:
 * - Documents (PDF, Word, Excel, CSV) via file-service
 * - YouTube videos via ETL service
 * - Blogs/articles via ETL service
 * - TikTok content via tiktok service
 */
class SourceAdapter {
  /**
   * @param {Object} options - Configuration options
   * @param {boolean} [options.silent=false] - Suppress logs
   * @param {string} [options.traceId] - Trace ID for logging
   */
  constructor(options = {}) {
    this.options = {
      silent: options.silent ?? false,
      traceId: options.traceId ?? `mmos-source-${Date.now()}`,
    };

    // Lazy-load services on first use
    this._fileService = null;
    this._etlService = null;
    this._tiktokService = null;
  }

  /**
   * Get FileService instance (lazy initialization)
   * @private
   */
  get fileService() {
    if (!this._fileService) {
      const { FileService } = require(`${SERVICES_PATH}/file-service`);
      this._fileService = new FileService(this.options);
    }
    return this._fileService;
  }

  /**
   * Get ETLService instance (lazy initialization)
   * @private
   */
  get etlService() {
    if (!this._etlService) {
      const { ETLService } = require(`${SERVICES_PATH}/etl`);
      this._etlService = new ETLService({
        silent: this.options.silent,
        traceId: this.options.traceId,
      });
    }
    return this._etlService;
  }

  /**
   * Get TikTokService instance (lazy initialization)
   * @private
   */
  get tiktokService() {
    if (!this._tiktokService) {
      // TikTok service is TypeScript - needs to be built first
      // For now, we'll use a dynamic import approach
      try {
        const tiktok = require(`${SERVICES_PATH}/tiktok/dist`);
        this._tiktokService = tiktok.createTikTokService();
      } catch (error) {
        // If dist not available, service not built yet
        this._tiktokService = null;
        if (!this.options.silent) {
          console.warn('[SourceAdapter] TikTok service not available (needs build)');
        }
      }
    }
    return this._tiktokService;
  }

  // ============================================
  // Document Processing (via file-service)
  // ============================================

  /**
   * Parse a document file (PDF, Word, Excel, CSV)
   *
   * @param {string} filePath - Path to the document
   * @param {Object} [options] - Parse options
   * @returns {Promise<Object>} Parsed content with metadata
   */
  async parseDocument(filePath, options = {}) {
    const ext = path.extname(filePath).toLowerCase();
    const format = this.detectFormat(filePath);

    switch (format) {
      case 'pdf':
        return this.fileService.parsePDF(filePath, options);
      case 'word':
        return this.fileService.parseWord(filePath, options);
      case 'excel':
        return this.fileService.parseExcel(filePath, options);
      case 'csv':
        return this.fileService.parseCSV(filePath, options);
      default:
        throw new Error(`Unsupported document format: ${ext}`);
    }
  }

  /**
   * Detect document format from file path (extension-based)
   *
   * @param {string} filePath - Path to the file
   * @returns {string} Detected format ('pdf', 'word', 'excel', 'csv', 'text', 'unknown')
   */
  detectFormat(filePath) {
    const ext = filePath.toLowerCase().split('.').pop();
    const formatMap = {
      pdf: 'pdf',
      doc: 'word',
      docx: 'word',
      xls: 'excel',
      xlsx: 'excel',
      csv: 'csv',
      txt: 'text',
      md: 'text',
    };
    return formatMap[ext] || 'unknown';
  }

  // ============================================
  // YouTube Processing (via ETL service)
  // ============================================

  /**
   * Extract content from YouTube video
   *
   * @param {string} videoId - YouTube video ID (11 characters)
   * @param {Object} [options] - Extraction options
   * @param {string} [options.lang='en'] - Language code
   * @param {boolean} [options.includeMetadata=true] - Include video metadata
   * @returns {Promise<Object>} Extracted transcript and metadata
   */
  async extractYouTube(videoId, options = {}) {
    return this.etlService.extractYouTube(videoId, {
      lang: options.lang ?? 'en',
      includeMetadata: options.includeMetadata ?? true,
    });
  }

  /**
   * Filter YouTube transcript by speaker
   *
   * @param {Array} transcript - Transcript segments
   * @param {string} speakerName - Speaker name to filter
   * @returns {Array} Filtered transcript segments
   */
  filterSpeaker(transcript, speakerName) {
    return this.etlService.filterSpeaker(transcript, speakerName);
  }

  // ============================================
  // Blog/Article Processing (via ETL service)
  // ============================================

  /**
   * Collect content from a blog/article URL
   *
   * @param {string} url - Blog/article URL
   * @param {Object} [options] - Collection options
   * @param {number} [options.timeout=30000] - Request timeout in ms
   * @returns {Promise<Object>} Extracted content
   */
  async collectBlog(url, options = {}) {
    return this.etlService.collectBlog(url, {
      timeout: options.timeout ?? 30000,
    });
  }

  // ============================================
  // Content Chunking (via ETL service)
  // ============================================

  /**
   * Chunk content for processing
   *
   * @param {string} content - Content to chunk
   * @param {Object} [options] - Chunking options
   * @param {string} [options.strategy='semantic'] - Chunking strategy
   * @param {number} [options.maxChunkSize=1000] - Max chunk size
   * @param {number} [options.overlap=100] - Overlap between chunks
   * @returns {Array<Object>} Content chunks
   */
  chunkContent(content, options = {}) {
    return this.etlService.chunkContent(content, {
      strategy: options.strategy ?? 'semantic',
      maxChunkSize: options.maxChunkSize ?? 1000,
      overlap: options.overlap ?? 100,
    });
  }

  // ============================================
  // TikTok Processing (via tiktok service)
  // ============================================

  /**
   * Get TikTok user profile
   *
   * @param {string} accessToken - OAuth access token
   * @returns {Promise<Object>} User profile data
   */
  async getTikTokUserInfo(accessToken) {
    if (!this.tiktokService) {
      throw new Error('TikTok service not available');
    }
    return this.tiktokService.creator.getUserInfo(accessToken);
  }

  /**
   * Get TikTok user videos
   *
   * @param {string} accessToken - OAuth access token
   * @param {Object} [options] - Request options
   * @returns {Promise<Object>} User videos list
   */
  async getTikTokUserVideos(accessToken, options = {}) {
    if (!this.tiktokService) {
      throw new Error('TikTok service not available');
    }
    return this.tiktokService.creator.getUserVideos(accessToken, options);
  }

  /**
   * Get TikTok OAuth authorization URL
   *
   * @param {Array<string>} scopes - OAuth scopes
   * @returns {string} Authorization URL
   */
  getTikTokAuthUrl(scopes = ['user.info.basic', 'video.list']) {
    if (!this.tiktokService) {
      throw new Error('TikTok service not available');
    }
    return this.tiktokService.creator.getAuthorizationUrl(scopes);
  }

  // ============================================
  // Batch Operations
  // ============================================

  /**
   * Extract content from multiple sources in batch
   *
   * @param {Array<Object>} sources - Array of source definitions
   * @param {Object} [options] - Batch options
   * @param {number} [options.concurrency=3] - Max concurrent operations
   * @param {boolean} [options.continueOnError=true] - Continue on individual errors
   * @returns {Promise<Array<Object>>} Extraction results
   */
  async batchExtract(sources, options = {}) {
    const concurrency = options.concurrency ?? 3;
    const continueOnError = options.continueOnError ?? true;
    const results = [];

    // Process in batches
    for (let i = 0; i < sources.length; i += concurrency) {
      const batch = sources.slice(i, i + concurrency);
      const batchPromises = batch.map(async (source) => {
        try {
          let result;
          switch (source.type) {
            case 'youtube':
              result = await this.extractYouTube(source.id, source.options);
              break;
            case 'blog':
              result = await this.collectBlog(source.url, source.options);
              break;
            case 'document':
              result = await this.parseDocument(source.path, source.options);
              break;
            default:
              throw new Error(`Unknown source type: ${source.type}`);
          }
          return { source, success: true, result };
        } catch (error) {
          if (!continueOnError) throw error;
          return { source, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }
}

/**
 * Factory function to create SourceAdapter instance
 *
 * @param {Object} [options] - Configuration options
 * @returns {SourceAdapter} Adapter instance
 */
function createSourceAdapter(options = {}) {
  return new SourceAdapter(options);
}

module.exports = {
  SourceAdapter,
  createSourceAdapter,
};
