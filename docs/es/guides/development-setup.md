# Guia de Configuracion para Desarrollo

> [EN](../../guides/development-setup.md) | [PT](../../pt/guides/development-setup.md) | **ES**

---

Guia completa para desarrolladores que quieren contribuir al proyecto Synkra AIOX.

**Version:** 1.0.0
**Ultima Actualizacion:** 2026-01-29

---

## Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Fork y Clonacion](#fork-y-clonacion)
3. [Configuracion del Entorno](#configuracion-del-entorno)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Ejecutar Tests](#ejecutar-tests)
6. [Agregar Nuevos Agentes](#agregar-nuevos-agentes)
7. [Crear Nuevas Tasks](#crear-nuevas-tasks)
8. [Crear Nuevos Workflows](#crear-nuevos-workflows)
9. [Estandares de Codigo](#estandares-de-codigo)
10. [Proceso de PR y Code Review](#proceso-de-pr-y-code-review)
11. [Debug y Solucion de Problemas](#debug-y-solucion-de-problemas)

---

## Prerrequisitos

Antes de comenzar, asegurate de tener instalado lo siguiente:

| Herramienta    | Version Minima  | Comando de Verificacion | Proposito          |
| -------------- | --------------- | ----------------------- | ------------------ |
| **Node.js**    | 18.0.0          | `node --version`        | Runtime JavaScript |
| **npm**        | 9.0.0           | `npm --version`         | Gestor de paquetes |
| **Git**        | 2.30+           | `git --version`         | Control de versiones |
| **GitHub CLI** | 2.0+            | `gh --version`          | Operaciones GitHub |

### Herramientas Recomendadas

| Herramienta          | Proposito                                   |
| -------------------- | ------------------------------------------- |
| **Claude Code**      | Desarrollo potenciado por IA con agentes AIOX |
| **VS Code / Cursor** | IDE con integracion AIOX                    |
| **Docker Desktop**   | Servidores MCP y herramientas containerizadas |

### Instalacion de Prerrequisitos

**macOS (Homebrew):**

```bash
# Instalar Node.js
brew install node@18

# Instalar GitHub CLI
gh auth login
```

**Windows (Chocolatey):**

```bash
# Instalar Node.js
choco install nodejs-lts

# Instalar GitHub CLI
choco install gh

# Autenticar GitHub CLI
gh auth login
```

**Linux (Ubuntu/Debian):**

```bash
# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar GitHub CLI
sudo apt install gh

# Autenticar GitHub CLI
gh auth login
```

---

## Fork y Clonacion

### Paso 1: Fork del Repositorio

1. Navega a [github.com/SynkraAI/aiox-core](https://github.com/SynkraAI/aiox-core)
2. Haz clic en el boton **Fork** en la esquina superior derecha
3. Selecciona tu cuenta de GitHub como destino

### Paso 2: Clonar tu Fork

```bash
# Clonar tu fork
git clone https://github.com/YOUR_USERNAME/aiox-core.git
cd aiox-core

# Agregar remote upstream
git remote add upstream https://github.com/SynkraAI/aiox-core.git

# Verificar remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/aiox-core.git (fetch)
# origin    https://github.com/YOUR_USERNAME/aiox-core.git (push)
# upstream  https://github.com/SynkraAI/aiox-core.git (fetch)
# upstream  https://github.com/SynkraAI/aiox-core.git (push)
```

### Paso 3: Mantenerse Actualizado

```bash
# Obtener ultimos cambios del upstream
git fetch upstream

# Mergear upstream main en tu main local
git checkout main
git merge upstream/main

# Pushear a tu fork
git push origin main
```

---

## Configuracion del Entorno

### Paso 1: Instalar Dependencias

```bash
# Instalar todas las dependencias
npm install

# Esto tambien:
# - Configura Husky git hooks (via script prepare)
# - Instala dependencias del workspace
```

### Paso 2: Variables de Entorno

Crea un archivo `.env` en la raiz del proyecto (este archivo esta en gitignore):

```bash
# Configuracion del Proveedor AI
ANTHROPIC_API_KEY=your-anthropic-api-key

# Opcional: Fallback OpenAI
OPENAI_API_KEY=your-openai-api-key

# Configuraciones del Framework
NODE_ENV=development
AIOX_DEBUG=false

# Opcional: Configuracion MCP
SYNKRA_API_TOKEN=your-synkra-token
```

### Paso 3: Verificar Instalacion

```bash
# Ejecutar suite de tests
npm test

# Verificar linting
npm run lint

# Verificar TypeScript
npm run typecheck

# Validar estructura del proyecto
npm run validate:structure
```

### Paso 4: Integracion con IDE (Opcional)

Sincroniza los agentes AIOX con tu IDE:

```bash
# Sincronizar con todos los IDEs soportados
npm run sync:ide

# Sincronizar con IDE especifico
npm run sync:ide:cursor

# Validar sincronizacion
npm run sync:ide:validate
```

---

## Estructura del Proyecto

Entendiendo la estructura de directorios de `aiox-core`:

```
aiox-core/
├── .aiox-core/                    # Fuente del framework (committed)
│   ├── core/                      # Utilidades core y configuracion
│   │   ├── config/                # Archivos de configuracion del framework
│   │   ├── docs/                  # Documentacion interna
│   │   └── registry/              # Registro de componentes
│   │
│   ├── development/               # Assets de desarrollo
│   │   ├── agents/                # Definiciones de agentes (*.md)
│   │   ├── checklists/            # Checklists de validacion
│   │   ├── scripts/               # Scripts utilitarios (JS)
│   │   ├── tasks/                 # Workflows de tasks (*.md)
│   │   └── workflows/             # Workflows multi-paso (*.yaml)
│   │
│   ├── infrastructure/            # Build y deployment
│   │   ├── scripts/               # IDE sync, validacion
│   │   └── config/                # Configuracion de infraestructura
│   │
│   └── product/                   # Assets de producto
│       ├── templates/             # Plantillas de documentos
│       └── checklists/            # Checklists de producto
│
├── .claude/                       # Configuracion de Claude Code
│   ├── commands/AIOX/agents/      # Comandos skill de agentes
│   ├── hooks/                     # Hooks de governance
│   └── rules/                     # Reglas de comportamiento AI
│
├── bin/                           # Puntos de entrada CLI
│   ├── aiox.js                    # CLI principal
│   └── aiox-minimal.js            # CLI minimo
│
├── docs/                          # Toda la documentacion
│   ├── architecture/              # Arquitectura del sistema
│   ├── guides/                    # Guias de usuario y desarrollador
│   ├── migration/                 # Guias de migracion
│   ├── prd/                       # Requerimientos de producto
│   └── stories/                   # Stories de desarrollo
│
├── packages/                      # Paquetes monorepo
│   └── */                         # Paquetes individuales
│
├── scripts/                       # Scripts de build y utilidades
│
├── squads/                        # Definiciones locales de squads
│
├── src/                           # Codigo fuente
│
├── tests/                         # Suites de tests
│   ├── health-check/              # Tests de health check
│   └── unit/                      # Tests unitarios
│
├── tools/                         # Herramientas CLI y utilidades
│
├── package.json                   # Manifiesto del proyecto
├── tsconfig.json                  # Configuracion TypeScript
├── eslint.config.mjs              # Configuracion ESLint
└── jest.config.js                 # Configuracion Jest
```

### Directorios Clave

| Directorio                          | Proposito                        | Cuando Modificar          |
| ----------------------------------- | -------------------------------- | ------------------------- |
| `.aiox-core/development/agents/`    | Personas y comportamientos de agentes | Agregar/modificar agentes |
| `.aiox-core/development/tasks/`     | Workflows de tasks ejecutables   | Agregar/modificar tasks   |
| `.aiox-core/development/workflows/` | Orquestaciones multi-paso        | Crear workflows           |
| `.claude/rules/`                    | Reglas de comportamiento AI      | Agregar restricciones     |
| `docs/stories/`                     | Stories de desarrollo            | Trabajar en features      |
| `src/`                              | Codigo fuente del framework      | Funcionalidad core        |
| `tests/`                            | Suites de tests                  | Todos los cambios         |

---

## Ejecutar Tests

### Comandos de Test

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage

# Ejecutar tests de health check
npm run test:health-check
```

### Estructura de Tests

```
tests/
├── health-check/           # Tests de integracion
│   └── *.test.js           # Archivos de test health check
├── unit/                   # Tests unitarios
│   └── *.test.js           # Archivos de test unitario
└── fixtures/               # Fixtures y mocks de test
```

### Escribir Tests

**Ejemplo de Test Unitario:**

```javascript
// tests/unit/example.test.js
const { describe, it, expect } = require('@jest/globals');

describe('ComponentName', () => {
  describe('methodName', () => {
    it('should handle expected input', () => {
      const result = myFunction('input');
      expect(result).toBe('expected');
    });

    it('should throw on invalid input', () => {
      expect(() => myFunction(null)).toThrow('Invalid input');
    });
  });
});
```

### Ejecutar Tests Especificos

```bash
# Ejecutar tests que coincidan con patron
npm test -- --testPathPattern="agent"

# Ejecutar archivo de test individual
npm test -- tests/unit/agent.test.js

# Ejecutar con salida verbose
npm test -- --verbose
```

---

## Agregar Nuevos Agentes

Los agentes son personas AI que proveen capacidades especializadas. Cada agente se define en un archivo Markdown con frontmatter YAML.

### Paso 1: Planificar tu Agente

| Aspecto           | Preguntas a Responder                          |
| ----------------- | ---------------------------------------------- |
| **Proposito**     | Que problema especifico resuelve este agente?  |
| **Expertise**     | Que conocimiento de dominio deberia tener?     |
| **Comandos**      | Que acciones puede realizar el agente?         |
| **Colaboracion**  | Con que otros agentes trabaja?                 |

### Paso 2: Crear Archivo de Agente

Crea un nuevo archivo en `.aiox-core/development/agents/`:

```bash
# Archivo: .aiox-core/development/agents/my-agent.md
```

### Paso 3: Plantilla de Agente

````markdown
# my-agent

ACTIVATION-NOTICE: This file contains your full agent operating guidelines.

## COMPLETE AGENT DEFINITION FOLLOWS

```yaml
agent:
  name: AgentName
  id: my-agent
  title: Agent Role Title
  icon: emoji
  whenToUse: 'Short description of when to use this agent'

persona_profile:
  archetype: ArchetypeType # Builder, Guardian, Orchestrator, etc.

  communication:
    tone: professional # pragmatic, analytical, friendly, etc.
    emoji_frequency: medium # low, medium, high

    vocabulary:
      - domain-specific
      - terms
      - here

    greeting_levels:
      minimal: 'icon Agent ready'
      named: 'icon AgentName ready!'
      archetypal: 'icon AgentName the Archetype ready!'

    signature_closing: '-- AgentName, closing phrase'

persona:
  role: Expert description
  style: Communication style description
  identity: Core identity statement
  focus: Primary focus area

core_principles:
  - Principle 1
  - Principle 2
  - Principle 3

commands:
  - name: help
    visibility: [full, quick, key]
    description: 'Show all available commands'
  - name: my-command
    visibility: [full, quick]
    description: 'Description of what this command does'

dependencies:
  tasks:
    - relevant-task.md
  checklists:
    - relevant-checklist.md
  tools:
    - tool-name
```
````

---

## Comandos Rapidos

**Comandos Core:**

- `*help` - Mostrar todos los comandos
- `*my-command` - Ejecutar comando personalizado
- `*exit` - Salir del modo agente

**Colaboracion:**

- Trabaja con: @other-agent
- Delega a: @specialist-agent

---

````

### Paso 4: Agregar Dependencias

Si tu agente usa tasks o checklists, asegurate de que existan:

```yaml
dependencies:
  tasks:
    - my-agent-task.md       # Crear en .aiox-core/development/tasks/
  checklists:
    - my-agent-checklist.md  # Crear en .aiox-core/development/checklists/
  tools:
    - git
    - context7
````

### Paso 5: Sincronizar con IDEs

```bash
# Sincronizar nuevo agente con todos los IDEs
npm run sync:ide

# Verificar sincronizacion
npm run sync:ide:validate
```

---

## Crear Nuevas Tasks

Las tasks son workflows ejecutables que los agentes usan para realizar acciones.

### Paso 1: Planificar tu Task

| Aspecto        | Descripcion                       |
| -------------- | --------------------------------- |
| **Proposito**  | Que logra esta task?              |
| **Entradas**   | Que datos necesita?               |
| **Salidas**    | Que produce?                      |
| **Pasos**      | Cual es el flujo de ejecucion?    |
| **Validacion** | Como sabemos que tuvo exito?      |

### Paso 2: Crear Archivo de Task

Crea un nuevo archivo en `.aiox-core/development/tasks/`:

```bash
# Convenciones de nomenclatura:
# Especifica de agente: {agent-id}-{task-name}.md
# Compartida: {task-name}.md

# Ejemplos:
# .aiox-core/development/tasks/dev-build-component.md  (agente dev)
# .aiox-core/development/tasks/create-doc.md          (compartida)
```

### Paso 3: Plantilla de Task

````markdown
---
## Modos de Ejecucion

**Elige tu modo de ejecucion:**

### 1. Modo YOLO - Rapido, Autonomo (0-1 prompts)
- Toma de decisiones autonoma con logging
- Interaccion minima con usuario
- **Mejor para:** Tasks simples y deterministicas

### 2. Modo Interactivo - Balanceado, Educativo (5-10 prompts) **[DEFAULT]**
- Checkpoints explicitos de decision
- Explicaciones educativas
- **Mejor para:** Aprendizaje, decisiones complejas

### 3. Planificacion Pre-Flight - Planificacion Integral Inicial
- Fase de analisis de task (identificar todas las ambiguedades)
- Ejecucion sin ambiguedades
- **Mejor para:** Requerimientos ambiguos, trabajo critico

---

## Definicion de Task (AIOX Task Format V1.0)

```yaml
task: myTaskFunction()
responsável: AgentName
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: inputName
  tipo: string
  origen: User Input
  obligatorio: true
  validacion: Must be non-empty

**Salida:**
- campo: outputName
  tipo: string
  destino: File system
  persistido: true
```
````

---

## Pre-Condiciones

```yaml
pre-conditions:
  - [ ] Required inputs provided
    blocker: true
```

---

## Post-Condiciones

```yaml
post-conditions:
  - [ ] Task completed successfully
    blocker: true
```

---

# Titulo de Task

## Proposito

Descripcion clara de lo que esta task logra.

## Prerrequisitos

- Prerrequisito 1
- Prerrequisito 2

## Proceso de Elicitacion Interactiva

### Paso 1: Recopilar Informacion

```
ELICIT: Information Collection
1. What is the input?
2. What is the expected output?
```

### Paso 2: Validar

```
ELICIT: Validation
1. Is the input valid?
2. Are all dependencies available?
```

## Pasos de Implementacion

1. **Titulo del Paso Uno**
   - Descripcion de la accion
   - Ejemplo de codigo si es necesario

2. **Titulo del Paso Dos**
   - Descripcion de la accion

3. **Titulo del Paso Tres**
   - Descripcion de la accion

## Checklist de Validacion

- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

## Manejo de Errores

- Si X falla: Hacer Y
- Si Z falta: Solicitar input

## Salida Exitosa

```
Task completed successfully!
Output: {output}
```

````

### Paso 4: Referenciar en Agente

Agrega la task a las dependencias de tu agente:

```yaml
dependencies:
  tasks:
    - my-new-task.md
````

---

## Crear Nuevos Workflows

Los workflows orquestan multiples agentes y tasks para operaciones complejas.

### Paso 1: Planificar tu Workflow

| Aspecto         | Descripcion                     |
| --------------- | ------------------------------- |
| **Objetivo**    | Cual es el resultado final?     |
| **Etapas**      | Que fases tiene?                |
| **Agentes**     | Que agentes participan?         |
| **Transiciones**| Como se conectan las etapas?    |

### Paso 2: Crear Archivo de Workflow

Crea un nuevo archivo en `.aiox-core/development/workflows/`:

```bash
# Archivo: .aiox-core/development/workflows/my-workflow.yaml
```

### Paso 3: Plantilla de Workflow

```yaml
workflow:
  id: my-workflow
  name: My Workflow Name
  description: |
    Detailed description of what this workflow accomplishes
    and when it should be used.
  type: development # development, deployment, analysis
  scope: fullstack # ui, service, fullstack

stages:
  - id: stage-1-planning
    name: Planning Phase
    description: Initial planning and requirements gathering
    agent: pm
    tasks:
      - create-story
    outputs:
      - Story file created
      - Requirements documented
    next: stage-2-design

  - id: stage-2-design
    name: Design Phase
    description: Architecture and technical design
    agent: architect
    tasks:
      - analyze-impact
    outputs:
      - Architecture document
      - Technical specifications
    next: stage-3-implement

  - id: stage-3-implement
    name: Implementation Phase
    description: Code implementation
    agent: dev
    tasks:
      - develop-story
    outputs:
      - Source code
      - Unit tests
    next: stage-4-review

  - id: stage-4-review
    name: Review Phase
    description: Quality assurance
    agent: qa
    tasks:
      - code-review
    outputs:
      - Review feedback
      - Test results
    next: null # End of workflow

transitions:
  - from: stage-1-planning
    to: stage-2-design
    condition: "Story status is 'Ready for Design'"

  - from: stage-2-design
    to: stage-3-implement
    condition: 'Architecture approved'

  - from: stage-3-implement
    to: stage-4-review
    condition: 'All tests passing'

resources:
  templates:
    - story-template.md
    - architecture-template.md
  data:
    - project-config.yaml

validation:
  checkpoints:
    - stage: stage-1-planning
      criteria: 'Story file exists and is valid'
    - stage: stage-3-implement
      criteria: 'All acceptance criteria implemented'
    - stage: stage-4-review
      criteria: 'Code review approved'

metadata:
  version: 1.0.0
  author: Your Name
  created: 2026-01-29
  tags:
    - development
    - feature
```

---

## Estandares de Codigo

### Configuracion ESLint

El proyecto usa ESLint 9 con flat config:

```bash
# Ejecutar linting
npm run lint

# Arreglar issues auto-corregibles
npm run lint -- --fix
```

**Reglas Clave:**

- Sin variables no usadas (error)
- Espaciado y formateo consistente
- Sin console.log en codigo de produccion (warn)
- Preferir const sobre let

### Configuracion TypeScript

```bash
# Ejecutar verificacion de tipos
npm run typecheck
```

**Configuraciones Clave de tsconfig.json:**

- `strict: true` - Seguridad de tipos completa
- `noEmit: true` - Solo verificacion de tipos (sin compilacion)
- `esModuleInterop: true` - Compatibilidad CommonJS/ES module

### Formateo Prettier

```bash
# Formatear todos los archivos Markdown
npm run format
```

### Convenciones de Nomenclatura

| Tipo          | Convencion  | Ejemplo                     |
| ------------- | ----------- | --------------------------- |
| **Archivos**  | kebab-case  | `my-component.js`           |
| **Clases**    | PascalCase  | `MyComponent`               |
| **Funciones** | camelCase   | `myFunction`                |
| **Constantes**| UPPER_SNAKE | `MAX_RETRIES`               |
| **Agentes**   | kebab-case  | `dev`, `qa`, `architect`    |
| **Tasks**     | kebab-case  | `create-story`, `dev-build` |

### Convenciones de Commit

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat: add new agent validation"

# Bug fix
git commit -m "fix: resolve task execution error"

# Documentacion
git commit -m "docs: update development guide"

# Chore (mantenimiento)
git commit -m "chore: update dependencies"

# Con scope
git commit -m "feat(agents): add data-engineer agent"
git commit -m "fix(tasks): handle missing input gracefully"
```

### Pre-commit Hooks

Husky ejecuta estas verificaciones antes de cada commit:

1. **lint-staged**: Ejecuta ESLint y Prettier en archivos staged
2. **IDE sync**: Actualiza configuraciones de IDE si cambiaron agentes

---

## Proceso de PR y Code Review

### Paso 1: Crear Feature Branch

```bash
# Crear branch desde main
git checkout main
git pull upstream main
git checkout -b feat/my-feature

# O para fixes
git checkout -b fix/bug-description
```

### Paso 2: Hacer Cambios

Sigue el enfoque de desarrollo basado en stories:

1. Verifica si existe una story o crea una
2. Implementa cambios siguiendo las tasks de la story
3. Actualiza checkboxes de la story conforme avanzas
4. Agrega tests para nueva funcionalidad
5. Actualiza documentacion si es necesario

### Paso 3: Ejecutar Quality Checks

```bash
# Ejecutar todas las verificaciones
npm test
npm run lint
npm run typecheck

# Validar estructura
npm run validate:structure
```

### Paso 4: Commit y Push

```bash
# Stage cambios
git add -A

# Commit con mensaje convencional
git commit -m "feat: implement my feature"

# Push a tu fork
git push origin feat/my-feature
```

### Paso 5: Crear Pull Request

```bash
# Usando GitHub CLI
gh pr create --title "feat: implement my feature" --body "$(cat <<'EOF'
## Summary
- Added feature X
- Updated component Y

## Test plan
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Documentation updated

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Guias de Code Review

**Como Autor:**

- Manten PRs enfocados y pequenos (< 500 lineas cuando sea posible)
- Provee descripcion clara y contexto
- Responde al feedback puntualmente
- Solicita re-review despues de cambios

**Como Reviewer:**

- Revisa dentro de 24 horas
- Se constructivo y especifico
- Aprueba cuando estes satisfecho o solicita cambios
- Usa sugerencias de GitHub para fixes pequenos

### Requisitos de Merge

| Requisito              | Descripcion                       |
| ---------------------- | --------------------------------- |
| **Tests pasan**        | Todos los tests CI deben pasar    |
| **Lint limpio**        | Sin errores de ESLint             |
| **Tipos validos**      | Compilacion TypeScript exitosa    |
| **Review aprobado**    | Al menos una aprobacion           |
| **Conflictos resueltos**| Sin conflictos de merge          |

---

## Debug y Solucion de Problemas

### Habilitar Modo Debug

```bash
# Establecer variable de entorno
export AIOX_DEBUG=true

# Ejecutar con salida de debug
npm test -- --verbose
```

### Ver Logs de Agentes

```bash
# Verificar logs de ejecucion de agentes
ls -la .aiox/logs/

# Tail del log de agente
tail -f .aiox/logs/agent.log
```

### Problemas Comunes

#### Problema: Tests fallan localmente pero pasan en CI

**Causa:** Diferencias de entorno o cache obsoleto

**Solucion:**

```bash
# Limpiar cache de Jest
npx jest --clearCache

# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules
npm install
```

#### Problema: Errores de ESLint despues de pullear cambios

**Causa:** Cache de ESLint obsoleto

**Solucion:**

```bash
# Limpiar cache de ESLint
rm .eslintcache

# Ejecutar lint de nuevo
npm run lint
```

#### Problema: Errores de TypeScript en IDE pero no en CLI

**Causa:** Desajuste de version de TypeScript en IDE

**Solucion:**

```bash
# Forzar IDE a usar TypeScript del proyecto
# En VS Code: Ctrl+Shift+P -> "TypeScript: Select TypeScript Version" -> "Use Workspace Version"
```

#### Problema: Agente no se activa

**Causa:** Error de sintaxis en archivo de agente o dependencias faltantes

**Solucion:**

```bash
# Validar YAML del archivo de agente
npx js-yaml .aiox-core/development/agents/my-agent.md

# Verificar que existan dependencias
ls .aiox-core/development/tasks/my-task.md
```

#### Problema: IDE no muestra comandos de agente

**Causa:** IDE sync no ejecutado o fallo

**Solucion:**

```bash
# Ejecutar sync
npm run sync:ide

# Validar sync
npm run sync:ide:validate

# Verificar directorio especifico del IDE
ls .cursor/  # Para Cursor
```

#### Problema: Pre-commit hooks no se ejecutan

**Causa:** Husky no instalado correctamente

**Solucion:**

```bash
# Reinstalar Husky
npm run prepare

# Verificar que existan hooks
ls -la .husky/
```

### Debuggear Ejecucion de Workflow

```bash
# Trazar ejecucion de workflow
AIOX_DEBUG=true npm run trace -- workflow-name

# Verificar estado de workflow
cat .aiox/state/workflow-state.json
```

### Profiling de Performance

```bash
# Profiler de ejecucion de tests
npm test -- --detectOpenHandles

# Verificar memory leaks
node --inspect node_modules/.bin/jest
```

---

## Obtener Ayuda

### Recursos

- **GitHub Discussions:** [github.com/SynkraAI/aiox-core/discussions](https://github.com/SynkraAI/aiox-core/discussions)
- **Issue Tracker:** [github.com/SynkraAI/aiox-core/issues](https://github.com/SynkraAI/aiox-core/issues)
- **Discord:** [discord.gg/gk8jAdXWmj](https://discord.gg/gk8jAdXWmj)

### Etiquetas de Issues

| Etiqueta           | Caso de Uso                    |
| ------------------ | ------------------------------ |
| `bug`              | Algo esta roto                 |
| `feature`          | Solicitud de nueva funcionalidad |
| `documentation`    | Mejoras de documentacion       |
| `good-first-issue` | Bueno para nuevos contribuidores |
| `help-wanted`      | Se aprecia ayuda de la comunidad |

### Contactar Maintainers

- Ver archivo `CODEOWNERS` para ownership de modulos
- Etiquetar `@SynkraAI/core-team` para issues urgentes

---

## Documentacion Relacionada

- [Guia de Usuario](./user-guide.md) - Documentacion para usuarios finales
- [Vista General de Arquitectura](../architecture/ARCHITECTURE-INDEX.md) - Diseno del sistema
- [Contribuir Squads](./contributing-squads.md) - Desarrollo de squads
- [Guia de Quality Gates](./quality-gates.md) - Aseguramiento de calidad
- [Configuracion Global MCP](./mcp-global-setup.md) - Configuracion MCP

---

_Synkra AIOX Guia de Configuracion para Desarrollo v1.0.0_
_Ultima Actualizacion: 2026-01-29_
