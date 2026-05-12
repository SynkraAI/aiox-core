# Guía de Integración de Herramientas de Agentes

> **ES** | [EN](../architecture/agent-tool-integration-guide.md) | [PT](../pt/architecture/agent-tool-integration-guide.md)

---

**Versión:** 1.0.0
**Última Actualización:** 2026-01-26
**Estado:** Referencia Oficial

---

## Descripción General

Esta guía explica cómo se integran las herramientas con los agentes AIOX. Las herramientas amplían las capacidades de los agentes proporcionando acceso a servicios externos, APIs y recursos del sistema.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Integración de Herramientas de Agentes    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Definición de Agente (archivo .md con YAML)              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  dependencies:                                      │   │
│   │    tools: [git, coderabbit, context7]              │   │
│   │    tasks: [task-a.md, task-b.md]                   │   │
│   │    checklists: [checklist-a.md]                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Tipos de Herramientas                              │   │
│   │  ├── Herramientas CLI (git, npm, gh)               │   │
│   │  ├── Servidores MCP (EXA, Context7, Apify)         │   │
│   │  └── Servicios Externos (CodeRabbit, Supabase)     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Declaración de Dependencias

Los agentes declaran sus dependencias en el bloque YAML dentro de su archivo de definición `.md`.

### Tipos de Dependencia

| Tipo         | Descripción                           | Ubicación                        |
| ------------ | ------------------------------------- | -------------------------------- |
| `tools`      | Herramientas CLI y servicios externos | System PATH o MCP                |
| `tasks`      | Archivos de flujo de trabajo          | `.aiox-core/development/tasks/`  |
| `checklists` | Listas de validación                  | `.aiox-core/product/checklists/` |

### Ejemplo de Declaración

```yaml
# De .aiox-core/development/agents/dev.md
dependencies:
  checklists:
    - story-dod-checklist.md
  tasks:
    - apply-qa-fixes.md
    - create-service.md
    - dev-develop-story.md
    - execute-checklist.md
  tools:
    - coderabbit # Revisión de calidad de código previo al commit
    - git # Operaciones locales: add, commit, status, diff
    - context7 # Búsqueda de documentación de librerías
    - supabase # Operaciones de base de datos
    - n8n # Automatización de flujos de trabajo
    - browser # Pruebas de aplicaciones web
    - ffmpeg # Procesamiento de archivos de medios
```

---

## Categorías de Herramientas por Agente

### @dev (Dex - Agente Desarrollador)

| Herramienta  | Tipo     | Propósito                                    |
| ------------ | -------- | -------------------------------------------- |
| `git`        | CLI      | Control de versiones (solo operaciones locales) |
| `coderabbit` | Externa  | Revisión de calidad de código previo al commit |
| `context7`   | MCP      | Búsqueda de documentación de librerías       |
| `supabase`   | Externa  | Operaciones de base de datos y migraciones  |
| `n8n`        | Externa  | Automatización de flujos de trabajo         |
| `browser`    | MCP      | Pruebas de aplicaciones web                 |
| `ffmpeg`     | CLI      | Procesamiento de archivos de medios         |

**Restricciones de Git para @dev:**

- Permitido: `git add`, `git commit`, `git status`, `git diff`, `git log`, `git branch`
- Bloqueado: `git push`, `gh pr create`, `gh pr merge`
- Las operaciones de push requieren el agente @devops

### @devops (Gage - Agente DevOps)

| Herramienta  | Tipo     | Propósito                              |
| ------------ | -------- | -------------------------------------- |
| `git`        | CLI      | Operaciones git completas incluyendo push |
| `gh`         | CLI      | CLI de GitHub para operaciones de PR  |
| `docker`     | CLI      | Operaciones de contenedores            |
| `coderabbit` | Externa  | Automatización de revisión de código  |

**Capacidades Únicas:**

- Único agente autorizado para hacer push al remoto
- Único agente autorizado para crear/mezclar PRs
- Gestión de infraestructura MCP

### @qa (Quinn - Agente QA)

| Herramienta  | Tipo | Propósito                       |
| ------------ | ---- | ------------------------------- |
| `jest`       | CLI  | Pruebas unitarias               |
| `playwright` | MCP  | Pruebas E2E y automatización de navegador |
| `npm test`   | CLI  | Ejecutor de pruebas             |

### @architect (Aria - Agente Arquitecto)

| Herramienta | Tipo | Propósito                   |
| ----------- | ---- | --------------------------- |
| `exa`       | MCP  | Investigación y análisis    |
| `context7`  | MCP  | Referencia de documentación |

---

## Integración MCP

### Herramientas MCP Disponibles

Los servidores MCP (Protocolo de Contexto de Modelo) proporcionan APIs estructuradas para uso de agentes.

| Servidor MCP | Herramientas Proporcionadas                                    | Utilizado por    |
| ------------ | ---------------------------------------------------------------- | ---------------- |
| EXA          | `web_search_exa`, `company_research_exa`, `get_code_context_exa` | @architect       |
| Context7     | `resolve-library-id`, `query-docs`                               | @dev, @architect |
| Playwright   | `browser_navigate`, `browser_screenshot`, `browser_click`        | @qa              |
| Apify        | `search-actors`, `call-actor`, `get-actor-output`                | @devops          |

### Configuración MCP

Los servidores MCP se configuran a través de Docker MCP Toolkit. Ver [Gestión de Claves API de MCP](./mcp-api-keys-management.md) para la configuración.

### Patrón de Uso

```
1. El agente recibe una tarea que requiere datos externos
2. El agente identifica la herramienta MCP apropiada de las dependencias
3. El agente llama a la herramienta MCP a través de la interfaz de herramientas
4. MCP devuelve una respuesta estructurada
5. El agente procesa la respuesta y continúa con la tarea
```

---

## Integración CodeRabbit

El agente @dev incluye CodeRabbit para comprobaciones de calidad previas al commit.

### Configuración

```yaml
coderabbit_integration:
  enabled: true
  installation_mode: wsl # o 'native'

  self_healing:
    enabled: true
    type: light
    max_iterations: 2
    timeout_minutes: 15
    trigger: story_completion
    severity_filter:
      - CRITICAL
    behavior:
      CRITICAL: auto_fix
      HIGH: document_only
      MEDIUM: ignore
      LOW: ignore
```

### Flujo de Trabajo

Antes de marcar la historia como "Lista para Revisión":

1. Ejecutar CodeRabbit en cambios sin commit
2. Si se encuentran problemas CRÍTICOS, intentar corrección automática (máximo 2 iteraciones)
3. Documentar problemas ALTOS en las Notas de Desarrollo de la historia
4. Si los problemas CRÍTICOS persisten después de iteraciones, DETENER y notificar al usuario

---

## Arquitectura de Restricciones de Git

AIOX implementa gobernanza estricta de operaciones de git:

### Permisos del Agente @dev

```yaml
git_restrictions:
  allowed_operations:
    - git add
    - git commit
    - git status
    - git diff
    - git log
    - git branch
    - git checkout
    - git merge
  blocked_operations:
    - git push
    - git push --force
    - gh pr create
    - gh pr merge
```

### Permisos del Agente @devops

```yaml
git_permissions:
  full_access: true
  special_capabilities:
    - push to remote
    - create pull requests
    - merge pull requests
    - admin bypass for branch protection
```

### Flujo de Trabajo de Entrega

```
@dev completa la historia
    ↓
@dev marca estado: "Lista para Revisión"
    ↓
El usuario activa @devops
    ↓
@devops crea PR y hace push
```

---

## Agregar Nuevas Herramientas

### Paso 1: Actualizar Definición del Agente

Agregar la herramienta a la lista `dependencies.tools` del agente:

```yaml
dependencies:
  tools:
    - existing-tool
    - new-tool # Agregar aquí
```

### Paso 2: Documentar Uso de la Herramienta

Si la herramienta requiere configuración específica o tiene patrones de uso especiales, agregar documentación:

```yaml
tool_integration:
  new-tool:
    purpose: 'Descripción breve'
    common_commands:
      - 'new-tool --help'
      - 'new-tool run <args>'
    when_to_use: 'Usar cuando se cumpla la condición X'
```

### Paso 3: Probar Integración

Activar el agente y verificar que la herramienta es accesible y funcional.

---

## Mejores Prácticas

### HACER

- Declarar todas las dependencias de herramientas en la definición del agente
- Usar la herramienta apropiada para cada tipo de tarea
- Seguir los límites de permisos del agente
- Registrar el uso de herramientas para depuración
- Validar las salidas de herramientas antes de usar

### NO HACER

- Usar herramientas no declaradas en dependencias
- Eludir restricciones de git (usar el agente apropiado)
- Ignorar códigos de retorno de herramientas
- Exponer datos sensibles en registros de herramientas
- Omitir validación de entrada

---

## Solución de Problemas

### Herramienta No Encontrada

1. Verificar que la herramienta está instalada: `which <tool-name>`
2. Verificar la variable de entorno PATH
3. Verificar que la herramienta está declarada en las dependencias del agente

### Errores de Herramientas MCP

1. Verificar que el servidor MCP está en ejecución
2. Verificar que las claves API están configuradas (ver [Gestión de Claves API de MCP](./mcp-api-keys-management.md))
3. Revisar la documentación específica de la herramienta

### Permiso Denegado

1. Verificar si la operación está bloqueada para este agente
2. Verificar si debería usarse @devops en su lugar
3. Verificar permisos de archivos/directorios

---

## Documentación Relacionada

- [Gestión de Claves API de MCP](./mcp-api-keys-management.md)
- [Reglas de Uso de MCP](../../../.claude/rules/mcp-usage.md)
- [Definiciones de Agentes](../../../.aiox-core/development/agents/)

---

**Mantenedor:** @architect (Aria)
