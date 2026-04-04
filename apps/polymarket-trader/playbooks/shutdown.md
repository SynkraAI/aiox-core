# Graceful Shutdown Playbook

## Overview

Shutdown must be clean. Never kill the process hard -- always allow the system to flush state, warn about open positions, and send a final report.

---

## Shutdown Sequence

### Step 1: Initiate Shutdown

```bash
pm-trader stop
```

This triggers `system:stopped` on the event bus, which cascades through all modules.

### Step 2: Open Position Check

The system will warn if positions are still open:

- [ ] Review open positions list
- [ ] Decide: close positions now OR leave them open (they survive restart)

```bash
pm-trader positions list
```

**If positions must be closed before shutdown:**

```bash
# Close all at market price (paper mode: instant, live mode: market orders)
pm-trader positions close-all --confirm

# Close specific position
pm-trader positions close --market <market-id>
```

**Warning:** In live mode, closing positions at market price during low liquidity may incur significant slippage.

### Step 3: Cancel Pending Orders

- [ ] Verify no orders stuck in queue (threshold: >5 = warn, >10 = fail)

```bash
pm-trader orders cancel-all
```

The health monitor checks `order-queue` -- if pending > 0, wait for fills or cancel.

### Step 4: Flush Experience Store

- [ ] All pending trade records written to disk
- [ ] Drift monitor state persisted

```bash
pm-trader store flush
```

This ensures no in-memory trades are lost. The Experience Store auto-flushes on `system:stopped` events.

### Step 5: Scheduler Stop

The `TradingScheduler.stop()` method:
- Clears all `setInterval` handles (market-scan, edge-scan, position-check, daily-reset, drift-check)
- Emits `system:stopped { component: 'scheduler' }`
- No tasks will fire after this point

### Step 6: Final Health Report

```bash
pm-trader health --report
```

Generate and log a final health snapshot:
- Overall status (healthy/degraded/critical)
- Session P&L summary
- Trade count for session
- Any unresolved warnings

### Step 7: Telegram Notification

If Telegram is enabled, the system sends a shutdown message automatically:

```
[INFO] System shutdown complete.
Session: 14h 23m | Trades: 47 | P&L: +$12.34
Open positions: 3 (surviving restart)
Status: healthy
```

If Telegram is not configured, this prints to console only.

---

## Emergency Shutdown

For immediate halt (circuit breaker tripped, security incident):

```bash
pm-trader stop --emergency
```

This skips graceful flush and immediately:
1. Cancels all pending orders
2. Stops scheduler
3. Sends critical Telegram alert
4. Exits process

**Use only when:** wallet compromise suspected, runaway orders, or system behaving unexpectedly. See `incident-response.md` for full procedures.

---

## Post-Shutdown Checklist

- [ ] Confirm process is no longer running
- [ ] Check experience store file is not corrupted: `pm-trader store verify`
- [ ] Review session log for any errors
- [ ] If live mode: verify wallet balance matches expected (P&L + fees)
- [ ] Back up experience store if > 24h since last backup

```bash
# Backup experience store
cp data/experience-store.db "data/backups/experience-store-$(date +%Y%m%d-%H%M%S).db"
```

---

## Restart After Shutdown

See `startup.md`. The system is stateless between runs except for:
- **Experience Store** (SQLite file) -- persists all trade history
- **Config overrides** (env vars) -- reload from environment
- **Circuit breaker state** -- resets on fresh start (by design)
