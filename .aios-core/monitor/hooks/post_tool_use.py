#!/usr/bin/env python3
"""
PostToolUse hook - captures tool results after execution.

This hook runs after Claude executes any tool, capturing the result.
Most important for tracking what actually happened.
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

    # Truncate large fields
    if "tool_result" in data:
        result = data["tool_result"]
        if isinstance(result, str) and len(result) > 1000:
            data["tool_result"] = result[:1000] + "...[truncated]"

    if "tool_input" in data:
        tool_input = data["tool_input"]
        if isinstance(tool_input, dict):
            for key, value in tool_input.items():
                if isinstance(value, str) and len(value) > 500:
                    data["tool_input"][key] = value[:500] + "..."

    # Enrich with AIOS context
    data = enrich_event(data)

    # Send to monitor server
    send_event("PostToolUse", data)


if __name__ == "__main__":
    main()
