# ADE Architect Handoff

> **De:** Quinn (@qa) - QA Agent
> **Para:** Sage (@architect) - Solution Architect
> **Fecha:** 2026-01-28
> **Proyecto:** AIOX Autonomous Development Engine (ADE)

---

## Resumen Ejecutivo

El ADE es un proyecto de **Prompt Engineering + Infraestructura** para habilitar ejecución autónoma de desarrollo en AIOX. Aproximadamente **60% del trabajo es creación de tasks .md, workflows .yaml y templates** - no código tradicional.

**Usted es el líder técnico de este proyecto.** @dev será convocado únicamente para scripts JS específicos.

---

## Análisis de Dependencias

### Ruta Crítica (Secuencial Obligatorio)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CRITICAL PATH                                      │
│                                                                              │
│  Epic 1 ──────► Epic 2 ──────► Epic 3 ──────► Epic 4                        │
│  Worktree       Migration      Spec Pipeline   Execution                    │
│  (P0)           (P0)           (P0)            (P0)                         │
│                                                                              │
│  BLOCKING: Cada epic depende de que el anterior esté COMPLETO               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Oportunidades de Paralelismo (Después del Epic 4)

```
                              Epic 4 (Execution)
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                                 ▼
             Epic 5 (Recovery)              Epic 6 (QA Evolution)
             P1 - 4 stories                 P1 - 5 stories
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                              Epic 7 (Memory)
                              P2 - 4 stories
```

**Epic 5 y Epic 6 pueden ejecutarse en PARALELO** después de que Epic 4 esté completo.

---

## Matriz de Dependencias

| Epic                 | Requiere | Bloquea    | Paralelo Con |
| -------------------- | -------- | ---------- | ------------ |
| **1. Worktree**      | -        | 2, 4       | -            |
| **2. Migration**     | 1        | 3, 4, 5, 6 | -            |
| **3. Spec Pipeline** | 2        | 4          | -            |
| **4. Execution**     | 3        | 5, 6       | -            |
| **5. Recovery**      | 4        | 7          | **6**        |
| **6. QA Evolution**  | 4        | 7          | **5**        |
| **7. Memory**        | 5, 6     | -          | -            |

---

## Paralelismo de Preparación

Aunque los epics tienen dependencias de **implementación**, puede **preparar** epics futuros mientras el actual está en desarrollo:

| Mientras ejecuta | Puede preparar (sin implementar)           |
| ---------------- | ------------------------------------------ |
| Epic 1           | Schemas V3 del Epic 2 (diseño)             |
| Epic 2           | Estructura de las tasks del Epic 3         |
| Epic 3           | Estructura del implementation.yaml del Epic 4 |
| Epic 4           | Diseño del Epic 5 y 6 en paralelo          |

---

## Desglose de Epics por Tipo de Trabajo

### Epic 1: Worktree Manager (P0) - 5 stories

**Tipo:** 70% Código, 30% Prompt Engineering

| Story | Entregable                            | Tipo        |
| ----- | ------------------------------------- | ----------- |
| 1.1   | worktree-manager.js                   | JS Script   |
| 1.2   | Merge operations                      | JS Script   |
| 1.3   | CLI commands (\*create-worktree, etc) | Task .md    |
| 1.4   | Auto-create trigger                   | Workflow    |
| 1.5   | status.json integration               | JS + Schema |

**@dev necesario:** Stories 1.1, 1.2, 1.5 (scripts)
**@architect lidera:** Stories 1.3, 1.4 (prompts/workflows)

---

### Epic 2: Migration V2→V3 (P0) - 6 stories

**Tipo:** 60% Código, 40% Prompt Engineering

| Story | Entregable                  | Tipo                |
| ----- | --------------------------- | ------------------- |
| 2.1   | asset-inventory.js          | JS Script           |
| 2.2   | path-analyzer.js            | JS Script           |
| 2.3   | V3 Schemas (agent, task)    | JSON Schema         |
| 2.4   | migrate-agent.js            | JS Script           |
| 2.5   | Pilot migration (@dev, @qa) | Manual + Validación |
| 2.6   | Batch migration             | Orquestación        |

**@dev necesario:** Stories 2.1, 2.2, 2.4 (scripts)
**@architect lidera:** Stories 2.3, 2.5, 2.6 (schemas/orquestación)

---

### Epic 3: Spec Pipeline (P0) - 6 stories

**Tipo:** 10% Código, 90% Prompt Engineering

| Story | Entregable                    | Tipo           |
| ----- | ----------------------------- | -------------- |
| 3.1   | spec-gather-requirements.md   | Task .md       |
| 3.2   | spec-assess-complexity.md     | Task .md       |
| 3.3   | spec-research-dependencies.md | Task .md + MCP |
| 3.4   | spec-write-spec.md            | Task .md       |
| 3.5   | spec-critique.md              | Task .md       |
| 3.6   | spec-pipeline.yaml            | Workflow .yaml |

**@dev necesario:** Ninguno
**@architect lidera:** TODAS las stories (100% prompt engineering)

---

### Epic 4: Execution Engine (P0) - 6 stories

**Tipo:** 30% Código, 70% Prompt Engineering

| Story | Entregable                         | Tipo          |
| ----- | ---------------------------------- | ------------- |
| 4.1   | plan-create-implementation.md      | Task .md      |
| 4.2   | plan-create-context.md             | Task .md      |
| 4.3   | plan-execute-subtask.md (13 pasos) | Task .md      |
| 4.4   | self-critique-checklist.md         | Checklist .md |
| 4.5   | subtask-verifier.js                | JS Script     |
| 4.6   | plan-tracker.js                    | JS Script     |

**@dev necesario:** Stories 4.5, 4.6 (scripts)
**@architect lidera:** Stories 4.1, 4.2, 4.3, 4.4 (prompts)

---

### Epic 5: Recovery System (P1) - 4 stories

**Tipo:** 40% Código, 60% Prompt Engineering

| Story | Entregable           | Tipo           |
| ----- | -------------------- | -------------- |
| 5.1   | attempt-tracker.js   | JS Script      |
| 5.2   | recovery-strategy.md | Task .md       |
| 5.3   | Escalation triggers  | Workflow       |
| 5.4   | Retry policies       | Config + Lógica|

**@dev necesario:** Story 5.1 (script)
**@architect lidera:** Stories 5.2, 5.3, 5.4

---

### Epic 6: QA Evolution (P1) - 5 stories

**Tipo:** 10% Código, 90% Prompt Engineering

| Story | Entregable                | Tipo                 |
| ----- | ------------------------- | -------------------- |
| 6.1   | review-subtask.md         | Task .md             |
| 6.2   | qa-gate-auto.md           | Task .md             |
| 6.3   | CodeRabbit integration    | Config + Workflow    |
| 6.4   | review-qa.md (Dev→QA→Dev) | Task .md             |
| 6.5   | Quality metrics           | Schema + Agregación  |

**@dev necesario:** Story 6.5 (script de métricas, opcional)
**@architect lidera:** Stories 6.1, 6.2, 6.3, 6.4

---

### Epic 7: Memory Layer (P2) - 4 stories

**Tipo:** 50% Código, 50% Prompt Engineering

| Story | Entregable                       | Tipo         |
| ----- | -------------------------------- | ------------ |
| 7.1   | project-memory schema (Supabase) | SQL + Schema |
| 7.2   | Memory query utilities           | JS + SQL     |
| 7.3   | Pattern learning                 | Task .md     |
| 7.4   | Cross-project insights           | Task .md     |

**@dev necesario:** Stories 7.1, 7.2 (Supabase)
**@architect lidera:** Stories 7.3, 7.4

---

## Plan de Ejecución Recomendado

### Fase 1: Fundación (Semanas 1-3)

```
Semana 1: Epic 1 (Worktree Manager)
        └── @dev: 1.1, 1.2, 1.5
        └── @architect: 1.3, 1.4
        └── PREP: Diseñar V3 schemas (Epic 2)

Semana 2-3: Epic 2 (Migration V2→V3)
        └── @dev: 2.1, 2.2, 2.4
        └── @architect: 2.3, 2.5, 2.6
        └── PREP: Borrador de estructura de spec tasks (Epic 3)
```

### Fase 2: Pipeline Principal (Semanas 4-6)

```
Semana 4-5: Epic 3 (Spec Pipeline) - 100% @architect
        └── Las 6 stories son prompt engineering
        └── PREP: Borrador de execution tasks (Epic 4)

Semana 6: Epic 4 (Execution Engine)
        └── @dev: 4.5, 4.6
        └── @architect: 4.1, 4.2, 4.3, 4.4
```

### Fase 3: Resiliencia (Semanas 7-8) - PARALELO

```
Semana 7-8: Epic 5 (Recovery) + Epic 6 (QA Evolution) EN PARALELO

        Track 1 - Recovery:
        └── @dev: 5.1
        └── @architect: 5.2, 5.3, 5.4

        Track 2 - QA Evolution:
        └── @architect: 6.1, 6.2, 6.3, 6.4
        └── @dev: 6.5 (opcional)
```

### Fase 4: Inteligencia (Semanas 9-10)

```
Semana 9-10: Epic 7 (Memory Layer)
        └── @dev: 7.1, 7.2 (Supabase)
        └── @architect: 7.3, 7.4
```

---

## Documentos Clave

### PRD

- `docs/prd/aiox-autonomous-development-engine.md`

### Stories

- `docs/stories/aiox-core-ade/` (7 archivos de epic + README)

### Quality Gates

- `docs/qa/gates/aiox-core-ade/` (7 archivos de gate + README)

### Referencia

- `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md` (patrones del Auto-Claude)
- `.aiox-core/core-config.yaml` (configuración central)

---

## Protocolo de Quality Gate

Después de completar cada epic, active @qa para ejecutar el quality gate:

```
@qa *gate epic-{N}-{name}
```

**Decisiones posibles:**

- **PASS:** Próximo epic liberado
- **CONCERNS:** Aprobado con items de seguimiento
- **FAIL:** Retorna para correcciones
- **WAIVED:** Bypass autorizado por @po

---

## Notas Importantes

### Sobre Prompt Engineering

Las tasks .md son **instrucciones ejecutables para el LLM**. Necesitan ser:

1. **Determinísticas** - Misma entrada = misma salida
2. **Completas** - Todos los pasos explícitos
3. **Verificables** - Output validable
4. **Componibles** - Pueden ser llamadas por otras tasks

### Sobre Self-Critique (Epic 4)

Los steps 5.5 y 6.5 del execute-subtask son **críticos**. Fuerzan al LLM a revisar su propio trabajo antes de continuar. No pueden ser omitidos sin flag explícito.

### Sobre Integración con Dashboard

El Dashboard (proyecto separado) va a **consumir** lo que el ADE produce:

- formato status.json
- Worktree API
- Agents V3

No hay dependencia del Dashboard para que el ADE funcione.

---

## Primeros Pasos Recomendados

1. **Leer el PRD completo** - `docs/prd/aiox-autonomous-development-engine.md`
2. **Leer el Auto-Claude Analysis** - `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`
3. **Iniciar Epic 1.1** - worktree-manager.js (delegar a @dev)
4. **En paralelo, diseñar los schemas V3** (Epic 2.3)

---

## Preguntas para @architect Antes de Comenzar

1. ¿Prefiere comenzar por el código (Epic 1.1 con @dev) o por el diseño (V3 schemas)?
2. ¿Quiere crear un agente @prompt-engineer especializado o asumir ese rol?
3. ¿Alguna duda sobre el alcance o dependencias?

---

_Handoff preparado por Quinn (@qa) - Guardian of Quality_
_Fecha: 2026-01-28_
