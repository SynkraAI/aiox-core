/**
 * @module feed-reader
 * @description HYDRA Knowledge-Feed Reader (Story 1.12 — Resilience Sprint).
 *
 * Single read path from `${MEGA_BRAIN_ROOT}/knowledge-feed/{cloneId}/` into the
 * consultation prompt. Inverse of `feed-writer.js`; sits in the same directory so
 * the `FeedEntry` shape stays under one diff scope (ADR-004 Decision 1; shared types
 * live in `feed-types.js` per S-06).
 *
 * No SQLite, no cache, no index — every consultation re-reads the relevant feed
 * files. Bounded by ≤30 files per clone × ≤200KB per file → ≤50ms typical.
 *
 * See:
 *  - ADR-004 (`docs/projects/hydra-content-intel/resilience-sprint/03-architecture/adrs/ADR-004-consumption-side.md`)
 *  - architecture §10A
 *  - PRD §5 Story 1.12 (acceptance criteria 1, 3-5, 8)
 */

import fs from 'node:fs';
import path from 'node:path';
import { defaultLogger as logger } from '../logging/logger.js';

/* eslint-disable no-unused-vars */
/**
 * @typedef {import('./feed-types.js').FeedEntry} FeedEntry
 * @typedef {import('./feed-types.js').FeedLoadOptions} FeedLoadOptions
 * @typedef {import('./feed-types.js').FeedLoadResult} FeedLoadResult
 */
/* eslint-enable no-unused-vars */

function resolveDefaultFeedRoot() {
  if (process.env.HYDRA_FEED_ROOT) return process.env.HYDRA_FEED_ROOT;
  if (process.env.MEGA_BRAIN_ROOT) return path.join(process.env.MEGA_BRAIN_ROOT, 'knowledge-feed');
  return 'D:/jarvis/mega brain/knowledge-feed';
}

const FEED_FILE_REGEX = /^(\d{4})-(\d{2})-(\d{2})-hydra-feed\.md$/;

// ADR-004 Decision 6 — quarantine date.
const QUARANTINE_BEFORE = '2026-05-12T00:00:00Z';

// Default policy values (ADR-004 Decisions 2 & 3).
const DEFAULT_DAYS = 30;
const DEFAULT_MAX_TOKENS = 30000;
const DEFAULT_MIN_TIER = 'A';
const B_TIER_MAX_AGE_DAYS = 7;

const TIER_RANK = { S: 3, A: 2, B: 1 };

/**
 * Cheap token-count heuristic. No tiktoken dependency.
 * @param {string} text
 * @returns {number}
 */
function estimateTokens(text) {
  if (!text) return 0;
  // Rough: 1 token ≈ 0.75 words. text.split words × 1.3 ≈ tokens.
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil(words * 1.3);
}

/**
 * Parse YAML frontmatter (between leading `---` markers) into a flat object.
 * Tiny inline parser — feeds use a stable, small frontmatter shape.
 * @param {string} content
 * @returns {{frontmatter: Record<string, string>, body: string}}
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  const fm = {};
  for (const line of match[1].split('\n')) {
    const eq = line.indexOf(':');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    fm[key] = val;
  }
  return { frontmatter: fm, body: match[2] };
}

/**
 * Parse the body of a feed file into FeedEntry-ish items (cloneId/date/generatedAt
 * are filled in by the caller from frontmatter).
 *
 * Per `feed-writer.generateItemSection`, each item looks like:
 *
 *   ## N. {title} (Tier: X, Score: Y)
 *
 *   **Source:** [{url}]({url}) | **Author:** {author}
 *   **Relevance:** 0.42 | **Matched:** "a", "b"
 *   **Content ID:** hydra-deadbeef
 *
 *   ### Key Insights
 *   - ...
 *
 *   ---
 *
 * @param {string} body
 * @returns {Array<{
 *   title: string,
 *   url: string,
 *   tier: 'S'|'A'|'B',
 *   relevance: number,
 *   matched: string[],
 *   contentId: string,
 *   insights: string,
 *   sourceName: string,
 * }>}
 */
function parseFeedBody(body) {
  // Split on `## N. ` ATX heading. The first split chunk is preamble (intro/title), discard.
  const chunks = body.split(/\n(?=##\s+\d+\.\s)/);
  const items = [];
  for (const chunk of chunks) {
    const headerMatch = chunk.match(/^##\s+\d+\.\s+(.+?)\s*\(Tier:\s*([SAB])\s*,\s*Score:\s*([0-9.]+)\)/);
    if (!headerMatch) continue;
    const title = headerMatch[1].trim();
    const tier = /** @type {'S'|'A'|'B'} */ (headerMatch[2]);

    const sourceMatch = chunk.match(/\*\*Source:\*\*\s*\[(.*?)\]\((.*?)\)(?:\s*\|\s*\*\*Author:\*\*\s*([^\n]+))?/);
    const url = sourceMatch ? sourceMatch[2] : '';
    const sourceName = sourceMatch && sourceMatch[3] ? sourceMatch[3].trim() : '';

    const relMatch = chunk.match(/\*\*Relevance:\*\*\s*([0-9.]+)/);
    const relevance = relMatch ? parseFloat(relMatch[1]) : 0;

    const matchMatch = chunk.match(/\*\*Matched:\*\*\s*([^\n]+)/);
    const matched = matchMatch
      ? matchMatch[1]
        .split(',')
        .map((s) => s.replace(/"/g, '').trim())
        .filter((s) => s && s !== 'none')
      : [];

    const idMatch = chunk.match(/\*\*Content ID:\*\*\s*(hydra-[a-f0-9]+)/);
    const contentId = idMatch ? idMatch[1] : '';

    // Insights: everything between `### Key Insights\n` and the next `### ` or `---` or end.
    let insights = '';
    const insMatch = chunk.match(/###\s+Key Insights\n([\s\S]*?)(?=\n###\s|\n---\s*$|$)/);
    if (insMatch) insights = insMatch[1].trim();

    items.push({ title, url, tier, relevance, matched, contentId, insights, sourceName });
  }
  return items;
}

/**
 * Test whether a tier passes the minimum given a B-tier recency rule.
 * @param {'S'|'A'|'B'} entryTier
 * @param {'S'|'A'|'B'} minTier
 * @param {Date} fileDate - file generation date
 * @param {Date} now
 * @returns {boolean}
 */
function tierAllowed(entryTier, minTier, fileDate, now) {
  if (TIER_RANK[entryTier] >= TIER_RANK[minTier]) {
    if (entryTier === 'B') {
      const ageDays = (now.getTime() - fileDate.getTime()) / (1000 * 60 * 60 * 24);
      return ageDays <= B_TIER_MAX_AGE_DAYS;
    }
    return true;
  }
  return false;
}

/**
 * Load knowledge-feed entries for a clone.
 *
 * @param {string} cloneId
 * @param {FeedLoadOptions} [options]
 * @returns {Promise<FeedLoadResult>}
 */
export async function loadCloneFeeds(cloneId, options = {}) {
  const {
    days = DEFAULT_DAYS,
    maxTokens = DEFAULT_MAX_TOKENS,
    minTier = DEFAULT_MIN_TIER,
    feedRoot = resolveDefaultFeedRoot(),
  } = options;

  const result = {
    entries: [],
    isEmpty: true,
    totalTokens: 0,
    truncatedCount: 0,
    oldestDate: null,
    newestDate: null,
  };

  const cloneDir = path.join(feedRoot, cloneId);
  if (!fs.existsSync(cloneDir)) {
    logger.debug({ cloneId, cloneDir }, 'feed-reader: clone directory missing');
    return result;
  }

  const now = new Date();
  const cutoffMs = now.getTime() - days * 24 * 60 * 60 * 1000;
  const quarantineMs = new Date(QUARANTINE_BEFORE).getTime();

  let files;
  try {
    files = fs.readdirSync(cloneDir);
  } catch (err) {
    logger.warn({ cloneId, err: err.message }, 'feed-reader: readdir failed');
    return result;
  }

  // Stage 1: read & filter & parse.
  /** @type {FeedEntry[]} */
  const candidates = [];
  for (const fname of files) {
    const match = fname.match(FEED_FILE_REGEX);
    if (!match) {
      // RA-9 mitigation: log and skip non-conformant filenames.
      logger.warn({ cloneId, file: fname }, 'feed-reader: skipping non-matching filename');
      continue;
    }
    const filePath = path.join(cloneDir, fname);
    let raw;
    try {
      raw = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      logger.warn({ cloneId, file: fname, err: err.message }, 'feed-reader: read failed');
      continue;
    }

    const { frontmatter, body } = parseFrontmatter(raw);
    // ADR-004 RA-9 — date comes from frontmatter, not filename.
    const fmDate = frontmatter.date || `${match[1]}-${match[2]}-${match[3]}`;
    const fileDate = new Date(`${fmDate}T00:00:00Z`);
    if (Number.isNaN(fileDate.getTime())) {
      logger.warn({ cloneId, file: fname, fmDate }, 'feed-reader: invalid date');
      continue;
    }
    if (fileDate.getTime() < cutoffMs) continue;

    const generatedAt = frontmatter.generated_at || fileDate.toISOString();
    const generatedMs = new Date(generatedAt).getTime();
    const quarantined = Number.isFinite(generatedMs) && generatedMs < quarantineMs;

    const items = parseFeedBody(body);
    for (const item of items) {
      if (!tierAllowed(item.tier, /** @type {'S'|'A'|'B'} */ (minTier), fileDate, now)) continue;
      candidates.push({
        cloneId,
        date: fmDate,
        title: item.title,
        url: item.url,
        tier: item.tier,
        matched: item.matched,
        relevance: item.relevance,
        contentId: item.contentId,
        insights: item.insights,
        sourceName: item.sourceName,
        generatedAt,
        quarantined,
      });
    }
  }

  // Newest first; secondary by tier rank desc.
  candidates.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return TIER_RANK[b.tier] - TIER_RANK[a.tier];
  });

  // Stage 2: token-budget enforcement. Drop oldest first if we overflow.
  const accepted = [];
  let totalTokens = 0;
  for (const entry of candidates) {
    const cost = estimateTokens(`${entry.title}\n${entry.url}\n${entry.insights}`);
    if (totalTokens + cost > maxTokens) {
      // truncate older — we sorted newest-first, so once budget hits we stop.
      result.truncatedCount = candidates.length - accepted.length;
      break;
    }
    accepted.push(entry);
    totalTokens += cost;
  }

  result.entries = accepted;
  result.isEmpty = accepted.length === 0;
  result.totalTokens = totalTokens;
  if (accepted.length > 0) {
    result.newestDate = accepted[0].date;
    result.oldestDate = accepted[accepted.length - 1].date;
  }
  return result;
}

/**
 * Render the "Recent Knowledge" section for injection into the consultation prompt.
 * Returns the staleness-warning block when entries are empty (ADR-004 Decision 4).
 *
 * @param {FeedEntry[]} entries
 * @returns {string}
 */
export function renderFeedSection(entries) {
  if (!entries || entries.length === 0) {
    return [
      '## Recent Knowledge (HYDRA feed)',
      '⚠️ No recent feed entries found for this expert in the last 30 days.',
      'Answer from your frozen knowledge only — do NOT fabricate recent sources,',
      'URLs, publication dates, statistics, or events that you cannot verify from',
      'training data. If the question requires recent information you don\'t have,',
      'say so explicitly.',
      '',
    ].join('\n');
  }

  const lines = ['## Recent Knowledge (from HYDRA feed, last 30 days)', ''];
  for (const e of entries) {
    lines.push(`### [${e.date}] [Tier ${e.tier}] ${e.title}`);
    lines.push(`**Source:** ${e.url}`);
    if (e.insights) lines.push(`**Key Insights:** ${e.insights}`);
    if (e.quarantined) {
      lines.push('⚠️ Pre-2026-05-12 entry — verify independently before citing.');
    }
    lines.push('---');
  }
  lines.push('');
  lines.push('When you cite information from the Recent Knowledge section, cite the URL inline.');
  lines.push('');
  return lines.join('\n');
}

/**
 * Aggregate feed coverage across all clones in `feedRoot`.
 * Used by `hydra feed coverage`. Read-only; no side effects.
 *
 * @param {Object} [options]
 * @param {string} [options.feedRoot]
 * @returns {Promise<Array<{
 *   cloneId: string,
 *   latestDate: string|null,
 *   totalEntries: number,
 *   hasStale: boolean,
 *   isEmpty: boolean,
 * }>>}
 */
export async function collectCoverage(options = {}) {
  const feedRoot = options.feedRoot || resolveDefaultFeedRoot();
  if (!fs.existsSync(feedRoot)) return [];
  const clones = fs.readdirSync(feedRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const out = [];
  const now = Date.now();
  for (const cloneId of clones) {
    const r = await loadCloneFeeds(cloneId, { days: 365, maxTokens: 10_000_000, minTier: 'B' });
    const latest = r.newestDate;
    const latestMs = latest ? new Date(`${latest}T00:00:00Z`).getTime() : 0;
    const ageDays = latest ? (now - latestMs) / (1000 * 60 * 60 * 24) : Infinity;
    out.push({
      cloneId,
      latestDate: latest,
      totalEntries: r.entries.length,
      hasStale: ageDays > 30,
      isEmpty: r.entries.length === 0,
    });
  }
  return out;
}

// Test-only exports (not part of public API).
export const __test = { estimateTokens, parseFrontmatter, parseFeedBody, tierAllowed };
