# NSSM (Windows Service) — Manual Install

PM-PIVOT-1 Fase 0 (Conclave Ng — supervisor inegociavel).

NSSM wraps a long-running command (`node ... src/cli/index.ts bot --start`) as a real
Windows service. Auto-restart on crash, survives reboot, runs without an interactive
session. **Preferred over the Startup folder** for headless operation.

## Prerequisites

- Admin PowerShell or cmd
- Node.js 20+ at `C:\Program Files\nodejs\node.exe` (edit `install-nssm-service.bat` if elsewhere)

## Install NSSM

1. Download zip: https://nssm.cc/download (latest stable, e.g. 2.24)
2. Unzip the matching architecture (`win64\nssm.exe`) to `C:\Program Files\nssm\`
3. Add `C:\Program Files\nssm\` to the system PATH (System Properties → Environment Variables)
4. Open a NEW admin shell so PATH is reloaded
5. Verify: `nssm version`

## Install the bot as a service

```cmd
cd D:\AIOS\apps\polymarket-trader\scripts
install-nssm-service.bat
```

The script removes any prior `PolymarketBot` service and installs fresh with these settings:

| Setting | Value |
|---------|-------|
| App | `node.exe --import tsx/esm src/cli/index.ts bot --start` |
| Working dir | `D:\AIOS\apps\polymarket-trader` |
| Stdout/stderr | `data\nssm-stdout.log`, `data\nssm-stderr.log` (rotated at 10MB) |
| Restart delay | 10s |
| Throttle | 60s (rejects restart loops faster than 1/min) |
| Startup | Automatic |
| Env | `NODE_ENV=production`, `PAPER_UNLIMITED=true` |

## Operate

```cmd
nssm start PolymarketBot
nssm status PolymarketBot
nssm stop PolymarketBot
nssm restart PolymarketBot
nssm remove PolymarketBot confirm
```

Live logs:
```cmd
powershell -Command "Get-Content -Wait D:\AIOS\apps\polymarket-trader\data\nssm-stdout.log -Tail 50"
```

Event Viewer → Windows Logs → Application (filter source `PolymarketBot`) for service-level events.

## Sanity checks

- [ ] `nssm status PolymarketBot` returns `SERVICE_RUNNING`
- [ ] `data\heartbeat.json` is updated within 60s of start
- [ ] `taskkill /F /PID <pid>` triggers an auto-restart within 10s
- [ ] Reboot Windows — service comes back automatically
- [ ] Telegram watchdog (`scripts/watchdog.ps1` via Task Scheduler) does NOT alert during the test

## Troubleshooting

**Service starts but immediately stops**: check `data\nssm-stderr.log` for unhandled
exception. Most common: missing `OPENAI_API_KEY` or invalid `.env` parse.

**`tsx/esm` not found**: NSSM runs from a different env. Reinstall deps in the app root:
`cd D:\AIOS\apps\polymarket-trader && npm install`.

**Service fails to install**: shell not elevated. Open `cmd` as Administrator.

## Why not PM2?

PM2 works great cross-platform but the post-incident win on Windows specifically is
NSSM: it's a native service (`services.msc` shows it), survives reboot without `pm2-startup`,
and integrates with Windows Event Log. For Linux/Mac deploys, PM2 remains the recommendation.

## References

- 25/Abr/2026 incident: bot died (OpenAI budget esgotado), auto-start não recuperou
- Conclave 27/Abr (chip-huyen + andrew-ng + guillermo-rauch)
- Story: `docs/stories/PM-PIVOT-1-real-only-7d.md`
