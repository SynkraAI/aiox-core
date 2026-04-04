# Paper to Live Transition Playbook

## Overview

This is the most critical transition in the system. Moving from paper trading to live trading means real capital is at risk. The UltraPlan mandates **30 days minimum paper trading** before any live capital deployment.

---

## Phase 1: Minimum Criteria Check

All criteria MUST pass. No exceptions.

### Quantitative Gates

- [ ] **Duration:** >= 30 calendar days of paper trading
- [ ] **Trade count:** >= 500 completed trades
- [ ] **Win rate:** > 60%
- [ ] **Expected Value:** EV per trade > $0 (profitable on average)
- [ ] **Drift monitor:** no active alerts, baseline established

```bash
pm-trader paper status
```

Expected output when ready:
```
Mode: paper
Days running: 32
Trade count: 547
Win rate: 63.2%
EV/trade: +$1.24
Open positions: 5
Ready for live: YES
```

If `Ready for live: NO`, do not proceed. Continue paper trading until all thresholds are met.

### Qualitative Review

- [ ] No cluster of losses in final 7 days (recency check)
- [ ] Strategies performing consistently (not one lucky streak)
- [ ] Drift monitor shows `stable` or `improving` across all 4 dimensions:
  - Win Rate trend
  - EV per Trade trend
  - Edge Accuracy trend
  - Execution Quality trend

```bash
pm-trader drift report
```

---

## Phase 2: Statistical Validation

### Sample Size Adequacy

- [ ] At least 50 trades per enabled strategy
- [ ] At least 100 trades per enabled vertical (weather, crypto)
- [ ] Confidence interval for win rate does not overlap 50%

```bash
pm-trader stats validate --confidence 0.95
```

### Drawdown Analysis

- [ ] Maximum drawdown during paper period < 15% of bankroll
- [ ] No single day loss > 10% (circuit breaker would have triggered)
- [ ] Recovery time from worst drawdown < 5 days

### Edge Persistence

- [ ] Edge has been consistent across the full 30-day window
- [ ] No evidence of edge decay (drift monitor edgeAccuracy MAE < 0.15)
- [ ] Strategy performance does not correlate with market volume spikes (avoid survivorship bias)

---

## Phase 3: Security Checklist

### Wallet Security

- [ ] Dedicated trading wallet created (NOT personal wallet)
- [ ] Private key stored encrypted (never in plaintext, never in `.env` on disk)
- [ ] Wallet funded with initial bankroll: $500-1000 USDC
- [ ] MATIC balance >= 1.0 for gas (buffer for multiple txns)
- [ ] Wallet address whitelisted in config

### API Keys

- [ ] Polymarket API credentials valid and scoped
- [ ] API keys rotated (not the same ones used during paper period)
- [ ] Rate limits understood and respected

### Monitoring

- [ ] Telegram bot verified working: `pm-trader alert test "Go-live test"`
- [ ] Alert escalation configured (info -> warning -> critical)
- [ ] Human phone notifications enabled for `critical` alerts

### Backup

- [ ] Experience store backed up before transition
- [ ] Config snapshot saved
- [ ] Rollback procedure documented (this playbook, Phase 5)

---

## Phase 4: Gradual Rollout

**Do NOT go from paper to 100% live overnight.** Follow this 7-day ramp:

### Day 1-2: 25% Kelly

```bash
pm-trader start --mode live --kelly-scale 0.25
```

- Kelly fraction: 15% * 0.25 = 3.75% of optimal
- Max position: effectively ~$12.50 per trade
- Monitor: every trade, every fill, every P&L update
- Expected: 5-10 trades/day at small sizes

**Daily check:**
- [ ] All fills executing correctly (no slippage anomalies)
- [ ] P&L tracking matches wallet balance delta
- [ ] No order failures or stuck orders
- [ ] Telegram alerts arriving for all events

### Day 3-4: 50% Kelly

```bash
pm-trader config set kelly-scale 0.50
```

- Kelly fraction: 15% * 0.50 = 7.5% of optimal
- Max position: ~$25 per trade
- Monitor: twice daily (morning + evening)

**Check:**
- [ ] Slippage within expected range (< 2%)
- [ ] No circuit breaker trips
- [ ] Live performance within 1 standard deviation of paper performance

### Day 5-6: 75% Kelly

```bash
pm-trader config set kelly-scale 0.75
```

- Kelly fraction: 15% * 0.75 = 11.25% of optimal
- Max position: ~$37.50 per trade

**Check:**
- [ ] Cumulative live P&L positive
- [ ] Drift monitor still green
- [ ] No unexpected behavior

### Day 7: 100% Kelly

```bash
pm-trader config set kelly-scale 1.00
```

- Kelly fraction: 15% of optimal (full `DEFAULT_RISK_LIMITS.kellyFraction`)
- Max position: $50 per trade (`DEFAULT_RISK_LIMITS.maxPositionSize`)
- Max bankroll %: 5% per position (`DEFAULT_RISK_LIMITS.maxBankrollPercent`)

**Confirmation:**
- [ ] Full week of live trading completed without incident
- [ ] Performance matches or exceeds paper trading baseline
- [ ] All monitoring and alerting stable

---

## Phase 5: Rollback Procedure

If live performance diverges significantly from paper:

### Trigger Conditions for Rollback

- Live win rate < paper win rate - 10 percentage points
- 3 consecutive losing days
- Circuit breaker tripped in first 7 days
- Any order execution anomaly (wrong fill, missing fill)
- Slippage consistently > 3x paper estimates

### Rollback Steps

1. **Halt new trades immediately:**
   ```bash
   pm-trader stop --emergency
   ```

2. **Close all open positions** (if safe to do so):
   ```bash
   pm-trader positions close-all --confirm
   ```

3. **Switch back to paper mode:**
   ```bash
   pm-trader start --mode paper
   ```

4. **Investigate root cause:**
   ```bash
   pm-trader stats compare --paper-vs-live
   pm-trader drift report
   ```

5. **Document findings:**
   - What diverged? (slippage, edge accuracy, execution quality)
   - Was it market conditions or system issue?
   - What needs to change before next attempt?

6. **Wait minimum 7 days** before attempting live again

7. **Re-run Phase 1-3 checks** before second attempt

---

## Decision Log Template

Record the Go/No-Go decision:

```
Date: YYYY-MM-DD
Decision: GO / NO-GO
Paper duration: ___ days
Trade count: ___
Win rate: ___%
EV/trade: $___
Max drawdown: ___%
Kelly scale start: 25%
Bankroll: $___
Reviewed by: [agent/human]
Notes: ___
```
