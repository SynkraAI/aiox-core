/**
 * Unit tests for license-api.js auth methods (PRO-11)
 *
 * @see Story PRO-11 - Email Authentication & Buyer-Based Pro Activation
 * @see AC-1, AC-2, AC-3, AC-4, AC-5, AC-8
 */

'use strict';

const http = require('http');
const { LicenseApiClient } = require('../../pro/license/license-api');
const { AuthError, BuyerValidationError, LicenseActivationError } = require('../../pro/license/errors');

describe('license-api auth methods', () => {
  let server;
  let serverUrl;

  function createMockServer(handler) {
    return new Promise((resolve) => {
      server = http.createServer(handler);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        serverUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  }

  function closeMockServer() {
    return new Promise((resolve) => {
      if (server) {
        server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  afterEach(async () => {
    await closeMockServer();
  });

  describe('signup (AC-1)', () => {
    it('should successfully create account', async () => {
      await createMockServer((req, res) => {
        expect(req.method).toBe('POST');
        expect(req.url).toBe('/v1/auth/signup');

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          const data = JSON.parse(body);
          expect(data.email).toBe('user@example.com');
          expect(data.password).toBe('TestPass123');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            userId: 'user-123',
            message: 'Verification email sent.',
          }));
        });
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.signup('user@example.com', 'TestPass123');

      expect(result.userId).toBe('user-123');
      expect(result.message).toContain('Verification');
    });

    it('should throw AuthError for existing email', async () => {
      await createMockServer((req, res) => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'User already registered',
          code: 'BAD_REQUEST',
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.signup('existing@example.com', 'TestPass123');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect(error.code).toBe('EMAIL_ALREADY_REGISTERED');
      }
    });

    it('should throw AuthError on rate limit', async () => {
      await createMockServer((req, res) => {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ retryAfter: 900 }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.signup('user@example.com', 'TestPass123');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect(error.code).toBe('AUTH_RATE_LIMITED');
      }
    });
  });

  describe('login (AC-5)', () => {
    it('should successfully login', async () => {
      await createMockServer((req, res) => {
        expect(req.method).toBe('POST');
        expect(req.url).toBe('/v1/auth/login');

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          const data = JSON.parse(body);
          expect(data.email).toBe('user@example.com');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            sessionToken: 'session-token-abc',
            userId: 'user-123',
            emailVerified: true,
          }));
        });
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.login('user@example.com', 'TestPass123');

      expect(result.sessionToken).toBe('session-token-abc');
      expect(result.userId).toBe('user-123');
      expect(result.emailVerified).toBe(true);
    });

    it('should throw AuthError for invalid credentials (AC-8)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.login('user@example.com', 'WrongPass');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect(error.code).toBe('INVALID_CREDENTIALS');
      }
    });

    it('should return emailVerified=false for unverified users', async () => {
      await createMockServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          sessionToken: 'session-token',
          userId: 'user-456',
          emailVerified: false,
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.login('unverified@example.com', 'TestPass123');

      expect(result.emailVerified).toBe(false);
    });
  });

  describe('checkEmailVerified (AC-2)', () => {
    it('should return verified=true for verified email', async () => {
      await createMockServer((req, res) => {
        expect(req.url).toBe('/v1/auth/verify-status');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          verified: true,
          email: 'user@example.com',
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.checkEmailVerified('session-token');

      expect(result.verified).toBe(true);
      expect(result.email).toBe('user@example.com');
    });

    it('should return verified=false for unverified email', async () => {
      await createMockServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          verified: false,
          email: 'unverified@example.com',
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.checkEmailVerified('session-token');

      expect(result.verified).toBe(false);
    });
  });

  describe('activateByAuth (AC-3, AC-4)', () => {
    it('should successfully activate for valid buyer (AC-3)', async () => {
      const mockActivation = {
        key: 'PRO-AUTH-1234-5678-ABCD',
        features: ['pro.squads.*', 'pro.memory.*'],
        seats: { used: 1, max: 2 },
        expiresAt: '2027-02-15T00:00:00Z',
        cacheValidDays: 30,
        gracePeriodDays: 7,
      };

      await createMockServer((req, res) => {
        expect(req.url).toBe('/v1/auth/activate-pro');

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          const data = JSON.parse(body);
          expect(data.sessionToken).toBe('valid-session');
          expect(data.machineId).toBeTruthy();
          expect(data.aiosCoreVersion).toBeTruthy();

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mockActivation));
        });
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.activateByAuth('valid-session', 'machine-id', '4.1.0');

      expect(result.key).toBe('PRO-AUTH-1234-5678-ABCD');
      expect(result.features).toContain('pro.squads.*');
      expect(result.seats.max).toBe(2);
      expect(result.activatedAt).toBeTruthy();
    });

    it('should throw BuyerValidationError for non-buyer (AC-4)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Not a buyer',
          code: 'NOT_A_BUYER',
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activateByAuth('valid-session', 'machine-id', '4.1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BuyerValidationError);
        expect(error.code).toBe('NOT_A_BUYER');
      }
    });

    it('should throw AuthError for unverified email', async () => {
      await createMockServer((req, res) => {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Email not verified',
          code: 'EMAIL_NOT_VERIFIED',
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activateByAuth('unverified-session', 'machine-id', '4.1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect(error.code).toBe('EMAIL_NOT_VERIFIED');
      }
    });

    it('should throw LicenseActivationError for seat limit', async () => {
      await createMockServer((req, res) => {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          code: 'SEAT_LIMIT_EXCEEDED',
          details: { used: 2, max: 2 },
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activateByAuth('valid-session', 'machine-id', '4.1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(LicenseActivationError);
        expect(error.code).toBe('SEAT_LIMIT_EXCEEDED');
      }
    });

    it('should throw BuyerValidationError for service unavailable', async () => {
      await createMockServer((req, res) => {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Buyer service unavailable',
          code: 'BUYER_SERVICE_UNAVAILABLE',
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activateByAuth('valid-session', 'machine-id', '4.1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(BuyerValidationError);
        expect(error.code).toBe('BUYER_SERVICE_UNAVAILABLE');
      }
    });
  });

  describe('resendVerification (AC-9)', () => {
    it('should successfully resend verification', async () => {
      await createMockServer((req, res) => {
        expect(req.url).toBe('/v1/auth/resend-verification');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Verification email resent.' }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.resendVerification('session-token');

      expect(result.message).toContain('resent');
    });

    it('should throw AuthError on rate limit (AC-9 - max 3/hour)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ retryAfter: 3600 }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.resendVerification('session-token');
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect(error.code).toBe('AUTH_RATE_LIMITED');
      }
    });
  });
});
