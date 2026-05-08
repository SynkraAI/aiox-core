function isPlainObject(value) {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function cloneMetadataValue(value, seen = new WeakSet()) {
  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);
    try {
      return value.map((entry) => cloneMetadataValue(entry, seen));
    } finally {
      seen.delete(value);
    }
  }

  if (isPlainObject(value)) {
    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);
    try {
      return Object.keys(value).reduce((clone, key) => {
        clone[key] = cloneMetadataValue(value[key], seen);
        return clone;
      }, {});
    } finally {
      seen.delete(value);
    }
  }

  return value;
}

function deepMerge(...sources) {
  return sources.reduce((merged, source) => {
    if (!isPlainObject(source)) {
      return merged;
    }

    const sourceSeen = new WeakSet();
    sourceSeen.add(source);

    for (const key of Object.keys(source)) {
      const current = merged[key];
      const next = source[key];

      if (isPlainObject(current) && isPlainObject(next)) {
        merged[key] = deepMerge(current, next);
      } else {
        merged[key] = cloneMetadataValue(next, sourceSeen);
      }
    }

    return merged;
  }, {});
}

function normalizeErrorCode(code) {
  if (typeof code !== 'string') {
    return null;
  }

  const normalized = code.trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
}

function normalizeRecovery(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry) => typeof entry === 'string' && entry.trim().length > 0);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

module.exports = {
  isPlainObject,
  cloneMetadataValue,
  deepMerge,
  normalizeErrorCode,
  normalizeRecovery,
  hasOwn,
};
