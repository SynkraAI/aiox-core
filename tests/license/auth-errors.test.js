/**
 * Unit tests for AuthError and BuyerValidationError (PRO-11)
 *
 * @see Story PRO-11 - Email Authentication & Buyer-Based Pro Activation
 */

'use strict';

const { AuthError, BuyerValidationError } = require('../../pro/license/errors');

describe('AuthError', () => {
  it('should create error with defaults', () => {
    const error = new AuthError('Test error');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.name).toBe('AuthError');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('AUTH_FAILED');
    expect(error.details).toEqual({});
  });

  it('should create error with custom code and details', () => {
    const error = new AuthError('Custom', 'CUSTOM_CODE', { foo: 'bar' });

    expect(error.code).toBe('CUSTOM_CODE');
    expect(error.details).toEqual({ foo: 'bar' });
  });

  describe('static factories', () => {
    it('invalidCredentials', () => {
      const error = AuthError.invalidCredentials();

      expect(error.code).toBe('INVALID_CREDENTIALS');
      expect(error.message).toContain('Invalid email or password');
    });

    it('emailNotVerified', () => {
      const error = AuthError.emailNotVerified();

      expect(error.code).toBe('EMAIL_NOT_VERIFIED');
      expect(error.message).toContain('verify your email');
    });

    it('emailAlreadyRegistered', () => {
      const error = AuthError.emailAlreadyRegistered();

      expect(error.code).toBe('EMAIL_ALREADY_REGISTERED');
      expect(error.message).toContain('already exists');
    });

    it('rateLimited with retryAfter', () => {
      const error = AuthError.rateLimited(900);

      expect(error.code).toBe('AUTH_RATE_LIMITED');
      expect(error.message).toContain('15 minutes');
      expect(error.details.retryAfter).toBe(900);
    });

    it('rateLimited without retryAfter', () => {
      const error = AuthError.rateLimited();

      expect(error.code).toBe('AUTH_RATE_LIMITED');
      expect(error.message).toContain('try again later');
    });

    it('verificationTimeout', () => {
      const error = AuthError.verificationTimeout();

      expect(error.code).toBe('VERIFICATION_TIMEOUT');
      expect(error.message).toContain('timed out');
    });
  });

  it('should serialize to JSON', () => {
    const error = new AuthError('Test', 'TEST_CODE', { extra: true });
    const json = error.toJSON();

    expect(json.error).toBe('AuthError');
    expect(json.code).toBe('TEST_CODE');
    expect(json.message).toBe('Test');
    expect(json.details).toEqual({ extra: true });
  });
});

describe('BuyerValidationError', () => {
  it('should create error with defaults', () => {
    const error = new BuyerValidationError('Test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BuyerValidationError);
    expect(error.name).toBe('BuyerValidationError');
    expect(error.code).toBe('BUYER_VALIDATION_FAILED');
  });

  describe('static factories', () => {
    it('notABuyer', () => {
      const error = BuyerValidationError.notABuyer();

      expect(error.code).toBe('NOT_A_BUYER');
      expect(error.message).toContain('No active Pro subscription');
    });

    it('serviceUnavailable', () => {
      const error = BuyerValidationError.serviceUnavailable();

      expect(error.code).toBe('BUYER_SERVICE_UNAVAILABLE');
      expect(error.message).toContain('temporarily unavailable');
    });
  });

  it('should serialize to JSON', () => {
    const error = BuyerValidationError.notABuyer();
    const json = error.toJSON();

    expect(json.error).toBe('BuyerValidationError');
    expect(json.code).toBe('NOT_A_BUYER');
  });
});
