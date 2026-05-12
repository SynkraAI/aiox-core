<!-- Traduccion: ES | Original: /docs/en/architecture/coding-standards.md | Sincronizacion: 2026-01-26 -->

> ⚠️ **OBSOLETO**: Este archivo se mantiene solo por compatibilidad hacia atras.
>
> **Version oficial:** [docs/framework/coding-standards.md](../framework/coding-standards.md)
>
> Este archivo sera eliminado en Q2 2026 despues de la consolidacion completa a `docs/framework/`.

---

# Estandares de Codigo AIOX

> 🌐 [EN](../../architecture/coding-standards.md) | [PT](../../pt/architecture/coding-standards.md) | **ES**

---

**Version:** 1.1
**Ultima Actualizacion:** 2025-12-14
**Estado:** OBSOLETO - Ver docs/framework/coding-standards.md
**Aviso de Migracion:** Este documento migrara al repositorio `SynkraAI/aiox-core` en Q2 2026 (ver Decision 005)

---

## 📋 Tabla de Contenidos

- [Descripcion General](#descripcion-general)
- [Estandares JavaScript/TypeScript](#estandares-javascripttypescript)
- [Organizacion de Archivos](#organizacion-de-archivos)
- [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
- [Calidad de Codigo](#calidad-de-codigo)
- [Estandares de Documentacion](#estandares-de-documentacion)
- [Estandares de Testing](#estandares-de-testing)
- [Convenciones de Git](#convenciones-de-git)
- [Estandares de Seguridad](#estandares-de-seguridad)

---

## Descripcion General

Este documento define los estandares oficiales de codigo para el desarrollo del framework AIOX. Todas las contribuciones de codigo deben adherirse a estos estandares para asegurar consistencia, mantenibilidad y calidad.

**Aplicacion:**

- ESLint (automatizado)
- Prettier (automatizado)
- Revision de CodeRabbit (automatizado)
- Revision humana (manual)

---

## Estandares JavaScript/TypeScript

### Version del Lenguaje

```javascript
// Objetivo: ES2022 (Node.js 18+)
// TypeScript: 5.x

// ✅ CORRECTO: Sintaxis moderna
const data = await fetchData();
const { id, name } = data;

// ❌ INCORRECTO: Sintaxis obsoleta
fetchData().then(function (data) {
  var id = data.id;
  var name = data.name;
});
```

### Configuracion de TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Estilo de Codigo

#### Indentacion y Formato

```javascript
// ✅ CORRECTO: 2 espacios de indentacion
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}

// ❌ INCORRECTO: 4 espacios o tabs
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}
```

**Configuracion de Prettier:**

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

#### Longitud de Linea

```javascript
// ✅ CORRECTO: Maximo 100 caracteres
const result = await executeTask(taskName, taskArgs, { timeout: 5000, retry: 3 });

// ❌ INCORRECTO: Mas de 100 caracteres
const result = await executeTask(taskName, taskArgs, {
  timeout: 5000,
  retry: 3,
  failureCallback: onFailure,
});
```

#### Comillas

```javascript
// ✅ CORRECTO: Comillas simples para strings
const agentName = 'developer';
const message = `Agent ${agentName} activated`;

// ❌ INCORRECTO: Comillas dobles (excepto JSON)
const agentName = 'developer';
```

### Patrones Modernos de JavaScript

#### Async/Await (Preferido)

```javascript
// ✅ CORRECTO: async/await
async function loadAgent(agentId) {
  try {
    const agent = await fetchAgent(agentId);
    const config = await loadConfig(agent.configPath);
    return { agent, config };
  } catch (error) {
    console.error(`Error al cargar agente ${agentId}:`, error);
    throw error;
  }
}

// ❌ INCORRECTO: Cadenas de Promise
function loadAgent(agentId) {
  return fetchAgent(agentId)
    .then((agent) => loadConfig(agent.configPath).then((config) => ({ agent, config })))
    .catch((error) => {
      console.error(`Error al cargar agente ${agentId}:`, error);
      throw error;
    });
}
```

#### Desestructuracion

```javascript
// ✅ CORRECTO: Desestructuracion
const { name, id, enabled } = agent;
const [first, second, ...rest] = items;

// ❌ INCORRECTO: Extraccion manual
const name = agent.name;
const id = agent.id;
const enabled = agent.enabled;
```

#### Funciones Flecha

```javascript
// ✅ CORRECTO: Funciones flecha para callbacks
const activeAgents = agents.filter((agent) => agent.enabled);
const agentNames = agents.map((agent) => agent.name);

// ❌ INCORRECTO: Funciones tradicionales para callbacks simples
const activeAgents = agents.filter(function (agent) {
  return agent.enabled;
});
```

#### Template Literals

```javascript
// ✅ CORRECTO: Template literals para interpolacion de strings
const message = `Agente ${agentName} cargado exitosamente`;
const path = `${baseDir}/${agentId}/config.yaml`;

// ❌ INCORRECTO: Concatenacion de strings
const message = 'Agente ' + agentName + ' cargado exitosamente';
const path = baseDir + '/' + agentId + '/config.yaml';
```

### Manejo de Errores

```javascript
// ✅ CORRECTO: Manejo de errores especifico con contexto
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.error(`Ejecucion de tarea fallida [${taskName}]:`, error);
    throw new Error(`Error al ejecutar tarea "${taskName}": ${error.message}`);
  }
}

// ❌ INCORRECTO: Fallos silenciosos o errores genericos
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.log('Error:', error);
    return null; // Fallo silencioso
  }
}
```

---

## Organizacion de Archivos

### Estructura de Directorios

```
.aiox-core/
├── agents/              # Definiciones de agentes (YAML + Markdown)
├── tasks/               # Workflows de tareas (Markdown)
├── templates/           # Plantillas de documentos (YAML/Markdown)
├── workflows/           # Workflows multi-paso (YAML)
├── checklists/          # Checklists de validacion (Markdown)
├── data/                # Base de conocimiento (Markdown)
├── utils/               # Scripts de utilidad (JavaScript)
├── tools/               # Integraciones de herramientas (YAML)
└── elicitation/         # Motores de elicitacion (JavaScript)

docs/
├── architecture/        # Decisiones de arquitectura especificas del proyecto
├── framework/           # Documentacion oficial del framework (migra a REPO 1)
├── stories/             # Historias de desarrollo
├── epics/               # Planificacion de epics
└── guides/              # Guias practicas
```

### Nomenclatura de Archivos

```javascript
// ✅ CORRECTO: Kebab-case para archivos
agent - executor.js;
task - runner.js;
greeting - builder.js;
context - detector.js;

// ❌ INCORRECTO: camelCase o PascalCase para archivos
agentExecutor.js;
TaskRunner.js;
GreetingBuilder.js;
```

### Estructura de Modulos

```javascript
// ✅ CORRECTO: Estructura de modulo clara
// Archivo: agent-executor.js

// 1. Imports
const fs = require('fs').promises;
const yaml = require('yaml');
const { loadConfig } = require('./config-loader');

// 2. Constantes
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 3;

// 3. Funciones auxiliares (privadas)
function validateAgent(agent) {
  // ...
}

// 4. Exports principales (API publica)
async function executeAgent(agentId, args) {
  // ...
}

async function loadAgent(agentId) {
  // ...
}

// 5. Exports
module.exports = {
  executeAgent,
  loadAgent,
};
```

---

## Convenciones de Nomenclatura

### Variables y Funciones

```javascript
// ✅ CORRECTO: camelCase para variables y funciones
const agentName = 'developer';
const taskResult = await executeTask();

function loadAgentConfig(agentId) {
  // ...
}

async function fetchAgentData(agentId) {
  // ...
}

// ❌ INCORRECTO: snake_case o PascalCase
const agent_name = 'developer';
const TaskResult = await executeTask();

function LoadAgentConfig(agentId) {
  // ...
}
```

### Clases

```javascript
// ✅ CORRECTO: PascalCase para clases
class AgentExecutor {
  constructor(config) {
    this.config = config;
  }

  async execute(agentId) {
    // ...
  }
}

class TaskRunner {
  // ...
}

// ❌ INCORRECTO: camelCase o snake_case
class agentExecutor {
  // ...
}

class task_runner {
  // ...
}
```

### Constantes

```javascript
// ✅ CORRECTO: SCREAMING_SNAKE_CASE para constantes verdaderas
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const AGENT_STATUS_ACTIVE = 'active';

// ❌ INCORRECTO: camelCase o minusculas
const maxRetryAttempts = 3;
const defaulttimeout = 5000;
```

### Miembros Privados

```javascript
// ✅ CORRECTO: Prefijo con guion bajo para privados (convencion)
class AgentManager {
  constructor() {
    this._cache = new Map();
    this._isInitialized = false;
  }

  _loadFromCache(id) {
    // Helper privado
    return this._cache.get(id);
  }

  async getAgent(id) {
    // API publica
    return this._loadFromCache(id) || (await this._fetchAgent(id));
  }
}
```

### Variables Booleanas

```javascript
// ✅ CORRECTO: Prefijo is/has/should
const isEnabled = true;
const hasPermission = false;
const shouldRetry = checkCondition();

// ❌ INCORRECTO: Nombres ambiguos
const enabled = true;
const permission = false;
const retry = checkCondition();
```

---

## Calidad de Codigo

### Configuracion de ESLint

```json
{
  "env": {
    "node": true,
    "es2022": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": 13,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],
    "brace-style": ["error", "1tbs"],
    "comma-dangle": ["error", "es5"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

### Complejidad de Codigo

```javascript
// ✅ CORRECTO: Baja complejidad ciclomatica (< 10)
function processAgent(agent) {
  if (!agent.enabled) return null;

  const config = loadConfig(agent.configPath);
  const result = executeAgent(agent, config);

  return result;
}

// ❌ INCORRECTO: Alta complejidad ciclomatica
function processAgent(agent) {
  if (agent.type === 'dev') {
    if (agent.mode === 'yolo') {
      if (agent.hasStory) {
        // ... logica anidada
      } else {
        // ... mas logica anidada
      }
    } else {
      // ... mas ramas
    }
  } else if (agent.type === 'qa') {
    // ... mas ramas
  }
  // ... aun mas complejidad
}
```

**Refactorizar funciones complejas:**

```javascript
// ✅ CORRECTO: Funciones auxiliares extraidas
function processAgent(agent) {
  if (!agent.enabled) return null;

  if (agent.type === 'dev') {
    return processDevAgent(agent);
  }

  if (agent.type === 'qa') {
    return processQaAgent(agent);
  }

  return processDefaultAgent(agent);
}
```

### Principio DRY

```javascript
// ✅ CORRECTO: Funcion reutilizable
function validateAndLoad(filePath, schema) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.parse(content);

  if (!schema.validate(data)) {
    throw new Error(`Schema invalido: ${filePath}`);
  }

  return data;
}

const agent = validateAndLoad('agent.yaml', agentSchema);
const task = validateAndLoad('task.yaml', taskSchema);

// ❌ INCORRECTO: Codigo repetido
const agentContent = fs.readFileSync('agent.yaml', 'utf8');
const agentData = yaml.parse(agentContent);
if (!agentSchema.validate(agentData)) {
  throw new Error('Schema de agente invalido');
}

const taskContent = fs.readFileSync('task.yaml', 'utf8');
const taskData = yaml.parse(taskContent);
if (!taskSchema.validate(taskData)) {
  throw new Error('Schema de tarea invalido');
}
```

---

## Estandares de Documentacion

### Comentarios JSDoc

```javascript
/**
 * Carga y ejecuta un agente AIOX
 *
 * @param {string} agentId - Identificador unico del agente
 * @param {Object} args - Argumentos de ejecucion del agente
 * @param {boolean} args.yoloMode - Habilitar modo autonomo
 * @param {string} args.storyPath - Ruta al archivo de historia (opcional)
 * @param {number} [timeout=5000] - Timeout de ejecucion en milisegundos
 * @returns {Promise<Object>} Resultado de la ejecucion del agente
 * @throws {Error} Si el agente no se encuentra o la ejecucion falla
 *
 * @example
 * const result = await executeAgent('dev', {
 *   yoloMode: true,
 *   storyPath: 'docs/stories/story-6.1.2.5.md'
 * });
 */
async function executeAgent(agentId, args, timeout = 5000) {
  // Implementacion
}
```

### Comentarios en Linea

```javascript
// ✅ CORRECTO: Explicar POR QUE, no QUE
// Cache de agentes para evitar re-parseo de YAML en cada activacion (optimizacion de rendimiento)
const agentCache = new Map();

// Log de decisiones requerido para rollback en modo yolo (requisito de Historia 6.1.2.6)
if (yoloMode) {
  await createDecisionLog(storyId);
}

// ❌ INCORRECTO: Decir lo obvio
// Crear un nuevo Map
const agentCache = new Map();

// Si yolo mode es verdadero
if (yoloMode) {
  await createDecisionLog(storyId);
}
```

### Archivos README

Cada modulo/directorio debe tener un README.md:

```markdown
# Agent Executor

**Proposito:** Carga y ejecuta agentes AIOX con gestion de configuracion.

## Uso

\`\`\`javascript
const { executeAgent } = require('./agent-executor');

const result = await executeAgent('dev', {
yoloMode: true,
storyPath: 'docs/stories/story-6.1.2.5.md'
});
\`\`\`

## API

- `executeAgent(agentId, args, timeout)` - Ejecutar agente
- `loadAgent(agentId)` - Cargar configuracion de agente

## Dependencias

- `yaml` - Parsing de YAML
- `fs/promises` - Operaciones de sistema de archivos
```

---

## Estandares de Testing

### Nomenclatura de Archivos de Test

```bash
# Tests unitarios
tests/unit/context-detector.test.js
tests/unit/git-config-detector.test.js

# Tests de integracion
tests/integration/contextual-greeting.test.js
tests/integration/workflow-navigation.test.js

# Tests E2E
tests/e2e/agent-activation.test.js
```

### Estructura de Tests

```javascript
// ✅ CORRECTO: Nombres de test descriptivos con Given-When-Then
describe('ContextDetector', () => {
  describe('detectSessionType', () => {
    it('deberia retornar "new" cuando el historial de conversacion esta vacio', async () => {
      // Given (Dado)
      const conversationHistory = [];
      const sessionFile = null;

      // When (Cuando)
      const result = await detectSessionType(conversationHistory, sessionFile);

      // Then (Entonces)
      expect(result).toBe('new');
    });

    it('deberia retornar "workflow" cuando el patron de comando coincide con story_development', async () => {
      // Given (Dado)
      const conversationHistory = [{ command: 'validate-story-draft' }, { command: 'develop' }];

      // When (Cuando)
      const result = await detectSessionType(conversationHistory, null);

      // Then (Entonces)
      expect(result).toBe('workflow');
    });
  });
});
```

### Cobertura de Codigo

- **Minimo:** 80% para todos los modulos nuevos
- **Objetivo:** 90% para modulos core
- **Critico:** 100% para modulos de seguridad/validacion

```bash
# Ejecutar cobertura
npm test -- --coverage

# Umbrales de cobertura en package.json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## Convenciones de Git

### Mensajes de Commit

```bash
# ✅ CORRECTO: Formato de Conventional Commits
feat: implementar sistema de saludo contextual de agentes [Story 6.1.2.5]
fix: resolver problema de invalidacion de cache de git config [Story 6.1.2.5]
docs: actualizar estandares de codigo con configuracion TypeScript
chore: actualizar configuracion de ESLint
refactor: extraer greeting builder a modulo separado
test: agregar tests unitarios para WorkflowNavigator

# ❌ INCORRECTO: Vagos o no descriptivos
actualizar archivos
arreglar bug
cambios
wip
```

**Formato:**

```
<tipo>: <descripcion> [Story <id>]

<cuerpo opcional>

<pie opcional>
```

**Tipos:**

- `feat`: Nueva funcionalidad
- `fix`: Correccion de bug
- `docs`: Cambios en documentacion
- `chore`: Cambios de build/herramientas
- `refactor`: Refactorizacion de codigo (sin cambio funcional)
- `test`: Adiciones/modificaciones de tests
- `perf`: Mejoras de rendimiento
- `style`: Cambios de estilo de codigo (formato, etc.)

### Nomenclatura de Ramas

```bash
# ✅ CORRECTO: Nombres de rama descriptivos
feature/story-6.1.2.5-contextual-greeting
fix/git-config-cache-ttl
refactor/agent-executor-optimization
docs/update-coding-standards

# ❌ INCORRECTO: Nombres de rama vagos
update
fix
my-branch
```

---

## Estandares de Seguridad

### Validacion de Entrada

```javascript
// ✅ CORRECTO: Validar todas las entradas externas
function executeCommand(command) {
  // Validacion de whitelist
  const allowedCommands = ['help', 'develop', 'review', 'deploy'];

  if (!allowedCommands.includes(command)) {
    throw new Error(`Comando invalido: ${command}`);
  }

  return runCommand(command);
}

// ❌ INCORRECTO: Sin validacion
function executeCommand(command) {
  return eval(command); // NUNCA HACER ESTO
}
```

### Proteccion contra Path Traversal

```javascript
// ✅ CORRECTO: Validar rutas de archivo
const path = require('path');

function loadFile(filePath) {
  const basePath = path.resolve(__dirname, '.aiox-core');
  const resolvedPath = path.resolve(basePath, filePath);

  // Prevenir directory traversal
  if (!resolvedPath.startsWith(basePath)) {
    throw new Error('Ruta de archivo invalida');
  }

  return fs.readFile(resolvedPath, 'utf8');
}

// ❌ INCORRECTO: Uso directo de ruta
function loadFile(filePath) {
  return fs.readFile(filePath, 'utf8'); // Vulnerable a ../../../etc/passwd
}
```

### Gestion de Secretos

```javascript
// ✅ CORRECTO: Usar variables de entorno
const apiKey = process.env.CLICKUP_API_KEY;

if (!apiKey) {
  throw new Error('Variable de entorno CLICKUP_API_KEY no configurada');
}

// ❌ INCORRECTO: Secretos hardcodeados
const apiKey = 'pk_12345678_abcdefgh'; // NUNCA HACER ESTO
```

### Seguridad de Dependencias

```bash
# Auditorias de seguridad regulares
npm audit
npm audit fix

# Usar Snyk o similar para monitoreo continuo
```

---

## Aplicacion

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run typecheck
npm test
```

### Pipeline CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm audit
```

### Integracion con CodeRabbit

Todos los PRs son revisados automaticamente por CodeRabbit para:

- Problemas de calidad de codigo
- Vulnerabilidades de seguridad
- Problemas de rendimiento
- Violaciones de mejores practicas
- Gaps en cobertura de tests

---

## Historial de Versiones

| Version | Fecha      | Cambios                                                          | Autor            |
| ------- | ---------- | ---------------------------------------------------------------- | ---------------- |
| 1.0     | 2025-01-15 | Documento inicial de estandares de codigo                        | Aria (architect) |
| 1.1     | 2025-12-14 | Actualizado aviso de migracion a SynkraAI/aiox-core [Story 6.10] | Dex (dev)        |

---

**Documentos Relacionados:**

- [Tech Stack](./tech-stack.md)
- [Source Tree](./source-tree.md)

---

_Este es un estandar oficial del framework AIOX. Todas las contribuciones de codigo deben cumplir con el._
