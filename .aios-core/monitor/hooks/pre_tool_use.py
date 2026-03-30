#!/usr/bin/env python3
"""
PreToolUse hook - captures tool calls before execution.

This hook runs before Claude executes any tool (Read, Write, Bash, etc.)
Use this to see what tools are being invoked and their inputs.
Checks known error patterns from the Feedback Loop before MCP tool calls.
"""

import json
import sys
import os

# Add lib to path
sys.path.insert(0, os.path.dirname(__file__))

from lib.send_event import send_event
from lib.enrich import enrich_event
from lib.feedback_loop import check_known_fixes


def main():
    # Read event from stdin
    data = json.load(sys.stdin)

    # ─── Feedback Loop: Check known error patterns ────────────────
    try:
        tool_name = data.get("tool_name", "")
        if tool_name:
            warnings = check_known_fixes(tool_name)
            if warnings:
                for w in warnings:
                    print(w, file=sys.stderr)
    except Exception:
        pass  # Never block Claude

    # Truncate large fields to avoid memory issues
    if "tool_input" in data:
        tool_input = data["tool_input"]
        if isinstance(tool_input, dict):
            for key, value in tool_input.items():
                if isinstance(value, str) and len(value) > 500:
                    data["tool_input"][key] = value[:500] + "..."

    # Enrich with AIOS context
    data = enrich_event(data)

    # Send to monitor server
    send_event("PreToolUse", data)


if __name__ == "__main__":
    main()
