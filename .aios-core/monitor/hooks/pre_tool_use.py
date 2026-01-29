#!/usr/bin/env python3
"""
PreToolUse hook - captures tool calls before execution.

This hook runs before Claude executes any tool (Read, Write, Bash, etc.)
Use this to see what tools are being invoked and their inputs.
"""

import json
import sys
import os

# Add lib to path
sys.path.insert(0, os.path.dirname(__file__))

from lib.send_event import send_event
from lib.enrich import enrich_event


def main():
    # Read event from stdin
    data = json.load(sys.stdin)

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
