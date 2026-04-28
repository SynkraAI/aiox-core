#!/usr/bin/env npx tsx
/**
 * Execute a single paper trade from Claude Remote Agent.
 *
 * Usage: npx tsx src/scripts/execute-trade.ts \
 *   --market "abc123" \
 *   --side YES \
 *   --size 25 \
 *   --edge 0.08 \
 *   --confidence 0.7 \
 *   --vertical crypto \
 *   --reasoning "Price mismatch detected..."
 */

import '../dns-override.js'; // MUST be first — bypass ISP DNS filtering for polymarket/kalshi
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Load .env
const projectRoot = join(import.meta.dirname, '..', '..');
try {
  const envPath = join(projectRoot, '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* no .env */ }

import { PolymarketClient } from '../integrations/polymarket-client.js';
import { ExperienceStore } from '../learning/experience-store.js';
import { RiskEngine } from '../engine/risk-engine.js';
import { PAPER_UNLIMITED_RISK_LIMITS } from '../config/defaults.js';
import type { TradeSignal, Side, Vertical, StrategyId } from '../types/index.js';

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------
function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const marketId = getArg('market');
const side = (getArg('side') || 'YES') as Side;
const size = parseFloat(getArg('size') || '25');
const edge = parseFloat(getArg('edge') || '0.05');
const confidence = parseFloat(getArg('confidence') || '0.6');
const vertical = (getArg('vertical') || 'crypto') as Vertical;
const strategy = (getArg('strategy') || 'info_arb') as StrategyId;
const reasoning = getArg('reasoning') || 'Claude Remote Agent analysis';

if (!marketId) {
  console.error(JSON.stringify({ error: 'Missing --market argument' }));
  process.exit(1);
}
const validMarketId: string = marketId;

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------
async function main() {
  const dataDir = join(projectRoot, 'data');
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  const client = new PolymarketClient();
  const store = new ExperienceStore(join(dataDir, 'trades.db'));
  const bankroll = parseFloat(process.env.POLYMARKET_BANKROLL || '500');
  void new RiskEngine(bankroll, {
    ...PAPER_UNLIMITED_RISK_LIMITS,
    minEdge: 0.05,
    kellyFraction: 0.05,
  });

  // Fetch current market data
  let market;
  try {
    market = await client.getMarket(validMarketId);
  } catch (err) {
    console.error(JSON.stringify({ error: `Market not found: ${validMarketId}` }));
    process.exit(1);
  }

  // Get current price for realistic entry
  let entryPrice: number;
  try {
    entryPrice = await client.getMidpoint(validMarketId);
  } catch {
    entryPrice = side === 'YES' ? market.tokens.yes.price : market.tokens.no.price;
  }

  // Simulate slippage
  const slippage = entryPrice * 0.005; // 0.5% estimated
  const fillPrice = side === 'YES' ? entryPrice + slippage : entryPrice - slippage;

  // Record trade
  const signal: TradeSignal = {
    marketId: validMarketId,
    vertical,
    strategy,
    side,
    modelProbability: side === 'YES' ? market.tokens.yes.price + edge : market.tokens.no.price + edge,
    marketProbability: side === 'YES' ? market.tokens.yes.price : market.tokens.no.price,
    edge,
    confidence,
    suggestedSize: size,
    reasoning,
    timestamp: new Date(),
  };

  const experience = store.record({
    timestamp: new Date(),
    marketId: validMarketId,
    vertical,
    strategy,
    marketQuestion: market.question,
    signalConfidence: confidence,
    modelProbability: signal.modelProbability,
    marketProbability: signal.marketProbability,
    edgeDetected: edge,
    positionSize: size,
    kellyFraction: 0.05,
    side,
    entryPrice: fillPrice,
    slippage,
    gasFee: 0,
    takerFee: size * 0.01,
    fillTimeMs: 0,
    outcome: 'PENDING',
    exitPrice: 0,
    pnl: 0,
    lesson: '',
    tags: ['claude-remote-agent'],
    similarPastTrades: [],
    metadata: { source: 'claude-trigger', reasoning },
  });

  store.close();

  console.log(JSON.stringify({
    success: true,
    trade: {
      id: experience.id,
      market: market.question,
      side,
      size,
      entryPrice: Math.round(fillPrice * 10000) / 10000,
      edge: Math.round(edge * 100) + '%',
      confidence: Math.round(confidence * 100) + '%',
      vertical,
    },
  }, null, 2));
}

main().catch(err => {
  console.error(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
  process.exit(1);
});
