@echo off
:: Claude Code - DeepSeek Native Mode (Low-Cost)
:: Loads API key from project .env file
:: Cost: ~$0.14/M tokens with tool calling support

setlocal enabledelayedexpansion

:: Find project root (look for .env file)
:: Loop guard prevents infinite loop on UNC paths
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
:: Check if DEEPSEEK_API_KEY is set in environment
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
:: Load DEEPSEEK_API_KEY from .env (skip comments starting with #)
for /f "usebackq eol=# tokens=1,* delims==" %%a in ("%PROJECT_ROOT%\.env") do (
    if "%%a"=="DEEPSEEK_API_KEY" set "DEEPSEEK_API_KEY=%%b"
)

:: Remove quotes if present
set "DEEPSEEK_API_KEY=!DEEPSEEK_API_KEY:"=!"

if "!DEEPSEEK_API_KEY!"=="" (
    echo.
    echo [91mERROR: DEEPSEEK_API_KEY not found in .env![0m
    echo.
    echo Add to your .env file:
    echo   DEEPSEEK_API_KEY=sk-your-key
    echo.
    echo Get your API key at: https://platform.deepseek.com/api_keys
    echo.
    pause
    exit /b 1
)

:use_env_key
:: Set DeepSeek native Anthropic endpoint (SUPPORTS TOOL CALLING!)
set ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
set ANTHROPIC_API_KEY=%DEEPSEEK_API_KEY%
set ANTHROPIC_MODEL=deepseek-chat
set API_TIMEOUT_MS=600000

echo.
echo [92mClaude Code - DeepSeek Native Mode[0m
echo Endpoint: api.deepseek.com/anthropic
echo [92mTool Calling: SUPPORTED[0m
echo Cost: ~$0.14/M tokens
echo.

endlocal & set "ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic" & set "ANTHROPIC_API_KEY=%DEEPSEEK_API_KEY%" & set "ANTHROPIC_MODEL=deepseek-chat" & set "API_TIMEOUT_MS=600000"

>&2 echo.
>&2 echo [93mWARNING: Running with --dangerously-skip-permissions (no confirmation prompts)[0m
>&2 echo [93mOnly use in trusted repositories/environments.[0m
>&2 echo.

claude --dangerously-skip-permissions %*
