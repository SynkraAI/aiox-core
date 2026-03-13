#!/usr/bin/env python3
"""YouTube fast path — extract captions without downloading video.

Imports tools/youtube-captions/youtube_captions.py directly as a library.
This is the fastest transcription path: subtitles are extracted in seconds.
"""

import sys
from pathlib import Path

# Add youtube-captions to import path
_YT_CAPTIONS_DIR = str(Path(__file__).parent.parent.parent / 'youtube-captions')
if _YT_CAPTIONS_DIR not in sys.path:
    sys.path.insert(0, _YT_CAPTIONS_DIR)

from youtube_captions import extract_captions, extract_playlist  # noqa: E402


def transcribe_youtube(url, output_dir, lang_priority=None, is_playlist=False):
    """Extract YouTube captions via direct import of youtube-captions.

    Args:
        url: YouTube video or playlist URL
        output_dir: directory to save output files
        lang_priority: list of language codes in priority order
        is_playlist: if True, treat as playlist URL

    Returns:
        dict with caption data if successful (single video),
        list of dicts if playlist,
        None if no captions found.

    Raises:
        Exception: propagates errors with full stack trace.
    """
    print('Extracting YouTube captions (fast path, no download)...')

    if is_playlist:
        results = extract_playlist(url, str(output_dir), lang_priority)
        return results if results else None

    result = extract_captions(url, str(output_dir), lang_priority)
    return result
