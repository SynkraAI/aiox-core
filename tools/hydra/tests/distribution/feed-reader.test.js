/**
 * Tests for feed-reader.js (Story 1.12).
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadCloneFeeds, renderFeedSection, __test } from '../../src/distribution/feed-reader.js';

const FRESH_DATE = new Date().toISOString().slice(0, 10); // YYYY-MM-DD today
const STALE_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 60);
  return d.toISOString().slice(0, 10);
})();
const RECENT_B_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 3); // 3 days ago — B tier should pass (<7d).
  return d.toISOString().slice(0, 10);
})();
const OLD_B_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 15); // 15 days ago — B tier should NOT pass.
  return d.toISOString().slice(0, 10);
})();

function buildFeedFile(dateStr, items, generatedAt = null) {
  const fm = [
    '---',
    'hydra_feed: true',
    `clone_id: "test-clone"`,
    `date: ${dateStr}`,
    `items_count: ${items.length}`,
    'domains: ["test"]',
    'relevance_avg: 0.5',
    `generated_at: "${generatedAt || new Date().toISOString()}"`,
    '---',
    '',
    `# Knowledge Feed -- ${dateStr}`,
    '',
  ].join('\n');
  const body = items.map((it, i) => [
    `## ${i + 1}. ${it.title} (Tier: ${it.tier}, Score: ${it.score || 1})`,
    '',
    `**Source:** [${it.url}](${it.url}) | **Author:** ${it.author || 'TestAuthor'}`,
    `**Relevance:** ${it.relevance || 0.5} | **Matched:** "kw1", "kw2"`,
    `**Content ID:** ${it.contentId || `hydra-${String(i).padStart(16, '0')}`}`,
    '',
    '### Key Insights',
    `- Insight for ${it.title}`,
    '',
    '---',
    '',
  ].join('\n')).join('\n');
  return fm + body;
}

describe('feed-reader (Story 1.12)', () => {
  let tmpRoot;
  let cloneDir;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-feed-read-'));
    cloneDir = path.join(tmpRoot, 'test-clone');
    fs.mkdirSync(cloneDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  test('empty dir returns isEmpty=true', async () => {
    const r = await loadCloneFeeds('test-clone', { feedRoot: tmpRoot });
    expect(r.isEmpty).toBe(true);
    expect(r.entries).toEqual([]);
    expect(r.oldestDate).toBeNull();
  });

  test('parses frontmatter + items correctly', async () => {
    const file = buildFeedFile(FRESH_DATE, [
      { title: 'Item One', url: 'https://a.test/1', tier: 'S', relevance: 0.9 },
      { title: 'Item Two', url: 'https://a.test/2', tier: 'A', relevance: 0.6 },
    ], `${FRESH_DATE}T12:00:00Z`);
    fs.writeFileSync(path.join(cloneDir, `${FRESH_DATE}-hydra-feed.md`), file);

    const r = await loadCloneFeeds('test-clone', { feedRoot: tmpRoot, days: 30, minTier: 'A' });
    expect(r.isEmpty).toBe(false);
    expect(r.entries).toHaveLength(2);
    const titles = r.entries.map((e) => e.title);
    expect(titles).toContain('Item One');
    expect(titles).toContain('Item Two');
    const one = r.entries.find((e) => e.title === 'Item One');
    expect(one.tier).toBe('S');
    expect(one.url).toBe('https://a.test/1');
    expect(one.contentId).toMatch(/^hydra-/);
  });

  test('token budget truncates oldest first', async () => {
    // Write 5 separate-day files, each with ~lots of tokens, to exceed budget.
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const big = 'x '.repeat(2000);
      const items = [{
        title: `${big} day${i}`,
        url: `https://a.test/${i}`,
        tier: 'S',
        relevance: 0.9,
      }];
      fs.writeFileSync(
        path.join(cloneDir, `${ds}-hydra-feed.md`),
        buildFeedFile(ds, items, `${ds}T12:00:00Z`),
      );
    }
    const r = await loadCloneFeeds('test-clone', { feedRoot: tmpRoot, maxTokens: 5000, minTier: 'S' });
    expect(r.entries.length).toBeLessThan(5);
    expect(r.truncatedCount).toBeGreaterThan(0);
    expect(r.totalTokens).toBeLessThanOrEqual(5000);
  });

  test('tier filter — B tier excluded if file older than 7 days', async () => {
    // Old B file (15 days old): should be excluded with minTier=B.
    const oldB = buildFeedFile(OLD_B_DATE, [
      { title: 'Old B', url: 'https://a.test/oldb', tier: 'B', relevance: 0.3 },
    ], `${OLD_B_DATE}T12:00:00Z`);
    fs.writeFileSync(path.join(cloneDir, `${OLD_B_DATE}-hydra-feed.md`), oldB);

    // Recent B file (3 days old): should be included with minTier=B.
    const newB = buildFeedFile(RECENT_B_DATE, [
      { title: 'New B', url: 'https://a.test/newb', tier: 'B', relevance: 0.3 },
    ], `${RECENT_B_DATE}T12:00:00Z`);
    fs.writeFileSync(path.join(cloneDir, `${RECENT_B_DATE}-hydra-feed.md`), newB);

    const r = await loadCloneFeeds('test-clone', { feedRoot: tmpRoot, days: 30, minTier: 'B' });
    const titles = r.entries.map((e) => e.title);
    expect(titles).toContain('New B');
    expect(titles).not.toContain('Old B');
  });

  test('date filter — entries older than `days` are excluded', async () => {
    const fresh = buildFeedFile(FRESH_DATE, [
      { title: 'Fresh', url: 'https://a.test/fresh', tier: 'S', relevance: 0.9 },
    ], `${FRESH_DATE}T12:00:00Z`);
    fs.writeFileSync(path.join(cloneDir, `${FRESH_DATE}-hydra-feed.md`), fresh);
    const stale = buildFeedFile(STALE_DATE, [
      { title: 'Stale', url: 'https://a.test/stale', tier: 'S', relevance: 0.9 },
    ], `${STALE_DATE}T12:00:00Z`);
    fs.writeFileSync(path.join(cloneDir, `${STALE_DATE}-hydra-feed.md`), stale);

    const r = await loadCloneFeeds('test-clone', { feedRoot: tmpRoot, days: 30, minTier: 'A' });
    const titles = r.entries.map((e) => e.title);
    expect(titles).toContain('Fresh');
    expect(titles).not.toContain('Stale');
  });

  test('invalid filename is skipped (RA-9 mitigation)', async () => {
    const fresh = buildFeedFile(FRESH_DATE, [
      { title: 'Real', url: 'https://a.test/x', tier: 'S', relevance: 0.9 },
    ], `${FRESH_DATE}T12:00:00Z`);
    fs.writeFileSync(path.join(cloneDir, `${FRESH_DATE}-hydra-feed.md`), fresh);
    // Garbage filename — must be skipped without throwing.
    fs.writeFileSync(path.join(cloneDir, `garbage-name.md`), 'noise');

    const r = await loadCloneFeeds('test-clone', { feedRoot: tmpRoot, days: 30, minTier: 'A' });
    expect(r.entries).toHaveLength(1);
    expect(r.entries[0].title).toBe('Real');
  });

  test('quarantine flag set for entries before 2026-05-12', async () => {
    // Build a fresh-dated file (so passes date filter) but with pre-fix generated_at.
    const fresh = buildFeedFile(FRESH_DATE, [
      { title: 'Pre-fix entry', url: 'https://a.test/q', tier: 'S', relevance: 0.9 },
    ], '2026-05-08T22:00:00Z'); // BEFORE 2026-05-12.
    fs.writeFileSync(path.join(cloneDir, `${FRESH_DATE}-hydra-feed.md`), fresh);

    const r = await loadCloneFeeds('test-clone', { feedRoot: tmpRoot, days: 30, minTier: 'A' });
    expect(r.entries[0].quarantined).toBe(true);

    // Post-fix generated_at: NOT quarantined.
    const fresh2 = buildFeedFile(FRESH_DATE, [
      { title: 'Post-fix', url: 'https://a.test/p', tier: 'S', relevance: 0.9 },
    ], '2026-05-15T10:00:00Z'); // AFTER 2026-05-12.
    fs.writeFileSync(path.join(cloneDir, `${FRESH_DATE}-hydra-feed.md`), fresh2);
    const r2 = await loadCloneFeeds('test-clone', { feedRoot: tmpRoot, days: 30, minTier: 'A' });
    expect(r2.entries[0].quarantined).toBe(false);
  });

  test('renderFeedSection — staleness warning when entries empty', () => {
    const out = renderFeedSection([]);
    expect(out).toContain('⚠️');
    expect(out).toContain('No recent feed entries');
    expect(out).toMatch(/do NOT fabricate/i);
  });

  test('renderFeedSection — entries render with URL, title, tier, insights', () => {
    const out = renderFeedSection([{
      cloneId: 'test', date: '2026-05-12', title: 'Sample', url: 'https://x.test/1',
      tier: 'S', matched: [], relevance: 0.9, contentId: 'hydra-aaa',
      insights: '- key point', sourceName: 'PubMed', generatedAt: '2026-05-12T00:00:00Z',
      quarantined: false,
    }]);
    expect(out).toContain('[2026-05-12]');
    expect(out).toContain('[Tier S]');
    expect(out).toContain('Sample');
    expect(out).toContain('https://x.test/1');
    expect(out).toContain('key point');
    expect(out).toContain('cite the URL inline');
  });

  test('renderFeedSection — per-entry warning when quarantined', () => {
    const out = renderFeedSection([{
      cloneId: 'test', date: '2026-05-08', title: 'Q', url: 'https://x.test/q',
      tier: 'S', matched: [], relevance: 0.9, contentId: 'hydra-bbb',
      insights: '', sourceName: '', generatedAt: '2026-05-08T00:00:00Z',
      quarantined: true,
    }]);
    expect(out).toContain('Pre-2026-05-12 entry');
  });

  test('estimateTokens approximates word count × 1.3', () => {
    expect(__test.estimateTokens('one two three four')).toBe(Math.ceil(4 * 1.3));
    expect(__test.estimateTokens('')).toBe(0);
  });
});
