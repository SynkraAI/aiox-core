# Hierarquia de Orquestradores - AIOX Core

> Issue: #90 - Script lifecycle audit
> EPIC12-F4 - Documentacao de coexistencia

## Visao Geral

O AIOX possui tres orquestradores que operam em camadas complementares. Nenhum conflita com os outros -- cada um tem escopo e responsabilidades distintas.

```
MasterOrchestrator (Epic 0)
  |-- Ativacao de agentes, roteamento de comandos
  |-- Pipeline completo: Epics 3 -> 4 -> 5 -> 6
  |
BobOrchestrator (Epic 12)
  |-- Decision tree do PM agent
  |-- Story-driven, multi-agent orchestration
  |-- Integra todos os modulos Epic 11
  |
WorkflowOrchestrator (Core)
  |-- Engine de execucao de workflows
  |-- Multi-agent phase dispatch
  |-- Pre-Flight detection, skill dispatch
```

## Detalhamento

### 1. MasterOrchestrator

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/core/orchestration/master-orchestrator.js` |
| **Epic** | Epic 0 (ADE - Autonomous Development Engine) |
| **Story** | 0.1 - Master Orchestrator Core |
| **Escopo** | Orquestracao central do pipeline de desenvolvimento autonomo |

**Responsabilidades:**
- `executeFullPipeline()` — executa Epics 3, 4, 5, 6 em sequencia
- `executeEpic(epicNum)` — execucao individual de um epic
- `resumeFromEpic(epicNum)` — retomada de ponto especifico
- State machine: INITIALIZED -> READY -> IN_PROGRESS -> BLOCKED -> COMPLETE
- Integracao com TechStackDetector para pre-flight detection

**Quando usar:** Pipeline completo de desenvolvimento autonomo, ativacao de agentes no nivel mais alto.

---

### 2. BobOrchestrator

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/core/orchestration/bob-orchestrator.js` |
| **Epic** | Epic 12 (Projeto Bob) |
| **Story** | 12.3 - Bob Orchestration Logic (Decision Tree) |
| **Escopo** | PM agent routing via decision tree codificada |

**Responsabilidades:**
- Detecta estado do projeto e roteia para workflow correto
- Integra TODOS os modulos Epic 11:
  - ExecutorAssignment (11.1) — selecao de agente
  - TerminalSpawner (11.2) — spawn de agentes
  - WorkflowExecutor (11.3) — ciclo de desenvolvimento
  - SurfaceChecker (11.4) — criterios de decisao humana
  - SessionState (11.5) — persistencia de sessao
- Decision tree sem LLM (roteamento deterministico)
- Constraint: < 50 linhas de logica especifica de outros agentes

**Quando usar:** Orquestracao story-driven multi-agente via PM.

---

### 3. WorkflowOrchestrator

| Campo | Valor |
|-------|-------|
| **Path** | `.aiox-core/core/orchestration/workflow-orchestrator.js` |
| **Epic** | Core (pre-Epic 11) |
| **Escopo** | Engine de execucao de workflows multi-agente |

**Responsabilidades:**
- Executa workflows com subagentes reais (persona transformation)
- Cada fase despacha para agente especializado
- Integracao com:
  - SubagentPromptBuilder — construcao de prompts
  - ContextManager — gerenciamento de contexto
  - ParallelExecutor — execucao paralela
  - ChecklistRunner — execucao de checklists
  - TechStackDetector (V3.1) — pre-flight detection
  - ConditionEvaluator, SkillDispatcher — dispatch condicional

**Quando usar:** Execucao de workflows que envolvem multiplos agentes com fases definidas.

---

## Relacao Entre Orquestradores

```
Requisicao do usuario
  |
  v
MasterOrchestrator (ativa agente)
  |
  |-- Se PM/Bob --> BobOrchestrator (decision tree)
  |                   |
  |                   v
  |                 WorkflowExecutor (ciclo dev)
  |                   |
  |                   v
  |                 WorkflowOrchestrator (executa fases)
  |
  |-- Se outro agente --> execucao direta ou task
```

## Modulos Deprecados (ver docs/deprecated-scripts.md)

| Modulo Legado | Substituto | Status |
|---------------|-----------|--------|
| `workflow-state-manager.js` | `session-state.js` | @deprecated |
| `workflow-navigator.js` | `bob-orchestrator.js` + `session-state.js` | @deprecated (semi) |
| `command-execution-hook.js` | `session-state.js` | @deprecated |

Estes modulos ainda existem para backward compatibility mas nao devem ser usados em codigo novo.
