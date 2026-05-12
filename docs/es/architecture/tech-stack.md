<!-- Traduccion: ES | Original: /docs/en/architecture/tech-stack.md | Sincronizacion: 2026-01-26 -->

> ⚠️ **OBSOLETO**: Este archivo se mantiene solo por compatibilidad hacia atras.
>
> **Version oficial:** [docs/framework/tech-stack.md](../framework/tech-stack.md)
>
> Este archivo sera eliminado en Q2 2026 despues de la consolidacion completa a `docs/framework/`.

---

# Stack Tecnologico AIOX

> 🌐 [EN](../../architecture/tech-stack.md) | [PT](../../pt/architecture/tech-stack.md) | **ES**

---

**Version:** 1.1
**Ultima Actualizacion:** 2025-12-14
**Estado:** OBSOLETO - Ver docs/framework/tech-stack.md
**Aviso de Migracion:** Este documento migrara al repositorio `SynkraAI/aiox-core` en Q2 2026 (ver Decision 005)

---

## 📋 Tabla de Contenidos

- [Descripcion General](#descripcion-general)
- [Runtime Core](#runtime-core)
- [Lenguajes y Transpiladores](#lenguajes-y-transpiladores)
- [Dependencias Core](#dependencias-core)
- [Herramientas de Desarrollo](#herramientas-de-desarrollo)
- [Framework de Testing](#framework-de-testing)
- [Build y Deployment](#build-y-deployment)
- [Integraciones Externas](#integraciones-externas)
- [Stack Futuro (Post-Migracion)](#stack-futuro-post-migracion)

---

## Descripcion General

AIOX esta construido sobre JavaScript/TypeScript moderno con runtime Node.js, optimizado para desarrollo CLI multiplataforma con UX interactivo y capacidades de orquestacion de agentes.

**Filosofia:**

- Preferir **tecnologia aburrida** donde sea posible (dependencias probadas y estables)
- Elegir **tecnologia emocionante** solo donde sea necesario (rendimiento, mejoras de DX)
- Minimizar dependencias (reducir riesgo de cadena de suministro)
- Multiplataforma primero (Windows, macOS, Linux)

---

## Runtime Core

### Node.js

```yaml
Version: 18.0.0+
LTS: Si (LTS Activo hasta Abril 2025)
Razon: Async/await estable, fetch API, soporte ES2022
```

**Por que Node.js 18+:**

- ✅ API `fetch()` nativa (sin necesidad de axios/node-fetch)
- ✅ Soporte de modulos ES2022 (top-level await)
- ✅ V8 10.2+ (mejoras de rendimiento)
- ✅ Soporte LTS activo (parches de seguridad)
- ✅ Multiplataforma (Windows/macOS/Linux)

**Gestor de Paquetes:**

```yaml
Principal: npm 9.0.0+
Alternativo: yarn/pnpm (eleccion del usuario)
Lock File: package-lock.json
```

---

## Lenguajes y Transpiladores

### JavaScript (Principal)

```yaml
Estandar: ES2022
Sistema de Modulos: CommonJS (require/module.exports)
Futuro: Migracion a ESM planificada (Story 6.2.x)
```

**Por que ES2022:**

- ✅ Class fields y metodos privados
- ✅ Top-level await
- ✅ Error cause
- ✅ Metodo Array.at()
- ✅ Object.hasOwn()

### TypeScript (Definiciones de Tipos)

```yaml
Version: 5.9.3
Uso: Solo definiciones de tipos (archivos .d.ts)
Compilacion: No usado (runtime JS puro)
Futuro: Migracion completa a TypeScript considerada para Q2 2026
```

**Uso Actual de TypeScript:**

```typescript
// index.d.ts - Definiciones de tipos para API publica
export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  dependencies?: string[];
}

export function executeAgent(agentId: string, args: Record<string, any>): Promise<any>;
```

**Configuracion de TypeScript:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  }
}
```

---

## Dependencias Core

### CLI y UX Interactivo

#### @clack/prompts (^0.11.0)

**Proposito:** Prompts CLI modernos con UX hermoso
**Uso:** Wizard interactivo, recoleccion de input del usuario
**Por que:** UX de primera clase, animaciones de spinner, barras de progreso

```javascript
import { select, confirm, spinner } from '@clack/prompts';

const agent = await select({
  message: 'Seleccionar agente:',
  options: [
    { value: 'dev', label: '💻 Desarrollador' },
    { value: 'qa', label: '🧪 Ingeniero QA' },
  ],
});
```

#### chalk (^4.1.2)

**Proposito:** Estilizado de strings en terminal
**Uso:** Salida coloreada, formateo
**Por que:** Multiplataforma, cero dependencias, API estable

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ Agente activado exitosamente'));
console.log(chalk.red('❌ Tarea fallida'));
```

#### picocolors (^1.1.1)

**Proposito:** Biblioteca de colores ligera (alternativa mas rapida a chalk)
**Uso:** Salida de color critica para rendimiento
**Por que:** 14x mas pequeno que chalk, 2x mas rapido

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ Salida rapida'));
```

#### ora (^5.4.1)

**Proposito:** Spinners de terminal
**Uso:** Indicadores de carga, operaciones asincronas
**Por que:** Spinners hermosos, personalizables, ampliamente usados

```javascript
const ora = require('ora');
const spinner = ora('Cargando agente...').start();
await loadAgent();
spinner.succeed('Agente cargado');
```

### Sistema de Archivos y Operaciones de Ruta

#### fs-extra (^11.3.2)

**Proposito:** Operaciones de sistema de archivos mejoradas
**Uso:** Copia de archivos, creacion de directorios, lectura/escritura JSON
**Por que:** Basado en Promise, utilidades adicionales sobre `fs` nativo

```javascript
const fs = require('fs-extra');
await fs.copy('origen', 'destino');
await fs.ensureDir('ruta/al/dir');
await fs.outputJson('config.json', data);
```

#### glob (^11.0.3)

**Proposito:** Coincidencia de patrones de archivos
**Uso:** Encontrar archivos por patrones (ej. `*.md`, `**/*.yaml`)
**Por que:** Rapido, soporta patrones gitignore

```javascript
const { glob } = require('glob');
const stories = await glob('docs/stories/**/*.md');
```

### Procesamiento YAML

#### yaml (^2.8.1)

**Proposito:** Parsing y serializacion YAML
**Uso:** Configs de agentes, workflows, plantillas
**Por que:** Rapido, cumple con especificacion, preserva comentarios

```javascript
const YAML = require('yaml');
const agent = YAML.parse(fs.readFileSync('agent.yaml', 'utf8'));
```

#### js-yaml (^4.1.0)

**Proposito:** Parser YAML alternativo (soporte legacy)
**Uso:** Parsing de archivos YAML antiguos
**Por que:** API diferente, usado en algun codigo legacy

```javascript
const yaml = require('js-yaml');
const doc = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
```

**Nota de Migracion:** Consolidar a una sola biblioteca YAML (Story 6.2.x)

### Procesamiento Markdown

#### @kayvan/markdown-tree-parser (^1.5.0)

**Proposito:** Parsear markdown a AST
**Uso:** Parsing de historias, analisis de estructura de documentos
**Por que:** Ligero, rapido, soporta GFM

```javascript
const { parseMarkdown } = require('@kayvan/markdown-tree-parser');
const ast = parseMarkdown(markdownContent);
```

### Ejecucion de Procesos

#### execa (^9.6.0)

**Proposito:** Mejor child_process
**Uso:** Ejecutar git, npm, herramientas CLI externas
**Por que:** Multiplataforma, basado en Promise, mejor manejo de errores

```javascript
const { execa } = require('execa');
const { stdout } = await execa('git', ['status']);
```

### Parsing de Linea de Comandos

#### commander (^14.0.1)

**Proposito:** Framework CLI
**Uso:** Parsing de argumentos de linea de comandos, subcomandos
**Por que:** Estandar de la industria, funcionalidades ricas, soporte TypeScript

```javascript
const { Command } = require('commander');
const program = new Command();

program
  .command('agent <name>')
  .description('Activar un agente')
  .action((name) => {
    console.log(`Activando agente: ${name}`);
  });
```

#### inquirer (^8.2.6)

**Proposito:** Prompts interactivos de linea de comandos
**Uso:** Recoleccion de input del usuario, wizards
**Por que:** Tipos de prompt ricos, soporte de validacion

```javascript
const inquirer = require('inquirer');
const answers = await inquirer.prompt([
  {
    type: 'list',
    name: 'agent',
    message: 'Seleccionar agente:',
    choices: ['dev', 'qa', 'architect'],
  },
]);
```

### Sandboxing y Seguridad

#### isolated-vm (^5.0.4)

**Proposito:** Isolate V8 para ejecucion JavaScript en sandbox
**Uso:** Ejecucion segura de scripts de usuario, ejecucion de tareas
**Por que:** Aislamiento de seguridad, limites de memoria, control de timeout

```javascript
const ivm = require('isolated-vm');
const isolate = new ivm.Isolate({ memoryLimit: 128 });
const context = await isolate.createContext();
```

### Validacion

#### validator (^13.15.15)

**Proposito:** Validadores y sanitizadores de strings
**Uso:** Validacion de entrada (URLs, emails, etc.)
**Por que:** Completo, bien testeado, sin dependencias

```javascript
const validator = require('validator');
if (validator.isURL(url)) {
  // URL valida
}
```

#### semver (^7.7.2)

**Proposito:** Parser y comparador de versionado semantico
**Uso:** Verificacion de versiones, resolucion de dependencias
**Por que:** Estandar de NPM, probado en batalla

```javascript
const semver = require('semver');
if (semver.satisfies('1.2.3', '>=1.0.0')) {
  // Version compatible
}
```

---

## Herramientas de Desarrollo

### Linting

#### ESLint (^9.38.0)

**Proposito:** Linter JavaScript/TypeScript
**Configuracion:** `.eslintrc.json`
**Plugins:**

- `@typescript-eslint/eslint-plugin` (^8.46.2)
- `@typescript-eslint/parser` (^8.46.2)

**Reglas Clave:**

```javascript
{
  "rules": {
    "no-console": "off",           // Permitir console en CLI
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"]
  }
}
```

### Formateo

#### Prettier (^3.5.3)

**Proposito:** Formateador de codigo
**Configuracion:** `.prettierrc`

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

#### yaml-lint (^1.7.0)

**Proposito:** Linter de archivos YAML
**Uso:** Validar configs de agentes, workflows, plantillas

### Git Hooks

#### husky (^9.1.7)

**Proposito:** Gestion de git hooks
**Uso:** Linting pre-commit, tests pre-push

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  }
}
```

#### lint-staged (^16.1.1)

**Proposito:** Ejecutar linters en archivos staged
**Configuracion:**

```json
{
  "lint-staged": {
    "**/*.md": ["prettier --write"],
    "**/*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Framework de Testing

### Jest (^30.2.0)

**Proposito:** Framework de testing
**Uso:** Tests unitarios, tests de integracion, cobertura

```javascript
// Test de ejemplo
describe('AgentExecutor', () => {
  it('deberia cargar configuracion del agente', async () => {
    const agent = await loadAgent('dev');
    expect(agent.name).toBe('developer');
  });
});
```

**Configuracion:**

```json
{
  "jest": {
    "testEnvironment": "node",
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

#### @types/jest (^30.0.0)

**Proposito:** Definiciones de tipos TypeScript para Jest
**Uso:** Escritura de tests type-safe

---

## Build y Deployment

### Versionado y Release

#### semantic-release (^25.0.2)

**Proposito:** Versionado semantico automatizado y releases
**Uso:** Publicacion NPM automatica, generacion de changelog

**Plugins:**

- `@semantic-release/changelog` (^6.0.3) - Generar CHANGELOG.md
- `@semantic-release/git` (^10.0.1) - Commitear assets de release

```json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/git"
    ]
  }
}
```

### Scripts de Build

```bash
# Construccion de paquetes
npm run build                  # Construir todos los paquetes
npm run build:agents           # Construir solo agentes
npm run build:teams            # Construir solo equipos

# Versionado
npm run version:patch          # Incrementar version patch
npm run version:minor          # Incrementar version minor
npm run version:major          # Incrementar version major

# Publicacion
npm run publish:dry-run        # Probar publicacion
npm run publish:preview        # Publicar tag preview
npm run publish:stable         # Publicar tag latest
```

---

## Integraciones Externas

### Servidores MCP

AIOX se integra con servidores Model Context Protocol (MCP):

```yaml
Servidores MCP:
  - clickup-direct: Integracion ClickUp (gestion de tareas)
  - context7: Busqueda de documentacion
  - exa-direct: Busqueda web
  - desktop-commander: Operaciones de archivos
  - docker-mcp: Gestion de Docker
  - ide: Integracion VS Code/Cursor
```

**Configuracion:** `.claude.json` o `.cursor/settings.json`

### Herramientas CLI

Herramientas CLI externas usadas por agentes:

```yaml
GitHub CLI (gh):
  Version: 2.x+
  Uso: Gestion de repositorios, creacion de PRs
  Instalar: https://cli.github.com

Railway CLI (railway):
  Version: 3.x+
  Uso: Automatizacion de deployment
  Instalar: npm i -g @railway/cli

Supabase CLI (supabase):
  Version: 1.x+
  Uso: Migraciones de base de datos, gestion de schema
  Instalar: npm i -g supabase

Git:
  Version: 2.30+
  Uso: Control de versiones
  Requerido: Si
```

### Servicios en la Nube

```yaml
Railway:
  Proposito: Deployment de aplicaciones
  API: Railway CLI

Supabase:
  Proposito: Base de datos PostgreSQL + Auth
  API: Supabase CLI + REST API

GitHub:
  Proposito: Hosting de repositorios, CI/CD
  API: GitHub CLI (gh) + Octokit

CodeRabbit:
  Proposito: Revision de codigo automatizada
  API: Integracion GitHub App
```

---

## Stack Futuro (Post-Migracion)

**Planificado para Q2-Q4 2026** (despues de reestructuracion de repositorio):

### Migracion a ESM

```javascript
// Actual: CommonJS
const agent = require('./agent');
module.exports = { executeAgent };

// Futuro: ES Modules
import { agent } from './agent.js';
export { executeAgent };
```

### TypeScript Completo

```typescript
// Migrar de JS + .d.ts a TypeScript completo
// Beneficios: Type safety, mejor refactoring, DX mejorado
```

### Herramientas de Build

```yaml
Bundler: esbuild o tsup
Razon: Builds rapidos, tree-shaking, minificacion
Objetivo: CLI ejecutable unico (opcional)
```

### Mejoras de Testing

```yaml
E2E Testing: Playwright (tests de automatizacion de browser)
Performance Testing: Benchmark.js (timing de workflows)
```

---

## Gestion de Dependencias

### Auditorias de Seguridad

```bash
# Ejecutar auditoria de seguridad
npm audit

# Corregir vulnerabilidades automaticamente
npm audit fix

# Verificar paquetes desactualizados
npm outdated
```

### Politica de Actualizacion

```yaml
Actualizaciones Major: Revision trimestral (Q1, Q2, Q3, Q4)
Parches de Seguridad: Inmediato (dentro de 48 horas)
Actualizaciones Minor: Revision mensual
Reduccion de Dependencias: Esfuerzo continuo
```

### Arbol de Dependencias

```bash
# Ver arbol de dependencias
npm ls --depth=2

# Encontrar paquetes duplicados
npm dedupe

# Analizar tamano del bundle
npx cost-of-modules
```

---

## Matriz de Compatibilidad de Versiones

| Componente       | Version | Compatibilidad | Notas                    |
| ---------------- | ------- | -------------- | ------------------------ |
| **Node.js**      | 18.0.0+ | Requerido      | LTS Activo               |
| **npm**          | 9.0.0+  | Requerido      | Gestor de paquetes       |
| **TypeScript**   | 5.9.3   | Recomendado    | Definiciones de tipos    |
| **ESLint**       | 9.38.0  | Requerido      | Linting                  |
| **Prettier**     | 3.5.3   | Requerido      | Formateo                 |
| **Jest**         | 30.2.0  | Requerido      | Testing                  |
| **Git**          | 2.30+   | Requerido      | Control de versiones     |
| **GitHub CLI**   | 2.x+    | Opcional       | Gestion de repositorios  |
| **Railway CLI**  | 3.x+    | Opcional       | Deployment               |
| **Supabase CLI** | 1.x+    | Opcional       | Gestion de base de datos |

---

## Consideraciones de Rendimiento

### Tamano del Bundle

```bash
# Tamano del bundle de produccion (minificado)
Total: ~5MB (incluye todas las dependencias)

# Dependencias criticas (siempre cargadas):
- commander: 120KB
- chalk: 15KB
- yaml: 85KB
- fs-extra: 45KB

# Dependencias opcionales (carga diferida):
- inquirer: 650KB (solo modo interactivo)
- @clack/prompts: 180KB (solo modo wizard)
```

### Tiempo de Inicio

```yaml
Cold Start: ~200ms (carga inicial)
Warm Start: ~50ms (modulos en cache)
Modo Yolo: ~100ms (saltar validacion)

Estrategia de Optimizacion:
  - Carga diferida de dependencias pesadas
  - Cache de configs YAML parseados
  - Usar require() condicionalmente
```

### Uso de Memoria

```yaml
Base: 30MB (Node.js + AIOX core)
Ejecucion de Agente: +10MB (por agente)
Procesamiento de Historia: +20MB (parsing de markdown)
Pico: ~100MB (workflow tipico)
```

---

## Notas Especificas por Plataforma

### Windows

```yaml
Separadores de Ruta: Barra invertida (\) - normalizado a barra (/)
Finales de Linea: CRLF - Git configurado para conversion automatica
Shell: PowerShell o CMD - execa maneja multiplataforma
Node.js: Instalador Windows desde nodejs.org
```

### macOS

```yaml
Separadores de Ruta: Barra (/)
Finales de Linea: LF
Shell: zsh (por defecto) o bash
Node.js: Homebrew (brew install node@18) o nvm
```

### Linux

```yaml
Separadores de Ruta: Barra (/)
Finales de Linea: LF
Shell: bash (por defecto) o zsh
Node.js: nvm, apt, yum, o binarios oficiales
```

---

## Variables de Entorno

```bash
# Configuracion AIOX
AIOX_DEBUG=true                    # Habilitar logging de debug
AIOX_CONFIG_PATH=/ruta/custom      # Ubicacion de config personalizada
AIOX_YOLO_MODE=true               # Forzar modo yolo

# Node.js
NODE_ENV=production                # Modo produccion
NODE_OPTIONS=--max-old-space-size=4096  # Aumentar limite de memoria

# Servicios Externos
CLICKUP_API_KEY=pk_xxx            # Integracion ClickUp
GITHUB_TOKEN=ghp_xxx              # Acceso API GitHub
RAILWAY_TOKEN=xxx                 # Deployment Railway
SUPABASE_ACCESS_TOKEN=xxx         # Auth Supabase CLI
```

---

## Documentos Relacionados

- [Estandares de Codigo](./coding-standards.md)
- [Arbol de Codigo](./source-tree.md)

---

## Historial de Versiones

| Version | Fecha      | Cambios                                                                                      | Autor            |
| ------- | ---------- | -------------------------------------------------------------------------------------------- | ---------------- |
| 1.0     | 2025-01-15 | Documentacion inicial del tech stack                                                         | Aria (architect) |
| 1.1     | 2025-12-14 | Actualizado aviso de migracion a SynkraAI/aiox-core, semantic-release a v25.0.2 [Story 6.10] | Dex (dev)        |

---

_Este es un estandar oficial del framework AIOX. Todas las elecciones de tecnologia deben alinearse con este stack._
