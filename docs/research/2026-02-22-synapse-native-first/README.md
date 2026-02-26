# Research: SYNAPSE Native-First Migration

**Date:** 2026-02-22
**Context:** Pre-story research for NOG-18
**Method:** 4 parallel tech-search agents + local codebase analysis

## Research Streams

| # | Topic | Key Finding |
|---|-------|-------------|
| 1 | Claude Code Docs & Version | v2.1.50 (current). Native per-agent memory, 17 hooks, skills preloading, path-scoped rules |
| 2 | Agent Memory Location | `.aios-core/development/agents/{id}/MEMORY.md` as canonical + `@import` bridge. No IDE has per-agent memory natively |
| 3 | Rules & Context Injection | `paths:` glob conditional, `skills:` preload in frontmatter, SessionStart hooks for greeting |
| 4 | SYNAPSE-like Engines | No tool matches 8-layer architecture. Industry converged on file-based markdown. Brackets overkill |

## Claude Code 2.1.50 Native Features

### Agent Frontmatter (`.claude/agents/*.md`)
```yaml
---
name: dev
description: Full Stack Developer
tools: Read, Write, Edit, Glob, Grep, Bash
model: inherit
permissionMode: default
skills:
  - coding-standards
hooks:
  PreToolUse:
    - matcher: "Bash(git push*)"
      hooks:
        - type: command
          command: "./scripts/block-push.sh"
memory: project
---
```

### Memory Hierarchy
| Type | Location | Shared | Auto-loaded |
|------|----------|--------|-------------|
| Project CLAUDE.md | `./CLAUDE.md` | Team | Always, full |
| Project rules | `./.claude/rules/*.md` | Team | Always or conditional (`paths:`) |
| Auto memory | `~/.claude/projects/<proj>/memory/MEMORY.md` | Just you | First 200 lines |
| Agent memory | `.claude/agent-memory/<name>/` or `~/.claude/agent-memory/<name>/` | Depends on scope | First 200 lines |

### 17 Hooks
SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, PostToolUse, PostToolUseFailure, Notification, SubagentStart, SubagentStop, Stop, TeammateIdle, TaskCompleted, ConfigChange, WorktreeCreate, WorktreeRemove, PreCompact, SessionEnd

### Rules with Path Scoping
```yaml
---
paths:
  - "src/api/**/*.ts"
  - "tests/**/*.test.ts"
---
```
Rules without `paths:` load unconditionally. Rules with `paths:` only load when working on matching files.

## Industry Comparison

| Feature | SYNAPSE | Cursor | Claude Code Native |
|---------|---------|--------|--------------------|
| Layers | 8 | 4 (.mdc numbered) | 3 (CLAUDE.md hierarchy) |
| Injection | Deterministic | Probabilistic | Deterministic (rules) |
| Agent memory | Custom session | None | Native (`memory:` frontmatter) |
| Brackets | 4-tier (FRESH/MOD/DEP/CRIT) | None | Auto-compact at ~95% |
| Context budget | Custom tracking | None | Status line + `/compact` |
| Cross-IDE | SYNAPSE only | Cursor only | `.claude/` + `@import` |

## Decision Matrix

| Component | Decision | Rationale |
|-----------|----------|-----------|
| L0-L2 (Constitution/Global/Agent) | KEEP as rules | Already working, 70 rules, <0.5ms |
| L3-L7 (Workflow/Task/Squad/Keyword/Star) | DISABLE (config) | 0 rules produced, zero value |
| Brackets | REMOVE | `/compact` native, 200k = FRESH for 40+ prompts |
| Memory/Session | REPLACE | `memory: project` + canonical MEMORY.md |
| Greeting Builder | REPLACE | Agent body instructions + SessionStart hooks |
| UAP projectStatus | REMOVE | gitStatus native in system prompt |
| UAP git execSync | FIX | `.git/HEAD` fs.existsSync |
| agentAlwaysLoadFiles | REPLACE | `skills:` in agent frontmatter |

## Memory Location Decision

**Winner: `.aios-core/development/agents/{id}/MEMORY.md`**

| Factor | `.claude/agent-memory/` | `.aios-core/agents/{id}/` |
|--------|------------------------|---------------------------|
| Auto-discovery Claude Code | NO (only `~/.claude/projects/`) | NO (needs `@import`) |
| Cross-IDE | POOR (Claude-specific) | GOOD (any IDE via ideSync) |
| Colocation with agent | NO | YES |
| Version control | Depends on .gitignore | YES (framework dir) |

Bridge for Claude Code: `.claude/rules/agent-memory-imports.md` with `@import` references.

## AGENTS.md Standard

Emerging cross-IDE standard adopted by OpenAI Codex, Sourcegraph Amp, Sentry.
Migration pattern: `ln -s AGENTS.md CLAUDE.md` (future story, not NOG-18).

## Sources

- [Claude Code Overview](https://code.claude.com/docs/en/overview)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code Memory](https://code.claude.com/docs/en/memory)
- [Anthropic Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Chroma Context Rot Research](https://research.trychroma.com/context-rot)
- [AGENTS.md Standard](https://layer5.io/blog/ai/agentsmd-one-file-to-guide-them-all/)
- [Cursor Rules Guide](https://medium.com/@peakvance/guide-to-cursor-rules-engineering-context-speed-and-the-token-tax-16c0560a686a)
- [Martin Fowler - Context Engineering for Coding Agents](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)
