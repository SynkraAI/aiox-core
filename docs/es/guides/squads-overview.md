<!--
  Traduccion: ES
  Original: /docs/guides/squads-overview.md
  Ultima sincronizacion: 2026-01-29
-->

# Vision General de Squads

> **ES** | [EN](../../guides/squads-overview.md)

---

Introduccion a AIOS Squads - equipos modulares de agentes IA que extienden la funcionalidad del framework.

**Version:** 2.1.0
**Ultima Actualizacion:** 2026-01-28

---

## Que son los Squads?

Los Squads son equipos modulares de agentes IA que extienden la funcionalidad de AIOS para dominios o casos de uso especificos. Cada squad es un paquete autocontenido que puede ser instalado, compartido y compuesto con otros squads.

> **AIOS Squads:** Equipos de agentes IA trabajando contigo

### Caracteristicas Clave

| Caracteristica  | Descripcion                                        |
| --------------- | -------------------------------------------------- |
| **Modular**     | Paquetes autocontenidos con todas las dependencias |
| **Composable**  | Multiples squads pueden trabajar juntos            |
| **Compartible** | Publicar en repositorio o marketplace              |
| **Extensible**  | Construir sobre squads existentes                  |
| **Versionable** | Versionado semantico para compatibilidad           |

### Squad vs. Agentes Tradicionales

| Agentes Tradicionales      | AIOS Squads                    |
| -------------------------- | ------------------------------ |
| Agentes individuales       | Equipo coordinado de agentes   |
| Proposito unico            | Workflows enfocados en dominio |
| Configuracion manual       | Empaquetado con config         |
| Reutilizacion copiar-pegar | Instalar y usar                |
| Sin estandarizacion        | TASK-FORMAT-SPEC-V1            |

---

## Estructura del Squad

Un squad contiene todos los componentes necesarios para un dominio especifico:

```
./squads/my-squad/
├── squad.yaml              # Manifiesto (requerido)
├── README.md               # Documentacion
├── LICENSE                 # Archivo de licencia
├── config/
│   ├── coding-standards.md # Reglas de estilo de codigo
│   ├── tech-stack.md       # Tecnologias usadas
│   └── source-tree.md      # Estructura de directorios
├── agents/
│   └── my-agent.md         # Definiciones de agentes
├── tasks/
│   └── my-task.md          # Definiciones de tasks (task-first!)
├── workflows/
│   └── my-workflow.yaml    # Workflows multi-paso
├── checklists/
│   └── review-checklist.md # Checklists de validacion
├── templates/
│   └── report-template.md  # Plantillas de documentos
├── tools/
│   └── custom-tool.js      # Integraciones de herramientas personalizadas
├── scripts/
│   └── setup.js            # Scripts de utilidad
└── data/
    └── reference-data.json # Archivos de datos estaticos
```

### Manifiesto del Squad (squad.yaml)

Cada squad requiere un archivo de manifiesto:

```yaml
# Campos requeridos
name: my-squad # kebab-case, identificador unico
version: 1.0.0 # Versionado semantico
description: Que hace este squad

# Metadatos
author: Tu Nombre <email@example.com>
license: MIT
slashPrefix: my # Prefijo de comandos para IDE

# Compatibilidad AIOS
aios:
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

# Tags de descubrimiento
tags:
  - domain-specific
  - automation
```

---

## Creando un Squad

### Usando el Agente @squad-creator

```bash
# Activar el agente creador de squads
@squad-creator

# Opcion 1: Diseno guiado (recomendado)
*design-squad --docs ./docs/prd/my-project.md

# Opcion 2: Creacion directa
*create-squad my-squad

# Opcion 3: Desde plantilla
*create-squad my-squad --template etl
```

### Plantillas Disponibles

| Plantilla    | Caso de Uso                                |
| ------------ | ------------------------------------------ |
| `basic`      | Squad simple con un agente y task          |
| `etl`        | Extraccion, transformacion, carga de datos |
| `agent-only` | Squad con agentes, sin tasks               |

### Workflow del Disenador de Squads

1. **Recopilar Documentacion** - Proporcionar PRDs, specs, requisitos
2. **Analisis de Dominio** - El sistema extrae conceptos, workflows, roles
3. **Recomendaciones de Agentes** - Revisar agentes sugeridos
4. **Recomendaciones de Tasks** - Revisar tasks sugeridas
5. **Generar Blueprint** - Guardar en `.squad-design.yaml`
6. **Crear desde Blueprint** - `*create-squad my-squad --from-design`

---

## Squads Disponibles

### Squads Oficiales

| Squad             | Version | Descripcion                           | Repositorio                                                                      |
| ----------------- | ------- | ------------------------------------- | -------------------------------------------------------------------------------- |
| **etl-squad**     | 2.0.0   | Recoleccion y transformacion de datos | [aios-squads/etl](https://github.com/SynkraAI/aios-squads/tree/main/etl)         |
| **creator-squad** | 1.0.0   | Utilidades de generacion de contenido | [aios-squads/creator](https://github.com/SynkraAI/aios-squads/tree/main/creator) |

### Niveles de Distribucion

```
┌─────────────────────────────────────────────────────────────┐
│                    DISTRIBUCION DE SQUADS                    │
├─────────────────────────────────────────────────────────────┤
│  Nivel 1: LOCAL        --> ./squads/           (Privado)    │
│  Nivel 2: AIOS-SQUADS  --> github.com/SynkraAI (Publico)    │
│  Nivel 3: SYNKRA API   --> api.synkra.dev      (Marketplace)│
└─────────────────────────────────────────────────────────────┘
```

### Instalando Squads

```bash
# Listar squads disponibles
aios squads list

# Descargar del repositorio oficial
*download-squad etl-squad

# Descargar version especifica
*download-squad etl-squad@2.0.0

# Listar squads locales
*list-squads
```

---

## Mejores Practicas

### 1. Seguir Arquitectura Task-First

Los squads siguen arquitectura task-first donde las tasks son el punto de entrada principal:

```
User Request --> Task --> Agent Execution --> Output
                  │
             Workflow (si multi-paso)
```

Las tasks deben seguir [TASK-FORMAT-SPECIFICATION-V1](../../.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md).

### 2. Usar Herencia de Config Sabiamente

| Modo       | Comportamiento                              |
| ---------- | ------------------------------------------- |
| `extend`   | Agregar reglas del squad a reglas core AIOS |
| `override` | Reemplazar reglas core con reglas del squad |
| `none`     | Configuracion independiente                 |

### 3. Validar Antes de Publicar

```bash
# Validar estructura del squad
*validate-squad my-squad

# Modo estricto (para CI/CD)
*validate-squad my-squad --strict
```

### 4. Documentar Tu Squad

Incluir documentacion completa:

- `README.md` con ejemplos de uso
- Descripciones claras de agentes
- Especificaciones de input/output de tasks
- Diagramas de workflows

### 5. Versionar Apropiadamente

Usar versionado semantico:

- **Major (X.0.0):** Cambios incompatibles
- **Minor (0.X.0):** Nuevas caracteristicas, compatible hacia atras
- **Patch (0.0.X):** Correcciones de bugs

---

## Referencia de Comandos de Squads

| Comando                                  | Descripcion                       |
| ---------------------------------------- | --------------------------------- |
| `*create-squad {name}`                   | Crear nuevo squad con prompts     |
| `*create-squad {name} --template {type}` | Crear desde plantilla             |
| `*create-squad {name} --from-design`     | Crear desde blueprint de diseno   |
| `*validate-squad {name}`                 | Validar estructura del squad      |
| `*list-squads`                           | Listar todos los squads locales   |
| `*download-squad {name}`                 | Descargar del repositorio         |
| `*design-squad`                          | Disenar squad desde documentacion |
| `*analyze-squad {name}`                  | Analizar estructura del squad     |
| `*extend-squad {name}`                   | Agregar componentes al squad      |
| `*publish-squad {path}`                  | Publicar al repositorio           |

---

## Proximos Pasos

- **Crear Tu Primer Squad:** Seguir la [Guia de Squads](./squads-guide.md) para instrucciones detalladas
- **Explorar Squads Oficiales:** Revisar [repositorio aios-squads](https://github.com/SynkraAI/aios-squads)
- **Contribuir:** Ver [Guia de Contribucion de Squads](./contributing-squads.md)
- **Aprender Formato de Tasks:** Leer [TASK-FORMAT-SPECIFICATION-V1](../../.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md)

---

## Documentacion Relacionada

- [Guia de Desarrollo de Squads](./squads-guide.md) - Guia completa para crear y gestionar squads
- [Guia de Migracion de Squads](./squad-migration.md) - Migrar desde formato legacy
- [Especificacion de Formato de Tasks](../../.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md)
- [Agente @squad-creator](../../.aios-core/development/agents/squad-creator.md)

---

## FAQ

### Cual es la diferencia entre un Squad y un Expansion Pack?

**Squads** son el nuevo estandar (AIOS 2.1+) reemplazando Expansion Packs. Los Squads tienen:

- Arquitectura task-first
- Validacion JSON Schema
- Distribucion de tres niveles
- Mejor tooling (`@squad-creator`)

### Puedo usar Squads de diferentes fuentes juntos?

Si. El Squad Loader resuelve desde multiples fuentes. Los squads locales tienen precedencia.

### Pueden los Squads depender de otros Squads?

Si, declarar en `dependencies.squads`:

```yaml
dependencies:
  squads:
    - etl-squad@^2.0.0
```

### Cual es la version minima de AIOS para Squads?

Los Squads requieren AIOS 2.1.0+. Configurar en el manifiesto:

```yaml
aios:
  minVersion: '2.1.0'
```

---

_AIOS Squads: Equipos de agentes IA trabajando contigo_

_Version: 2.1.0 | Actualizado: 2026-01-28_
