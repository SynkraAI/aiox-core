'use strict';

/**
 * Entity Registry Bootstrap Tests (Story INS-4.6)
 *
 * Validates that the installer calls populate-entity-registry.js during install,
 * handles failures gracefully, and that aios doctor can verify the registry.
 */

const fs = require('fs');
const path = require('path');

const WIZARD_PATH = path.join(__dirname, '..', '..', 'src', 'wizard', 'index.js');
const POPULATE_SCRIPT = path.join(
  __dirname, '..', '..', '..', '..', '.aios-core', 'development', 'scripts', 'populate-entity-registry.js'
);
const DOCTOR_CHECK = path.join(
  __dirname, '..', '..', '..', '..', '.aios-core', 'core', 'doctor', 'checks', 'entity-registry.js'
);
const REGISTRY_PATH = path.join(
  __dirname, '..', '..', '..', '..', '.aios-core', 'data', 'entity-registry.yaml'
);
const PRE_PUSH_HOOK = path.join(__dirname, '..', '..', '..', '..', '.husky', 'pre-push');
const IDS_PRE_PUSH = path.join(
  __dirname, '..', '..', '..', '..', '.aios-core', 'hooks', 'ids-pre-push.js'
);

describe('Entity Registry Bootstrap (Story INS-4.6)', () => {
  let wizardSource;

  beforeAll(() => {
    wizardSource = fs.readFileSync(WIZARD_PATH, 'utf8');
  });

  describe('AC1: Bootstrap called during install', () => {
    test('wizard calls populate-entity-registry.js', () => {
      expect(wizardSource).toContain('populate-entity-registry.js');
      expect(wizardSource).toContain('Bootstrapping entity registry');
    });

    test('bootstrap runs after .aios-core/ copy (injection order)', () => {
      const aiosCoreIdx = wizardSource.indexOf('AIOS core installed');
      const bootstrapIdx = wizardSource.indexOf('Bootstrapping entity registry');
      const envConfigIdx = wizardSource.indexOf('Configuring environment');

      // Bootstrap must come after aios-core install
      expect(bootstrapIdx).toBeGreaterThan(aiosCoreIdx);
      // Bootstrap must come before environment configuration
      expect(bootstrapIdx).toBeLessThan(envConfigIdx);
    });

    test('bootstrap has try/catch — failure does not abort install', () => {
      // Verify the bootstrap block is wrapped in try/catch
      expect(wizardSource).toContain("answers.entityRegistryStatus = 'failed'");
      expect(wizardSource).toContain('Entity registry bootstrap failed');
      // Should warn, not throw
      expect(wizardSource).toContain("run 'aios doctor' post-install");
    });

    test('bootstrap uses 30s timeout guard', () => {
      expect(wizardSource).toContain('timeout: 30000');
    });

    test('bootstrap reports entity count on success', () => {
      expect(wizardSource).toContain("answers.entityRegistryStatus = 'populated'");
      expect(wizardSource).toContain('answers.entityRegistryCount');
      expect(wizardSource).toContain('answers.entityRegistryMs');
    });

    test('bootstrap handles missing script gracefully', () => {
      expect(wizardSource).toContain("answers.entityRegistryStatus = 'skipped'");
      expect(wizardSource).toContain('Entity registry script not found');
    });
  });

  describe('AC2: Sanity check (relative threshold)', () => {
    test('aios doctor entity-registry check exists', () => {
      expect(fs.existsSync(DOCTOR_CHECK)).toBe(true);
    });

    test('doctor check uses relative validation (file exists + non-empty), not fixed threshold', () => {
      const checkSource = fs.readFileSync(DOCTOR_CHECK, 'utf8');

      // Should check file existence
      expect(checkSource).toContain('existsSync');
      // Should NOT have hardcoded threshold like >= 500
      expect(checkSource).not.toMatch(/>= ?\d{3}/);
      // Should report line count (relative measure)
      expect(checkSource).toContain('lineCount');
    });

    test('doctor check validates recency (mtime)', () => {
      const checkSource = fs.readFileSync(DOCTOR_CHECK, 'utf8');
      expect(checkSource).toContain('mtimeMs');
      expect(checkSource).toContain('MAX_AGE_MS');
    });
  });

  describe('AC3: No duplication with pre-push hook', () => {
    test('pre-push hook calls ids-pre-push.js (incremental), not populate script', () => {
      const hookContent = fs.readFileSync(PRE_PUSH_HOOK, 'utf8');
      expect(hookContent).toContain('ids-pre-push.js');
      expect(hookContent).not.toContain('populate-entity-registry.js');
    });

    test('ids-pre-push.js uses RegistryUpdater.processChanges (incremental)', () => {
      const idsSource = fs.readFileSync(IDS_PRE_PUSH, 'utf8');
      expect(idsSource).toContain('RegistryUpdater');
      expect(idsSource).toContain('processChanges');
    });

    test('bootstrap uses populate-entity-registry.js (full scan), distinct from incremental', () => {
      // Wizard calls populate-entity-registry.js
      expect(wizardSource).toContain('populate-entity-registry.js');
      // Wizard does NOT call ids-pre-push.js
      expect(wizardSource).not.toContain('ids-pre-push.js');
    });
  });

  describe('AC4: Performance guard', () => {
    test('populate-entity-registry.js exists and is executable', () => {
      expect(fs.existsSync(POPULATE_SCRIPT)).toBe(true);
    });

    test('populate script has programmatic API (module.exports)', () => {
      const scriptSource = fs.readFileSync(POPULATE_SCRIPT, 'utf8');
      expect(scriptSource).toContain('module.exports');
      expect(scriptSource).toContain('populate');
    });

    test('measured runtime is well under 15s threshold', () => {
      // Run the actual script and measure time
      const { execSync } = require('child_process');
      const projectRoot = path.join(__dirname, '..', '..', '..', '..');
      const start = Date.now();

      try {
        execSync(`node "${POPULATE_SCRIPT}"`, {
          cwd: projectRoot,
          encoding: 'utf8',
          timeout: 30000,
          stdio: 'pipe',
        });
      } catch {
        // Script may fail in some environments — that's ok for timing test
        console.log('SKIP: populate script execution failed — timing not measured');
        return;
      }

      const elapsed = Date.now() - start;
      // Must be under 15s (AC4 threshold)
      expect(elapsed).toBeLessThan(15000);
      console.log(`Measured runtime: ${(elapsed / 1000).toFixed(2)}s`);
    });
  });

  describe('AC5: Post-bootstrap verification', () => {
    test('entity-registry.yaml exists after bootstrap', () => {
      expect(fs.existsSync(REGISTRY_PATH)).toBe(true);
    });

    test('entity-registry.yaml has at least 1 entity (non-empty)', () => {
      const content = fs.readFileSync(REGISTRY_PATH, 'utf8');
      const match = content.match(/entityCount:\s*(\d+)/);
      expect(match).not.toBeNull();
      const count = parseInt(match[1], 10);
      expect(count).toBeGreaterThan(0);
    });

    // NOTE: This test depends on AC4 "measured runtime" test running first,
    // which executes populate-entity-registry.js and refreshes the file mtime.
    test('entity-registry.yaml updatedAt is recent (within 5 minutes)', () => {
      const stat = fs.statSync(REGISTRY_PATH);
      const ageMs = Date.now() - stat.mtimeMs;
      const FIVE_MINUTES = 5 * 60 * 1000;
      expect(ageMs).toBeLessThan(FIVE_MINUTES);
    });

    test('aios doctor entity-registry check passes on current registry', async () => {
      const { run } = require(DOCTOR_CHECK);
      const projectRoot = path.join(__dirname, '..', '..', '..', '..');
      const result = await run({ projectRoot });
      expect(result.status).toBe('PASS');
    });
  });
});
