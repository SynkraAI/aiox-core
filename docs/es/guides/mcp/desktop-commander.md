# Desktop Commander MCP

> **ES**

---

Guía para usar el servidor MCP Desktop Commander con Claude Code para capacidades avanzadas de gestión de terminal y procesos.

**Versión:** 1.0.0
**Última Actualización:** 2026-01-28

---

## Descripción General

Desktop Commander es un servidor MCP que extiende Claude Code con capacidades avanzadas para la gestión del entorno local. Proporciona funcionalidades que las herramientas nativas de Claude Code no pueden hacer, haciéndolo esencial para ciertos flujos de trabajo.

### Cuándo Usar Desktop Commander

| Caso de Uso                              | Claude Code Nativo | Desktop Commander |
| ---------------------------------------- | ------------------ | ----------------- |
| Sesiones persistentes (SSH, REPL)        | No soportado       | **Recomendado**   |
| Procesos interactivos                    | Limitado           | **Recomendado**   |
| Edición difusa de archivos               | No soportado       | **Recomendado**   |
| Lectura de cola de archivo (offset negativo) | No soportado  | **Recomendado**   |
| Ejecución de código en memoria           | No soportado       | **Recomendado**   |
| Operaciones simples de archivos          | **Preferido**      | Más lento         |
| Operaciones Git                          | **Preferido**      | Innecesario       |
| Búsqueda de archivos (Glob, Grep)        | **Preferido**      | Innecesario       |

---

## Comparación de Capacidades

### Lo Que Desktop Commander Hace Que Claude Code No Puede

| Capacidad                         | Claude Code Nativo                                                  | Desktop Commander                                      |
| --------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| **Sesiones Persistentes**         | El estado del shell no persiste entre llamadas (solo working dir)   | Mantiene sesiones activas (SSH, bases de datos, REPL)  |
| **Ejecución de Código en Memoria**| Requiere Write → Bash                                               | Ejecución directa en REPL (Python, Node.js, R)         |
| **Edición Difusa**                | Edit requiere coincidencia EXACTA de old_string                     | Respaldo inteligente con búsqueda difusa               |
| **Offset Negativo (tail)**        | Read solo tiene offset positivo                                     | Lectura desde el final del archivo (como Unix tail)    |
| **Procesos Interactivos**         | Limitado (background sin stdin)                                     | Stdin/stdout bidireccional                             |
| **Configuración Dinámica**        | Requiere reinicio                                                   | Cambiar shell, directorios, comandos bloqueados al vuelo |
| **Registro de Auditoría**         | Básico en .claude.json                                              | Historial completo de herramientas y estadísticas de uso |

### Donde Claude Code Nativo es Suficiente

| Capacidad                         | Claude Code Nativo                 | Notas                                      |
| --------------------------------- | ---------------------------------- | ------------------------------------------ |
| **Búsqueda Paginada**             | Grep tiene `head_limit` y `offset` | Ya tiene capacidad de streaming            |
| **Gestión Multi-Sesión**          | Task tool + TaskOutput + /tasks    | Enfoque diferente pero funcional           |
| **Análisis CSV/JSON**             | Read + Bash con jq/python          | Funciona bien para la mayoría de los casos |

---

## Instalación

### Prerequisitos

- Node.js 18+
- Claude Code CLI instalado
- Soporte MCP habilitado

### Configuración

```bash
# Instalar desktop-commander globalmente
npm install -g @anthropic/desktop-commander

# O agregar a la configuración MCP de Claude Code
claude mcp add desktop-commander
```

### Configuración

Agregar a `~/.claude.json`:

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@anthropic/desktop-commander"]
    }
  }
}
```

---

## Herramientas Disponibles

### Gestión de Terminal

| Herramienta       | Descripción                                  |
| ----------------- | -------------------------------------------- |
| `execute_command` | Ejecutar comando shell con sesión persistente |
| `read_output`     | Leer salida del proceso en ejecución         |
| `send_input`      | Enviar entrada al proceso interactivo        |
| `force_terminate` | Terminar un proceso en ejecución             |
| `list_sessions`   | Listar todas las sesiones activas            |
| `list_processes`  | Listar procesos en ejecución                 |

### Operaciones de Archivos

| Herramienta      | Descripción                                          |
| ---------------- | ---------------------------------------------------- |
| `read_file`      | Leer archivo con soporte de offset negativo (tail)  |
| `write_file`     | Escribir contenido de archivo                        |
| `edit_block`     | Editar con respaldo de coincidencia difusa           |
| `search_files`   | Buscar con streaming/paginación                      |
| `get_file_info`  | Obtener metadatos del archivo                        |
| `list_directory` | Listar contenido del directorio                      |

### Ejecución de Código

| Herramienta    | Descripción                                       |
| -------------- | ------------------------------------------------- |
| `execute_code` | Ejecutar código en memoria (Python, Node.js, R)  |
| `create_repl`  | Crear sesión REPL persistente                     |
| `repl_execute` | Ejecutar en REPL existente                        |

### Configuración

| Herramienta        | Descripción                                   |
| ------------------ | --------------------------------------------- |
| `get_config`       | Obtener configuración actual                  |
| `set_config_value` | Actualizar configuración dinámicamente        |

---

## Ejemplos de Uso

### Sesión SSH Persistente

```
# Crear sesión SSH
execute_command: ssh user@server.com

# Enviar comandos a la sesión
send_input: ls -la
read_output: [session_id]

# Mantener la sesión activa para múltiples interacciones
send_input: cd /var/log
send_input: tail -f syslog
```

### Análisis Python en Memoria

```
# Ejecutar Python sin crear archivos
execute_code:
  language: python
  code: |
    import pandas as pd
    df = pd.read_csv('/path/to/data.csv')
    print(df.describe())
    print(df.head(10))
```

### Edición Difusa de Archivos

```
# Editar con coincidencia aproximada (cuando falla la coincidencia exacta)
edit_block:
  file_path: /path/to/file.py
  old_text: "def process_data(data)"  # Coincidencia aproximada
  new_text: "def process_data(data: dict) -> dict"
  fuzzy: true
```

### Lectura de Cola de Archivo

```
# Leer las últimas 100 líneas de un archivo de log grande
read_file:
  path: /var/log/application.log
  offset: -100  # Negativo = desde el final
  lines: 100
```

### REPL Interactivo

```
# Crear REPL de Node.js
create_repl:
  language: nodejs

# Ejecutar en REPL (mantiene el estado)
repl_execute: const data = require('./config.json')
repl_execute: Object.keys(data).length
repl_execute: data.settings.enabled
```

---

## Mejores Prácticas

### 1. Usar Herramientas Nativas Cuando Sea Posible

Desktop Commander agrega latencia. Preferir herramientas nativas para:

```
# Bueno - Usar Read nativo
Read tool para lectura simple de archivos

# Bueno - Usar Bash nativo
Bash tool para comandos rápidos

# Bueno - Usar Grep nativo
Grep tool para búsqueda de archivos
```

### 2. Usar Desktop Commander Para

```
# Sesiones persistentes
- Conexiones SSH
- Conexiones a bases de datos (psql, mysql, mongo shell)
- Sesiones REPL (python, node, irb)

# Procesos interactivos
- Comandos de larga duración con monitoreo de salida
- Procesos que requieren entrada stdin

# Operaciones avanzadas de archivos
- Archivos grandes que necesitan tail (offset negativo)
- Ediciones con coincidencias inexactas (fuzzy)
```

### 3. Gestión de Sesiones

```
# Siempre listar sesiones antes de crear nuevas
list_sessions

# Limpiar sesiones no utilizadas
force_terminate: [old_session_id]

# Nombrar sesiones para claridad
execute_command:
  command: ssh prod-server
  session_name: prod-ssh
```

### 4. Manejo de Errores

```
# Verificar estado del proceso antes de enviar entrada
list_processes

# Usar timeouts para operaciones largas
execute_command:
  command: long-running-task
  timeout: 300000  # 5 minutos
```

---

## Integración con AIOX

### Prioridad de Selección de Herramientas

Según `.claude/rules/mcp-usage.md`:

| Tarea                 | USAR ESTO              | NO desktop-commander                |
| --------------------- | ---------------------- | ----------------------------------- |
| Leer archivos locales | `Read` tool            | Más lento                           |
| Escribir archivos locales | `Write` / `Edit` tools | Más lento                       |
| Ejecutar comandos shell | `Bash` tool          | A menos que se necesite sesión persistente |
| Buscar archivos       | `Glob` tool            | Más lento                           |
| Buscar contenido      | `Grep` tool            | Más lento                           |

### Cuándo se Requiere Desktop Commander

1. El usuario solicita explícitamente sesión persistente
2. La tarea requiere ejecución REPL
3. Necesidad de leer cola de archivos grandes
4. La edición requiere coincidencia difusa
5. Proceso interactivo con stdin/stdout

### Responsabilidades de Agentes

| Agente             | Caso de Uso de Desktop Commander              |
| ------------------ | --------------------------------------------- |
| **@dev**           | Sesiones REPL, depuración, codificación en vivo |
| **@devops**        | Sesiones SSH, gestión de servidores, análisis de logs |
| **@data-engineer** | REPL de análisis de datos, conexiones a bases de datos |
| **@qa**            | Pruebas interactivas, monitoreo de procesos   |

---

## Solución de Problemas

### La Sesión No Persiste

```bash
# Verificar si desktop-commander está ejecutándose
claude mcp status

# Reiniciar servidor MCP
claude mcp restart desktop-commander
```

### Edición Difusa No Funciona

```
# Asegurar que el flag fuzzy esté configurado
edit_block:
  fuzzy: true
  threshold: 0.8  # Ajustar umbral de similitud
```

### Timeout del Proceso

```
# Aumentar timeout para operaciones largas
execute_command:
  timeout: 600000  # 10 minutos

# O usar modo background
execute_command:
  background: true
```

### No se Puede Conectar al Servidor

```bash
# Verificar configuración MCP
cat ~/.claude.json | grep -A 10 desktop-commander

# Verificar paquete npm
npm list -g @anthropic/desktop-commander

# Reinstalar si es necesario
npm install -g @anthropic/desktop-commander@latest
```

---

## Documentación Relacionada

- [Docker Gateway Tutorial](./docker-gateway-tutorial.md)
- [MCP Global Setup Guide](../mcp-global-setup.md)
- [Docker MCP Setup](../../docker-mcp-setup.md)
- [MCP Usage Rules](../../../.claude/rules/mcp-usage.md)
- [Agent Tool Integration](../../architecture/agent-tool-integration-guide.md)

---

## Resumen

| Funcionalidad         | Claude Code Nativo | Desktop Commander          |
| --------------------- | ------------------ | -------------------------- |
| Velocidad             | Rápido             | Más lento (overhead MCP)   |
| Sesiones Persistentes | No                 | Sí                         |
| Ejecución en Memoria  | No                 | Sí                         |
| Edición Difusa        | No                 | Sí                         |
| Offset Negativo       | No                 | Sí                         |
| Procesos Interactivos | Limitado           | Completo                   |

**Regla General:** Usar herramientas nativas por defecto. Cambiar a Desktop Commander solo cuando necesites sus capacidades únicas.

---

_Desktop Commander MCP Guide v1.0.0 - AIOX Framework_
