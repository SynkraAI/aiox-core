# ADE Epic 3 Handoff - Spec Pipeline

> **De:** Quinn (@qa) - QA Agent
> **Para:** Aria (@architect) - Solution Architect
> **Fecha:** 2026-01-28
> **Estado:** Epic 1+2 COMPLETO → Epic 3 DESBLOQUEADO

---

## Resumen Ejecutivo

Epic 1 (Worktree) y Epic 2 (Migration V3) estan **100% completos** y aprobados por el QA Gate. El Epic 3 (Spec Pipeline) esta **desbloqueado** para inicio inmediato.

**Epic 3 es 100% Prompt Engineering** - @architect lidera las 6 stories.

---

## Prerequisitos Validados ✅

| Dependencia       | Estado            | Evidencia                                     |
| ----------------- | ----------------- | --------------------------------------------- |
| WorktreeManager   | ✅ Funcional      | `manager.list()` ejecuta sin errores          |
| V3 Schemas        | ✅ Completo       | `agent-v3-schema.json`, `task-v3-schema.json` |
| Todos Agents V3   | ✅ 12/12 migrados | `autoClaude:` section en todos                |
| Migration Scripts | ✅ Listos         | `asset-inventory.js`, `path-analyzer.js`      |

---

## Epic 3: Vision General del Spec Pipeline

**Tipo:** 10% Codigo, **90% Prompt Engineering**

El Spec Pipeline transforma requisitos vagos en especificaciones ejecutables a traves de 5 fases secuenciales:

```
User Request → Gather → Assess → Research → Write → Critique → Spec Ready
```

---

## Desglose de Stories

| Story | Entregable                      | Tipo           | Agent      |
| ----- | ------------------------------- | -------------- | ---------- |
| 3.1   | `spec-gather-requirements.md`   | Task .md       | @architect |
| 3.2   | `spec-assess-complexity.md`     | Task .md       | @architect |
| 3.3   | `spec-research-dependencies.md` | Task .md + MCP | @architect |
| 3.4   | `spec-write-spec.md`            | Task .md       | @architect |
| 3.5   | `spec-critique.md`              | Task .md       | @architect |
| 3.6   | `spec-pipeline.yaml`            | Workflow .yaml | @architect |

**@dev necesario:** Ninguno
**@architect lidera:** TODAS las stories

---

## Story 3.1: Gather Requirements

**Objetivo:** Recolectar y estructurar requisitos del usuario

**Task:** `spec-gather-requirements.md`

**Inputs:**

- User request (texto o voz)
- Contexto del proyecto (desde status.json)
- Specs existentes (si se esta iterando)

**Outputs:**

- Documento de requisitos estructurado
- Preguntas de clarificacion (si hay ambiguedad)
- Definicion inicial del scope

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-gather
  elicit: true
  deterministic: false # Se necesita creatividad del LLM
```

---

## Story 3.2: Assess Complexity

**Objetivo:** Evaluar complejidad y estimar esfuerzo

**Task:** `spec-assess-complexity.md`

**Inputs:**

- Requisitos recolectados (de 3.1)
- Analisis del codebase
- Restricciones tecnicas

**Outputs:**

- Puntuacion de complejidad (simple/standard/complex)
- Estimacion de esfuerzo
- Factores de riesgo
- Desglose sugerido (si es complex)

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-assess
  complexity: standard
  verification:
    type: none # La evaluacion es consultiva
```

---

## Story 3.3: Research Dependencies

**Objetivo:** Investigar bibliotecas, APIs y patrones necesarios

**Task:** `spec-research-dependencies.md`

**Herramientas Requeridas:**

- EXA (busqueda web)
- Context7 (documentacion de bibliotecas)
- Busqueda en codebase

**Inputs:**

- Requisitos + Evaluacion
- Preferencias del tech stack (desde technical-preferences.md)

**Outputs:**

- Bibliotecas recomendadas con justificacion
- Enlaces a documentacion de APIs
- Ejemplos de codigo
- Notas de compatibilidad

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-research
  tools:
    - exa
    - context7
```

---

## Story 3.4: Write Specification

**Objetivo:** Producir especificacion ejecutable

**Task:** `spec-write-spec.md`

**Inputs:**

- Todos los outputs anteriores (requisitos, evaluacion, investigacion)
- Template de spec

**Outputs:**

- Documento de especificacion completo
- Checklist de implementacion
- Escenarios de prueba (Given-When-Then)
- Criterios de aceptacion

**Template:** Usar `spec-tmpl.yaml` existente o crear nuevo

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-write
  deterministic: true # Mismos inputs = misma spec
  composable: true
```

---

## Story 3.5: Critique Specification

**Objetivo:** Validar y mejorar la spec antes de la ejecucion

**Task:** `spec-critique.md`

**Inputs:**

- Especificacion escrita (de 3.4)
- Checklist de calidad

**Outputs:**

- Reporte de critica
- Sugerencias de mejora
- Decision PASS/NEEDS_REVISION
- Spec revisada (si se corrigio automaticamente)

**Agent:** Capacidades de @qa (canCritique: true)

**Pattern:**

```yaml
autoClaude:
  pipelinePhase: spec-critique
  selfCritique:
    required: true
    checklistRef: spec-quality-checklist.md
```

---

## Story 3.6: Pipeline Orchestration

**Objetivo:** Orquestar las 5 fases en un workflow unico

**Workflow:** `spec-pipeline.yaml`

**Estructura:**

```yaml
workflow:
  id: spec-pipeline
  sequence:
    - step: gather
      task: spec-gather-requirements.md
      agent: pm
    - step: assess
      task: spec-assess-complexity.md
      agent: architect
    - step: research
      task: spec-research-dependencies.md
      agent: analyst
    - step: write
      task: spec-write-spec.md
      agent: pm
    - step: critique
      task: spec-critique.md
      agent: qa
      gate: true # Debe pasar para continuar
```

---

## Patrones Tecnicos

### Task V3 Template

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-{phase}
  deterministic: boolean
  elicit: boolean
  composable: true

  verification:
    type: none|command|manual

  contextRequirements:
    projectContext: true
    filesContext: false
    implementationPlan: false
    spec: false
```

### Pipeline Phase Enum

```
spec-gather    # @pm - recolectar requisitos
spec-assess    # @architect - evaluar complejidad
spec-research  # @analyst - investigar dependencias
spec-write     # @pm - escribir especificacion
spec-critique  # @qa - validar calidad
```

---

## Criterios de Exito

- [ ] Las 5 spec tasks creadas con seccion autoClaude V3
- [ ] Pipeline workflow orquesta todas las fases
- [ ] Cada task tiene inputs/outputs claros
- [ ] Critique task incluye quality gate
- [ ] Prueba end-to-end: solicitud vaga → spec completa

---

## Orden de Ejecucion Recomendado

1. **3.1 + 3.2 + 3.3** - Crear las 3 tasks de analisis (pueden ser paralelas)
2. **3.4** - Write spec task (depende de entender el flujo)
3. **3.5** - Critique task (necesita spec para criticar)
4. **3.6** - Pipeline workflow (integra todo)

---

## Documentos Relacionados

- PRD: `docs/prd/aiox-autonomous-development-engine.md`
- Auto-Claude Analysis: `docs/architecture/AUTO-CLAUDE-ANALYSIS-COMPLETE.md`
- Epic Stories: `docs/stories/aiox-core-ade/epic-3-spec-pipeline.md`

---

## QA Gate para Epic 3

Despues de completar Epic 3, ejecutar:

```
@qa *gate epic-3-spec-pipeline
```

**Validacion:**

- Todas las 5 tasks validan contra task-v3-schema.json
- Pipeline workflow ejecuta sin errores
- Prueba E2E: "Add login feature" → spec completa

---

_Handoff preparado por Quinn (@qa) - Guardian de la Calidad_
_Commit: 3fea6ca - feat(ade): complete Epic 1+2_
_Fecha: 2026-01-28_
