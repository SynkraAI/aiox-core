/**
 * Unit tests for Layer Classifier (Story BM-5)
 *
 * Tests classifyLayer() pure function with all layer classifications.
 */
const path = require('path');
const { classifyLayer, LAYER_RULES } = require(
  path.resolve(__dirname, '../../.aios-core/core/ids/layer-classifier')
);

describe('classifyLayer', () => {
  // --- L1: Framework Core ---
  describe('L1 — Framework Core', () => {
    test('classifies .aios-core/core/ modules as L1', () => {
      expect(classifyLayer('.aios-core/core/ids/index.js')).toBe('L1');
    });

    test('classifies .aios-core/core/ nested modules as L1', () => {
      expect(classifyLayer('.aios-core/core/ids/registry-updater.js')).toBe('L1');
      expect(classifyLayer('.aios-core/core/utils/helpers.js')).toBe('L1');
    });

    test('classifies bin/ executables as L1', () => {
      expect(classifyLayer('bin/aios.js')).toBe('L1');
      expect(classifyLayer('bin/aios-init.js')).toBe('L1');
    });

    test('classifies constitution.md as L1', () => {
      expect(classifyLayer('.aios-core/constitution.md')).toBe('L1');
    });
  });

  // --- L2: Framework Templates ---
  describe('L2 — Framework Templates', () => {
    test('classifies .aios-core/development/ as L2', () => {
      expect(classifyLayer('.aios-core/development/tasks/create-next-story.md')).toBe('L2');
    });

    test('classifies .aios-core/development/agents/ (non-MEMORY) as L2', () => {
      expect(classifyLayer('.aios-core/development/agents/dev.md')).toBe('L2');
    });

    test('classifies .aios-core/infrastructure/ as L2', () => {
      expect(classifyLayer('.aios-core/infrastructure/scripts/deploy.sh')).toBe('L2');
    });

    test('classifies .aios-core/product/ as L2', () => {
      expect(classifyLayer('.aios-core/product/templates/story-tmpl.yaml')).toBe('L2');
    });
  });

  // --- L3: Project Config ---
  describe('L3 — Project Config', () => {
    test('classifies .aios-core/data/ as L3', () => {
      expect(classifyLayer('.aios-core/data/entity-registry.yaml')).toBe('L3');
    });

    test('classifies MEMORY.md inside agents as L3 (not L2)', () => {
      expect(classifyLayer('.aios-core/development/agents/dev/MEMORY.md')).toBe('L3');
      expect(classifyLayer('.aios-core/development/agents/qa/MEMORY.md')).toBe('L3');
    });

    test('classifies .claude/ config files as L3', () => {
      expect(classifyLayer('.claude/CLAUDE.md')).toBe('L3');
      expect(classifyLayer('.claude/settings.json')).toBe('L3');
    });

    test('classifies root config files as L3', () => {
      expect(classifyLayer('core-config.yaml')).toBe('L3');
      expect(classifyLayer('project-config.yaml')).toBe('L3');
    });

    test('classifies *-config.yaml at root as L3', () => {
      expect(classifyLayer('custom-config.yaml')).toBe('L3');
    });
  });

  // --- L4: Project Runtime (fallback) ---
  describe('L4 — Project Runtime (fallback)', () => {
    test('classifies docs/ as L4', () => {
      expect(classifyLayer('docs/stories/story-1.md')).toBe('L4');
    });

    test('classifies tests/ as L4', () => {
      expect(classifyLayer('tests/ids/layer-classifier.test.js')).toBe('L4');
    });

    test('classifies packages/ as L4', () => {
      expect(classifyLayer('packages/db/index.ts')).toBe('L4');
    });

    test('classifies unknown paths as L4 (fallback)', () => {
      expect(classifyLayer('unknown/path/file.js')).toBe('L4');
    });

    test('classifies squads/ as L4', () => {
      expect(classifyLayer('squads/design/config.yaml')).toBe('L4');
    });
  });

  // --- Edge cases ---
  describe('Edge cases', () => {
    test('normalizes backslashes to forward slashes', () => {
      expect(classifyLayer('.aios-core\\core\\ids\\index.js')).toBe('L1');
    });

    test('strips leading ./ prefix', () => {
      expect(classifyLayer('./.aios-core/core/ids/index.js')).toBe('L1');
    });

    test('strips leading / prefix', () => {
      expect(classifyLayer('/bin/aios.js')).toBe('L1');
    });

    test('MEMORY.md at root classifies as L3', () => {
      expect(classifyLayer('MEMORY.md')).toBe('L3');
    });

    test('non-MEMORY agent file inside agents/ classifies as L2', () => {
      expect(classifyLayer('.aios-core/development/agents/dev/skills.yaml')).toBe('L2');
    });

    test('nested config.yaml inside subdirectory is NOT L3', () => {
      expect(classifyLayer('some/dir/app-config.yaml')).toBe('L4');
    });
  });

  // --- Defensive input validation (C1) ---
  describe('Defensive input validation', () => {
    test('returns L4 for null input', () => {
      expect(classifyLayer(null)).toBe('L4');
    });

    test('returns L4 for undefined input', () => {
      expect(classifyLayer(undefined)).toBe('L4');
    });

    test('returns L4 for numeric input', () => {
      expect(classifyLayer(123)).toBe('L4');
    });

    test('returns L4 for empty string', () => {
      expect(classifyLayer('')).toBe('L4');
    });
  });

  // --- LAYER_RULES export ---
  describe('LAYER_RULES', () => {
    test('LAYER_RULES is exported as an array', () => {
      expect(Array.isArray(LAYER_RULES)).toBe(true);
    });

    test('LAYER_RULES has at least 10 rules', () => {
      expect(LAYER_RULES.length).toBeGreaterThanOrEqual(10);
    });

    test('each rule has layer and test properties', () => {
      for (const rule of LAYER_RULES) {
        expect(rule).toHaveProperty('layer');
        expect(rule).toHaveProperty('test');
        expect(typeof rule.test).toBe('function');
      }
    });
  });
});
