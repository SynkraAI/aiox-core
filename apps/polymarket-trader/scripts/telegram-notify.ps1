# Polymarket Trader - Telegram Notifier (reusable)
# PM-AUTONOMOUS-30D
#
# Provides Send-TelegramMessage cmdlet/function. Reads TELEGRAM_BOT_TOKEN and
# TELEGRAM_CHAT_ID from .env (naive KEY=VALUE parser, same logic as watchdog.ps1).
#
# Usage (dot-source from another script):
#   . "$PSScriptRoot\telegram-notify.ps1"
#   Send-TelegramMessage -Text "Hello" -AppRoot "D:\AIOS\apps\polymarket-trader"
#
# Or invoke directly for smoke test:
#   pwsh -File scripts\telegram-notify.ps1 -Text "smoke test" -AppRoot "D:\AIOS\apps\polymarket-trader"
#
# Returns @{ok=$true/$false; error=string-or-null}.

[CmdletBinding()]
param(
    [string]$Text,
    [string]$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

function Read-DotEnv([string]$EnvPath) {
    $envMap = @{}
    if (-not (Test-Path $EnvPath)) { return $envMap }
    foreach ($line in Get-Content $EnvPath -Encoding UTF8) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith('#')) { continue }
        $eq = $trimmed.IndexOf('=')
        if ($eq -lt 1) { continue }
        $key = $trimmed.Substring(0, $eq).Trim()
        $val = $trimmed.Substring($eq + 1).Trim()
        # Strip surrounding quotes if present
        if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
            $val = $val.Substring(1, $val.Length - 2)
        }
        $envMap[$key] = $val
    }
    return $envMap
}

function Send-TelegramMessage {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)][string]$Text,
        [Parameter(Mandatory=$true)][string]$AppRoot,
        [string]$ParseMode = 'Markdown'
    )

    $envPath = Join-Path $AppRoot '.env'
    $envVars = Read-DotEnv -EnvPath $envPath
    $token = $envVars['TELEGRAM_BOT_TOKEN']
    $chatId = $envVars['TELEGRAM_CHAT_ID']

    if (-not $token -or -not $chatId) {
        return @{ ok = $false; error = "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing from $envPath" }
    }

    $url = "https://api.telegram.org/bot$token/sendMessage"
    $body = @{
        chat_id = $chatId
        text = $Text
        parse_mode = $ParseMode
    } | ConvertTo-Json -Compress

    try {
        $resp = Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 30
        if ($resp.ok -eq $true) {
            return @{ ok = $true; error = $null; messageId = $resp.result.message_id }
        }
        return @{ ok = $false; error = "Telegram API returned ok=false: $($resp | ConvertTo-Json -Compress -Depth 4)" }
    } catch {
        return @{ ok = $false; error = $_.Exception.Message }
    }
}

# If invoked directly with -Text, run smoke test
if ($Text) {
    $result = Send-TelegramMessage -Text $Text -AppRoot $AppRoot
    if ($result.ok) {
        Write-Host "OK: Telegram message sent (message_id=$($result.messageId))"
        exit 0
    } else {
        Write-Host "ERR: $($result.error)"
        exit 1
    }
}
