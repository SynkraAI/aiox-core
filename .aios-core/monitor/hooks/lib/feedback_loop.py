#!/usr/bin/env python3
"""
Feedback Loop — Local filesystem integration for tool usage tracking.

Writes tool usage logs and error patterns to bridge-data directory,
enabling the MCP Feedback Loop tools (log_tool_error, search_known_fixes,
log_tool_usage, get_tool_usage_stats) to operate on local data.

All operations are fire-and-forget: exceptions are silently caught
to NEVER block or slow down Claude tool execution.

Used by: pre_tool_use.py (check_known_fixes), post_tool_use.py (logging)
"""

import json
import os
from datetime import datetime
from typing import Optional


BRIDGE_DIR = os.environ.get("AIOS_BRAIN_BRIDGE_DIR", "D:/jarvis/bridge-data")
TOOL_USAGE_LOG_DIR = os.environ.get(
    "TOOL_USAGE_LOG_DIR",
    os.path.join(BRIDGE_DIR, "tool-usage-log"),
)
TOOL_ERRORS_DIR = os.environ.get(
    "TOOL_ERRORS_DIR",
    os.path.join(BRIDGE_DIR, "tool-errors"),
)


def _ensure_dir(dir_path: str) -> None:
    """Create directory tree if it doesn't exist."""
    os.makedirs(dir_path, exist_ok=True)


# ──────────────────────────────────────────────────────────────────
# post_tool_use: log every tool call outcome
# ──────────────────────────────────────────────────────────────────

def log_tool_usage_local(
    tool_name: str,
    success: bool,
    error_message: Optional[str] = None,
    duration_ms: Optional[int] = None,
) -> None:
    """
    Append one JSONL entry per tool call to the daily log file.

    File layout:
        {TOOL_USAGE_LOG_DIR}/2026-03-30.jsonl
    """
    try:
        _ensure_dir(TOOL_USAGE_LOG_DIR)

        today = datetime.now().strftime("%Y-%m-%d")
        log_file = os.path.join(TOOL_USAGE_LOG_DIR, f"{today}.jsonl")

        agent = os.environ.get("AIOS_AGENT", "unknown")

        entry = {
            "timestamp": datetime.now().isoformat(),
            "tool": tool_name,
            "agent": agent,
            "success": success,
            "duration_ms": duration_ms,
            "error_message": error_message,
        }

        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass  # Never block tool execution


# ──────────────────────────────────────────────────────────────────
# post_tool_use: log errors with dedup for fix learning
# ──────────────────────────────────────────────────────────────────

def _make_error_id(tool_name: str, error_type: str) -> str:
    """Deterministic error ID for dedup."""
    safe_tool = tool_name.replace("_", "-").replace(" ", "-").lower()
    safe_type = error_type.replace("_", "-").replace(" ", "-").lower()[:80]
    return f"err-{safe_tool}-{safe_type}"


def log_tool_error_local(
    tool_name: str,
    error_type: str,
    error_message: str,
    context: str = "",
) -> None:
    """
    Log a tool error with dedup.

    File layout:
        {TOOL_ERRORS_DIR}/index.json       — array of error summaries
        {TOOL_ERRORS_DIR}/fixes/{id}.json   — per-error detail + fix slot
    """
    try:
        fixes_dir = os.path.join(TOOL_ERRORS_DIR, "fixes")
        _ensure_dir(fixes_dir)

        index_path = os.path.join(TOOL_ERRORS_DIR, "index.json")

        # Load existing index
        try:
            with open(index_path, "r", encoding="utf-8") as f:
                index = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            index = []

        error_id = _make_error_id(tool_name, error_type)
        now_iso = datetime.now().isoformat()

        # Update or create entry
        existing = next((e for e in index if e.get("id") == error_id), None)

        if existing:
            existing["occurrences"] = existing.get("occurrences", 1) + 1
            existing["last_seen"] = now_iso
        else:
            index.append({
                "id": error_id,
                "tool": tool_name,
                "error_type": error_type,
                "occurrences": 1,
                "first_seen": now_iso,
                "last_seen": now_iso,
            })

        # Write index
        with open(index_path, "w", encoding="utf-8") as f:
            json.dump(index, f, indent=2, ensure_ascii=False)

        # Write fix file (only if new — don't overwrite existing fixes)
        fix_path = os.path.join(fixes_dir, f"{error_id}.json")
        if not os.path.exists(fix_path):
            fix_data = {
                "id": error_id,
                "tool": tool_name,
                "error_type": error_type,
                "error_message": error_message,
                "context": context,
                "fix": None,
                "created_at": now_iso,
            }
            with open(fix_path, "w", encoding="utf-8") as f:
                json.dump(fix_data, f, indent=2, ensure_ascii=False)

    except Exception:
        pass  # Never block


# ──────────────────────────────────────────────────────────────────
# pre_tool_use: check for known error patterns before execution
# ──────────────────────────────────────────────────────────────────

def check_known_fixes(tool_name: str) -> Optional[list[str]]:
    """
    Check if there are recurring error patterns for this tool.

    Only warns about errors with 3+ occurrences (real patterns, not noise).
    If a fix has been recorded, shows the fix. Otherwise shows the error count.

    Returns:
        List of warning strings, or None if clean.
    """
    try:
        index_path = os.path.join(TOOL_ERRORS_DIR, "index.json")

        try:
            with open(index_path, "r", encoding="utf-8") as f:
                index = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None

        # Find recurring errors for this specific tool
        recurring = [
            e for e in index
            if e.get("tool") == tool_name and e.get("occurrences", 0) >= 3
        ]

        if not recurring:
            return None

        fixes_dir = os.path.join(TOOL_ERRORS_DIR, "fixes")
        warnings = []

        for error in recurring:
            fix_path = os.path.join(fixes_dir, f"{error['id']}.json")
            try:
                with open(fix_path, "r", encoding="utf-8") as f:
                    fix_data = json.load(f)
                if fix_data.get("fix"):
                    warnings.append(
                        f"[feedback-loop] Known issue with {tool_name}: {fix_data['fix']}"
                    )
                else:
                    warnings.append(
                        f"[feedback-loop] {tool_name} has failed {error['occurrences']}x "
                        f"with: {error.get('error_type', 'unknown')}"
                    )
            except Exception:
                pass

        return warnings if warnings else None

    except Exception:
        return None
