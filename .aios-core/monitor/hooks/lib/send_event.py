#!/usr/bin/env python3
"""
Send event to AIOS Monitor server.
Non-blocking with short timeout to avoid slowing Claude.
"""

import json
import os
import time
import urllib.request
from typing import Any

SERVER_URL = os.environ.get("AIOS_MONITOR_URL", "http://localhost:4001")
TIMEOUT_MS = int(os.environ.get("AIOS_MONITOR_TIMEOUT_MS", "500"))


def send_event(event_type: str, data: dict[str, Any]) -> bool:
    """
    Send event to AIOS Monitor server.

    Args:
        event_type: Hook event type (PreToolUse, PostToolUse, etc.)
        data: Event data from Claude hook

    Returns:
        True if sent successfully, False otherwise
    """
    try:
        payload = json.dumps({
            "type": event_type,
            "timestamp": int(time.time() * 1000),
            "data": data
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{SERVER_URL}/events",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        urllib.request.urlopen(req, timeout=TIMEOUT_MS / 1000)
        return True

    except Exception:
        # Silent fail - never block Claude
        return False
