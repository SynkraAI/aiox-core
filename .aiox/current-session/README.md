# Current Session Runtime Artifacts

This directory contains **runtime-only** artifacts for the current Claude Code session.
These files are gitignored and regenerated automatically by hooks.

## Files

### micro-handoff.json (Tier 1)

Created automatically when an agent switch (`@agent`) is detected.
Contains: from/to agent, story context, decisions, files modified, blockers, next action.
Schema enforced: max 5 decisions, 10 files, 3 blockers.

### state.yaml (Tier 2)

Append-only YAML timeline of session events.
Updated automatically every 5 messages and on milestone events.
Events: agent_switch, story_start, story_complete, qa_gate, commit, periodic.

## Lifecycle

- Created: On first relevant trigger in a session
- Updated: Automatically by hooks (UserPromptSubmit, PreCompact)
- Archived: On session end or `/compact`, state moves to `.aiox/session-history/`
- Deleted: Safe to delete at any time (will be regenerated)

## Reference

See `.claude/rules/unified-handoff.md` for the full 3-tier specification.
