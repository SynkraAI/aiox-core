<!--
  Traducción: ES
  Original: /docs/en/guides/service-discovery.md
  Última sincronización: 2026-01-26
-->

# Guía de Descubrimiento de Servicios de AIOX

> 🌐 [EN](../../guides/service-discovery.md) | [PT](../../pt/guides/service-discovery.md) | **ES**

---

> Cómo descubrir, consultar y usar workers en el framework AIOX.

**Versión:** 2.1.0
**Última Actualización:** 2025-12-01

---

## Resumen

El sistema de Descubrimiento de Servicios permite encontrar y usar workers (tareas, plantillas, scripts, workflows) en todo el framework AIOX. El **Registro de Servicios** es el catálogo central que contiene metadatos sobre todos los workers disponibles.

### Conceptos Clave

| Concepto                  | Descripción                                                                   |
| ------------------------- | ----------------------------------------------------------------------------- |
| **Worker**                | Cualquier unidad ejecutable: tarea, plantilla, script, workflow               |
| **Registro de Servicios** | Catálogo central de todos los workers con metadatos                           |
| **Categoría**             | Tipo de worker: `task`, `template`, `script`, `checklist`, `workflow`, `data` |
| **Etiqueta**              | Label buscable para agrupar workers                                           |

---

## API del Registro de Servicios

### Cargando el Registro

```javascript
const { getRegistry, loadRegistry } = require('./.aiox-core/core/registry/registry-loader');

// Carga rápida (retorna datos del registro)
const registry = await loadRegistry();
console.log(`Cargados ${registry.totalWorkers} workers`);

// Cargador completo con métodos
const reg = getRegistry();
await reg.load();
```

### Consultando Workers

#### Obtener por ID

```javascript
const registry = getRegistry();
const worker = await registry.getById('create-story');

console.log(worker);
// {
//   id: 'create-story',
//   name: 'Create Story',
//   category: 'task',
//   path: '.aiox-core/development/tasks/po-create-story.md',
//   tags: ['task', 'creation', 'story', 'product'],
//   agents: ['po']
// }
```

#### Obtener por Categoría

```javascript
// Obtener todas las tareas
const tasks = await registry.getByCategory('task');
console.log(`Encontradas ${tasks.length} tareas`);

// Obtener todas las plantillas
const templates = await registry.getByCategory('template');
```

#### Obtener por Etiqueta

```javascript
// Etiqueta única
const devTasks = await registry.getByTag('development');

// Múltiples etiquetas (lógica AND)
const qaDevTasks = await registry.getByTags(['testing', 'development']);
```

#### Obtener Workers para un Agente

```javascript
// Obtener todos los workers asignados al agente dev
const devWorkers = await registry.getForAgent('dev');

// Obtener workers para múltiples agentes
const teamWorkers = await registry.getForAgents(['dev', 'qa']);
```

#### Búsqueda

```javascript
// Búsqueda de texto en nombres y descripciones de workers
const results = await registry.search('validate', { maxResults: 10 });

// Búsqueda dentro de categoría
const taskResults = await registry.search('story', {
  category: 'task',
  maxResults: 5,
});
```

### Información del Registro

```javascript
const registry = getRegistry();

// Obtener metadatos
const info = await registry.getInfo();
// { version: '1.0.0', generated: '2025-12-01', totalWorkers: 203 }

// Obtener resumen de categorías
const categories = await registry.getCategories();
// { task: 115, template: 52, script: 55, ... }

// Obtener todas las etiquetas
const tags = await registry.getTags();
// ['task', 'creation', 'story', 'testing', ...]

// Contar workers
const count = await registry.count();
// 203
```

---

## Comandos CLI

### `aiox discover`

Buscar workers en el registro.

```bash
# Buscar por texto
aiox discover "create story"

# Buscar por categoría
aiox discover --category task

# Buscar por etiqueta
aiox discover --tag testing

# Buscar para agente
aiox discover --agent dev

# Combinar filtros
aiox discover --category task --tag development --agent dev
```

**Salida:**

```
Encontrados 5 workers que coinciden con "create story":

  [task] po-create-story
         Ruta: .aiox-core/development/tasks/po-create-story.md
         Etiquetas: task, creation, story, product
         Agentes: po

  [task] dev-create-brownfield-story
         Ruta: .aiox-core/development/tasks/dev-create-brownfield-story.md
         Etiquetas: task, creation, brownfield
         Agentes: dev

  ...
```

### `aiox info`

Obtener información detallada sobre un worker específico.

```bash
# Obtener info del worker por ID
aiox info create-story

# Obtener info del worker con ruta completa
aiox info --path .aiox-core/development/tasks/po-create-story.md
```

**Salida:**

```
Worker: create-story
========================
Nombre:      Create Story
Categoría:   task
Ruta:        .aiox-core/development/tasks/po-create-story.md

Descripción:
  Crea una nueva historia de usuario desde plantilla con formato
  apropiado y criterios de aceptación.

Entradas:
  - story-title (string, requerido)
  - epic-id (string, opcional)
  - priority (string, opcional)

Salidas:
  - story-file-path (string)

Etiquetas:
  task, creation, story, product

Agentes:
  po

Rendimiento:
  Duración Promedio: 1m
  Cacheable: No
  Paralelizable: No
```

### `aiox list`

Listar workers por categoría o agente.

```bash
# Listar todas las tareas
aiox list tasks

# Listar todas las plantillas
aiox list templates

# Listar workers para agente
aiox list --agent dev

# Listar con paginación
aiox list tasks --page 1 --limit 20
```

---

## Tipos de Servicios

### Tareas

Definiciones de workflow ejecutables para agentes.

```yaml
# Estructura de tarea de ejemplo
task:
  name: create-story
  version: 1.0.0
  description: 'Crea una nueva historia de usuario'

inputs:
  - name: story-title
    type: string
    required: true

outputs:
  - name: story-file-path
    type: string

steps:
  - name: gather-requirements
    action: elicit
  - name: generate-story
    action: template-render
```

**Ubicación:** `.aiox-core/development/tasks/`

### Plantillas

Plantillas de documentos y código para generación.

| Plantilla                  | Propósito                          |
| -------------------------- | ---------------------------------- |
| `story-tmpl.yaml`          | Plantilla de documento de historia |
| `prd-tmpl.yaml`            | Plantilla de PRD                   |
| `architecture-tmpl.yaml`   | Plantilla de doc de arquitectura   |
| `component-react-tmpl.tsx` | Plantilla de componente React      |
| `ide-rules/*.md`           | Reglas específicas de IDE          |

**Ubicación:** `.aiox-core/product/templates/`

### Scripts

Utilidades JavaScript para automatización.

| Script                | Propósito                          |
| --------------------- | ---------------------------------- |
| `backup-manager.js`   | Operaciones de backup/restauración |
| `template-engine.js`  | Procesamiento de plantillas        |
| `git-wrapper.js`      | Operaciones Git                    |
| `security-checker.js` | Validación de seguridad            |

**Ubicación:** `.aiox-core/infrastructure/scripts/`

### Workflows

Procesos de desarrollo de múltiples pasos.

| Workflow                    | Caso de Uso                  |
| --------------------------- | ---------------------------- |
| `greenfield-fullstack.yaml` | Nuevo proyecto full-stack    |
| `brownfield-fullstack.yaml` | Mejora de proyecto existente |
| `greenfield-service.yaml`   | Nuevo servicio backend       |
| `brownfield-ui.yaml`        | Mejora de frontend existente |

**Ubicación:** `.aiox-core/development/workflows/`

### Checklists

Listas de verificación para validación de calidad.

| Checklist                | Propósito                       |
| ------------------------ | ------------------------------- |
| `story-dod-checklist.md` | Definición de Hecho de Historia |
| `pre-push-checklist.md`  | Validación pre-push             |
| `architect-checklist.md` | Revisión de arquitectura        |
| `release-checklist.md`   | Validación de release           |

**Ubicación:** `.aiox-core/product/checklists/`

---

## Registro de Workers

### Registro Automático

Los workers se registran automáticamente cuando se construye el registro:

```bash
# Reconstruir registro
node .aiox-core/core/registry/build-registry.js
```

El constructor escanea:

- `.aiox-core/development/tasks/**/*.md`
- `.aiox-core/product/templates/**/*`
- `.aiox-core/infrastructure/scripts/**/*.js`
- `.aiox-core/product/checklists/**/*.md`
- `.aiox-core/development/workflows/**/*.yaml`
- `.aiox-core/core/data/**/*`

### Esquema de Entrada de Worker

```json
{
  "id": "create-story",
  "name": "Create Story",
  "description": "Crea una nueva historia de usuario desde plantilla",
  "category": "task",
  "subcategory": "creation",
  "inputs": ["story-title", "epic-id"],
  "outputs": ["story-file-path"],
  "tags": ["task", "creation", "story", "product"],
  "path": ".aiox-core/development/tasks/po-create-story.md",
  "taskFormat": "TASK-FORMAT-V1",
  "executorTypes": ["Agent", "Worker"],
  "performance": {
    "avgDuration": "1m",
    "cacheable": false,
    "parallelizable": false
  },
  "agents": ["po"],
  "metadata": {
    "source": "development",
    "addedVersion": "1.0.0"
  }
}
```

---

## Caché

El cargador del registro implementa caché inteligente:

| Característica           | Descripción                              |
| ------------------------ | ---------------------------------------- |
| **Caché TTL**            | 5 minutos de expiración por defecto      |
| **Búsquedas Indexadas**  | O(1) por ID, categoría, etiqueta         |
| **Carga Diferida**       | Registro cargado en primera consulta     |
| **Actualización Manual** | Forzar recarga con `registry.load(true)` |

### Operaciones de Caché

```javascript
const registry = getRegistry();

// Forzar recarga (omitir caché)
await registry.load(true);

// Limpiar caché
registry.clearCache();

// Verificar si está en caché
const isCached = registry.isCached();
```

---

## Ejemplos de Código

### Encontrar Todas las Tareas para un Agente

```javascript
const { getRegistry } = require('./.aiox-core/core/registry/registry-loader');

async function getAgentTasks(agentId) {
  const registry = getRegistry();
  const tasks = await registry.getForAgent(agentId);

  return tasks.filter((w) => w.category === 'task');
}

// Uso
const devTasks = await getAgentTasks('dev');
console.log(`El agente dev tiene ${devTasks.length} tareas`);
```

### Buscar y Ejecutar Tarea

```javascript
const { getRegistry } = require('./.aiox-core/core/registry/registry-loader');
const { TaskExecutor } = require('./.aiox-core/development/scripts/task-executor');

async function findAndExecute(searchTerm, inputs) {
  const registry = getRegistry();
  const results = await registry.search(searchTerm, {
    category: 'task',
    maxResults: 1,
  });

  if (results.length === 0) {
    throw new Error(`No se encontró tarea para: ${searchTerm}`);
  }

  const task = results[0];
  const executor = new TaskExecutor(task.path);
  return executor.execute(inputs);
}

// Uso
await findAndExecute('create story', {
  'story-title': 'Implementar autenticación de usuario',
  'epic-id': 'EPIC-001',
});
```

### Listar Workers por Categoría

```javascript
const { getRegistry } = require('./.aiox-core/core/registry/registry-loader');

async function listByCategory() {
  const registry = getRegistry();
  const categories = await registry.getCategories();

  for (const [category, count] of Object.entries(categories)) {
    console.log(`${category}: ${count} workers`);
  }
}

// Salida:
// task: 115 workers
// template: 52 workers
// script: 55 workers
// checklist: 11 workers
// workflow: 7 workers
// data: 3 workers
```

---

## Solución de Problemas

### El Registro No Carga

```bash
# Verificar que el archivo del registro existe
ls .aiox-core/core/registry/service-registry.json

# Reconstruir registro
node .aiox-core/core/registry/build-registry.js

# Validar registro
node .aiox-core/core/registry/validate-registry.js
```

### Worker No Encontrado

1. Verificar que el archivo del worker existe en la ubicación esperada
2. Verificar que el archivo tiene frontmatter YAML apropiado
3. Reconstruir registro para incluir nuevos workers
4. Verificar categoría y etiquetas en la consulta de búsqueda

### Problemas de Rendimiento

```javascript
// Verificar estado del caché
const registry = getRegistry();
console.log('En caché:', registry.isCached());

// Limpiar caché si está obsoleto
registry.clearCache();
await registry.load(true);
```

---

## Documentación Relacionada

- [Arquitectura del Sistema de Módulos](../architecture/module-system.md)
- [Guía de Quality Gates](./quality-gates.md)

---

_Guía de Descubrimiento de Servicios de Synkra AIOX v4_
