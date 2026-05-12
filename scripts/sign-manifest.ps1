#
# sign-manifest.ps1 - Helper script to sign the install manifest (Windows)
#
# Usage:
#   .\scripts\sign-manifest.ps1 -SecretKey C:\path\to\aiox-core.key
#
# Prerequisites:
#   - minisign installed (scoop install minisign)
#   - Secret key file
#

param(
    [Parameter(Mandatory=$true)]
    [string]$SecretKey
)

$ErrorActionPreference = "Stop"

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ManifestPath = Join-Path $ProjectRoot ".aiox-core\install-manifest.yaml"
$SignaturePath = "$ManifestPath.minisig"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  AIOX-Core Manifest Signing Tool (Windows)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Check minisign is installed
$minisign = Get-Command minisign -ErrorAction SilentlyContinue
if (-not $minisign) {
    Write-Host "Error: minisign is not installed" -ForegroundColor Red
    Write-Host "Install with: scoop install minisign"
    Write-Host "Or download from: https://jedisct1.github.io/minisign/"
    exit 1
}

# Verify secret key exists
if (-not (Test-Path $SecretKey)) {
    Write-Host "Error: Secret key not found: $SecretKey" -ForegroundColor Red
    exit 1
}

# Verify manifest exists
if (-not (Test-Path $ManifestPath)) {
    Write-Host "Error: Manifest not found: $ManifestPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Generate manifest first with:"
    Write-Host "  node bin\aiox.js manifest:generate"
    exit 1
}

# Show manifest info
Write-Host "Manifest found: $ManifestPath" -ForegroundColor Green
$ManifestInfo = Get-Item $ManifestPath
Write-Host "  Size: $($ManifestInfo.Length) bytes"
$LineCount = (Get-Content $ManifestPath | Measure-Object -Line).Lines
Write-Host "  Lines: $LineCount"
Write-Host ""

# Check if signature already exists
if (Test-Path $SignaturePath) {
    Write-Host "Warning: Existing signature will be overwritten" -ForegroundColor Yellow
    Write-Host ""
}

# Sign the manifest
Write-Host "Signing manifest..." -ForegroundColor Green
Write-Host ""

Push-Location (Join-Path $ProjectRoot ".aiox-core")
try {
    & minisign -Sm install-manifest.yaml -s $SecretKey
    if ($LASTEXITCODE -ne 0) {
        throw "minisign failed with exit code $LASTEXITCODE"
    }
}
finally {
    Pop-Location
}

# Verify the signature
Write-Host ""
Write-Host "Verifying signature..." -ForegroundColor Green

$PublicKey = $SecretKey -replace '\.key$', '.pub'
if (Test-Path $PublicKey) {
    Push-Location (Join-Path $ProjectRoot ".aiox-core")
    try {
        & minisign -Vm install-manifest.yaml -p $PublicKey
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Signature verified successfully" -ForegroundColor Green
        }
        else {
            Write-Host "✗ Signature verification failed!" -ForegroundColor Red
            exit 1
        }
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "Note: Could not find public key at $PublicKey" -ForegroundColor Yellow
    Write-Host "Skipping verification (signature was still created)"
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Signing Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Created: $SignaturePath"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. git add .aiox-core\install-manifest.yaml.minisig"
Write-Host "  2. git commit -m 'chore: sign manifest for release'"
Write-Host "  3. npm publish"
Write-Host ""
