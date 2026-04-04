/**
 * Telegram Command Handlers.
 * Maps /commands and callback_query actions to responses.
 * Zero external dependencies.
 */

import type { TradingSystem } from '../index.js';
import { eventBus } from '../engine/event-bus.js';
import {
  formatStatus,
  formatPnL,
  formatPositions,
  formatTrades,
  formatRisk,
  formatHealth,
  formatDrift,
  formatStrategies,
  formatVerticals,
  formatMarkets,
  formatWhaleActivity,
  formatGate,
  formatConfig,
  formatError,
  escapeMarkdownV2,
  type SystemStatusData,
  type PnlData,
  type PositionData,
  type MarketData,
  type WhaleActivityData,
  type ConfigData,
} from './formatters.js';
import {
  mainMenuKeyboard,
  backKeyboard,
  paginationKeyboard,
  confirmationKeyboard,
  CB,
  parseCallback,
  type InlineKeyboardMarkup,
} from './keyboards.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CommandResponse {
  text: string;
  keyboard?: InlineKeyboardMarkup;
  parseMode?: 'MarkdownV2' | 'HTML';
}

export type CommandContext = {
  system: TradingSystem;
  chatId: string;
  isPaused: boolean;
  adminPassword: string;
  startedAt: Date;
  pendingSignals: Map<string, { marketId: string; side: string; strategy: string }>;
};

// ---------------------------------------------------------------------------
// Helper: build system status data from TradingSystem
// ---------------------------------------------------------------------------

function getStatusData(ctx: CommandContext): SystemStatusData {
  const risk = ctx.system.risk.getState();
  const stats = ctx.system.store.getStats();
  const driftHealthy = ctx.system.drift.isHealthy();

  return {
    mode: ctx.system.config.mode,
    uptime: Date.now() - ctx.startedAt.getTime(),
    openPositions: risk.openPositions,
    dailyPnl: risk.dailyPnl,
    totalPnl: stats.totalPnl,
    winRate: stats.winRate,
    health: driftHealthy ? (risk.circuitBreakerTripped ? 'critical' : 'healthy') : 'degraded',
    circuitBreaker: risk.circuitBreakerTripped,
    enabledStrategies: ctx.system.config.enabledStrategies,
    enabledVerticals: ctx.system.config.enabledVerticals,
    bankroll: risk.bankroll,
  };
}

function getPnlData(ctx: CommandContext): PnlData {
  const stats = ctx.system.store.getStats();
  const risk = ctx.system.risk.getState();

  return {
    totalPnl: stats.totalPnl,
    dailyPnl: risk.dailyPnl,
    weeklyPnl: risk.weeklyPnl,
    monthlyPnl: stats.totalPnl, // approximate — no monthly tracking yet
    totalTrades: stats.total,
    wins: stats.wins,
    losses: stats.losses,
    winRate: stats.winRate,
    avgPnl: stats.avgPnl,
    bestDay: 0,  // would require daily aggregation
    worstDay: 0,
  };
}

// ---------------------------------------------------------------------------
// Command Handlers
// ---------------------------------------------------------------------------

export function handleStart(_ctx: CommandContext): CommandResponse {
  const text = [
    `*POLYMARKET TRADER BOT*`,
    '',
    escapeMarkdownV2('Your autonomous prediction market trading assistant.'),
    escapeMarkdownV2('Use the menu below or type /help for commands.'),
  ].join('\n');

  return { text, keyboard: mainMenuKeyboard(), parseMode: 'MarkdownV2' };
}

export function handleStatus(ctx: CommandContext): CommandResponse {
  try {
    const data = getStatusData(ctx);
    return { text: formatStatus(data), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export function handlePnl(ctx: CommandContext): CommandResponse {
  try {
    const data = getPnlData(ctx);
    return { text: formatPnL(data), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export function handlePositions(ctx: CommandContext): CommandResponse {
  try {
    const paperPositions = ctx.system.paper.getOpenPositions();
    const positions: PositionData[] = paperPositions.map(p => ({
      marketId: p.marketId,
      side: p.side,
      size: p.size,
      entryPrice: p.entryPrice,
      currentPrice: p.entryPrice, // would need live price fetch
      unrealizedPnl: 0,
      enteredAt: p.enteredAt,
    }));

    return { text: formatPositions(positions), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export function handleTrades(ctx: CommandContext, page = 1, pageSize = 10): CommandResponse {
  try {
    const allTrades = ctx.system.store.getRecent(10000);
    const totalPages = Math.max(1, Math.ceil(allTrades.length / pageSize));
    const safePage = Math.max(1, Math.min(page, totalPages));

    const text = formatTrades(allTrades, safePage, pageSize);
    const keyboard = allTrades.length > pageSize
      ? paginationKeyboard(safePage, totalPages)
      : backKeyboard();

    return { text, keyboard, parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export function handleRisk(ctx: CommandContext): CommandResponse {
  try {
    const state = ctx.system.risk.getState();
    const limits = ctx.system.config.riskLimits;
    return { text: formatRisk(state, limits), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export async function handleHealth(_ctx: CommandContext): Promise<CommandResponse> {
  try {
    const { HealthMonitor } = await import('../engine/health-monitor.js');
    const monitor = new HealthMonitor();
    const report = await monitor.checkAll();
    return { text: formatHealth(report), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export function handleDrift(ctx: CommandContext): CommandResponse {
  try {
    const report = ctx.system.drift.getReport();
    const text = formatDrift(report.metrics, report.baselineEstablished, report.totalTrades);
    return { text, keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export function handleStrategies(ctx: CommandContext): CommandResponse {
  try {
    const stats = ctx.system.store.getStats();
    return { text: formatStrategies(stats.byStrategy), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export function handleVerticals(ctx: CommandContext): CommandResponse {
  try {
    const stats = ctx.system.store.getStats();
    return { text: formatVerticals(stats.byVertical), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export async function handleMarkets(ctx: CommandContext, query?: string): Promise<CommandResponse> {
  try {
    let markets;
    if (query) {
      markets = await ctx.system.client.searchMarkets(query);
    } else {
      markets = await ctx.system.client.getMarkets({ active: true, limit: 10 });
    }

    const data: MarketData[] = markets.slice(0, 10).map(m => ({
      id: m.id,
      question: m.question,
      yesPrice: m.tokens.yes.price,
      noPrice: m.tokens.no.price,
      volume: m.volume,
      vertical: m.vertical,
    }));

    return { text: formatMarkets(data), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export function handleWhales(_ctx: CommandContext): CommandResponse {
  try {
    // WhaleTracker is not directly on TradingSystem yet, so return placeholder
    const signals: WhaleActivityData[] = [];
    return { text: formatWhaleActivity(signals), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export async function handleGate(ctx: CommandContext): Promise<CommandResponse> {
  try {
    const { GoNoGoGate } = await import('../engine/go-nogo-gate.js');
    const { PaperTradingReviewer } = await import('../engine/paper-review.js');

    const reviewer = new PaperTradingReviewer();
    const trades = ctx.system.store.getRecent(10000);
    const report = reviewer.analyze(trades);

    const gate = new GoNoGoGate();
    const riskState = ctx.system.risk.getState();
    const driftHealthy = ctx.system.drift.isHealthy();
    const result = gate.evaluate(report, riskState, driftHealthy);

    return { text: formatGate(result), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export function handleConfig(ctx: CommandContext): CommandResponse {
  try {
    const data: ConfigData = {
      mode: ctx.system.config.mode,
      enabledVerticals: ctx.system.config.enabledVerticals,
      enabledStrategies: ctx.system.config.enabledStrategies,
      riskLimits: ctx.system.config.riskLimits,
      pollIntervalMs: ctx.system.config.pollIntervalMs,
      telegramAlerts: ctx.system.config.telegramAlerts,
    };

    return { text: formatConfig(data), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  } catch (err) {
    return { text: formatError(err), parseMode: 'MarkdownV2' };
  }
}

export function handleHelp(): CommandResponse {
  const text = [
    `*COMMANDS*`,
    '',
    `*Information:*`,
    `${escapeMarkdownV2('/status — System overview')}`,
    `${escapeMarkdownV2('/pnl — P&L report')}`,
    `${escapeMarkdownV2('/positions — Open positions')}`,
    `${escapeMarkdownV2('/trades [N] — Recent trades')}`,
    `${escapeMarkdownV2('/risk — Risk dashboard')}`,
    `${escapeMarkdownV2('/health — Health checks')}`,
    `${escapeMarkdownV2('/drift — Drift report')}`,
    `${escapeMarkdownV2('/strategies — Strategy stats')}`,
    `${escapeMarkdownV2('/verticals — Vertical stats')}`,
    `${escapeMarkdownV2('/markets [query] — Search markets')}`,
    `${escapeMarkdownV2('/whales — Whale activity')}`,
    `${escapeMarkdownV2('/gate — Go/No-Go status')}`,
    `${escapeMarkdownV2('/config — Current config')}`,
    '',
    `*Control:*`,
    `${escapeMarkdownV2('/pause — Pause trading')}`,
    `${escapeMarkdownV2('/resume — Resume trading')}`,
    `${escapeMarkdownV2('/emergency — Emergency shutdown')}`,
    `${escapeMarkdownV2('/circuit_reset — Reset circuit breaker')}`,
    `${escapeMarkdownV2('/add_whale [addr] [label] — Watch wallet')}`,
    `${escapeMarkdownV2('/remove_whale [addr] — Unwatch wallet')}`,
    `${escapeMarkdownV2('/set_mode [paper|live] — Switch mode')}`,
    `${escapeMarkdownV2('/approve_signal [id] — Approve signal')}`,
    `${escapeMarkdownV2('/skip_signal [id] — Skip signal')}`,
  ].join('\n');

  return { text, keyboard: mainMenuKeyboard(), parseMode: 'MarkdownV2' };
}

// ---------------------------------------------------------------------------
// Control Commands
// ---------------------------------------------------------------------------

export function handlePause(_ctx: CommandContext): CommandResponse {
  const text = escapeMarkdownV2('Are you sure you want to PAUSE trading? Monitoring will continue.');
  return { text, keyboard: confirmationKeyboard(CB.CONFIRM_PAUSE), parseMode: 'MarkdownV2' };
}

export function handleResume(_ctx: CommandContext): CommandResponse {
  const text = escapeMarkdownV2('Are you sure you want to RESUME trading?');
  return { text, keyboard: confirmationKeyboard(CB.CONFIRM_RESUME), parseMode: 'MarkdownV2' };
}

export function handleEmergency(_ctx: CommandContext): CommandResponse {
  const text = `\u{1F6A8} *EMERGENCY SHUTDOWN*\n\n${escapeMarkdownV2('This will halt ALL trading immediately. Existing positions will NOT be closed.')}\n\n${escapeMarkdownV2('Type your admin password to confirm:')}`;
  return { text, parseMode: 'MarkdownV2' };
}

export function handleCircuitReset(_ctx: CommandContext): CommandResponse {
  const text = escapeMarkdownV2('Reset the circuit breaker? This will allow trading to resume.');
  return { text, keyboard: confirmationKeyboard(CB.CONFIRM_CB_RESET), parseMode: 'MarkdownV2' };
}

export function handleSetMode(_ctx: CommandContext, mode: string): CommandResponse {
  if (mode === 'live') {
    const text = `\u26A0\uFE0F ${escapeMarkdownV2('Switch to LIVE mode? This uses REAL money.')}`;
    return { text, keyboard: confirmationKeyboard(CB.CONFIRM_MODE_LIVE), parseMode: 'MarkdownV2' };
  }
  return {
    text: `\u2705 ${escapeMarkdownV2('Mode set to PAPER.')}`,
    keyboard: backKeyboard(),
    parseMode: 'MarkdownV2',
  };
}

export function handleAddWhale(_ctx: CommandContext, address: string, label: string): CommandResponse {
  // Would call whaleTracker.addWallet(address, label)
  eventBus.emit('whale:wallet-added', { address, label });
  return {
    text: `\u{1F40B} ${escapeMarkdownV2(`Added wallet: ${label} (${address.slice(0, 10)}...)`)}`,
    keyboard: backKeyboard(),
    parseMode: 'MarkdownV2',
  };
}

export function handleRemoveWhale(_ctx: CommandContext, address: string): CommandResponse {
  return {
    text: escapeMarkdownV2(`Remove whale ${address.slice(0, 10)}...?`),
    keyboard: confirmationKeyboard(`cfm:rm_whale:${address.slice(0, 44)}`),
    parseMode: 'MarkdownV2',
  };
}

export function handleApproveSignal(ctx: CommandContext, signalId: string): CommandResponse {
  const signal = ctx.pendingSignals.get(signalId);
  if (!signal) {
    return {
      text: escapeMarkdownV2('Signal not found or already processed.'),
      keyboard: backKeyboard(),
      parseMode: 'MarkdownV2',
    };
  }

  eventBus.emit('signal:approved', signal);
  ctx.pendingSignals.delete(signalId);

  return {
    text: `\u2705 ${escapeMarkdownV2('Signal APPROVED and sent for execution.')}`,
    keyboard: backKeyboard(),
    parseMode: 'MarkdownV2',
  };
}

export function handleSkipSignal(ctx: CommandContext, signalId: string): CommandResponse {
  const signal = ctx.pendingSignals.get(signalId);
  if (!signal) {
    return {
      text: escapeMarkdownV2('Signal not found or already processed.'),
      keyboard: backKeyboard(),
      parseMode: 'MarkdownV2',
    };
  }

  ctx.pendingSignals.delete(signalId);

  return {
    text: `\u274C ${escapeMarkdownV2('Signal skipped.')}`,
    keyboard: backKeyboard(),
    parseMode: 'MarkdownV2',
  };
}

// ---------------------------------------------------------------------------
// Confirmation Handlers
// ---------------------------------------------------------------------------

export function handleConfirmPause(ctx: CommandContext): CommandResponse {
  ctx.isPaused = true;
  eventBus.emit('system:paused', { reason: 'telegram' });
  return {
    text: `\u23F8\uFE0F ${escapeMarkdownV2('Trading PAUSED. Monitoring continues.')}`,
    keyboard: backKeyboard(),
    parseMode: 'MarkdownV2',
  };
}

export function handleConfirmResume(ctx: CommandContext): CommandResponse {
  ctx.isPaused = false;
  eventBus.emit('system:resumed', { reason: 'telegram' });
  return {
    text: `\u25B6\uFE0F ${escapeMarkdownV2('Trading RESUMED.')}`,
    keyboard: backKeyboard(),
    parseMode: 'MarkdownV2',
  };
}

export function handleConfirmEmergency(ctx: CommandContext): CommandResponse {
  ctx.isPaused = true;
  eventBus.emit('system:emergency-shutdown', { reason: 'telegram' });
  return {
    text: `\u{1F6D1} ${escapeMarkdownV2('EMERGENCY SHUTDOWN COMPLETE. All trading halted.')}`,
    keyboard: backKeyboard(),
    parseMode: 'MarkdownV2',
  };
}

export function handleConfirmCircuitReset(ctx: CommandContext): CommandResponse {
  ctx.system.risk.resetCircuitBreaker();
  return {
    text: `\u{1F504} ${escapeMarkdownV2('Circuit breaker RESET. Trading may resume.')}`,
    keyboard: backKeyboard(),
    parseMode: 'MarkdownV2',
  };
}

export function handleCancel(): CommandResponse {
  return {
    text: escapeMarkdownV2('Action cancelled.'),
    keyboard: backKeyboard(),
    parseMode: 'MarkdownV2',
  };
}

// ---------------------------------------------------------------------------
// Callback Router
// ---------------------------------------------------------------------------

export async function routeCallback(callbackData: string, ctx: CommandContext): Promise<CommandResponse> {
  const { action, param } = parseCallback(callbackData);

  switch (action) {
    case CB.STATUS: return handleStatus(ctx);
    case CB.PNL: return handlePnl(ctx);
    case CB.POSITIONS: return handlePositions(ctx);
    case CB.RISK: return handleRisk(ctx);
    case CB.HEALTH: return handleHealth(ctx);
    case CB.DRIFT: return handleDrift(ctx);
    case CB.STRATEGIES: return handleStrategies(ctx);
    case CB.VERTICALS: return handleVerticals(ctx);
    case CB.MARKETS: return handleMarkets(ctx);
    case CB.WHALES: return handleWhales(ctx);
    case CB.CONFIG: return handleConfig(ctx);
    case CB.GATE: return handleGate(ctx);
    case CB.HELP: return handleHelp();
    case CB.BACK_MAIN: return handleStart(ctx);

    // Control
    case CB.PAUSE: return handlePause(ctx);
    case CB.RESUME: return handleResume(ctx);
    case CB.EMERGENCY: return handleEmergency(ctx);
    case CB.CIRCUIT_RESET: return handleCircuitReset(ctx);

    // Confirmations
    case CB.CONFIRM_PAUSE: return handleConfirmPause(ctx);
    case CB.CONFIRM_RESUME: return handleConfirmResume(ctx);
    case CB.CONFIRM_EMERGENCY: return handleConfirmEmergency(ctx);
    case CB.CONFIRM_CB_RESET: return handleConfirmCircuitReset(ctx);
    case CB.CANCEL: return handleCancel();

    // Signal actions
    case 'sig:approve': return param ? handleApproveSignal(ctx, param) : handleCancel();
    case 'sig:skip': return param ? handleSkipSignal(ctx, param) : handleCancel();

    // Pagination
    case 'trades:page': return handleTrades(ctx, param ? parseInt(param, 10) : 1);

    default:
      return { text: escapeMarkdownV2('Unknown action.'), keyboard: backKeyboard(), parseMode: 'MarkdownV2' };
  }
}

// ---------------------------------------------------------------------------
// Command Router (from text messages)
// ---------------------------------------------------------------------------

export async function routeCommand(text: string, ctx: CommandContext): Promise<CommandResponse> {
  const parts = text.trim().split(/\s+/);
  const cmd = (parts[0] ?? '').toLowerCase();
  const args = parts.slice(1);

  switch (cmd) {
    case '/start': return handleStart(ctx);
    case '/status': return handleStatus(ctx);
    case '/pnl': return handlePnl(ctx);
    case '/positions': return handlePositions(ctx);
    case '/trades': {
      const n = args[0] ? parseInt(args[0], 10) : 10;
      return handleTrades(ctx, 1, isNaN(n) ? 10 : n);
    }
    case '/risk': return handleRisk(ctx);
    case '/health': return handleHealth(ctx);
    case '/drift': return handleDrift(ctx);
    case '/strategies': return handleStrategies(ctx);
    case '/verticals': return handleVerticals(ctx);
    case '/markets': return handleMarkets(ctx, args.join(' ') || undefined);
    case '/whales': return handleWhales(ctx);
    case '/gate': return handleGate(ctx);
    case '/config': return handleConfig(ctx);
    case '/help': return handleHelp();

    // Control
    case '/pause': return handlePause(ctx);
    case '/resume': return handleResume(ctx);
    case '/emergency': return handleEmergency(ctx);
    case '/circuit_reset': return handleCircuitReset(ctx);
    case '/add_whale': {
      const addr = args[0] ?? '';
      const label = args.slice(1).join(' ') || 'unknown';
      if (!addr) return { text: escapeMarkdownV2('Usage: /add_whale [address] [label]'), parseMode: 'MarkdownV2' };
      return handleAddWhale(ctx, addr, label);
    }
    case '/remove_whale': {
      const addr = args[0] ?? '';
      if (!addr) return { text: escapeMarkdownV2('Usage: /remove_whale [address]'), parseMode: 'MarkdownV2' };
      return handleRemoveWhale(ctx, addr);
    }
    case '/set_mode': {
      const mode = args[0] ?? '';
      if (mode !== 'paper' && mode !== 'live') {
        return { text: escapeMarkdownV2('Usage: /set_mode [paper|live]'), parseMode: 'MarkdownV2' };
      }
      return handleSetMode(ctx, mode);
    }
    case '/approve_signal': {
      const id = args[0] ?? '';
      if (!id) return { text: escapeMarkdownV2('Usage: /approve_signal [id]'), parseMode: 'MarkdownV2' };
      return handleApproveSignal(ctx, id);
    }
    case '/skip_signal': {
      const id = args[0] ?? '';
      if (!id) return { text: escapeMarkdownV2('Usage: /skip_signal [id]'), parseMode: 'MarkdownV2' };
      return handleSkipSignal(ctx, id);
    }

    default:
      return { text: escapeMarkdownV2(`Unknown command: ${cmd}. Type /help for available commands.`), parseMode: 'MarkdownV2' };
  }
}
