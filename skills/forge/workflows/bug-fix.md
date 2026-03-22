# Workflow: Bug Fix

> Fast track — do bug report ao fix deployado

---

## When to Use

- User runs `/forge fix "botao de login nao funciona"`
- User describes a bug to fix
- Scope: 1 story, minimal ceremony

---

## Pipeline

```
Phase 0 (Discovery) -> Phase 3 (Build — light) -> Phase 5 (Deploy)
```

This is the FASTEST Forge workflow. Minimal SDC, no spec, no story factory.

---

## Execution

### Phase 0: Discovery (minimal)

Read `phases/phase-0-discovery.md` but with these adjustments:
- Socratic Gate uses BUG_FIX questions (3 questions):
  1. "O que deveria acontecer vs o que esta acontecendo?"
  2. "Quando comecou?"
  3. "Tem mensagem de erro?"
- Ecosystem scan: quick scan only (check if relevant skill exists for the error domain)
- CHECKPOINT: confirm understanding of the bug

### Phase 3: Build (light mode)

Read `phases/phase-3-build.md` with BUG_FIX mode:
1. **Skip @sm and @po** — no story creation
2. @dev goes directly to fix:
   - Input: bug description + user's answers from Phase 0
   - Mode: YOLO
   - Find the root cause, implement the fix
3. Veto conditions check (lint + typecheck + test)
4. @qa quick review:
   - Focus on: does the fix actually solve the bug?
   - Focus on: did the fix introduce regressions?
   - Faster than full quality gate
5. Error recovery if needed (but simpler — usually retry is enough)

### Phase 5: Deploy

Read `phases/phase-5-deploy.md`:
1. CHECKPOINT: "Fix pronto. Deployar?"
2. @devops: commit with `fix: {description}` + push + PR
3. Completion banner

---

## Progress Display

```
  ✅ Discovery  ->  🔄 Fix  ->  ○ Deploy
```

---

## Typical Duration

- Phase 0: 1-2 minutes
- Phase 3: 3-10 minutes (depends on bug complexity)
- Phase 5: 1-2 minutes

Total: ~5-15 minutes for a typical bug fix.
