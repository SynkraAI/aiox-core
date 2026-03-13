#!/usr/bin/env python3
"""Audio compression and extraction via ffmpeg.

Compresses audio to MP3 mono 16kHz at configurable bitrate.
Whisper uses 16kHz mono internally, so no quality loss for transcription.
Typical reduction: 80-95% of original file size.
"""

import json
import subprocess
import tempfile
from pathlib import Path


def compress_audio(input_path, output_path=None, bitrate='64k'):
    """Compress audio file to MP3 mono 16kHz.

    Args:
        input_path: path to input audio/video file
        output_path: path for compressed output. If None, creates temp file.
        bitrate: audio bitrate (default: 64k)

    Returns:
        Path to compressed file.

    Raises:
        RuntimeError: if ffmpeg fails
    """
    input_path = Path(input_path)

    if output_path is None:
        suffix = '.mp3'
        tmp = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
        output_path = Path(tmp.name)
        tmp.close()
    else:
        output_path = Path(output_path)

    cmd = [
        'ffmpeg', '-i', str(input_path),
        '-vn',              # no video
        '-ac', '1',         # mono
        '-ar', '16000',     # 16kHz sample rate
        '-b:a', bitrate,    # bitrate
        '-f', 'mp3',        # force mp3 format
        '-y',               # overwrite
        str(output_path),
    ]

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(f'ffmpeg compression failed: {result.stderr[:500]}')

    original_size = input_path.stat().st_size
    compressed_size = output_path.stat().st_size
    reduction = (1 - compressed_size / original_size) * 100 if original_size > 0 else 0

    print(f'  Compressed: {_format_size(original_size)} -> {_format_size(compressed_size)} ({reduction:.0f}% reduction)')

    return output_path


def get_duration(file_path):
    """Get audio/video duration in seconds using ffprobe.

    Returns:
        Duration in seconds (float), or 0 if detection fails.
    """
    cmd = [
        'ffprobe',
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        str(file_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)
        return float(data.get('format', {}).get('duration', 0))
    except (subprocess.CalledProcessError, json.JSONDecodeError, ValueError):
        return 0


def extract_audio(video_path, output_path=None):
    """Extract audio track from video file without re-encoding.

    Args:
        video_path: path to video file
        output_path: path for audio output. If None, creates temp .m4a file.

    Returns:
        Path to extracted audio file.
    """
    video_path = Path(video_path)

    if output_path is None:
        tmp = tempfile.NamedTemporaryFile(suffix='.m4a', delete=False)
        output_path = Path(tmp.name)
        tmp.close()
    else:
        output_path = Path(output_path)

    cmd = [
        'ffmpeg', '-i', str(video_path),
        '-vn',           # no video
        '-acodec', 'copy',  # copy audio stream (no re-encoding)
        '-y',
        str(output_path),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise RuntimeError(f'Audio extraction failed: {result.stderr[:500]}')

    return output_path


def is_audio_file(path):
    """Check if a file is an audio/video file by extension."""
    audio_exts = {'.mp3', '.m4a', '.wav', '.flac', '.ogg', '.wma', '.aac', '.opus'}
    video_exts = {'.mp4', '.mkv', '.avi', '.mov', '.webm', '.wmv', '.flv'}
    return Path(path).suffix.lower() in audio_exts | video_exts


def validate_media_file(path):
    """Validate that a file is a real audio/video file using ffprobe.

    Checks both file extension AND actual media content via ffprobe.
    Catches cases like a .txt file renamed to .mp3.

    Args:
        path: path to the file to validate

    Returns:
        True if valid media file.

    Raises:
        InvalidMediaFileError: if ffprobe cannot parse the file.
    """
    from .exceptions import InvalidMediaFileError

    path = Path(path)

    if not path.exists():
        raise InvalidMediaFileError(path, 'file not found')

    if not is_audio_file(path):
        raise InvalidMediaFileError(path, f'unsupported extension: {path.suffix}')

    result = subprocess.run(
        ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', str(path)],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise InvalidMediaFileError(path, 'ffprobe validation failed')

    try:
        data = json.loads(result.stdout)
        if not data.get('format', {}).get('format_name'):
            raise InvalidMediaFileError(path, 'no format detected by ffprobe')
    except json.JSONDecodeError:
        raise InvalidMediaFileError(path, 'ffprobe returned invalid JSON')

    return True


def _format_size(size_bytes):
    """Format bytes to human readable string."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f'{size_bytes:.1f}{unit}'
        size_bytes /= 1024
    return f'{size_bytes:.1f}TB'
