<!--
  Traduccion: ES
  Original: /docs/en/guides/llm-routing.md
  Ultima sincronizacion: 2026-01-26
-->

# Guia de Enrutamiento de LLM

> 🌐 [EN](../../guides/llm-routing.md) | [PT](../../pt/guides/llm-routing.md) | **ES**

---

**Version:** 1.0.0
**Actualizado:** 2025-12-14

Enrutamiento de LLM rentable para Claude Code. Ahorra hasta un 99% en costos de API mientras mantienes la funcionalidad completa.

---

## Descripcion General

El Enrutamiento de LLM proporciona dos comandos para diferentes casos de uso:

| Comando | Proveedor | Costo | Caso de Uso |
|---------|----------|------|----------|
| `claude-max` | Claude Max (OAuth) | Suscripcion | Experiencia premium, tareas complejas |
| `claude-free` | DeepSeek | ~$0.14/M tokens | Desarrollo, pruebas, tareas simples |

---

## Inicio Rapido

### Instalacion

**Opcion 1: Si tienes aiox-core clonado**
```bash
# Desde el directorio aiox-core
node .aiox-core/infrastructure/scripts/llm-routing/install-llm-routing.js
```

**Opcion 2: Instalacion nueva**
```bash
# Clonar el repositorio
git clone https://github.com/SynkraAI/aiox-core.git
cd aiox-core

# Ejecutar el instalador
node .aiox-core/infrastructure/scripts/llm-routing/install-llm-routing.js
```

### Configurar Clave API de DeepSeek

1. Obtener tu clave API en: <https://platform.deepseek.com/api_keys>
2. Agregar al archivo `.env` de tu proyecto:

```bash
DEEPSEEK_API_KEY=sk-your-key-here
```

### Uso

```bash
# Experiencia premium de Claude (usa tu suscripcion Claude Max)
claude-max

# Desarrollo rentable (usa DeepSeek ~$0.14/M tokens)
claude-free
```

---

## Comandos

### claude-max

Usa tu suscripcion Claude Max via OAuth (inicio de sesion en claude.ai).

**Caracteristicas:**
- Capacidades completas de Claude
- No requiere clave API
- Usa el inicio de sesion existente de Claude
- Ideal para tareas de razonamiento complejo

**Uso:**
```bash
claude-max
```

**Cuando usar:**
- Analisis de codigo complejo
- Decisiones arquitectonicas
- Tareas que requieren alta precision
- Trabajo critico de produccion

---

### claude-free

Usa la API de DeepSeek con endpoint compatible con Anthropic.

**Caracteristicas:**
- Llamadas a herramientas soportadas
- Streaming soportado
- ~99% de reduccion de costos
- Soporte para archivo `.env` del proyecto

**Uso:**
```bash
claude-free
```

**Cuando usar:**
- Desarrollo y pruebas
- Tareas de codigo simples
- Aprendizaje y experimentacion
- Operaciones de alto volumen

---

## Comparacion de Costos

| Proveedor | Tokens de Entrada | Tokens de Salida | Mensual (1M tokens) |
|----------|-------------|---------------|---------------------|
| API de Claude | $15.00/M | $75.00/M | $90.00 |
| Claude Max | Incluido | Incluido | $20/mes |
| **DeepSeek** | **$0.07/M** | **$0.14/M** | **$0.21** |

**Ahorro con DeepSeek:** Hasta 99.7% comparado con la API de Claude

---

## Configuracion

### Fuentes de Clave API

`claude-free` busca la clave API de DeepSeek en este orden:

1. **Archivo `.env` del proyecto** (recomendado)
   ```bash
   # .env en la raiz de tu proyecto
   DEEPSEEK_API_KEY=sk-your-key-here
   ```

2. **Variable de entorno**
   ```bash
   # Windows
   setx DEEPSEEK_API_KEY "sk-your-key-here"

   # Unix (agregar a ~/.bashrc o ~/.zshrc)
   export DEEPSEEK_API_KEY="sk-your-key-here"
   ```

### Ubicaciones de Instalacion

| SO | Directorio de Instalacion |
|----|-------------------|
| Windows | `%APPDATA%\npm\` |
| macOS/Linux | `/usr/local/bin/` o `~/bin/` |

---

## Como Funciona

### claude-max
1. Limpia todas las configuraciones de proveedores alternativos
2. Usa la autenticacion OAuth predeterminada de Claude
3. Inicia Claude Code con tu suscripcion Max

### claude-free
1. Busca el archivo `.env` (directorio actual -> directorios padre)
2. Carga `DEEPSEEK_API_KEY` desde `.env` o variables de entorno
3. Configura el endpoint compatible con Anthropic de DeepSeek
4. Inicia Claude Code con backend de DeepSeek

**Endpoint de DeepSeek:**
```text
https://api.deepseek.com/anthropic
```

Este endpoint proporciona:
- Compatibilidad con API de Anthropic
- Soporte para llamadas a herramientas/funciones
- Respuestas en streaming

### Nota de Seguridad: Omision de Permisos

Tanto `claude-max` como `claude-free` usan la bandera `--dangerously-skip-permissions` por defecto. Esto:

- **Omite los prompts de confirmacion** para operaciones de archivos, ejecucion de comandos, etc.
- **Solo debe usarse en repositorios/entornos de confianza**
- **No se recomienda para bases de codigo no confiables**

Se muestra una advertencia cada vez que ejecutas estos comandos. Si prefieres confirmaciones interactivas, ejecuta `claude` directamente en lugar de usar los comandos de enrutamiento.

---

## Solucion de Problemas

### Comando no encontrado

**Windows:**
```powershell
# Verificar si npm global esta en PATH
echo $env:PATH | Select-String "npm"

# Si no, agregarlo:
$env:PATH += ";$env:APPDATA\npm"
```

**Unix:**
```bash
# Verificar PATH
echo $PATH | grep -E "(local/bin|~/bin)"

# Si ~/bin no esta en PATH, agregar a ~/.bashrc:
export PATH="$HOME/bin:$PATH"
```

### DEEPSEEK_API_KEY no encontrada

1. Verificar que el archivo `.env` existe en la raiz del proyecto
2. Verificar formato de la clave: `DEEPSEEK_API_KEY=sk-...`
3. Sin espacios alrededor de `=`
4. No se necesitan comillas alrededor del valor

### Errores de API

| Error | Causa | Solucion |
|-------|-------|----------|
| 401 Unauthorized | Clave API invalida | Verificar clave en el panel de DeepSeek |
| 429 Rate Limited | Demasiadas solicitudes | Esperar y reintentar |
| Connection refused | Problema de red | Verificar conexion a internet |

### Llamadas a herramientas no funcionan

El endpoint `/anthropic` de DeepSeek soporta llamadas a herramientas. Si las herramientas no funcionan:
1. Verificar que el endpoint es `https://api.deepseek.com/anthropic`
2. Verificar que la clave API tiene creditos suficientes
3. Intentar una prueba simple sin herramientas primero

---

## Configuracion Avanzada

### Modelos Personalizados

Editar los archivos de plantilla si necesitas modelos diferentes:

**Windows:** `.aiox-core/infrastructure/scripts/llm-routing/templates/claude-free.cmd`
**Unix:** `.aiox-core/infrastructure/scripts/llm-routing/templates/claude-free.sh`

Cambiar:
```bash
export ANTHROPIC_MODEL="deepseek-chat"
```

### Variables de Entorno

| Variable | Descripcion | Predeterminado |
|----------|-------------|---------|
| `ANTHROPIC_BASE_URL` | Endpoint de API | `https://api.deepseek.com/anthropic` |
| `ANTHROPIC_API_KEY` | Clave API | Desde DEEPSEEK_API_KEY |
| `ANTHROPIC_MODEL` | Nombre del modelo | `deepseek-chat` |
| `API_TIMEOUT_MS` | Tiempo de espera de solicitud | `600000` (10 min) |

---

## Desinstalacion

### Windows
```powershell
Remove-Item "$env:APPDATA\npm\claude-free.cmd"
Remove-Item "$env:APPDATA\npm\claude-max.cmd"
```

### Unix
```bash
rm /usr/local/bin/claude-free
rm /usr/local/bin/claude-max
# O si se instalo en ~/bin:
rm ~/bin/claude-free
rm ~/bin/claude-max
```

---

## Recursos Relacionados

- **Definicion de Herramienta:** `.aiox-core/infrastructure/tools/cli/llm-routing.yaml`
- **Script de Instalacion:** `.aiox-core/infrastructure/scripts/llm-routing/install-llm-routing.js`
- **Definicion de Tarea:** `.aiox-core/development/tasks/setup-llm-routing.md`
- **API de DeepSeek:** <https://platform.deepseek.com/api_keys>

---

## Preguntas Frecuentes

**P: Es DeepSeek tan bueno como Claude?**
R: DeepSeek es excelente para la mayoria de tareas de programacion pero puede no igualar el razonamiento de Claude en problemas complejos. Usa `claude-max` para trabajo critico.

**P: Puedo usar ambos comandos en la misma sesion?**
R: Si! Cada comando configura su propio entorno. Puedes alternar entre ellos.

**P: Funciona claude-free sin conexion?**
R: No, requiere acceso a internet para conectarse a la API de DeepSeek.

**P: Estan seguras mis claves API?**
R: Las claves se cargan desde archivos `.env` (no los subas al repositorio!) o variables de entorno. Nunca codifiques las claves directamente.

---

*Generado por AIOX Framework - Story 6.7*
