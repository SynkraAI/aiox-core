# Workflow Playbooks — Step-by-Step Guides

## 1. Story Development Cycle (SDC) — PRIMARY

The standard workflow for all story implementations.

### Phase 1: Create (@sm)
```
@sm → *draft
```
- **Task:** `create-next-story.md`
- **Input:** PRD/epic context
- **Output:** Story file at `docs/stories/active/{storyId}.md`
- **Status:** Draft

### Phase 2: Validate (@po)
```
@po → *validate-story-draft {story-id}
```
- **Task:** `validate-next-story.md`
- **10-point checklist:** title, description, AC (Given/When/Then), scope, dependencies, complexity, business value, risks, DoD, alignment
- **Decision:** GO (>=7/10) → Status: Ready | NO-GO (<7/10) → return to @sm

### Phase 3: Implement (@dev)
```
@dev → *develop {story-id}
```
- **Task:** `dev-develop-story.md`
- **3 Modes:**
  - **YOLO:** Autonomous (0-1 prompts), decisions logged
  - **Interactive:** Default (5-10 prompts), educational checkpoints
  - **Pre-Flight:** Plan-first (10-15 prompts), then execute
- **CodeRabbit:** Self-healing max 2 iterations for CRITICAL
- **Status:** InProgress

### Phase 4: QA Gate (@qa)
```
@qa → *review {story-id}
@qa → *gate {story-id}
```
- **Task:** `qa-gate.md`
- **7 checks:** code review, unit tests, AC met, no regressions, performance, security, docs
- **Verdicts:** PASS | CONCERNS (approve with notes) | FAIL (→ QA Loop) | WAIVED (rare)
- **Status:** InReview → Done

### Phase 5: Ship (@devops)
```
@devops → *pre-push
@devops → *push
@devops → *create-pr
```
- All quality gates must PASS before push

---

## 2. QA Loop — ITERATIVE REVIEW

Activated when QA gate returns FAIL.

```
@qa *review → verdict → @dev fixes → @qa re-review (max 5 iterations)
```

| Command | Purpose |
|---------|---------|
| `*qa-loop {storyId}` | Start loop |
| `*qa-loop-review` | Resume from review |
| `*qa-loop-fix` | Resume from fix |
| `*stop-qa-loop` | Pause, save state |
| `*resume-qa-loop` | Resume from state |
| `*escalate-qa-loop` | Force escalation |

**Verdicts per iteration:**
- APPROVE → Complete, mark Done
- REJECT → @dev fixes, re-review
- BLOCKED → Escalate immediately

**Escalation triggers:** max iterations, blocked verdict, fix failure, manual escalation.
**State file:** `qa/loop-status.json`

---

## 3. Spec Pipeline — PRE-IMPLEMENTATION

Transform informal requirements into executable specification.

### Complexity Scoring

5 dimensions, scored 1-5 (max 25):

| Dimension | Score 1 | Score 5 |
|-----------|---------|---------|
| Scope | 1-3 files | 20+ files |
| Integration | No external APIs | Multiple APIs |
| Infrastructure | No changes | Major infra |
| Knowledge | Team expert | New domain |
| Risk | Low criticality | Core system |

### Phase Routing by Complexity

| Score | Class | Phases |
|-------|-------|--------|
| <=8 | SIMPLE | 1→4→5 (3 phases) |
| 9-15 | STANDARD | 1→2→3→4→5→6 (all 6) |
| >=16 | COMPLEX | All 6 + revision cycle |

### 6 Phases

| # | Agent | Task | Output |
|---|-------|------|--------|
| 1 | @pm | Gather requirements | `requirements.json` |
| 2 | @architect | Assess complexity (scoring above) | `complexity.json` |
| 3 | @analyst | Research (domain, competitors, patterns) | `research.json` |
| 4 | @pm | Write spec | `spec.md` |
| 5 | @qa | Critique spec | `critique.json` |
| 6 | @architect | Plan implementation | `implementation.yaml` |

### Critique Verdicts

| Verdict | Avg Score | Next |
|---------|-----------|------|
| APPROVED | >=4.0 | Phase 6 (Plan) |
| NEEDS_REVISION | 3.0-3.9 | Revise spec, back to Phase 4 |
| BLOCKED | <3.0 | Escalate to user |

**Constitutional Gate (Art. IV):** Every statement in `spec.md` MUST trace to FR-*, NFR-*, CON-*, or research finding. No inventions.

---

## 4. Brownfield Discovery — LEGACY ASSESSMENT

10-phase technical debt assessment for existing codebases.

### Data Collection (Phases 1-3)
| Phase | Agent | Output |
|-------|-------|--------|
| 1 | @architect | `system-architecture.md` |
| 2 | @data-engineer | `SCHEMA.md` + `DB-AUDIT.md` |
| 3 | @ux-design-expert | `frontend-spec.md` |

### Draft & Validation (Phases 4-7)
| Phase | Agent | Output |
|-------|-------|--------|
| 4 | @architect | `technical-debt-DRAFT.md` |
| 5 | @data-engineer | `db-specialist-review.md` |
| 6 | @ux-design-expert | `ux-specialist-review.md` |
| 7 | @qa | `qa-review.md` (APPROVED / NEEDS WORK) |

### Finalization (Phases 8-10)
| Phase | Agent | Output |
|-------|-------|--------|
| 8 | @architect | `technical-debt-assessment.md` (final) |
| 9 | @analyst | `TECHNICAL-DEBT-REPORT.md` (executive) |
| 10 | @pm | Epic + stories ready for development |

---

## Operation Playbooks

### New Feature (End-to-End)
```
1. @pm    *create-prd                      # Requirements
2. @pm    *create-epic {prd}               # Epic structure
3. @sm    *draft                           # First story
4. @po    *validate-story-draft {story}    # GO/NO-GO
5. @dev   *develop {story}                 # Implement
6. @dev   *run-tests                       # Verify
7. @qa    *review {story}                  # QA gate
8. @devops *pre-push → *push → *create-pr  # Ship
```

### Bug Fix (Fast Track)
```
1. @sm    *draft (minimal story with bug description)
2. @dev   *develop {story} --mode=yolo     # Autonomous fix
3. @dev   *run-tests                       # Verify
4. @qa    *review {story}                  # Quick review
5. @devops *push                           # Ship
```

### Research → Architecture → Build
```
1. @analyst   *research {topic}            # Deep research
2. @architect *design-system               # Architecture
3. @pm        *create-prd                  # PRD from findings
4. Continue with SDC...
```

### Recovery from Failed Build
```
1. @dev *track-attempt                     # Record attempt
2. @dev *rollback                          # Rollback to good state
3. @dev *develop {story}                   # Retry with lessons
4. @qa  *review {story}                    # Verify
```

### Sprint Execution (Epic)
```
1. @pm  *execute-epic {epic-id}
   For each story in plan:
     @sm  *draft
     @po  *validate-story-draft {story}
     @dev *develop {story}
     @qa  *gate {story}
   @devops *push (batch at end)
```
