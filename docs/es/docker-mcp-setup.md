# Guía de Configuración de Docker MCP

> **ES**

---

Guía para configurar servidores MCP (Model Context Protocol) basados en Docker con AIOX.

**Versión:** 2.1.0
**Última Actualización:** 2026-01-28

---

## Requisitos Previos

Antes de configurar Docker MCP, asegúrate de tener:

- **Docker Desktop** instalado y en ejecución
- **Node.js** 18+ instalado
- Proyecto **AIOX** inicializado
- Claves API para los servicios MCP deseados (EXA, Apify, etc.)

---

## Instalación

### Paso 1: Instalar Docker MCP Toolkit

```bash
# Instalar Docker MCP Toolkit
docker mcp install

# Verificar instalación
docker mcp --version
```

### Paso 2: Inicializar Configuración MCP

```bash
# Crear estructura MCP global
aiox mcp setup
```

Esto crea:

- `~/.aiox/mcp/` - Directorio de configuración MCP
- `~/.aiox/mcp/global-config.json` - Archivo de configuración principal
- `~/.aiox/mcp/servers/` - Configuraciones de servidores individuales
- `~/.aiox/credentials/` - Almacenamiento seguro de credenciales

### Paso 3: Agregar Servidores MCP

```bash
# Agregar servidores desde plantillas
aiox mcp add context7
aiox mcp add exa
aiox mcp add github
```

---

## Configuración

### Arquitectura MCP

AIOX usa Docker MCP Toolkit como infraestructura MCP principal:

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                           │
│                         │                                │
│    ┌────────────────────┼────────────────────┐          │
│    │                    │                    │          │
│    ▼                    ▼                    ▼          │
│ playwright      docker-gateway           native tools   │
│ (direct)        (container MCPs)         (Read, Write)  │
│                         │                                │
│              ┌──────────┼──────────┐                    │
│              ▼          ▼          ▼                    │
│            EXA     Context7     Apify                   │
│         (search)   (docs)     (scraping)               │
└─────────────────────────────────────────────────────────┘
```

### Directo en Claude Code (global ~/.claude.json)

| MCP                   | Propósito                                        |
| --------------------- | ------------------------------------------------ |
| **playwright**        | Automatización de navegador, capturas, testing web |
| **desktop-commander** | Operaciones de contenedores Docker vía docker-gateway |

### Dentro de Docker Desktop (vía docker-gateway)

| MCP          | Propósito                                            |
| ------------ | ---------------------------------------------------- |
| **EXA**      | Búsqueda web, investigación, análisis de empresas/competidores |
| **Context7** | Búsqueda de documentación de librerías              |
| **Apify**    | Web scraping, Actors, extracción de datos de redes sociales |

### Archivos de Configuración

**global-config.json:**

```json
{
  "version": "1.0",
  "servers": {
    "context7": {
      "type": "sse",
      "url": "https://mcp.context7.com/sse",
      "enabled": true
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server"],
      "env": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      },
      "enabled": true
    }
  },
  "defaults": {
    "timeout": 30000,
    "retries": 3
  }
}
```

---

## MCPs Disponibles

### Context7 (Búsqueda de Documentación)

```bash
# Agregar Context7
aiox mcp add context7

# Uso
mcp__context7__resolve-library-id
mcp__context7__query-docs
```

**Usar para:**

- Búsqueda de documentación de librerías
- Referencia API para paquetes/frameworks
- Obtener documentación actualizada de dependencias

### EXA (Búsqueda Web)

```bash
# Agregar EXA
aiox mcp add exa

# Configurar clave API
export EXA_API_KEY="your-api-key"

# Uso
mcp__exa__web_search_exa
mcp__exa__get_code_context_exa
```

**Usar para:**

- Búsquedas web de información actual
- Investigación y búsqueda de documentación
- Investigación de empresas y competidores
- Encontrar ejemplos de código en línea

### Apify (Web Scraping)

```bash
# Agregar Apify
aiox mcp add apify

# Configurar token API
export APIFY_TOKEN="your-token"

# Uso
mcp__docker-gateway__search-actors
mcp__docker-gateway__call-actor
```

**Usar para:**

- Web scraping para redes sociales (Instagram, TikTok, LinkedIn)
- Extraer datos de sitios de e-commerce
- Recolección automatizada de datos de cualquier sitio web
- Navegación web habilitada para RAG para contexto de IA

### GitHub (Integración API)

```bash
# Agregar GitHub
aiox mcp add github

# Configurar token
export GITHUB_TOKEN="your-token"
```

**Usar para:**

- Operaciones de API de GitHub
- Gestión de repositorios
- Manejo de PRs e issues

### Playwright (Automatización de Navegador)

```bash
# Agregar Playwright
aiox mcp add puppeteer
```

**Usar para:**

- Automatización de navegador
- Capturar screenshots de páginas web
- Interactuar con sitios web
- Web scraping y testing

---

## Comandos CLI

### Comandos de Configuración

```bash
# Inicializar configuración MCP global
aiox mcp setup

# Forzar recreación (respaldar existente)
aiox mcp setup --force
```

### Gestión de Servidores

```bash
# Agregar servidor desde plantilla
aiox mcp add <server-name>

# Agregar con configuración personalizada
aiox mcp add custom-server --config='{"command":"npx","args":["-y","package"]}'

# Eliminar servidor
aiox mcp remove <server-name>

# Habilitar/deshabilitar servidores
aiox mcp enable <server-name>
aiox mcp disable <server-name>
```

### Estado y Listado

```bash
# Listar servidores configurados
aiox mcp list

# Mostrar estado detallado
aiox mcp status

# Sincronizar al proyecto
aiox mcp sync
```

---

## Variables de Entorno

### Configurar Variables

**macOS/Linux:**

```bash
export EXA_API_KEY="your-api-key"
export GITHUB_TOKEN="your-github-token"
export APIFY_TOKEN="your-apify-token"
```

**Windows (PowerShell):**

```powershell
$env:EXA_API_KEY = "your-api-key"
$env:GITHUB_TOKEN = "your-github-token"
$env:APIFY_TOKEN = "your-apify-token"
```

### Variables Persistentes

Agregar a tu perfil de shell (`~/.bashrc`, `~/.zshrc`, o `~/.profile`):

```bash
export EXA_API_KEY="your-api-key"
export GITHUB_TOKEN="your-github-token"
export APIFY_TOKEN="your-apify-token"
```

### Almacenamiento Seguro de Credenciales

```bash
# Agregar credencial
aiox mcp credential set EXA_API_KEY "your-api-key"

# Obtener credencial
aiox mcp credential get EXA_API_KEY

# Listar credenciales (enmascaradas)
aiox mcp credential list
```

---

## Solución de Problemas

### Problemas Comunes

| Problema                       | Solución                                               |
| ------------------------------ | ------------------------------------------------------ |
| Permiso denegado               | Ejecutar terminal como Administrador (Windows) o usar sudo |
| Servidor no inicia             | Verificar command y args, verificar paquete instalado  |
| Variable de entorno no encontrada | Configurar variable o usar almacenamiento de credenciales |
| Errores de timeout             | Aumentar timeout en configuración                      |
| Conexión rechazada             | Verificar URL y acceso a red                           |

### Bug de Secrets de Docker MCP (Dic 2025)

**Problema:** El almacén de secrets de Docker MCP Toolkit (`docker mcp secret set`) y la interpolación de plantillas (`{{...}}`) NO funcionan correctamente. Las credenciales no se pasan a los contenedores.

**Síntomas:**

- `docker mcp tools ls` muestra "(N prompts)" en lugar de "(N tools)"
- El servidor MCP inicia pero falla la autenticación
- La salida verbose muestra `-e ENV_VAR` sin valores

**Solución alternativa:** Editar `~/.docker/mcp/catalogs/docker-mcp.yaml` directamente:

```yaml
{ mcp-name }:
  env:
    - name: API_TOKEN
      value: 'actual-token-value-here'
```

**Ejemplo - Apify:**

```yaml
apify-mcp-server:
  env:
    - name: TOOLS
      value: 'actors,docs,apify/rag-web-browser'
    - name: APIFY_TOKEN
      value: 'apify_api_xxxxxxxxxxxxx'
```

**Nota:** Esto expone credenciales en un archivo local. Asegurar permisos de archivo y nunca hacer commit de este archivo.

### Correcciones Comunes

```bash
# Resetear configuración global
aiox mcp setup --force

# Limpiar caché
rm -rf ~/.aiox/mcp/cache/*

# Verificar configuración
aiox mcp status --verbose

# Probar servidor manualmente
npx -y @modelcontextprotocol/server-github
```

---

## Gobernanza MCP

**Importante:** Toda la gestión de infraestructura MCP es manejada exclusivamente por el **Agente DevOps (@devops / Felix)**.

| Operación          | Agente | Comando             |
| ------------------ | ------ | ------------------- |
| Buscar catálogo MCP | DevOps | `*search-mcp`      |
| Agregar servidor MCP | DevOps | `*add-mcp`        |
| Listar MCPs habilitados | DevOps | `*list-mcps`   |
| Eliminar servidor MCP | DevOps | `*remove-mcp`    |
| Configurar Docker MCP | DevOps | `*setup-mcp-docker` |

Otros agentes (Dev, Architect, etc.) son **consumidores** de MCP, no administradores. Si se necesita gestión de MCP, delegar a @devops.

---

## Prioridad de Selección de Herramientas

Siempre preferir herramientas nativas de Claude Code sobre servidores MCP:

| Tarea            | USAR ESTO              | NO ESTO        |
| ---------------- | ---------------------- | -------------- |
| Leer archivos    | `Read` tool            | docker-gateway |
| Escribir archivos | `Write` / `Edit` tools | docker-gateway |
| Ejecutar comandos | `Bash` tool           | docker-gateway |
| Buscar archivos  | `Glob` tool            | docker-gateway |
| Buscar contenido | `Grep` tool            | docker-gateway |
| Listar directorios | `Bash(ls)` o `Glob`  | docker-gateway |

### Cuándo Usar docker-gateway

Solo usar docker-gateway cuando:

1. El usuario dice explícitamente "usa docker" o "usa contenedor"
2. El usuario menciona explícitamente "Desktop Commander"
3. La tarea específicamente requiere operaciones de contenedores Docker
4. Accediendo MCPs ejecutándose dentro de Docker (EXA, Context7)
5. El usuario pide ejecutar algo dentro de un contenedor Docker

---

## Documentación Relacionada

- [Tutorial Docker Gateway](./guides/mcp/docker-gateway-tutorial.md)
- [Guía MCP Desktop Commander](./guides/mcp/desktop-commander.md)
- [Guía de Configuración Global MCP](./guides/mcp-global-setup.md)
- [Diagramas de Arquitectura MCP](./architecture/mcp-system-diagrams.md)
- [Agente DevOps](../.aiox-core/development/agents/devops.md)

---

_Guía de Configuración de Docker MCP de Synkra AIOX v4.0_
