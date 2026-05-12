#!/usr/bin/env node

/**
 * @module hydra-cli
 * @description HYDRA CLI entrypoint — Autonomous Content Intelligence System.
 * Usage: node tools/hydra/bin/hydra.js <command> [options]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { runPipeline } from '../src/pipeline.js';
import { showStatus } from '../src/status.js';

// Load .env from project root (zero dependencies)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const program = new Command();

program
  .name('hydra')
  .description('HYDRA - Autonomous Content Intelligence System for Jarvis/Mega Brain')
  .version('1.0.0');

program
  .command('run')
  .description('Execute the full content intelligence pipeline')
  .option('--dry-run', 'Process content without writing to KB', false)
  .option('--source <name>', 'Filter to a specific source name')
  .option('--verbose', 'Enable verbose logging', false)
  .option('--config-dir <path>', 'Override config directory')
  .option('--no-distribute', 'Skip distribution phase')
  .option('--sources <types>', 'Comma-separated source types (rss,github,twitter,web,youtube,podcast)')
  .action(async (options) => {
    try {
      console.log('');
      console.log('  ██╗  ██╗██╗   ██╗██████╗ ██████╗  █████╗ ');
      console.log('  ██║  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗██╔══██╗');
      console.log('  ███████║ ╚████╔╝ ██║  ██║██████╔╝███████║');
      console.log('  ██╔══██║  ╚██╔╝  ██║  ██║██╔══██╗██╔══██║');
      console.log('  ██║  ██║   ██║   ██████╔╝██║  ██║██║  ██║');
      console.log('  ╚═╝  ╚═╝   ╚═╝   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝');
      console.log('  Autonomous Content Intelligence System v1.0.0');
      console.log('');

      // Epic 6: Validate environment before running
      const { validateEnv } = await import('../src/security/env-validator.js');
      const envResult = validateEnv({ envPath: envPath });
      for (const w of envResult.warnings) console.warn(`  [WARN] ${w}`);
      if (!envResult.valid) {
        console.error('\n  [FATAL] Environment validation failed:');
        for (const e of envResult.errors) console.error(`    - ${e}`);
        console.error('\n  Fix the errors above and try again.');
        process.exit(1);
      }

      if (options.dryRun) {
        console.log('  [DRY RUN MODE] No content will be written to KB.\n');
      }

      const result = await runPipeline({
        dryRun: options.dryRun,
        sourceFilter: options.source,
        sourceTypes: options.sources,
        verbose: options.verbose,
        configDir: options.configDir,
        noDistribute: !options.distribute,
      });

      // Only fail if errors exceed 10% of processed items or no items were processed
      const errorRate = result.totalProcessed > 0 ? result.errors.length / result.totalProcessed : 0;
      const isFatal = result.errors.length > 0 && (errorRate > 0.1 || result.totalProcessed === 0);
      process.exit(isFatal ? 1 : 0);
    } catch (error) {
      console.error(`\n[FATAL] Pipeline failed: ${error.message}`);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(2);
    }
  });

program
  .command('status')
  .description('Show HYDRA status: metrics, sources, recent activity')
  .action(async () => {
    try {
      await showStatus();
    } catch (error) {
      console.error(`[ERROR] Status check failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('test-source')
  .description('Test a single source adapter without full pipeline')
  .argument('<type>', 'Source type: rss, github, youtube, podcast, web, twitter')
  .argument('<url>', 'Source URL, repo (owner/repo), or @username')
  .option('--verbose', 'Show full content', false)
  .action(async (type, url, options) => {
    try {
      let adapter;
      let config;

      if (type === 'rss') {
        const { RssAdapter } = await import('../src/sources/rss-adapter.js');
        adapter = new RssAdapter();
        config = { name: 'Test Feed', url, domains: ['test'], authority: 3 };
      } else if (type === 'github') {
        const { GithubAdapter } = await import('../src/sources/github-adapter.js');
        adapter = new GithubAdapter();
        const ghType = url.includes('/') ? 'releases' : 'trending';
        config = { name: 'Test GitHub', type: ghType, repo: url, domains: ['test'], authority: 3 };
      } else if (type === 'youtube') {
        const { YoutubeAdapter } = await import('../src/sources/youtube-adapter.js');
        adapter = new YoutubeAdapter();
        config = { name: 'Test YouTube', url, domains: ['test'], authority: 3, max_videos: 2 };
      } else if (type === 'podcast') {
        const { PodcastAdapter } = await import('../src/sources/podcast-adapter.js');
        adapter = new PodcastAdapter();
        config = { name: 'Test Podcast', url, domains: ['test'], authority: 3, max_episodes: 1 };
      } else if (type === 'web') {
        const { WebAdapter } = await import('../src/sources/web-adapter.js');
        adapter = new WebAdapter();
        config = { name: 'Test Web', url, domains: ['test'], authority: 3 };
      } else if (type === 'twitter') {
        const { TwitterAdapter } = await import('../src/sources/twitter-adapter.js');
        adapter = new TwitterAdapter();
        config = { name: 'Test Twitter', username: url, domains: ['test'], authority: 3, max_tweets: 5 };
      } else {
        console.error(`Unknown source type: ${type}. Use: rss, github, youtube, podcast, web, twitter`);
        process.exit(1);
      }

      console.log(`Testing ${type} adapter with: ${url}\n`);
      const items = await adapter.fetch(config);

      console.log(`Fetched ${items.length} items:\n`);
      for (const item of items.slice(0, 5)) {
        console.log(`  Title:     ${item.title}`);
        console.log(`  URL:       ${item.url}`);
        console.log(`  Author:    ${item.author}`);
        console.log(`  Published: ${item.publishedAt}`);
        console.log(`  Language:  ${item.language}`);
        if (options.verbose) {
          console.log(`  Content:   ${item.contentRaw.slice(0, 200)}...`);
        }
        console.log('');
      }

      if (items.length > 5) {
        console.log(`  ... and ${items.length - 5} more items`);
      }
    } catch (error) {
      console.error(`[ERROR] Test failed: ${error.message}`);
      process.exit(1);
    }
  });

// ========== Epic 4: Automation Commands ==========

// Schedule commands
const schedule = program
  .command('schedule')
  .description('Manage automated pipeline scheduling');

schedule
  .command('start')
  .description('Start the automated scheduler (cron-based) with Telegram bot')
  .option('--verbose', 'Enable verbose logging', false)
  .option('--no-bot', 'Disable Telegram bot listener', false)
  .action(async (options) => {
    try {
      // Validate environment before starting scheduler
      const { validateEnvOrExit } = await import('../src/security/env-validator.js');
      validateEnvOrExit({ envPath });

      const { HydraScheduler } = await import('../src/scheduler/scheduler.js');

      console.log('[HYDRA] Starting automated scheduler...');

      const scheduler = new HydraScheduler({
        pipelineFn: runPipeline,
      });

      scheduler.start();

      console.log('[HYDRA] Scheduler is running. Press Ctrl+C to stop.');
      console.log('[HYDRA] Registered schedules:');
      const status = scheduler.getStatus();
      for (const [name, info] of Object.entries(status.schedules)) {
        console.log(`  - ${name}: active`);
      }

      // Start Telegram bot alongside scheduler
      if (options.bot !== false) {
        try {
          const { TelegramBot } = await import('../src/monitoring/telegram-bot.js');
          const bot = new TelegramBot();
          bot.scheduler = scheduler;
          bot.pipelineFn = runPipeline;
          bot.start();
          console.log('[HYDRA] Telegram bot started — send /help to @hydra_aios_bot');
        } catch (botErr) {
          console.warn(`[HYDRA] Telegram bot failed to start: ${botErr.message}`);
        }
      }

      // Keep process alive
      await new Promise(() => {});
    } catch (error) {
      console.error(`[FATAL] Scheduler failed: ${error.message}`);
      process.exit(2);
    }
  });

schedule
  .command('stop')
  .description('Stop the scheduler (sends SIGTERM to running instance)')
  .action(async () => {
    try {
      const { LockManager } = await import('../src/scheduler/lock-manager.js');
      const lockManager = new LockManager();
      const lockInfo = lockManager.getLockInfo();

      if (!lockInfo) {
        console.log('[HYDRA] No scheduler is currently running.');
        return;
      }

      console.log(`[HYDRA] Scheduler running with PID ${lockInfo.pid}`);
      console.log('[HYDRA] Sending termination signal...');

      try {
        process.kill(lockInfo.pid, 'SIGTERM');
        console.log('[HYDRA] SIGTERM sent. Scheduler will stop gracefully.');
      } catch (err) {
        if (err.code === 'ESRCH') {
          console.log('[HYDRA] Process not found. Cleaning up stale lock.');
          lockManager.release();
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error(`[ERROR] ${error.message}`);
      process.exit(1);
    }
  });

schedule
  .command('status')
  .description('Show scheduler status')
  .action(async () => {
    try {
      const { LockManager } = await import('../src/scheduler/lock-manager.js');
      const lockManager = new LockManager();
      const lockInfo = lockManager.getLockInfo();

      if (!lockInfo) {
        console.log('[HYDRA] Scheduler: NOT RUNNING');
      } else {
        console.log('[HYDRA] Scheduler: RUNNING');
        console.log(`  PID:        ${lockInfo.pid}`);
        console.log(`  Started:    ${lockInfo.acquiredAt}`);
        console.log(`  Lock TTL:   ${(lockInfo.ttlMs / 1000 / 60).toFixed(0)} minutes`);
      }

      // Show heartbeat
      const heartbeatPath = path.resolve(__dirname, '..', 'hydra-data/state/heartbeat.json');
      if (fs.existsSync(heartbeatPath)) {
        try {
          const hb = JSON.parse(fs.readFileSync(heartbeatPath, 'utf-8'));
          const ageMs = Date.now() - new Date(hb.timestamp).getTime();
          console.log(`\n  Heartbeat:  ${(ageMs / 1000).toFixed(0)}s ago`);
          console.log(`  Uptime:     ${(hb.uptime / 60).toFixed(1)} min`);
          console.log(`  Heap:       ${(hb.memory?.heapUsed / 1024 / 1024).toFixed(0)}MB`);
        } catch {
          console.log('  Heartbeat:  corrupted');
        }
      }
    } catch (error) {
      console.error(`[ERROR] ${error.message}`);
      process.exit(1);
    }
  });

// Health command
program
  .command('health')
  .description('Show pipeline health status')
  .option('--verbose', 'Show detailed checks', false)
  .option('--json', 'Output as JSON', false)
  .action(async (options) => {
    try {
      const { HealthReporter } = await import('../src/monitoring/health-reporter.js');
      const reporter = new HealthReporter();
      const output = reporter.format({ verbose: options.verbose, json: options.json });
      console.log(output);
    } catch (error) {
      console.error(`[ERROR] Health check failed: ${error.message}`);
      process.exit(1);
    }
  });

// Sources command
const sources = program
  .command('sources')
  .description('Manage content sources');

sources
  .command('list')
  .description('List all configured sources')
  .option('--type <type>', 'Filter by source type')
  .option('--domain <domain>', 'Filter by domain')
  .action(async (options) => {
    try {
      const { SourceManager } = await import('../src/scheduler/source-manager.js');
      const manager = new SourceManager();
      const sources = manager.list({ type: options.type, domain: options.domain });

      if (sources.length === 0) {
        console.log('No sources found matching filters.');
        return;
      }

      console.log(`\nSources (${sources.length} total):\n`);

      let currentType = '';
      for (const source of sources) {
        if (source.type !== currentType) {
          currentType = source.type;
          console.log(`  ${currentType.toUpperCase()}`);
        }
        const status = source.enabled ? '' : ' [DISABLED]';
        console.log(`    ${source.name}${status}`);
        console.log(`      URL: ${source.url}`);
        console.log(`      Domains: ${source.domains.join(', ') || 'none'}`);
        console.log(`      Authority: ${source.authority}`);
        console.log('');
      }

      // Summary
      const counts = manager.countByType();
      console.log('Summary:');
      for (const [type, count] of Object.entries(counts)) {
        if (count > 0) console.log(`  ${type}: ${count}`);
      }
      console.log(`  Total: ${manager.totalCount()}`);
    } catch (error) {
      console.error(`[ERROR] ${error.message}`);
      process.exit(1);
    }
  });

sources
  .command('add')
  .description('Add a new content source')
  .argument('<type>', 'Source type: rss, github, youtube, podcast, web, twitter, newsletter')
  .option('--name <name>', 'Source name (required)')
  .option('--url <url>', 'Source URL (required)')
  .option('--domains <domains>', 'Comma-separated domains', '')
  .option('--authority <n>', 'Authority score 1-5', '3')
  .action(async (type, options) => {
    try {
      if (!options.name || !options.url) {
        console.error('Error: --name and --url are required');
        process.exit(1);
      }

      const { SourceManager } = await import('../src/scheduler/source-manager.js');
      const manager = new SourceManager();
      const result = manager.add(type, {
        name: options.name,
        url: options.url,
        domains: options.domains ? options.domains.split(',').map((d) => d.trim()) : [],
        authority: parseInt(options.authority, 10),
      });

      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error(`[ERROR] ${error.message}`);
      process.exit(1);
    }
  });

sources
  .command('remove')
  .description('Remove a content source by name')
  .argument('<name>', 'Source name to remove')
  .action(async (name) => {
    try {
      const { SourceManager } = await import('../src/scheduler/source-manager.js');
      const manager = new SourceManager();
      const result = manager.remove(name);

      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      console.error(`[ERROR] ${error.message}`);
      process.exit(1);
    }
  });

// ========== Epic 5: Distribution Commands ==========

// Search command
program
  .command('search')
  .description('Search curated content by semantic query')
  .argument('<query>', 'Search query')
  .option('--domain <domain>', 'Filter by domain')
  .option('--tier <tiers>', 'Filter by tiers (comma-separated, e.g., S,A)')
  .option('--limit <n>', 'Max results', '10')
  .action(async (query, options) => {
    try {
      const { searchContent, formatForCLI } = await import('../src/distribution/search-api.js');

      const results = await searchContent(query, {
        limit: parseInt(options.limit, 10),
        domains: options.domain ? [options.domain] : undefined,
        tiers: options.tier ? options.tier.split(',').map(t => t.trim()) : undefined,
      });

      console.log(`\nSearch results for: "${query}"\n`);
      console.log(formatForCLI(results));
      console.log(`\n  ${results.length} result(s) found.\n`);
    } catch (error) {
      console.error(`[ERROR] Search failed: ${error.message}`);
      process.exit(1);
    }
  });

// Entity command
program
  .command('entity')
  .description('Search content and relationships by entity name')
  .argument('<name>', 'Entity name to search')
  .option('--limit <n>', 'Max results', '20')
  .action(async (name, options) => {
    try {
      const { searchEntity, formatEntityForCLI } = await import('../src/distribution/search-api.js');

      const result = searchEntity(name, { limit: parseInt(options.limit, 10) });
      console.log(`\nEntity lookup: "${name}"\n`);
      console.log(formatEntityForCLI(result, name));
    } catch (error) {
      console.error(`[ERROR] Entity search failed: ${error.message}`);
      process.exit(1);
    }
  });

// Distribution digest command
program
  .command('digest')
  .description('Show distribution digest (what was sent to which clones)')
  .option('--date <date>', 'Date in YYYY-MM-DD format (default: today)')
  .option('--days <n>', 'Show last N days of digests', '1')
  .action(async (options) => {
    try {
      const { DigestReporter } = await import('../src/distribution/digest-reporter.js');
      const reporter = new DigestReporter();

      if (options.date) {
        const content = reporter.load({ date: options.date });
        if (content) {
          console.log(content);
        } else {
          console.log(`No distribution digest found for ${options.date}`);
        }
      } else {
        const days = parseInt(options.days, 10);
        for (let i = 0; i < days; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const content = reporter.load({ date: dateStr });
          if (content) {
            console.log(content);
            console.log('');
          }
        }
      }
    } catch (error) {
      console.error(`[ERROR] Digest failed: ${error.message}`);
      process.exit(1);
    }
  });

// Feedback command
program
  .command('feedback')
  .description('Submit relevance feedback for routed content')
  .argument('<clone-id>', 'Mind clone ID')
  .argument('<content-id>', 'Content ID (hydra-xxxx)')
  .argument('<rating>', 'Rating: useful, irrelevant, or partially-relevant')
  .option('--comment <text>', 'Optional comment')
  .action(async (cloneId, contentId, rating, options) => {
    try {
      const { FeedbackManager } = await import('../src/distribution/feedback-manager.js');
      const manager = new FeedbackManager();

      const result = manager.addFeedback(cloneId, contentId, rating, options.comment);

      if (result.success) {
        console.log(`Feedback recorded: ${cloneId} / ${contentId} -> ${rating}`);

        // Recompute adjustments
        const adjResult = manager.saveAdjustments();
        if (adjResult.saved) {
          console.log('Routing adjustments updated.');
        }
      } else {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`[ERROR] Feedback failed: ${error.message}`);
      process.exit(1);
    }
  });

// ========== Telegram Bot Command ==========

program
  .command('bot')
  .description('Start Telegram bot standalone (without scheduler)')
  .action(async () => {
    try {
      const { TelegramBot } = await import('../src/monitoring/telegram-bot.js');

      const bot = new TelegramBot();
      bot.pipelineFn = runPipeline;

      if (!bot.token || !bot.chatId) {
        console.error('[HYDRA] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env');
        process.exit(1);
      }

      bot.start();
      console.log('[HYDRA] Telegram bot started — send /help to @hydra_aios_bot');
      console.log('[HYDRA] Press Ctrl+C to stop.');

      await new Promise(() => {});
    } catch (error) {
      console.error(`[FATAL] Bot failed: ${error.message}`);
      process.exit(2);
    }
  });

// ========== Epic 6: Security Commands ==========

program
  .command('audit')
  .description('Query the security audit log')
  .option('--run <run-id>', 'Show details for a specific run')
  .option('--content <id>', 'Show history for a content item')
  .option('--since <duration>', 'Show actions since duration (e.g., 7d, 30d)', '7d')
  .option('--action <type>', 'Filter by action type (e.g., injection_suspect, pii_redacted)')
  .option('--severity <level>', 'Filter by severity (info, warning, error, critical)')
  .option('--limit <n>', 'Max results', '50')
  .action(async (options) => {
    try {
      const { getDedupStore, isSqliteAvailable } = await import('../src/dedup/dedup-store.js');
      const { AuditLogger } = await import('../src/security/audit-logger.js');

      if (!isSqliteAvailable()) {
        console.error('[ERROR] SQLite is not available. Cannot query audit log.');
        process.exit(1);
      }

      const store = getDedupStore();
      const logger = new AuditLogger(store.db);

      if (options.run) {
        // Show events for a specific run
        const events = logger.getRunEvents(options.run);
        if (events.length === 0) {
          console.log(`No events found for run ${options.run}`);
          return;
        }
        console.log(`\nAudit log for run: ${options.run}\n`);
        for (const event of events) {
          const details = event.details ? JSON.parse(event.details) : null;
          console.log(`  [${event.timestamp}] ${event.action} (${event.severity || 'info'})`);
          if (event.content_id) console.log(`    Content: ${event.content_id}`);
          if (event.source_url) console.log(`    URL: ${event.source_url}`);
          if (event.tier) console.log(`    Tier: ${event.tier} (score: ${event.score})`);
          if (event.error) console.log(`    Error: ${event.error}`);
          if (details) console.log(`    Details: ${JSON.stringify(details)}`);
          console.log('');
        }
      } else if (options.content) {
        // Show history for a content item
        const history = logger.getContentHistory(options.content);
        if (history.length === 0) {
          console.log(`No history found for content ${options.content}`);
          return;
        }
        console.log(`\nContent history: ${options.content}\n`);
        for (const event of history) {
          console.log(`  [${event.timestamp}] ${event.action} — ${event.tier || ''} ${event.score || ''}`);
        }
      } else if (options.severity) {
        // Filter by severity
        const since = `-${options.since.replace('d', ' days')}`;
        const entries = logger.getBySeverity(options.severity, since, parseInt(options.limit, 10));
        console.log(`\n${options.severity.toUpperCase()} events (last ${options.since}):\n`);
        for (const entry of entries) {
          console.log(`  [${entry.timestamp}] ${entry.action} — ${entry.source_url || ''}`);
          if (entry.error) console.log(`    Error: ${entry.error}`);
        }
        console.log(`\n  ${entries.length} entries found.\n`);
      } else if (options.action) {
        // Filter by action
        const since = `-${options.since.replace('d', ' days')}`;
        const entries = logger.getBySeverity('info', since, parseInt(options.limit, 10));
        const filtered = entries.filter(e => e.action.includes(options.action));
        console.log(`\nAction "${options.action}" events (last ${options.since}):\n`);
        for (const entry of filtered) {
          console.log(`  [${entry.timestamp}] ${entry.action} — ${entry.content_id || ''} ${entry.source_url || ''}`);
        }
        console.log(`\n  ${filtered.length} entries found.\n`);
      } else {
        // Default: show run history
        const runs = logger.getRunHistory(parseInt(options.limit, 10));
        console.log(AuditLogger.formatRunHistory(runs));

        // Show action counts
        const since = `-${options.since.replace('d', ' days')}`;
        const counts = logger.getActionCounts(since);
        console.log(AuditLogger.formatActionCounts(counts));

        console.log(`\n  Total audit entries: ${logger.getCount()}\n`);
      }
    } catch (error) {
      console.error(`[ERROR] Audit query failed: ${error.message}`);
      process.exit(1);
    }
  });

// ========== Story 1.12: Feed Reader CLI ==========

const feed = program
  .command('feed')
  .description('HYDRA feed reader (consumption side, Story 1.12)');

feed
  .command('read <clone-id>')
  .description('Load and pretty-print a clone\'s HYDRA feed entries')
  .option('--days <n>', 'Lookback window in days', '30')
  .option('--max-tokens <n>', 'Token budget', '30000')
  .option('--tier <minTier>', 'Minimum tier (S, A, B)', 'A')
  .action(async (cloneId, options) => {
    try {
      const { loadCloneFeeds } = await import('../src/distribution/feed-reader.js');
      const result = await loadCloneFeeds(cloneId, {
        days: parseInt(options.days, 10),
        maxTokens: parseInt(options.maxTokens, 10),
        minTier: options.tier,
      });
      console.log(`Loaded ${result.entries.length} entries for ${cloneId}`);
      console.log(`  Date range: ${result.oldestDate || 'n/a'} → ${result.newestDate || 'n/a'}`);
      console.log(`  Total tokens: ${result.totalTokens}`);
      console.log(`  Truncated (over budget): ${result.truncatedCount}`);
      console.log(`  Empty: ${result.isEmpty}`);
      console.log('');
      for (const e of result.entries.slice(0, 10)) {
        console.log(`  [${e.date}] [${e.tier}] ${e.title}${e.quarantined ? ' (QUARANTINED)' : ''}`);
        console.log(`    ${e.url}`);
      }
      if (result.entries.length > 10) console.log(`  ... and ${result.entries.length - 10} more`);
    } catch (error) {
      console.error(`[ERROR] feed read failed: ${error.message}`);
      process.exit(1);
    }
  });

feed
  .command('coverage')
  .description('Show feed coverage across all clones (stale/empty detection)')
  .action(async () => {
    try {
      const { collectCoverage } = await import('../src/distribution/feed-reader.js');
      const rows = await collectCoverage();
      if (rows.length === 0) {
        console.log('No clone directories found under knowledge-feed/.');
        return;
      }
      console.log(`Coverage across ${rows.length} clones:\n`);
      console.log('  clone'.padEnd(40), 'latest'.padEnd(14), 'entries'.padEnd(10), 'status');
      console.log('  ' + '-'.repeat(72));
      let staleCount = 0;
      let emptyCount = 0;
      for (const r of rows) {
        const status = r.isEmpty ? 'EMPTY' : r.hasStale ? 'STALE (>30d)' : 'fresh';
        if (r.isEmpty) emptyCount++;
        if (r.hasStale) staleCount++;
        console.log(
          '  ' + r.cloneId.padEnd(40),
          (r.latestDate || 'n/a').padEnd(14),
          String(r.totalEntries).padEnd(10),
          status,
        );
      }
      console.log('');
      console.log(`Summary: ${rows.length - emptyCount - staleCount} fresh, ${staleCount} stale, ${emptyCount} empty`);
    } catch (error) {
      console.error(`[ERROR] feed coverage failed: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
