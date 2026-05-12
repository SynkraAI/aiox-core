# Cambios en los Agentes ADE - Alteraciones en los Agentes AIOX

> **Documento:** Registro de las alteraciones realizadas en los agentes para soportar ADE
> **Fecha:** 2026-01-29
> **Estado:** Completo
> **Relacionado:** ADE Epics 1-7

---

## Descripción General

Este documento registra todas las alteraciones realizadas en los archivos de definición de los agentes AIOX para soportar el AIOX Autonomous Development Engine (ADE).

**Archivos modificados:**

- `.aiox-core/development/agents/*.md` (fuente)
- `.claude/commands/AIOX/agents/*.md` (sincronizado)

---

## Formato autoClaude V3

Todos los agentes fueron migrados para incluir la sección `autoClaude` en el formato V3:

```yaml
autoClaude:
  version: '3.0'
  migratedAt: '2026-01-29T02:24:XX.XXXZ'

  # Capacidades del Spec Pipeline (Epic 3)
  specPipeline:
    canGather: boolean # Recolectar requisitos
    canAssess: boolean # Evaluar complejidad
    canResearch: boolean # Investigar dependencias
    canWrite: boolean # Escribir spec
    canCritique: boolean # Criticar spec

  # Capacidades del Execution Engine (Epic 4)
  execution:
    canCreatePlan: boolean # Crear plan de implementación
    canCreateContext: boolean # Crear contexto del proyecto
    canExecute: boolean # Ejecutar subtasks
    canVerify: boolean # Verificar subtasks

  # Capacidades del Recovery System (Epic 5)
  recovery:
    canTrackAttempts: boolean # Rastrear intentos
    canRollback: boolean # Hacer rollback

  # Capacidades de QA Evolution (Epic 6)
  qa:
    canReview: boolean # Hacer review estructurado
    canRequestFix: boolean # Solicitar correcciones

  # Capacidades de Worktree (Epic 1)
  worktree:
    canCreate: boolean # Crear worktrees
    canMerge: boolean # Hacer merge
    canCleanup: boolean # Limpiar worktrees

  # Capacidades de Memory Layer (Epic 7)
  memory:
    canCaptureInsights: boolean # Capturar insights
    canExtractPatterns: boolean # Extraer patrones
    canDocumentGotchas: boolean # Documentar gotchas
```

---

## Alteraciones por Agente

### @devops (Gage)

**Archivo:** `.aiox-core/development/agents/devops.md`

**Comandos Añadidos:**

```yaml
# Worktree Management (Epic 1 - ADE Infrastructure)
- create-worktree {story}: Crear worktree aislado para desarrollo de story
- list-worktrees: Listar todos los worktrees activos con estado
- merge-worktree {story}: Hacer merge del worktree completado de vuelta a main
- cleanup-worktrees: Eliminar worktrees obsoletos/mergeados

# Migration Management (Epic 2 - V2→V3 Migration)
- inventory-assets: Generar inventario de migración desde assets V2
- analyze-paths: Analizar dependencias de rutas e impacto de migración
- migrate-agent: Migrar un solo agente del formato V2 al V3
- migrate-batch: Migrar en lote todos los agentes con validación
```

**Capacidades autoClaude:**

```yaml
autoClaude:
  version: '3.0'
  worktree:
    canCreate: true
    canMerge: true
    canCleanup: true
```

**Dependencias Añadidas:**

```yaml
dependencies:
  scripts:
    # Worktree Management (Epic 1)
    - worktree-manager.js
    - story-worktree-hooks.js
    - project-status-loader.js
    # Migration Management (Epic 2)
    - asset-inventory.js
    - path-analyzer.js
    - migrate-agent.js
  tasks:
    - worktree-create.md
    - worktree-list.md
    - worktree-merge.md
  workflows:
    - auto-worktree.yaml
```

---

### @pm (Morgan)

**Archivo:** `.aiox-core/development/agents/pm.md`

**Comandos Añadidos:**

```yaml
# Spec Pipeline (Epic 3 - ADE)
- gather-requirements: Recopilar y documentar requisitos de los stakeholders
- write-spec: Generar documento de especificación formal a partir de requisitos
```

**Capacidades autoClaude:**

```yaml
autoClaude:
  version: '3.0'
  specPipeline:
    canGather: true
    canAssess: false
    canResearch: false
    canWrite: true
    canCritique: false
```

**Dependencias Añadidas:**

```yaml
dependencies:
  tasks:
    # Spec Pipeline (Epic 3)
    - spec-gather-requirements.md
    - spec-write-spec.md
```

---

### @architect (Aria)

**Archivo:** `.aiox-core/development/agents/architect.md`

**Comandos Añadidos:**

```yaml
# Spec Pipeline (Epic 3 - ADE)
- assess-complexity: Evaluar complejidad de la story y estimar esfuerzo

# Execution Engine (Epic 4 - ADE)
- create-plan: Crear plan de implementación con fases y subtasks
- create-context: Generar contexto del proyecto y archivos para la story

# Memory Layer (Epic 7 - ADE)
- map-codebase: Generar mapa del codebase (estructura, servicios, patrones, convenciones)
```

**Capacidades autoClaude:**

```yaml
autoClaude:
  version: '3.0'
  specPipeline:
    canGather: false
    canAssess: true
    canResearch: false
    canWrite: false
    canCritique: false
  execution:
    canCreatePlan: true
    canCreateContext: true
    canExecute: false
    canVerify: false
```

**Dependencias Añadidas:**

```yaml
dependencies:
  tasks:
    # Spec Pipeline (Epic 3)
    - spec-assess-complexity.md
    # Execution Engine (Epic 4)
    - plan-create-implementation.md
    - plan-create-context.md
  scripts:
    # Memory Layer (Epic 7)
    - codebase-mapper.js
```

---

### @analyst (Atlas)

**Archivo:** `.aiox-core/development/agents/analyst.md`

**Comandos Añadidos:**

```yaml
# Spec Pipeline (Epic 3 - ADE)
- research-deps: Investigar dependencias y restricciones técnicas para la story

# Memory Layer (Epic 7 - ADE)
- extract-patterns: Extraer y documentar patrones de código del codebase
```

**Capacidades autoClaude:**

```yaml
autoClaude:
  version: '3.0'
  specPipeline:
    canGather: false
    canAssess: false
    canResearch: true
    canWrite: false
    canCritique: false
  memory:
    canCaptureInsights: false
    canExtractPatterns: true
    canDocumentGotchas: false
```

**Dependencias Añadidas:**

```yaml
dependencies:
  tasks:
    # Spec Pipeline (Epic 3)
    - spec-research-dependencies.md
  scripts:
    # Memory Layer (Epic 7)
    - pattern-extractor.js
```

---

### @qa (Quinn)

**Archivo:** `.aiox-core/development/agents/qa.md`

**Comandos Añadidos:**

```yaml
# Structured Review (Epic 6 - QA Evolution)
- 'review-build {story}': Review de QA estructurado en 10 fases - genera qa_report.md
- 'request-fix {issue}': Solicitar corrección específica de @dev con contexto
- 'verify-fix {issue}': Verificar que la corrección fue implementada correctamente

# Spec Pipeline (Epic 3 - ADE)
- 'critique-spec {story}': Revisar y criticar especificación para completitud
```

**Capacidades autoClaude:**

```yaml
autoClaude:
  version: '3.0'
  specPipeline:
    canGather: false
    canAssess: false
    canResearch: false
    canWrite: false
    canCritique: true
  qa:
    canReview: true
    canRequestFix: true
```

**Dependencias Añadidas:**

```yaml
dependencies:
  tasks:
    # Spec Pipeline (Epic 3)
    - spec-critique.md
    # QA Evolution (Epic 6)
    - qa-review-build.md
    - qa-fix-issues.md
    - qa-structured-review.md
  scripts:
    - qa-loop-orchestrator.js
    - qa-report-generator.js
  workflows:
    - qa-loop.yaml
  templates:
    - qa-report-tmpl.yaml
```

---

### @dev (Dexter)

**Archivo:** `.aiox-core/development/agents/dev.md`

**Comandos Añadidos:**

```yaml
# Execution Engine (Epic 4 - ADE)
- name: execute-subtask
  visibility: [full, quick]
  description: 'Ejecutar una subtask siguiendo workflow de 13 pasos con auto-crítica'

# Recovery System (Epic 5 - ADE)
- name: track-attempt
  visibility: [full, quick]
  description: 'Rastrear intento de implementación para una subtask (registra en recovery/attempts.json)'
- name: rollback
  visibility: [full, quick]
  description: 'Rollback al último estado bueno para una subtask (--hard para omitir confirmación)'

# QA Loop (Epic 6)
- name: apply-qa-fix
  visibility: [full, quick]
  description: 'Aplicar corrección solicitada por QA (lee qa_report.md para contexto)'

# Memory Layer (Epic 7 - ADE)
- name: capture-insights
  visibility: [full, quick]
  description: 'Capturar insights de sesión (descubrimientos, patrones, gotchas, decisiones)'
- name: list-gotchas
  visibility: [full, quick]
  description: 'Listar gotchas conocidos de .aiox/gotchas.md'
```

**Capacidades autoClaude:**

```yaml
autoClaude:
  version: '3.0'
  execution:
    canCreatePlan: false
    canCreateContext: false
    canExecute: true
    canVerify: true
  recovery:
    canTrackAttempts: true
    canRollback: true
  memory:
    canCaptureInsights: true
    canExtractPatterns: false
    canDocumentGotchas: true
```

**Dependencias Añadidas:**

```yaml
dependencies:
  tasks:
    # Execution Engine (Epic 4)
    - plan-execute-subtask.md
    # QA Evolution (Epic 6)
    - qa-fix-issues.md
    # Memory Layer (Epic 7)
    - capture-session-insights.md
  scripts:
    # Execution Engine (Epic 4)
    - subtask-verifier.js
    - plan-tracker.js
    # Recovery System (Epic 5)
    - recovery-tracker.js
    - approach-manager.js
    - rollback-manager.js
    - stuck-detector.js
    # Memory Layer (Epic 7)
    - gotchas-documenter.js
  checklists:
    - self-critique-checklist.md
```

---

## Matriz de Capacidades por Agente

| Capacidad          | @devops | @pm | @architect | @analyst | @qa | @dev |
| ------------------ | ------- | --- | ---------- | -------- | --- | ---- |
| **Spec Pipeline**  |
| canGather          | -       | YES | -          | -        | -   | -    |
| canAssess          | -       | -   | YES        | -        | -   | -    |
| canResearch        | -       | -   | -          | YES      | -   | -    |
| canWrite           | -       | YES | -          | -        | -   | -    |
| canCritique        | -       | -   | -          | -        | YES | -    |
| **Execution**      |
| canCreatePlan      | -       | -   | YES        | -        | -   | -    |
| canCreateContext   | -       | -   | YES        | -        | -   | -    |
| canExecute         | -       | -   | -          | -        | -   | YES  |
| canVerify          | -       | -   | -          | -        | -   | YES  |
| **Recovery**       |
| canTrackAttempts   | -       | -   | -          | -        | -   | YES  |
| canRollback        | -       | -   | -          | -        | -   | YES  |
| **QA**             |
| canReview          | -       | -   | -          | -        | YES | -    |
| canRequestFix      | -       | -   | -          | -        | YES | -    |
| **Worktree**       |
| canCreate          | YES     | -   | -          | -        | -   | -    |
| canMerge           | YES     | -   | -          | -        | -   | -    |
| canCleanup         | YES     | -   | -          | -        | -   | -    |
| **Memory**         |
| canCaptureInsights | -       | -   | -          | -        | -   | YES  |
| canExtractPatterns | -       | -   | -          | YES      | -   | -    |
| canDocumentGotchas | -       | -   | -          | -        | -   | YES  |

---

## Sincronización de Archivos

Todos los agentes fueron sincronizados entre:

```
.aiox-core/development/agents/   →   .claude/commands/AIOX/agents/
         (fuente)                           (sincronizado)
```

**Agentes sincronizados:**

- analyst.md
- architect.md
- dev.md
- devops.md
- pm.md
- po.md
- qa.md
- sm.md
- ux-design-expert.md
- data-engineer.md
- aiox-master.md
- squad-creator.md

---

## Validación

Todos los agentes validan contra:

- `.aiox-core/infrastructure/schemas/agent-v3-schema.json`

**Comando para validar:**

```bash
node .aiox-core/infrastructure/scripts/migrate-agent.js --validate
```

---

_Documento creado por Quinn (@qa) - Guardián de la Calidad_
_Fecha: 2026-01-29_
