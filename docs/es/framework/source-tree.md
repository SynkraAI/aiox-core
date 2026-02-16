<!--
  Traducción: ES
  Original: /docs/en/framework/source-tree.md
  Última sincronización: 2026-01-26
-->

# Estructura del Árbol de Código Fuente AIOS

> 🌐 [EN](../../framework/source-tree.md) | [PT](../../pt/framework/source-tree.md) | **ES**

---

**Versión:** 2.0
**Última Actualización:** 2025-12-15
**Estado:** Estándar Oficial del Framework
**Repositorio:** SynkraAI/aios-core

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura Modular](#arquitectura-modular)
- [Core del Framework (.aios-core/)](#core-del-framework-aios-core)
- [Detalles de Módulos](#detalles-de-módulos)
- [Documentación (docs/)](#documentación-docs)
- [Sistema de Squads](#sistema-de-squads)
- [Convenciones de Nomenclatura de Archivos](#convenciones-de-nomenclatura-de-archivos)
- [Dónde Colocar Nuevos Archivos](#dónde-colocar-nuevos-archivos)

---

## Descripción General

AIOS utiliza una **arquitectura modular** con clara separación de responsabilidades:

1. **Core del Framework** (`.aios-core/`) - Componentes portables del framework organizados por dominio
2. **Workspace del Proyecto** (raíz) - Implementación específica del proyecto

**Filosofía:**

- **Organización orientada al dominio** - Componentes agrupados por función
- **Portabilidad** - Los componentes del framework funcionan en todos los proyectos
- **Separación de responsabilidades** - Límites claros entre módulos

---

## Arquitectura Modular

```
aios-core/                             # Proyecto raíz
├── .aios-core/                        # Core del framework (modular)
│   ├── cli/                           # Comandos CLI y utilidades
│   ├── core/                          # Esenciales del framework
│   ├── data/                          # Archivos de datos compartidos
│   ├── development/                   # Assets de desarrollo (agentes, tareas, workflows)
│   ├── docs/                          # Documentación interna del framework
│   ├── elicitation/                   # Motores de elicitación
│   ├── infrastructure/                # Herramientas y scripts de infraestructura
│   ├── manifests/                     # Manifiestos de instalación
│   ├── product/                       # Assets PM/PO (templates, checklists)
│   ├── quality/                       # Esquemas de quality gates
│   ├── scripts/                       # Scripts de utilidad
│   └── core-config.yaml               # Configuración del framework
│
├── docs/                              # Documentación pública
│   ├── architecture/                  # Documentación de arquitectura
│   ├── framework/                     # Estándares oficiales del framework
│   ├── guides/                        # Guías prácticas
│   ├── installation/                  # Guías de instalación
│   └── community/                     # Documentación de comunidad
│
├── templates/                         # Templates de proyecto
│   └── squad/                         # Template de Squad (ver docs/guides/squads-guide.md)
│
├── bin/                               # Ejecutables CLI
│   └── aios.js                        # Punto de entrada principal CLI
│
├── tools/                             # Herramientas de build y utilidad
│   ├── cli.js                         # Constructor CLI
│   └── installer/                     # Scripts de instalación
│
├── tests/                             # Suites de tests
│   ├── unit/                          # Tests unitarios
│   ├── integration/                   # Tests de integración
│   └── e2e/                           # Tests end-to-end
│
├── .claude/                           # Configuración de Claude Code
│   ├── CLAUDE.md                      # Instrucciones del proyecto
│   ├── commands/                      # Comandos slash de agentes
│   └── rules/                         # Reglas del IDE
│
├── index.js                           # Punto de entrada principal
├── package.json                       # Manifiesto del paquete
└── README.md                          # README del proyecto
```

---

## Core del Framework (.aios-core/)

**Propósito:** Componentes portables del framework organizados por dominio para clara separación de responsabilidades.

### Estructura de Directorios (v2.0 Modular)

```
.aios-core/
├── cli/                               # Sistema CLI
│   ├── commands/                      # Implementaciones de comandos CLI
│   │   ├── generate/                  # Comandos de generación de código
│   │   ├── manifest/                  # Gestión de manifiestos
│   │   ├── mcp/                       # Comandos de herramientas MCP
│   │   ├── metrics/                   # Métricas de calidad
│   │   ├── migrate/                   # Herramientas de migración
│   │   ├── qa/                        # Comandos QA
│   │   └── workers/                   # Workers en segundo plano
│   └── utils/                         # Utilidades CLI
│
├── core/                              # Esenciales del Framework
│   ├── config/                        # Sistema de configuración
│   ├── data/                          # Base de conocimiento core
│   ├── docs/                          # Documentación core
│   ├── elicitation/                   # Motor de prompting interactivo
│   ├── manifest/                      # Procesamiento de manifiestos
│   ├── mcp/                           # Orquestación MCP
│   ├── migration/                     # Utilidades de migración
│   ├── quality-gates/                 # Validadores de quality gates
│   ├── registry/                      # Registro de servicios
│   ├── session/                       # Gestión de estado en runtime
│   └── utils/                         # Utilidades core
│
├── data/                              # Datos Compartidos
│   └── aios-kb.md                     # Base de conocimiento AIOS
│
├── development/                       # Assets de Desarrollo
│   ├── agents/                        # Definiciones de agentes (11 agentes core)
│   │   ├── aios-master.md             # Orquestador maestro
│   │   ├── dev.md                     # Agente desarrollador
│   │   ├── qa.md                      # Agente ingeniero QA
│   │   ├── architect.md               # Agente arquitecto de sistemas
│   │   ├── po.md                      # Agente Product Owner
│   │   ├── pm.md                      # Agente Product Manager
│   │   ├── sm.md                      # Agente Scrum Master
│   │   ├── analyst.md                 # Agente Analista de Negocios
│   │   ├── ux-design-expert.md        # Agente Diseñador UX
│   │   ├── data-engineer.md           # Agente Ingeniero de Datos
│   │   └── devops.md                  # Agente DevOps
│   ├── agent-teams/                   # Configuraciones de equipos de agentes
│   ├── tasks/                         # Workflows de tareas (60+ tareas)
│   ├── workflows/                     # Workflows multi-paso
│   └── scripts/                       # Scripts de desarrollo
│
├── docs/                              # Documentación Interna
│   └── standards/                     # Estándares del framework
│
├── elicitation/                       # Motores de Elicitación
│   ├── agent-elicitation.js           # Elicitación de creación de agentes
│   ├── task-elicitation.js            # Elicitación de creación de tareas
│   └── workflow-elicitation.js        # Elicitación de creación de workflows
│
├── infrastructure/                    # Infraestructura
│   ├── integrations/                  # Integraciones externas
│   │   └── pm-adapters/               # Adaptadores de herramientas PM (ClickUp, GitHub, Jira)
│   ├── scripts/                       # Scripts de infraestructura
│   │   ├── documentation-integrity/   # Sistema de integridad de docs
│   │   └── llm-routing/               # Utilidades de routing LLM
│   ├── templates/                     # Templates de infraestructura
│   │   ├── core-config/               # Templates de configuración
│   │   ├── github-workflows/          # Templates CI/CD
│   │   ├── gitignore/                 # Templates gitignore
│   │   └── project-docs/              # Templates de documentación de proyecto
│   ├── tests/                         # Tests de infraestructura
│   └── tools/                         # Integraciones de herramientas
│       ├── cli/                       # Wrappers de herramientas CLI
│       ├── local/                     # Herramientas locales
│       └── mcp/                       # Configuraciones de servidor MCP
│
├── manifests/                         # Manifiestos de Instalación
│   └── schema/                        # Esquemas de manifiestos
│
├── product/                           # Assets PM/PO
│   ├── checklists/                    # Checklists de validación
│   │   ├── po-master-checklist.md     # Validación PO
│   │   ├── story-draft-checklist.md   # Validación de draft de story
│   │   ├── architect-checklist.md     # Revisión de arquitectura
│   │   └── change-checklist.md        # Gestión de cambios
│   ├── data/                          # Datos específicos de PM
│   └── templates/                     # Templates de documentos
│       ├── engine/                    # Motor de templates
│       ├── ide-rules/                 # Templates de reglas IDE
│       ├── story-tmpl.yaml            # Template de story
│       ├── prd-tmpl.yaml              # Template de PRD
│       └── epic-tmpl.md               # Template de epic
│
├── quality/                           # Sistema de Calidad
│   └── schemas/                       # Esquemas de quality gates
│
├── scripts/                           # Scripts Raíz
│   └── ...                            # Scripts de utilidad
│
├── core-config.yaml                   # Configuración del framework
├── install-manifest.yaml              # Manifiesto de instalación
├── user-guide.md                      # Guía de usuario
└── working-in-the-brownfield.md       # Guía de brownfield
```

### Patrones de Archivos

```yaml
Agents:
  Location: .aios-core/development/agents/
  Format: Markdown with YAML frontmatter
  Naming: {agent-name}.md (kebab-case)
  Example: dev.md, qa.md, architect.md

Tasks:
  Location: .aios-core/development/tasks/
  Format: Markdown workflow
  Naming: {task-name}.md (kebab-case)
  Example: create-next-story.md, develop-story.md

Templates:
  Location: .aios-core/product/templates/
  Format: YAML or Markdown
  Naming: {template-name}-tmpl.{yaml|md}
  Example: story-tmpl.yaml, prd-tmpl.md

Workflows:
  Location: .aios-core/development/workflows/
  Format: YAML
  Naming: {workflow-type}-{scope}.yaml
  Example: greenfield-fullstack.yaml, brownfield-service.yaml

Checklists:
  Location: .aios-core/product/checklists/
  Format: Markdown
  Naming: {checklist-name}-checklist.md
  Example: story-draft-checklist.md, architect-checklist.md

Core Utilities:
  Location: .aios-core/core/utils/
  Format: JavaScript (CommonJS)
  Naming: {utility-name}.js (kebab-case)
  Example: component-generator.js, story-manager.js

CLI Commands:
  Location: .aios-core/cli/commands/{category}/
  Format: JavaScript (CommonJS)
  Naming: {command-name}.js (kebab-case)
  Example: generate/agent.js, manifest/install.js

Infrastructure Scripts:
  Location: .aios-core/infrastructure/scripts/{category}/
  Format: JavaScript
  Naming: {script-name}.js (kebab-case)
  Example: documentation-integrity/link-verifier.js
```

---

## Documentación (docs/)

### Organización Actual

```
docs/
├── architecture/                      # ⚠️ Mixto: oficial + específico del proyecto
│   ├── coding-standards.md            # ✅ Oficial (migra a REPO 1)
│   ├── tech-stack.md                  # ✅ Oficial (migra a REPO 1)
│   ├── source-tree.md                 # ✅ Oficial (migra a REPO 1)
│   ├── decision-analysis-*.md         # Decisiones específicas del proyecto
│   ├── architectural-review-*.md      # Revisiones específicas del proyecto
│   └── mcp-*.md                       # Docs del framework (migra a REPO 1)
│
├── framework/                         # ⭐ NUEVO: Docs oficiales del framework (Q2 2026)
│   ├── coding-standards.md            # Estándares de codificación del framework
│   ├── tech-stack.md                  # Stack tecnológico del framework
│   ├── source-tree.md                 # Árbol de código fuente del framework
│   └── README.md                      # Aviso de migración
│
├── stories/                           # Stories de desarrollo
│   ├── aios migration/                # Stories de migración AIOS
│   │   ├── story-6.1.2.1.md
│   │   ├── story-6.1.2.2.md
│   │   ├── story-6.1.2.3.md
│   │   ├── story-6.1.2.4.md
│   │   └── story-6.1.2.5.md
│   └── ...                            # Otras stories
│
├── epics/                             # Planificación de epics
│   ├── epic-6.1-agent-identity-system.md
│   └── ...                            # Otros epics
│
├── decisions/                         # Architecture Decision Records
│   ├── decision-005-repository-restructuring-FINAL.md
│   └── ...                            # Otros ADRs
│
├── guides/                            # Guías prácticas
│   ├── git-workflow-guide.md
│   ├── migration-guide.md
│   └── ...                            # Otras guías
│
├── qa/                                # Artefactos QA
│   └── backlog-archive/               # Elementos QA archivados
│
├── prd/                               # Documentos de Requisitos de Producto
│   └── ...                            # Archivos PRD
│
├── planning/                          # Documentos de planificación
│   └── ...                            # Planes de sprint, roadmaps
│
├── standards/                         # Estándares del framework
│   └── AGENT-PERSONALIZATION-STANDARD-V1.md
│
└── STORY-BACKLOG.md                   # ⭐ Índice de backlog de stories
```

### Reorganización Propuesta (Story 6.1.2.6)

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
├── architecture/                      # Arquitectura específica del proyecto
│   ├── project-decisions/             # ✅ ADRs para este proyecto
│   │   ├── decision-005-repository-restructuring-FINAL.md
│   │   ├── architectural-review-contextual-agent-load.md
│   │   └── ...
│   └── diagrams/                      # Diagramas de arquitectura
│
├── stories/                           # Stories de desarrollo
│   ├── index.md                       # ⭐ Índice de stories (auto-generado)
│   ├── backlog.md                     # ⭐ Backlog de stories (oficial)
│   └── ...                            # Archivos de stories
│
├── epics/
├── guides/
├── qa/
├── prd/
└── standards/
```

---

## Sistema de Squads

> **Nota:** Los Squads reemplazaron el sistema legacy de "Squads" en OSR-8. Ver [Guía de Squads](../guides/squads-guide.md) para documentación completa.

### Descripción General

Los Squads son extensiones modulares que agregan capacidades especializadas a AIOS. A diferencia de los Squads deprecados, los Squads siguen una estructura de template estandarizada.

### Ubicación del Template de Squad

```
templates/squad/                       # Template de Squad para crear extensiones
├── squad.yaml                         # Template de manifiesto de Squad
├── package.json                       # Template de paquete NPM
├── README.md                          # Template de documentación
├── LICENSE                            # Template de licencia
├── .gitignore                         # Template de git ignore
├── agents/                            # Agentes específicos del Squad
│   └── example-agent.yaml
├── tasks/                             # Tareas específicas del Squad
│   └── example-task.yaml
├── workflows/                         # Workflows específicos del Squad
│   └── example-workflow.yaml
├── templates/                         # Templates específicos del Squad
│   └── example-template.md
└── tests/                             # Tests del Squad
    └── example-agent.test.js
```

### Creando un Nuevo Squad

```bash
# CLI futuro (planificado):
npx create-aios-squad my-squad-name

# Método actual:
cp -r templates/squad/ squads/my-squad-name/
# Luego personalizar squad.yaml y componentes
```

### Estructura del Manifiesto de Squad

```yaml
# squad.yaml
name: my-custom-squad
version: 1.0.0
description: Description of what this squad does
author: Your Name
license: MIT

# Components provided by this squad
agents:
  - custom-agent-1
  - custom-agent-2

tasks:
  - custom-task-1

workflows:
  - custom-workflow-1

# Dependencies
dependencies:
  aios-core: '>=2.1.0'
```

### Migración desde Squads

| Legacy (Deprecado)              | Actual (Squads)                 |
| ------------------------------- | ------------------------------- |
| Directorio `Squads/`            | Template `templates/squad/`     |
| Config `legacyPacksLocation` | Config `squadsTemplateLocation` |
| Manifiesto `pack.yaml`          | Manifiesto `squad.yaml`         |
| Carga directa                   | Creación basada en template     |

---

## Estructura Futura (Post-Migración Q2 2026)

**Decision 005 define 5 repositorios separados:**

### REPO 1: SynkraAI/aios-core (MIT)

```
aios-core/
├── .aios-core/                        # Assets del framework (modular v2.0)
│   ├── cli/                           # Comandos CLI y utilidades
│   ├── core/                          # Esenciales del framework
│   │   ├── config/                    # Sistema de configuración
│   │   ├── quality-gates/             # Validadores de calidad
│   │   └── utils/                     # Utilidades core
│   ├── development/                   # Assets de desarrollo
│   │   ├── agents/                    # Definiciones de agentes (11 core)
│   │   ├── tasks/                     # Workflows de tareas (60+)
│   │   └── workflows/                 # Workflows multi-paso
│   ├── infrastructure/                # Herramientas de infraestructura
│   │   ├── integrations/              # Adaptadores PM, herramientas
│   │   ├── scripts/                   # Scripts de automatización
│   │   └── templates/                 # Templates de infraestructura
│   ├── product/                       # Assets PM/PO
│   │   ├── checklists/                # Checklists de validación
│   │   └── templates/                 # Templates de documentos
│   └── ...
│
├── bin/                               # Puntos de entrada CLI
│   └── aios.js                        # CLI principal
│
├── tools/                             # Herramientas de build y utilidad
│   ├── cli.js                         # Constructor CLI
│   └── installer/                     # Scripts de instalación
│
├── docs/                              # Documentación del framework
│   ├── framework/                     # Estándares oficiales
│   ├── guides/                        # Guías prácticas
│   ├── installation/                  # Guías de setup
│   └── architecture/                  # Docs de arquitectura
│
├── templates/                         # Templates de proyecto
│   └── squad/                         # Template de Squad
│
├── tests/                             # Suites de tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── examples/                          # Proyectos de ejemplo
    ├── basic-agent/
    ├── vibecoder-demo/
    └── multi-agent-workflow/
```

### REPO 2: SynkraAI/squads (MIT)

```
squads/
├── verified/                          # Squads curados por AIOS
│   ├── github-devops/
│   ├── db-sage/
│   └── coderabbit-workflow/
│
├── community/                         # Envíos de la comunidad
│   ├── marketing-agency/
│   ├── sales-automation/
│   └── ...
│
├── templates/                         # Templates de Squad
│   ├── minimal-squad/
│   └── agent-squad/
│
└── tools/                             # Herramientas de desarrollo de Squad
    └── create-aios-squad/
```

### REPO 3: SynkraAI/mcp-ecosystem (Apache 2.0)

```
mcp-ecosystem/
├── presets/                           # Presets MCP (Docker MCP Toolkit)
│   ├── aios-dev/
│   ├── aios-research/
│   └── aios-docker/
│
├── mcps/                              # Configuraciones base MCP
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
├── partner-portal/                    # Plataforma Partner Success
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
├── emulator/                          # Motor de emulación MMOS
│   ├── mirror-agent/
│   └── dna-mental/
│
└── research/                          # Artefactos de investigación
    └── transcripts/
```

---

## Convenciones de Nomenclatura de Archivos

### Reglas Generales

```yaml
Directorios: kebab-case (minúsculas, separados por guion)
  ✅ .aios-core/
  ✅ Squads/
  ❌ .AIOS-Core/
  ❌ legacy-packs/

Archivos (Código): kebab-case con extensión
  ✅ agent-executor.js
  ✅ task-runner.js
  ❌ AgentExecutor.js
  ❌ taskRunner.js

Archivos (Docs): kebab-case con extensión .md
  ✅ coding-standards.md
  ✅ story-6.1.2.5.md
  ❌ CodingStandards.md
  ❌ Story_6_1_2_5.md

Archivos (Config): minúsculas o kebab-case
  ✅ package.json
  ✅ tsconfig.json
  ✅ core-config.yaml
  ❌ PackageConfig.json
```

### Casos Especiales

```yaml
Stories:
  Formato: story-{epic}.{story}.{substory}.md
  Ejemplo: story-6.1.2.5.md

Epics:
  Formato: epic-{number}-{name}.md
  Ejemplo: epic-6.1-agent-identity-system.md

Decisiones:
  Formato: decision-{number}-{name}.md
  Ejemplo: decision-005-repository-restructuring-FINAL.md

Templates:
  Formato: {name}-tmpl.{yaml|md}
  Ejemplo: story-tmpl.yaml, prd-tmpl.md

Checklists:
  Formato: {name}-checklist.md
  Ejemplo: architect-checklist.md
```

---

## Dónde Colocar Nuevos Archivos

### Matriz de Decisión

```yaml
# Estoy creando un nuevo agente:
Ubicación: .aios-core/development/agents/{agent-name}.md
Ejemplo: .aios-core/development/agents/security-expert.md

# Estoy creando una nueva tarea:
Ubicación: .aios-core/development/tasks/{task-name}.md
Ejemplo: .aios-core/development/tasks/deploy-to-production.md

# Estoy creando un nuevo workflow:
Ubicación: .aios-core/development/workflows/{workflow-name}.yaml
Ejemplo: .aios-core/development/workflows/continuous-deployment.yaml

# Estoy creando un nuevo template:
Ubicación: .aios-core/product/templates/{template-name}-tmpl.{yaml|md}
Ejemplo: .aios-core/product/templates/deployment-plan-tmpl.yaml

# Estoy creando un nuevo checklist:
Ubicación: .aios-core/product/checklists/{checklist-name}-checklist.md
Ejemplo: .aios-core/product/checklists/security-review-checklist.md

# Estoy creando un comando CLI:
Ubicación: .aios-core/cli/commands/{category}/{command-name}.js
Ejemplo: .aios-core/cli/commands/generate/workflow.js

# Estoy creando una utilidad core:
Ubicación: .aios-core/core/utils/{utility-name}.js
Ejemplo: .aios-core/core/utils/performance-monitor.js

# Estoy creando un script de infraestructura:
Ubicación: .aios-core/infrastructure/scripts/{category}/{script-name}.js
Ejemplo: .aios-core/infrastructure/scripts/llm-routing/router.js

# Estoy agregando un adaptador de herramienta PM:
Ubicación: .aios-core/infrastructure/integrations/pm-adapters/{adapter-name}.js
Ejemplo: .aios-core/infrastructure/integrations/pm-adapters/monday-adapter.js

# Estoy escribiendo una story (docs de dev internos - gitignored):
Ubicación: docs/stories/{sprint-context}/{story-file}.md
Ejemplo: docs/stories/v4.0.4/sprint-6/story-6.14-new-feature.md

# Estoy creando documentación oficial del framework:
Ubicación: docs/framework/{doc-name}.md
Ejemplo: docs/framework/agent-development-guide.md

# Estoy creando un test:
Ubicación: tests/{type}/{test-name}.test.js
Ejemplo: tests/unit/agent-executor.test.js

# Estoy creando un squad:
Ubicación: Copiar templates/squad/ a tu directorio de squads
Ejemplo: squads/devops-automation/ (personalizar desde template)
```

---

## Directorios Especiales

### Directorio .ai/ (NUEVO - Story 6.1.2.6)

```
.ai/                                   # Artefactos de sesión AI
├── decision-log-6.1.2.5.md            # Log de decisiones modo Yolo
├── decision-log-6.1.2.6.md            # Otro log de decisiones
└── session-{date}-{agent}.md          # Transcripciones de sesión (opcional)
```

**Propósito:** Rastrear decisiones impulsadas por AI durante sesiones de desarrollo (especialmente modo yolo)

**Auto-generado:** Sí (cuando modo yolo está habilitado)

### Directorio outputs/

```
outputs/                               # Salidas de runtime (gitignored)
├── minds/                             # Clones cognitivos MMOS
│   └── pedro_valerio/
│       ├── system-prompt.md
│       ├── kb/
│       └── artifacts/
│
└── architecture-map/                  # Análisis de arquitectura
    ├── MASTER-RELATIONSHIP-MAP.json
    └── schemas/
```

**Propósito:** Artefactos de runtime no commiteados a git

---

## Documentos Relacionados

- [Estándares de Codificación](./coding-standards.md)
- [Stack Tecnológico](./tech-stack.md)

---

## Historial de Versiones

| Versión | Fecha      | Cambios                                                                                                                    | Autor            |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1.0     | 2025-01-15 | Documentación inicial del árbol de código fuente                                                                           | Aria (architect) |
| 1.1     | 2025-12-14 | Actualizada org a SynkraAI, reemplazado Squads con sistema de Squads [Story 6.10]                                          | Dex (dev)        |
| 2.0     | 2025-12-15 | Actualización mayor para reflejar arquitectura modular (cli/, core/, development/, infrastructure/, product/) [Story 6.13] | Pax (PO)         |

---

_Este es un estándar oficial del framework AIOS. Toda colocación de archivos debe seguir esta estructura._
