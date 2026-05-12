<!--
  Traducción: ES
  Original: /docs/en/aiox-nomenclature-specification.md
  Última sincronización: 2026-01-26
-->

# Especificación de Nomenclatura de AIOX

> 🌐 [EN](../aiox-nomenclature-specification.md) | [PT](../pt/aiox-nomenclature-specification.md) | **ES**

---

**Versión:** 1.0.0
**Estado:** Borrador
**Creado:** 2025-01-17
**Autor:** Dex (Dev Agent)
**Inspirado Por:** AsyncThink (Microsoft Research), Agent Lightning (Microsoft)

---

## Resumen Ejecutivo

Este documento establece nomenclatura clara para AIOX para diferenciar entre:
- **Task Workflow**: Pasos de ejecución interna dentro de una única tarea
- **Workflow**: Orquestación multi-tarea a través de agentes con capacidades Fork/Join

Esta especificación incorpora conocimientos del paradigma AsyncThink de Microsoft Research y el framework Agent Lightning para habilitar ejecución de agentes asíncrona y optimizada.

---

## Definiciones Fundamentales

### Task Workflow (Task_workflow)

**Definición:** La secuencia de pasos y acciones **dentro de una única tarea** que define cómo se ejecuta esa tarea.

**Características:**
- **Alcance:** Interno a un único archivo de tarea (`.aiox-core/tasks/*.md`)
- **Ejecución:** Pasos secuenciales o paralelos dentro de los límites de la tarea
- **Ubicación:** Definido en la sección `Step-by-Step Execution` del archivo de tarea
- **Responsabilidad:** Un único agente ejecutando una tarea
- **Ejemplo:** `security-scan.md` tiene 5 pasos: Setup → Scan → Analyze → Detect → Report

**Convención de Nomenclatura:**
- Use `task-workflow` o `task_workflow` en documentación
- Referenciado como "pasos de ejecución de tarea" o "task workflow" en contexto
- **NO** llamarlo "workflow" solo (para evitar confusión)

**Estructura de Ejemplo:**
```markdown
## Step-by-Step Execution

### Step 1: Setup Security Tools
**Purpose:** Ensure all required security scanning tools are installed
**Actions:**
1. Check for npm audit availability
2. Install ESLint security plugins if missing
...

### Step 2: Dependency Vulnerability Scan
...
```

---

### Workflow

**Definición:** Una secuencia de **múltiples tareas** ejecutadas por **uno o más agentes**, donde las salidas de tareas se conectan a las entradas de tareas secuencial o paralelamente, soportando operaciones Fork y Join.

**Características:**
- **Alcance:** Orquestación entre tareas a través de múltiples agentes
- **Ejecución:** Puede ser secuencial, paralelo (Fork), o convergente (Join)
- **Ubicación:** Definido en `.aiox-core/workflows/*.yaml` o secciones de workflow de stories
- **Responsabilidad:** Múltiples agentes coordinando para lograr un objetivo
- **Ejemplo:** Workflow de Desarrollo de Story: `po-create-story` → `dev-develop-story` → `qa-gate`

**Convención de Nomenclatura:**
- Use `workflow` para orquestación multi-tarea
- Puede nombrarse descriptivamente: `story-development-workflow`, `pm-tool-integration-workflow`
- Soporta patrones AsyncThink: Organizer-Worker, Fork/Join

**Estructura de Ejemplo:**
```yaml
workflow:
  id: story-development-workflow
  name: Story Development Flow
  description: Complete story lifecycle from requirements to QA gate

  stages:
    - id: create-story
      agent: po
      task: create-next-story
      inputs:
        - requirements_doc
      outputs:
        - story_file

    - id: develop-story
      agent: dev
      task: dev-develop-story
      inputs:
        - story_file  # Connected from previous stage
      outputs:
        - code_changes
        - test_results

    - id: qa-gate
      agent: qa
      task: qa-gate
      inputs:
        - story_file      # From create-story
        - code_changes   # From develop-story
      outputs:
        - qa_report
```

---

## Integración AsyncThink

### Patrón Organizer-Worker

**Concepto:** Inspirado por el protocolo Organizer-Worker de AsyncThink, los workflows de AIOX pueden usar un **Agente Organizador** que coordina **Agentes Trabajadores** ejecutando tareas en paralelo.

**Aplicación a AIOX:**

1. **Agente Organizador:**
   - Coordina la ejecución del workflow
   - Toma decisiones sobre puntos Fork/Join
   - Gestiona dependencias de tareas
   - Fusiona resultados de trabajadores paralelos

2. **Agentes Trabajadores:**
   - Ejecutan tareas específicas asignadas por el organizador
   - Procesan sub-consultas/tareas independientemente
   - Retornan resultados al organizador
   - Pueden ser agentes especializados (dev, qa, po, etc.)

**Ejemplo de Workflow con Fork/Join:**
```yaml
workflow:
  id: parallel-validation-workflow
  organizer: aiox-master

  stages:
    - id: fork-validation
      type: fork
      organizer_decision: "Split validation into parallel tasks"
      workers:
        - agent: dev
          task: security-scan
          inputs:
            - codebase
          outputs:
            - security_report

        - agent: qa
          task: qa-run-tests
          inputs:
            - codebase
          outputs:
            - test_results

        - agent: dev
          task: sync-documentation
          inputs:
            - codebase
          outputs:
            - docs_synced

    - id: join-validation
      type: join
      organizer_merges:
        - security_report
        - test_results
        - docs_synced
      outputs:
        - validation_complete
```

---

## Integración Agent Lightning

### Framework de Optimización de Agentes

**Concepto:** Agent Lightning permite optimizar CUALQUIER agente con CUALQUIER framework usando aprendizaje por refuerzo, sin modificar el código del agente.

**Aplicación a AIOX:**

1. **Integración con Lightning Server:**
   - Recopilar trazas de ejecución de agentes
   - Monitorear éxito/fallo de tareas
   - Rastrear métricas de rendimiento
   - Habilitar optimización basada en RL

2. **Monitoreo No Intrusivo:**
   - Diseño sidecar para recopilación de trazas
   - Sin cambios de código a tareas existentes
   - Generación automática de tuplas de transición (estado, acción, recompensa, siguiente_estado)

3. **Oportunidades de Optimización:**
   - Eficiencia de ejecución de tareas
   - Toma de decisiones del agente
   - Orquestación de workflows
   - Estrategias de manejo de errores

**Ejemplo de Integración:**
```yaml
# .aiox-core/core-config.yaml
agent_lightning:
  enabled: true
  server_host: localhost
  server_port: 4747

  optimization:
    - target: dev-develop-story
      algorithm: RL
      metrics:
        - execution_time
        - code_quality_score
        - test_coverage

    - target: workflow-orchestration
      algorithm: APO  # Automatic Prompt Optimization
      metrics:
        - workflow_success_rate
        - parallelization_efficiency
```

---

## Reglas de Nomenclatura

### Regla 1: Task Workflow vs Workflow

**Cuándo usar "Task Workflow" (o "task-workflow"):**
- Referirse a pasos dentro de un único archivo de tarea
- Documentar flujo de ejecución de tareas
- Describir lógica interna de tareas
- En secciones `Step-by-Step Execution` de archivos de tarea

**Cuándo usar "Workflow":**
- Referirse a orquestación multi-tarea
- Describir coordinación de agentes
- Documentar patrones Fork/Join
- En archivos de definición de workflows (`.yaml`)

**❌ NUNCA:**
- Usar "workflow" para referirse a pasos de tarea
- Usar "task workflow" para referirse a orquestación multi-tarea
- Mezclar terminología sin contexto

---

### Regla 2: Convenciones de Nomenclatura de Archivos

**Archivos de Tarea:**
- Ubicación: `.aiox-core/tasks/{task-name}.md`
- Contiene: Task workflow (Step-by-Step Execution)
- Ejemplo: `.aiox-core/tasks/security-scan.md`

**Archivos de Workflow:**
- Ubicación: `.aiox-core/workflows/{workflow-name}.yaml`
- Contiene: Definición de orquestación multi-tarea
- Ejemplo: `.aiox-core/workflows/story-development-workflow.yaml`

**Documentación:**
- Docs de task workflow: `docs/tasks/{task-name}-workflow.md` (si es necesario)
- Docs de workflow: `docs/workflows/{workflow-name}.md`

---

### Regla 3: Referencias en Código

**En Archivos de Tarea:**
```markdown
## Step-by-Step Execution

This section defines the **task workflow** for executing this task.
Each step represents a sequential action within this task.
```

**En Archivos de Workflow:**
```yaml
workflow:
  name: Story Development Workflow
  description: |
    This workflow orchestrates multiple tasks across agents.
    It defines task dependencies and execution order.
```

**En Archivos de Story:**
```markdown
## Workflow Execution

**Workflow:** Story Development Flow
- Task 1: `po-create-story` (task workflow: 3 steps)
- Task 2: `dev-develop-story` (task workflow: 8 steps)
- Task 3: `qa-gate` (task workflow: 5 steps)
```

---

## Operaciones Fork y Join

### Operación Fork

**Definición:** Dividir la ejecución del workflow en rutas paralelas, donde múltiples tareas se ejecutan simultáneamente.

**Sintaxis:**
```yaml
fork:
  id: parallel-validation
  condition: "validation_needed"
  parallel_tasks:
    - agent: dev
      task: security-scan
      inputs:
        - codebase

    - agent: qa
      task: qa-run-tests
      inputs:
        - codebase

    - agent: dev
      task: sync-documentation
      inputs:
        - codebase
```

**Características:**
- Múltiples agentes ejecutan tareas en paralelo
- Cada tarea tiene su propio task workflow
- Las tareas pueden tener diferentes tiempos de ejecución
- Los resultados se recopilan independientemente

---

### Operación Join

**Definición:** Fusionar resultados de tareas paralelas de vuelta a la ejecución secuencial del workflow.

**Sintaxis:**
```yaml
join:
  id: merge-validation-results
  wait_for:
    - security-scan
    - qa-run-tests
    - sync-documentation
  merge_strategy: "all_success"  # o "any_success", "majority"
  outputs:
    - validation_complete
```

**Características:**
- Espera a que todas las tareas paralelas se completen
- Fusiona resultados según la estrategia
- Puede tener timeout/manejo de errores
- Continúa el workflow con resultados fusionados

---

## Patrones de Workflow

### Patrón 1: Workflow Secuencial

**Descripción:** Las tareas se ejecutan una después de otra, con conexiones salida → entrada.

**Ejemplo:**
```yaml
workflow:
  id: sequential-story-development
  stages:
    - task: create-story
      agent: po
      outputs: [story_file]

    - task: develop-story
      agent: dev
      inputs: [story_file]  # De la tarea anterior
      outputs: [code_changes]

    - task: qa-gate
      agent: qa
      inputs: [story_file, code_changes]
      outputs: [qa_report]
```

---

### Patrón 2: Workflow Fork-Join (Patrón AsyncThink)

**Descripción:** Dividir en tareas paralelas, luego fusionar resultados.

**Ejemplo:**
```yaml
workflow:
  id: parallel-validation-workflow
  stages:
    - task: prepare-codebase
      agent: dev
      outputs: [codebase]

    - type: fork
      parallel_tasks:
        - task: security-scan
          agent: dev
          inputs: [codebase]

        - task: qa-run-tests
          agent: qa
          inputs: [codebase]

        - task: sync-documentation
          agent: dev
          inputs: [codebase]

    - type: join
      merge_strategy: all_success
      outputs: [validation_complete]

    - task: deploy
      agent: dev
      inputs: [validation_complete]
```

---

### Patrón 3: Workflow Condicional

**Descripción:** El workflow se ramifica basado en condiciones.

**Ejemplo:**
```yaml
workflow:
  id: conditional-deployment
  stages:
    - task: build
      agent: dev
      outputs: [build_artifact]

    - type: conditional
      condition: "environment == 'production'"
      if_true:
        - task: security-audit
          agent: security
        - task: production-deploy
          agent: dev
      if_false:
        - task: staging-deploy
          agent: dev
```

---

## Representación Visual

### Task Workflow (Interno a la Tarea)

```
Task: security-scan.md
┌─────────────────────────────────────┐
│ Step 1: Setup Security Tools        │
│ Step 2: Dependency Vulnerability   │
│ Step 3: Code Security Pattern Scan  │
│ Step 4: Secret Detection            │
│ Step 5: Generate Security Report    │
└─────────────────────────────────────┘
```

### Workflow (Orquestación Multi-Tarea)

```
Workflow: Story Development
┌─────────────┐
│ PO Agent    │
│ create-story│──┐
└─────────────┘  │
                 │ story_file
                 ▼
         ┌───────────────┐
         │   FORK        │
         └───────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌──────┐ ┌──────┐ ┌──────┐
│ Dev  │ │ QA  │ │ Dev  │
│ scan │ │test │ │ docs │
└──────┘ └──────┘ └──────┘
    │         │         │
    └─────────┼─────────┘
              │
              ▼
         ┌───────────────┐
         │     JOIN       │
         └───────────────┘
              │
              ▼
         ┌───────────────┐
         │  QA Agent     │
         │  qa-gate      │
         └───────────────┘
```

---

## Guías de Implementación

### Para Desarrolladores de Tareas

1. **Use la sección "Step-by-Step Execution"** para definir task workflow
2. **Nunca lo refiera como "workflow"** - use "pasos de ejecución de tarea" o "task workflow"
3. **Cada paso debe ser atómico** y claramente definido
4. **Documente entradas/salidas** para cada paso
5. **Soporte pasos paralelos** si la tarea lo permite (ej., ejecutar múltiples escaneos simultáneamente)

### Para Diseñadores de Workflows

1. **Use archivos YAML de workflow** para definir orquestación multi-tarea
2. **Especifique claramente las dependencias de tareas** (entradas/salidas)
3. **Use Fork/Join** para ejecución paralela cuando sea beneficioso
4. **Documente decisiones del organizador** para workflows complejos
5. **Soporte manejo de errores** y estrategias de rollback

### Para Escritores de Documentación

1. **Siempre clarifique el contexto** cuando use el término "workflow"
2. **Use "task workflow"** cuando se refiera a pasos de tarea
3. **Use "workflow"** cuando se refiera a orquestación multi-tarea
4. **Incluya diagramas visuales** para workflows complejos
5. **Documente patrones Fork/Join** claramente

---

## Ejemplos del Codebase

### Ejemplo 1: Task Workflow (security-scan.md)

```markdown
## Step-by-Step Execution

### Step 1: Setup Security Tools
**Purpose:** Ensure all required security scanning tools are installed
**Actions:**
1. Check for npm audit availability
2. Install ESLint security plugins if missing
...

### Step 2: Dependency Vulnerability Scan
**Purpose:** Scan npm dependencies for known vulnerabilities
**Actions:**
1. Execute `npm audit --audit-level=moderate --json`
...
```

**Nota:** Este es un **task workflow** - pasos internos dentro de la tarea security-scan.

---

### Ejemplo 2: Workflow (Story Development)

```yaml
# .aiox-core/workflows/story-development-workflow.yaml
workflow:
  id: story-development-workflow
  name: Story Development Flow

  stages:
    - id: create-story
      agent: po
      task: create-next-story
      inputs:
        - requirements_doc
      outputs:
        - story_file

    - id: develop-story
      agent: dev
      task: dev-develop-story
      inputs:
        - story_file
      outputs:
        - code_changes

    - id: qa-gate
      agent: qa
      task: qa-gate
      inputs:
        - story_file
        - code_changes
      outputs:
        - qa_report
```

**Nota:** Este es un **workflow** - orquestación multi-tarea a través de agentes.

---

## Mejoras Futuras

### Hoja de Ruta de Integración AsyncThink

1. **Fase 1: Patrón Organizer-Worker**
   - Implementar agente organizador para coordinación de workflows
   - Soportar operaciones Fork/Join en workflows
   - Habilitar ejecución paralela de tareas

2. **Fase 2: Optimización RL**
   - Integrar Agent Lightning para optimización de agentes
   - Recopilar trazas de ejecución automáticamente
   - Optimizar decisiones de orquestación de workflows

3. **Fase 3: Adaptación Dinámica de Workflows**
   - Aprender puntos óptimos de Fork/Join
   - Adaptar estructura de workflow basada en complejidad de tareas
   - Optimizar latencia de ruta crítica

### Hoja de Ruta de Integración Agent Lightning

1. **Fase 1: Recopilación de Trazas**
   - Implementar integración con Lightning Server
   - Recopilar trazas de ejecución de agentes
   - Monitorear tasas de éxito/fallo de tareas

2. **Fase 2: Optimización**
   - Habilitar optimización de tareas basada en RL
   - Optimizar toma de decisiones del agente
   - Mejorar orquestación de workflows

3. **Fase 3: Aprendizaje Continuo**
   - Implementar aprendizaje en línea
   - Adaptarse a nuevos patrones de tareas
   - Optimizar coordinación multi-agente

---

## Referencias

1. **Paper de AsyncThink:** "The Era of Agentic Organization: Learning to Organize with Language Models" - Microsoft Research
   - [arXiv:2510.26658](https://arxiv.org/abs/2510.26658)
   - Conceptos Clave: Organizer-Worker, Fork/Join, Pensamiento Asíncrono

2. **Agent Lightning:** Framework de Microsoft para optimizar agentes de IA
   - [GitHub: microsoft/agent-lightning](https://github.com/microsoft/agent-lightning)
   - [Documentación](https://microsoft.github.io/agent-lightning/latest/)
   - Conceptos Clave: Optimización sin código, entrenamiento RL, soporte multi-agente

3. **Gestión de Workflows AIOX:** Patrones de workflow existentes en AIOX
   - `common/utils/workflow-management.md`
   - `docs/WORKFLOW-COMPLETE-CONSOLIDATED-V3.md`

---

## Lista de Verificación para Cumplimiento de Nomenclatura

Al crear o actualizar documentación:

- [ ] Usó "task workflow" o "pasos de ejecución de tarea" cuando se refiere a elementos internos de tarea
- [ ] Usó "workflow" cuando se refiere a orquestación multi-tarea
- [ ] Clarificó el contexto si el término podría ser ambiguo
- [ ] Siguió convenciones de nomenclatura de archivos
- [ ] Documentó patrones Fork/Join claramente
- [ ] Incluyó diagramas visuales para workflows complejos

---

**Estado del Documento:** ✅ Borrador - Listo para Revisión
**Próximos Pasos:** Revisión por agentes PO, Dev y QA para retroalimentación y aprobación
