# Guia de Integração com IDEs

> **PT**

---

Guia para integrar o AIOX com IDEs e plataformas de desenvolvimento com IA suportadas.

**Versão:** 2.1.0
**Última Atualização:** 2026-01-28

---

## IDEs Suportadas

O AIOX suporta 6 plataformas de desenvolvimento com IA. Escolha a que melhor se adapta ao seu fluxo de trabalho.

### Tabela de Comparação Rápida

| Funcionalidade         | Claude Code | Codex CLI | Cursor | Copilot | AntiGravity | Gemini CLI |
| ---------------------- | :---------: | :-------: | :----: | :-----: | :---------: | :--------: |
| **Ativação de Agente** |  /command   |  /skills  | @mention | chat modes | workflow-based | prompt mention |
| **Suporte MCP**        |   Native    |  Native   | Config | Config | Provider-specific | Native |
| **Tarefas de Subagente** |   Yes     |    Yes    |   No   |   No   |     Yes     |     No     |
| **Auto-sync**          |     Yes     |    Yes    |  Yes   |  Yes   |     Yes     |    Yes     |
| **Sistema de Hooks**   |     Yes     |  Limited  |   No   |   No   |      No     |     Yes    |
| **Skills/Commands**    |   Native    |  Native   |   No   |   No   |      No     |   Native   |
| **Recomendação**       |    Best     |   Best    |  Best  |  Good  |     Good    |   Good     |

### Paridade de Hooks e Impacto Funcional

| IDE | Paridade de Hooks vs Claude | O que degrada sem hooks completos | Mitigação no AIOX |
| --- | --- | --- | --- |
| Claude Code | Completa | Nenhum (comportamento de referência) | Hooks nativos + pipeline completo do AIOX |
| Gemini CLI | Alta | Pequenas diferenças de modelo de eventos | Hooks nativos do Gemini + mapeamento unificado |
| Codex CLI | Limitada/parcial | Menor automação de ciclo de sessão e menor enforcement pre/post-tool | `AGENTS.md` + `/skills` + MCP + scripts de sync/validação |
| Cursor | Sem hooks de ciclo equivalentes | Sem interceptação nativa pre/post-tool e trilha automática mais fraca | Regras sincronizadas + MCP + disciplina de workflow |
| GitHub Copilot | Sem hooks de ciclo equivalentes | Mesmo impacto do Cursor, com maior dependência de fluxo manual | Instruções de repo, chat modes e MCP no VS Code |
| AntiGravity | Baseado em workflow (não em hooks) | Sem paridade de ciclo de vida ao estilo Claude | Geração de workflows + sync de agentes |

### Consequências Práticas por Capacidade

- Automação `SessionStart/SessionEnd`:
  - Forte em Claude/Gemini.
  - Parcial ou manual em Codex/Cursor/Copilot/AntiGravity.
- Guardrails `BeforeTool/AfterTool`:
  - Mais robustos em Claude/Gemini.
  - Limitados no Codex.
  - Predominantemente processuais em Cursor/Copilot/AntiGravity.
- Riqueza de auditoria e telemetria automáticas:
  - Maior onde há hooks de ciclo de vida.
  - Menor onde a integração é majoritariamente por regras/instruções.

---

## Instruções de Configuração

### Claude Code

**Nível de Recomendação:** Melhor integração com AIOX

```yaml
config_file: .claude/CLAUDE.md
agent_folder: .claude/commands/AIOX/agents
activation: /agent-name (slash commands)
format: full-markdown-yaml
mcp_support: native
special_features:
  - Task tool for subagents
  - Native MCP integration
  - Hooks system (pre/post)
  - Custom skills
  - Memory persistence
```

**Configuração:**

1. AIOX cria automaticamente o diretório `.claude/` durante a inicialização
2. Agentes ficam disponíveis como slash commands: `/dev`, `/qa`, `/architect`
3. Configure servidores MCP em `~/.claude.json`

**Configuração:**

```bash
# Sincronizar todos os alvos habilitados (inclui Claude)
npm run sync:ide

# Verificar configuração
ls -la .claude/commands/AIOX/agents/
```

---

### Codex CLI

**Nível de Recomendação:** Melhor (workflow terminal-first)

```yaml
config_file: AGENTS.md
agent_folder: .codex/agents
activation: /skills + atalhos AGENTS.md
skills_folder: .codex/skills (local), ~/.codex/skills (global)
format: markdown
mcp_support: nativo via Codex
special_features:
  - AGENTS.md como contrato operacional
  - Skills locais versionadas no projeto
  - Pipeline de greeting compartilhado com Claude
  - Comando de notify e hooks de ferramenta emergentes nas releases recentes do Codex
```

**Configuração:**

1. Mantenha `AGENTS.md` na raiz do repositório
2. Execute `npm run sync:ide:codex`
3. Execute `npm run sync:skills:codex`
4. Use `/skills` e selecione `aiox-<agent-id>`
5. Use `sync:skills:codex:global` só quando quiser instalação global

```bash
npm run sync:ide:codex
npm run sync:skills:codex
ls -la AGENTS.md .codex/agents/ .codex/skills/
```

---

### Cursor

**Nível de Recomendação:** Melhor (IDE com IA popular)

```yaml
config_file: .cursor/rules.md
agent_folder: .cursor/rules
activation: @agent-name
format: condensed-rules
mcp_support: via configuration
special_features:
  - Composer integration
  - Chat modes
  - @codebase context
  - Multi-file editing
  - Suporte a subagents e handoff para cloud agents
  - Fluxos de agente de longa duracao (preview)
```

**Configuração:**

1. AIOX cria o diretório `.cursor/` durante a inicialização
2. Agentes ativados com @mention: `@dev`, `@qa`
3. Regras sincronizadas para `.cursor/rules/`

**Configuração:**

```bash
# Sincronizar Cursor
npm run sync:ide:cursor

# Verificar configuração
ls -la .cursor/rules/
```

**Configuração MCP (`.cursor/mcp.json`):**

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/sse"
    }
  }
}
```

---

### GitHub Copilot

**Nível de Recomendação:** Bom (integração com GitHub)

```yaml
config_file: .github/copilot-instructions.md
agent_folder: .github/agents
activation: chat modes
format: text
mcp_support: via VS Code MCP config
special_features:
  - GitHub integration
  - PR assistance
  - Code review
  - Integracao com instrucoes de repositorio e MCP no VS Code
```

**Configuração:**

1. Habilite GitHub Copilot em seu repositório
2. AIOX cria `.github/copilot-instructions.md`
3. Instruções de agentes sincronizadas

**Configuração:**

```bash
# Sincronizar todos os alvos habilitados
npm run sync:ide

# Verificar configuração
cat .github/copilot-instructions.md
```

---

### AntiGravity

**Nível de Recomendação:** Bom (integração com Google)

```yaml
config_file: .antigravity/rules.md
config_json: .antigravity/antigravity.json
agent_folder: .agent/workflows
activation: workflow-based
format: cursor-style
mcp_support: native (Google)
special_features:
  - Google Cloud integration
  - Workflow system
  - Native Firebase tools
```

**Configuração:**

1. AIOX cria o diretório `.antigravity/`
2. Configure credenciais do Google Cloud
3. Agentes sincronizados como workflows

---

### Gemini CLI

**Nível de Recomendação:** Bom

```yaml
config_file: .gemini/rules.md
agent_folder: .gemini/rules/AIOX/agents
activation: prompt mention
format: text
mcp_support: native
special_features:
  - Google AI models
  - CLI-based workflow
  - Multimodal support
  - Eventos de hooks nativos e comandos de hooks
  - Suporte nativo a servidores MCP
  - UX de comandos/ferramentas em evolucao acelerada
```

---

## Sistema de Sincronização

### Como Funciona a Sincronização

O AIOX mantém uma única fonte de verdade para definições de agentes e as sincroniza com todas as IDEs configuradas:

```
┌─────────────────────────────────────────────────────┐
│                    AIOX Core                         │
│  .aiox-core/development/agents/  (Source of Truth)  │
│                        │                             │
│            ┌───────────┼───────────┐                │
│            ▼           ▼           ▼                │
│  .claude/     .codex/      .cursor/                  │
│  .antigravity/ .gemini/                              │
└─────────────────────────────────────────────────────┘
```

### Comandos de Sincronização

```bash
# Sincronizar todos os alvos habilitados
npm run sync:ide

# Sincronizar alvos específicos
npm run sync:ide:cursor
npm run sync:ide:codex
npm run sync:ide:gemini
npm run sync:ide:github-copilot
npm run sync:ide:antigravity

# Dry run (visualizar mudanças)
npm run sync:ide -- --dry-run

# Sincronização padrão
npm run sync:ide
```

### Sincronização Automática

O AIOX pode ser configurado para sincronizar automaticamente quando houver mudanças nos agentes:

```yaml
# .aiox-core/core/config/sync.yaml
auto_sync:
  enabled: true
  watch_paths:
    - .aiox-core/development/agents/
  platforms:
    - claude
    - codex
    - cursor
    - gemini
```

---

## Solução de Problemas

### Agente Não Aparece na IDE

```bash
# Verificar se o agente existe na fonte
ls .aiox-core/development/agents/

# Sincronizar e validar
npm run sync:ide
npm run sync:ide:check

# Verificar diretório específico da plataforma
ls .cursor/rules/  # Para Cursor
ls .claude/commands/AIOX/agents/  # Para Claude Code
```

### Conflitos de Sincronização

```bash
# Visualizar o que seria alterado
npm run sync:ide -- --dry-run

# Fazer backup antes de sincronização
cp -r .cursor/rules/ .cursor/rules.backup/
npm run sync:ide
```

### MCP Não Está Funcionando

```bash
# Verificar status do MCP
aiox mcp status

# Verificar configuração MCP para a IDE
cat ~/.claude.json  # Para Claude Code
cat .cursor/mcp.json  # Para Cursor
```

### Problemas Específicos da IDE

**Claude Code:**

- Certifique-se de que `.claude/` está na raiz do projeto
- Verifique permissões dos hooks: `chmod +x .claude/hooks/*.py`

**Cursor:**

- Reinicie o Cursor após sincronização
- Verifique permissões de `.cursor/rules/`

## Guia de Decisão de Plataforma

Use este guia para escolher a plataforma certa:

```
Você usa Claude/Anthropic API?
├── Sim --> Claude Code (Melhor integração com AIOX)
└── Não
    └── Você prefere VS Code?
        ├── Sim --> Quer uma extensão?
        │   ├── Sim --> GitHub Copilot (Recursos nativos do GitHub)
        │   └── Não --> GitHub Copilot (Recursos nativos do GitHub)
        └── Não --> Quer uma IDE dedicada com IA?
            ├── Sim --> Qual modelo você prefere?
            │   ├── Claude/GPT --> Cursor (IDE com IA mais popular)
            └── Não --> Usa Google Cloud?
                ├── Sim --> AntiGravity (integração com Google)
                └── Não --> Gemini CLI (Especializados)
```

---

## Migração Entre IDEs

### De Cursor para Claude Code

```bash
# Exportar regras atuais
cp -r .cursor/rules/ ./rules-backup/

# Inicializar Claude Code
npm run sync:ide

# Verificar migração
diff -r ./rules-backup/ .claude/commands/AIOX/agents/
```

### De Claude Code para Cursor

```bash
# Sincronizar para Cursor
npm run sync:ide:cursor

# Configurar MCP (se necessário)
# Copiar configuração MCP para .cursor/mcp.json
```

---

## Documentação Relacionada

- [Guias de Plataforma](./platforms/README.md)
- [Guia do Claude Code](./platforms/claude-code.md)
- [Guia do Cursor](./platforms/cursor.md)
- [Guia de Referência de Agentes](./agent-reference-guide.md)
- [Configuração Global do MCP](./guides/mcp-global-setup.md)

---

_Guia de Integração com IDEs do Synkra AIOX v4.0_
