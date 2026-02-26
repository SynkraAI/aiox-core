---
paths:
  - ".aios-core/**"
  - "packages/**"
  - "bin/**"
---

# IDS Principles — Detailed Rules

> Status: Planned (IDS epic is Draft — principles apply as aspirational guidance)

## Decision Hierarchy: REUSE > ADAPT > CREATE

### REUSE (Relevance >= 90%)
- Use existing artifact directly without modification
- Import/reference existing entity
- No justification needed beyond confirming match

### ADAPT (Relevance 60-89%)
- Adaptability score >= 0.6
- Changes MUST NOT exceed 30% of original artifact
- Changes MUST NOT break existing consumers (check usedBy list)
- Document changes in artifact's change log
- Update registry relationships
- Impact analysis required

### CREATE (No suitable match)
Required justification:
- `evaluated_patterns`: Existing entities you considered
- `rejection_reasons`: Why each was rejected (technical reasons)
- `new_capability`: What unique capability this provides
- Register in Entity Registry within 24 hours
- Establish relationships with existing entities
- Define adaptability constraints for future reuse

## Verification Gates G1-G6

### G1: Epic Creation (@pm)
- **Type:** Human-in-loop, Advisory
- **Trigger:** `*create-epic` workflow
- **Action:** Query registry for related entities, display potentially reusable artifacts
- **Latency:** < 24h (async)
- **Blocking:** No

### G2: Story Creation (@sm)
- **Type:** Human-in-loop, Advisory
- **Trigger:** `*draft` workflow
- **Action:** Check existing tasks/templates matching story work
- **Latency:** < 24h (async)
- **Blocking:** No

### G3: Story Validation (@po)
- **Type:** Human-in-loop, Soft Block
- **Trigger:** `*validate-story-draft` workflow
- **Action:** Verify referenced artifacts exist, detect potential duplication
- **Latency:** < 4h (async)
- **Blocking:** Soft (can override with reason)

### G4: Dev Context (@dev)
- **Type:** Automated, Informational
- **Trigger:** Story assignment / `*develop` start
- **Action:** Display matching patterns as reminder
- **Latency:** < 2s
- **Blocking:** NO (logged only for metrics)

### G5: QA Review (@qa)
- **Type:** Automated, Blocks Merge
- **Trigger:** PR/merge request
- **Action:** Check if new artifacts could have reused existing
- **Latency:** < 30s
- **Blocking:** YES if new entity without registry entry or justification

### G6: CI/CD (@devops)
- **Type:** Automated, Blocks Merge
- **Trigger:** CI pipeline
- **Action:** Registry integrity check + sync
- **Latency:** < 60s
- **Blocking:** YES on CRITICAL, WARN on MEDIUM/LOW

## Override Policy

**Command:** `--override-ids --override-reason "explanation"`

**Permitted when:**
- Time-critical fix requires immediate creation
- Adaptation would introduce unacceptable risk
- Existing artifact is deprecated/frozen

**Requirements:**
- Logged for audit trail
- Reviewed within 7 days
- Include override reason in gate verification log

## Graceful Degradation

All gates implement circuit breaker:
- **Timeout:** 2s default
- **On timeout:** warn-and-proceed
- **On error:** log-and-proceed
- **Key principle:** Development NEVER blocked by IDS failures

```yaml
circuit_breaker:
  failure_threshold: 5
  success_threshold: 3
  reset_timeout_ms: 60000
```

## Article IV-A: Incremental Development (Constitution Amendment)

**Severity:** MUST

**Four Core Rules:**
1. **Registry Consultation Required** — Query before creating
2. **Decision Hierarchy** — REUSE > ADAPT > CREATE strictly
3. **Adaptation Limits** — Changes < 30%, don't break consumers
4. **Creation Requirements** — Full justification, register within 24h

**Reference:** `docs/stories/epics/epic-ids-incremental-development/`
