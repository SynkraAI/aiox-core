# aiox-core — Claude Code Instructions

## O que é

AIOX (Artificial Intelligence Orchestration eXperience) — framework open-source CLI para desenvolvimento full-stack orquestrado por IA. Repo: `SynkraAI/aiox-core`, v5.0.3.

- Runtime: Node.js ≥18 / npm ≥9 / TypeScript
- CLI: `npx aiox`, `npx aiox-core`, `npx aiox-graph`
- Integração nativa com Claude Code via `.claude/`

## Agentes disponíveis

| Handle | Nome | Responsabilidade exclusiva |
|--------|------|---------------------------|
| `@sm` | River | Criação de stories (`*draft`, `*create-story`) |
| `@po` | Pax | Validação de stories (`*validate-story-draft`), 10-point checklist |
| `@dev` | Dex | Implementação — git add/commit local; **não** git push |
| `@qa` | — | QA gate, 7 quality checks, QA loop |
| `@devops` | Gage | **Exclusivo**: git push, gh pr create/merge, CI/CD, MCP |
| `@pm` | Morgan | Epic orchestration (`*execute-epic`, `*create-epic`), spec pipeline |
| `@architect` | Aria | Arquitetura, technology selection, complexity assessment |
| `@data-engineer` | Dara | Schema DDL, queries, RLS, migrations |
| `@aiox-master` | — | Governança do framework, override de agentes |

## Workflows

| Workflow | Quando usar |
|----------|------------|
| **Story Development Cycle (SDC)** | Nova story de um épico — fluxo principal |
| **QA Loop** | QA encontrou issues, precisa de iteração (max 5) |
| **Spec Pipeline** | Feature complexa precisa de spec antes do SDC |
| **Brownfield Discovery** | Avaliar dívida técnica de codebase existente |

Fluxo SDC: `@sm *draft → @po *validate → @dev *develop → @qa *qa-gate → @devops *push`

## Slash commands principais

```
*draft / *create-story          → @sm
*validate-story-draft           → @po
*execute-epic / *create-epic    → @pm
*qa-loop {storyId}              → @qa
*stop-qa-loop / *resume-qa-loop → @qa
*push                           → @devops
```

## Regras de autoridade (resumo)

- `git push` e `gh pr` → **somente @devops**, bloqueado para qualquer outro agente
- Story title/AC/scope → **somente @po** pode editar
- Schema/DDL/migrations → **@architect** decide tecnologia, **@data-engineer** implementa
- Qualquer violação → escalate para `@aiox-master`

## Scripts npm

```bash
npm test                    # jest
npm run lint                # eslint com cache
npm run typecheck           # tsc --noEmit
npm run validate:structure  # source-tree-guardian
npm run validate:agents     # valida definição dos agentes
npm run sync:ide:claude     # sincroniza regras para .claude/
npm run validate:claude-sync # valida sincronização
```

## Regras detalhadas

Arquivos em `.claude/rules/` — carregados automaticamente:

| Arquivo | Conteúdo |
|---------|----------|
| `agent-authority.md` | Delegation matrix completa por agente |
| `workflow-execution.md` | 4 workflows detalhados com fases e comandos |
| `story-lifecycle.md` | Status flow, checklists de validação e QA gate |
| `ids-principles.md` | REUSE > ADAPT > CREATE + verification gates G1–G6 |
| `agent-handoff.md` | Regras de handoff entre agentes |
| `handoff-consolidation.md` | Consolida handoffs em RUN-LOG.md ao atingir 5+ por pipeline |
| `agent-memory-imports.md` | Imports de memória por agente |
| `mcp-usage.md` | Uso de MCP tools |
| `tool-examples.md` | Exemplos de uso das tools |
| `tool-response-filtering.md` | Filtragem de respostas |
| `coderabbit-integration.md` | Self-healing CodeRabbit (max 2 iterações) |

## Estrutura de diretórios relevante

```
aiox-core/
├── .aiox-core/          ← core do framework (tasks, agents, infrastructure)
├── .claude/             ← este diretório (settings, hooks, rules)
├── packages/            ← pacotes modulares npm
├── squads/              ← configurações de times de agentes
├── bin/                 ← CLIs (aiox, aiox-core, aiox-graph, aiox-minimal)
├── docs/                ← documentação (pt, en, es, zh)
├── scripts/             ← scripts de validação e geração
└── .env                 ← secrets locais (nunca commitar)
```
