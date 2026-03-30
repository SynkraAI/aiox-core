#!/usr/bin/env python3
"""
PostToolUse hook - captures tool results after execution.
Tracks significant actions for Jarvis auto-publish on session end.
Logs tool usage + errors for the Feedback Loop.
"""

import json
import sys
import os
import time

# Add lib to path
sys.path.insert(0, os.path.dirname(__file__))

from lib.send_event import send_event
from lib.enrich import enrich_event
from lib.jarvis_bridge import track_session_action
from lib.feedback_loop import log_tool_usage_local, log_tool_error_local

# Tools that represent significant trackable actions
TRACKABLE_TOOLS = {
    "Write": "file_create",
    "Edit": "file_edit",
}


def main():
    # Read event from stdin
    data = json.load(sys.stdin)

    # Track significant actions for Jarvis
    try:
        tool_name = data.get("tool_name", "")
        tool_input = data.get("tool_input", {})

        if tool_name in TRACKABLE_TOOLS:
            action_type = TRACKABLE_TOOLS[tool_name]
            file_path = ""
            if isinstance(tool_input, dict):
                file_path = tool_input.get("file_path", tool_input.get("path", ""))
            track_session_action(action_type, {"file": file_path})

        # Track git commits
        if tool_name == "Bash":
            command = tool_input.get("command", "") if isinstance(tool_input, dict) else str(tool_input)
            if "git commit" in command:
                # Extract commit message if possible
                msg = command.split("-m")[-1].strip().strip("'\"")[:200] if "-m" in command else "commit"
                track_session_action("git_commit", {"message": msg})

        # Track Mind Clone consultations via brain-bridge MCP
        if tool_name and "request_expert_consultation" in tool_name:
            expert = ""
            question = ""
            if isinstance(tool_input, dict):
                expert = tool_input.get("expert", tool_input.get("mind_clone", ""))
                question = tool_input.get("question", "")[:200]
            track_session_action("mind_clone_consultation", {
                "expert": expert,
                "question": question,
                "agent": os.environ.get("AIOS_AGENT", "unknown"),
            })

        # Track consultation responses
        if tool_name and "get_consultation_response" in tool_name:
            track_session_action("mind_clone_response", {
                "agent": os.environ.get("AIOS_AGENT", "unknown"),
            })

    except Exception:
        # Never block Claude
        pass

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

    # ─── Feedback Loop: Log tool usage ────────────────────────────
    try:
        tool_name = data.get("tool_name", "unknown")
        tool_result = data.get("tool_result", "")

        # Detect error from tool result
        is_error = False
        error_message = None
        error_type = None

        if isinstance(tool_result, str):
            result_lower = tool_result.lower()
            is_error = any(kw in result_lower for kw in [
                "error", "failed", "exception", "traceback",
                "command failed", "exit code", "permission denied",
                "not found", "enoent", "timeout",
            ])
            if is_error:
                # Extract first line as error type
                first_line = tool_result.strip().split("\n")[0][:200]
                error_type = first_line
                error_message = tool_result[:500]
        elif isinstance(tool_result, dict):
            is_error = tool_result.get("is_error", False) or "error" in tool_result
            if is_error:
                error_message = str(tool_result.get("error", tool_result.get("message", "")))[:500]
                error_type = tool_result.get("error_type", error_message.split("\n")[0][:200] if error_message else "unknown")

        # Log every tool call
        log_tool_usage_local(
            tool_name=tool_name,
            success=not is_error,
            error_message=error_message,
        )

        # Log errors separately for fix learning
        if is_error and error_type:
            log_tool_error_local(
                tool_name=tool_name,
                error_type=error_type,
                error_message=error_message or "unknown error",
                context=str(data.get("tool_input", ""))[:300],
            )

    except Exception:
        pass  # Never block Claude


if __name__ == "__main__":
    main()
