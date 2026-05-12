'use strict';

const asciichart = require('asciichart');

const SPARKLINE_CHARS = ['\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587'];
const MAX_LATENCY_POINTS = 10;

/**
 * Render entity statistics and cache metrics as formatted ASCII text.
 * @param {Object} registryData - From RegistrySource.getData()
 * @param {Object} metricsData - From MetricsSource.getData()
 * @param {Object} [options]
 * @param {boolean} [options.isTTY=true] - Whether output is to a TTY
 * @returns {string} Formatted multiline string
 */
function renderStats(registryData, metricsData, options = {}) {
  const isTTY = options.isTTY !== false;
  const lines = [];

  lines.push(..._renderEntityTable(registryData, isTTY));
  lines.push('');
  lines.push(..._renderCachePerformance(metricsData, isTTY));
  lines.push('');
  lines.push(..._renderLatencyChart(metricsData, isTTY));

  if (registryData.lastUpdated) {
    lines.push('');
    lines.push(`Last updated: ${_timeAgo(registryData.lastUpdated)}`);
  }

  return lines.join('\n');
}

/**
 * Render entity statistics table.
 * @param {Object} data - Registry stats
 * @param {boolean} isTTY
 * @returns {string[]}
 * @private
 */
function _renderEntityTable(data, isTTY) {
  const lines = [];
  const categories = data.categories || {};
  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1].count - a[1].count);

  if (isTTY) {
    lines.push('Entity Statistics');
    lines.push('\u2500'.repeat(37));
    lines.push(` ${'Category'.padEnd(13)}\u2502 ${'Count'.padStart(5)} \u2502 ${'%'.padStart(6)}`);
    lines.push(`${'\u2500'.repeat(14)}\u253C${'\u2500'.repeat(7)}\u253C${'\u2500'.repeat(8)}`);

    for (const [name, stats] of sortedCategories) {
      const pctStr = `${stats.pct.toFixed(1)}%`;
      lines.push(` ${name.padEnd(13)}\u2502 ${String(stats.count).padStart(5)} \u2502 ${pctStr.padStart(6)}`);
    }

    lines.push(`${'\u2500'.repeat(14)}\u253C${'\u2500'.repeat(7)}\u253C${'\u2500'.repeat(8)}`);
    lines.push(` ${'TOTAL'.padEnd(13)}\u2502 ${String(data.totalEntities).padStart(5)} \u2502 ${'100%'.padStart(6)}`);
  } else {
    lines.push('Entity Statistics');
    lines.push('-'.repeat(37));
    lines.push(` ${'Category'.padEnd(13)}| ${'Count'.padStart(5)} | ${'%'.padStart(6)}`);
    lines.push(`${'-'.repeat(14)}+${'-'.repeat(7)}+${'-'.repeat(8)}`);

    for (const [name, stats] of sortedCategories) {
      const pctStr = `${stats.pct.toFixed(1)}%`;
      lines.push(` ${name.padEnd(13)}| ${String(stats.count).padStart(5)} | ${pctStr.padStart(6)}`);
    }

    lines.push(`${'-'.repeat(14)}+${'-'.repeat(7)}+${'-'.repeat(8)}`);
    lines.push(` ${'TOTAL'.padEnd(13)}| ${String(data.totalEntities).padStart(5)} | ${'100%'.padStart(6)}`);
  }

  return lines;
}

/**
 * Render cache performance with sparkline.
 * @param {Object} data - Metrics data
 * @param {boolean} isTTY
 * @returns {string[]}
 * @private
 */
function _renderCachePerformance(data, isTTY) {
  const lines = [];

  lines.push('Cache Performance');

  if (!data.providerAvailable) {
    lines.push(' [OFFLINE] No metrics available');
    return lines;
  }

  const hitPct = (data.cacheHitRate * 100).toFixed(1);
  const missPct = (100 - data.cacheHitRate * 100).toFixed(1);

  if (isTTY) {
    const hitSparkline = _generateSparkline(data.latencyLog, true);
    const missSparkline = _generateSparkline(data.latencyLog, false);
    lines.push(` Hit Rate: ${hitPct.padStart(5)}% ${hitSparkline}`);
    lines.push(` Misses:  ${missPct.padStart(5)}% ${missSparkline}`);
  } else {
    lines.push(` Hit Rate: ${hitPct}%`);
    lines.push(` Misses:  ${missPct}%`);
  }

  return lines;
}

/**
 * Generate sparkline string from latency log entries.
 * @param {Array} latencyLog - Array of { isCacheHit, durationMs }
 * @param {boolean} forHits - true = sparkline for hits, false = for misses
 * @returns {string}
 * @private
 */
function _generateSparkline(latencyLog, forHits) {
  if (!latencyLog || latencyLog.length === 0) {
    return '';
  }

  const recent = latencyLog.slice(-MAX_LATENCY_POINTS);
  const values = recent.map((entry) => {
    if (forHits) {
      return entry.isCacheHit ? entry.durationMs || 1 : 0;
    }
    return entry.isCacheHit ? 0 : entry.durationMs || 1;
  });

  const max = Math.max(...values, 1);

  return values
    .map((v) => {
      const idx = Math.round((v / max) * (SPARKLINE_CHARS.length - 1));
      return SPARKLINE_CHARS[Math.min(idx, SPARKLINE_CHARS.length - 1)];
    })
    .join('');
}

/**
 * Render latency chart using asciichart.
 * @param {Object} data - Metrics data
 * @param {boolean} isTTY
 * @returns {string[]}
 * @private
 */
function _renderLatencyChart(data, _isTTY) {
  const lines = [];
  const latencyLog = data.latencyLog || [];

  if (!data.providerAvailable) {
    lines.push('Latency');
    lines.push(' [OFFLINE] No latency data');
    return lines;
  }

  if (latencyLog.length === 0) {
    lines.push('Latency');
    lines.push(' No operations recorded');
    return lines;
  }

  const recent = latencyLog.slice(-MAX_LATENCY_POINTS);
  const durations = recent.map((entry) => entry.durationMs || 0);

  lines.push(`Latency (last ${recent.length} operations)`);

  const chart = asciichart.plot(durations, { height: 4, padding: '  ' });
  lines.push(chart);

  return lines;
}

/**
 * Calculate relative time string from ISO date.
 * @param {string} isoDate - ISO date string
 * @returns {string} Relative time (e.g., "5 minutes ago")
 * @private
 */
function _timeAgo(isoDate) {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;

  if (isNaN(diffMs) || diffMs < 0) {
    return 'unknown';
  }

  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

module.exports = {
  renderStats,
  _renderEntityTable,
  _renderCachePerformance,
  _renderLatencyChart,
  _generateSparkline,
  _timeAgo,
};
