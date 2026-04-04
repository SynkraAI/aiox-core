# Daily Operations Playbook

## Morning Check (09:00)

Run the morning diagnostic. This takes under 2 minutes.

### 1. System Health

```bash
pm-trader health
```

- [ ] Overall status: `healthy`
- [ ] All 6 checks: `ok`
- [ ] No unresolved warnings from overnight

### 2. Overnight P&L

```bash
pm-trader stats overnight
```

Review:
- [ ] Total P&L since last check
- [ ] Number of trades executed overnight
- [ ] Any positions that closed (check outcomes)
- [ ] Bankroll current balance

### 3. Drift Report

```bash
pm-trader drift report
```

- [ ] All 4 dimensions stable or improving:
  - Win Rate: > 55% (threshold: `DRIFT_THRESHOLDS.winRate.min`)
  - EV/Trade: > $0.50 (threshold: `DRIFT_THRESHOLDS.evPerTrade.min`)
  - Edge Accuracy: MAE < 0.15
  - Execution Quality: deviation < 3%
- [ ] No `alertTriggered: true` on any metric
- [ ] Baseline still valid (sample size adequate)

### 4. Circuit Breaker Status

```bash
pm-trader risk status
```

- [ ] `circuitBreakerTripped: false`
- [ ] Daily P&L within limits (< -10%)
- [ ] Weekly P&L within limits (< -20%)
- [ ] Open positions count within max (< 10)

---

## Midday Market Scan (13:00)

### 5. New Opportunities

```bash
pm-trader scan markets --new
```

- [ ] Review markets with edge > 8% (`DEFAULT_RISK_LIMITS.minEdge`)
- [ ] Check liquidity on flagged markets (> $5K volume threshold)
- [ ] Verify enabled verticals: `weather`, `crypto`

### 6. Expiring Positions

```bash
pm-trader positions list --expiring 24h
```

- [ ] Review positions expiring within 24 hours
- [ ] Decide: hold to resolution or exit early
- [ ] Check if market price has moved significantly from entry

### 7. Scheduler Health

```bash
pm-trader scheduler status
```

- [ ] All 5 tasks running
- [ ] No task has `lastError` set
- [ ] Task run counts incrementing normally:
  - Market Scanner: ~1/min (1440/day)
  - Edge Scanner: ~1/2min (720/day)
  - Position Checker: ~1/5min (288/day)
  - Drift Check: ~1/hr (24/day)
  - Daily Reset: 1/day

---

## Evening Review (21:00)

### 8. Daily Performance Summary

```bash
pm-trader stats today --detailed
```

Record:
- [ ] Total trades today
- [ ] Win/loss count and rate
- [ ] Gross P&L
- [ ] Net P&L (after fees)
- [ ] Best/worst trade
- [ ] Average position size

### 9. Risk Metrics

```bash
pm-trader risk summary
```

- [ ] Current bankroll
- [ ] Daily P&L percentage
- [ ] Total exposure (sum of open positions)
- [ ] Kelly utilization (actual vs max)

### 10. Experience Store Backup

```bash
pm-trader store backup
```

Creates a timestamped copy of the SQLite database. Keep at least 7 daily backups.

### 11. Telegram Daily Report

If configured, the system auto-sends an evening summary. Verify it was received.

---

## Weekly Review (Sunday Evening)

### 12. Strategy Performance

```bash
pm-trader stats weekly --by-strategy
```

For each strategy (`info_arb`, `weather_model`, `crypto_sentiment`):
- [ ] Win rate this week vs all-time
- [ ] EV contribution
- [ ] Trade count (is it finding opportunities?)
- [ ] Should any strategy be disabled or re-weighted?

### 13. Vertical Analysis

```bash
pm-trader stats weekly --by-vertical
```

- [ ] Weather vertical performance
- [ ] Crypto vertical performance
- [ ] Any vertical underperforming significantly?

### 14. Kelly Recalibration

```bash
pm-trader risk recalibrate
```

Based on current bankroll and performance:
- [ ] Is Kelly fraction (15%) still appropriate?
- [ ] Has bankroll grown/shrunk enough to change max position size?
- [ ] Review: `maxPositionSize: $50`, `maxBankrollPercent: 5%`

### 15. Drift Baseline Check

```bash
pm-trader drift baseline-status
```

- [ ] Baseline was set at trade #50
- [ ] Current window: last 50 trades
- [ ] Should baseline be refreshed? (only if strategy fundamentally changed)

### 16. Weekly Experience Store Backup

```bash
cp data/experience-store.db "data/backups/weekly-$(date +%Y%m%d).db"
```

Keep 4 weekly backups (1 month rolling).

---

## Monthly Review (1st of Month)

### 17. Full Performance Audit

```bash
pm-trader stats monthly --detailed
```

- [ ] Monthly return vs bankroll
- [ ] Sharpe-equivalent metric (return / volatility)
- [ ] Maximum drawdown
- [ ] Longest losing streak
- [ ] Trade count trend (increasing/stable/decreasing)

### 18. Strategy Evolution Check

- [ ] ACE has evolved prompts? (`ACE_CONFIG.tradesPerEvolution = 100`)
- [ ] Did evolution improve or degrade performance?
- [ ] Review drift trends over the month

### 19. System Maintenance

- [ ] Prune old event bus events
- [ ] Compact experience store: `pm-trader store compact`
- [ ] Review disk usage
- [ ] Update dependencies if security patches available
- [ ] Rotate API keys (security hygiene)

---

## Quick Reference: Key Thresholds

| Metric | Normal | Warning | Critical |
|--------|--------|---------|----------|
| Win Rate | > 60% | 55-60% | < 55% |
| EV/Trade | > $1.00 | $0.50-1.00 | < $0.50 |
| Daily P&L | Positive | -5% to -10% | < -10% (breaker) |
| Weekly P&L | Positive | -10% to -20% | < -20% (breaker) |
| Open Positions | 0-7 | 8-9 | 10 (max) |
| Pending Orders | 0-5 | 5-10 | > 10 |
| Edge Accuracy MAE | < 0.10 | 0.10-0.15 | > 0.15 |
| Memory Usage | < 70% | 70-90% | > 90% |
