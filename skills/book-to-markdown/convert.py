#!/usr/bin/env python3
"""
book-to-markdown: Convert books (PDF, EPUB, MOBI, DOCX, RTF, ODT) to well-formatted Markdown.

Usage:
    python3 convert.py /path/to/book.pdf
    python3 convert.py /path/to/book.epub -o output.md
    python3 convert.py /path/to/books/ --batch
    python3 convert.py /path/to/book.pdf -q precise
    python3 convert.py /path/to/books/ --batch --dry-run
"""

import argparse
import logging
import os
import re
import subprocess
import sys
import tempfile
import threading
from datetime import date
from pathlib import Path

# --- Logging ---

LOG_FORMAT = '%(levelname)-7s %(message)s'
logger = logging.getLogger('book-to-markdown')


SUPPORTED_EXTENSIONS = {
    '.pdf': 'pdf',
    '.epub': 'epub',
    '.mobi': 'mobi',
    '.azw': 'mobi',
    '.azw3': 'mobi',
    '.docx': 'docx',
    '.doc': 'docx',
    '.rtf': 'rtf',
    '.odt': 'odt',
}

MIN_WORD_COUNT = 100  # Minimum words for a valid conversion
MIN_TOC_HEADERS = 3   # Minimum headers needed to generate a TOC


def detect_format(filepath):
    """Detect book format from file extension."""
    ext = Path(filepath).suffix.lower()
    return SUPPORTED_EXTENSIONS.get(ext)


def check_dependency(cmd, name, install_hint):
    """Check if an external dependency is available."""
    from shutil import which
    if which(cmd) is None:
        logger.error(f"{name} not found. Install with: {install_hint}")
        return False
    return True


# --- Timeout ---

class ConversionTimeout(Exception):
    """Raised when a conversion exceeds the timeout."""
    pass


def run_with_timeout(func, args=(), kwargs=None, timeout=300):
    """Run a function with a timeout (seconds). Default 5 minutes.
    Uses threading for cross-platform compatibility (works on macOS, Linux, Windows).
    """
    if kwargs is None:
        kwargs = {}
    if timeout <= 0:
        return func(*args, **kwargs)

    result = [None]
    exception = [None]

    def wrapper():
        try:
            result[0] = func(*args, **kwargs)
        except Exception as e:
            exception[0] = e

    thread = threading.Thread(target=wrapper, daemon=True)
    thread.start()
    thread.join(timeout)

    if thread.is_alive():
        raise ConversionTimeout(f"Conversion timed out after {timeout}s")
    if exception[0]:
        raise exception[0]
    return result[0]


# --- PDF Metadata ---

def extract_pdf_metadata(filepath):
    """Extract author and title from PDF metadata using PyMuPDF."""
    try:
        import pymupdf
        doc = pymupdf.open(str(filepath))
        meta = doc.metadata or {}
        doc.close()
        return {
            'author': (meta.get('author') or '').strip(),
            'title': (meta.get('title') or '').strip(),
        }
    except Exception:
        return {'author': '', 'title': ''}


# --- Converters ---

def convert_pdf_fast(filepath):
    """Convert PDF using PyMuPDF4LLM (fast, good for most PDFs)."""
    try:
        import pymupdf4llm
    except ImportError:
        raise RuntimeError("pymupdf4llm not installed. Run: pip install pymupdf4llm")

    return pymupdf4llm.to_markdown(str(filepath))


def convert_pdf_precise(filepath):
    """Convert PDF using Marker (slower, better for complex layouts)."""
    try:
        from marker.converters.pdf import PdfConverter
        from marker.models import create_model_dict
    except ImportError:
        logger.warning("marker-pdf not installed. Run: pip install marker-pdf")
        logger.warning("Falling back to fast mode (pymupdf4llm)...")
        return convert_pdf_fast(filepath)

    models = create_model_dict()
    converter = PdfConverter(artifact_dict=models)
    rendered = converter(str(filepath))
    return rendered.markdown


def convert_epub(filepath):
    """Convert EPUB using Pandoc."""
    if not check_dependency('pandoc', 'Pandoc', 'brew install pandoc'):
        raise RuntimeError("Pandoc not found. Install with: brew install pandoc")

    result = subprocess.run(
        [
            'pandoc', str(filepath),
            '-f', 'epub',
            '-t', 'markdown_strict+pipe_tables+backtick_code_blocks',
            '--wrap=none',
        ],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Pandoc failed: {result.stderr}")
    return result.stdout


def convert_mobi(filepath):
    """Convert MOBI/AZW via Calibre (to EPUB) then Pandoc (to MD)."""
    if not check_dependency('ebook-convert', 'Calibre', 'brew install --cask calibre'):
        raise RuntimeError("Calibre not found. Install with: brew install --cask calibre")

    with tempfile.NamedTemporaryFile(suffix='.epub', delete=False) as tmp:
        tmp_epub = tmp.name

    try:
        result = subprocess.run(
            ['ebook-convert', str(filepath), tmp_epub],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            raise RuntimeError(f"Calibre conversion failed: {result.stderr}")
        return convert_epub(tmp_epub)
    finally:
        if os.path.exists(tmp_epub):
            os.unlink(tmp_epub)


def convert_pandoc_generic(filepath, input_format):
    """Convert DOCX/RTF/ODT using Pandoc."""
    if not check_dependency('pandoc', 'Pandoc', 'brew install pandoc'):
        raise RuntimeError("Pandoc not found. Install with: brew install pandoc")

    result = subprocess.run(
        [
            'pandoc', str(filepath),
            '-f', input_format,
            '-t', 'markdown_strict+pipe_tables+backtick_code_blocks',
            '--wrap=none',
        ],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Pandoc failed: {result.stderr}")
    return result.stdout


# --- Post-processing ---

def clean_markdown(text, keep_images=False):
    """
    Clean up conversion artifacts ONLY. Never alter the author's original content.

    This function removes technical artifacts introduced by the PDF/EPUB conversion
    process (page numbers, artificial line breaks, extra whitespace) while preserving
    the original text, structure, and meaning of the book 100% intact.
    """
    # Remove all HTML tags but keep content between them
    text = re.sub(r'<[^>]+>', '', text)

    # Remove or keep markdown image references based on flag
    if not keep_images:
        text = re.sub(r'!\[.*?\]\(.*?\)', '', text)

    # Remove {.class} and {#id} attributes (Pandoc artifacts)
    text = re.sub(r'\{[.#][^}]*\}', '', text)

    # Remove ::: div markers (Pandoc) — use [ \t]* and [^\n]* to avoid consuming newlines
    text = re.sub(r'^:::[ \t]*[^\n]*$', '', text, flags=re.MULTILINE)

    # Fix hyphenated line breaks introduced by PDF column layout
    # Only join when: lowercase-\nlowercase (avoids breaking compound words,
    # capitalized words after hyphens, and list items)
    # Includes accented characters for pt/es/fr/de/it support
    text = re.sub(r'([a-záàâãéèêíïóôõúüçñßäöü])-\n([a-záàâãéèêíïóôõúüçñßäöü])', r'\1\2', text)

    # Remove page number markers
    text = re.sub(r'\n---\n\s*Page\s+\d+\s*\n---\n', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'\n\s*-\s*\d+\s*-\s*\n', '\n', text)

    # Normalize spacing around headers (max 2 blank lines before header)
    text = re.sub(r'\n{3,}(#+\s)', r'\n\n\1', text)

    # Remove trailing whitespace per line
    text = re.sub(r'[ \t]+$', '', text, flags=re.MULTILINE)

    # Fix lists missing space after bullet
    text = re.sub(r'\n-([^\s\-])', r'\n- \1', text)
    text = re.sub(r'\n\*([^\s\*])', r'\n* \1', text)

    # Normalize excessive blank lines (max 2 consecutive)
    text = re.sub(r'\n{4,}', '\n\n\n', text)

    return text.strip()


def validate_output(md_text, filepath):
    """
    Validate conversion output quality. Returns (is_valid, confidence, warnings).
    Prevents silent garbage output from reaching the user.
    """
    warnings = []
    word_count = len(md_text.split())

    if word_count < MIN_WORD_COUNT:
        warnings.append(
            f"Only {word_count} words extracted (minimum: {MIN_WORD_COUNT}). "
            f"File may be scanned/image-only PDF — try -q precise"
        )
        return False, 'low', warnings

    # Check for high ratio of non-alphabetic characters (garbled output)
    alpha_chars = sum(1 for c in md_text if c.isalpha())
    total_chars = len(md_text)
    if total_chars > 0:
        alpha_ratio = alpha_chars / total_chars
        if alpha_ratio < 0.3:
            warnings.append(
                f"Low text quality ({alpha_ratio:.0%} alphabetic). "
                f"Output may be garbled — try -q precise"
            )
            return False, 'low', warnings

    # Determine confidence level
    if word_count > 5000 and not warnings:
        confidence = 'high'
    elif word_count > 1000:
        confidence = 'medium'
    else:
        confidence = 'low'
        warnings.append(f"Low word count ({word_count}). Verify output manually.")

    return True, confidence, warnings


def detect_language(text):
    """
    Detect the primary language of text using common word frequency analysis.
    Returns ISO 639-1 code (e.g., 'en', 'pt', 'es', 'fr', 'de', 'it').
    Falls back to 'en' if unable to determine.
    """
    # Sample first ~5000 words to avoid processing entire book
    sample = ' '.join(text.split()[:5000]).lower()

    # Common function words per language (high-frequency, language-specific)
    lang_markers = {
        'pt': ['que', 'não', 'com', 'uma', 'para', 'dos', 'mais', 'como', 'mas', 'pelo',
               'isso', 'está', 'também', 'são', 'quando', 'muito', 'pode', 'esse', 'já',
               'você', 'pela', 'entre', 'depois', 'sobre', 'mesmo', 'ainda', 'então'],
        'en': ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
               'from', 'they', 'been', 'would', 'there', 'their', 'what', 'about', 'which',
               'when', 'could', 'other', 'into', 'than', 'some', 'these', 'them'],
        'es': ['que', 'los', 'del', 'las', 'una', 'por', 'con', 'para', 'como', 'pero',
               'más', 'este', 'sus', 'hay', 'desde', 'está', 'entre', 'también', 'todo',
               'puede', 'muy', 'así', 'nos', 'sobre', 'tiene', 'sido', 'fueron'],
        'fr': ['les', 'des', 'une', 'que', 'est', 'dans', 'qui', 'par', 'pour', 'pas',
               'sur', 'sont', 'avec', 'plus', 'tout', 'mais', 'comme', 'ont', 'bien',
               'cette', 'aussi', 'fait', 'peut', 'nous', 'même', 'leurs', 'très'],
        'de': ['und', 'der', 'die', 'das', 'ist', 'von', 'den', 'ein', 'mit', 'nicht',
               'sich', 'des', 'auf', 'für', 'eine', 'auch', 'dem', 'als', 'aus', 'noch',
               'hat', 'werden', 'wird', 'sind', 'nach', 'bei', 'über'],
        'it': ['che', 'del', 'della', 'dei', 'una', 'per', 'con', 'sono', 'come', 'più',
               'anche', 'questo', 'suo', 'suo', 'essere', 'stato', 'hanno', 'dalla',
               'questa', 'tutto', 'suoi', 'ogni', 'nella', 'degli', 'alla', 'fatto'],
    }

    words_set = set(re.findall(r'\b[a-záàâãéèêíïóôõúüçñß]+\b', sample))

    scores = {}
    for lang, markers in lang_markers.items():
        scores[lang] = sum(1 for w in markers if w in words_set)

    if not scores or max(scores.values()) == 0:
        return 'en'

    return max(scores, key=scores.get)


def extract_toc(text):
    """
    Extract a Table of Contents from markdown headers.
    Returns a markdown TOC string, or empty string if fewer than MIN_TOC_HEADERS found.
    Skips headers inside code blocks (``` ... ```).
    Handles duplicate headers with GitHub-style suffixes (-1, -2, etc.).
    """
    # Find code block ranges to exclude headers inside them
    code_block_lines = set()
    in_code = False
    for i, line in enumerate(text.split('\n')):
        if line.strip().startswith('```'):
            in_code = not in_code
            code_block_lines.add(i)
        elif in_code:
            code_block_lines.add(i)

    # Extract headers with line numbers, filtering out those in code blocks
    headers = []
    for i, line in enumerate(text.split('\n')):
        if i in code_block_lines:
            continue
        match = re.match(r'^(#{1,4})\s+(.+)$', line)
        if match:
            headers.append((match.group(1), match.group(2)))

    if len(headers) < MIN_TOC_HEADERS:
        return ''

    toc_lines = ['## Table of Contents', '']
    seen_anchors = {}

    for hashes, title in headers:
        level = len(hashes)
        # Skip H1 (book title) — TOC starts from H2
        if level < 2:
            continue
        indent = '  ' * (level - 2)
        # Create anchor link (GitHub-style: lowercase, spaces to hyphens, strip special chars)
        anchor = re.sub(r'[^\w\s-]', '', title.lower())
        anchor = re.sub(r'\s+', '-', anchor.strip())

        # Handle duplicate anchors (GitHub appends -1, -2, etc.)
        if anchor in seen_anchors:
            seen_anchors[anchor] += 1
            anchor = f'{anchor}-{seen_anchors[anchor]}'
        else:
            seen_anchors[anchor] = 0

        toc_lines.append(f'{indent}- [{title}](#{anchor})')

    # Only return if we have actual TOC entries (beyond the header)
    if len(toc_lines) <= 2:
        return ''

    toc_lines.append('')  # trailing newline
    return '\n'.join(toc_lines)


def extract_title_from_content(text):
    """Try to extract a title from the first H1 header in the content."""
    match = re.search(r'^#\s+(.+)$', text, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return None


def generate_frontmatter(filepath, fmt, tool_used, content, confidence='medium',
                         pdf_meta=None, language=None):
    """Generate YAML frontmatter for the converted file."""
    filename = Path(filepath).stem
    content_title = extract_title_from_content(content)

    # Priority: PDF metadata > content H1 > filename
    title = content_title or filename.replace('-', ' ').replace('_', ' ').title()
    if pdf_meta and pdf_meta.get('title'):
        title = pdf_meta['title']

    author = ''
    if pdf_meta and pdf_meta.get('author'):
        author = pdf_meta['author']

    word_count = len(content.split())

    lines = [
        '---',
        f'title: "{title}"',
    ]
    if author:
        lines.append(f'author: "{author}"')
    if language:
        lines.append(f'language: {language}')
    lines.extend([
        f'source_file: "{Path(filepath).name}"',
        f'source_format: {fmt}',
        f'conversion_tool: {tool_used}',
        f'conversion_date: {date.today().isoformat()}',
        f'word_count: {word_count}',
        f'conversion_confidence: {confidence}',
        '---',
        '',
        '',
    ])
    return '\n'.join(lines)


# --- Main Logic ---

def convert_file(filepath, quality='fast', add_frontmatter=True, do_clean=True,
                 keep_images=False, timeout=300, add_toc=True):
    """Convert a single file to Markdown. Returns (md_text, confidence) or (None, None)."""
    filepath = Path(filepath).resolve()

    if not filepath.exists():
        logger.error(f"File not found: {filepath}")
        return None, None

    fmt = detect_format(filepath)
    if not fmt:
        logger.error(f"Unsupported format: {filepath.suffix}")
        return None, None

    logger.info(f"Converting: {filepath.name} ({fmt})")

    # Extract PDF metadata before conversion
    pdf_meta = None
    if fmt == 'pdf':
        pdf_meta = extract_pdf_metadata(filepath)

    # Route to appropriate converter
    tool_map = {
        'pdf': ('pymupdf4llm' if quality == 'fast' else 'marker', None),
        'epub': ('pandoc', 'epub'),
        'mobi': ('calibre+pandoc', None),
        'docx': ('pandoc', 'docx'),
        'rtf': ('pandoc', 'rtf'),
        'odt': ('pandoc', 'odt'),
    }

    tool_used, pandoc_fmt = tool_map[fmt]

    # Run conversion with timeout protection
    try:
        if fmt == 'pdf':
            converter = convert_pdf_precise if quality == 'precise' else convert_pdf_fast
            md_text = run_with_timeout(converter, args=(filepath,), timeout=timeout)
        elif fmt == 'mobi':
            md_text = run_with_timeout(convert_mobi, args=(filepath,), timeout=timeout)
        else:
            md_text = run_with_timeout(
                convert_pandoc_generic, args=(filepath, pandoc_fmt), timeout=timeout
            )
    except ConversionTimeout:
        logger.error(f"Conversion timed out after {timeout}s: {filepath.name}")
        logger.error(f"Try increasing timeout with --timeout or use a different quality mode")
        return None, None

    # Post-process
    if do_clean:
        md_text = clean_markdown(md_text, keep_images=keep_images)

    # Validate output quality
    is_valid, confidence, warnings = validate_output(md_text, filepath)
    for w in warnings:
        logger.warning(f"  {filepath.name}: {w}")

    if not is_valid:
        logger.error(f"  {filepath.name}: Conversion produced invalid output (skipped)")
        return None, None

    # Detect language
    language = detect_language(md_text)

    # Generate and insert TOC
    toc = ''
    if add_toc:
        toc = extract_toc(md_text)
        if toc:
            # Insert TOC after the first H1 header (book title)
            h1_match = re.search(r'^#\s+.+$', md_text, re.MULTILINE)
            if h1_match:
                insert_pos = h1_match.end()
                md_text = md_text[:insert_pos] + '\n\n' + toc + '\n' + md_text[insert_pos:]
            else:
                md_text = toc + '\n' + md_text

    # Add frontmatter
    if add_frontmatter:
        frontmatter = generate_frontmatter(
            filepath, fmt, tool_used, md_text,
            confidence=confidence, pdf_meta=pdf_meta, language=language,
        )
        md_text = frontmatter + md_text

    return md_text, confidence


def process_single(args):
    """Process a single file."""
    filepath = Path(args.input).resolve()
    output_path = Path(args.output) if args.output else filepath.with_suffix('.md')

    # Check overwrite protection
    if not args.overwrite and output_path.exists():
        logger.error(f"Output already exists: {output_path}")
        logger.error(f"Use --overwrite to replace, or -o to specify a different path")
        sys.exit(1)

    md_text, confidence = convert_file(
        filepath,
        quality=args.quality,
        add_frontmatter=not args.no_frontmatter,
        do_clean=not args.no_clean,
        keep_images=args.keep_images,
        timeout=args.timeout,
        add_toc=not args.no_toc,
    )

    if md_text is None:
        sys.exit(1)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(md_text, encoding='utf-8')

    word_count = len(md_text.split())
    line_count = md_text.count('\n')
    logger.info(f"Done: {output_path}")
    logger.info(f"Stats: {word_count:,} words, {line_count:,} lines, confidence: {confidence}")


def process_batch(args):
    """Process all supported files in a directory."""
    input_dir = Path(args.input).resolve()

    if not input_dir.is_dir():
        logger.error(f"Not a directory: {input_dir}")
        sys.exit(1)

    output_dir = Path(args.output) if args.output else input_dir

    files = sorted([
        f for f in input_dir.iterdir()
        if f.suffix.lower() in SUPPORTED_EXTENSIONS and f.is_file()
    ])

    if not files:
        logger.info(f"No supported files found in {input_dir}")
        logger.info(f"Supported: {', '.join(SUPPORTED_EXTENSIONS.keys())}")
        sys.exit(0)

    # Dry run mode — list files without converting
    if args.dry_run:
        print(f"\n[DRY RUN] Would convert {len(files)} file(s):\n")
        for f in files:
            fmt = detect_format(f)
            out_path = output_dir / f.with_suffix('.md').name
            exists = " (EXISTS — would skip)" if not args.overwrite and out_path.exists() else ""
            print(f"  {f.name} ({fmt}) -> {out_path.name}{exists}")
        print(f"\nOutput directory: {output_dir}")
        print(f"Quality mode: {args.quality}")
        print(f"Remove --dry-run to execute.")
        return

    logger.info(f"Found {len(files)} file(s) to convert:")
    for f in files:
        logger.info(f"  - {f.name}")
    print()

    success = 0
    failed = 0
    skipped = 0

    for filepath in files:
        try:
            out_path = output_dir / filepath.with_suffix('.md').name

            # Skip if output exists and overwrite not enabled
            if not args.overwrite and out_path.exists():
                logger.info(f"  SKIP: {out_path.name} (already exists, use --overwrite)")
                skipped += 1
                continue

            md_text, confidence = convert_file(
                filepath,
                quality=args.quality,
                add_frontmatter=not args.no_frontmatter,
                do_clean=not args.no_clean,
                keep_images=args.keep_images,
                timeout=args.timeout,
                add_toc=not args.no_toc,
            )

            if md_text is None:
                failed += 1
                continue

            out_path.parent.mkdir(parents=True, exist_ok=True)
            out_path.write_text(md_text, encoding='utf-8')

            word_count = len(md_text.split())
            logger.info(f"  -> {out_path.name} ({word_count:,} words, {confidence})")
            success += 1

        except Exception as e:
            logger.error(f"  FAILED: {filepath.name} — {e}")
            failed += 1

    print(f"\nBatch complete: {success} success, {failed} failed, {skipped} skipped, {len(files)} total")


def main():
    parser = argparse.ArgumentParser(
        description='Convert books (PDF, EPUB, MOBI, DOCX) to well-formatted Markdown',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s book.pdf                        # Fast PDF conversion
  %(prog)s book.pdf -q precise             # Precise PDF (complex layouts)
  %(prog)s book.epub -o output.md          # EPUB with custom output
  %(prog)s ./books/ --batch                # Convert all books in directory
  %(prog)s ./books/ --batch --dry-run      # Preview batch without converting
  %(prog)s ./books/ --batch -o ./markdown/ # Batch with output directory
  %(prog)s book.pdf --keep-images          # Preserve image references
  %(prog)s book.pdf --timeout 600          # 10-minute timeout
        """,
    )
    parser.add_argument('input', help='Input file or directory (with --batch)')
    parser.add_argument('-o', '--output', help='Output .md file path (or directory for --batch)')
    parser.add_argument(
        '-q', '--quality',
        choices=['fast', 'precise'],
        default='fast',
        help='PDF conversion quality: fast (pymupdf4llm) or precise (marker). Default: fast',
    )
    parser.add_argument('--batch', action='store_true', help='Process all files in a directory')
    parser.add_argument('--dry-run', action='store_true', help='Preview batch files without converting')
    parser.add_argument('--no-frontmatter', action='store_true', help='Skip YAML frontmatter')
    parser.add_argument('--no-clean', action='store_true', help='Skip post-processing cleanup')
    parser.add_argument('--no-toc', action='store_true', help='Skip automatic Table of Contents generation')
    parser.add_argument('--keep-images', action='store_true', help='Preserve image references in output')
    parser.add_argument('--overwrite', action='store_true', help='Overwrite existing output files')
    parser.add_argument(
        '--timeout', type=int, default=300,
        help='Conversion timeout in seconds per file (default: 300)',
    )
    parser.add_argument(
        '-v', '--verbose', action='store_true',
        help='Enable verbose/debug logging',
    )

    args = parser.parse_args()

    # Configure logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level, format=LOG_FORMAT)

    input_path = Path(args.input).resolve()

    if args.batch or input_path.is_dir():
        args.batch = True
        process_batch(args)
    else:
        process_single(args)


if __name__ == '__main__':
    main()
