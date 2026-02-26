<!--
  Tradução: PT-BR
  Original: /docs/en/installation/troubleshooting.md
  Última sincronização: 2026-01-26
-->

# Guia de Solução de Problemas do Synkra AIOS

> 🌐 [EN](../../installation/troubleshooting.md) | **PT** | [ES](../../es/installation/troubleshooting.md)

---

**Versão:** 2.1.0
**Última Atualização:** 2025-01-24

---

## Sumário

- [Diagnóstico Rápido](#diagnóstico-rápido)
- [Problemas de Instalação](#problemas-de-instalação)
- [Problemas de Rede e Conectividade](#problemas-de-rede-e-conectividade)
- [Problemas de Permissão e Acesso](#problemas-de-permissão-e-acesso)
- [Problemas Específicos de SO](#problemas-específicos-de-so)
- [Problemas de Configuração de IDE](#problemas-de-configuração-de-ide)
- [Problemas de Ativação de Agentes](#problemas-de-ativação-de-agentes)
- [Comandos de Diagnóstico](#comandos-de-diagnóstico)
- [Obtendo Ajuda](#obtendo-ajuda)

---

## Diagnóstico Rápido

Execute este comando de diagnóstico primeiro para identificar problemas comuns:

```bash
npx aios-core status
```

Se o comando de status falhar, trabalhe através das seções abaixo baseado na sua mensagem de erro.

---

## Problemas de Instalação

### Problema 1: "npx aios-core is not recognized"

**Sintomas:**

```
'npx' is not recognized as an internal or external command
```

**Causa:** Node.js ou npm não está instalado ou não está no PATH.

**Solução:**

```bash
# Verifique se o Node.js está instalado
node --version

# Se não estiver instalado:
# Windows: Baixe em https://nodejs.org/
# macOS: brew install node
# Linux: nvm install 18

# Verifique se o npm está disponível
npm --version

# Se o npm estiver faltando, reinstale o Node.js
```

---

### Problema 2: "Inappropriate Installation Directory Detected"

**Sintomas:**

```
⚠️  Inappropriate Installation Directory Detected

Current directory: /Users/username

Synkra AIOS should be installed in your project directory,
not in your home directory or temporary locations.
```

**Causa:** Executando o instalador do diretório home, /tmp, ou cache npx.

**Solução:**

```bash
# Navegue para o diretório do seu projeto primeiro
cd /path/to/your/project

# Então execute o instalador
npx aios-core install
```

---

### Problema 3: "Installation failed: ENOENT"

**Sintomas:**

```
Installation failed: ENOENT: no such file or directory
```

**Causa:** O diretório de destino não existe ou tem permissões incorretas.

**Solução:**

```bash
# Crie o diretório primeiro
mkdir -p /path/to/your/project

# Navegue até ele
cd /path/to/your/project

# Execute o instalador
npx aios-core install
```

---

### Problema 4: "Node.js version too old"

**Sintomas:**

```
Error: Synkra AIOS requires Node.js 18.0.0 or higher
Current version: 14.17.0
```

**Causa:** A versão do Node.js está abaixo do requisito mínimo.

**Solução:**

```bash
# Verifique a versão atual
node --version

# Atualize usando nvm (recomendado)
nvm install 18
nvm use 18

# Ou baixe o LTS mais recente em nodejs.org
```

---

### Problema 5: "npm ERR! code E404"

**Sintomas:**

```
npm ERR! code E404
npm ERR! 404 Not Found - GET https://registry.npmjs.org/aios-core
```

**Causa:** Pacote não encontrado no registro npm (problema de rede ou erro de digitação).

**Solução:**

```bash
# Limpe o cache npm
npm cache clean --force

# Verifique o registro
npm config get registry
# Deve ser: https://registry.npmjs.org/

# Se estiver usando registro customizado, resete para o padrão
npm config set registry https://registry.npmjs.org/

# Tente a instalação novamente
npx aios-core install
```

---

### Problema 6: "EACCES: permission denied"

**Sintomas:**

```
npm ERR! EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Causa:** O diretório npm global tem permissões incorretas.

**Solução:**

```bash
# Opção 1: Corrigir permissões npm (Linux/macOS)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
# Adicione a linha de export ao ~/.bashrc ou ~/.zshrc

# Opção 2: Usar npx ao invés de instalação global (recomendado)
npx aios-core install

# Opção 3: Usar nvm para gerenciar Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

---

## Problemas de Rede e Conectividade

### Problema 7: "ETIMEDOUT" ou "ECONNREFUSED"

**Sintomas:**

```
npm ERR! code ETIMEDOUT
npm ERR! errno ETIMEDOUT
npm ERR! network request to https://registry.npmjs.org/aios-core failed
```

**Causa:** Problema de conectividade de rede, firewall, ou proxy bloqueando npm.

**Solução:**

```bash
# Verifique se o registro npm está acessível
curl -I https://registry.npmjs.org/

# Se estiver atrás de um proxy, configure o npm
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Se estiver usando inspeção SSL corporativa, desabilite SSL estrito (use com cuidado)
npm config set strict-ssl false

# Tente novamente com logging verboso
npm install aios-core --verbose
```

---

### Problema 8: "SSL Certificate Problem"

**Sintomas:**

```
npm ERR! code UNABLE_TO_GET_ISSUER_CERT_LOCALLY
npm ERR! unable to get local issuer certificate
```

**Causa:** Verificação de certificado SSL falhando (comum em ambientes corporativos).

**Solução:**

```bash
# Adicione o certificado CA da sua empresa
npm config set cafile /path/to/your/certificate.pem

# Ou desabilite SSL estrito (use apenas se você confia na sua rede)
npm config set strict-ssl false

# Verifique e tente novamente
npm config get strict-ssl
npx aios-core install
```

---

### Problema 9: "Connection reset by peer"

**Sintomas:**

```
npm ERR! network socket hang up
npm ERR! network This is a problem related to network connectivity.
```

**Causa:** Conexão de internet instável ou problemas de DNS.

**Solução:**

```bash
# Tente usar DNS diferente
# Windows: Painel de Controle > Rede > DNS = 8.8.8.8, 8.8.4.4
# Linux: echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

# Limpe o cache DNS
# Windows: ipconfig /flushdns
# macOS: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches

# Tente novamente com timeout maior
npm config set fetch-timeout 60000
npx aios-core install
```

---

## Problemas de Permissão e Acesso

### Problema 10: "EPERM: operation not permitted"

**Sintomas:**

```
Error: EPERM: operation not permitted, unlink '/path/to/file'
```

**Causa:** Arquivo está bloqueado por outro processo ou permissões insuficientes.

**Solução:**

```bash
# Windows: Feche todas as instâncias de IDE, então:
taskkill /f /im node.exe

# macOS/Linux: Verifique processos bloqueando
lsof +D /path/to/project

# Mate qualquer processo segurando arquivos
kill -9 <PID>

# Tente a instalação novamente
npx aios-core install
```

---

### Problema 11: "Read-only file system"

**Sintomas:**

```
Error: EROFS: read-only file system
```

**Causa:** Tentando instalar em uma montagem somente leitura ou diretório de sistema.

**Solução:**

```bash
# Verifique se o sistema de arquivos permite escrita
touch /path/to/project/test.txt
# Se isso falhar, o diretório é somente leitura

# Verifique opções de montagem
mount | grep /path/to/project

# Instale em um diretório com permissão de escrita
cd ~/projects/my-project
npx aios-core install
```

---

### Problema 12: "Directory not empty" durante upgrade

**Sintomas:**

```
Error: ENOTEMPTY: directory not empty, rmdir '.aios-core'
```

**Causa:** Instalação existente com arquivos modificados.

**Solução:**

```bash
# Faça backup da instalação existente
mv .aios-core .aios-core.backup

# Execute o instalador com flag force
npx aios-core install --force-upgrade

# Se necessário, restaure arquivos customizados do backup
cp .aios-core.backup/custom-files/* .aios-core/
```

---

## Problemas Específicos de SO

### Problemas no Windows

#### Problema 13: "PowerShell execution policy"

**Sintomas:**

```
File cannot be loaded because running scripts is disabled on this system.
```

**Solução:**

```powershell
# Verifique a política atual
Get-ExecutionPolicy

# Defina para RemoteSigned (recomendado)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ou use CMD ao invés de PowerShell
cmd
npx aios-core install
```

#### Problema 14: "Path too long"

**Sintomas:**

```
Error: ENAMETOOLONG: name too long
```

**Solução:**

```powershell
# Habilite caminhos longos no Windows 10/11
# Execute como Administrador:
reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f

# Ou use um caminho de projeto mais curto
cd C:\dev\proj
npx aios-core install
```

#### Problema 15: "npm not found in Git Bash"

**Sintomas:**

```
bash: npm: command not found
```

**Solução:**

```bash
# Adicione Node.js ao path do Git Bash
# Em ~/.bashrc ou ~/.bash_profile:
export PATH="$PATH:/c/Program Files/nodejs"

# Ou use Windows Terminal/CMD/PowerShell ao invés
```

---

### Problemas no macOS

#### Problema 16: "Xcode Command Line Tools required"

**Sintomas:**

```
xcode-select: error: command line tools are not installed
```

**Solução:**

```bash
# Instale Xcode Command Line Tools
xcode-select --install

# Siga o diálogo de instalação
# Então tente novamente
npx aios-core install
```

#### Problema 17: "Apple Silicon (M1/M2) compatibility"

**Sintomas:**

```
Error: Unsupported architecture: arm64
```

**Solução:**

```bash
# A maioria dos pacotes funciona nativamente, mas se problemas persistirem:

# Instale Rosetta 2 para compatibilidade x86
softwareupdate --install-rosetta

# Use versão x86 do Node.js (se necessário)
arch -x86_64 /bin/bash
nvm install 18
npx aios-core install
```

---

### Problemas no Linux

#### Problema 18: "libvips dependency error"

**Sintomas:**

```
Error: Cannot find module '../build/Release/sharp-linux-x64.node'
```

**Solução:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y build-essential libvips-dev

# Fedora/RHEL
sudo dnf install vips-devel

# Limpe o cache npm e reinstale
npm cache clean --force
npx aios-core install
```

#### Problema 19: "GLIBC version too old"

**Sintomas:**

```
Error: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.28' not found
```

**Solução:**

```bash
# Verifique a versão do GLIBC
ldd --version

# Se a versão for muito antiga, use Node.js LTS para sua distro:
# Ubuntu 18.04: Use Node.js 16 (máximo suportado)
nvm install 16
nvm use 16

# Ou atualize sua distribuição Linux
```

---

## Problemas de Configuração de IDE

### Problema 20: "Agents not appearing in IDE"

**Sintomas:** Comandos de agentes (`/dev`, `@dev`) não funcionam após instalação.

**Solução:**

1. Reinicie sua IDE completamente (não apenas recarregue)
2. Verifique se os arquivos foram criados:

   ```bash
   # Claude Code
   ls .claude/commands/AIOS/agents/

   # Cursor
   ls .cursor/rules/
   ```

3. Verifique se as configurações da IDE permitem comandos customizados
4. Re-execute a instalação para IDE específica:
   ```bash
   npx aios-core install --ide claude-code
   ```

---

### Problema 21: "Agent shows raw markdown instead of activating"

**Sintomas:** IDE exibe o conteúdo do arquivo do agente ao invés de ativar.

**Solução:**

1. Verifique se a versão da IDE é compatível
2. Para Cursor: Certifique-se que os arquivos têm extensão `.mdc`
3. Para Claude Code: Arquivos devem estar em `.claude/commands/`
4. Reinicie a IDE após a instalação

---

## Problemas de Ativação de Agentes

### Problema 22: "Agent not found" error

**Sintomas:**

```
Error: Agent 'dev' not found in .aios-core/agents/
```

**Solução:**

```bash
# Verifique se os arquivos de agentes existem
ls .aios-core/agents/

# Se estiverem faltando, reinstale o core
npx aios-core install --full

# Verifique se core-config.yaml é válido
cat .aios-core/core-config.yaml
```

---

### Problema 23: "YAML parsing error" no agente

**Sintomas:**

```
YAMLException: bad indentation of a mapping entry
```

**Solução:**

```bash
# Valide a sintaxe YAML
npx yaml-lint .aios-core/agents/dev.md

# Correções comuns:
# - Use espaços, não tabs
# - Certifique-se de indentação consistente (2 espaços)
# - Verifique caracteres especiais em strings (use aspas)

# Reinstale para obter arquivos de agentes limpos
mv .aios-core/agents/dev.md .aios-core/agents/dev.md.backup
npx aios-core install --full
```

---

## Comandos de Diagnóstico

### Diagnósticos Gerais

```bash
# Verifique status da instalação AIOS
npx aios-core status

# Liste Squads disponíveis
npx aios-core install

# Atualize instalação existente
npx aios-core update

# Mostre logging verboso
npx aios-core install --verbose
```

### Informações do Sistema

```bash
# Versões do Node.js e npm
node --version && npm --version

# Configuração npm
npm config list

# Variáveis de ambiente
printenv | grep -i npm
printenv | grep -i node

# Espaço em disco (certifique-se de ter >500MB livres)
df -h .
```

### Verificação de Arquivos

```bash
# Verifique estrutura .aios-core
find .aios-core -type f | wc -l
# Esperado: 200+ arquivos

# Verifique YAML corrompido
for f in .aios-core/**/*.yaml; do npx yaml-lint "$f"; done

# Verifique permissões
ls -la .aios-core/
```

---

## Obtendo Ajuda

### Antes de Solicitar Ajuda

1. Execute `npx aios-core status` e anote a saída
2. Consulte este guia de solução de problemas
3. Pesquise [Issues existentes no GitHub](https://github.com/SynkraAI/aios-core/issues)

### Informações para Incluir em Relatórios de Bug

```
**Ambiente:**
- SO: [Windows 11 / macOS 14 / Ubuntu 22.04]
- Versão Node.js: [saída de `node --version`]
- Versão npm: [saída de `npm --version`]
- IDE: [Claude Code / Cursor / etc.]

**Passos para Reproduzir:**
1. [Primeiro passo]
2. [Segundo passo]
3. [Erro ocorre]

**Comportamento Esperado:**
[O que deveria acontecer]

**Comportamento Atual:**
[O que realmente acontece]

**Saída de Erro:**
```

[Cole a mensagem de erro completa aqui]

```

**Contexto Adicional:**
[Qualquer outra informação relevante]
```

### Canais de Suporte

- **Issues no GitHub**: [aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Documentação**: [docs/installation/](./README.md)
- **FAQ**: [faq.md](./faq.md)

---

## Documentação Relacionada

- [FAQ](./faq.md)
