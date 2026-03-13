#!/usr/bin/env python3
"""Deepgram API transcription engine.

Uses Deepgram Nova-3 for fast, parallel audio transcription.
Features: parallel workers, retry, resume.
Zero external dependencies — uses urllib for API calls.

Pricing: ~$0.0043/min (~R$2.50/hora)
"""

import json
import os
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path
from queue import Queue

from . import audio as audio_mod

API_URL = 'https://api.deepgram.com/v1/listen'
MODEL = 'nova-3'
MAX_RETRIES = 3
RETRY_BACKOFF = [5, 10, 30]


def load_api_key():
    """Load Deepgram API key from .env files or environment.

    Priority:
    1. .aios/skills/deepgram-transcriber/.env
    2. .aios/skills/groq-transcriber/.env (shared file)
    3. Environment variable DEEPGRAM_API_KEY
    """
    env_paths = [
        Path(__file__).parent.parent.parent.parent / '.aios' / 'skills' / 'deepgram-transcriber' / '.env',
        Path(__file__).parent.parent.parent.parent / '.aios' / 'skills' / 'groq-transcriber' / '.env',
    ]

    for env_path in env_paths:
        if env_path.exists():
            try:
                content = env_path.read_text(encoding='utf-8')
                for line in content.strip().split('\n'):
                    line = line.strip()
                    if line.startswith('DEEPGRAM_API_KEY='):
                        key = line.split('=', 1)[1].strip()
                        if key:
                            return key
            except OSError:
                pass

    return os.environ.get('DEEPGRAM_API_KEY', '')


class DeepgramEngine:
    """Deepgram Nova-3 transcription engine with parallel workers."""

    def __init__(self, api_key=None, language='pt-BR', workers=3):
        self.api_key = api_key or load_api_key()
        if not self.api_key:
            raise ValueError(
                'No Deepgram API key found.\n'
                '  Configure in: .aios/skills/deepgram-transcriber/.env\n'
                '  Format: DEEPGRAM_API_KEY=your_key_here\n'
                '  Or set DEEPGRAM_API_KEY environment variable.'
            )
        self.language = language
        self.workers = workers

    @property
    def engine_name(self):
        return f'deepgram-{MODEL}'

    def transcribe_file(self, file_path, compress=True, bitrate='64k'):
        """Transcribe a single audio/video file.

        Args:
            file_path: path to audio/video file
            compress: if True, compress audio before upload
            bitrate: compression bitrate

        Returns:
            dict with keys: text, language, duration_seconds, engine
        """
        file_path = Path(file_path)
        duration = audio_mod.get_duration(file_path)

        # Compress if needed
        upload_path = file_path
        compressed = None
        if compress:
            try:
                compressed = audio_mod.compress_audio(file_path, bitrate=bitrate)
                upload_path = compressed
            except RuntimeError as e:
                file_size = file_path.stat().st_size
                max_uncompressed = 500 * 1024 * 1024  # 500MB
                if file_size > max_uncompressed:
                    from .exceptions import FileTooLargeError
                    raise FileTooLargeError(file_path, file_size, max_uncompressed) from e
                print(f'  WARNING: Compression failed, using original: {e}')

        try:
            text = self._api_call(upload_path)

            return {
                'text': text,
                'language': self.language,
                'duration_seconds': duration,
                'engine': self.engine_name,
            }
        finally:
            if compressed and compressed != file_path:
                try:
                    compressed.unlink(missing_ok=True)
                except OSError:
                    pass

    def transcribe_batch(self, file_paths, compress=True, bitrate='64k'):
        """Transcribe multiple files in parallel.

        Args:
            file_paths: list of file paths
            compress: if True, compress audio before upload
            bitrate: compression bitrate

        Returns:
            dict mapping file_path -> result dict (or error string)
        """
        results = {}
        queue = Queue()

        for fp in file_paths:
            queue.put(fp)

        def worker():
            while not queue.empty():
                try:
                    fp = queue.get_nowait()
                except Exception:
                    break

                try:
                    result = self.transcribe_file(fp, compress=compress, bitrate=bitrate)
                    results[str(fp)] = result
                except Exception as e:
                    results[str(fp)] = {'error': str(e)}
                finally:
                    queue.task_done()

        threads = []
        num_workers = min(self.workers, len(file_paths))
        for _ in range(num_workers):
            t = threading.Thread(target=worker, daemon=True)
            t.start()
            threads.append(t)

        for t in threads:
            t.join()

        return results

    def _api_call(self, file_path):
        """Make API call to Deepgram.

        Returns:
            Transcription text string.
        """
        file_path = Path(file_path)
        file_data = file_path.read_bytes()

        # Build query params
        params = {
            'model': MODEL,
            'language': self.language,
            'smart_format': 'true',
            'paragraphs': 'true',
            'punctuate': 'true',
        }
        query_str = '&'.join(f'{k}={v}' for k, v in params.items())
        url = f'{API_URL}?{query_str}'

        for attempt in range(MAX_RETRIES + 1):
            try:
                req = urllib.request.Request(
                    url,
                    data=file_data,
                    headers={
                        'Authorization': f'Token {self.api_key}',
                        'Content-Type': 'audio/mpeg',
                        'User-Agent': 'AIOS-Transcriber/1.0',
                    },
                    method='POST',
                )

                with urllib.request.urlopen(req, timeout=600) as resp:
                    result = json.loads(resp.read().decode('utf-8'))

                # Extract text from Deepgram response
                channels = result.get('results', {}).get('channels', [])
                if not channels:
                    return ''

                alternatives = channels[0].get('alternatives', [])
                if not alternatives:
                    return ''

                # Use paragraphs if available
                paragraphs = alternatives[0].get('paragraphs', {})
                if paragraphs and paragraphs.get('paragraphs'):
                    texts = []
                    for para in paragraphs['paragraphs']:
                        sentences = [s.get('text', '') for s in para.get('sentences', [])]
                        texts.append(' '.join(sentences))
                    return '\n\n'.join(texts)

                # Fallback to transcript
                return alternatives[0].get('transcript', '')

            except urllib.error.HTTPError as e:
                error_body = ''
                try:
                    error_body = e.read().decode('utf-8', errors='replace')
                except Exception:
                    pass

                if e.code == 401 or e.code == 403:
                    raise RuntimeError(f'Deepgram API auth error ({e.code}). Check your API key.') from e
                elif e.code == 429:
                    if attempt < MAX_RETRIES:
                        wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
                        print(f'  Rate limited, retrying in {wait}s...')
                        time.sleep(wait)
                        continue
                    raise RuntimeError(f'Deepgram rate limit after {MAX_RETRIES} retries') from e
                else:
                    raise RuntimeError(f'Deepgram API error {e.code}: {error_body[:300]}') from e

            except urllib.error.URLError as e:
                if attempt < MAX_RETRIES:
                    wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
                    print(f'  Network error, retrying in {wait}s: {e}')
                    time.sleep(wait)
                    continue
                raise RuntimeError(f'Network error after {MAX_RETRIES} retries: {e}') from e

        raise RuntimeError(f'Failed after {MAX_RETRIES} retries')
