@echo off
:: Claude Code - Claude Max Mode
:: Uses your Claude Max subscription via OAuth (claude.ai login)
:: This is the premium Claude Code experience

:: Clear ALL alternative provider settings to force OAuth
set "ANTHROPIC_BASE_URL="
set "ANTHROPIC_AUTH_TOKEN="
set "ANTHROPIC_MODEL="
set "ANTHROPIC_SMALL_FAST_MODEL="
set "ANTHROPIC_API_KEY="
set "DEEPSEEK_API_KEY="
set "OPENROUTER_API_KEY="
set "API_TIMEOUT_MS="

echo.
echo [92m========================================[0m
echo [92m  Claude Max Mode - OAuth/Claude.ai[0m
echo [92m========================================[0m
echo.
echo Using your Claude Max subscription (claude.ai login)
echo If you see "API Usage Billing", run: claude /logout
echo Then restart and login again with your Max account.
echo.

claude --dangerously-skip-permissions %*
