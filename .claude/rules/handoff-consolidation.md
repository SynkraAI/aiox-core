# Handoff Consolidation — Rule

## Purpose

Prevent proliferation of individual handoff YAMLs in long-running pipelines (epics that span 5+ sessions). Consolidate older handoffs into a single `RUN-LOG.md` per epic/pipeline to maintain readability while preserving full history.

## When This Applies

- Any pipeline (epic, multi-wave initiative) accumulating handoffs in `.aiox/handoffs/`
- Triggered when **5 or more** handoff YAMLs exist for the same pipeline
- Applies regardless of agent (any agent generating handoffs must observe)

## Trigger Threshold

| Handoff count for pipeline | Action |
|---|---|
| 1-4 | Keep as individual YAMLs |
| **5+** | **MUST consolidate** older handoffs into `RUN-LOG.md` |
| 5+ recurrente | Reconsolidar a cada 5 novos handoffs |

## Consolidation Procedure

### Step 1 — Identify pipeline handoffs

Pipelines are grouped by:
- `pipeline_id` field in handoff YAML, OR
- Filename pattern `handoff-{date}-{pipeline-slug}-{wave}.yaml`, OR
- `INDEX-{pipeline-slug}.md` file referencing them

### Step 2 — Create RUN-LOG.md (if not exists)

Location options (in priority order):
1. `business-ai-first/docs/stories/epics/{epic-folder}/RUN-LOG.md` (preferred for epic-bound pipelines)
2. `business-ai-first/docs/runlogs/{pipeline-slug}-RUN-LOG.md` (for cross-epic pipelines)
3. `.aiox/run-logs/{pipeline-slug}-RUN-LOG.md` (for framework-level pipelines)

### Step 3 — Append summarized waves

For each handoff being consolidated, append a section to `RUN-LOG.md`:

```markdown
## Wave {N}: {wave_goal} — {date}

**Status:** ✅ DONE | ⚠️ BLOCKED | 🔄 PARTIAL
**Session:** {session_id or hash}
**Agent:** {primary agent}
**Effort:** {actual hours}

### Delivered
- {bullet list of files created/modified}
- {ACs completed with IDs}

### Decisions
- {key architectural/process decisions, link to ADR if applicable}

### Blockers Resolved
- {what got unblocked this wave}

### Carry-forward to next wave
- {open items, not blockers}

### Original handoff
Archived: `.aiox/handoffs/_archive/{filename}.yaml` (or deleted if redundant)
```

### Step 4 — Archive or delete originals

Two options:
- **Archive** (safer): move YAMLs to `.aiox/handoffs/_archive/{pipeline-slug}/` — preserves audit trail
- **Delete** (cleaner): only if RUN-LOG.md captures everything materially relevant — reduces clutter

**Default: archive**, unless pipeline owner explicitly authorizes deletion.

### Step 5 — Update INDEX

Update the pipeline's `INDEX-*.md` (or epic README) to reference RUN-LOG.md instead of individual handoffs.

## What MUST be Preserved

In RUN-LOG.md, never lose:
- ❗ Strategic context (why this pipeline exists)
- ❗ Architectural decisions (link to ADRs)
- ❗ Resolved blockers (so they don't get re-investigated)
- ❗ Schema/migration changes applied to prod
- ❗ Open items that next session must address
- ❗ Files created/modified per wave (path list, not content)

## What CAN be Discarded

In consolidation, drop:
- Verbose investigation steps (kept the conclusion, not the search)
- Rejected alternatives that were already decided
- Tool call sequences (kept the outcome, not the recipe)
- Repeated context that lives in the master plan or ADRs

## Latest Handoff Stays Individual

The **most recent** handoff for an active pipeline stays as `handoff-{latest}.yaml` even after consolidation. RUN-LOG.md is for closed waves. The active handoff is what the next session reads first.

## Example Structure (after consolidation)

```text
.aiox/handoffs/
├── INDEX-meta-messaging-pipeline.md       (refs RUN-LOG)
├── handoff-2026-05-15-wave6-current.yaml  (latest, active)
└── _archive/
    └── meta-messaging/
        ├── handoff-2026-05-06-wave1.yaml
        ├── handoff-2026-05-08-wave2.yaml
        ├── handoff-2026-05-10-wave3.yaml
        ├── handoff-2026-05-12-wave4.yaml
        └── handoff-2026-05-14-wave5.yaml

business-ai-first/docs/stories/epics/epic-013-portal-replacement/
└── RUN-LOG.md   (waves 1-5 consolidated, narrative form)
```

## Authority

- **Any agent** can consolidate when threshold hit
- **No agent** may delete originals without explicit pipeline owner authorization
- **@devops** owns enforcement during git push reviews

## Anti-patterns (DO NOT)

- ❌ Consolidate active handoff (the one next session must read)
- ❌ Lose blocker resolutions in summarization
- ❌ Skip ADR cross-references
- ❌ Consolidate before threshold (premature)
- ❌ Mix multiple pipelines in one RUN-LOG (each pipeline = own log)

## Migration of Existing Handoffs

Existing handoff YAMLs that predate this rule should be consolidated retroactively when they cross the 5+ threshold for their pipeline. No need to consolidate orphaned/standalone handoffs.

---

**Established:** 2026-05-06 (during meta-messaging pipeline Wave 1 → Wave 2 transition)
**Owner:** @aiox-master (Orion)
**Enforced by:** all agents during handoff generation; @devops during PR review
