"""
Gemini Flash 2.0 integration for materials analysis.

Uses Google's Gemini API (free tier: 1.5M tokens/month) to analyze
local materials without consuming Claude tokens.

This module provides cost-efficient analysis for:
- Large document sets (transcripts, PDFs, etc)
- Preliminary theme extraction
- Content summarization
- Initial cognitive analysis

Falls back gracefully when Gemini is unavailable.
"""

import os
from typing import List, Dict, Optional
from pathlib import Path


# Lazy import for Gemini (only when needed)
_gemini_imported = False
_genai = None


def _ensure_gemini_imported():
    """Lazy import of google.generativeai."""
    global _gemini_imported, _genai

    if _gemini_imported:
        return

    try:
        import google.generativeai as genai
        _genai = genai
        _gemini_imported = True
    except ImportError:
        raise ImportError(
            "google-generativeai package not installed. "
            "Install with: pip install google-generativeai"
        )


def is_gemini_available() -> bool:
    """
    Check if Gemini API is configured and available.

    Returns:
        True if GOOGLE_API_KEY is set and valid, False otherwise
    """
    api_key = os.getenv('GOOGLE_API_KEY')

    if not api_key or api_key == 'your-google-api-key-here':
        return False

    try:
        _ensure_gemini_imported()
        _genai.configure(api_key=api_key)
        return True
    except Exception:
        return False


def analyze_materials_batch(
    files: List[str],
    analysis_prompt: str,
    model_name: str = "gemini-2.0-flash-exp"
) -> Dict:
    """
    Analyze a batch of materials using Gemini Flash 2.0.

    This function is cost-efficient for large document sets:
    - Gemini Flash 2.0: Free tier 1.5M tokens/month
    - Much cheaper than Claude for bulk processing

    Args:
        files: List of file paths to analyze
        analysis_prompt: Analysis instruction (e.g., "Extract key themes from these transcripts")
        model_name: Gemini model to use (default: gemini-2.0-flash-exp)

    Returns:
        {
            'status': 'success' | 'error',
            'analysis': str,  # Generated analysis text
            'tokens_used': int,  # Total tokens consumed
            'model': str,  # Model used
            'files_processed': int  # Number of files analyzed
        }

    Example:
        >>> files = ["transcript1.txt", "transcript2.txt"]
        >>> prompt = "Extract the main cognitive patterns from these interviews"
        >>> result = analyze_materials_batch(files, prompt)
        >>> if result['status'] == 'success':
        >>>     print(result['analysis'])
    """
    if not is_gemini_available():
        return {
            'status': 'error',
            'error': 'Gemini API not configured. Set GOOGLE_API_KEY in .env file.',
            'suggestion': 'Get a free API key at: https://makersuite.google.com/app/apikey'
        }

    try:
        _ensure_gemini_imported()

        # Configure Gemini
        api_key = os.getenv('GOOGLE_API_KEY')
        _genai.configure(api_key=api_key)

        # Initialize model
        model = _genai.GenerativeModel(model_name)

        # Concatenate file contents
        combined_content = []
        files_processed = 0

        for file_path in files:
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    filename = Path(file_path).name
                    combined_content.append(f"\n\n--- FILE: {filename} ---\n{content}")
                    files_processed += 1
            except Exception as e:
                # Skip files that can't be read
                combined_content.append(f"\n\n--- FILE: {Path(file_path).name} (ERROR: {e}) ---")

        # Build full prompt
        full_prompt = f"{analysis_prompt}\n\n{''.join(combined_content)}"

        # Generate analysis
        response = model.generate_content(full_prompt)

        # Extract token usage
        tokens_used = 0
        if hasattr(response, 'usage_metadata'):
            tokens_used = response.usage_metadata.total_token_count

        return {
            'status': 'success',
            'analysis': response.text,
            'tokens_used': tokens_used,
            'model': model_name,
            'files_processed': files_processed
        }

    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'suggestion': 'Check API key validity and network connection'
        }


def analyze_single_file(
    file_path: str,
    analysis_prompt: str,
    model_name: str = "gemini-2.0-flash-exp"
) -> Dict:
    """
    Analyze a single file using Gemini.

    Convenience wrapper around analyze_materials_batch() for single files.

    Args:
        file_path: Path to file
        analysis_prompt: Analysis instruction
        model_name: Gemini model to use

    Returns:
        Same format as analyze_materials_batch()
    """
    return analyze_materials_batch([file_path], analysis_prompt, model_name)


def estimate_token_cost(files: List[str]) -> Dict:
    """
    Estimate token cost for analyzing a batch of files.

    Useful for planning before expensive operations.

    Args:
        files: List of file paths

    Returns:
        {
            'estimated_tokens': int,
            'gemini_cost_usd': float,  # Gemini Flash pricing
            'claude_cost_usd': float,  # Claude Sonnet pricing
            'savings_percent': float   # Savings using Gemini vs Claude
        }
    """
    total_chars = 0

    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                total_chars += len(f.read())
        except Exception:
            pass

    # Rough estimate: 4 chars per token
    estimated_tokens = total_chars // 4

    # Pricing (as of 2025)
    # Gemini Flash 2.0: Free tier 1.5M tokens/month, then $0.15/1M input
    # Claude Sonnet 4.5: $3.00/1M input
    gemini_cost = max(0, (estimated_tokens - 1_500_000) / 1_000_000 * 0.15)
    claude_cost = estimated_tokens / 1_000_000 * 3.00

    savings_percent = ((claude_cost - gemini_cost) / claude_cost * 100) if claude_cost > 0 else 0

    return {
        'estimated_tokens': estimated_tokens,
        'gemini_cost_usd': round(gemini_cost, 4),
        'claude_cost_usd': round(claude_cost, 4),
        'savings_percent': round(savings_percent, 1)
    }
