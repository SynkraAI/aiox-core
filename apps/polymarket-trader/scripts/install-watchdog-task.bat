@echo off
REM PM-PIVOT-1 Fase 0 (Conclave Ng): register Windows Task Scheduler entry
REM that runs scripts/watchdog.ps1 every 5 minutes.
REM
REM Run as Administrator (or accept UAC).

setlocal
set "TASKNAME=PolymarketBotWatchdog"
set "SCRIPTDIR=%~dp0"
set "WATCHDOGPS1=%SCRIPTDIR%watchdog.ps1"

echo Installing Windows Task: %TASKNAME%
echo Watchdog script: %WATCHDOGPS1%

REM Delete existing task (idempotent)
schtasks /Delete /TN "%TASKNAME%" /F >nul 2>&1

REM Create task: every 5 min, indefinite, hidden window, current user
schtasks /Create ^
  /TN "%TASKNAME%" ^
  /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%WATCHDOGPS1%\"" ^
  /SC MINUTE ^
  /MO 5 ^
  /RL HIGHEST ^
  /F

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: %TASKNAME% installed.
    echo.
    echo Verify with: schtasks /Query /TN "%TASKNAME%"
    echo Manual run:  schtasks /Run /TN "%TASKNAME%"
    echo Remove:      schtasks /Delete /TN "%TASKNAME%" /F
) else (
    echo.
    echo FAILED to install task. Run as Administrator.
    exit /b 1
)

endlocal
