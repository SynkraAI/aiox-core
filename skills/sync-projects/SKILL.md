---
name: sync-projects
description: >-
  Sincroniza contexto de projetos locais com o Telegram Bot (VPS) via HTTP API.
  Escaneia projetos, coleta git log e stack, envia resumo para o bot classificar
  ideias com contexto rico no braindump.
risk: safe
source: self
---

# Sync Projects — Project Pulse

Escaneia projetos locais, coleta atividade recente do git, e envia para o Telegram Bot via `POST /api/projects/sync`.

## Quando Usar

- Após criar/modificar projetos significativos
- Quando quiser que o bot tenha contexto atualizado sobre seus projetos
- Periodicamente (recomendado: 1x por semana)

## Como Usar

### Via slash command (recomendado)

```
/sync-pulse            # Escaneia e envia
/sync-pulse --dry-run  # Apenas visualiza o que seria enviado
```

### Via CLI direto

```bash
# Dry run (sem enviar)
node scripts/generate-project-pulse.js --dry-run

# Enviar para o bot
BOT_API_URL=http://seu-ip:3000 SYNC_API_KEY=sua-chave node scripts/generate-project-pulse.js
```

## Env Vars Necessárias

| Var | Descrição |
|-----|-----------|
| `BOT_API_URL` | URL base do bot na VPS (ex: `http://ip:3000`) |
| `SYNC_API_KEY` | Chave de autenticação (deve ser igual no `.env` do bot) |

## O Que Escaneia

| Diretório | Tipo |
|-----------|------|
| `~/CODE/Projects/` | app |
| `~/CODE/design-systems/` | design-system |
| `~/CODE/frameworks/` | framework |
| `~/CODE/tools/` | tool |

Para cada projeto coleta: nome, tipo, stack (do package.json), últimos 5 commits (git log), status (do INDEX.md).

## Fluxo

```
Local: generate-project-pulse.js
  → Escaneia ~/CODE/
  → git log -5 para cada projeto
  → POST /api/projects/sync (com x-api-key)

Bot (VPS):
  → Salva em data/project-context.json
  → context-injector.ts lê e injeta no LLM
  → Ideias/braindump ganham contexto de projetos
```

## Notas

- Substitui o antigo mecanismo de Bridge Doc (Google Docs)
- O bot não precisa de restart — lê o arquivo a cada 5 min (cache do context-injector)
- O endpoint exige header `x-api-key` para autenticação
