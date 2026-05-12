@echo off
:: DeepSeek Usage Tracker Proxy Manager
:: Start/stop the tracking proxy server

setlocal enabledelayedexpansion

set "PROXY_PORT=8787"

:: Try multiple locations for the tracker script
if defined AIOX_HOME (
    set "TRACKER_SCRIPT=%AIOX_HOME%\.aiox-core\infrastructure\scripts\llm-routing\usage-tracker\index.js"
    if exist "!TRACKER_SCRIPT!" goto :found
)

set "TRACKER_SCRIPT=%USERPROFILE%\aiox-core\.aiox-core\infrastructure\scripts\llm-routing\usage-tracker\index.js"
if exist "%TRACKER_SCRIPT%" goto :found

set "TRACKER_SCRIPT=%USERPROFILE%\Workspaces\AIOX\SynkraAI\aiox-core\.aiox-core\infrastructure\scripts\llm-routing\usage-tracker\index.js"
if exist "%TRACKER_SCRIPT%" goto :found

set "TRACKER_SCRIPT=%~dp0..\usage-tracker\index.js"
if exist "%TRACKER_SCRIPT%" goto :found

echo [91mERROR: Usage tracker not found![0m
exit /b 1

:found
:: Check if Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [91mERROR: Node.js not found in PATH[0m
    exit /b 1
)

if "%1"=="start" (
    echo Starting DeepSeek Usage Tracker Proxy...
    node "%TRACKER_SCRIPT%" start --port=%PROXY_PORT% --alias=claude-free
    goto :eof
)

if "%1"=="stop" (
    echo Stopping proxy on port %PROXY_PORT%...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PROXY_PORT%.*LISTENING"') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    echo Proxy stopped.
    goto :eof
)

if "%1"=="status" (
    curl -s http://127.0.0.1:%PROXY_PORT%/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo [92mProxy is running on port %PROXY_PORT%[0m
        curl -s http://127.0.0.1:%PROXY_PORT%/health
    ) else (
        echo [93mProxy is not running[0m
    )
    goto :eof
)

echo DeepSeek Usage Tracker Proxy
echo.
echo Usage:
echo   deepseek-proxy start   Start the proxy server
echo   deepseek-proxy stop    Stop the proxy server
echo   deepseek-proxy status  Check if proxy is running
echo.
echo The proxy runs on port %PROXY_PORT% by default.
echo.

endlocal
