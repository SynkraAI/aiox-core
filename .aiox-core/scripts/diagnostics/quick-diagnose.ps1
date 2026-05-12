# AIOX-Core Quick Diagnostic - Run this in PowerShell
# Usage: Copy and paste this entire script into PowerShell on the target machine

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AIOX-Core Quick Diagnostic" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = & node --version 2>$null
if ($nodeVersion) {
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
    $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($nodeMajor -lt 18) {
        Write-Host "  ERROR: Node.js 18+ required!" -ForegroundColor Red
    }
} else {
    Write-Host "  ERROR: Node.js NOT INSTALLED!" -ForegroundColor Red
    Write-Host "  Download: https://nodejs.org/" -ForegroundColor Yellow
}

# Check npm
Write-Host ""
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmVersion = & npm --version 2>$null
if ($npmVersion) {
    Write-Host "  npm: v$npmVersion" -ForegroundColor Green
    $npmMajor = [int]($npmVersion -replace '(\d+)\..*', '$1')
    if ($npmMajor -lt 9) {
        Write-Host "  ERROR: npm 9+ required!" -ForegroundColor Red
        Write-Host "  Run: npm install -g npm@latest" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ERROR: npm NOT INSTALLED!" -ForegroundColor Red
}

# Check npx
Write-Host ""
Write-Host "Checking npx..." -ForegroundColor Yellow
$npxVersion = & npx --version 2>$null
if ($npxVersion) {
    Write-Host "  npx: v$npxVersion" -ForegroundColor Green
} else {
    Write-Host "  ERROR: npx NOT FOUND!" -ForegroundColor Red
}

# Check Git
Write-Host ""
Write-Host "Checking Git..." -ForegroundColor Yellow
$gitVersion = & git --version 2>$null
if ($gitVersion) {
    Write-Host "  $gitVersion" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Git not installed (optional but recommended)" -ForegroundColor Yellow
    Write-Host "  Download: https://git-scm.com/" -ForegroundColor Yellow
}

# Check PowerShell Execution Policy
Write-Host ""
Write-Host "Checking PowerShell Policy..." -ForegroundColor Yellow
$policy = Get-ExecutionPolicy
Write-Host "  Execution Policy: $policy" -ForegroundColor $(if ($policy -in @('Unrestricted', 'RemoteSigned', 'Bypass')) { 'Green' } else { 'Red' })
if ($policy -notin @('Unrestricted', 'RemoteSigned', 'Bypass')) {
    Write-Host "  WARNING: May need to run:" -ForegroundColor Yellow
    Write-Host "  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
}

# Check npm prefix in PATH
Write-Host ""
Write-Host "Checking npm PATH..." -ForegroundColor Yellow
$npmPrefix = & npm config get prefix 2>$null
if ($npmPrefix) {
    $inPath = $env:PATH -like "*$npmPrefix*"
    if ($inPath) {
        Write-Host "  npm prefix in PATH: Yes" -ForegroundColor Green
    } else {
        Write-Host "  npm prefix NOT in PATH!" -ForegroundColor Red
        Write-Host "  Add to PATH: $npmPrefix" -ForegroundColor Yellow
    }
}

# Check npm registry
Write-Host ""
Write-Host "Checking npm registry access..." -ForegroundColor Yellow
$registryTest = & npm view aiox-core version 2>$null
if ($registryTest) {
    Write-Host "  aiox-core v$registryTest available" -ForegroundColor Green
} else {
    Write-Host "  Cannot access npm registry!" -ForegroundColor Red
    Write-Host "  Check firewall/proxy settings" -ForegroundColor Yellow
}

# Test npx aiox-core
Write-Host ""
Write-Host "Testing: npx aiox-core@latest --version" -ForegroundColor Yellow
Write-Host "(This may take a moment...)" -ForegroundColor Gray
try {
    $result = & npx aiox-core@latest --version 2>&1
    if ($result -match '\d+\.\d+\.\d+') {
        Write-Host "  SUCCESS: $result" -ForegroundColor Green
    } else {
        Write-Host "  FAILED: $result" -ForegroundColor Red
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Diagnostic Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all checks passed, run:" -ForegroundColor Green
Write-Host "  npx aiox-core@latest" -ForegroundColor White
Write-Host ""
