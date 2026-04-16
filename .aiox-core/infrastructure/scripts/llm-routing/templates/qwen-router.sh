#!/bin/bash
# AIOX Qwen Router - Qwen 3 14B Support
# Routes AI requests to Qwen model via Anthropic-compatible endpoint
#
# Configuration:
# - Add QWEN_API_KEY to your .env file
# - (Optional) Add QWEN_BASE_URL if using a specific provider
#
# Default Provider: OpenRouter (via Anthropic-compatible mode)
# Model: qwen/qwen-3-14b

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
    # Load keys from .env
    if [[ -f "$PROJECT_ROOT/.env" ]]; then
        export $(grep -E '^QWEN_API_KEY=' "$PROJECT_ROOT/.env" | xargs)
        export $(grep -E '^QWEN_BASE_URL=' "$PROJECT_ROOT/.env" | xargs)
        export $(grep -E '^AIOX_QWEN_MODEL=' "$PROJECT_ROOT/.env" | xargs)
    fi
fi

# Fallback to OPENROUTER_API_KEY if QWEN_API_KEY is not set
if [[ -z "$QWEN_API_KEY" ]] && [[ -n "$OPENROUTER_API_KEY" ]]; then
    QWEN_API_KEY="$OPENROUTER_API_KEY"
fi

# Set Defaults
DEFAULT_MODEL="qwen/qwen-3-14b"
DEFAULT_LOCAL_URL="http://localhost:11434/v1" # Ollama default

if [[ -z "$QWEN_BASE_URL" ]]; then
    # If using Ollama locally, many users forget to set the URL
    QWEN_BASE_URL="$DEFAULT_LOCAL_URL"
fi

# Check if key is set - Skip if using a local URL (Ollama/LM Studio usually don't need keys)
is_local=false
if [[ "$QWEN_BASE_URL" == *"localhost"* ]] || [[ "$QWEN_BASE_URL" == *"127.0.0.1"* ]]; then
    is_local=true
fi

if [[ -z "$QWEN_API_KEY" ]] && [[ "$is_local" == "false" ]]; then
    echo ""
    echo -e "\033[91mERROR: QWEN_API_KEY not found!\033[0m"
    echo ""
    echo "Please add QWEN_API_KEY to your .env file or set QWEN_BASE_URL to a local endpoint."
    echo ""
    exit 1
fi

# If local, API key can be anything (Ollama requires it in header even if ignored)
if [[ "$is_local" == "true" ]] && [[ -z "$QWEN_API_KEY" ]]; then
    QWEN_API_KEY="local-no-key-needed"
fi

# If local, start the Ollama Bridge
if [[ "$is_local" == "true" ]]; then
    BRIDGE_PORT=8788
    PID_FILE="/tmp/aiox-qwen-bridge.pid"
    # Priority: Global installation path
    BRIDGE_SCRIPT="$HOME/.aiox/bin/ollama-bridge.js"
    
    # Fallback: Local repository path (for development)
    if [[ ! -f "$BRIDGE_SCRIPT" ]]; then
        BRIDGE_SCRIPT="$(dirname "$0")/../.aiox-core/infrastructure/scripts/llm-routing/usage-tracker/ollama-bridge.js"
    fi

    # Check if bridge is already running
    if ! curl -s "http://127.0.0.1:$BRIDGE_PORT/health" > /dev/null 2>&1; then
        echo "Starting Ollama-Anthropic Bridge..."
        BRIDGE_PORT=$BRIDGE_PORT OLLAMA_URL="$QWEN_BASE_URL" nohup node "$BRIDGE_SCRIPT" > /tmp/aiox-qwen-bridge.log 2>&1 &
        echo $! > "$PID_FILE"
        sleep 1
    fi
    QWEN_BASE_URL="http://127.0.0.1:$BRIDGE_PORT"
fi

# Set Anthropic compatibility layer
export ANTHROPIC_BASE_URL="${QWEN_BASE_URL}"
export ANTHROPIC_API_KEY="$QWEN_API_KEY"
export ANTHROPIC_MODEL="${AIOX_QWEN_MODEL:-$DEFAULT_MODEL}"
export API_TIMEOUT_MS=600000

echo ""
echo -e "\033[92mAIOX Qwen Router Active\033[0m"
echo "Model: $ANTHROPIC_MODEL"
if [[ "$is_local" == "true" ]]; then
    echo "Endpoint: $ANTHROPIC_BASE_URL (bridged to local Ollama)"
else
    echo "Endpoint: $ANTHROPIC_BASE_URL"
fi
echo ""

# Delegate to claude CLI
claude --dangerously-skip-permissions "$@"
