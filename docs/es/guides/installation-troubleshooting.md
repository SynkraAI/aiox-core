<!--
  Traducción: ES
  Original: /docs/en/guides/installation-troubleshooting.md
  Última sincronización: 2026-01-26
-->

# Guía de Instalación y Solución de Problemas de AIOX-Core

> 🌐 [EN](../../guides/installation-troubleshooting.md) | [PT](../../pt/guides/installation-troubleshooting.md) | **ES**

---

## Inicio Rápido

```bash
npx aiox-core@latest
```

Este comando descarga y ejecuta la última versión del instalador de AIOX-Core.

## Requisitos del Sistema

| Requisito | Versión Mínima | Comando de Verificación |
|-----------|----------------|-------------------------|
| **Node.js** | v18.0.0+ | `node --version` |
| **npm** | v9.0.0+ | `npm --version` |
| **npx** | (incluido con npm 5.2+) | `npx --version` |
| **Git** | Cualquier versión reciente (opcional) | `git --version` |

### Enlaces de Descarga

- **Node.js**: https://nodejs.org/ (Descargar versión LTS - incluye npm y npx)
- **Git**: https://git-scm.com/ (Opcional, pero recomendado)

---

## Métodos de Instalación

### Método 1: npx (Recomendado)

```bash
# Install in current directory
npx aiox-core@latest

# Install with specific version
npx aiox-core@2.2.0

# Show version
npx aiox-core@latest --version

# Show help
npx aiox-core@latest --help
```

### Método 2: Desde GitHub

```bash
npx github:SynkraAI/aiox-core install
```

### Método 3: Instalación Global

```bash
npm install -g aiox-core
aiox-core
```

---

## Herramienta de Diagnóstico

Si tienes problemas de instalación, ejecuta nuestra herramienta de diagnóstico:

### Windows (CMD)
```cmd
curl -o diagnose.cmd https://raw.githubusercontent.com/SynkraAI/aiox-core/main/tools/quick-diagnose.cmd && diagnose.cmd
```

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/SynkraAI/aiox-core/main/tools/quick-diagnose.ps1 | iex
```

### macOS/Linux
```bash
curl -fsSL https://raw.githubusercontent.com/SynkraAI/aiox-core/main/tools/diagnose-installation.js | node
```

---

## Problemas Comunes y Soluciones

### Problema 1: "Node.js version too old"

**Error:**
```
error engine Unsupported engine
error notsup Required: {"node":">=18.0.0"}
```

**Solución:**
1. Descargar Node.js LTS desde https://nodejs.org/
2. Instalar y reiniciar tu terminal
3. Verificar: `node --version` (debería mostrar v18+ o v20+)

---

### Problema 2: "npm version too old"

**Error:**
```
npm ERR! Required: {"npm":">=9.0.0"}
```

**Solución:**
```bash
# Update npm globally
npm install -g npm@latest

# Verify
npm --version
```

---

### Problema 3: "npx not found" o "npx command not recognized"

**Causa:** La carpeta bin de npm no está en el PATH del sistema

**Solución (Windows):**
1. Encontrar el prefix de npm: `npm config get prefix`
2. Agregar al PATH:
   - Presionar Win+X -> Sistema -> Configuración avanzada del sistema -> Variables de entorno
   - Editar "Path" en Variables de usuario
   - Agregar: `C:\Users\TU_USUARIO\AppData\Roaming\npm`
3. Reiniciar terminal

**Solución (macOS/Linux):**
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$PATH:$(npm config get prefix)/bin"

# Reload
source ~/.bashrc
```

---

### Problema 4: "EACCES: permission denied"

**Solución (Windows):**
Ejecutar terminal como Administrador

**Solución (macOS/Linux):**
```bash
# Fix npm permissions (recommended)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Or use nvm (best practice)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

---

### Problema 5: "ETIMEDOUT" o "ECONNREFUSED"

**Causa:** Red/firewall bloqueando el registro de npm

**Soluciones:**

1. **Verificar registro de npm:**
   ```bash
   npm config get registry
   # Should be: https://registry.npmjs.org/
   ```

2. **Restablecer registro:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

3. **Probar conectividad:**
   ```bash
   npm ping
   ```

4. **Detrás de proxy corporativo:**
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

5. **Usar mirror (China):**
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```

---

### Problema 6: "PowerShell execution policy" (Windows)

**Error:**
```
File cannot be loaded because running scripts is disabled on this system
```

**Solución:**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Problema 7: "Cannot find module" o "Missing dependencies"

**Solución:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules if exists
rm -rf node_modules

# Try again
npx aiox-core@latest
```

---

### Problema 8: "SSL/Certificate errors"

**Solución:**
```bash
# Temporarily disable strict SSL (not recommended for production)
npm config set strict-ssl false

# Better: Update certificates
npm config set cafile /path/to/certificate.pem
```

---

### Problema 9: El paquete muestra versión antigua

**Causa:** Caché de npm sirviendo versión antigua

**Solución:**
```bash
# Clear npx cache
npx clear-npx-cache

# Or force fresh download
npx --ignore-existing aiox-core@latest

# Or use specific version
npx aiox-core@2.2.0
```

---

## Lista de Verificación del Entorno

Ejecuta estos comandos para verificar tu entorno:

```bash
# 1. Check Node.js (need v18+)
node --version

# 2. Check npm (need v9+)
npm --version

# 3. Check npx
npx --version

# 4. Check npm registry access
npm view aiox-core version

# 5. Test installation
npx aiox-core@latest --version
```

**Salida esperada:**
```
v22.x.x (or v18+/v20+)
11.x.x (or v9+)
11.x.x (same as npm)
2.2.0
2.2.0
```

---

## Obtener Ayuda

Si sigues teniendo problemas:

1. **GitHub Issues**: https://github.com/SynkraAI/aiox-core/issues
2. **Ejecutar diagnósticos**: `npx aiox-core@latest doctor`
3. **Verificar información del sistema**: `npx aiox-core@latest info`

Al reportar problemas, por favor incluye:
- Sistema operativo y versión
- Versión de Node.js (`node --version`)
- Versión de npm (`npm --version`)
- Mensaje de error completo
- Salida de la herramienta de diagnóstico

---

## Referencia Rápida

| Comando | Descripción |
|---------|-------------|
| `npx aiox-core@latest` | Instalar/ejecutar asistente |
| `npx aiox-core@latest --version` | Mostrar versión |
| `npx aiox-core@latest --help` | Mostrar ayuda |
| `npx aiox-core@latest install` | Instalar en directorio actual |
| `npx aiox-core@latest init <name>` | Crear nuevo proyecto |
| `npx aiox-core@latest doctor` | Ejecutar diagnósticos |
| `npx aiox-core@latest info` | Mostrar información del sistema |

---

*Última actualización: Diciembre 2025 | AIOX-Core v2.2.0*
