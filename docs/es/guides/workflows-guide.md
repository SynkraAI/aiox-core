# Guia de Workflows de AIOX

**Version:** 1.0.0
**Ultima Actualizacion:** 2026-02-02
**Estado:** Activo

---

## Descripcion General

Los Workflows de AIOX son secuencias orquestadas de actividades de agents que automatizan procesos de desarrollo complejos. Proporcionan patrones estructurados y repetibles para escenarios de desarrollo comunes.

### Conceptos Clave

| Concepto | Descripcion |
|----------|-------------|
| **Workflow** | Una definicion YAML que orquesta multiples agents a traves de una secuencia de steps |
| **Phase** | Una agrupacion logica de steps relacionados dentro de un workflow |
| **Step** | Una accion unica realizada por un agent dentro de un workflow |
| **Transition** | Movimiento de un step al siguiente, opcionalmente con condiciones |
| **State** | Seguimiento persistente del progreso del workflow entre sesiones |

---

## Tipos de Workflow

### Por Tipo de Proyecto

| Tipo | Descripcion | Caso de Uso |
|------|-------------|-------------|
| **Greenfield** | Proyectos nuevos desde cero | Iniciar una nueva aplicacion |
| **Brownfield** | Proyectos existentes | Mejorar o auditar codigo existente |
| **Generic** | Cualquier tipo de proyecto | Procesos transversales como desarrollo de stories |

### Por Alcance

| Alcance | Descripcion | Ejemplos |
|---------|-------------|----------|
| **Fullstack** | Aplicacion completa | `greenfield-fullstack`, `brownfield-fullstack` |
| **UI** | Solo frontend | `greenfield-ui`, `brownfield-ui` |
| **Service** | Solo backend | `greenfield-service`, `brownfield-service` |
| **Discovery** | Analisis y auditoria | `brownfield-discovery` |

---

## Workflows Disponibles

### Workflows de Desarrollo Principal

#### 1. Ciclo de Desarrollo de Story
**ID:** `story-development-cycle`
**Tipo:** Generic
**Agents:** SM → PO → Dev → QA

El workflow mas comun para desarrollo iterativo:

```
┌─────────────────────────────────────────────────────────────┐
│                   Story Development Cycle                    │
│                                                              │
│  @sm: Create Story → @po: Validate → @dev: Implement → @qa  │
│         │                  │               │            │    │
│         ▼                  ▼               ▼            ▼    │
│     Draft Story       10 Checks       Code + Tests    Gate   │
└─────────────────────────────────────────────────────────────┘
```

**Phases:**
1. **Creacion de Story** - SM crea la siguiente story del backlog
2. **Validacion de Story** - PO valida con checklist de 10 puntos
3. **Implementacion** - Dev implementa con tests
4. **Revision QA** - QA ejecuta el quality gate

**Cuando usar:**
- Cualquier desarrollo de story (greenfield o brownfield)
- Ciclo completo con validacion y quality gate
- Cuando necesitas trazabilidad del proceso

---

#### 2. Greenfield Fullstack
**ID:** `greenfield-fullstack`
**Tipo:** Greenfield
**Agents:** DevOps → Analyst → PM → UX → Architect → PO → SM → Dev → QA

Workflow completo para nuevas aplicaciones full-stack:

**Phases:**
1. **Bootstrap de Entorno** - DevOps configura la infraestructura del proyecto
2. **Descubrimiento y Planificacion** - Crear brief del proyecto, PRD, especificaciones, arquitectura
3. **Fragmentacion de Documentos** - Dividir documentos para desarrollo
4. **Ciclo de Desarrollo** - Implementacion iterativa de stories

**Cuando usar:**
- Construir aplicaciones listas para produccion
- Multiples miembros del equipo involucrados
- Requisitos de funcionalidades complejas
- Se espera mantenimiento a largo plazo

---

#### 3. Brownfield Discovery
**ID:** `brownfield-discovery`
**Tipo:** Brownfield
**Agents:** Architect → Data Engineer → UX → QA → Analyst → PM

Evaluacion completa de deuda tecnica para proyectos existentes:

**Phases:**
1. **Recoleccion de Datos** - Documentacion del sistema, base de datos, frontend
2. **Consolidacion Inicial** - Borrador de evaluacion
3. **Validacion de Especialistas** - Revisiones de DB, UX, QA
4. **Informes Finales** - Evaluacion + Informe ejecutivo
5. **Planificacion** - Creacion de epic y stories

**Cuando usar:**
- Migrando desde Lovable/v0.dev
- Auditoria completa del codebase
- Evaluacion de deuda tecnica antes de invertir

---

### Otros Workflows

| Workflow | ID | Descripcion |
|----------|-------|-------------|
| Greenfield UI | `greenfield-ui` | Proyectos nuevos solo de frontend |
| Greenfield Service | `greenfield-service` | Proyectos nuevos solo de backend |
| Brownfield Fullstack | `brownfield-fullstack` | Mejora de aplicaciones fullstack existentes |
| Brownfield UI | `brownfield-ui` | Mejora de frontends existentes |
| Brownfield Service | `brownfield-service` | Mejora de backends existentes |
| QA Loop | `qa-loop` | Ciclo de aseguramiento de calidad |
| Spec Pipeline | `spec-pipeline` | Refinamiento de especificaciones |
| Design System Build | `design-system-build-quality` | Creacion de sistema de diseno |

---

## Como Crear un Workflow

### Step 1: Planifica tu Workflow

Define:
- **Proposito**: Que problema resuelve este workflow?
- **Agents**: Que agents participan?
- **Secuencia**: Cual es el orden de los steps?
- **Condiciones**: Hay puntos de decision o actividades paralelas?

### Step 2: Usa la Task de Crear Workflow

```bash
# Activa un agent que pueda crear workflows
@architect

# Ejecuta la task de crear workflow
*create-workflow
```

### Step 3: Responde las Preguntas de Elicitacion

La task preguntara:

1. **Contexto Destino**: `core`, `squad`, o `hybrid`
2. **Nombre del Workflow**: ej., `feature-development`
3. **Objetivo Principal**: Cual es el resultado esperado?
4. **Etapas/Phases**: Phases principales del workflow
5. **Orquestacion de Agents**: Que agents en cada etapa
6. **Requisitos de Recursos**: Templates, archivos de datos necesarios

### Step 4: Estructura del Workflow

El workflow generado sigue esta estructura:

```yaml
workflow:
  id: my-workflow
  name: My Custom Workflow
  version: "1.0"
  description: "Description of what this workflow does"
  type: greenfield | brownfield | generic
  project_types:
    - web-app
    - saas

  metadata:
    elicit: true
    confirmation_required: true

  phases:
    - phase_1: Phase Name
    - phase_2: Another Phase

  sequence:
    - step: step_name
      id: unique-id
      phase: 1
      agent: agent-name
      action: Action description
      creates: output-file.md
      requires: previous-step-id
      optional: false
      notes: |
        Detailed instructions for this step...
      next: next-step-id

  flow_diagram: |
    ```mermaid
    graph TD
      A[Start] --> B[Step 1]
      B --> C[Step 2]
    ```

  decision_guidance:
    when_to_use:
      - Scenario 1
      - Scenario 2
    when_not_to_use:
      - Anti-pattern 1

  handoff_prompts:
    step1_complete: "Step 1 done. Next: @agent for step 2"
```

### Step 5: Ubicacion de Salida

Los workflows se guardan segun el contexto:
- **Core**: `.aiox-core/development/workflows/{name}.yaml`
- **Squad**: `squads/{squad}/workflows/{name}.yaml`
- **Hybrid**: `squads/{squad}/workflows/{name}.yaml`

---

## Como Ejecutar un Workflow

### Metodo 1: Modo Guiado (Por Defecto)

```bash
# Iniciar un workflow
*run-workflow story-development-cycle start

# Verificar estado
*run-workflow story-development-cycle status

# Continuar al siguiente step
*run-workflow story-development-cycle continue

# Saltar step opcional
*run-workflow story-development-cycle skip

# Abortar workflow
*run-workflow story-development-cycle abort
```

### Metodo 2: Modo Engine

```bash
# Ejecutar con automatizacion completa del engine
*run-workflow greenfield-fullstack start --mode engine
```

### State del Workflow

El state se persiste en `.aiox/{instance-id}-state.yaml`:

```yaml
instance_id: "wf-abc123"
workflow_name: "story-development-cycle"
status: "active"
current_step: 2
total_steps: 4
steps:
  - id: create
    status: completed
    completed_at: "2026-02-02T10:00:00Z"
  - id: validate
    status: in_progress
  - id: implement
    status: pending
  - id: review
    status: pending
```

### Continuidad Multi-Sesion

Los workflows persisten entre sesiones de Claude Code:

1. Usuario inicia nueva sesion
2. Activa @aiox-master
3. Ejecuta `*run-workflow {name} continue`
4. El sistema carga el state, muestra el step actual
5. Usuario ejecuta el step
6. Regresa y ejecuta `continue` de nuevo

---

## Patrones de Workflow

AIOX detecta patrones comunes de workflow basados en el historial de comandos:

### Patrones Detectados

| Patron | Comandos Disparadores | Secuencia de Agents |
|--------|----------------------|---------------------|
| Desarrollo de Story | `validate-story-draft`, `develop`, `review-qa` | PO → Dev → QA → DevOps |
| Creacion de Epic | `create-epic`, `create-story`, `validate-story-draft` | PO → SM → Architect |
| Revision de Arquitectura | `analyze-impact`, `create-doc`, `review-proposal` | Architect → QA → Dev |
| Git Workflow | `pre-push-quality-gate`, `github-pr-automation` | Dev → DevOps |
| Database Workflow | `db-domain-modeling`, `db-schema-audit` | Data Engineer → Dev → QA |

### Deteccion de Patrones

El sistema usa `workflow-patterns.yaml` para:
- Detectar en que workflow estas basado en los comandos usados
- Sugerir siguientes steps con puntuaciones de confianza
- Proporcionar mensajes de handoff contextuales

---

## Mejores Practicas

### Diseno de Workflow

1. **Manten los phases enfocados** - Cada phase debe tener un proposito claro
2. **Define handoffs claros** - Documenta lo que cada agent pasa al siguiente
3. **Incluye steps opcionales** - Permite flexibilidad para casos simples
4. **Agrega guia de decisiones** - Ayuda a los usuarios a saber cuando usar/no usar

### Ejecucion de Workflow

1. **Comienza con status** - Verifica `*run-workflow {name} status` antes de continuar
2. **Sigue los prompts de handoff** - Contienen contexto importante
3. **No saltes steps requeridos** - Solo los steps opcionales pueden saltarse
4. **Documenta decisiones** - Mantiene notas para referencia futura

### Creacion de Workflow

1. **Prueba con casos simples primero** - Valida que el flujo funcione
2. **Incluye diagramas de flujo** - La representacion visual ayuda a entender
3. **Agrega notas detalladas** - Los usuarios futuros te lo agradeceran
4. **Define manejo de errores** - Que pasa cuando las cosas salen mal?

---

## Workflow vs Task

| Aspecto | Workflow | Task |
|---------|----------|------|
| **Alcance** | Multiples steps, multiples agents | Un solo step, un solo agent |
| **State** | Persistido entre sesiones | Sin estado |
| **Caso de Uso** | Procesos complejos | Operaciones atomicas |
| **Ubicacion** | `.aiox-core/development/workflows/` | `.aiox-core/development/tasks/` |

---

## Solucion de Problemas

### Problemas Comunes

**Workflow no encontrado:**
```
Error: Workflow '{name}' not found
```
- Verifica que el nombre del workflow coincida con el ID del archivo
- Verifica el contexto destino (core/squad)

**Sin instancia activa:**
```
Error: No active workflow instance found
```
- Inicia el workflow primero con `*run-workflow {name} start`

**Step no es opcional:**
```
Error: Cannot skip non-optional step
```
- Completa el step o aborta el workflow

### Obtener Ayuda

```bash
# Listar workflows disponibles
ls .aiox-core/development/workflows/

# Validar un workflow
*validate-workflow {name}

# Ver detalles del workflow
cat .aiox-core/development/workflows/{name}.yaml
```

---

## Documentacion Relacionada

- [Diagrama de Workflow HybridOps](./hybridOps/workflow-diagram.md) - Patrones de colaboracion humano-agent
- [Guia de Referencia de Agents](../agent-reference-guide.md) - Agents disponibles y sus capacidades
- [Desarrollo Dirigido por Stories](./user-guide.md#story-driven-development) - El workflow de story

---

*Guia de Workflows de AIOX v1.0 - Orquestando la Colaboracion IA-Humano*
