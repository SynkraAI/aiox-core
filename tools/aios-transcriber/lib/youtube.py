#!/usr/bin/env python3
"""YouTube fast path — extract captions without downloading video.

Wraps tools/youtube-captions/youtube_captions.py via subprocess.
This is the fastest transcription path: subtitles are extracted in seconds.
"""

import subprocess
import sys
from pathlib import Path

# Path to youtube-captions script (relative to aios-core root)
YOUTUBE_CAPTIONS_SCRIPT = Path(__file__).parent.parent.parent / 'youtube-captions' / 'youtube_captions.py'


def transcribe_youtube(url, output_dir, lang_priority=None, is_playlist=False):
    """Extract YouTube captions via youtube-captions tool.

    Args:
        url: YouTube video or playlist URL
        output_dir: directory to save output files
        lang_priority: list of language codes in priority order
        is_playlist: if True, treat as playlist URL

    Returns:
        True if successful, False otherwise
    """
    if not YOUTUBE_CAPTIONS_SCRIPT.exists():
        print(f'ERROR: youtube-captions script not found at {YOUTUBE_CAPTIONS_SCRIPT}')
        print('  Expected: tools/youtube-captions/youtube_captions.py')
        return False

    cmd = [sys.executable, str(YOUTUBE_CAPTIONS_SCRIPT)]

    if is_playlist:
        cmd.extend(['--playlist', url])
    else:
        cmd.append(url)

    cmd.extend(['-o', str(output_dir)])

    if lang_priority:
        for lang in lang_priority:
            cmd.extend(['-l', lang])

    cmd.extend(['--format', 'md'])

    print(f'Extracting YouTube captions (fast path, no download)...')
    try:
        result = subprocess.run(cmd, check=False)
        return result.returncode == 0
    except Exception as e:
        print(f'ERROR: Failed to run youtube-captions: {e}')
        return False
