<!-- Traducción: ES | Original: /docs/en/architecture/high-level-architecture.md | Sincronización: 2026-01-26 -->

# Arquitectura de Alto Nivel AIOS v4

> 🌐 [EN](../../architecture/high-level-architecture.md) | [PT](../../pt/architecture/high-level-architecture.md) | **ES**

---

**Versión:** 2.1.0
**Última Actualización:** 2025-12-09
**Estado:** Documento Oficial de Arquitectura

---

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Diagrama de Arquitectura](#diagrama-de-arquitectura)
- [Arquitectura Modular](#arquitectura-modular)
- [Estrategia Multi-Repo](#estrategia-multi-repo)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura de Directorios](#estructura-de-directorios)
- [Componentes Clave](#componentes-clave)
- [Quality Gates](#quality-gates)

---

## Visión General

**AIOS (AI Operating System)** es un framework sofisticado para orquestar agentes de IA, workers y humanos en flujos de trabajo complejos de desarrollo de software. La versión 2.1 introduce una arquitectura modular con 4 módulos, estrategia multi-repositorio y quality gates de 3 capas.

### Capacidades Clave v4.2

| Capacidad                     | Descripción                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------- |
| **11 Agentes Especializados** | Dev, QA, Architect, PM, PO, SM, Analyst, Data Engineer, DevOps, UX, Master    |
| **115+ Tareas Ejecutables**   | Creación de stories, generación de código, testing, deployment, documentación |
| **52+ Plantillas**            | PRDs, stories, documentos de arquitectura, reglas IDE, quality gates          |
| **Arquitectura de 4 Módulos** | Core, Development, Product, Infrastructure                                    |
| **Quality Gates de 3 Capas**  | Pre-commit, Automatización PR, Revisión Humana                                |
| **Estrategia Multi-Repo**     | 3 repositorios públicos + 2 privados                                          |
| **Sistema de Squad**          | Equipos modulares de agentes IA (ETL, Creator, MMOS)                          |

---

## Diagrama de Arquitectura

### Arquitectura de 4 Módulos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FRAMEWORK AIOS v4                                 │
│                     ═══════════════════                                 │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        CLI / HERRAMIENTAS                        │   │
│   │  (aios agents, aios tasks, aios squads, aios workflow)          │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                │                                        │
│          ┌────────────────────┼────────────────────┐                   │
│          │                    │                    │                   │
│          ▼                    ▼                    ▼                   │
│   ┌──────────────┐   ┌──────────────┐   ┌─────────────────┐           │
│   │ DEVELOPMENT  │   │   PRODUCT    │   │ INFRASTRUCTURE  │           │
│   │   MÓDULO     │   │   MÓDULO     │   │    MÓDULO       │           │
│   │ ──────────── │   │ ──────────── │   │ ─────────────── │           │
│   │ • 11 Agentes │   │ • 52+ Plntls │   │ • 55+ Scripts   │           │
│   │ • 115+ Tareas│   │ • 11 Chklsts │   │ • Configs Tool  │           │
│   │ • 7 Wrkflws  │   │ • PM Data    │   │ • Integraciones │           │
│   │ • Dev Scripts│   │              │   │ • PM Adapters   │           │
│   └──────┬───────┘   └──────┬───────┘   └────────┬────────┘           │
│          │                  │                    │                     │
│          └──────────────────┼────────────────────┘                     │
│                             │                                          │
│                             ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                      MÓDULO CORE                                 │   │
│   │                      ═══════════                                 │   │
│   │                                                                  │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │   │
│   │   │   Config    │  │  Registry   │  │    Quality Gates        │ │   │
│   │   │   System    │  │  (Service   │  │    (3 Capas)            │ │   │
│   │   │             │  │  Discovery) │  │                         │ │   │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────┘ │   │
│   │                                                                  │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │   │
│   │   │    MCP      │  │   Session   │  │     Elicitation         │ │   │
│   │   │   System    │  │   Manager   │  │       Engine            │ │   │
│   │   │             │  │             │  │                         │ │   │
│   │   └─────────────┘  └─────────────┘  └─────────────────────────┘ │   │
│   │                                                                  │   │
│   │   SIN DEPENDENCIAS INTERNAS (Capa de Fundación)                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Relaciones entre Módulos

```
┌────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE DEPENDENCIAS DE MÓDULOS                     │
│                                                                         │
│                         ┌──────────────┐                                │
│                         │  CLI/Tools   │                                │
│                         └──────┬───────┘                                │
│                                │                                        │
│              ┌─────────────────┼─────────────────┐                      │
│              │                 │                 │                      │
│              ▼                 ▼                 ▼                      │
│     ┌────────────────┐ ┌────────────────┐ ┌────────────────┐           │
│     │  development/  │ │    product/    │ │infrastructure/ │           │
│     │                │ │                │ │                │           │
│     │  • Agentes     │ │  • Plantillas  │ │  • Scripts     │           │
│     │  • Tareas      │ │  • Checklists  │ │  • Herramientas│           │
│     │  • Workflows   │ │  • PM Data     │ │  • Integraciones│          │
│     └───────┬────────┘ └───────┬────────┘ └───────┬────────┘           │
│             │                  │                  │                     │
│             │          depende solo de           │                     │
│             └──────────────────┼──────────────────┘                     │
│                                │                                        │
│                                ▼                                        │
│                      ┌────────────────┐                                 │
│                      │     core/      │                                 │
│                      │                │                                 │
│                      │  SIN DEPEND.   │                                 │
│                      │  INTERNAS      │                                 │
│                      └────────────────┘                                 │
│                                                                         │
│   REGLAS:                                                               │
│   • core/ no tiene dependencias internas                                │
│   • development/, product/, infrastructure/ dependen SOLO de core/      │
│   • Las dependencias circulares están PROHIBIDAS                        │
│   • CLI/Tools puede acceder a cualquier módulo                          │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Estrategia Multi-Repo

### Estructura de Repositorios

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ORGANIZACIÓN SYNKRA                                  │
│                                                                         │
│   REPOSITORIOS PÚBLICOS                                                 │
│   ═════════════════════                                                 │
│                                                                         │
│   ┌────────────────────┐     ┌────────────────────┐                    │
│   │  SynkraAI/         │     │  SynkraAI/         │                    │
│   │  aios-core         │     │  aios-squads       │                    │
│   │  (MIT)  │◄────│  (MIT)             │                    │
│   │                    │     │                    │                    │
│   │  • Framework Core  │     │  • ETL Squad       │                    │
│   │  • 11 Agentes Base │     │  • Creator Squad   │                    │
│   │  • Quality Gates   │     │  • MMOS Squad      │                    │
│   │  • Hub Discusiones │     │                    │                    │
│   └────────────────────┘     └────────────────────┘                    │
│            │                                                            │
│            │ dependencia opcional                                       │
│            ▼                                                            │
│   ┌────────────────────┐                                               │
│   │  SynkraAI/         │                                               │
│   │  mcp-ecosystem     │                                               │
│   │  (Apache 2.0)      │                                               │
│   │                    │                                               │
│   │  • Docker MCP      │                                               │
│   │  • Configs IDE     │                                               │
│   │  • MCP Presets     │                                               │
│   └────────────────────┘                                               │
│                                                                         │
│   REPOSITORIOS PRIVADOS                                                 │
│   ═════════════════════                                                 │
│                                                                         │
│   ┌────────────────────┐     ┌────────────────────┐                    │
│   │  SynkraAI/mmos     │     │  SynkraAI/         │                    │
│   │  (Proprietary+NDA) │     │  certified-partners│                    │
│   │                    │     │  (Proprietary)     │                    │
│   │  • MMOS Minds      │     │  • Premium Squads  │                    │
│   │  • DNA Mental™     │     │  • Portal Partners │                    │
│   └────────────────────┘     └────────────────────┘                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Alcance de Paquetes npm

| Paquete               | Registry    | Licencia       |
| --------------------- | ----------- | -------------- |
| `@aios/core`          | npm público | MIT            |
| `@aios/squad-etl`     | npm público | MIT            |
| `@aios/squad-creator` | npm público | MIT            |
| `@aios/squad-mmos`    | npm público | MIT            |
| `@aios/mcp-presets`   | npm público | Apache 2.0     |

---

## Stack Tecnológico

| Categoría       | Tecnología            | Versión | Notas                             |
| --------------- | --------------------- | ------- | --------------------------------- |
| Runtime         | Node.js               | ≥18.0.0 | Plataforma para todos los scripts |
| Lenguaje        | TypeScript/JavaScript | ES2022  | Desarrollo principal              |
| Definición      | Markdown + YAML       | N/A     | Agentes, tareas, plantillas       |
| Gestor Paquetes | npm                   | ≥9.0.0  | Gestión de dependencias           |
| Quality Gates   | Husky + lint-staged   | Latest  | Hooks pre-commit                  |
| Code Review     | CodeRabbit            | Latest  | Revisión potenciada por IA        |
| CI/CD           | GitHub Actions        | N/A     | Workflows de automatización       |

---

## Estructura de Directorios

### Estructura Actual (v4)

```
aios-core/
├── .aios-core/                    # Capa del framework
│   ├── core/                      # Módulo core (fundación)
│   │   ├── config/                # Gestión de configuración
│   │   ├── registry/              # Service Discovery
│   │   ├── quality-gates/         # Sistema QG de 3 capas
│   │   ├── mcp/                   # Configuración global MCP
│   │   └── session/               # Gestión de sesiones
│   │
│   ├── development/               # Módulo de desarrollo
│   │   ├── agents/                # 11 definiciones de agentes
│   │   ├── tasks/                 # 115+ definiciones de tareas
│   │   ├── workflows/             # 7 definiciones de workflows
│   │   └── scripts/               # Scripts de desarrollo
│   │
│   ├── product/                   # Módulo de producto
│   │   ├── templates/             # 52+ plantillas
│   │   ├── checklists/            # 11 checklists
│   │   └── data/                  # Base de conocimiento PM
│   │
│   ├── infrastructure/            # Módulo de infraestructura
│   │   ├── scripts/               # 55+ scripts de infraestructura
│   │   ├── tools/                 # CLI, MCP, configs locales
│   │   └── integrations/          # PM adapters
│   │
│   └── docs/                      # Documentación del framework
│       └── standards/             # Documentos de estándares
│
├── docs/                          # Documentación del proyecto
│   ├── stories/                   # Stories de desarrollo
│   ├── architecture/              # Documentos de arquitectura
│   └── epics/                     # Planificación de épicas
│
├── squads/                        # Implementaciones de Squad
│   ├── etl/                       # ETL Squad
│   ├── creator/                   # Creator Squad
│   └── mmos-mapper/               # MMOS Squad
│
├── .github/                       # Automatización GitHub
│   ├── workflows/                 # Workflows CI/CD
│   ├── ISSUE_TEMPLATE/            # Plantillas de issues
│   └── CODEOWNERS                 # Propiedad del código
│
└── .husky/                        # Git hooks (Capa 1 QG)
```

---

## Componentes Clave

### Resumen de Módulos

| Módulo             | Ruta                         | Propósito                | Contenidos Clave                    |
| ------------------ | ---------------------------- | ------------------------ | ----------------------------------- |
| **Core**           | `.aios-core/core/`           | Fundación del framework  | Config, Registry, QG, MCP, Session  |
| **Development**    | `.aios-core/development/`    | Artefactos de desarrollo | Agentes, Tareas, Workflows, Scripts |
| **Product**        | `.aios-core/product/`        | Artefactos PM            | Plantillas, Checklists, Data        |
| **Infrastructure** | `.aios-core/infrastructure/` | Config del sistema       | Scripts, Tools, Integraciones       |

### Sistema de Agentes

| Agente | ID              | Arquetipo    | Responsabilidad            |
| ------ | --------------- | ------------ | -------------------------- |
| Dex    | `dev`           | Constructor  | Implementación de código   |
| Quinn  | `qa`            | Guardián     | Aseguramiento de calidad   |
| Aria   | `architect`     | Arquitecto   | Arquitectura técnica       |
| Nova   | `po`            | Visionario   | Backlog de producto        |
| Kai    | `pm`            | Equilibrador | Estrategia de producto     |
| River  | `sm`            | Facilitador  | Facilitación de procesos   |
| Zara   | `analyst`       | Explorador   | Análisis de negocio        |
| Dara   | `data-engineer` | Arquitecto   | Ingeniería de datos        |
| Felix  | `devops`        | Optimizador  | CI/CD y operaciones        |
| Uma    | `ux-expert`     | Creador      | Experiencia de usuario     |
| Pax    | `aios-master`   | Orquestador  | Orquestación del framework |

---

## Quality Gates

### Sistema de Quality Gates de 3 Capas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     QUALITY GATES 3 CAPAS                               │
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │ CAPA 1: PRE-COMMIT (Local)                                        │ │
│   │ ══════════════════════════                                        │ │
│   │ • ESLint, Prettier, TypeScript                                    │ │
│   │ • Tests unitarios (rápidos)                                       │ │
│   │ • Herramienta: Husky + lint-staged                                │ │
│   │ • Bloqueante: No se puede hacer commit si falla                   │ │
│   │ • Issues detectados: 30%                                          │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                                ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │ CAPA 2: AUTOMATIZACIÓN PR (CI/CD)                                 │ │
│   │ ═════════════════════════════════                                 │ │
│   │ • Revisión IA CodeRabbit                                          │ │
│   │ • Tests de integración, análisis de cobertura                     │ │
│   │ • Escaneo de seguridad, benchmarks de rendimiento                 │ │
│   │ • Herramienta: GitHub Actions + CodeRabbit                        │ │
│   │ • Bloqueante: Checks requeridos para merge                        │ │
│   │ • Issues detectados: +50% adicional (80% total)                   │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                                ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │ CAPA 3: REVISIÓN HUMANA (Estratégica)                             │ │
│   │ ═════════════════════════════════════                             │ │
│   │ • Alineación arquitectónica                                       │ │
│   │ • Corrección de lógica de negocio                                 │ │
│   │ • Casos edge, calidad de documentación                            │ │
│   │ • Herramienta: Experiencia humana                                 │ │
│   │ • Bloqueante: Aprobación final requerida                          │ │
│   │ • Issues detectados: 20% final (100% total)                       │ │
│   └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│   RESULTADO: 80% de issues detectados automáticamente                   │
│           Tiempo de revisión humana: 30 min/PR (vs 2-4h en v2.0)       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Documentos Relacionados

- [Sistema de Módulos](./module-system.md) - Arquitectura detallada de módulos
- [ARCHITECTURE-INDEX.md](./ARCHITECTURE-INDEX.md) - Índice completo de documentación
- [AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md](../../../.aios-core/docs/standards/AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md) - Guía completa del framework

---

**Última Actualización:** 2025-12-09
**Versión:** 2.1.0
**Responsable:** @architect (Aria)
