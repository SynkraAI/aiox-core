<!-- Traduccion: ES | Original: /docs/en/architecture/squad-improvement-recommended-approach.md | Sincronizacion: 2026-01-26 -->

# Enfoque Recomendado: Sistema de Mejora de Squads

> 🌐 [EN](../../architecture/squad-improvement-recommended-approach.md) | [PT](../../pt/architecture/squad-improvement-recommended-approach.md) | **ES**

---

**Generado:** 2025-12-26
**Generado Por:** @architect (Aria)
**Funcionalidad:** Analisis de Squads y Tareas de Mejora Continua
**Historia Propuesta:** SQS-11

---

## Requisitos de la Funcionalidad

**Descripcion:** Crear tareas para analizar squads existentes y agregar/modificar componentes de forma incremental, permitiendo la mejora continua de squads sin necesidad de recrearlos.

**Integracion de API Requerida:** No
**Cambios en Base de Datos Requeridos:** No

---

## Nuevas Tareas Propuestas

### 1. `*analyze-squad` - Analizar Squad Existente

**Proposito:** Escanear y analizar un squad existente, mostrando su estructura, componentes y oportunidades de mejora.

**Uso:**
```bash
@squad-creator

*analyze-squad my-squad
# → Analisis completo de my-squad

*analyze-squad my-squad --verbose
# → Analisis detallado con contenido de archivos

*analyze-squad my-squad --suggestions
# → Incluir sugerencias potenciadas por IA
```

**Salida:**
- Resumen del squad (nombre, version, autor)
- Inventario de componentes (tareas, agentes, etc.)
- Analisis de dependencias
- Metricas de cobertura (que directorios estan vacios)
- Sugerencias de mejora

### 2. `*extend-squad` - Agregar/Modificar Componentes

**Proposito:** Agregar nuevos componentes a un squad existente de forma interactiva.

**Uso:**
```bash
@squad-creator

*extend-squad my-squad
# → Modo interactivo, pregunta que agregar

*extend-squad my-squad --add agent
# → Agregar nuevo agente

*extend-squad my-squad --add task --agent my-agent
# → Agregar nueva tarea para un agente especifico

*extend-squad my-squad --add workflow
# → Agregar nuevo workflow

*extend-squad my-squad --story SQS-XX
# → Vincular cambios a una historia
```

**Componentes Soportados:**
| Componente | Flag | Crea |
|------------|------|------|
| Agente | `--add agent` | `agents/{nombre}.md` |
| Tarea | `--add task` | `tasks/{agente}-{tarea}.md` |
| Workflow | `--add workflow` | `workflows/{nombre}.md` |
| Checklist | `--add checklist` | `checklists/{nombre}.md` |
| Plantilla | `--add template` | `templates/{nombre}.md` |
| Herramienta | `--add tool` | `tools/{nombre}.js` |
| Script | `--add script` | `scripts/{nombre}.js` |
| Datos | `--add data` | `data/{nombre}.yaml` |

---

## Tipo de Servicio

**Recomendacion:** Servicio de Utilidad (Tareas internas + scripts)

**Justificacion:**
- No requiere integracion con API externa
- Solo operaciones de sistema de archivos
- Sigue los patrones existentes de squad-creator
- Se integra con el validador/cargador existente

---

## Estructura Sugerida

### Nuevos Archivos de Tareas

```
.aiox-core/development/tasks/
├── squad-creator-analyze.md     # NUEVO: *analyze-squad
└── squad-creator-extend.md      # NUEVO: *extend-squad
```

### Nuevos Archivos de Scripts

```
.aiox-core/development/scripts/squad/
├── squad-analyzer.js            # NUEVO: Logica de analisis
└── squad-extender.js            # NUEVO: Logica de extension
```

### Archivos Actualizados

```
.aiox-core/development/agents/squad-creator.md  # Agregar nuevos comandos
.aiox-core/schemas/squad-schema.json            # (sin cambios necesarios)
```

---

## Pasos de Implementacion

### Fase 1: Tarea de Analisis (4-6h)

1. **Crear `squad-creator-analyze.md`**
   - Definir formato de tarea (TASK-FORMAT-SPECIFICATION-V1)
   - Elicitacion: nombre del squad, formato de salida
   - Pasos: escanear, analizar, reportar

2. **Crear `squad-analyzer.js`**
   - `analyzeSquad(squadPath)` → retorna objeto de analisis
   - Inventario de componentes
   - Metricas de cobertura
   - Verificacion de dependencias

3. **Agregar Tests**
   - `tests/unit/squad/squad-analyzer.test.js`
   - Objetivo: 80%+ de cobertura

### Fase 2: Tarea de Extension (6-8h)

4. **Crear `squad-creator-extend.md`**
   - Definir formato de tarea
   - Elicitacion: tipo de componente, nombre, detalles
   - Pasos: validar, crear, actualizar manifiesto, validar de nuevo

5. **Crear `squad-extender.js`**
   - `addAgent(squadPath, agentDef)`
   - `addTask(squadPath, taskDef)`
   - `addTemplate(squadPath, templateDef)`
   - etc. para cada tipo de componente
   - Auto-actualizar squad.yaml

6. **Agregar Tests**
   - `tests/unit/squad/squad-extender.test.js`
   - Objetivo: 80%+ de cobertura

### Fase 3: Integracion con Agente (2-3h)

7. **Actualizar `squad-creator.md`**
   - Agregar comando `*analyze-squad`
   - Agregar comando `*extend-squad`
   - Actualizar seccion de dependencias

8. **Sincronizar con Reglas de IDE**
   - Ejecutar script de sincronizacion para .claude, .cursor, etc.

### Fase 4: Documentacion (2-3h)

9. **Actualizar Documentacion**
   - Actualizar `docs/guides/squads-guide.md`
   - Agregar ejemplos a squad-examples/
   - Actualizar epic-sqs-squad-system.md

10. **Crear Historia**
    - `docs/stories/v4.0.4/sprint-XX/story-sqs-11-squad-improvement.md`

---

## Especificaciones Detalladas de Tareas

### `squad-creator-analyze.md`

```yaml
task: analyzeSquad()
responsible: squad-creator (Craft)
responsible_type: Agent
atomic_layer: Analysis
elicit: true

inputs:
- field: squad_name
  type: string
  source: User Input
  required: true
  validation: El squad existe en ./squads/

- field: output_format
  type: string
  source: User Input
  required: false
  validation: console|markdown|json

outputs:
- field: analysis_report
  type: object
  destination: Consola o archivo
  persisted: false
```

**Ejemplo de Salida:**
```
=== Analisis de Squad: my-domain-squad ===

📋 Resumen
  Nombre: my-domain-squad
  Version: 1.0.0
  Autor: John Doe
  Licencia: MIT

📦 Componentes
  ├── Agentes (2)
  │   ├── lead-agent.md
  │   └── helper-agent.md
  ├── Tareas (3)
  │   ├── lead-agent-task1.md
  │   ├── lead-agent-task2.md
  │   └── helper-agent-task1.md
  ├── Workflows (0) ← Vacio
  ├── Plantillas (1)
  │   └── report-template.md
  ├── Herramientas (0) ← Vacio
  └── Checklists (0) ← Vacio

📊 Cobertura
  Tareas: ████████░░ 80% (3/4 agentes tienen tareas)
  Docs: ██████████ 100% (README existe)
  Config: ████████░░ 80% (falta tech-stack)

💡 Sugerencias
  1. Agregar checklist para validacion de agentes
  2. Crear workflow para secuencias comunes de agentes
  3. Agregar tech-stack.md a config/
```

### `squad-creator-extend.md`

```yaml
task: extendSquad()
responsible: squad-creator (Craft)
responsible_type: Agent
atomic_layer: Modification
elicit: true

inputs:
- field: squad_name
  type: string
  source: User Input
  required: true

- field: component_type
  type: string
  source: User Input
  required: true
  validation: agent|task|workflow|checklist|template|tool|script|data

- field: component_name
  type: string
  source: User Input
  required: true
  validation: kebab-case

- field: story_id
  type: string
  source: User Input
  required: false
  validation: formato SQS-XX

outputs:
- field: created_file
  type: string
  destination: Directorio del squad
  persisted: true

- field: updated_manifest
  type: boolean
  destination: squad.yaml
  persisted: true
```

---

## Asignacion de Agentes

| Rol | Agente | Responsabilidades |
|-----|--------|-------------------|
| Principal | @dev (Dex) | Implementar scripts y tareas |
| Soporte | @qa (Quinn) | Probar implementacion |
| Revision | @architect (Aria) | Revision de arquitectura |

---

## Dependencias

### Dependencias de Ejecucion
- Node.js 18+
- Scripts existentes de squad (cargador, validador, generador)

### Dependencias de Desarrollo
- Jest (testing)
- js-yaml (parsing de YAML)

---

## Estimacion de Esfuerzo

| Fase | Esfuerzo | Dependencias |
|------|----------|--------------|
| Fase 1: Tarea de Analisis | 4-6h | SQS-4 (completada) |
| Fase 2: Tarea de Extension | 6-8h | Fase 1 |
| Fase 3: Integracion con Agente | 2-3h | Fase 2 |
| Fase 4: Documentacion | 2-3h | Fase 3 |
| **Total** | **14-20h** | |

---

## Integracion con Historia

### Historia Propuesta: SQS-11

**Titulo:** Tareas de Analisis y Extension de Squads

**Epic:** SQS (Mejora del Sistema de Squads)

**Sprint:** Sprint 14 (o el siguiente disponible)

**Criterios de Aceptacion:**
- [ ] `*analyze-squad` muestra inventario completo del squad
- [ ] `*extend-squad` puede agregar todos los tipos de componentes
- [ ] Actualizacion automatica de squad.yaml al extender
- [ ] Validacion se ejecuta despues de la extension
- [ ] Flag opcional --story para trazabilidad
- [ ] 80%+ de cobertura de tests
- [ ] Documentacion actualizada

---

## Proximos Pasos

1. **Revisar y aprobar** este enfoque
2. **Crear Historia SQS-11** en `docs/stories/v4.0.4/sprint-XX/`
3. **Ejecutar `*create-service squad-analyzer`** para scaffolding (o creacion manual)
4. **Comenzar implementacion** con @dev

---

## Enfoques Alternativos Considerados

### Opcion A: Tarea Unica `*improve-squad` (No Recomendada)
- Combina analisis + extension en una tarea
- Demasiado compleja, viola responsabilidad unica
- Dificil de probar

### Opcion B: Multiples Tareas Granulares (No Recomendada)
- `*add-agent`, `*add-task`, `*add-workflow`, etc.
- Demasiados comandos para recordar
- Experiencia de usuario inconsistente

### Opcion C: Dos Tareas - Analizar + Extender (Recomendada ✅)
- Clara separacion de responsabilidades
- Analizar primero, luego extender
- Consistente con patrones existentes

---

**Creado por:** @architect (Aria)
**Fecha:** 2025-12-26
**Estado:** Pendiente de Aprobacion

---

*Siguiente: Crear Historia SQS-11 o proceder con la implementacion*
