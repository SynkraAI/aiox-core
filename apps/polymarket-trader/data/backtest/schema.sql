-- ============================================================================
-- BACKTEST-1 Phase 1 — Historical Markets Unified Schema
-- ============================================================================
-- Purpose: single source of truth for backtest universe (Polymarket + Kalshi
--          + NOAA-derived weather baseline). Runtime bot does NOT touch this DB.
--
-- Storage:  data/backtest/historical-markets.db (SQLite — node:sqlite, Node 22+)
-- Authors:  Dara (AIOS Data Engineer) — 2026-04-28
-- Story:    BACKTEST-1 (predecessor: PM-PIVOT-1)
--
-- Decisions baked in (user, 2026-04-28):
--   - Janela: 12 meses (2025-05-01 -> 2026-04-28)
--   - Verticais: politics, sports, finance, weather (crypto SKIP)
--   - Sports: NBA/NFL/MLB + soccer (Champions/Premier/WC/Brasileirao)
--   - Baseline: T-12h (CLOB granularity floor; nao forcar subgraph)
--
-- Migration: schema apenas. Nao usa Supabase (este DB e LOCAL ao backtest).
-- Rollback:  rm data/backtest/historical-markets.db (sem dependencias externas)
-- ============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;        -- concurrent reads while ingest writes
PRAGMA synchronous  = NORMAL;     -- WAL-safe, ~2x faster than FULL

-- ----------------------------------------------------------------------------
-- Table: historical_markets
-- ----------------------------------------------------------------------------
-- Single denormalized table by design (KISS). Backtest is read-mostly,
-- single-writer at ingest time, then read-only forever. No need for
-- 3NF — duration_h is derived but stored to avoid Math in every query.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historical_markets (
  market_id            TEXT    PRIMARY KEY,
  source               TEXT    NOT NULL CHECK (source IN ('polymarket', 'kalshi')),
  vertical             TEXT    NOT NULL CHECK (vertical IN ('politics', 'sports', 'finance', 'weather', 'crypto')),
  sport_subtype        TEXT             CHECK (sport_subtype IN ('nba', 'nfl', 'mlb', 'soccer') OR sport_subtype IS NULL),
  question             TEXT    NOT NULL,
  entry_ts             INTEGER NOT NULL,                    -- epoch_s, start of <=7d trading window
  end_ts               INTEGER NOT NULL,                    -- epoch_s, resolution timestamp
  duration_h           REAL    NOT NULL,                    -- (end_ts - entry_ts) / 3600
  liquidity_entry_usd  REAL,                                -- liquidity at entry_ts (NULL if unknown)
  volume_entry_usd     REAL,                                -- cumulative volume at entry_ts
  mid_price_t12h       REAL             CHECK (mid_price_t12h IS NULL OR (mid_price_t12h BETWEEN 0 AND 1)),
  resolved_outcome     INTEGER          CHECK (resolved_outcome IN (0, 1) OR resolved_outcome IS NULL),
  resolution_status    TEXT    NOT NULL CHECK (resolution_status IN ('resolved', 'void', 'disputed', 'pending')),
  raw_data_json        TEXT,                                -- original payload for debugging/re-derivation

  -- Cross-field invariants
  CHECK (end_ts > entry_ts),
  CHECK (duration_h > 0 AND duration_h <= 168),              -- <=7d hard universe limit
  -- Sport_subtype only valid when vertical='sports'
  CHECK (
    (vertical = 'sports') OR (sport_subtype IS NULL)
  ),
  -- Resolved markets must have an outcome (0/1); void/disputed/pending have NULL outcome
  CHECK (
    (resolution_status = 'resolved' AND resolved_outcome IS NOT NULL) OR
    (resolution_status IN ('void', 'disputed', 'pending') AND resolved_outcome IS NULL)
  )
);

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
-- Hot path 1: "give me all sports markets in PM resolved 2025-Q4" -> source+vertical
-- Hot path 2: "iterate by resolution time" -> end_ts
-- Hot path 3: "filter usable for Brier (resolved + has baseline)" -> resolution_status
CREATE INDEX IF NOT EXISTS idx_hm_source_vertical    ON historical_markets (source, vertical);
CREATE INDEX IF NOT EXISTS idx_hm_end_ts             ON historical_markets (end_ts);
CREATE INDEX IF NOT EXISTS idx_hm_resolution_status  ON historical_markets (resolution_status);
-- Compound for the most common Phase 2 query: usable rows per vertical per source
CREATE INDEX IF NOT EXISTS idx_hm_usable             ON historical_markets (source, vertical, resolution_status)
  WHERE resolution_status = 'resolved' AND mid_price_t12h IS NOT NULL;

-- ----------------------------------------------------------------------------
-- Auxiliary table: weather_climatology
-- ----------------------------------------------------------------------------
-- NOAA GHCN-Daily 1991-2020 normals. Indexed by (station_id, doy, metric).
-- Used as null-model baseline for vertical='weather'. Loaded by ingest-noaa-ghcn.ts.
-- (station, doy, metric) is unique key.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weather_climatology (
  station_id   TEXT    NOT NULL,            -- e.g. 'USW00094728' (Central Park NY)
  doy          INTEGER NOT NULL CHECK (doy BETWEEN 1 AND 366),
  metric       TEXT    NOT NULL CHECK (metric IN ('TMAX', 'TMIN', 'PRCP', 'SNOW', 'SNWD')),
  -- 30-year empirical distribution snapshot
  mean         REAL,
  stddev       REAL,
  p10          REAL,
  p25          REAL,
  p50          REAL,
  p75          REAL,
  p90          REAL,
  n_years      INTEGER NOT NULL,            -- count of years with valid data (cap 30)
  raw_values_json  TEXT,                    -- JSON-array of historical values for ad-hoc P_climate(threshold)

  PRIMARY KEY (station_id, doy, metric)
);

CREATE INDEX IF NOT EXISTS idx_wc_station ON weather_climatology (station_id);

-- ----------------------------------------------------------------------------
-- Ingest run metadata
-- ----------------------------------------------------------------------------
-- Tracks each ingest invocation for idempotency + auditing.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingest_runs (
  run_id         INTEGER PRIMARY KEY AUTOINCREMENT,
  script         TEXT    NOT NULL,           -- e.g. 'ingest-polymarket-gamma'
  started_at     INTEGER NOT NULL,           -- epoch_s
  finished_at    INTEGER,
  status         TEXT    NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'aborted')),
  rows_inserted  INTEGER DEFAULT 0,
  rows_updated   INTEGER DEFAULT 0,
  rows_skipped   INTEGER DEFAULT 0,
  error_message  TEXT,
  notes          TEXT
);

CREATE INDEX IF NOT EXISTS idx_ir_script ON ingest_runs (script, started_at DESC);

-- ============================================================================
-- End of schema
-- ============================================================================
