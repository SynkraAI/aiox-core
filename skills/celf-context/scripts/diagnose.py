#!/usr/bin/env python3
"""
diagnose.py — CELF Context Health Scanner

Scans a project directory and produces a layer-by-layer diagnostic report.

USAGE:
    python scripts/diagnose.py [project_root]
    python scripts/diagnose.py              # uses current directory

OUTPUT:
    YAML diagnostic report to stdout with scores per layer (0-3),
    detected anti-patterns, and recommended actions.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime


def count_lines(filepath):
    """Count lines in a file, return 0 if unreadable."""
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return sum(1 for _ in f)
    except Exception:
        return 0


def file_exists_any(root, *paths):
    """Check if any of the given paths exist relative to root."""
    for p in paths:
        if (root / p).exists():
            return True, str(p)
    return False, None


def estimate_tokens(filepath):
    """Rough token estimate: ~4 chars per token."""
    try:
        size = os.path.getsize(filepath)
        return size // 4
    except Exception:
        return 0


def scan_l0(root):
    """Scan L0 — Constitution."""
    findings = {"score": 0, "details": [], "anti_patterns": []}

    # Check CLAUDE.md existence
    project_claude = root / "CLAUDE.md"
    dot_claude = root / ".claude" / "CLAUDE.md"
    global_claude = Path.home() / ".claude" / "CLAUDE.md"

    has_project = project_claude.exists()
    has_dot = dot_claude.exists()
    has_global = global_claude.exists()

    if has_project or has_dot or has_global:
        findings["score"] += 1
        findings["details"].append("CLAUDE.md found")
    else:
        findings["details"].append("MISSING: No CLAUDE.md found")
        return findings

    # Check line count
    main_file = project_claude if has_project else (dot_claude if has_dot else global_claude)
    lines = count_lines(main_file)
    findings["details"].append(f"CLAUDE.md: {lines} lines")

    if lines <= 200:
        findings["score"] += 1
    else:
        findings["anti_patterns"].append(f"AP-01: Context Dump — CLAUDE.md has {lines} lines (limit: 200)")

    # Check for decision levels
    try:
        content = main_file.read_text(encoding="utf-8", errors="ignore").lower()
        has_decisions = any(kw in content for kw in ["decision level", "decide alone", "escalate", "level 1", "level 2", "level 3"])
        if has_decisions:
            findings["score"] += 1
            findings["details"].append("Decision levels: found")
        else:
            findings["details"].append("Decision levels: NOT found")
    except Exception:
        findings["details"].append("Decision levels: could not check")

    # Check for business facts pollution
    try:
        biz_keywords = ["price:", "r$", "$", "product:", "persona:"]
        has_biz = sum(1 for kw in biz_keywords if kw in content)
        if has_biz <= 1:
            findings["score"] = min(findings["score"] + 1, 3)  # Cap at 3
        else:
            findings["anti_patterns"].append("Business facts detected in constitution (should be in L1)")
    except Exception:
        pass

    findings["score"] = min(findings["score"], 3)
    return findings


def scan_l1(root):
    """Scan L1 — Knowledge Graph."""
    findings = {"score": 0, "details": [], "anti_patterns": []}

    brain_yaml = root / ".brain" / "BRAIN.yaml"
    knowledge_index = root / "knowledge" / "INDEX.yaml"

    has_entry, entry_path = file_exists_any(root,
        Path(".brain") / "BRAIN.yaml",
        Path(".brain") / "BRAIN.yml",
        Path("knowledge") / "INDEX.yaml",
        Path("knowledge") / "INDEX.yml",
    )

    if has_entry:
        findings["score"] += 1
        findings["details"].append(f"Entry point: {entry_path}")

        # Check if entry point is pointer (< 500 tokens)
        full_path = root / entry_path
        tokens = estimate_tokens(full_path)
        if tokens < 500:
            findings["score"] += 1
            findings["details"].append(f"Entry point size: ~{tokens} tokens (OK)")
        else:
            findings["anti_patterns"].append(f"Entry point is {tokens} tokens (should be < 500)")
    else:
        findings["details"].append("MISSING: No knowledge entry point (.brain/BRAIN.yaml or knowledge/INDEX.yaml)")
        return findings

    # Check for entities
    entities_dirs = [
        root / ".brain" / "entities",
        root / "knowledge",
    ]
    has_products = False
    has_personas = False
    for d in entities_dirs:
        if d.exists():
            for item in d.rglob("*"):
                name = item.name.lower()
                if "product" in name or "offer" in name:
                    has_products = True
                if "persona" in name or "icp" in name or "customer" in name:
                    has_personas = True

    if has_products:
        findings["score"] = min(findings["score"] + 1, 3)
        findings["details"].append("Product entity: found")
    else:
        findings["details"].append("Product entity: NOT found")

    if has_personas:
        findings["details"].append("Persona entity: found")
    else:
        findings["details"].append("Persona entity: NOT found")

    findings["score"] = min(findings["score"], 3)
    return findings


def scan_l2(root):
    """Scan L2 — Intelligence."""
    findings = {"score": 0, "details": [], "anti_patterns": []}

    intel_dirs = [
        root / "inputs" / "intelligence",
        root / "intelligence",
        root / "research",
    ]

    found_dir = None
    for d in intel_dirs:
        if d.exists() and d.is_dir():
            found_dir = d
            break

    if found_dir:
        findings["score"] += 1
        findings["details"].append(f"Intelligence dir: {found_dir.relative_to(root)}")

        # Check for P0 files
        p0_files = list(found_dir.glob("P0-*")) + list(found_dir.glob("p0-*"))
        if p0_files:
            findings["score"] += 1
            findings["details"].append(f"P0 files: {len(p0_files)} found")
        else:
            # Check for any files
            all_files = [f for f in found_dir.iterdir() if f.is_file()]
            findings["details"].append(f"P0 files: none (but {len(all_files)} other files)")

        # Check if constitution references intelligence
        claude_md = root / "CLAUDE.md"
        if claude_md.exists():
            content = claude_md.read_text(encoding="utf-8", errors="ignore").lower()
            if "intelligence" in content or "p0" in content or "before creat" in content:
                findings["score"] = min(findings["score"] + 1, 3)
                findings["details"].append("Constitution references intelligence loading: YES")
            else:
                findings["details"].append("Constitution references intelligence loading: NO")
                findings["anti_patterns"].append("AP-03: Constitution doesn't enforce intelligence loading before creation")
    else:
        findings["details"].append("MISSING: No intelligence directory")
        findings["anti_patterns"].append("AP-03: No intelligence layer — outputs will be generic")

    findings["score"] = min(findings["score"], 3)
    return findings


def scan_l3(root):
    """Scan L3 — Project State."""
    findings = {"score": 0, "details": [], "anti_patterns": []}

    # Look for STATE.yaml in various locations
    state_locations = list(root.glob("**/STATE.yaml")) + list(root.glob("**/STATE.yml")) + list(root.glob("**/state.yaml"))

    if state_locations:
        findings["score"] += 1
        findings["details"].append(f"STATE files: {len(state_locations)} found")

        # Check first one for size
        first = state_locations[0]
        tokens = estimate_tokens(first)
        if tokens < 1000:
            findings["score"] += 1
            findings["details"].append(f"STATE size: ~{tokens} tokens (OK)")
        else:
            findings["anti_patterns"].append(f"AP-09: STATE.yaml is {tokens} tokens (should be < 1000)")

        # Check for phase definitions
        try:
            content = first.read_text(encoding="utf-8", errors="ignore").lower()
            if "phase" in content or "status" in content:
                findings["score"] = min(findings["score"] + 1, 3)
                findings["details"].append("Phase definitions: found")
            else:
                findings["anti_patterns"].append("AP-09: State without machine — no phase definitions")
        except Exception:
            pass
    else:
        findings["details"].append("MISSING: No STATE.yaml found")
        findings["anti_patterns"].append("AP-02: No project state — session amnesia risk")

    # Check for projects/ directory
    projects_dir = root / "projects"
    if projects_dir.exists():
        findings["details"].append(f"projects/ directory: exists")
    else:
        findings["details"].append("projects/ directory: NOT found")

    findings["score"] = min(findings["score"], 3)
    return findings


def scan_l4(root):
    """Scan L4 — Heuristics & Rules."""
    findings = {"score": 0, "details": [], "anti_patterns": []}

    rules_dir = root / ".claude" / "rules"
    alt_rules = root / "rules"

    rules_path = rules_dir if rules_dir.exists() else (alt_rules if alt_rules.exists() else None)

    if rules_path:
        findings["score"] += 1
        rule_files = list(rules_path.glob("*.md"))
        findings["details"].append(f"Rules directory: {len(rule_files)} files")

        # Check for anti-loop
        has_antiloop = any("loop" in f.name.lower() or "circuit" in f.name.lower() for f in rule_files)
        if has_antiloop:
            findings["score"] += 1
            findings["details"].append("Anti-loop rule: found")
        else:
            findings["details"].append("Anti-loop rule: NOT found")

        # Check file sizes
        oversized = [f for f in rule_files if estimate_tokens(f) > 500]
        if not oversized:
            findings["score"] = min(findings["score"] + 1, 3)
            findings["details"].append("Rule sizes: all under 500 tokens")
        else:
            findings["anti_patterns"].append(f"{len(oversized)} rule files exceed 500 tokens")
    else:
        findings["details"].append("MISSING: No rules directory")

    # Check for commands/agents
    commands_dir = root / ".claude" / "commands"
    if commands_dir.exists():
        cmd_count = sum(1 for _ in commands_dir.rglob("*.md"))
        findings["details"].append(f"Commands/agents: {cmd_count} files")
    else:
        findings["details"].append("Commands/agents: none")

    findings["score"] = min(findings["score"], 3)
    return findings


def scan_l5(root):
    """Scan L5 — Memory."""
    findings = {"score": 0, "details": [], "anti_patterns": []}

    # Check for MEMORY.md in common locations
    memory_locations = [
        Path.home() / ".claude" / "projects",  # Will need to search
        root / "MEMORY.md",
        root / ".memory" / "MEMORY.md",
    ]

    found_memory = False
    memory_lines = 0

    # Check project root
    if (root / "MEMORY.md").exists():
        found_memory = True
        memory_lines = count_lines(root / "MEMORY.md")

    # Check .memory/
    if (root / ".memory" / "MEMORY.md").exists():
        found_memory = True
        memory_lines = count_lines(root / ".memory" / "MEMORY.md")

    # Check ~/.claude/projects/ (Claude Code auto-memory)
    claude_projects = Path.home() / ".claude" / "projects"
    if claude_projects.exists():
        for mem_file in claude_projects.rglob("MEMORY.md"):
            found_memory = True
            memory_lines = max(memory_lines, count_lines(mem_file))
            break

    if found_memory:
        findings["score"] += 1
        findings["details"].append(f"MEMORY.md: found ({memory_lines} lines)")

        if memory_lines <= 200:
            findings["score"] += 1
            findings["details"].append("Memory size: within limit")
        else:
            findings["anti_patterns"].append(f"AP-10: MEMORY.md has {memory_lines} lines (limit: 200)")

        # Check for satellite files
        satellites = list((root / ".memory").glob("*.md")) if (root / ".memory").exists() else []
        if not satellites:
            # Check Claude auto-memory location
            for mem_dir in claude_projects.rglob("memory") if claude_projects.exists() else []:
                satellites = [f for f in mem_dir.glob("*.md") if f.name != "MEMORY.md"]
                break

        if satellites:
            findings["score"] = min(findings["score"] + 1, 3)
            findings["details"].append(f"Satellite files: {len(satellites)}")
        else:
            findings["details"].append("Satellite files: none")
    else:
        findings["details"].append("MISSING: No MEMORY.md found")
        findings["anti_patterns"].append("AP-02: No memory layer — no cross-session learning")

    findings["score"] = min(findings["score"], 3)
    return findings


def scan_l6(root):
    """Scan L6 — Session."""
    findings = {"score": 0, "details": [], "anti_patterns": []}

    session_dirs = [
        root / "docs" / "sessions",
        root / "sessions",
        root / ".sessions",
    ]

    found_dir = None
    for d in session_dirs:
        if d.exists():
            found_dir = d
            break

    if found_dir:
        findings["score"] += 1
        handoff_files = list(found_dir.rglob("*.md"))
        findings["details"].append(f"Session directory: {len(handoff_files)} handoff files")

        if handoff_files:
            findings["score"] += 1
            findings["details"].append("Handoff files: present")
        else:
            findings["details"].append("Handoff files: directory exists but empty")
    else:
        findings["details"].append("MISSING: No session/handoff directory")
        findings["anti_patterns"].append("AP-11: No handoff protocol — context lost between sessions")

    # Check if constitution mentions handoff
    claude_md = root / "CLAUDE.md"
    if claude_md.exists():
        content = claude_md.read_text(encoding="utf-8", errors="ignore").lower()
        if "handoff" in content or "session end" in content:
            findings["score"] = min(findings["score"] + 1, 3)
            findings["details"].append("Constitution mentions handoff: YES")
        else:
            findings["details"].append("Constitution mentions handoff: NO")

    findings["score"] = min(findings["score"], 3)
    return findings


def scan_l7(root):
    """Scan L7 — Delegation."""
    findings = {"score": 0, "details": [], "anti_patterns": []}

    # Check for delegation rules
    delegation_indicators = []

    # Check rules for delegation
    rules_dir = root / ".claude" / "rules"
    if rules_dir.exists():
        for f in rules_dir.glob("*.md"):
            content = f.read_text(encoding="utf-8", errors="ignore").lower()
            if "delegat" in content or "sub-agent" in content or "subagent" in content:
                delegation_indicators.append(f.name)

    # Check for agent definitions
    commands_dir = root / ".claude" / "commands"
    agents_dir = root / "agents"
    squads_dir = root / "squads"

    has_agents = (commands_dir.exists() and any(commands_dir.rglob("*.md"))) or agents_dir.exists()
    has_squads = squads_dir.exists()

    if not has_agents and not has_squads:
        findings["details"].append("No agents or squads detected — L7 may not be needed")
        findings["score"] = 0  # N/A for solo projects
        return findings

    if delegation_indicators:
        findings["score"] += 1
        findings["details"].append(f"Delegation rules: {', '.join(delegation_indicators)}")
    else:
        findings["details"].append("Delegation rules: NOT defined")
        findings["anti_patterns"].append("AP-07: Agents exist but no delegation isolation rules")

    if has_agents:
        findings["score"] += 1
        findings["details"].append("Agent definitions: found")

    if has_squads:
        findings["score"] = min(findings["score"] + 1, 3)
        squad_count = sum(1 for d in squads_dir.iterdir() if d.is_dir())
        findings["details"].append(f"Squads: {squad_count}")

    findings["score"] = min(findings["score"], 3)
    return findings


def detect_profile(results):
    """Detect project profile based on scan results."""
    has_agents = "Agent definitions: found" in str(results.get("L7", {}).get("details", []))
    has_squads = "Squads:" in str(results.get("L7", {}).get("details", []))
    has_rules = results.get("L4", {}).get("score", 0) > 0
    has_state = results.get("L3", {}).get("score", 0) > 0

    if has_squads:
        return "ENTERPRISE"
    elif has_agents or (has_rules and has_state):
        return "MEDIUM"
    else:
        return "SOLO"


def main():
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
    root = root.resolve()

    if not root.exists():
        print(f"Error: {root} does not exist", file=sys.stderr)
        sys.exit(1)

    print(f"# CELF Diagnostic Report")
    print(f"# Project: {root.name}")
    print(f"# Path: {root}")
    print(f"# Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print()

    results = {}
    scanners = [
        ("L0", "Constitution", scan_l0),
        ("L1", "Knowledge Graph", scan_l1),
        ("L2", "Intelligence", scan_l2),
        ("L3", "Project State", scan_l3),
        ("L4", "Heuristics", scan_l4),
        ("L5", "Memory", scan_l5),
        ("L6", "Session", scan_l6),
        ("L7", "Delegation", scan_l7),
    ]

    total_score = 0
    for layer_id, name, scanner in scanners:
        result = scanner(root)
        results[layer_id] = result
        total_score += result["score"]

        status = ["MISSING", "WEAK", "FUNCTIONAL", "STATE-OF-ART"][result["score"]]
        print(f"{layer_id} {name}: {result['score']}/3 ({status})")
        for detail in result["details"]:
            print(f"  - {detail}")
        for ap in result["anti_patterns"]:
            print(f"  ! {ap}")
        print()

    profile = detect_profile(results)
    print(f"# Profile: {profile}")
    print(f"# Overall Score: {total_score}/24")

    # Health level
    pct = total_score / 24 * 100
    if pct < 40:
        health = "CRITICAL"
    elif pct < 60:
        health = "WEAK"
    elif pct < 80:
        health = "FUNCTIONAL"
    elif pct < 90:
        health = "HEALTHY"
    else:
        health = "STATE-OF-ART"

    print(f"# Health: {health} ({pct:.0f}%)")
    print()

    # Collect all anti-patterns
    all_aps = []
    for layer_id, result in results.items():
        for ap in result["anti_patterns"]:
            all_aps.append(f"[{layer_id}] {ap}")

    if all_aps:
        print("# Anti-Patterns Detected:")
        for ap in all_aps:
            print(f"  - {ap}")
        print()

    # Priority actions
    print("# Priority Actions:")
    priorities = []
    if results["L0"]["score"] < 2:
        priorities.append("Create or fix CLAUDE.md (highest leverage — loaded every turn)")
    if results["L5"]["score"] < 1:
        priorities.append("Set up MEMORY.md for cross-session learning")
    if results["L1"]["score"] < 1:
        priorities.append("Create .brain/BRAIN.yaml with product + persona facts")
    if results["L3"]["score"] < 1 and profile != "SOLO":
        priorities.append("Create STATE.yaml for project state tracking")
    if results["L6"]["score"] < 1 and profile != "SOLO":
        priorities.append("Set up docs/sessions/ for handoff protocol")
    if results["L2"]["score"] < 1:
        priorities.append("Create inputs/intelligence/ with real customer data")

    for i, p in enumerate(priorities[:5], 1):
        print(f"  {i}. {p}")

    if not priorities:
        print("  No critical actions needed. Consider running VALIDATE mode for fine-tuning.")


if __name__ == "__main__":
    main()
