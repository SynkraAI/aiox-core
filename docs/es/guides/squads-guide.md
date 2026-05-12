<!--
  Traduccion: ES
  Original: /docs/en/guides/squads-guide.md
  Ultima sincronizacion: 2026-01-26
-->

# Guia de Desarrollo de Squads

> 🌐 [EN](../../guides/squads-guide.md) | [PT](../../pt/guides/squads-guide.md) | **ES**

---

Guia completa para crear, validar, publicar y gestionar Squads en AIOX.

> **AIOX Squads:** Equipos de agentes de IA trabajando contigo

## Tabla de Contenidos

1. [Que es un Squad?](#que-es-un-squad)
2. [Inicio Rapido](#inicio-rapido)
3. [Arquitectura de Squad](#arquitectura-de-squad)
4. [Creando Squads](#creando-squads)
5. [Disenador de Squad](#disenador-de-squad)
6. [Analizando y Extendiendo Squads](#analizando--extendiendo-squads) _(NUEVO)_
7. [Validando Squads](#validando-squads)
8. [Publicacion y Distribucion](#publicacion--distribucion)
9. [Migracion desde Formato Legacy](#migracion-desde-formato-legacy)
10. [Cargador y Resolucion de Squad](#cargador-y-resolucion-de-squad)
11. [Solucion de Problemas](#solucion-de-problemas)
12. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Que es un Squad?

Los Squads son equipos modulares de agentes de IA que extienden la funcionalidad de AIOX. Cada squad es un paquete autocontenido que incluye:

| Componente        | Proposito                                                 |
| ----------------- | --------------------------------------------------------- |
| **Agentes**       | Personas de IA especificas del dominio                    |
| **Tareas**        | Flujos de trabajo ejecutables (TASK-FORMAT-SPEC-V1)       |
| **Workflows**     | Orquestaciones de multiples pasos                         |
| **Configuracion** | Estandares de codigo, stack tecnologico, arbol de fuentes |
| **Plantillas**    | Plantillas de generacion de documentos                    |
| **Herramientas**  | Integraciones de herramientas personalizadas              |

### Niveles de Distribucion

```
┌─────────────────────────────────────────────────────────────┐
│                    DISTRIBUCION DE SQUAD                      │
├─────────────────────────────────────────────────────────────┤
│  Nivel 1: LOCAL        → ./squads/           (Privado)       │
│  Nivel 2: AIOX-SQUADS  → github.com/SynkraAI (Publico/Gratis)│
│  Nivel 3: SYNKRA API   → api.synkra.dev      (Marketplace)   │
└─────────────────────────────────────────────────────────────┘
```

### Squads Oficiales

| Squad                                                                      | Version | Descripcion                           |
| -------------------------------------------------------------------------- | ------- | ------------------------------------- |
| [etl-squad](https://github.com/SynkraAI/aiox-squads/tree/main/etl)         | 2.0.0   | Recoleccion y transformacion de datos |
| [creator-squad](https://github.com/SynkraAI/aiox-squads/tree/main/creator) | 1.0.0   | Utilidades de generacion de contenido |

---

## Inicio Rapido

### Prerequisitos

- Node.js 18+
- Proyecto AIOX inicializado (`.aiox-core/` existe)
- Git para control de versiones

### Opcion 1: Diseno Guiado (Recomendado)

```bash
# Activar agente squad-creator
@squad-creator

# Disenar squad desde tu documentacion
*design-squad --docs ./docs/prd/my-project.md

# Revisar recomendaciones, luego crear
*create-squad my-squad --from-design

# Validar antes de usar
*validate-squad my-squad
```

### Opcion 2: Creacion Directa

```bash
@squad-creator

# Crear con prompts interactivos
*create-squad my-domain-squad

# O especificar plantilla
*create-squad my-squad --template etl
```

---

## Arquitectura de Squad

### Estructura de Directorios

```
./squads/my-squad/
├── squad.yaml              # Manifiesto (requerido)
├── README.md               # Documentacion
├── LICENSE                 # Archivo de licencia
├── config/
│   ├── coding-standards.md # Reglas de estilo de codigo
│   ├── tech-stack.md       # Tecnologias utilizadas
│   └── source-tree.md      # Estructura de directorios
├── agents/
│   └── my-agent.md         # Definiciones de agentes
├── tasks/
│   └── my-task.md          # Definiciones de tareas (task-first!)
├── workflows/
│   └── my-workflow.yaml    # Workflows de multiples pasos
├── checklists/
│   └── review-checklist.md # Listas de verificacion
├── templates/
│   └── report-template.md  # Plantillas de documentos
├── tools/
│   └── custom-tool.js      # Integraciones de herramientas personalizadas
├── scripts/
│   └── setup.js            # Scripts de utilidad
└── data/
    └── reference-data.json # Archivos de datos estaticos
```

### Manifiesto de Squad (squad.yaml)

```yaml
# Campos requeridos
name: my-squad # kebab-case, identificador unico
version: 1.0.0 # Versionado semantico
description: Lo que hace este squad

# Metadatos
author: Tu Nombre <email@example.com>
license: MIT
slashPrefix: my # Prefijo de comando para IDE

# Compatibilidad AIOX
aiox:
  minVersion: '2.1.0'
  type: squad

# Declaracion de componentes
components:
  agents:
    - my-agent.md
  tasks:
    - my-task.md
  workflows: []
  checklists: []
  templates: []
  tools: []
  scripts: []

# Herencia de configuracion
config:
  extends: extend # extend | override | none
  coding-standards: config/coding-standards.md
  tech-stack: config/tech-stack.md
  source-tree: config/source-tree.md

# Dependencias
dependencies:
  node: [] # paquetes npm
  python: [] # paquetes pip
  squads: [] # Otros squads

# Etiquetas de descubrimiento
tags:
  - domain-specific
  - automation
```

### Arquitectura Task-First

Los Squads siguen una **arquitectura task-first** donde las tareas son el punto de entrada principal:

```
Solicitud del Usuario → Tarea → Ejecucion del Agente → Salida
                          ↓
                     Workflow (si es multi-paso)
```

Las tareas deben seguir [TASK-FORMAT-SPECIFICATION-V1](../../../.aiox-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md).

---

## Creando Squads

### Usando el Agente @squad-creator

```bash
# Activar el agente
@squad-creator

# Ver todos los comandos
*help
```

### Comandos Disponibles

| Comando                                  | Descripcion                                    |
| ---------------------------------------- | ---------------------------------------------- |
| `*create-squad {name}`                   | Crear nuevo squad con prompts                  |
| `*create-squad {name} --template {type}` | Crear desde plantilla (basic, etl, agent-only) |
| `*create-squad {name} --from-design`     | Crear desde blueprint de diseno                |
| `*validate-squad {name}`                 | Validar estructura del squad                   |
| `*list-squads`                           | Listar todos los squads locales                |
| `*design-squad`                          | Disenar squad desde documentacion              |

### Plantillas

| Plantilla    | Caso de Uso                                |
| ------------ | ------------------------------------------ |
| `basic`      | Squad simple con un agente y una tarea     |
| `etl`        | Extraccion, transformacion, carga de datos |
| `agent-only` | Squad con agentes, sin tareas              |

### Modos de Herencia de Configuracion

| Modo       | Comportamiento                                     |
| ---------- | -------------------------------------------------- |
| `extend`   | Agregar reglas del squad a las reglas base de AIOX |
| `override` | Reemplazar reglas base con reglas del squad        |
| `none`     | Configuracion independiente                        |

---

## Disenador de Squad

El Disenador de Squad analiza tu documentacion y recomienda agentes y tareas.

### Uso

```bash
@squad-creator

# Diseno interactivo
*design-squad

# Disenar desde archivos especificos
*design-squad --docs ./docs/prd/requirements.md ./docs/specs/api.md

# Especificar contexto de dominio
*design-squad --domain casting --docs ./docs/
```

### Flujo de Trabajo

1. **Recopilar Documentacion** - Proporcionar PRDs, especificaciones, requisitos
2. **Analisis de Dominio** - El sistema extrae conceptos, flujos de trabajo, roles
3. **Recomendaciones de Agentes** - Revisar agentes sugeridos
4. **Recomendaciones de Tareas** - Revisar tareas sugeridas
5. **Generar Blueprint** - Guardar en `.squad-design.yaml`
6. **Crear desde Blueprint** - `*create-squad my-squad --from-design`

### Formato de Blueprint

```yaml
# .squad-design.yaml
metadata:
  domain: casting
  created: 2025-12-26T10:00:00Z
  source_docs:
    - ./docs/prd/casting-system.md

recommended_agents:
  - name: casting-coordinator
    role: Coordina flujos de trabajo de casting
    confidence: 0.92

recommended_tasks:
  - name: process-submission
    description: Procesar envio de actor
    agent: casting-coordinator
    confidence: 0.88
```

---

## Analizando y Extendiendo Squads

Despues de crear un squad, puedes analizar su estructura y extenderlo con nuevos componentes usando los comandos `*analyze-squad` y `*extend-squad`.

### Analizando Squads

```bash
@squad-creator

# Analisis basico
*analyze-squad my-squad

# Incluir detalles de archivos
*analyze-squad my-squad --verbose

# Guardar a archivo markdown
*analyze-squad my-squad --format markdown

# Salida como JSON
*analyze-squad my-squad --format json
```

### Salida del Analisis

```
=== Analisis del Squad: my-squad ===

Resumen
  Nombre: my-squad
  Version: 1.0.0
  Autor: Tu Nombre

Componentes
  agents/ (2)
    - lead-agent.md
    - helper-agent.md
  tasks/ (3)
    - lead-agent-task1.md
    - lead-agent-task2.md
    - helper-agent-task1.md
  workflows/ (0) <- Vacio
  checklists/ (0) <- Vacio

Cobertura
  Agentes: [#####-----] 50% (1/2 con tareas)
  Tareas: [########--] 80% (3 tareas)
  Directorios: [##--------] 25% (2/8 poblados)

Sugerencias
  1. [!] Agregar tareas para helper-agent (actualmente tiene solo 1)
  2. [*] Crear workflows para secuencias comunes
  3. [-] Agregar checklists para validacion

Siguiente: *extend-squad my-squad
```

### Extendiendo Squads

Agregar nuevos componentes a squads existentes con actualizaciones automaticas del manifiesto:

```bash
@squad-creator

# Modo interactivo (guiado)
*extend-squad my-squad

# Modo directo - Agregar agente
*extend-squad my-squad --add agent --name analytics-agent

# Agregar tarea con vinculacion de agente
*extend-squad my-squad --add task --name process-data --agent lead-agent

# Agregar workflow con referencia a historia
*extend-squad my-squad --add workflow --name daily-processing --story SQS-11

# Agregar todos los tipos de componentes
*extend-squad my-squad --add template --name report-template
*extend-squad my-squad --add tool --name data-validator
*extend-squad my-squad --add checklist --name quality-checklist
*extend-squad my-squad --add script --name migration-helper
*extend-squad my-squad --add data --name config-data
```

### Flujo Interactivo de Extension

```
@squad-creator
*extend-squad my-squad

? Que te gustaria agregar?
  1. Agent - Nueva persona de agente
  2. Task - Nueva tarea para un agente
  3. Workflow - Workflow de multiples pasos
  4. Checklist - Lista de verificacion
  5. Template - Plantilla de documento
  6. Tool - Herramienta personalizada (JavaScript)
  7. Script - Script de automatizacion
  8. Data - Archivo de datos estaticos (YAML)

> 2

? Nombre de la tarea: process-data
? Que agente es dueno de esta tarea?
  1. lead-agent
  2. helper-agent
> 1
? Descripcion de la tarea (opcional): Procesar datos entrantes y generar salida
? Vincular a historia? (dejar vacio para omitir): SQS-11

Creando tarea...
  Creado: tasks/lead-agent-process-data.md
  Actualizado: squad.yaml (agregado a components.tasks)
  Validacion: APROBADA

Siguientes pasos:
  1. Editar tasks/lead-agent-process-data.md
  2. Agregar entrada/salida/checklist
  3. Ejecutar: *validate-squad my-squad
```

### Tipos de Componentes

| Tipo      | Directorio  | Extension | Descripcion                              |
| --------- | ----------- | --------- | ---------------------------------------- |
| agent     | agents/     | .md       | Definicion de persona de agente          |
| task      | tasks/      | .md       | Flujo de trabajo de tarea ejecutable     |
| workflow  | workflows/  | .yaml     | Orquestacion de multiples pasos          |
| checklist | checklists/ | .md       | Lista de verificacion de validacion      |
| template  | templates/  | .md       | Plantilla de generacion de documentos    |
| tool      | tools/      | .js       | Integracion de herramienta personalizada |
| script    | scripts/    | .js       | Script de automatizacion de utilidad     |
| data      | data/       | .yaml     | Configuracion de datos estaticos         |

### Flujo de Trabajo de Mejora Continua

```bash
# 1. Analizar estado actual
*analyze-squad my-squad

# 2. Revisar sugerencias y metricas de cobertura

# 3. Agregar componentes faltantes
*extend-squad my-squad --add task --name new-task --agent lead-agent
*extend-squad my-squad --add checklist --name quality-checklist

# 4. Re-analizar para verificar mejora
*analyze-squad my-squad

# 5. Validar antes de usar
*validate-squad my-squad
```

### Uso Programatico

```javascript
const { SquadAnalyzer } = require('./.aiox-core/development/scripts/squad/squad-analyzer');
const { SquadExtender } = require('./.aiox-core/development/scripts/squad/squad-extender');

// Analizar squad
const analyzer = new SquadAnalyzer({ squadsPath: './squads' });
const analysis = await analyzer.analyze('my-squad');

console.log('Cobertura:', analysis.coverage);
console.log('Sugerencias:', analysis.suggestions);

// Extender squad
const extender = new SquadExtender({ squadsPath: './squads' });
const result = await extender.addComponent('my-squad', {
  type: 'task',
  name: 'new-task',
  agentId: 'lead-agent',
  description: 'Una nueva tarea',
  storyId: 'SQS-11',
});

console.log('Creado:', result.filePath);
console.log('Manifiesto actualizado:', result.manifestUpdated);
```

---

## Validando Squads

### Validacion Basica

```bash
@squad-creator
*validate-squad my-squad
```

### Modo Estricto (para CI/CD)

```bash
*validate-squad my-squad --strict
```

Trata las advertencias como errores.

### Verificaciones de Validacion

| Verificacion                  | Descripcion                           |
| ----------------------------- | ------------------------------------- |
| **Esquema del Manifiesto**    | squad.yaml contra JSON Schema         |
| **Estructura de Directorios** | Las carpetas requeridas existen       |
| **Formato de Tareas**         | Las tareas siguen TASK-FORMAT-SPEC-V1 |
| **Definiciones de Agentes**   | Los agentes tienen campos requeridos  |
| **Dependencias**              | Los archivos referenciados existen    |

### Salida de Validacion

```
Validando squad: my-squad
═══════════════════════════

 Manifiesto: Valido
 Estructura: Completa
 Tareas: 3/3 validas
 Agentes: 2/2 validos
 Advertencias:
   - README.md es minimo (considera expandirlo)

Resumen: VALIDO (3 advertencias)
```

### Validacion Programatica

```javascript
const { SquadValidator } = require('./.aiox-core/development/scripts/squad');

const validator = new SquadValidator({ strict: false });
const result = await validator.validate('./squads/my-squad');

console.log(result);
// { valid: true, errors: [], warnings: [...], suggestions: [...] }
```

---

## Publicacion y Distribucion

### Nivel 1: Local (Privado)

Los Squads en `./squads/` estan automaticamente disponibles para tu proyecto.

```bash
# Listar squads locales
*list-squads
```

### Nivel 2: Repositorio aiox-squads (Publico)

```bash
@squad-creator

# Validar primero
*validate-squad my-squad --strict

# Publicar en GitHub
*publish-squad ./squads/my-squad
```

Esto crea un PR a [SynkraAI/aiox-squads](https://github.com/SynkraAI/aiox-squads).

### Nivel 3: Marketplace de Synkra

```bash
# Configurar autenticacion
export SYNKRA_API_TOKEN="your-token"

# Sincronizar al marketplace
*sync-squad-synkra ./squads/my-squad --public
```

### Descargando Squads

```bash
@squad-creator

# Listar squads disponibles
*download-squad --list

# Descargar squad especifico
*download-squad etl-squad

# Descargar version especifica
*download-squad etl-squad@2.0.0
```

---

## Migracion desde Formato Legacy

### Detectando Squads Legacy

Los squads legacy usan `config.yaml` en lugar de `squad.yaml` y pueden faltar:

- Campo `aiox.type`
- Campo `aiox.minVersion`
- Estructura task-first

### Comando de Migracion

```bash
@squad-creator

# Vista previa de cambios
*migrate-squad ./squads/legacy-squad --dry-run

# Ejecutar migracion
*migrate-squad ./squads/legacy-squad

# Salida detallada
*migrate-squad ./squads/legacy-squad --verbose
```

### Pasos de Migracion

1. **Respaldo** - Crea `.backup/pre-migration-{timestamp}/`
2. **Renombrar** - `config.yaml` → `squad.yaml`
3. **Agregar Campos** - `aiox.type`, `aiox.minVersion`
4. **Reestructurar** - Organizar en diseño task-first
5. **Validar** - Ejecutar validacion en el squad migrado

### Rollback

```bash
# Restaurar desde respaldo
cp -r ./squads/my-squad/.backup/pre-migration-*/. ./squads/my-squad/
```

Ver [Guia de Migracion de Squad](./squad-migration.md) para escenarios detallados.

---

## Cargador y Resolucion de Squad

### Cadena de Resolucion

El Cargador de Squad resuelve squads en este orden:

```
1. Local     → ./squads/{name}/
2. npm       → node_modules/@aiox-squads/{name}/
3. Workspace → ../{name}/ (monorepo)
4. Registry  → api.synkra.dev/squads/{name}
```

### Uso Programatico

```javascript
const { SquadLoader } = require('./.aiox-core/development/scripts/squad');

const loader = new SquadLoader({
  squadsPath: './squads',
  verbose: false,
});

// Resolver ruta del squad
const { path, manifestPath } = await loader.resolve('my-squad');

// Cargar manifiesto
const manifest = await loader.loadManifest('./squads/my-squad');

// Listar todos los squads locales
const squads = await loader.listLocal();
// [{ name: 'my-squad', path: './squads/my-squad', manifestPath: '...' }]
```

### Manejo de Errores

```javascript
const { SquadLoader, SquadLoaderError } = require('./.aiox-core/development/scripts/squad');

try {
  await loader.resolve('non-existent');
} catch (error) {
  if (error instanceof SquadLoaderError) {
    console.error(`[${error.code}] ${error.message}`);
    console.log(`Sugerencia: ${error.suggestion}`);
  }
}
```

### Codigos de Error

| Codigo               | Descripcion                        | Solucion                  |
| -------------------- | ---------------------------------- | ------------------------- |
| `SQUAD_NOT_FOUND`    | Directorio del squad no encontrado | Crear con `*create-squad` |
| `MANIFEST_NOT_FOUND` | Sin archivo de manifiesto          | Crear `squad.yaml`        |
| `YAML_PARSE_ERROR`   | Sintaxis YAML invalida             | Usar validador YAML       |
| `PERMISSION_DENIED`  | Error de permisos de archivo       | Verificar `chmod 644`     |

---

## Solucion de Problemas

### "Squad not found"

```bash
# Verificar que el directorio squads existe
ls ./squads/

# Verificar manifiesto
cat ./squads/my-squad/squad.yaml

# Verificar resolucion
@squad-creator
*list-squads
```

### Errores de Validacion

```bash
# Obtener errores detallados
*validate-squad my-squad --verbose

# Correcciones comunes:
# - name: debe ser kebab-case
# - version: debe ser semver (x.y.z)
# - aiox.type: debe ser "squad"
# - aiox.minVersion: debe ser semver valido
```

### Errores de Parseo YAML

```bash
# Validar sintaxis YAML en linea o con:
npx js-yaml ./squads/my-squad/squad.yaml
```

Problemas comunes:

- Indentacion incorrecta (usar 2 espacios)
- Comillas faltantes alrededor de caracteres especiales
- Tabs en lugar de espacios

### Fallos de Migracion

```bash
# Verificar que el respaldo existe
ls ./squads/my-squad/.backup/

# Restaurar y reintentar
cp -r ./squads/my-squad/.backup/pre-migration-*/. ./squads/my-squad/
*migrate-squad ./squads/my-squad --verbose
```

### Errores de Publicacion

```bash
# Verificar autenticacion de GitHub
gh auth status

# Verificar validacion del squad
*validate-squad my-squad --strict

# Verificar conflictos de nombres
*download-squad --list | grep my-squad
```

---

## Preguntas Frecuentes

### Cual es la diferencia entre un Squad y formatos legados de squad en AIOX?

**Squads** son el formato estandar en AIOX 2.1+ con:

- Arquitectura task-first
- Validacion con JSON Schema
- Distribucion de tres niveles
- Mejores herramientas (`@squad-creator`)

### Puedo usar Squads de diferentes fuentes juntos?

Si. El Cargador de Squad resuelve desde multiples fuentes. Los squads locales tienen precedencia.

### Como actualizo un Squad publicado?

1. Actualizar version en `squad.yaml` (semver)
2. Ejecutar `*validate-squad --strict`
3. Re-publicar: `*publish-squad` o `*sync-squad-synkra`

### Pueden los Squads depender de otros Squads?

Si, declarar en `dependencies.squads`:

```yaml
dependencies:
  squads:
    - etl-squad@^2.0.0
```

### Como hago un Squad privado?

- **Nivel 1**: Mantener en `./squads/` (sin commit) - agregar a `.gitignore`
- **Nivel 3**: Sincronizar con bandera `--private`: `*sync-squad-synkra my-squad --private`

### Cual es la version minima de AIOX para Squads?

Los Squads requieren AIOX 2.1.0+. Configurar en el manifiesto:

```yaml
aiox:
  minVersion: '2.1.0'
```

### Como pruebo mi Squad antes de publicar?

```bash
# 1. Validar estructura
*validate-squad my-squad --strict

# 2. Probar localmente
@my-agent  # Activar agente del squad
*my-task   # Ejecutar tarea del squad

# 3. Ejecutar pruebas del squad (si estan definidas)
npm test -- tests/squads/my-squad/
```

---

## Recursos Relacionados

- [TASK-FORMAT-SPECIFICATION-V1](../../../.aiox-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md)
- [Guia de Contribucion de Squads](./contributing-squads.md)
- [Guia de Migracion de Squad](./squad-migration.md)
- [Referencia de API de Squads](../api/squads-api.md)
- [Agente @squad-creator](../../../.aiox-core/development/agents/squad-creator.md)
- [Repositorio aiox-squads](https://github.com/SynkraAI/aiox-squads)

---

## Obteniendo Ayuda

- [Discusiones de GitHub](https://github.com/SynkraAI/aiox-core/discussions)
- [Rastreador de Issues](https://github.com/SynkraAI/aiox-core/issues)

---

_AIOX Squads: Equipos de agentes de IA trabajando contigo_

**Version:** 2.1.0 | **Actualizado:** 2025-12-26 | **Stories:** SQS-8, SQS-11
