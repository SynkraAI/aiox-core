# ROADMAP MASTER - AIOS + JARVIS

> Documento vivo. Atualizar checkboxes conforme progresso.
> Criado: 2026-02-26 | Ultima atualizacao: 2026-02-28 (W2.7/W2.9/W2.10 + W3.1/W3.2/W3.3/W3.5/W3.12/W3.14 verified DONE)
> Referencia cruzada: `docs/stories/backlog.json`, `docs/roadmap.md`

---

## Status Geral

| Area | Progresso | Notas |
|------|-----------|-------|
| AIOS Core Framework | ~85% | 14 modulos completos, 5 gaps ativos |
| JARVIS CLI Engine | ~95% | 7/7 stories DONE, pipeline integrado, 330 testes |
| JARVIS Voice Hub | ~90% | v6 cockpit + Core integration (W2.1-W2.6 DONE) |
| Squads & Marketplace | ~5% | Apenas _example/ existe |
| Pro Module | ~10% | Scaffolding existe, PRO-11 pendente |
| Dashboard/Observability | 0% | Nao iniciado |

---

## WAVE 0 — QUICK WINS & FIXES CRITICOS (1-2 sessoes)

> Itens que desbloqueiam outras waves ou corrigem bugs ativos.

### JARVIS Voice Hub - Fixes

- [x] W0.1 - Fix PDF parsing (pdf-parse v2→v1) — DONE 2026-02-26
- [x] W0.2 - Menu lateral historico de chats — DONE 2026-02-26
- [x] W0.3 - Fix `viewFile()` no app.js — agora injeta conteudo no contexto do JARVIS — DONE 2026-02-27
- [x] W0.4 - Fix `read_file` tool aplica BLOCKED_PATHS (protege .env) — DONE 2026-02-27
- [x] W0.5 - Fix `search_code` reescrito em Node.js puro (sem grep) — DONE 2026-02-27
- [x] W0.6 - Removidas deps mortas (`@anthropic-ai/sdk`, `form-data`) + npm prune (-22 pkgs) — DONE 2026-02-27
- [x] W0.7 - Removido `voiceSelect` do HTML e app.js (dead code) — DONE 2026-02-27

### AIOS Core - Fixes Criticos

- [x] W0.8 - Fix @qa task ref: `manage-story-backlog.md` → `po-manage-story-backlog.md` — DONE 2026-02-27
- [x] W0.9 - Fix GreetingPreferenceManager: adicionado `preference: auto` em core-config.yaml — DONE 2026-02-27
- [x] W0.10 - SYNAPSE SYN-13 ja implementado e QA PASS (9/10) — aguarda apenas push @devops — DONE 2026-02-27

---

## WAVE 1 — JARVIS CLI ENGINE (3-5 sessoes)

> Completar o motor de inteligencia do JARVIS. Pre-requisito para integracao Voice Hub ↔ Core.

### Story 1.1 - CLI Bootstrap & Entry Point (DONE)
- [x] W1.1 - Review final e merge da Story 1.1 — DONE 2026-02-27
- [x] W1.2 - Fix INT-001: `npx aios-core jarvis` adicionado ao bin/aios.js — DONE 2026-02-27

### Story 1.2 - Intent Classification Engine (DONE)
- [x] W1.3 - Review final e merge da Story 1.2 — DONE 2026-02-27
- [ ] W1.4 - Implementar Tier 2 LLM fallback (atualmente stub intencional)

### Story 1.3 - Mission Planner (DONE)
- [x] W1.5 - Story completa, QA Gate PASS

### Story 1.4 - Agent Delegation Bridge (DONE)
- [x] W1.6 - Implementar delegation-bridge.js completo (706 linhas) — DONE 2026-02-27
- [x] W1.7 - AuthorityChecker + Semaphore (cap 3 concorrentes) — DONE 2026-02-27
- [x] W1.8 - delegate/delegateParallel + retry + timeout — DONE 2026-02-27
- [x] W1.9 - NDJSON mission log — DONE 2026-02-27

### Story 1.5 - Autonomy Controller (DONE)
- [x] W1.10 - Implementar autonomy-controller.js (869 linhas) — DONE 2026-02-27
- [x] W1.11 - Modos: supervised / assisted / autonomous — DONE 2026-02-27
- [x] W1.12 - Risk assessment per-action (safe patterns + novel triggers) — DONE 2026-02-27

### Story 1.6 - Session State & Project Context (DONE)
- [x] W1.13 - Implementar session-manager.js completo (493 linhas) — DONE 2026-02-27
- [x] W1.14 - Round-trip save/load, corruption recovery — DONE 2026-02-27
- [x] W1.15 - 30-mission cap, cleanup 30d archive / 90d purge — DONE 2026-02-27

### Story 1.7 - Real-Time Progress Reporting (DONE)
- [x] W1.16 - Implementar progress-reporter.js — DONE 2026-02-27
- [x] W1.17 - Streaming updates para terminal + WebSocket — DONE 2026-02-27

### Integration: processCommand() Pipeline (DONE)
- [x] W1.18 - Wire processCommand() em jarvis-bootstrap.js: IntentEngine → MissionPlanner → AutonomyController → DelegationBridge → SessionManager — DONE 2026-02-27
- [x] W1.19 - Todos os 330 testes JARVIS passando — DONE 2026-02-27

---

## WAVE 2 — JARVIS VOICE HUB → CORE INTEGRATION (2-3 sessoes)

> Conectar o Voice Hub ao JARVIS Core Engine em vez de ir direto ao OpenAI.
> Atualmente: Browser ↔ server.js ↔ OpenAI Realtime (bypass total do Core)
> Target: Browser ↔ server.js ↔ JARVIS Core ↔ OpenAI Realtime

- [x] W2.1 - Definir REST API do JARVIS Core (jarvis-api.js criado, 5 endpoints) — DONE 2026-02-28
- [x] W2.2 - Server.js consome JARVIS Core API (5 rotas REST + WS integration) — DONE 2026-02-28
- [x] W2.3 - Intent Engine processa comandos de voz (jarvis_command tool + routing) — DONE 2026-02-28
- [x] W2.4 - Delegation Bridge roteia para agentes AIOS reais (via jarvis-api pipeline) — DONE 2026-02-28
- [x] W2.5 - Session Manager mantém estado entre requests de voz (per-session store) — DONE 2026-02-28
- [x] W2.6 - Progress Reporter envia updates via WebSocket para o cockpit (6 event types) — DONE 2026-02-28

### Voice Hub - Melhorias UX

- [x] W2.7 - File viewer inline no chat (preview de codigo/texto) — VERIFIED DONE 2026-02-28
- [x] W2.8 - OCR para PDFs escaneados (fallback quando pdf-parse retorna vazio) — DONE 2026-02-28 (pdf-to-img + GPT-4o Vision, ate 3 paginas)
- [x] W2.9 - Notificacoes push no cockpit (tool executions, errors) — VERIFIED DONE 2026-02-28
- [x] W2.10 - Tema claro/escuro toggle — VERIFIED DONE 2026-02-28
- [x] W2.11 - PWA manifest + service worker (instalar no celular) — DONE 2026-02-28 (icones SVG+PNG, SW v2, offline page)
- [x] W2.12 - Autenticacao basica (pin/senha) para proteger endpoints — DONE 2026-02-28 (PIN 4-6 digitos, WS auth, session TTL, auto-logout)

---

## WAVE 3 — AIOS CORE COMPLETENESS (3-4 sessoes)

> Resolver tech debt e gaps do framework.

### Activation Pipeline (ACT-2 → ACT-8)

- [x] W3.1 - ACT-2: Audit user_profile impact across agents — VERIFIED DONE (31 testes, cascade wired)
- [x] W3.2 - ACT-3: ProjectStatusLoader reliability overhaul — VERIFIED DONE (90 testes)
- [x] W3.3 - ACT-4: PermissionMode integration (wiring permissions/ to CLI) — VERIFIED DONE (67 testes)
- [ ] W3.4 - ACT-5: WorkflowNavigator + Bob integration
- [x] W3.5 - ACT-6: Unified Activation Pipeline — VERIFIED DONE (QA PASS, 67 testes)
- [ ] W3.6 - ACT-7: Context-Aware Greeting Sections
- [ ] W3.7 - ACT-8: Agent Config Loading governance

### Core Gaps

- [x] W3.8 - Remover phantom memory modules (memory-query.js, session-memory.js) — DONE 2026-02-28 (dead imports removidos, 66 testes passando)
- [x] W3.9 - Consolidar 3 duplicate task file pairs -- DONE: dev-apply-qa-fixes.md and sm-create-next-story.md refs updated to generic versions, entity-registry/install-manifest cleaned. validate-next-story/dev-validate-next-story NOT duplicates (different agents). L2 deny rules block file deletion -- needs manual removal.
- [x] W3.10 - Consolidar 3 elicitation file duplicates -- DONE: removed 5 duplicates, updated elicitationLocation config
- [ ] W3.11 - Config migration monolitico → L1-L4 — W4 BLOCKER: migrate-config.js existe mas nunca executado
- [x] W3.12 - INS-4.11: v4.3.0 post-release installer fixes — VERIFIED DONE (SYNAPSE migration concluida)
- [ ] W3.13 - INS-4.12: brownfield dependency resolution

### Stories Pendentes

- [x] W3.14 - CODEINTEL-RP-001: RegistryProvider completion — VERIFIED DONE (QA PASS, 351 testes)
- [ ] W3.15 - NOG-23: post-migration validation benchmark
- [ ] W3.16 - WIS-16: workflow-aware greeting handoffs
- [ ] W3.17 - GHIM-001 Phase 3: GitHub Actions execution

---

## WAVE 4 — OBSERVABILITY & DASHBOARD (2-3 sessoes)

> CLI First → Observability Second → UI Third

- [ ] W4.1 - Dashboard web (Express/WS) — real-time system monitor
- [ ] W4.2 - Agent activity timeline (quem fez o que, quando)
- [ ] W4.3 - Story progress tracker visual
- [ ] W4.4 - Git activity graph
- [ ] W4.5 - GD-5: HTML web viewer para graph-dashboard
- [ ] W4.6 - GD-6: VS Code extension
- [ ] W4.7 - Integrar dashboard com JARVIS cockpit (tab adicional ou merge)

---

## WAVE 5 — SQUADS & MARKETPLACE (2-3 sessoes)

> Tornar squads reais e utilizaveis.

- [ ] W5.1 - Criar starter squads (web-dev, mobile, data-science)
- [ ] W5.2 - Squad registry (catalogo de squads disponiveis)
- [ ] W5.3 - `npx aios-core squad install <name>` flow
- [ ] W5.4 - Squad config: tool overrides, agent compositions
- [ ] W5.5 - Documentar como criar squads custom

---

## WAVE 6 — PRO MODULE & MONETIZACAO (2-3 sessoes)

- [ ] W6.1 - PRO-11: Email auth + buyer-based activation
- [ ] W6.2 - Pro feature gates (quais features sao pro-only)
- [ ] W6.3 - License validation flow
- [ ] W6.4 - Onboarding experience (time-to-first-value <= 10min)

---

## WAVE 7 — CLEANUP & POLISH (1-2 sessoes)

- [ ] W7.1 - Arquivar 5 deprecated standards docs
- [ ] W7.2 - Remover 3 orphaned SQL template queries
- [ ] W7.3 - Arquivar 5 dead migration scripts
- [ ] W7.4 - Resolver 3 ghost directories
- [ ] W7.5 - Adicionar testes para 10+ core modules sem coverage
- [ ] W7.6 - Arquivar 5 orphaned infrastructure scripts
- [ ] W7.7 - Wiring ideation-engine e timeline-manager (ou remover)
- [ ] W7.8 - Rollback cleanup + edge case tests pro-scaffolder
- [ ] W7.9 - E2E tests para SDC workflow completo
- [ ] W7.10 - Security audit (endpoints sem auth, tool blocklists)

---

## Metricas de Progresso

| Wave | Total Items | Concluidos | % |
|------|------------|------------|---|
| W0 Quick Wins | 10 | 10 | 100% |
| W1 JARVIS CLI | 19 | 18 | 95% |
| W2 Integration | 12 | 12 | 100% |
| W3 Core | 17 | 9 | 53% |
| W4 Dashboard | 7 | 0 | 0% |
| W5 Squads | 5 | 0 | 0% |
| W6 Pro | 4 | 0 | 0% |
| W7 Cleanup | 10 | 0 | 0% |
| **TOTAL** | **84** | **49** | **58%** |

---

## Regras de Execucao

1. **Sempre iniciar sessao lendo este arquivo** para retomar contexto
2. **Atualizar checkboxes** imediatamente ao completar item
3. **Waves sao sequenciais** mas items dentro de uma wave podem ser paralelos
4. **W0 e W1 sao pre-requisitos** para W2
5. **W3 pode rodar em paralelo** com W1/W2
6. **Cada sessao deve ter objetivo claro**: "Hoje vamos completar W0" ou "Foco em W1.6-W1.9"
7. **JARVIS Voice Hub** pode receber melhorias incrementais a qualquer momento
8. **Se iniciar sessao nova**, ler: `docs/ROADMAP-MASTER.md` + `docs/stories/backlog.json`

---

## Dependencias entre Waves

```
W0 (fixes) ──→ W1 (JARVIS CLI) ──→ W2 (Integration)
                                         ↓
W3 (Core) ─────────────────────→ W4 (Dashboard)
                                         ↓
W5 (Squads) ────────────────────→ W6 (Pro)
                                         ↓
                                    W7 (Cleanup)
```

W0 + W1 = Fundacao | W2 + W3 = Conexao | W4-W7 = Escala
