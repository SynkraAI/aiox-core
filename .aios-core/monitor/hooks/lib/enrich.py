#!/usr/bin/env python3
"""
Enrich events with AIOS context (agent, story, task, etc.)
"""

import os
import re
from pathlib import Path
from typing import Any


def enrich_event(data: dict[str, Any]) -> dict[str, Any]:
    """Add AIOS context to event data."""

    # Project detection
    cwd = data.get("cwd", os.getcwd())
    data["project"] = detect_project(cwd)

    # AIOS context from environment
    if os.environ.get("AIOS_AGENT"):
        data["aios_agent"] = os.environ["AIOS_AGENT"]

    if os.environ.get("AIOS_STORY_ID"):
        data["aios_story_id"] = os.environ["AIOS_STORY_ID"]

    if os.environ.get("AIOS_TASK_ID"):
        data["aios_task_id"] = os.environ["AIOS_TASK_ID"]

    # Try to detect AIOS agent from user prompt if available
    user_prompt = data.get("user_prompt", "")
    if user_prompt:
        detected_agent = detect_agent_from_prompt(user_prompt)
        if detected_agent and not data.get("aios_agent"):
            data["aios_agent"] = detected_agent

    return data


def detect_project(cwd: str) -> str:
    """Detect project name from cwd."""
    path = Path(cwd)

    # Check for common project markers
    markers = [".git", "package.json", "Cargo.toml", "go.mod", "pyproject.toml"]
    for marker in markers:
        if (path / marker).exists():
            return path.name

    return path.name


def detect_agent_from_prompt(prompt: str) -> str | None:
    """Detect AIOS agent activation from prompt."""
    # Look for @agent patterns
    match = re.search(r'@(dev|architect|qa|pm|po|sm|analyst|devops|aios-master)', prompt.lower())
    if match:
        return match.group(1)
    return None
