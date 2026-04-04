/**
 * Telegram Message Formatters.
 * Formats trading data for Telegram MarkdownV2 parse mode.
 * Zero external dependencies.
 */

import type {
  RiskState,
  DriftMetrics,
  GateResult,
  TradeSignal,
  TradeExperience,
} from '../types/index.js';
import type { HealthReport } from '../engine/health-monitor.js';

// ---------------------------------------------------------------------------
// MarkdownV2 escaping
// ---------------------------------------------------------------------------

/**
 * Escape special characters for Telegram MarkdownV2.
 * Characters: _ * [ ] ( ) ~ ` > # + - = | { } . !
 */
export function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

/** Escape but preserve intentional formatting markers. */
function esc(text: string): string {
  return escapeMarkdownV2(String(text));
}

/** Bold text in MarkdownV2. */
function bold(text: string): string {
  return `*${esc(text)}*`;
}

/** Inline code in MarkdownV2. */
function code(text: string): string {
  return `\`${text.replace(/`/g, "'")}\``;
}

// ---------------------------------------------------------------------------
// Visual helpers
// ---------------------------------------------------------------------------

/** Progress bar: [========--] 80% */
export function progressBar(value: number, max: number, width = 10): string {
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const filled = Math.round(pct * width);
  const empty = width - filled;
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
  return `\\[${esc(bar)}\\] ${esc((pct * 100).toFixed(0))}%`;
}

/** P&L emoji: up or down. */
function pnlEmoji(pnl: number): string {
  return pnl >= 0 ? '\u{1F4C8}' : '\u{1F4C9}';
}

/** Status dot: green, yellow, red. */
export function statusDot(level: 'ok' | 'warn' | 'fail' | 'healthy' | 'degraded' | 'critical' | string): string {
  switch (level) {
    case 'ok':
    case 'healthy':
      return '\u{1F7E2}';
    case 'warn':
    case 'degraded':
      return '\u{1F7E1}';
    case 'fail':
    case 'critical':
      return '\u{1F534}';
    default:
      return '\u26AA';
  }
}

/** Trend arrow. */
function trendArrow(trend: 'improving' | 'stable' | 'degrading' | string): string {
  switch (trend) {
    case 'improving': return '\u2197\uFE0F';
    case 'stable': return '\u2192';
    case 'degrading': return '\u2198\uFE0F';
    default: return '\u2192';
  }
}

/** Format currency. */
function fmtCurrency(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}$${n.toFixed(2)}`;
}

/** Format percent. */
function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// System Status
// ---------------------------------------------------------------------------

export interface SystemStatusData {
  mode: 'paper' | 'live';
  uptime: number;
  openPositions: number;
  dailyPnl: number;
  totalPnl: number;
  winRate: number;
  health: 'healthy' | 'degraded' | 'critical';
  circuitBreaker: boolean;
  enabledStrategies: string[];
  enabledVerticals: string[];
  bankroll: number;
}

export function formatStatus(data: SystemStatusData): string {
  const modeIcon = data.mode === 'live' ? '\u{1F534} LIVE' : '\u{1F7E2} PAPER';
  const uptimeH = Math.floor(data.uptime / 3600000);
  const uptimeM = Math.floor((data.uptime % 3600000) / 60000);

  const lines = [
    bold('POLYMARKET TRADER'),
    '',
    `${esc('Mode:')} ${esc(modeIcon)}`,
    `${esc('Uptime:')} ${code(`${uptimeH}h ${uptimeM}m`)}`,
    `${esc('Health:')} ${statusDot(data.health)} ${esc(data.health.toUpperCase())}`,
    `${esc('Circuit Breaker:')} ${data.circuitBreaker ? '\u{1F534} TRIPPED' : '\u{1F7E2} OK'}`,
    '',
    `${pnlEmoji(data.dailyPnl)} ${esc('Daily P&L:')} ${code(fmtCurrency(data.dailyPnl))}`,
    `${pnlEmoji(data.totalPnl)} ${esc('Total P&L:')} ${code(fmtCurrency(data.totalPnl))}`,
    `${esc('Win Rate:')} ${code(fmtPct(data.winRate))}`,
    `${esc('Bankroll:')} ${code('$' + data.bankroll.toFixed(2))}`,
    `${esc('Open Positions:')} ${code(String(data.openPositions))}`,
    '',
    `${esc('Strategies:')} ${code(data.enabledStrategies.join(', '))}`,
    `${esc('Verticals:')} ${code(data.enabledVerticals.join(', '))}`,
  ];

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// P&L Report
// ---------------------------------------------------------------------------

export interface PnlData {
  totalPnl: number;
  dailyPnl: number;
  weeklyPnl: number;
  monthlyPnl: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  avgPnl: number;
  bestDay: number;
  worstDay: number;
}

export function formatPnL(data: PnlData): string {
  const lines = [
    bold('P&L REPORT'),
    '',
    `${pnlEmoji(data.dailyPnl)} ${esc('Today:')} ${code(fmtCurrency(data.dailyPnl))}`,
    `${pnlEmoji(data.weeklyPnl)} ${esc('This Week:')} ${code(fmtCurrency(data.weeklyPnl))}`,
    `${pnlEmoji(data.monthlyPnl)} ${esc('This Month:')} ${code(fmtCurrency(data.monthlyPnl))}`,
    `${pnlEmoji(data.totalPnl)} ${esc('All Time:')} ${code(fmtCurrency(data.totalPnl))}`,
    '',
    `${esc('Trades:')} ${code(`${data.totalTrades} (${data.wins}W / ${data.losses}L)`)}`,
    `${esc('Win Rate:')} ${code(fmtPct(data.winRate))}`,
    `${esc('Avg P&L/Trade:')} ${code(fmtCurrency(data.avgPnl))}`,
    '',
    `${esc('Best Day:')} ${code(fmtCurrency(data.bestDay))}`,
    `${esc('Worst Day:')} ${code(fmtCurrency(data.worstDay))}`,
  ];

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Positions
// ---------------------------------------------------------------------------

export interface PositionData {
  marketId: string;
  question?: string;
  side: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  enteredAt: Date;
}

export function formatPositions(positions: PositionData[]): string {
  if (positions.length === 0) {
    return `${bold('POSITIONS')}\n\n${esc('No open positions.')}`;
  }

  const lines = [bold(`POSITIONS (${positions.length})`)];

  for (const p of positions) {
    const label = p.question ? p.question.slice(0, 35) : p.marketId.slice(0, 16);
    const age = Date.now() - p.enteredAt.getTime();
    const ageH = Math.floor(age / 3600000);

    lines.push('');
    lines.push(`${pnlEmoji(p.unrealizedPnl)} ${bold(label)}`);
    lines.push(`  ${esc('Side:')} ${code(p.side)} ${esc('Size:')} ${code('$' + p.size.toFixed(2))}`);
    lines.push(`  ${esc('Entry:')} ${code(p.entryPrice.toFixed(4))} ${esc('Current:')} ${code(p.currentPrice.toFixed(4))}`);
    lines.push(`  ${esc('Unrealized:')} ${code(fmtCurrency(p.unrealizedPnl))} ${esc('Age:')} ${code(ageH + 'h')}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Trades
// ---------------------------------------------------------------------------

export function formatTrades(trades: TradeExperience[], page: number, pageSize: number): string {
  const totalPages = Math.max(1, Math.ceil(trades.length / pageSize));
  const start = (page - 1) * pageSize;
  const slice = trades.slice(start, start + pageSize);

  if (slice.length === 0) {
    return `${bold('TRADES')}\n\n${esc('No trades found.')}`;
  }

  const lines = [bold(`TRADES (Page ${page}/${totalPages})`)];

  for (const t of slice) {
    const date = t.timestamp instanceof Date
      ? t.timestamp.toISOString().split('T')[0]
      : String(t.timestamp).split('T')[0];
    const outcomeIcon = t.outcome === 'WIN' ? '\u2705' : t.outcome === 'LOSS' ? '\u274C' : '\u23F3';

    lines.push('');
    lines.push(`${outcomeIcon} ${code(date)} ${esc(t.marketQuestion.slice(0, 30))}`);
    lines.push(`  ${code(t.side)} ${code('$' + t.positionSize.toFixed(2))} ${esc('@')} ${code(t.entryPrice.toFixed(4))} ${esc('->')} ${code(t.outcome === 'PENDING' ? '...' : t.exitPrice.toFixed(4))}`);
    lines.push(`  ${esc('P&L:')} ${code(fmtCurrency(t.pnl))} ${esc('Strategy:')} ${code(t.strategy)}`);
  }

  lines.push('');
  lines.push(`${esc(`Showing ${start + 1}-${start + slice.length} of ${trades.length}`)}`);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Risk Dashboard
// ---------------------------------------------------------------------------

export function formatRisk(state: RiskState, limits?: { dailyLossLimit: number; weeklyLossLimit: number; maxOpenPositions: number; maxPositionSize: number; kellyFraction: number; minEdge: number }): string {
  const lines = [
    bold('RISK DASHBOARD'),
    '',
    `${esc('Bankroll:')} ${code('$' + state.bankroll.toFixed(2))}`,
    `${esc('Exposure:')} ${code('$' + state.totalExposure.toFixed(2))}`,
    `${esc('Open Positions:')} ${code(String(state.openPositions))}`,
    '',
    `${pnlEmoji(state.dailyPnl)} ${esc('Daily P&L:')} ${code(fmtCurrency(state.dailyPnl))}`,
    `${pnlEmoji(state.weeklyPnl)} ${esc('Weekly P&L:')} ${code(fmtCurrency(state.weeklyPnl))}`,
    '',
    `${esc('Circuit Breaker:')} ${state.circuitBreakerTripped ? '\u{1F534} TRIPPED' : '\u{1F7E2} OK'}`,
  ];

  if (state.circuitBreakerReason) {
    lines.push(`  ${esc('Reason:')} ${code(state.circuitBreakerReason)}`);
  }

  if (limits) {
    lines.push('');
    lines.push(bold('LIMITS'));
    lines.push(`${esc('Max Position:')} ${code('$' + limits.maxPositionSize.toFixed(0))}`);
    lines.push(`${esc('Kelly Fraction:')} ${code(fmtPct(limits.kellyFraction))}`);
    lines.push(`${esc('Min Edge:')} ${code(fmtPct(limits.minEdge))}`);
    lines.push(`${esc('Daily Loss Limit:')} ${code(fmtPct(limits.dailyLossLimit))}`);
    lines.push(`${esc('Weekly Loss Limit:')} ${code(fmtPct(limits.weeklyLossLimit))}`);
    lines.push(`${esc('Max Open Positions:')} ${code(String(limits.maxOpenPositions))}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Health Report
// ---------------------------------------------------------------------------

export function formatHealth(report: HealthReport): string {
  const lines = [
    bold('HEALTH REPORT'),
    '',
    `${statusDot(report.overall)} ${esc('Overall:')} ${bold(report.overall.toUpperCase())}`,
    '',
  ];

  for (const check of report.checks) {
    const icon = check.status === 'ok' ? '\u2705' : check.status === 'warn' ? '\u26A0\uFE0F' : '\u274C';
    lines.push(`${icon} ${bold(check.name)}`);
    lines.push(`  ${esc(check.message)}`);
    if (check.value !== undefined) {
      lines.push(`  ${esc('Value:')} ${code(String(check.value))}${check.threshold !== undefined ? ` ${esc('/')} ${code(String(check.threshold))}` : ''}`);
    }
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Drift Report
// ---------------------------------------------------------------------------

export function formatDrift(metrics: DriftMetrics, baselineEstablished: boolean, totalTrades: number): string {
  if (!baselineEstablished) {
    return `${bold('DRIFT MONITOR')}\n\n${esc('Baseline not yet established.')}\n${esc('Trades:')} ${code(String(totalTrades))} ${esc('(need 50+)')}`;
  }

  const lines = [
    bold('DRIFT MONITOR'),
    '',
    `${esc('Total Trades:')} ${code(String(totalTrades))}`,
    '',
  ];

  const dims: Array<[string, typeof metrics.winRate]> = [
    ['Win Rate', metrics.winRate],
    ['EV/Trade', metrics.evPerTrade],
    ['Edge Accuracy', metrics.edgeAccuracy],
    ['Execution', metrics.executionQuality],
  ];

  for (const [name, m] of dims) {
    const alertIcon = m.alertTriggered ? '\u{1F6A8}' : '\u2705';
    lines.push(`${alertIcon} ${bold(name)} ${trendArrow(m.trend)}`);
    lines.push(`  ${esc('Current:')} ${code(m.current.toFixed(4))} ${esc('Baseline:')} ${code(m.baseline.toFixed(4))}`);
    lines.push(`  ${esc('Z-Score:')} ${code(m.zScore.toFixed(2))} ${esc('Trend:')} ${esc(m.trend)}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Strategy Stats
// ---------------------------------------------------------------------------

export function formatStrategies(stats: Record<string, { count: number; winRate: number; pnl: number }>): string {
  const entries = Object.entries(stats);
  if (entries.length === 0) {
    return `${bold('STRATEGIES')}\n\n${esc('No strategy data yet.')}`;
  }

  const lines = [bold('STRATEGY PERFORMANCE'), ''];

  for (const [name, data] of entries) {
    lines.push(`${bold(name)}`);
    lines.push(`  ${esc('Trades:')} ${code(String(data.count))} ${esc('WR:')} ${code(fmtPct(data.winRate))} ${pnlEmoji(data.pnl)} ${code(fmtCurrency(data.pnl))}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Verticals
// ---------------------------------------------------------------------------

export function formatVerticals(stats: Record<string, { count: number; winRate: number; pnl: number }>): string {
  const entries = Object.entries(stats);
  if (entries.length === 0) {
    return `${bold('VERTICALS')}\n\n${esc('No vertical data yet.')}`;
  }

  const lines = [bold('VERTICAL PERFORMANCE'), ''];

  for (const [name, data] of entries) {
    lines.push(`${bold(name)}`);
    lines.push(`  ${esc('Trades:')} ${code(String(data.count))} ${esc('WR:')} ${code(fmtPct(data.winRate))} ${pnlEmoji(data.pnl)} ${code(fmtCurrency(data.pnl))}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Markets
// ---------------------------------------------------------------------------

export interface MarketData {
  id: string;
  question: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  vertical: string;
}

export function formatMarkets(markets: MarketData[]): string {
  if (markets.length === 0) {
    return `${bold('MARKETS')}\n\n${esc('No markets found.')}`;
  }

  const lines = [bold(`MARKETS (${markets.length})`), ''];

  for (const m of markets) {
    lines.push(`${bold(m.question.slice(0, 40))}`);
    lines.push(`  ${esc('YES:')} ${code(m.yesPrice.toFixed(2))} ${esc('NO:')} ${code(m.noPrice.toFixed(2))} ${esc('Vol:')} ${code('$' + Math.round(m.volume).toLocaleString())} ${esc('[')}${code(m.vertical)}${esc(']')}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Whale Activity
// ---------------------------------------------------------------------------

export interface WhaleActivityData {
  walletLabel: string;
  walletAddress: string;
  marketId: string;
  side: string;
  size: number;
  whaleWinRate: number;
  confidence: number;
  timestamp: Date;
}

export function formatWhaleActivity(signals: WhaleActivityData[]): string {
  if (signals.length === 0) {
    return `${bold('WHALE TRACKER')}\n\n${esc('No recent whale activity.')}`;
  }

  const lines = [bold(`WHALE ACTIVITY (${signals.length})`), ''];

  for (const s of signals) {
    lines.push(`\u{1F40B} ${bold(s.walletLabel)} ${code(s.walletAddress.slice(0, 10) + '...')}`);
    lines.push(`  ${code(s.side)} ${code('$' + s.size.toFixed(0))} ${esc('on')} ${code(s.marketId.slice(0, 16))}`);
    lines.push(`  ${esc('WR:')} ${code(fmtPct(s.whaleWinRate))} ${esc('Conf:')} ${code(fmtPct(s.confidence))}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Go/No-Go Gate
// ---------------------------------------------------------------------------

export function formatGate(result: GateResult): string {
  const recIcon = result.recommendation === 'GO' ? '\u{1F7E2}'
    : result.recommendation === 'CONDITIONAL' ? '\u{1F7E1}'
    : '\u{1F534}';

  const lines = [
    bold('GO/NO\\-GO GATE'),
    '',
    `${recIcon} ${esc('Recommendation:')} ${bold(result.recommendation)}`,
    `${esc('Score:')} ${code(`${result.score}/100`)}`,
    `${esc('Passed:')} ${result.passed ? '\u2705' : '\u274C'}`,
    '',
  ];

  for (const c of result.criteria) {
    const icon = c.passed ? '\u2705' : '\u274C';
    lines.push(`${icon} ${esc(c.name)}`);
    lines.push(`  ${esc('Required:')} ${code(String(c.required))} ${esc('Actual:')} ${code(String(c.actual))}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Trade Alert (new signal)
// ---------------------------------------------------------------------------

export function formatTradeAlert(signal: TradeSignal): string {
  const lines = [
    '\u{1F6A8} ' + bold('NEW SIGNAL'),
    '',
    `${esc('Market:')} ${code(signal.marketId.slice(0, 20))}`,
    `${esc('Strategy:')} ${code(signal.strategy)}`,
    `${esc('Vertical:')} ${code(signal.vertical)}`,
    `${esc('Side:')} ${code(signal.side)}`,
    `${esc('Edge:')} ${code(fmtPct(signal.edge))}`,
    `${esc('Confidence:')} ${code(fmtPct(signal.confidence))}`,
    `${esc('Model Prob:')} ${code(fmtPct(signal.modelProbability))}`,
    `${esc('Market Prob:')} ${code(fmtPct(signal.marketProbability))}`,
    `${esc('Suggested Size:')} ${code('$' + signal.suggestedSize.toFixed(2))}`,
    '',
    `${esc('Reasoning:')} ${esc(signal.reasoning.slice(0, 100))}`,
  ];

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export function formatError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  return `\u274C ${bold('ERROR')}\n\n${esc(msg)}\n\n${esc('Check logs for more details.')}`;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface ConfigData {
  mode: string;
  enabledVerticals: string[];
  enabledStrategies: string[];
  riskLimits: {
    maxPositionSize: number;
    kellyFraction: number;
    minEdge: number;
    dailyLossLimit: number;
    weeklyLossLimit: number;
    maxOpenPositions: number;
    maxBankrollPercent: number;
    minLiquidity: number;
  };
  pollIntervalMs: number;
  telegramAlerts: boolean;
}

export function formatConfig(data: ConfigData): string {
  const lines = [
    bold('CONFIGURATION'),
    '',
    `${esc('Mode:')} ${code(data.mode.toUpperCase())}`,
    `${esc('Verticals:')} ${code(data.enabledVerticals.join(', '))}`,
    `${esc('Strategies:')} ${code(data.enabledStrategies.join(', '))}`,
    `${esc('Poll Interval:')} ${code((data.pollIntervalMs / 1000) + 's')}`,
    `${esc('Telegram:')} ${code(data.telegramAlerts ? 'ON' : 'OFF')}`,
    '',
    bold('RISK LIMITS'),
    `${esc('Max Position:')} ${code('$' + data.riskLimits.maxPositionSize)}`,
    `${esc('Max Bankroll %:')} ${code(fmtPct(data.riskLimits.maxBankrollPercent))}`,
    `${esc('Kelly Fraction:')} ${code(fmtPct(data.riskLimits.kellyFraction))}`,
    `${esc('Min Edge:')} ${code(fmtPct(data.riskLimits.minEdge))}`,
    `${esc('Min Liquidity:')} ${code('$' + data.riskLimits.minLiquidity)}`,
    `${esc('Daily Loss Limit:')} ${code(fmtPct(data.riskLimits.dailyLossLimit))}`,
    `${esc('Weekly Loss Limit:')} ${code(fmtPct(data.riskLimits.weeklyLossLimit))}`,
    `${esc('Max Open Positions:')} ${code(String(data.riskLimits.maxOpenPositions))}`,
  ];

  return lines.join('\n');
}
