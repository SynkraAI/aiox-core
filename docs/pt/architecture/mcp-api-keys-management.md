# Gerenciamento de Chaves de API MCP

> 🌐 [EN](../../architecture/mcp-api-keys-management.md) | **PT** | [ES](../../es/architecture/mcp-api-keys-management.md)

---

**Versão:** 1.0.0
**Última Atualização:** 2026-01-26
**Status:** Referência Oficial

---

## Visão Geral

Este documento descreve as melhores práticas para gerenciar chaves de API usadas por servidores MCP (Model Context Protocol) no AIOX. O gerenciamento adequado de chaves de API é crítico para segurança e integridade operacional.

---

## Arquitetura MCP no AIOX

AIOX utiliza Docker MCP Toolkit como a infraestrutura principal de MCP:

```
┌─────────────────────────────────────────────────────────────┐
│                    Arquitetura MCP                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Direto no Claude Code (~/.claude.json)                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  playwright     → Automação de navegador            │   │
│   │  desktop-commander → Operações docker gateway       │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│   Dentro do Docker Desktop (via docker-gateway)             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  EXA           → Busca web, pesquisa                │   │
│   │  Context7      → Documentação de bibliotecas        │   │
│   │  Apify         → Web scraping, extração de dados    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Servidores MCP Suportados

| Servidor MCP | Chave Necessária | Variável de Ambiente | Localização |
|--------------|------------------|---------------------|-------------|
| EXA | Sim | `EXA_API_KEY` | Docker MCP config.yaml |
| Context7 | Não | N/A | N/A |
| Apify | Sim | `APIFY_API_TOKEN` | Docker MCP docker-mcp.yaml |
| Playwright | Não | N/A | N/A |

---

## Métodos de Configuração

### Método 1: Docker MCP Toolkit (Principal)

Docker MCP Toolkit gerencia chaves de API através de seus arquivos de configuração.

**Para EXA (usa seção apiKeys):**

Localização: `~/.docker/mcp/config.yaml`

```yaml
# ~/.docker/mcp/config.yaml
apiKeys:
  exa: "sua-chave-api-exa-aqui"
```

**Para servidores que requerem variáveis de ambiente (Apify, etc.):**

Localização: `~/.docker/mcp/catalogs/docker-mcp.yaml`

```yaml
# ~/.docker/mcp/catalogs/docker-mcp.yaml
apify:
  env:
    - name: APIFY_API_TOKEN
      value: 'seu-token-apify-aqui'  # Hardcode diretamente (ver Problemas Conhecidos)
```

### Método 2: Variáveis de Ambiente

Para desenvolvimento local ou configurações sem Docker:

```bash
# ~/.zshrc ou ~/.bashrc
export EXA_API_KEY="sua-chave-api-exa"
export APIFY_API_TOKEN="seu-token-apify"
```

### Método 3: Arquivo .env do Projeto

Para configuração específica do projeto:

```bash
# .env (adicionar ao .gitignore!)
EXA_API_KEY=sua-chave-api-exa
APIFY_API_TOKEN=seu-token-apify
```

---

## Governança MCP no AIOX

**IMPORTANTE:** Todo o gerenciamento de infraestrutura MCP é tratado EXCLUSIVAMENTE pelo **Agente DevOps (@devops / Gage)**.

| Operação | Agente | Comando |
|----------|--------|---------|
| Buscar catálogo MCP | DevOps | `*search-mcp` |
| Adicionar servidor MCP | DevOps | `*add-mcp` |
| Listar MCPs habilitados | DevOps | `*list-mcps` |
| Remover servidor MCP | DevOps | `*remove-mcp` |
| Configurar Docker MCP | DevOps | `*setup-mcp-docker` |

Outros agentes (Dev, Architect, etc.) são **consumidores** de MCP, não administradores.

---

## Melhores Práticas de Segurança

### FAZER

- Armazenar chaves de API em variáveis de ambiente ou arquivos de config seguros
- Adicionar arquivos `.env` ao `.gitignore`
- Usar chaves de API diferentes para desenvolvimento e produção
- Rotacionar chaves de API periodicamente (recomendado a cada 90 dias)
- Usar chaves de API somente leitura quando acesso de escrita não é necessário
- Monitorar uso de API para anomalias

### NÃO FAZER

- Commitar chaves de API no controle de versão
- Compartilhar chaves de API em chat ou email
- Usar chaves de produção em desenvolvimento
- Armazenar chaves em arquivos de texto em locais compartilhados
- Hardcodear chaves no código fonte

---

## Problemas Conhecidos

### Bug de Secrets do Docker MCP (Dez 2025)

**Problema:** O armazenamento de secrets do Docker MCP Toolkit e a interpolação de templates não funcionam corretamente. Credenciais configuradas via `docker mcp secret set` NÃO são passadas para os containers.

**Sintomas:**
- `docker mcp tools ls` mostra "(N prompts)" em vez de "(N tools)"
- Servidor MCP inicia mas falha na autenticação
- Saída verbose mostra `-e ENV_VAR` sem valores

**Solução:** Editar `~/.docker/mcp/catalogs/docker-mcp.yaml` diretamente com valores hardcodeados:

```yaml
# Em vez de usar referência de secrets
apify:
  env:
    - name: APIFY_API_TOKEN
      value: 'valor-real-do-token'  # Hardcode diretamente
```

**MCPs Afetados:** Qualquer MCP que requer autenticação (Apify, Notion, Slack, etc.)

**MCPs Funcionando:** EXA funciona porque sua chave está em `~/.docker/mcp/config.yaml` sob `apiKeys`

---

## Procedimento de Rotação de Chaves

### Passo 1: Gerar Nova Chave

1. Faça login no dashboard do provedor de serviço (EXA, Apify, etc.)
2. Gere uma nova chave de API
3. Registre a nova chave de forma segura

### Passo 2: Atualizar Configuração

```bash
# Atualizar config do Docker MCP
vim ~/.docker/mcp/config.yaml

# Ou para MCPs baseados em env
vim ~/.docker/mcp/catalogs/docker-mcp.yaml
```

### Passo 3: Verificar Nova Chave

```bash
# Reiniciar Docker MCP (se usando Docker Desktop MCP)
# Ou reiniciar Claude Code para recarregar configuração

# Testar a conexão usando @devops
@devops *list-mcps
```

### Passo 4: Revogar Chave Anterior

1. Retorne ao dashboard do provedor de serviço
2. Revogue/delete a chave de API anterior
3. Verifique que a chave anterior não funciona mais

---

## Solução de Problemas

### Erro "Autenticação falhou"

1. Verifique se a chave de API está correta (sem espaços extras)
2. Verifique se a chave expirou
3. Verifique se a chave tem as permissões necessárias
4. Verifique se os limites de uso foram excedidos

### Chaves Não Sendo Lidas

1. Reinicie Claude Code ou sua IDE
2. Verifique a sintaxe do arquivo de config (YAML)
3. Verifique as permissões do arquivo
4. Para Docker MCP, verifique se Docker Desktop está rodando

### Ferramenta MCP Mostra "prompts" em Vez de "tools"

Isso indica o bug de secrets. Use a solução hardcodeada no docker-mcp.yaml.

---

## Fontes de Chaves de API

| Serviço | Obter Chave de API | Documentação |
|---------|-------------------|--------------|
| EXA | [dashboard.exa.ai](https://dashboard.exa.ai) | [docs.exa.ai](https://docs.exa.ai) |
| Apify | [console.apify.com](https://console.apify.com) | [docs.apify.com](https://docs.apify.com) |

---

## Documentação Relacionada

- [Regras de Uso MCP](../../../.claude/rules/mcp-usage.md) - Regras completas de governança MCP
- [Arquitetura de Alto Nível](./high-level-architecture.md)

---

**Mantenedor:** @devops (Gage)
