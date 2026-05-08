/**
 * Testes unitários para merge-utils
 *
 * Cobre deepMerge, mergeAll e isPlainObject conforme ADR-PRO-002.
 *
 * @see .aiox-core/core/config/merge-utils.js
 * @issue #52
 */

'use strict';

const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

const { deepMerge, mergeAll, isPlainObject } = require(path.join(
  PROJECT_ROOT,
  '.aiox-core',
  'core',
  'config',
  'merge-utils',
));

// ============================================================================
// isPlainObject
// ============================================================================

describe('isPlainObject', () => {
  it('deve retornar true para objetos literais', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
  });

  it('deve retornar true para Object.create(null)', () => {
    expect(isPlainObject(Object.create(null))).toBe(true);
  });

  it('deve retornar false para arrays', () => {
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject([1, 2])).toBe(false);
  });

  it('deve retornar false para null e undefined', () => {
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
  });

  it('deve retornar false para primitivos', () => {
    expect(isPlainObject(42)).toBe(false);
    expect(isPlainObject('string')).toBe(false);
    expect(isPlainObject(true)).toBe(false);
  });

  it('deve retornar false para Date e RegExp', () => {
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(/regex/)).toBe(false);
  });
});

// ============================================================================
// deepMerge
// ============================================================================

describe('deepMerge', () => {
  it('deve fazer last-wins para escalares', () => {
    const result = deepMerge({ a: 1 }, { a: 2 });
    expect(result.a).toBe(2);
  });

  it('deve preservar chaves do target ausentes no source', () => {
    const result = deepMerge({ a: 1, b: 2 }, { a: 10 });
    expect(result).toEqual({ a: 10, b: 2 });
  });

  it('deve adicionar chaves novas do source', () => {
    const result = deepMerge({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('deve fazer deep merge de objetos aninhados', () => {
    const target = { db: { host: 'localhost', port: 5432 } };
    const source = { db: { port: 3306, name: 'mydb' } };
    const result = deepMerge(target, source);

    expect(result.db).toEqual({ host: 'localhost', port: 3306, name: 'mydb' });
  });

  it('deve substituir arrays (não concatenar) por padrão', () => {
    const target = { tags: ['a', 'b'] };
    const source = { tags: ['c'] };
    const result = deepMerge(target, source);

    expect(result.tags).toEqual(['c']);
  });

  it('deve concatenar arrays com +append', () => {
    const target = { plugins: ['core', 'auth'] };
    const source = { 'plugins+append': ['analytics'] };
    const result = deepMerge(target, source);

    expect(result.plugins).toEqual(['core', 'auth', 'analytics']);
  });

  it('deve criar array quando +append mas target não tem o campo', () => {
    const target = {};
    const source = { 'items+append': [1, 2] };
    const result = deepMerge(target, source);

    expect(result.items).toEqual([1, 2]);
  });

  it('deve deletar chave quando value é null', () => {
    const target = { a: 1, b: 2, c: 3 };
    const source = { b: null };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, c: 3 });
    expect('b' in result).toBe(false);
  });

  it('não deve mutar os inputs', () => {
    const target = { a: { x: 1 } };
    const source = { a: { y: 2 } };
    const targetCopy = JSON.parse(JSON.stringify(target));
    const sourceCopy = JSON.parse(JSON.stringify(source));

    deepMerge(target, source);

    expect(target).toEqual(targetCopy);
    expect(source).toEqual(sourceCopy);
  });

  it('deve retornar source quando target não é objeto', () => {
    expect(deepMerge('string', { a: 1 })).toEqual({ a: 1 });
    expect(deepMerge(null, { a: 1 })).toEqual({ a: 1 });
  });

  it('deve retornar target quando source é undefined', () => {
    expect(deepMerge({ a: 1 }, undefined)).toEqual({ a: 1 });
  });

  it('deve fazer merge profundo em 3+ níveis', () => {
    const target = { l1: { l2: { l3: { a: 1, b: 2 } } } };
    const source = { l1: { l2: { l3: { b: 20, c: 30 } } } };
    const result = deepMerge(target, source);

    expect(result.l1.l2.l3).toEqual({ a: 1, b: 20, c: 30 });
  });
});

// ============================================================================
// mergeAll
// ============================================================================

describe('mergeAll', () => {
  it('deve fazer merge de múltiplas camadas em ordem', () => {
    const base = { a: 1, b: 2 };
    const override = { b: 20, c: 30 };
    const final = { c: 300 };
    const result = mergeAll(base, override, final);

    expect(result).toEqual({ a: 1, b: 20, c: 300 });
  });

  it('deve ignorar camadas null/undefined', () => {
    const result = mergeAll({ a: 1 }, null, undefined, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('deve retornar objeto vazio quando sem argumentos', () => {
    expect(mergeAll()).toEqual({});
  });

  it('deve retornar cópia quando apenas uma camada', () => {
    const layer = { a: 1 };
    const result = mergeAll(layer);

    expect(result).toEqual({ a: 1 });
    expect(result).not.toBe(layer); // Deve ser cópia
  });
});
