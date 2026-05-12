/**
 * Unit tests for merge-utils.js
 * Story PRO-4 — Config Hierarchy
 */

const { deepMerge, mergeAll, isPlainObject } = require('../../.aiox-core/core/config/merge-utils');

describe('merge-utils', () => {
  describe('isPlainObject', () => {
    test('returns true for plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
      expect(isPlainObject(Object.create(null))).toBe(true);
    });

    test('returns false for non-plain objects', () => {
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject(undefined)).toBe(false);
      expect(isPlainObject(42)).toBe(false);
      expect(isPlainObject('string')).toBe(false);
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject(true)).toBe(false);
    });
  });

  describe('deepMerge — scalars (last-wins)', () => {
    test('source string overrides target string', () => {
      expect(deepMerge({ a: 'old' }, { a: 'new' })).toEqual({ a: 'new' });
    });

    test('source number overrides target number', () => {
      expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
    });

    test('source boolean overrides target boolean', () => {
      expect(deepMerge({ a: true }, { a: false })).toEqual({ a: false });
    });

    test('adds new keys from source', () => {
      expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
    });
  });

  describe('deepMerge — objects (deep merge)', () => {
    test('merges nested objects recursively', () => {
      const target = { a: { x: 1, y: 2 } };
      const source = { a: { y: 3, z: 4 } };
      expect(deepMerge(target, source)).toEqual({ a: { x: 1, y: 3, z: 4 } });
    });

    test('deep merges multiple nesting levels', () => {
      const target = { a: { b: { c: 1 } } };
      const source = { a: { b: { d: 2 } } };
      expect(deepMerge(target, source)).toEqual({ a: { b: { c: 1, d: 2 } } });
    });

    test('does not mutate input objects', () => {
      const target = { a: { x: 1 } };
      const source = { a: { y: 2 } };
      const targetCopy = JSON.parse(JSON.stringify(target));

      deepMerge(target, source);

      expect(target).toEqual(targetCopy);
    });
  });

  describe('deepMerge — arrays (replace)', () => {
    test('source array replaces target array', () => {
      const target = { items: [1, 2, 3] };
      const source = { items: [4, 5] };
      expect(deepMerge(target, source)).toEqual({ items: [4, 5] });
    });

    test('source array replaces target non-array', () => {
      expect(deepMerge({ a: 'str' }, { a: [1] })).toEqual({ a: [1] });
    });
  });

  describe('deepMerge — +append modifier', () => {
    test('appends to existing array', () => {
      const target = { tags: ['a', 'b'] };
      const source = { 'tags+append': ['c', 'd'] };
      expect(deepMerge(target, source)).toEqual({ tags: ['a', 'b', 'c', 'd'] });
    });

    test('creates array when base key does not exist', () => {
      const source = { 'newlist+append': ['x'] };
      expect(deepMerge({}, source)).toEqual({ newlist: ['x'] });
    });

    test('does not add +append as literal key', () => {
      const result = deepMerge({}, { 'items+append': [1] });
      expect(result).not.toHaveProperty('items+append');
      expect(result).toHaveProperty('items');
    });

    test('ignores +append with non-array value', () => {
      const result = deepMerge({ items: [1] }, { 'items+append': 'not-array' });
      expect(result.items).toEqual([1]);
    });
  });

  describe('deepMerge — null deletes key', () => {
    test('null value removes key from result', () => {
      const target = { a: 1, b: 2 };
      const source = { a: null };
      expect(deepMerge(target, source)).toEqual({ b: 2 });
    });

    test('null on nested key removes nested key', () => {
      const target = { a: { x: 1, y: 2 } };
      const source = { a: { x: null } };
      expect(deepMerge(target, source)).toEqual({ a: { y: 2 } });
    });

    test('null on non-existent key is harmless', () => {
      const target = { a: 1 };
      const source = { z: null };
      expect(deepMerge(target, source)).toEqual({ a: 1 });
    });
  });

  describe('deepMerge — edge cases', () => {
    test('source is non-object returns source', () => {
      expect(deepMerge({ a: 1 }, 'string')).toBe('string');
    });

    test('target is non-object returns source', () => {
      expect(deepMerge('string', { a: 1 })).toEqual({ a: 1 });
    });

    test('empty source returns copy of target', () => {
      expect(deepMerge({ a: 1 }, {})).toEqual({ a: 1 });
    });

    test('empty target returns copy of source', () => {
      expect(deepMerge({}, { a: 1 })).toEqual({ a: 1 });
    });
  });

  describe('mergeAll', () => {
    test('merges multiple layers in order', () => {
      const l1 = { a: 1, b: 2 };
      const l2 = { b: 3, c: 4 };
      const l3 = { c: 5, d: 6 };
      expect(mergeAll(l1, l2, l3)).toEqual({ a: 1, b: 3, c: 5, d: 6 });
    });

    test('skips null/undefined layers', () => {
      expect(mergeAll({ a: 1 }, null, undefined, { b: 2 })).toEqual({ a: 1, b: 2 });
    });

    test('returns empty object when no valid layers', () => {
      expect(mergeAll()).toEqual({});
      expect(mergeAll(null, undefined)).toEqual({});
    });

    test('preserves deep merge semantics across layers', () => {
      const l1 = { config: { timeout: 10, retries: 3 } };
      const l2 = { config: { timeout: 30 } };
      const l4 = { config: { debug: true } };
      expect(mergeAll(l1, l2, l4)).toEqual({
        config: { timeout: 30, retries: 3, debug: true },
      });
    });
  });
});
