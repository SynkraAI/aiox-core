/**
 * @module feed-types
 * @description Shared typedefs for the HYDRA feed pipeline (Story 1.12 — Resilience Sprint).
 *
 * Imported by:
 *  - `feed-writer.js` (writer side)
 *  - `feed-reader.js` (reader side, Story 1.12)
 *
 * Co-locating the shape under one source of truth eliminates writer/reader drift
 * (PO suggestion S-06; ADR-004 Decision 7).
 *
 * This module exports no runtime code — pure JSDoc types.
 */

/**
 * A single entry from a clone's knowledge feed file.
 *
 * @typedef {Object} FeedEntry
 * @property {string} cloneId      - The mind-clone this entry was routed to.
 * @property {string} date         - YYYY-MM-DD parsed from the feed file frontmatter `date:` field.
 * @property {string} title        - Item title (from per-item Markdown block H2).
 * @property {string} url          - Original source URL (MANDATORY — for citation, ADR-004 Decision 5).
 * @property {'S'|'A'|'B'} tier    - Relevance tier extracted from per-item header.
 * @property {string[]} matched    - Matched routing keywords (may be empty).
 * @property {number} relevance    - 0.0-1.0 relevance score.
 * @property {string} contentId    - HYDRA content id (`hydra-{hex}`).
 * @property {string} insights     - Markdown body of the "Key Insights" section (may be empty string).
 * @property {string} sourceName   - Author/source label (e.g., "PubMed", "FAPESP").
 * @property {string} generatedAt  - ISO timestamp from the feed file's `generated_at:` frontmatter.
 * @property {boolean} quarantined - True if `generatedAt < 2026-05-12T00:00:00Z` (ADR-004 Decision 6).
 */

/**
 * Options for `loadCloneFeeds()`.
 *
 * @typedef {Object} FeedLoadOptions
 * @property {number} [days=30]            - Date window in days, rolling from now.
 * @property {number} [maxTokens=30000]    - Per-expert token budget (ADR-004 Decision 2).
 * @property {'S'|'A'|'B'} [minTier='A']   - Minimum tier (B included only if file <7d old).
 * @property {string} [feedRoot]           - Override `${MEGA_BRAIN_ROOT}/knowledge-feed/` for tests.
 */

/**
 * Result returned by `loadCloneFeeds()`.
 *
 * @typedef {Object} FeedLoadResult
 * @property {FeedEntry[]} entries       - Loaded entries, newest first, within budget.
 * @property {boolean} isEmpty           - True if `entries.length === 0` (staleness signal — ADR-004 Decision 4).
 * @property {number} totalTokens        - Estimated token count of returned entries (sum).
 * @property {number} truncatedCount     - Entries dropped to fit the token budget.
 * @property {string|null} oldestDate    - YYYY-MM-DD of oldest retained entry, or null.
 * @property {string|null} newestDate    - YYYY-MM-DD of newest retained entry, or null.
 */

export const __FEED_TYPES_VERSION__ = '1.0.0';
