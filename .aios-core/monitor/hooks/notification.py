#!/usr/bin/env python3
"""
Notification hook - captures Claude notifications.
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

    # Enrich with AIOS context
    data = enrich_event(data)

    # Send to monitor server
    send_event("Notification", data)


if __name__ == "__main__":
    main()
