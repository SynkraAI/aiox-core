# Scripts Deprecados - Auditoria de Lifecycle

> Issue: #90 - Script lifecycle audit
> EPIC12-F4 - Sprint Planning Feedback

## Resumo

Scripts legados que foram superseded por modulos Epic 11/12 e migracao de tasks V2.0. Nenhum script foi removido -- todos foram marcados com `@deprecated` e `console.warn` para visibilidade em runtime.

---

## Scripts Deprecados

### 1. `workflow-state-manager.js`

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/development/scripts/workflow-state-manager.js` |
| **Substituto** | `.aiox-core/core/orchestration/session-state.js` |
| **Motivo** | SessionState (Story 11.5, ADR-011) unifica persistencia de estado. Bob usa SessionState exclusivamente. |
| **Impacto** | Ainda importado por `verify-workflow-gaps.js`, `suggestion-engine.js`, `next.md` |
| **Acao** | Migrar importadores para session-state.js em sprint futuro |

### 2. `workflow-navigator.js`

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/development/scripts/workflow-navigator.js` |
| **Substituto** | `.aiox-core/core/orchestration/bob-orchestrator.js` + `session-state.js` |
| **Motivo** | Bob Orchestrator (Story 12.3) agora faz roteamento de workflow via decision tree codificada. SessionState gerencia persistencia. |
| **Impacto** | Ainda importado por `greeting-builder.js`, `unified-activation-pipeline.js` |
| **Acao** | Avaliar se consumers podem migrar para bob-orchestrator; manter como compat ate entao |

### 3. `command-execution-hook.js`

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/scripts/command-execution-hook.js` |
| **Substituto** | `.aiox-core/core/orchestration/session-state.js` |
| **Motivo** | SessionState (Story 11.5) absorve tracking de comandos, transicoes de agente e persistencia de sessao com capabilities superiores (crash recovery, phase tracking, epic/story context). |
| **Impacto** | Nenhum import ativo em JS -- apenas referenciado em docs |
| **Acao** | Seguro para remocao futura |

### 4. `session-context-loader.js`

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/scripts/session-context-loader.js` |
| **Substituto** | `.aiox-core/core/session/context-loader.js` |
| **Motivo** | Re-export de compatibilidade (WIS-3). Localizacao canonica movida para core/session/. |
| **Impacto** | Funciona como proxy -- pode ser removido quando todos os imports migrarem |
| **Acao** | Migrar imports restantes para core/session/context-loader |

### 5. `batch-migrate-phase1.ps1`

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/scripts/batch-migrate-phase1.ps1` |
| **Substituto** | N/A (migracao concluida) |
| **Motivo** | Script one-time para migracao de tasks para formato V2.0. Migracao ja concluida. |
| **Impacto** | Nenhum |
| **Acao** | Pode ser removido em cleanup futuro |

### 6. `batch-migrate-phase2.ps1`

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/scripts/batch-migrate-phase2.ps1` |
| **Substituto** | N/A (migracao concluida) |
| **Motivo** | Script one-time para migracao de 50 tasks agent-specific. Migracao ja concluida. |
| **Impacto** | Nenhum |
| **Acao** | Pode ser removido em cleanup futuro |

### 7. `batch-migrate-phase3.ps1`

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/scripts/batch-migrate-phase3.ps1` |
| **Substituto** | N/A (migracao concluida) |
| **Motivo** | Script one-time para migracao de tasks restantes. Migracao ja concluida. |
| **Impacto** | Nenhum |
| **Acao** | Pode ser removido em cleanup futuro |

### 8. `validate-phase1.ps1`

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/scripts/validate-phase1.ps1` |
| **Substituto** | `validate-task-v2.js` (direto) |
| **Motivo** | Script one-time para validar Phase 1 da migracao V2.0. Validacao agora feita via validate-task-v2.js. |
| **Impacto** | Nenhum |
| **Acao** | Pode ser removido em cleanup futuro |

### 9. `migrate-framework-docs.sh`

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/scripts/migrate-framework-docs.sh` |
| **Substituto** | N/A (migracao concluida) |
| **Motivo** | Script one-time (Story 6.1.2.6) para migrar docs de aiox-fullstack para aiox-core. Migracao ja concluida. |
| **Impacto** | Nenhum |
| **Acao** | Pode ser removido em cleanup futuro |

---

## Scripts NAO Deprecados (Documentar Coexistencia)

Os tres orquestradores coexistem com escopos complementares. Nenhum conflito real:

| Orquestrador | Escopo | Epic |
|--------------|--------|------|
| `BobOrchestrator` | PM agent decision tree, story-driven multi-agent | Epic 12 |
| `MasterOrchestrator` | Agent activation, command routing, full pipeline | Epic 0 |
| `WorkflowOrchestrator` | Workflow execution engine (multi-agent phases) | Core |

Ver `.aiox-core/core/docs/orchestration-hierarchy.md` para detalhes.
