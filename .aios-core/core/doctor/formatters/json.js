/**
 * Doctor JSON Formatter
 *
 * Formats doctor results as structured JSON.
 *
 * @module aios-core/doctor/formatters/json
 * @story INS-4.1
 */

function formatJson(output) {
  return JSON.stringify(output, null, 2);
}

module.exports = { formatJson };
