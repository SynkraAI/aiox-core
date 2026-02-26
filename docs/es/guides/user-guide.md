<!--
  Traduccion: ES
  Original: /docs/guides/user-guide.md
  Ultima sincronizacion: 2026-01-29
-->

# Guia de Usuario AIOS

> **ES** | [EN](../../guides/user-guide.md)

---

Guia completa para usar Synkra AIOS - el Sistema Orquestado por IA para Desarrollo Full Stack.

**Version:** 2.1.0
**Ultima Actualizacion:** 2026-01-28

---

## Inicio Rapido

### Prerrequisitos

Antes de usar AIOS, asegurate de tener:

- **Node.js** version 18.0.0 o superior
- **npm** version 8.0.0 o superior
- **Git** para control de versiones
- Una clave API de proveedor de IA (Anthropic, OpenAI, o compatible)

### Instalacion

```bash
# Nuevo proyecto (Greenfield)
npx aios-core init my-project

# Proyecto existente (Brownfield)
cd existing-project
npx aios-core install
```

### Primeros Pasos

```bash
# Navegar a tu proyecto
cd my-project

# Listar agentes disponibles
aios agents list

# Activar un agente
@dev

# Obtener ayuda
*help
```

---

## Conceptos Fundamentales

### Filosofia

> **"La Estructura es Sagrada. El Tono es Flexible."**

AIOS proporciona estructura orquestada mientras permite flexibilidad en la comunicacion. Esto significa:

- **Fijo:** Posiciones de plantillas, orden de secciones, formatos de metricas, estructura de archivos, workflows
- **Flexible:** Mensajes de estado, eleccion de vocabulario, uso de emojis, personalidad, tono

### La Diferencia AIOS

| Desarrollo IA Tradicional       | AIOS                                       |
| ------------------------------- | ------------------------------------------ |
| Agentes no coordinados          | 11 agentes especializados con roles claros |
| Resultados inconsistentes       | Workflows estructurados con quality gates  |
| Contexto perdido entre sesiones | Memoria persistente y aprendizaje          |
| Reinventar la rueda             | Tasks, workflows y squads reutilizables    |

---

## Agentes

AIOS incluye 11 agentes especializados, cada uno con un rol y personalidad distintos:

| Agente    | ID               | Arquetipo    | Responsabilidad            |
| --------- | ---------------- | ------------ | -------------------------- |
| **Dex**   | `@dev`           | Constructor  | Implementacion de codigo   |
| **Quinn** | `@qa`            | Guardian     | Aseguramiento de calidad   |
| **Aria**  | `@architect`     | Arquitecto   | Arquitectura tecnica       |
| **Nova**  | `@po`            | Visionario   | Backlog del producto       |
| **Kai**   | `@pm`            | Equilibrador | Estrategia del producto    |
| **River** | `@sm`            | Facilitador  | Facilitacion de procesos   |
| **Zara**  | `@analyst`       | Explorador   | Analisis de negocio        |
| **Dara**  | `@data-engineer` | Arquitecto   | Ingenieria de datos        |
| **Felix** | `@devops`        | Optimizador  | CI/CD y operaciones        |
| **Uma**   | `@ux-expert`     | Creador      | Experiencia de usuario     |
| **Pax**   | `@aios-master`   | Orquestador  | Orquestacion del framework |

### Activacion de Agentes

```bash
# Activar un agente usando sintaxis @
@dev                # Activar Dex (Desarrollador)
@qa                 # Activar Quinn (QA)
@architect          # Activar Aria (Arquitecto)
@aios-master        # Activar Pax (Orquestador)

# Comandos de agentes usan prefijo *
*help               # Mostrar comandos disponibles
*task <name>        # Ejecutar task especifica
*exit               # Desactivar agente
```

### Contexto del Agente

Cuando un agente esta activo:

- Seguir la persona y experiencia especifica de ese agente
- Usar los patrones de workflow designados del agente
- Mantener la perspectiva del agente durante toda la interaccion

---

## Tasks

Las Tasks son el punto de entrada principal en AIOS. Todo es una task.

### Arquitectura Task-First

```
User Request --> Task --> Agent Execution --> Output
                  |
             Workflow (si multi-paso)
```

### Ejecutando Tasks

```bash
# Ejecutar una task especifica
*task develop-story --story=1.1

# Listar tasks disponibles
aios tasks list

# Obtener ayuda de task
*task --help
```

### Categorias de Tasks

| Categoria         | Ejemplos                                |
| ----------------- | --------------------------------------- |
| **Desarrollo**    | develop-story, code-review, refactor    |
| **Calidad**       | run-tests, validate-code, security-scan |
| **Documentacion** | generate-docs, update-readme            |
| **Workflow**      | create-story, manage-sprint             |

---

## Workflows

Los workflows orquestan multiples tasks y agentes para operaciones complejas.

### Workflows Disponibles

| Workflow                 | Caso de Uso                    | Agentes Involucrados |
| ------------------------ | ------------------------------ | -------------------- |
| `greenfield-fullstack`   | Nuevo proyecto full-stack      | Todos los agentes    |
| `brownfield-integration` | Agregar AIOS a existente       | dev, architect       |
| `fork-join`              | Ejecucion de tasks en paralelo | Multiples            |
| `organizer-worker`       | Ejecucion delegada             | po, dev              |
| `data-pipeline`          | Workflows ETL                  | data-engineer, qa    |

### Ejecutando Workflows

```bash
# Iniciar un workflow
aios workflow greenfield-fullstack

# Con parametros
aios workflow brownfield-integration --target=./existing-project
```

---

## Squads

Los Squads son equipos modulares de agentes IA que extienden la funcionalidad de AIOS.

### Que es un Squad?

Un squad es un paquete autocontenido que contiene:

| Componente    | Proposito                                    |
| ------------- | -------------------------------------------- |
| **Agents**    | Personas IA especificas del dominio          |
| **Tasks**     | Workflows ejecutables                        |
| **Workflows** | Orquestaciones multi-paso                    |
| **Config**    | Estandares de codigo, tech stack             |
| **Templates** | Plantillas de generacion de documentos       |
| **Tools**     | Integraciones de herramientas personalizadas |

### Niveles de Distribucion

```
Nivel 1: LOCAL        --> ./squads/           (Privado)
Nivel 2: AIOS-SQUADS  --> github.com/SynkraAI (Publico/Gratis)
Nivel 3: SYNKRA API   --> api.synkra.dev      (Marketplace)
```

### Usando Squads

```bash
# Listar squads disponibles
aios squads list

# Descargar un squad
aios squads download etl-squad

# Crear tu propio squad
@squad-creator
*create-squad my-custom-squad
```

### Squads Oficiales

| Squad           | Descripcion                           |
| --------------- | ------------------------------------- |
| `etl-squad`     | Recoleccion y transformacion de datos |
| `creator-squad` | Utilidades de generacion de contenido |

---

## Uso Basico

### Estructura del Proyecto

```
my-project/
├── .aios-core/                # Configuracion del framework
│   ├── development/agents/    # Definiciones de agentes
│   ├── development/tasks/     # Workflows de tasks
│   ├── product/templates/     # Plantillas de documentos
│   └── product/checklists/    # Checklists de validacion
├── docs/
│   ├── stories/               # Stories de desarrollo
│   ├── architecture/          # Arquitectura del sistema
│   └── guides/                # Guias de usuario
├── squads/                    # Squads locales
└── src/                       # Codigo fuente de la aplicacion
```

### Comandos Comunes

```bash
# Comandos de AIOS Master
*help                # Mostrar comandos disponibles
*create-story        # Crear nueva story
*task {name}         # Ejecutar task especifica
*workflow {name}     # Ejecutar workflow

# Comandos de Desarrollo
npm run dev          # Iniciar desarrollo
npm test             # Ejecutar tests
npm run lint         # Verificar estilo de codigo
npm run build        # Construir proyecto
```

### Desarrollo Basado en Stories

1. **Crear una story** - Usar `*create-story` para definir requisitos
2. **Trabajar desde stories** - Todo desarrollo comienza con una story en `docs/stories/`
3. **Actualizar progreso** - Marcar checkboxes cuando las tasks completen: `[ ]` --> `[x]`
4. **Rastrear cambios** - Mantener la seccion File List en la story
5. **Seguir criterios** - Implementar exactamente lo que los criterios de aceptacion especifican

---

## Configuracion

### Archivo de Configuracion Principal

La configuracion principal esta en `.aios-core/core/config/`:

```yaml
# aios.config.yaml
version: 2.1.0
projectName: my-project

features:
  - agents
  - tasks
  - workflows
  - squads
  - quality-gates

ai:
  provider: anthropic
  model: claude-3-opus

environment: development
```

### Variables de Entorno

```bash
# Configuracion del Proveedor de IA
ANTHROPIC_API_KEY=your-anthropic-api-key
# o
OPENAI_API_KEY=your-openai-api-key

# Configuraciones del Framework
NODE_ENV=development
AIOS_DEBUG=false
```

### Integracion con IDE

AIOS soporta multiples IDEs. La configuracion se sincroniza a traves de:

- Claude Code (`.claude/`)
- Cursor (`.cursor/`)
- VS Code (`.vscode/`)

```bash
# Sincronizar agentes a tu IDE
npm run sync:ide
```

---

## Solucion de Problemas

### Problemas Comunes

**El agente no se activa**

```bash
# Verificar que el agente existe
ls .aios-core/development/agents/

# Verificar configuracion
aios doctor
```

**La ejecucion de task falla**

```bash
# Verificar definicion de task
cat .aios-core/development/tasks/{task-name}.md

# Ejecutar con salida detallada
*task {name} --verbose
```

**Problemas de memoria/contexto**

```bash
# Limpiar cache
rm -rf .aios-core/core/cache/*

# Reconstruir indice
aios rebuild
```

### Obteniendo Ayuda

- **GitHub Discussions**: [github.com/SynkraAI/aios-core/discussions](https://github.com/SynkraAI/aios-core/discussions)
- **Issue Tracker**: [github.com/SynkraAI/aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Discord**: [Unete a nuestro servidor](https://discord.gg/gk8jAdXWmj)

---

## Proximos Pasos

### Ruta de Aprendizaje

1. **Inicio Rapido** - Seguir esta guia para comenzar
2. **Referencia de Agentes** - Aprender sobre las capacidades de cada agente: [Guia de Referencia de Agentes](../agent-reference-guide.md)
3. **Arquitectura** - Entender el sistema: [Vision General de Arquitectura](../architecture/ARCHITECTURE-INDEX.md)
4. **Squads** - Extender funcionalidad: [Guia de Squads](./squads-guide.md)

### Temas Avanzados

- [Guia de Quality Gates](./quality-gates.md)
- [Estrategia Multi-Repo](../../architecture/multi-repo-strategy.md)
- [Integracion MCP](./mcp-global-setup.md)
- [Integracion con IDE](../../ide-integration.md)

---

## Mejores Practicas

### 1. Comenzar con Stories

Siempre crear una story antes de implementar funcionalidades:

```bash
@aios-master
*create-story
```

### 2. Usar el Agente Correcto

Elegir el agente apropiado para cada task:

| Task               | Agente     |
| ------------------ | ---------- |
| Escribir codigo    | @dev       |
| Revisar codigo     | @qa        |
| Disenar sistema    | @architect |
| Definir requisitos | @po        |

### 3. Seguir Quality Gates

AIOS implementa quality gates de 3 capas:

1. **Capa 1 (Local)**: Pre-commit hooks, linting, verificacion de tipos
2. **Capa 2 (CI/CD)**: Tests automatizados, review de CodeRabbit
3. **Capa 3 (Humano)**: Review de arquitectura, aprobacion final

### 4. Mantener Contexto

Mantener contexto a traves de sesiones mediante:

- Usar desarrollo basado en stories
- Actualizar checkboxes de progreso
- Documentar decisiones en stories

### 5. Aprovechar Squads

No reinventar la rueda - verificar squads existentes:

```bash
aios squads search {keyword}
```

---

## Documentacion Relacionada

- [Comenzando](../getting-started.md)
- [Guia de Instalacion](../installation/README.md)
- [Guia de Referencia de Agentes](../agent-reference-guide.md)
- [Vision General de Arquitectura](../architecture/ARCHITECTURE-INDEX.md)
- [Guia de Squads](./squads-guide.md)
- [Solucion de Problemas](../troubleshooting.md)

---

_Guia de Usuario Synkra AIOS v4.0_
