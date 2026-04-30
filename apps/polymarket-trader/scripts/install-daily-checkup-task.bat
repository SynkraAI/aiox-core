@echo off
REM PM-AUTONOMOUS-30D: register Windows Task Scheduler entry that runs
REM scripts/daily-checkup.ps1 every day at 17:30 UTC (14:30 BRT during BRT,
REM Brazil does not observe DST — fixed UTC schedule is safe).
REM
REM Idempotent. USER-LEVEL — no UAC required.
REM Passes explicit -AppRoot to the .ps1 to avoid the $PSScriptRoot empty bug
REM seen in legacy watchdog scenarios.
REM
REM Verify with: schtasks /Query /TN "PolymarketDailyCheckup"
REM Remove with: schtasks /Delete /TN "PolymarketDailyCheckup" /F

setlocal
set "TASKNAME=PolymarketDailyCheckup"
set "SCRIPTDIR=%~dp0"
set "APPROOT=%SCRIPTDIR%.."
set "CHECKUPPS1=%SCRIPTDIR%daily-checkup.ps1"

REM Resolve absolute path of APPROOT
pushd "%APPROOT%"
set "APPROOT=%CD%"
popd

echo Installing Windows Task: %TASKNAME%
echo Checkup script: %CHECKUPPS1%
echo App root:       %APPROOT%

if not exist "%CHECKUPPS1%" (
    echo ERROR: %CHECKUPPS1% not found.
    exit /b 1
)

REM Delete existing task (idempotent)
schtasks /Delete /TN "%TASKNAME%" /F >nul 2>&1

REM Create task: daily at 14:30 local Brazil time (BRT = UTC-3, no DST).
REM /SC DAILY uses local time of the machine. If machine TZ is America/Sao_Paulo,
REM 14:30 == BRT 14:30 == 17:30 UTC — meets the spec.
REM Pass APPROOT explicitly to avoid $PSScriptRoot resolution issues.
schtasks /Create ^
  /TN "%TASKNAME%" ^
  /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%CHECKUPPS1%\" -AppRoot \"%APPROOT%\"" ^
  /SC DAILY ^
  /ST 14:30 ^
  /RU "%USERNAME%" ^
  /IT ^
  /F

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: %TASKNAME% installed.
    echo.
    echo Verify:    schtasks /Query /TN "%TASKNAME%"
    echo Manual:    schtasks /Run /TN "%TASKNAME%"
    echo Remove:    schtasks /Delete /TN "%TASKNAME%" /F
    echo.
    schtasks /Query /TN "%TASKNAME%" /FO LIST 2>nul
) else (
    echo.
    echo FAILED to install task.
    exit /b 1
)

endlocal
