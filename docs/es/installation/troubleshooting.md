<!--
  Traducción: ES
  Original: /docs/en/installation/troubleshooting.md
  Última sincronización: 2026-01-26
-->

# Guía de Solución de Problemas de Synkra AIOS

> 🌐 [EN](../../installation/troubleshooting.md) | [PT](../../pt/installation/troubleshooting.md) | **ES**

---

**Versión:** 2.1.0
**Última Actualización:** 2025-01-24

---

## Tabla de Contenidos

- [Diagnóstico Rápido](#diagnóstico-rápido)
- [Problemas de Instalación](#problemas-de-instalación)
- [Problemas de Red y Conectividad](#problemas-de-red-y-conectividad)
- [Problemas de Permisos y Acceso](#problemas-de-permisos-y-acceso)
- [Problemas Específicos del Sistema Operativo](#problemas-específicos-del-sistema-operativo)
- [Problemas de Configuración del IDE](#problemas-de-configuración-del-ide)
- [Problemas de Activación de Agentes](#problemas-de-activación-de-agentes)
- [Comandos de Diagnóstico](#comandos-de-diagnóstico)
- [Obtener Ayuda](#obtener-ayuda)

---

## Diagnóstico Rápido

Ejecute este comando de diagnóstico primero para identificar problemas comunes:

```bash
npx aios-core status
```

Si el comando de estado falla, trabaje a través de las secciones a continuación según su mensaje de error.

---

## Problemas de Instalación

### Problema 1: "npx aios-core no se reconoce"

**Síntomas:**

```
'npx' is not recognized as an internal or external command
```

**Causa:** Node.js o npm no está instalado o no está en PATH.

**Solución:**

```bash
# Verificar si Node.js está instalado
node --version

# Si no está instalado:
# Windows: Descargar desde https://nodejs.org/
# macOS: brew install node
# Linux: nvm install 18

# Verificar que npm esté disponible
npm --version

# Si falta npm, reinstalar Node.js
```

---

### Problema 2: "Directorio de Instalación Inapropiado Detectado"

**Síntomas:**

```
⚠️  Inappropriate Installation Directory Detected

Current directory: /Users/username

Synkra AIOS should be installed in your project directory,
not in your home directory or temporary locations.
```

**Causa:** Ejecutar el instalador desde el directorio home, /tmp, o caché de npx.

**Solución:**

```bash
# Navegar primero a su directorio de proyecto
cd /path/to/your/project

# Luego ejecutar el instalador
npx aios-core install
```

---

### Problema 3: "Instalación fallida: ENOENT"

**Síntomas:**

```
Installation failed: ENOENT: no such file or directory
```

**Causa:** El directorio de destino no existe o tiene permisos incorrectos.

**Solución:**

```bash
# Crear el directorio primero
mkdir -p /path/to/your/project

# Navegar a él
cd /path/to/your/project

# Ejecutar el instalador
npx aios-core install
```

---

### Problema 4: "Versión de Node.js muy antigua"

**Síntomas:**

```
Error: Synkra AIOS requires Node.js 18.0.0 or higher
Current version: 14.17.0
```

**Causa:** La versión de Node.js está por debajo del requisito mínimo.

**Solución:**

```bash
# Verificar versión actual
node --version

# Actualizar usando nvm (recomendado)
nvm install 18
nvm use 18

# O descargar el último LTS desde nodejs.org
```

---

### Problema 5: "npm ERR! code E404"

**Síntomas:**

```
npm ERR! code E404
npm ERR! 404 Not Found - GET https://registry.npmjs.org/aios-core
```

**Causa:** Paquete no encontrado en el registro npm (problema de red o error tipográfico).

**Solución:**

```bash
# Limpiar caché de npm
npm cache clean --force

# Verificar registro
npm config get registry
# Debe ser: https://registry.npmjs.org/

# Si usa un registro personalizado, restablecer al predeterminado
npm config set registry https://registry.npmjs.org/

# Reintentar instalación
npx aios-core install
```

---

### Problema 6: "EACCES: permiso denegado"

**Síntomas:**

```
npm ERR! EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Causa:** El directorio npm global tiene permisos incorrectos.

**Solución:**

```bash
# Opción 1: Corregir permisos de npm (Linux/macOS)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
# Agregar la línea export a ~/.bashrc o ~/.zshrc

# Opción 2: Usar npx en lugar de instalación global (recomendado)
npx aios-core install

# Opción 3: Usar nvm para administrar Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

---

## Problemas de Red y Conectividad

### Problema 7: "ETIMEDOUT" o "ECONNREFUSED"

**Síntomas:**

```
npm ERR! code ETIMEDOUT
npm ERR! errno ETIMEDOUT
npm ERR! network request to https://registry.npmjs.org/aios-core failed
```

**Causa:** Problema de conectividad de red, firewall o proxy bloqueando npm.

**Solución:**

```bash
# Verificar si el registro npm es accesible
curl -I https://registry.npmjs.org/

# Si está detrás de un proxy, configurar npm
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Si usa inspección SSL corporativa, deshabilitar SSL estricto (usar con precaución)
npm config set strict-ssl false

# Reintentar con registro detallado
npm install aios-core --verbose
```

---

### Problema 8: "Problema de Certificado SSL"

**Síntomas:**

```
npm ERR! code UNABLE_TO_GET_ISSUER_CERT_LOCALLY
npm ERR! unable to get local issuer certificate
```

**Causa:** La verificación del certificado SSL falla (común en entornos corporativos).

**Solución:**

```bash
# Agregar el certificado CA de su empresa
npm config set cafile /path/to/your/certificate.pem

# O deshabilitar SSL estricto (usar solo si confía en su red)
npm config set strict-ssl false

# Verificar y reintentar
npm config get strict-ssl
npx aios-core install
```

---

### Problema 9: "Conexión restablecida por el par"

**Síntomas:**

```
npm ERR! network socket hang up
npm ERR! network This is a problem related to network connectivity.
```

**Causa:** Conexión a internet inestable o problemas de DNS.

**Solución:**

```bash
# Intentar usar DNS diferente
# Windows: Panel de Control > Red > DNS = 8.8.8.8, 8.8.4.4
# Linux: echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

# Limpiar caché DNS
# Windows: ipconfig /flushdns
# macOS: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches

# Reintentar con un tiempo de espera más largo
npm config set fetch-timeout 60000
npx aios-core install
```

---

## Problemas de Permisos y Acceso

### Problema 10: "EPERM: operación no permitida"

**Síntomas:**

```
Error: EPERM: operation not permitted, unlink '/path/to/file'
```

**Causa:** El archivo está bloqueado por otro proceso o permisos insuficientes.

**Solución:**

```bash
# Windows: Cerrar todas las instancias del IDE, luego:
taskkill /f /im node.exe

# macOS/Linux: Verificar procesos bloqueados
lsof +D /path/to/project

# Matar cualquier proceso que retiene archivos
kill -9 <PID>

# Intentar la instalación nuevamente
npx aios-core install
```

---

### Problema 11: "Sistema de archivos de solo lectura"

**Síntomas:**

```
Error: EROFS: read-only file system
```

**Causa:** Intentando instalar en un montaje de solo lectura o directorio del sistema.

**Solución:**

```bash
# Verificar que el sistema de archivos sea escribible
touch /path/to/project/test.txt
# Si esto falla, el directorio es de solo lectura

# Verificar opciones de montaje
mount | grep /path/to/project

# Instalar en un directorio escribible en su lugar
cd ~/projects/my-project
npx aios-core install
```

---

### Problema 12: "Directorio no vacío" durante actualización

**Síntomas:**

```
Error: ENOTEMPTY: directory not empty, rmdir '.aios-core'
```

**Causa:** Instalación existente con archivos modificados.

**Solución:**

```bash
# Hacer copia de seguridad de la instalación existente
mv .aios-core .aios-core.backup

# Ejecutar el instalador con bandera de fuerza
npx aios-core install --force-upgrade

# Si es necesario, restaurar archivos personalizados desde la copia de seguridad
cp .aios-core.backup/custom-files/* .aios-core/
```

---

## Problemas Específicos del Sistema Operativo

### Problemas de Windows

#### Problema 13: "Política de ejecución de PowerShell"

**Síntomas:**

```
File cannot be loaded because running scripts is disabled on this system.
```

**Solución:**

```powershell
# Verificar política actual
Get-ExecutionPolicy

# Establecer en RemoteSigned (recomendado)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# O usar CMD en lugar de PowerShell
cmd
npx aios-core install
```

#### Problema 14: "Ruta demasiado larga"

**Síntomas:**

```
Error: ENAMETOOLONG: name too long
```

**Solución:**

```powershell
# Habilitar rutas largas en Windows 10/11
# Ejecutar como Administrador:
reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f

# O usar una ruta de proyecto más corta
cd C:\dev\proj
npx aios-core install
```

#### Problema 15: "npm no encontrado en Git Bash"

**Síntomas:**

```
bash: npm: command not found
```

**Solución:**

```bash
# Agregar Node.js al path de Git Bash
# En ~/.bashrc o ~/.bash_profile:
export PATH="$PATH:/c/Program Files/nodejs"

# O usar Windows Terminal/CMD/PowerShell en su lugar
```

---

### Problemas de macOS

#### Problema 16: "Se requieren Xcode Command Line Tools"

**Síntomas:**

```
xcode-select: error: command line tools are not installed
```

**Solución:**

```bash
# Instalar Xcode Command Line Tools
xcode-select --install

# Seguir el diálogo de instalación
# Luego reintentar
npx aios-core install
```

#### Problema 17: "Compatibilidad con Apple Silicon (M1/M2)"

**Síntomas:**

```
Error: Unsupported architecture: arm64
```

**Solución:**

```bash
# La mayoría de los paquetes funcionan nativamente, pero si los problemas persisten:

# Instalar Rosetta 2 para compatibilidad x86
softwareupdate --install-rosetta

# Usar versión x86 de Node.js (si es necesario)
arch -x86_64 /bin/bash
nvm install 18
npx aios-core install
```

---

### Problemas de Linux

#### Problema 18: "Error de dependencia libvips"

**Síntomas:**

```
Error: Cannot find module '../build/Release/sharp-linux-x64.node'
```

**Solución:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y build-essential libvips-dev

# Fedora/RHEL
sudo dnf install vips-devel

# Limpiar caché de npm y reinstalar
npm cache clean --force
npx aios-core install
```

#### Problema 19: "Versión de GLIBC muy antigua"

**Síntomas:**

```
Error: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.28' not found
```

**Solución:**

```bash
# Verificar versión de GLIBC
ldd --version

# Si la versión es muy antigua, use Node.js LTS para su distribución:
# Ubuntu 18.04: Use Node.js 16 (máximo soportado)
nvm install 16
nvm use 16

# O actualice su distribución de Linux
```

---

## Problemas de Configuración del IDE

### Problema 20: "Los agentes no aparecen en el IDE"

**Síntomas:** Los comandos de agentes (`/dev`, `@dev`) no funcionan después de la instalación.

**Solución:**

1. Reinicie su IDE completamente (no solo recargar)
2. Verifique que los archivos fueron creados:

   ```bash
   # Claude Code
   ls .claude/commands/AIOS/agents/

   # Cursor
   ls .cursor/rules/
   ```

3. Verifique que la configuración del IDE permita comandos personalizados
4. Vuelva a ejecutar la instalación para el IDE específico:
   ```bash
   npx aios-core install --ide claude-code
   ```

---

### Problema 21: "El agente muestra markdown sin formato en lugar de activarse"

**Síntomas:** El IDE muestra el contenido del archivo del agente en lugar de activarlo.

**Solución:**

1. Verifique que la versión del IDE sea compatible
2. Para Cursor: Asegúrese de que los archivos tengan extensión `.mdc`
3. Para Claude Code: Los archivos deben estar en `.claude/commands/`
4. Reinicie el IDE después de la instalación

---

## Problemas de Activación de Agentes

### Problema 22: Error "Agente no encontrado"

**Síntomas:**

```
Error: Agent 'dev' not found in .aios-core/agents/
```

**Solución:**

```bash
# Verificar que los archivos de agentes existan
ls .aios-core/agents/

# Si faltan, reinstalar core
npx aios-core install --full

# Verificar que core-config.yaml sea válido
cat .aios-core/core-config.yaml
```

---

### Problema 23: "Error de análisis YAML" en agente

**Síntomas:**

```
YAMLException: bad indentation of a mapping entry
```

**Solución:**

```bash
# Validar sintaxis YAML
npx yaml-lint .aios-core/agents/dev.md

# Correcciones comunes:
# - Usar espacios, no tabulaciones
# - Asegurar indentación consistente (2 espacios)
# - Verificar caracteres especiales en cadenas (usar comillas)

# Reinstalar para obtener archivos de agentes limpios
mv .aios-core/agents/dev.md .aios-core/agents/dev.md.backup
npx aios-core install --full
```

---

## Comandos de Diagnóstico

### Diagnósticos Generales

```bash
# Verificar estado de instalación de AIOS
npx aios-core status

# Listar Squads disponibles
npx aios-core install

# Actualizar instalación existente
npx aios-core update

# Mostrar registro detallado
npx aios-core install --verbose
```

### Información del Sistema

```bash
# Versiones de Node.js y npm
node --version && npm --version

# Configuración de npm
npm config list

# Variables de entorno
printenv | grep -i npm
printenv | grep -i node

# Espacio en disco (asegurar >500MB libres)
df -h .
```

### Verificación de Archivos

```bash
# Verificar estructura de .aios-core
find .aios-core -type f | wc -l
# Esperado: 200+ archivos

# Verificar YAML corrupto
for f in .aios-core/**/*.yaml; do npx yaml-lint "$f"; done

# Verificar permisos
ls -la .aios-core/
```

---

## Obtener Ayuda

### Antes de Solicitar Ayuda

1. Ejecute `npx aios-core status` y anote la salida
2. Revise esta guía de solución de problemas
3. Busque [Issues de GitHub](https://github.com/SynkraAI/aios-core/issues) existentes

### Información a Incluir en Reportes de Errores

```
**Entorno:**
- SO: [Windows 11 / macOS 14 / Ubuntu 22.04]
- Versión de Node.js: [salida de `node --version`]
- Versión de npm: [salida de `npm --version`]
- IDE: [Claude Code / Cursor / etc.]

**Pasos para Reproducir:**
1. [Primer paso]
2. [Segundo paso]
3. [Ocurre el error]

**Comportamiento Esperado:**
[Qué debería pasar]

**Comportamiento Actual:**
[Qué realmente pasa]

**Salida del Error:**
```

[Pegar mensaje de error completo aquí]

```

**Contexto Adicional:**
[Cualquier otra información relevante]
```

### Canales de Soporte

- **Issues de GitHub**: [aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Documentación**: [docs/installation/](./README.md)
- **FAQ**: [faq.md](./faq.md)

---

## Documentación Relacionada

- [FAQ](./faq.md)
