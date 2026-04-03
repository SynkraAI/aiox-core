import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { EntityGraph } from '../../src/distribution/entity-graph.js';

describe('entity-graph (Story 5.3)', () => {
  let tmpDir;
  let dbPath;
  let graph;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-entity-test-'));
    dbPath = path.join(tmpDir, 'test-hydra.db');
    graph = new EntityGraph(dbPath);
    graph.init();
  });

  afterEach(() => {
    if (graph) graph.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('init', () => {
    test('creates database file and tables', () => {
      expect(fs.existsSync(dbPath)).toBe(true);

      // Verify tables exist
      const tables = graph.db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table'"
      ).all().map(r => r.name);

      expect(tables).toContain('entities');
      expect(tables).toContain('entity_content');
      expect(tables).toContain('entity_relations');
    });

    test('idempotent: calling init twice does not error', () => {
      expect(() => graph.init()).not.toThrow();
    });
  });

  describe('registerEntities', () => {
    test('indexes entities and creates content links', () => {
      const result = graph.registerEntities('hydra-test1', ['React', 'Next.js', 'TypeScript'], 'engenharia');

      expect(result.indexed).toBe(3);
      expect(result.relations).toBe(3); // 3 entities = 3 pairs (3 choose 2)
    });

    test('handles empty entity list', () => {
      const result = graph.registerEntities('hydra-empty', [], 'ai-ml');
      expect(result.indexed).toBe(0);
      expect(result.relations).toBe(0);
    });

    test('deduplicates entities by normalized name', () => {
      const result = graph.registerEntities('hydra-dedup', ['React', 'react', 'REACT'], 'engenharia');
      expect(result.indexed).toBe(1);
    });

    test('increments mention_count for repeated entities', () => {
      graph.registerEntities('hydra-c1', ['React'], 'engenharia');
      graph.registerEntities('hydra-c2', ['React'], 'engenharia');

      const entity = graph.db.prepare("SELECT * FROM entities WHERE normalized_name = 'react'").get();
      expect(entity.mention_count).toBe(2);
    });

    test('creates co-occurrence relationships between entities', () => {
      graph.registerEntities('hydra-co1', ['React', 'Next.js'], 'engenharia');

      const relations = graph.db.prepare('SELECT * FROM entity_relations').all();
      expect(relations.length).toBe(1);
      expect(relations[0].relation_type).toBe('co-occurs');
    });

    test('strengthens relations on repeated co-occurrence', () => {
      graph.registerEntities('hydra-co1', ['React', 'Next.js'], 'engenharia');
      graph.registerEntities('hydra-co2', ['React', 'Next.js'], 'engenharia');

      const relations = graph.db.prepare('SELECT * FROM entity_relations').all();
      expect(relations.length).toBe(1);
      expect(relations[0].co_occurrence_count).toBe(2);
    });

    test('classifies entity types', () => {
      graph.registerEntities('hydra-types', ['React', 'Google', 'John Smith', 'sustainability'], 'test');

      const react = graph.db.prepare("SELECT type FROM entities WHERE normalized_name = 'react'").get();
      const google = graph.db.prepare("SELECT type FROM entities WHERE normalized_name = 'google'").get();

      expect(react.type).toBe('technology');
      expect(google.type).toBe('company');
    });
  });

  describe('findRelated', () => {
    test('finds content and related entities', () => {
      graph.registerEntities('hydra-fr1', ['React', 'Next.js', 'TypeScript'], 'engenharia');
      graph.registerEntities('hydra-fr2', ['React', 'Vue.js'], 'engenharia');

      const result = graph.findRelated('React');

      expect(result.entity).not.toBeNull();
      expect(result.entity.name).toBe('React');
      expect(result.contentIds).toContain('hydra-fr1');
      expect(result.contentIds).toContain('hydra-fr2');
      expect(result.relatedEntities.length).toBeGreaterThan(0);
    });

    test('returns null entity for unknown name', () => {
      const result = graph.findRelated('NonExistent');
      expect(result.entity).toBeNull();
      expect(result.contentIds).toEqual([]);
      expect(result.relatedEntities).toEqual([]);
    });

    test('is case insensitive', () => {
      graph.registerEntities('hydra-ci1', ['React'], 'engenharia');
      const result = graph.findRelated('REACT');
      expect(result.entity).not.toBeNull();
    });

    test('respects limit', () => {
      for (let i = 0; i < 30; i++) {
        graph.registerEntities(`hydra-lim-${i}`, ['React'], 'engenharia');
      }
      const result = graph.findRelated('React', { limit: 5 });
      expect(result.contentIds.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getStats', () => {
    test('returns correct statistics', () => {
      graph.registerEntities('hydra-s1', ['React', 'Next.js'], 'engenharia');
      graph.registerEntities('hydra-s2', ['React', 'TypeScript'], 'engenharia');

      const stats = graph.getStats();
      expect(stats.totalEntities).toBe(3);
      expect(stats.totalLinks).toBe(4); // 2 + 2
      expect(stats.totalRelations).toBeGreaterThan(0);
      expect(stats.topEntities.length).toBeGreaterThan(0);
      expect(stats.topEntities[0].name).toBe('React'); // Most mentioned
    });
  });

  describe('close', () => {
    test('closes database connection', () => {
      graph.close();
      expect(graph.db).toBeNull();
    });

    test('double close does not error', () => {
      graph.close();
      expect(() => graph.close()).not.toThrow();
    });
  });
});
