# Workflow: Full App

> Spec Pipeline + Story Factory + Build Loop + Integration + Deploy

---

## When to Use

- User runs `/forge "clone do Instagram com feed, likes e stories"`
- User describes a complete application to build from scratch
- Scope: multiple stories, full development cycle

---

## Pipeline

```
Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5
Discovery   Spec      Stories    Build      Integration  Deploy
```

ALL 6 phases execute. This is the complete Forge experience.

---

## Execution

### Phase 0: Discovery (full)

Read `{FORGE_HOME}/phases/phase-0-discovery.md` with FULL_APP adjustments:
- Socratic Gate uses FULL_APP questions
- Project detection runs (type, stack, template)
- Ecosystem scan runs (MANDATORY)
- CHECKPOINT: confirm scope + stack + template

### Phase 1: Spec Pipeline

Read `{FORGE_HOME}/phases/phase-1-spec.md`:
1. @pm creates PRD + Epic (with app-builder stack/template)
2. @architect assesses complexity + designs architecture
3. @analyst researches (if complexity >= STANDARD)
4. @pm finalizes spec
5. @qa critiques spec (veto: < 4.0)
6. CHECKPOINT: approve spec

### Phase 2: Story Factory

Read `{FORGE_HOME}/phases/phase-2-stories.md`:
1. @sm creates stories from epic (one by one)
2. @po validates each (veto: < 7/10)
3. CHECKPOINT: approve story list + priority

### Phase 3: Build Loop

Read `{FORGE_HOME}/phases/phase-3-build.md` with FULL_APP mode:
- Stories already exist from Phase 2
- Execute in priority order
- Full SDC per story: @dev -> veto -> @qa
- Error recovery tree active
- CHECKPOINT every 3 stories

### Phase 4: Integration

Read `{FORGE_HOME}/phases/phase-4-integration.md`:
1. @qa runs full test suite
2. @devops runs pre-push quality gate
3. CHECKPOINT: approve for deploy

### Phase 5: Deploy

Read `{FORGE_HOME}/phases/phase-5-deploy.md`:
1. CHECKPOINT: confirm push
2. @devops: commit + push + PR
3. Completion banner

---

## Agent Mapping

| Phase | Primary Agent | Supporting |
|-------|---------------|------------|
| 0 - Discovery | (Forge core) | @analyst |
| 1 - Spec | @pm | @architect, @analyst, @qa |
| 2 - Stories | @sm | @po |
| 3 - Build | @dev | @qa (SDC loop) |
| 4 - Integration | @qa | @devops |
| 5 - Deploy | @devops | — |

---

## Progress Display

```
  ✅ Discovery  ->  ✅ Spec  ->  🔄 Stories  ->  ○ Build  ->  ○ Integration  ->  ○ Deploy
```

---

## Parallel Opportunities

Some agents in Phase 1 can run in parallel:
- @architect (complexity) and @analyst (research) can run simultaneously
- Their outputs merge into @pm's final spec

The runner should dispatch these via parallel Agent tool calls when possible.
