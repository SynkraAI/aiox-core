#!/usr/bin/env python3
"""Standardized output formatter for all transcription engines.

Generates markdown with YAML frontmatter in a consistent format,
regardless of whether the source was YouTube captions, Groq API, or Deepgram API.
"""

import re
from datetime import datetime
from pathlib import Path


def slugify(text):
    """Convert text to filesystem-safe slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text[:80].strip('-')


def format_duration(seconds):
    """Format seconds into HH:MM:SS."""
    if not seconds:
        return '00:00:00'
    seconds = int(seconds)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f'{h:02d}:{m:02d}:{s:02d}'


def generate_markdown(data):
    """Generate markdown with YAML frontmatter from transcription data.

    Expected data dict keys:
        title: str - Title of the content
        source: str - URL or filepath of the source
        source_type: str - youtube_captions | groq_api | deepgram_api
        engine: str - Engine/model used
        language: str - Language code (e.g., pt-BR)
        duration: str - Duration in HH:MM:SS format
        text: str - The transcription text
        word_count: int - Number of words (optional, computed if missing)

    Optional keys (included in frontmatter if present):
        channel: str - YouTube channel name
        subtitle_type: str - manual | auto-generated
        date: str - Upload/creation date
    """
    word_count = data.get('word_count') or len(data.get('text', '').split())
    now = datetime.now().strftime('%Y-%m-%d %H:%M')

    # Build frontmatter
    fm_lines = ['---']
    fm_lines.append(f'title: "{_escape_yaml(data.get("title", "Untitled"))}"')

    if data.get('channel'):
        fm_lines.append(f'channel: "{_escape_yaml(data["channel"])}"')
    if data.get('date'):
        fm_lines.append(f'date: "{data["date"]}"')

    fm_lines.append(f'source: "{_escape_yaml(data.get("source", ""))}"')
    fm_lines.append(f'source_type: {data.get("source_type", "unknown")}')
    fm_lines.append(f'engine: {data.get("engine", "unknown")}')
    fm_lines.append(f'language: "{data.get("language", "")}"')

    if data.get('subtitle_type'):
        fm_lines.append(f'subtitle_type: "{data["subtitle_type"]}"')

    fm_lines.append(f'duration: "{data.get("duration", "00:00:00")}"')
    fm_lines.append(f'word_count: {word_count}')
    fm_lines.append(f'transcribed_at: "{now}"')
    fm_lines.append('---')

    frontmatter = '\n'.join(fm_lines)
    title = data.get('title', 'Untitled')
    text = data.get('text', '')

    return f'{frontmatter}\n\n# {title}\n\n{text}\n'


def save_markdown(data, output_dir, filename=None):
    """Save transcription data as markdown file.

    Args:
        data: dict with transcription data (see generate_markdown)
        output_dir: directory to save the file
        filename: optional filename (without extension). If None, uses slugified title.

    Returns:
        Path to the saved file.
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    if not filename:
        filename = slugify(data.get('title', 'untitled'))

    filepath = output_path / f'{filename}.md'
    content = generate_markdown(data)
    filepath.write_text(content, encoding='utf-8')
    return filepath


def _escape_yaml(text):
    """Escape special characters for YAML string values."""
    if not text:
        return ''
    return text.replace('"', '\\"')
