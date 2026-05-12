'use strict';

const { RegistryLoader } = require('../../ids/registry-loader');

/**
 * Data source that provides entity statistics from entity-registry.yaml.
 * Implements the same interface as CodeIntelSource: getData(), getLastUpdate(), isStale().
 */
class RegistrySource {
  /**
   * @param {Object} [options]
   * @param {number} [options.cacheTTL=5000] - Cache TTL in milliseconds
   */
  constructor(options = {}) {
    this._cache = null;
    this._cacheTimestamp = 0;
    this._cacheTTL = options.cacheTTL || 5000;
  }

  /**
   * Get entity statistics from registry.
   * @returns {Promise<Object>} { totalEntities, categories, lastUpdated, version }
   */
  async getData() {
    if (this._cache && !this.isStale()) {
      return this._cache;
    }

    let result;

    try {
      const loader = new RegistryLoader();
      const registry = loader.load();
      result = this._extractStats(registry);
    } catch (_err) {
      result = this._emptyStats();
    }

    this._cache = result;
    this._cacheTimestamp = Date.now();
    return result;
  }

  /**
   * Get timestamp of last successful data fetch.
   * @returns {number}
   */
  getLastUpdate() {
    return this._cacheTimestamp;
  }

  /**
   * Check if cached data is expired.
   * @returns {boolean}
   */
  isStale() {
    return Date.now() - this._cacheTimestamp > this._cacheTTL;
  }

  /**
   * Extract statistics from loaded registry.
   * @param {Object} registry - Loaded registry data
   * @returns {Object} Statistics object
   * @private
   */
  _extractStats(registry) {
    const metadata = registry.metadata || {};
    const entities = registry.entities || {};
    const totalEntities = metadata.entityCount || 0;
    const categories = {};

    for (const [category, items] of Object.entries(entities)) {
      if (!items || typeof items !== 'object') continue;
      const count = Object.keys(items).length;
      categories[category] = {
        count,
        pct: totalEntities > 0 ? (count / totalEntities) * 100 : 0,
      };
    }

    return {
      totalEntities,
      categories,
      lastUpdated: metadata.lastUpdated || null,
      version: metadata.version || null,
      timestamp: Date.now(),
    };
  }

  /**
   * Return empty stats when registry is unavailable.
   * @returns {Object}
   * @private
   */
  _emptyStats() {
    return {
      totalEntities: 0,
      categories: {},
      lastUpdated: null,
      version: null,
      timestamp: Date.now(),
    };
  }
}

module.exports = { RegistrySource };
