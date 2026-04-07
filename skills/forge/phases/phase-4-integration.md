# Phase 4: Integration

> QA + Process Validation + Output Quality Audit + Pre-Push Gates — a inspeção final com padrão 10/10

---

## Purpose

Todas as stories foram implementadas individualmente. Agora é hora de verificar se tudo funciona JUNTO e se o processo inteiro é à prova de falhas. Pense nisso como a vistoria do apartamento com três inspetores: um verifica se funciona (QA), outro se o encanamento não tem caminho errado (Pedro Valério), e o terceiro se o acabamento está no padrão ouro (Kaizen).

---

## Execution Steps

### Step 0: Enter Phase (MANDATORY)

Execute runner.md Section 2, Step 1 ("Enter Phase") para N=4 antes de prosseguir.

**Adicional Phase 4:** Se `source_dry_run` existe no state.json, comparar `source_dry_run.simulation_estimate.stories` com total real de stories. Mostrar: `"📊 Estimativa dry-run: {N} stories → Real: {M} stories (ratio: {R})"`

### Step 1: Full Test Suite (@qa)

Dispatch @qa via Agent tool:
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-qa.md`
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
  Pense nisso como a inspeção do apartamento:
  cada cômodo pode estar perfeito, mas funciona junto?
```

---

### Step 2: Process Validation (@pedro-valerio)

> O encanamento pode funcionar, mas se tem um caminho que permite água suja voltar pro tanque limpo, é processo quebrado.

Dispatch pedro-valerio via Agent tool:
- subagent_type: `pedro-valerio`
- Agent definition: `{AIOS_HOME}/squads/squad-creator/agents/pedro-valerio.md`
- Mode: `*audit` (Process Audit)

**What to validate:**

1. **Workflow Integrity** — todo workflow criado tem fluxo unidirecional (nada volta)?
2. **Veto Conditions** — cada checkpoint tem condições de veto claras? Caminhos errados estão impossibilitados?
3. **Checkpoint Coverage** — todas as fases críticas têm checkpoint? Nenhum ponto cego?
4. **Handoff Gaps** — existe gap de tempo entre handoffs? Informação se perde na passagem?
5. **Error Path Completeness** — todos os caminhos de erro estão mapeados? Nenhum "e se..." sem resposta?

**Input to provide:**
- All story files from this Forge run
- Architecture document from Phase 1
- All workflow/task files created during build
- State.json with phase history

**Evaluation criteria:**

| Dimension | Score Range | PASS Threshold |
|-----------|-----------|----------------|
| Unidirectional Flow | 1-10 | >= 8 |
| Veto Conditions | 1-10 | >= 8 |
| Checkpoint Coverage | 1-10 | >= 7 |
| Handoff Zero-Gap | 1-10 | >= 7 |
| Error Path Coverage | 1-10 | >= 7 |

**Composite score:** Average of all 5 dimensions. PASS >= 7.5, CONCERNS 5.0-7.4, FAIL < 5.0

**If FAIL or CONCERNS:**
1. Pedro Valério lists specific issues with fix recommendations
2. Dispatch @dev to fix structural issues
3. Re-run validation (max 2 attempts)
4. After 2 failures: CHECKPOINT with user — "O processo tem fragilidades. Quer prosseguir mesmo assim ou corrigir?"

Show progress:
```
  🔄 @pedro-valerio auditando processo...
  "Processo que permite erro é processo quebrado."
  Verificando: fluxo unidirecional, veto conditions, checkpoints...
```

---

### Step 3: Output Quality Audit (@kaizen)

> O acabamento pode estar bonito, mas está no padrão ouro? Ou é genérico disfarçado?

Dispatch kaizen via Agent tool:
- subagent_type: `general-purpose`
- Load task: `{AIOS_HOME}/squads/kaizen-v2/tasks/audit-output-quality.md`
- Load agent context: `{AIOS_HOME}/squads/kaizen-v2/agents/kaizen-chief.md`

**What to audit:**

Avaliar os outputs do Forge run nas 5 dimensões Kaizen:

1. **COMPLETUDE** (25%) — todos os elementos obrigatórios presentes? Stories têm todos os ACs? Arquitetura cobre todos os requisitos?
2. **VOICE DNA / CONSISTENCY** (20%) — o código segue padrões consistentes? Naming conventions, estrutura de arquivos, imports?
3. **QUALIDADE TÉCNICA** (20%) — formatação, estrutura, sem code smells? Separação de concerns respeitada?
4. **DIFERENCIAÇÃO** (15%) — o output é específico para este projeto ou é boilerplate genérico? Tem personalidade?
5. **IMPACTO ESTIMADO** (20%) — o output atinge o objetivo declarado no Discovery? Resolve o problema real?

**Input to provide:**
- All files created/modified during this Forge run
- Original description from Phase 0 Discovery
- Architecture document from Phase 1
- Story files with AC status

**Evaluation output:**

| Dimension | Weight | Score | Status |
|-----------|--------|-------|--------|
| Completude | 25% | X/10 | PASS/FAIL |
| Consistência | 20% | X/10 | PASS/FAIL |
| Qualidade Técnica | 20% | X/10 | PASS/FAIL |
| Diferenciação | 15% | X/10 | PASS/FAIL |
| Impacto | 20% | X/10 | PASS/FAIL |

**Composite score:** Weighted average. Classification:
- **GOLD** (>= 8.5) — padrão ouro, pronto para deploy
- **GOOD** (7.0-8.4) — bom, mas pode melhorar
- **NEEDS_WORK** (5.0-6.9) — precisa de ajustes antes de deploy
- **POOR** (< 5.0) — requer retrabalho significativo

**If NEEDS_WORK or POOR:**
1. Kaizen generates prioritized recommendations per dimension
2. Each recommendation has specific action + file path
3. Dispatch @dev to fix (guided by recommendations)
4. Re-run audit (max 2 attempts)
5. After 2: CHECKPOINT with user

**Veto conditions (from Kaizen):**
- Output avaliado sem ler conteúdo completo → REDO
- Score POOR sem diagnóstico de causa raiz → BLOCK
- Recomendação genérica sem ação específica → REMOVE

Show progress:
```
  🔄 @kaizen auditando qualidade dos outputs...
  Avaliando 5 dimensões: completude, consistência,
  qualidade técnica, diferenciação, impacto...
```

---

### Step 4: Extended Quality Gates (Plugin-Driven)

> Gates extras que só ativam se o projeto precisar. Como sensores especializados: só disparam se detectam algo relevante.

**Resolution:** The runner fires hook `after:phase:3`, which triggers all quality gate plugins subscribed to this hook (see `{FORGE_HOME}/plugins/*.yaml`).

Each plugin declares its own:
- **Detection logic** (`detect` field) — skips silently if condition is false
- **Skill to invoke** (`skill` field) — dispatched via Agent tool
- **Severity** — `recommended` (CONCERNS if issues) or `optional` (INFO only)
- **Model** — LLM model for cost control

The runner executes plugins in priority order (30-35 for quality gates). Results are saved to `state.json` under `plugins.{state_key}` (where `state_key` is defined in each plugin's YAML, e.g., `bulletproof_test`, `vulnerability_scanner`).

**IMPORTANT:** Extended gates are NEVER hard vetos. They produce CONCERNS or INFO that appear in the Integration Summary (Step 6). The user decides whether to fix before deploy.

#### Progress Display

```
  🔄 Extended Quality Gates (plugin-driven)...
  ├── /bulletproof-test .......... ✅ PASS (42 scenarios, 0 failures)
  ├── /vulnerability-scanner ..... ⚠️ CONCERNS (2 medium issues)
  ├── /tier-s-checklist .......... ✅ 8.5/10 (3 items to improve)
  ├── /tokenizacao ............... ⏭️ SKIPPED (no frontend detected)
  ├── /code-refactoring .......... ⏭️ SKIPPED (no tech debt flagged)
  └── /cloud-pentest ............. ⏭️ SKIPPED (disabled)
```

> **Para adicionar um novo gate:** criar um plugin YAML em `{FORGE_HOME}/plugins/` com hook `after:phase:3`. Nenhum outro arquivo precisa ser editado. Ver `{FORGE_HOME}/plugins/SCHEMA.md`.

---

### Step 5: Pre-Push Quality Gate (@devops)

Dispatch @devops (read-only mode, no push yet):
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-devops.md`
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

---

### Step 6: Integration Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Integration Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ Lint:              0 errors
  ✅ TypeCheck:         0 errors
  ✅ Tests:             {N} passing, 0 failing
  ✅ Build:             success
  ✅ QA Review:         APPROVED

  ⚙️ Process Audit:     {pv_score}/10 — {pv_status}
     Unidirectional:    {score}/10
     Veto Conditions:   {score}/10
     Checkpoints:       {score}/10
     Handoff Gaps:      {score}/10
     Error Paths:       {score}/10

  📊 Output Quality:    {kaizen_score}/10 — {kaizen_class}
     Completude:        {score}/10
     Consistência:      {score}/10
     Qualidade Técnica: {score}/10
     Diferenciação:     {score}/10
     Impacto:           {score}/10

  🛡️ Extended Gates:
     /bulletproof-test:     {status} {detail}
     /vulnerability-scanner: {status} {detail}
     /tier-s-checklist:     {status} {detail}
     /tokenizacao:          {status} {detail}
     /code-refactoring:     {status} {detail}
     /cloud-pentest:        {status} {detail}

  📊 {stories_count} stories implementadas
  📁 {files_changed} arquivos modificados
  🔀 {commits_count} commits locais
```

---

### Step 7: CHECKPOINT

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 CHECKPOINT — Pronto para Deploy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Tudo verde. O código está pronto para ir pro ar.

  1. Deploy agora (push + PR)
  2. Revisar o código antes
  3. Não deployar (salvar progresso)
```

---

### Step 8: Update State

```json
{
  "phases": {
    "4": {
      "status": "completed",
      "lint": "pass",
      "typecheck": "pass",
      "tests": { "passing": 42, "failing": 0 },
      "build": "pass",
      "qa_verdict": "APPROVED",
      "process_validation": {
        "validator": "pedro-valerio",
        "score": 8.5,
        "status": "PASS",
        "dimensions": {
          "unidirectional_flow": 9,
          "veto_conditions": 8,
          "checkpoint_coverage": 8,
          "handoff_gaps": 9,
          "error_paths": 8
        }
      },
      "output_quality": {
        "auditor": "kaizen",
        "score": 8.7,
        "classification": "GOLD",
        "dimensions": {
          "completude": 9,
          "consistency": 8,
          "technical_quality": 9,
          "differentiation": 8,
          "impact": 9
        }
      },
      "extended_gates": {
        "bulletproof_test": { "status": "PASS", "scenarios": 42, "failures": 0 },
        "vulnerability_scanner": { "status": "CONCERNS", "critical": 0, "medium": 2, "low": 5 },
        "tier_s_checklist": { "status": "PASS", "score": 8.5, "items_to_improve": 3 },
        "tokenizacao": { "status": "SKIPPED", "reason": "no frontend detected" },
        "code_refactoring": { "status": "SKIPPED", "reason": "no tech debt flagged" },
        "cloud_pentest": { "status": "SKIPPED", "reason": "disabled in config" }
      }
    }
  }
}
```

---

## Outputs

- Integration report from @qa
- Process validation report from @pedro-valerio
- Output quality audit report from @kaizen
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

If process validation fails:
1. Pedro Valério identifies structural flaws
2. Dispatch @dev or @architect depending on severity
3. Re-run process validation
4. If persistent: CHECKPOINT — structural issues may require design rethink

If output quality audit fails:
1. Kaizen provides per-dimension recommendations with file paths
2. Dispatch @dev to address specific gaps
3. Re-run quality audit
4. If POOR persists: likely a Phase 1 (Spec) issue — consider revisiting architecture
