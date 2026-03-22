# Framework Map — Complete Navigation Reference

## 4-Layer Boundary System

| Layer | Mutability | Paths | Enforced By |
|-------|-----------|-------|-------------|
| **L1** Framework Core | **NEVER** modify | `.aiox-core/core/`, `constitution.md`, `bin/` | deny rules |
| **L2** Framework Templates | **NEVER** (extend-only) | `.aiox-core/development/{tasks,templates,checklists,workflows}/` | deny rules |
| **L3** Project Config | **Mutable** (with care) | `.aiox-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml` | allow rules |
| **L4** Project Runtime | **ALWAYS** mutable | `docs/stories/`, `packages/`, `squads/`, `tests/` | working area |

**Toggle:** `core-config.yaml` → `boundary.frameworkProtection: true/false`

---

## Component Locator

| Component | Location | Count |
|-----------|----------|-------|
| Agent definitions | `.aiox-core/development/agents/{id}/` | 11 core |
| Agent memory | `.aiox-core/development/agents/{id}/MEMORY.md` | per agent |
| Executable tasks | `.aiox-core/development/tasks/` | 238+ |
| Workflow definitions | `.aiox-core/development/workflows/` | 14 |
| Templates | `.aiox-core/development/templates/` | 11 |
| Checklists | `.aiox-core/development/checklists/` | 9 |
| Constitution | `.aiox-core/constitution.md` | 1 |
| Rules | `.claude/rules/` | 8+ |
| Handoff artifacts | `.aios/handoffs/` | runtime |
| Squads | `squads/` | 60+ |
| Commands | `.claude/commands/` | 60+ |
| Skills | `skills/` | 28 |
| Core config | `core-config.yaml` | 1 |
| Workflow chains | `.aiox-core/data/workflow-chains.yaml` | 1 |
| Knowledge base | `.aiox-core/data/aios-kb.md` | 1 |
| Stories | `docs/stories/{active,completed}/` | varies |
| PRDs | `docs/prd/` | varies |
| Projects | `docs/projects/` | varies |
| Mind clones | `squads/mind-cloning/minds/` | 36 |

---

## Task Resolution Pattern

```
User request
  → Match to agent command
  → Resolve to task file via dependencies
  → Path: .aiox-core/development/{type}/{name}

Example:
  "draft story" → @sm *draft → create-next-story.md
  → .aiox-core/development/tasks/create-next-story.md
```

---

## Rules System

| Rule File | Description | Auto-loads When |
|-----------|-------------|----------------|
| `agent-authority.md` | Delegation matrix, exclusive ops | Agent context |
| `agent-handoff.md` | Context compaction protocol | Agent switching |
| `behavioral-rules.md` | NEVER/ALWAYS behavioral rules | Always |
| `pt-br-quality.md` | Portuguese orthography | Always |
| `story-lifecycle.md` | Story transitions, quality gates | Story files |
| `mcp-usage.md` | MCP tool selection priority | Tool usage |

---

## Checklists

| Checklist | Used By | When |
|-----------|---------|------|
| `story-draft-checklist.md` | @sm | Before @po review |
| `story-dod-checklist.md` | @dev/@qa | Definition of Done |
| `po-master-checklist.md` | @po | Story validation (10 pts) |
| `pre-push-checklist.md` | @devops | Before push |
| `self-critique-checklist.md` | @dev | Self-review |
| `agent-quality-gate.md` | All | Agent activation quality |

---

## MCP & Tool Priority

### Native First (ALWAYS)

| Task | Tool |
|------|------|
| Read files | `Read` |
| Write/edit files | `Write` / `Edit` |
| Run commands | `Bash` |
| Search files | `Glob` |
| Search content | `Grep` |

### MCP Servers

| MCP | Purpose |
|-----|---------|
| Playwright | Browser automation |
| EXA | Web search |
| Google Workspace | Sheets, Drive, Calendar, Gmail |
| Figma | Design files |
| Pencil | .pen design files |
| ClickUp | Project management |

---

## Handoff Protocol

### When Switching Agents

1. **Outgoing** generates YAML artifact:
   ```yaml
   handoff:
     from_agent: "{current}"
     to_agent: "{new}"
     story_context:
       story_id: "{id}"
       story_status: "{status}"
       current_task: "{task}"
       branch: "{branch}"
     decisions: [max 5]
     files_modified: [max 10]
     blockers: [max 3]
     next_action: "{suggested command}"
   ```

2. **Incoming** receives: full persona + compact handoff (~379 tokens)
3. **Savings:** ~33% per switch, ~57% after 2 switches
4. **Storage:** `.aios/handoffs/handoff-{from}-to-{to}-{timestamp}.yaml`
5. **Retention:** Max 3 artifacts (oldest discarded on 4th)

---

## Quick Navigation Commands

| Need | Command/Path |
|------|-------------|
| Find a squad | `/find-squad` |
| Find a skill | `skills/` |
| Find a task | `.aiox-core/development/tasks/` |
| Find a workflow | `.aiox-core/development/workflows/` |
| Find an agent | `.aiox-core/development/agents/` |
| Find a mind clone | `squads/mind-cloning/minds/INDEX.md` |
| Find project state | `docs/projects/ACTIVE.md` |
| Find active stories | `docs/stories/active/` |

---

## Configuration

| File | Purpose |
|------|---------|
| `core-config.yaml` | Framework config, boundary protection toggle |
| `.claude/settings.json` | IDE-level deny/allow rules |
| `.claude/CLAUDE.md` | Project instructions |
| `.claude/rules/*.md` | Contextual rules (auto-loaded) |
