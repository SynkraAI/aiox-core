#!/usr/bin/env python3
"""State management for batch transcription resume.

Tracks which files have been transcribed, failed, or are pending.
State is persisted to .transcription-state.json in the working directory.
"""

import fcntl
import json
from datetime import datetime
from pathlib import Path

STATE_FILENAME = '.transcription-state.json'


class TranscriptionState:
    """Manages transcription state for resume capability."""

    def __init__(self, work_dir):
        self.work_dir = Path(work_dir)
        self.state_file = self.work_dir / STATE_FILENAME
        self.state = self._load()

    def _load(self):
        """Load state from disk, or create fresh state."""
        if self.state_file.exists():
            try:
                with open(self.state_file, encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, OSError):
                pass

        return {
            'version': '1.0',
            'started_at': datetime.now().isoformat(),
            'engine': None,
            'completed': [],
            'failed': [],
        }

    def _save(self):
        """Persist state to disk with atomic write and file locking."""
        self.work_dir.mkdir(parents=True, exist_ok=True)
        with open(self.state_file, 'a+') as f:
            fcntl.flock(f.fileno(), fcntl.LOCK_EX)
            try:
                f.seek(0)
                f.truncate()
                json.dump(self.state, f, indent=2, ensure_ascii=False)
                f.flush()
            finally:
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)

    def is_completed(self, file_path):
        """Check if a file has already been transcribed."""
        rel = str(Path(file_path).relative_to(self.work_dir)) if Path(file_path).is_relative_to(self.work_dir) else str(file_path)
        return any(entry['file'] == rel for entry in self.state['completed'])

    def mark_completed(self, file_path, output_path, engine, duration_seconds=0):
        """Mark a file as successfully transcribed."""
        rel = str(Path(file_path).relative_to(self.work_dir)) if Path(file_path).is_relative_to(self.work_dir) else str(file_path)
        out_rel = str(Path(output_path).relative_to(self.work_dir)) if Path(output_path).is_relative_to(self.work_dir) else str(output_path)

        # Remove from failed if it was there
        self.state['failed'] = [e for e in self.state['failed'] if e['file'] != rel]

        self.state['completed'].append({
            'file': rel,
            'output': out_rel,
            'engine': engine,
            'duration_seconds': duration_seconds,
            'completed_at': datetime.now().isoformat(),
        })
        self._save()

    def mark_failed(self, file_path, error, retries=0):
        """Mark a file as failed."""
        rel = str(Path(file_path).relative_to(self.work_dir)) if Path(file_path).is_relative_to(self.work_dir) else str(file_path)

        # Update or add failed entry
        existing = next((e for e in self.state['failed'] if e['file'] == rel), None)
        if existing:
            existing['error'] = str(error)
            existing['retries'] = retries
            existing['last_attempt'] = datetime.now().isoformat()
        else:
            self.state['failed'].append({
                'file': rel,
                'error': str(error),
                'retries': retries,
                'last_attempt': datetime.now().isoformat(),
            })
        self._save()

    def set_engine(self, engine):
        """Record which engine is being used."""
        self.state['engine'] = engine
        self._save()

    def summary(self):
        """Return summary dict."""
        return {
            'completed': len(self.state['completed']),
            'failed': len(self.state['failed']),
            'engine': self.state.get('engine'),
            'started_at': self.state.get('started_at'),
        }
