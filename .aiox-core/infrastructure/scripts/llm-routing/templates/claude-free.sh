#!/bin/bash
# Claude Code - DeepSeek Native Mode (Low-Cost)
# Loads API key from project .env file
# Cost: ~$0.14/M tokens with tool calling support

# Find project root (look for .env file)
find_env() {
    local dir="$PWD"
    while [[ "$dir" != "/" ]]; do
        if [[ -f "$dir/.env" ]]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    return 1
}

# Try to load from .env
PROJECT_ROOT=$(find_env)

if [[ -n "$PROJECT_ROOT" ]]; then
    # Load DEEPSEEK_API_KEY from .env
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        export $(grep -E '^DEEPSEEK_API_KEY=' "$PROJECT_ROOT/.env" | xargs)
    fi
fi

# Check if key is set (from .env or environment)
if [[ -z "$DEEPSEEK_API_KEY" ]]; then
    echo ""
    echo -e "\033[91mERROR: DEEPSEEK_API_KEY not found!\033[0m"
    echo ""
    echo "Options:"
    echo "  1. Create .env in your project: cp .env.example .env"
    echo "  2. Add DEEPSEEK_API_KEY=sk-your-key to .env"
    echo "  3. Or export it: export DEEPSEEK_API_KEY=sk-your-key"
    echo ""
    echo "Get your API key at: https://platform.deepseek.com/api_keys"
    echo ""
    exit 1
fi

# Set DeepSeek native Anthropic endpoint (SUPPORTS TOOL CALLING!)
export ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
export ANTHROPIC_API_KEY="$DEEPSEEK_API_KEY"
export ANTHROPIC_MODEL="deepseek-chat"
export API_TIMEOUT_MS=600000

echo ""
echo -e "\033[92mClaude Code - DeepSeek Native Mode\033[0m"
echo "Endpoint: api.deepseek.com/anthropic"
echo -e "\033[92mTool Calling: SUPPORTED\033[0m"
echo "Cost: ~\$0.14/M tokens"
echo ""

>&2 echo ""
>&2 echo -e "\033[93mWARNING: Running with --dangerously-skip-permissions (no confirmation prompts)\033[0m"
>&2 echo -e "\033[93mOnly use in trusted repositories/environments.\033[0m"
>&2 echo ""

claude --dangerously-skip-permissions "$@"
