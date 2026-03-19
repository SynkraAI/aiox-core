#!/usr/bin/env python3
"""
Emit pipeline events to JSONL for Big Brother visualization.
Usage: python3 emit_event.py <agent> <type> <content> [key=value ...]

Examples:
  python3 emit_event.py ideation start "Iniciando ideacao..." step=2
  python3 emit_event.py cmo think "Avaliando Purple Cow..."
  python3 emit_event.py cmo gate "Gate 2.5 APROVADO" step=2.5 result=approved score=4.2
  python3 emit_event.py system complete "Pipeline completo."
  python3 emit_event.py --clear  # Clear events file
"""
import json
import os
import sys
from datetime import datetime, timezone

EVENTS_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    '..', '..', '..', 'outputs', 'hubs', 'marketing', 'pipeline-events.jsonl'
)


def emit(agent, event_type, content, **kwargs):
    event = {
        'ts': datetime.now(timezone.utc).isoformat(),
        'agent': agent,
        'type': event_type,
        'content': content,
        **kwargs
    }
    os.makedirs(os.path.dirname(EVENTS_FILE), exist_ok=True)
    with open(EVENTS_FILE, 'a') as f:
        f.write(json.dumps(event, ensure_ascii=False) + '\n')
    print(f"[BB] {agent}/{event_type}: {content[:60]}")


def clear():
    if os.path.exists(EVENTS_FILE):
        os.remove(EVENTS_FILE)
    print(f"[BB] Events cleared: {EVENTS_FILE}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    if sys.argv[1] == '--clear':
        clear()
        sys.exit(0)

    agent, etype, content = sys.argv[1], sys.argv[2], sys.argv[3]
    kwargs = {}
    for arg in sys.argv[4:]:
        k, v = arg.split('=', 1)
        kwargs[k] = v
    emit(agent, etype, content, **kwargs)
