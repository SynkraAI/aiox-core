---
name: sync-projects
description: "Um raio-X de todos os seus projetos em um comando. Contexto atualizado, sem esforço manual."
  Escaneia projetos locais, coleta atividade recente do git, e gera um relatório
  consolidado (Project Pulse) para manter contexto atualizado sobre todos os projetos.
  Suporta export em JSON, YAML ou envio para APIs externas.
version: "2.0.0"
categories: [utility, devops, automation]
allowed-tools: Read, Bash, Glob, Grep, Write

category: general
tags: [SKILL]
---

# Sync Projects — Project Pulse

> Um raio-X de todos os seus projetos em um comando. Contexto atualizado, sem esforço manual.

**Analogia:** Imagine que cada projeto é um paciente num hospital. O Project Pulse é o painel de monitoramento da UTI — mostra sinais vitais (último commit, stack, status) de todos ao mesmo tempo, para você saber quem precisa de atenção.

## Quando Usar

- Após criar ou modificar projetos significativos
- Quando precisa de um panorama geral de todos os projetos
- Para alimentar um sistema externo com contexto de projetos (bot, dashboard, API)
- Periodicamente (recomendado: 1x por semana)
- Antes de sessões de planejamento (saber o que está ativo, pausado, etc.)
- Para detectar projetos abandonados ou sem atividade recente

## Quando NÃO Usar

- Para sincronizar código (use git)
- Para deploy de projetos (use devops)
- Para análise profunda de um projeto específico (use o INDEX.md do projeto)

## Discovery Questions

Perguntas antes de executar. Usar AskUserQuestion tool. Pular se o contexto já foi fornecido.

1. **Quer apenas visualizar o relatório ou exportar para algum destino?** — (define output: terminal, arquivo JSON/YAML, ou API)
2. **Há diretórios adicionais além dos padrões para escanear?** — (além de ~/CODE/) (opcional)
3. **Quer filtrar por status ou tipo de projeto?** — (ex: só ativos, só apps) (opcional)

---

## Diretórios Escaneados

| Diretório | Tipo | Descrição |
|-----------|------|-----------|
| `~/CODE/Projects/` | app | Aplicações grandes e independentes |
| `~/CODE/design-systems/` | design-system | Design systems |
| `~/CODE/frameworks/` | framework | Frameworks e bibliotecas |
| `~/CODE/tools/` | tool | Ferramentas externas |
| `~/aios-core/squads/` | squad | Squad expansions do AIOS |
| `~/aios-core/packages/` | package | Packages internos do AIOS |

### Adicionar diretórios customizados

Edite o array de diretórios no script ou passe via argumento:

```bash
# Via argumento
node scripts/generate-project-pulse.js --extra-dirs "~/CODE/clients,~/CODE/experiments"
```

---

## O que Coleta para Cada Projeto

| Dado | Fonte | Exemplo |
|------|-------|---------|
| **Nome** | Nome do diretório | `meu-app` |
| **Tipo** | Diretório pai | `app`, `design-system`, `tool` |
| **Stack** | `package.json`, `requirements.txt`, `go.mod`, etc. | `next, react, typescript` |
| **Último commit** | `git log -1 --format="%h %s (%cr)"` | `a1b2c3d feat: login (2 days ago)` |
| **Últimos 5 commits** | `git log -5 --format="%h %s"` | Lista resumida |
| **Branch ativa** | `git branch --show-current` | `main`, `feat/auth` |
| **Status** | `INDEX.md` (se existir) ou inferido por atividade | `active`, `paused`, `archived` |
| **Última atividade** | Data do commit mais recente | `2026-03-20` |

---

## Modos de Uso

### 1. Dry Run (apenas visualizar)

Gera o relatório no terminal sem salvar ou enviar nada.

```bash
node scripts/generate-project-pulse.js --dry-run
```

Output exemplo:
```
📊 Project Pulse — 2026-03-24
━━━━━━━━━━━━━━━━━━━━━━━━━━

[APP] meu-app (active)
  Stack: next, react, typescript
  Branch: feat/auth
  Último: a1b2c3d feat: login (2 days ago)

[TOOL] cli-helper (paused)
  Stack: node, commander
  Branch: main
  Último: f4e5d6c fix: typo (3 weeks ago)
  ⚠️ Sem atividade há 21 dias

━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 12 projetos | 8 ativos | 3 pausados | 1 archived
```

### 2. Export para arquivo

```bash
# JSON
node scripts/generate-project-pulse.js --output pulse.json --format json

# YAML
node scripts/generate-project-pulse.js --output pulse.yaml --format yaml

# Markdown (relatório legível)
node scripts/generate-project-pulse.js --output pulse.md --format md
```

### 3. Envio para API externa

Para integrar com bots, dashboards, ou qualquer sistema que aceite webhooks:

```bash
# Enviar para qualquer API
API_URL=http://seu-endpoint/api/projects/sync \
API_KEY=sua-chave \
node scripts/generate-project-pulse.js --send

# O script faz POST com:
# Headers: { "Content-Type": "application/json", "x-api-key": "$API_KEY" }
# Body: { "projects": [...], "timestamp": "...", "summary": {...} }
```

### 4. Via slash command

```
/sync-projects            # Escaneia e mostra no terminal
/sync-projects --dry-run  # Mesmo que acima
/sync-projects --send     # Escaneia e envia para API configurada
```

---

## Formato do Payload

```json
{
  "timestamp": "2026-03-24T10:30:00Z",
  "machine": "macbook-luiz",
  "summary": {
    "total": 12,
    "active": 8,
    "paused": 3,
    "archived": 1,
    "stale_warning": 2
  },
  "projects": [
    {
      "name": "meu-app",
      "type": "app",
      "path": "~/CODE/Projects/meu-app",
      "stack": ["next", "react", "typescript", "tailwind"],
      "branch": "feat/auth",
      "status": "active",
      "last_activity": "2026-03-22",
      "recent_commits": [
        { "hash": "a1b2c3d", "message": "feat: login page", "date": "2026-03-22" },
        { "hash": "e4f5g6h", "message": "fix: form validation", "date": "2026-03-21" }
      ]
    }
  ]
}
```

---

## Detecção de Status

O status de cada projeto é inferido automaticamente:

| Status | Critério |
|--------|----------|
| **active** | Commit nos últimos 7 dias OU INDEX.md diz "active" |
| **paused** | Último commit entre 7-30 dias e sem INDEX.md |
| **stale** | Último commit entre 30-90 dias (warning) |
| **archived** | Último commit > 90 dias OU INDEX.md diz "archived" |

### Alertas automáticos

- Projeto sem commit há mais de 14 dias → warning no relatório
- Projeto sem `package.json` / `go.mod` / etc. → stack "unknown"
- Projeto sem git inicializado → listado mas sem dados de atividade

---

## Detecção de Stack

| Arquivo encontrado | Stack inferida |
|-------------------|----------------|
| `package.json` | Lê `dependencies` para detectar frameworks |
| `requirements.txt` / `pyproject.toml` | Python + libs |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `*.csproj` | .NET / C# |
| `pubspec.yaml` | Flutter / Dart |
| `Gemfile` | Ruby |
| `*.uproject` | Unreal Engine |

Para `package.json`, detecta automaticamente:
- `next` → Next.js
- `react` → React
- `vue` → Vue
- `angular` → Angular
- `express` / `fastify` → Node.js backend
- `tailwindcss` → Tailwind
- `prisma` → Prisma ORM

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `API_URL` | Não (só para --send) | URL do endpoint de destino |
| `API_KEY` | Não (só para --send) | Chave de autenticação (header `x-api-key`) |
| `PULSE_EXTRA_DIRS` | Não | Diretórios adicionais para escanear (separados por `,`) |
| `PULSE_MAX_COMMITS` | Não | Número máximo de commits por projeto (default: 5) |

---

## Veto Conditions

| ID | Trigger | Ação |
|----|---------|------|
| VETO_NO_GIT | Projeto sem git inicializado | WARN — listar mas sem dados de commit |
| VETO_NO_API | `--send` sem API_URL configurada | HALT — avisar que precisa configurar |
| VETO_EMPTY | Nenhum projeto encontrado nos diretórios | HALT — verificar paths |

---

## Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| Nenhum projeto encontrado | Diretórios não existem | Verificar se `~/CODE/Projects/` etc. existem |
| Stack "unknown" | Sem `package.json` / `go.mod` etc. | Projeto não tem manifest — normal para scripts soltos |
| Erro no envio para API | URL incorreta ou API fora do ar | Testar com `curl -X POST $API_URL` antes |
| Projeto aparece como "archived" | Sem commits recentes | Fazer commit ou atualizar INDEX.md manualmente |

---

## Integração com Outros Sistemas

### Dashboard local

O output JSON pode alimentar qualquer dashboard:

```bash
# Gerar e servir como JSON estático
node scripts/generate-project-pulse.js --output ~/public/pulse.json --format json
```

### Cron job (automatização)

```bash
# Rodar toda segunda-feira às 9h
0 9 * * 1 cd ~/aios-core && node scripts/generate-project-pulse.js --output ~/pulse-$(date +\%Y\%m\%d).json --format json
```

### Integração com AIOS Memory

O relatório pode ser salvo no memory do projeto para manter contexto:

```bash
node scripts/generate-project-pulse.js --output ~/aios-core/docs/projects/pulse-latest.json --format json
```
