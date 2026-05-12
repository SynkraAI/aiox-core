# Tutorial Docker Gateway MCP

> **PT** | [EN](../../../guides/mcp/docker-gateway-tutorial.md)

---

Tutorial para configurar docker-gateway com servidores MCP rodando dentro de containers Docker.

**Versão:** 1.0.0
**Última Atualização:** 2026-01-28

---

## O que é Docker Gateway?

Docker Gateway é um servidor MCP que atua como uma **ponte** entre o Claude Code e múltiplos servidores MCP rodando dentro de containers Docker.

### Benefício Principal: Sem Custo Extra de Tokens

Quando MCPs rodam dentro do docker-gateway, suas definições de ferramentas ficam **encapsuladas** no container. Isso significa:

| Configuração             | Custo de Tokens          | Definições de Tools no Contexto |
| ------------------------ | ------------------------ | ------------------------------- |
| Direto no ~/.claude.json | Cada MCP adiciona tokens | Sim, todos os schemas visíveis  |
| Dentro do docker-gateway | **Sem custo extra**      | Encapsulado no container        |

**Por quê?** O Claude Code só vê as ferramentas do docker-gateway (`mcp-add`, `mcp-find`, etc.), não as ferramentas individuais de cada MCP interno. As ferramentas reais são chamadas através do gateway.

---

## Pré-requisitos

- **Docker Desktop** 4.37+ instalado e rodando
- **Claude Code** CLI instalado
- Chaves de API para os serviços MCP desejados

---

## Passo 1: Inicializar Docker MCP Toolkit

```bash
# Inicializar o sistema de catálogo
docker mcp catalog init

# Verificar inicialização
docker mcp catalog ls
```

**Saída esperada:**

```
docker-mcp: Docker MCP Catalog
```

O catálogo contém 313+ servidores MCP disponíveis para habilitar.

---

## Passo 2: Navegar Servidores Disponíveis

```bash
# Listar todos os servidores disponíveis
docker mcp catalog show docker-mcp

# Buscar servidor específico
docker mcp catalog show docker-mcp | grep -i apify
docker mcp catalog show docker-mcp | grep -i exa
```

---

## Passo 3: Habilitar Servidores MCP

```bash
# Habilitar servidores que você quer usar
docker mcp server enable apify-mcp-server
docker mcp server enable exa
docker mcp server enable context7

# Listar servidores habilitados
docker mcp server ls
```

---

## Passo 4: Configurar Chaves de API

### Método 1: Usando Docker MCP Secrets (pode ter bugs)

```bash
# Definir secrets
docker mcp secret set APIFY_TOKEN "seu-token-apify"
docker mcp secret set EXA_API_KEY "sua-chave-exa"
```

### Método 2: Editar Arquivo de Catálogo Diretamente (workaround recomendado)

Devido a um bug conhecido (Dez 2025), secrets podem não ser passados corretamente para os containers.

**Workaround:** Edite `~/.docker/mcp/catalogs/docker-mcp.yaml` diretamente:

```yaml
# Encontre a entrada do seu MCP e adicione os valores de env
apify-mcp-server:
  env:
    - name: APIFY_TOKEN
      value: 'apify_api_xxxxxxxxxxxxx'
    - name: TOOLS
      value: 'actors,docs,apify/rag-web-browser'

exa:
  env:
    - name: EXA_API_KEY
      value: 'sua-chave-exa-aqui'
```

⚠️ **Nota de segurança:** Isso expõe credenciais em um arquivo local. Defina permissões adequadas:

```bash
chmod 600 ~/.docker/mcp/catalogs/docker-mcp.yaml
```

---

## Passo 5: Configurar Claude Code

Adicione docker-gateway ao `~/.claude.json`:

```json
{
  "mcpServers": {
    "docker-gateway": {
      "type": "stdio",
      "command": "docker",
      "args": ["mcp", "gateway", "run"]
    }
  }
}
```

Ou use o CLI do Claude:

```bash
claude mcp add docker-gateway -s user -- docker mcp gateway run
```

---

## Passo 6: Verificar Configuração

```bash
# Verificar ferramentas disponíveis através do gateway
docker mcp tools ls

# Saída esperada mostra ferramentas do gateway + servidores habilitados
# Exemplo: 58 tools (7 gateway + 51 dos servidores habilitados)
```

No Claude Code:

```bash
# Listar status dos MCPs
claude mcp list

# Deve mostrar:
# docker-gateway: docker mcp gateway run - ✓ Connected
```

---

## Usando Docker Gateway

### Ferramentas do Gateway Disponíveis

| Ferramenta           | Descrição                                  |
| -------------------- | ------------------------------------------ |
| `mcp-add`            | Adicionar servidor MCP à sessão atual      |
| `mcp-find`           | Buscar servidores no catálogo              |
| `mcp-remove`         | Remover servidor MCP da sessão             |
| `mcp-exec`           | Executar ferramenta de servidor habilitado |
| `mcp-config-set`     | Configurar servidor MCP                    |
| `code-mode`          | Criar ferramentas JavaScript combinadas    |
| `mcp-create-profile` | Salvar estado atual do gateway             |

### Acessando Ferramentas dos Servidores Habilitados

Uma vez habilitados, as ferramentas dos servidores ficam disponíveis através do gateway:

```
# Ferramentas Apify (via docker-gateway)
mcp__docker-gateway__search-actors
mcp__docker-gateway__call-actor
mcp__docker-gateway__apify-slash-rag-web-browser

# Ferramentas EXA (via docker-gateway)
mcp__docker-gateway__web_search_exa
mcp__docker-gateway__company_research

# Ferramentas Context7 (via docker-gateway)
mcp__docker-gateway__resolve-library-id
mcp__docker-gateway__query-docs
```

---

## Exemplo de Configuração Completa

### ~/.claude.json

```json
{
  "mcpServers": {
    "desktop-commander": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@wonderwhy-er/desktop-commander"]
    },
    "docker-gateway": {
      "type": "stdio",
      "command": "docker",
      "args": ["mcp", "gateway", "run"]
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-playwright"]
    }
  }
}
```

### Resultado

```
User MCPs (4 servidores):
├── desktop-commander  ✓ conectado
├── docker-gateway     ✓ conectado  (58 ferramentas dentro)
├── playwright         ✓ conectado
└── n8n-mcp           ✓ conectado

Dentro do docker-gateway:
├── apify-mcp-server   (7 ferramentas)
├── exa                (8 ferramentas)
├── context7           (2 ferramentas)
└── + ferramentas do gateway (7 ferramentas)
```

---

## Solução de Problemas

### Gateway Não Inicia

```bash
# Verificar se Docker está rodando
docker info

# Verificar logs do gateway
docker mcp gateway run --verbose
```

### Ferramentas Mostrando "(N prompts)" ao Invés de "(N tools)"

Isso indica falha de autenticação. Use o workaround:

```bash
# Editar catálogo diretamente com credenciais hardcoded
nano ~/.docker/mcp/catalogs/docker-mcp.yaml
```

### Servidor Não Encontrado

```bash
# Atualizar catálogo
docker mcp catalog update

# Verificar se servidor existe
docker mcp catalog show docker-mcp | grep -i "nome-do-servidor"
```

### Resetar Tudo

```bash
# Desabilitar todos os servidores
docker mcp server reset

# Resetar catálogo
docker mcp catalog reset

# Reinicializar
docker mcp catalog init
```

---

## Melhores Práticas

### 1. Use docker-gateway para MCPs baseados em API

Coloque estes dentro do docker-gateway (não precisam de acesso ao host):

- Apify (APIs de web scraping)
- EXA (APIs de busca)
- Context7 (APIs de documentação)
- Qualquer integração cloud/SaaS

### 2. Mantenha MCPs com acesso ao host diretos

Mantenha estes no ~/.claude.json diretamente:

- desktop-commander (precisa acesso a arquivos/terminal do host)
- playwright (precisa acesso ao browser do host)
- MCPs de filesystem

### 3. Proteja suas credenciais

```bash
# Definir permissões restritivas
chmod 600 ~/.docker/mcp/catalogs/docker-mcp.yaml
chmod 700 ~/.docker/mcp/

# Nunca commitar estes arquivos
echo "~/.docker/mcp/" >> ~/.gitignore_global
```

---

## Documentação Relacionada

- [Guia Desktop Commander MCP](../../../guides/mcp/desktop-commander.md)
- [Guia de Configuração Global MCP](../../../guides/mcp-global-setup.md)
- [Configuração Docker MCP](../../../docker-mcp-setup.md)

---

_Tutorial Docker Gateway MCP v1.0.0 - AIOX Framework_
