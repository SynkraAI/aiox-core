# Epic: Installation Health & Environment Sync (INS-4)

## Overview

Garantir que qualquer **fresh install** ou **upgrade** do aios-core resulta num ambiente 100% funcional com todos os artefatos dos epics BM, NOG e GD, e que exista uma forma de **diagnosticar e corrigir** ambientes existentes.

**Origem:** Auditoria pos-epics BM (Boundary Mapping), NOG (Code Intelligence) e GD (Graph Dashboard) revelou 8 gaps criticos no installer — artefatos criados em dev mas nao integrados no fluxo de instalacao. **v2:** Incidente npm publish v4.2.14/v4.2.15 + diagnostico profundo de Claude Code discovery revelaram 4 gaps adicionais (#11-#14).

**Principios:**
- `Install = Complete:` Apos `npx aios-core install`, ambiente 100% funcional
- `Upgrade = Safe:` Updates preservam customizacoes e adicionam novidades
- `Doctor = Diagnostic:` `aios doctor` detecta e sugere correcao para inconsistencias
- `Health = Continuous:` `@aios-master *health-check` valida o ambiente a qualquer momento

## Documents

| Document | Purpose |
|----------|---------|
| [Architect Handoff v1](../../handoffs/handoff-architect-to-pm-epic-installation-health.md) | Proposta original com gap analysis, specs detalhadas, contexto tecnico |
| [DevOps Handoff v2](../../handoffs/handoff-devops-to-pm-installation-health-v2.md) | Incidente v4.2.14/v4.2.15, gaps #11-#14, modelo discovery Claude Code |
| [Epic INS-3 (Installer v4)](../epic-installer-v4-debug/) | Epic anterior — INS-4 e continuacao natural |
| [Epic BM (Boundary Mapping)](../epic-boundary-mapping/) | Artefatos de boundary que precisam ser instalados |
| [Epic NOG (Code Intelligence)](../epic-nogic-code-intelligence/) | Artefatos de code-intel para diagnostico |
| [Epic GD (Graph Dashboard)](../epic-cli-graph-dashboard/) | Artefatos de graph para documentacao |

## Gap Analysis (Auditoria + Codex Confirmados)

| # | Gap | Severidade | Status | Codex Finding |
|---|-----|-----------|--------|---------------|
| 1 | `.claude/settings.json` boundary NAO gerado | CRITICO | Confirmado — wizard so escreve `language`, nao `permissions.deny/allow` | C1: bloqueador real |
| 2 | `.claude/rules/*.md` copiadas PARCIALMENTE | ALTO (rebaixado) | `ide-config-generator.js:528-534` JA copia rules para Claude Code | A2: gap residual e so boundary deny/allow |
| 3 | Agent MEMORY.md NAO sincronizados | ALTO | Confirmado — zero referencias no installer | — |
| 4 | CLAUDE.md template desatualizado | ALTO | Confirmado — faltam secoes Boundary, Rules, Code-Intel, Graph | — |
| 5 | core-config.yaml sem merge YAML strategy | CRITICO (elevado) | Merger tem .env e .md apenas, sem YAML | C3: subestimado |
| 6 | IDE sync NAO chamado pelo installer | ALTO | Confirmado — API programatica existe (`commandSync`) | M2: viavel via require |
| 7 | `aios doctor` basico com bug de contrato | CRITICO | 5 checks basicos, `runDoctor(options)` ignora parameter | A3: reescrita necessaria |
| 8 | Entity Registry NAO gerado no install | MEDIO | Script existe; pre-push JA faz incremental | A1: reescopar para bootstrap |
| 9 | Hooks git nao garantidos via `npx` (sem npm install) | ALTO (NOVO) | `package.json` usa `prepare: "husky"` — so funciona via `npm install` | C2: gap no caminho npx |
| 10 | Ausencia testes regressao para installer pipeline | ALTO (NOVO) | Sem suites para validator/upgrader/doctor/IDE sync | A4: incluir no DoD |
| 11 | Skills NAO instaladas (7 skills, 0 copiadas) | CRITICO (v2) | `ide-config-generator.js` tem ZERO refs a "skill". `copyAgentFiles()` copia apenas agents | D1: bloqueador UX |
| 12 | Commands nao-agent NAO copiados (~11 files) | ALTO (v2) | synapse/, greet.md, stories/ — nao copiados. Apenas agents em `.claude/commands/AIOS/agents/` | D2: discovery incompleto |
| 13 | Hooks Claude Code copiados parcialmente (1/2 JS) | ALTO (v2) | Apenas `synapse-engine.cjs` copiado. `precompact-session-digest.cjs` ignorado. 8 hooks Py/Sh requerem decisao | D3: hooks parciais |
| 14 | npm publish sem validacao de submodule | CRITICO (v2) | `prepublishOnly` nao valida `pro/` populado. Incidente v4.2.14 publicou pacote sem pro/ | D4: incidente real |

## Stories (pos-Codex v2.1)

### Wave 1: Foundation (P0 — Generator + Doctor + Publish Safety)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [INS-4.1](story-INS-4.1-aios-doctor.md) | `aios doctor` — Reescrita com 12+ Checks, --fix, --json | @dev | 5 | Done | — |
| [INS-4.2](story-INS-4.2-settings-json-generator.md) | Settings.json Boundary Generator — Deny/Allow from Config | @dev | 5 | Done | — |
| [INS-4.10](story-INS-4.10-publish-safety-gate.md) | Publish Safety Gate — Submodule + File Count Validation | @devops | 2 | Done | — |

### Wave 2: Installer Integration (P1)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [INS-4.3](story-INS-4.3-installer-settings-rules.md) | Installer: Full Artifact Copy Pipeline (Settings + Skills + Commands + Hooks) | @dev | 5 | Done | INS-4.2 |
| [INS-4.4](story-INS-4.4-claude-md-template-v5.md) | Installer: CLAUDE.md Template v5 (4 secoes novas) | @dev | 3 | Done | — |
| [INS-4.5](story-INS-4.5-ide-sync-integration.md) | IDE Sync Integration — Skills + Commands + API programatica | @dev + @devops | 3 | Done | — |

### Wave 3: Runtime Health & Upgrade Safety (P2)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [INS-4.6](story-INS-4.6-entity-registry-on-install.md) | Entity Registry Bootstrap on Install (nao incremental) | @dev | 2 | Done | — |
| [INS-4.7](story-INS-4.7-config-smart-merge.md) | YAML Merger Strategy + Config Smart Merge (Phase 1) | @dev | 5 | Done | — |
| [INS-4.8](story-INS-4.8-health-check-task.md) | Unify Health-Check + Doctor v2 (3 checks novos: skills, commands, hooks) | @dev | 3 | Done | INS-4.1 |

### Wave 4: Post-Release Hardening (P0 Hotfix)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [INS-4.11](story-INS-4.11-v430-installer-fixes.md) | v4.3.0 Post-Release Installer Fixes | @dev | 8 | Ready for Review | None |

### Wave 5: Brownfield Hardening (P0 Critical)

| Story | Title | Agent | Points | Status | Blocked By |
|-------|-------|-------|--------|--------|------------|
| [INS-4.12](story-INS-4.12-brownfield-dependency-resolution.md) | Brownfield Dependency Resolution & CI Publish Safety Net | @dev + @devops | 13 | Draft | None |

## Totals

| Metric | Value |
|--------|-------|
| **Total Stories** | 11 (+INS-4.11, +INS-4.12) |
| **Total Points** | ~54 (33 base + 8 INS-4.11 + 13 INS-4.12) |
| **Points Done** | 33 (INS-4.1 through INS-4.10) |
| **Points Remaining** | 21 (INS-4.11: 8, INS-4.12: 13) |
| **Epic Status** | **IN PROGRESS** (Waves 1-3 complete, Waves 4-5 active) |
| **Waves** | 5 |
| **Executor Primario** | @dev (Dex) |
| **Pre-requisitos** | Branch `feat/epic-nogic-code-intelligence` merged em main (antes de Wave 2) |
| **Bloqueadores Externos** | Nenhum para Wave 1 |

## Executor Assignment

| Story | Executor | Quality Gate | Quality Gate Focus |
|-------|----------|-------------|-------------------|
| INS-4.1 | @dev | @devops | [check_completeness, cli_ux, --fix_safety] |
| INS-4.2 | @dev | @architect | [boundary_correctness, idempotency] |
| INS-4.3 | @dev | @devops | [install_flow, skills_copy, commands_copy, hooks_copy, post_install_validation] |
| INS-4.4 | @dev | @architect | [template_completeness, framework_owned_markers] |
| INS-4.5 | @dev + @devops | @qa | [multi_ide_sync, skills_sync, commands_sync, agent_format_validation] |
| INS-4.6 | @dev | @qa | [entity_count_sanity, install_flow] |
| INS-4.7 | @dev | @architect | [merge_safety, user_config_preservation] |
| INS-4.8 | @dev | @qa | [doctor_v2_checks, skills_count, commands_count, hooks_count, governance_context] |
| INS-4.10 | @devops | @qa | [submodule_validation, file_count_check, prepublish_safety, ci_integration] |

## Dependency Graph

```
Wave 1 (parallel):
  INS-4.1 (Doctor) [DONE] ──────────────────────────┐
  INS-4.2 (Settings Generator) ──→ INS-4.3 (W2)     │
  INS-4.10 (Publish Safety) ── standalone             │
                                                      │
Wave 2 (INS-4.3, INS-4.4, INS-4.5 parallel):         │
  INS-4.3 (Full Artifact Copy Pipeline) ← INS-4.2    │
    └─ Skills (7) + Commands (11) + Hooks JS (2)      │
  INS-4.4 (CLAUDE.md v5) ── parallel                  │
  INS-4.5 (IDE Sync + Skills/Commands) ── parallel    │
                                                      │
Wave 3 (all independent):                             │
  INS-4.6 (Entity Registry on Install) ── standalone  │
  INS-4.7 (Config Smart Merge) ── standalone          │
  INS-4.8 (Health Check + Doctor v2) ← INS-4.1 ──────┘
    └─ +3 checks: skills, commands, hooks Claude Code
```

## Wave Gates

| Wave | Gate Criteria | GO Threshold | NO-GO Threshold |
|------|--------------|-------------|-----------------|
| W1 | Doctor funcional + Generator testado + Publish safe | `aios doctor` retorna resultados corretos em 3 cenarios (fresh, upgrade, broken) + generator idempotente + publish gate bloqueia pacote sem pro/ | Doctor nao detecta gaps conhecidos OU generator produz rules incorretas OU publish sem validacao |
| W2 | Installer integrado + Full artifact copy | Fresh install passa `aios doctor` com 0 FAIL + CLAUDE.md v5 tem todas as secoes + IDE sync chamado + 7 skills copiadas + 11 commands copiados + 2 hooks JS copiados | Installer quebra em algum cenario OU secoes faltantes OU skills/commands/hooks ausentes |
| W3 | Runtime health completo + Doctor v2 | Upgrade preserva config + entity registry gerado + health-check task funcional + doctor detecta skills/commands/hooks count | Merge corrompe config OU registry <500 entidades OU health-check falha OU doctor nao detecta novos artefatos |

## Decisoes PM

### Priorizacao vs Epic TOK

**INS-4 Wave 1 roda ANTES de Epic TOK.** Racional:
1. INS-4 nao depende de TOK, mas TOK depende de ambiente saudavel
2. INS-4.6 (Entity Registry) cria base que TOK-1 (Tool Registry) consome
3. Baseline de tokens (TOK-1.5) precisa de ambiente completo para medicao valida
4. Wave 1 (doctor + generator) pode comecar AGORA

### INS-4.7 Scoped para Fase 1

Smart Merge requer nova YAML strategy no merger (`.env` e `.md` existem, YAML nao). Fase 1 = "add new keys + warn conflicts" usando pattern `registerStrategy('.yaml', YamlMerger)`. 3-way merge completo e backlog futuro.

### Correcao: 7 Rules Files (nao 5)

Auditoria encontrou 7 `.claude/rules/*.md`: agent-authority, workflow-execution, story-lifecycle, ids-principles, coderabbit-integration, **mcp-usage**, **agent-memory-imports**. Doctor e installer devem cobrir todos os 7.

### Codex Findings Incorporados (v2.1)

| Finding | Severidade | Acao PM |
|---------|-----------|---------|
| Rules JA copiadas por `ide-config-generator.js` | ALTO | INS-4.3 reescopada: wiring do generator apenas (2 pts) |
| Merger sem YAML strategy | CRITICO | INS-4.7 aumentada para 5 pts |
| INS-4.2 precisa expandir globs de boundary | CRITICO | INS-4.2 aumentada para 5 pts, verificar se Claude Code aceita glob patterns em deny |
| Pre-push hook JA faz registry sync incremental | ALTO | INS-4.6 reescopada: bootstrap only (2 pts) |
| Doctor tem bug de contrato (`options` ignorado) | ALTO | INS-4.1: reescrita, nao incremento |
| Health-check task/module JA existe em `core/` | MEDIO | INS-4.8: unificar, nao criar terceiro mecanismo (2 pts) |
| Hooks nao garantidos via `npx` | ALTO | Absorvido como check no doctor (INS-4.1), nao story separada |
| Testes regressao ausentes | ALTO | Absorvido no DoD de cada story, nao story separada |

### Discordancias com Codex

1. **Ordem de waves:** Codex propoe doctor na W3. PM mantem doctor na W1 — ele e validador das waves seguintes.
2. **Stories adicionais (INS-4.9):** PM rejeita INS-4.9 separada — absorvida em INS-4.3 expandida. Testes → DoD de cada story.

### DevOps Handoff v2 — Decisoes PM (v4)

**Contexto:** Incidente npm publish v4.2.14/v4.2.15 + diagnostico profundo de Claude Code discovery. [Handoff completo](../../handoffs/handoff-devops-to-pm-installation-health-v2.md).

| Decisao | Opcoes | Decisao PM | Racional |
|---------|--------|------------|----------|
| **INS-4.9 (Skills+Commands Copy)** | (A) Story separada 3pts, (B) Absorver em INS-4.3 | **(B) Absorvida em INS-4.3** | Mesmo fluxo, mesmo arquivo (`ide-config-generator.js`). INS-4.3: 2→5 pts |
| **INS-4.10 (Publish Safety Gate)** | (A) Story separada 2pts, (B) Absorver CI/CD | **(A) Story separada** | CRITICO — incidente real. DoD proprio, Wave 1 para prevenir reincidencia |
| **Hooks Python/Shell (8 hooks)** | (A) Converter para JS, (B) Install+pre-req, (C) Ignorar | **(A) para criticos + (C) resto** | `write-path-validation` e `read-protection` converter para CJS. Demais hooks Py/Sh sao nice-to-have, ignorar por ora |
| **Doctor checks novos (#11-#13)** | (A) Reabrir INS-4.1, (B) Nova INS-4.1.1, (C) Absorver INS-4.8 | **(C) Absorver em INS-4.8** | INS-4.1 Done. INS-4.8 ja unifica health-check e depende de INS-4.1. Escopo natural. INS-4.8: 2→3 pts |
| **INS-4.5 (IDE Sync)** | Escopo original vs expandido | **Expandido** | Titulo atualizado: deve garantir skills + commands no sync, nao apenas agents |

**Impacto no sizing:**

| Story | Pontos Antes | Pontos Depois | Delta | Motivo |
|-------|-------------|--------------|-------|--------|
| INS-4.3 | 2 | 5 | +3 | Absorve skills (7), commands (11), hooks JS (2), settings.local.json |
| INS-4.8 | 2 | 3 | +1 | Absorve 3 doctor checks novos (skills-count, commands-count, hooks-claude-count) |
| INS-4.10 | — | 2 | +2 | Story nova: publish safety gate |
| **Total** | 27 | **33** | **+6** | — |

## Relacao com Outros Epics

| Epic | Relacao |
|------|---------|
| **BM (Boundary Mapping)** | INS-4.2 e INS-4.3 integram artefatos BM no installer |
| **NOG (Code Intelligence)** | INS-4.8 diagnostica code-intel provider status |
| **GD (Graph Dashboard)** | INS-4.4 documenta `aios graph` no CLAUDE.md template |
| **TOK (Token Optimization)** | INS-4.6 cria base que TOK-1 consome. INS-4 Wave 1 antes de TOK Wave 1 |
| **INS-3 (Installer Optimization)** | Continuacao natural — INS-3 otimizou performance, INS-4 otimiza completude |
| **Incidente v4.2.14/v4.2.15** | INS-4.10 previne reincidencia de publish sem submodule pro/ |

## Risk Matrix

| Risk | Prob | Impact | Mitigation |
|------|------|--------|------------|
| Installer legacy (aios-init.js) dificulta integracao | Media | Alto | Stories focam em modulos isolados chamaveis de qualquer installer |
| Smart merge complexidade | Media | Medio | Scoped para fase 1 (add new keys only) |
| Users com ambientes muito customizados | Media | Medio | `aios doctor --dry-run` mostra o que seria alterado |
| Breaking changes em core-config.yaml schema | Baixa | Alto | Schema validation + versao no config |
| npm publish sem pro/ submodule (NOVO — incidente real) | Media | Critico | INS-4.10: prepublishOnly check + CI gate. Previne reincidencia |
| Skills/Commands discovery quebrado pos-install | Alta | Alto | INS-4.3 expandida: copy pipeline completo. Doctor v2 valida contagem |
| Hooks Python/Shell requerem runtime externo | Media | Medio | Converter criticos para CJS. Ignorar nice-to-have. Documentar pre-requisitos |

## Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Fresh install `aios doctor` score | N/A (nao existe) | 0 FAIL, <=2 WARN |
| Upgrade config preservation | 0% (sobrescreve ou ignora) | 100% user keys preserved |
| Rules/settings coverage | 0% (nao instalados) | 100% (7 rules + settings.json) |
| Skills disponiveis apos install | 0/7 (zero copiadas) | 7/7 |
| Commands disponiveis apos install | 12/23 (so agents) | 23/23 |
| Hooks JS ativos apos install | 1/2 | 2/2 |
| Publish safety | 0 checks | Submodule + file count validated |
| Time to diagnose broken env | Manual (30+ min) | < 10 seconds (`aios doctor`) |

## Definition of Done

- [x] INS-4.1: `aios doctor` functional with 12 checks, --fix, --json flags (Done — commit 337213dc)
- [x] INS-4.2: `generate-settings-json.js` created with path traversal validation, idempotency, 12 tests (Done — commit 4a8d9f9e)
- [x] INS-4.3: Full artifact copy pipeline — settings.json wired, 7 skills copy, ~11 commands copy, dynamic hooks registration, 9 tests (Done — commit 8c92b01f)
- [x] INS-4.4: CLAUDE.md template v5 — 4 new AIOS-MANAGED sections (framework-boundary, rules-system, code-intelligence, graph-dashboard), 15 tests, QA PASS (Done — commit 853b7195)
- [x] INS-4.5: IDE sync integration via adapter pattern — commandSync + commandValidate after artifact copy, 20 tests, QA PASS (Done — commit 374788fe)
- [x] INS-4.10: Publish safety gate — validate-publish.js (3 checks: pro/ populated, critical file, file count >= 50), prepublishOnly + CI wired, 17 tests, QA PASS (Done — commit 5513df9a)
- [x] INS-4.6: Entity registry bootstrap on install — populate-entity-registry.js called sync (0.67s), 3-state outcome, 19 tests, QA PASS (Done — commit 1777ee8f)
- [x] INS-4.7: YAML merger strategy + config smart merge Phase 1 — yaml-merger.js (181 lines, target-wins), brownfield-upgrader integration, backup safety, 26 tests, QA PASS (Done — commit 12aa5c7c)
- [x] INS-4.8: Unify health-check + 3 new doctor checks (skills-count, commands-count, hooks-claude-count), health-check.yaml v3 delegates to aios doctor --json, governance map, 46 tests, QA PASS (Done — commit 40e54d5c)
- [x] All 9 stories completed with acceptance criteria met
- [x] `generate-settings-json.js` created and integrated in installer
- [x] Fresh install includes: settings.json, 7 rules files, CLAUDE.md v5, IDE sync, entity registry
- [x] Fresh install includes: 7 skills, ~11 commands extras, 2 hooks JS (Gap #11-#13)
- [x] `settings.local.json` registers all JS hooks (not just synapse-engine)
- [x] `aios doctor` v2 validates skills count (>=7), commands count (>=20), hooks Claude Code count (>=2)
- [x] Upgrade preserves user core-config.yaml customizations
- [x] `@aios-master *health-check` task functional
- [x] `prepublishOnly` validates pro/ submodule populated before npm publish (Gap #14)
- [x] Zero regressions in existing install/upgrade flow
- [x] Documentation updated (CLAUDE.md template, installer README)

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-23 | @pm (Morgan) | Epic criado a partir do handoff @architect. Sizing ajustado (34→24 pts), INS-4.7 scoped fase 1, correcao 7 rules (nao 5), priorizacao INS-4 antes de TOK |
| 2.0 | 2026-02-23 | @pm (Morgan) | Codex Critical Analysis incorporada. Sizing ajustado (24→~26 pts): INS-4.2 (3→5), INS-4.3 (3→2), INS-4.7 (3→5), INS-4.8 (3→2). Gap analysis expandida para 10 itens com Codex findings. Discordancias: wave order mantida (doctor W1), stories adicionais rejeitadas (hooks→doctor check, testes→DoD). INS-4.3 reescopada para wiring only. |
| 2.1 | 2026-02-23 | @sm (River) | 8 stories drafadas: INS-4.1 through INS-4.8. Todas incorporam Codex findings (contract bug A3, merger YAML C3, scope reductions A1/A2, regression test DoD A4). Dependency graph respeitado. INS-4.6 entity registry threshold: relativo (nao fixo >=500). INS-4.8 *doctor alias removido para evitar conflito com CLI. |
| 3.0 | 2026-02-23 | @sm (River) | Stories corrigidas pos-Codex Story Review: schema settings.json como strings "Edit(path)" (INS-4.2), contrato commandSync com adapter pattern (INS-4.5), contrato MergeResult com createMergeResult (INS-4.7), narrativa hooks Claude Code vs git (INS-4.3), markers AIOS-MANAGED-START/END (INS-4.4), source path rules confirmado como .claude/rules/ (INS-4.1). Sizing INS-4.5 ajustado 2→3 pts. Total 27 pts. |
| 3.1 | 2026-02-23 | @po (Pax) | INS-4.1 closed: Done. 12 modular checks, --fix/--json/--dry-run, 40 tests. QA PASS (9/10). Commit 337213dc. Progress: 1/8 stories. |
| 4.1 | 2026-02-23 | @po (Pax) | INS-4.2 closed: Done. Settings.json generator with path traversal validation, js-yaml alignment, 12 tests. QA PASS (re-review). Commit 4a8d9f9e. Progress: 2/9 stories (10/33 pts). |
| 4.2 | 2026-02-23 | @po (Pax) | INS-4.3 closed: Done. Full artifact copy pipeline — settings.json generator wired, 7 skills copy, ~11 commands copy, dynamic hooks registration, 9 tests. QA PASS (re-review, 3 TDs resolved). Commit 8c92b01f. Progress: 3/9 stories (15/33 pts). |
| 4.3 | 2026-02-23 | @po (Pax) | INS-4.4 closed: Done. CLAUDE.md template v5 — 4 new AIOS-MANAGED sections (framework-boundary, rules-system, code-intelligence, graph-dashboard), 8 rule files listed, 15 tests, QA PASS. Commit 853b7195. Progress: 4/9 stories (18/33 pts). |
| 4.4 | 2026-02-23 | @po (Pax) | INS-4.5 closed: Done. IDE sync integration via adapter pattern — commandSync + commandValidate called after artifact copy, quiet output suppression, 20 tests, QA PASS. Commit 374788fe. Wave 2 complete (3/3 stories). Progress: 5/9 stories (21/33 pts). |
| 4.5 | 2026-02-23 | @po (Pax) | INS-4.10 closed: Done. Publish safety gate — validate-publish.js with 3 checks (pro/ populated, critical file, file count >= 50), prepublishOnly + npm-publish.yml CI wired, 17 tests, QA PASS. Commit 5513df9a. Wave 1 complete (3/3 stories). Progress: 6/9 stories (23/33 pts, 70%). |
| 4.6 | 2026-02-23 | @po (Pax) | INS-4.6 closed: Done. Entity registry bootstrap on install — populate-entity-registry.js called after .aios-core/ copy (sync, 0.67s), 3-state outcome (populated/skipped/failed), 19 tests, QA PASS. Commit 1777ee8f. Wave 3: 1/3 stories. Progress: 7/9 stories (25/33 pts, 76%). |
| 4.7 | 2026-02-23 | @po (Pax) | INS-4.7 closed: Done. YAML merger strategy + config smart merge Phase 1 — yaml-merger.js (181 lines, target-wins deep merge), brownfield-upgrader integration (core-config.yaml exception + backup safety), 26 tests, QA PASS (re-review, 3 concerns resolved). Commit 12aa5c7c. Wave 3: 2/3 stories. Progress: 8/9 stories (30/33 pts, 91%). |
| 4.8 | 2026-02-23 | @po (Pax) | INS-4.8 closed: Done. Unify health-check + 3 new doctor checks (skills-count, commands-count, hooks-claude-count), health-check.yaml v3 delegates to aios doctor --json, governance map with 15 checks→Constitution articles, 46 tests, QA PASS. Commit 40e54d5c. Wave 3 complete (3/3 stories). **EPIC COMPLETE: 9/9 stories, 33/33 pts, 100%.** All DoD items verified. |
| 4.0 | 2026-02-23 | @pm (Morgan) | DevOps Handoff v2 incorporado. 4 gaps novos (#11-#14): skills nao instaladas, commands extras ausentes, hooks parciais, publish sem validacao. INS-4.3 expandida (2→5 pts, absorve INS-4.9 skills/commands/hooks copy). INS-4.8 expandida (2→3 pts, absorve 3 doctor checks novos). INS-4.10 criada (2 pts, publish safety gate, Wave 1). INS-4.5 titulo expandido. Total: 27→33 pts, 8→9 stories. Decisoes: hooks Py/Sh criticos→CJS, rest→ignorar. |

## Handoff to Story Manager

"@sm, por favor atualize as stories afetadas e crie a story INS-4.10. Key considerations:

**Stories existentes a ATUALIZAR:**
- **INS-4.3** — Escopo expandido de 'Wire Generator' para 'Full Artifact Copy Pipeline'. Agora inclui: (1) wire settings.json generator, (2) copiar 7 skills para `.claude/skills/`, (3) copiar ~11 commands extras para `.claude/commands/`, (4) copiar 2 hooks JS para `.claude/hooks/`, (5) registrar hooks em `settings.local.json`. Arquivo principal: `ide-config-generator.js`. Sizing: 2→5 pts
- **INS-4.5** — Titulo expandido para incluir skills + commands no sync. Garantir que IDE sync cobre todos artefatos, nao apenas agents
- **INS-4.8** — Escopo expandido: alem de unificar health-check, adicionar 3 checks novos ao doctor: `skills-count` (>=7), `commands-count` (>=20), `hooks-claude-count` (>=2). Sizing: 2→3 pts

**Story NOVA:**
- **INS-4.10** — Publish Safety Gate (2 pts, Wave 1, @devops executor). Previne reincidencia do incidente v4.2.14/v4.2.15: (1) `prepublishOnly` script valida pro/ submodule inicializado, (2) verifica presenca de `pro/license/license-api.js`, (3) conta minimo de arquivos no pacote. Refs: [DevOps Handoff v2](../../handoffs/handoff-devops-to-pm-installation-health-v2.md) secoes 2 e 4

**Inventario de artefatos para INS-4.3** (ver handoff v2 secao 5):
- Skills (7): architect-first, checklist-runner, coderabbit-review, mcp-builder, skill-creator, synapse, tech-search
- Commands extras (~11): greet.md, synapse/manager.md, synapse/tasks/*.md (7), synapse/utils/*.md (1), AIOS/stories/*.md
- Hooks JS (2): synapse-engine.cjs (ja copiado), precompact-session-digest.cjs (FALTANTE)
- Decisao PM sobre hooks Python/Shell: converter `write-path-validation` e `read-protection` para CJS. Demais ignorar.

**Wave 1 pode comecar imediatamente** (INS-4.2 + INS-4.10 em paralelo, zero blockers)"
