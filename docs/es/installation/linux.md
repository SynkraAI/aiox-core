<!--
  Traducción: ES
  Original: /docs/installation/linux.md
  Última sincronización: 2026-01-29
-->

# Guía de Instalación Linux para Synkra AIOX

> 🌐 [EN](../../installation/linux.md) | [PT](../../pt/installation/linux.md) | **ES**

---

## Distribuciones Soportadas

| Distribución | Versión        | Estado                      |
| ------------ | -------------- | --------------------------- |
| Ubuntu       | 20.04+ (LTS)   | ✅ Totalmente Soportado     |
| Debian       | 11+ (Bullseye) | ✅ Totalmente Soportado     |
| Fedora       | 37+            | ✅ Totalmente Soportado     |
| Arch Linux   | Última         | ✅ Totalmente Soportado     |
| Linux Mint   | 21+            | ✅ Totalmente Soportado     |
| Pop!\_OS     | 22.04+         | ✅ Totalmente Soportado     |
| openSUSE     | Leap 15.4+     | ⚠️ Probado por la Comunidad |
| CentOS/RHEL  | 9+             | ⚠️ Probado por la Comunidad |

---

## Requisitos Previos

### 1. Node.js (v20 o superior)

Elija su método de instalación según su distribución:

#### Ubuntu/Debian

```bash
# Actualizar lista de paquetes
sudo apt update

# Instalar Node.js usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debería mostrar v20.x.x
npm --version
```

**Alternativa: Usando nvm (Recomendado para desarrollo)**

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Recargar shell
source ~/.bashrc  # o ~/.zshrc

# Instalar y usar Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

#### Fedora

```bash
# Instalar Node.js desde repos de Fedora
sudo dnf install nodejs npm

# O usando NodeSource para versión más reciente
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

#### Arch Linux

```bash
# Instalar desde repos oficiales
sudo pacman -S nodejs npm

# O usando nvm (recomendado)
yay -S nvm  # Si usa helper AUR
nvm install 20
```

### 2. Git

```bash
# Ubuntu/Debian
sudo apt install git

# Fedora
sudo dnf install git

# Arch
sudo pacman -S git

# Verificar
git --version
```

### 3. GitHub CLI

```bash
# Ubuntu/Debian
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
&& sudo mkdir -p -m 755 /etc/apt/keyrings \
&& wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y

# Fedora
sudo dnf install gh

# Arch
sudo pacman -S github-cli

# Autenticar
gh auth login
```

### 4. Build Essentials (Opcional pero Recomendado)

Algunos paquetes npm requieren compilación:

```bash
# Ubuntu/Debian
sudo apt install build-essential

# Fedora
sudo dnf groupinstall "Development Tools"

# Arch
sudo pacman -S base-devel
```

---

## Instalación

### Instalación Rápida

1. Abra su terminal
2. Navegue al directorio de su proyecto:

   ```bash
   cd ~/proyectos/mi-proyecto
   ```

3. Ejecute el instalador:

   ```bash
   npx github:SynkraAI/aiox-core install
   ```

### Qué Hace el Instalador

El instalador automáticamente:

- ✅ Detecta su distribución Linux y aplica optimizaciones
- ✅ Crea directorios necesarios con permisos Unix apropiados (755/644)
- ✅ Configura rutas de IDE para Linux:
  - Cursor: `~/.config/Cursor/`
  - Claude: `~/.claude/`
- ✅ Configura scripts shell con terminaciones de línea Unix (LF)
- ✅ Respeta la especificación XDG Base Directory
- ✅ Maneja enlaces simbólicos correctamente

---

## Configuración Específica por IDE

### Cursor

1. Instale Cursor: Descargue desde [cursor.sh](https://cursor.sh/)

   ```bash
   # Método AppImage
   chmod +x cursor-*.AppImage
   ./cursor-*.AppImage
   ```

2. Reglas del IDE se instalan en `.cursor/rules/`
3. Atajo de teclado: `Ctrl+L` para abrir chat
4. Use `@nombre-del-agente` para activar agentes

### Claude Code (CLI)

1. Instale Claude Code:

   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. Comandos se instalan en `.claude/commands/AIOX/`
3. Use `/nombre-del-agente` para activar agentes


3. Use `@nombre-del-agente` para activar agentes

---

## Solución de Problemas

### Errores de Permiso

```bash
# Corregir permisos globales de npm (método recomendado)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Alternativa: Corregir propiedad (si usa sudo para npm)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Errores EACCES

Si ve `EACCES: permission denied`:

```bash
# Opción 1: Usar prefijo npm (recomendado)
npm config set prefix '~/.local'
export PATH="$HOME/.local/bin:$PATH"

# Opción 2: Corregir permisos del proyecto
chmod -R u+rwX .aiox-core
chmod -R u+rwX .claude
```

### Problemas de Autenticación GitHub CLI

```bash
# Verificar estado de autenticación actual
gh auth status

# Re-autenticar si es necesario
gh auth login --web

# Para autenticación basada en SSH
gh auth login -p ssh
```

### Problemas Específicos de WSL

Si ejecuta en Windows Subsystem for Linux:

```bash
# Asegurar que rutas Windows no interfieran
echo 'export PATH=$(echo "$PATH" | tr ":" "\n" | grep -v "^/mnt/c" | tr "\n" ":")' >> ~/.bashrc

# Corregir problemas de terminación de línea
git config --global core.autocrlf input

# Rendimiento: Mover proyecto a sistema de archivos Linux
# Use ~/proyectos en lugar de /mnt/c/proyectos
```

---

## Actualización

Para actualizar una instalación existente:

```bash
# Usando npx (recomendado)
npx github:SynkraAI/aiox-core install
```

El actualizador:

- Detectará su instalación existente
- Hará respaldo de personalizaciones en `.aiox-backup/`
- Actualizará solo archivos modificados
- Preservará sus configuraciones

---

## Requisitos del Sistema

| Requisito        | Mínimo | Recomendado |
| ---------------- | ------ | ----------- |
| Kernel           | 4.15+  | 5.10+       |
| RAM              | 2GB    | 8GB         |
| Espacio en Disco | 500MB  | 2GB         |
| Node.js          | 18.x   | 20.x LTS    |
| npm              | 9.x    | 10.x        |

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
- [GitHub Issues](https://github.com/SynkraAI/aiox-core/issues)
