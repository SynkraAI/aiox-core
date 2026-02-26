'use strict';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

const CB_FAILURE_THRESHOLD = 5;

/**
 * Render provider status as formatted multiline string.
 * @param {Object} metricsData - From MetricsSource.getData()
 * @param {Object} [options]
 * @param {boolean} [options.isTTY=true] - Whether output is to a TTY
 * @returns {string} Formatted multiline string
 */
function renderStatus(metricsData, options = {}) {
  const isTTY = options.isTTY !== false;
  const lines = [];

  lines.push(_renderHeader(isTTY));
  lines.push(_renderProviderLine(metricsData, isTTY));
  lines.push(_renderCircuitBreaker(metricsData, isTTY));
  lines.push(_renderFailures(metricsData));
  lines.push(_renderCacheEntries(metricsData));
  lines.push(_renderUptime());

  return lines.join('\n');
}

/**
 * Render status section header.
 * @param {boolean} isTTY
 * @returns {string}
 * @private
 */
function _renderHeader(isTTY) {
  const separator = isTTY ? '\u2500'.repeat(27) : '-'.repeat(27);
  return `Provider Status\n${separator}`;
}

/**
 * Render provider availability line.
 * @param {Object} data - Metrics data
 * @param {boolean} isTTY
 * @returns {string}
 * @private
 */
function _renderProviderLine(data, isTTY) {
  const isActive = !!data.providerAvailable;

  if (isTTY) {
    if (isActive) {
      return ` Code Graph MCP: ${COLORS.green}\u25CF ACTIVE${COLORS.reset}`;
    }
    return ` Code Graph MCP: ${COLORS.red}\u25CB OFFLINE${COLORS.reset}`;
  }

  if (isActive) {
    return ' Code Graph MCP: [ACTIVE]';
  }
  return ' Code Graph MCP: [OFFLINE]';
}

/**
 * Render circuit breaker state line.
 * @param {Object} data - Metrics data
 * @param {boolean} isTTY
 * @returns {string}
 * @private
 */
function _renderCircuitBreaker(data, isTTY) {
  const state = data.circuitBreakerState || 'CLOSED';

  if (isTTY && state === 'HALF-OPEN') {
    return ` Circuit Breaker: ${COLORS.yellow}${state}${COLORS.reset}`;
  }

  return ` Circuit Breaker: ${state}`;
}

/**
 * Render failure count line.
 * @param {Object} data - Metrics data
 * @returns {string}
 * @private
 */
function _renderFailures(data) {
  const failures = data.circuitBreakerFailures || 0;
  return ` Failures: ${failures}/${CB_FAILURE_THRESHOLD}`;
}

/**
 * Render cache entries count line.
 * Uses cacheHits + cacheMisses as proxy for total cache operations.
 * @param {Object} data - Metrics data
 * @returns {string}
 * @private
 */
function _renderCacheEntries(data) {
  const entries = (data.cacheHits || 0) + (data.cacheMisses || 0);
  return ` Cache Entries: ${entries}`;
}

/**
 * Render uptime line (static string, no real tracking).
 * @returns {string}
 * @private
 */
function _renderUptime() {
  return ' Uptime: session';
}

module.exports = {
  renderStatus,
  CB_FAILURE_THRESHOLD,
  _renderHeader,
  _renderProviderLine,
  _renderCircuitBreaker,
  _renderFailures,
  _renderCacheEntries,
  _renderUptime,
};
