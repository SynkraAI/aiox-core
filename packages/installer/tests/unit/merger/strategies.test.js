/**
 * @fileoverview Tests for Merge Strategy Factory
 * Story 9.1: Smart Merge Foundation
 */

const {
  getMergeStrategy,
  hasMergeStrategy,
  getSupportedTypes,
  registerStrategy,
  registerFileNameStrategy,
} = require('../../../src/merger/strategies/index.js');
const { EnvMerger } = require('../../../src/merger/strategies/env-merger.js');
const { MarkdownMerger } = require('../../../src/merger/strategies/markdown-merger.js');
const { ReplaceMerger } = require('../../../src/merger/strategies/replace-merger.js');

describe('getMergeStrategy', () => {
  it('should return EnvMerger for .env files', () => {
    const merger = getMergeStrategy('.env');
    expect(merger).toBeInstanceOf(EnvMerger);
  });

  it('should return EnvMerger for .env.local files', () => {
    const merger = getMergeStrategy('.env.local');
    expect(merger).toBeInstanceOf(EnvMerger);
  });

  it('should return EnvMerger for .env.example files', () => {
    const merger = getMergeStrategy('.env.example');
    expect(merger).toBeInstanceOf(EnvMerger);
  });

  it('should return MarkdownMerger for .md files', () => {
    const merger = getMergeStrategy('CLAUDE.md');
    expect(merger).toBeInstanceOf(MarkdownMerger);
  });

  it('should return MarkdownMerger for README.md', () => {
    const merger = getMergeStrategy('README.md');
    expect(merger).toBeInstanceOf(MarkdownMerger);
  });

  it('should return ReplaceMerger for unknown file types', () => {
    const merger = getMergeStrategy('config.toml');
    expect(merger).toBeInstanceOf(ReplaceMerger);
  });

  it('should return ReplaceMerger for .json files', () => {
    const merger = getMergeStrategy('package.json');
    expect(merger).toBeInstanceOf(ReplaceMerger);
  });

  it('should handle full paths', () => {
    const merger = getMergeStrategy('/path/to/project/.env');
    expect(merger).toBeInstanceOf(EnvMerger);
  });

  it('should handle paths with directories', () => {
    const merger = getMergeStrategy('/path/to/.claude/CLAUDE.md');
    expect(merger).toBeInstanceOf(MarkdownMerger);
  });
});

describe('hasMergeStrategy', () => {
  it('should return true for .env files', () => {
    expect(hasMergeStrategy('.env')).toBe(true);
  });

  it('should return true for .md files', () => {
    expect(hasMergeStrategy('CLAUDE.md')).toBe(true);
  });

  it('should return false for unsupported files', () => {
    expect(hasMergeStrategy('config.toml')).toBe(false);
  });

  it('should return false for .json files', () => {
    expect(hasMergeStrategy('package.json')).toBe(false);
  });

  it('should be case-insensitive for extensions', () => {
    expect(hasMergeStrategy('README.MD')).toBe(true);
  });
});

describe('getSupportedTypes', () => {
  it('should return extensions and filenames', () => {
    const types = getSupportedTypes();

    expect(types).toHaveProperty('extensions');
    expect(types).toHaveProperty('filenames');
    expect(Array.isArray(types.extensions)).toBe(true);
    expect(Array.isArray(types.filenames)).toBe(true);
  });

  it('should include .md in extensions', () => {
    const types = getSupportedTypes();
    expect(types.extensions).toContain('.md');
  });

  it('should include .env in filenames', () => {
    const types = getSupportedTypes();
    expect(types.filenames).toContain('.env');
  });
});

describe('registerStrategy', () => {
  it('should allow registering custom strategies for extensions', () => {
    class CustomMerger extends ReplaceMerger {
      name = 'custom';
    }

    registerStrategy('.custom', CustomMerger);

    const merger = getMergeStrategy('file.custom');
    expect(merger.name).toBe('custom');
  });
});

describe('registerFileNameStrategy', () => {
  it('should allow registering strategies for specific filenames', () => {
    class SpecialMerger extends ReplaceMerger {
      name = 'special';
    }

    registerFileNameStrategy('.special-config', SpecialMerger);

    const merger = getMergeStrategy('.special-config');
    expect(merger.name).toBe('special');
  });
});

describe('ReplaceMerger', () => {
  let merger;

  beforeEach(() => {
    merger = new ReplaceMerger();
  });

  it('should return new content as-is', async () => {
    const existing = 'old content';
    const newContent = 'new content';

    const result = await merger.merge(existing, newContent);

    expect(result.content).toBe('new content');
    expect(result.stats.updated).toBe(1);
  });

  it('should report canMerge as false', () => {
    expect(merger.canMerge('', '')).toBe(false);
  });
});
