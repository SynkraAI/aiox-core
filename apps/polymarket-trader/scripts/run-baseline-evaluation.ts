#!/usr/bin/env npx tsx
/**
 * Fase 0.2-0.3 — Baseline Evaluation Harness
 * Replays historical resolved markets through current strategies.
 * Produces baseline Brier score, profit factor, calibration data.
 *
 * Usage: npx tsx scripts/run-baseline-evaluation.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Backtester, calculateProfitFactor } from '../src/engine/backtester.js';
import type { HistoricalMarket, StrategyFn, BacktestResult } from '../src/engine/backtester.js';
import type { Market, TradeSignal, Vertical, StrategyId } from '../src/types/index.js';
import { DEFAULT_RISK_LIMITS } from '../src/config/defaults.js';

const DATA_DIR = join(import.meta.dirname, '..', 'data');
const HISTORICAL_FILE = join(DATA_DIR, 'historical-markets.json');
const REPORT_FILE = join(DATA_DIR, 'evaluation', 'baseline-report.json');

// ──────────────────────────────────────────────
// Load historical data
// ──────────────────────────────────────────────

interface HistoricalEntry {
  id: string;
  question: string;
  slug: string;
  vertical: string;
  endDate: string;
  closed: boolean;
  yesPrice: number;
  noPrice: number;
  preResYesPrice: number;  // Estimated pre-resolution YES price
  yesTokenId: string;
  noTokenId: string;
  volume: number;
  liquidity: number;
  outcome: 'YES' | 'NO';
  fetchedAt: string;
}

function loadHistoricalMarkets(): HistoricalMarket[] {
  if (!existsSync(HISTORICAL_FILE)) {
    console.error(`[Eval] No historical data found at ${HISTORICAL_FILE}`);
    console.error('[Eval] Run: npx tsx scripts/fetch-historical-data.ts');
    process.exit(1);
  }

  const raw: HistoricalEntry[] = JSON.parse(readFileSync(HISTORICAL_FILE, 'utf-8'));
  console.log(`[Eval] Loaded ${raw.length} historical markets`);

  return raw
    .filter(e => e.outcome === 'YES' || e.outcome === 'NO')
    .map(entry => {
      // Use estimated pre-resolution price for backtesting
      const preResPrice = entry.preResYesPrice || 0.5;
      const market: Market = {
        id: entry.id,
        question: entry.question,
        slug: entry.slug,
        vertical: entry.vertical as Vertical,
        endDate: entry.endDate,
        active: false,
        closed: true,
        tokens: {
          yes: { tokenId: entry.yesTokenId, price: preResPrice, outcome: 'Yes' },
          no: { tokenId: entry.noTokenId, price: 1 - preResPrice, outcome: 'No' },
        },
        volume: entry.volume,
        liquidity: entry.liquidity || 5000, // Default to pass filter
        lastPrice: preResPrice,
      };

      const endDate = new Date(entry.endDate);
      const entryDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before

      return {
        market,
        priceHistory: [
          { timestamp: entryDate, price: preResPrice },
        ],
        outcome: entry.outcome,
        resolutionDate: endDate,
      } as HistoricalMarket;
    });
}

// ──────────────────────────────────────────────
// Current strategy (mirror of auto-trader analyzeMarket)
// ──────────────────────────────────────────────

const currentHeuristicStrategy: StrategyFn = (market, currentPrice, daysToResolution) => {
  const yesPrice = currentPrice;
  const noPrice = 1 - yesPrice; // Approximation

  // Skip extreme prices
  if (yesPrice <= 0.03 || yesPrice >= 0.97) return null;
  if (market.liquidity < 100) return null;

  // Signal 1: Price completeness
  const priceSum = yesPrice + noPrice;
  const priceMismatch = Math.abs(priceSum - 1.0);
  const mismatchSignal = priceMismatch > 0.02 ? priceMismatch : 0;

  // Signal 2: Volume/Liquidity ratio
  const vlRatio = market.volume > 0 ? market.liquidity / market.volume : 1;
  const liquidityStress = vlRatio < 0.05 ? (0.05 - vlRatio) * 10 : 0;

  // Signal 3: Price extremity
  const priceExtremity = Math.abs(yesPrice - 0.5);
  const extremityEdge = priceExtremity > 0.10 && priceExtremity < 0.35 ? priceExtremity * 0.15 : 0;

  const rawEdge = mismatchSignal + liquidityStress + extremityEdge;
  if (rawEdge < 0.01) return null; // Paper unlimited minEdge

  let side: 'YES' | 'NO';
  if (priceMismatch > 0.02 && priceSum < 1.0) {
    side = yesPrice < noPrice ? 'YES' : 'NO';
  } else if (priceMismatch > 0.02 && priceSum > 1.0) {
    side = yesPrice > noPrice ? 'NO' : 'YES';
  } else {
    side = yesPrice < 0.5 ? 'YES' : 'NO';
  }

  const edge = Math.min(rawEdge, 0.15);
  const marketProb = side === 'YES' ? yesPrice : noPrice;
  const modelProb = Math.min(0.95, marketProb + edge);

  const signalCount = (mismatchSignal > 0 ? 1 : 0) + (liquidityStress > 0 ? 1 : 0) + (extremityEdge > 0 ? 1 : 0);
  const confidence = 0.3 + signalCount * 0.2;

  return {
    marketId: market.id,
    vertical: market.vertical,
    strategy: 'info_arb' as StrategyId,
    side,
    modelProbability: modelProb,
    marketProbability: marketProb,
    edge,
    confidence,
    suggestedSize: 20, // Will be overridden by Kelly
    reasoning: market.question,
    timestamp: new Date(),
  };
};

// ──────────────────────────────────────────────
// Random baseline (for comparison)
// ──────────────────────────────────────────────

const randomStrategy: StrategyFn = (market, currentPrice) => {
  if (currentPrice <= 0.03 || currentPrice >= 0.97) return null;

  const side: 'YES' | 'NO' = Math.random() > 0.5 ? 'YES' : 'NO';
  const marketProb = side === 'YES' ? currentPrice : 1 - currentPrice;

  return {
    marketId: market.id,
    vertical: market.vertical,
    strategy: 'info_arb' as StrategyId,
    side,
    modelProbability: marketProb + 0.05,
    marketProbability: marketProb,
    edge: 0.05,
    confidence: 0.5,
    suggestedSize: 20,
    reasoning: 'random baseline',
    timestamp: new Date(),
  };
};

// ──────────────────────────────────────────────
// Brier Score Calculator
// ──────────────────────────────────────────────

interface BrierEntry {
  marketId: string;
  vertical: string;
  modelProbability: number;
  side: 'YES' | 'NO';
  outcome: 'YES' | 'NO';
  brierScore: number;
}

function calculateBrier(
  historicalMarkets: HistoricalMarket[],
  strategyFn: StrategyFn,
): { overall: number; byVertical: Record<string, number>; entries: BrierEntry[] } {
  const entries: BrierEntry[] = [];

  for (const hm of historicalMarkets) {
    const signal = strategyFn(
      hm.market,
      hm.market.tokens.yes.price,
      7, // dummy daysToResolution
    );

    if (!signal) continue;

    // Brier score: (forecast - outcome)^2
    // outcome = 1 if our predicted side matched, 0 otherwise
    const outcomeValue = signal.side === hm.outcome ? 1 : 0;
    const brierScore = (signal.modelProbability - outcomeValue) ** 2;

    entries.push({
      marketId: hm.market.id,
      vertical: hm.market.vertical,
      modelProbability: signal.modelProbability,
      side: signal.side,
      outcome: hm.outcome,
      brierScore,
    });
  }

  const overall = entries.length > 0
    ? entries.reduce((sum, e) => sum + e.brierScore, 0) / entries.length
    : 1.0;

  const byVertical: Record<string, number> = {};
  const verticalCounts: Record<string, number> = {};

  for (const entry of entries) {
    byVertical[entry.vertical] = (byVertical[entry.vertical] || 0) + entry.brierScore;
    verticalCounts[entry.vertical] = (verticalCounts[entry.vertical] || 0) + 1;
  }

  for (const v of Object.keys(byVertical)) {
    byVertical[v] = byVertical[v] / verticalCounts[v];
  }

  return { overall, byVertical, entries };
}

// ──────────────────────────────────────────────
// Calibration Curve
// ──────────────────────────────────────────────

interface CalibrationBucket {
  range: string;
  predicted: number;
  actual: number;
  count: number;
  gap: number;
}

function calculateCalibration(entries: BrierEntry[]): CalibrationBucket[] {
  const buckets = [
    { min: 0.0, max: 0.2 }, { min: 0.2, max: 0.4 },
    { min: 0.4, max: 0.6 }, { min: 0.6, max: 0.8 },
    { min: 0.8, max: 1.0 },
  ];

  return buckets.map(({ min, max }) => {
    const inBucket = entries.filter(e => e.modelProbability >= min && e.modelProbability < max);
    const predicted = inBucket.length > 0
      ? inBucket.reduce((s, e) => s + e.modelProbability, 0) / inBucket.length
      : (min + max) / 2;
    const actual = inBucket.length > 0
      ? inBucket.filter(e => e.side === e.outcome).length / inBucket.length
      : 0;

    return {
      range: `${(min * 100).toFixed(0)}-${(max * 100).toFixed(0)}%`,
      predicted: Math.round(predicted * 1000) / 1000,
      actual: Math.round(actual * 1000) / 1000,
      count: inBucket.length,
      gap: Math.round(Math.abs(predicted - actual) * 1000) / 1000,
    };
  });
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main() {
  console.log('=== Polymarket Baseline Evaluation ===\n');

  // 1. Load data
  const historicalMarkets = loadHistoricalMarkets();

  const byVertical: Record<string, number> = {};
  for (const hm of historicalMarkets) {
    byVertical[hm.market.vertical] = (byVertical[hm.market.vertical] || 0) + 1;
  }
  console.log(`Markets by vertical:`, byVertical);
  console.log();

  // 2. Run backtests
  const bt = new Backtester({
    bankroll: 500,
    riskLimits: { ...DEFAULT_RISK_LIMITS, kellyFraction: 0.05 }, // UltraPlan v2: Kelly 5%
    takerFee: 0.01,
    slippageRange: [0.005, 0.02],
    deterministicSlippage: true,
  });

  console.log('--- Current Heuristic Strategy ---');
  const heuristicResult = bt.run('info_arb', currentHeuristicStrategy, historicalMarkets);
  printResult(heuristicResult);

  console.log('\n--- Random Baseline ---');
  const randomResult = bt.run('info_arb', randomStrategy, historicalMarkets);
  printResult(randomResult);

  // 3. Brier scores
  console.log('\n--- Brier Scores ---');
  const heuristicBrier = calculateBrier(historicalMarkets, currentHeuristicStrategy);
  const randomBrier = calculateBrier(historicalMarkets, randomStrategy);

  console.log(`Heuristic Brier (overall): ${heuristicBrier.overall.toFixed(4)}`);
  console.log(`Heuristic Brier (by vertical):`, heuristicBrier.byVertical);
  console.log(`Random Brier (overall): ${randomBrier.overall.toFixed(4)}`);
  console.log(`Markets analyzed by heuristic: ${heuristicBrier.entries.length}/${historicalMarkets.length}`);

  // 4. Calibration
  console.log('\n--- Calibration Curve (Heuristic) ---');
  const calibration = calculateCalibration(heuristicBrier.entries);
  console.table(calibration);

  // 5. Cost analysis
  const avgTrade = heuristicResult.totalTrades > 0 ? heuristicResult.totalPnl / heuristicResult.totalTrades : 0;
  const takerFeeDrag = 0.01; // 1%
  const avgSlippage = 0.0125; // midpoint of 0.5-2%
  const totalDragPercent = (takerFeeDrag + avgSlippage) * 100;

  console.log('\n--- Cost Analysis ---');
  console.log(`Taker fee drag: ${(takerFeeDrag * 100).toFixed(1)}%`);
  console.log(`Avg slippage: ${(avgSlippage * 100).toFixed(2)}%`);
  console.log(`Total drag: ${totalDragPercent.toFixed(2)}% per trade`);
  console.log(`Avg P&L per trade: $${avgTrade.toFixed(2)}`);
  console.log(`Edge needed to break even: >${totalDragPercent.toFixed(2)}%`);

  // 6. Save report
  const report = {
    generatedAt: new Date().toISOString(),
    ultraplanVersion: 'v2',
    dataStats: {
      totalMarkets: historicalMarkets.length,
      byVertical,
      period: {
        start: historicalMarkets.length > 0 ? historicalMarkets[0].market.endDate : null,
        end: historicalMarkets.length > 0 ? historicalMarkets[historicalMarkets.length - 1].market.endDate : null,
      },
    },
    heuristic: {
      backtest: {
        totalTrades: heuristicResult.totalTrades,
        wins: heuristicResult.wins,
        losses: heuristicResult.losses,
        winRate: heuristicResult.winRate,
        totalPnl: heuristicResult.totalPnl,
        avgPnl: heuristicResult.avgPnl,
        profitFactor: heuristicResult.profitFactor,
        sharpeRatio: heuristicResult.sharpeRatio,
        maxDrawdown: heuristicResult.maxDrawdown,
        avgEdge: heuristicResult.avgEdge,
      },
      brier: {
        overall: heuristicBrier.overall,
        byVertical: heuristicBrier.byVertical,
        marketsAnalyzed: heuristicBrier.entries.length,
      },
      calibration,
    },
    randomBaseline: {
      backtest: {
        totalTrades: randomResult.totalTrades,
        winRate: randomResult.winRate,
        totalPnl: randomResult.totalPnl,
        profitFactor: randomResult.profitFactor,
      },
      brier: {
        overall: randomBrier.overall,
      },
    },
    costAnalysis: {
      takerFeePercent: takerFeeDrag,
      avgSlippagePercent: avgSlippage,
      totalDragPercent: totalDragPercent / 100,
      breakEvenEdgePercent: totalDragPercent / 100,
    },
    verdict: {
      heuristicBeatRandom: heuristicBrier.overall < randomBrier.overall,
      brierAcceptable: heuristicBrier.overall < 0.25,
      profitFactorAcceptable: heuristicResult.profitFactor > 1.0,
      recommendation: '',
    },
  };

  // Generate recommendation
  if (report.verdict.heuristicBeatRandom && report.verdict.brierAcceptable) {
    report.verdict.recommendation = 'Heuristic has some edge over random. Proceed to Fase 1 (data + learning improvements).';
  } else if (report.verdict.heuristicBeatRandom) {
    report.verdict.recommendation = 'Heuristic beats random but Brier > 0.25. Needs calibration improvement before Fase 2.';
  } else {
    report.verdict.recommendation = 'CRITICAL: Heuristic does NOT beat random baseline. Strategies need fundamental rework before proceeding.';
  }

  // Ensure evaluation directory exists
  const evalDir = join(DATA_DIR, 'evaluation');
  const { mkdirSync } = await import('fs');
  mkdirSync(evalDir, { recursive: true });

  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`\n[Eval] Report saved to: ${REPORT_FILE}`);
  console.log(`\n=== VERDICT: ${report.verdict.recommendation} ===`);
}

function printResult(result: BacktestResult) {
  console.log(`  Trades: ${result.totalTrades} (${result.wins}W / ${result.losses}L)`);
  console.log(`  Win Rate: ${(result.winRate * 100).toFixed(1)}%`);
  console.log(`  Total P&L: $${result.totalPnl.toFixed(2)}`);
  console.log(`  Avg P&L/trade: $${result.avgPnl.toFixed(2)}`);
  console.log(`  Profit Factor: ${result.profitFactor.toFixed(2)}`);
  console.log(`  Sharpe Ratio: ${result.sharpeRatio.toFixed(2)}`);
  console.log(`  Max Drawdown: $${result.maxDrawdown.toFixed(2)}`);
  console.log(`  Avg Edge: ${(result.avgEdge * 100).toFixed(2)}%`);
}

main().catch(console.error);
