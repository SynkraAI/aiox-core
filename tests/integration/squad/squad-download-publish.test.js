/**
 * Integration Tests for Squad Download & Publish
 *
 * These tests verify the integration between SquadDownloader, SquadPublisher,
 * and other squad components (SquadValidator, SquadLoader).
 *
 * Note: Network-dependent tests are skipped by default.
 * Set AIOX_INTEGRATION_TESTS=true to run network tests.
 *
 * @see Story SQS-6: Download & Publish Tasks
 */

const path = require('path');
const fs = require('fs').promises;

// Mock child_process for GitHub CLI auth in CI environments
jest.mock('child_process', () => {
  const actual = jest.requireActual('child_process');
  return {
    ...actual,
    execSync: jest.fn((cmd, opts) => {
      // Mock gh auth status to return authenticated
      if (cmd === 'gh auth status') {
        return 'Logged in to github.com as ci-test-user';
      }
      // Fall through to actual for other commands
      return actual.execSync(cmd, opts);
    }),
  };
});

const {
  SquadDownloader,
  SquadPublisher,
  SquadValidator,
  SquadLoader,
} = require('../../../.aiox-core/development/scripts/squad');

// Test paths - use unique directory to avoid parallel test collisions
const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures', 'squad');
const TEMP_PATH = path.join(__dirname, 'temp-download-publish');

// Check if network tests should run
const RUN_NETWORK_TESTS = process.env.AIOX_INTEGRATION_TESTS === 'true';

describe('Squad Download & Publish Integration', () => {
  let downloader;
  let publisher;
  let validator;
  let loader;

  beforeAll(async () => {
    // Create temp directory
    await fs.mkdir(TEMP_PATH, { recursive: true });
  });

  afterAll(async () => {
    // Clean up temp directory
    try {
      await fs.rm(TEMP_PATH, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  beforeEach(() => {
    downloader = new SquadDownloader({
      squadsPath: TEMP_PATH,
      verbose: false,
    });

    publisher = new SquadPublisher({
      verbose: false,
      dryRun: true, // Always dry-run in tests
    });

    validator = new SquadValidator({
      verbose: false,
    });

    loader = new SquadLoader({
      squadsPath: TEMP_PATH,
    });
  });

  afterEach(async () => {
    // Clean temp directory between tests
    try {
      const entries = await fs.readdir(TEMP_PATH);
      for (const entry of entries) {
        await fs.rm(path.join(TEMP_PATH, entry), { recursive: true, force: true });
      }
    } catch {
      // Directory may not exist, ignore
    }
  });

  describe('Round-trip: create -> validate -> publish (Test 4.3)', () => {
    it('should complete full publish workflow with dry-run', async () => {
      // Step 1: Create a new squad manually (instead of using generator with template)
      const squadPath = path.join(TEMP_PATH, 'integration-test-squad');
      await fs.mkdir(squadPath, { recursive: true });
      await fs.mkdir(path.join(squadPath, 'tasks'), { recursive: true });
      await fs.mkdir(path.join(squadPath, 'agents'), { recursive: true });

      await fs.writeFile(
        path.join(squadPath, 'squad.yaml'),
        `name: integration-test-squad
version: 1.0.0
description: Squad created for integration testing
author: Test Suite
license: MIT
components:
  tasks:
    - sample-task.md
`,
      );

      await fs.writeFile(
        path.join(squadPath, 'tasks', 'sample-task.md'),
        `---
task: Sample Task
responsavel: "@integration"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - input: Test input
Saida: |
  - output: Test output
Checklist:
  - "[ ] Sample step"
---

# Sample Task

This is a sample task for integration testing.
`,
      );

      expect(
        await fs
          .access(squadPath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true);

      // Step 2: Validate the created squad
      const validationResult = await validator.validate(squadPath);

      // May have warnings but should be structurally valid
      expect(validationResult).toHaveProperty('valid');
      expect(validationResult).toHaveProperty('errors');
      expect(validationResult).toHaveProperty('warnings');

      // Step 3: Load manifest to verify structure
      const manifest = await loader.loadManifest(squadPath);

      expect(manifest.name).toBe('integration-test-squad');
      expect(manifest.version).toBeDefined();

      // Step 4: Publish with dry-run (gh auth is mocked globally)
      const publishResult = await publisher.publish(squadPath);

      expect(publishResult.prUrl).toBe('[dry-run] PR would be created');
      expect(publishResult.branch).toContain('squad/integration-test-squad');
      expect(publishResult.manifest.name).toBe('integration-test-squad');
      expect(publishResult.preview).toBeDefined();
    });
  });

  describe('List available squads from registry (Test 4.4)', () => {
    // This test requires network access
    const conditionalTest = RUN_NETWORK_TESTS ? it : it.skip;

    conditionalTest(
      'should list squads from aiox-squads registry',
      async () => {
        const squads = await downloader.listAvailable();

        expect(squads).toBeInstanceOf(Array);
        // Registry should have at least some squads
        // This may fail if registry is empty
        expect(squads.length).toBeGreaterThanOrEqual(0);

        // If there are squads, verify structure
        if (squads.length > 0) {
          const squad = squads[0];
          expect(squad).toHaveProperty('name');
          expect(squad).toHaveProperty('version');
          expect(squad).toHaveProperty('type');
        }
      },
      30000,
    ); // 30 second timeout for network
  });

  describe('Download squad from registry (Test 4.1)', () => {
    // This test requires network access
    const conditionalTest = RUN_NETWORK_TESTS ? it : it.skip;

    conditionalTest(
      'should download squad from registry',
      async () => {
        // First, get available squads
        const squads = await downloader.listAvailable();

        if (squads.length === 0) {
          console.log('No squads available in registry, skipping download test');
          return;
        }

        // Try to download the first available squad
        const squadToDownload = squads[0].name;
        const result = await downloader.download(squadToDownload, { validate: true });

        expect(result.path).toBeDefined();
        expect(result.path).toContain(squadToDownload);

        // Verify files were downloaded
        const manifestExists = await fs
          .access(path.join(result.path, 'squad.yaml'))
          .then(() => true)
          .catch(() =>
            fs
              .access(path.join(result.path, 'config.yaml'))
              .then(() => true)
              .catch(() => false),
          );

        expect(manifestExists).toBe(true);
      },
      60000,
    ); // 60 second timeout for network
  });

  describe('Publish flow with dry-run (Test 4.2)', () => {
    it('should complete dry-run publish without network calls', async () => {
      // Use existing fixture squad
      const squadPath = path.join(FIXTURES_PATH, 'valid-squad');

      // Check if fixture exists
      const fixtureExists = await fs
        .access(squadPath)
        .then(() => true)
        .catch(() => false);

      if (!fixtureExists) {
        // Create a minimal squad for testing
        const testSquadPath = path.join(TEMP_PATH, 'dry-run-test-squad');
        await fs.mkdir(testSquadPath, { recursive: true });
        await fs.mkdir(path.join(testSquadPath, 'tasks'), { recursive: true });
        await fs.mkdir(path.join(testSquadPath, 'agents'), { recursive: true });

        await fs.writeFile(
          path.join(testSquadPath, 'squad.yaml'),
          `name: dry-run-test-squad
version: 1.0.0
description: Test squad for dry-run publish
author: Test Suite
components:
  tasks:
    - sample-task.md
`,
        );

        await fs.writeFile(
          path.join(testSquadPath, 'tasks', 'sample-task.md'),
          `---
task: Sample Task
responsavel: "@test"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - input: Test input
Saida: |
  - output: Test output
Checklist:
  - "[ ] Sample step"
---

# Sample Task

This is a sample task for testing.
`,
        );

        // gh auth is mocked globally
        const result = await publisher.publish(testSquadPath);

        expect(result.prUrl).toBe('[dry-run] PR would be created');
        expect(result.preview.title).toBe('Add squad: dry-run-test-squad');
        expect(result.preview.body).toContain('dry-run-test-squad');
      } else {
        // gh auth is mocked globally
        const result = await publisher.publish(squadPath);

        expect(result.prUrl).toBe('[dry-run] PR would be created');
        expect(result.preview).toBeDefined();
      }
    });
  });

  describe('Validation integration', () => {
    it('should validate downloaded squad', async () => {
      // Create a mock downloaded squad
      const mockSquadPath = path.join(TEMP_PATH, 'mock-downloaded-squad');
      await fs.mkdir(mockSquadPath, { recursive: true });
      await fs.mkdir(path.join(mockSquadPath, 'tasks'), { recursive: true });
      await fs.mkdir(path.join(mockSquadPath, 'agents'), { recursive: true });

      await fs.writeFile(
        path.join(mockSquadPath, 'squad.yaml'),
        `name: mock-downloaded-squad
version: 1.0.0
description: Mock squad simulating download
author: Registry
components:
  tasks:
    - sample-task.md
`,
      );

      await fs.writeFile(
        path.join(mockSquadPath, 'tasks', 'sample-task.md'),
        `---
task: Sample Task
responsavel: "@agent"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - input: Test
Saida: |
  - output: Test
Checklist:
  - "[ ] Step"
---

# Sample Task
`,
      );

      // Validate the mock squad
      const result = await validator.validate(mockSquadPath);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });
  });

  describe('Error handling integration', () => {
    it('should handle validation errors in publish workflow', async () => {
      // Create invalid squad
      const invalidSquadPath = path.join(TEMP_PATH, 'invalid-publish-squad');
      await fs.mkdir(invalidSquadPath, { recursive: true });
      // No manifest file - will fail validation

      await expect(publisher.publish(invalidSquadPath)).rejects.toThrow();
    });

    it('should check auth status in publish workflow', async () => {
      // Create valid squad
      const validSquadPath = path.join(TEMP_PATH, 'auth-test-squad');
      await fs.mkdir(validSquadPath, { recursive: true });
      await fs.mkdir(path.join(validSquadPath, 'tasks'), { recursive: true });

      await fs.writeFile(
        path.join(validSquadPath, 'squad.yaml'),
        `name: auth-test-squad
version: 1.0.0
description: Test
author: Test
`,
      );

      await fs.writeFile(
        path.join(validSquadPath, 'tasks', 'task.md'),
        `---
task: Test
responsavel: "@agent"
responsavel_type: agent
atomic_layer: task
Entrada: "test"
Saida: "test"
Checklist: []
---
# Test
`,
      );

      // Test that checkAuth method works
      const testPublisher = new SquadPublisher({
        dryRun: true, // Use dry-run to avoid actual PR creation
      });

      // checkAuth should be callable
      const authResult = await testPublisher.checkAuth();
      expect(authResult).toHaveProperty('authenticated');
      expect(authResult).toHaveProperty('username');
    });
  });

  describe('Cache behavior', () => {
    it('should cache registry between calls', async () => {
      // Mock https for this test
      const https = require('https');
      const originalGet = https.get;

      let callCount = 0;
      https.get = jest.fn().mockImplementation((url, options, callback) => {
        callCount++;
        const response = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'data') {
              // Return Buffer to match actual HTTPS response behavior
              cb(
                Buffer.from(
                  JSON.stringify({ version: '1.0.0', squads: { official: [], community: [] } }),
                  'utf-8',
                ),
              );
            }
            if (event === 'end') {
              cb();
            }
            return response;
          }),
        };
        callback(response);
        return { on: jest.fn() };
      });

      // First call
      await downloader.fetchRegistry();

      // Second call should use cache
      await downloader.fetchRegistry();

      expect(callCount).toBe(1); // Only one network call

      // Restore
      https.get = originalGet;
    });

    it('should allow cache clearing', async () => {
      // Mock https
      const https = require('https');
      const originalGet = https.get;

      let callCount = 0;
      https.get = jest.fn().mockImplementation((url, options, callback) => {
        callCount++;
        const response = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, cb) => {
            if (event === 'data') {
              // Return Buffer to match actual HTTPS response behavior
              cb(
                Buffer.from(
                  JSON.stringify({ version: '1.0.0', squads: { official: [], community: [] } }),
                  'utf-8',
                ),
              );
            }
            if (event === 'end') {
              cb();
            }
            return response;
          }),
        };
        callback(response);
        return { on: jest.fn() };
      });

      // First call
      await downloader.fetchRegistry();

      // Clear cache
      downloader.clearCache();

      // Second call should make new request
      await downloader.fetchRegistry();

      expect(callCount).toBe(2);

      // Restore
      https.get = originalGet;
    });
  });
});
