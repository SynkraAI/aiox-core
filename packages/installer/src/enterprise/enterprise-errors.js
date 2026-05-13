'use strict';

class EnterpriseUpgradeError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'EnterpriseUpgradeError';
    this.code = code;
    this.details = details;
  }
}

module.exports = {
  EnterpriseUpgradeError,
};
