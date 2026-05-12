# Guia de Configuração Docker MCP

> **PT**

---

Guia para configurar servidores MCP (Model Context Protocol) baseados em Docker com AIOX.

**Versão:** 2.1.0
**Última Atualização:** 2026-01-28

---

## Pré-requisitos

Antes de configurar Docker MCP, certifique-se de ter:

- **Docker Desktop** instalado e em execução
- **Node.js** 18+ instalado
- Projeto **AIOX** inicializado
- Chaves de API para os serviços MCP desejados (EXA, Apify, etc.)

---

## Instalação

### Passo 1: Instalar Docker MCP Toolkit

```bash
# Instalar o Docker MCP Toolkit
docker mcp install

# Verificar instalação
docker mcp --version
```

### Passo 2: Inicializar Configuração MCP

```bash
# Criar estrutura MCP global
aiox mcp setup
```

Isso cria:

- `~/.aiox/mcp/` - Diretório de configuração MCP
- `~/.aiox/mcp/global-config.json` - Arquivo de configuração principal
- `~/.aiox/mcp/servers/` - Configurações de servidores individuais
- `~/.aiox/credentials/` - Armazenamento seguro de credenciais

### Passo 3: Adicionar Servidores MCP

```bash
# Adicionar servidores a partir de templates
aiox mcp add context7
aiox mcp add exa
aiox mcp add github
```

---

## Configuração

### Arquitetura MCP

AIOX usa Docker MCP Toolkit como a infraestrutura MCP principal:

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                           │
│                         │                                │
│    ┌────────────────────┼────────────────────┐          │
│    │                    │                    │          │
│    ▼                    ▼                    ▼          │
│ playwright      docker-gateway           native tools   │
│ (direto)        (container MCPs)         (Read, Write)  │
│                         │                                │
│              ┌──────────┼──────────┐                    │
│              ▼          ▼          ▼                    │
│            EXA     Context7     Apify                   │
│         (busca)    (docs)     (scraping)               │
└─────────────────────────────────────────────────────────┘
```

### Direto no Claude Code (global ~/.claude.json)

| MCP                   | Propósito                                            |
| --------------------- | ---------------------------------------------------- |
| **playwright**        | Automação de navegador, screenshots, testes web      |
| **desktop-commander** | Operações de container Docker via docker-gateway    |

### Dentro do Docker Desktop (via docker-gateway)

| MCP          | Propósito                                               |
| ------------ | ------------------------------------------------------- |
| **EXA**      | Busca web, pesquisa, análise de empresas/concorrentes  |
| **Context7** | Consulta de documentação de bibliotecas                 |
| **Apify**    | Web scraping, Actors, extração de dados de redes sociais|

### Arquivos de Configuração

**global-config.json:**

```json
{
  "version": "1.0",
  "servers": {
    "context7": {
      "type": "sse",
      "url": "https://mcp.context7.com/sse",
      "enabled": true
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server"],
      "env": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      },
      "enabled": true
    }
  },
  "defaults": {
    "timeout": 30000,
    "retries": 3
  }
}
```

---

## MCPs Disponíveis

### Context7 (Consulta de Documentação)

```bash
# Adicionar Context7
aiox mcp add context7

# Uso
mcp__context7__resolve-library-id
mcp__context7__query-docs
```

**Usar para:**

- Consulta de documentação de bibliotecas
- Referência de API para pacotes/frameworks
- Obter documentação atualizada para dependências

### EXA (Busca Web)

```bash
# Adicionar EXA
aiox mcp add exa

# Definir chave de API
export EXA_API_KEY="your-api-key"

# Uso
mcp__exa__web_search_exa
mcp__exa__get_code_context_exa
```

**Usar para:**

- Buscas web por informações atuais
- Pesquisa e consulta de documentação
- Pesquisa de empresas e concorrentes
- Encontrar exemplos de código online

### Apify (Web Scraping)

```bash
# Adicionar Apify
aiox mcp add apify

# Definir token de API
export APIFY_TOKEN="your-token"

# Uso
mcp__docker-gateway__search-actors
mcp__docker-gateway__call-actor
```

**Usar para:**

- Web scraping para redes sociais (Instagram, TikTok, LinkedIn)
- Extrair dados de sites de e-commerce
- Coleta automatizada de dados de qualquer site
- Navegação web habilitada para RAG para contexto de IA

### GitHub (Integração de API)

```bash
# Adicionar GitHub
aiox mcp add github

# Definir token
export GITHUB_TOKEN="your-token"
```

**Usar para:**

- Operações de API do GitHub
- Gerenciamento de repositório
- Manipulação de PR e issues

### Playwright (Automação de Navegador)

```bash
# Adicionar Playwright
aiox mcp add puppeteer
```

**Usar para:**

- Automação de navegador
- Capturar screenshots de páginas web
- Interagir com sites
- Web scraping e testes

---

## Comandos CLI

### Comandos de Configuração

```bash
# Inicializar configuração MCP global
aiox mcp setup

# Forçar recriação (fazer backup do existente)
aiox mcp setup --force
```

### Gerenciamento de Servidores

```bash
# Adicionar servidor a partir de template
aiox mcp add <server-name>

# Adicionar com configuração customizada
aiox mcp add custom-server --config='{"command":"npx","args":["-y","package"]}'

# Remover servidor
aiox mcp remove <server-name>

# Habilitar/desabilitar servidores
aiox mcp enable <server-name>
aiox mcp disable <server-name>
```

### Status e Listagem

```bash
# Listar servidores configurados
aiox mcp list

# Mostrar status detalhado
aiox mcp status

# Sincronizar para o projeto
aiox mcp sync
```

---

## Variáveis de Ambiente

### Definindo Variáveis

**macOS/Linux:**

```bash
export EXA_API_KEY="your-api-key"
export GITHUB_TOKEN="your-github-token"
export APIFY_TOKEN="your-apify-token"
```

**Windows (PowerShell):**

```powershell
$env:EXA_API_KEY = "your-api-key"
$env:GITHUB_TOKEN = "your-github-token"
$env:APIFY_TOKEN = "your-apify-token"
```

### Variáveis Persistentes

Adicione ao seu perfil de shell (`~/.bashrc`, `~/.zshrc`, ou `~/.profile`):

```bash
export EXA_API_KEY="your-api-key"
export GITHUB_TOKEN="your-github-token"
export APIFY_TOKEN="your-apify-token"
```

### Armazenamento Seguro de Credenciais

```bash
# Adicionar credencial
aiox mcp credential set EXA_API_KEY "your-api-key"

# Obter credencial
aiox mcp credential get EXA_API_KEY

# Listar credenciais (mascaradas)
aiox mcp credential list
```

---

## Solução de Problemas

### Problemas Comuns

| Problema                             | Solução                                                     |
| ------------------------------------ | ----------------------------------------------------------- |
| Permissão negada                     | Execute o terminal como Administrador (Windows) ou use sudo |
| Servidor não iniciando               | Verifique comando e args, verifique se o pacote está instalado |
| Variável de ambiente não encontrada  | Defina a variável ou use armazenamento de credenciais      |
| Erros de timeout                     | Aumente o timeout na configuração                           |
| Conexão recusada                     | Verifique a URL e acesso à rede                             |

### Bug de Secrets do Docker MCP (Dez 2025)

**Problema:** O armazenamento de secrets do Docker MCP Toolkit (`docker mcp secret set`) e interpolação de template (`{{...}}`) NÃO funcionam corretamente. Credenciais não são passadas para os containers.

**Sintomas:**

- `docker mcp tools ls` mostra "(N prompts)" em vez de "(N tools)"
- Servidor MCP inicia mas falha na autenticação
- Saída verbose mostra `-e ENV_VAR` sem valores

**Solução alternativa:** Edite `~/.docker/mcp/catalogs/docker-mcp.yaml` diretamente:

```yaml
{ mcp-name }:
  env:
    - name: API_TOKEN
      value: 'actual-token-value-here'
```

**Exemplo - Apify:**

```yaml
apify-mcp-server:
  env:
    - name: TOOLS
      value: 'actors,docs,apify/rag-web-browser'
    - name: APIFY_TOKEN
      value: 'apify_api_xxxxxxxxxxxxx'
```

**Nota:** Isso expõe credenciais em um arquivo local. Proteja as permissões do arquivo e nunca faça commit deste arquivo.

### Correções Comuns

```bash
# Resetar configuração global
aiox mcp setup --force

# Limpar cache
rm -rf ~/.aiox/mcp/cache/*

# Verificar configuração
aiox mcp status --verbose

# Testar servidor manualmente
npx -y @modelcontextprotocol/server-github
```

---

## Governança MCP

**Importante:** Todo gerenciamento de infraestrutura MCP é tratado exclusivamente pelo **Agente DevOps (@devops / Felix)**.

| Operação                  | Agente | Comando             |
| ------------------------- | ------ | ------------------- |
| Buscar catálogo MCP       | DevOps | `*search-mcp`       |
| Adicionar servidor MCP    | DevOps | `*add-mcp`          |
| Listar MCPs habilitados   | DevOps | `*list-mcps`        |
| Remover servidor MCP      | DevOps | `*remove-mcp`       |
| Configurar Docker MCP     | DevOps | `*setup-mcp-docker` |

Outros agentes (Dev, Architect, etc.) são **consumidores** de MCP, não administradores. Se for necessário gerenciamento de MCP, delegue para @devops.

---

## Prioridade de Seleção de Ferramentas

Sempre prefira ferramentas nativas do Claude Code sobre servidores MCP:

| Tarefa              | USE ISSO               | NÃO ISSO       |
| ------------------- | ---------------------- | -------------- |
| Ler arquivos        | `Read` tool            | docker-gateway |
| Escrever arquivos   | `Write` / `Edit` tools | docker-gateway |
| Executar comandos   | `Bash` tool            | docker-gateway |
| Buscar arquivos     | `Glob` tool            | docker-gateway |
| Buscar conteúdo     | `Grep` tool            | docker-gateway |
| Listar diretórios   | `Bash(ls)` ou `Glob`   | docker-gateway |

### Quando Usar docker-gateway

Use docker-gateway apenas quando:

1. Usuário explicitamente diz "use docker" ou "use container"
2. Usuário explicitamente menciona "Desktop Commander"
3. Tarefa especificamente requer operações de container Docker
4. Acessando MCPs rodando dentro do Docker (EXA, Context7)
5. Usuário pede para executar algo dentro de um container Docker

---

## Documentação Relacionada

- [Tutorial Docker Gateway](./guides/mcp/docker-gateway-tutorial.md)
- [Guia Desktop Commander MCP](./guides/mcp/desktop-commander.md)
- [Guia de Configuração MCP Global](./guides/mcp-global-setup.md)
- [Diagramas de Arquitetura MCP](./architecture/mcp-system-diagrams.md)
- [Agente DevOps](../.aiox-core/development/agents/devops.md)

---

_Guia de Configuração Docker MCP do Synkra AIOX v4.0_
