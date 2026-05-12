<!--
  Traducción: ES
  Original: /docs/DOCUMENTATION-ROADMAP.md
  Última sincronización: 2026-01-28
-->

# Hoja de Ruta de Documentación de AIOX

> 🌐 [EN](../DOCUMENTATION-ROADMAP.md) | [PT](../pt/DOCUMENTATION-ROADMAP.md) | **ES**

---

**Creado:** 2026-01-26
**Estado:** Activo
**Responsable:** @devops (Gage)

---

## Resumen Ejecutivo

Esta hoja de ruta aborda **33 documentos faltantes** identificados durante la auditoría de enlaces de documentación.
Después del análisis, se categorizan en:

| Categoría      | Cantidad | Acción                            |
| -------------- | -------- | --------------------------------- |
| **Crear**      | 10       | Nuevos documentos necesarios      |
| **Consolidar** | 8        | Fusionar en documentos existentes |
| **Descartar**  | 15       | Obsoletos/redundantes             |

---

## Fase 1: Alta Prioridad (Inmediato)

### 1.1 Seguridad y Configuración

| Documento                    | Ubicación               | Complejidad | Descripción                              |
| ---------------------------- | ----------------------- | ----------- | ---------------------------------------- |
| `mcp-api-keys-management.md` | `docs/en/architecture/` | Media       | Seguridad y gestión de claves API de MCP |

**Esquema de contenido:**

- [ ] Mejores prácticas de almacenamiento de claves API
- [ ] Configuración de variables de entorno
- [ ] Secretos de Docker MCP Toolkit
- [ ] Consideraciones de seguridad
- [ ] Procedimientos de rotación

### 1.2 Incorporación de Usuarios

| Documento             | Ubicación               | Complejidad | Descripción                                |
| --------------------- | ----------------------- | ----------- | ------------------------------------------ |
| `v4-quick-start.md` | `docs/en/installation/` | Simple      | Guía de inicio rápido para nuevos usuarios |

**Esquema de contenido:**

- [ ] Configuración en 5 minutos
- [ ] Lista de verificación de prerrequisitos
- [ ] Primera activación de agente
- [ ] Pasos de verificación
- [ ] Enlaces a próximos pasos

---

## Fase 2: Prioridad Media (Próximo Sprint)

### 2.1 Guías para Desarrolladores

| Documento                         | Ubicación               | Complejidad | Descripción                            |
| --------------------------------- | ----------------------- | ----------- | -------------------------------------- |
| `agent-tool-integration-guide.md` | `docs/en/architecture/` | Compleja    | Cómo integrar herramientas con agentes |
| `dependency-resolution-plan.md`   | `docs/en/architecture/` | Media       | Estrategia de dependencias de módulos  |

### 2.2 Documentos de Planificación

| Documento                                       | Ubicación          | Complejidad | Descripción                           |
| ----------------------------------------------- | ------------------ | ----------- | ------------------------------------- |
| `stories/1.8-phase-3-workflow-orchestration.md` | `docs/en/stories/` | Media       | Historia del módulo de orquestación   |
| `stories/1.9-missing-pv-agents.md`              | `docs/en/stories/` | Simple      | Seguimiento de completitud de agentes |

### 2.3 Documentación de Referencia

| Documento              | Ubicación                    | Complejidad | Descripción                         |
| ---------------------- | ---------------------------- | ----------- | ----------------------------------- |
| `coderabbit/README.md` | `docs/en/guides/coderabbit/` | Simple      | Guía de configuración de CodeRabbit |

---

## Fase 3: Baja Prioridad (Backlog)

### 3.1 Arquitectura

| Documento                              | Ubicación               | Complejidad | Descripción                              |
| -------------------------------------- | ----------------------- | ----------- | ---------------------------------------- |
| `multi-repo-strategy.md`               | `docs/en/architecture/` | Compleja    | Organización multi-repositorio           |
| `mvp-components.md`                    | `docs/en/architecture/` | Simple      | Componentes mínimos viables              |
| `schema-comparison-sqlite-supabase.md` | `docs/en/architecture/` | Media       | Comparación de esquemas de base de datos |

---

## Plan de Consolidación

Estos documentos deben **fusionarse en documentación existente**:

| Documento Faltante                                | Fusionar En                                  | Acción                               |
| ------------------------------------------------- | -------------------------------------------- | ------------------------------------ |
| `installation/migration-migration-guide.md`          | `migration-guide.md`                         | Agregar sección v2.0→v4.0.4            |
| `migration-migration-guide.md`                       | `migration-guide.md`                         | Igual que arriba                     |
| `coderabbit-integration-decisions.md`             | `architecture/adr/`                          | Crear nuevo ADR                      |
| `technical-review-greeting-system-unification.md` | `guides/contextual-greeting-system-guide.md` | Agregar sección técnica              |
| `hybrid-ops-pv-mind-integration.md`               | `architecture/high-level-architecture.md`    | Agregar sección de integración       |
| `repository-migration-plan.md`                    | `migration-guide.md`                         | Agregar sección de migración de repo |
| `internal-tools-analysis.md`                      | `.aiox-core/infrastructure/tools/README.md`  | Referencia existente                 |
| `.aiox-core/core/registry/README.md`              | **YA EXISTE**                                | No se necesita acción                |

---

## Lista de Descarte

Estos documentos son **obsoletos o redundantes** y NO deben ser creados:

| Documento                                            | Razón                                                   |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `architect-Squad-rearchitecture.md`                  | Cubierto en `squad-improvement-recommended-approach.md` |
| `analysis/Squads-dependency-analysis.md`             | Análisis puntual; sistema de squad maduro               |
| `analysis/Squads-structure-inventory.md`             | Dinámico; mejor mantenido via scripts                   |
| `analysis/subdirectory-migration-impact-analysis.md` | Migración completada                                    |
| `analysis/tools-system-analysis-log.md`              | Logs efímeros; sistema de herramientas estable          |
| `analysis/tools-system-gap-analysis.md`              | Análisis de brechas completado                          |
| `tools-system-brownfield.md`                         | Incorporado en tarea `analyze-brownfield.md`            |
| `tools-system-handoff.md`                            | Doc de proceso, no permanente                           |
| `tools-system-schema-refinement.md`                  | Refinamiento completado                                 |
| `analysis/scripts-consolidation-analysis.md`         | Scripts ya consolidados                                 |
| `analysis/repository-strategy-analysis.md`           | Estrategia definida en ARCHITECTURE-INDEX               |
| `SYNKRA-REBRANDING-SPECIFICATION.md`                 | Rebranding completado                                   |
| `multi-repo-strategy-pt.md`                          | Usar estructura `docs/pt-BR/` en su lugar               |

---

## Cronograma de Implementación

```
Semana 1 (Fase 1)
├── Día 1-2: mcp-api-keys-management.md
└── Día 3-4: v4-quick-start.md

Semana 2-3 (Fase 2)
├── Día 1-3: agent-tool-integration-guide.md
├── Día 4-5: dependency-resolution-plan.md
├── Día 6: stories/1.8 & 1.9
└── Día 7: coderabbit/README.md

Semana 4 (Fase 3 + Consolidación)
├── Día 1-2: Tareas de consolidación
├── Día 3-4: multi-repo-strategy.md (si es necesario)
└── Día 5: mvp-components.md
```

---

## Requisitos de Traducción

Todos los nuevos documentos deben ser creados en **3 idiomas**:

- `docs/en/` - Inglés (principal)
- `docs/pt-BR/` - Portugués (Brasil)
- `docs/es/` - Español

**Flujo de trabajo de traducción:**

1. Crear versión en inglés primero
2. Usar @dev o agente de traducción para PT-BR y ES
3. Revisar traducciones para precisión técnica

---

## Criterios de Éxito

- [ ] Todos los documentos de Fase 1 creados y revisados
- [ ] Todos los documentos de Fase 2 creados y revisados
- [ ] Tareas de consolidación completadas
- [ ] Cero enlaces rotos en la documentación
- [ ] Todos los documentos disponibles en 3 idiomas

---

## Seguimiento de Progreso

### Fase 1

- [ ] `mcp-api-keys-management.md` (EN/PT-BR/ES)
- [ ] `v4-quick-start.md` (EN/PT-BR/ES)

### Fase 2

- [ ] `agent-tool-integration-guide.md` (EN/PT-BR/ES)
- [ ] `dependency-resolution-plan.md` (EN/PT-BR/ES)
- [ ] `stories/1.8-phase-3-workflow-orchestration.md` (solo EN)
- [ ] `stories/1.9-missing-pv-agents.md` (solo EN)
- [ ] `coderabbit/README.md` (EN/PT-BR/ES)

### Fase 3

- [ ] `multi-repo-strategy.md` (EN/PT-BR/ES)
- [ ] `mvp-components.md` (EN/PT-BR/ES)
- [ ] `schema-comparison-sqlite-supabase.md` (solo EN)

### Consolidación

- [ ] Sección de guía de migración v2.0→v4.0.4 agregada
- [ ] ADR para decisiones de CodeRabbit creado
- [ ] Sección técnica de guía de sistema de saludos agregada

---

**Última Actualización:** 2026-01-28
**Próxima Revisión:** Después de completar Fase 1
