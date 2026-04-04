# Incident Response Playbook

## Alert Escalation Levels

| Level | Icon | Action | Response Time |
|-------|------|--------|---------------|
| `info` | (i) | Log only, no action needed | Review at next daily check |
| `warning` | (!) | Investigate within 1 hour | Check dashboard, review logs |
| `critical` | (!!!) | Immediate action required | Stop trading, investigate NOW |
| `human` | Manual escalation | Human must intervene | Phone notification |

The Health Monitor (`health-monitor.ts`) auto-emits alerts on these event bus events:
- `risk:circuit-breaker` -> `critical`
- `learning:drift-detected` -> `warning`
- `order:failed` -> `warning`
- `position:closed` (with P&L) -> `info`
- `risk:warning` -> `warning`

---

## Incident 1: Circuit Breaker Tripped

**Trigger:** Daily loss >= 10% OR weekly loss >= 20% of bankroll.

**Telegram alert:** `[CRITICAL] Circuit breaker tripped: Daily loss limit hit: X.X%`

### Investigation Steps

1. **Acknowledge alert and stop scheduler:**
   ```bash
   pm-trader stop
   ```

2. **Check what caused the losses:**
   ```bash
   pm-trader stats today
   pm-trader positions list --closed --today
   ```

3. **Identify pattern:**
   - [ ] Single large loss or many small losses?
   - [ ] One market/vertical or across the board?
   - [ ] Edge was real but market moved? Or bad signal?

4. **Check drift monitor:**
   ```bash
   pm-trader drift report
   ```
   - If drift detected: strategy is degrading, do NOT reset breaker
   - If no drift: likely a bad day, monitor tomorrow

5. **Resolution options:**

   | Finding | Action |
   |---------|--------|
   | Bad day, no drift | Wait until next day, daily P&L resets automatically |
   | Drift in one strategy | Disable that strategy: `pm-trader config disable-strategy <name>` |
   | Drift across all dimensions | Switch to paper mode, investigate |
   | Market anomaly (flash crash, etc.) | Wait for normalization, manual reset |

6. **Manual breaker reset (only after investigation):**
   ```bash
   pm-trader risk reset-breaker
   ```

---

## Incident 2: API Down / Unreachable

**Trigger:** Health check `api-connectivity` returns `fail`.

**Telegram alert:** `[WARNING] API unreachable: <error message>`

### Failover Procedure

1. **Confirm it is Polymarket, not your network:**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://gamma-api.polymarket.com/markets?limit=1
   ```

2. **Check Polymarket status:**
   - Twitter/X: `@polyaborket`
   - Discord: Polymarket official server

3. **System behavior during outage:**
   - Scheduler keeps running but market scans fail silently
   - No new signals generated (safe)
   - Existing positions are NOT affected (on-chain, not dependent on API)
   - Position checker logs errors but does not panic

4. **If outage > 1 hour:**
   ```bash
   pm-trader stop
   ```
   Wait for API to recover. Restart with `pm-trader start`.

5. **If outage > 24 hours:**
   - Close positions manually via Polymarket web UI if needed
   - Do NOT rely on the system for position management during extended outages

---

## Incident 3: Drift Detected

**Trigger:** Drift monitor z-score exceeds 2.0 threshold, or win rate drops below 55%, or EV/trade drops below $0.50.

**Telegram alert:** `[WARNING] Drift detected in <dimension>`

### Diagnosis Flow

1. **Get full drift report:**
   ```bash
   pm-trader drift report
   ```

2. **Check each dimension:**

   | Dimension | Healthy | Degrading | Action |
   |-----------|---------|-----------|--------|
   | Win Rate | > 55% | < 55% | Check if market conditions changed |
   | EV/Trade | > $0.50 | < $0.50 | Review position sizing, edge accuracy |
   | Edge Accuracy | MAE < 0.15 | MAE > 0.15 | Model predictions unreliable, recalibrate |
   | Execution Quality | Dev < 3% | Dev > 3% | Slippage/fees anomaly, check liquidity |

3. **Root cause analysis:**
   - [ ] Is this vertical-specific or system-wide?
   - [ ] Did market conditions change (volume drop, new participants)?
   - [ ] Is the data source (HYDRA feeds) still reliable?
   - [ ] Has the strategy been running long enough for this to be statistically significant? (need >= 50 trades in rolling window)

4. **Response by severity:**

   | Severity | Action |
   |----------|--------|
   | 1 dimension degrading | Monitor for 24h, no action yet |
   | 2 dimensions degrading | Reduce Kelly scale to 50% |
   | 3+ dimensions degrading | Switch to paper mode immediately |
   | All improving | No action, system self-correcting |

5. **If ACE evolution is enabled** (`aceEvolutionEnabled: true`), the system auto-evolves prompts every 100 trades. Check if a recent evolution caused the drift.

---

## Incident 4: Wallet Compromise

**Trigger:** Unexpected wallet balance change, unauthorized transaction, or key exposure.

**THIS IS A CRITICAL SECURITY INCIDENT. ACT IMMEDIATELY.**

### Emergency Shutdown

1. **Kill the trading system NOW:**
   ```bash
   pm-trader stop --emergency
   ```

2. **Revoke API keys immediately:**
   - Polymarket API: regenerate keys in dashboard
   - Remove old keys from environment

3. **Transfer remaining funds:**
   - Move all USDC and MATIC to a NEW wallet (not controlled by compromised key)
   - Use Polymarket web UI or direct contract interaction

4. **Key Rotation:**
   - [ ] Generate new Polygon wallet
   - [ ] Generate new Polymarket API credentials
   - [ ] Update all environment variables
   - [ ] Update Telegram bot token (if shared infrastructure)
   - [ ] Verify no other systems share the compromised key

5. **Forensics:**
   - [ ] Check transaction history for unauthorized trades
   - [ ] Identify how the key was exposed (log files? env file committed? memory dump?)
   - [ ] Check git history for accidental key commits
   - [ ] Review who/what had access to the machine

6. **Recovery:**
   - [ ] New wallet funded with remaining capital
   - [ ] All credentials rotated
   - [ ] System restarted in paper mode first
   - [ ] Monitor for 24h before resuming live trading

---

## Incident 5: Unexpected Loss > 15%

**Trigger:** Single-day realized loss exceeds 15% of bankroll (beyond the 10% circuit breaker, which means the breaker may have failed or losses accumulated across positions).

### Human Review Gate

1. **Full stop:**
   ```bash
   pm-trader stop --emergency
   ```

2. **This requires human review.** The system should NOT auto-recover from losses this severe.

3. **Gather data:**
   ```bash
   pm-trader stats today --detailed
   pm-trader positions list --all
   pm-trader health --report
   pm-trader drift report
   ```

4. **Questions to answer:**
   - [ ] Did the circuit breaker fire? If not, why?
   - [ ] Were losses from one market or spread across many?
   - [ ] Was there a market event (resolution dispute, oracle failure)?
   - [ ] Is the risk engine state consistent with the actual wallet balance?

5. **Do NOT restart until:**
   - [ ] Root cause is identified and documented
   - [ ] Circuit breaker logic is verified or fixed
   - [ ] Kelly scale is reduced for next session
   - [ ] Human explicitly approves restart

---

## Incident 6: Stuck Orders

**Trigger:** Health check `order-queue` shows >10 pending orders.

### Resolution

1. **Check order status:**
   ```bash
   pm-trader orders list --pending
   ```

2. **If orders are genuinely stuck (submitted but never filled/cancelled):**
   ```bash
   pm-trader orders cancel-all
   ```

3. **If on-chain transactions are pending:**
   - Check Polygon mempool for stuck txns
   - May need to send a speed-up transaction (higher gas)

4. **If recurring:** increase gas price buffer or reduce order frequency.

---

## Post-Incident Template

After any incident, document:

```
Incident: ___
Date: YYYY-MM-DD HH:MM
Severity: info / warning / critical
Duration: ___ minutes
Root cause: ___
Impact: ___
Resolution: ___
Preventive action: ___
Reviewed by: [agent/human]
```

Store in: `data/incidents/YYYY-MM-DD-<short-name>.md`
