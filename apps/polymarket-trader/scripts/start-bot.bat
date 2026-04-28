@echo off
REM Polymarket trader bootstrap — runs bot detached from any parent shell.
REM Logs to data\bot.log / data\bot-error.log. Kills previous instance first.

cd /d "%~dp0\.."
echo [%date% %time%] start-bot.bat fired >> data\bot.log

REM Kill any existing polymarket bot node processes (best-effort)
for /f "tokens=2 delims=," %%p in ('wmic process where "name='node.exe' and commandline like '%%polymarket-trader%%cli%%bot%%'" get processid /format:csv 2^>nul ^| findstr /r "[0-9]"') do (
  taskkill /PID %%p /F >nul 2>&1
)

REM Launch detached
start "" /B "C:\Program Files\nodejs\node.exe" "node_modules\tsx\dist\cli.mjs" "src\cli\index.ts" "bot" "--start" >> data\bot.log 2>> data\bot-error.log
echo [%date% %time%] bot launched >> data\bot.log
exit /b 0
