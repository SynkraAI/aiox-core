# Vertical Expansion Playbook

## Overview

Adding a new prediction market vertical (e.g., politics, sports, science) requires careful integration, calibration, and validation. Never go live on a new vertical without completing paper trading minimums.

Current enabled verticals (from `DEFAULT_CONFIG.enabledVerticals`): `weather`, `crypto`.

---

## Step 1: Vertical Definition

### Template

Create a vertical config file at `src/verticals/<vertical-name>.ts`:

```typescript
export const VERTICAL_CONFIG = {
  name: '<vertical-name>',
  slug: '<vertical-name>',
  description: '<what this vertical covers>',
  
  // Data sources
  dataSources: [
    { type: 'hydra', feedId: '<hydra-feed-id>' },
    { type: 'api', endpoint: '<external-api-url>' },
  ],
  
  // Market filters
  filters: {
    minLiquidity: 5000,        // Match DEFAULT_RISK_LIMITS.minLiquidity
    minVolume24h: 1000,
    maxTimeToResolution: 90,   // days
    excludeKeywords: [],       // markets to skip
  },
  
  // Strategy mappings
  strategies: ['info_arb', '<vertical-specific-strategy>'],
  
  // Risk overrides (optional, defaults to global)
  riskOverrides: {
    maxPositionSize: 50,       // Can be lower for new verticals
    kellyFraction: 0.10,       // Start conservative
    minEdge: 0.10,             // Higher edge requirement initially
  },
};
```

### Checklist

- [ ] Vertical name and slug defined
- [ ] Target markets identified on Polymarket
- [ ] Sufficient market count (>= 20 active markets)
- [ ] Average liquidity per market > $5,000

---

## Step 2: Data Source Integration

### HYDRA Adapter

If using HYDRA for data feeds:

- [ ] Identify relevant HYDRA sources (RSS feeds, APIs, social media)
- [ ] Create adapter at `src/integrations/hydra/<vertical-name>-adapter.ts`
- [ ] Register sources in HYDRA pipeline
- [ ] Test data flow: source -> HYDRA -> trading system

### External APIs

- [ ] API key obtained and stored in environment
- [ ] Rate limits documented
- [ ] Error handling for API downtime
- [ ] Data format mapped to internal types

### Data Quality Checks

- [ ] Data freshness: updates within acceptable latency
- [ ] Data completeness: no critical gaps
- [ ] Data accuracy: cross-reference with at least one other source
- [ ] Historical data available for backtesting (>= 90 days)

---

## Step 3: Strategy Calibration

### Minimum Requirements

Every new vertical must go through calibration before paper trading:

- [ ] **Backtest:** Run strategy against historical data (if available)
- [ ] **Edge analysis:** Verify the system can detect edge > 8% on historical markets
- [ ] **False positive rate:** < 30% of signals should be noise

### Strategy Registration

Add the vertical to the strategy stack:

```bash
pm-trader config add-vertical <vertical-name>
pm-trader config add-strategy <strategy-name>
```

Or update `DEFAULT_CONFIG.enabledVerticals` in `src/config/defaults.ts`.

### Paper Trading Minimums Per Vertical

| Metric | Threshold |
|--------|-----------|
| Duration | >= 14 days of paper trading on this vertical |
| Trade count | >= 100 completed trades |
| Win rate | > 55% (lower than system-wide 60% for new verticals) |
| EV/trade | > $0 |
| Drift | No alerts in final 7 days |

```bash
pm-trader stats --vertical <vertical-name> --paper
```

---

## Step 4: Risk Parameters

### Conservative Start

New verticals always start with reduced risk:

| Parameter | System Default | New Vertical |
|-----------|---------------|--------------|
| Kelly fraction | 15% | 10% |
| Max position | $50 | $25 |
| Min edge | 8% | 10% |
| Max positions | 10 (shared) | 3 (vertical cap) |

### Correlation Check

Before enabling a new vertical alongside existing ones:

- [ ] Does the new vertical correlate with existing verticals?
- [ ] Can simultaneous losses across verticals breach the daily loss limit?
- [ ] Total portfolio exposure across all verticals within risk budget?

### Vertical-Specific Circuit Breakers

Consider adding per-vertical loss limits:

- [ ] Max daily loss per vertical: -5% of allocated bankroll
- [ ] Max open positions per vertical: 3
- [ ] Auto-disable vertical if 5 consecutive losses

---

## Step 5: Mind Clone Consultation

Before going live on any new vertical, consult relevant Mind Clones from the squad:

### Required Consultations

| Vertical | Mind Clones | Focus |
|----------|-------------|-------|
| Politics | nir-eyal, richard-thaler | Crowd psychology, behavioral anomalies |
| Sports | cassie-kozyrkov, aswath-damodaran | Statistical rigor, odds analysis |
| Crypto | chip-huyen, andrew-ng | ML signals, sentiment analysis |
| Weather | chip-huyen, simon-willison | Data pipeline, model accuracy |
| Science | cassie-kozyrkov, martin-fowler | Statistical validation, data integration |
| Finance | aswath-damodaran, ray-dalio | Valuation, correlation, portfolio theory |

### Consultation Checklist

- [ ] Consulted at least 2 Mind Clones relevant to the vertical
- [ ] Documented their input and recommendations
- [ ] Incorporated risk-specific advice into vertical config
- [ ] Reviewed any concerns or red flags raised

```bash
# Example: consult for politics vertical
node .aios-core/core/jarvis/self-consultation.js conclave \
  --question "Should we add politics as a prediction market vertical? Key risks and edge opportunities?" \
  --project polymarket-trader \
  --agent dev \
  --experts 3
```

---

## Step 6: Go-Live Checklist

Final gate before enabling the vertical in live mode:

### Pre-Live

- [ ] Paper trading minimums met (Step 3)
- [ ] Risk parameters configured (Step 4)
- [ ] Mind Clone consultation complete (Step 5)
- [ ] Data sources verified stable for >= 14 days
- [ ] Strategy performance documented

### Activation

```bash
# Enable vertical
pm-trader config add-vertical <vertical-name>

# Verify
pm-trader config show
```

### Post-Activation (First 7 Days)

- [ ] Daily review of vertical-specific performance
- [ ] Compare live vs paper metrics
- [ ] Watch for slippage anomalies (new markets may have thin books)
- [ ] Drift monitor tracking the new vertical separately
- [ ] Ready to disable if performance diverges

### Rollback

If the vertical underperforms in live mode:

```bash
pm-trader config remove-vertical <vertical-name>
```

This stops new signals for the vertical but does NOT close existing positions. Close them manually if needed:

```bash
pm-trader positions list --vertical <vertical-name>
pm-trader positions close-all --vertical <vertical-name> --confirm
```

---

## Vertical Expansion Roadmap

Per UltraPlan:

| Phase | Verticals | Status |
|-------|-----------|--------|
| Phase 1-2 | Weather, Crypto | Enabled (initial) |
| Phase 3 | Politics, Sports | Planned |
| Phase 4+ | Science, Finance, Pop Culture | Evaluated per demand |

Each vertical added increases portfolio complexity. Do not enable more than 2 new verticals in the same month.
