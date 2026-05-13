const {
  DEFAULT_ERROR_CODE,
} = require('./constants');
const { defaultErrorRegistry } = require('./error-registry');
const { serializeError } = require('./serializer');
const { deepMerge, hasOwn, isPlainObject, normalizeErrorCode } = require('./utils');

class AIOXError extends Error {
  constructor(message, options = {}) {
    const code = normalizeErrorCode(options.code) || DEFAULT_ERROR_CODE;
    const registry = options.registry || defaultErrorRegistry;
    const definition = registry.lookup(code);
    const finalMessage = message || options.message || definition.userMessage || code;

    if (hasOwn(options, 'cause')) {
      super(finalMessage, { cause: options.cause });
    } else {
      super(finalMessage);
    }

    this.name = 'AIOXError';
    this.code = code;
    this.category = options.category || definition.category;
    this.severity = options.severity || definition.severity;
    this.retryable = hasOwn(options, 'retryable') ? Boolean(options.retryable) : Boolean(definition.retryable);
    this.userMessage = options.userMessage || definition.userMessage;
    this.recovery = Array.isArray(options.recovery) ? [...options.recovery] : [...(definition.recovery || [])];
    this.metadata = deepMerge(definition.metadata || {}, options.metadata || {});
    this.isAIOXError = true;

    if (hasOwn(options, 'exitCode')) {
      this.exitCode = options.exitCode;
    } else if (hasOwn(definition, 'exitCode')) {
      this.exitCode = definition.exitCode;
    }

    if (hasOwn(options, 'cause')) {
      this.cause = options.cause;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIOXError);
    }
  }

  toJSON(options = {}) {
    return serializeError(this, options);
  }
}

function isAIOXError(value) {
  return value instanceof AIOXError || Boolean(value && value.isAIOXError === true);
}

function collectErrorOwnProperties(error) {
  if (!(error instanceof Error)) {
    return {};
  }

  return Object.getOwnPropertyNames(error).reduce((properties, key) => {
    if (['name', 'message', 'stack', 'cause'].includes(key)) {
      return properties;
    }

    properties[key] = error[key];
    return properties;
  }, {});
}

function normalizeError(error, overrides = {}) {
  if (isAIOXError(error)) {
    if (!overrides || Object.keys(overrides).length === 0) {
      return error;
    }

    return new AIOXError(overrides.message || error.message, {
      code: overrides.code || error.code,
      category: overrides.category || error.category,
      severity: overrides.severity || error.severity,
      retryable: hasOwn(overrides, 'retryable') ? overrides.retryable : error.retryable,
      exitCode: hasOwn(overrides, 'exitCode') ? overrides.exitCode : error.exitCode,
      userMessage: overrides.userMessage || error.userMessage,
      recovery: overrides.recovery || error.recovery,
      metadata: deepMerge(error.metadata || {}, overrides.metadata || {}),
      cause: hasOwn(overrides, 'cause') ? overrides.cause : error.cause,
      registry: overrides.registry,
    });
  }

  if (error instanceof Error) {
    const ownProperties = collectErrorOwnProperties(error);
    const metadata = deepMerge(
      {
        originalError: {
          name: error.name || 'Error',
        },
      },
      Object.keys(ownProperties).length > 0 ? { originalError: { properties: ownProperties } } : {},
      isPlainObject(overrides.metadata) ? overrides.metadata : {},
    );

    return new AIOXError(overrides.message || error.message, {
      code: overrides.code || error.code || DEFAULT_ERROR_CODE,
      category: overrides.category,
      severity: overrides.severity,
      retryable: overrides.retryable,
      exitCode: overrides.exitCode,
      userMessage: overrides.userMessage,
      recovery: overrides.recovery,
      metadata,
      cause: hasOwn(overrides, 'cause') ? overrides.cause : error,
      registry: overrides.registry,
    });
  }

  return new AIOXError(overrides.message || String(error), {
    code: overrides.code || DEFAULT_ERROR_CODE,
    category: overrides.category,
    severity: overrides.severity,
    retryable: overrides.retryable,
    exitCode: overrides.exitCode,
    userMessage: overrides.userMessage,
    recovery: overrides.recovery,
    metadata: deepMerge({ originalValue: { type: typeof error } }, overrides.metadata || {}),
    cause: overrides.cause,
    registry: overrides.registry,
  });
}

module.exports = {
  AIOXError,
  isAIOXError,
  normalizeError,
};
