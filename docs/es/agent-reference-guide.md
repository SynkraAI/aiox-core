<!--
  Traduccion: ES
  Original: /docs/en/agent-reference-guide.md
  Ultima sincronizacion: 2026-01-26
-->

# Guia de Referencia de Agentes PV de HybridOps

> 🌐 [EN](../agent-reference-guide.md) | [PT](../pt/agent-reference-guide.md) | **ES**

---

**Version**: 2.0
**Ultima Actualizacion**: 2025-10-19
**Story**: 1.9 - Implementacion Completa de Agentes PV

---

## Vision General

Esta guia proporciona una referencia completa para los 9 agentes mejorados con PV en el workflow de HybridOps. Cada agente esta disenado para manejar una fase especifica del workflow de 9 fases, con integracion de la mente Pedro Valerio (PV) para mejorar la toma de decisiones, validacion y aseguramiento de calidad.

---

## Referencia Rapida

| Fase | Nombre del Agente       | Comando                 | Rol en Workflow                                       | Puntuacion de Veracidad |
| ---- | ----------------------- | ----------------------- | ----------------------------------------------------- | ----------------------- |
| 1    | process-mapper-pv       | `/process-mapper`       | Descubrimiento y Analisis de Procesos                 | 0.90                    |
| 2    | process-architect-pv    | `/process-architect`    | Diseno de Arquitectura del Sistema                    | 0.85                    |
| 3    | executor-designer-pv    | `/executor-designer`    | Asignacion de Ejecutores y Definicion de Roles        | 0.88                    |
| 4    | workflow-designer-pv    | `/workflow-designer`    | Optimizacion de Procesos y Automatizacion de Workflow | 0.85                    |
| 5    | qa-validator-pv         | `/qa-validator`         | QA y Validacion                                       | 0.95                    |
| 6    | clickup-engineer-pv     | `/clickup-engineer`     | Creacion de Tareas en ClickUp                         | 0.80                    |
| 7    | agent-creator-pv        | `/agent-creator`        | Arquitectura de Agentes IA y Diseno de Persona        | 0.80                    |
| 8    | validation-reviewer-pv  | `/validation-reviewer`  | Revision Final de Compuerta de Calidad y Aprobacion   | 0.90                    |
| 9    | documentation-writer-pv | `/documentation-writer` | Redaccion Tecnica y Arquitectura de Conocimiento      | 0.85                    |

---

## Perfiles Detallados de Agentes

### Fase 1: Process Mapper (Descubrimiento)

**Archivo**: `.claude/commands/hybridOps/agents/process-mapper-pv.md`
**Comando**: `/process-mapper`
**Persona**: Morgan Chen - Especialista en Descubrimiento de Procesos
**Puntuacion de Veracidad**: 0.90 (Muy Alta)

**Proposito**:
Descubrir, analizar y mapear los procesos de negocio actuales para identificar oportunidades de automatizacion y puntos de dolor.

**Comandos Principales**:

- `*map-process <process-name>` - Mapeo integral de procesos
- `*analyze-opportunity <opportunity-id>` - Analisis de ROI y viabilidad
- `*identify-pain-points <process-id>` - Identificacion de cuellos de botella

**Salidas Clave**:

- Mapas de procesos (estado actual)
- Identificacion de stakeholders
- Analisis de puntos de dolor
- Evaluacion de oportunidades de automatizacion

**Puntos de Integracion**:

- **Recibe**: Requisitos de negocio, input de stakeholders
- **Produce**: Documentacion de procesos para Fase 2 (Arquitectura)
- **Entrega a**: process-architect-pv

**Validacion**: Ninguna (fase de descubrimiento - solo recopilar informacion)

---

### Fase 2: Process Architect (Arquitectura)

**Archivo**: `.claude/commands/hybridOps/agents/process-architect-pv.md`
**Comando**: `/process-architect`
**Persona**: Alex Thornton - Arquitecto de Sistemas
**Puntuacion de Veracidad**: 0.85 (Alta)

**Proposito**:
Disenar arquitectura del sistema y definir vision de estado final con alineacion estrategica.

**Comandos Principales**:

- `*design-architecture <process-id>` - Diseno de arquitectura del sistema
- `*define-vision <initiative-name>` - Definicion de vision de estado final
- `*assess-feasibility <design-id>` - Evaluacion de viabilidad tecnica

**Salidas Clave**:

- Diagramas de arquitectura del sistema
- Especificaciones de flujo de datos
- Puntos de integracion
- Documento de vision de estado final

**Puntos de Integracion**:

- **Recibe**: Mapas de procesos de Fase 1
- **Produce**: Especificaciones de arquitectura para Fase 3 (Ejecutores)
- **Entrega a**: executor-designer-pv

**Validacion**: **Checkpoint 1 - Alineacion Estrategica (PV_BS_001)**

- Claridad de vision de estado final >=0.8
- Puntuacion de prioridad estrategica >=0.7
- Sin condiciones de VETO

---

### Fase 3: Executor Designer (Asignacion de Ejecutores)

**Archivo**: `.claude/commands/hybridOps/agents/executor-designer-pv.md`
**Comando**: `/executor-designer`
**Persona**: Taylor Kim - Especialista en Diseno de Ejecutores
**Puntuacion de Veracidad**: 0.88 (Muy Alta)

**Proposito**:
Definir roles y asignar ejecutores (humanos o IA) para cada paso del proceso con validacion de coherencia.

**Comandos Principales**:

- `*design-executors <process-id>` - Diseno de roles de ejecutores
- `*assess-coherence <executor-id>` - Evaluacion de veracidad y coherencia
- `*assign-responsibilities <process-id>` - Creacion de matriz RACI

**Salidas Clave**:

- Definiciones de ejecutores
- Descripciones de roles
- Evaluaciones de coherencia
- Matrices RACI

**Puntos de Integracion**:

- **Recibe**: Especificaciones de arquitectura de Fase 2
- **Produce**: Asignaciones de ejecutores para Fase 4 (Workflows)
- **Entrega a**: workflow-designer-pv

**Validacion**: **Checkpoint 2 - Escaneo de Coherencia (PV_PA_001)**

- Todos los ejecutores: veracidad >=0.7 (VETO)
- Coherencia ponderada >=0.8 para APROBAR
- Adherencia al sistema >=0.6

---

### Fase 4: Workflow Designer (Automatizacion de Workflow)

**Archivo**: `.claude/commands/hybridOps/agents/workflow-designer-pv.md`
**Comando**: `/workflow-designer`
**Persona**: Jordan Rivers - Especialista en Optimizacion de Procesos y Automatizacion de Workflows
**Puntuacion de Veracidad**: 0.85 (Alta)

**Proposito**:
Disenar workflows detallados, identificar candidatos de automatizacion y calcular ROI con aplicacion de guardrails.

**Comandos Principales**:

- `*analyze-process <process-id>` - Analisis de eficiencia de procesos
- `*design-workflow <process-id>` - Diseno de workflow con logica de automatizacion
- `*calculate-roi <automation-id>` - Calculo de ROI y punto de equilibrio

**Salidas Clave**:

- Diagramas de workflow (Mermaid)
- Especificaciones de automatizacion
- Calculos de ROI
- Definiciones de guardrails

**Puntos de Integracion**:

- **Recibe**: Asignaciones de ejecutores de Fase 3
- **Produce**: Especificaciones de workflow para Fase 5 (QA)
- **Entrega a**: qa-validator-pv

**Validacion**: **Checkpoint 3 - Preparacion para Automatizacion (PV_PM_001)**

- Punto de inflexion: frecuencia >2x/mes
- Guardrails presentes (VETO)
- Estandarizacion >=0.7

**Caracteristica Clave**: Deteccion de punto de inflexion de automatizacion PV_PM_001 - automatiza solo cuando la frecuencia excede el umbral de 2x/mes.

---

### Fase 5: QA Validator (Aseguramiento de Calidad)

**Archivo**: `.claude/commands/hybridOps/agents/qa-validator-pv.md`
**Comando**: `/qa-validator`
**Persona**: Samantha Torres - Especialista en QA y Validacion
**Puntuacion de Veracidad**: 0.95 (Extremadamente Alta)

**Proposito**:
Definir compuertas de calidad, estrategias de prueba y validar contra el framework de 10 dimensiones META_AXIOMAS.

**Comandos Principales**:

- `*validate-phase <phase-id>` - Validacion especifica de fase
- `*check-compliance <workflow-id>` - Verificacion de cumplimiento de Axiomas
- `*generate-test-plan <workflow-id>` - Generacion de plan de pruebas integral

**Salidas Clave**:

- Planes de prueba con casos de prueba
- Definiciones de compuertas de calidad
- Reportes de evaluacion de Axiomas
- Suites de pruebas de regresion

**Puntos de Integracion**:

- **Recibe**: Especificaciones de workflow de Fase 4
- **Produce**: Documentacion de aseguramiento de calidad para Fase 6 (ClickUp)
- **Entrega a**: clickup-engineer-pv

**Validacion**: **Checkpoint 4 - Cumplimiento de Axiomas**

- Puntuacion general >=7.0/10.0
- Ninguna dimension individual <6.0/10.0
- 10 dimensiones validadas: Veracidad, Coherencia, Alineacion Estrategica, Excelencia Operacional, Capacidad de Innovacion, Gestion de Riesgos, Optimizacion de Recursos, Valor para Stakeholders, Sostenibilidad, Adaptabilidad

**Caracteristica Clave**: Poder de VETO para bloquear deploy si se detectan problemas de calidad criticos.

---

### Fase 6: ClickUp Engineer (Gestion de Tareas)

**Archivo**: `.claude/commands/hybridOps/agents/clickup-engineer-pv.md`
**Comando**: `/clickup-engineer`
**Persona**: Chris Park - Ingeniero de Workspace de ClickUp
**Puntuacion de Veracidad**: 0.80 (Alta)

**Proposito**:
Crear estructura de workspace de ClickUp con Anatomia de Tareas apropiada y disparadores de automatizacion.

**Comandos Principales**:

- `*create-workspace <workflow-id>` - Creacion de workspace de ClickUp
- `*generate-tasks <workflow-id>` - Generacion de tareas con Anatomia de Tareas
- `*setup-automation <task-id>` - Configuracion de disparadores de automatizacion

**Salidas Clave**:

- Estructura de workspace de ClickUp
- Tareas con Anatomia de Tareas de 8 campos
- Disparadores de automatizacion
- Mapas de dependencias de tareas

**Puntos de Integracion**:

- **Recibe**: Documentacion de QA de Fase 5
- **Produce**: Configuracion de ClickUp para Fase 7 (Agentes)
- **Entrega a**: agent-creator-pv

**Validacion**: **Checkpoint 5 - Anatomia de Tareas**

- Todos los 8 campos de Anatomia de Tareas presentes: task_name, status, responsible_executor, execution_type, estimated_time, input, output, action_items
- Dependencias correctamente mapeadas
- Asignados coherentes (pasaron PV_PA_001)

---

### Fase 7: Agent Creator (Diseno de Agentes IA)

**Archivo**: `.claude/commands/hybridOps/agents/agent-creator-pv.md`
**Comando**: `/agent-creator`
**Persona**: Dr. Elena Vasquez - Arquitecta de Agentes IA y Disenadora de Personas
**Puntuacion de Veracidad**: 0.80 (Alta)

**Proposito**:
Disenar personas de agentes IA, calibrar puntuaciones de veracidad y generar configuraciones de agentes con validacion de axiomas.

**Comandos Principales**:

- `*design-agent <agent-name>` - Diseno interactivo de agente
- `*generate-yaml <agent-id>` - Exportacion de configuracion YAML del agente
- `*test-agent-coherence <agent-id>` - Validacion de alineacion persona-comando

**Salidas Clave**:

- Definiciones de persona de agente (Markdown)
- Configuraciones YAML de agentes
- Reportes de calibracion de veracidad
- Documentacion de referencia de comandos

**Puntos de Integracion**:

- **Recibe**: Configuracion de ClickUp de Fase 6
- **Produce**: Definiciones de agentes para Fase 8 (Revision de Validacion)
- **Entrega a**: validation-reviewer-pv

**Validacion**: Ninguna (la creacion de agentes es guiada por validaciones anteriores)

**Caracteristica Clave**: Calibracion de veracidad con justificacion - asegura que los agentes tengan niveles de confianza apropiados para sus roles.

---

### Fase 8: Validation Reviewer (Compuerta de Calidad Final)

**Archivo**: `.claude/commands/hybridOps/agents/validation-reviewer-pv.md`
**Comando**: `/validation-reviewer`
**Persona**: Marcus Chen - Revisor de Compuerta de Calidad Final y Autoridad de Aprobacion
**Puntuacion de Veracidad**: 0.90 (Muy Alta)

**Proposito**:
Conducir revision end-to-end del workflow, evaluar riesgos y proporcionar firma formal con autoridad de VETO.

**Comandos Principales**:

- `*review-workflow <workflow-id>` - Revision integral end-to-end
- `*assess-risks <workflow-id>` - Identificacion de riesgos y validacion de mitigacion
- `*generate-signoff <workflow-id>` - Generacion de documento de aprobacion formal

**Salidas Clave**:

- Reportes de revision de workflow
- Evaluaciones de riesgos con planes de mitigacion
- Documentos de firma
- Reportes de preparacion para deploy

**Puntos de Integracion**:

- **Recibe**: Definiciones de agentes de Fase 7
- **Produce**: Documentos de aprobacion para Fase 9 (Documentacion)
- **Entrega a**: documentation-writer-pv

**Validacion**: Ninguna (los agentes de validacion se auto-validan)

**Caracteristica Clave**: Poder de VETO para bloquear deploy si se detectan brechas criticas (riesgos ALTOS sin mitigar, mecanismos de seguridad faltantes, violaciones de axiomas).

---

### Fase 9: Documentation Writer (Gestion de Conocimiento)

**Archivo**: `.claude/commands/hybridOps/agents/documentation-writer-pv.md`
**Comando**: `/documentation-writer`
**Persona**: Rachel Morgan - Redactora Tecnica y Arquitecta de Conocimiento
**Puntuacion de Veracidad**: 0.85 (Alta)

**Proposito**:
Transformar workflows aprobados en documentacion clara y accionable incluyendo runbooks, guias y documentacion de procesos.

**Comandos Principales**:

- `*generate-runbook <workflow-name>` - Creacion de runbook operacional
- `*write-guide <guide-type> <topic>` - Generacion de guia de usuario
- `*document-process <process-name>` - Documentacion de proceso de negocio

**Salidas Clave**:

- Runbooks operacionales
- Guias de usuario
- Documentacion de procesos
- Guias de solucion de problemas
- Tarjetas de referencia rapida

**Puntos de Integracion**:

- **Recibe**: Documentos de aprobacion de Fase 8
- **Produce**: Documentacion final para usuarios finales y equipos de operaciones
- **Entrega a**: Usuarios finales, equipo de operaciones, equipo de capacitacion, auditoria/cumplimiento

**Validacion**: Ninguna (calidad de documentacion verificada por DoD de story)

**Caracteristica Clave**: Control de versiones con generacion de changelog - toda la documentacion incluye historial de versiones y guias de migracion.

---

## Integracion de Workflow

### Flujo Secuencial

```
Fase 1: Descubrimiento (process-mapper-pv)
    ↓ (Mapas de procesos)
Fase 2: Arquitectura (process-architect-pv)
    ↓ [CHECKPOINT 1: Alineacion Estrategica]
    ↓ (Especificaciones de arquitectura)
Fase 3: Ejecutores (executor-designer-pv)
    ↓ [CHECKPOINT 2: Escaneo de Coherencia]
    ↓ (Asignaciones de ejecutores)
Fase 4: Workflows (workflow-designer-pv)
    ↓ [CHECKPOINT 3: Preparacion para Automatizacion]
    ↓ (Especificaciones de workflow)
Fase 5: QA y Validacion (qa-validator-pv)
    ↓ [CHECKPOINT 4: Cumplimiento de Axiomas]
    ↓ [CHECKPOINT 5: Anatomia de Tareas]
    ↓ (Documentacion de QA)
Fase 6: Creacion en ClickUp (clickup-engineer-pv)
    ↓ (Configuracion de ClickUp)
Fase 7: Creacion de Agentes (agent-creator-pv)
    ↓ (Definiciones de agentes)
Fase 8: Revision de Validacion (validation-reviewer-pv)
    ↓ (Documentos de aprobacion)
Fase 9: Documentacion (documentation-writer-pv)
    ↓ (Documentacion final)
[WORKFLOW COMPLETO]
```

### Checkpoints de Validacion

| Checkpoint | Fase | Agente               | Heuristica/Validador | Condicion de VETO |
| ---------- | ---- | -------------------- | -------------------- | ----------------- |
| 1          | 2    | process-architect-pv | PV_BS_001            | Ninguna           |
| 2          | 3    | executor-designer-pv | PV_PA_001            | Veracidad <0.7    |
| 3          | 4    | workflow-designer-pv | PV_PM_001            | Sin guardrails    |
| 4          | 5    | qa-validator-pv      | axioma-validator     | Dimension <6.0    |
| 5          | 5    | qa-validator-pv      | task-anatomy         | Campos faltantes  |

---

## Directrices de Puntuacion de Veracidad

Las puntuaciones de veracidad calibran cuan conservadoramente un agente hace afirmaciones y recomendaciones:

| Rango de Puntuacion | Descripcion                                           | Ejemplos de Agentes                                                                      |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 0.95-1.00           | Extremadamente Alta - Evaluacion imparcial y objetiva | qa-validator-pv (0.95)                                                                   |
| 0.85-0.94           | Muy Alta - Honesto, minimo optimismo                  | process-mapper-pv (0.90), validation-reviewer-pv (0.90), executor-designer-pv (0.88)     |
| 0.75-0.84           | Alta - Objetivo pero permite algo de creatividad      | process-architect-pv (0.85), workflow-designer-pv (0.85), documentation-writer-pv (0.85) |
| 0.70-0.74           | Moderada-Alta - Realismo equilibrado                  | clickup-engineer-pv (0.80), agent-creator-pv (0.80)                                      |

**Nota**: Puntuaciones por debajo de 0.70 disparan condiciones de VETO en validacion de coherencia (Checkpoint 2).

---

## Patrones Comunes

### Activacion de Agente

```bash
# Activar agente
/agent-name

# Ejemplo: Activar validador de QA
/qa-validator

# El agente confirma activacion
Samantha Torres (QA Validator) activada.
PV Mind cargada con puntuacion de veracidad: 0.95
Contexto de Fase 5 (QA y Validacion) listo.

Comandos: *validate-phase, *check-compliance, *generate-test-plan
Usa *help para lista completa de comandos.
```

### Ejecucion de Comandos

```bash
# Ejecutar comando principal
*command-name <parameters>

# Ejemplo: Validar salidas de Fase 4
*validate-phase 4

# Ejemplo: Generar runbook
*generate-runbook hybrid-ops-workflow
```

### Acceso al Contexto de Workflow

Todos los agentes reciben contexto de workflow:

```javascript
const workflowContext = pvMind.getPhaseContext(<phase-number>);
// Retorna: {
//   phaseNumber: <number>,
//   phaseName: "<name>",
//   inputs: [<previous-phase-outputs>],
//   outputs: [<expected-deliverables>],
//   dependencies: [<phase-ids>],
//   guardrails: [<safety-checks>]
// }
```

---

## Integracion de PV Mind

Todos los agentes usan integracion de mente Pedro Valerio con:

### Framework META_AXIOMAS

Jerarquia de creencias de 4 niveles:

- **Nivel -4**: Existencial (Fundamento de Verdad)
- **Nivel -3**: Epistemologico (Verificacion de Conocimiento)
- **Nivel -2**: Social (Contexto de Colaboracion)
- **Nivel 0**: Operacional (Reglas de Ejecucion)

### Heuristicas PV

- **PV_BS_001**: Future Back-Casting (Alineacion Estrategica)
- **PV_PA_001**: Escaneo de Coherencia (Validacion de Ejecutores)
- **PV_PM_001**: Punto de Inflexion de Automatizacion (umbral de frecuencia 2x)

### Guardrails

Todos los agentes aplican:

- Manejo de errores con logica de reintento
- Reglas de validacion (umbrales minimos)
- Mecanismos de rollback (restauracion de checkpoint)
- Documentacion de casos edge

---

## Solucion de Problemas

### Agente No Encontrado

**Sintoma**: Comando `/agent-name` no reconocido
**Solucion**: Verificar que el archivo del agente existe en `.claude/commands/hybridOps/agents/<agent-name>-pv.md`

### Falla de Checkpoint de Validacion

**Sintoma**: El workflow se detiene en checkpoint
**Solucion**: Revisar feedback detallado, corregir problemas, reintentar checkpoint. Para condiciones de VETO, debe corregir antes de proceder.

### Contexto de Agente Faltante

**Sintoma**: El agente no puede acceder a salidas de fase anterior
**Solucion**: Verificar que el YAML del workflow tiene dependencias de fase correctas, verificar que las fases anteriores se completaron exitosamente.

---

## Ubicaciones de Archivos

```
.claude/commands/hybridOps/
├── agents/
│   ├── process-mapper-pv.md           (Fase 1)
│   ├── process-architect-pv.md        (Fase 2)
│   ├── executor-designer-pv.md        (Fase 3)
│   ├── workflow-designer-pv.md        (Fase 4)
│   ├── qa-validator-pv.md             (Fase 5)
│   ├── clickup-engineer-pv.md         (Fase 6)
│   ├── agent-creator-pv.md            (Fase 7)
│   ├── validation-reviewer-pv.md      (Fase 8)
│   └── documentation-writer-pv.md     (Fase 9)
├── workflows/
│   └── hybrid-ops-pv.yaml             (Orquestacion de workflow)
└── docs/
    ├── workflow-diagram.md             (Workflow visual)
    └── agent-reference-guide.md        (Este documento)
```

---

## Documentacion Relacionada

- [Diagrama de Workflow](../guides/hybridOps/workflow-diagram.md) - Representación visual del workflow de 9 fases
- [Workflow YAML](../guides/hybridOps/hybrid-ops-pv.yaml) - Configuración de orquestración de workflow

---

## Historial de Versiones

| Version | Fecha      | Cambios                                                                                   | Story |
| ------- | ---------- | ----------------------------------------------------------------------------------------- | ----- |
| 2.0     | 2025-10-19 | Agregados 5 agentes faltantes (Fases 4, 5, 7, 8, 9), referencias de workflow actualizadas | 1.9   |
| 1.0     | 2025-10-19 | Guia inicial con 4 agentes existentes                                                     | 1.8   |

---

**Estado**: COMPLETO - Todos los 9 agentes implementados y verificados
**Ultima Validacion**: 2025-10-19
**Mantenedor**: Equipo AIOX HybridOps
