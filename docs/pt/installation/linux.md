<!--
  Tradução: PT-BR
  Original: /docs/installation/linux.md
  Última sincronização: 2026-01-29
-->

# Guia de Instalação Linux para Synkra AIOS

> 🌐 [EN](../../installation/linux.md) | **PT** | [ES](../../es/installation/linux.md)

---

## Distribuições Suportadas

| Distribuição | Versão         | Status                     |
| ------------ | -------------- | -------------------------- |
| Ubuntu       | 20.04+ (LTS)   | ✅ Totalmente Suportado    |
| Debian       | 11+ (Bullseye) | ✅ Totalmente Suportado    |
| Fedora       | 37+            | ✅ Totalmente Suportado    |
| Arch Linux   | Última         | ✅ Totalmente Suportado    |
| Linux Mint   | 21+            | ✅ Totalmente Suportado    |
| Pop!\_OS     | 22.04+         | ✅ Totalmente Suportado    |
| openSUSE     | Leap 15.4+     | ⚠️ Testado pela Comunidade |
| CentOS/RHEL  | 9+             | ⚠️ Testado pela Comunidade |

---

## Pré-requisitos

### 1. Node.js (v20 ou superior)

Escolha o método de instalação baseado na sua distribuição:

#### Ubuntu/Debian

```bash
# Atualizar lista de pacotes
sudo apt update

# Instalar Node.js usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version
```

**Alternativa: Usando nvm (Recomendado para desenvolvimento)**

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Recarregar shell
source ~/.bashrc  # ou ~/.zshrc

# Instalar e usar Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

#### Fedora

```bash
# Instalar Node.js dos repos do Fedora
sudo dnf install nodejs npm

# Ou usando NodeSource para versão mais recente
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

#### Arch Linux

```bash
# Instalar dos repos oficiais
sudo pacman -S nodejs npm

# Ou usando nvm (recomendado)
yay -S nvm  # Se usar helper AUR
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

### 4. Build Essentials (Opcional mas Recomendado)

Alguns pacotes npm requerem compilação:

```bash
# Ubuntu/Debian
sudo apt install build-essential

# Fedora
sudo dnf groupinstall "Development Tools"

# Arch
sudo pacman -S base-devel
```

---

## Instalação

### Instalação Rápida

1. Abra seu terminal
2. Navegue até o diretório do projeto:

   ```bash
   cd ~/projetos/meu-projeto
   ```

3. Execute o instalador:

   ```bash
   npx github:SynkraAI/aios-core install
   ```

### O Que o Instalador Faz

O instalador automaticamente:

- ✅ Detecta sua distribuição Linux e aplica otimizações
- ✅ Cria diretórios necessários com permissões Unix apropriadas (755/644)
- ✅ Configura caminhos de IDE para Linux:
  - Cursor: `~/.config/Cursor/`
  - Claude: `~/.claude/`
  - Windsurf: `~/.config/Windsurf/`
- ✅ Configura scripts shell com terminações de linha Unix (LF)
- ✅ Respeita a especificação XDG Base Directory
- ✅ Lida com links simbólicos corretamente

---

## Configuração Específica por IDE

### Cursor

1. Instale o Cursor: Baixe de [cursor.sh](https://cursor.sh/)

   ```bash
   # Método AppImage
   chmod +x cursor-*.AppImage
   ./cursor-*.AppImage
   ```

2. Regras da IDE são instaladas em `.cursor/rules/`
3. Atalho de teclado: `Ctrl+L` para abrir chat
4. Use `@nome-do-agente` para ativar agentes

### Claude Code (CLI)

1. Instale o Claude Code:

   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. Comandos são instalados em `.claude/commands/AIOS/`
3. Use `/nome-do-agente` para ativar agentes

### Windsurf

1. Instale de [codeium.com/windsurf](https://codeium.com/windsurf)
2. Regras são instaladas em `.windsurf/rules/`
3. Use `@nome-do-agente` para ativar agentes

---

## Solução de Problemas

### Erros de Permissão

```bash
# Corrigir permissões globais do npm (método recomendado)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Alternativa: Corrigir propriedade (se usar sudo para npm)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Erros EACCES

Se você ver `EACCES: permission denied`:

```bash
# Opção 1: Usar prefixo npm (recomendado)
npm config set prefix '~/.local'
export PATH="$HOME/.local/bin:$PATH"

# Opção 2: Corrigir permissões do projeto
chmod -R u+rwX .aios-core
chmod -R u+rwX .claude
```

### Problemas de Autenticação GitHub CLI

```bash
# Verificar status de autenticação atual
gh auth status

# Re-autenticar se necessário
gh auth login --web

# Para autenticação baseada em SSH
gh auth login -p ssh
```

### Problemas Específicos do WSL

Se estiver rodando no Windows Subsystem for Linux:

```bash
# Garantir que caminhos Windows não interfiram
echo 'export PATH=$(echo "$PATH" | tr ":" "\n" | grep -v "^/mnt/c" | tr "\n" ":")' >> ~/.bashrc

# Corrigir problemas de terminação de linha
git config --global core.autocrlf input

# Performance: Mover projeto para sistema de arquivos Linux
# Use ~/projetos ao invés de /mnt/c/projetos
```

---

## Atualização

Para atualizar uma instalação existente:

```bash
# Usando npx (recomendado)
npx github:SynkraAI/aios-core install
```

O atualizador irá:

- Detectar sua instalação existente
- Fazer backup de customizações em `.aios-backup/`
- Atualizar apenas arquivos modificados
- Preservar suas configurações

---

## Requisitos do Sistema

| Requisito       | Mínimo | Recomendado |
| --------------- | ------ | ----------- |
| Kernel          | 4.15+  | 5.10+       |
| RAM             | 2GB    | 8GB         |
| Espaço em Disco | 500MB  | 2GB         |
| Node.js         | 18.x   | 20.x LTS    |
| npm             | 9.x    | 10.x        |

---

## Próximos Passos

1. Configure sua IDE (veja configuração específica por IDE acima)
2. Execute `*help` no seu agente AI para ver comandos disponíveis
3. Comece com o [Guia do Usuário](../guides/user-guide.md)
4. Junte-se à nossa [Comunidade no Discord](https://discord.gg/gk8jAdXWmj) para ajuda

---

## Recursos Adicionais

- [README Principal](../../../README.md)
- [Guia do Usuário](../guides/user-guide.md)
- [Guia de Solução de Problemas](troubleshooting.md)
- [FAQ](faq.md)
- [Comunidade Discord](https://discord.gg/gk8jAdXWmj)
- [GitHub Issues](https://github.com/SynkraAI/aios-core/issues)
