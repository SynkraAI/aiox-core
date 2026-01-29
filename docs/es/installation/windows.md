<!--
  Traducción: ES
  Original: /docs/installation/windows.md
  Última sincronización: 2026-01-29
-->

# Guía de Instalación Windows para Synkra AIOS

> 🌐 [EN](../../installation/windows.md) | [PT](../../pt/installation/windows.md) | **ES**

---

## Versiones Soportadas

| Versión de Windows    | Estado                      | Notas                            |
| --------------------- | --------------------------- | -------------------------------- |
| Windows 11            | ✅ Totalmente Soportado     | Recomendado                      |
| Windows 10 (22H2+)    | ✅ Totalmente Soportado     | Requiere últimas actualizaciones |
| Windows 10 (anterior) | ⚠️ Soporte Limitado         | Actualización recomendada        |
| Windows Server 2022   | ✅ Totalmente Soportado     |                                  |
| Windows Server 2019   | ⚠️ Probado por la Comunidad |                                  |

---

## Requisitos Previos

### 1. Node.js (v20 o superior)

**Opción A: Usando el Instalador Oficial (Recomendado)**

1. Descargue desde [nodejs.org](https://nodejs.org/)
2. Elija la versión **LTS** (20.x o superior)
3. Ejecute el instalador con opciones predeterminadas
4. Verifique la instalación en PowerShell:

```powershell
node --version  # Debería mostrar v20.x.x
npm --version
```

**Opción B: Usando winget**

```powershell
# Instalar via Windows Package Manager
winget install OpenJS.NodeJS.LTS

# Reinicie PowerShell, luego verifique
node --version
```

**Opción C: Usando Chocolatey**

```powershell
# Instale Chocolatey primero (si no está instalado)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar Node.js
choco install nodejs-lts -y

# Reinicie PowerShell
node --version
```

### 2. Git para Windows

**Usando Instalador Oficial (Recomendado)**

1. Descargue desde [git-scm.com](https://git-scm.com/download/win)
2. Ejecute el instalador con estas opciones recomendadas:
   - ✅ Git from the command line and also from 3rd-party software
   - ✅ Use bundled OpenSSH
   - ✅ Checkout Windows-style, commit Unix-style line endings
   - ✅ Use Windows' default console window

**Usando winget**

```powershell
winget install Git.Git
```

Verifique la instalación:

```powershell
git --version
```

### 3. GitHub CLI

**Usando winget (Recomendado)**

```powershell
winget install GitHub.cli
```

**Usando Chocolatey**

```powershell
choco install gh -y
```

Autentique:

```powershell
gh auth login
# Siga las indicaciones, elija "Login with a web browser"
```

### 4. Windows Terminal (Recomendado)

Para la mejor experiencia, use Windows Terminal:

```powershell
winget install Microsoft.WindowsTerminal
```

---

## Instalación

### Instalación Rápida

1. Abra **PowerShell** o **Windows Terminal**
2. Navegue al directorio de su proyecto:

   ```powershell
   cd C:\Users\SuNombre\proyectos\mi-proyecto
   ```

3. Ejecute el instalador:

   ```powershell
   npx github:SynkraAI/aios-core install
   ```

### Qué Hace el Instalador

El instalador automáticamente:

- ✅ Detecta Windows y aplica configuraciones específicas de plataforma
- ✅ Crea directorios necesarios con permisos apropiados
- ✅ Configura rutas de IDE para ubicaciones Windows:
  - Cursor: `%APPDATA%\Cursor\`
  - Claude: `%USERPROFILE%\.claude\`
  - Windsurf: `%APPDATA%\Windsurf\`
- ✅ Maneja separadores de ruta Windows (barras invertidas)
- ✅ Configura terminaciones de línea correctamente (CRLF para batch, LF para scripts)
- ✅ Configura scripts npm compatibles con cmd.exe y PowerShell

---

## Configuración Específica por IDE

### Cursor

1. Descargue desde [cursor.sh](https://cursor.sh/)
2. Ejecute el instalador
3. Reglas del IDE se instalan en `.cursor\rules\`
4. Atajo de teclado: `Ctrl+L` para abrir chat
5. Use `@nombre-del-agente` para activar agentes

### Claude Code (CLI)

1. Instale Claude Code:

   ```powershell
   npm install -g @anthropic-ai/claude-code
   ```

2. Comandos se instalan en `.claude\commands\AIOS\`
3. Use `/nombre-del-agente` para activar agentes

### Windsurf

1. Descargue desde [codeium.com/windsurf](https://codeium.com/windsurf)
2. Ejecute el instalador
3. Reglas se instalan en `.windsurf\rules\`
4. Use `@nombre-del-agente` para activar agentes

---

## Solución de Problemas

### Error de Política de Ejecución

Si ve `running scripts is disabled`:

```powershell
# Verificar política actual
Get-ExecutionPolicy

# Configurar para permitir scripts locales (recomendado)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# O bypass temporal para sesión actual
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Errores de Permiso npm EACCES

```powershell
# Limpiar caché de npm
npm cache clean --force

# Configurar prefijo npm al directorio del usuario
npm config set prefix "$env:APPDATA\npm"

# Agregar al PATH (permanente)
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";$env:APPDATA\npm",
    "User"
)
```

### Problemas de Ruta Larga

Windows tiene límite de 260 caracteres por defecto. Para habilitar rutas largas:

1. Abra **Editor de Directivas de Grupo** (`gpedit.msc`)
2. Navegue a: Configuración del Equipo → Plantillas Administrativas → Sistema → Sistema de Archivos
3. Habilite "Habilitar rutas largas Win32"

O via PowerShell (requiere admin):

```powershell
# Ejecutar como Administrador
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

### Node.js No Encontrado Después de Instalar

```powershell
# Actualizar variables de entorno
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# O reinicie PowerShell/Terminal
```

### Antivirus Bloqueando npm

Algunos antivirus bloquean operaciones npm:

1. Agregue excepciones para:
   - `%APPDATA%\npm`
   - `%APPDATA%\npm-cache`
   - `%USERPROFILE%\node_modules`
   - Su directorio de proyecto

2. Temporalmente deshabilite escaneo en tiempo real durante instalación (no recomendado para producción)

### Problemas de Autenticación GitHub CLI

```powershell
# Verificar estado
gh auth status

# Re-autenticar
gh auth login --web

# Si está detrás de proxy corporativo
$env:HTTPS_PROXY = "http://proxy.empresa.com:8080"
gh auth login
```

---

## Integración WSL (Opcional)

Para usuarios que prefieren herramientas Linux dentro de Windows:

### Instalar WSL2

```powershell
# Ejecutar como Administrador
wsl --install

# Instalar Ubuntu (predeterminado)
wsl --install -d Ubuntu

# Reinicie el computador cuando se solicite
```

### Configurar AIOS con WSL

```bash
# Dentro de WSL, siga la guía de instalación Linux
# Vea: docs/installation/linux.md

# Acceder archivos Windows desde WSL
cd /mnt/c/Users/SuNombre/proyectos/mi-proyecto

# Para mejor rendimiento, mantenga proyectos en sistema de archivos Linux
# Use: ~/proyectos/ en lugar de /mnt/c/
```

---

## Actualización

Para actualizar una instalación existente:

```powershell
# Usando npx (recomendado)
npx github:SynkraAI/aios-core install

# El actualizador:
# - Detectará instalación existente
# - Hará respaldo de personalizaciones en .aios-backup\
# - Actualizará solo archivos modificados
# - Preservará configuraciones
```

---

## Requisitos del Sistema

| Requisito        | Mínimo    | Recomendado |
| ---------------- | --------- | ----------- |
| Windows          | 10 (22H2) | 11          |
| RAM              | 4GB       | 8GB         |
| Espacio en Disco | 1GB       | 5GB         |
| Node.js          | 18.x      | 20.x LTS    |
| npm              | 9.x       | 10.x        |
| PowerShell       | 5.1       | 7.x (Core)  |

---

## Próximos Pasos

1. Configure su IDE (vea configuración específica por IDE arriba)
2. Ejecute `*help` en su agente AI para ver comandos disponibles
3. Comience con la [Guía del Usuario](../guides/user-guide.md)
4. Únase a nuestra [Comunidad en Discord](https://discord.gg/gk8jAdXWmj) para ayuda

---

## Recursos Adicionales

- [README Principal](../../../README.md)
- [Guía del Usuario](../guides/user-guide.md)
- [Guía de Solución de Problemas](troubleshooting.md)
- [FAQ](faq.md)
- [Comunidad Discord](https://discord.gg/gk8jAdXWmj)
- [GitHub Issues](https://github.com/SynkraAI/aios-core/issues)
