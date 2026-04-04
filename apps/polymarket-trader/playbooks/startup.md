# System Startup Playbook

## Pre-Flight Checklist

### Environment Variables

- [ ] `POLYMARKET_API_KEY` set and valid
- [ ] `POLYMARKET_SECRET` set and valid
- [ ] `POLYMARKET_PASSPHRASE` set (for CLOB API signing)
- [ ] `POLYGON_PRIVATE_KEY` set (wallet key, **never** committed to git)
- [ ] `TELEGRAM_BOT_TOKEN` set (if alerts enabled)
- [ ] `TELEGRAM_CHAT_ID` set (if alerts enabled)

```bash
pm-trader config validate
```

### API Connectivity

- [ ] Gamma API reachable: `https://gamma-api.polymarket.com/markets?limit=1`
- [ ] CLOB API reachable: `https://clob.polymarket.com`
- [ ] Polygon RPC responding (chain ID 137)

```bash
pm-trader health check-api
```

### Wallet Balance (Live Mode Only)

- [ ] USDC balance >= initial bankroll amount ($500-1000)
- [ ] MATIC balance >= 0.5 for gas fees
- [ ] Wallet address matches expected address

```bash
pm-trader wallet balance
```

---

## Start Sequence

Modules initialize in this order:

1. **Config Loader** -- reads `defaults.ts` + env overrides
2. **Event Bus** -- central nervous system, must be first
3. **Experience Store** -- SQLite/procedural memory (opens DB file)
4. **Risk Engine** -- initializes with bankroll + `DEFAULT_RISK_LIMITS`:
   - Kelly fraction: 15%
   - Max position: $50
   - Daily loss limit: -10%
   - Weekly loss limit: -20%
   - Min edge: 8%
   - Max open positions: 10
5. **Drift Monitor** -- window size 50, baseline after 50 trades
6. **Health Monitor** -- wires auto-alerts to event bus
7. **Paper Trader** or **Live Trader** -- depends on `mode` config
8. **Scheduler** -- starts recurring tasks:
   - Market Scanner: every 60s
   - Edge Scanner: every 120s
   - Position Checker: every 300s
   - Daily P&L Reset: every 24h
   - Drift Check: every 3600s

```bash
# Paper mode (default, always start here)
pm-trader start --mode paper

# Live mode (only after paper-to-live gate passed)
pm-trader start --mode live
```

---

## Verification Steps

After startup, confirm all systems green:

### 1. Health Check

```bash
pm-trader health
```

Expected output: all 6 checks `ok`:
- `api-connectivity` -- Polymarket API reachable
- `position-exposure` -- Risk engine active
- `circuit-breaker` -- Not tripped
- `drift-status` -- No drift detected
- `order-queue` -- 0 pending orders
- `disk-space` -- Memory usage normal

### 2. Scheduler Status

```bash
pm-trader scheduler status
```

Confirm all 5 tasks registered and running.

### 3. Test Signal (Paper Mode)

```bash
pm-trader test-signal --market "test" --edge 0.10
```

Verify: signal flows through Risk Engine, gets Kelly-sized, paper trade executes.

### 4. Telegram Test (If Enabled)

```bash
pm-trader alert test "Startup verification complete"
```

Check phone for notification.

---

## Paper Mode vs Live Mode

| Aspect | Paper | Live |
|--------|-------|------|
| Trade execution | Simulated with real prices | Real orders on Polymarket CLOB |
| Slippage | Estimated (0.5-2%) | Actual fill price |
| Fees | Estimated (~1% taker) | Real taker/maker fees |
| Wallet | Not touched | USDC debited/credited |
| Experience Store | Records with `paper-trade` tag | Records with `live-trade` tag |
| Risk Engine | Full enforcement | Full enforcement |
| Circuit Breakers | Active (simulated P&L) | Active (real P&L) |

Paper mode is the **default** (`DEFAULT_CONFIG.mode = 'paper'`). Live mode requires explicit opt-in and passing the Go/No-Go gate. See `paper-to-live.md`.

---

## Troubleshooting Startup Failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| `API unreachable` | Network or Polymarket down | Check `https://gamma-api.polymarket.com` in browser, retry in 5 min |
| `Experience store lock` | Another instance running | Kill existing process, delete lockfile |
| `Circuit breaker tripped on start` | Stale state from crash | `pm-trader risk reset-breaker` |
| `Telegram send failed` | Invalid token/chat ID | Verify with `curl https://api.telegram.org/bot<TOKEN>/getMe` |
| `Insufficient MATIC` | Low gas balance | Top up MATIC on Polygon via bridge |
