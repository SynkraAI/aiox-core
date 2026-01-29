<!--
  Tradução: PT-BR
  Original: /docs/installation/windows.md
  Última sincronização: 2026-01-29
-->

# Guia de Instalação Windows para Synkra AIOS

> 🌐 [EN](../../installation/windows.md) | **PT** | [ES](../../es/installation/windows.md)

---

## Versões Suportadas

| Versão do Windows     | Status                     | Notas                        |
| --------------------- | -------------------------- | ---------------------------- |
| Windows 11            | ✅ Totalmente Suportado    | Recomendado                  |
| Windows 10 (22H2+)    | ✅ Totalmente Suportado    | Requer atualizações recentes |
| Windows 10 (anterior) | ⚠️ Suporte Limitado        | Atualização recomendada      |
| Windows Server 2022   | ✅ Totalmente Suportado    |                              |
| Windows Server 2019   | ⚠️ Testado pela Comunidade |                              |

---

## Pré-requisitos

### 1. Node.js (v20 ou superior)

**Opção A: Usando o Instalador Oficial (Recomendado)**

1. Baixe de [nodejs.org](https://nodejs.org/)
2. Escolha a versão **LTS** (20.x ou superior)
3. Execute o instalador com opções padrão
4. Verifique a instalação no PowerShell:

```powershell
node --version  # Deve mostrar v20.x.x
npm --version
```

**Opção B: Usando winget**

```powershell
# Instalar via Windows Package Manager
winget install OpenJS.NodeJS.LTS

# Reinicie o PowerShell, depois verifique
node --version
```

**Opção C: Usando Chocolatey**

```powershell
# Instale o Chocolatey primeiro (se não instalado)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar Node.js
choco install nodejs-lts -y

# Reinicie o PowerShell
node --version
```

### 2. Git para Windows

**Usando Instalador Oficial (Recomendado)**

1. Baixe de [git-scm.com](https://git-scm.com/download/win)
2. Execute o instalador com estas opções recomendadas:
   - ✅ Git from the command line and also from 3rd-party software
   - ✅ Use bundled OpenSSH
   - ✅ Checkout Windows-style, commit Unix-style line endings
   - ✅ Use Windows' default console window

**Usando winget**

```powershell
winget install Git.Git
```

Verifique a instalação:

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
# Siga os prompts, escolha "Login with a web browser"
```

### 4. Windows Terminal (Recomendado)

Para a melhor experiência, use o Windows Terminal:

```powershell
winget install Microsoft.WindowsTerminal
```

---

## Instalação

### Instalação Rápida

1. Abra **PowerShell** ou **Windows Terminal**
2. Navegue até o diretório do seu projeto:

   ```powershell
   cd C:\Users\SeuNome\projetos\meu-projeto
   ```

3. Execute o instalador:

   ```powershell
   npx github:SynkraAI/aios-core install
   ```

### O Que o Instalador Faz

O instalador automaticamente:

- ✅ Detecta Windows e aplica configurações específicas da plataforma
- ✅ Cria diretórios necessários com permissões apropriadas
- ✅ Configura caminhos de IDE para localizações Windows:
  - Cursor: `%APPDATA%\Cursor\`
  - Claude: `%USERPROFILE%\.claude\`
  - Windsurf: `%APPDATA%\Windsurf\`
- ✅ Lida com separadores de caminho Windows (barras invertidas)
- ✅ Configura terminações de linha corretamente (CRLF para batch, LF para scripts)
- ✅ Configura scripts npm compatíveis com cmd.exe e PowerShell

---

## Configuração Específica por IDE

### Cursor

1. Baixe de [cursor.sh](https://cursor.sh/)
2. Execute o instalador
3. Regras da IDE são instaladas em `.cursor\rules\`
4. Atalho de teclado: `Ctrl+L` para abrir chat
5. Use `@nome-do-agente` para ativar agentes

### Claude Code (CLI)

1. Instale o Claude Code:

   ```powershell
   npm install -g @anthropic-ai/claude-code
   ```

2. Comandos são instalados em `.claude\commands\AIOS\`
3. Use `/nome-do-agente` para ativar agentes

### Windsurf

1. Baixe de [codeium.com/windsurf](https://codeium.com/windsurf)
2. Execute o instalador
3. Regras são instaladas em `.windsurf\rules\`
4. Use `@nome-do-agente` para ativar agentes

---

## Solução de Problemas

### Erro de Política de Execução

Se você ver `running scripts is disabled`:

```powershell
# Verificar política atual
Get-ExecutionPolicy

# Definir para permitir scripts locais (recomendado)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ou bypass temporário para sessão atual
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Erros de Permissão npm EACCES

```powershell
# Limpar cache do npm
npm cache clean --force

# Definir prefixo npm para diretório do usuário
npm config set prefix "$env:APPDATA\npm"

# Adicionar ao PATH (permanente)
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";$env:APPDATA\npm",
    "User"
)
```

### Problemas de Caminho Longo

Windows tem limite de 260 caracteres por padrão. Para habilitar caminhos longos:

1. Abra **Editor de Política de Grupo** (`gpedit.msc`)
2. Navegue para: Configuração do Computador → Modelos Administrativos → Sistema → Sistema de Arquivos
3. Habilite "Habilitar caminhos longos Win32"

Ou via PowerShell (requer admin):

```powershell
# Executar como Administrador
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

### Node.js Não Encontrado Após Instalação

```powershell
# Atualizar variáveis de ambiente
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Ou reinicie PowerShell/Terminal
```

### Antivírus Bloqueando npm

Alguns antivírus bloqueiam operações npm:

1. Adicione exceções para:
   - `%APPDATA%\npm`
   - `%APPDATA%\npm-cache`
   - `%USERPROFILE%\node_modules`
   - Seu diretório de projeto

2. Temporariamente desabilite varredura em tempo real durante instalação (não recomendado para produção)

### Problemas de Autenticação GitHub CLI

```powershell
# Verificar status
gh auth status

# Re-autenticar
gh auth login --web

# Se atrás de proxy corporativo
$env:HTTPS_PROXY = "http://proxy.empresa.com:8080"
gh auth login
```

---

## Integração WSL (Opcional)

Para usuários que preferem ferramentas Linux dentro do Windows:

### Instalar WSL2

```powershell
# Executar como Administrador
wsl --install

# Instalar Ubuntu (padrão)
wsl --install -d Ubuntu

# Reinicie o computador quando solicitado
```

### Configurar AIOS com WSL

```bash
# Dentro do WSL, siga o guia de instalação Linux
# Veja: docs/installation/linux.md

# Acessar arquivos Windows do WSL
cd /mnt/c/Users/SeuNome/projetos/meu-projeto

# Para melhor performance, mantenha projetos no sistema de arquivos Linux
# Use: ~/projetos/ ao invés de /mnt/c/
```

---

## Atualização

Para atualizar uma instalação existente:

```powershell
# Usando npx (recomendado)
npx github:SynkraAI/aios-core install

# O atualizador irá:
# - Detectar instalação existente
# - Fazer backup de customizações em .aios-backup\
# - Atualizar apenas arquivos modificados
# - Preservar configurações
```

---

## Requisitos do Sistema

| Requisito       | Mínimo    | Recomendado |
| --------------- | --------- | ----------- |
| Windows         | 10 (22H2) | 11          |
| RAM             | 4GB       | 8GB         |
| Espaço em Disco | 1GB       | 5GB         |
| Node.js         | 18.x      | 20.x LTS    |
| npm             | 9.x       | 10.x        |
| PowerShell      | 5.1       | 7.x (Core)  |

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
