/**
 * L5 Squad Processor Tests
 *
 * Tests for squad discovery, namespace prefixing, cache TTL,
 * merge rules, active squad prioritization, graceful degradation,
 * and missing directory handling.
 *
 * @story SYN-5 - Layer Processors L4-L7
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const LayerProcessor = require('../../.aiox-core/core/synapse/layers/layer-processor');
const L5SquadProcessor = require('../../.aiox-core/core/synapse/layers/l5-squad');

jest.setTimeout(30000);

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-l5-test-'));
}

function cleanupTempDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Helper to create a squad structure with .synapse/manifest and domain files.
 */
function createSquad(projectRoot, squadName, manifestContent, domainFiles = {}) {
  const squadDir = path.join(projectRoot, 'squads', squadName, '.synapse');
  fs.mkdirSync(squadDir, { recursive: true });
  fs.writeFileSync(path.join(squadDir, 'manifest'), manifestContent);
  for (const [fileName, content] of Object.entries(domainFiles)) {
    fs.writeFileSync(path.join(squadDir, fileName), content);
  }
}

describe('L5SquadProcessor', () => {
  let tempDir;
  let processor;
  let synapsePath;

  beforeEach(() => {
    tempDir = createTempDir();
    synapsePath = path.join(tempDir, '.synapse');
    fs.mkdirSync(synapsePath, { recursive: true });
    processor = new L5SquadProcessor();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('constructor', () => {
    test('should extend LayerProcessor', () => {
      expect(processor).toBeInstanceOf(LayerProcessor);
    });

    test('should set name to squad', () => {
      expect(processor.name).toBe('squad');
    });

    test('should set layer to 5', () => {
      expect(processor.layer).toBe(5);
    });

    test('should set timeout to 20ms', () => {
      expect(processor.timeout).toBe(20);
    });
  });

  describe('process()', () => {
    test('should discover squad domains and return rules', () => {
      createSquad(tempDir, 'copy-chief', [
        'HEADLINES_STATE=active',
        'HEADLINES_RECALL=headline,title',
      ].join('\n'), {
        'headlines': 'HEADLINES_RULE_1=Write compelling headlines\nHEADLINES_RULE_2=Use power words',
      });

      const context = {
        prompt: '',
        session: {},
        config: {
          synapsePath,
          manifest: { domains: {} },
        },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.rules.length).toBeGreaterThan(0);
      expect(result.metadata.layer).toBe(5);
      expect(result.metadata.squadsFound).toBe(1);
      expect(result.metadata.domainsLoaded.length).toBeGreaterThan(0);
    });

    test('should namespace domain keys with squad name uppercase', () => {
      createSquad(tempDir, 'my-squad', [
        'RULES_STATE=active',
      ].join('\n'), {
        'rules': 'Rule one\nRule two',
      });

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.metadata.domainsLoaded).toEqual(
        expect.arrayContaining([expect.stringContaining('MY-SQUAD_')]),
      );
    });

    test('should return null when squads/ directory is missing', () => {
      // tempDir has no squads/ directory
      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when squads/ exists but no squad has .synapse/', () => {
      fs.mkdirSync(path.join(tempDir, 'squads', 'empty-squad'), { recursive: true });

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should return null when squad manifest has no domains', () => {
      const squadDir = path.join(tempDir, 'squads', 'bare-squad', '.synapse');
      fs.mkdirSync(squadDir, { recursive: true });
      fs.writeFileSync(path.join(squadDir, 'manifest'), 'DEVMODE=true\n');

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should discover multiple squads', () => {
      createSquad(tempDir, 'squad-alpha', 'ALPHA_STATE=active\n', {
        'alpha': 'Alpha rule 1',
      });
      createSquad(tempDir, 'squad-beta', 'BETA_STATE=active\n', {
        'beta': 'Beta rule 1',
      });

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      expect(result.metadata.squadsFound).toBe(2);
    });

    test('should prioritize active squad domains', () => {
      createSquad(tempDir, 'active-squad', 'ACTIVE_STATE=active\n', {
        'active': 'Active squad rule',
      });
      createSquad(tempDir, 'passive-squad', 'PASSIVE_STATE=active\n', {
        'passive': 'Passive squad rule',
      });

      const context = {
        prompt: '',
        session: {
          active_squad: { name: 'active-squad', path: 'squads/active-squad' },
        },
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      const result = processor.process(context);

      expect(result).not.toBeNull();
      // Active squad rules should come first
      expect(result.rules[0]).toBe('Active squad rule');
    });

    test('should return null when squads have manifests but domain files are empty', () => {
      const squadDir = path.join(tempDir, 'squads', 'empty-domains-squad', '.synapse');
      fs.mkdirSync(squadDir, { recursive: true });
      fs.writeFileSync(path.join(squadDir, 'manifest'), 'EMPTY_STATE=active\n');
      // Domain file exists but is empty
      fs.writeFileSync(path.join(squadDir, 'empty'), '');

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should skip squad when merge mode is none', () => {
      const squadDir = path.join(tempDir, 'squads', 'opt-out', '.synapse');
      fs.mkdirSync(squadDir, { recursive: true });
      fs.writeFileSync(path.join(squadDir, 'rules'), 'Should not load');

      // Test _loadSquadDomains directly with manifest containing EXTENDS=none
      const manifest = {
        domains: {
          'OPT-OUT_EXTENDS': { file: 'none' },
          'RULES': { file: 'rules' },
        },
      };

      const allRules = [];
      const domainsLoaded = [];
      processor._loadSquadDomains('opt-out', manifest, path.join(tempDir, 'squads'), allRules, domainsLoaded);

      expect(allRules).toHaveLength(0);
      expect(domainsLoaded).toHaveLength(0);
    });

    test('should handle _scanSquads error when squads dir is unreadable', () => {
      // Pass a file path instead of directory to trigger readdirSync error
      const fakeSquadsDir = path.join(tempDir, 'not-a-dir');
      fs.writeFileSync(fakeSquadsDir, 'I am a file');

      const result = processor._scanSquads(fakeSquadsDir);
      expect(result).toEqual({});
    });
  });

  describe('cache', () => {
    test('should create cache file after first scan', () => {
      createSquad(tempDir, 'cached-squad', 'DATA_STATE=active\n', {
        'data': 'Cached rule',
      });

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      processor.process(context);

      const cachePath = path.join(synapsePath, 'cache', 'squad-manifests.json');
      expect(fs.existsSync(cachePath)).toBe(true);

      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      expect(cached.timestamp).toBeDefined();
      expect(cached.manifests).toBeDefined();
    });

    test('should use cache when fresh (within TTL)', () => {
      createSquad(tempDir, 'ttl-squad', 'TTL_STATE=active\n', {
        'ttl': 'TTL rule',
      });

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      // First call: scan + cache
      processor.process(context);

      // Add a new squad after cache is written
      createSquad(tempDir, 'new-squad', 'NEW_STATE=active\n', {
        'new': 'New rule',
      });

      // Second call: should use cache (new squad NOT discovered)
      const result = processor.process(context);
      expect(result).not.toBeNull();
      // Should only find 1 squad (from cache), not 2
      expect(result.metadata.squadsFound).toBe(1);
    });

    test('should rescan when cache is stale', () => {
      createSquad(tempDir, 'stale-squad', 'STALE_STATE=active\n', {
        'stale': 'Stale rule',
      });

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      // First call: scan + cache
      processor.process(context);

      // Make cache stale by setting timestamp in the past
      const cachePath = path.join(synapsePath, 'cache', 'squad-manifests.json');
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      cached.timestamp = Date.now() - 120000; // 2 minutes ago
      fs.writeFileSync(cachePath, JSON.stringify(cached));

      // Remove squad to verify rescan happens
      fs.rmSync(path.join(tempDir, 'squads'), { recursive: true, force: true });
      fs.mkdirSync(path.join(tempDir, 'squads'), { recursive: true });

      // Should rescan and find nothing
      const result = processor.process(context);
      expect(result).toBeNull();
    });

    test('should handle corrupt cache gracefully', () => {
      createSquad(tempDir, 'corrupt-squad', 'CORRUPT_STATE=active\n', {
        'corrupt': 'Corrupt cache rule',
      });

      // Write corrupt cache
      const cacheDir = path.join(synapsePath, 'cache');
      fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(path.join(cacheDir, 'squad-manifests.json'), 'NOT JSON!!!');

      const context = {
        prompt: '',
        session: {},
        config: { synapsePath, manifest: { domains: {} } },
        previousLayers: [],
      };

      // Should fallback to full scan
      const result = processor.process(context);
      expect(result).not.toBeNull();
      expect(result.rules).toContain('Corrupt cache rule');
    });
  });
});
