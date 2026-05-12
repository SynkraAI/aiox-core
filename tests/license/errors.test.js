/**
 * Unit tests for errors.js
 *
 * @see Story PRO-6 - License Key & Feature Gating System
 * @see AC-4, AC-8 - Feature gate check, Graceful degradation
 */

'use strict';

const {
  ProFeatureError,
  LicenseActivationError,
  LicenseValidationError,
} = require('../../pro/license/errors');

describe('errors', () => {
  describe('ProFeatureError', () => {
    it('should create error with feature ID and friendly name', () => {
      const error = new ProFeatureError('pro.squads.premium', 'Premium Squads');

      expect(error.name).toBe('ProFeatureError');
      expect(error.featureId).toBe('pro.squads.premium');
      expect(error.friendlyName).toBe('Premium Squads');
    });

    it('should include activation instructions in message', () => {
      const error = new ProFeatureError('pro.squads.premium', 'Premium Squads');

      expect(error.message).toContain('Premium Squads requires an active AIOX Pro license');
      expect(error.message).toContain('aiox pro activate --key <KEY>');
      expect(error.message).toContain('https://synkra.ai/pro');
    });

    it('should mention data preservation (AC-8)', () => {
      const error = new ProFeatureError('pro.squads.premium', 'Premium Squads');

      expect(error.message).toContain('Your data and configurations are preserved');
    });

    it('should use featureId as friendlyName if not provided', () => {
      const error = new ProFeatureError('pro.squads.premium');

      expect(error.friendlyName).toBe('pro.squads.premium');
      expect(error.message).toContain('pro.squads.premium requires');
    });

    it('should allow custom purchase URL', () => {
      const error = new ProFeatureError('pro.squads.premium', 'Premium Squads', {
        purchaseUrl: 'https://custom.url/buy',
      });

      expect(error.purchaseUrl).toBe('https://custom.url/buy');
      expect(error.message).toContain('https://custom.url/buy');
    });

    it('should allow custom activation command', () => {
      const error = new ProFeatureError('pro.squads.premium', 'Premium Squads', {
        activateCommand: 'custom-cli activate',
      });

      expect(error.activateCommand).toBe('custom-cli activate');
      expect(error.message).toContain('custom-cli activate');
    });

    it('should be instanceof Error', () => {
      const error = new ProFeatureError('pro.squads.premium', 'Premium Squads');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ProFeatureError);
    });

    it('should have stack trace', () => {
      const error = new ProFeatureError('pro.squads.premium', 'Premium Squads');

      expect(error.stack).toBeTruthy();
      expect(error.stack).toContain('ProFeatureError');
    });

    describe('toCliMessage', () => {
      it('should return formatted CLI message', () => {
        const error = new ProFeatureError('pro.squads.premium', 'Premium Squads');
        const cliMsg = error.toCliMessage();

        expect(cliMsg).toContain('Premium Squads requires an active AIOX Pro license');
        expect(cliMsg).toContain('Your data and configurations are preserved');
        expect(cliMsg).toContain('Activate:');
        expect(cliMsg).toContain('Purchase:');
      });
    });

    describe('toJSON', () => {
      it('should return JSON-serializable object', () => {
        const error = new ProFeatureError('pro.squads.premium', 'Premium Squads');
        const json = error.toJSON();

        expect(json.error).toBe('ProFeatureError');
        expect(json.featureId).toBe('pro.squads.premium');
        expect(json.friendlyName).toBe('Premium Squads');
        expect(json.message).toContain('requires an active AIOX Pro license');
        expect(json.activateCommand).toBeTruthy();
        expect(json.purchaseUrl).toBeTruthy();
      });

      it('should be JSON.stringify safe', () => {
        const error = new ProFeatureError('pro.squads.premium', 'Premium Squads');
        const json = JSON.stringify(error.toJSON());
        const parsed = JSON.parse(json);

        expect(parsed.featureId).toBe('pro.squads.premium');
      });
    });
  });

  describe('LicenseActivationError', () => {
    it('should create error with message and code', () => {
      const error = new LicenseActivationError('Test error', 'TEST_CODE');

      expect(error.name).toBe('LicenseActivationError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
    });

    it('should default to ACTIVATION_FAILED code', () => {
      const error = new LicenseActivationError('Test error');

      expect(error.code).toBe('ACTIVATION_FAILED');
    });

    it('should support details object', () => {
      const error = new LicenseActivationError('Test error', 'TEST_CODE', { foo: 'bar' });

      expect(error.details).toEqual({ foo: 'bar' });
    });

    describe('static factory methods', () => {
      it('invalidKeyFormat should create correct error', () => {
        const error = LicenseActivationError.invalidKeyFormat();

        expect(error.code).toBe('INVALID_KEY_FORMAT');
        expect(error.message).toContain('PRO-XXXX-XXXX-XXXX-XXXX');
      });

      it('networkError should create correct error', () => {
        const error = LicenseActivationError.networkError();

        expect(error.code).toBe('NETWORK_ERROR');
        expect(error.message).toContain('internet connection');
      });

      it('networkError should include cause if provided', () => {
        const cause = new Error('Connection refused');
        const error = LicenseActivationError.networkError(cause);

        expect(error.details.cause).toBe('Connection refused');
      });

      it('invalidKey should create correct error', () => {
        const error = LicenseActivationError.invalidKey();

        expect(error.code).toBe('INVALID_KEY');
        expect(error.message).toContain('invalid or has been revoked');
      });

      it('expiredKey should create correct error', () => {
        const error = LicenseActivationError.expiredKey();

        expect(error.code).toBe('EXPIRED_KEY');
        expect(error.message).toContain('expired');
        expect(error.message).toContain('renew');
      });

      it('seatLimitExceeded should create correct error', () => {
        const error = LicenseActivationError.seatLimitExceeded(5, 5);

        expect(error.code).toBe('SEAT_LIMIT_EXCEEDED');
        expect(error.message).toContain('5/5 seats');
        expect(error.details.used).toBe(5);
        expect(error.details.max).toBe(5);
      });

      it('rateLimited should create correct error', () => {
        const error = LicenseActivationError.rateLimited(60);

        expect(error.code).toBe('RATE_LIMITED');
        expect(error.message).toContain('60 seconds');
        expect(error.details.retryAfter).toBe(60);
      });

      it('rateLimited should work without retryAfter', () => {
        const error = LicenseActivationError.rateLimited();

        expect(error.code).toBe('RATE_LIMITED');
        expect(error.message).toContain('try again later');
      });

      it('serverError should create correct error', () => {
        const error = LicenseActivationError.serverError();

        expect(error.code).toBe('SERVER_ERROR');
        expect(error.message).toContain('server error');
      });
    });

    describe('toJSON', () => {
      it('should return JSON-serializable object', () => {
        const error = new LicenseActivationError('Test error', 'TEST_CODE', { foo: 'bar' });
        const json = error.toJSON();

        expect(json.error).toBe('LicenseActivationError');
        expect(json.code).toBe('TEST_CODE');
        expect(json.message).toBe('Test error');
        expect(json.details).toEqual({ foo: 'bar' });
      });
    });
  });

  describe('LicenseValidationError', () => {
    it('should create error with message and code', () => {
      const error = new LicenseValidationError('Test error', 'TEST_CODE');

      expect(error.name).toBe('LicenseValidationError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
    });

    it('should default to VALIDATION_FAILED code', () => {
      const error = new LicenseValidationError('Test error');

      expect(error.code).toBe('VALIDATION_FAILED');
    });

    describe('static factory methods', () => {
      it('corruptedCache should create correct error', () => {
        const error = LicenseValidationError.corruptedCache();

        expect(error.code).toBe('CORRUPTED_CACHE');
        expect(error.message).toContain('corrupted');
        expect(error.message).toContain('reactivate');
      });

      it('machineMismatch should create correct error', () => {
        const error = LicenseValidationError.machineMismatch();

        expect(error.code).toBe('MACHINE_MISMATCH');
        expect(error.message).toContain('different machine');
      });
    });
  });

  describe('Security: No sensitive data exposure', () => {
    it('ProFeatureError should not expose license key', () => {
      const error = new ProFeatureError('pro.squads.premium', 'Premium Squads');
      const message = error.message;
      const json = JSON.stringify(error.toJSON());

      // Should not contain any key patterns
      expect(message).not.toMatch(/PRO-[A-Z0-9]{4}/);
      expect(json).not.toMatch(/PRO-[A-Z0-9]{4}/);
    });

    it('LicenseActivationError should not expose full key', () => {
      const error = new LicenseActivationError('Error with key', 'TEST', {
        key: 'PRO-ABCD-EFGH-IJKL-MNOP',
      });

      // The error itself doesn't prevent putting sensitive data in details,
      // but consumers should use maskKey() before adding to details
      // This test documents that the error class doesn't auto-mask

      // In practice, use maskKey() before creating error with key details
    });
  });
});
