#!/bin/bash
# Install AIOX Git Hooks
# Version: 1.0

set -e

echo "🔧 Installing AIOX Git Hooks..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

# Ensure hooks directory exists
if [ ! -d "$HOOKS_DIR" ]; then
    echo "❌ Error: .git/hooks directory not found"
    echo "Are you in a git repository?"
    exit 1
fi

# Install pre-commit hook (MMOS architecture guard)
echo "Installing pre-commit hook (MMOS architecture guard)..."
ln -sf ../../.aiox-core/hooks/pre-commit-mmos-guard.sh "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Pre-commit hook installed"

# Make all hooks executable
chmod +x "$SCRIPT_DIR"/*.sh

echo ""
echo "✅ All hooks installed successfully!"
echo ""
echo "Installed hooks:"
echo "  - pre-commit: MMOS architecture guard"
echo ""
echo "To test:"
echo "  .aiox-core/hooks/pre-commit-mmos-guard.sh"
echo ""
echo "To uninstall:"
echo "  rm .git/hooks/pre-commit"
