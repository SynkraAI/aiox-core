@echo off
REM PM-PIVOT-1 Fase 0 (Conclave Ng): NSSM Windows Service installer.
REM
REM Requires NSSM in PATH (https://nssm.cc). If absent, falls back with a hint.
REM Run as Administrator.

setlocal
set "SERVICENAME=PolymarketBot"
set "APPROOT=%~dp0.."
pushd "%APPROOT%"
set "APPROOT=%CD%"
popd

set "NODEEXE=C:\Program Files\nodejs\node.exe"

where nssm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo NSSM not in PATH.
    echo.
    echo Install steps:
    echo   1. Download from https://nssm.cc/download
    echo   2. Unzip nssm.exe to C:\Program Files\nssm\
    echo   3. Add C:\Program Files\nssm\ to system PATH
    echo   4. Open new admin shell, re-run this script.
    exit /b 1
)

if not exist "%NODEEXE%" (
    echo ERROR: node.exe not found at "%NODEEXE%". Edit this script with your node path.
    exit /b 1
)

echo Installing NSSM service: %SERVICENAME%
echo App root: %APPROOT%
echo Node:     %NODEEXE%

REM Idempotent — remove existing
nssm stop "%SERVICENAME%" >nul 2>&1
nssm remove "%SERVICENAME%" confirm >nul 2>&1

nssm install "%SERVICENAME%" "%NODEEXE%" "--import" "tsx/esm" "src/cli/index.ts" "bot" "--start"
nssm set "%SERVICENAME%" AppDirectory "%APPROOT%"
nssm set "%SERVICENAME%" AppStdout "%APPROOT%\data\nssm-stdout.log"
nssm set "%SERVICENAME%" AppStderr "%APPROOT%\data\nssm-stderr.log"
nssm set "%SERVICENAME%" AppRotateFiles 1
nssm set "%SERVICENAME%" AppRotateBytes 10485760
nssm set "%SERVICENAME%" AppRestartDelay 10000
nssm set "%SERVICENAME%" AppThrottle 60000
nssm set "%SERVICENAME%" AppEnvironmentExtra ^
    NODE_ENV=production ^
    PAPER_UNLIMITED=true
nssm set "%SERVICENAME%" Start SERVICE_AUTO_START

echo.
echo SUCCESS. Start service:
echo   nssm start %SERVICENAME%
echo   nssm status %SERVICENAME%
echo Logs:
echo   %APPROOT%\data\nssm-stdout.log
echo   %APPROOT%\data\nssm-stderr.log

endlocal
