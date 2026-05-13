const {
  ErrorCategory,
  ErrorSeverity,
  DEFAULT_ERROR_CODE,
  CORE_ERROR_DEFINITIONS,
} = require('./constants');
const { ErrorRegistry, defaultErrorRegistry } = require('./error-registry');
const { AIOXError, isAIOXError, normalizeError } = require('./aiox-error');
const { shouldExposeErrorStack, sanitizeValue, serializeError } = require('./serializer');
const { deepMerge, isPlainObject, normalizeErrorCode } = require('./utils');

module.exports = {
  AIOXError,
  ErrorRegistry,
  ErrorCategory,
  ErrorSeverity,
  DEFAULT_ERROR_CODE,
  CORE_ERROR_DEFINITIONS,
  defaultErrorRegistry,
  isAIOXError,
  normalizeError,
  serializeError,
  sanitizeValue,
  shouldExposeErrorStack,
  deepMerge,
  isPlainObject,
  normalizeErrorCode,
};
