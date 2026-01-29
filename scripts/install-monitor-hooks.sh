#!/bin/bash
#
# AIOS Monitor Hooks Installation Script
#
# This script installs the AIOS monitor hooks into ~/.claude/hooks/
# The hooks capture Claude Code events and send them to the monitor server.
#
# Usage: ./scripts/install-monitor-hooks.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AIOS_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_SOURCE="$AIOS_ROOT/.aios-core/monitor/hooks"
HOOKS_TARGET="$HOME/.claude/hooks"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              AIOS Monitor Hooks Installer                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Create target directory
mkdir -p "$HOOKS_TARGET/lib"

# Check if hooks already exist
if [ -f "$HOOKS_TARGET/post_tool_use.py" ]; then
    echo "⚠️  Existing hooks detected at $HOOKS_TARGET"
    echo ""
    read -p "Do you want to backup and replace them? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 1
    fi

    # Backup existing hooks
    BACKUP_DIR="$HOOKS_TARGET.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📦 Backing up existing hooks to $BACKUP_DIR"
    mv "$HOOKS_TARGET" "$BACKUP_DIR"
    mkdir -p "$HOOKS_TARGET/lib"
fi

echo ""
echo "📂 Source: $HOOKS_SOURCE"
echo "📂 Target: $HOOKS_TARGET"
echo ""

# Copy library files
echo "📚 Installing library files..."
cp "$HOOKS_SOURCE/lib/__init__.py" "$HOOKS_TARGET/lib/"
cp "$HOOKS_SOURCE/lib/send_event.py" "$HOOKS_TARGET/lib/"
cp "$HOOKS_SOURCE/lib/enrich.py" "$HOOKS_TARGET/lib/"

# Copy hook files
echo "🪝 Installing hooks..."
for hook in pre_tool_use post_tool_use user_prompt_submit stop subagent_stop notification pre_compact; do
    if [ -f "$HOOKS_SOURCE/${hook}.py" ]; then
        cp "$HOOKS_SOURCE/${hook}.py" "$HOOKS_TARGET/"
        chmod +x "$HOOKS_TARGET/${hook}.py"
        echo "   ✓ ${hook}.py"
    fi
done

# Make all Python files executable
chmod +x "$HOOKS_TARGET"/*.py 2>/dev/null || true

echo ""
echo "✅ Hooks installed successfully!"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Next Steps:                                                   ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║  1. Start the monitor server:                                  ║"
echo "║     cd apps/monitor-server && bun run dev                      ║"
echo "║                                                                ║"
echo "║  2. (Optional) Set custom server URL:                          ║"
echo "║     export AIOS_MONITOR_URL=http://localhost:4001              ║"
echo "║                                                                ║"
echo "║  3. Start using Claude Code - events will be captured!         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
