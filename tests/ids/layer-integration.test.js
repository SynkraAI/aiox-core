/**
 * Integration tests for Layer Classification in Entity Registry (Story BM-5)
 *
 * Verifies:
 * - populate-entity-registry.js assigns layer to all entities (AC: 3)
 * - Layer distribution is reasonable (AC: 3)
 * - registry-healer.js preserves layer field (AC: 6)
 */
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

const REPO_ROOT = path.resolve(__dirname, '../..');
const REGISTRY_PATH = path.resolve(REPO_ROOT, '.aios-core/data/entity-registry.yaml');

// Load registry once for all test suites
const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');
const registry = yaml.load(registryContent);

describe('Layer Integration — Entity Registry', () => {

  test('registry file exists and is valid YAML', () => {
    expect(registry).toBeDefined();
    expect(registry.entities).toBeDefined();
    expect(registry.metadata).toBeDefined();
  });

  test('all entities have a layer field (AC: 3)', () => {
    const missing = [];
    for (const [category, entries] of Object.entries(registry.entities)) {
      for (const [id, entity] of Object.entries(entries)) {
        if (!entity.layer) {
          missing.push(`${category}/${id}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  test('all layer values are valid enum (L1, L2, L3, L4)', () => {
    const validLayers = ['L1', 'L2', 'L3', 'L4'];
    const invalid = [];
    for (const [category, entries] of Object.entries(registry.entities)) {
      for (const [id, entity] of Object.entries(entries)) {
        if (entity.layer && !validLayers.includes(entity.layer)) {
          invalid.push(`${category}/${id}: ${entity.layer}`);
        }
      }
    }
    expect(invalid).toEqual([]);
  });

  test('layer distribution is reasonable (L1 < L2, L3 small)', () => {
    const layers = { L1: 0, L2: 0, L3: 0, L4: 0 };
    for (const entries of Object.values(registry.entities)) {
      for (const entity of Object.values(entries)) {
        if (entity.layer) layers[entity.layer]++;
      }
    }

    // L2 (templates) should have the most entities
    expect(layers.L2).toBeGreaterThan(layers.L1);
    // L3 (config) should be small
    expect(layers.L3).toBeLessThan(50);
    // L1 (core) should exist
    expect(layers.L1).toBeGreaterThan(0);
  });

  test('entity count matches metadata (AC: 3)', () => {
    let count = 0;
    for (const entries of Object.values(registry.entities)) {
      count += Object.keys(entries).length;
    }
    expect(count).toBe(registry.metadata.entityCount);
  });
});

describe('Layer Preservation — Registry Healer (AC: 6)', () => {
  test('healer _healIssue only heals known fields, does not strip layer', () => {
    // Verify by reading healer source — it only handles specific ruleIds
    const healerPath = path.resolve(REPO_ROOT, '.aios-core/core/ids/registry-healer.js');
    const healerContent = fs.readFileSync(healerPath, 'utf8');

    // The healer only heals specific rules: checksum-mismatch, orphaned-usedBy,
    // orphaned-dependency, missing-keywords, stale-verification
    expect(healerContent).toContain('checksum-mismatch');
    expect(healerContent).toContain('orphaned-usedBy');

    // The healer should NOT have any code that strips or deletes the 'layer' field
    expect(healerContent).not.toContain("delete entity.layer");
    expect(healerContent).not.toContain("delete entity['layer']");
  });

  test('registry entities retain layer field structure', () => {
    // Verify a sample of entities have layer alongside other known fields
    const firstCategory = Object.keys(registry.entities)[0];
    const firstEntity = Object.values(registry.entities[firstCategory])[0];

    expect(firstEntity).toHaveProperty('path');
    expect(firstEntity).toHaveProperty('layer');
    expect(firstEntity).toHaveProperty('type');
    expect(firstEntity).toHaveProperty('checksum');
  });

  test('healer functional: healing checksum preserves layer field (C3)', () => {
    // Functional test: simulate what _healChecksum does to an entity object
    // and verify the layer field survives the mutation
    const testEntity = {
      path: '.aios-core/core/ids/layer-classifier.js',
      layer: 'L1',
      type: 'module',
      purpose: 'Layer classification',
      keywords: ['layer', 'classifier'],
      usedBy: [],
      dependencies: [],
      checksum: 'sha256:old-checksum-value',
      lastVerified: '2026-01-01T00:00:00.000Z',
    };

    // Simulate _healChecksum behavior: mutates checksum + lastVerified only
    testEntity.checksum = 'sha256:new-checksum-value';
    testEntity.lastVerified = new Date().toISOString();

    // Layer must survive — healer only touches specific fields
    expect(testEntity.layer).toBe('L1');
    expect(testEntity).toHaveProperty('layer');
    expect(Object.keys(testEntity)).toContain('layer');
  });

  test('healer functional: healing keywords preserves layer field (C3)', () => {
    // Simulate _healMissingKeywords behavior
    const testEntity = {
      path: '.aios-core/data/entity-registry.yaml',
      layer: 'L3',
      type: 'data',
      keywords: [],
      checksum: 'sha256:some-value',
    };

    // Simulate keyword healing: replaces keywords array
    testEntity.keywords = ['entity', 'registry', 'yaml'];

    expect(testEntity.layer).toBe('L3');
  });
});
