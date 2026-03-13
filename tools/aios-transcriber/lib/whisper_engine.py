#!/usr/bin/env python3
"""Local Whisper transcription engine.

Uses the video-transcriber's Whisper setup (MLX/faster/openai) if available,
or falls back to calling whisper CLI directly.

This is the free, local alternative to Deepgram API.
Requires: whisper installed locally (pip install openai-whisper) or mlx-whisper.
"""

import json
import subprocess
import tempfile
from pathlib import Path

from . import audio as audio_mod


class WhisperEngine:
    """Local Whisper transcription engine."""

    def __init__(self, language='pt', model='medium'):
        self.language = language[:2] if len(language) > 2 else language  # Whisper uses 2-letter codes
        self.model = model
        self._check_whisper()

    @property
    def engine_name(self):
        return f'whisper-{self.model}'

    def _check_whisper(self):
        """Check if whisper is available."""
        # Try mlx-whisper first (Apple Silicon, fastest)
        result = subprocess.run(
            ['python3', '-c', 'import mlx_whisper'],
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            self._whisper_type = 'mlx'
            return

        # Try faster-whisper
        result = subprocess.run(
            ['python3', '-c', 'import faster_whisper'],
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            self._whisper_type = 'faster'
            return

        # Try openai whisper
        result = subprocess.run(
            ['python3', '-c', 'import whisper'],
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            self._whisper_type = 'openai'
            return

        # Try whisper CLI
        result = subprocess.run(
            ['which', 'whisper'],
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            self._whisper_type = 'cli'
            return

        raise RuntimeError(
            'Whisper not found. Install one of:\n'
            '  pip install mlx-whisper     (Apple Silicon, fastest)\n'
            '  pip install faster-whisper  (GPU/CPU, fast)\n'
            '  pip install openai-whisper  (CPU, slowest)\n'
        )

    def transcribe_file(self, file_path, compress=True, bitrate='64k'):
        """Transcribe a single audio/video file using local Whisper.

        Args:
            file_path: path to audio/video file
            compress: if True, compress audio before processing (saves memory)
            bitrate: compression bitrate

        Returns:
            dict with keys: text, language, duration_seconds, engine
        """
        file_path = Path(file_path)
        duration = audio_mod.get_duration(file_path)

        # Compress to reduce memory usage
        process_path = file_path
        compressed = None
        if compress:
            try:
                compressed = audio_mod.compress_audio(file_path, bitrate=bitrate)
                process_path = compressed
            except RuntimeError as e:
                print(f'  WARNING: Compression failed, using original: {e}')

        try:
            if self._whisper_type == 'mlx':
                text = self._transcribe_mlx(process_path)
            elif self._whisper_type == 'faster':
                text = self._transcribe_faster(process_path)
            elif self._whisper_type == 'openai':
                text = self._transcribe_openai(process_path)
            else:
                text = self._transcribe_cli(process_path)

            return {
                'text': text,
                'language': self.language,
                'duration_seconds': duration,
                'engine': f'whisper-{self._whisper_type}-{self.model}',
            }
        finally:
            if compressed and compressed != file_path:
                try:
                    compressed.unlink(missing_ok=True)
                except OSError:
                    pass

    def _transcribe_mlx(self, file_path):
        """Transcribe using mlx-whisper (Apple Silicon)."""
        script = f"""
import mlx_whisper
result = mlx_whisper.transcribe(
    "{file_path}",
    path_or_hf_repo="mlx-community/whisper-{self.model}-mlx",
    language="{self.language}",
)
print(result["text"])
"""
        result = subprocess.run(
            ['python3', '-c', script],
            capture_output=True, text=True, timeout=3600,
        )
        if result.returncode != 0:
            raise RuntimeError(f'mlx-whisper failed: {result.stderr[:500]}')
        return result.stdout.strip()

    def _transcribe_faster(self, file_path):
        """Transcribe using faster-whisper."""
        script = f"""
from faster_whisper import WhisperModel
model = WhisperModel("{self.model}", compute_type="int8")
segments, info = model.transcribe("{file_path}", language="{self.language}")
text = " ".join(segment.text for segment in segments)
print(text)
"""
        result = subprocess.run(
            ['python3', '-c', script],
            capture_output=True, text=True, timeout=3600,
        )
        if result.returncode != 0:
            raise RuntimeError(f'faster-whisper failed: {result.stderr[:500]}')
        return result.stdout.strip()

    def _transcribe_openai(self, file_path):
        """Transcribe using openai-whisper."""
        script = f"""
import whisper
model = whisper.load_model("{self.model}")
result = model.transcribe("{file_path}", language="{self.language}")
print(result["text"])
"""
        result = subprocess.run(
            ['python3', '-c', script],
            capture_output=True, text=True, timeout=3600,
        )
        if result.returncode != 0:
            raise RuntimeError(f'openai-whisper failed: {result.stderr[:500]}')
        return result.stdout.strip()

    def _transcribe_cli(self, file_path):
        """Transcribe using whisper CLI."""
        with tempfile.TemporaryDirectory(prefix='aios-whisper-') as tmp_dir:
            cmd = [
                'whisper', str(file_path),
                '--model', self.model,
                '--language', self.language,
                '--output_format', 'txt',
                '--output_dir', tmp_dir,
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
            if result.returncode != 0:
                raise RuntimeError(f'whisper CLI failed: {result.stderr[:500]}')

            # Read output .txt file
            txt_files = list(Path(tmp_dir).glob('*.txt'))
            if not txt_files:
                raise RuntimeError('Whisper produced no output')

            return txt_files[0].read_text(encoding='utf-8').strip()
