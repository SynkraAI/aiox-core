/**
 * @module source-manager
 * @description CRUD operations for managing sources in sources.yaml.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCES_FILE = path.resolve(__dirname, '../config/sources.yaml');

/** Valid source types */
export const SOURCE_TYPES = ['rss', 'github', 'youtube', 'podcast', 'web', 'twitter', 'newsletter'];

export class SourceManager {
  /**
   * @param {Object} [options={}]
   * @param {string} [options.sourcesFile] - Override sources file path
   */
  constructor(options = {}) {
    this.sourcesFile = options.sourcesFile || SOURCES_FILE;
  }

  /**
   * List all sources, optionally filtered.
   * @param {Object} [filters={}]
   * @param {string} [filters.type] - Filter by source type
   * @param {string} [filters.domain] - Filter by domain
   * @returns {Array<{ type: string, name: string, url: string, domains: string[], authority: number }>}
   */
  list(filters = {}) {
    const config = this._load();
    const sources = config.sources || {};
    const results = [];

    for (const type of SOURCE_TYPES) {
      if (filters.type && filters.type !== type) continue;

      const typeSources = sources[type] || [];
      for (const source of typeSources) {
        if (filters.domain && !(source.domains || []).includes(filters.domain)) continue;
        results.push({
          type,
          name: source.name,
          url: source.url || source.repo || source.username || '',
          domains: source.domains || [],
          authority: source.authority || 3,
          enabled: source.enabled !== false,
        });
      }
    }

    return results;
  }

  /**
   * Add a new source.
   * @param {string} type - Source type (rss, github, etc.)
   * @param {Object} sourceConfig - Source configuration
   * @param {string} sourceConfig.name - Source name
   * @param {string} sourceConfig.url - Source URL
   * @param {string[]} [sourceConfig.domains=[]] - Content domains
   * @param {number} [sourceConfig.authority=3] - Authority score (1-5)
   * @returns {{ success: boolean, message: string }}
   */
  add(type, sourceConfig) {
    if (!SOURCE_TYPES.includes(type)) {
      return { success: false, message: `Invalid source type: ${type}. Use: ${SOURCE_TYPES.join(', ')}` };
    }

    if (!sourceConfig.name || !sourceConfig.url) {
      return { success: false, message: 'Source must have a name and url' };
    }

    const config = this._load();
    if (!config.sources) config.sources = {};
    if (!config.sources[type]) config.sources[type] = [];

    // Check for duplicates
    const existing = config.sources[type].find(
      (s) => s.name.toLowerCase() === sourceConfig.name.toLowerCase()
    );
    if (existing) {
      return { success: false, message: `Source "${sourceConfig.name}" already exists in ${type}` };
    }

    const newSource = {
      name: sourceConfig.name,
      url: sourceConfig.url,
      domains: sourceConfig.domains || [],
      authority: sourceConfig.authority || 3,
    };

    // Add type-specific fields
    if (type === 'rss') {
      newSource.frequency = sourceConfig.frequency || '6h';
    } else if (type === 'github') {
      newSource.type = sourceConfig.githubType || 'releases';
      newSource.repo = sourceConfig.url;
      delete newSource.url;
    } else if (type === 'youtube') {
      newSource.max_videos = sourceConfig.max_videos || 5;
    } else if (type === 'podcast') {
      newSource.max_episodes = sourceConfig.max_episodes || 3;
    } else if (type === 'twitter') {
      newSource.username = sourceConfig.url;
      newSource.max_tweets = sourceConfig.max_tweets || 10;
      delete newSource.url;
    }

    config.sources[type].push(newSource);
    this._save(config);

    return { success: true, message: `Added "${sourceConfig.name}" to ${type} sources` };
  }

  /**
   * Remove a source by name.
   * @param {string} name - Source name to remove
   * @returns {{ success: boolean, message: string }}
   */
  remove(name) {
    const config = this._load();
    const sources = config.sources || {};
    let found = false;

    for (const type of SOURCE_TYPES) {
      if (!sources[type]) continue;
      const index = sources[type].findIndex(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );
      if (index >= 0) {
        sources[type].splice(index, 1);
        found = true;
        this._save(config);
        return { success: true, message: `Removed "${name}" from ${type} sources` };
      }
    }

    return { success: false, message: `Source "${name}" not found` };
  }

  /**
   * Get source count by type.
   * @returns {Object<string, number>}
   */
  countByType() {
    const config = this._load();
    const sources = config.sources || {};
    const counts = {};

    for (const type of SOURCE_TYPES) {
      counts[type] = (sources[type] || []).length;
    }

    return counts;
  }

  /**
   * Get total source count.
   * @returns {number}
   */
  totalCount() {
    const counts = this.countByType();
    return Object.values(counts).reduce((sum, c) => sum + c, 0);
  }

  /** @private */
  _load() {
    try {
      const raw = fs.readFileSync(this.sourcesFile, 'utf-8');
      return yaml.load(raw) || { sources: {} };
    } catch {
      return { sources: {} };
    }
  }

  /** @private */
  _save(config) {
    const dir = path.dirname(this.sourcesFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.sourcesFile, yaml.dump(config, {
      lineWidth: 120,
      noRefs: true,
      quotingType: '"',
    }), 'utf-8');
  }
}
