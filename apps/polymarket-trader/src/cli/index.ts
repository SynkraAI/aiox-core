/**
 * CLI Dashboard for Polymarket Trader.
 * Constitution Article I: CLI First.
 *
 * Zero external dependencies for argument parsing.
 * Hand-rolled process.argv parsing (no commander/yargs).
 */

import type { TradingSystem } from '../index.js';
import type { TradeExperience } from '../types/index.js';
import {
  colorize,
  formatCurrency,
  formatDate,
  formatDuration,
  formatPercent,
  formatTable,
  keyValue,
  pnlColor,
  sectionHeader,
  statusColor,
} from './formatter.js';

// ---------------------------------------------------------------------------
// Arg parser
// ---------------------------------------------------------------------------

interface ParsedArgs {
  command: string;
  positional: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
  // Skip node + script path
  const args = argv.slice(2);
  const command = args[0] ?? 'help';
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { command, positional, flags };
}

// ---------------------------------------------------------------------------
// System startup helper
// ---------------------------------------------------------------------------

let _system: TradingSystem | null = null;

async function getSystem(): Promise<TradingSystem> {
  if (!_system) {
    const { createTradingSystem } = await import('../index.js');
    _system = createTradingSystem();
  }
  return _system;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

async function cmdStatus(): Promise<void> {
  const system = await getSystem();
  const risk = system.risk.getState();
  const stats = system.store.getStats();
  const paper = system.paper.getStatus();
  const driftHealthy = system.drift.isHealthy();

  const uptime = Date.now() - paper.startedAt.getTime();
  const exposure = risk.totalExposure;
  const utilization = risk.bankroll > 0 ? exposure / risk.bankroll : 0;

  console.log(sectionHeader('POLYMARKET TRADER STATUS'));
  console.log(keyValue('Mode', colorize(paper.mode.toUpperCase(), 'cyan')));
  console.log(keyValue('Uptime', formatDuration(uptime)));
  console.log(keyValue('Active Strategies', system.config.enabledStrategies.join(', ')));
  console.log(keyValue('Enabled Verticals', system.config.enabledVerticals.join(', ')));
  console.log('');
  console.log(keyValue('Open Positions', `${risk.openPositions}`));
  console.log(keyValue('Total Exposure', formatCurrency(exposure)));
  console.log(keyValue('Utilization', formatPercent(utilization)));
  console.log('');
  console.log(keyValue("Today's P&L", pnlColor(risk.dailyPnl, formatCurrency(risk.dailyPnl))));
  console.log(keyValue('Overall P&L', pnlColor(stats.totalPnl, formatCurrency(stats.totalPnl))));
  console.log(keyValue('Win Rate', formatPercent(stats.winRate)));
  console.log('');
  console.log(keyValue('Health', statusColor(driftHealthy ? 'healthy' : 'degraded')));
  console.log(keyValue('Drift', statusColor(driftHealthy ? 'ok' : 'warn')));
  console.log(keyValue('Circuit Breaker', statusColor(risk.circuitBreakerTripped ? 'TRIPPED' : 'ok')));
  console.log(keyValue('Ready for Live', paper.readyForLive
    ? colorize('YES', 'green')
    : colorize('NO (need 30d + 500 trades + 60% WR)', 'yellow')));
}

async function cmdTrades(flags: Record<string, string | boolean>): Promise<void> {
  const system = await getSystem();
  const limit = typeof flags['limit'] === 'string' ? parseInt(flags['limit'], 10) : 20;
  const vertical = typeof flags['vertical'] === 'string' ? flags['vertical'] : undefined;
  const strategy = typeof flags['strategy'] === 'string' ? flags['strategy'] : undefined;

  let trades: TradeExperience[];
  if (vertical) {
    trades = system.store.getByVertical(vertical as TradeExperience['vertical'], limit);
  } else if (strategy) {
    trades = system.store.getByStrategy(strategy as TradeExperience['strategy'], limit);
  } else {
    trades = system.store.getRecent(limit);
  }

  if (trades.length === 0) {
    console.log('\n  No trades found.');
    return;
  }

  console.log(sectionHeader(`TRADE HISTORY (${trades.length} trades)`));

  const headers = ['Date', 'Market', 'Side', 'Size', 'Entry', 'Exit', 'P&L', 'Strategy', 'Vertical'];
  const rows = trades.map(t => [
    formatDate(t.timestamp),
    t.marketQuestion.slice(0, 30),
    t.side,
    formatCurrency(t.positionSize),
    t.entryPrice.toFixed(4),
    t.outcome === 'PENDING' ? '-' : t.exitPrice.toFixed(4),
    t.outcome === 'PENDING' ? colorize('PENDING', 'yellow') : pnlColor(t.pnl, formatCurrency(t.pnl)),
    t.strategy,
    t.vertical,
  ]);

  // Summary row
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const totalSize = trades.reduce((s, t) => s + t.positionSize, 0);
  rows.push([
    colorize('TOTAL', 'bold'),
    '',
    '',
    formatCurrency(totalSize),
    '',
    '',
    pnlColor(totalPnl, formatCurrency(totalPnl)),
    '',
    '',
  ]);

  const aligns = ['left', 'left', 'left', 'right', 'right', 'right', 'right', 'left', 'left'] as const;
  console.log(formatTable(headers, rows, [...aligns]));
}

async function cmdPnl(flags: Record<string, string | boolean>): Promise<void> {
  const system = await getSystem();
  // Period param reserved for future filtering (daily/weekly/monthly)
  const _period: string = typeof flags['period'] === 'string' ? flags['period'] : 'all';
  void _period;
  const stats = system.store.getStats();
  const trades = system.store.getRecent(10000);

  console.log(sectionHeader('P&L REPORT'));
  console.log(keyValue('Total Trades', `${stats.total}`));
  console.log(keyValue('Wins', `${stats.wins}`));
  console.log(keyValue('Losses', `${stats.losses}`));
  console.log(keyValue('Pending', `${stats.pending}`));
  console.log(keyValue('Win Rate', formatPercent(stats.winRate)));
  console.log(keyValue('Total P&L', pnlColor(stats.totalPnl, formatCurrency(stats.totalPnl))));
  console.log(keyValue('Avg P&L/Trade', pnlColor(stats.avgPnl, formatCurrency(stats.avgPnl))));

  // Daily P&L breakdown
  const settled = trades.filter(t => t.outcome !== 'PENDING');
  const dailyMap = new Map<string, { pnl: number; wins: number; total: number }>();

  for (const t of settled) {
    const day = formatDate(t.timestamp).split(' ')[0];
    const entry = dailyMap.get(day) ?? { pnl: 0, wins: 0, total: 0 };
    entry.pnl += t.pnl;
    entry.total++;
    if (t.outcome === 'WIN') entry.wins++;
    dailyMap.set(day, entry);
  }

  if (dailyMap.size > 0) {
    console.log(sectionHeader('DAILY BREAKDOWN'));
    const headers = ['Date', 'Trades', 'Win Rate', 'P&L', 'Cumulative'];
    const sortedDays = [...dailyMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    let cumulative = 0;
    const rows = sortedDays.map(([day, d]) => {
      cumulative += d.pnl;
      const wr = d.total > 0 ? d.wins / d.total : 0;
      return [
        day,
        `${d.total}`,
        formatPercent(wr),
        pnlColor(d.pnl, formatCurrency(d.pnl)),
        pnlColor(cumulative, formatCurrency(cumulative)),
      ];
    });

    // Best/worst day
    const pnlValues = sortedDays.map(([, d]) => d.pnl);
    const best = Math.max(...pnlValues);
    const worst = Math.min(...pnlValues);

    console.log(formatTable(headers, rows, ['left', 'right', 'right', 'right', 'right']));
    console.log(keyValue('Best Day', pnlColor(best, formatCurrency(best))));
    console.log(keyValue('Worst Day', pnlColor(worst, formatCurrency(worst))));
  }
}

async function cmdPositions(): Promise<void> {
  const system = await getSystem();
  const positions = system.paper.getOpenPositions();

  if (positions.length === 0) {
    console.log('\n  No open positions.');
    return;
  }

  console.log(sectionHeader(`OPEN POSITIONS (${positions.length})`));

  const headers = ['Market', 'Side', 'Size', 'Entry', 'Age'];
  const rows = positions.map(p => {
    const age = Date.now() - p.enteredAt.getTime();
    return [
      p.marketId.slice(0, 30),
      p.side,
      formatCurrency(p.size),
      p.entryPrice.toFixed(4),
      formatDuration(age),
    ];
  });

  console.log(formatTable(headers, rows, ['left', 'left', 'right', 'right', 'right']));
}

async function cmdRisk(): Promise<void> {
  const system = await getSystem();
  const state = system.risk.getState();
  const limits = system.config.riskLimits;
  const utilization = state.bankroll > 0 ? state.totalExposure / state.bankroll : 0;
  const dailyPct = state.bankroll > 0 ? state.dailyPnl / state.bankroll : 0;
  const weeklyPct = state.bankroll > 0 ? state.weeklyPnl / state.bankroll : 0;

  console.log(sectionHeader('RISK DASHBOARD'));
  console.log(keyValue('Bankroll', formatCurrency(state.bankroll)));
  console.log(keyValue('Total Exposure', formatCurrency(state.totalExposure)));
  console.log(keyValue('Utilization', formatPercent(utilization)));
  console.log('');
  console.log(keyValue('Kelly Fraction', formatPercent(limits.kellyFraction)));
  console.log(keyValue('Min Edge', formatPercent(limits.minEdge)));
  console.log(keyValue('Max Position Size', formatCurrency(limits.maxPositionSize)));
  console.log('');
  console.log(keyValue('Circuit Breaker',
    statusColor(state.circuitBreakerTripped ? 'TRIPPED' : 'ok')
    + (state.circuitBreakerReason ? ` (${state.circuitBreakerReason})` : '')));
  console.log('');
  console.log(keyValue('Daily P&L',
    pnlColor(state.dailyPnl, `${formatCurrency(state.dailyPnl)} (${formatPercent(dailyPct)})`)
    + ` / limit ${formatPercent(limits.dailyLossLimit)}`));
  console.log(keyValue('Weekly P&L',
    pnlColor(state.weeklyPnl, `${formatCurrency(state.weeklyPnl)} (${formatPercent(weeklyPct)})`)
    + ` / limit ${formatPercent(limits.weeklyLossLimit)}`));
  console.log('');
  console.log(keyValue('Open Positions', `${state.openPositions} / ${limits.maxOpenPositions}`));
}

async function cmdHealth(): Promise<void> {
  const { HealthMonitor } = await import('../engine/health-monitor.js');
  const monitor = new HealthMonitor();
  const report = await monitor.checkAll();

  console.log(sectionHeader('HEALTH REPORT'));
  console.log(keyValue('Overall', statusColor(report.overall.toUpperCase())));
  console.log(keyValue('Timestamp', formatDate(report.timestamp)));
  console.log('');

  const headers = ['Check', 'Status', 'Value', 'Threshold', 'Message'];
  const rows = report.checks.map(c => [
    c.name,
    statusColor(c.status.toUpperCase()),
    c.value !== undefined ? String(c.value) : '-',
    c.threshold !== undefined ? String(c.threshold) : '-',
    c.message,
  ]);

  console.log(formatTable(headers, rows, ['left', 'left', 'right', 'right', 'left']));
}

async function cmdDrift(): Promise<void> {
  const system = await getSystem();
  const report = system.drift.getReport();

  console.log(sectionHeader('DRIFT MONITOR'));
  console.log(keyValue('Baseline', report.baselineEstablished ? colorize('Established', 'green') : colorize('Not yet (need more trades)', 'yellow')));
  console.log(keyValue('Total Trades', `${report.totalTrades}`));
  console.log(keyValue('System Healthy', statusColor(system.drift.isHealthy() ? 'ok' : 'warn')));

  if (report.baselineEstablished) {
    const m = report.metrics;
    console.log('');

    const headers = ['Dimension', 'Current', 'Baseline', 'Z-Score', 'Trend', 'Alert'];
    const rows = [
      buildDriftRow('Win Rate', m.winRate),
      buildDriftRow('EV/Trade', m.evPerTrade),
      buildDriftRow('Edge Accuracy', m.edgeAccuracy),
      buildDriftRow('Execution', m.executionQuality),
    ];

    console.log(formatTable(headers, rows, ['left', 'right', 'right', 'right', 'left', 'left']));

    // Overall recommendation
    const anyAlert = m.winRate.alertTriggered || m.evPerTrade.alertTriggered
      || m.edgeAccuracy.alertTriggered || m.executionQuality.alertTriggered;
    const worstTrend = [m.winRate.trend, m.evPerTrade.trend, m.edgeAccuracy.trend, m.executionQuality.trend]
      .includes('degrading') ? 'degrading' : 'stable';

    console.log('');
    console.log(keyValue('Recommendation',
      anyAlert ? colorize('REVIEW STRATEGIES - drift alerts active', 'red')
        : worstTrend === 'degrading' ? colorize('MONITOR - some metrics degrading', 'yellow')
          : colorize('ON TRACK - all metrics within range', 'green')));
  }
}

function buildDriftRow(name: string, metric: { current: number; baseline: number; zScore: number; trend: string; alertTriggered: boolean }): string[] {
  return [
    name,
    metric.current.toFixed(4),
    metric.baseline.toFixed(4),
    metric.zScore.toFixed(2),
    statusColor(metric.trend),
    metric.alertTriggered ? colorize('YES', 'red') : colorize('no', 'dim'),
  ];
}

async function cmdStrategies(): Promise<void> {
  const system = await getSystem();
  const stats = system.store.getStats();

  console.log(sectionHeader('STRATEGY PERFORMANCE'));

  if (Object.keys(stats.byStrategy).length === 0) {
    console.log('\n  No strategy data yet.');
    return;
  }

  // Get ACE version info
  const { AceEvolver } = await import('../learning/ace-evolver.js');
  const ace = new AceEvolver();

  const headers = ['Strategy', 'Trades', 'Win Rate', 'P&L', 'Avg P&L', 'ACE Version', 'Status'];
  const rows = Object.entries(stats.byStrategy).map(([strat, data]) => {
    const avgPnl = data.count > 0 ? data.pnl / data.count : 0;
    const version = ace.getPromptVersion(strat as TradeExperience['strategy']);
    const active = system.config.enabledStrategies.includes(strat as TradeExperience['strategy']);
    return [
      strat,
      `${data.count}`,
      formatPercent(data.winRate),
      pnlColor(data.pnl, formatCurrency(data.pnl)),
      pnlColor(avgPnl, formatCurrency(avgPnl)),
      `v${version.version}`,
      active ? colorize('ACTIVE', 'green') : colorize('disabled', 'dim'),
    ];
  });

  console.log(formatTable(headers, rows, ['left', 'right', 'right', 'right', 'right', 'left', 'left']));
}

async function cmdVerticals(): Promise<void> {
  const system = await getSystem();
  const stats = system.store.getStats();

  console.log(sectionHeader('VERTICAL PERFORMANCE'));

  if (Object.keys(stats.byVertical).length === 0) {
    console.log('\n  No vertical data yet.');
    return;
  }

  const trades = system.store.getRecent(10000);
  const headers = ['Vertical', 'Trades', 'Win Rate', 'P&L', 'Active Markets', 'Last Trade'];
  const rows = Object.entries(stats.byVertical).map(([vert, data]) => {
    const vertTrades = trades.filter(t => t.vertical === vert);
    const lastTrade = vertTrades.length > 0 ? vertTrades[0] : null;
    const active = system.config.enabledVerticals.includes(vert as TradeExperience['vertical']);
    return [
      vert,
      `${data.count}`,
      formatPercent(data.winRate),
      pnlColor(data.pnl, formatCurrency(data.pnl)),
      active ? colorize('YES', 'green') : colorize('no', 'dim'),
      lastTrade ? formatDate(lastTrade.timestamp) : '-',
    ];
  });

  console.log(formatTable(headers, rows, ['left', 'right', 'right', 'right', 'left', 'left']));
}

async function cmdReview(): Promise<void> {
  console.log(sectionHeader('PAPER TRADING REVIEW'));
  try {
    const { PaperTradingReviewer } = await import('../engine/paper-review.js');
    const system = await getSystem();
    const reviewer = new PaperTradingReviewer();
    const trades = system.store.getRecent(10000);
    const report = reviewer.analyze(trades);

    console.log(keyValue('Period', `${report.period.days} days`));
    console.log(keyValue('Total Trades', `${report.totalTrades}`));
    console.log(keyValue('Win Rate', formatPercent(report.winRate)));
    console.log(keyValue('Total P&L', pnlColor(report.totalPnl, formatCurrency(report.totalPnl))));
    console.log(keyValue('Avg P&L/Trade', pnlColor(report.avgPnlPerTrade, formatCurrency(report.avgPnlPerTrade))));
    console.log(keyValue('Sharpe Ratio', report.sharpeRatio.toFixed(2)));
    console.log(keyValue('Max Drawdown', formatPercent(report.maxDrawdown)));
    console.log(keyValue('Profit Factor', report.profitFactor.toFixed(2)));
    console.log(keyValue('Best Trade', pnlColor(report.bestTrade.pnl, formatCurrency(report.bestTrade.pnl))));
    console.log(keyValue('Worst Trade', pnlColor(report.worstTrade.pnl, formatCurrency(report.worstTrade.pnl))));
    console.log(keyValue('Avg Holding', `${report.avgHoldingPeriod.toFixed(1)}h`));
    console.log(keyValue('Consec. Wins', `${report.consecutiveWins}`));
    console.log(keyValue('Consec. Losses', `${report.consecutiveLosses}`));

    // Edge persistence
    const ep = report.edgePersistence;
    console.log(sectionHeader('EDGE PERSISTENCE'));
    console.log(keyValue('Period 1 WR', formatPercent(ep.period1WR)));
    console.log(keyValue('Period 2 WR', formatPercent(ep.period2WR)));
    console.log(keyValue('Period 3 WR', formatPercent(ep.period3WR)));
    console.log(keyValue('Consistent', ep.isConsistent ? colorize('YES', 'green') : colorize('NO', 'red')));

    // By vertical
    if (Object.keys(report.byVertical).length > 0) {
      console.log(sectionHeader('BY VERTICAL'));
      const headers = ['Vertical', 'Trades', 'Win Rate', 'P&L'];
      const rows = Object.entries(report.byVertical).map(([v, d]) => [
        v, `${d.trades}`, formatPercent(d.winRate), pnlColor(d.pnl, formatCurrency(d.pnl)),
      ]);
      console.log(formatTable(headers, rows, ['left', 'right', 'right', 'right']));
    }
  } catch {
    console.log('\n  Paper Review module not available yet.');
    console.log('  Run basic stats instead:\n');
    await cmdPnl({});
  }
}

async function cmdGate(): Promise<void> {
  console.log(sectionHeader('GO/NO-GO GATE'));
  try {
    const { GoNoGoGate } = await import('../engine/go-nogo-gate.js');
    const { PaperTradingReviewer } = await import('../engine/paper-review.js');
    const system = await getSystem();

    // Build review report first
    const reviewer = new PaperTradingReviewer();
    const trades = system.store.getRecent(10000);
    const report = reviewer.analyze(trades);

    // Evaluate gate
    const gate = new GoNoGoGate();
    const riskState = system.risk.getState();
    const driftHealthy = system.drift.isHealthy();
    const result = gate.evaluate(report, riskState, driftHealthy);

    console.log(keyValue('Recommendation', statusColor(result.recommendation)));
    console.log(keyValue('Score', `${result.score}/100`));
    console.log(keyValue('Passed', result.passed ? colorize('YES', 'green') : colorize('NO', 'red')));
    console.log('');

    const headers = ['Criterion', 'Required', 'Actual', 'Result'];
    const rows = result.criteria.map(c => [
      c.name,
      String(c.required),
      String(c.actual),
      c.passed ? colorize('PASS', 'green') : colorize('FAIL', 'red'),
    ]);

    console.log(formatTable(headers, rows, ['left', 'right', 'right', 'left']));
  } catch {
    console.log('\n  Go/No-Go gate module not available yet.');
    console.log('  Paper trading must complete before gate evaluation.');
  }
}

async function cmdMarkets(flags: Record<string, string | boolean>): Promise<void> {
  const system = await getSystem();
  const searchQuery = typeof flags['search'] === 'string' ? flags['search'] : undefined;
  const vertical = typeof flags['vertical'] === 'string' ? flags['vertical'] : undefined;
  const limit = typeof flags['limit'] === 'string' ? parseInt(flags['limit'], 10) : 20;

  console.log(sectionHeader('ACTIVE MARKETS'));

  try {
    let markets;
    if (searchQuery) {
      markets = await system.client.searchMarkets(searchQuery);
    } else {
      markets = await system.client.getMarkets({ active: true, limit });
    }

    if (vertical) {
      markets = markets.filter(m => m.vertical === vertical);
    }

    markets = markets.slice(0, limit);

    if (markets.length === 0) {
      console.log('\n  No markets found.');
      return;
    }

    const headers = ['Question', 'Volume', 'YES', 'NO', 'End Date', 'Vertical'];
    const rows = markets.map(m => [
      m.question.slice(0, 45),
      formatCurrency(m.volume),
      m.tokens.yes.price.toFixed(2),
      m.tokens.no.price.toFixed(2),
      m.endDate ? formatDate(m.endDate) : '-',
      m.vertical,
    ]);

    console.log(formatTable(headers, rows, ['left', 'right', 'right', 'right', 'left', 'left']));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`\n  ${colorize('Error fetching markets:', 'red')} ${msg}`);
  }
}

async function cmdConfig(): Promise<void> {
  const system = await getSystem();
  const c = system.config;
  const l = c.riskLimits;

  console.log(sectionHeader('CONFIGURATION'));

  console.log(keyValue('Mode', colorize(c.mode.toUpperCase(), 'cyan')));
  console.log(keyValue('Enabled Verticals', c.enabledVerticals.join(', ')));
  console.log(keyValue('Enabled Strategies', c.enabledStrategies.join(', ')));
  console.log(keyValue('Poll Interval', formatDuration(c.pollIntervalMs)));
  console.log(keyValue('Drift Monitor', c.driftMonitorEnabled ? 'enabled' : 'disabled'));
  console.log(keyValue('ACE Evolution', c.aceEvolutionEnabled ? 'enabled' : 'disabled'));
  console.log(keyValue('Telegram Alerts', c.telegramAlerts ? 'enabled' : 'disabled'));

  console.log(sectionHeader('RISK LIMITS'));
  console.log(keyValue('Max Position Size', formatCurrency(l.maxPositionSize)));
  console.log(keyValue('Max Bankroll %', formatPercent(l.maxBankrollPercent)));
  console.log(keyValue('Kelly Fraction', formatPercent(l.kellyFraction)));
  console.log(keyValue('Daily Loss Limit', formatPercent(l.dailyLossLimit)));
  console.log(keyValue('Weekly Loss Limit', formatPercent(l.weeklyLossLimit)));
  console.log(keyValue('Min Edge', formatPercent(l.minEdge)));
  console.log(keyValue('Min Liquidity', formatCurrency(l.minLiquidity)));
  console.log(keyValue('Max Open Positions', `${l.maxOpenPositions}`));

  console.log(sectionHeader('API ENDPOINTS'));
  const { POLYMARKET_API, KALSHI_API } = await import('../config/defaults.js');
  console.log(keyValue('Polymarket Gamma', POLYMARKET_API.gamma));
  console.log(keyValue('Polymarket CLOB', POLYMARKET_API.clob));
  console.log(keyValue('Polymarket Data', POLYMARKET_API.data));
  console.log(keyValue('Kalshi Base', KALSHI_API.base));
}

function cmdVersion(): void {
  console.log(sectionHeader('VERSION'));
  console.log(keyValue('Name', '@polymarket/trader'));
  console.log(keyValue('Version', '0.1.0'));
  console.log(keyValue('Node', process.version));
  console.log(keyValue('Platform', `${process.platform} ${process.arch}`));
  console.log(keyValue('Mode', 'paper'));
}

async function cmdBot(flags: Record<string, string | boolean>): Promise<void> {
  const action = flags['start'] ? 'start' : flags['stop'] ? 'stop' : flags['status'] ? 'status' : 'start';

  if (action === 'status') {
    const token = process.env['TELEGRAM_BOT_TOKEN'];
    const chatId = process.env['TELEGRAM_CHAT_ID'];
    console.log(sectionHeader('TELEGRAM BOT'));
    console.log(keyValue('Token', token ? colorize('configured', 'green') : colorize('NOT SET', 'red')));
    console.log(keyValue('Chat ID', chatId ? colorize(chatId, 'green') : colorize('NOT SET', 'red')));
    return;
  }

  if (action === 'start') {
    console.log(sectionHeader('TELEGRAM BOT'));
    console.log(keyValue('Action', 'Starting...'));

    const system = await getSystem();
    const { TradingBot } = await import('../telegram/bot.js');
    const bot = new TradingBot(system);

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('\n  Stopping bot...');
      await bot.stop();
      system.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown());
    process.on('SIGTERM', () => void shutdown());

    system.start();
    await bot.start();

    console.log(keyValue('Status', colorize('RUNNING', 'green')));
    console.log(keyValue('Info', 'Press Ctrl+C to stop'));

    // Keep alive
    await new Promise(() => {});
  }
}

async function cmdDashboard(flags: Record<string, string | boolean>): Promise<void> {
  const port = typeof flags['port'] === 'string' ? parseInt(flags['port'], 10) : 3737;

  console.log(sectionHeader('WEB DASHBOARD'));
  console.log(keyValue('Action', 'Starting...'));

  const system = await getSystem();
  const { DashboardServer } = await import('../dashboard/server.js');
  const dashboard = new DashboardServer(system, { port, refreshIntervalMs: 60_000 });

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n  Stopping dashboard...');
    await dashboard.stop();
    system.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  system.start();
  await dashboard.start(port);

  console.log(keyValue('URL', colorize(`http://localhost:${port}`, 'cyan')));
  console.log(keyValue('Status', colorize('RUNNING', 'green')));
  console.log(keyValue('Info', 'Press Ctrl+C to stop'));

  // Keep alive
  await new Promise(() => {});
}

function cmdHelp(): void {
  console.log(`
${colorize('pm-trader', 'bold')} — Autonomous Polymarket prediction market trading CLI

${colorize('USAGE', 'cyan')}
  pm-trader <command> [options]

${colorize('COMMANDS', 'cyan')}
  ${colorize('status', 'bold')}                           Full system overview
  ${colorize('trades', 'bold')}   [--limit N] [--vertical V] [--strategy S]
                                   Trade history with filters
  ${colorize('pnl', 'bold')}      [--period daily|weekly|monthly|all]
                                   P&L breakdown report
  ${colorize('positions', 'bold')}                        Open positions
  ${colorize('risk', 'bold')}                             Risk dashboard
  ${colorize('health', 'bold')}                           Detailed health checks
  ${colorize('drift', 'bold')}                            Drift monitor report
  ${colorize('strategies', 'bold')}                       Strategy performance
  ${colorize('verticals', 'bold')}                        Vertical performance
  ${colorize('review', 'bold')}                           Paper trading review
  ${colorize('gate', 'bold')}                             Go/No-Go gate evaluation
  ${colorize('markets', 'bold')}  [--search Q] [--vertical V] [--limit N]
                                   Browse active markets
  ${colorize('bot', 'bold')}      [--start|--stop|--status]
                                   Telegram bot control
  ${colorize('dashboard', 'bold')}  [--port 3737]             Web dashboard (observability)
  ${colorize('config', 'bold')}                           Show configuration
  ${colorize('version', 'bold')}                          Version info
  ${colorize('help', 'bold')}                             This help text
`);
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const COMMANDS: Record<string, (args: ParsedArgs) => Promise<void> | void> = {
  status:     () => cmdStatus(),
  trades:     (a) => cmdTrades(a.flags),
  pnl:        (a) => cmdPnl(a.flags),
  positions:  () => cmdPositions(),
  risk:       () => cmdRisk(),
  health:     () => cmdHealth(),
  drift:      () => cmdDrift(),
  strategies: () => cmdStrategies(),
  verticals:  () => cmdVerticals(),
  review:     () => cmdReview(),
  gate:       () => cmdGate(),
  markets:    (a) => cmdMarkets(a.flags),
  bot:        (a) => cmdBot(a.flags),
  dashboard:  (a) => cmdDashboard(a.flags),
  config:     () => cmdConfig(),
  version:    () => cmdVersion(),
  help:       () => cmdHelp(),
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv);
  const handler = COMMANDS[parsed.command];

  if (!handler) {
    console.error(`\n  ${colorize('Unknown command:', 'red')} ${parsed.command}`);
    cmdHelp();
    process.exit(1);
  }

  try {
    await handler(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n  ${colorize('Error:', 'red')} ${msg}`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
