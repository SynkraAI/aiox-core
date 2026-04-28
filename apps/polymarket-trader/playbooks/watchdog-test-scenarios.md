# Watchdog Smoke Test Scenarios

**Scope:** Manual smoke test procedures to verify `scripts/watchdog.ps1` and the heartbeat-based supervisor before considering the supervisor "live".

**Story:** PM-PIVOT-1 — Fase 0 Supervisor + Heartbeat (AC 1-4).

**Owner:** @qa runs these once before flagging the story as VERIFIED. Re-run any time `watchdog.ps1`, `auto-trader.ts::scanAndTrade`, or the Task Scheduler config changes.

**Pre-requisites:**

- `apps/polymarket-trader/scripts/watchdog.ps1` exists and is executable.
- `.env` has `TELEGRAM_BOT_TOKEN` set (and optionally `TELEGRAM_CHAT_ID` for direct messaging).
- A second Telegram account or test chat is available so we don't pollute the production alert channel.
- `apps/polymarket-trader/data/` is writable.
- PowerShell 5.1+ (Windows native) — confirm with `$PSVersionTable.PSVersion`.

**Conventions:**

- All paths absolute. Cwd-independence is part of the contract.
- Each scenario is self-contained: setup → action → expected → cleanup.
- "Pass" criteria are all observable (file content, Telegram message, log line). No behavior is asserted by hand-waving.

---

## Scenario 1 — Bot is running OK; watchdog stays silent

**Goal:** Confirm the happy path. A fresh heartbeat means no alert.

**Setup:**

1. Ensure bot process is running (e.g. via `pm2 status` or check `data/bot.pid`).
2. Confirm `data/heartbeat.json` exists and `now - heartbeat.ts < 600_000` ms (10 min).
   ```powershell
   Get-Content "D:\AIOS\apps\polymarket-trader\data\heartbeat.json" | ConvertFrom-Json
   ```
3. Note current Telegram chat state (last message timestamp).

**Action:**

```powershell
pwsh -ExecutionPolicy Bypass -File "D:\AIOS\apps\polymarket-trader\scripts\watchdog.ps1"
```

**Expected:**

- Exit code `0`.
- `data/watchdog.log` has a new line: `[<ISO timestamp>] OK: heartbeat fresh (age=<N>s, scanCount=<n>)`.
- **No** Telegram message sent. Check the chat — last message timestamp is unchanged.

**Cleanup:** None.

**Pass criteria:** Both bullets above. Fail if any Telegram traffic occurs.

---

## Scenario 2 — Bot died ~11 min ago; watchdog fires exactly one alert

**Goal:** Verify the 10-minute staleness threshold fires and is debounced (no spam on repeated runs while still stale).

**Setup:**

1. Stop the bot (`pm2 stop polymarket-bot` or kill PID).
2. Backup current heartbeat:
   ```powershell
   Copy-Item "D:\AIOS\apps\polymarket-trader\data\heartbeat.json" `
             "D:\AIOS\apps\polymarket-trader\data\heartbeat.json.bak"
   ```
3. Forge a stale heartbeat (`ts` = 11 min ago):
   ```powershell
   $stale = @{
     ts          = ([DateTimeOffset]::Now.ToUnixTimeMilliseconds() - 660_000)
     scanCount   = 42
     eligibleReal = 5
     signals     = 1
     lastTradeTs = ([DateTimeOffset]::Now.ToUnixTimeMilliseconds() - 3_600_000)
   } | ConvertTo-Json
   Set-Content "D:\AIOS\apps\polymarket-trader\data\heartbeat.json" $stale
   ```

**Action:**

```powershell
pwsh -ExecutionPolicy Bypass -File "D:\AIOS\apps\polymarket-trader\scripts\watchdog.ps1"
# ...wait 10 seconds, then run again (debounce check):
pwsh -ExecutionPolicy Bypass -File "D:\AIOS\apps\polymarket-trader\scripts\watchdog.ps1"
```

**Expected:**

- **First run:** Exit `0`. `data/watchdog.log` has a line `[<ISO>] ALERT: bot offline X min` and Telegram receives **one** message:
  > Polymarket bot offline há 11 min. Last scan: 42, last trade: <relative>
- **Second run:** A debounce flag (`data/watchdog.alert-state.json` or in the log) prevents a second Telegram alert within a short window (e.g. 30 min). Either:
  - A new log line `[<ISO>] ALERT (suppressed: already-alerted)`, OR
  - No second Telegram message in the chat.
- Acceptable variant: watchdog re-alerts every run if @dev decided debouncing is out of scope. Document the chosen behavior; both are fine for Fase 0.

**Cleanup:**

```powershell
Move-Item -Force "D:\AIOS\apps\polymarket-trader\data\heartbeat.json.bak" `
                 "D:\AIOS\apps\polymarket-trader\data\heartbeat.json"
Remove-Item -ErrorAction SilentlyContinue "D:\AIOS\apps\polymarket-trader\data\watchdog.alert-state.json"
```

**Pass criteria:** Telegram receives the alert; log shows the ALERT entry; second run does not spam.

---

## Scenario 3 — Telegram token invalid; watchdog logs error and exits cleanly

**Goal:** Watchdog must not crash if Telegram is unreachable. The log file is the second-line monitor (per story Risk #3).

**Setup:**

1. Backup `.env`:
   ```powershell
   Copy-Item "D:\AIOS\apps\polymarket-trader\.env" `
             "D:\AIOS\apps\polymarket-trader\.env.bak"
   ```
2. Replace `TELEGRAM_BOT_TOKEN` with a deliberately bogus value:
   ```
   TELEGRAM_BOT_TOKEN=000:invalid_token_for_smoke_test
   ```
3. Forge a stale heartbeat (same as Scenario 2 step 3) so the watchdog has something to alert about.

**Action:**

```powershell
pwsh -ExecutionPolicy Bypass -File "D:\AIOS\apps\polymarket-trader\scripts\watchdog.ps1"
```

**Expected:**

- Exit code `0` (graceful) or `1` (signaled failure) — but **NOT** an unhandled exception trace dumped to stderr.
- `data/watchdog.log` contains:
  - The `ALERT:` line (so we know the threshold was tripped), AND
  - A `[<ISO>] ERROR: telegram send failed: <HTTP 401 / 404 / network>` line.
- No `.ps1` stack trace pollutes the console.

**Cleanup:**

```powershell
Move-Item -Force "D:\AIOS\apps\polymarket-trader\.env.bak" `
                 "D:\AIOS\apps\polymarket-trader\.env"
```

**Pass criteria:** Watchdog terminates without a crash dump; log captures both ALERT and ERROR lines.

---

## Scenario 4 — `heartbeat.json` missing; watchdog reports "bot never started"

**Goal:** The very first run after a fresh install (or after `data/` was wiped) must alert distinctly.

**Setup:**

1. Stop the bot.
2. Move heartbeat aside:
   ```powershell
   Move-Item "D:\AIOS\apps\polymarket-trader\data\heartbeat.json" `
             "D:\AIOS\apps\polymarket-trader\data\heartbeat.json.bak"
   ```

**Action:**

```powershell
pwsh -ExecutionPolicy Bypass -File "D:\AIOS\apps\polymarket-trader\scripts\watchdog.ps1"
```

**Expected:**

- Exit `0`.
- `data/watchdog.log` has a line distinguishing this from "stale" — e.g. `[<ISO>] ALERT: heartbeat.json missing (bot never started or data wiped)`.
- Telegram receives a message that names the missing-file case explicitly. Suggested copy:
  > Polymarket bot — heartbeat.json não encontrado. Bot nunca iniciou OU data/ foi apagado.
- Watchdog does NOT create an empty heartbeat.json (that would mask a real "bot never started" forever).

**Cleanup:**

```powershell
Move-Item -Force "D:\AIOS\apps\polymarket-trader\data\heartbeat.json.bak" `
                 "D:\AIOS\apps\polymarket-trader\data\heartbeat.json"
```

**Pass criteria:** Distinct alert message (different from Scenario 2); no synthetic heartbeat written.

---

## Scenario 5 — Task Scheduler interval verification

**Goal:** Confirm the install-watchdog-task.bat actually registers a 5-minute trigger. A wrong interval is silent — the only way to catch it is to inspect the schedule.

**Setup:** Task installed via:

```cmd
"D:\AIOS\apps\polymarket-trader\scripts\install-watchdog-task.bat"
```

**Action:** Inspect the registered task:

```powershell
$task = Get-ScheduledTask -TaskName "PolymarketWatchdog"
$task.Triggers | Format-List *
$task.Actions  | Format-List *
$task.Principal | Format-List *
```

**Expected:**

- Exactly one task named `PolymarketWatchdog` (or whatever name the install script uses; document it once and stick with it).
- `Triggers[0].Repetition.Interval` is `PT5M` (ISO 8601 — 5 minutes). Other forms: `PT300S`, but `PT5M` is the canonical Windows format.
- `Triggers[0].Repetition.Duration` is `P1D` (1 day) or `Indefinitely` flag set.
- `Actions[0].Execute` is `powershell.exe` (or `pwsh.exe`).
- `Actions[0].Arguments` includes `-File "D:\AIOS\apps\polymarket-trader\scripts\watchdog.ps1"` and `-ExecutionPolicy Bypass`.
- `Principal.RunLevel` is `Limited` (not `Highest`) — watchdog should not need admin.
- `Principal.LogonType` is `S4U` or `Interactive` — task runs without password prompt.

**Quick smoke of "is it actually firing":**

```powershell
# Wait at least 6 minutes since install, then:
Get-Content "D:\AIOS\apps\polymarket-trader\data\watchdog.log" -Tail 5
```

There should be at least one log entry from the scheduler-driven run, with timestamp inside the last 6 minutes.

**Cleanup:** None (leave the task installed if accepting; otherwise `Unregister-ScheduledTask -TaskName "PolymarketWatchdog" -Confirm:$false`).

**Pass criteria:** Triggers/Actions match the bullets above AND watchdog.log shows scheduler-driven runs.

---

## Sign-off Checklist

Run all five scenarios in order, then mark:

- [ ] Scenario 1: heartbeat fresh → no alert
- [ ] Scenario 2: stale 11min → exactly one alert (Telegram + log)
- [ ] Scenario 3: bad token → graceful failure (log error, no crash)
- [ ] Scenario 4: missing heartbeat → distinct "never started" alert
- [ ] Scenario 5: Task Scheduler PT5M trigger registered and firing

Sign-off goes into the QA Results section of `docs/stories/PM-PIVOT-1-real-only-7d.md`.
