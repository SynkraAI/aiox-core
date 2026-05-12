# Tutorial de Docker Gateway MCP

> **ES** | [PT](../../pt/guides/mcp/docker-gateway-tutorial.md)

---

Tutorial para configurar docker-gateway con servidores MCP ejecutándose dentro de contenedores Docker.

**Versión:** 1.0.0
**Última Actualización:** 2026-01-28

---

## ¿Qué es Docker Gateway?

Docker Gateway es un servidor MCP que actúa como un **puente** entre Claude Code y múltiples servidores MCP ejecutándose dentro de contenedores Docker.

### Beneficio Clave: Sin Costo Extra de Tokens

Cuando los MCPs se ejecutan dentro de docker-gateway, sus definiciones de herramientas están **encapsuladas** en el contenedor. Esto significa:

| Configuración            | Costo de Tokens      | Definiciones de Herramientas en Contexto |
| ------------------------ | -------------------- | ---------------------------------------- |
| Directo en ~/.claude.json | Cada MCP suma tokens | Sí, todos los esquemas de herramientas visibles |
| Dentro de docker-gateway | **Sin costo extra**  | Encapsuladas en el contenedor            |

**¿Por qué?** Claude Code solo ve las herramientas de docker-gateway (`mcp-add`, `mcp-find`, etc.), no las herramientas individuales de cada MCP interno. Las herramientas reales se invocan a través del gateway.

---

## Requisitos Previos

- **Docker Desktop** 4.37+ instalado y ejecutándose
- CLI de **Claude Code** instalado
- Claves API para los servicios MCP deseados

---

## Paso 1: Inicializar Docker MCP Toolkit

```bash
# Inicializar el sistema de catálogo
docker mcp catalog init

# Verificar inicialización
docker mcp catalog ls
```

**Salida esperada:**

```
docker-mcp: Docker MCP Catalog
```

El catálogo contiene más de 313 servidores MCP disponibles para habilitar.

---

## Paso 2: Explorar Servidores Disponibles

```bash
# Listar todos los servidores disponibles
docker mcp catalog show docker-mcp

# Buscar servidor específico
docker mcp catalog show docker-mcp | grep -i apify
docker mcp catalog show docker-mcp | grep -i exa
```

---

## Paso 3: Habilitar Servidores MCP

```bash
# Habilitar servidores que deseas usar
docker mcp server enable apify-mcp-server
docker mcp server enable exa
docker mcp server enable context7

# Listar servidores habilitados
docker mcp server ls
```

---

## Paso 4: Configurar Claves API

### Método 1: Usando Docker MCP Secrets (puede tener bugs)

```bash
# Establecer secrets
docker mcp secret set APIFY_TOKEN "your-apify-token"
docker mcp secret set EXA_API_KEY "your-exa-api-key"
```

### Método 2: Editar Archivo de Catálogo Directamente (solución recomendada)

Debido a un bug conocido (Dic 2025), los secrets pueden no pasar correctamente a los contenedores.

**Solución alternativa:** Editar `~/.docker/mcp/catalogs/docker-mcp.yaml` directamente:

```yaml
# Encuentra la entrada de tu MCP y agrega valores env
apify-mcp-server:
  env:
    - name: APIFY_TOKEN
      value: 'apify_api_xxxxxxxxxxxxx'
    - name: TOOLS
      value: 'actors,docs,apify/rag-web-browser'

exa:
  env:
    - name: EXA_API_KEY
      value: 'your-exa-api-key-here'
```

⚠️ **Nota de seguridad:** Esto expone credenciales en un archivo local. Establece permisos apropiados:

```bash
chmod 600 ~/.docker/mcp/catalogs/docker-mcp.yaml
```

---

## Paso 5: Configurar Claude Code

Agregar docker-gateway a `~/.claude.json`:

```json
{
  "mcpServers": {
    "docker-gateway": {
      "type": "stdio",
      "command": "docker",
      "args": ["mcp", "gateway", "run"]
    }
  }
}
```

O usar el CLI de Claude:

```bash
claude mcp add docker-gateway -s user -- docker mcp gateway run
```

---

## Paso 6: Verificar Configuración

```bash
# Verificar herramientas disponibles a través del gateway
docker mcp tools ls

# La salida esperada muestra herramientas del gateway + herramientas de servidores habilitados
# Ejemplo: 58 herramientas (7 del gateway + 51 de servidores habilitados)
```

En Claude Code:

```bash
# Listar estado de MCP
claude mcp list

# Debería mostrar:
# docker-gateway: docker mcp gateway run - ✓ Connected
```

---

## Usando Docker Gateway

### Herramientas del Gateway Disponibles

| Herramienta          | Descripción                                |
| -------------------- | ------------------------------------------ |
| `mcp-add`            | Agregar servidor MCP a la sesión actual    |
| `mcp-find`           | Buscar servidores en el catálogo           |
| `mcp-remove`         | Eliminar servidor MCP de la sesión         |
| `mcp-exec`           | Ejecutar herramienta de servidor habilitado |
| `mcp-config-set`     | Configurar ajustes del servidor MCP        |
| `code-mode`          | Crear herramientas JavaScript combinadas   |
| `mcp-create-profile` | Guardar estado actual del gateway          |

### Accediendo a Herramientas de Servidores Habilitados

Una vez habilitados los servidores, sus herramientas están disponibles a través del gateway:

```
# Herramientas de Apify (vía docker-gateway)
mcp__docker-gateway__search-actors
mcp__docker-gateway__call-actor
mcp__docker-gateway__apify-slash-rag-web-browser

# Herramientas de EXA (vía docker-gateway)
mcp__docker-gateway__web_search_exa
mcp__docker-gateway__company_research

# Herramientas de Context7 (vía docker-gateway)
mcp__docker-gateway__resolve-library-id
mcp__docker-gateway__query-docs
```

---

## Ejemplo de Configuración Completa

### ~/.claude.json

```json
{
  "mcpServers": {
    "desktop-commander": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@wonderwhy-er/desktop-commander"]
    },
    "docker-gateway": {
      "type": "stdio",
      "command": "docker",
      "args": ["mcp", "gateway", "run"]
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-playwright"]
    }
  }
}
```

### Resultado

```
User MCPs (4 servers):
├── desktop-commander  ✓ connected
├── docker-gateway     ✓ connected  (58 tools inside)
├── playwright         ✓ connected
└── n8n-mcp           ✓ connected

Inside docker-gateway:
├── apify-mcp-server   (7 tools)
├── exa                (8 tools)
├── context7           (2 tools)
└── + gateway tools    (7 tools)
```

---

## Resolución de Problemas

### El Gateway No Inicia

```bash
# Verificar que Docker está ejecutándose
docker info

# Verificar logs del gateway
docker mcp gateway run --verbose
```

### Las Herramientas Muestran "(N prompts)" en Lugar de "(N tools)"

Esto indica fallo de autenticación. Usa la solución alternativa:

```bash
# Editar catálogo directamente con credenciales hardcoded
nano ~/.docker/mcp/catalogs/docker-mcp.yaml
```

### Servidor No Encontrado

```bash
# Actualizar catálogo
docker mcp catalog update

# Verificar que el servidor existe
docker mcp catalog show docker-mcp | grep -i "server-name"
```

### Reiniciar Todo

```bash
# Deshabilitar todos los servidores
docker mcp server reset

# Reiniciar catálogo
docker mcp catalog reset

# Re-inicializar
docker mcp catalog init
```

---

## Mejores Prácticas

### 1. Usar docker-gateway para MCPs basados en API

Colocar estos dentro de docker-gateway (no necesitan acceso al host):

- Apify (APIs de web scraping)
- EXA (APIs de búsqueda)
- Context7 (APIs de documentación)
- Cualquier integración cloud/SaaS

### 2. Mantener MCPs con acceso al host directos

Mantener estos en ~/.claude.json directamente:

- desktop-commander (necesita acceso a archivos/terminal del host)
- playwright (necesita navegador del host)
- MCPs de filesystem

### 3. Asegurar tus credenciales

```bash
# Establecer permisos restrictivos
chmod 600 ~/.docker/mcp/catalogs/docker-mcp.yaml
chmod 700 ~/.docker/mcp/

# Nunca hacer commit de estos archivos
echo "~/.docker/mcp/" >> ~/.gitignore_global
```

---

## Documentación Relacionada

- [Guía de Desktop Commander MCP](./desktop-commander.md)
- [Guía de Configuración Global MCP](../mcp-global-setup.md)
- [Configuración de Docker MCP](../../docker-mcp-setup.md)

---

_Tutorial de Docker Gateway MCP v1.0.0 - AIOX Framework_
