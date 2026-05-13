const { DEFAULT_ERROR_CODE } = require('./constants');
const { hasOwn } = require('./utils');

function shouldExposeErrorStack(options = {}) {
  if (options.includeStack === true) {
    return true;
  }

  if (options.includeStack === false) {
    return false;
  }

  const stackFlag = process.env.DEBUG_ERROR_STACKS || process.env.DEBUG_STACKS || '';
  return ['1', 'true', 'yes', 'on'].includes(String(stackFlag).toLowerCase());
}

function sanitizeValue(value, seen = new WeakSet(), options = {}) {
  if (value === undefined || value === null) {
    return value;
  }

  const valueType = typeof value;

  if (valueType === 'bigint') {
    return value.toString();
  }

  if (valueType === 'function' || valueType === 'symbol') {
    return String(value);
  }

  if (valueType !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? value.toString() : value.toISOString();
  }

  if (value instanceof RegExp) {
    return value.toString();
  }

  if (value instanceof Error) {
    return serializeError(value, options, seen);
  }

  seen.add(value);

  try {
    if (value instanceof Map) {
      return Array.from(value.entries()).map(([key, entryValue]) => [
        sanitizeValue(key, seen, options),
        sanitizeValue(entryValue, seen, options),
      ]);
    }

    if (value instanceof Set) {
      return Array.from(value.values()).map((entryValue) => sanitizeValue(entryValue, seen, options));
    }

    if (Array.isArray(value)) {
      return value.map((entryValue) => sanitizeValue(entryValue, seen, options));
    }

    return Object.keys(value).reduce((safeValue, key) => {
      try {
        safeValue[key] = sanitizeValue(value[key], seen, options);
      } catch (error) {
        safeValue[key] = `[Unserializable: ${error.message}]`;
      }
      return safeValue;
    }, {});
  } catch (error) {
    return `[Unserializable: ${error.message}]`;
  } finally {
    seen.delete(value);
  }
}

function serializeError(error, options = {}, seen = new WeakSet()) {
  if (!(error instanceof Error)) {
    return sanitizeValue(error, seen, options);
  }

  if (seen.has(error)) {
    return '[Circular]';
  }

  seen.add(error);

  try {
    const serialized = {
      name: error.name || 'Error',
      message: error.message || '',
      stack: shouldExposeErrorStack(options) ? error.stack : '[redacted]',
    };

    if (error.code) {
      serialized.code = error.code;
    }

    if (error.isAIOXError || error.name === 'AIOXError') {
      serialized.code = error.code || DEFAULT_ERROR_CODE;
      serialized.category = error.category;
      serialized.severity = error.severity;
      serialized.retryable = Boolean(error.retryable);

      if (hasOwn(error, 'exitCode')) {
        serialized.exitCode = error.exitCode;
      }

      if (error.userMessage) {
        serialized.userMessage = error.userMessage;
      }

      if (Array.isArray(error.recovery)) {
        serialized.recovery = [...error.recovery];
      }

      serialized.metadata = sanitizeValue(error.metadata || {}, seen, options);
    }

    if (error.cause !== undefined) {
      serialized.cause = error.cause instanceof Error
        ? serializeError(error.cause, options, seen)
        : sanitizeValue(error.cause, seen, options);
    }

    for (const key of Object.getOwnPropertyNames(error)) {
      if ([
        'name',
        'message',
        'stack',
        'code',
        'category',
        'severity',
        'retryable',
        'exitCode',
        'metadata',
        'cause',
        'userMessage',
        'recovery',
        'isAIOXError',
      ].includes(key)) {
        continue;
      }

      try {
        serialized[key] = sanitizeValue(error[key], seen, options);
      } catch (serializationError) {
        serialized[key] = `[Unserializable: ${serializationError.message}]`;
      }
    }

    return serialized;
  } finally {
    seen.delete(error);
  }
}

module.exports = {
  shouldExposeErrorStack,
  sanitizeValue,
  serializeError,
};
