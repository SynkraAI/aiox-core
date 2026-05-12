<!--
  Traducción: ES
  Original: /docs/guides/agent-selection-guide.md
  Última sincronización: 2026-01-29
-->

# Guía de Selección de Agentes

> [EN](../../guides/agent-selection-guide.md) | [PT](../../pt/guides/agent-selection-guide.md) | **ES**

---

## Referencia Rápida para Elegir el Agente Correcto

**Última Actualización:** 2026-01-29 (ADE v2.2.0)

---

## Árbol de Decisión Rápido

```
¿Necesita investigación/análisis? → @analyst
   ↓
¿Necesita PRD/epic? → @pm
   ↓
¿Necesita arquitectura? → @architect
   ↓
¿Necesita base de datos? → @data-engineer
   ↓
¿Necesita stories? → @sm
   ↓
¿Necesita implementación? → @dev
   ↓
¿Necesita pruebas/QA? → @qa
   ↓
¿Necesita deploy? → @devops
```

---

## Referencia Rápida de Agentes

| Agente                       | Ícono | Usar Para                                                                                                             | NO Usar Para                                       |
| ---------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **@analyst** (Atlas)         | 🔍    | Investigación de mercado, análisis competitivo, brainstorming, extracción de patrones                                 | Creación de PRD, arquitectura, stories             |
| **@pm** (Morgan)             | 📋    | PRD, epics, estrategia de producto, recopilación de requisitos, escritura de specs                                    | Investigación, arquitectura, stories detalladas    |
| **@architect** (Aria)        | 🏛️    | Arquitectura de sistema, diseño de API, stack tecnológico, evaluación de complejidad, planificación de implementación | Investigación, PRD, esquema de base de datos       |
| **@data-engineer** (Dara)    | 📊    | Esquema de base de datos, RLS, migraciones, optimización de queries                                                   | Arquitectura de app, selección de tecnología de BD |
| **@sm** (River)              | 🌊    | User stories, planificación de sprint, refinamiento de backlog                                                        | PRD, epics, investigación, implementación          |
| **@dev** (Dex)               | 💻    | Implementación de story, codificación, pruebas, ejecución de subtasks, recuperación                                   | Creación de story, deploy                          |
| **@qa** (Quinn)              | 🧪    | Code review, pruebas, garantía de calidad, crítica de spec, revisión estructurada                                     | Implementación                                     |
| **@po** (Pax)                | 🎯    | Gestión de backlog, criterios de aceptación, priorización                                                             | Creación de epic, arquitectura                     |
| **@ux-design-expert** (Nova) | 🎨    | Diseño UI/UX, wireframes, design systems                                                                              | Implementación                                     |
| **@devops** (Gage)           | ⚙️    | Git ops, creación de PR, deploy, CI/CD, gestión de worktrees, migraciones                                             | Git local, implementación                          |
| **@aiox-master** (Orion)     | 👑    | Desarrollo del framework, orquestación multi-agente                                                                   | Tareas rutinarias (usar agentes especializados)    |

---

## 🤖 Comandos ADE por Agente (v2.2.0)

### @devops (Gage) - Infraestructura & Operaciones

**Gestión de Worktrees:**
| Comando | Descripción |
|---------|-------------|
| `*create-worktree {story}` | Crear worktree Git aislada para desarrollo de story |
| `*list-worktrees` | Listar todas las worktrees activas con estado |
| `*merge-worktree {story}` | Hacer merge de la worktree completada de vuelta a main |
| `*cleanup-worktrees` | Eliminar worktrees obsoletas/ya mergeadas |

**Gestión de Migraciones:**
| Comando | Descripción |
|---------|-------------|
| `*inventory-assets` | Generar inventario de migración de los assets V2 |
| `*analyze-paths` | Analizar dependencias de paths e impacto de migración |
| `*migrate-agent` | Migrar un único agente del formato V2 a V3 |
| `*migrate-batch` | Migración en lote de todos los agentes con validación |

---

### @pm (Morgan) - Gestión de Producto

**Spec Pipeline:**
| Comando | Descripción |
|---------|-------------|
| `*gather-requirements` | Elicitar y documentar requisitos de los stakeholders |
| `*write-spec` | Generar documento de especificación formal a partir de los requisitos |

---

### @architect (Aria) - Arquitectura de Sistema

**Spec Pipeline:**
| Comando | Descripción |
|---------|-------------|
| `*assess-complexity` | Evaluar complejidad de la story y estimar esfuerzo |

**Execution Engine:**
| Comando | Descripción |
|---------|-------------|
| `*create-plan` | Crear plan de implementación con fases y subtasks |
| `*create-context` | Generar contexto de proyecto y archivos para story |

**Memory Layer:**
| Comando | Descripción |
|---------|-------------|
| `*map-codebase` | Generar mapa del codebase (estructura, servicios, patrones) |

---

### @analyst (Atlas) - Investigación & Análisis

**Spec Pipeline:**
| Comando | Descripción |
|---------|-------------|
| `*research-deps` | Investigar dependencias y restricciones técnicas |

**Memory Layer:**
| Comando | Descripción |
|---------|-------------|
| `*extract-patterns` | Extraer y documentar patrones de código del codebase |

---

### @qa (Quinn) - Garantía de Calidad

**Spec Pipeline:**
| Comando | Descripción |
|---------|-------------|
| `*critique-spec {story}` | Revisar y criticar especificación en cuanto a completitud |

**QA Evolution (Revisión en 10 Fases):**
| Comando | Descripción |
|---------|-------------|
| `*review-build {story}` | Revisión QA estructurada en 10 fases - genera qa_report.md |
| `*request-fix {issue}` | Solicitar corrección específica del @dev con contexto |
| `*verify-fix {issue}` | Verificar si la corrección fue implementada correctamente |

---

### @dev (Dex) - Desarrollo

**Execution Engine:**
| Comando | Descripción |
|---------|-------------|
| `*execute-subtask` | Ejecutar subtask siguiendo workflow de 13 pasos con auto-crítica |

**Recovery System:**
| Comando | Descripción |
|---------|-------------|
| `*track-attempt` | Rastrear intento de implementación (registra en recovery/attempts.json) |
| `*rollback` | Revertir al último estado bueno (--hard para saltar confirmación) |

**QA Loop:**
| Comando | Descripción |
|---------|-------------|
| `*apply-qa-fix` | Aplicar corrección solicitada por QA (lee qa_report.md para contexto) |

**Memory Layer:**
| Comando | Descripción |
|---------|-------------|
| `*capture-insights` | Capturar insights de la sesión (descubrimientos, patrones, gotchas) |
| `*list-gotchas` | Listar gotchas conocidos de .aiox/gotchas.md |

---

## Escenarios Comunes

### "Quiero construir una nueva funcionalidad" (Tradicional)

```
1. @analyst *brainstorm - Ideación
2. @pm *create-prd - Requisitos de producto
3. @architect *create-architecture - Diseño técnico
4. @data-engineer *create-schema - Diseño de base de datos
5. @sm *create-next-story - User stories
6. @dev *develop - Implementación
7. @qa *review - Verificación de calidad
8. @devops *create-pr - Deploy
```

### "Quiero construir usando ADE Spec Pipeline" (Autónomo)

```
1. @pm *gather-requirements - Recopilar y estructurar requisitos
2. @architect *assess-complexity - Evaluar complejidad
3. @analyst *research-deps - Investigar bibliotecas/APIs
4. @pm *write-spec - Generar especificación
5. @qa *critique-spec - Validar calidad de la spec
   ↓
[Spec Aprobada]
   ↓
6. @architect *create-plan - Crear plan de implementación
7. @architect *create-context - Generar archivos de contexto
8. @dev *execute-subtask 1.1 - Ejecutar con 13 pasos + auto-crítica
9. @qa *review-build - Revisión QA en 10 fases
   ↓
[Si encuentra problemas]
   ↓
10. @qa *request-fix - Solicitar corrección
11. @dev *apply-qa-fix - Aplicar corrección
12. @qa *verify-fix - Verificar
```

### "Estoy atascado en la implementación"

```
1. @dev *track-attempt - Registrar el intento fallido
2. @dev *rollback - Revertir al último estado bueno
3. @dev *list-gotchas - Verificar trampas conocidas
4. @dev *execute-subtask --approach alternative - Intentar enfoque diferente
```

### "Necesito entender el codebase existente"

```
1. @architect *map-codebase - Generar mapa de estructura/servicios/patrones
2. @analyst *extract-patterns - Documentar patrones de código
3. @dev *capture-insights - Registrar descubrimientos
```

### "Necesito desarrollo paralelo de stories"

```
1. @devops *create-worktree STORY-42 - Aislar branch
2. @dev *execute-subtask - Trabajar en aislamiento
3. @devops *merge-worktree STORY-42 - Hacer merge cuando completado
4. @devops *cleanup-worktrees - Limpiar branches obsoletas
```

---

## Patrones de Delegación

### Flujo del Spec Pipeline

```
@pm *gather-requirements
    ↓
@architect *assess-complexity
    ↓
@analyst *research-deps
    ↓
@pm *write-spec
    ↓
@qa *critique-spec
```

### Flujo de Ejecución

```
@architect *create-plan
    ↓
@architect *create-context
    ↓
@dev *execute-subtask (loops)
    ↓
@qa *review-build
```

### QA Loop

```
@qa *review-build
    ↓ (problemas encontrados)
@qa *request-fix
    ↓
@dev *apply-qa-fix
    ↓
@qa *verify-fix
    ↓ (loop hasta limpio)
```

### Flujo de Recuperación

```
@dev falla subtask
    ↓
@dev *track-attempt
    ↓
¿Retries < 3? → @dev intenta con variación
    ↓
@dev *rollback → intenta enfoque diferente
```

---

## Documentación Completa

- **[Guía Completa del ADE](./ade-guide.md)** - Tutorial completo del Autonomous Development Engine
- **[Matriz de Responsabilidad de Agentes](../../architecture/agent-responsibility-matrix.md)** - Definiciones completas de límites

---

**Versión:** 2.0 | **ADE:** v2.2.0 | **Fecha:** 2026-01-29
