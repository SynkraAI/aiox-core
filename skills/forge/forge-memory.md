# Forge Memory — Learning Between Runs

> O Forge que roda hoje é melhor que o de ontem porque lembra o que aprendeu.

---

## 1. Load Protocol

At the start of every Forge run, check for existing learnings.

### Step 1: Find learnings file

```
Path: .aios/memory/forge/learnings.yaml (relative to project root / cwd)
```

If file does not exist → skip silently. First run in this project, no learnings yet.
If YAML parse fails → log warning, proceed without learnings. NEVER block the run.

### Step 2: Filter by project

Filter entries where `project` matches current working directory.
This ensures learnings from Project A don't leak into Project B.

### Step 3: Select top N

Sort by `timestamp` descending (most recent first).
Select top `config.inject_top_n` entries (default: 5).

### Step 4: Build Memory Briefing

Group selected learnings by category and format as a concise briefing:

```
━━━ Forge Memory Briefing ━━━

📚 Learnings from {N} previous runs in this project:

Tech Decisions:
  • Next.js + Drizzle worked well (run forge-app-20260320)
  • User prefers Supabase over raw PostgreSQL

Error Patterns:
  • Prisma migrations fail with circular refs → break into 2 migrations
  • TypeScript strict mode causes 40% more @dev retries

Agent Performance:
  • @dev: 2.3 retries/story average (consider opus model)
  • @qa: 95% first-pass rate (excellent)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 5: Inject into context

The briefing is available for ALL agent dispatches during this run.
Agents can reference learnings when making decisions:
- @architect: use tech decisions to inform architecture
- @dev: be aware of error patterns to avoid repeating them
- @sm: consider story complexity based on past retry rates

---

## 2. Save Protocol

After a Forge run completes, extract and save learnings.

### Step 1: Extract from state.json

Read the completed run's state.json and extract 4 categories:

**Tech Decisions:**
- Read `tech_decisions` field (if exists)
- Capture: technology, decided_by (forge/user), reasoning
- If user overrode Forge's recommendation: capture both original and override
- Tag: technology names (e.g., "nextjs", "drizzle", "supabase")

**Error Patterns:**
- Read `errors[]` array
- For each RESOLVED error: error_type, root_cause, resolution, agent
- Skip unresolved errors (they indicate the run was interrupted)
- Tag: error type + technology involved

**Agent Performance:**
- Calculate @dev retry rate: sum of retry_count across all errors / total stories
- Calculate escalation count: how many times @architect or @data-engineer were called for recovery
- Note: high retry rate on specific technologies is a valuable learning

**Quality Gate Results:**
- Read `plugins.*` for quality gate plugin results
- Capture: which gates passed, which had CONCERNS, which were SKIPPED
- Tag: gate name + result

**Estimation Accuracy (se `source_dry_run` existir no state.json):**
- Comparar `source_dry_run.simulation_estimate.stories` com o total real de stories completadas
- Calcular `accuracy_ratio` = real / estimado (1.0 = perfeito, >1.5 = subestimou, <0.5 = superestimou)
- Esse learning é consumido pelo dry-run.md SIM-2 em runs futuros para calibrar estimativas
- Tag: "estimation", "dry-run"

### Step 2: Format as learnings

Each extracted insight becomes one entry in the learnings file:

```yaml
- id: "learn-{NNN}"
  run_id: "{run_id from state.json}"
  project: "{absolute path to project}"
  timestamp: "{ISO 8601 of run completion}"
  category: "tech_decision | error_pattern | agent_performance | quality_gate | estimation_accuracy"
  content: "{human-readable description of the learning}"
  resolution: "{how it was resolved, if applicable}"
  tags: ["tag1", "tag2"]
```

### Step 3: Append to file

- Path: `.aios/memory/forge/learnings.yaml`
- Create directory `.aios/memory/forge/` if it does not exist
- Append new entries to the `learnings:` array
- Use atomic write pattern (.tmp → rename) to prevent corruption

### Step 4: Enforce limits

If total entries for THIS project exceed `max_entries` (default: 50):
- Remove oldest entries from this project
- Keep entries from other projects untouched
- Prefer keeping error_pattern entries (they prevent mistakes)
- Prefer removing agent_performance entries (they become stale faster)

---

## 3. Error Learning

When an error occurs and is resolved during a run, capture it immediately.

### Trigger

This section fires on `on:error` hook — whenever error recovery successfully resolves an error.

### What to capture

```yaml
error_pattern:
  error_type: "{ARCHITECTURE_ERROR | DB_ERROR | REQUIREMENT_ERROR | STUCK | GENERIC_ERROR}"
  phase: 3
  story_id: "1.2"
  root_cause: "Prisma schema had circular reference between User and Organization"
  resolution: "Split into two migrations: create tables first, add foreign keys second"
  agent_that_fixed: "@data-engineer"
  timestamp: "2026-04-03T15:30:00Z"
```

### Where to store

Buffer in `state.json → plugins.forge_memory.error_patterns[]`.

This is important: errors are captured in state.json (which persists even if the run is interrupted), then flushed to the learnings file at `after:run`. If the run is interrupted, the patterns survive in state.json and can be recovered on resume.

### What NOT to capture

- Unresolved errors (the run was interrupted — we don't know the fix)
- Lint/typecheck errors that self-resolved on retry (too noisy)
- PO score adjustments (these are subjective, not technical learnings)
