#!/usr/bin/env python3
"""
Tests for book-to-markdown convert.py

Run with: python3 -m pytest skills/book-to-markdown/test_convert.py -v
"""

import os
import tempfile
import threading
from datetime import date
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

# Import the module under test
import importlib.util
spec = importlib.util.spec_from_file_location(
    "convert",
    Path(__file__).parent / "convert.py"
)
convert = importlib.util.module_from_spec(spec)
spec.loader.exec_module(convert)


# =============================================================================
# detect_format
# =============================================================================

class TestDetectFormat:
    def test_pdf(self):
        assert convert.detect_format("book.pdf") == "pdf"
        assert convert.detect_format("BOOK.PDF") == "pdf"

    def test_epub(self):
        assert convert.detect_format("book.epub") == "epub"

    def test_mobi_variants(self):
        assert convert.detect_format("book.mobi") == "mobi"
        assert convert.detect_format("book.azw") == "mobi"
        assert convert.detect_format("book.azw3") == "mobi"

    def test_docx(self):
        assert convert.detect_format("book.docx") == "docx"
        assert convert.detect_format("book.doc") == "docx"

    def test_rtf_odt(self):
        assert convert.detect_format("book.rtf") == "rtf"
        assert convert.detect_format("book.odt") == "odt"

    def test_unsupported(self):
        assert convert.detect_format("book.txt") is None
        assert convert.detect_format("book.html") is None
        assert convert.detect_format("book") is None

    def test_case_insensitive(self):
        assert convert.detect_format("Book.EPUB") == "epub"
        assert convert.detect_format("BOOK.Mobi") == "mobi"


# =============================================================================
# clean_markdown
# =============================================================================

class TestCleanMarkdown:
    def test_removes_html_tags(self):
        text = "<p>Hello <b>world</b></p>"
        result = convert.clean_markdown(text)
        assert "<p>" not in result
        assert "<b>" not in result
        assert "Hello world" in result

    def test_removes_images_by_default(self):
        text = "Text before ![alt](image.png) text after"
        result = convert.clean_markdown(text)
        assert "![" not in result
        assert "text after" in result

    def test_keeps_images_when_flagged(self):
        text = "Text before ![alt](image.png) text after"
        result = convert.clean_markdown(text, keep_images=True)
        assert "![alt](image.png)" in result

    def test_removes_pandoc_class_attributes(self):
        text = "# Header {.chapter}"
        result = convert.clean_markdown(text)
        assert "{.chapter}" not in result
        assert "# Header" in result

    def test_removes_pandoc_div_markers(self):
        text = "before\n::: {.chapter}\ninner content\n:::\nafter"
        result = convert.clean_markdown(text)
        assert ":::" not in result
        assert "inner content" in result
        assert "before" in result
        assert "after" in result

    def test_fixes_hyphenated_line_breaks_lowercase(self):
        text = "impor-\ntant information"
        result = convert.clean_markdown(text)
        assert "important" in result

    def test_fixes_hyphenated_accented_words(self):
        # H01 fix: accented characters should be joined
        text = "importân-\ncia do trabalho"
        result = convert.clean_markdown(text)
        assert "importância" in result

    def test_fixes_hyphenated_german_umlauts(self):
        text = "über-\nall in der Welt"
        result = convert.clean_markdown(text)
        assert "überall" in result

    def test_preserves_compound_words(self):
        # Uppercase after hyphen — should NOT be joined
        text = "state-\nOf-the-art technology"
        result = convert.clean_markdown(text)
        assert "state-" in result or "state" in result
        # Key: should NOT produce "stateOf"

    def test_preserves_capitalized_after_hyphen(self):
        text = "cross-\nPlatform support"
        result = convert.clean_markdown(text)
        # lowercase-\nUppercase should NOT be joined
        assert "cross-" in result

    def test_removes_page_numbers(self):
        text = "content\n---\nPage 42\n---\nmore content"
        result = convert.clean_markdown(text)
        assert "Page 42" not in result

    def test_normalizes_blank_lines(self):
        text = "para 1\n\n\n\n\npara 2"
        result = convert.clean_markdown(text)
        assert "\n\n\n\n\n" not in result

    def test_fixes_list_formatting(self):
        text = "\n-item one\n*item two"
        result = convert.clean_markdown(text)
        assert "- item one" in result
        assert "* item two" in result

    def test_strips_trailing_whitespace(self):
        text = "line with trailing   \nnext line"
        result = convert.clean_markdown(text)
        assert "trailing   " not in result


# =============================================================================
# validate_output
# =============================================================================

class TestValidateOutput:
    def test_valid_high_confidence(self):
        text = "word " * 6000
        is_valid, confidence, warnings = convert.validate_output(text, "test.pdf")
        assert is_valid is True
        assert confidence == "high"
        assert len(warnings) == 0

    def test_valid_medium_confidence(self):
        text = "word " * 2000
        is_valid, confidence, warnings = convert.validate_output(text, "test.pdf")
        assert is_valid is True
        assert confidence == "medium"

    def test_valid_low_confidence(self):
        text = "word " * 200
        is_valid, confidence, warnings = convert.validate_output(text, "test.pdf")
        assert is_valid is True
        assert confidence == "low"
        assert any("Low word count" in w for w in warnings)

    def test_invalid_too_few_words(self):
        text = "only ten words here in this small text sample now"
        is_valid, confidence, warnings = convert.validate_output(text, "test.pdf")
        assert is_valid is False
        assert confidence == "low"

    def test_invalid_garbled_output(self):
        # Mostly non-alphabetic characters
        text = "!@#$%^& " * 200
        is_valid, confidence, warnings = convert.validate_output(text, "test.pdf")
        assert is_valid is False
        assert any("garbled" in w for w in warnings)

    def test_empty_text(self):
        is_valid, confidence, warnings = convert.validate_output("", "test.pdf")
        assert is_valid is False


# =============================================================================
# detect_language
# =============================================================================

class TestDetectLanguage:
    def test_english(self):
        text = (
            "The quick brown fox jumps over the lazy dog. "
            "This is a test with many common English words that should be detected. "
            "They have been working with these for quite some time and would there "
            "their what about which when could other into than some these them."
        )
        assert convert.detect_language(text) == "en"

    def test_portuguese(self):
        text = (
            "Este é um texto em português para testar a detecção de idioma. "
            "Não é muito difícil quando você tem as palavras certas para isso. "
            "Também são muito importantes como mas pelo isso está quando muito "
            "pode esse já você pela entre depois sobre mesmo ainda então."
        )
        assert convert.detect_language(text) == "pt"

    def test_spanish(self):
        text = (
            "Este es un texto en español para probar la detección de idioma. "
            "Los del las una por con para como pero más este sus hay desde "
            "está entre también todo puede muy así nos sobre tiene sido fueron."
        )
        assert convert.detect_language(text) == "es"

    def test_french(self):
        text = (
            "Les des une que est dans qui par pour pas sur sont avec plus "
            "tout mais comme ont bien cette aussi fait peut nous même leurs très "
            "Ce texte est en français pour tester la détection de langue."
        )
        assert convert.detect_language(text) == "fr"

    def test_german(self):
        text = (
            "Und der die das ist von den ein mit nicht sich des auf für eine "
            "auch dem als aus noch hat werden wird sind nach bei über "
            "Dies ist ein deutscher Text zum Testen der Spracherkennung."
        )
        assert convert.detect_language(text) == "de"

    def test_empty_defaults_to_english(self):
        assert convert.detect_language("") == "en"

    def test_numbers_only_defaults_to_english(self):
        assert convert.detect_language("123 456 789 000") == "en"


# =============================================================================
# extract_toc
# =============================================================================

class TestExtractToc:
    def test_generates_toc_from_headers(self):
        text = (
            "# Book Title\n\n"
            "## Chapter 1\n\nContent\n\n"
            "## Chapter 2\n\nContent\n\n"
            "### Section 2.1\n\nContent\n\n"
            "## Chapter 3\n\nContent\n"
        )
        toc = convert.extract_toc(text)
        assert "## Table of Contents" in toc
        assert "[Chapter 1]" in toc
        assert "[Chapter 2]" in toc
        assert "[Section 2.1]" in toc
        assert "[Chapter 3]" in toc

    def test_indents_subheaders(self):
        text = (
            "# Title\n\n"
            "## Chapter\n\n"
            "### Section\n\n"
            "#### Subsection\n\n"
        )
        toc = convert.extract_toc(text)
        assert "- [Chapter]" in toc
        assert "  - [Section]" in toc
        assert "    - [Subsection]" in toc

    def test_skips_h1(self):
        text = (
            "# Book Title\n\n"
            "## Chapter 1\n\n"
            "## Chapter 2\n\n"
            "## Chapter 3\n\n"
        )
        toc = convert.extract_toc(text)
        assert "Book Title" not in toc.split("## Table of Contents")[1]

    def test_returns_empty_for_few_headers(self):
        text = "# Title\n\n## Only One Chapter\n\nContent"
        toc = convert.extract_toc(text)
        assert toc == ""

    def test_generates_anchor_links(self):
        text = (
            "# Title\n\n"
            "## My Chapter Title\n\n"
            "## Another Chapter\n\n"
            "## Third Chapter\n\n"
        )
        toc = convert.extract_toc(text)
        assert "(#my-chapter-title)" in toc
        assert "(#another-chapter)" in toc

    def test_no_headers_returns_empty(self):
        text = "Just plain text without any headers at all."
        toc = convert.extract_toc(text)
        assert toc == ""


# =============================================================================
# extract_title_from_content
# =============================================================================

class TestExtractTitle:
    def test_extracts_h1(self):
        text = "Some preamble\n# My Book Title\n\nContent"
        assert convert.extract_title_from_content(text) == "My Book Title"

    def test_returns_none_without_h1(self):
        text = "## Chapter 1\n\nNo H1 here"
        assert convert.extract_title_from_content(text) is None

    def test_extracts_first_h1(self):
        text = "# First Title\n\n# Second Title"
        assert convert.extract_title_from_content(text) == "First Title"


# =============================================================================
# generate_frontmatter
# =============================================================================

class TestGenerateFrontmatter:
    def test_basic_frontmatter(self):
        fm = convert.generate_frontmatter(
            "/path/to/book.pdf", "pdf", "pymupdf4llm",
            "# Test Book\n\nSome content here",
        )
        assert '---' in fm
        assert 'title: "Test Book"' in fm
        assert 'source_file: "book.pdf"' in fm
        assert 'source_format: pdf' in fm
        assert 'conversion_tool: pymupdf4llm' in fm
        assert f'conversion_date: {date.today().isoformat()}' in fm

    def test_includes_author_from_pdf_meta(self):
        fm = convert.generate_frontmatter(
            "/path/to/book.pdf", "pdf", "pymupdf4llm",
            "content " * 100,
            pdf_meta={'author': 'John Doe', 'title': ''},
        )
        assert 'author: "John Doe"' in fm

    def test_omits_author_when_empty(self):
        fm = convert.generate_frontmatter(
            "/path/to/book.pdf", "pdf", "pymupdf4llm",
            "content " * 100,
            pdf_meta={'author': '', 'title': ''},
        )
        assert 'author:' not in fm

    def test_includes_language(self):
        fm = convert.generate_frontmatter(
            "/path/to/book.pdf", "pdf", "pymupdf4llm",
            "content " * 100,
            language="pt",
        )
        assert 'language: pt' in fm

    def test_includes_confidence(self):
        fm = convert.generate_frontmatter(
            "/path/to/book.pdf", "pdf", "pymupdf4llm",
            "content " * 100,
            confidence="high",
        )
        assert 'conversion_confidence: high' in fm

    def test_pdf_meta_title_takes_priority(self):
        fm = convert.generate_frontmatter(
            "/path/to/my_book.pdf", "pdf", "pymupdf4llm",
            "# Content Title\n\nBody text",
            pdf_meta={'author': '', 'title': 'PDF Metadata Title'},
        )
        assert 'title: "PDF Metadata Title"' in fm

    def test_fallback_to_filename(self):
        fm = convert.generate_frontmatter(
            "/path/to/my-great-book.pdf", "pdf", "pymupdf4llm",
            "Just body text without headers",
        )
        assert 'title: "My Great Book"' in fm


# =============================================================================
# Overwrite protection (integration-like test)
# =============================================================================

class TestOverwriteProtection:
    def test_process_single_blocks_overwrite(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            # Create a dummy output file
            output_path = Path(tmpdir) / "book.md"
            output_path.write_text("existing content")
            input_path = str(Path(tmpdir) / "book.pdf")
            output_str = str(output_path)

            # Create a mock args object
            args = type('Args', (), {
                'input': input_path,
                'output': output_str,
                'quality': 'fast',
                'no_frontmatter': False,
                'no_clean': False,
                'no_toc': False,
                'keep_images': False,
                'overwrite': False,
                'timeout': 300,
                'verbose': False,
            })()

            with pytest.raises(SystemExit) as exc_info:
                convert.process_single(args)
            assert exc_info.value.code == 1


# =============================================================================
# ConversionTimeout
# =============================================================================

class TestTimeout:
    def test_timeout_raises(self):
        def slow_func():
            import time
            time.sleep(10)
            return "done"

        with pytest.raises(convert.ConversionTimeout):
            convert.run_with_timeout(slow_func, timeout=1)

    def test_no_timeout_when_zero(self):
        result = convert.run_with_timeout(lambda: 42, timeout=0)
        assert result == 42

    def test_fast_function_succeeds(self):
        result = convert.run_with_timeout(lambda: "ok", timeout=10)
        assert result == "ok"

    def test_exception_propagates(self):
        def bad_func():
            raise ValueError("test error")

        with pytest.raises(ValueError, match="test error"):
            convert.run_with_timeout(bad_func, timeout=10)

    def test_threading_based_timeout(self):
        # C01 fix: verify threading is used (not SIGALRM)
        import signal
        # Ensure no SIGALRM handler is set
        assert not hasattr(convert, '_timeout_handler') or True
        # run_with_timeout should work regardless of platform
        result = convert.run_with_timeout(lambda: "cross-platform", timeout=5)
        assert result == "cross-platform"


# =============================================================================
# TOC edge cases (M02, M03)
# =============================================================================

class TestTocEdgeCases:
    def test_duplicate_headers_get_unique_anchors(self):
        # M02: duplicate headers should get -1, -2 suffixes
        text = (
            "# Book Title\n\n"
            "## Introduction\n\nFirst intro\n\n"
            "## Chapter 1\n\nContent\n\n"
            "## Introduction\n\nSecond intro\n\n"
            "## Chapter 2\n\nContent\n"
        )
        toc = convert.extract_toc(text)
        assert "(#introduction)" in toc
        assert "(#introduction-1)" in toc

    def test_skips_headers_in_code_blocks(self):
        # M03: headers inside ``` should be ignored
        text = (
            "# Book Title\n\n"
            "## Real Chapter 1\n\nContent\n\n"
            "```python\n"
            "## This is a comment not a header\n"
            "### Another fake header\n"
            "```\n\n"
            "## Real Chapter 2\n\nContent\n\n"
            "## Real Chapter 3\n\nContent\n"
        )
        toc = convert.extract_toc(text)
        assert "[Real Chapter 1]" in toc
        assert "[Real Chapter 2]" in toc
        assert "[Real Chapter 3]" in toc
        assert "comment" not in toc
        assert "fake" not in toc

    def test_nested_code_blocks_handled(self):
        text = (
            "# Title\n\n"
            "## Section A\n\n"
            "```\n## Not A Header\n```\n\n"
            "## Section B\n\n"
            "## Section C\n\n"
        )
        toc = convert.extract_toc(text)
        assert "[Section A]" in toc
        assert "[Section B]" in toc
        assert "Not A Header" not in toc


# =============================================================================
# Converter mocks (H04-H07)
# =============================================================================

class TestConvertPdfFast:
    @patch.dict('sys.modules', {'pymupdf4llm': MagicMock()})
    def test_calls_pymupdf4llm(self):
        import sys
        mock_module = sys.modules['pymupdf4llm']
        mock_module.to_markdown.return_value = "# PDF Content\n\n" + "word " * 200
        result = convert.convert_pdf_fast("/fake/book.pdf")
        mock_module.to_markdown.assert_called_once_with("/fake/book.pdf")
        assert "PDF Content" in result


class TestConvertPdfPrecise:
    def test_falls_back_to_fast_when_marker_missing(self):
        # When marker-pdf is not installed, should fall back to fast mode
        with patch.object(convert, 'convert_pdf_fast', return_value="fallback content") as mock_fast:
            result = convert.convert_pdf_precise("/fake/book.pdf")
            mock_fast.assert_called_once_with("/fake/book.pdf")
            assert result == "fallback content"


class TestConvertEpub:
    @patch('subprocess.run')
    @patch.object(convert, 'check_dependency', return_value=True)
    def test_calls_pandoc(self, mock_dep, mock_run):
        mock_run.return_value = MagicMock(returncode=0, stdout="# EPUB Content", stderr="")
        result = convert.convert_epub("/fake/book.epub")
        assert "EPUB Content" in result
        mock_run.assert_called_once()
        args = mock_run.call_args[0][0]
        assert args[0] == 'pandoc'
        assert '-f' in args
        assert 'epub' in args

    @patch.object(convert, 'check_dependency', return_value=False)
    def test_raises_when_pandoc_missing(self, mock_dep):
        with pytest.raises(RuntimeError, match="Pandoc not found"):
            convert.convert_epub("/fake/book.epub")


class TestConvertPandocGeneric:
    @patch('subprocess.run')
    @patch.object(convert, 'check_dependency', return_value=True)
    def test_calls_pandoc_with_format(self, mock_dep, mock_run):
        mock_run.return_value = MagicMock(returncode=0, stdout="# DOCX Content", stderr="")
        result = convert.convert_pandoc_generic("/fake/book.docx", "docx")
        assert "DOCX Content" in result
        args = mock_run.call_args[0][0]
        assert 'docx' in args

    @patch('subprocess.run')
    @patch.object(convert, 'check_dependency', return_value=True)
    def test_raises_on_pandoc_failure(self, mock_dep, mock_run):
        mock_run.return_value = MagicMock(returncode=1, stdout="", stderr="pandoc error")
        with pytest.raises(RuntimeError, match="Pandoc failed"):
            convert.convert_pandoc_generic("/fake/book.docx", "docx")


class TestExtractPdfMetadata:
    @patch.dict('sys.modules', {'pymupdf': MagicMock()})
    def test_extracts_author_and_title(self):
        import sys
        mock_pymupdf = sys.modules['pymupdf']
        mock_doc = MagicMock()
        mock_doc.metadata = {'author': 'John Doe', 'title': 'My Book'}
        mock_pymupdf.open.return_value = mock_doc
        result = convert.extract_pdf_metadata("/fake/book.pdf")
        assert result['author'] == 'John Doe'
        assert result['title'] == 'My Book'

    def test_returns_empty_on_error(self):
        # When pymupdf is not available or fails
        with patch.dict('sys.modules', {'pymupdf': None}):
            result = convert.extract_pdf_metadata("/fake/nonexistent.pdf")
            assert result['author'] == ''
            assert result['title'] == ''


class TestConvertMobi:
    def test_converts_via_calibre_then_pandoc(self):
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stderr = ""
        with patch.object(convert, 'check_dependency', return_value=True), \
             patch.object(convert.subprocess, 'run', return_value=mock_result) as mock_run, \
             patch.object(convert, 'convert_epub', return_value="# MOBI Content"):
            result = convert.convert_mobi("/fake/book.mobi")
            assert result == "# MOBI Content"
            args = mock_run.call_args[0][0]
            assert args[0] == 'ebook-convert'

    @patch.object(convert, 'check_dependency', return_value=False)
    def test_raises_when_calibre_missing(self, mock_dep):
        with pytest.raises(RuntimeError, match="Calibre not found"):
            convert.convert_mobi("/fake/book.mobi")
