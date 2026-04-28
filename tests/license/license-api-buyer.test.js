/**
 * Unit tests for license-api.js buyer operator methods (Story 123.8 — Wave 1)
 *
 * Covers validateBuyer() which wraps POST /api/v1/auth/check-email.
 *
 * @see Story 123.8 — Cohort Buyer CLI Migration
 * @see AC1, AC2, AC7, AC10
 */

'use strict';

const http = require('http');
const { LicenseApiClient } = require('../../pro/license/license-api');
const { AuthError } = require('../../pro/license/errors');

describe('license-api buyer methods (Story 123.8 — Wave 1)', () => {
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

  describe('validateBuyer (AC1, AC2)', () => {
    it('returns narrow contract { email, isBuyer, hasAccount } for existing buyer', async () => {
      await createMockServer((req, res) => {
        expect(req.method).toBe('POST');
        expect(req.url).toBe('/api/v1/auth/check-email');

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          const data = JSON.parse(body);
          expect(data.email).toBe('buyer@example.com');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            isBuyer: true,
            hasAccount: true,
            email: 'buyer@example.com',
          }));
        });
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.validateBuyer('buyer@example.com');

      expect(result).toEqual({
        email: 'buyer@example.com',
        isBuyer: true,
        hasAccount: true,
      });
      // Narrow contract: no extra fields leaked
      expect(Object.keys(result).sort()).toEqual(['email', 'hasAccount', 'isBuyer']);
    });

    it('returns isBuyer=false for non-buyer email', async () => {
      await createMockServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          isBuyer: false,
          hasAccount: false,
          email: 'stranger@example.com',
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.validateBuyer('stranger@example.com');

      expect(result.isBuyer).toBe(false);
      expect(result.hasAccount).toBe(false);
    });

    it('surfaces hasAccount=false when buyer has no user account yet', async () => {
      await createMockServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          isBuyer: true,
          hasAccount: false,
          email: 'newbuyer@example.com',
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.validateBuyer('newbuyer@example.com');

      expect(result.isBuyer).toBe(true);
      expect(result.hasAccount).toBe(false);
    });

    it('throws AuthError on rate-limit (429)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          code: 'RATE_LIMITED',
          message: 'Too many requests',
          retryAfter: 60,
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      await expect(client.validateBuyer('anyone@example.com')).rejects.toBeInstanceOf(AuthError);
    });

    it('does not modify checkEmail response when it contains extra fields (defensive narrowing)', async () => {
      // Server could evolve and add fields; validateBuyer must keep contract stable.
      await createMockServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          isBuyer: true,
          hasAccount: true,
          email: 'buyer@example.com',
          extraInternalField: 'should-not-leak',
          anotherField: 42,
        }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.validateBuyer('buyer@example.com');

      expect(Object.keys(result).sort()).toEqual(['email', 'hasAccount', 'isBuyer']);
      expect(result).not.toHaveProperty('extraInternalField');
      expect(result).not.toHaveProperty('anotherField');
    });
  });
});
