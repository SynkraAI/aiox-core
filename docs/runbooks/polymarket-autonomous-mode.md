# Polymarket Trader — Autonomous Mode Runbook

**Audience:** Operator returning from travel (or anyone debugging while user is away).
**Last armed:** 2026-04-30 (PM-AUTONOMOUS-30D, planned horizon: 30 days).
**Bot mode at arming:** heuristic-only (`DISABLE_LLM=true`), real Polymarket+Kalshi only, ≤7d filter.

---

## What's running

| Component | Trigger | What it does | Owner script |
|-----------|---------|--------------|--------------|
| **Bot process** | Manual `start-bot.bat` or autostart wrapper | Trades real markets, writes `data/heartbeat.json` every scan, persists `data/bot.pid` | `src/cli/index.ts bot --start` (via tsx) |
| **PolymarketBotWatchdog** | Task Scheduler — every 5 min | Reads heartbeat, sends Telegram alert if heartbeat older than 10 min | `scripts/watchdog.ps1` |
| **PolymarketBotAutoStart** | Per-user Startup folder — runs once at logon | Sleeps 30s, then calls `start-bot.bat`. Reboot survival. | `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\PolymarketAutoStart.bat` (calls `D:\AIOS\apps\polymarket-trader\scripts\start-bot.bat`) |
| **PolymarketDailyCheckup** | Task Scheduler — daily 14:30 BRT | Snapshots `data/checkpoints/checkup-YYYYMMDD.json`, appends row to `data/journal.md`, sends Telegram daily summary, restarts bot if dead, alerts if 0 trades for 3+ days | `scripts/daily-checkup.ps1` |

### Why no Task Scheduler ONLOGON?

`schtasks /Create /SC ONLOGON` requires admin/UAC even with `/RU` and `/IT`. To stay autonomous (no UAC prompt while user is away), autostart is implemented via the per-user Startup folder, which executes at logon under the user account with no elevation. The wrapper there calls `start-bot.bat` by absolute path.

---

## Telegram channel

The bot's owner Telegram chat (`TELEGRAM_CHAT_ID` in `.env`) receives:

- **Watchdog alerts** — heartbeat stale > 10 min OR heartbeat missing OR malformed (every 5 min cadence).
- **Daily summary** — one message at 14:30 BRT with: scans, signals, trades opened, resolved (WxL), PnL paper, open positions, verticals, status.
- **Urgent alerts** — separate message when: bot crashed and restart failed, OR 0 trades for 3 consecutive days.

Bot username: `polymarket36_trader_bot`. Sender script: `scripts/telegram-notify.ps1` (reusable; `Send-TelegramMessage -Text ... -AppRoot ...`).

---

## How to read the journal

```
notepad D:\AIOS\apps\polymarket-trader\data\journal.md
```

Each row:

```
| 2026-04-30 | 174 | 0 | 0 | 0 | 0W 0L | $0.00 | - | OK |  |
| Date       | Scans | Signals | Open | Trades 24h | Resolved (WxL) | PnL paper | Verticais | Status | Notes |
```

Status values:
- `OK` — bot alive, heartbeat fresh, no alert criteria met.
- `STALE` — heartbeat older than 15 min (checkup threshold).
- `NO_HEARTBEAT` — `heartbeat.json` missing.
- `CRASHED+RESTARTED` — bot was dead, `start-bot.bat` invoked, new PID confirmed.
- `CRASHED+RESTART_FAILED` — bot was dead, restart attempt failed (urgent — Telegram alert sent).

Notes column contains `ALERT: 0 trades for N consecutive days` when the streak hits 3.

Snapshots (machine-readable): `data/checkpoints/checkup-YYYYMMDD.json` — preserved indefinitely.

---

## Decision tree (when to escalate)

| Signal | Severity | Action |
|--------|----------|--------|
| Telegram silent for 24h+ | High | Local: open journal, check `data/daily-checkup.log` and `data/watchdog.log`. Remote (no machine access): not recoverable until home. |
| `0 trades 3d+` alert | Medium | Verify Polymarket markets exist with edge (read `data/bot.log` last 200 lines, look for `eligible` count). If consistently 0 eligible — heuristic filters may need relaxation, but this is a manual decision. |
| `CRASHED+RESTARTED` row appears | Low | One-off restart succeeded. Check `data/bot-error.log` for cause if curious; no action needed if pattern doesn't repeat. |
| `CRASHED+RESTART_FAILED` row | Critical | Manual: RDP/local console, run `D:\AIOS\apps\polymarket-trader\scripts\start-bot.bat`, inspect `data/bot-error.log`. |
| PnL paper < -$50 | Medium (manual) | Bot is paper-mode by default; review `data/trades.db` to understand losses. Do NOT auto-tune filters. |
| Watchdog Telegram fires "heartbeat MISSING" | High | Bot didn't write any heartbeat — likely crashed early in startup. Check `data/bot-error.log`. |

---

## How to disarm (rollback to manual)

Run as the same user that installed (no UAC required for any of these):

```powershell
# Stop daily checkup
schtasks /Delete /TN "PolymarketDailyCheckup" /F

# Stop watchdog
schtasks /Delete /TN "PolymarketBotWatchdog" /F

# Disable autostart at next logon
del "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\PolymarketAutoStart.bat"

# Stop bot now
$p = Get-Content D:\AIOS\apps\polymarket-trader\data\bot.pid -Raw
Stop-Process -Id $p.Trim() -Force
```

---

## How to re-arm

```bat
cd /d D:\AIOS\apps\polymarket-trader
scripts\install-autostart-task.bat
scripts\install-daily-checkup-task.bat
scripts\install-watchdog-task.bat
scripts\start-bot.bat
```

All install scripts are idempotent (delete-then-create / overwrite).

Smoke test the Telegram path before walking away:

```powershell
pwsh -File D:\AIOS\apps\polymarket-trader\scripts\telegram-notify.ps1 `
    -Text "Test: autonomous mode re-armed." `
    -AppRoot D:\AIOS\apps\polymarket-trader
```

---

## Single points of failure (SPOF)

- **Machine power / Windows reboot** — covered by Startup folder wrapper, but only restarts at next logon. If the machine reboots and nobody logs in, the bot won't start. (User typically auto-logs-in.)
- **Network outage > 10 min** — bot retries internally, watchdog will alert if heartbeat goes stale.
- **Telegram API down** — script logs warning, continues. Journal is still updated locally.
- **`.env` rotation / token expiry** — Telegram token doesn't expire; Polymarket/Kalshi APIs are public read for market data. No OAuth refresh in scope.
- **Disk full** — `data/bot.log` rotates manually only. At ~24 KB per 100 scans (≈10 min), 30 days ≈ 100 MB. Not a concern unless disk is already near full.

**Estimated safe autonomous window: 30 days.** Beyond 30 days, accumulated journal entries and `bot.log` size warrant a manual review even if alerts stay quiet.

---

## What the autonomous scripts will NEVER do

By design (encoded in scripts):

- Modify `.env` (filters, model, budget caps, tokens)
- Modify TypeScript source under `src/`
- Run `cleanup-stale --yes` (positions are real, can't auto-purge)
- Open, merge, or push any git PR
- Install / modify NSSM service (UAC blocker)
- Auto-tune trading parameters when 0-trade streak fires (only alerts)

Operator decides on return.

---

## File map

```
D:\AIOS\apps\polymarket-trader\
├── .env                                          # Telegram + API keys (read-only to scripts)
├── data\
│   ├── bot.log / bot-error.log                  # Bot stdout / stderr
│   ├── bot.pid                                   # Current bot PID (or stale)
│   ├── heartbeat.json                            # Updated every scan
│   ├── open-positions.json                       # Active trades
│   ├── trades.db                                 # JSON file (legacy name)
│   ├── journal.md                                # Daily Markdown log (operator-facing)
│   ├── daily-checkup.log                         # Checkup forensics
│   ├── watchdog.log                              # Watchdog forensics
│   └── checkpoints\checkup-YYYYMMDD.json         # One snapshot per day
├── scripts\
│   ├── start-bot.bat                             # Bot launcher (existing)
│   ├── watchdog.ps1                              # 5-min heartbeat checker (existing)
│   ├── install-watchdog-task.bat                 # (existing)
│   ├── telegram-notify.ps1                       # NEW — reusable sender
│   ├── daily-checkup.ps1                         # NEW — main checkup logic
│   ├── install-autostart-task.bat                # NEW — drops Startup folder wrapper
│   └── install-daily-checkup-task.bat            # NEW — installs daily Task Scheduler entry
└── docs (here)
```

Startup wrapper (auto-generated, not in repo):
```
%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\PolymarketAutoStart.bat
```
