#!/bin/bash
# ETL Universal Converter — Setup Script
# Installs all dependencies for the ETL pipeline

set -e

echo "═══════════════════════════════════════════"
echo "  ETL Universal Converter — Setup"
echo "═══════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} $1 found: $(command -v "$1")"
        return 0
    else
        echo -e "  ${RED}✗${NC} $1 not found"
        return 1
    fi
}

echo "Phase 1: Checking system dependencies..."
echo ""

# Check Python
if ! check_command python3; then
    echo -e "  ${YELLOW}→${NC} Install Python: brew install python@3.13"
    exit 1
fi

# Check pip
if ! check_command pip3; then
    echo -e "  ${YELLOW}→${NC} pip3 not found. Install: python3 -m ensurepip"
    exit 1
fi

# Check Tesseract (optional)
echo ""
if check_command tesseract; then
    echo -e "  ${GREEN}✓${NC} Tesseract version: $(tesseract --version 2>&1 | head -1)"
else
    echo -e "  ${YELLOW}⚠${NC} Tesseract not installed. Image OCR will be unavailable."
    echo -e "  ${YELLOW}→${NC} Install: brew install tesseract tesseract-lang"
fi

echo ""
echo "Phase 2: Installing Python packages..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQUAD_DIR="$(dirname "$SCRIPT_DIR")"

pip3 install -r "${SQUAD_DIR}/requirements.txt"

echo ""
echo "Phase 3: Verifying installations..."
echo ""

python3 -c "import polars; print(f'  ✓ polars {polars.__version__}')" 2>/dev/null || echo "  ✗ polars failed"
python3 -c "import openpyxl; print(f'  ✓ openpyxl {openpyxl.__version__}')" 2>/dev/null || echo "  ✗ openpyxl failed"
python3 -c "import pptx; print(f'  ✓ python-pptx {pptx.__version__}')" 2>/dev/null || echo "  ✗ python-pptx failed"
python3 -c "import pytesseract; print('  ✓ pytesseract')" 2>/dev/null || echo "  ✗ pytesseract failed"
python3 -c "import PIL; print(f'  ✓ Pillow {PIL.__version__}')" 2>/dev/null || echo "  ✗ Pillow failed"
python3 -c "import chardet; print(f'  ✓ chardet {chardet.__version__}')" 2>/dev/null || echo "  ✗ chardet failed"
python3 -c "import langdetect; print('  ✓ langdetect')" 2>/dev/null || echo "  ✗ langdetect failed"
python3 -c "import pydantic; print(f'  ✓ pydantic {pydantic.__version__}')" 2>/dev/null || echo "  ✗ pydantic failed"
python3 -c "import yaml; print(f'  ✓ PyYAML {yaml.__version__}')" 2>/dev/null || echo "  ✗ PyYAML failed"
python3 -c "import tabulate; print(f'  ✓ tabulate {tabulate.__version__}')" 2>/dev/null || echo "  ✗ tabulate failed"

echo ""
echo "Phase 4: Checking squad dependencies..."
echo ""

# Check media-processor
if [ -f "${SQUAD_DIR}/../../squads/media-processor/config.yaml" ]; then
    echo -e "  ${GREEN}✓${NC} media-processor squad found"
else
    echo -e "  ${YELLOW}⚠${NC} media-processor squad not found. Video/audio delegation unavailable."
fi

# Check book-to-markdown
if [ -f "${SQUAD_DIR}/../skills/book-to-markdown/convert.py" ]; then
    echo -e "  ${GREEN}✓${NC} book-to-markdown skill found"
else
    echo -e "  ${YELLOW}⚠${NC} book-to-markdown skill not found. PDF/EPUB delegation unavailable."
fi

echo ""
echo "═══════════════════════════════════════════"
echo -e "  ${GREEN}Setup complete!${NC}"
echo ""
echo "  Usage:"
echo "    @etl-chief"
echo "    *convert ~/path/to/file.xlsx"
echo "    *batch ~/path/to/directory/"
echo "═══════════════════════════════════════════"
