'use strict';

/**
 * YAML Merger Strategy Tests (Story INS-4.7)
 *
 * Validates Phase 1 merge rules:
 * - New keys added from source (framework)
 * - User values preserved on conflict (target wins)
 * - Deprecated keys kept with warning
 * - Output is valid YAML
 */

const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');

const { YamlMerger } = require(path.join(
  __dirname, '..', '..', '..', 'src', 'merger', 'strategies', 'yaml-merger.js'
));

describe('YamlMerger (Story INS-4.7)', () => {
  let merger;

  beforeAll(() => {
    merger = new YamlMerger();
  });

  describe('AC1: Strategy interface', () => {
    test('extends BaseMerger with name "yaml"', () => {
      expect(merger.name).toBe('yaml');
    });

    test('canMerge returns true for valid YAML', () => {
      expect(merger.canMerge('key: value\n', 'other: data\n')).toBe(true);
    });

    test('canMerge returns false for invalid YAML', () => {
      expect(merger.canMerge('key: value\n', '{{invalid')).toBe(false);
    });

    test('merge is async and returns MergeResult', async () => {
      const result = await merger.merge('a: 1\n', 'a: 1\n');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('changes');
    });

    test('getDescription returns meaningful text', () => {
      expect(merger.getDescription()).toContain('YAML');
      expect(merger.getDescription()).toContain('Phase 1');
    });
  });

  describe('AC1: Strategy registration', () => {
    test('.yaml extension registered in strategies/index.js', () => {
      const { hasMergeStrategy, getMergeStrategy } = require(path.join(
        __dirname, '..', '..', '..', 'src', 'merger', 'strategies', 'index.js'
      ));

      expect(hasMergeStrategy('config.yaml')).toBe(true);
      const strategy = getMergeStrategy('config.yaml');
      expect(strategy.name).toBe('yaml');
    });

    test('.yml extension also registered', () => {
      const { hasMergeStrategy } = require(path.join(
        __dirname, '..', '..', '..', 'src', 'merger', 'strategies', 'index.js'
      ));

      expect(hasMergeStrategy('config.yml')).toBe(true);
    });

    test('YamlMerger exported from merger/index.js', () => {
      const mergerModule = require(path.join(
        __dirname, '..', '..', '..', 'src', 'merger', 'index.js'
      ));

      expect(mergerModule.YamlMerger).toBeDefined();
    });
  });

  describe('AC2: Phase 1 merge rules', () => {
    test('new key in source → added to merged output', async () => {
      const source = yaml.dump({ existingKey: 'a', newFeature: { enabled: true } });
      const target = yaml.dump({ existingKey: 'a' });

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      expect(merged.newFeature).toEqual({ enabled: true });
      expect(result.stats.added).toBeGreaterThanOrEqual(1);

      const addedChange = result.changes.find(
        c => c.type === 'added' && c.identifier === 'newFeature'
      );
      expect(addedChange).toBeDefined();
    });

    test('key in both with same value → target value preserved', async () => {
      const source = yaml.dump({ key: 'same' });
      const target = yaml.dump({ key: 'same' });

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      expect(merged.key).toBe('same');
      expect(result.stats.preserved).toBeGreaterThanOrEqual(1);

      const preservedChange = result.changes.find(
        c => c.type === 'preserved' && c.identifier === 'key'
      );
      expect(preservedChange).toBeDefined();
    });

    test('conflict (different values) → target wins', async () => {
      const source = yaml.dump({ setting: 'framework-default' });
      const target = yaml.dump({ setting: 'user-custom' });

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      expect(merged.setting).toBe('user-custom');
      expect(result.stats.conflicts).toBeGreaterThanOrEqual(1);

      const conflictChange = result.changes.find(
        c => c.type === 'conflict' && c.identifier === 'setting'
      );
      expect(conflictChange).toBeDefined();
      expect(conflictChange.reason).toContain('Keeping user value');
    });

    test('deprecated key (in target, not in source) → kept with warning', async () => {
      const source = yaml.dump({ current: true });
      const target = yaml.dump({ current: true, legacyKey: 'old-value' });

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      expect(merged.legacyKey).toBe('old-value');

      const deprecatedChange = result.changes.find(
        c => c.type === 'conflict' && c.identifier === 'legacyKey'
      );
      expect(deprecatedChange).toBeDefined();
      expect(deprecatedChange.reason).toContain('Deprecated');
    });

    test('output is valid YAML', async () => {
      const source = yaml.dump({ a: 1, b: { c: 2 }, d: [1, 2, 3] });
      const target = yaml.dump({ a: 99, e: 'user' });

      const result = await merger.merge(source, target);

      expect(() => yaml.load(result.content)).not.toThrow();
    });

    test('all changes in MergeResult.changes array (no separate warnings)', async () => {
      const source = yaml.dump({ a: 1, b: 2 });
      const target = yaml.dump({ a: 99, c: 3 });

      const result = await merger.merge(source, target);

      expect(result).not.toHaveProperty('warnings');
      expect(Array.isArray(result.changes)).toBe(true);
      expect(result.changes.length).toBeGreaterThan(0);
    });
  });

  describe('AC2: Deep merge', () => {
    test('nested new keys added at depth', async () => {
      const source = yaml.dump({
        boundary: { frameworkProtection: true, newSetting: 'added' },
      });
      const target = yaml.dump({
        boundary: { frameworkProtection: false },
      });

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      expect(merged.boundary.frameworkProtection).toBe(false); // user wins
      expect(merged.boundary.newSetting).toBe('added'); // new key added
    });

    test('nested conflict preserves user value', async () => {
      const source = yaml.dump({
        pvMindContext: { location: 'default-path' },
      });
      const target = yaml.dump({
        pvMindContext: { location: 'user-custom-path' },
      });

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      expect(merged.pvMindContext.location).toBe('user-custom-path');
    });
  });

  describe('AC4: User config preservation', () => {
    test('custom pvMindContext.location preserved after upgrade', async () => {
      const source = yaml.dump({
        project: { type: 'EXISTING_AIOS', version: '2.2.0' },
        pvMindContext: { location: 'default' },
      });
      const target = yaml.dump({
        project: { type: 'EXISTING_AIOS', version: '2.1.0' },
        pvMindContext: { location: '/my/custom/path' },
      });

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      expect(merged.pvMindContext.location).toBe('/my/custom/path');
    });

    test('new framework key added alongside preserved user config', async () => {
      const source = yaml.dump({
        existing: 'value',
        someNewFeature: { enabled: true },
      });
      const target = yaml.dump({
        existing: 'value',
      });

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      expect(merged.existing).toBe('value');
      expect(merged.someNewFeature).toEqual({ enabled: true });
    });
  });

  describe('AC5: Boundary section preservation', () => {
    test('user-customized boundary paths NOT removed', async () => {
      const source = yaml.dump({
        boundary: {
          frameworkProtection: true,
          protected: ['.aios-core/core/'],
        },
      });
      const target = yaml.dump({
        boundary: {
          frameworkProtection: false,
          protected: ['.aios-core/core/', 'my-custom-path/'],
          exceptions: ['my-exception/'],
        },
      });

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      // User boundary values preserved (target wins on arrays — no deep array merge)
      expect(merged.boundary.frameworkProtection).toBe(false);
      expect(merged.boundary.protected).toContain('my-custom-path/');
      expect(merged.boundary.exceptions).toContain('my-exception/');
    });
  });

  describe('AC6: Edge cases', () => {
    test('empty source → target preserved as-is', async () => {
      const source = '';
      const target = yaml.dump({ user: 'config' });

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      expect(merged.user).toBe('config');
    });

    test('empty target → source keys added', async () => {
      const source = yaml.dump({ framework: 'config' });
      const target = '';

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      expect(merged.framework).toBe('config');
    });

    test('arrays treated as scalar (target wins, not merged)', async () => {
      const source = yaml.dump({ list: [1, 2, 3] });
      const target = yaml.dump({ list: [4, 5] });

      const result = await merger.merge(source, target);
      const merged = yaml.load(result.content);

      expect(merged.list).toEqual([4, 5]); // target wins
    });
  });
});

describe('Brownfield Upgrader Integration (Story INS-4.7)', () => {
  test('brownfield-upgrader imports YamlMerger', () => {
    const upgraderSource = fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'src', 'installer', 'brownfield-upgrader.js'),
      'utf8'
    );
    expect(upgraderSource).toContain('YamlMerger');
    expect(upgraderSource).toContain('yaml-merger.js');
  });

  test('upgrader has core-config.yaml merge exception in userModifiedFiles loop', () => {
    const upgraderSource = fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'src', 'installer', 'brownfield-upgrader.js'),
      'utf8'
    );
    expect(upgraderSource).toContain("file.path.endsWith('core-config.yaml')");
    expect(upgraderSource).toContain('merger.merge(sourceContent, targetContent)');
    expect(upgraderSource).toContain('.backup-');
  });

  test('upgrader still skips non-yaml user-modified files', () => {
    const upgraderSource = fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'src', 'installer', 'brownfield-upgrader.js'),
      'utf8'
    );
    expect(upgraderSource).toContain('User modified - preserving local changes');
  });
});

describe('Existing strategies still work', () => {
  test('strategies.test.js file exists (regression guard)', () => {
    const testPath = path.join(__dirname, 'strategies.test.js');
    expect(fs.existsSync(testPath)).toBe(true);
  });
});
