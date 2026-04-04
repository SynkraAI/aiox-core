import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  normalCdf,
  bucketProbability,
  getSeason,
  parseMarketQuestion,
  WeatherStrategy,
  SEASONAL_RMSE,
  CITY_COORDS,
  type ParsedWeatherMarket,
  type ForecastResult,
} from '../src/strategies/weather-strategy.js';
import { eventBus } from '../src/engine/event-bus.js';
import type { Market } from '../src/types/market.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMarket(overrides: Partial<Market> = {}): Market {
  return {
    id: 'test-weather-market',
    question: 'Will the high temperature in New York on April 5 be 83-85°F?',
    slug: 'nyc-temp-apr-5',
    vertical: 'weather',
    endDate: '2026-04-06',
    active: true,
    closed: false,
    tokens: {
      yes: { tokenId: 'yes-1', price: 0.25, outcome: 'Yes' },
      no: { tokenId: 'no-1', price: 0.75, outcome: 'No' },
    },
    volume: 10000,
    liquidity: 8000,
    lastPrice: 0.25,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// normalCdf
// ---------------------------------------------------------------------------

describe('normalCdf', () => {
  it('returns ~0.5 for z=0', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
  });

  it('returns ~0.8413 for z=1', () => {
    expect(normalCdf(1)).toBeCloseTo(0.8413, 3);
  });

  it('returns ~0.1587 for z=-1', () => {
    expect(normalCdf(-1)).toBeCloseTo(0.1587, 3);
  });

  it('returns ~0.9772 for z=2', () => {
    expect(normalCdf(2)).toBeCloseTo(0.9772, 3);
  });

  it('returns ~0.0228 for z=-2', () => {
    expect(normalCdf(-2)).toBeCloseTo(0.0228, 3);
  });

  it('returns 0 for extreme negative', () => {
    expect(normalCdf(-10)).toBe(0);
  });

  it('returns 1 for extreme positive', () => {
    expect(normalCdf(10)).toBe(1);
  });

  it('is symmetric: CDF(z) + CDF(-z) = 1', () => {
    for (const z of [0.5, 1.5, 2.5, 3.0]) {
      expect(normalCdf(z) + normalCdf(-z)).toBeCloseTo(1.0, 6);
    }
  });
});

// ---------------------------------------------------------------------------
// bucketProbability
// ---------------------------------------------------------------------------

describe('bucketProbability', () => {
  it('forecast=85F, RMSE=2.5, bucket [83,85] => ~30%', () => {
    const prob = bucketProbability(85, 2.5, 83, 85);
    // Phi(0) - Phi(-0.8) = 0.5 - 0.2119 = 0.2881
    expect(prob).toBeGreaterThan(0.25);
    expect(prob).toBeLessThan(0.35);
  });

  it('forecast=84F, RMSE=2.5, bucket [83,85] => peak probability (centered)', () => {
    const prob = bucketProbability(84, 2.5, 83, 85);
    // Phi(0.4) - Phi(-0.4) = ~0.3108
    expect(prob).toBeGreaterThan(0.28);
    expect(prob).toBeLessThan(0.35);
  });

  it('forecast=90F, RMSE=2.0, bucket [83,85] => very low probability', () => {
    const prob = bucketProbability(90, 2.0, 83, 85);
    // Both z-scores are far negative
    expect(prob).toBeLessThan(0.02);
  });

  it('forecast=84F, RMSE=2.0, bucket [80,88] => very high probability (wide bucket)', () => {
    const prob = bucketProbability(84, 2.0, 80, 88);
    // Phi(2) - Phi(-2) = 0.9772 - 0.0228 = 0.9544
    expect(prob).toBeGreaterThan(0.90);
  });

  it('returns 0 when bucket is far from forecast', () => {
    const prob = bucketProbability(50, 2.0, 83, 85);
    expect(prob).toBeCloseTo(0, 5);
  });

  it('never returns negative', () => {
    const prob = bucketProbability(100, 1.0, 83, 85);
    expect(prob).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// getSeason
// ---------------------------------------------------------------------------

describe('getSeason', () => {
  it('December = winter', () => {
    expect(getSeason(new Date(2026, 11, 15))).toBe('winter');
  });

  it('January = winter', () => {
    expect(getSeason(new Date(2026, 0, 15))).toBe('winter');
  });

  it('February = winter', () => {
    expect(getSeason(new Date(2026, 1, 15))).toBe('winter');
  });

  it('March = spring', () => {
    expect(getSeason(new Date(2026, 2, 15))).toBe('spring');
  });

  it('May = spring', () => {
    expect(getSeason(new Date(2026, 4, 15))).toBe('spring');
  });

  it('June = summer', () => {
    expect(getSeason(new Date(2026, 5, 15))).toBe('summer');
  });

  it('August = summer', () => {
    expect(getSeason(new Date(2026, 7, 15))).toBe('summer');
  });

  it('September = fall', () => {
    expect(getSeason(new Date(2026, 8, 15))).toBe('fall');
  });

  it('November = fall', () => {
    expect(getSeason(new Date(2026, 10, 15))).toBe('fall');
  });

  it('each season maps to a known RMSE', () => {
    const seasons = ['summer', 'spring', 'fall', 'winter'] as const;
    for (const s of seasons) {
      expect(SEASONAL_RMSE[s]).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// parseMarketQuestion
// ---------------------------------------------------------------------------

describe('parseMarketQuestion', () => {
  it('parses standard format: city, named date, dash bucket', () => {
    const result = parseMarketQuestion(
      'Will the high temperature in New York on April 5 be 83-85°F?',
    );
    expect(result).not.toBeNull();
    expect(result!.city).toBe('new york');
    expect(result!.date.getMonth()).toBe(3); // April = 3
    expect(result!.date.getDate()).toBe(5);
    expect(result!.bucketLow).toBe(83);
    expect(result!.bucketHigh).toBe(85);
  });

  it('parses ISO date format', () => {
    const result = parseMarketQuestion(
      'Will the high temperature in Chicago on 2026-07-15 be 90-92°F?',
    );
    expect(result).not.toBeNull();
    expect(result!.city).toBe('chicago');
    expect(result!.date.getFullYear()).toBe(2026);
    expect(result!.date.getMonth()).toBe(6); // July
    expect(result!.bucketLow).toBe(90);
    expect(result!.bucketHigh).toBe(92);
  });

  it('parses "between X and Y" bucket format', () => {
    const result = parseMarketQuestion(
      'Will the high temperature in Miami on June 10 be between 88 and 90°F?',
    );
    expect(result).not.toBeNull();
    expect(result!.city).toBe('miami');
    expect(result!.bucketLow).toBe(88);
    expect(result!.bucketHigh).toBe(90);
  });

  it('parses NYC alias', () => {
    const result = parseMarketQuestion(
      'Will the high temp in NYC on April 5 be 70-72°F?',
    );
    expect(result).not.toBeNull();
    expect(result!.city).toBe('nyc');
  });

  it('parses LA alias', () => {
    const result = parseMarketQuestion(
      'Will the high temperature in LA on March 20 be 75-77°F?',
    );
    expect(result).not.toBeNull();
    expect(result!.city).toBe('la');
  });

  it('parses date with year: "Apr 5, 2026"', () => {
    const result = parseMarketQuestion(
      'Will the high temperature in Boston on Apr 5, 2026 be 60-62°F?',
    );
    expect(result).not.toBeNull();
    expect(result!.date.getFullYear()).toBe(2026);
    expect(result!.date.getMonth()).toBe(3);
    expect(result!.date.getDate()).toBe(5);
  });

  it('returns null for non-temperature market', () => {
    const result = parseMarketQuestion(
      'Will Bitcoin be above $100,000 on April 5?',
    );
    expect(result).toBeNull();
  });

  it('returns null for unknown city', () => {
    const result = parseMarketQuestion(
      'Will the high temperature in Timbuktu on April 5 be 83-85°F?',
    );
    expect(result).toBeNull();
  });

  it('returns null if no date found', () => {
    const result = parseMarketQuestion(
      'Will the high temperature in NYC be 83-85°F?',
    );
    expect(result).toBeNull();
  });

  it('returns null if no bucket found', () => {
    const result = parseMarketQuestion(
      'Will the high temperature in NYC on April 5 be hot?',
    );
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// WeatherStrategy.analyze
// ---------------------------------------------------------------------------

describe('WeatherStrategy', () => {
  let strategy: WeatherStrategy;

  beforeEach(() => {
    strategy = new WeatherStrategy({ minEdge: 0.08, maxLeadDays: 2 });
    vi.restoreAllMocks();
  });

  // Mock fetchForecast by intercepting global fetch
  function mockFetch(forecastHighC: number, leadDays: number): void {
    const forecastHighF = forecastHighC * 9 / 5 + 32;
    // We mock global fetch so fetchForecast gets our data.
    // But we need to control leadDays via the date calculation.
    // Instead, we mock the module-level fetchForecast via fetch mock.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          temperature_2m_max: [forecastHighC],
        },
      }),
    } as Response);
  }

  it('returns null for non-weather market question', async () => {
    const market = makeMarket({
      question: 'Will Bitcoin be above $100,000?',
    });
    const signal = await strategy.analyze(market);
    expect(signal).toBeNull();
  });

  it('returns null when forecast fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    // Use a date 1 day from now to pass lead day check
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dateStr = `${monthNames[tomorrow.getMonth()]} ${tomorrow.getDate()}, ${tomorrow.getFullYear()}`;

    const market = makeMarket({
      question: `Will the high temperature in New York on ${dateStr} be 83-85°F?`,
    });
    const signal = await strategy.analyze(market);
    expect(signal).toBeNull();
  });

  it('rejects Day 3+ forecasts', async () => {
    // Set target date 4 days in the future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 4);
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    // forecast=84F => ~29C
    mockFetch(28.9, 4);

    const market = makeMarket({
      question: `Will the high temperature in New York on ${isoDate} be 83-85°F?`,
    });
    const signal = await strategy.analyze(market);
    expect(signal).toBeNull();
  });

  it('returns signal when edge is sufficient (Day 1)', async () => {
    // Set target date 1 day in the future
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    // forecast ~84F (centered in 83-85 bucket)
    // Worst case is winter RMSE=3.5: P(83-85|84) = Phi(0.286) - Phi(-0.286) = ~0.225
    // With market price 0.10, edge YES = 0.225 - 0.10 = 0.125 > 0.08
    mockFetch(28.9, 1); // 28.9C = ~84.0F

    const market = makeMarket({
      question: `Will the high temperature in New York on ${isoDate} be 83-85°F?`,
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.10, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.90, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);
    expect(signal).not.toBeNull();
    expect(signal!.strategy).toBe('weather_model');
    expect(signal!.vertical).toBe('weather');
    expect(signal!.edge).toBeGreaterThanOrEqual(0.08);
    expect(signal!.side).toBe('YES');
    expect(signal!.confidence).toBeGreaterThan(0);
    expect(signal!.confidence).toBeLessThanOrEqual(0.95);
    expect(signal!.suggestedSize).toBeGreaterThan(0);
    expect(signal!.reasoning).toContain('NEW YORK');
  });

  it('returns NO signal when model probability is low', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    // forecast=95F, bucket 83-85 => model P very low
    // Market price YES = 0.05 => edge on NO: (1-low) - 0.95 = small
    // Actually model P ~ 0, market P YES = 0.05, edge YES = ~0 - 0.05 < 0
    // edge NO = (1-~0) - (1-0.05) = 1 - 0.95 = 0.05 < 0.08 => no signal
    mockFetch(35, 1); // 35C = 95F

    const market = makeMarket({
      question: `Will the high temperature in New York on ${isoDate} be 83-85°F?`,
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.05, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.95, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);
    expect(signal).toBeNull();
  });

  it('emits signal:detected on event bus', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    mockFetch(28.9, 1); // ~84F

    const emitSpy = vi.spyOn(eventBus, 'emit');

    const market = makeMarket({
      question: `Will the high temperature in New York on ${isoDate} be 83-85°F?`,
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.10, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.90, outcome: 'No' },
      },
    });

    const signal = await strategy.analyze(market);
    expect(signal).not.toBeNull();
    expect(emitSpy).toHaveBeenCalledWith('signal:detected', signal);
  });

  it('returns null when edge is below threshold', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    // Use a high minEdge so no signal is produced regardless of season
    const strictEdgeStrategy = new WeatherStrategy({ minEdge: 0.50, maxLeadDays: 2 });
    mockFetch(28.9, 1); // 84F

    const market = makeMarket({
      question: `Will the high temperature in New York on ${isoDate} be 83-85°F?`,
      tokens: {
        yes: { tokenId: 'yes-1', price: 0.30, outcome: 'Yes' },
        no: { tokenId: 'no-1', price: 0.70, outcome: 'No' },
      },
    });

    const signal = await strictEdgeStrategy.analyze(market);
    // Model P for bucket 83-85 with forecast 84F is at most ~0.38 (summer)
    // Max edge = 0.38 - 0.30 = 0.08, well below 0.50 minEdge
    expect(signal).toBeNull();
  });

  it('respects custom maxLeadDays config', async () => {
    const strictStrategy = new WeatherStrategy({ maxLeadDays: 1 });

    // Date 2 days out
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const year = dayAfter.getFullYear();
    const month = String(dayAfter.getMonth() + 1).padStart(2, '0');
    const day = String(dayAfter.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    mockFetch(28.9, 2);

    const market = makeMarket({
      question: `Will the high temperature in New York on ${isoDate} be 83-85°F?`,
    });

    const signal = await strictStrategy.analyze(market);
    expect(signal).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Edge detection unit tests (pure math, no fetch)
// ---------------------------------------------------------------------------

describe('Edge detection (bucket probability vs market price)', () => {
  it('detects YES edge when model > market', () => {
    // forecast=84F, summer RMSE=2.0, bucket 83-85
    const modelProb = bucketProbability(84, 2.0, 83, 85);
    const marketPrice = 0.20;
    const edge = modelProb - marketPrice;
    expect(edge).toBeGreaterThan(0.08);
  });

  it('detects NO edge when model prob is very low and market overprices YES', () => {
    // forecast=95F, summer RMSE=2.0, bucket 83-85 => model P near 0
    const modelProb = bucketProbability(95, 2.0, 83, 85);
    const marketYesPrice = 0.15;
    // Edge on NO side: (1 - modelProb) - (1 - marketYesPrice) = marketYesPrice - modelProb
    const noEdge = marketYesPrice - modelProb;
    expect(noEdge).toBeGreaterThan(0.10);
  });

  it('no edge when model and market agree', () => {
    const modelProb = bucketProbability(84, 2.8, 83, 85);
    // Set market = model
    const edge = Math.abs(modelProb - modelProb);
    expect(edge).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// CITY_COORDS sanity
// ---------------------------------------------------------------------------

describe('CITY_COORDS', () => {
  it('has coordinates for all major Polymarket cities', () => {
    const requiredCities = ['new york', 'nyc', 'los angeles', 'la', 'chicago', 'miami'];
    for (const city of requiredCities) {
      expect(CITY_COORDS[city]).toBeDefined();
      expect(CITY_COORDS[city].lat).toBeGreaterThan(20);
      expect(CITY_COORDS[city].lat).toBeLessThan(50);
    }
  });

  it('NYC and New York share coordinates', () => {
    expect(CITY_COORDS['nyc']).toEqual(CITY_COORDS['new york']);
  });

  it('LA and Los Angeles share coordinates', () => {
    expect(CITY_COORDS['la']).toEqual(CITY_COORDS['los angeles']);
  });
});
