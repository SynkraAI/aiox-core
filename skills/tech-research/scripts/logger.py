#!/usr/bin/env python3
"""Structured JSON Lines logger for tech-research Worker atoms.

Implements M3 (logging obrigatório) from SINKRA 10 Mandamentos.
Outputs JSON Lines to stderr. Data goes to stdout. Never mix.

Usage:
    from logger import ResearchLogger
    log = ResearchLogger("atm_classify_urls")
    log.info("url_classified", {"url": "...", "type": "youtube"})
    log.error("classification_failed", error="invalid URL format")
    log.metric("coverage_calculated", {"score": 72.5, "wave": 1})
"""

import sys
import json
import time
from datetime import datetime, timezone


class ResearchLogger:
    """Structured logger for tech-research Worker atoms."""

    def __init__(self, atom_id: str, output=None):
        self.atom_id = atom_id
        self.output = output or sys.stderr
        self._start_times: dict[str, float] = {}

    def _emit(self, level: str, event: str, data: dict = None, error: str = None, duration_ms: int = None):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": level,
            "atom_id": self.atom_id,
            "event": event,
        }
        if data:
            entry["data"] = data
        if duration_ms is not None:
            entry["duration_ms"] = duration_ms
        if error:
            entry["error"] = error

        self.output.write(json.dumps(entry) + "\n")
        self.output.flush()

    def debug(self, event: str, data: dict = None):
        self._emit("DEBUG", event, data)

    def info(self, event: str, data: dict = None, duration_ms: int = None):
        self._emit("INFO", event, data, duration_ms=duration_ms)

    def warn(self, event: str, data: dict = None, error: str = None):
        self._emit("WARN", event, data, error=error)

    def error(self, event: str, data: dict = None, error: str = None):
        self._emit("ERROR", event, data, error=error)

    def metric(self, event: str, data: dict):
        self._emit("INFO", event, data)

    def start_timer(self, operation: str):
        self._start_times[operation] = time.monotonic()

    def stop_timer(self, operation: str, event: str, data: dict = None):
        start = self._start_times.pop(operation, None)
        duration_ms = None
        if start is not None:
            duration_ms = round((time.monotonic() - start) * 1000)
        self._emit("INFO", event, data, duration_ms=duration_ms)
        return duration_ms


class FileLogger(ResearchLogger):
    """Logger that writes to a JSONL file (for execution-log.jsonl)."""

    def __init__(self, atom_id: str, log_file: str):
        self._file = open(log_file, "a")
        super().__init__(atom_id, output=self._file)

    def close(self):
        self._file.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


def main():
    """CLI mode: log a single event from command line."""
    if len(sys.argv) < 4:
        print("Usage: logger.py <atom_id> <level> <event> [data_json]", file=sys.stderr)
        sys.exit(1)

    atom_id = sys.argv[1]
    level = sys.argv[2].upper()
    event = sys.argv[3]
    data = json.loads(sys.argv[4]) if len(sys.argv) > 4 else None

    log = ResearchLogger(atom_id)
    getattr(log, level.lower(), log.info)(event, data)


if __name__ == "__main__":
    main()
