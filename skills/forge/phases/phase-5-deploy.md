# Phase 5: Deploy

> Commit + Push + PR via @devops (EXCLUSIVE)

---

## Purpose

Dia da mudanca — so leva o que funciona. Essa fase e EXCLUSIVA do @devops. Nenhum outro agente toca em git push ou PR. E como a chave do cofre: so uma pessoa tem.

---

## Execution Steps

### Step 1: Pre-Deploy CHECKPOINT

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 CHECKPOINT — Pronto para Deploy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📋 Resumo do que sera deployado:
  - {N} stories implementadas
  - {files_changed} arquivos modificados
  - {commits} commits locais

  1. Deploy (push + PR)
  2. Revisar antes
  3. Nao deployar agora (salvar progresso)
```

If user chooses 2: show git diff summary and wait.
If user chooses 3: mark Phase 5 as "paused", save state, show completion banner without PR.

### Step 2: Dispatch @devops

Dispatch @devops via Agent tool:
- Read `.aios-core/development/agents/aios-devops.md`
- Read `.aios-core/development/tasks/push.md` (or `commit-workflow.md`)
- Instructions:
  1. Run pre-push quality gate: `npm run lint && npm run typecheck && npm test && npm run build`
  2. If any gate fails: HALT and report to runner (do NOT push broken code)
  3. Stage files selectively (never `git add -A`)
  4. Commit with conventional format: `feat: {description} [Forge run {run_id}]`
  5. Push to remote
  6. Create PR with summary of all stories implemented

### Step 3: Collect PR URL

After @devops completes:
1. Parse the PR URL from output
2. Update state.json: `phases.5.pr_url = "{url}"`

### Step 4: Completion

1. Update state.json: `status = "completed"`, `completed_at = now`
2. Show completion banner (from personality.md):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ Forge Complete!

  📁 Run: {run_id}
  📄 Stories: {N} implementadas
  🔀 PR: {pr_url}
  ⚠️ Erros resolvidos: {error_count}

  "Nao e dom, e estrutura." — Fosc
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Constitutional Compliance

| Article | Enforcement |
|---------|------------|
| II - Agent Authority | ONLY @devops executes this phase. Runner MUST NOT do git push directly. |
| V - Quality First | Pre-push gate runs lint + typecheck + test + build. All must pass. |

If @devops is not available or the user explicitly says "nao push":
- Save all work locally
- Show: "Codigo pronto localmente. Quando quiser deployar, rode `/forge resume`"

---

## Outputs

- Code pushed to remote
- PR created with summary
- state.json marked as completed
- Completion banner shown
