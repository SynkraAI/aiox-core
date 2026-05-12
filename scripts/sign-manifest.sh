#!/bin/bash
#
# sign-manifest.sh - Helper script to sign the install manifest
#
# Usage:
#   ./scripts/sign-manifest.sh /path/to/aiox-core.key
#
# Prerequisites:
#   - minisign installed (brew install minisign / apt install minisign)
#   - Secret key file
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MANIFEST_PATH="$PROJECT_ROOT/.aiox-core/install-manifest.yaml"
SIGNATURE_PATH="$MANIFEST_PATH.minisig"

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  AIOX-Core Manifest Signing Tool${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check minisign is installed
if ! command -v minisign &> /dev/null; then
    echo -e "${RED}Error: minisign is not installed${NC}"
    echo "Install with:"
    echo "  macOS:  brew install minisign"
    echo "  Ubuntu: apt install minisign"
    echo "  Windows: scoop install minisign"
    exit 1
fi

# Check secret key path provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Secret key path required${NC}"
    echo ""
    echo "Usage: $0 /path/to/aiox-core.key"
    echo ""
    echo "To generate a new key pair:"
    echo "  minisign -G -p aiox-core.pub -s aiox-core.key"
    exit 1
fi

SECRET_KEY="$1"

# Verify secret key exists
if [ ! -f "$SECRET_KEY" ]; then
    echo -e "${RED}Error: Secret key not found: $SECRET_KEY${NC}"
    exit 1
fi

# Verify manifest exists
if [ ! -f "$MANIFEST_PATH" ]; then
    echo -e "${RED}Error: Manifest not found: $MANIFEST_PATH${NC}"
    echo ""
    echo "Generate manifest first with:"
    echo "  node bin/aiox.js manifest:generate"
    exit 1
fi

# Show manifest info
echo -e "${GREEN}Manifest found:${NC} $MANIFEST_PATH"
MANIFEST_SIZE=$(wc -c < "$MANIFEST_PATH" | tr -d ' ')
MANIFEST_LINES=$(wc -l < "$MANIFEST_PATH" | tr -d ' ')
echo "  Size: $MANIFEST_SIZE bytes"
echo "  Lines: $MANIFEST_LINES"
echo ""

# Check if signature already exists
if [ -f "$SIGNATURE_PATH" ]; then
    echo -e "${YELLOW}Warning: Existing signature will be overwritten${NC}"
    echo ""
fi

# Sign the manifest
echo -e "${GREEN}Signing manifest...${NC}"
echo ""

cd "$PROJECT_ROOT/.aiox-core"
minisign -Sm install-manifest.yaml -s "$SECRET_KEY"

# Verify the signature
echo ""
echo -e "${GREEN}Verifying signature...${NC}"

# Extract public key path (assume same directory with .pub extension)
PUBLIC_KEY="${SECRET_KEY%.key}.pub"
if [ -f "$PUBLIC_KEY" ]; then
    if minisign -Vm install-manifest.yaml -p "$PUBLIC_KEY" 2>/dev/null; then
        echo -e "${GREEN}✓ Signature verified successfully${NC}"
    else
        echo -e "${RED}✗ Signature verification failed!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Note: Could not find public key at $PUBLIC_KEY${NC}"
    echo "Skipping verification (signature was still created)"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Signing Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Created: $SIGNATURE_PATH"
echo ""
echo "Next steps:"
echo "  1. git add .aiox-core/install-manifest.yaml.minisig"
echo "  2. git commit -m 'chore: sign manifest for release'"
echo "  3. npm publish"
echo ""
