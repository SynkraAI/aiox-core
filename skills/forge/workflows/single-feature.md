# Workflow: Single Feature

> SDC direto — da feature descrita ao deploy

---

## When to Use

- User runs `/forge feature "adicionar dark mode"`
- User describes a single feature to add to an existing project
- Scope: 1-3 stories, focused implementation

---

## Pipeline

```
Phase 0 (Discovery) -> Phase 3 (Build Loop) -> Phase 5 (Deploy)
```

Phases 1, 2, and 4 are SKIPPED. Stories are created inline in Phase 3.

---

## Execution

### Phase 0: Discovery (simplified)

Read `phases/phase-0-discovery.md` but with these adjustments:
- Socratic Gate uses SINGLE_FEATURE questions (3 questions)
- Project detection is SKIPPED (project already exists)
- Ecosystem scan runs normally (MANDATORY)
- CHECKPOINT: confirm scope

### Phase 3: Build Loop

Read `phases/phase-3-build.md` with SINGLE_FEATURE mode:
1. @sm creates 1 story from the feature description (inline, fast)
2. @po validates (inline, fast)
3. @dev implements
4. Veto conditions check
5. @qa quality gate
6. Error recovery if needed

If the feature is complex enough for multiple stories:
- @sm may create 2-3 stories
- Each follows the full SDC subloop
- Checkpoint after all stories complete

### Phase 5: Deploy

Read `phases/phase-5-deploy.md`:
1. CHECKPOINT: confirm push
2. @devops: commit + push + PR
3. Completion banner

---

## Progress Display

```
  ✅ Discovery  ->  🔄 Build  ->  ○ Deploy
```

---

## Typical Duration

- Phase 0: 2-3 minutes (questions + scan)
- Phase 3: 5-15 minutes per story (depends on complexity)
- Phase 5: 1-2 minutes (push + PR)

Total: ~10-20 minutes for a simple feature.
