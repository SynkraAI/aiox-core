#!/bin/bash
# Claude Code - Claude Max Mode
# Uses your Claude Max subscription with bypass permissions
# This is the default Claude Code experience

# Clear any alternative provider settings
unset ANTHROPIC_BASE_URL
unset ANTHROPIC_AUTH_TOKEN
unset ANTHROPIC_MODEL
unset ANTHROPIC_SMALL_FAST_MODEL
unset ANTHROPIC_API_KEY

echo ""
echo -e "\033[92mClaude Max Mode - Starting...\033[0m"
echo "Using your Claude Max subscription"
echo ""

claude --dangerously-skip-permissions "$@"
