#!/usr/bin/env python3
"""Custom exceptions for the transcription pipeline.

Hierarchy:
    TranscriptionError
    ├── NoSubtitlesError      — YouTube video has no captions available
    ├── DownloadFailedError   — Platform download (Hotmart/Cademi) failed
    ├── InvalidMediaFileError — File is not a valid audio/video file
    └── FileTooLargeError     — File exceeds size limit for uncompressed upload
"""


class TranscriptionError(Exception):
    """Base exception for all transcription pipeline errors."""
    pass


class NoSubtitlesError(TranscriptionError):
    """Raised when a YouTube video has no available captions after all fallbacks."""

    def __init__(self, url, title=None):
        self.url = url
        self.title = title
        msg = f'No captions found for: {title or url}'
        super().__init__(msg)


class DownloadFailedError(TranscriptionError):
    """Raised when a platform download (Hotmart/Cademi) fails."""

    def __init__(self, platform, stderr=None):
        self.platform = platform
        self.stderr = stderr
        msg = f'{platform} download failed'
        if stderr:
            msg += f': {stderr[:300]}'
        super().__init__(msg)


class InvalidMediaFileError(TranscriptionError):
    """Raised when a file is not a valid audio/video file (ffprobe validation)."""

    def __init__(self, path, reason=None):
        self.path = str(path)
        msg = f'Not a valid media file: {path}'
        if reason:
            msg += f' ({reason})'
        super().__init__(msg)


class FileTooLargeError(TranscriptionError):
    """Raised when an uncompressed file exceeds the size limit for API upload."""

    def __init__(self, path, size_bytes, limit_bytes):
        self.path = str(path)
        self.size_bytes = size_bytes
        self.limit_bytes = limit_bytes
        size_mb = size_bytes / (1024 * 1024)
        limit_mb = limit_bytes / (1024 * 1024)
        super().__init__(f'File too large: {path} ({size_mb:.0f}MB > {limit_mb:.0f}MB limit)')
