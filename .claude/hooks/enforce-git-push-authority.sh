#!/bin/bash
# enforce-git-push-authority.sh
# Compatibility wrapper for the cross-platform CJS hook.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec node "$SCRIPT_DIR/enforce-git-push-authority.cjs"
