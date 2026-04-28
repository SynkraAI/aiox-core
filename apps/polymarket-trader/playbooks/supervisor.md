# Supervisor / Auto-Restart Playbook

## Why

- **10/Abr/2026:** bot process (PID 7208) died silently; no one noticed for ~46h; 268 synthetic positions expired unresolved. Manual resolution created misleading WR of 94.4% (which the 16/Abr audit later proved was a data-leak artifact).
- **25/Abr/2026:** bot died again — OpenAI daily budget esgotou silenciosamente, processo finalizou, auto-start (Windows Startup folder) não recuperou. ~9 dias offline antes de detecção manual.

**Lesson (Conclave Ng — PM-PIVOT-1):** a long-running trading bot MUST have a supervisor that:
1. Detects crashes and restarts automatically.
2. Writes crash logs to disk for forensics.
3. Emits an alert (Telegram or heartbeat file) when it freezes (alive but stuck).
4. Caps OpenAI spend per day so a billing surprise doesn't kill the loop.

The supervisor stack has TWO complementary layers:

| Layer | Role | Files |
|-------|------|-------|
| **Service wrapper** | Restarts the process if it crashes. | NSSM (preferred Windows) / PM2 / Startup folder |
| **Watchdog** | Detects zombie / frozen state via heartbeat. | `scripts/watchdog.ps1` + Task Scheduler |
| **Budget guard** | Pauses LLM if daily OpenAI spend ≥ cap. | `BudgetController` in `market-analyzer.ts` |

The watchdog is REQUIRED — a crashed-but-restarted process can still freeze. The
heartbeat (`data/heartbeat.json`, written every scan) is the only authoritative liveness signal.

---

## Option A — PM2 (recommended, cross-platform)

### Install

```bash
npm install -g pm2
# optional: pm2-windows-startup to persist across reboots
npm install -g pm2-windows-startup
pm2-startup install
```

### Configure

Create `apps/polymarket-trader/ecosystem.config.cjs` (NOT committed if it contains secrets):

```js
module.exports = {
  apps: [{
    name: 'polymarket-bot',
    script: 'src/cli/index.ts',
    interpreter: 'C:/Program Files/nodejs/node.exe',
    interpreter_args: '--import tsx/esm',
    args: 'bot --start',
    cwd: 'D:/AIOS/apps/polymarket-trader',
    autorestart: true,
    watch: false,
    max_restarts: 50,
    min_uptime: '60s',                // reject restart loops faster than 1/min
    restart_delay: 10000,             // 10s cooldown between restarts
    max_memory_restart: '1G',
    kill_timeout: 15000,              // give 15s to flush positions on SIGTERM
    env: {
      NODE_ENV: 'production',
      PAPER_UNLIMITED: 'true',
    },
    out_file: 'data/pm2-stdout.log',
    error_file: 'data/pm2-stderr.log',
    combine_logs: true,
    time: true,
  }],
};
```

### Run

```bash
cd D:/AIOS/apps/polymarket-trader
pm2 start ecosystem.config.cjs
pm2 save          # persist the process list for startup
pm2 status        # view uptime, restarts, memory
pm2 logs polymarket-bot --lines 200
pm2 stop polymarket-bot
pm2 restart polymarket-bot
pm2 delete polymarket-bot
```

### Monitoring

- `pm2 status` — uptime, restart count, memory
- `pm2 logs` — stream combined stdout/stderr
- `pm2 monit` — live CPU/RAM dashboard

---

## Option B — NSSM (Windows-native service wrapper)

If PM2 is unavailable or you prefer a Windows Service:

### Install

1. Download NSSM from https://nssm.cc/
2. Unzip and place `nssm.exe` in `C:\Program Files\nssm\`
3. Add to PATH

### Configure

```powershell
# Run PowerShell as Administrator
nssm install PolymarketBot
# In the GUI:
#   Application Path:    C:\Program Files\nodejs\node.exe
#   Startup directory:   D:\AIOS\apps\polymarket-trader
#   Arguments:           --import tsx/esm src/cli/index.ts bot --start
#
# Tab "Exit actions":
#   Restart action: Restart application
#   Delay restart by: 10000 ms
#   Throttle:       60000 ms
#
# Tab "I/O":
#   Input:   (empty)
#   Output:  D:\AIOS\apps\polymarket-trader\data\nssm-stdout.log
#   Error:   D:\AIOS\apps\polymarket-trader\data\nssm-stderr.log
#
# Tab "Environment":
#   NODE_ENV=production
#   PAPER_UNLIMITED=true
#
# Click "Install service"
```

### Run

```powershell
nssm start PolymarketBot
nssm status PolymarketBot
nssm stop PolymarketBot
nssm restart PolymarketBot
nssm remove PolymarketBot confirm
```

Service logs: Event Viewer → Windows Logs → Application (filter source PolymarketBot).

---

## Option C — NSSM + Watchdog (recommended, PM-PIVOT-1)

The combo enabled by PM-PIVOT-1. NSSM owns the process lifecycle; the watchdog detects freezes.

### Install NSSM service

See `playbooks/nssm-install.md` for full instructions. Quick path:

```cmd
cd D:\AIOS\apps\polymarket-trader\scripts
install-nssm-service.bat        :: requires NSSM in PATH
nssm start PolymarketBot
```

### Install watchdog (Windows Task Scheduler)

```cmd
cd D:\AIOS\apps\polymarket-trader\scripts
install-watchdog-task.bat       :: every 5 min, hidden window
```

Verify task installed:
```cmd
schtasks /Query /TN PolymarketBotWatchdog /V /FO LIST
```

Manual fire (no need to wait 5 min):
```cmd
schtasks /Run /TN PolymarketBotWatchdog
```

### What the watchdog does

`scripts/watchdog.ps1`:
1. Reads `data/heartbeat.json` — JSON written by `auto-trader.ts::scanAndTrade()` after every poll.
2. If `now - heartbeat.ts > 10 min`, sends Telegram via `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` from `.env`.
3. Appends every tick to `data/watchdog.log` (forensics — second-tier monitoring even if Telegram is down).

Heartbeat schema:
```json
{
  "ts": 1714200000000,
  "scanCount": 1234,
  "eligibleReal": 18,
  "signals": 2,
  "lastTradeTs": 1714199100000
}
```

### Budget Guard

`OPENAI_DAILY_BUDGET_USD=5` in `.env` caps daily spend. When reached:
- LLM is paused (returns no signals)
- Bot falls back to heuristic trader
- State persisted in `data/llm-budget.json` so a restart mid-day doesn't reset the spend counter
- Resets at local midnight

Budget controller logs warnings at 80% and 100% — watch the bot stdout.

---

---

## Sanity Checklist (after enabling supervisor)

- [ ] Bot restarts automatically after `taskkill /F /PID {pid}` test
- [ ] Logs end up in `data/pm2-*.log` (or `data/nssm-*.log`)
- [ ] `min_uptime` / `throttle` prevents restart loops
- [ ] Restart persists across Windows reboot (PM2 + `pm2 save` + startup; or NSSM service with Startup=Automatic)
- [ ] Telegram bot receives restart notification (when heartbeat is later added)

---

## References

- 10/Abr/2026 incident: bot.pid PID 7208 died silently, no auto-restart
- 16/Abr/2026 audit: `C:\Users\kingp\.claude\projects\D--AIOS\memory\project_polymarket_data_leak_audit.md`
- Story: `docs/stories/polymarket-hybrid-refactor.md` (AC 15)
