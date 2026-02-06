# SM Handoff: Create IDS Epic Stories

**Date:** 2026-02-05
**From:** @po (Pax)
**To:** @sm (River)
**Purpose:** Create Epic IDS (Incremental Development System) stories

---

## Quick Start for @sm

```
@sm *draft

Create the Epic IDS (Incremental Development System) with 6 stories.
Source: ADR-IDS-001 (docs/architecture/adr/adr-ids-001-incremental-development-system.md)
```

---

## Epic Overview

**Epic ID:** EPIC-IDS
**Title:** Incremental Development System
**ADR Reference:** `docs/architecture/adr/adr-ids-001-incremental-development-system.md`

### Problem Statement

> "Humans develop incrementally; AI agents develop generationally"

AI agents tend to generate new code rather than reusing/adapting existing artifacts, creating duplication, drift, and technical debt.

### Solution

Implement an IDS with:
1. Entity Registry System (ERS) - centralized artifact tracking
2. Incremental Decision Engine - REUSE > ADAPT > CREATE hierarchy
3. Self-Updating hooks
4. Self-Healing background verification
5. Six Verification Gates
6. Constitution Amendment (Article IV-A)

---

## Stories to Create

### Story IDS-1: Entity Registry Foundation

**Priority:** Critical | **Complexity:** Medium | **Estimate:** 8h

**User Story:**
As a framework maintainer, I want a centralized registry of all AIOS entities (tasks, templates, scripts, modules, agents), so that I can query, track relationships, and understand adaptability of existing artifacts.

**Key Acceptance Criteria:**
1. `entity-registry.yaml` schema defined
2. RegistryLoader class with query methods
3. Population script for initial ~100 entities
4. Query by keywords, type, path, purpose
5. Relationship tracking (usedBy, dependencies)
6. Performance: <100ms for typical queries
7. CLI commands: `aios ids:stats`, `aios ids:backup`, `aios ids:restore`, `aios ids:sync`

**Executor:** @dev | **Quality Gate:** @architect

---

### Story IDS-2: Incremental Decision Engine

**Priority:** Critical | **Complexity:** High | **Estimate:** 14h

**User Story:**
As a developer or AI agent, I want a decision engine that analyzes my intent and recommends REUSE, ADAPT, or CREATE based on existing artifacts, so that I make informed incremental decisions.

**Key Acceptance Criteria:**
1. IncrementalDecisionEngine class with `analyze(intent, context)`
2. TF-IDF semantic matching algorithm
3. Decision matrix: REUSE (≥90%), ADAPT (60-89% + constraints), CREATE (<60%)
4. Impact analysis (% of affected entities)
5. CLI: `aios ids:query {intent}`
6. **CREATE justification required** (Roundtable #4)
7. **30-day review automation for CREATEs** (Roundtable #4)
8. Performance: <500ms

**Special Notes:**
- 30% adaptation threshold is empirical - add calibration tracking
- CREATE decisions must include: evaluated_patterns, rejection_reasons, new_capability

**Executor:** @dev | **Quality Gate:** @architect

---

### Story IDS-3: Self-Updating Registry

**Priority:** High | **Complexity:** Medium | **Estimate:** 6h

**User Story:**
As a framework maintainer, I want the registry to automatically update when files are created, modified, or deleted, so that the registry stays current without manual maintenance.

**Key Acceptance Criteria:**
1. RegistryUpdater class with file watchers
2. Git hook integration (post-commit)
3. Agent task completion hooks
4. Updates within 5s of file changes
5. Concurrency handling with file locking

**Executor:** @dev | **Quality Gate:** @qa

---

### Story IDS-4: Self-Healing Registry (Expanded Scope)

**Priority:** High | **Complexity:** High | **Estimate:** 12h

**User Story:**
As a framework maintainer, I want the registry to automatically detect integrity issues and auto-fix simple problems while warning me about complex ones, so that the registry remains accurate.

**Key Acceptance Criteria:**
1. RegistryHealer class with `runHealthCheck()`
2. **Data Integrity:** missing files, checksum mismatches, orphaned refs
3. **Performance Integrity:** query latency >100ms, cache hit <70%, index staleness (Roundtable #6B)
4. **Quality Integrity:** near-duplicates >95%, stale entities 90d, false CREATEs 60d (Roundtable #6C)
5. Auto-healing for simple issues
6. User warnings for complex issues
7. CLI: `aios ids:health --fix`
8. Rollback capability
9. 80% auto-fixable, 100% detected

**Special Notes:**
- Three-category healing model per Roundtable Adjustment #6
- Performance monitoring triggers auto-optimization

**Executor:** @dev | **Quality Gate:** @qa

---

### Story IDS-5: Verification Gate Integration

**Priority:** High | **Complexity:** High | **Estimate:** 10h

**User Story:**
As a framework maintainer, I want incremental development verification at six workflow gates, so that every stage considers existing artifacts.

**Key Acceptance Criteria:**
1. VerificationGate base class
2. G1 (@pm): Epic creation - advisory
3. G2 (@sm): Story creation - advisory
4. G3 (@po): Story validation - soft block
5. **G4 (@dev): Automated, <2s, informational** (Roundtable #3)
6. **G5 (@qa): Automated, <30s, blocks merge** (Roundtable #3)
7. **G6 (@devops): Automated, <60s, blocks merge on critical** (Roundtable #3)
8. Override mechanism with documentation
9. GitHub Actions workflows for G6

**Special Notes:**
- G4-G6 MUST be fully automated per Roundtable Adjustment #3
- Circuit breaker pattern for graceful degradation

**Executor:** @dev | **Quality Gate:** @architect

---

### Story IDS-6: Constitution Article IV-A

**Priority:** Medium | **Complexity:** Low | **Estimate:** 2h

**User Story:**
As a framework maintainer, I want incremental development principles codified in the Constitution, so that the approach is formally enforced.

**Key Acceptance Criteria:**
1. Draft Article IV-A text
2. Define MUST severity
3. Document enforcement via gates
4. Review with stakeholders
5. Update constitution.md

**Executor:** @architect | **Quality Gate:** @pm

---

## Dependencies Between Stories

```
IDS-1 (Registry) ─────────────────────────────────────────┐
    │                                                      │
    ├──► IDS-2 (Decision Engine) ─────────────────────────┤
    │                                                      │
    ├──► IDS-3 (Self-Updating) ──► IDS-4 (Self-Healing) ──┤
    │                                                      │
    └────────────────────────────────────────► IDS-5 (Gates)
                                                           │
                                                           ▼
                                               IDS-6 (Constitution)
```

---

## Success Criteria for Epic

1. Registry Complete: All ~881 entities indexed
2. Decision Accuracy: 90% align with human judgment
3. Self-Updating: <5s after file changes
4. Self-Healing: 80% auto-fixed, 100% detected
5. Gate Coverage: All 6 gates active
6. Performance: <2s per gate check
7. **CREATE Rate Decline:** 50-60% → <15% over 12 months (Roundtable #5)

---

## Files to Create

```
docs/stories/epics/epic-ids-incremental-development/
├── EPIC-IDS-INDEX.md
├── story-ids-1-registry-foundation.md
├── story-ids-2-decision-engine.md
├── story-ids-3-self-updating.md
├── story-ids-4-self-healing.md
├── story-ids-5-gate-integration.md
└── story-ids-6-constitution-amendment.md
```

---

## Total Estimated Effort

| Story | Estimate |
|-------|----------|
| IDS-1 | 8h |
| IDS-2 | 14h |
| IDS-3 | 6h |
| IDS-4 | 12h |
| IDS-5 | 10h |
| IDS-6 | 2h |
| **Total** | **52h** |

---

## Roundtable Adjustments Already Incorporated

These adjustments from the pedro_valerio + brad_frost debate are already reflected in the specs above:

| # | Adjustment | Applied To |
|---|------------|------------|
| 1 | Performance SLA (<100ms) | IDS-1, IDS-4 |
| 2 | 30% Threshold Calibration | IDS-2 |
| 3 | Gate Automation Classification | IDS-5 |
| 4 | CREATE Justification & Review | IDS-2 |
| 5 | CREATE Rate Metric | Epic Success Criteria |
| 6 | Self-Healing Expansion | IDS-4 |

---

*Handoff prepared by @po (Pax) - 2026-02-05*
