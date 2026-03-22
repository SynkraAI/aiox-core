# Phase 4: Integration

> QA completo + pre-push gates — a inspecao final antes da mudanca

---

## Purpose

Todas as stories foram implementadas individualmente. Agora e hora de verificar se tudo funciona JUNTO. Pense nisso como a vistoria do apartamento antes de entregar a chave: cada comodo pode estar perfeito, mas o encanamento conecta? A eletrica nao vai dar curto?

---

## Execution Steps

### Step 1: Full Test Suite (@qa)

Dispatch @qa via Agent tool:
- Agent: `.aios-core/development/agents/aios-qa.md`
- Task: Full integration review (not per-story, but whole project)
- Input:
  - All story files (list from state.json phases.2.stories)
  - All code changes (git diff from start of Forge run)
  - Architecture document from Phase 1
- Checks:
  1. **Regression tests** — `npm test` passes
  2. **Cross-story integration** — features work together
  3. **AC coverage** — all stories have all AC checked
  4. **Code quality** — no obvious tech debt introduced
  5. **Security scan** — no exposed secrets, proper auth
- Output: Integration report with PASS/FAIL per check

Show progress:
```
  🔄 @qa (Quinn) fazendo a vistoria final...
  Pense nisso como a inspecao do apartamento:
  cada comodo pode estar perfeito, mas funciona junto?
```

### Step 2: Pre-Push Quality Gate (@devops)

Dispatch @devops (read-only mode, no push yet):
- Agent: `.aios-core/development/agents/aios-devops.md`
- Run pre-push quality gate:
  1. `npm run lint` — 0 errors
  2. `npm run typecheck` — 0 errors
  3. `npm test` — all pass
  4. `npm run build` — success
- Output: Gate results (PASS/FAIL per check)

If ANY gate fails:
1. Show what failed
2. Dispatch @dev to fix the specific issue
3. Re-run the gate
4. Max 2 fix attempts
5. After 2: CHECKPOINT with user

### Step 3: Integration Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Integration Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ Lint:       0 errors
  ✅ TypeCheck:  0 errors
  ✅ Tests:      {N} passing, 0 failing
  ✅ Build:      success
  ✅ QA Review:  APPROVED

  📊 {stories_count} stories implementadas
  📁 {files_changed} arquivos modificados
  🔀 {commits_count} commits locais
```

### Step 4: CHECKPOINT

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 CHECKPOINT — Pronto para Deploy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Tudo verde. O codigo esta pronto para ir pro ar.

  1. Deploy agora (push + PR)
  2. Revisar o codigo antes
  3. Nao deployar (salvar progresso)
```

### Step 5: Update State

```json
{
  "phases": {
    "4": {
      "status": "completed",
      "lint": "pass",
      "typecheck": "pass",
      "tests": { "passing": 42, "failing": 0 },
      "build": "pass",
      "qa_verdict": "APPROVED"
    }
  }
}
```

---

## Outputs

- Integration report from @qa
- Pre-push gate results from @devops
- User approval to proceed to Phase 5
- All quality checks passing

---

## Error Recovery

If integration tests reveal cross-story bugs:
1. Identify which story introduced the issue
2. Dispatch @dev to fix (with the specific test failure)
3. Re-run integration
4. If architectural issue: dispatch @architect first
