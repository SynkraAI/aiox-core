<!-- Traduccion: ES | Original: /docs/en/architecture/source-tree.md | Sincronizacion: 2026-01-26 -->

> ⚠️ **OBSOLETO**: Este archivo se mantiene solo por compatibilidad hacia atras.
>
> **Version oficial:** [docs/framework/source-tree.md](../framework/source-tree.md)
>
> Este archivo sera eliminado en Q2 2026 despues de la consolidacion completa a `docs/framework/`.

---

# Estructura del Arbol de Codigo Fuente AIOX

> 🌐 [EN](../../architecture/source-tree.md) | [PT](../../pt/architecture/source-tree.md) | **ES**

---

**Version:** 1.1
**Ultima Actualizacion:** 2025-12-14
**Estado:** OBSOLETO - Ver docs/framework/source-tree.md
**Aviso de Migracion:** Este documento migrara al repositorio `SynkraAI/aiox-core` en Q2 2026 (ver Decision 005)

---

## 📋 Tabla de Contenidos

- [Descripcion General](#descripcion-general)
- [Estructura Actual (aiox-core Brownfield)](#estructura-actual-aiox-core-brownfield)
- [Framework Core (.aiox-core/)](#framework-core-aiox-core)
- [Documentacion (docs/)](#documentacion-docs)
- [Sistema de Squads](#sistema-de-squads)
- [Estructura Futura (Post-Migracion Q2 2026)](#estructura-futura-post-migracion-q2-2026)
- [Convenciones de Nomenclatura de Archivos](#convenciones-de-nomenclatura-de-archivos)
- [Donde Colocar Nuevos Archivos](#donde-colocar-nuevos-archivos)

---

## Descripcion General

AIOX usa una **arquitectura de doble capa**:

1. **Framework Core** (`.aiox-core/`) - Componentes portables del framework
2. **Workspace del Proyecto** (raiz) - Implementacion especifica del proyecto

**Filosofia:**

- Los componentes del framework son **portables** (se mueven entre proyectos)
- Los archivos del proyecto son **especificos** (implementacion brownfield)
- Clara **separacion de responsabilidades** (framework vs proyecto)

---

## Estructura Actual (aiox-core Brownfield)

```
aiox-core/                             # Raiz (proyecto brownfield)
├── .aiox-core/                        # Framework core (portable)
│   ├── core/                          # Esenciales del framework (v4)
│   │   ├── config/                    # Sistema de configuracion
│   │   ├── data/                      # Base de conocimiento core
│   │   ├── docs/                      # Documentacion core
│   │   ├── elicitation/               # Motor de prompts interactivos
│   │   ├── session/                   # Gestion de estado en runtime
│   │   └── utils/                     # Utilidades core
│   ├── product/                       # Assets de PM/PO (v4)
│   │   ├── templates/                 # Plantillas de documentos (52+ archivos)
│   │   ├── checklists/                # Checklists de validacion (6 archivos)
│   │   └── data/                      # Datos especificos de PM (6 archivos)
│   ├── agents/                        # Definiciones de agentes
│   ├── tasks/                         # Workflows de tareas
│   ├── workflows/                     # Workflows multi-paso
│   ├── scripts/                       # Scripts de utilidad
│   ├── tools/                         # Integraciones de herramientas
│   └── core-config.yaml               # Configuracion del framework
│
├── docs/                              # Documentacion
│   ├── architecture/                  # Decisiones de arquitectura + docs oficiales
│   ├── framework/                     # ⭐ NUEVO: Docs oficiales del framework
│   ├── stories/                       # Historias de desarrollo
│   ├── epics/                         # Planificacion de epics
│   ├── decisions/                     # ADRs (Architecture Decision Records)
│   ├── guides/                        # Guias practicas
│   ├── qa/                            # Reportes de QA
│   └── prd/                           # Requisitos de producto
│
├── templates/                         # Plantillas del proyecto
│   └── squad/                         # Plantilla de squad para extensiones (ver docs/guides/squads-guide.md)
│
├── bin/                               # Ejecutables CLI
│   ├── aiox-core.js           # Punto de entrada principal del CLI
│   └── aiox-minimal.js                # CLI minimo
│
├── tools/                             # Herramientas de build y utilidad
│   ├── cli.js                         # Constructor de CLI
│   ├── package-builder.js             # Constructor de paquetes
│   └── installer/                     # Scripts de instalacion
│
├── tests/                             # Suites de tests
│   ├── unit/                          # Tests unitarios
│   ├── integration/                   # Tests de integracion
│   └── e2e/                           # Tests end-to-end
│
├── .claude/                           # Configuracion IDE Claude Code
│   ├── settings.json                  # Configuracion del proyecto
│   ├── CLAUDE.md                      # Instrucciones del proyecto
│   └── commands/                      # Slash commands (agentes)
│
├── outputs/                           # Salidas de runtime
│   ├── minds/                         # Clones cognitivos MMOS
│   └── architecture-map/              # Analisis de arquitectura
│
├── .ai/                               # ⭐ NUEVO: Artefactos de sesion AI
│   └── decision-log-{story-id}.md     # Logs de decision en modo yolo
│
├── index.js                           # Punto de entrada principal (CommonJS)
├── index.esm.js                       # Punto de entrada ES Module
├── index.d.ts                         # Definiciones de tipos TypeScript
├── package.json                       # Manifiesto del paquete
├── tsconfig.json                      # Configuracion de TypeScript
├── .eslintrc.json                     # Configuracion de ESLint
├── .prettierrc                        # Configuracion de Prettier
└── README.md                          # README del proyecto
```

---

## Framework Core (.aiox-core/)

**Proposito:** Componentes portables del framework que funcionan en cualquier proyecto AIOX.

### Estructura de Directorios

```
.aiox-core/
├── agents/                            # 145 definiciones de agentes
│   ├── aiox-master.md                 # Orquestador maestro
│   ├── dev.md                         # Agente desarrollador
│   ├── qa.md                          # Agente ingeniero QA
│   ├── architect.md                   # Agente arquitecto de sistema
│   ├── po.md                          # Agente Product Owner
│   ├── pm.md                          # Agente Product Manager
│   ├── sm.md                          # Agente Scrum Master
│   ├── analyst.md                     # Agente Business Analyst
│   ├── ux-expert.md                   # Agente UX Designer
│   ├── data-engineer.md               # Agente Data Engineer
│   ├── devops.md                      # Agente DevOps
│   ├── db-sage.md                     # Agente arquitecto de base de datos
│   └── .deprecated/                   # Agentes archivados
│
├── tasks/                             # 60 workflows de tareas
│   ├── create-next-story.md           # Workflow de creacion de historia
│   ├── develop-story.md               # Workflow de desarrollo de historia
│   ├── validate-next-story.md         # Workflow de validacion de historia
│   ├── review-story.md                # Workflow de revision de historia
│   ├── apply-qa-fixes.md              # Workflow de correccion QA
│   ├── execute-checklist.md           # Ejecucion de checklist
│   ├── document-project.md            # Documentacion de proyecto
│   ├── create-doc.md                  # Creacion de documento
│   ├── shard-doc.md                   # Fragmentacion de documento
│   └── ...                            # 50+ tareas mas
│
├── templates/                         # 20 plantillas de documentos
│   ├── story-tmpl.yaml                # Plantilla de historia v2.0
│   ├── design-story-tmpl.yaml         # Plantilla de historia de diseno v1.0
│   ├── prd-tmpl.yaml                  # Plantilla de PRD
│   ├── epic-tmpl.md                   # Plantilla de epic
│   ├── architecture-tmpl.yaml         # Plantilla de arquitectura
│   ├── fullstack-architecture-tmpl.yaml  # Plantilla de arquitectura full-stack
│   ├── brownfield-architecture-tmpl.yaml # Plantilla de arquitectura brownfield
│   ├── schema-design-tmpl.yaml        # Plantilla de esquema de base de datos
│   └── ...                            # 12+ plantillas mas
│
├── workflows/                         # 6 workflows multi-paso
│   ├── greenfield-fullstack.yaml      # Workflow full-stack greenfield
│   ├── greenfield-service.yaml        # Workflow de servicio greenfield
│   ├── greenfield-ui.yaml             # Workflow UI greenfield
│   ├── brownfield-fullstack.yaml      # Workflow full-stack brownfield
│   ├── brownfield-service.yaml        # Workflow de servicio brownfield
│   └── brownfield-ui.yaml             # Workflow UI brownfield
│
├── checklists/                        # 6 checklists de validacion
│   ├── po-master-checklist.md         # Checklist de validacion PO
│   ├── story-draft-checklist.md       # Validacion de borrador de historia
│   ├── architect-checklist.md         # Checklist de revision de arquitectura
│   ├── qa-checklist.md                # Checklist de QA
│   ├── pm-checklist.md                # Checklist de PM
│   └── change-checklist.md            # Checklist de gestion de cambios
│
├── data/                              # 6 archivos de base de conocimiento
│   ├── aiox-kb.md                     # Base de conocimiento AIOX
│   ├── technical-preferences.md       # Preferencias de tech stack
│   ├── elicitation-methods.md         # Tecnicas de elicitacion
│   ├── brainstorming-techniques.md    # Metodos de brainstorming
│   ├── test-levels-framework.md       # Niveles de testing
│   └── test-priorities-matrix.md      # Priorizacion de tests
│
├── scripts/                           # 54 scripts de utilidad
│   ├── component-generator.js         # Scaffolding de componentes
│   ├── elicitation-engine.js          # Elicitacion interactiva
│   ├── story-manager.js               # Gestion del ciclo de vida de historias
│   ├── yaml-validator.js              # Validacion de YAML
│   ├── usage-analytics.js             # Analiticas de uso del framework
│   └── ...                            # 49+ utilidades mas
│
├── tools/                             # Integraciones de herramientas
│   ├── mcp/                           # Configs de servidor MCP
│   │   ├── clickup-direct.yaml        # Integracion ClickUp
│   │   ├── context7.yaml              # Integracion Context7
│   │   └── exa-direct.yaml            # Integracion busqueda Exa
│   ├── cli/                           # Wrappers de herramientas CLI
│   │   ├── github-cli.yaml            # Wrapper GitHub CLI
│   │   └── railway-cli.yaml           # Wrapper Railway CLI
│   └── local/                         # Herramientas locales
│
├── elicitation/                       # 3 motores de elicitacion
│   ├── agent-elicitation.js           # Elicitacion de creacion de agente
│   ├── task-elicitation.js            # Elicitacion de creacion de tarea
│   └── workflow-elicitation.js        # Elicitacion de creacion de workflow
│
├── agent-teams/                       # Configuraciones de equipos de agentes
│   └── ...                            # Definiciones de equipos
│
├── core-config.yaml                   # ⭐ Configuracion del framework
├── install-manifest.yaml              # Manifiesto de instalacion
├── user-guide.md                      # Guia de usuario
└── working-in-the-brownfield.md       # Guia de desarrollo brownfield
```

### Patrones de Archivos

```yaml
Agentes:
  Ubicacion: .aiox-core/agents/
  Formato: Markdown con frontmatter YAML
  Nomenclatura: {nombre-agente}.md (kebab-case)
  Ejemplo: developer.md, qa-engineer.md

Tareas:
  Ubicacion: .aiox-core/tasks/
  Formato: Workflow Markdown
  Nomenclatura: {nombre-tarea}.md (kebab-case)
  Ejemplo: create-next-story.md, develop-story.md

Plantillas:
  Ubicacion: .aiox-core/product/templates/
  Formato: YAML o Markdown
  Nomenclatura: {nombre-plantilla}-tmpl.{yaml|md}
  Ejemplo: story-tmpl.yaml, prd-tmpl.md

Workflows:
  Ubicacion: .aiox-core/workflows/
  Formato: YAML
  Nomenclatura: {tipo-workflow}-{alcance}.yaml
  Ejemplo: greenfield-fullstack.yaml, brownfield-service.yaml

Checklists:
  Ubicacion: .aiox-core/product/checklists/
  Formato: Markdown
  Nomenclatura: {nombre-checklist}-checklist.md
  Ejemplo: story-draft-checklist.md, architect-checklist.md

Utilidades:
  Ubicacion: .aiox-core/utils/
  Formato: JavaScript (CommonJS)
  Nomenclatura: {nombre-utilidad}.js (kebab-case)
  Ejemplo: component-generator.js, story-manager.js
```

---

## Documentacion (docs/)

### Organizacion Actual

```
docs/
├── architecture/                      # ⚠️ Mixto: oficial + especifico del proyecto
│   ├── coding-standards.md            # ✅ Oficial (migra a REPO 1)
│   ├── tech-stack.md                  # ✅ Oficial (migra a REPO 1)
│   ├── source-tree.md                 # ✅ Oficial (migra a REPO 1)
│   ├── decision-analysis-*.md         # Decisiones especificas del proyecto
│   ├── architectural-review-*.md      # Revisiones especificas del proyecto
│   └── mcp-*.md                       # Docs del framework (migra a REPO 1)
│
├── framework/                         # ⭐ NUEVO: Docs oficiales del framework (Q2 2026)
│   ├── coding-standards.md            # Estandares de codigo del framework
│   ├── tech-stack.md                  # Tech stack del framework
│   ├── source-tree.md                 # Arbol de codigo del framework
│   └── README.md                      # Aviso de migracion
│
├── stories/                           # Historias de desarrollo
│   ├── aiox migration/                # Historias de migracion AIOX
│   │   ├── story-6.1.2.1.md
│   │   ├── story-6.1.2.2.md
│   │   ├── story-6.1.2.3.md
│   │   ├── story-6.1.2.4.md
│   │   └── story-6.1.2.5.md
│   └── ...                            # Otras historias
│
├── epics/                             # Planificacion de epics
│   ├── epic-6.1-agent-identity-system.md
│   └── ...                            # Otros epics
│
├── decisions/                         # Architecture Decision Records
│   ├── decision-005-repository-restructuring-FINAL.md
│   └── ...                            # Otros ADRs
│
├── guides/                            # Guias practicas
│   ├── git-workflow-guide.md
│   ├── migration-guide.md
│   └── ...                            # Otras guias
│
├── qa/                                # Artefactos de QA
│   └── backlog-archive/               # Items de QA archivados
│
├── prd/                               # Documentos de Requisitos de Producto
│   └── ...                            # Archivos PRD
│
├── planning/                          # Documentos de planificacion
│   └── ...                            # Planes de sprint, roadmaps
│
├── standards/                         # Estandares del framework
│   └── AGENT-PERSONALIZATION-STANDARD-V1.md
│
└── STORY-BACKLOG.md                   # ⭐ Indice de backlog de historias
```

### Reorganizacion Propuesta (Story 6.1.2.6)

```
docs/
├── framework/                         # ✅ Docs oficiales del framework
│   ├── coding-standards.md
│   ├── tech-stack.md
│   ├── source-tree.md
│   ├── agent-spec.md
│   ├── task-spec.md
│   └── workflow-spec.md
│
├── architecture/                      # Arquitectura especifica del proyecto
│   ├── project-decisions/             # ✅ ADRs para este proyecto
│   │   ├── decision-005-repository-restructuring-FINAL.md
│   │   ├── architectural-review-contextual-agent-load.md
│   │   └── ...
│   └── diagrams/                      # Diagramas de arquitectura
│
├── stories/                           # Historias de desarrollo
│   ├── index.md                       # ⭐ Indice de historias (auto-generado)
│   ├── backlog.md                     # ⭐ Backlog de historias (oficial)
│   └── ...                            # Archivos de historias
│
├── epics/
├── guides/
├── qa/
├── prd/
└── standards/
```

---

## Sistema de Squads

> **Nota:** Los Squads reemplazaron al sistema legacy "Paquetes de Expansion" en OSR-8. Ver [Guia de Squads](../guides/squads-guide.md) para documentacion completa.

### Descripcion General

Los Squads son extensiones modulares que agregan capacidades especializadas a AIOX. A diferencia de los Paquetes de Expansion obsoletos, los Squads siguen una estructura de plantilla estandarizada.

### Ubicacion de Plantilla de Squad

```
templates/squad/                       # Plantilla de squad para crear extensiones
├── squad.yaml                         # Plantilla de manifiesto de squad
├── package.json                       # Plantilla de paquete NPM
├── README.md                          # Plantilla de documentacion
├── LICENSE                            # Plantilla de licencia
├── .gitignore                         # Plantilla de git ignore
├── agents/                            # Agentes especificos del squad
│   └── example-agent.yaml
├── tasks/                             # Tareas especificas del squad
│   └── example-task.yaml
├── workflows/                         # Workflows especificos del squad
│   └── example-workflow.yaml
├── templates/                         # Plantillas especificas del squad
│   └── example-template.md
└── tests/                             # Tests del squad
    └── example-agent.test.js
```

### Creando un Nuevo Squad

```bash
# CLI futuro (planificado):
npx create-aiox-squad my-squad-name

# Metodo actual:
cp -r templates/squad/ squads/my-squad-name/
# Luego personalizar squad.yaml y componentes
```

### Estructura del Manifiesto de Squad

```yaml
# squad.yaml
name: my-custom-squad
version: 1.0.0
description: Descripcion de lo que hace este squad
author: Tu Nombre
license: MIT

# Componentes proporcionados por este squad
agents:
  - custom-agent-1
  - custom-agent-2

tasks:
  - custom-task-1

workflows:
  - custom-workflow-1

# Dependencias
dependencies:
  aiox-core: '>=2.1.0'
```

### Migracion desde Paquetes de Expansion

| Legacy (Obsoleto)               | Actual (Squads)                 |
| ------------------------------- | ------------------------------- |
| Directorio `Squads/`            | Plantilla `templates/squad/`    |
| Config `legacyPacksLocation` | Config `squadsTemplateLocation` |
| Manifiesto `pack.yaml`          | Manifiesto `squad.yaml`         |
| Carga directa                   | Creacion basada en plantilla    |

---

## Estructura Futura (Post-Migracion Q2 2026)

**La Decision 005 define 5 repositorios separados:**

### REPO 1: SynkraAI/aiox-core (MIT)

```
aiox-core/
├── src/                               # Codigo fuente
│   ├── core/                          # Motor de orquestacion core
│   │   ├── agent-executor.js
│   │   ├── task-runner.js
│   │   └── workflow-orchestrator.js
│   ├── integrations/                  # Integraciones externas
│   │   ├── mcp/                       # Orquestacion MCP
│   │   └── ide/                       # Integracion IDE
│   └── cli/                           # Interfaz CLI
│
├── .aiox-core/                        # Assets del framework (estructura actual)
│   ├── agents/
│   ├── tasks/
│   ├── templates/
│   └── ...
│
├── docs/                              # Documentacion del framework
│   ├── getting-started/
│   ├── core-concepts/
│   ├── integrations/
│   └── api/
│
├── examples/                          # Proyectos de ejemplo
│   ├── basic-agent/
│   ├── vibecoder-demo/
│   └── multi-agent-workflow/
│
└── tests/                             # Suites de tests
    ├── unit/
    ├── integration/
    └── e2e/
```

### REPO 2: SynkraAI/squads (MIT)

```
squads/
├── verified/                          # Squads curados por AIOX
│   ├── github-devops/
│   ├── db-sage/
│   └── coderabbit-workflow/
│
├── community/                         # Contribuciones de la comunidad
│   ├── marketing-agency/
│   ├── sales-automation/
│   └── ...
│
├── templates/                         # Plantillas de squad
│   ├── minimal-squad/
│   └── agent-squad/
│
└── tools/                             # Herramientas de desarrollo de squads
    └── create-aiox-squad/
```

### REPO 3: SynkraAI/mcp-ecosystem (Apache 2.0)

```
mcp-ecosystem/
├── presets/                           # Presets MCP (Docker MCP Toolkit)
│   ├── aiox-dev/
│   ├── aiox-research/
│   └── aiox-docker/
│
├── mcps/                              # Configs base de MCP
│   ├── exa/
│   ├── context7/
│   └── desktop-commander/
│
└── ide-configs/                       # Integraciones IDE
    ├── claude-code/
    ├── gemini-cli/
    └── cursor/
```

### REPO 4: SynkraAI/certified-partners (Privado)

```
certified-partners/
├── premium-packs/                     # Squads Premium
│   ├── enterprise-deployment/
│   └── advanced-devops/
│
├── partner-portal/                    # Plataforma de Exito de Partners
│   ├── dashboard/
│   └── analytics/
│
└── marketplace/                       # Plataforma de marketplace
    ├── api/
    └── web/
```

### REPO 5: SynkraAI/mmos (Privado + NDA)

```
mmos/
├── minds/                             # 34 clones cognitivos
│   ├── pedro-valerio/
│   ├── paul-graham/
│   └── ...
│
├── emulator/                          # Motor de emulacion MMOS
│   ├── mirror-agent/
│   └── dna-mental/
│
└── research/                          # Artefactos de investigacion
    └── transcripts/
```

---

## Convenciones de Nomenclatura de Archivos

### Reglas Generales

```yaml
Directorios: kebab-case (minusculas, separadas por guion)
  ✅ .aiox-core/
  ✅ Squads/
  ❌ .AIOX-Core/
  ❌ legacy-packs/

Archivos (Codigo): kebab-case con extension
  ✅ agent-executor.js
  ✅ task-runner.js
  ❌ AgentExecutor.js
  ❌ taskRunner.js

Archivos (Docs): kebab-case con extension .md
  ✅ coding-standards.md
  ✅ story-6.1.2.5.md
  ❌ CodingStandards.md
  ❌ Story_6_1_2_5.md

Archivos (Config): minusculas o kebab-case
  ✅ package.json
  ✅ tsconfig.json
  ✅ core-config.yaml
  ❌ PackageConfig.json
```

### Casos Especiales

```yaml
Historias:
  Formato: story-{epic}.{historia}.{subhistoria}.md
  Ejemplo: story-6.1.2.5.md

Epics:
  Formato: epic-{numero}-{nombre}.md
  Ejemplo: epic-6.1-agent-identity-system.md

Decisiones:
  Formato: decision-{numero}-{nombre}.md
  Ejemplo: decision-005-repository-restructuring-FINAL.md

Plantillas:
  Formato: {nombre}-tmpl.{yaml|md}
  Ejemplo: story-tmpl.yaml, prd-tmpl.md

Checklists:
  Formato: {nombre}-checklist.md
  Ejemplo: architect-checklist.md
```

---

## Donde Colocar Nuevos Archivos

### Matriz de Decisiones

```yaml
# Estoy creando un nuevo agente:
Ubicacion: .aiox-core/agents/{nombre-agente}.md
Ejemplo: .aiox-core/agents/security-expert.md

# Estoy creando una nueva tarea:
Ubicacion: .aiox-core/tasks/{nombre-tarea}.md
Ejemplo: .aiox-core/tasks/deploy-to-production.md

# Estoy creando un nuevo workflow:
Ubicacion: .aiox-core/workflows/{nombre-workflow}.yaml
Ejemplo: .aiox-core/workflows/continuous-deployment.yaml

# Estoy creando una nueva plantilla:
Ubicacion: .aiox-core/product/templates/{nombre-plantilla}-tmpl.{yaml|md}
Ejemplo: .aiox-core/product/templates/deployment-plan-tmpl.yaml

# Estoy escribiendo una historia:
Ubicacion: docs/stories/{contexto-epic}/{archivo-historia}.md
Ejemplo: docs/stories/aiox migration/story-6.1.2.6.md

# Estoy documentando una decision de arquitectura:
Ubicacion: docs/architecture/project-decisions/{archivo-decision}.md
Ejemplo: docs/architecture/project-decisions/decision-006-auth-strategy.md

# Estoy creando documentacion oficial del framework:
Ubicacion: docs/framework/{nombre-doc}.md
Ejemplo: docs/framework/agent-development-guide.md

# Estoy creando un script de utilidad:
Ubicacion: .aiox-core/utils/{nombre-utilidad}.js
Ejemplo: .aiox-core/utils/performance-monitor.js

# Estoy creando un test:
Ubicacion: tests/{tipo}/{nombre-test}.test.js
Ejemplo: tests/unit/agent-executor.test.js

# Estoy creando un squad:
Ubicacion: Copiar templates/squad/ a tu directorio de squads
Ejemplo: squads/devops-automation/ (personalizar desde plantilla)
```

---

## Directorios Especiales

### Directorio .ai/ (NUEVO - Story 6.1.2.6)

```
.ai/                                   # Artefactos de sesion AI
├── decision-log-6.1.2.5.md            # Log de decision modo yolo
├── decision-log-6.1.2.6.md            # Otro log de decision
└── session-{fecha}-{agente}.md        # Transcripciones de sesion (opcional)
```

**Proposito:** Rastrear decisiones impulsadas por AI durante sesiones de desarrollo (especialmente modo yolo)

**Auto-generado:** Si (cuando modo yolo esta habilitado)

### Directorio outputs/

```
outputs/                               # Salidas de runtime (gitignored)
├── minds/                             # Clones cognitivos MMOS
│   └── pedro_valerio/
│       ├── system-prompt.md
│       ├── kb/
│       └── artifacts/
│
└── architecture-map/                  # Analisis de arquitectura
    ├── MASTER-RELATIONSHIP-MAP.json
    └── schemas/
```

**Proposito:** Artefactos de runtime no commiteados a git

---

## Documentos Relacionados

- [Estandares de Codigo](./coding-standards.md)
- [Tech Stack](./tech-stack.md)

---

## Historial de Versiones

| Version | Fecha      | Cambios                                                                                           | Autor            |
| ------- | ---------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| 1.0     | 2025-01-15 | Documentacion inicial de arbol de codigo                                                          | Aria (architect) |
| 1.1     | 2025-12-14 | Actualizada org a SynkraAI, reemplazados Paquetes de Expansion con sistema de Squads [Story 6.10] | Dex (dev)        |

---

_Este es un estandar oficial del framework AIOX. Toda colocacion de archivos debe seguir esta estructura._
