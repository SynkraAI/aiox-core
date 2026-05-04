# Polymarket Trader - Daily Checkup
# PM-AUTONOMOUS-30D
#
# What it does:
#   1. Loads heartbeat.json, bot.pid, open-positions.json
#   2. Counts trades opened/resolved in last 24h via trades.db (JSON file, NOT SQLite)
#   3. Computes 24h delta against previous snapshot in data/checkpoints/
#   4. Saves new snapshot data/checkpoints/checkup-YYYYMMDD.json
#   5. Appends Markdown row to data/journal.md
#   6. If bot dead: invokes start-bot.bat, marks status CRASHED+RESTARTED
#   7. If 0 trades for 3+ consecutive days: ALERT (journal + Telegram)
#   8. Sends daily Telegram summary always
#
# Usage:
#   pwsh -File scripts\daily-checkup.ps1 -AppRoot "D:\AIOS\apps\polymarket-trader"
#
# Mind clones applied:
#   gene-kim: observability + automated recovery before declaring deploy done
#   chip-huyen: explicit decision criteria (NO_TRADE_ALERT_DAYS = 3)

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$AppRoot,
    [int]$StaleHeartbeatThresholdSec = 900  # 15 minutes
)

$ErrorActionPreference = 'Continue'

# --- Constants (chip-huyen: encode decision criteria as named constants) -----
$NO_TRADE_ALERT_DAYS = 3            # Alert if 0 trades for this many days
$STALE_HEARTBEAT_SEC = $StaleHeartbeatThresholdSec
# -----------------------------------------------------------------------------

# Load Telegram helper
. (Join-Path $PSScriptRoot 'telegram-notify.ps1') -AppRoot $AppRoot

$dataDir = Join-Path $AppRoot 'data'
$checkpointsDir = Join-Path $dataDir 'checkpoints'
$journalPath = Join-Path $dataDir 'journal.md'
$heartbeatPath = Join-Path $dataDir 'heartbeat.json'
$pidPath = Join-Path $dataDir 'bot.pid'
$openPosPath = Join-Path $dataDir 'open-positions.json'
$tradesPath = Join-Path $dataDir 'trades.db'
$botLogPath = Join-Path $dataDir 'bot.log'
$startBatPath = Join-Path $AppRoot 'scripts\start-bot.bat'
$checkupLogPath = Join-Path $dataDir 'daily-checkup.log'

# Ensure dirs exist
if (-not (Test-Path $checkpointsDir)) { New-Item -ItemType Directory -Path $checkpointsDir -Force | Out-Null }

function Write-CheckupLog([string]$msg) {
    $ts = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffzzz')
    $line = "[$ts] $msg"
    Add-Content -Path $checkupLogPath -Value $line -Encoding UTF8 -ErrorAction SilentlyContinue
    Write-Host $line
}

Write-CheckupLog "Daily checkup START (root=$AppRoot)"

# --- 1. Read heartbeat ---
$heartbeat = $null
$heartbeatAgeSec = $null
if (Test-Path $heartbeatPath) {
    try {
        $heartbeat = Get-Content $heartbeatPath -Raw -Encoding UTF8 | ConvertFrom-Json
        $nowMs = [int64]([DateTimeOffset]::Now.ToUnixTimeMilliseconds())
        $heartbeatAgeSec = [math]::Round(($nowMs - [int64]$heartbeat.ts) / 1000, 0)
    } catch {
        Write-CheckupLog "WARN: heartbeat.json malformed: $($_.Exception.Message)"
    }
} else {
    Write-CheckupLog "WARN: heartbeat.json missing"
}

# --- 2. Read PID and verify alive ---
$botAlive = $false
$botPid = $null
if (Test-Path $pidPath) {
    $botPid = (Get-Content $pidPath -Raw -Encoding UTF8).Trim()
    $proc = Get-Process -Id $botPid -ErrorAction SilentlyContinue
    if ($proc) {
        $botAlive = $true
    }
}

# Status decision tree
$status = 'OK'
if (-not $botAlive) {
    $status = 'CRASHED+RESTARTED'
    Write-CheckupLog "ERR: Bot DEAD (pid=$botPid). Invoking start-bot.bat ..."
    try {
        Start-Process -FilePath $startBatPath -WindowStyle Hidden -Wait
        Start-Sleep -Seconds 8
        # Re-read pid after restart
        if (Test-Path $pidPath) {
            $botPid = (Get-Content $pidPath -Raw -Encoding UTF8).Trim()
            $proc = Get-Process -Id $botPid -ErrorAction SilentlyContinue
            if ($proc) {
                $botAlive = $true
                Write-CheckupLog "OK: bot restarted (new pid=$botPid)"
            }
        }
    } catch {
        Write-CheckupLog "ERR: start-bot.bat failed: $($_.Exception.Message)"
        $status = 'CRASHED+RESTART_FAILED'
    }
} elseif ($null -ne $heartbeatAgeSec -and $heartbeatAgeSec -gt $STALE_HEARTBEAT_SEC) {
    $status = 'STALE'
} elseif ($null -eq $heartbeat) {
    $status = 'NO_HEARTBEAT'
}

# --- 3. Read open positions ---
$openPositions = 0
if (Test-Path $openPosPath) {
    try {
        $op = Get-Content $openPosPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($op -is [array]) { $openPositions = $op.Count }
        elseif ($op) { $openPositions = 1 }
    } catch {
        Write-CheckupLog "WARN: open-positions.json malformed: $($_.Exception.Message)"
    }
}

# --- 4. Trades 24h window ---
# trades.db is currently a JSON file (legacy), NOT SQLite. Read defensively.
$tradesOpened24h = 0
$tradesResolved24h = 0
$resolvedWins = 0
$resolvedLosses = 0
$pnlPaper24h = 0.0
$lastTradeTs = $null
$totalTrades = 0
$verticals = @{}

if (Test-Path $tradesPath) {
    try {
        $tradesRaw = Get-Content $tradesPath -Raw -Encoding UTF8 | ConvertFrom-Json
        # Normalize: object-keyed-by-index OR array
        $tradesArr = if ($tradesRaw -is [array]) { $tradesRaw } else { @($tradesRaw.PSObject.Properties.Value) }
        $totalTrades = $tradesArr.Count

        $cutoffMs = [int64]([DateTimeOffset]::Now.AddHours(-24).ToUnixTimeMilliseconds())
        foreach ($t in $tradesArr) {
            if (-not $t) { continue }
            # parse timestamp (ISO string)
            $tsMs = $null
            if ($t.timestamp) {
                try { $tsMs = [int64]([DateTimeOffset]::Parse($t.timestamp).ToUnixTimeMilliseconds()) } catch {}
            }
            if ($null -eq $tsMs) { continue }
            if ($tsMs -ge $cutoffMs) {
                $tradesOpened24h++
                if ($t.outcome -and $t.outcome -ne 'PENDING') {
                    $tradesResolved24h++
                    if ($t.outcome -eq 'WIN') { $resolvedWins++ }
                    elseif ($t.outcome -eq 'LOSS') { $resolvedLosses++ }
                    if ($null -ne $t.pnl) {
                        try { $pnlPaper24h += [double]$t.pnl } catch {}
                    }
                }
                if ($t.vertical) { $verticals[$t.vertical] = $true }
            }
            if ($null -eq $lastTradeTs -or $tsMs -gt $lastTradeTs) { $lastTradeTs = $tsMs }
        }
    } catch {
        Write-CheckupLog "WARN: trades.db (JSON) read failed: $($_.Exception.Message)"
    }
}

# --- 5. eligiblePerScan from log tail ---
$eligibleAvg = $null
if (Test-Path $botLogPath) {
    try {
        $tail = Get-Content $botLogPath -Tail 200 -Encoding UTF8
        $eligibles = @()
        foreach ($line in $tail) {
            $m = [regex]::Match($line, '(\d+)\s+eligible\s+\(')
            if ($m.Success) { $eligibles += [int]$m.Groups[1].Value }
        }
        if ($eligibles.Count -gt 0) {
            $sum = 0
            foreach ($e in $eligibles) { $sum += $e }
            $eligibleAvg = [math]::Round($sum / $eligibles.Count, 2)
        }
    } catch {
        Write-CheckupLog "WARN: bot.log tail parse failed: $($_.Exception.Message)"
    }
}

# --- 6. Build snapshot ---
$todayStamp = (Get-Date).ToString('yyyyMMdd')
$snapshotPath = Join-Path $checkpointsDir "checkup-$todayStamp.json"

$verticalsList = ($verticals.Keys | Sort-Object) -join ','
if (-not $verticalsList) { $verticalsList = '-' }

$snapshot = [ordered]@{
    ts = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ssK')
    date = (Get-Date).ToString('yyyy-MM-dd')
    botPid = $botPid
    botAlive = $botAlive
    status = $status
    heartbeatAgeSec = $heartbeatAgeSec
    scanCount = if ($heartbeat) { [int]$heartbeat.scanCount } else { $null }
    signals = if ($heartbeat) { [int]$heartbeat.signals } else { $null }
    eligibleReal = if ($heartbeat) { [int]$heartbeat.eligibleReal } else { $null }
    openPositions = $openPositions
    lastTradeTs = if ($lastTradeTs) { (Get-Date '1970-01-01').AddMilliseconds($lastTradeTs).ToString('yyyy-MM-ddTHH:mm:ssZ') } else { $null }
    totalTrades = $totalTrades
    tradesOpened24h = $tradesOpened24h
    tradesResolved24h = $tradesResolved24h
    resolvedWins = $resolvedWins
    resolvedLosses = $resolvedLosses
    pnlPaper24h = [math]::Round($pnlPaper24h, 2)
    eligiblePerScanAvg = $eligibleAvg
    verticals = $verticalsList
}

$snapshot | ConvertTo-Json -Depth 4 | Set-Content -Path $snapshotPath -Encoding UTF8
Write-CheckupLog "Snapshot written: $snapshotPath"

# --- 7. Detect 0-trade streak ---
$zeroTradeStreak = 0
$prevSnapshots = Get-ChildItem -Path $checkpointsDir -Filter 'checkup-*.json' -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending | Select-Object -First $NO_TRADE_ALERT_DAYS
foreach ($s in $prevSnapshots) {
    try {
        $prev = Get-Content $s.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
        if ([int]$prev.tradesOpened24h -eq 0) { $zeroTradeStreak++ } else { break }
    } catch { break }
}

$alertReason = $null
if ($zeroTradeStreak -ge $NO_TRADE_ALERT_DAYS) {
    $alertReason = "0 trades for $zeroTradeStreak consecutive days"
}
if ($status -eq 'NO_HEARTBEAT' -or $status -eq 'STALE' -or $status -eq 'CRASHED+RESTART_FAILED') {
    $alertReason = if ($alertReason) { "$alertReason; $status" } else { $status }
}

# --- 8. Append journal ---
if (-not (Test-Path $journalPath)) {
    $header = @"
# Polymarket Trader - Daily Journal

Auto-generated by `scripts/daily-checkup.ps1`. One row per day at 14:30 BRT (17:30 UTC).

| Date       | Scans | Signals | Open | Trades 24h | Resolved (WxL) | PnL paper | Verticais | Status            | Notes |
|------------|-------|---------|------|------------|----------------|-----------|-----------|-------------------|-------|
"@
    Set-Content -Path $journalPath -Value $header -Encoding UTF8
}

$dateCell = (Get-Date).ToString('yyyy-MM-dd')
$scansCell = if ($null -ne $snapshot.scanCount) { $snapshot.scanCount } else { '-' }
$signalsCell = if ($null -ne $snapshot.signals) { $snapshot.signals } else { '-' }
$resolvedCell = "${resolvedWins}W ${resolvedLosses}L"
$pnlCell = '$' + ('{0:N2}' -f $snapshot.pnlPaper24h)
$notesCell = if ($alertReason) { "ALERT: $alertReason" } else { '' }

$row = "| $dateCell | $scansCell | $signalsCell | $openPositions | $tradesOpened24h | $resolvedCell | $pnlCell | $($snapshot.verticals) | $status | $notesCell |"
Add-Content -Path $journalPath -Value $row -Encoding UTF8
Write-CheckupLog "Journal row appended."

# --- 9. Telegram daily summary (always) ---
$tgIcon = switch ($status) {
    'OK' { 'OK' }
    'CRASHED+RESTARTED' { 'RESTARTED' }
    'CRASHED+RESTART_FAILED' { 'CRITICAL' }
    'STALE' { 'STALE' }
    'NO_HEARTBEAT' { 'NO_HB' }
    default { $status }
}
# 15-day deadline countdown (Squad verdict 04/Mai/2026): kill project if no edge by 19/Mai
$deadline = [DateTime]'2026-05-19'
$daysLeft = [int]($deadline - (Get-Date).Date).TotalDays
$countdownLine = if ($daysLeft -gt 0) { "D-$daysLeft (deadline 19/Mai)" } elseif ($daysLeft -eq 0) { "D-DAY (deadline TODAY)" } else { "POST-DEADLINE ($([math]::Abs($daysLeft))d over)" }

$summary = "Polymarket [$tgIcon] $dateCell  $countdownLine`nscans=$scansCell signals=$signalsCell trades=$tradesOpened24h resolved=$resolvedCell pnl=$pnlCell open=$openPositions`nverticais=$($snapshot.verticals)"
if ($alertReason) {
    $summary += "`nALERT: $alertReason"
}

$tgResult = Send-TelegramMessage -Text $summary -AppRoot $AppRoot -ParseMode 'HTML'
if (-not $tgResult.ok) {
    Write-CheckupLog "WARN: Telegram daily summary failed: $($tgResult.error)"
} else {
    Write-CheckupLog "Telegram daily summary sent (message_id=$($tgResult.messageId))"
}

# --- 10. Telegram urgent alert (separate message, only when alert) ---
if ($alertReason) {
    $alertMsg = "POLYMARKET ALERT $dateCell`n$alertReason`n`nReview: data/journal.md`nRunbook: docs/runbooks/polymarket-autonomous-mode.md"
    $tgAlert = Send-TelegramMessage -Text $alertMsg -AppRoot $AppRoot -ParseMode 'HTML'
    if (-not $tgAlert.ok) {
        Write-CheckupLog "WARN: Telegram alert failed: $($tgAlert.error)"
    } else {
        Write-CheckupLog "Telegram alert sent (message_id=$($tgAlert.messageId))"
    }
}

Write-CheckupLog "Daily checkup END (status=$status alert=$alertReason)"
exit 0
