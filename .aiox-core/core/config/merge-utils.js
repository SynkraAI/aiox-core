/**
 * Merge Utilities for Layered Configuration
 *
 * Implements the merge strategy defined in ADR-PRO-002:
 * - Scalars: last-wins
 * - Objects: deep merge
 * - Arrays: replace (default)
 * - Arrays with +append: concatenate
 * - null values: delete key
 *
 * @module core/config/merge-utils
 * @version 1.0.0
 * @created 2026-02-05 (Story PRO-4)
 * @see docs/architecture/adr/adr-pro-002-configuration-hierarchy.md
 */

/**
 * Check if value is a plain object (not array, null, Date, etc.)
 *
 * @param {*} value - Value to check
 * @returns {boolean} True if plain object
 */
function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Deep merge two configuration objects following ADR-PRO-002 rules.
 *
 * Merge strategy:
 * - Scalars (string, number, boolean): last-wins (source overrides target)
 * - Objects/Maps: recursive deep merge
 * - Arrays (default): replace (source replaces target)
 * - Arrays with +append suffix: concatenate source onto target
 * - null values: delete the key from result
 *
 * @param {Object} target - Base configuration (lower priority)
 * @param {Object} source - Override configuration (higher priority)
 * @returns {Object} Merged configuration (new object, inputs unchanged)
 */
function deepMerge(target, source) {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return source !== undefined ? source : target;
  }

  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    // Handle +append modifier for arrays
    if (key.endsWith('+append')) {
      const baseKey = key.slice(0, -7); // Remove '+append'
      if (Array.isArray(value)) {
        const existing = result[baseKey];
        result[baseKey] = Array.isArray(existing)
          ? [...existing, ...value]
          : value;
      }
      continue;
    }

    // Handle null = delete key
    if (value === null) {
      delete result[key];
      continue;
    }

    // Deep merge plain objects
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
      continue;
    }

    // Arrays and scalars: replace (last-wins)
    result[key] = value;
  }

  return result;
}

/**
 * Merge multiple config layers in order (left to right, last wins).
 *
 * @param {...Object} layers - Configuration layers in priority order (lowest first)
 * @returns {Object} Merged configuration
 */
function mergeAll(...layers) {
  return layers.reduce((result, layer) => {
    if (!layer || !isPlainObject(layer)) return result;
    return deepMerge(result, layer);
  }, {});
}

module.exports = {
  deepMerge,
  mergeAll,
  isPlainObject,
};
