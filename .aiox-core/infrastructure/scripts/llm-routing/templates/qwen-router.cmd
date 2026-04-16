@echo off
REM AIOX Qwen Router - Qwen 3 14B Support
REM Windows Version

SETLOCAL EnableDelayedExpansion

REM Find .env and load variables (simplified for CMD)
FOR /F "tokens=*" %%A IN ('type .env 2^>NUL ^| findstr /R "^QWEN_API_KEY= ^QWEN_BASE_URL= ^AIOX_QWEN_MODEL= ^OPENROUTER_API_KEY="') DO (
    SET %%A
)

IF "%QWEN_API_KEY%"=="" (
    IF NOT "%OPENROUTER_API_KEY%"=="" (
        SET QWEN_API_KEY=%OPENROUTER_API_KEY%
    )
)

IF "%QWEN_API_KEY%"=="" (
    echo.
    echo ERROR: QWEN_API_KEY not found in .env
    exit /b 1
)

IF "%QWEN_BASE_URL%"=="" (
    SET QWEN_BASE_URL=https://openrouter.ai/api/v1/anthropic
)

IF "%AIOX_QWEN_MODEL%"=="" (
    SET AIOX_QWEN_MODEL=qwen/qwen-3-14b
)

SET ANTHROPIC_BASE_URL=%QWEN_BASE_URL%
SET ANTHROPIC_API_KEY=%QWEN_API_KEY%
SET ANTHROPIC_MODEL=%AIOX_QWEN_MODEL%
SET API_TIMEOUT_MS=600000

echo.
echo AIOX Qwen Router Active
echo Model: %ANTHROPIC_MODEL%
echo Endpoint: %ANTHROPIC_BASE_URL%
echo.

claude --dangerously-skip-permissions %*
