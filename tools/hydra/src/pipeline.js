/**
 * @module pipeline
 * @description HYDRA core pipeline: Sources -> Normalize -> Dedup -> Extract -> Score -> Store.
 * Orchestrates the full content intelligence workflow.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { createHash } from 'node:crypto';

import { RssAdapter } from './sources/rss-adapter.js';
import { GithubAdapter } from './sources/github-adapter.js';
import { YoutubeAdapter } from './sources/youtube-adapter.js';
import { PodcastAdapter } from './sources/podcast-adapter.js';
import { WebAdapter } from './sources/web-adapter.js';
import { TwitterAdapter } from './sources/twitter-adapter.js';
import { NewsletterAdapter } from './sources/newsletter-adapter.js';
import { normalize } from './processor/normalizer.js';
import { extractWisdom, processChunked, initAnthropicClient, hasLLMKey, getProviderName } from './processor/extractor.js';
import { aggregateChunkResults } from './processor/chunker.js';
import { applyHeuristicFilters } from './curator/heuristic-filter.js';
import { scoreContent } from './curator/llm-judge.js';
import { requiresHallucinationCheck, getMinConfidence, classifyTier } from './curator/scoring-rubric.js';
import { checkUrl, registerUrl } from './dedup/url-matcher.js';
import { computeHash, checkHash, registerHash } from './dedup/content-hash.js';
import { incrementCounter } from './dedup/dedup-index.js';
import { getDedupStore, isSqliteAvailable } from './dedup/dedup-store.js';
import { writeToJarvisKB, writeMetadataOnly } from './store/jarvis-writer.js';
import { verifyInsights, filterHallucinatedInsights } from './hallucination/hallucination-check.js';
import { verifyQuotes } from './hallucination/quote-verifier.js';
import { DiversityTracker } from './curator/diversity-tracker.js';
import { ScoringCache } from './curator/scoring-cache.js';
import { checkSemantic, registerFingerprint } from './dedup/semantic-dedup.js';
import { VectorStore } from './store/vector-store.js';
import { routeToMindClones } from './distribution/mind-clone-router.js';
import { writeKnowledgeFeed } from './distribution/feed-writer.js';
import { EntityGraph } from './distribution/entity-graph.js';
import { DigestReporter } from './distribution/digest-reporter.js';

// Security (Epic 6)
import { sanitizeContent } from './security/input-sanitizer.js';
import { validateContent } from './security/content-validator.js';
import { filterOutput } from './security/output-filter.js';
import { AuditLogger } from './security/audit-logger.js';
import { validateEnvOrExit } from './security/env-validator.js';

// Rate limiting
import { RateLimiter } from './scheduler/rate-limiter.js';

// Monitoring
import { TelegramAlerter } from './monitoring/telegram-alerter.js';
import { TelegramBot } from './monitoring/telegram-bot.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} PipelineOptions
 * @property {boolean} [dryRun=false] - If true, don't write to KB
 * @property {string} [sourceFilter] - Filter to specific source name
 * @property {boolean} [verbose=false] - Verbose logging
 * @property {string} [configDir] - Config directory override
 * @property {boolean} [noDistribute=false] - Skip distribution phase
 */

/**
 * @typedef {Object} PipelineResult
 * @property {number} totalFetched - Total items fetched from sources
 * @property {number} totalFiltered - Items filtered by heuristics
 * @property {number} totalDuplicates - Items skipped as duplicates
 * @property {number} totalProcessed - Items that went through full pipeline
 * @property {number} totalIngested - Items written to KB
 * @property {number} totalHallucinated - Insights flagged as hallucinated
 * @property {{ tier: string, count: number }[]} tierBreakdown - Items per tier
 * @property {string[]} errors - Non-fatal errors encountered
 * @property {number} durationMs - Total pipeline duration
 * @property {number} totalDistributed - Items distributed to mind clones
 * @property {number} clonesEnriched - Number of unique clones enriched
 * @property {number} projectsImpacted - Number of projects impacted
 */

/**
 * Load YAML config file.
 * @param {string} filename - Config filename
 * @param {string} [configDir] - Config directory override
 * @returns {Object}
 */
function loadConfig(filename, configDir) {
  const dir = configDir || path.join(__dirname, 'config');
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }
  return yaml.load(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Generate a unique content ID.
 * @param {string} url - Content URL
 * @param {string} title - Content title
 * @returns {string}
 */
function generateContentId(url, title) {
  const hash = createHash('sha256')
    .update(`${url}:${title}`)
    .digest('hex')
    .slice(0, 12);
  return `hydra-${hash}`;
}

/**
 * Log a message if verbose mode is enabled.
 * @param {boolean} verbose - Verbose flag
 * @param {string} msg - Message
 */
function vlog(verbose, msg) {
  if (verbose) console.log(`  ${msg}`);
}

/**
 * Create adapter instances.
 * @returns {{ rss: RssAdapter, github: GithubAdapter }}
 */
function createAdapters() {
  return {
    rss: new RssAdapter(),
    github: new GithubAdapter(),
    youtube: new YoutubeAdapter(),
    podcast: new PodcastAdapter(),
    web: new WebAdapter(),
    twitter: new TwitterAdapter(),
    newsletter: new NewsletterAdapter(),
  };
}

/**
 * Run the full HYDRA pipeline.
 * @param {PipelineOptions} [options={}]
 * @returns {Promise<PipelineResult>}
 */
export async function runPipeline(options = {}) {
  // Validate environment before anything else
  validateEnvOrExit();

  const { dryRun = false, sourceFilter, sourceTypes, verbose = false, configDir, noDistribute = false } = options;
  const allowedTypes = sourceTypes ? new Set(sourceTypes.split(',').map(s => s.trim())) : null;
  const startTime = Date.now();

  // Rate limiter for source fetching
  const rateLimiter = new RateLimiter({
    rss: { requestsPerMinute: 60 },
    github: { requestsPerHour: 100 },
    youtube: { requestsPer15Min: 10 },
    podcast: { requestsPerMinute: 5 },
    twitter: { requestsPerMinute: 15 },
    web: { requestsPerMinute: 20 },
    newsletter: { requestsPerMinute: 20 },
  });

  const result = {
    totalFetched: 0,
    totalFiltered: 0,
    totalDuplicates: 0,
    totalProcessed: 0,
    totalIngested: 0,
    totalHallucinated: 0,
    totalDistributed: 0,
    clonesEnriched: 0,
    projectsImpacted: 0,
    tierBreakdown: [],
    errors: [],
    durationMs: 0,
  };

  const tierCounts = { S: 0, A: 0, B: 0, C: 0, D: 0 };

  // Load configs
  console.log(`[HYDRA] LLM Provider: ${hasLLMKey() ? getProviderName() : 'none (scoring disabled)'}`);
  console.log('[HYDRA] Loading configuration...');
  const sourcesConfig = loadConfig('sources.yaml', configDir);
  const thresholdsConfig = loadConfig('thresholds.yaml', configDir);
  const domainsConfig = loadConfig('domains.yaml', configDir);

  // Create adapters, diversity tracker, scoring cache, and vector store
  const adapters = createAdapters();
  const diversityTracker = new DiversityTracker(thresholdsConfig.anti_echo_chamber || {});
  const scoringCache = new ScoringCache(thresholdsConfig.scoring_cache || {});
  const vectorStore = new VectorStore({ mode: 'local' });
  const semanticDedupEnabled = thresholdsConfig.dedup?.semantic?.enabled || false;
  const semanticThresholds = thresholdsConfig.dedup?.hash_thresholds || {};

  // Security infrastructure (Epic 6)
  let auditLogger = null;
  let auditRunId = null;
  try {
    if (isSqliteAvailable()) {
      const store = getDedupStore();
      auditLogger = new AuditLogger(store.db);
      auditRunId = AuditLogger.generateRunId();
      const configHash = createHash('sha256').update(JSON.stringify(sourcesConfig)).digest('hex').slice(0, 12);
      auditLogger.logRunStart(auditRunId, { sourceCount: 0, configHash });
    }
  } catch (err) {
    console.warn(`[HYDRA] Audit logger init failed: ${err.message}`);
  }

  const securityConfig = thresholdsConfig.security || {};

  // Graceful shutdown handler (Epic 6)
  let shuttingDown = false;
  const shutdownHandler = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n[HYDRA] Received ${signal}, shutting down gracefully...`);
    if (auditLogger && auditRunId) {
      auditLogger.logAction(auditRunId, 'shutdown', {
        details: { signal, reason: 'signal', partialResult: { ...result } },
        severity: 'warning',
      });
      auditLogger.logRunEnd(auditRunId, { ...result, error: `Interrupted by ${signal}` });
    }
    process.exit(0);
  };
  process.on('SIGINT', shutdownHandler);
  process.on('SIGTERM', shutdownHandler);

  // Distribution infrastructure (Epic 5)
  const digestReporter = new DigestReporter();
  let entityGraph = null;
  if (!noDistribute) {
    try {
      entityGraph = new EntityGraph();
      entityGraph.init();
    } catch (err) {
      console.warn(`[HYDRA] Entity graph init failed: ${err.message}`);
    }
  }
  const distributedClones = new Set();
  const distributedProjects = new Set();

  // Phase 1: Fetch from all sources
  console.log('[HYDRA] Phase 1: Fetching content from sources...');
  const allContent = [];

  // RSS feeds
  const rssFeeds = (!allowedTypes || allowedTypes.has('rss')) ? (sourcesConfig.sources?.rss || []) : [];
  for (const feed of rssFeeds) {
    if (sourceFilter && !feed.name.toLowerCase().includes(sourceFilter.toLowerCase())) {
      continue;
    }
    vlog(verbose, `Fetching RSS: ${feed.name}...`);
    try {
      await rateLimiter.waitAndAcquire('rss');
      const items = await adapters.rss.fetch(feed);
      vlog(verbose, `  -> ${items.length} items`);
      allContent.push(...items);
    } catch (error) {
      const msg = `RSS fetch failed for "${feed.name}": ${error.message}`;
      result.errors.push(msg);
      console.error(`  [ERROR] ${msg}`);
    }
  }

  // GitHub sources
  const githubSources = (!allowedTypes || allowedTypes.has('github')) ? (sourcesConfig.sources?.github || []) : [];
  for (const ghSource of githubSources) {
    if (sourceFilter && !ghSource.name.toLowerCase().includes(sourceFilter.toLowerCase())) {
      continue;
    }
    vlog(verbose, `Fetching GitHub: ${ghSource.name}...`);
    try {
      await rateLimiter.waitAndAcquire('github');
      const items = await adapters.github.fetch(ghSource);
      vlog(verbose, `  -> ${items.length} items`);
      allContent.push(...items);
    } catch (error) {
      const msg = `GitHub fetch failed for "${ghSource.name}": ${error.message}`;
      result.errors.push(msg);
      console.error(`  [ERROR] ${msg}`);
    }
  }

  // YouTube sources
  const youtubeSources = (!allowedTypes || allowedTypes.has('youtube')) ? (sourcesConfig.sources?.youtube || []) : [];
  for (const ytSource of youtubeSources) {
    if (sourceFilter && !ytSource.name.toLowerCase().includes(sourceFilter.toLowerCase())) {
      continue;
    }
    vlog(verbose, `Fetching YouTube: ${ytSource.name}...`);
    try {
      await rateLimiter.waitAndAcquire('youtube');
      const items = await adapters.youtube.fetch(ytSource);
      vlog(verbose, `  -> ${items.length} items`);
      allContent.push(...items);
    } catch (error) {
      const msg = `YouTube fetch failed for "${ytSource.name}": ${error.message}`;
      result.errors.push(msg);
      console.error(`  [ERROR] ${msg}`);
    }
  }

  // Podcast sources
  const podcastSources = (!allowedTypes || allowedTypes.has('podcast')) ? (sourcesConfig.sources?.podcast || []) : [];
  for (const podSource of podcastSources) {
    if (sourceFilter && !podSource.name.toLowerCase().includes(sourceFilter.toLowerCase())) {
      continue;
    }
    vlog(verbose, `Fetching Podcast: ${podSource.name}...`);
    try {
      await rateLimiter.waitAndAcquire('podcast');
      const items = await adapters.podcast.fetch(podSource);
      vlog(verbose, `  -> ${items.length} items`);
      allContent.push(...items);
    } catch (error) {
      const msg = `Podcast fetch failed for "${podSource.name}": ${error.message}`;
      result.errors.push(msg);
      console.error(`  [ERROR] ${msg}`);
    }
  }

  // Web sources
  const webSources = (!allowedTypes || allowedTypes.has('web')) ? (sourcesConfig.sources?.web || []) : [];
  for (const webSource of webSources) {
    if (sourceFilter && !webSource.name.toLowerCase().includes(sourceFilter.toLowerCase())) {
      continue;
    }
    vlog(verbose, `Fetching Web: ${webSource.name}...`);
    try {
      await rateLimiter.waitAndAcquire('web');
      const items = await adapters.web.fetch(webSource);
      vlog(verbose, `  -> ${items.length} items`);
      allContent.push(...items);
    } catch (error) {
      const msg = `Web fetch failed for "${webSource.name}": ${error.message}`;
      result.errors.push(msg);
      console.error(`  [ERROR] ${msg}`);
    }
  }

  // Twitter sources
  const twitterSources = (!allowedTypes || allowedTypes.has('twitter')) ? (sourcesConfig.sources?.twitter || []) : [];
  for (const twSource of twitterSources) {
    if (sourceFilter && !twSource.name.toLowerCase().includes(sourceFilter.toLowerCase())) {
      continue;
    }
    vlog(verbose, `Fetching Twitter: ${twSource.name}...`);
    try {
      await rateLimiter.waitAndAcquire('twitter');
      const items = await adapters.twitter.fetch(twSource);
      vlog(verbose, `  -> ${items.length} items`);
      allContent.push(...items);
    } catch (error) {
      const msg = `Twitter fetch failed for "${twSource.name}": ${error.message}`;
      result.errors.push(msg);
      console.error(`  [ERROR] ${msg}`);
    }
  }

  // Newsletter sources
  const newsletterSources = (!allowedTypes || allowedTypes.has('newsletter')) ? (sourcesConfig.sources?.newsletter || []) : [];
  for (const nlSource of newsletterSources) {
    if (sourceFilter && !nlSource.name.toLowerCase().includes(sourceFilter.toLowerCase())) {
      continue;
    }
    vlog(verbose, `Fetching Newsletter: ${nlSource.name}...`);
    try {
      await rateLimiter.waitAndAcquire('newsletter');
      const items = await adapters.newsletter.fetch(nlSource);
      vlog(verbose, `  -> ${items.length} items`);
      allContent.push(...items);
    } catch (error) {
      const msg = `Newsletter fetch failed for "${nlSource.name}": ${error.message}`;
      result.errors.push(msg);
      console.error(`  [ERROR] ${msg}`);
    }
  }

  result.totalFetched = allContent.length;
  console.log(`[HYDRA] Fetched ${allContent.length} items from sources`);

  if (allContent.length === 0) {
    console.log('[HYDRA] No content to process. Done.');
    result.durationMs = Date.now() - startTime;
    return result;
  }

  // Phase 2-6: Process each item through the pipeline
  console.log('[HYDRA] Phase 2-6: Processing pipeline...');

  for (let i = 0; i < allContent.length; i++) {
    const raw = allContent[i];
    const itemLabel = `[${i + 1}/${allContent.length}] "${raw.title.slice(0, 50)}"`;

    try {
      // Phase 1.5: Input Gate (Epic 6 — Security)
      const sanitized = sanitizeContent(raw);
      if (sanitized.blocked) {
        vlog(verbose, `${itemLabel} BLOCKED (${sanitized.reason})`);
        result.totalFiltered++;
        if (auditLogger) {
          auditLogger.logAction(auditRunId, 'blocked', {
            sourceType: raw.source,
            sourceUrl: raw.url,
            severity: 'warning',
            details: { reason: sanitized.reason },
          });
        }
        continue;
      }
      const sanitizedItem = sanitized.item;

      // Content validation (Epic 6 — Story 6.2)
      const validated = validateContent(sanitizedItem, {
        sourceType: raw.source,
        blocklist: securityConfig.url_blocklist,
      });
      if (!validated.valid) {
        vlog(verbose, `${itemLabel} INVALID (${validated.reason})`);
        result.totalFiltered++;
        if (auditLogger) {
          auditLogger.logAction(auditRunId, 'filtered', {
            sourceType: raw.source,
            sourceUrl: raw.url,
            details: { reason: validated.reason },
          });
        }
        continue;
      }

      // If injection suspect, cap tier at C later
      if (sanitized.injectionSuspect) {
        vlog(verbose, `${itemLabel} INJECTION SUSPECT — will cap at tier C`);
        if (auditLogger) {
          auditLogger.logSecurityAlert(auditRunId, 'injection_suspect', {
            sourceUrl: raw.url,
            sourceType: raw.source,
            details: { patterns: sanitizedItem.metadata?.injectionPatterns },
          });
        }
      }

      // Use sanitized item from here on
      const item = sanitizedItem;

      // Phase 2: Dedup - URL check
      const urlCheck = await checkUrl(item.url || raw.url);
      if (urlCheck.isDuplicate) {
        vlog(verbose, `${itemLabel} SKIP (duplicate URL)`);
        result.totalDuplicates++;
        await incrementCounter('duplicate');
        continue;
      }

      // Phase 3: Normalize
      const normalized = normalize(raw);

      // Phase 3b: Dedup - Content hash
      const contentHash = computeHash(normalized.normalizedText);
      const hashCheck = await checkHash(contentHash);
      if (hashCheck.isDuplicate) {
        vlog(verbose, `${itemLabel} SKIP (duplicate content hash)`);
        result.totalDuplicates++;
        await incrementCounter('duplicate');
        continue;
      }

      // Phase 3c: Dedup - Semantic similarity (Story 3.1)
      if (semanticDedupEnabled) {
        const semCheck = await checkSemantic(normalized.normalizedText, raw.source, {
          thresholds: semanticThresholds,
        });
        if (semCheck.isDuplicate) {
          vlog(verbose, `${itemLabel} SKIP (semantic duplicate: ${semCheck.similarity} sim with "${semCheck.matchedTitle}")`);
          result.totalDuplicates++;
          await incrementCounter('duplicate');
          continue;
        }
      }

      // Phase 4: Heuristic pre-filter (with source-type thresholds + AI slop detection)
      const filterResult = applyHeuristicFilters(
        {
          wordCount: normalized.wordCount,
          publishedAt: raw.publishedAt,
          language: raw.language,
          contentRaw: raw.contentRaw,
          sourceType: raw.source,
          normalizedText: normalized.normalizedText,
        },
        thresholdsConfig.heuristic_filter || {}
      );

      if (!filterResult.passed) {
        vlog(verbose, `${itemLabel} FILTERED: ${filterResult.reason}`);
        result.totalFiltered++;
        continue;
      }

      // Generate content ID
      const contentId = generateContentId(raw.url, raw.title);

      // Phase 5: LLM Scoring (with cache — Story 3.4)
      const domains = raw.metadata?.domains || [];
      let scoringResult;
      let cacheHit = false;

      // Check scoring cache first
      const cacheCheck = await scoringCache.lookup(raw.title, raw.url);
      if (cacheCheck.hit) {
        scoringResult = cacheCheck.result;
        cacheHit = true;
        vlog(verbose, `${itemLabel} CACHE HIT (${cacheCheck.similarity} sim with "${cacheCheck.cachedTitle}")`);
      } else if (!hasLLMKey()) {
        vlog(verbose, `${itemLabel} SKIP scoring (no API key)`);
        scoringResult = {
          tier: 'B',
          action: 'ingest_metadata_only',
          label: 'Unscored (no API key)',
          weightedScore: 2.5,
          scores: {},
          reasoning: 'No API key available for scoring',
        };
      } else {
        vlog(verbose, `${itemLabel} Scoring...`);
        scoringResult = await scoreContent({
          title: raw.title,
          normalizedText: normalized.normalizedText,
          domains,
          sourceAuthority: raw.metadata?.authority,
        });

        // Store in cache for future lookups (Story 3.4)
        await scoringCache.store(raw.title, raw.url, scoringResult);
      }

      // Story 3.3 — Apply contrarian bonus
      const { adjustedScore, isContrarian } = diversityTracker.applyContrarianBonus(
        normalized.normalizedText, scoringResult.weightedScore
      );
      if (isContrarian && adjustedScore !== scoringResult.weightedScore) {
        const oldTier = scoringResult.tier;
        scoringResult.weightedScore = adjustedScore;
        const newTierInfo = classifyTier(adjustedScore);
        scoringResult.tier = newTierInfo.tier;
        scoringResult.action = newTierInfo.action;
        vlog(verbose, `${itemLabel} CONTRARIAN bonus: ${oldTier} -> ${scoringResult.tier}`);
      }

      // Epic 6: Cap injection suspects at tier C (metadata-only, never full KB ingestion)
      if (sanitized.injectionSuspect && (scoringResult.tier === 'S' || scoringResult.tier === 'A' || scoringResult.tier === 'B')) {
        vlog(verbose, `${itemLabel} INJECTION CAP: ${scoringResult.tier} -> C`);
        scoringResult.tier = 'C';
        scoringResult.action = 'skip_store_reference';
      }

      vlog(verbose, `${itemLabel} -> ${scoringResult.tier} (${scoringResult.weightedScore})`);
      tierCounts[scoringResult.tier]++;

      // Track source for diversity
      const sourceName = raw.metadata?.feedName || raw.metadata?.channelName || raw.metadata?.sourceName || raw.source;
      diversityTracker.recordSource(sourceName);

      // Periodic diversity check
      if (diversityTracker.shouldCheck()) {
        const report = diversityTracker.checkDiversity();
        if (!report.healthy) {
          for (const w of report.warnings) console.warn(`[HYDRA] Diversity: ${w}`);
        }
      }

      // Phase 5b: Extract wisdom (only for S/A tiers, or B if API key available)
      let extractionResult = null;
      let hallucinationResults = null;

      if (hasLLMKey() && (scoringResult.tier === 'S' || scoringResult.tier === 'A')) {
        // Check if content has pre-computed chunks (from youtube/podcast adapters)
        const chunks = raw.metadata?.chunks;
        if (chunks && chunks.length > 1) {
          vlog(verbose, `${itemLabel} Extracting wisdom (chunked: ${chunks.length} chunks)...`);
          const chunkResults = await processChunked(chunks, raw.title, { verbose });
          extractionResult = aggregateChunkResults(chunkResults, {
            title: raw.title,
            url: raw.url,
            duration: raw.metadata?.duration,
            totalChunks: chunks.length,
            totalTokens: raw.metadata?.totalTokens,
          });
        } else {
          vlog(verbose, `${itemLabel} Extracting wisdom...`);
          extractionResult = await extractWisdom(normalized.numberedText, raw.title);
        }

        // Phase 5c: Hallucination check (for S/A tiers)
        if (requiresHallucinationCheck(scoringResult.tier) && extractionResult.insights.length > 0) {
          vlog(verbose, `${itemLabel} Hallucination check...`);
          const hCheck = await verifyInsights(extractionResult.insights, normalized.normalizedText);

          result.totalHallucinated += hCheck.stats.hallucinated;

          // Filter out hallucinated insights
          const { confirmed } = filterHallucinatedInsights(extractionResult.insights, hCheck.results);
          extractionResult.insights = confirmed;

          // Build results map for writer
          hallucinationResults = {};
          for (const r of hCheck.results) {
            hallucinationResults[r.insight] = { status: r.status, explanation: r.explanation };
          }

          // Quote verification
          if (extractionResult.quotes && extractionResult.quotes.length > 0) {
            const quoteResults = verifyQuotes(extractionResult.quotes, normalized.normalizedText);
            extractionResult.quotes = quoteResults
              .filter((q) => q.status !== 'HALLUCINATED')
              .map((q) => q.quote);
          }
        }

        // Filter low-confidence insights
        const minConf = getMinConfidence(scoringResult.tier);
        extractionResult.insights = extractionResult.insights.filter((i) => (i.confidence || 1) >= minConf);
      }

      // Phase 6: Store
      if (!dryRun) {
        await registerUrl(raw.url, contentId, raw.title);
        await registerHash(contentHash, contentId, raw.title);
        await incrementCounter('processed');

        // Register semantic fingerprint for future dedup (Story 3.1)
        if (semanticDedupEnabled) {
          await registerFingerprint(contentId, raw.title, normalized.normalizedText, raw.source);
        }

        // Store in vector store for semantic search (Story 3.6)
        if (scoringResult.tier === 'S' || scoringResult.tier === 'A' || scoringResult.tier === 'B') {
          await vectorStore.upsert({
            id: contentId,
            title: raw.title,
            url: raw.url,
            tier: scoringResult.tier,
            score: scoringResult.weightedScore,
            domains,
            tags: extractionResult?.tags || [],
            normalizedText: normalized.normalizedText,
          });
        }

        if (scoringResult.action === 'ingest_full_alert' || scoringResult.action === 'ingest_full') {
          // Epic 6: Output Gate — PII scan + copyright detection before KB write
          let writeInsights = extractionResult?.insights || [];
          let writeSummary = extractionResult?.summary || [];
          let writeQuotes = extractionResult?.quotes || [];
          let copyrightNotice = false;

          if (extractionResult) {
            const outputResult = filterOutput(extractionResult, domains);
            writeInsights = outputResult.data.insights || [];
            writeSummary = outputResult.data.summary || [];
            writeQuotes = outputResult.data.quotes || [];
            copyrightNotice = outputResult.copyrightNotice;

            if (outputResult.piiDetected) {
              vlog(verbose, `${itemLabel} PII redacted (${outputResult.piiCount} instances)`);
              if (auditLogger) {
                auditLogger.logSecurityAlert(auditRunId, 'pii_redacted', {
                  contentId,
                  details: { piiCount: outputResult.piiCount },
                });
              }
            }
          }

          const writeResult = await writeToJarvisKB({
            contentId,
            title: raw.title,
            url: raw.url,
            author: raw.author,
            publishedAt: raw.publishedAt,
            tier: scoringResult.tier,
            weightedScore: scoringResult.weightedScore,
            tags: extractionResult?.tags || [],
            domains,
            insights: writeInsights,
            summary: writeSummary,
            quotes: writeQuotes,
            entities: extractionResult?.entities || [],
            normalizedText: normalized.normalizedText,
            hallucinationResults,
            copyrightNotice,
          });

          if (writeResult.written) {
            result.totalIngested++;
            vlog(verbose, `${itemLabel} INGESTED to ${writeResult.paths.length} paths`);
            if (auditLogger) {
              auditLogger.logAction(auditRunId, 'write_kb', {
                contentId,
                sourceType: raw.source,
                sourceUrl: raw.url,
                tier: scoringResult.tier,
                score: scoringResult.weightedScore,
                details: { paths: writeResult.paths, copyrightNotice },
              });
            }
          } else {
            result.errors.push(...writeResult.errors);
          }
        } else if (scoringResult.action === 'ingest_metadata_only') {
          await writeMetadataOnly({
            contentId,
            title: raw.title,
            url: raw.url,
            author: raw.author,
            publishedAt: raw.publishedAt,
            tier: scoringResult.tier,
            weightedScore: scoringResult.weightedScore,
            tags: extractionResult?.tags || [],
            domains,
            summary: extractionResult?.summary || [],
          });
          vlog(verbose, `${itemLabel} METADATA stored`);
        } else {
          vlog(verbose, `${itemLabel} SKIPPED (${scoringResult.action})`);
        }
      } else {
        vlog(verbose, `${itemLabel} DRY RUN — would ${scoringResult.action}`);
      }

      // Phase 7: Distribution (Epic 5)
      if (!dryRun && !noDistribute && (scoringResult.tier === 'S' || scoringResult.tier === 'A' || scoringResult.tier === 'B')) {
        try {
          const routing = routeToMindClones({
            contentId,
            domains,
            keywords: extractionResult?.tags || [],
            tags: extractionResult?.tags || [],
            entities: extractionResult?.entities || [],
            tier: scoringResult.tier,
          }, { configDir });

          if (routing.targetClones.length > 0) {
            // Write knowledge feeds
            const feedResult = await writeKnowledgeFeed(routing, {
              title: raw.title,
              url: raw.url,
              author: raw.author,
              tier: scoringResult.tier,
              score: scoringResult.weightedScore,
              contentId,
              domains,
              insights: (extractionResult?.insights || []).map(i => typeof i === 'string' ? i : i.insight || String(i)),
              quotes: extractionResult?.quotes || [],
            });

            for (const c of routing.targetClones) distributedClones.add(c.id);
            for (const p of routing.targetProjects) distributedProjects.add(p);
            result.totalDistributed++;

            vlog(verbose, `${itemLabel} DISTRIBUTED to ${routing.targetClones.length} clones (${feedResult.written.length} written)`);
          }

          // Record for digest
          digestReporter.record(routing, { title: raw.title, tier: scoringResult.tier });

          // Index entities
          if (entityGraph && extractionResult?.entities && extractionResult.entities.length > 0) {
            entityGraph.registerEntities(contentId, extractionResult.entities, domains[0]);
          }
        } catch (distError) {
          vlog(verbose, `${itemLabel} Distribution failed: ${distError.message}`);
          result.errors.push(`Distribution error: ${distError.message}`);
        }
      }

      result.totalProcessed++;
    } catch (error) {
      const msg = `Pipeline error for "${raw.title.slice(0, 50)}": ${error.message}`;
      result.errors.push(msg);
      console.error(`  [ERROR] ${msg}`);
    }
  }

  result.tierBreakdown = Object.entries(tierCounts)
    .filter(([_, count]) => count > 0)
    .map(([tier, count]) => ({ tier, count }));

  result.durationMs = Date.now() - startTime;

  // Summary
  console.log('\n[HYDRA] Pipeline complete:');
  console.log(`  Fetched:      ${result.totalFetched}`);
  console.log(`  Filtered:     ${result.totalFiltered}`);
  console.log(`  Duplicates:   ${result.totalDuplicates}`);
  console.log(`  Processed:    ${result.totalProcessed}`);
  console.log(`  Ingested:     ${result.totalIngested}`);
  console.log(`  Hallucinated: ${result.totalHallucinated} insights removed`);
  console.log(`  Tiers:        ${result.tierBreakdown.map((t) => `${t.tier}=${t.count}`).join(', ') || 'none'}`);
  console.log(`  Distributed:  ${result.totalDistributed}`);
  console.log(`  Clones:       ${distributedClones.size}`);
  console.log(`  Projects:     ${distributedProjects.size}`);
  console.log(`  Errors:       ${result.errors.length}`);
  console.log(`  Duration:     ${(result.durationMs / 1000).toFixed(1)}s`);

  result.clonesEnriched = distributedClones.size;
  result.projectsImpacted = distributedProjects.size;

  // Log diversity summary
  const diversityReport = diversityTracker.checkDiversity();
  if (!diversityReport.healthy) {
    console.warn('[HYDRA] Diversity warnings:');
    for (const w of diversityReport.warnings) console.warn(`  - ${w}`);
  }

  // Log scoring cache stats (Story 3.4)
  console.log(`  ${scoringCache.getSummary()}`);

  // Log vector store stats (Story 3.6)
  console.log(`  ${vectorStore.getSummary()}`);

  // Save daily digest
  if (!dryRun) {
    const extraSummaries = [
      diversityTracker.getSummary(),
      scoringCache.getSummary(),
      vectorStore.getSummary(),
    ].filter(Boolean).join('\n');
    await saveDailyDigest(result, extraSummaries);

    // Save distribution digest (Epic 5)
    if (!noDistribute && digestReporter.records.length > 0) {
      try {
        console.log(`  ${digestReporter.getSummary()}`);
        digestReporter.save();
      } catch (err) {
        console.warn(`[HYDRA] Distribution digest save failed: ${err.message}`);
      }
    }

    // Close entity graph
    if (entityGraph) {
      try { entityGraph.close(); } catch { /* ignore */ }
    }

    // Record pipeline run in SQLite (if available)
    try {
      if (isSqliteAvailable()) {
        const store = getDedupStore();
        store.recordPipelineRun({
          startedAt: new Date(startTime).toISOString(),
          finishedAt: new Date().toISOString(),
          itemsFetched: result.totalFetched,
          itemsFiltered: result.totalFiltered,
          itemsDuplicates: result.totalDuplicates,
          itemsScored: result.totalProcessed,
          itemsStored: result.totalIngested,
          itemsHallucinated: result.totalHallucinated,
          errors: result.errors.length,
          errorDetails: result.errors.length > 0 ? result.errors : null,
          tierBreakdown: tierCounts,
          durationMs: result.durationMs,
          extraSummary: extraSummaries || null,
        });
        console.log('[HYDRA] Pipeline run recorded in SQLite.');
      }
    } catch (err) {
      console.warn(`[HYDRA] Failed to record pipeline run: ${err.message}`);
    }

    // Epic 6: Log audit run end
    if (auditLogger && auditRunId) {
      auditLogger.logRunEnd(auditRunId, {
        totalFetched: result.totalFetched,
        totalFiltered: result.totalFiltered,
        totalDuplicates: result.totalDuplicates,
        totalProcessed: result.totalProcessed,
        totalIngested: result.totalIngested,
        durationMs: result.durationMs,
        errors: result.errors.length,
      });

      // Retention cleanup (>90 days)
      try {
        auditLogger.cleanup(90);
      } catch { /* ignore cleanup errors */ }
    }

    // Remove shutdown handlers
    process.removeListener('SIGINT', shutdownHandler);
    process.removeListener('SIGTERM', shutdownHandler);

    // Post-run alerting (Telegram + file)
    try {
      const schedulerConfig = loadConfig('scheduler.yaml', configDir);
      const alertConfig = schedulerConfig.alerts || {};
      const alerter = new TelegramAlerter(alertConfig);
      await alerter.evaluateAndAlert(result);
    } catch (alertErr) {
      console.warn(`[HYDRA] Alerter failed: ${alertErr.message}`);
    }

    // Post-run Telegram report (always send summary)
    try {
      const bot = new TelegramBot();
      await bot.sendPipelineReport(result);
    } catch (reportErr) {
      console.warn(`[HYDRA] Telegram report failed: ${reportErr.message}`);
    }
  }

  return result;
}

/**
 * Save a daily digest of pipeline results.
 * @param {PipelineResult} result - Pipeline result
 */
async function saveDailyDigest(result, diversitySummary = '') {
  try {
    const digestDir = path.resolve(__dirname, '../hydra-data/digests');
    if (!fs.existsSync(digestDir)) {
      fs.mkdirSync(digestDir, { recursive: true });
    }

    const today = new Date().toISOString().split('T')[0];
    const digestPath = path.join(digestDir, `${today}.md`);

    const content = `# HYDRA Daily Digest — ${today}

## Summary

| Metric | Value |
|--------|-------|
| Fetched | ${result.totalFetched} |
| Filtered | ${result.totalFiltered} |
| Duplicates | ${result.totalDuplicates} |
| Processed | ${result.totalProcessed} |
| Ingested | ${result.totalIngested} |
| Hallucinated Insights Removed | ${result.totalHallucinated} |
| Duration | ${(result.durationMs / 1000).toFixed(1)}s |

## Tier Breakdown

${result.tierBreakdown.map((t) => `- **${t.tier}**: ${t.count}`).join('\n') || 'No items processed'}

## Errors

${result.errors.length > 0 ? result.errors.map((e) => `- ${e}`).join('\n') : 'No errors'}

## Source Diversity

${diversitySummary || 'No diversity data'}

---
*Generated by HYDRA at ${new Date().toISOString()}*
`;

    fs.writeFileSync(digestPath, content, 'utf-8');
  } catch (error) {
    console.warn(`[HYDRA] Failed to save daily digest: ${error.message}`);
  }
}
