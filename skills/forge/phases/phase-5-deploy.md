# Phase 5: Deploy

> Commit + Push + PR via @devops (EXCLUSIVE)

---

## Purpose

Dia da mudança — só leva o que funciona. Essa fase é EXCLUSIVA do @devops. Nenhum outro agente toca em git push ou PR. É como a chave do cofre: só uma pessoa tem.

---

## Execution Steps

### Step 0: Enter Phase (MANDATORY)

Execute runner.md Section 2, Step 1 ("Enter Phase") para N=5 antes de prosseguir.

### Step 1: Pre-Deploy CHECKPOINT

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 CHECKPOINT — Pronto para Deploy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📋 Resumo do que será deployado:
  - {N} stories implementadas
  - {files_changed} arquivos modificados
  - {commits} commits locais

  1. Deploy (push + PR)
  2. Revisar antes
  3. Não deployar agora (salvar progresso)
```

If user chooses 2: show git diff summary and wait.
If user chooses 3: mark Phase 5 as "paused", save state, show completion banner without PR.

### Step 2: Dispatch @devops

Dispatch @devops via Agent tool:
- Read `{AIOS_HOME}/.aios-core/development/agents/aios-devops.md`
- Read `{AIOS_HOME}/.aios-core/development/tasks/push.md` (or `commit-workflow.md`)
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

### Step 3b: Post-Deploy Monitoring (Plugin-Driven)

**Fire hook: `after:deploy`** — triggers post-deploy monitoring plugins.

This hook ONLY fires if @devops successfully pushed and created a PR.
It does NOT fire if:
- User chose "don't deploy" at the checkpoint
- @devops failed and the run was paused
- The run is in DRY_RUN mode

The `forge-watch` plugin (priority 85) subscribes to this hook and performs:
health checks, CI status verification, build verification, and error monitoring.
Results are saved to `state.json → plugins.forge_watch.report`.
All checks are INFO-level — they never block completion.

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

  "Não é dom, é estrutura." — Fosc
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Constitutional Compliance

| Article | Enforcement |
|---------|------------|
| II - Agent Authority | ONLY @devops executes this phase. Runner MUST NOT do git push directly. |
| V - Quality First | Pre-push gate runs lint + typecheck + test + build. All must pass. |

If @devops is not available or the user explicitly says "não push":
- Save all work locally
- Show: "Código pronto localmente. Quando quiser deployar, rode `/forge resume`"

---

## Outputs

- Code pushed to remote
- PR created with summary
- state.json marked as completed
- Completion banner shown
