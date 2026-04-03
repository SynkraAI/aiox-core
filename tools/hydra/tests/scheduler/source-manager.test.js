import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import yaml from 'js-yaml';
import { SourceManager, SOURCE_TYPES } from '../../src/scheduler/source-manager.js';

describe('SourceManager', () => {
  let tmpDir;
  let sourcesFile;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-sources-'));
    sourcesFile = path.join(tmpDir, 'sources.yaml');

    // Create a minimal sources file
    const config = {
      sources: {
        rss: [
          { name: 'Test Feed', url: 'https://example.com/feed', domains: ['ai-ml'], authority: 4 },
          { name: 'Another Feed', url: 'https://other.com/feed', domains: ['engenharia'], authority: 3 },
        ],
        github: [
          { name: 'Test Repo', type: 'releases', repo: 'owner/repo', domains: ['engenharia'], authority: 5 },
        ],
      },
    };
    fs.writeFileSync(sourcesFile, yaml.dump(config), 'utf-8');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('list returns all sources', () => {
    const sm = new SourceManager({ sourcesFile });
    const sources = sm.list();
    expect(sources.length).toBe(3);
  });

  test('list filters by type', () => {
    const sm = new SourceManager({ sourcesFile });
    const rss = sm.list({ type: 'rss' });
    expect(rss.length).toBe(2);
    expect(rss.every((s) => s.type === 'rss')).toBe(true);
  });

  test('list filters by domain', () => {
    const sm = new SourceManager({ sourcesFile });
    const aiml = sm.list({ domain: 'ai-ml' });
    expect(aiml.length).toBe(1);
    expect(aiml[0].name).toBe('Test Feed');
  });

  test('add creates a new source', () => {
    const sm = new SourceManager({ sourcesFile });
    const result = sm.add('rss', {
      name: 'New Feed',
      url: 'https://new.com/feed',
      domains: ['negocios'],
      authority: 3,
    });

    expect(result.success).toBe(true);
    expect(sm.list({ type: 'rss' }).length).toBe(3);
  });

  test('add rejects invalid type', () => {
    const sm = new SourceManager({ sourcesFile });
    const result = sm.add('invalid', { name: 'Test', url: 'http://test.com' });
    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid source type');
  });

  test('add rejects missing name', () => {
    const sm = new SourceManager({ sourcesFile });
    const result = sm.add('rss', { url: 'http://test.com' });
    expect(result.success).toBe(false);
  });

  test('add rejects duplicate name', () => {
    const sm = new SourceManager({ sourcesFile });
    const result = sm.add('rss', { name: 'Test Feed', url: 'http://dupe.com' });
    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists');
  });

  test('add github source uses repo field', () => {
    const sm = new SourceManager({ sourcesFile });
    sm.add('github', {
      name: 'New Repo',
      url: 'newowner/newrepo',
      githubType: 'trending',
    });

    const config = yaml.load(fs.readFileSync(sourcesFile, 'utf-8'));
    const newRepo = config.sources.github.find((s) => s.name === 'New Repo');
    expect(newRepo.repo).toBe('newowner/newrepo');
    expect(newRepo.url).toBeUndefined();
  });

  test('remove deletes source by name', () => {
    const sm = new SourceManager({ sourcesFile });
    const result = sm.remove('Test Feed');

    expect(result.success).toBe(true);
    expect(sm.list({ type: 'rss' }).length).toBe(1);
  });

  test('remove is case-insensitive', () => {
    const sm = new SourceManager({ sourcesFile });
    const result = sm.remove('test feed');
    expect(result.success).toBe(true);
  });

  test('remove returns error for unknown source', () => {
    const sm = new SourceManager({ sourcesFile });
    const result = sm.remove('Nonexistent');
    expect(result.success).toBe(false);
    expect(result.message).toContain('not found');
  });

  test('countByType returns counts', () => {
    const sm = new SourceManager({ sourcesFile });
    const counts = sm.countByType();
    expect(counts.rss).toBe(2);
    expect(counts.github).toBe(1);
    expect(counts.youtube).toBe(0);
  });

  test('totalCount returns sum', () => {
    const sm = new SourceManager({ sourcesFile });
    expect(sm.totalCount()).toBe(3);
  });

  test('SOURCE_TYPES contains all types', () => {
    expect(SOURCE_TYPES).toContain('rss');
    expect(SOURCE_TYPES).toContain('github');
    expect(SOURCE_TYPES).toContain('youtube');
    expect(SOURCE_TYPES).toContain('podcast');
    expect(SOURCE_TYPES).toContain('web');
    expect(SOURCE_TYPES).toContain('twitter');
    expect(SOURCE_TYPES).toContain('newsletter');
    expect(SOURCE_TYPES.length).toBe(7);
  });

  test('handles missing sources file gracefully', () => {
    const sm = new SourceManager({ sourcesFile: path.join(tmpDir, 'nonexistent.yaml') });
    const sources = sm.list();
    expect(sources).toEqual([]);
  });
});
