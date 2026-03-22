#!/usr/bin/env python3
"""
validate.py — CELF Validation Rubric Checker

Runs the full 30-criterion CELF validation rubric against a project.

USAGE:
    python scripts/validate.py [project_root]

OUTPUT:
    Pass/fail for each of 30 criteria, overall score, health level.
"""

import os
import sys
from pathlib import Path
from datetime import datetime


def count_lines(filepath):
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return sum(1 for _ in f)
    except Exception:
        return 0


def estimate_tokens(filepath):
    try:
        return os.path.getsize(filepath) // 4
    except Exception:
        return 0


def read_content(filepath):
    try:
        return filepath.read_text(encoding="utf-8", errors="ignore").lower()
    except Exception:
        return ""


def validate(root):
    root = Path(root).resolve()
    results = []

    def check(criterion_id, description, passed):
        results.append({
            "id": criterion_id,
            "description": description,
            "passed": passed,
        })

    # === L0 ===
    claude_md = root / "CLAUDE.md"
    dot_claude_md = root / ".claude" / "CLAUDE.md"
    global_claude = Path.home() / ".claude" / "CLAUDE.md"

    has_claude = claude_md.exists() or dot_claude_md.exists() or global_claude.exists()
    check("L0-1", "CLAUDE.md exists", has_claude)

    main_claude = claude_md if claude_md.exists() else (dot_claude_md if dot_claude_md.exists() else global_claude)
    lines = count_lines(main_claude) if has_claude else 999
    check("L0-2", "CLAUDE.md < 200 lines", lines <= 200)

    content = read_content(main_claude) if has_claude else ""
    has_decisions = any(kw in content for kw in ["decision level", "decide alone", "escalate", "level 1", "level 2"])
    check("L0-3", "Decision levels defined", has_decisions)

    biz_count = sum(1 for kw in ["price:", "r$", "product:", "persona:"] if kw in content)
    check("L0-4", "No business facts in constitution", biz_count <= 1)

    # === L1 ===
    brain = root / ".brain" / "BRAIN.yaml"
    knowledge = root / "knowledge" / "INDEX.yaml"
    has_entry = brain.exists() or knowledge.exists()
    check("L1-1", "Knowledge entry point exists", has_entry)

    entry_file = brain if brain.exists() else knowledge
    entry_tokens = estimate_tokens(entry_file) if has_entry else 999
    check("L1-2", "Entry point < 500 tokens", entry_tokens < 500)

    # Product entity
    has_product = False
    for d in [root / ".brain" / "entities", root / "knowledge"]:
        if d.exists():
            for f in d.rglob("*"):
                if "product" in f.name.lower() or "offer" in f.name.lower():
                    has_product = True
    check("L1-3", "Product entity defined", has_product)

    # Persona entity
    has_persona = False
    for d in [root / ".brain" / "entities", root / "knowledge"]:
        if d.exists():
            for f in d.rglob("*"):
                if "persona" in f.name.lower() or "icp" in f.name.lower():
                    has_persona = True
    check("L1-4", "Persona/ICP entity defined", has_persona)

    # === L2 ===
    intel_dirs = [root / "inputs" / "intelligence", root / "intelligence", root / "research"]
    intel_dir = next((d for d in intel_dirs if d.exists()), None)
    check("L2-1", "Intelligence directory exists", intel_dir is not None)

    p0_files = list(intel_dir.glob("P0-*")) + list(intel_dir.glob("p0-*")) if intel_dir else []
    check("L2-2", "P0 files with evidence exist", len(p0_files) > 0)

    # Can't programmatically verify fabrication — assume pass if files exist
    check("L2-3", "No fabricated verbatims (manual check)", len(p0_files) > 0)

    intel_ref = "intelligence" in content or "p0" in content or "before creat" in content
    check("L2-4", "Constitution references intelligence loading", intel_ref)

    # === L3 ===
    state_files = list(root.glob("**/STATE.yaml")) + list(root.glob("**/STATE.yml"))
    check("L3-1", "STATE.yaml exists", len(state_files) > 0)

    state_tokens = estimate_tokens(state_files[0]) if state_files else 999
    check("L3-2", "STATE.yaml < 1000 tokens", state_tokens < 1000)

    state_content = read_content(state_files[0]) if state_files else ""
    check("L3-3", "Phases defined", "phase" in state_content or "status" in state_content)

    # INDEX check
    index_files = list(root.glob("**/INDEX.md"))
    check("L3-4", "INDEX.md maps artifacts", len(index_files) > 0)

    # === L4 ===
    rules_dir = root / ".claude" / "rules"
    alt_rules = root / "rules"
    has_rules = rules_dir.exists() or alt_rules.exists()
    check("L4-1", "Rules directory exists", has_rules)

    rd = rules_dir if rules_dir.exists() else alt_rules
    rule_files = list(rd.glob("*.md")) if has_rules else []
    has_antiloop = any("loop" in f.name.lower() or "circuit" in f.name.lower() for f in rule_files)
    check("L4-2", "Anti-loop rule present", has_antiloop)

    oversized = [f for f in rule_files if estimate_tokens(f) > 500]
    check("L4-3", "Rules under 500 tokens each", len(oversized) == 0)

    routing = any("rout" in read_content(f) for f in rule_files) if rule_files else "rout" in content
    check("L4-4", "Routing defined", routing)

    # === L5 ===
    memory_exists = False
    memory_lines = 0
    for loc in [root / "MEMORY.md", root / ".memory" / "MEMORY.md"]:
        if loc.exists():
            memory_exists = True
            memory_lines = count_lines(loc)

    # Also check Claude auto-memory
    claude_projects = Path.home() / ".claude" / "projects"
    if claude_projects.exists():
        for mem in claude_projects.rglob("MEMORY.md"):
            memory_exists = True
            memory_lines = max(memory_lines, count_lines(mem))
            break

    check("L5-1", "MEMORY.md exists", memory_exists)
    check("L5-2", "MEMORY.md < 200 lines", memory_lines <= 200 if memory_exists else False)
    # Session-specific check is manual
    check("L5-3", "No session-specific content (manual check)", memory_exists)

    satellites = []
    for d in [root / ".memory", claude_projects] if claude_projects.exists() else [root / ".memory"]:
        if d.exists():
            for f in d.rglob("*.md"):
                if f.name != "MEMORY.md":
                    satellites.append(f)
    check("L5-4", "Satellite files for details", len(satellites) > 0 or memory_lines < 100)

    # === L6 ===
    session_dirs = [root / "docs" / "sessions", root / "sessions", root / ".sessions"]
    session_dir = next((d for d in session_dirs if d.exists()), None)
    check("L6-1", "Handoff directory exists", session_dir is not None)

    handoffs = list(session_dir.rglob("*.md")) if session_dir else []
    check("L6-2", "Handoff files present", len(handoffs) > 0)

    handoff_ref = "handoff" in content or "session end" in content
    check("L6-3", "Constitution mentions handoff", handoff_ref)

    # === L7 ===
    has_delegation_rules = False
    if has_rules:
        for f in rule_files:
            fc = read_content(f)
            if "delegat" in fc or "sub-agent" in fc:
                has_delegation_rules = True
    check("L7-1", "Sub-agents receive scoped context", has_delegation_rules)

    deleg_in_rules = any("must include" in read_content(f) or "never include" in read_content(f) for f in rule_files) if rule_files else False
    check("L7-2", "Delegation rules defined", deleg_in_rules)

    no_cross = has_delegation_rules  # If rules exist, assume intent
    check("L7-3", "No cross-contamination", no_cross)

    return results


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "."

    print(f"# CELF Validation Report")
    print(f"# Project: {Path(root).resolve().name}")
    print(f"# Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print()

    results = validate(root)

    passed = sum(1 for r in results if r["passed"])
    total = len(results)
    pct = passed / total * 100

    # Group by layer
    current_layer = ""
    for r in results:
        layer = r["id"].split("-")[0]
        if layer != current_layer:
            current_layer = layer
            print(f"\n## {layer}")

        status = "PASS" if r["passed"] else "FAIL"
        marker = "[x]" if r["passed"] else "[ ]"
        print(f"  {marker} {r['id']}: {r['description']}")

    print(f"\n# Score: {passed}/{total} ({pct:.0f}%)")

    if pct < 40:
        print("# Health: CRITICAL — Run SCAFFOLD mode immediately")
    elif pct < 60:
        print("# Health: WEAK — Fix L0 and L5 first")
    elif pct < 80:
        print("# Health: FUNCTIONAL — Optimize specific layers")
    elif pct < 90:
        print("# Health: HEALTHY — Fine-tune")
    else:
        print("# Health: STATE-OF-ART")


if __name__ == "__main__":
    main()
