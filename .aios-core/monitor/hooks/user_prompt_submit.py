#!/usr/bin/env python3
"""
UserPromptSubmit hook - captures when user sends a prompt.

This is the starting point of each interaction.
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

    # Store user prompt for agent detection
    if "user_prompt" in data:
        # Truncate if too long
        prompt = data["user_prompt"]
        if isinstance(prompt, str) and len(prompt) > 1000:
            data["user_prompt"] = prompt[:1000] + "..."

    # Enrich with AIOS context
    data = enrich_event(data)

    # Send to monitor server
    send_event("UserPromptSubmit", data)


if __name__ == "__main__":
    main()
