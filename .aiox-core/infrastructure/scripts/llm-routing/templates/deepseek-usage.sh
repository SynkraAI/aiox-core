#!/bin/bash
# DeepSeek Usage Statistics CLI
# View usage tracking data per alias

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRACKER_SCRIPT="$SCRIPT_DIR/../usage-tracker/index.js"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Pass arguments to tracker
node "$TRACKER_SCRIPT" usage "$@"
