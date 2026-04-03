/**
 * @module feed-writer
 * @description Knowledge Feed Writer (Story 5.2) — Writes markdown knowledge feed
 * files for mind clones routed by the content router.
 *
 * Append-only: NEVER modifies mind clone agent .md files.
 * Aggregates multiple items per day into a single feed file per clone.
 * Idempotent: same content_id on same day won't duplicate.
 */

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_FEED_ROOT = process.env.HYDRA_FEED_ROOT || 'D:/jarvis/mega brain/knowledge-feed';

// Safety: these directories must NEVER be written to
const FORBIDDEN_PATHS = [
  'agents/minds',
  'development/agents',
  '.aios-core/development/agents',
];

/**
 * Validate that a path does not point to protected directories.
 * @param {string} targetPath
 * @throws {Error} If path is forbidden
 */
function validatePath(targetPath) {
  const normalized = targetPath.replace(/\\/g, '/').toLowerCase();
  for (const forbidden of FORBIDDEN_PATHS) {
    if (normalized.includes(forbidden.toLowerCase())) {
      throw new Error(`SECURITY: Attempted write to forbidden path: ${targetPath}`);
    }
  }
}

/**
 * Sanitize a string for use as a directory/file name.
 * @param {string} str
 * @returns {string}
 */
function sanitizeName(str) {
  return (str || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Get today's date as YYYY-MM-DD.
 * @returns {string}
 */
function getToday() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate frontmatter for a new feed file.
 * @param {string} cloneId
 * @param {string} date
 * @param {string[]} domains
 * @returns {string}
 */
function generateFrontmatter(cloneId, date, domains) {
  return `---
hydra_feed: true
clone_id: "${cloneId}"
date: ${date}
items_count: 0
domains: [${domains.map(d => `"${d}"`).join(', ')}]
relevance_avg: 0
generated_at: "${new Date().toISOString()}"
---

# Knowledge Feed -- ${date}

`;
}

/**
 * Generate a section for a single content item.
 * @param {number} index - Item number
 * @param {Object} item
 * @param {string} item.title
 * @param {string} item.url
 * @param {string} [item.author]
 * @param {string} item.tier
 * @param {number} item.score
 * @param {number} item.relevance
 * @param {string[]} [item.matchedKeywords]
 * @param {string[]} [item.insights]
 * @param {string[]} [item.quotes]
 * @param {string} item.contentId
 * @returns {string}
 */
function generateItemSection(index, item) {
  let section = `## ${index}. ${item.title} (Tier: ${item.tier}, Score: ${item.score})

**Source:** [${item.url}](${item.url})`;

  if (item.author) {
    section += ` | **Author:** ${item.author}`;
  }

  section += `
**Relevance:** ${item.relevance} | **Matched:** ${(item.matchedKeywords || []).map(k => `"${k}"`).join(', ') || 'none'}
**Content ID:** ${item.contentId}

`;

  if (item.insights && item.insights.length > 0) {
    section += `### Key Insights
${item.insights.map(i => `- ${typeof i === 'string' ? i : i.insight || i}`).join('\n')}

`;
  }

  if (item.quotes && item.quotes.length > 0) {
    section += `### Notable Quotes
${item.quotes.map(q => `> "${q}"`).join('\n\n')}

`;
  }

  section += `---

`;
  return section;
}

/**
 * Parse existing feed file to extract content IDs already present.
 * @param {string} filePath
 * @returns {{ content: string, contentIds: Set<string>, itemCount: number }}
 */
function parseFeedFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const contentIds = new Set();
  const idRegex = /\*\*Content ID:\*\* (hydra-[a-f0-9]+)/g;
  let match;
  while ((match = idRegex.exec(content)) !== null) {
    contentIds.add(match[1]);
  }

  // Count items from frontmatter
  const countMatch = content.match(/items_count: (\d+)/);
  const itemCount = countMatch ? parseInt(countMatch[1], 10) : contentIds.size;

  return { content, contentIds, itemCount };
}

/**
 * Update frontmatter with new counts and domains.
 * @param {string} content
 * @param {number} newCount
 * @param {string[]} newDomains
 * @param {number} newAvgRelevance
 * @returns {string}
 */
function updateFrontmatter(content, newCount, newDomains, newAvgRelevance) {
  let updated = content.replace(
    /items_count: \d+/,
    `items_count: ${newCount}`
  );

  updated = updated.replace(
    /relevance_avg: [\d.]+/,
    `relevance_avg: ${newAvgRelevance.toFixed(2)}`
  );

  // Merge domains
  const existingDomainsMatch = updated.match(/domains: \[(.*?)\]/);
  if (existingDomainsMatch) {
    const existingDomains = existingDomainsMatch[1]
      .split(',')
      .map(d => d.trim().replace(/"/g, ''))
      .filter(Boolean);
    const allDomains = [...new Set([...existingDomains, ...newDomains])];
    updated = updated.replace(
      /domains: \[.*?\]/,
      `domains: [${allDomains.map(d => `"${d}"`).join(', ')}]`
    );
  }

  return updated;
}

/**
 * Write knowledge feed for a set of routed clones.
 * @param {Object} routing - Router output (ContentRouteResult)
 * @param {Object} content - Full processed content
 * @param {string} content.title
 * @param {string} content.url
 * @param {string} [content.author]
 * @param {string} content.tier
 * @param {number} content.score
 * @param {string} content.contentId
 * @param {string[]} [content.domains]
 * @param {string[]} [content.insights]
 * @param {string[]} [content.quotes]
 * @param {Object} [options]
 * @param {string} [options.feedRoot] - Knowledge feed root directory
 * @param {string} [options.date] - Override date (for testing)
 * @returns {Promise<{ written: string[], skipped: string[], errors: string[] }>}
 */
export async function writeKnowledgeFeed(routing, content, options = {}) {
  const feedRoot = options.feedRoot || DEFAULT_FEED_ROOT;
  const date = options.date || getToday();
  const result = { written: [], skipped: [], errors: [] };

  if (!routing || !routing.targetClones || routing.targetClones.length === 0) {
    return result;
  }

  for (const clone of routing.targetClones) {
    try {
      const cloneDir = path.join(feedRoot, sanitizeName(clone.id));
      validatePath(cloneDir);

      // Ensure directory exists
      if (!fs.existsSync(cloneDir)) {
        fs.mkdirSync(cloneDir, { recursive: true });
      }

      const feedFile = path.join(cloneDir, `${date}-hydra-feed.md`);
      const itemData = {
        title: content.title,
        url: content.url,
        author: content.author,
        tier: content.tier,
        score: content.score,
        relevance: clone.relevanceScore,
        matchedKeywords: clone.matchedKeywords,
        insights: content.insights,
        quotes: content.quotes,
        contentId: content.contentId,
      };

      if (fs.existsSync(feedFile)) {
        // Append to existing file (idempotent check)
        const { content: existingContent, contentIds, itemCount } = parseFeedFile(feedFile);

        if (contentIds.has(content.contentId)) {
          result.skipped.push(clone.id);
          continue;
        }

        const newIndex = itemCount + 1;
        const newSection = generateItemSection(newIndex, itemData);
        const allRelevances = [...contentIds].map(() => clone.relevanceScore);
        allRelevances.push(clone.relevanceScore);
        const avgRelevance = allRelevances.reduce((a, b) => a + b, 0) / allRelevances.length;

        const updatedContent = updateFrontmatter(
          existingContent,
          newIndex,
          content.domains || [],
          avgRelevance
        ) + newSection;

        fs.writeFileSync(feedFile, updatedContent, 'utf-8');
      } else {
        // Create new file
        const frontmatter = generateFrontmatter(clone.id, date, content.domains || []);
        const section = generateItemSection(1, itemData);
        const updatedFm = updateFrontmatter(
          frontmatter,
          1,
          content.domains || [],
          clone.relevanceScore
        );
        fs.writeFileSync(feedFile, updatedFm + section, 'utf-8');
      }

      result.written.push(clone.id);
    } catch (error) {
      result.errors.push(`${clone.id}: ${error.message}`);
    }
  }

  return result;
}

/**
 * Clean up old feed files beyond retention period.
 * @param {Object} [options]
 * @param {string} [options.feedRoot] - Knowledge feed root
 * @param {number} [options.retentionDays] - Days to keep (default 30)
 * @returns {Promise<{ cleaned: number, errors: string[] }>}
 */
export async function cleanupOldFeeds(options = {}) {
  const feedRoot = options.feedRoot || DEFAULT_FEED_ROOT;
  const retentionDays = options.retentionDays ?? 30;
  const result = { cleaned: 0, errors: [] };

  if (!fs.existsSync(feedRoot)) return result;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  try {
    const cloneDirs = fs.readdirSync(feedRoot);
    for (const dir of cloneDirs) {
      const clonePath = path.join(feedRoot, dir);
      if (!fs.statSync(clonePath).isDirectory()) continue;

      const files = fs.readdirSync(clonePath);
      for (const file of files) {
        if (!file.endsWith('-hydra-feed.md')) continue;
        // Extract date from filename: YYYY-MM-DD-hydra-feed.md
        const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})-hydra-feed\.md$/);
        if (dateMatch && dateMatch[1] < cutoffStr) {
          fs.unlinkSync(path.join(clonePath, file));
          result.cleaned++;
        }
      }
    }
  } catch (error) {
    result.errors.push(error.message);
  }

  return result;
}

// Export internals for testing
export {
  validatePath,
  sanitizeName,
  generateFrontmatter,
  generateItemSection,
  parseFeedFile,
  updateFrontmatter,
  getToday,
  DEFAULT_FEED_ROOT,
  FORBIDDEN_PATHS,
};
