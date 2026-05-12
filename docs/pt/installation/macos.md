<!--
  Tradução: PT-BR
  Original: /docs/en/installation/macos.md
  Última sincronização: 2026-01-26
-->

# Guia de Instalação para macOS - Synkra AIOX

> 🌐 [EN](../../installation/macos.md) | **PT** | [ES](../../es/installation/macos.md)

---

## Pré-requisitos

### 1. Node.js (v20 ou superior)

Instale o Node.js usando um dos seguintes métodos:

**Opção A: Usando Homebrew (Recomendado)**

```bash
# Instale o Homebrew se ainda não estiver instalado
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instale o Node.js
brew install node
```

**Opção B: Usando o instalador oficial**
Baixe em [nodejs.org](https://nodejs.org/)

**Opção C: Usando Node Version Manager (nvm)**

```bash
# Instale o nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instale o Node.js
nvm install 20
nvm use 20
```

### 2. GitHub CLI

Instale o GitHub CLI para colaboração em equipe:

**Usando Homebrew (Recomendado)**

```bash
brew install gh
```

**Usando MacPorts**

```bash
sudo port install gh
```

**Usando o instalador oficial**
Baixe em [cli.github.com](https://cli.github.com/)

## Instalação

### Instalação Rápida

1. Abra o Terminal
2. Navegue até o diretório do seu projeto:

   ```bash
   cd ~/path/to/your/project
   ```

3. Execute o instalador:
   ```bash
   npx github:SynkraAI/aiox-core install
   ```

### O Que o Instalador Faz

O instalador automaticamente:

- Detecta o macOS e aplica configurações específicas da plataforma
- Cria os diretórios necessários com permissões apropriadas
- Configura caminhos de IDE para localizações do macOS:
  - Cursor: `~/Library/Application Support/Cursor/`
  - Claude: `~/.claude/`
- Configura scripts shell com terminações de linha Unix
- Lida adequadamente com sistemas de arquivos case-sensitive

## Configuração Específica por IDE

### Cursor

1. As regras da IDE são instaladas em `.cursor/rules/`
2. Atalho de teclado: `Cmd+L` para abrir o chat
3. Use `@agent-name` para ativar agentes

### Claude Code

1. Os comandos são instalados em `.claude/commands/AIOX/`
2. Use `/agent-name` para ativar agentes


2. Use `@agent-name` para ativar agentes

## Solução de Problemas

### Problemas de Permissão

Se você encontrar erros de permissão:

```bash
# Corrigir permissões do npm
sudo chown -R $(whoami) ~/.npm

# Corrigir permissões do projeto
sudo chown -R $(whoami) .aiox-core
```

### Autenticação do GitHub CLI

Após instalar o GitHub CLI:

```bash
# Autenticar no GitHub
gh auth login

# Escolha o método de autenticação (navegador web recomendado)
```

### Problemas de Path

Se os comandos não forem encontrados:

```bash
# Adicione ao ~/.zshrc ou ~/.bash_profile
export PATH="/usr/local/bin:$PATH"

# Recarregue a configuração do shell
source ~/.zshrc  # ou source ~/.bash_profile
```

### Case Sensitivity

Os sistemas de arquivos do macOS podem ser case-insensitive por padrão. Se você tiver problemas:

1. Verifique seu sistema de arquivos:

   ```bash
   diskutil info / | grep "File System"
   ```

2. O Synkra AIOX lida automaticamente com sistemas de arquivos case-sensitive e case-insensitive

## Atualização

Para atualizar uma instalação existente:

```bash
npx github:SynkraAI/aiox-core install
```

O atualizador irá:

- Detectar sua instalação existente
- Fazer backup de quaisquer customizações
- Atualizar apenas os arquivos alterados
- Preservar suas configurações

## Próximos Passos

1. Configure sua IDE (veja configuração específica por IDE acima)
2. Execute `*help` no seu agente de IA para ver os comandos disponíveis
3. Comece com o [Guia do Usuário](../../guides/user-guide.md)
4. Junte-se à nossa [Comunidade Discord](https://discord.gg/gk8jAdXWmj) para obter ajuda

## Requisitos de Sistema

- macOS 10.15 (Catalina) ou posterior
- 4GB RAM mínimo (8GB recomendado)
- 500MB de espaço livre em disco
- Conexão com a internet para pacotes npm

## Recursos Adicionais

- [README Principal](../../README.md)
- [Guia do Usuário](../../guides/user-guide.md)
- [Guia de Solução de Problemas](../troubleshooting.md)
- [Comunidade Discord](https://discord.gg/gk8jAdXWmj)
