<!--
  Traduccion: ES
  Original: /docs/guides/ade-guide.md
  Ultima sincronizacion: 2026-01-29
-->

# AIOS Autonomous Development Engine (ADE) - Guia Completa

> **Version:** 1.0.0
> **Fecha:** 2026-01-29
> **Estado:** Production Ready

---

## Que es el ADE?

El **AIOS Autonomous Development Engine (ADE)** es un sistema de desarrollo autonomo que transforma requisitos vagos en codigo funcional a traves de pipelines estructurados y agentes especializados.

### Caracteristicas Principales

- **Spec Pipeline** - Transforma ideas en especificaciones ejecutables
- **Execution Engine** - Ejecuta subtasks con self-critique obligatorio
- **Recovery System** - Recupera de fallos automaticamente
- **QA Evolution** - Review estructurado en 10 fases
- **Memory Layer** - Aprende y documenta patrones

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADE Architecture                                   │
│                                                                              │
│  User Request ──► Spec Pipeline ──► Execution Engine ──► Working Code       │
│                                            │                                 │
│                                            ▼                                 │
│                                    Recovery System                           │
│                                            │                                 │
│                                            ▼                                 │
│                                    QA Evolution                              │
│                                            │                                 │
│                                            ▼                                 │
│                                    Memory Layer                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Los 7 Epics

### Epic 1: Worktree Manager

**Proposito:** Aislamiento de branches via Git worktrees

**Comandos (@devops):**

- `*create-worktree {story}` - Crear worktree aislado
- `*list-worktrees` - Listar worktrees activos
- `*merge-worktree {story}` - Hacer merge del worktree
- `*cleanup-worktrees` - Eliminar worktrees antiguos

**Documentacion:** [ADE-EPIC1-HANDOFF.md](../architecture/ADE-EPIC1-HANDOFF.md)

---

### Epic 2: Migration V2→V3

**Proposito:** Migracion al formato autoClaude V3

**Comandos (@devops):**

- `*inventory-assets` - Inventario de assets V2
- `*analyze-paths` - Analizar dependencias
- `*migrate-agent` - Migrar agente individual
- `*migrate-batch` - Migrar todos en batch

**Documentacion:** [ADE-EPIC2-HANDOFF.md](../architecture/ADE-EPIC2-HANDOFF.md)

---

### Epic 3: Spec Pipeline

**Proposito:** Transformar requisitos en specs ejecutables

**Flujo:**

```
User Request → Gather → Assess → Research → Write → Critique → Spec Ready
```

**Comandos por Agente:**

| Agente     | Comando                | Fase                    |
| ---------- | ---------------------- | ----------------------- |
| @pm        | `*gather-requirements` | Recopilar requisitos    |
| @architect | `*assess-complexity`   | Evaluar complejidad     |
| @analyst   | `*research-deps`       | Investigar dependencias |
| @pm        | `*write-spec`          | Escribir spec           |
| @qa        | `*critique-spec`       | Criticar y aprobar      |

**Documentacion:** [ADE-EPIC3-HANDOFF.md](../architecture/ADE-EPIC3-HANDOFF.md)

---

### Epic 4: Execution Engine

**Proposito:** Ejecutar specs en codigo funcional

**13 Pasos del Coder:**

1. Load Context
2. Read Implementation Plan
3. Understand Current Subtask
4. Plan Approach
5. Write Code
   - 5.5 SELF-CRITIQUE (obligatorio)
6. Run Tests
   - 6.5 SELF-CRITIQUE (obligatorio)
7. Fix Issues
8. Run Linter
9. Fix Lint Issues
10. Verify Manually
11. Update Plan Status
12. Commit Changes
13. Signal Completion

**Comandos (@architect):**

- `*create-plan` - Crear plan de implementacion
- `*create-context` - Generar contexto del proyecto

**Comandos (@dev):**

- `*execute-subtask` - Ejecutar subtask

**Documentacion:** [ADE-EPIC4-HANDOFF.md](../architecture/ADE-EPIC4-HANDOFF.md)

---

### Epic 5: Recovery System

**Proposito:** Recuperar de fallos en subtasks

**Flujo:**

```
Subtask Fails → Track Attempt → Retry (<3) → Stuck Detection → Rollback → Escalate
```

**Comandos (@dev):**

- `*track-attempt` - Registrar intento
- `*rollback` - Volver al estado anterior

**Documentacion:** [ADE-EPIC5-HANDOFF.md](../architecture/ADE-EPIC5-HANDOFF.md)

---

### Epic 6: QA Evolution

**Proposito:** Review estructurado en 10 fases

**10 Fases:**

1. Setup & Context Loading
2. Code Quality Analysis
3. Test Coverage Review
4. Security Scan
5. Performance Check
6. Documentation Audit
7. Accessibility Review
8. Integration Points Check
9. Edge Cases & Error Handling
10. Final Summary & Decision

**Comandos (@qa):**

- `*review-build {story}` - Review completo
- `*request-fix {issue}` - Solicitar correccion
- `*verify-fix {issue}` - Verificar correccion

**Comandos (@dev):**

- `*apply-qa-fix` - Aplicar correccion del QA

**Documentacion:** [ADE-EPIC6-HANDOFF.md](../architecture/ADE-EPIC6-HANDOFF.md)

---

### Epic 7: Memory Layer

**Proposito:** Memoria persistente de patrones e insights

**Tipos de Memoria:**

- **Insights** - Descubrimientos durante el desarrollo
- **Patterns** - Patrones de codigo extraidos
- **Gotchas** - Trampas conocidas
- **Decisions** - Decisiones arquitecturales

**Comandos (@dev):**

- `*capture-insights` - Capturar insights de la sesion
- `*list-gotchas` - Listar gotchas conocidas

**Comandos (@architect):**

- `*map-codebase` - Generar mapa del codebase

**Comandos (@analyst):**

- `*extract-patterns` - Extraer patrones del codigo

**Documentacion:** [ADE-EPIC7-HANDOFF.md](../architecture/ADE-EPIC7-HANDOFF.md)

---

## Inicio Rapido

### 1. Crear Spec a partir de Requisito

```bash
# Activar PM y recopilar requisitos
@pm *gather-requirements

# Evaluar complejidad
@architect *assess-complexity

# Investigar dependencias
@analyst *research-deps

# Escribir spec
@pm *write-spec

# Criticar y aprobar
@qa *critique-spec
```

### 2. Ejecutar Spec Aprobada

```bash
# Crear plan de implementacion
@architect *create-plan

# Crear contexto del proyecto
@architect *create-context

# Ejecutar subtasks (bucle)
@dev *execute-subtask 1.1
@dev *execute-subtask 1.2
...
```

### 3. QA Review

```bash
# Review estructurado
@qa *review-build STORY-42

# Si hay issues:
@qa *request-fix "Missing error handling"
@dev *apply-qa-fix
@qa *verify-fix
```

### 4. Capturar Aprendizaje

```bash
# Capturar insights de la sesion
@dev *capture-insights

# Documentar gotchas
@dev *list-gotchas
```

---

## Estructura de Archivos

```
.aios-core/
├── development/
│   ├── agents/              # Definiciones de agentes V3
│   ├── tasks/               # Tasks ejecutables
│   │   ├── spec-*.md        # Spec Pipeline tasks
│   │   ├── plan-*.md        # Execution Engine tasks
│   │   ├── qa-*.md          # QA Evolution tasks
│   │   └── capture-*.md     # Memory Layer tasks
│   └── workflows/
│       ├── spec-pipeline.yaml
│       ├── qa-loop.yaml
│       └── auto-worktree.yaml
│
├── infrastructure/
│   ├── scripts/
│   │   ├── worktree-manager.js     # Epic 1
│   │   ├── asset-inventory.js      # Epic 2
│   │   ├── migrate-agent.js        # Epic 2
│   │   ├── subtask-verifier.js     # Epic 4
│   │   ├── plan-tracker.js         # Epic 4
│   │   ├── recovery-tracker.js     # Epic 5
│   │   ├── rollback-manager.js     # Epic 5
│   │   ├── qa-loop-orchestrator.js # Epic 6
│   │   ├── codebase-mapper.js      # Epic 7
│   │   └── pattern-extractor.js    # Epic 7
│   └── schemas/
│       ├── agent-v3-schema.json
│       └── task-v3-schema.json
│
└── product/
    ├── templates/
    │   ├── spec-tmpl.md
    │   └── qa-report-tmpl.yaml
    └── checklists/
        └── self-critique-checklist.md
```

---

## Formato autoClaude V3

### Definicion de Agente

```yaml
autoClaude:
  version: '3.0'
  migratedAt: '2026-01-29T02:24:10.724Z'

  specPipeline:
    canGather: boolean # @pm
    canAssess: boolean # @architect
    canResearch: boolean # @analyst
    canWrite: boolean # @pm
    canCritique: boolean # @qa

  execution:
    canCreatePlan: boolean # @architect
    canCreateContext: boolean # @architect
    canExecute: boolean # @dev
    canVerify: boolean # @dev

  recovery:
    canTrackAttempts: boolean # @dev
    canRollback: boolean # @dev

  qa:
    canReview: boolean # @qa
    canRequestFix: boolean # @qa

  memory:
    canCaptureInsights: boolean # @dev
    canExtractPatterns: boolean # @analyst
    canDocumentGotchas: boolean # @dev
```

### Definicion de Task

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-gather|spec-assess|exec-plan|exec-subtask|etc
  deterministic: boolean
  elicit: boolean
  composable: boolean

  verification:
    type: none|command|manual
    command: 'npm test'

  selfCritique:
    required: boolean
    checklistRef: 'self-critique-checklist.md'
```

---

## QA Gates

Cada Epic tiene un QA Gate que debe pasar antes de continuar:

```bash
@qa *gate epic-{N}-{name}
```

**Decisiones:**

- **PASS** - Proximo epic liberado
- **CONCERNS** - Aprobado con follow-ups
- **FAIL** - Retorna para correcciones
- **WAIVED** - Bypass autorizado por @po

---

## Solucion de Problemas

### Subtask Falla Repetidamente

```bash
# Verificar historial de intentos
@dev *track-attempt --status

# Rollback al ultimo estado bueno
@dev *rollback --hard

# Intentar enfoque diferente
@dev *execute-subtask 2.1 --approach alternative
```

### Spec no Aprobada

```bash
# Ver feedback del critique
cat docs/stories/STORY-42/spec-critique.json

# Refinar spec
@pm *write-spec --iterate

# Re-enviar para critique
@qa *critique-spec
```

### Worktree Conflicta

```bash
# Listar worktrees
@devops *list-worktrees

# Resolver conflictos
@devops *merge-worktree STORY-42 --resolve

# Cleanup
@devops *cleanup-worktrees
```

---

## Documentacion Relacionada

- [ADE Architect Handoff](../architecture/ADE-ARCHITECT-HANDOFF.md) - Overview general
- [ADE Agent Changes](../architecture/ADE-AGENT-CHANGES.md) - Alteraciones en todos los agentes con matriz de capabilities
- [Epic 1 - Worktree Manager](../architecture/ADE-EPIC1-HANDOFF.md)
- [Epic 2 - Migration V2→V3](../architecture/ADE-EPIC2-HANDOFF.md)
- [Epic 3 - Spec Pipeline](../architecture/ADE-EPIC3-HANDOFF.md)
- [Epic 4 - Execution Engine](../architecture/ADE-EPIC4-HANDOFF.md)
- [Epic 5 - Recovery System](../architecture/ADE-EPIC5-HANDOFF.md)
- [Epic 6 - QA Evolution](../architecture/ADE-EPIC6-HANDOFF.md)
- [Epic 7 - Memory Layer](../architecture/ADE-EPIC7-HANDOFF.md)

---

_AIOS Autonomous Development Engine - Transformando Ideas en Codigo Automaticamente_
