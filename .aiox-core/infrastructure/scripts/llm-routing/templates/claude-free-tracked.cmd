@echo off
:: Claude Code - DeepSeek Native Mode with Usage Tracking
:: Routes through local proxy to track per-alias usage
:: Cost: ~$0.14/M tokens with tool calling support

setlocal enabledelayedexpansion

:: Configuration
set "PROXY_PORT=8787"
set "ALIAS=claude-free"

:: Find tracker script
if defined AIOX_HOME (
    set "TRACKER_SCRIPT=%AIOX_HOME%\.aiox-core\infrastructure\scripts\llm-routing\usage-tracker\index.js"
    if exist "!TRACKER_SCRIPT!" goto :tracker_found
)
set "TRACKER_SCRIPT=%USERPROFILE%\aiox-core\.aiox-core\infrastructure\scripts\llm-routing\usage-tracker\index.js"
if exist "%TRACKER_SCRIPT%" goto :tracker_found
set "TRACKER_SCRIPT=%USERPROFILE%\Workspaces\AIOX\SynkraAI\aiox-core\.aiox-core\infrastructure\scripts\llm-routing\usage-tracker\index.js"
if exist "%TRACKER_SCRIPT%" goto :tracker_found
set "TRACKER_SCRIPT=%~dp0..\usage-tracker\index.js"
:tracker_found

:: Find project root (look for .env file)
set "PROJECT_ROOT=%CD%"
set /a "LOOP_COUNT=0"
:find_env
set /a "LOOP_COUNT+=1"
if %LOOP_COUNT% gtr 50 goto :no_env
if exist "%PROJECT_ROOT%\.env" goto :found_env
if "%PROJECT_ROOT%"=="%PROJECT_ROOT:~0,3%" goto :no_env
for %%i in ("%PROJECT_ROOT%\..") do set "PROJECT_ROOT=%%~fi"
goto :find_env

:no_env
if not "%DEEPSEEK_API_KEY%"=="" goto :use_env_key

echo.
echo [91mERROR: No .env file found and DEEPSEEK_API_KEY not set![0m
echo.
echo Options:
echo   1. Create .env in your project: cp .env.example .env
echo   2. Set DEEPSEEK_API_KEY in the .env file
echo   3. Or set it globally: setx DEEPSEEK_API_KEY "sk-your-key"
echo.
echo Get your API key at: https://platform.deepseek.com/api_keys
echo.
pause
exit /b 1

:found_env
:: Load DEEPSEEK_API_KEY from .env
for /f "usebackq eol=# tokens=1,* delims==" %%a in ("%PROJECT_ROOT%\.env") do (
    if "%%a"=="DEEPSEEK_API_KEY" set "DEEPSEEK_API_KEY=%%b"
)
set "DEEPSEEK_API_KEY=!DEEPSEEK_API_KEY:"=!"

if "!DEEPSEEK_API_KEY!"=="" (
    echo.
    echo [91mERROR: DEEPSEEK_API_KEY not found in .env![0m
    echo.
    pause
    exit /b 1
)

:use_env_key
:: Check if proxy is running
curl -s http://127.0.0.1:%PROXY_PORT%/health >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [93mUsage Tracker proxy not running. Starting in background...[0m

    :: Start proxy in background
    start /b "" node "%TRACKER_SCRIPT%" start --port=%PROXY_PORT% --alias=%ALIAS% >nul 2>&1

    :: Wait for proxy to start
    timeout /t 2 /nobreak >nul

    :: Verify it started
    curl -s http://127.0.0.1:%PROXY_PORT%/health >nul 2>&1
    if %errorlevel% neq 0 (
        echo [91mFailed to start proxy. Falling back to direct connection.[0m
        goto :direct_connection
    )
    echo [92mProxy started successfully![0m
)

:: Use local proxy (proxy will forward to DeepSeek with original API key)
set ANTHROPIC_BASE_URL=http://127.0.0.1:%PROXY_PORT%/anthropic
set ANTHROPIC_API_KEY=%DEEPSEEK_API_KEY%
set ANTHROPIC_MODEL=deepseek-chat
set API_TIMEOUT_MS=600000

echo.
echo [92mClaude Code - DeepSeek Native Mode (TRACKED)[0m
echo Proxy: 127.0.0.1:%PROXY_PORT%
echo Alias: %ALIAS%
echo [92mTool Calling: SUPPORTED[0m
echo Cost: ~$0.14/M tokens
echo.
echo [96mUsage tracking enabled. Run 'deepseek-usage' to view stats.[0m
echo.

goto :run_claude

:direct_connection
:: Direct connection without tracking
set ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
set ANTHROPIC_API_KEY=%DEEPSEEK_API_KEY%
set ANTHROPIC_MODEL=deepseek-chat
set API_TIMEOUT_MS=600000

echo.
echo [92mClaude Code - DeepSeek Native Mode (DIRECT)[0m
echo Endpoint: api.deepseek.com/anthropic
echo [93mUsage tracking: DISABLED (proxy not running)[0m
echo.

:run_claude
endlocal & set "ANTHROPIC_BASE_URL=%ANTHROPIC_BASE_URL%" & set "ANTHROPIC_API_KEY=%DEEPSEEK_API_KEY%" & set "ANTHROPIC_MODEL=deepseek-chat" & set "API_TIMEOUT_MS=600000"

>&2 echo.
>&2 echo [93mWARNING: Running with --dangerously-skip-permissions (no confirmation prompts)[0m
>&2 echo [93mOnly use in trusted repositories/environments.[0m
>&2 echo.

claude --dangerously-skip-permissions %*
