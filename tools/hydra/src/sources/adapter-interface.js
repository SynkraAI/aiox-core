/**
 * @module adapter-interface
 * @description Base interface and types for HYDRA source adapters.
 * All source adapters must return content in the RawContent format.
 */

/**
 * @typedef {Object} RawContent
 * @property {'rss'|'web'|'youtube'|'twitter'|'github'|'podcast'|'newsletter'} source - Source type
 * @property {string} sourceId - Unique identifier (URL or source-specific ID)
 * @property {string} title - Content title
 * @property {string} contentRaw - Raw text content (or transcript)
 * @property {string} author - Author name
 * @property {Date} publishedAt - Publication date
 * @property {string} url - Canonical URL
 * @property {string} language - Language code (en, pt, etc.)
 * @property {Record<string, unknown>} metadata - Source-specific metadata
 */

/**
 * Base class for source adapters. All adapters must extend this class.
 * @abstract
 */
export class SourceAdapter {
  /**
   * @param {string} name - Adapter display name
   * @param {string} type - Source type identifier
   */
  constructor(name, type) {
    if (new.target === SourceAdapter) {
      throw new Error('SourceAdapter is abstract and cannot be instantiated directly');
    }
    this.name = name;
    this.type = type;
  }

  /**
   * Fetch content from the source.
   * @param {Object} sourceConfig - Source configuration from sources.yaml
   * @returns {Promise<RawContent[]>} Array of raw content items
   * @abstract
   */
  async fetch(sourceConfig) {
    throw new Error('fetch() must be implemented by subclass');
  }

  /**
   * Validate source configuration.
   * @param {Object} sourceConfig - Source configuration to validate
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validate(sourceConfig) {
    const errors = [];
    if (!sourceConfig.name) errors.push('Missing "name" field');
    if (!sourceConfig.url && !sourceConfig.repo) errors.push('Missing "url" or "repo" field');
    if (!sourceConfig.domains || !Array.isArray(sourceConfig.domains)) {
      errors.push('Missing or invalid "domains" array');
    }
    return { valid: errors.length === 0, errors };
  }

  /**
   * Create a standardized RawContent object.
   * @param {Partial<RawContent>} fields - Content fields
   * @returns {RawContent}
   */
  createRawContent(fields) {
    return {
      source: this.type,
      sourceId: fields.sourceId || fields.url || '',
      title: fields.title || 'Untitled',
      contentRaw: fields.contentRaw || '',
      author: fields.author || 'Unknown',
      publishedAt: fields.publishedAt instanceof Date ? fields.publishedAt : new Date(fields.publishedAt || Date.now()),
      url: fields.url || '',
      language: fields.language || 'en',
      metadata: fields.metadata || {},
    };
  }
}
