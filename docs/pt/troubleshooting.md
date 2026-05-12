<!--
  Tradução: PT-BR
  Original: /docs/en/troubleshooting.md
  Última sincronização: 2026-01-26
-->

# Guia de Solução de Problemas do Synkra AIOX

> 🌐 [EN](../troubleshooting.md) | **PT** | [ES](../es/troubleshooting.md)

---

Este guia abrangente ajuda você a diagnosticar e resolver problemas comuns com o Synkra AIOX.

## Índice

1. [Diagnóstico Rápido](#diagnóstico-rápido)
2. [Problemas de Instalação](#problemas-de-instalação)
3. [Problemas com o Meta-Agent](#problemas-com-o-meta-agent)
4. [Problemas com a Camada de Memória](#problemas-com-a-camada-de-memória)
5. [Problemas de Performance](#problemas-de-performance)
6. [Problemas de API e Integração](#problemas-de-api-e-integração)
7. [Erros de Segurança e Permissão](#erros-de-segurança-e-permissão)
8. [Problemas Específicos de Plataforma](#problemas-específicos-de-plataforma)
9. [Solução de Problemas Avançada](#solução-de-problemas-avançada)
10. [Obtendo Ajuda](#obtendo-ajuda)

## Diagnóstico Rápido

### Executar o Doctor do Sistema

Sempre comece com o diagnóstico integrado:

```bash
# Diagnóstico básico
npx aiox-core doctor

# Corrigir automaticamente problemas comuns
npx aiox-core doctor --fix

# Saída detalhada
npx aiox-core doctor --verbose

# Verificar componente específico
npx aiox-core doctor --component memory-layer
```

### Correções Rápidas Comuns

```bash
# Limpar todos os caches
*memory clear-cache

# Reconstruir índice de memória
*memory rebuild

# Resetar configuração
*config --reset

# Atualizar para última versão
npx aiox-core update
```

## Problemas de Instalação

### Problema: Comando NPX não encontrado

**Sintomas:**
```
bash: npx: command not found
```

**Solução:**
```bash
# Verificar versão do npm
npm --version

# Se npm < 5.2, instalar npx globalmente
npm install -g npx

# Ou usar npm diretamente
npm exec aiox-core init my-project
```

### Problema: Instalação falha com erros de permissão

**Sintomas:**
```
Error: EACCES: permission denied
```

**Soluções:**

**Opção 1: Corrigir permissões do npm (Recomendado)**
```bash
# Criar diretório npm
mkdir ~/.npm-global

# Configurar npm
npm config set prefix '~/.npm-global'

# Adicionar ao PATH (adicionar ao ~/.bashrc ou ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH

# Recarregar shell
source ~/.bashrc
```

**Opção 2: Usar diretório diferente**
```bash
# Instalar no diretório do usuário
cd ~
npx aiox-core init my-project
```

### Problema: Erro de versão do Node.js

**Sintomas:**
```
Error: Node.js version 18.0.0 or higher required
```

**Solução:**
```bash
# Verificar versão atual
node --version

# Atualizar Node.js
# macOS (usando Homebrew)
brew upgrade node

# Windows (usando Chocolatey)
choco upgrade nodejs

# Linux (usando NodeSource)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Ou usar nvm (Node Version Manager)
nvm install 18
nvm use 18
```

### Problema: Instalação trava ou expira

**Sintomas:**
- Instalação travada em "Installing dependencies..."
- Erros de timeout de rede

**Soluções:**

```bash
# Usar registro diferente
npm config set registry https://registry.npmjs.org/

# Limpar cache do npm
npm cache clean --force

# Aumentar timeout
npm config set fetch-timeout 60000

# Pular instalação de dependências
npx aiox-core init my-project --skip-install

# Então instalar manualmente
cd my-project
npm install --verbose
```

### Problema: Erro de espaço em disco

**Sintomas:**
```
Error: ENOSPC: no space left on device
```

**Solução:**
```bash
# Verificar espaço disponível
df -h

# Limpar cache do npm
npm cache clean --force

# Remover node_modules antigos
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Limpar arquivos temporários
# macOS/Linux
rm -rf /tmp/npm-*

# Windows
rmdir /s %TEMP%\npm-*
```

## Problemas com o Meta-Agent

### Problema: Meta-agent não inicia

**Sintomas:**
```
Error: Failed to initialize meta-agent
```

**Soluções:**

1. **Verificar configuração:**
```bash
# Verificar se config existe
ls -la .aiox/config.json

# Validar configuração
npx aiox-core doctor --component config

# Resetar se corrompido
rm .aiox/config.json
npx aiox-core doctor --fix
```

2. **Verificar dependências:**
```bash
# Reinstalar dependências principais
npm install

# Verificar arquivos de agentes
ls -la agents/
```

3. **Verificar ambiente:**
```bash
# Verificar variáveis de ambiente
cat .env

# Garantir que chaves de API estão definidas
echo "OPENAI_API_KEY=your-key" >> .env
```

### Problema: Comandos não reconhecidos

**Sintomas:**
```
Unknown command: *create-agent
```

**Soluções:**

1. **Verificar ativação do agente:**
```bash
# Listar agentes ativos
*list-agents --active

# Ativar meta-agent
*activate meta-agent

# Verificar disponibilidade de comandos
*help
```

2. **Verificar sintaxe do comando:**
```bash
# Sintaxe correta usa asterisco
*create-agent my-agent  # ✓ Correto
create-agent my-agent   # ✗ Errado
```

3. **Recarregar agentes:**
```bash
# Recarregar todos os agentes
*reload-agents

# Ou reiniciar meta-agent
exit
npx aiox-core
```

### Problema: Criação de agente falha

**Sintomas:**
```
Error: Failed to create agent
```

**Soluções:**

1. **Verificar permissões:**
```bash
# Verificar permissões de escrita
ls -la agents/

# Corrigir permissões
chmod 755 agents/
```

2. **Validar nome do agente:**
```bash
# Nomes válidos: minúsculas, hífens
*create-agent my-agent      # ✓ Bom
*create-agent MyAgent       # ✗ Ruim (maiúsculas)
*create-agent my_agent      # ✗ Ruim (underscore)
*create-agent my-agent-2    # ✓ Bom
```

3. **Verificar duplicatas:**
```bash
# Listar agentes existentes
*list-agents

# Remover duplicata se existir
rm agents/duplicate-agent.yaml
```

## Problemas com a Camada de Memória

### Problema: Busca de memória não retorna resultados

**Sintomas:**
- Busca semântica não encontra nada
- Reconhecimento de padrões falha

**Soluções:**

1. **Reconstruir índice de memória:**
```bash
# Limpar e reconstruir
*memory clear-cache
*memory rebuild --verbose

# Aguardar indexação
# Verificar progresso
*memory status
```

2. **Verificar configuração de memória:**
```bash
# Verificar config
cat .aiox/memory-config.json

# Resetar para padrões
*memory reset-config
```

3. **Verificar integridade do índice:**
```bash
# Executar diagnóstico de memória
*memory diagnose

# Reparar se necessário
*memory repair
```

### Problema: Camada de memória usando muita RAM

**Sintomas:**
- Alto uso de memória
- Lentidão do sistema

**Soluções:**

1. **Ajustar configurações de memória:**
```javascript
// Editar .aiox/memory-config.json
{
  "maxDocuments": 5000,      // Reduzir de 10000
  "chunkSize": 256,          // Reduzir de 512
  "cacheSize": 100,          // Reduzir de 1000
  "enableCompression": true  // Habilitar compressão
}
```

2. **Limpar dados antigos:**
```bash
# Remover entradas antigas
*memory prune --older-than "30 days"

# Otimizar armazenamento
*memory optimize
```

3. **Usar limites de memória:**
```bash
# Definir limite de memória
export NODE_OPTIONS="--max-old-space-size=1024"

# Executar com memória limitada
npx aiox-core
```

### Problema: Erros do LlamaIndex

**Sintomas:**
```
Error: LlamaIndex initialization failed
```

**Soluções:**

1. **Verificar chaves de API:**
```bash
# Verificar chave OpenAI para embeddings
echo $OPENAI_API_KEY

# Testar acesso à API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

2. **Usar embeddings locais:**
```javascript
// .aiox/memory-config.json
{
  "embedModel": "local",
  "localModelPath": "./models/embeddings"
}
```

3. **Reinstalar LlamaIndex:**
```bash
npm uninstall llamaindex
npm install llamaindex@latest
```

## Problemas de Performance

### Problema: Execução lenta de comandos

**Sintomas:**
- Comandos levam > 5 segundos
- Interface parece lenta

**Soluções:**

1. **Perfilar performance:**
```bash
# Habilitar profiling
*debug enable --profile

# Executar comando lento
*analyze-framework

# Ver perfil
*debug show-profile
```

2. **Otimizar configuração:**
```javascript
// .aiox/config.json
{
  "performance": {
    "enableCache": true,
    "parallelOperations": 4,
    "lazyLoading": true,
    "indexUpdateFrequency": "hourly"
  }
}
```

3. **Limpar recursos:**
```bash
# Limpar caches
*cache clear --all

# Remover agentes não utilizados
*cleanup-agents

# Otimizar banco de dados
*optimize-db
```

### Problema: Alto uso de CPU

**Sintomas:**
- Barulho de ventilador
- Lentidão do sistema
- Alta CPU no gerenciador de tarefas

**Soluções:**

1. **Limitar operações concorrentes:**
```bash
# Definir limites de operação
*config --set performance.maxConcurrent 2
*config --set performance.cpuThreshold 80
```

2. **Desabilitar recursos em tempo real:**
```bash
# Desabilitar indexação em tempo real
*config --set memory.realTimeIndex false

# Usar processamento em lote
*config --set performance.batchMode true
```

3. **Verificar processos descontrolados:**
```bash
# Listar todos os processos
*debug processes

# Matar processo travado
*debug kill-process <pid>
```

## Problemas de API e Integração

### Problema: Chave de API não funciona

**Sintomas:**
```
Error: Invalid API key
Error: 401 Unauthorized
```

**Soluções:**

1. **Verificar formato da chave de API:**
```bash
# OpenAI
echo $OPENAI_API_KEY
# Deve começar com "sk-"

# Anthropic
echo $ANTHROPIC_API_KEY
# Deve começar com "sk-ant-"
```

2. **Testar API diretamente:**
```bash
# Testar OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Testar Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

3. **Verificar limites de taxa:**
```bash
# Ver uso atual
*api-status

# Mudar para provedor diferente
*config --set ai.provider anthropic
```

### Problema: Erros de conexão de rede

**Sintomas:**
```
Error: ECONNREFUSED
Error: getaddrinfo ENOTFOUND
```

**Soluções:**

1. **Verificar configurações de proxy:**
```bash
# Proxy corporativo
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Testar conexão
curl -I https://api.openai.com
```

2. **Usar modo offline:**
```bash
# Habilitar modo offline
*config --set offline true

# Usar modelos locais
*config --set ai.provider local
```

3. **Configurar timeouts:**
```bash
# Aumentar timeouts
*config --set network.timeout 30000
*config --set network.retries 3
```

## Erros de Segurança e Permissão

### Problema: Erros de permissão negada

**Sintomas:**
```
Error: EACCES: permission denied
Error: Cannot write to file
```

**Soluções:**

1. **Corrigir permissões de arquivo:**
```bash
# Corrigir permissões do projeto
chmod -R 755 .
chmod 600 .env

# Corrigir diretórios específicos
chmod 755 agents/ tasks/ workflows/
```

2. **Verificar propriedade de arquivo:**
```bash
# Ver propriedade
ls -la

# Corrigir propriedade (Linux/macOS)
sudo chown -R $(whoami) .
```

3. **Executar com usuário correto:**
```bash
# Não usar sudo para npm
npm install  # ✓ Bom
sudo npm install  # ✗ Ruim
```

### Problema: Dados sensíveis expostos

**Sintomas:**
- Chaves de API visíveis em logs
- Credenciais em mensagens de erro

**Soluções:**

1. **Proteger variáveis de ambiente:**
```bash
# Verificar .gitignore
cat .gitignore | grep .env

# Adicionar se ausente
echo ".env" >> .gitignore
echo ".aiox/logs/" >> .gitignore
```

2. **Habilitar modo seguro:**
```bash
# Habilitar recursos de segurança
*config --set security.maskSensitive true
*config --set security.secureLogging true
```

3. **Rotacionar chaves comprometidas:**
```bash
# Gerar novas chaves dos provedores
# Atualizar arquivo .env
# Limpar logs
rm -rf .aiox/logs/*
```

## Problemas Específicos de Plataforma

### Problemas do Windows

#### Problema: Erros de caminho muito longo
```
Error: ENAMETOOLONG
```

**Solução:**
```powershell
# Habilitar caminhos longos (Executar como Administrador)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Ou usar caminhos mais curtos
cd C:\
npx aiox-core init myapp
```

#### Problema: Scripts desabilitados
```
Error: Scripts is disabled on this system
```

**Solução:**
```powershell
# Executar como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problemas do macOS

#### Problema: Command Line Tools ausentes
```
Error: xcrun: error: invalid active developer path
```

**Solução:**
```bash
# Instalar Xcode Command Line Tools
xcode-select --install
```

#### Problema: Gatekeeper bloqueia execução
```
Error: "aiox-core" cannot be opened
```

**Solução:**
```bash
# Permitir execução
sudo spctl --master-disable

# Ou remover quarentena
xattr -d com.apple.quarantine /usr/local/bin/aiox-core
```

### Problemas do Linux

#### Problema: Dependências ausentes
```
Error: libssl.so.1.1: cannot open shared object file
```

**Solução:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install libssl-dev

# RHEL/CentOS
sudo yum install openssl-devel

# Arch
sudo pacman -S openssl
```

## Solução de Problemas Avançada

### Habilitar Modo Debug

```bash
# Saída de debug completa
export DEBUG=aiox:*
npx aiox-core

# Componentes específicos
export DEBUG=aiox:memory,aiox:agent
```

### Analisar Logs

```bash
# Ver logs recentes
tail -f .aiox/logs/aiox.log

# Buscar por erros
grep -i error .aiox/logs/*.log

# Ver logs estruturados
*logs --format json --level error
```

### Criar Relatório de Diagnóstico

```bash
# Gerar diagnóstico completo
npx aiox-core doctor --report diagnostic.json

# Incluir informações do sistema
npx aiox-core info --detailed >> diagnostic.json

# Criar pacote de suporte
tar -czf aiox-support.tar.gz .aiox/logs diagnostic.json
```

### Perfilamento de Performance

```javascript
// Habilitar profiling na config
{
  "debug": {
    "profiling": true,
    "profileOutput": ".aiox/profiles/"
  }
}
```

```bash
# Analisar perfil
*debug analyze-profile .aiox/profiles/latest.cpuprofile
```

### Análise de Dump de Memória

```bash
# Criar snapshot de heap
*debug heap-snapshot

# Analisar uso de memória
*debug memory-report

# Encontrar vazamentos de memória
*debug find-leaks
```

## Obtendo Ajuda

### Antes de Pedir Ajuda

1. **Execute diagnósticos:**
   ```bash
   npx aiox-core doctor --verbose > diagnostic.log
   ```

2. **Colete informações:**
   - Versão do Node.js: `node --version`
   - Versão do NPM: `npm --version`
   - SO e versão: `uname -a` ou `ver`
   - Versão do AIOX: `npx aiox-core version`

3. **Verifique issues existentes:**
   - [GitHub Issues](https://github.com/aiox-core/aiox-core/issues)
   - [Discussions](https://github.com/aiox-core/aiox-core/discussions)

### Suporte da Comunidade

- **Discord**: [Entre no nosso servidor](https://discord.gg/gk8jAdXWmj)
  - `#help` - Ajuda geral
  - `#bugs` - Relatos de bugs
  - `#meta-agent` - Específico do meta-agent

- **GitHub Discussions**: Perguntas técnicas e solicitações de funcionalidades

- **Stack Overflow**: Marque perguntas com `aiox-core`

### Reportando Bugs

Crie relatórios de bug detalhados:

```markdown
## Ambiente
- SO: macOS 13.0
- Node: 18.17.0
- AIOX: 1.0.0

## Passos para Reproduzir
1. Executar `npx aiox-core init test`
2. Selecionar template "enterprise"
3. Erro ocorre durante instalação

## Comportamento Esperado
Instalação completa com sucesso

## Comportamento Real
Error: Cannot find module 'inquirer'

## Logs
[Anexar diagnostic.log]

## Contexto Adicional
Usando proxy corporativo
```

### Recuperação de Emergência

Se tudo mais falhar:

```bash
# Fazer backup do estado atual
cp -r .aiox .aiox.backup

# Reset completo
rm -rf .aiox node_modules package-lock.json
npm cache clean --force

# Instalação limpa
npm install
npx aiox-core doctor --fix

# Restaurar dados se necessário
cp .aiox.backup/memory.db .aiox/
```

---

**Lembre-se**: A maioria dos problemas pode ser resolvida com:
1. `npx aiox-core doctor --fix`
2. Limpando caches
3. Atualizando para a última versão
4. Verificando permissões

Em caso de dúvida, a comunidade está aqui para ajudar!
