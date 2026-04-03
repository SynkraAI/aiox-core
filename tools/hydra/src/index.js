/**
 * @module hydra
 * @description HYDRA - Autonomous Content Intelligence System
 * Main entry point for programmatic usage.
 */

// Core pipeline
export { runPipeline } from './pipeline.js';
export { showStatus } from './status.js';

// Sources
export { RssAdapter } from './sources/rss-adapter.js';
export { GithubAdapter } from './sources/github-adapter.js';

// Processor
export { normalize } from './processor/normalizer.js';
export { extractWisdom, summarize, labelAndRate, initAnthropicClient } from './processor/extractor.js';

// Curator
export { applyHeuristicFilters } from './curator/heuristic-filter.js';
export { scoreContent } from './curator/llm-judge.js';
export { calculateWeightedScore, classifyTier, TIERS } from './curator/scoring-rubric.js';
export { ScoringCache } from './curator/scoring-cache.js';

// Dedup
export { checkUrl, registerUrl } from './dedup/url-matcher.js';
export { computeHash, checkHash } from './dedup/content-hash.js';
export { checkSemantic, computeFingerprint, cosineSimilarity, registerFingerprint } from './dedup/semantic-dedup.js';

// Store
export { writeToJarvisKB } from './store/jarvis-writer.js';
export { VectorStore } from './store/vector-store.js';

// Hallucination detection
export { verifyInsights } from './hallucination/hallucination-check.js';
export { verifyQuotes, diceCoefficient } from './hallucination/quote-verifier.js';

// === Epic 4: Automation ===

// Logging
export { createLogger, consoleLogger, defaultLogger } from './logging/logger.js';

// Scheduler
export { HydraScheduler } from './scheduler/scheduler.js';
export { JobRunner, SOURCE_GROUPS } from './scheduler/job-runner.js';
export { JobQueue } from './scheduler/job-queue.js';
export { RetryPolicy } from './scheduler/retry-policy.js';
export { CircuitBreaker, CB_STATES } from './scheduler/circuit-breaker.js';
export { RateLimiter } from './scheduler/rate-limiter.js';
export { LockManager } from './scheduler/lock-manager.js';
export { Checkpoint } from './scheduler/checkpoint.js';
export { SourceManager, SOURCE_TYPES } from './scheduler/source-manager.js';

// Monitoring
export { HealthReporter } from './monitoring/health-reporter.js';
export { MetricsCollector } from './monitoring/metrics-collector.js';
export { TelegramAlerter, SEVERITY } from './monitoring/telegram-alerter.js';
export { TelegramBot } from './monitoring/telegram-bot.js';

// === Epic 5: Distribution ===

// Router
export { routeToMindClones } from './distribution/mind-clone-router.js';

// Feed Writer
export { writeKnowledgeFeed, cleanupOldFeeds } from './distribution/feed-writer.js';

// Entity Graph
export { EntityGraph } from './distribution/entity-graph.js';

// Search API
export { searchContent, formatForCLI, searchEntity, formatEntityForCLI } from './distribution/search-api.js';

// Digest Reporter
export { DigestReporter } from './distribution/digest-reporter.js';

// Feedback Manager
export { FeedbackManager } from './distribution/feedback-manager.js';

// === Epic 6: Security & Hardening ===

// Input Sanitization
export { sanitizeContent, sanitizeHtml, detectPromptInjection, normalizeEncoding, sanitizeUrl, decodeEntities } from './security/input-sanitizer.js';

// Content Validation
export { validateContent, checkUrlBlocklist, checkSizeLimits, checkEncoding } from './security/content-validator.js';

// Output Filtering
export { filterOutput, scanPII, redactPII, detectCopyright } from './security/output-filter.js';

// Audit Logger
export { AuditLogger, SEVERITY } from './security/audit-logger.js';

// Env Validation
export { validateEnv, validateEnvOrExit } from './security/env-validator.js';

// Retry Utility
export { retryWithBackoff, isRetryableError } from './utils/retry.js';
