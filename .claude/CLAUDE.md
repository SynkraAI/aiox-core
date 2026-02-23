# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Constitution

O AIOS possui uma **Constitution formal** com princípios inegociáveis e gates automáticos.

**Documento completo:** `.aios-core/constitution.md`

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | CLI First | NON-NEGOTIABLE |
| II | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV | No Invention | MUST |
| V | Quality First | MUST |
| VI | Absolute Imports | SHOULD |

**Gates automáticos bloqueiam violações.** Consulte a Constitution para detalhes completos.

---

## Premissa Arquitetural: CLI First

```
CLI First → Observability Second → UI Third
```

| Camada | Prioridade | Descrição |
|--------|------------|-----------|
| **CLI** | Máxima | Onde a inteligência vive. Toda execução, decisões e automação. |
| **Observability** | Secundária | Observar e monitorar o que acontece no CLI em tempo real. |
| **UI** | Terciária | Gestão pontual e visualizações quando necessário. |

- A CLI é a fonte da verdade — dashboards apenas observam, nunca controlam
- Funcionalidades novas devem funcionar 100% via CLI antes de ter qualquer UI
- A UI nunca deve ser requisito para operação do sistema
- Ao decidir onde implementar algo, sempre prefira CLI > Observability > UI

---

## Estrutura do Projeto

Monorepo com npm workspaces. Node.js >=18 (v20+ recomendado), npm >=9.

```
aios-core/
├── .aios-core/                  # Core do framework
│   ├── core/                    # 25 módulos (orchestration, memory, config, etc.)
│   ├── cli/                     # CLI commands e utils
│   ├── data/                    # Knowledge base, entity registry, tech presets
│   ├── development/             # Agents, tasks (200+), templates, checklists, workflows (17)
│   ├── infrastructure/          # CI/CD templates, scripts, schemas, integrations
│   ├── schemas/                 # JSON schemas (agent-v3, task-v3, squad)
│   ├── hooks/                   # Git hook scripts (IDS registry sync)
│   ├── constitution.md          # Princípios inegociáveis do framework
│   ├── core-config.yaml         # Configuração core do AIOS
│   ├── framework-config.yaml    # Configuração do framework
│   └── project-config.yaml      # Configuração do projeto
├── bin/                         # CLI executables
│   ├── aios.js                  # Main CLI (entrypoint para `aios` e `aios-core`)
│   ├── aios-init.js             # Initialization
│   ├── aios-ids.js              # ID system CLI
│   └── aios-minimal.js          # Lightweight entrypoint
├── packages/                    # npm workspaces
│   ├── installer/               # Installation wizard (config, detection, merger, updater)
│   ├── aios-install/            # Installation helpers (dep-checker, os-detector)
│   ├── aios-pro-cli/            # Pro CLI features
│   └── gemini-aios-extension/   # Google Gemini extension
├── docs/                        # Documentação
│   └── stories/                 # Development stories (active/, completed/)
├── pro/                         # Pro submodule (proprietary, git submodule)
├── squads/                      # Squad expansions (agents, tasks, workflows)
├── scripts/                     # Build & automation scripts
└── tests/                       # Test suites (unit, integration, e2e, regression, etc.)
```

### TypeScript Path Alias

```json
"@synkra/aios-core" → ".aios-core/core"
```

Definido em `tsconfig.json`. Use `@synkra/aios-core` ou `@synkra/aios-core/*` para importar módulos core.

---

## Comandos de Desenvolvimento

### Testes
```bash
npm test                              # Jest — rodar todos os testes
npm run test:watch                    # Jest em modo watch
npm run test:coverage                 # Jest com relatório de cobertura
npx jest path/to/file.test.js         # Rodar um único arquivo de teste
npx jest --testPathPattern="pattern"  # Filtrar testes por padrão
npm run test:health-check             # Mocha — testes de health check (timeout 30s)
```

Jest usa `tests/setup.js` como setup global. Timeout de teste: 30s. Cobertura mínima: 80% global target (thresholds atuais mais baixos temporariamente).

### Linting & Formatação
```bash
npm run lint                # ESLint (v9 flat config, cache habilitado)
npm run typecheck           # TypeScript --noEmit
npm run format              # Prettier em todos os *.md
```

### Validação
```bash
npm run validate:structure  # Source tree guardian
npm run validate:agents     # Validar definições de agentes
npm run sync:ide            # Sincronizar regras entre IDEs (Claude, Cursor, Windsurf)
npm run sync:ide:validate   # Validar sincronização de IDEs
```

### AIOS CLI
```bash
npx aios-core install       # Instalar AIOS em projeto
npx aios-core doctor        # Diagnóstico do sistema
npx aios-core info          # Informações do sistema
```

---

## Sistema de Agentes

### Ativação
Use `@agent-name` ou `/AIOS:agents:agent-name`:

| Agente | Persona | Escopo Principal |
|--------|---------|------------------|
| `@dev` | Dex | Implementação de código |
| `@qa` | Quinn | Testes e qualidade |
| `@architect` | Aria | Arquitetura e design técnico |
| `@pm` | Morgan | Product Management |
| `@po` | Pax | Product Owner, stories/epics |
| `@sm` | River | Scrum Master |
| `@analyst` | Alex | Pesquisa e análise |
| `@data-engineer` | Dara | Database design |
| `@ux-design-expert` | Uma | UX/UI design |
| `@devops` | Gage | CI/CD, git push (EXCLUSIVO) |

### Comandos de Agentes
Prefixo `*`: `*help`, `*create-story`, `*task {name}`, `*exit`

### Mapeamento Agente → Codebase

| Agente | Diretórios Principais |
|--------|----------------------|
| `@dev` | `packages/`, `.aios-core/core/`, `bin/` |
| `@architect` | `docs/architecture/`, system design |
| `@data-engineer` | `packages/db/`, migrations, schema |
| `@qa` | `tests/`, `*.test.js`, quality gates |
| `@po` | Stories, epics, requirements |
| `@devops` | `.github/`, CI/CD, git operations |

---

## Story-Driven Development

Todo desenvolvimento começa com uma story em `docs/stories/`. Workflow:

```
@po/@sm *create-story → @dev implementa → @qa testa → @devops push
```

- Marque checkboxes conforme completa: `[ ]` → `[x]`
- Mantenha a seção File List atualizada na story
- Implemente exatamente o que os acceptance criteria especificam

---

## Padrões de Código

### Estilo (Prettier + ESLint)
- 2 espaços, sem tabs, semicolons obrigatórios
- Single quotes (com `avoidEscape`)
- Trailing comma: `es5`
- Print width: 100
- Arrow parens: always

### Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `WorkflowList` |
| Hooks | prefixo `use` | `useWorkflowOperations` |
| Arquivos | kebab-case | `workflow-list.tsx` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Interfaces | PascalCase + sufixo | `WorkflowListProps` |

### Imports
**Sempre use imports absolutos.** Nunca use imports relativos.

**Ordem:** React/core → External libs → UI components → Utilities → Stores → Feature → CSS

### TypeScript
- Sem `any` — use tipos apropriados ou `unknown` com type guards
- Target: ES2022, module: commonjs
- `noEmit: true` — apenas type checking, sem compilação

### Variáveis não usadas
ESLint permite prefixo `_` para ignorar: `_unused`, `_err`

---

## Convenções Git

### Commits
Conventional Commits (usado pelo semantic-release para versionamento automático):
- `feat:` → minor release
- `fix:` → patch release
- `perf:` → patch release
- `breaking change` → major release

**Referencie story ID:** `feat: implement feature [Story 2.1]`

### Branches
`main` (principal), `feat/*`, `fix/*`, `docs/*`, `refactor/*`, `test/*`

### Push Authority
**Apenas `@devops` pode fazer push para remote.**

### Git Hooks (Husky)
- **lint-staged** (pre-commit): ESLint + Prettier em arquivos staged. Editar agentes em `.aios-core/development/agents/` automaticamente dispara `npm run sync:ide`
- **post-commit**: Limpa cache de status do projeto e atualiza IDS registry
- **pre-push**: Sincroniza entity registry

---

## Arquitetura Core (.aios-core/core/)

25 módulos autônomos:

| Módulo | Função |
|--------|--------|
| `orchestration/` | Workflow orchestration (master-orchestrator, bob-orchestrator, workflow-executor) |
| `execution/` | Task execution (autonomous-build-loop, parallel-executor, wave-executor) |
| `elicitation/` | User input collection (workflow, task, agent elicitation) |
| `quality-gates/` | 3 camadas: layer1-precommit, layer2-pr-automation, layer3-human-review |
| `config/` | Config loading, env interpolation, caching, migration |
| `mcp/` | MCP integration (os-detector, symlink-manager, global-config-manager) |
| `permissions/` | Access control (operation-guard, permission-mode) |
| `memory/` | Persistent patterns (gotchas-memory) |
| `health-check/` | System health monitoring |
| `ids/` | Entity ID management |
| `events/` | Event handling |
| `session/` | Session state handling |
| `migration/` | Data migration utilities |
| `ui/` | Panel rendering, observability |

### Schemas
JSON schemas para validação em `.aios-core/schemas/`: `agent-v3-schema.json`, `task-v3-schema.json`, `squad-schema.json`

---

## MCP Usage

Ver `.claude/rules/mcp-usage.md` para regras detalhadas.

- Preferir ferramentas nativas do Claude Code sobre MCP
- MCP Docker Gateway apenas quando explicitamente necessário
- `@devops` gerencia toda infraestrutura MCP

---

## Debug

```bash
export AIOS_DEBUG=true
tail -f .aios/logs/agent.log
```

---

## Language Configuration

Language preference is handled by Claude Code's native `language` setting.
Configure in `~/.claude/settings.json` (global) or `.claude/settings.json` (project):

```json
{ "language": "portuguese" }
```

---

*Synkra AIOS Claude Code Configuration v4.1*
*CLI First | Observability Second | UI Third*
