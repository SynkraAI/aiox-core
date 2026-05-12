# Guia de Testing de Synkra AIOX

> [EN](../../guides/testing-guide.md) | [PT](../../pt/guides/testing-guide.md) | **ES**

---

> Guia completa de la estrategia de testing, herramientas y mejores practicas para Synkra AIOX.

**Version:** 2.1.0
**Ultima Actualizacion:** 2026-01-29

---

## Tabla de Contenidos

1. [Vision General](#vision-general)
2. [Estrategia de Testing](#estrategia-de-testing)
3. [Tests Unitarios](#tests-unitarios)
4. [Tests de Integracion](#tests-de-integracion)
5. [Tests End-to-End](#tests-end-to-end)
6. [Tests de Agentes](#tests-de-agentes)
7. [Testing Cross-Platform](#testing-cross-platform)
8. [Cobertura y Metricas](#cobertura-y-metricas)
9. [Integracion CI/CD](#integracion-cicd)
10. [Escribiendo Buenos Tests](#escribiendo-buenos-tests)
11. [Mocking y Fixtures](#mocking-y-fixtures)
12. [Referencia de Comandos NPM](#referencia-de-comandos-npm)
13. [Solucion de Problemas](#solucion-de-problemas)

---

## Vision General

AIOX sigue una estrategia de testing integral que asegura la calidad del codigo en todas las capas del framework. Nuestra filosofia de testing esta construida sobre:

- **Desarrollo Guiado por Tests (TDD)** para funcionalidad core
- **Testing por Capas** con tests unitarios, de integracion y E2E
- **Verificacion Cross-Platform** para Windows, macOS y Linux
- **Testing Especifico de Agentes** para comportamientos de agentes IA
- **Quality Gates Automatizados** integrados con CI/CD

### Piramide de Testing

```
                    ┌─────────────┐
                    │     E2E     │  ← Pocos, Lentos, Costosos
                    │   Tests     │
                    ├─────────────┤
                    │ Integracion │  ← Algunos, Velocidad Media
                    │   Tests     │
                    ├─────────────┤
                    │  Unitarios  │  ← Muchos, Rapidos, Economicos
                    │   Tests     │
                    └─────────────┘
```

| Capa        | Cantidad | Velocidad | Objetivo de Cobertura |
| ----------- | -------- | --------- | --------------------- |
| Unitarios   | 100+     | < 30s     | 80%+ lineas           |
| Integracion | 30-50    | 1-5m      | Rutas criticas        |
| E2E         | 10-20    | 5-15m     | Flujos de usuario     |

---

## Estrategia de Testing

### Estructura de Directorios

```
tests/
├── unit/                    # Tests unitarios
│   ├── quality-gates/       # Componentes de quality gate
│   ├── squad/               # Tests del sistema de squads
│   ├── mcp/                 # Tests de configuracion MCP
│   ├── manifest/            # Tests de manejo de manifests
│   └── documentation-integrity/  # Tests del generador de docs
├── integration/             # Tests de integracion
│   ├── squad/               # Integracion del squad designer
│   ├── windows/             # Tests especificos de Windows
│   └── *.test.js            # Tests de integracion generales
├── e2e/                     # Tests end-to-end
│   └── story-creation-clickup.test.js
├── performance/             # Benchmarks de rendimiento
│   ├── decision-logging-benchmark.test.js
│   └── tools-system-benchmark.test.js
├── security/                # Tests de seguridad
│   └── core-security.test.js
├── health-check/            # Tests del sistema de health check
│   ├── engine.test.js
│   └── healers.test.js
├── regression/              # Tests de regresion
│   └── tools-migration.test.js
├── setup.js                 # Setup global de tests
└── fixtures/                # Fixtures y mocks de tests
```

### Convencion de Nombres de Tests

| Tipo        | Patron                        | Ejemplo                              |
| ----------- | ----------------------------- | ------------------------------------ |
| Unitario    | `*.test.js` o `*.spec.js`     | `greeting-builder.test.js`           |
| Integracion | `*.test.js` en `integration/` | `contextual-greeting.test.js`        |
| E2E         | `*.test.js` en `e2e/`         | `story-creation-clickup.test.js`     |
| Benchmark   | `*-benchmark.test.js`         | `decision-logging-benchmark.test.js` |

---

## Tests Unitarios

Los tests unitarios verifican funciones y clases individuales de forma aislada.

### Configuracion (jest.config.js)

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',

  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/.aiox-core/**/__tests__/**/*.test.js',
  ],

  testTimeout: 30000,
  verbose: true,

  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  coverageThreshold: {
    global: {
      branches: 25,
      functions: 30,
      lines: 30,
      statements: 30,
    },
    '.aiox-core/core/': {
      lines: 45,
    },
  },
};
```

### Escribiendo Tests Unitarios

```javascript
/**
 * Tests Unitarios del Quality Gate Manager
 *
 * @story 2.10 - Quality Gate Manager
 */

const {
  QualityGateManager,
} = require('../../../.aiox-core/core/quality-gates/quality-gate-manager');

describe('QualityGateManager', () => {
  let manager;

  beforeEach(() => {
    manager = new QualityGateManager({
      layer1: { enabled: true },
      layer2: { enabled: true },
      layer3: { enabled: true },
    });
  });

  describe('constructor', () => {
    it('deberia crear manager con config por defecto', () => {
      const defaultManager = new QualityGateManager();
      expect(defaultManager).toBeDefined();
      expect(defaultManager.layers).toBeDefined();
    });

    it('deberia crear manager con config personalizada', () => {
      const customManager = new QualityGateManager({
        layer1: { enabled: false },
      });
      expect(customManager.layers.layer1.enabled).toBe(false);
    });
  });

  describe('runLayer', () => {
    it('deberia lanzar error para numero de capa invalido', async () => {
      await expect(manager.runLayer(4)).rejects.toThrow('Invalid layer number: 4');
    });
  });

  describe('formatDuration', () => {
    it('deberia formatear milisegundos', () => {
      expect(manager.formatDuration(500)).toBe('500ms');
    });

    it('deberia formatear segundos', () => {
      expect(manager.formatDuration(5000)).toBe('5.0s');
    });

    it('deberia formatear minutos', () => {
      expect(manager.formatDuration(120000)).toBe('2.0m');
    });
  });
});
```

### Mejores Practicas de Organizacion de Tests

```javascript
describe('ComponentName', () => {
  // Setup y teardown
  beforeAll(() => {
    /* Setup global */
  });
  afterAll(() => {
    /* Limpieza global */
  });
  beforeEach(() => {
    /* Setup por test */
  });
  afterEach(() => {
    /* Limpieza por test */
  });

  // Agrupar por metodo/funcionalidad
  describe('methodName', () => {
    it('deberia manejar entrada valida', () => {});
    it('deberia lanzar error con entrada invalida', () => {});
    it('deberia manejar casos limite', () => {});
  });

  describe('otro metodo', () => {
    // Mas tests...
  });
});
```

---

## Tests de Integracion

Los tests de integracion verifican que multiples componentes funcionen correctamente juntos.

### Setup para Tests de Integracion

```javascript
// tests/setup.js
process.env.NODE_ENV = 'test';
process.env.AIOX_DEBUG = 'false';

// Omitir tests de integracion por defecto
if (process.env.SKIP_INTEGRATION_TESTS === undefined) {
  process.env.SKIP_INTEGRATION_TESTS = 'true';
}

// Timeout global de tests (aumentado para CI)
jest.setTimeout(process.env.CI ? 30000 : 10000);

// Helper para omitir condicionalmente tests de integracion
global.describeIntegration =
  process.env.SKIP_INTEGRATION_TESTS === 'true' ? describe.skip : describe;

global.testIntegration = process.env.SKIP_INTEGRATION_TESTS === 'true' ? test.skip : test;
```

### Escribiendo Tests de Integracion

```javascript
/**
 * Tests de Integracion para Sistema de Saludo Contextual
 *
 * Testing end-to-end de:
 * - Los 3 tipos de sesion
 * - Git configurado vs no configurado
 * - Filtrado de visibilidad de comandos
 * - Escenarios de fallback
 */

const GreetingBuilder = require('../../.aiox-core/development/scripts/greeting-builder');

describe('Tests de Integracion de Saludo Contextual', () => {
  let builder;

  beforeEach(() => {
    builder = new GreetingBuilder();
  });

  describeIntegration('Generacion de Saludo End-to-End', () => {
    test('deberia generar saludo completo de sesion nueva', async () => {
      const greeting = await builder.build({
        sessionType: 'new',
        agent: 'dev',
        gitConfigured: true,
      });

      expect(greeting).toContain('Welcome');
      expect(greeting).toContain('Quick Commands');
    });

    test('deberia manejar git no configurado graciosamente', async () => {
      const greeting = await builder.build({
        sessionType: 'new',
        agent: 'dev',
        gitConfigured: false,
      });

      expect(greeting).not.toContain('git commit');
    });
  });
});
```

### Ejecutando Tests de Integracion

```bash
# Ejecutar todos los tests incluyendo integracion
SKIP_INTEGRATION_TESTS=false npm test

# Ejecutar solo tests de integracion
npm test -- --testPathPattern=integration

# Ejecutar test de integracion especifico
npm test -- tests/integration/contextual-greeting.test.js
```

---

## Tests End-to-End

Los tests E2E verifican flujos de usuario completos de principio a fin.

### Estructura de Tests E2E

```javascript
/**
 * Test E2E: Creacion de Story con ClickUp
 *
 * Prueba el flujo completo:
 * 1. Usuario inicia creacion de story
 * 2. Story se genera desde template
 * 3. Story se sincroniza a ClickUp
 * 4. Archivo local se actualiza con ID de ClickUp
 */

describe('E2E Creacion de Story', () => {
  const TEST_PROJECT = 'test-project';

  beforeAll(async () => {
    // Configurar entorno de test
    await setupTestProject(TEST_PROJECT);
  });

  afterAll(async () => {
    // Limpiar artefactos de test
    await cleanupTestProject(TEST_PROJECT);
  });

  test('deberia crear story y sincronizar a ClickUp', async () => {
    // Paso 1: Crear story
    const story = await createStory({
      title: 'Test Story',
      type: 'feature',
    });

    expect(story.id).toBeDefined();
    expect(story.file).toMatch(/\.md$/);

    // Paso 2: Verificar sincronizacion con ClickUp
    const clickupTask = await getClickUpTask(story.clickupId);
    expect(clickupTask.name).toBe('Test Story');

    // Paso 3: Verificar actualizacion de archivo local
    const localContent = await readFile(story.file);
    expect(localContent).toContain(story.clickupId);
  }, 60000); // Timeout extendido para E2E
});
```

### Mejores Practicas de Tests E2E

| Practica                  | Descripcion                                      |
| ------------------------- | ------------------------------------------------ |
| **Entorno Aislado**       | Cada test E2E debe tener sus propios datos       |
| **Limpieza Explicita**    | Siempre limpiar recursos creados                 |
| **Timeouts Extendidos**   | Tests E2E necesitan timeouts mas largos (30-60s) |
| **Servicios Reales**      | Usar servicios reales, no mocks                  |
| **Idempotente**           | Los tests deben ser repetibles                   |

---

## Tests de Agentes

Probar agentes IA requiere consideraciones especiales para comportamiento de persona y ejecucion de comandos.

### Categorias de Tests de Agentes

| Categoria         | Prueba               | Proposito                              |
| ----------------- | -------------------- | -------------------------------------- |
| **Persona**       | Estilo de respuesta  | Verificar que agente mantiene caracter |
| **Comandos**      | Ejecucion de tareas  | Verificar que comandos funcionan       |
| **Fallback**      | Manejo de errores    | Verificar degradacion gracil           |
| **Compatibilidad**| Soporte legacy       | Verificar que agentes viejos funcionan |

### Tests de Compatibilidad Retroactiva de Agentes

```javascript
/**
 * Tests de Compatibilidad Retroactiva de Agentes
 *
 * Asegura que agentes de versiones anteriores de AIOX continuen funcionando.
 */

const { loadAgent } = require('../../.aiox-core/core/registry/agent-loader');

describe('Compatibilidad Retroactiva de Agentes', () => {
  describe('Formato de Agente Legacy (v1.x)', () => {
    test('deberia cargar agente sin metadata de visibilidad', async () => {
      const agent = await loadAgent('legacy-agent-v1');

      expect(agent).toBeDefined();
      expect(agent.name).toBeDefined();
      expect(agent.commands).toBeDefined();
    });

    test('deberia aplicar visibilidad por defecto cuando falta', async () => {
      const agent = await loadAgent('legacy-agent-v1');

      // Visibilidad por defecto deberia aplicarse
      agent.commands.forEach((cmd) => {
        expect(cmd.visibility).toBeDefined();
      });
    });
  });

  describe('Formato de Agente Actual (v2.x)', () => {
    test('deberia cargar agente con metadata completa', async () => {
      const agent = await loadAgent('dev');

      expect(agent.slashPrefix).toBeDefined();
      expect(agent.icon).toBeDefined();
      expect(agent.persona).toBeDefined();
    });
  });
});
```

### Probando Comandos de Agentes

```javascript
describe('Comandos de Agentes', () => {
  let agent;

  beforeAll(async () => {
    agent = await activateAgent('dev');
  });

  test('*help deberia mostrar comandos disponibles', async () => {
    const result = await agent.executeCommand('*help');

    expect(result.output).toContain('Available Commands');
    expect(result.exitCode).toBe(0);
  });

  test('*create-story deberia validar campos requeridos', async () => {
    await expect(agent.executeCommand('*create-story')).rejects.toThrow(
      'Missing required field: title'
    );
  });
});
```

---

## Testing Cross-Platform

AIOX soporta Windows, macOS y Linux. El testing cross-platform asegura comportamiento consistente.

### Archivos de Test Especificos por Plataforma

```
tests/
├── integration/
│   ├── windows/
│   │   └── shell-compat.test.js    # Tests de shell Windows
│   ├── macos/
│   │   └── permission.test.js      # Tests de permisos macOS
│   └── linux/
│       └── symlink.test.js         # Tests de symlinks Linux
```

### Utilidades de Test Cross-Platform

```javascript
/**
 * Utilidades de test cross-platform
 */

const os = require('os');
const path = require('path');

const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

// Describe especifico por plataforma
const describeWindows = isWindows ? describe : describe.skip;
const describeMacOS = isMacOS ? describe : describe.skip;
const describeLinux = isLinux ? describe : describe.skip;

// Normalizar separadores de path para assertions
function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

// Obtener directorio temporal apropiado para la plataforma
function getTempDir() {
  return path.join(os.tmpdir(), 'aiox-tests');
}

module.exports = {
  isWindows,
  isMacOS,
  isLinux,
  describeWindows,
  describeMacOS,
  describeLinux,
  normalizePath,
  getTempDir,
};
```

### Tests Especificos de Windows

```javascript
/**
 * Tests de Compatibilidad de Shell de Windows
 */

const { describeWindows } = require('../utils/platform');

describeWindows('Compatibilidad de Shell de Windows', () => {
  test('deberia manejar separadores de path de Windows', () => {
    const path = 'C:\\Users\\test\\project';
    const normalized = normalizePath(path);

    expect(normalized).toBe('C:/Users/test/project');
  });

  test('deberia ejecutar comandos PowerShell', async () => {
    const result = await executeShell('Get-Location', { shell: 'powershell' });

    expect(result.exitCode).toBe(0);
  });

  test('deberia manejar fallback a cmd.exe', async () => {
    const result = await executeShell('dir', { shell: 'cmd' });

    expect(result.exitCode).toBe(0);
  });
});
```

### Configuracion de Matriz CI

```yaml
# .github/workflows/test.yml
name: Tests Cross-Platform

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
      - run: npm test

      - name: Ejecutar Tests Especificos de Plataforma
        run: npm run test:platform
```

---

## Cobertura y Metricas

### Configuracion de Cobertura

```javascript
// jest.config.js - Seccion de cobertura
module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '.aiox-core/**/*.js',
    'bin/**/*.js',
    'packages/**/*.js',
    'scripts/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/*.test.js',
    '!**/*.spec.js',
    // Excluir templates y archivos generados
    '!.aiox-core/development/templates/**',
    '!.aiox-core/product/templates/**',
    '!**/dist/**',
    // Excluir modulos con I/O intensivo (mejor para tests de integracion)
    '!.aiox-core/core/health-check/checks/**',
    '!.aiox-core/core/config/**',
    '!.aiox-core/core/manifest/**',
    '!.aiox-core/core/registry/**',
    '!.aiox-core/core/utils/**',
  ],

  coverageThreshold: {
    global: {
      branches: 25,
      functions: 30,
      lines: 30,
      statements: 30,
    },
    '.aiox-core/core/': {
      lines: 45,
    },
  },

  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/.husky/', '/dist/'],
};
```

### Objetivos de Cobertura

| Modulo            | Objetivo | Actual | Notas               |
| ----------------- | -------- | ------ | ------------------- |
| **Global**        | 30%      | ~31%   | Linea base minima   |
| **Core**          | 45%      | ~47%   | Logica de negocio   |
| **Quality Gates** | 80%      | TBD    | Ruta critica        |
| **Sistema Squad** | 70%      | TBD    | Cara al usuario     |

### Viendo Reportes de Cobertura

```bash
# Generar reporte de cobertura
npm run test:coverage

# Abrir reporte HTML (macOS)
open coverage/lcov-report/index.html

# Abrir reporte HTML (Windows)
start coverage/lcov-report/index.html

# Abrir reporte HTML (Linux)
xdg-open coverage/lcov-report/index.html
```

### Estructura del Reporte de Cobertura

```
coverage/
├── lcov-report/          # Reporte HTML
│   ├── index.html        # Vista general
│   └── .aiox-core/       # Cobertura por modulo
├── lcov.info             # Formato LCOV (para CI)
├── coverage-summary.json # Resumen JSON
└── clover.xml            # Formato Clover
```

---

## Integracion CI/CD

### Workflow de GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    name: Tests Unitarios
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar tests unitarios
        run: npm test

      - name: Subir cobertura
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  integration-tests:
    name: Tests de Integracion
    runs-on: ubuntu-latest
    needs: unit-tests

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar tests de integracion
        run: SKIP_INTEGRATION_TESTS=false npm test -- --testPathPattern=integration
        env:
          CLICKUP_API_KEY: ${{ secrets.CLICKUP_API_KEY }}

  quality-gate:
    name: Quality Gate
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: TypeCheck
        run: npm run typecheck

      - name: Umbral de cobertura
        run: npm run test:coverage -- --coverageReporters=text-summary
```

### Hook Pre-commit

```bash
#!/bin/sh
# .husky/pre-commit

# Ejecutar lint-staged
npx lint-staged

# Ejecutar tests unitarios rapidos
npm test -- --passWithNoTests --testPathIgnorePatterns=integration,e2e
```

### Integracion con Quality Gate

El Sistema de Quality Gate de AIOX (ver [Guia de Quality Gates](./quality-gates.md)) integra testing en multiples capas:

| Capa        | Tipo de Test                  | Cuando         |
| ----------- | ----------------------------- | -------------- |
| **Capa 1**  | Unitario + Lint + TypeCheck   | Pre-commit     |
| **Capa 2**  | Integracion + Review IA       | Creacion de PR |
| **Capa 3**  | E2E + Review Humano           | Antes de merge |

---

## Escribiendo Buenos Tests

### Estructura de Test (Patron AAA)

```javascript
test('deberia calcular precio total con descuento', () => {
  // Arrange - Configurar datos y condiciones de test
  const cart = new ShoppingCart();
  cart.addItem({ name: 'Widget', price: 100 });
  cart.addItem({ name: 'Gadget', price: 50 });
  const discount = 0.1; // 10% de descuento

  // Act - Ejecutar el codigo bajo prueba
  const total = cart.calculateTotal(discount);

  // Assert - Verificar los resultados
  expect(total).toBe(135); // (100 + 50) * 0.9
});
```

### Guias de Nombres de Tests

| Malo            | Bueno                                                       |
| --------------- | ----------------------------------------------------------- |
| `test('test1')` | `test('deberia retornar null para entrada vacia')`          |
| `test('works')` | `test('deberia calcular impuesto correctamente')`           |
| `test('error')` | `test('deberia lanzar ValidationError para email invalido')`|

### Casos Limite a Probar

```javascript
describe('validateEmail', () => {
  // Camino feliz
  test('deberia aceptar email valido', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  // Casos limite
  test('deberia rechazar string vacio', () => {
    expect(validateEmail('')).toBe(false);
  });

  test('deberia rechazar null', () => {
    expect(validateEmail(null)).toBe(false);
  });

  test('deberia rechazar undefined', () => {
    expect(validateEmail(undefined)).toBe(false);
  });

  // Condiciones de frontera
  test('deberia aceptar email con parte local de un caracter', () => {
    expect(validateEmail('a@example.com')).toBe(true);
  });

  test('deberia rechazar email sin simbolo @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  // Caracteres especiales
  test('deberia aceptar email con signo mas', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });
});
```

### Patrones de Tests Asincronos

```javascript
// Usando async/await (recomendado)
test('deberia obtener datos de usuario', async () => {
  const user = await fetchUser(123);
  expect(user.name).toBe('John');
});

// Probando rechazo de promesa
test('deberia rechazar para usuario inexistente', async () => {
  await expect(fetchUser(999)).rejects.toThrow('User not found');
});

// Probando con callback done (legacy)
test('deberia llamar callback con datos', (done) => {
  fetchUserCallback(123, (err, user) => {
    expect(err).toBeNull();
    expect(user.name).toBe('John');
    done();
  });
});
```

### Aislamiento de Tests

```javascript
describe('FileManager', () => {
  let tempDir;
  let fileManager;

  beforeEach(async () => {
    // Crear directorio temporal aislado para cada test
    tempDir = await createTempDir();
    fileManager = new FileManager(tempDir);
  });

  afterEach(async () => {
    // Limpiar despues de cada test
    await removeTempDir(tempDir);
  });

  test('deberia crear archivo', async () => {
    await fileManager.write('test.txt', 'content');
    const exists = await fileManager.exists('test.txt');
    expect(exists).toBe(true);
  });

  test('no deberia ver archivos de otros tests', async () => {
    // Este test comienza con un directorio limpio
    const files = await fileManager.list();
    expect(files).toHaveLength(0);
  });
});
```

---

## Mocking y Fixtures

### Basicos de Mocking en Jest

```javascript
// Mock de un modulo
jest.mock('fs-extra');
const fs = require('fs-extra');

// Implementacion mock
fs.readFile.mockResolvedValue('file content');
fs.writeFile.mockResolvedValue(undefined);

// Valor de retorno mock
fs.existsSync.mockReturnValue(true);

// Implementacion mock para llamada especifica
fs.readFile.mockImplementation((path) => {
  if (path === 'config.json') {
    return Promise.resolve('{"key": "value"}');
  }
  return Promise.reject(new Error('File not found'));
});
```

### Creando Fixtures de Test

```javascript
// tests/fixtures/agent-fixtures.js
const MOCK_AGENT = {
  name: 'test-agent',
  slashPrefix: 'test',
  icon: '🧪',
  persona: {
    role: 'Test Agent',
    expertise: ['testing'],
  },
  commands: [
    {
      name: '*test',
      description: 'Run tests',
      visibility: 'all',
    },
  ],
};

const MOCK_SQUAD = {
  name: 'test-squad',
  version: '1.0.0',
  agents: [MOCK_AGENT],
  tasks: [],
};

module.exports = {
  MOCK_AGENT,
  MOCK_SQUAD,
};
```

### Usando Fixtures en Tests

```javascript
const { MOCK_AGENT, MOCK_SQUAD } = require('../fixtures/agent-fixtures');

describe('AgentLoader', () => {
  test('deberia cargar agente desde fixture', async () => {
    // Mock del sistema de archivos para retornar datos de fixture
    jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(MOCK_AGENT));

    const agent = await loadAgent('test-agent');

    expect(agent.name).toBe(MOCK_AGENT.name);
    expect(agent.commands).toHaveLength(1);
  });
});
```

### Mocking de Servicios Externos

```javascript
// Mock de API de ClickUp
jest.mock('../../.aiox-core/integrations/clickup-client');
const clickupClient = require('../../.aiox-core/integrations/clickup-client');

describe('Sincronizacion de Story', () => {
  beforeEach(() => {
    // Resetear mocks antes de cada test
    jest.clearAllMocks();

    // Configurar implementaciones mock por defecto
    clickupClient.createTask.mockResolvedValue({
      id: 'task-123',
      name: 'Test Task',
    });

    clickupClient.updateTask.mockResolvedValue({
      id: 'task-123',
      status: 'in progress',
    });
  });

  test('deberia crear tarea en ClickUp', async () => {
    const result = await syncStory({ title: 'New Feature' });

    expect(clickupClient.createTask).toHaveBeenCalledWith({
      name: 'New Feature',
      list_id: expect.any(String),
    });
    expect(result.clickupId).toBe('task-123');
  });

  test('deberia manejar errores de API de ClickUp', async () => {
    clickupClient.createTask.mockRejectedValue(new Error('API rate limited'));

    await expect(syncStory({ title: 'New Feature' })).rejects.toThrow(
      'Failed to sync: API rate limited'
    );
  });
});
```

### Testing de Snapshots

```javascript
describe('GreetingBuilder', () => {
  test('deberia generar formato de saludo consistente', async () => {
    const builder = new GreetingBuilder();
    const greeting = await builder.build({
      agent: 'dev',
      sessionType: 'new',
      timestamp: new Date('2025-01-01T00:00:00Z'), // Timestamp fijo
    });

    // Comparacion de snapshot
    expect(greeting).toMatchSnapshot();
  });
});
```

---

## Referencia de Comandos NPM

### Comandos Basicos

| Comando                 | Descripcion                          |
| ----------------------- | ------------------------------------ |
| `npm test`              | Ejecutar todos los tests             |
| `npm run test:watch`    | Ejecutar tests en modo watch         |
| `npm run test:coverage` | Ejecutar tests con reporte cobertura |

### Comandos de Tests Filtrados

```bash
# Ejecutar tests que coincidan con patron
npm test -- --testPathPattern=unit

# Ejecutar archivo de test especifico
npm test -- tests/unit/greeting-builder.test.js

# Ejecutar tests que coincidan con nombre
npm test -- --testNamePattern="should validate"

# Ejecutar tests en directorio especifico
npm test -- tests/integration/
```

### Comandos de Cobertura

```bash
# Generar reporte completo de cobertura
npm run test:coverage

# Cobertura con reporter especifico
npm test -- --coverage --coverageReporters=text

# Cobertura para archivos especificos
npm test -- --coverage --collectCoverageFrom="src/**/*.js"
```

### Opciones de Modo Watch

```bash
# Watch todos los tests
npm run test:watch

# Watch archivos especificos
npm test -- --watch --testPathPattern=unit

# Watch solo archivos modificados
npm test -- --watchAll=false --watch
```

### Modo Debug

```bash
# Ejecutar con salida verbose
npm test -- --verbose

# Ejecutar test individual para debugging
npm test -- --runInBand tests/unit/specific.test.js

# Ejecutar con debugger de Node
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Comandos Especificos de CI

```bash
# Ejecutar en modo CI (sin colores, cobertura, etc.)
npm test -- --ci

# Ejecutar con max workers
npm test -- --maxWorkers=4

# Detener en primer fallo
npm test -- --bail

# Ejecutar solo archivos modificados (Git)
npm test -- --changedSince=main
```

---

## Solucion de Problemas

### Problemas Comunes

| Problema             | Solucion                                             |
| -------------------- | ---------------------------------------------------- |
| Tests timeout        | Aumentar `testTimeout` en config o test especifico   |
| Tests async cuelgan  | Asegurar que todas las promesas estan awaited        |
| Mock no funciona     | Verificar que mock esta antes de `require()`         |
| Cobertura baja       | Agregar patrones `--collectCoverageFrom`             |
| Tests inestables     | Verificar estado compartido, usar limpieza `beforeEach` |

### Debuggeando Tests que Cuelgan

```javascript
// Agregar timeout a test especifico
test('operacion lenta', async () => {
  // ...
}, 60000); // 60 segundos de timeout

// Debug con salida de consola
test('debug test', async () => {
  console.log('Paso 1');
  await step1();
  console.log('Paso 2');
  await step2();
  console.log('Listo');
});
```

### Arreglando Problemas de Mock

```javascript
// Incorrecto: Mock despues de require
const myModule = require('./myModule');
jest.mock('./myModule');

// Correcto: Mock antes de require
jest.mock('./myModule');
const myModule = require('./myModule');

// O usar jest.doMock para mocking dinamico
beforeEach(() => {
  jest.resetModules();
  jest.doMock('./myModule', () => ({
    func: jest.fn().mockReturnValue('mocked'),
  }));
});
```

### Resolviendo Problemas de Cobertura

```javascript
// Cobertura no recolecta? Verificar paths
module.exports = {
  collectCoverageFrom: [
    // Usar paths relativos desde raiz del proyecto
    'src/**/*.js',
    // Patrones de exclusion
    '!**/node_modules/**',
  ],
  // Directorios raiz para buscar
  roots: ['<rootDir>'],
};
```

---

## Documentacion Relacionada

- [Guia de Quality Gates](./quality-gates.md) - Chequeos automatizados de calidad
- [Arquitectura CI/CD](../../architecture/ci-cd.md) - Configuracion de pipeline
- [Guia de Contribucion](../../how-to-contribute-with-pull-requests.md) - Workflow de desarrollo

---

_Guia de Testing de Synkra AIOX v4_
