---
name: celf-context
description: >
  Diagnose, scaffold, and validate context engineering architecture for any Claude Code
  project using the CELF (Context Engineering Layered Framework). Implements 8-layer
  hierarchy (L0-L7) with epistemic classification, token budgets, and veto conditions.
  Use when: (1) setting up a new Claude Code project from scratch, (2) auditing an
  existing project's context health, (3) fixing context bloat or session amnesia,
  (4) implementing CLAUDE.md + memory + state management, (5) scaling from solo to
  multi-agent architecture, (6) running a context health check.
  Domains: context engineering, CLAUDE.md, memory, state, layers, scaffolding, audit,
  project setup, context optimization, configuration.
---

# CELF — Context Engineering Layered Framework

Universal configurator for Claude Code projects. Transforms any folder into a
state-of-art context-engineered workspace.

**3 modes. 1 goal: right information, right layer, right moment.**

## Activation

On invoke, determine mode from user intent:

| User says | Mode | Action |
|-----------|------|--------|
| "setup", "configure", "scaffold", "new project" | **SCAFFOLD** | Build from zero |
| "diagnose", "audit", "check", "health" | **DIAGNOSE** | Analyze existing project |
| "validate", "verify", "score" | **VALIDATE** | Score against CELF rubric |
| Ambiguous | Ask: "Want me to (1) set up from scratch, (2) audit what exists, or (3) validate against CELF?" |

---

## Mode 1: DIAGNOSE

Scan the project and produce a layer-by-layer health report.

### Step 1: Scan

Run `python scripts/diagnose.py` on the project root. This produces a machine-readable
scan of what exists: files, sizes, patterns detected.

If the script is unavailable, scan manually:

```
CHECK EACH LAYER:

L0 Constitution:
  - CLAUDE.md exists? (global + project)
  - Line count (target: < 200)
  - Contains: decision levels? circuit breakers? anti-patterns?
  - Anti-pattern: business rules in constitution?

L1 Knowledge Graph:
  - .brain/ or knowledge/ exists?
  - Entry point file? (BRAIN.yaml, INDEX.yaml)
  - Schema defined?
  - Entities as individual files?

L2 Intelligence:
  - inputs/intelligence/ or similar?
  - P0 files with real evidence?
  - Verbatims present?

L3 Project State:
  - STATE.yaml or equivalent?
  - Phase definitions?
  - DECISIONS.md?

L4 Heuristics:
  - .claude/rules/ present?
  - Agent definitions?
  - Task definitions with inputs/outputs?

L5 Memory:
  - MEMORY.md exists?
  - Under 200 lines?
  - Satellite files for details?

L6 Session:
  - Handoff protocol?
  - docs/sessions/ or similar?

L7 Delegation:
  - Sub-agent isolation?
  - Scoped context per delegation?
```

### Step 2: Score

Score each layer 0-3:

| Score | Meaning |
|-------|---------|
| 0 | Missing entirely |
| 1 | Exists but broken (anti-patterns present) |
| 2 | Functional (meets minimum requirements) |
| 3 | State-of-art (follows all CELF principles) |

### Step 3: Report

Output format:

```
## CELF Diagnostic Report

Project: {name}
Profile: {SOLO | MEDIUM | ENTERPRISE}
Date: {date}
Overall Score: {sum}/24

| Layer | Score | Status | Key Issue |
|-------|-------|--------|-----------|
| L0 Constitution | {0-3} | {emoji} | {one-line issue or "OK"} |
| L1 Knowledge | {0-3} | {emoji} | ... |
| L2 Intelligence | {0-3} | {emoji} | ... |
| L3 State | {0-3} | {emoji} | ... |
| L4 Heuristics | {0-3} | {emoji} | ... |
| L5 Memory | {0-3} | {emoji} | ... |
| L6 Session | {0-3} | {emoji} | ... |
| L7 Delegation | {0-3} | {emoji} | ... |

### Anti-Patterns Detected
- {AP-XX}: {description} → {fix}

### Priority Actions (top 3)
1. {highest impact fix}
2. {second}
3. {third}
```

### Step 4: Recommend

Based on profile, recommend next mode:
- Score < 8 → "Run SCAFFOLD mode to build foundation"
- Score 8-16 → "Fix priority actions, then VALIDATE"
- Score > 16 → "Run VALIDATE for fine-tuning"

---

## Mode 2: SCAFFOLD

Interactive wizard that builds the right structure for the project.

### Step 1: Profile Detection

Ask the user (or detect from existing files):

```
PROFILE QUESTIONS:
1. "Is this a solo project, team project, or multi-agent system?"
2. "What does this project do in one sentence?"
3. "Do you have existing CLAUDE.md or context files?"
```

Map to profile:

| Profile | Layers Active | Complexity |
|---------|--------------|------------|
| **SOLO** | L0, L1 (minimal), L5 | 4-6 files total |
| **MEDIUM** | L0-L5 | 10-15 files |
| **ENTERPRISE** | L0-L7 | 20+ files, squads, delegation |

### Step 2: Build Foundation (L0)

Load `references/templates/claude-md-{profile}.md` and customize.

**SOLO CLAUDE.md** (~50 lines):
- Identity (who you are, what you do, for whom)
- 3-5 behavioral rules
- Key paths
- Context loading pointers

**MEDIUM CLAUDE.md** (~120 lines):
- Identity + strategic lens
- Decision levels (3-tier)
- Routing table (request → handler)
- Context loading protocol
- Critical rules + anti-patterns

**ENTERPRISE CLAUDE.md** (~180 lines):
- Full routing (L1 engine → L2 agent)
- Model routing
- Execution cycle
- Delegation rules
- Quality gates

**Rules for ALL profiles:**
- Never exceed 200 lines
- No business facts (those go in L1)
- Pointers to on-demand files, not inline content
- Decision levels always explicit

### Step 3: Build Knowledge Graph (L1)

Create entry point + schema + minimum entities.

```
For SOLO:
  .brain/BRAIN.yaml (or knowledge/INDEX.yaml)
    → 1 product entity
    → 1 persona entity

For MEDIUM:
  .brain/
    BRAIN.yaml
    schema/entities.yaml
    entities/
      products/{main}.yaml
      personas/{icp}.yaml

For ENTERPRISE:
  Full .brain/ with schema, relationships, multiple entities
```

Ask the user for:
- Product name, price, core promise
- Ideal customer (1-2 sentences)

Generate YAML entities from answers.

### Step 4: Build Intelligence Layer (L2)

For SOLO and above, create:
```
inputs/intelligence/
  P0-customer-voice.md    # Template with sections for real verbatims
```

Tell user: "Fill this with REAL customer quotes. Screenshots of DMs, reviews,
comments. Minimum 15 quotes. This is the #1 thing that makes AI output specific
instead of generic."

### Step 5: Build State (L3)

For MEDIUM and above:
```
projects/{name}/
  STATE.yaml      # Current phase, decisions, next steps
  INDEX.md        # Map of all project artifacts
  DECISIONS.md    # Append-only decision log
```

### Step 6: Build Heuristics (L4)

For MEDIUM and above:
```
.claude/rules/
  anti-loop.md    # Circuit breaker rules
  {domain}.md     # Domain-specific rules
```

For ENTERPRISE:
```
.claude/rules/
  anti-loop.md
  routing.md           # Request → agent routing
  delegation.md        # What to include per agent type
  quality-gates.md     # Gate criteria
```

### Step 7: Configure Memory (L5)

For ALL profiles:
- Verify MEMORY.md location and format
- If doesn't exist, explain auto-memory to user
- Recommend satellite file structure if needed

### Step 8: Session Protocol (L6)

For MEDIUM and above:
```
docs/sessions/    # Handoff directory
```

Add handoff rule to CLAUDE.md: "Create handoff at session end."

### Step 9: Summary

Output what was created, file-by-file, with layer classification.

---

## Mode 3: VALIDATE

Re-audit against the full CELF checklist (Section 9 of framework).

### Process

1. Run diagnose scan (same as Mode 1)
2. Score against full rubric (load `references/validation-rubric.md`)
3. Compare with previous score if baseline exists
4. Output detailed report with pass/fail per criterion

### Rubric (30 criteria)

Load from `references/validation-rubric.md`. Each criterion is binary (pass/fail).
Overall health = passed / total.

| Health | Range | Action |
|--------|-------|--------|
| Critical | < 40% | Immediate scaffold needed |
| Weak | 40-60% | Fix L0 and L5 first (highest leverage) |
| Functional | 60-80% | Optimize specific layers |
| Healthy | 80-90% | Fine-tune, add quality gates |
| State-of-art | > 90% | Maintain, iterate |

---

## Universal Principles (apply in ALL modes)

### 5 Axioms (non-negotiable)

1. **Context has cost** — Every token loaded is a token unavailable for reasoning
2. **Context has epistemic status** — AXIOM > FACT > EVIDENCE > HEURISTIC > INFERENCE > SPECULATION
3. **Context is hierarchical** — 8 layers (L0-L7) with distinct properties
4. **Context flows one direction** — Top-down by default; upward only through explicit promotion
5. **Context without owner doesn't exist** — No owner = no maintenance = decay

### Profile Adaptation Rule

Never build more than the profile needs. SOLO doesn't need squads.
Enterprise doesn't need simplification. The framework adapts by **elimination**,
not by simplification.

### The 200-Line Law

CLAUDE.md > 200 lines = attention dilution. This is the single most common
anti-pattern. Everything beyond 200 lines must be a pointer to an on-demand file.

---

## References (loaded on-demand)

| Need | File |
|------|------|
| Full framework theory | `references/celf-framework.md` |
| Layer specifications | `references/layer-specs.md` |
| Profile definitions | `references/profiles.md` |
| Anti-pattern catalog | `references/anti-patterns.md` |
| Validation rubric | `references/validation-rubric.md` |
| CLAUDE.md templates | `references/templates/claude-md-*.md` |
| BRAIN.yaml template | `references/templates/brain-yaml.md` |
| STATE.yaml template | `references/templates/state-yaml.md` |
