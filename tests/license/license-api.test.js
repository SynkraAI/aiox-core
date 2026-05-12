/**
 * Unit tests for license-api.js
 *
 * @see Story PRO-6 - License Key & Feature Gating System
 * @see AC-1, AC-7a, AC-7b - Activation, Deactivation (online/offline)
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { LicenseApiClient, licenseApi } = require('../../pro/license/license-api');
const { LicenseActivationError } = require('../../pro/license/errors');
const {
  setPendingDeactivation,
  clearPendingDeactivation,
  hasPendingDeactivation,
} = require('../../pro/license/license-cache');

describe('license-api', () => {
  let server;
  let serverPort;
  let serverUrl;
  let testDir;
  let originalCwd;

  // Create a mock HTTP server for testing
  function createMockServer(handler) {
    return new Promise((resolve) => {
      server = http.createServer(handler);
      server.listen(0, '127.0.0.1', () => {
        serverPort = server.address().port;
        serverUrl = `http://127.0.0.1:${serverPort}`;
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

  beforeEach(() => {
    // Create temp directory for pending deactivation tests
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-api-test-'));
    originalCwd = process.cwd;
    process.cwd = () => testDir;
  });

  afterEach(async () => {
    process.cwd = originalCwd;
    await closeMockServer();

    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('LicenseApiClient constructor', () => {
    it('should use default config', () => {
      const client = new LicenseApiClient();

      expect(client.baseUrl).toBe(process.env.AIOX_LICENSE_API_URL || 'https://aiox-license-server.vercel.app');
      expect(client.timeoutMs).toBe(10000);
    });

    it('should accept custom config', () => {
      const client = new LicenseApiClient({
        baseUrl: 'https://custom.api.com',
        timeoutMs: 5000,
      });

      expect(client.baseUrl).toBe('https://custom.api.com');
      expect(client.timeoutMs).toBe(5000);
    });
  });

  describe('activate', () => {
    it('should successfully activate license (AC-1)', async () => {
      const mockResponse = {
        key: 'PRO-TEST-1234-5678-ABCD',
        features: ['pro.squads.*', 'pro.memory.*'],
        seats: { used: 1, max: 5 },
        expiresAt: '2026-03-05T00:00:00Z',
        cacheValidDays: 30,
        gracePeriodDays: 7,
      };

      await createMockServer((req, res) => {
        expect(req.method).toBe('POST');
        expect(req.url).toBe('/v1/license/activate');

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          const data = JSON.parse(body);
          expect(data.key).toBe('PRO-TEST-1234-5678-ABCD');
          expect(data.machineId).toBe('test-machine-id');
          expect(data.aioxCoreVersion).toBe('3.0.0');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mockResponse));
        });
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.activate('PRO-TEST-1234-5678-ABCD', 'test-machine-id', '3.0.0');

      expect(result.key).toBe('PRO-TEST-1234-5678-ABCD');
      expect(result.features).toEqual(['pro.squads.*', 'pro.memory.*']);
      expect(result.seats.max).toBe(5);
      expect(result.cacheValidDays).toBe(30);
      expect(result.activatedAt).toBeTruthy();
    });

    it('should handle invalid key error (401)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid key' }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      await expect(client.activate('PRO-INVALID', 'machine', '1.0')).rejects.toThrow(
        LicenseActivationError,
      );

      try {
        await client.activate('PRO-INVALID', 'machine', '1.0');
      } catch (error) {
        expect(error.code).toBe('INVALID_KEY');
      }
    });

    it('should handle expired key error (403)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 'EXPIRED_KEY' }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activate('PRO-EXPIRED', 'machine', '1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe('EXPIRED_KEY');
      }
    });

    it('should handle seat limit exceeded (403)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            code: 'SEAT_LIMIT_EXCEEDED',
            details: { used: 5, max: 5 },
          }),
        );
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activate('PRO-LIMIT', 'machine', '1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe('SEAT_LIMIT_EXCEEDED');
        expect(error.details.used).toBe(5);
        expect(error.details.max).toBe(5);
      }
    });

    it('should handle rate limiting (429)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ retryAfter: 60 }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activate('PRO-RATE', 'machine', '1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe('RATE_LIMITED');
        expect(error.details.retryAfter).toBe(60);
      }
    });

    it('should handle server error (500)', async () => {
      await createMockServer((req, res) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal error' }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activate('PRO-ERROR', 'machine', '1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe('SERVER_ERROR');
      }
    });

    it('should handle network timeout', async () => {
      await createMockServer((req, res) => {
        // Don't respond - let it timeout
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl, timeoutMs: 100 });

      try {
        await client.activate('PRO-TIMEOUT', 'machine', '1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe('NETWORK_ERROR');
      }
    });

    it('should handle invalid response structure', async () => {
      await createMockServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Missing features array
        res.end(JSON.stringify({ key: 'PRO-TEST' }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activate('PRO-TEST', 'machine', '1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe('INVALID_RESPONSE');
      }
    });
  });

  describe('validate', () => {
    it('should successfully validate license', async () => {
      const mockResponse = {
        valid: true,
        features: ['pro.squads.*'],
        seats: { used: 2, max: 5 },
        expiresAt: '2026-03-05T00:00:00Z',
      };

      await createMockServer((req, res) => {
        expect(req.method).toBe('POST');
        expect(req.url).toBe('/v1/license/validate');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockResponse));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.validate('PRO-TEST-1234-5678-ABCD', 'test-machine-id');

      expect(result.valid).toBe(true);
      expect(result.features).toEqual(['pro.squads.*']);
      expect(result.seats.used).toBe(2);
    });

    it('should handle invalid license', async () => {
      await createMockServer((req, res) => {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid' }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      await expect(client.validate('PRO-INVALID', 'machine')).rejects.toThrow(
        LicenseActivationError,
      );
    });
  });

  describe('deactivate (AC-7a)', () => {
    it('should successfully deactivate license', async () => {
      await createMockServer((req, res) => {
        expect(req.method).toBe('POST');
        expect(req.url).toBe('/v1/license/deactivate');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            seatFreed: true,
            message: 'License deactivated',
          }),
        );
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.deactivate('PRO-TEST-1234-5678-ABCD', 'test-machine-id');

      expect(result.success).toBe(true);
      expect(result.seatFreed).toBe(true);
    });

    it('should handle deactivation errors', async () => {
      await createMockServer((req, res) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      await expect(client.deactivate('PRO-TEST', 'machine')).rejects.toThrow(
        LicenseActivationError,
      );
    });
  });

  describe('syncPendingDeactivation (AC-7b)', () => {
    it('should sync pending deactivation when online', async () => {
      // Set up pending deactivation
      setPendingDeactivation('PRO-PENDING-1234-5678-ABCD', testDir);

      expect(hasPendingDeactivation(testDir).pending).toBe(true);

      await createMockServer((req, res) => {
        expect(req.url).toBe('/v1/license/deactivate');

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          const data = JSON.parse(body);
          expect(data.key).toBe('PRO-PENDING-1234-5678-ABCD');
          expect(data.offlineDeactivation).toBe(true);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        });
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.syncPendingDeactivation('test-machine', testDir);

      expect(result).toBe(true);
      expect(hasPendingDeactivation(testDir).pending).toBe(false);
    });

    it('should return false when no pending deactivation', async () => {
      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.syncPendingDeactivation('test-machine', testDir);

      expect(result).toBe(false);
    });

    it('should clear pending on INVALID_KEY response', async () => {
      setPendingDeactivation('PRO-INVALID-1234-5678-ABCD', testDir);

      await createMockServer((req, res) => {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid key' }));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.syncPendingDeactivation('test-machine', testDir);

      expect(result).toBe(true); // Cleared invalid key
      expect(hasPendingDeactivation(testDir).pending).toBe(false);
    });

    it('should keep pending on network error for retry', async () => {
      setPendingDeactivation('PRO-NETWORK-1234-5678-ABCD', testDir);

      await createMockServer((req, res) => {
        // Destroy connection to simulate network error
        req.destroy();
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl, timeoutMs: 100 });
      const result = await client.syncPendingDeactivation('test-machine', testDir);

      expect(result).toBe(false); // Failed but kept for retry
      expect(hasPendingDeactivation(testDir).pending).toBe(true);
    });
  });

  describe('isOnline', () => {
    it('should return true when server is reachable', async () => {
      await createMockServer((req, res) => {
        res.writeHead(200);
        res.end();
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });
      const result = await client.isOnline();

      expect(result).toBe(true);
    });

    it('should return false when server is not reachable', async () => {
      // Use a port that's not listening
      const client = new LicenseApiClient({ baseUrl: 'http://127.0.0.1:59999' });
      const result = await client.isOnline();

      expect(result).toBe(false);
    });
  });

  describe('singleton', () => {
    it('should export singleton instance', () => {
      expect(licenseApi).toBeInstanceOf(LicenseApiClient);
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle non-JSON response', async () => {
      await createMockServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Not JSON');
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activate('PRO-TEST', 'machine', '1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe('INVALID_RESPONSE');
      }
    });

    it('should handle 502 Bad Gateway', async () => {
      await createMockServer((req, res) => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({}));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activate('PRO-TEST', 'machine', '1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe('SERVER_ERROR');
      }
    });

    it('should handle 503 Service Unavailable', async () => {
      await createMockServer((req, res) => {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({}));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activate('PRO-TEST', 'machine', '1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe('SERVER_ERROR');
      }
    });

    it('should handle 400 Bad Request with custom message', async () => {
      await createMockServer((req, res) => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            message: 'Custom error message',
            code: 'CUSTOM_ERROR',
          }),
        );
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      try {
        await client.activate('PRO-TEST', 'machine', '1.0');
        fail('Should have thrown');
      } catch (error) {
        expect(error.code).toBe('CUSTOM_ERROR');
        expect(error.message).toBe('Custom error message');
      }
    });
  });

  describe('Performance', () => {
    it('should complete successful request quickly', async () => {
      const mockResponse = {
        features: ['pro.squads.*'],
        seats: { used: 1, max: 5 },
      };

      await createMockServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockResponse));
      });

      const client = new LicenseApiClient({ baseUrl: serverUrl });

      const start = performance.now();
      await client.activate('PRO-TEST-1234-5678-ABCD', 'machine', '1.0');
      const elapsed = performance.now() - start;

      // Should be very fast on localhost
      expect(elapsed).toBeLessThan(500);
    });
  });
});
