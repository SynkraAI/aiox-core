# Instalação Global vs Local - AIOS Agents

Este documento explica as diferenças entre instalação global e local de agentes AIOS, e como elas coexistem.

## Visão Geral

O AIOS oferece dois modos de instalação de agentes:

| Aspecto | Instalação Global | Instalação Local (Por Projeto) |
|---------|-------------------|--------------------------------|
| **Localização** | `~/.kiro/agents/aios/` | `.aios-core/development/agents/` |
| **Configuração** | `~/.kiro/settings/agents.json` | `.aios-core/core-config.yaml` + `AGENTS.md` |
| **Escopo** | Todos os projetos | Apenas o projeto atual |
| **Ativação** | `@agent`, `/agent` | `@agent`, `/agent`, `/skills` |
| **Uso Principal** | Trabalho ad-hoc em qualquer projeto | Desenvolvimento estruturado AIOS |
| **Contexto** | Genérico | Específico do projeto |

## Instalação Global

### O Que É Instalado

```bash
~/.kiro/
├── agents/
│   └── aios/
│       ├── aios-master.md
│       ├── analyst.md
│       ├── architect.md
│       ├── data-engineer.md
│       ├── dev.md
│       ├── devops.md
│       ├── pm.md
│       ├── po.md
│       ├── qa.md
│       ├── sm.md
│       ├── squad-creator.md
│       └── ux-design-expert.md
└── settings/
    └── agents.json
```

### Configuração Global

**Arquivo:** `~/.kiro/settings/agents.json`

```json
{
  "version": "1.0.0",
  "agents": [
    {
      "id": "architect",
      "name": "System Architect",
      "description": "Architecture and technical design",
      "file": "~/.kiro/agents/aios/architect.md",
      "shortcuts": ["@architect", "/architect", "/architect.md"],
      "source": "aios-core"
    }
  ],
  "metadata": {
    "installedAt": "2025-01-14T00:00:00Z",
    "source": "aios-core",
    "version": "4.2.11"
  }
}
```

**Características:**

- ✅ Configuração estática e simples
- ✅ Apenas metadados dos agentes
- ✅ Sem configuração de projeto
- ✅ Sem dependências de contexto

### Quando Usar Instalação Global

Use instalação global quando:

- ✅ Trabalhar em projetos não-AIOS
- ✅ Precisar de agentes AIOS ocasionalmente
- ✅ Quiser acesso rápido sem setup de projeto
- ✅ Não precisar de contexto específico do projeto

**Exemplo:**

```bash
# Em qualquer projeto
cd ~/meu-projeto-qualquer
kiro-cli chat

# Ativar agente global
@architect

# Usar comandos genéricos
*help
*create-plan

# Sair
*exit
```

## Instalação Local (Por Projeto)

### O Que É Instalado

```bash
meu-projeto/
├── .aios-core/
│   ├── core-config.yaml          # ← Configuração principal
│   ├── development/
│   │   └── agents/
│   │       ├── aios-master.md
│   │       ├── analyst.md
│   │       ├── architect.md
│   │       └── ...
│   └── ...
├── AGENTS.md                      # ← Configuração Codex CLI
├── .codex/
│   ├── agents/                    # ← Agentes auxiliares Codex
│   └── skills/                    # ← Skills locais Codex
├── .gemini/
│   ├── rules.md                   # ← Regras Gemini CLI
│   └── rules/AIOS/agents/         # ← Agentes Gemini
├── .claude/
│   └── CLAUDE.md                  # ← Configuração Claude Code
└── docs/
    ├── prd/                       # ← Documentos do projeto
    ├── architecture/
    └── stories/
```

### Configuração Local

**Arquivo 1:** `.aios-core/core-config.yaml`

```yaml
# Configuração completa do projeto AIOS
project:
  type: EXISTING_AIOS
  version: 4.2.11

# Localizações de documentos
prd:
  prdFile: docs/prd.md
  prdSharded: true
  prdShardedLocation: docs/prd

architecture:
  architectureFile: docs/architecture.md
  architectureSharded: true
  architectureShardedLocation: docs/architecture

# Configuração de desenvolvimento
devStoryLocation: docs/stories
devLoadAlwaysFiles:
  - docs/framework/coding-standards.md
  - docs/framework/tech-stack.md
  - docs/framework/source-tree.md

# IDE integrations
ide:
  selected:
    - codex
    - gemini
    - claude-code
    - cursor

# MCP configuration
mcp:
  enabled: true
  configLocation: .claude/mcp.json
```

**Arquivo 2:** `AGENTS.md` (Codex CLI)

```markdown
# AGENTS.md - Synkra AIOS

## Constitution
Siga `.aios-core/constitution.md` como fonte de verdade.

## Workflow Obrigatório
1. Inicie por uma story em `docs/stories/`
2. Implemente apenas o que os acceptance criteria pedem
3. Atualize checklist e file list

## Agent Shortcuts
- `@architect`, `/architect` → `.aios-core/development/agents/architect.md`
- `@dev`, `/dev` → `.aios-core/development/agents/dev.md`
```

**Características:**

- ✅ Configuração rica e específica do projeto
- ✅ Integração com PRD, Arquitetura, Stories
- ✅ Contexto completo do projeto
- ✅ Workflows estruturados
- ✅ Suporte multi-IDE (Codex, Gemini, Claude, Cursor)

### Quando Usar Instalação Local

Use instalação local quando:

- ✅ Desenvolver com metodologia AIOS completa
- ✅ Precisar de contexto específico do projeto
- ✅ Trabalhar com PRD, Arquitetura e Stories
- ✅ Usar workflows estruturados (Planning → Development → QA)
- ✅ Colaborar em equipe com padrões AIOS

**Exemplo:**

```bash
# Em projeto AIOS
cd ~/meu-projeto-aios
kiro-cli chat

# Ativar agente local (com contexto do projeto)
@architect

# Comandos específicos do projeto
*create-plan
*assess-complexity
*map-codebase

# Acesso a documentos do projeto
# - docs/prd/
# - docs/architecture/
# - docs/stories/
```

## Coexistência: Global + Local

### Ordem de Precedência

Quando ambas as instalações existem, o Kiro CLI segue esta ordem:

```
1. Instalação Local (.aios-core/development/agents/)
   ↓ (se não encontrado)
2. Instalação Global (~/.kiro/agents/aios/)
   ↓ (se não encontrado)
3. Erro: Agente não encontrado
```

### Cenários de Coexistência

#### Cenário 1: Projeto AIOS com Agentes Globais

```bash
# Estrutura
~/meu-projeto-aios/
├── .aios-core/development/agents/  # ← Agentes locais (usados)
└── ...

~/.kiro/agents/aios/                # ← Agentes globais (ignorados)
```

**Comportamento:**

- ✅ Agentes locais são usados
- ✅ Contexto do projeto disponível
- ✅ Configuração `core-config.yaml` ativa
- ⚠️ Agentes globais ignorados neste projeto

#### Cenário 2: Projeto Não-AIOS com Agentes Globais

```bash
# Estrutura
~/meu-projeto-qualquer/
└── (sem .aios-core/)

~/.kiro/agents/aios/                # ← Agentes globais (usados)
```

**Comportamento:**

- ✅ Agentes globais são usados
- ⚠️ Sem contexto de projeto AIOS
- ⚠️ Comandos genéricos apenas
- ⚠️ Sem acesso a PRD/Arquitetura/Stories

#### Cenário 3: Projeto AIOS sem Agentes Globais

```bash
# Estrutura
~/meu-projeto-aios/
├── .aios-core/development/agents/  # ← Agentes locais (usados)
└── ...

~/.kiro/agents/aios/                # ← Não existe
```

**Comportamento:**

- ✅ Agentes locais funcionam normalmente
- ✅ Contexto completo do projeto
- ✅ Sem dependência de instalação global

### Tabela de Decisão

| Situação | Local Existe? | Global Existe? | Qual é Usado? | Contexto Disponível? |
|----------|---------------|----------------|---------------|----------------------|
| Projeto AIOS completo | ✅ | ✅ | Local | ✅ Completo |
| Projeto AIOS completo | ✅ | ❌ | Local | ✅ Completo |
| Projeto não-AIOS | ❌ | ✅ | Global | ❌ Genérico |
| Projeto não-AIOS | ❌ | ❌ | ❌ Erro | ❌ N/A |

## Diferenças de Configuração

### Global: Simples e Estática

**Arquivo:** `~/.kiro/settings/agents.json`

```json
{
  "agents": [
    {
      "id": "architect",
      "shortcuts": ["@architect", "/architect"]
    }
  ]
}
```

**Propósito:**

- Apenas metadados dos agentes
- Mapeamento de shortcuts
- Sem configuração de projeto

### Local: Rica e Dinâmica

**Arquivo:** `.aios-core/core-config.yaml`

```yaml
# Configuração completa do projeto
project:
  type: EXISTING_AIOS
  version: 4.2.11

prd:
  prdFile: docs/prd.md
  prdSharded: true

architecture:
  architectureFile: docs/architecture.md
  architectureSharded: true

devStoryLocation: docs/stories
devLoadAlwaysFiles:
  - docs/framework/coding-standards.md
  - docs/framework/tech-stack.md

ide:
  selected: [codex, gemini, claude-code]

mcp:
  enabled: true
```

**Propósito:**

- Configuração completa do projeto
- Localizações de documentos
- Workflows e padrões
- Integrações IDE/MCP
- Contexto de desenvolvimento

## Sincronização e Atualização

### Atualizar Agentes Globais

```bash
# Do repositório aios-core
cd /path/to/aios-core
git pull
node scripts/install-agents-globally.js
```

**Efeito:**

- ✅ Sobrescreve `~/.kiro/agents/aios/`
- ✅ Atualiza `~/.kiro/settings/agents.json`
- ❌ Não afeta projetos locais

### Atualizar Agentes Locais

```bash
# Do projeto AIOS
cd /path/to/meu-projeto
npx aios-core@latest install
```

**Efeito:**

- ✅ Atualiza `.aios-core/development/agents/`
- ✅ Atualiza `core-config.yaml` (preserva customizações)
- ✅ Sincroniza IDE configs (AGENTS.md, .gemini/, .claude/)
- ❌ Não afeta instalação global

### Sincronizar IDEs (Apenas Local)

```bash
# Sincronizar todos os IDEs
npm run sync:ide

# Sincronizar IDE específico
npm run sync:ide:codex
npm run sync:ide:gemini
npm run sync:ide:claude

# Validar sincronização
npm run validate:parity
```

**Efeito:**

- ✅ Atualiza `AGENTS.md` (Codex)
- ✅ Atualiza `.gemini/rules.md` e `.gemini/rules/AIOS/agents/`
- ✅ Atualiza `.claude/CLAUDE.md`
- ❌ Não afeta instalação global

## Comandos de Validação

### Validar Instalação Global

```bash
# Verificar arquivos
ls -la ~/.kiro/agents/aios/
cat ~/.kiro/settings/agents.json

# Testar ativação
kiro-cli chat
@architect
*help
*exit
```

### Validar Instalação Local

```bash
# Verificar estrutura
ls -la .aios-core/development/agents/
cat .aios-core/core-config.yaml

# Validar sincronização IDE
npm run validate:codex-sync
npm run validate:gemini-sync
npm run validate:claude-sync

# Validar paridade multi-IDE
npm run validate:parity

# Testar ativação
kiro-cli chat
@architect
*help
*exit
```

## Recomendações

### Para Usuários Casuais

```bash
# Instale globalmente
node scripts/install-agents-globally.js

# Use em qualquer projeto
cd ~/qualquer-projeto
kiro-cli chat
@architect
```

### Para Desenvolvimento AIOS

```bash
# Instale localmente no projeto
cd ~/meu-projeto
npx aios-core@latest install

# Sincronize IDEs
npm run sync:ide

# Use com contexto completo
kiro-cli chat
@architect
*create-plan
```

### Para Ambos

```bash
# Instale globalmente para uso geral
node scripts/install-agents-globally.js

# Instale localmente em projetos AIOS
cd ~/projeto-aios
npx aios-core@latest install

# Resultado:
# - Projetos AIOS usam agentes locais (com contexto)
# - Outros projetos usam agentes globais (genéricos)
```

## Troubleshooting

### Agente Não Encontrado

**Problema:** `@architect` não funciona

**Solução:**

```bash
# Verificar instalação global
ls ~/.kiro/agents/aios/architect.md

# Verificar instalação local
ls .aios-core/development/agents/architect.md

# Reinstalar se necessário
node scripts/install-agents-globally.js  # Global
npx aios-core@latest install             # Local
```

### Agente Sem Contexto

**Problema:** Agente não conhece PRD/Arquitetura

**Solução:**

```bash
# Verificar se está em projeto AIOS
cat .aios-core/core-config.yaml

# Se não existir, instalar localmente
npx aios-core@latest install

# Verificar configuração
cat .aios-core/core-config.yaml | grep -A5 "prd:"
cat .aios-core/core-config.yaml | grep -A5 "architecture:"
```

### Conflito Global/Local

**Problema:** Não sei qual agente está sendo usado

**Solução:**

```bash
# Verificar precedência
# 1. Local tem prioridade
ls .aios-core/development/agents/architect.md

# 2. Se não existir, usa global
ls ~/.kiro/agents/aios/architect.md

# Forçar uso local
cd projeto-aios
npx aios-core@latest install
```

## Resumo

| Aspecto | Global | Local |
|---------|--------|-------|
| **Configuração** | `~/.kiro/settings/agents.json` | `.aios-core/core-config.yaml` |
| **Complexidade** | Simples (metadados) | Rica (projeto completo) |
| **Contexto** | Genérico | Específico do projeto |
| **Precedência** | Baixa | Alta |
| **Atualização** | `install-agents-globally.js` | `npx aios-core install` |
| **Uso** | Qualquer projeto | Projetos AIOS |
| **IDE Sync** | Não aplicável | `npm run sync:ide` |

**Regra de Ouro:**

- 🌍 **Global** = Acesso rápido em qualquer lugar (sem contexto)
- 📁 **Local** = Desenvolvimento estruturado AIOS (com contexto completo)
- 🎯 **Coexistência** = Local tem precedência quando ambos existem
