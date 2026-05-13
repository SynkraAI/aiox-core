const {
  ErrorCategory,
  ErrorSeverity,
  DEFAULT_ERROR_CODE,
  CORE_ERROR_DEFINITIONS,
} = require('./constants');
const {
  cloneMetadataValue,
  deepMerge,
  hasOwn,
  isPlainObject,
  normalizeErrorCode,
  normalizeRecovery,
} = require('./utils');

const VALID_CATEGORIES = new Set(Object.values(ErrorCategory));
const VALID_SEVERITIES = new Set(Object.values(ErrorSeverity));

function freezeDefinition(definition) {
  return Object.freeze({
    ...definition,
    metadata: Object.freeze(cloneMetadataValue(definition.metadata || {})),
    recovery: Object.freeze([...(definition.recovery || [])]),
  });
}

function createUnknownDefinition(code = DEFAULT_ERROR_CODE) {
  return freezeDefinition({
    code,
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.ERROR,
    retryable: false,
    userMessage: 'An unexpected AIOX core error occurred.',
    recovery: ['Review the error metadata and retry if the operation is safe to repeat.'],
    metadata: code === DEFAULT_ERROR_CODE ? {} : { registry: { registered: false } },
  });
}

class ErrorRegistry {
  constructor(definitions = CORE_ERROR_DEFINITIONS) {
    this._entries = new Map();
    this.registerMany(definitions);

    if (!this.has(DEFAULT_ERROR_CODE)) {
      this.register(createUnknownDefinition());
    }
  }

  registerMany(definitions) {
    if (Array.isArray(definitions)) {
      definitions.forEach((definition) => this.register(definition));
      return this;
    }

    if (isPlainObject(definitions)) {
      Object.values(definitions).forEach((definition) => this.register(definition));
      return this;
    }

    throw new TypeError('ErrorRegistry definitions must be an array or object');
  }

  register(definition) {
    const normalized = this._normalizeDefinition(definition);

    if (this._entries.has(normalized.code)) {
      throw new Error(`Duplicate AIOX error code: ${normalized.code}`);
    }

    this._entries.set(normalized.code, freezeDefinition(normalized));
    return this;
  }

  lookup(code) {
    const normalizedCode = normalizeErrorCode(code) || DEFAULT_ERROR_CODE;
    const found = this._entries.get(normalizedCode);

    if (found) {
      return found;
    }

    const fallback = this._entries.get(DEFAULT_ERROR_CODE) || createUnknownDefinition();
    return freezeDefinition({
      ...fallback,
      code: normalizedCode,
      metadata: deepMerge(fallback.metadata, { registry: { registered: false } }),
    });
  }

  has(code) {
    const normalizedCode = normalizeErrorCode(code);
    return Boolean(normalizedCode && this._entries.has(normalizedCode));
  }

  list() {
    return Array.from(this._entries.values()).sort((left, right) => left.code.localeCompare(right.code));
  }

  get size() {
    return this._entries.size;
  }

  assertUnique() {
    const codes = this.list().map((definition) => definition.code);
    const unique = new Set(codes);

    if (codes.length !== unique.size) {
      throw new Error('ErrorRegistry contains duplicate error codes');
    }

    return true;
  }

  _normalizeDefinition(definition) {
    if (!isPlainObject(definition)) {
      throw new TypeError('Error definition must be a plain object');
    }

    const code = normalizeErrorCode(definition.code);
    if (!code) {
      throw new Error('Error definition requires a non-empty code');
    }

    if (!/^[A-Z0-9_]+$/.test(code)) {
      throw new Error(`Invalid AIOX error code: ${code}`);
    }

    const category = definition.category || ErrorCategory.UNKNOWN;
    if (!VALID_CATEGORIES.has(category)) {
      throw new Error(`Invalid error category for ${code}: ${category}`);
    }

    const severity = definition.severity || ErrorSeverity.ERROR;
    if (!VALID_SEVERITIES.has(severity)) {
      throw new Error(`Invalid error severity for ${code}: ${severity}`);
    }

    const normalized = {
      code,
      category,
      severity,
      retryable: Boolean(definition.retryable),
      userMessage: definition.userMessage || definition.message || code,
      recovery: normalizeRecovery(definition.recovery),
      metadata: isPlainObject(definition.metadata) ? cloneMetadataValue(definition.metadata) : {},
    };

    if (hasOwn(definition, 'exitCode') && definition.exitCode !== undefined) {
      if (!Number.isInteger(definition.exitCode) || definition.exitCode < 0) {
        throw new Error(`Invalid exitCode for ${code}: ${definition.exitCode}`);
      }
      normalized.exitCode = definition.exitCode;
    }

    return normalized;
  }
}

const defaultErrorRegistry = new ErrorRegistry(CORE_ERROR_DEFINITIONS);

module.exports = {
  ErrorRegistry,
  defaultErrorRegistry,
};
