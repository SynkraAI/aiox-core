/**
 * BACKTEST-1 Phase 1 — Vertical Classifier
 *
 * Maps a raw market (Polymarket Gamma payload OR Kalshi historical payload)
 * to (vertical, sport_subtype). Returns null if the market does not fit the
 * approved universe (politics / sports / finance / weather).
 *
 * User decision (2026-04-28):
 *   - crypto: SKIP (not in universe — was synth placebo in pre-pivot bot).
 *   - sports: major-only (NBA / NFL / MLB / soccer). College, MMA, esports, F1
 *             return null until further notice.
 *   - soccer: Champions League, Premier League, World Cup, Brasileirao only.
 *
 * Heuristic order matters: weather is checked BEFORE finance because
 * "temperature" can collide with "Fed temperature" rhetoric (false positive
 * test confirmed on 2026-04-28 spot check of Gamma payloads).
 *
 * Caveats:
 *   - Polymarket tags array is sometimes empty. Fall back to question text.
 *   - Kalshi exposes `series_ticker` / `event_ticker` which are highly
 *     structured (KX*); we use those primarily, question text as fallback.
 */

export type Vertical = 'politics' | 'sports' | 'finance' | 'weather' | 'crypto';
export type SportSubtype = 'nba' | 'nfl' | 'mlb' | 'soccer';

export interface ClassifierInput {
  /** 'polymarket' | 'kalshi' — drives which heuristics run first */
  source: 'polymarket' | 'kalshi';
  /** Raw question / title text */
  question: string;
  /** Optional tags array (Polymarket) or category string (Kalshi) */
  tags?: string[] | string;
  /** Kalshi-only: structured ticker, e.g. "KXNBAGAME-25APR28LAL" */
  ticker?: string;
  /** Kalshi-only: parent event ticker, e.g. "KXPRES" */
  eventTicker?: string;
}

export interface ClassifierOutput {
  vertical: Vertical;
  sportSubtype: SportSubtype | null;
}

// ---------------------------------------------------------------------------
// Keyword banks (lowercase, evaluated against question + tags)
// ---------------------------------------------------------------------------

const POLITICS_TAGS = ['politics', 'election', 'elections', 'president', 'presidential', 'congress', 'senate', 'governor', 'trump', 'biden', 'harris', 'desantis', 'newsom'];
const POLITICS_KW = ['election', 'president', 'congress', 'senate', 'governor', 'trump', 'biden', 'harris', 'primary', 'caucus', 'inauguration'];

// Weather has to go BEFORE finance because of false-positive overlap with
// macro rhetoric ("inflation heat wave" etc.).
const WEATHER_TAGS = ['weather', 'climate', 'temperature', 'hurricane', 'storm', 'snow', 'rain'];
const WEATHER_KW = ['temperature', 'tmax', 'tmin', '°f', '°c', 'hurricane', 'tropical storm', 'snowfall', 'rainfall', 'heat wave', 'drought', 'snow depth'];

const FINANCE_TAGS = ['macro', 'economics', 'fed', 'rates', 'gdp', 'cpi', 'inflation', 'stock market', 'stocks', 'equities', 'jobs report', 'unemployment'];
const FINANCE_KW = ['fed', 'fomc', 'fed funds', 'cpi', 'ppi', 'gdp', 'unemployment rate', 'jobs report', 'nfp', 'rate hike', 'rate cut', 's&p 500', 'nasdaq', 'dow', 'spx', 'ndx'];

// Crypto must be detected so we can RETURN NULL (skip).
const CRYPTO_TAGS = ['crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'solana', 'defi'];
const CRYPTO_KW = ['bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'crypto', 'memecoin', 'altcoin', 'coinbase'];

// Sports — major-only.
const SPORTS_TAGS = ['sports', 'nba', 'nfl', 'mlb', 'soccer', 'football', 'basketball', 'baseball'];

const NBA_KW = ['nba', 'lakers', 'celtics', 'warriors', 'nuggets', 'bucks', 'heat', 'sixers', 'knicks', 'suns'];
const NFL_KW = ['nfl', 'super bowl', 'patriots', 'cowboys', 'eagles', 'chiefs', '49ers', 'ravens', 'bills'];
const MLB_KW = ['mlb', 'yankees', 'dodgers', 'red sox', 'astros', 'braves', 'cubs', 'mets', 'world series'];
// Approved soccer competitions only:
const SOCCER_KW = ['champions league', 'premier league', 'world cup', 'brasileirao', 'brasileirão', 'fifa world cup', 'uefa champions'];

// Sports we EXPLICITLY exclude (would otherwise match generic 'sports' tag).
const SPORTS_EXCLUDE_KW = ['ncaa', 'college football', 'college basketball', 'mma', 'ufc', 'boxing', 'esports', 'formula 1', 'formula one', 'f1', 'tennis', 'golf', 'masters tournament', 'pga', 'cricket', 'rugby'];

// Kalshi event-ticker prefixes -> vertical map
const KALSHI_TICKER_MAP: Record<string, Vertical | { vertical: Vertical; sport: SportSubtype }> = {
  KXPRES: 'politics',
  KXSEN: 'politics',
  KXGOV: 'politics',
  KXCONGRESS: 'politics',
  KXELECT: 'politics',
  KXNBA: { vertical: 'sports', sport: 'nba' },
  KXNFL: { vertical: 'sports', sport: 'nfl' },
  KXMLB: { vertical: 'sports', sport: 'mlb' },
  KXSOCCER: { vertical: 'sports', sport: 'soccer' },
  KXCPI: 'finance',
  KXFED: 'finance',
  KXSPX: 'finance',
  KXNDX: 'finance',
  KXJOBS: 'finance',
  KXGDP: 'finance',
  KXTEMP: 'weather',
  KXRAIN: 'weather',
  KXSNOW: 'weather',
  KXHURRICANE: 'weather',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeTags(tags: string[] | string | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => String(t).toLowerCase());
  return [String(tags).toLowerCase()];
}

function anyKeyword(text: string, keywords: readonly string[]): boolean {
  return keywords.some(kw => text.includes(kw));
}

function detectSportSubtype(text: string): SportSubtype | null {
  if (anyKeyword(text, NBA_KW)) return 'nba';
  if (anyKeyword(text, NFL_KW)) return 'nfl';
  if (anyKeyword(text, MLB_KW)) return 'mlb';
  if (anyKeyword(text, SOCCER_KW)) return 'soccer';
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classify a market into the approved backtest universe.
 * Returns null if the market does not fit (crypto, college sports, niche etc.).
 */
export function classifyVertical(input: ClassifierInput): ClassifierOutput | null {
  const q = (input.question || '').toLowerCase();
  const tags = normalizeTags(input.tags);
  const tagText = tags.join(' ');
  const haystack = `${q} ${tagText}`;

  // ----- Kalshi shortcut: structured ticker prefix is authoritative -------
  if (input.source === 'kalshi' && input.eventTicker) {
    const prefix = input.eventTicker.toUpperCase().split('-')[0];
    const map = KALSHI_TICKER_MAP[prefix];
    if (map) {
      if (typeof map === 'string') {
        return { vertical: map, sportSubtype: null };
      }
      return { vertical: map.vertical, sportSubtype: map.sport };
    }
    // Unknown KX* prefix -> fall through to keyword classification.
  }

  // ----- 1. Crypto (re-included 2026-04-29 as backtest-only vertical — REAL PM markets ≤7d, NOT synth).
  // Bot runtime (auto-trader.ts) still has zero crypto code — synth was deleted in PM-PIVOT-1.
  // This vertical exists ONLY for the historical backtest universe to test if real PM crypto
  // markets (BTC weekly price markets etc.) have signal edge vs PM mid-price baseline.
  if (anyKeyword(haystack, CRYPTO_TAGS) || anyKeyword(haystack, CRYPTO_KW)) {
    return { vertical: 'crypto', sportSubtype: null };
  }

  // ----- 2. Weather (before finance to avoid 'inflation heat wave' collision) -----
  if (anyKeyword(tagText, WEATHER_TAGS) || anyKeyword(q, WEATHER_KW)) {
    return { vertical: 'weather', sportSubtype: null };
  }

  // ----- 3. Politics -----
  if (anyKeyword(tagText, POLITICS_TAGS) || anyKeyword(q, POLITICS_KW)) {
    return { vertical: 'politics', sportSubtype: null };
  }

  // ----- 4. Sports (major-only, with exclusion list) -----
  const looksLikeSports = anyKeyword(tagText, SPORTS_TAGS) ||
    anyKeyword(q, [...NBA_KW, ...NFL_KW, ...MLB_KW, ...SOCCER_KW]);

  if (looksLikeSports) {
    // Exclusions (NCAA, MMA, F1, etc.) -> reject even though "sports" tag matched.
    if (anyKeyword(haystack, SPORTS_EXCLUDE_KW)) return null;

    const sport = detectSportSubtype(haystack);
    if (sport) return { vertical: 'sports', sportSubtype: sport };

    // Tagged "sports" but no major-league keyword detected -> reject.
    return null;
  }

  // ----- 5. Finance -----
  if (anyKeyword(tagText, FINANCE_TAGS) || anyKeyword(q, FINANCE_KW)) {
    return { vertical: 'finance', sportSubtype: null };
  }

  // No vertical matched -> drop.
  return null;
}

/**
 * Convenience: bulk-classify and partition. Used by ingest scripts.
 */
export function partitionByVertical<T extends ClassifierInput>(
  markets: readonly T[]
): {
  classified: Array<T & { _vertical: Vertical; _sportSubtype: SportSubtype | null }>;
  rejected: T[];
} {
  const classified: Array<T & { _vertical: Vertical; _sportSubtype: SportSubtype | null }> = [];
  const rejected: T[] = [];

  for (const market of markets) {
    const result = classifyVertical(market);
    if (result) {
      classified.push({ ...market, _vertical: result.vertical, _sportSubtype: result.sportSubtype });
    } else {
      rejected.push(market);
    }
  }

  return { classified, rejected };
}
