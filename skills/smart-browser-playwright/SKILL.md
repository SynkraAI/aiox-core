---
name: smart-browser-playwright
description: "Automação inteligente de browser via Stagehand + OpenAI. É como ter um assistente que sabe navegar qualquer site — você descreve o que quer em linguag"
  Automação inteligente de browser via Stagehand + OpenAI. Navega sites de forma autônoma,
  extrai dados estruturados, contorna erros, e pede ajuda quando trava.
  Dois modos: agente autônomo (--task) ou interativo step-by-step (--interactive).
risk: moderate
source: self
paths:
  - "tools/smart-browser-playwright/"
lazy_load: true
context_budget: 800

version: 1.0.0
category: general
tags: [SKILL]
---

# Smart Browser Playwright

Automação inteligente de browser via Stagehand + OpenAI. É como ter um assistente que sabe navegar qualquer site — você descreve o que quer em linguagem natural e ele faz o resto.

## When to Use This Skill

| Cenário | Exemplo |
|---------|---------|
| Extrair dados estruturados de sites | "Pega os top 10 repos do GitHub trending" |
| Navegar sites com interação complexa | "Vai no site X, faz login e baixa o relatório" |
| Scraping inteligente (DOM + LLM) | "Extrai preços de todos os produtos da página" |
| Automação de tarefas web repetitivas | "Preenche esse formulário com esses dados" |
| Exploração interativa de sites | "Abre esse site e me mostra o que tem" |
| Captura de dados que mudam com JS | Sites com conteúdo dinâmico (SPA, React, etc.) |

## Do NOT Use This Skill When

| Cenário | Alternativa |
|---------|-------------|
| API disponível para os dados | Use a API diretamente (mais rápido, mais confiável) |
| Pesquisa na web (busca geral) | Use `WebSearch` ou `/deep-search` |
| Site com proteção anti-bot forte | Pode falhar — considere Apify MCP |
| Scraping em massa (1000+ páginas) | Use Apify ou scraper dedicado |
| Download de arquivos simples | Use `curl` ou `WebFetch` |
| Screenshot para documentação | Use Playwright MCP diretamente |

## Discovery Questions

Perguntas para fazer antes de executar. Use AskUserQuestion tool. Pule se o usuário já forneceu esse contexto.

1. **Qual site/URL quer navegar e o que precisa extrair ou fazer lá?** — (define a task em linguagem natural para o agente autônomo)
2. **Precisa de modo autônomo (agente faz tudo) ou step-by-step (você aprova cada ação)?** — (determina se usa `--task` ou `--interactive`) *(opcional — default: autônomo)*
3. **O site requer login ou autenticação?** — (sites com login podem precisar de modo interativo para credenciais) *(opcional)*
4. **Precisa ver o browser aberto ou pode rodar em background?** — (define `--headed` vs `--headless`) *(opcional — default: headed)*

## Prerequisites

| Requisito | Como verificar | Instalação |
|-----------|----------------|------------|
| Node.js 18+ | `node --version` | `brew install node` |
| Dependências instaladas | `ls tools/smart-browser-playwright/node_modules/` | `cd tools/smart-browser-playwright && npm install` |
| OpenAI API key | Verificar `.env` no diretório da tool | Criar com `OPENAI_API_KEY=sk-proj-...` |
| Playwright browsers | — | Instalado automaticamente com Stagehand |

**Importante:** Stagehand v3 requer **OpenAI API diretamente** (não OpenRouter — structured outputs incompatíveis).

## Workflow

### Phase 1: Setup

1. Verificar se `tools/smart-browser-playwright/.env` existe com `OPENAI_API_KEY`
2. Verificar se `node_modules/` existe (se não, rodar `npm install`)
3. Determinar modo de execução: `--task` (autônomo) ou `--interactive`

**Veto conditions:**
- `.env` sem `OPENAI_API_KEY` → PARAR, orientar criação da key
- `node_modules/` ausente → PARAR, instruir `npm install`

**Completion criteria:** Ambiente verificado, comando pronto para execução.

### Phase 2: Execute

1. Montar o comando com os flags apropriados
2. Executar via Bash tool
3. Monitorar output (erros, retries, resultados)

```bash
# Modo autônomo — agente completa a tarefa sozinho
cd tools/smart-browser-playwright && node run.js --task "descrição da tarefa"

# Modo interativo — step-by-step com aprovação
cd tools/smart-browser-playwright && node run.js --interactive

# Com URL específica + extração
cd tools/smart-browser-playwright && node run.js --url "https://example.com" --extract "preços e nomes dos produtos"
```

**Veto conditions:**
- Timeout (>120s sem progresso) → PARAR, verificar se o site carregou
- Erro de autenticação OpenAI (401) → PARAR, verificar API key
- Site com CAPTCHA bloqueante → PARAR, informar usuário

**Completion criteria:** Task completada ou dados extraídos com sucesso.

### Phase 3: Validate

1. Verificar se os dados extraídos fazem sentido (não estão vazios ou truncados)
2. Spot-check: comparar 2-3 itens com o site real se possível
3. Apresentar resultado ao usuário em formato estruturado

**Completion criteria:** Dados validados e apresentados ao usuário.

## Options Reference

| Flag | Descrição | Default |
|------|-----------|---------|
| `--task, -t` | Tarefa em linguagem natural para agente autônomo | — |
| `--url, -u` | URL para navegar | — |
| `--extract, -e` | O que extrair (usar com `--url`) | — |
| `--model, -m` | Modelo LLM | `openai/gpt-4o-mini` |
| `--headed` | Mostrar janela do browser | Sim (padrão) |
| `--headless` | Esconder janela do browser | Não |
| `--interactive, -i` | Modo step-by-step com input humano | Não |
| `--timeout` | Tempo máximo em ms | 120000 |

## Examples

```bash
# Extrair repos trending do GitHub
node run.js --task "go to github.com/trending and extract top 10 repos with name, description, and stars"

# Extrair stories do Hacker News
node run.js --task "go to news.ycombinator.com and extract the top 5 stories with title and points"

# Extrair preços de um e-commerce
node run.js --task "go to amazon.com.br and search for 'kindle' and extract the first 5 results with name and price"

# Preencher formulário
node run.js --task "go to typeform.com/example and fill the form with name=John, email=john@test.com"

# Exploração interativa
node run.js --interactive

# Modelo mais inteligente (custa mais)
node run.js --task "analyze the pricing page of stripe.com and extract all plan details" --model "openai/gpt-4o"

# Headless (sem janela — para CI ou background)
node run.js --task "..." --headless
```

## Configuration

Editar `tools/smart-browser-playwright/.env`:

```bash
OPENAI_API_KEY=sk-proj-...
SMART_BROWSER_MODEL=openai/gpt-4o-mini
SMART_BROWSER_HEADLESS=false
```

## How It Works

1. **Você dá instruções** em linguagem natural ("extrai os top 3 stories")
2. **Stagehand analisa o DOM** — accessibility tree + chunks + ranqueia elementos
3. **LLM decide** qual elemento corresponde à sua intenção (via OpenAI)
4. **Executa ação** — click, type, scroll, extract
5. **Cacheia resultado** — próxima execução no mesmo site é mais rápida
6. **Em caso de erro** — tenta estratégia diferente. No modo interativo, pergunta a você.

## Cost

| Modelo | Custo por tarefa | 100 tarefas/dia |
|--------|------------------|-----------------|
| gpt-4o-mini (default) | ~$0.001-0.005 | ~$0.15/dia (~R$0.80) |
| gpt-4o (avançado) | ~$0.01-0.05 | ~$1.50/dia (~R$8.00) |

**Regra de ouro:** Use gpt-4o-mini para tarefas simples (extração, navegação). Use gpt-4o para tarefas complexas (formulários, multi-step, análise).

## Edge Cases e Limitações

| Situação | Comportamento | Workaround |
|----------|---------------|------------|
| Site com CAPTCHA | Falha após timeout | Usar modo `--interactive` para resolver manualmente |
| SPA com loading lento | Pode tentar agir antes do carregamento | Aumentar `--timeout` |
| Site com iframe | Stagehand pode não acessar conteúdo do iframe | Navegar diretamente para URL do iframe |
| Popup/modal inesperado | Agente tenta fechar automaticamente | No modo interativo, você decide |
| Site com WAF agressivo (Cloudflare) | Pode ser bloqueado | Usar `--headed` + esperar challenge resolver |
| Conteúdo paginado | Agente só pega página atual por padrão | Incluir na task: "navigate through all pages" |
| Downloads de arquivo | Stagehand não gerencia downloads | Use `curl` ou `WebFetch` após obter URL |
| Múltiplas abas/janelas | Não suportado | Executar tarefas separadas |
| Sites que exigem JavaScript desabilitado | Não aplicável (Playwright sempre tem JS) | — |

## Important Notes

- Stagehand v3 requer **OpenAI API diretamente** (não OpenRouter — structured outputs incompatíveis)
- Formato do modelo deve ser `openai/model-name` (ex: `openai/gpt-4o-mini`)
- O modo `agent` é o mais confiável para tarefas multi-step complexas
- O método `act` funciona para ações únicas
- O método `extract` no v3.2 retorna DOM bruto — use modo `agent` para extração

## Safety

- **Credenciais:** nunca incluir senhas em `--task`. Use modo `--interactive` para login.
- **Rate limiting:** sites podem bloquear acesso se muitas requisições em sequência. Espaçar execuções.
- **Dados sensíveis:** dados extraídos podem conter PII. Tratar com cuidado.
- **Custos:** monitorar uso da API OpenAI em platform.openai.com.

## Troubleshooting

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| `OPENAI_API_KEY not set` | `.env` ausente ou incompleto | Criar `.env` com a key |
| Browser não abre | Playwright browsers não instalados | `npx playwright install chromium` |
| Timeout sem resultado | Site lento ou CAPTCHA | Aumentar `--timeout` ou usar `--interactive` |
| `structured outputs incompatible` | Usando OpenRouter ao invés de OpenAI | Usar API OpenAI diretamente |
| Extração retorna vazio | Seletor errado ou conteúdo dinâmico | Reformular a task com mais contexto |
| Erro 429 (rate limit OpenAI) | Muitas chamadas em sequência | Aguardar 60s e tentar novamente |
| Site bloqueia acesso | WAF ou anti-bot | Usar `--headed` e reduzir frequência |
| `node_modules not found` | Dependências não instaladas | `cd tools/smart-browser-playwright && npm install` |

## Script Location

`tools/smart-browser-playwright/run.js`
