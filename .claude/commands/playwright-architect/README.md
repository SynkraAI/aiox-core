# Playwright Architect Squad

> Crie scripts Playwright/Stagehand incriveis de forma guiada.
> Descreva o que quer, o squad navega o site e gera o script perfeito.

## Quick Start

```bash
# Ativar o squad
@playwright-architect

# Criar um script guiado
*create-script

# Ou modo rápido
*quick-script https://site.com "extrair todos os preços"
```

## Como Funciona

```
Você: "Quero extrair todos os preços do site X"
        ↓
  🎭 CHIEF entende o objetivo
        ↓
  🔍 RECON-MAPPER navega o site com smart-browser
        ↓
  🏗️ SCRIPT-ARCHITECT define a estratégia Stagehand
        ↓
  ⚡ CODE-GENERATOR escreve o script executável
        ↓
  🧪 TESTER-VALIDATOR roda e valida o output
        ↓
  📚 PATTERN-LIBRARIAN salva patterns reutilizáveis
        ↓
  ✅ Script pronto: node output/scripts/seu-script.js
```

## Agents

| Agent | Tier | Função |
|-------|------|--------|
| `playwright-chief` | Orchestrator | Entende objetivo, coordena squad |
| `recon-mapper` | Tier 0 | Navega e mapeia sites |
| `script-architect` | Tier 1 | Design da estratégia do script |
| `code-generator` | Tier 1 | Escreve o código executável |
| `script-tester-validator` | Tier 2 | Testa e valida scripts |
| `pattern-librarian-architect` | Tier 2 | Gerencia patterns reutilizáveis |

## Comandos

| Comando | Descrição |
|---------|-----------|
| `*create-script` | Workflow guiado completo |
| `*quick-script {url} {task}` | Modo rápido |
| `*list-patterns` | Ver patterns disponíveis |
| `*test-script {file}` | Testar script existente |
| `*improve-script {file}` | Iterar em script existente |

## Tecnologia

- **Stagehand v3** — AI-powered browser automation (Browserbase)
- **Playwright** — Browser control engine
- **Zod** — Schema validation for extracted data
- **OpenAI API** — LLM for intelligent page interaction

## Patterns Library

O squad mantém uma biblioteca de patterns reutilizáveis em `data/patterns/`:

| Pattern | Categoria | Uso |
|---------|-----------|-----|
| `form-login` | Auth | Login com email + senha |
| `infinite-scroll` | Pagination | Scroll para carregar mais |
| `file-download` | Actions | Download de PDFs/arquivos |

Patterns crescem conforme novos scripts são criados.

## Pré-requisitos

1. **OPENAI_API_KEY** configurada em `tools/smart-browser-playwright/.env`
2. **Playwright browsers** instalados: `npx playwright install chromium`

## Estrutura

```
squads/playwright-architect/
├── agents/
│   ├── playwright-chief.md        # Orchestrator
│   ├── recon-mapper.md            # Site reconnaissance
│   ├── script-architect.md        # Script design
│   ├── code-generator.md          # Script implementation
│   ├── script-tester-validator.md # Testing & validation
│   └── pattern-librarian-architect.md  # Pattern management
├── workflows/
│   └── wf-create-script.yaml     # Main workflow
├── tasks/
│   └── create-script.md          # Script creation task
├── data/
│   ├── stagehand-kb.md           # Stagehand v3 knowledge base
│   └── patterns/                  # Reusable patterns library
│       ├── INDEX.md
│       ├── form-login.md
│       ├── infinite-scroll.md
│       └── file-download.md
├── checklists/
│   └── script-quality-gate.md    # Pre-delivery quality checks
├── output/
│   └── scripts/                   # Generated scripts go here
├── config.yaml
└── README.md
```

## Exemplos de Uso

### Extrair dados de e-commerce
```
*create-script
URL: https://store.example.com
Objetivo: Extrair nome, preço e URL de todos os produtos
Login: Não
```

### Login + download de relatório
```
*create-script
URL: https://app.example.com
Objetivo: Fazer login, navegar até relatórios, baixar PDF mensal
Login: Sim (email + senha via .env)
```

### Preencher formulário automaticamente
```
*create-script
URL: https://forms.example.com/submit
Objetivo: Preencher formulário de cadastro com dados do CSV
Login: Não
```

---

_Versão: 1.0.0_
_Compatível com: AIOS-FULLSTACK v5+, Stagehand v3+_
_Criado: 2026-03-19_
