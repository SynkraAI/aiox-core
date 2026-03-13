#!/usr/bin/env python3
"""Split large audio files into chunks for API upload.

Groq limit: 25MB per request (we use 24MB as safe threshold).
Deepgram limit: 2GB per request.

Splits by duration (10-minute chunks) using ffmpeg.
"""

import logging
import subprocess
import tempfile
from pathlib import Path

from . import audio as audio_mod

logger = logging.getLogger('aios-transcriber')

# Thresholds in bytes
GROQ_MAX_SIZE = 24 * 1024 * 1024       # 24MB
DEEPGRAM_MAX_SIZE = 2 * 1024 * 1024 * 1024  # 2GB
CHUNK_DURATION_SECONDS = 600             # 10 minutes per chunk


def needs_splitting(file_path, engine='groq'):
    """Check if file exceeds size limit for given engine.

    Returns:
        True if file needs to be split.
    """
    size = Path(file_path).stat().st_size
    max_size = GROQ_MAX_SIZE if engine == 'groq' else DEEPGRAM_MAX_SIZE
    return size > max_size


def split_audio(file_path, chunk_duration=CHUNK_DURATION_SECONDS):
    """Split audio file into chunks of specified duration.

    Args:
        file_path: path to audio file
        chunk_duration: duration per chunk in seconds (default: 600 = 10min)

    Returns:
        List of Path objects for each chunk, sorted by order.
    """
    file_path = Path(file_path)
    total_duration = audio_mod.get_duration(file_path)

    if total_duration <= 0:
        logger.warning('Could not detect duration, returning file as-is')
        return [file_path]

    num_chunks = int(total_duration // chunk_duration) + (1 if total_duration % chunk_duration > 0 else 0)

    if num_chunks <= 1:
        return [file_path]

    logger.info(f'Splitting into {num_chunks} chunks ({chunk_duration}s each)...')

    tmp_dir = Path(tempfile.mkdtemp(prefix='aios-split-'))
    chunks = []

    for i in range(num_chunks):
        start = i * chunk_duration
        chunk_path = tmp_dir / f'chunk-{i:03d}{file_path.suffix}'

        cmd = [
            'ffmpeg', '-i', str(file_path),
            '-ss', str(start),
            '-t', str(chunk_duration),
            '-c', 'copy',  # no re-encoding
            '-y',
            str(chunk_path),
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode != 0:
            logger.warning(f'Failed to create chunk {i}: {result.stderr[:200]}')
            continue

        if chunk_path.exists() and chunk_path.stat().st_size > 0:
            chunks.append(chunk_path)

    logger.info(f'Created {len(chunks)} chunks in {tmp_dir}')
    return chunks


def cleanup_chunks(chunks):
    """Remove temporary chunk files and their parent directory."""
    if not chunks:
        return

    parent = chunks[0].parent
    for chunk in chunks:
        try:
            chunk.unlink(missing_ok=True)
        except OSError:
            pass

    # Remove temp dir if empty
    try:
        if parent.name.startswith('aios-split-'):
            parent.rmdir()
    except OSError:
        pass
