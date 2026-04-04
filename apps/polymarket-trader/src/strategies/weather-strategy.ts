/**
 * Weather Strategy for Polymarket temperature markets.
 *
 * Uses Gaussian probability model to estimate P(actual temp in bucket)
 * based on NOAA-calibrated forecast RMSE by season.
 *
 * Only trades Day 1-2 forecasts where edge > minEdge (8% default).
 * Settlement: METAR airport data via Wunderground.
 * Forecast source: Open-Meteo API (free, no key).
 */

import { eventBus } from '../engine/event-bus.js';
import { DEFAULT_RISK_LIMITS } from '../config/defaults.js';
import type { Market, TradeSignal, Side } from '../types/market.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Season-calibrated RMSE values (Fahrenheit). Based on NOAA Day 1 verification. */
export const SEASONAL_RMSE: Record<Season, number> = {
  summer: 2.0,
  spring: 2.8,
  fall: 2.8,
  winter: 3.5,
} as const;

export type Season = 'summer' | 'spring' | 'fall' | 'winter';

/** City coordinate lookup for Open-Meteo requests. */
export const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  'new york':    { lat: 40.7128, lon: -74.0060 },
  'nyc':         { lat: 40.7128, lon: -74.0060 },
  'los angeles': { lat: 34.0522, lon: -118.2437 },
  'la':          { lat: 34.0522, lon: -118.2437 },
  'chicago':     { lat: 41.8781, lon: -87.6298 },
  'miami':       { lat: 25.7617, lon: -80.1918 },
  'houston':     { lat: 29.7604, lon: -95.3698 },
  'phoenix':     { lat: 33.4484, lon: -112.0740 },
  'philadelphia':{ lat: 39.9526, lon: -75.1652 },
  'san antonio': { lat: 29.4241, lon: -98.4936 },
  'san diego':   { lat: 32.7157, lon: -117.1611 },
  'dallas':      { lat: 32.7767, lon: -96.7970 },
  'denver':      { lat: 39.7392, lon: -104.9903 },
  'austin':      { lat: 30.2672, lon: -97.7431 },
  'atlanta':     { lat: 33.7490, lon: -84.3880 },
  'washington':  { lat: 38.9072, lon: -77.0369 },
  'dc':          { lat: 38.9072, lon: -77.0369 },
  'boston':       { lat: 42.3601, lon: -71.0589 },
  'seattle':     { lat: 47.6062, lon: -122.3321 },
  'san francisco': { lat: 37.7749, lon: -122.4194 },
  'sf':          { lat: 37.7749, lon: -122.4194 },
  'nashville':   { lat: 36.1627, lon: -86.7816 },
  'las vegas':   { lat: 36.1699, lon: -115.1398 },
  'detroit':     { lat: 42.3314, lon: -83.0458 },
  'memphis':     { lat: 35.1495, lon: -90.0490 },
  'minneapolis': { lat: 44.9778, lon: -93.2650 },
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface WeatherStrategyConfig {
  minEdge: number;       // Minimum edge to signal (default 0.08 = 8%)
  maxLeadDays: number;   // Max forecast horizon (default 2)
  confidenceBase: number; // Base confidence for Day 1 (default 0.75)
}

const DEFAULT_WEATHER_CONFIG: WeatherStrategyConfig = {
  minEdge: DEFAULT_RISK_LIMITS.minEdge,
  maxLeadDays: 2,
  confidenceBase: 0.75,
};

// ---------------------------------------------------------------------------
// Parsed market question
// ---------------------------------------------------------------------------

export interface ParsedWeatherMarket {
  city: string;
  date: Date;
  bucketLow: number;  // Fahrenheit
  bucketHigh: number;  // Fahrenheit
}

// ---------------------------------------------------------------------------
// Math helpers (zero dependencies)
// ---------------------------------------------------------------------------

/**
 * Standard normal CDF approximation using Abramowitz & Stegun (1964).
 * |error| < 7.5e-8 across the real line.
 */
export function normalCdf(x: number): number {
  if (x < -8) return 0;
  if (x > 8) return 1;

  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x);

  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;

  const t = 1 / (1 + 0.2316419 * z);
  const pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const poly = t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
  const cdf = 1 - pdf * poly;

  return sign === 1 ? cdf : 1 - cdf;
}

/**
 * P(temp in [low, high]) given a Gaussian forecast model.
 *
 *   P = Phi((high - forecast) / rmse) - Phi((low - forecast) / rmse)
 */
export function bucketProbability(
  forecast: number,
  rmse: number,
  bucketLow: number,
  bucketHigh: number,
): number {
  const pHigh = normalCdf((bucketHigh - forecast) / rmse);
  const pLow = normalCdf((bucketLow - forecast) / rmse);
  return Math.max(0, pHigh - pLow);
}

// ---------------------------------------------------------------------------
// Season detection
// ---------------------------------------------------------------------------

/**
 * Determine meteorological season from a date (Northern Hemisphere).
 *   Dec-Feb = winter, Mar-May = spring, Jun-Aug = summer, Sep-Nov = fall
 */
export function getSeason(date: Date): Season {
  const month = date.getMonth(); // 0-indexed
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

// ---------------------------------------------------------------------------
// Market question parser
// ---------------------------------------------------------------------------

/**
 * Parse a Polymarket weather market question to extract city, date, and bucket.
 *
 * Typical formats:
 *   "Will the high temperature in New York on April 5 be 83-85°F?"
 *   "Will the high temperature in NYC on 2026-04-05 be between 83 and 85°F?"
 *   "Will the high temp in Chicago on Apr 5, 2026 be 70-72°F?"
 */
export function parseMarketQuestion(question: string): ParsedWeatherMarket | null {
  // Normalize
  const q = question.toLowerCase();

  // Check it is a temperature / high temp market
  if (!/\b(high\s+)?temp(erature)?\b/.test(q)) return null;

  // --- Extract city ---
  const cityMatch = q.match(/\bin\s+([a-z\s]+?)\s+on\b/);
  if (!cityMatch) return null;
  const cityKey = cityMatch[1].trim();

  const coords = CITY_COORDS[cityKey];
  if (!coords) return null;

  // --- Extract date ---
  const dateStr = extractDateFromQuestion(q);
  if (!dateStr) return null;

  // --- Extract bucket ---
  const bucket = extractBucket(q);
  if (!bucket) return null;

  return {
    city: cityKey,
    date: dateStr,
    bucketLow: bucket.low,
    bucketHigh: bucket.high,
  };
}

/**
 * Extract a date from various question formats.
 */
function extractDateFromQuestion(q: string): Date | null {
  // ISO format: 2026-04-05
  const isoMatch = q.match(/\bon\s+(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    const d = new Date(isoMatch[1] + 'T12:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  // Named month: "April 5", "Apr 5, 2026", "April 5, 2026"
  const monthNames: Record<string, number> = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };

  const namedMatch = q.match(/\bon\s+([a-z]+)\s+(\d{1,2})(?:,?\s*(\d{4}))?\b/);
  if (namedMatch) {
    const monthNum = monthNames[namedMatch[1]];
    if (monthNum === undefined) return null;
    const day = parseInt(namedMatch[2], 10);
    const year = namedMatch[3] ? parseInt(namedMatch[3], 10) : new Date().getFullYear();
    const d = new Date(year, monthNum, day, 12, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Extract temperature bucket from question text.
 * Handles: "83-85°F", "be 83-85", "between 83 and 85°F"
 *
 * The regex requires either "be " prefix or "°f" suffix (or both)
 * to avoid matching date fragments like "2026-07-15".
 */
function extractBucket(q: string): { low: number; high: number } | null {
  // "between X and Y"
  const betweenMatch = q.match(/between\s+(\d{1,3})\s+and\s+(\d{1,3})/);
  if (betweenMatch) {
    return { low: parseInt(betweenMatch[1], 10), high: parseInt(betweenMatch[2], 10) };
  }

  // Range with dash anchored by "be " prefix or "°f" suffix
  // e.g. "be 83-85°F" or "be 83-85" or "83-85°f"
  const dashWithBe = q.match(/be\s+(\d{1,3})\s*[-–]\s*(\d{1,3})/);
  if (dashWithBe) {
    return { low: parseInt(dashWithBe[1], 10), high: parseInt(dashWithBe[2], 10) };
  }

  // Fallback: dash range immediately followed by °f
  const dashWithUnit = q.match(/(\d{1,3})\s*[-–]\s*(\d{1,3})\s*°\s*f/);
  if (dashWithUnit) {
    return { low: parseInt(dashWithUnit[1], 10), high: parseInt(dashWithUnit[2], 10) };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Open-Meteo forecast fetcher
// ---------------------------------------------------------------------------

export interface ForecastResult {
  forecastHighF: number;  // Max daily temperature in Fahrenheit
  leadDays: number;       // Days from now to target date
}

/**
 * Fetch forecast max temperature from Open-Meteo for a given city/date.
 * Converts from Celsius (API default) to Fahrenheit.
 */
export async function fetchForecast(
  lat: number,
  lon: number,
  targetDate: Date,
): Promise<ForecastResult | null> {
  const now = new Date();
  const leadDays = Math.round(
    (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Open-Meteo needs the date in YYYY-MM-DD
  const dateStr = formatDateISO(targetDate);

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max` +
    `&start_date=${dateStr}&end_date=${dateStr}` +
    `&timezone=America%2FNew_York`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = (await response.json()) as OpenMeteoResponse;
    const maxTempC = data?.daily?.temperature_2m_max?.[0];
    if (maxTempC === undefined || maxTempC === null) return null;

    const forecastHighF = celsiusToFahrenheit(maxTempC);
    return { forecastHighF, leadDays };
  } catch {
    return null;
  }
}

interface OpenMeteoResponse {
  daily?: {
    temperature_2m_max?: number[];
  };
}

function celsiusToFahrenheit(c: number): number {
  return c * 9 / 5 + 32;
}

function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// WeatherStrategy class
// ---------------------------------------------------------------------------

export class WeatherStrategy {
  readonly strategyId = 'weather_model' as const;
  readonly vertical = 'weather' as const;
  private readonly config: WeatherStrategyConfig;

  constructor(config?: Partial<WeatherStrategyConfig>) {
    this.config = { ...DEFAULT_WEATHER_CONFIG, ...config };
  }

  /**
   * Analyze a market and produce a TradeSignal if edge exists.
   *
   * Returns null when:
   *   - Market is not a weather temperature market
   *   - City is unknown
   *   - Forecast horizon > maxLeadDays
   *   - Edge < minEdge
   *   - Forecast fetch fails
   */
  async analyze(market: Market): Promise<TradeSignal | null> {
    // 1. Parse the market question
    const parsed = parseMarketQuestion(market.question);
    if (!parsed) return null;

    const coords = CITY_COORDS[parsed.city];
    if (!coords) return null;

    // 2. Fetch forecast
    const forecast = await fetchForecast(coords.lat, coords.lon, parsed.date);
    if (!forecast) return null;

    // 3. Reject if beyond max lead days
    if (forecast.leadDays > this.config.maxLeadDays) return null;
    if (forecast.leadDays < 0) return null; // Past date

    // 4. Calculate bucket probability using seasonal RMSE
    const season = getSeason(parsed.date);
    const rmse = SEASONAL_RMSE[season];
    const modelProb = bucketProbability(
      forecast.forecastHighF,
      rmse,
      parsed.bucketLow,
      parsed.bucketHigh,
    );

    // 5. Determine market probability from YES token price
    const marketProb = market.tokens.yes.price;

    // 6. Calculate edge and decide side
    const edgeYes = modelProb - marketProb;
    const edgeNo = (1 - modelProb) - (1 - marketProb); // same magnitude, opposite sign

    let side: Side;
    let edge: number;
    let signalProb: number;

    if (edgeYes >= edgeNo && edgeYes > 0) {
      side = 'YES';
      edge = edgeYes;
      signalProb = modelProb;
    } else if (edgeNo > edgeYes && edgeNo > 0) {
      side = 'NO';
      edge = edgeNo;
      signalProb = 1 - modelProb;
    } else {
      return null; // No positive edge
    }

    // 7. Check minimum edge threshold
    if (edge < this.config.minEdge) return null;

    // 8. Calculate confidence (decays with lead days)
    const confidence = this.calculateConfidence(forecast.leadDays, edge);

    // 9. Build the signal
    const signal: TradeSignal = {
      marketId: market.id,
      vertical: this.vertical,
      strategy: this.strategyId,
      side,
      modelProbability: signalProb,
      marketProbability: side === 'YES' ? marketProb : 1 - marketProb,
      edge,
      confidence,
      suggestedSize: this.calculateSize(edge, confidence),
      reasoning: this.buildReasoning(parsed, forecast, season, rmse, modelProb, marketProb, side, edge),
      timestamp: new Date(),
    };

    // 10. Emit signal on the event bus
    eventBus.emit('signal:detected', signal);

    return signal;
  }

  /**
   * Confidence decays with lead days. Day 0-1 gets full base, Day 2 gets 80%.
   * Higher edge also boosts confidence slightly.
   */
  private calculateConfidence(leadDays: number, edge: number): number {
    const dayFactor = leadDays <= 1 ? 1.0 : 0.80;
    const edgeBoost = Math.min(edge * 0.5, 0.1); // Up to 10% boost from edge
    return Math.min(this.config.confidenceBase * dayFactor + edgeBoost, 0.95);
  }

  /**
   * Size suggestion: fraction of max position scaled by confidence and edge.
   */
  private calculateSize(edge: number, confidence: number): number {
    const maxSize = DEFAULT_RISK_LIMITS.maxPositionSize;
    // Kelly-inspired: edge * confidence as fraction, capped at maxSize
    const fraction = Math.min(edge * confidence * 10, 1.0);
    return Math.round(fraction * maxSize * 100) / 100;
  }

  /**
   * Human-readable reasoning string for the signal.
   */
  private buildReasoning(
    parsed: ParsedWeatherMarket,
    forecast: ForecastResult,
    season: Season,
    rmse: number,
    modelProb: number,
    marketProb: number,
    side: Side,
    edge: number,
  ): string {
    return (
      `${parsed.city.toUpperCase()} ${formatDateISO(parsed.date)}: ` +
      `forecast high ${forecast.forecastHighF.toFixed(1)}F (lead ${forecast.leadDays}d, ${season}, RMSE ${rmse}F). ` +
      `Bucket [${parsed.bucketLow}-${parsed.bucketHigh}F]: ` +
      `model P=${(modelProb * 100).toFixed(1)}%, market P=${(marketProb * 100).toFixed(1)}%. ` +
      `${side} edge=${(edge * 100).toFixed(1)}%.`
    );
  }
}
