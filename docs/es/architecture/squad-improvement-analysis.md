<!-- Traducción: ES | Original: /docs/en/architecture/squad-improvement-analysis.md | Sincronización: 2026-01-26 -->

# Análisis de Proyecto: Sistema de Mejora de Squads

> 🌐 [EN](../../architecture/squad-improvement-analysis.md) | [PT](../../pt/architecture/squad-improvement-analysis.md) | **ES**

---

**Generado:** 2025-12-26
**Generado Por:** @architect (Aria)
**Feature:** Tareas de Análisis y Mejora Continua de Squads
**Historia:** TBD (Propuesta: SQS-11)

---

## Estructura del Proyecto

| Aspecto | Valor |
|--------|-------|
| Framework | AIOX-FullStack |
| Lenguaje Principal | TypeScript/JavaScript |
| Sistema de Squads | v4.2 (Arquitectura Task-First) |
| Tareas Existentes | 8 tareas de squad-creator |
| Framework de Testing | Jest |

---

## Inventario Actual del Squad Creator

### Definición del Agente

| Propiedad | Valor |
|----------|-------|
| **Agent ID** | squad-creator |
| **Nombre** | Craft |
| **Título** | Squad Creator |
| **Icono** | 🏗️ |
| **Archivo** | `.aiox-core/development/agents/squad-creator.md` |

### Tareas Existentes

| Tarea | Archivo | Estado | Propósito |
|------|------|--------|---------|
| `*design-squad` | squad-creator-design.md | ✅ Hecho | Diseñar desde documentación |
| `*create-squad` | squad-creator-create.md | ✅ Hecho | Crear nuevo squad |
| `*validate-squad` | squad-creator-validate.md | ✅ Hecho | Validar estructura |
| `*list-squads` | squad-creator-list.md | ✅ Hecho | Listar squads locales |
| `*migrate-squad` | squad-creator-migrate.md | ✅ Hecho | Migrar formato legacy |
| `*download-squad` | squad-creator-download.md | ⏳ Placeholder | Descargar desde registro |
| `*publish-squad` | squad-creator-publish.md | ⏳ Placeholder | Publicar a aiox-squads |
| `*sync-squad-synkra` | squad-creator-sync-synkra.md | ⏳ Placeholder | Sincronizar al marketplace |

### Scripts Existentes

| Script | Archivo | Propósito |
|--------|------|---------|
| SquadLoader | squad-loader.js | Resolver y cargar manifiestos |
| SquadValidator | squad-validator.js | Validar contra schema |
| SquadGenerator | squad-generator.js | Generar estructura de squad |
| SquadDesigner | squad-designer.js | Diseñar desde docs |
| SquadMigrator | squad-migrator.js | Migrar formato legacy |
| SquadDownloader | squad-downloader.js | Descargar desde registro |
| SquadPublisher | squad-publisher.js | Publicar a aiox-squads |

---

## Análisis de Brechas

### Cobertura Actual del Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DEL SQUAD                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. DISEÑAR      *design-squad            ✅ Cubierto           │
│       ↓                                                         │
│  2. CREAR        *create-squad            ✅ Cubierto           │
│       ↓                                                         │
│  3. VALIDAR      *validate-squad          ✅ Cubierto           │
│       ↓                                                         │
│  4. MEJORAR      ??? (FALTANTE)           ❌ BRECHA             │
│       ↓                                                         │
│  5. DISTRIBUIR   *publish-squad           ⏳ Placeholder        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Capacidades Faltantes

| Capacidad | Descripción | Impacto |
|-----------|-------------|---------|
| **Analizar Squad** | Escanear squad existente, listar componentes, identificar oportunidades | No se puede entender qué contiene un squad |
| **Agregar Componentes** | Agregar nuevos agentes/tareas/plantillas/herramientas incrementalmente | Debe recrearse squad para agregar componentes |
| **Modificar Componentes** | Editar componentes existentes | Sin flujo de trabajo guiado |
| **Eliminar Componentes** | Eliminar componentes no usados | Limpieza manual requerida |
| **Integración de Historias** | Vincular mejoras a historias oficiales | Sin trazabilidad |

### Componentes del Squad (del schema)

| Componente | Directorio | Propósito | ¿Se Puede Agregar? |
|-----------|-----------|---------|---------------|
| tasks | tasks/ | Definiciones de tareas (¡task-first!) | ❌ Sin tarea |
| agents | agents/ | Personas de agentes | ❌ Sin tarea |
| workflows | workflows/ | Flujos de trabajo multi-paso | ❌ Sin tarea |
| checklists | checklists/ | Listas de verificación de validación | ❌ Sin tarea |
| templates | templates/ | Plantillas de documentos | ❌ Sin tarea |
| tools | tools/ | Herramientas personalizadas (.js) | ❌ Sin tarea |
| scripts | scripts/ | Scripts de automatización | ❌ Sin tarea |
| data | data/ | Archivos de datos estáticos | ❌ Sin tarea |

---

## Análisis del Recorrido del Usuario

### Actual (Problemático)

```
Usuario: "Quiero agregar un nuevo agente a mi squad existente"

1. Usuario crea manualmente archivo de agente en agents/
2. Usuario actualiza manualmente squad.yaml components.agents[]
3. Usuario ejecuta *validate-squad (podría fallar)
4. Usuario corrige problemas manualmente
5. Sin documentación de lo que se agregó
6. Sin vínculo a ninguna historia
```

### Deseado (Con Nuevas Tareas)

```
Usuario: "Quiero agregar un nuevo agente a mi squad existente"

1. Usuario ejecuta *analyze-squad my-squad
   → Muestra estructura actual, componentes, sugerencias

2. Usuario ejecuta *extend-squad my-squad
   → Interactivo: "¿Qué te gustaría agregar?"
   → Opciones: agent, task, template, tool, workflow, checklist, script, data
   → Creación guiada con plantillas
   → Actualización automática de squad.yaml
   → Validación automática

3. Opcionalmente vincula a historia vía flag --story SQS-XX
```

---

## Historias Relacionadas

| Historia | Estado | Relevancia |
|-------|--------|-----------|
| SQS-4 | ✅ Hecho | Agente Squad Creator (base) |
| SQS-9 | ✅ Hecho | Squad Designer (design-squad) |
| SQS-10 | ✅ Hecho | Referencia de Config de Proyecto |
| **SQS-11** | 📋 Propuesta | Tareas Analyze & Extend de Squad |

---

## Referencia de Patrón: analyze-project-structure.md

La tarea existente `analyze-project-structure.md` proporciona un buen patrón:

1. **Elicitación** - Preguntar qué feature agregar
2. **Escaneo** - Escanear estructura del proyecto
3. **Análisis de Patrones** - Identificar patrones existentes
4. **Recomendaciones** - Generar sugerencias
5. **Documentos de Salida** - Crear docs de análisis

Este patrón puede adaptarse para análisis de squads.

---

## Patrones Técnicos Detectados

### Distribución de Lenguajes
- **TypeScript:** Principal para scripts
- **JavaScript:** Herramientas y scripts de squad
- **Markdown:** Definiciones de agentes/tareas

### Testing
- **Framework:** Jest
- **Cobertura:** >80% en scripts core
- **Ubicación:** `tests/unit/squad/`

### Configuración
- **Schema:** Validación JSON Schema
- **Manifiesto:** squad.yaml (YAML)
- **Herencia:** extend/override/none

---

## Resumen de Recomendaciones

1. **Crear tarea `*analyze-squad`** - Analizar estructura de squad existente
2. **Crear tarea `*extend-squad`** - Agregar componentes incrementalmente
3. **Crear script `squad-analyzer.js`** - Lógica core de análisis
4. **Crear script `squad-extender.js`** - Lógica de extensión
5. **Actualizar agente squad-creator.md** - Agregar nuevos comandos
6. **Vincular al sistema de historias** - Flag opcional --story

---

**Siguiente Documento:** [recommended-approach.md](./squad-improvement-recommended-approach.md)
