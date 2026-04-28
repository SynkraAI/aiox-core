# Polymarket Trader Watchdog
# PM-PIVOT-1 Fase 0 (Conclave Ng — supervisor inegociavel)
#
# Reads data/heartbeat.json. If `ts` is older than $StaleThresholdMs (default 10min),
# sends a Telegram alert via TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID.
# Also writes data/watchdog.log with each execution timestamp (forensics).
#
# Usage:
#   pwsh -File scripts/watchdog.ps1
#
# Schedule via Windows Task Scheduler: every 5 min (see install-watchdog-task.bat).

[CmdletBinding()]
param(
    [string]$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    [int]$StaleThresholdMs = 600000  # 10 minutes
)

$ErrorActionPreference = 'Stop'

$heartbeatPath = Join-Path $AppRoot 'data\heartbeat.json'
$logPath = Join-Path $AppRoot 'data\watchdog.log'
$envPath = Join-Path $AppRoot '.env'

function Write-Log([string]$msg) {
    $ts = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffzzz')
    $line = "[$ts] $msg"
    Add-Content -Path $logPath -Value $line -Encoding UTF8 -ErrorAction SilentlyContinue
    Write-Host $line
}

# Load .env (zero deps — naive parser, same as bot)
function Load-Env {
    if (-not (Test-Path $envPath)) { return @{} }
    $env = @{}
    foreach ($line in Get-Content $envPath -Encoding UTF8) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith('#')) { continue }
        $eq = $trimmed.IndexOf('=')
        if ($eq -lt 1) { continue }
        $key = $trimmed.Substring(0, $eq).Trim()
        $val = $trimmed.Substring($eq + 1).Trim()
        $env[$key] = $val
    }
    return $env
}

function Send-TelegramAlert([string]$message) {
    $envVars = Load-Env
    $token = $envVars['TELEGRAM_BOT_TOKEN']
    $chatId = $envVars['TELEGRAM_CHAT_ID']
    if (-not $token -or -not $chatId) {
        Write-Log "ERR: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing from .env"
        return
    }
    $url = "https://api.telegram.org/bot$token/sendMessage"
    $body = @{
        chat_id = $chatId
        text = $message
        parse_mode = 'Markdown'
    } | ConvertTo-Json -Compress
    try {
        Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 10 | Out-Null
        Write-Log "Telegram alert sent."
    } catch {
        Write-Log ("ERR: Telegram send failed: " + $_.Exception.Message)
    }
}

# Main
Write-Log "Watchdog tick start (root=$AppRoot)"

if (-not (Test-Path $heartbeatPath)) {
    Write-Log "WARN: heartbeat.json missing at $heartbeatPath — bot may have never started or has not completed first scan."
    Send-TelegramAlert "WARN: Polymarket bot heartbeat MISSING at ``data/heartbeat.json``. Bot may not be running."
    return
}

try {
    $hb = Get-Content $heartbeatPath -Raw -Encoding UTF8 | ConvertFrom-Json
} catch {
    Write-Log ("ERR: heartbeat.json malformed: " + $_.Exception.Message)
    Send-TelegramAlert "ERR: Polymarket bot heartbeat.json is malformed."
    return
}

$nowMs = [int64]([DateTimeOffset]::Now.ToUnixTimeMilliseconds())
$ageMs = $nowMs - [int64]$hb.ts
$ageMin = [math]::Round($ageMs / 60000, 1)

Write-Log ("heartbeat: scan=" + $hb.scanCount + " eligibleReal=" + $hb.eligibleReal + " signals=" + $hb.signals + " age=" + $ageMin + "min")

if ($ageMs -gt $StaleThresholdMs) {
    $lastTradeStr = if ($hb.lastTradeTs) { (Get-Date -UnixTimeSeconds ([math]::Floor([int64]$hb.lastTradeTs / 1000))).ToString('s') } else { 'never' }
    $msg = "WARNING: Polymarket bot offline (no scan in $ageMin min). Last scan #" + $hb.scanCount + ", last trade: $lastTradeStr."
    Send-TelegramAlert $msg
    Write-Log "ALERT FIRED — bot stale."
} else {
    Write-Log "OK — bot alive."
}
