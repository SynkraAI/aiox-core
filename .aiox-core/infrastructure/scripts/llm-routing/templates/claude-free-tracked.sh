#!/bin/bash
# Claude Code - DeepSeek Native Mode with Usage Tracking
# Routes through local proxy to track per-alias usage
# Cost: ~$0.14/M tokens with tool calling support

PROXY_PORT=8787
ALIAS="claude-free"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRACKER_SCRIPT="$SCRIPT_DIR/../usage-tracker/index.js"

# Colors
RED='\033[0;91m'
GREEN='\033[0;92m'
YELLOW='\033[0;93m'
CYAN='\033[0;96m'
NC='\033[0m' # No Color

# Find project root (look for .env file)
find_env() {
    local dir="$PWD"
    local count=0
    while [ $count -lt 50 ]; do
        if [ -f "$dir/.env" ]; then
            echo "$dir"
            return 0
        fi
        if [ "$dir" = "/" ]; then
            return 1
        fi
        dir="$(dirname "$dir")"
        ((count++))
    done
    return 1
}

PROJECT_ROOT=$(find_env)

if [ -z "$PROJECT_ROOT" ] && [ -z "$DEEPSEEK_API_KEY" ]; then
    echo -e "${RED}ERROR: No .env file found and DEEPSEEK_API_KEY not set!${NC}"
    echo ""
    echo "Options:"
    echo "  1. Create .env in your project: cp .env.example .env"
    echo "  2. Set DEEPSEEK_API_KEY in the .env file"
    echo "  3. Or export it: export DEEPSEEK_API_KEY='sk-your-key'"
    echo ""
    echo "Get your API key at: https://platform.deepseek.com/api_keys"
    exit 1
fi

# Load DEEPSEEK_API_KEY from .env if not already set
if [ -z "$DEEPSEEK_API_KEY" ] && [ -n "$PROJECT_ROOT" ]; then
    DEEPSEEK_API_KEY=$(grep -E '^DEEPSEEK_API_KEY=' "$PROJECT_ROOT/.env" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
fi

if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo -e "${RED}ERROR: DEEPSEEK_API_KEY not found!${NC}"
    exit 1
fi

# Check if proxy is running
check_proxy() {
    curl -s "http://127.0.0.1:$PROXY_PORT/health" > /dev/null 2>&1
}

# Start proxy if not running
if ! check_proxy; then
    echo -e "${YELLOW}Usage Tracker proxy not running. Starting in background...${NC}"

    # Start proxy in background
    nohup node "$TRACKER_SCRIPT" start --port=$PROXY_PORT --alias=$ALIAS > /dev/null 2>&1 &

    # Wait for proxy to start
    sleep 2

    if ! check_proxy; then
        echo -e "${RED}Failed to start proxy. Falling back to direct connection.${NC}"
        export ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
    else
        echo -e "${GREEN}Proxy started successfully!${NC}"
        export ANTHROPIC_BASE_URL="http://127.0.0.1:$PROXY_PORT/anthropic"
    fi
else
    export ANTHROPIC_BASE_URL="http://127.0.0.1:$PROXY_PORT/anthropic"
fi

export ANTHROPIC_API_KEY="$DEEPSEEK_API_KEY"
export ANTHROPIC_MODEL="deepseek-chat"
export API_TIMEOUT_MS=600000

echo ""
echo -e "${GREEN}Claude Code - DeepSeek Native Mode (TRACKED)${NC}"
if [[ "$ANTHROPIC_BASE_URL" == *"127.0.0.1"* ]]; then
    echo "Proxy: 127.0.0.1:$PROXY_PORT"
    echo "Alias: $ALIAS"
    echo -e "${CYAN}Usage tracking enabled. Run 'deepseek-usage' to view stats.${NC}"
else
    echo "Endpoint: api.deepseek.com/anthropic"
    echo -e "${YELLOW}Usage tracking: DISABLED (proxy not running)${NC}"
fi
echo -e "${GREEN}Tool Calling: SUPPORTED${NC}"
echo "Cost: ~\$0.14/M tokens"
echo ""

echo -e "${YELLOW}WARNING: Running with --dangerously-skip-permissions (no confirmation prompts)${NC}" >&2
echo -e "${YELLOW}Only use in trusted repositories/environments.${NC}" >&2
echo "" >&2

exec claude --dangerously-skip-permissions "$@"
