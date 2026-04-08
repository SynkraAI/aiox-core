---
name: blotato
description: "Publicação e agendamento multi-plataforma. É como ter um assistente que posta em todas as redes de uma vez."
  Publicação e agendamento multi-plataforma em redes sociais.
  Publica e agenda posts no Instagram, LinkedIn, Twitter/X, TikTok,
  YouTube e mais via MCP HTTP. Upload de mídia e monitoramento de status.
risk: safe
source: opensquad
paths:
  - "skills/blotato/"
lazy_load: true
context_budget: 400
env:
  - BLOTATO_API_KEY
mcp:
  server_name: blotato
  transport: http
  url: "https://mcp.blotato.com/mcp"
  headers:
    blotato-api-key: BLOTATO_API_KEY

version: 1.0.0
category: general
tags: [SKILL]
---

# Blotato Publisher

Publicação e agendamento multi-plataforma. É como ter um assistente que posta em todas as redes de uma vez.

## When to Use This Skill

- Publicar posts em múltiplas redes simultaneamente (IG, LinkedIn, X, TikTok, YouTube)
- Agendar posts para horários específicos
- Upload de mídia (imagens/vídeos) para posts
- Monitorar status de publicação

## Do NOT Use This Skill When

- Precisa apenas publicar carrosséis no Instagram (use instagram-publisher, mais controle)
- Precisa interagir com posts existentes (comentar, curtir)
- Precisa analytics detalhados (use as APIs nativas)

## Discovery Questions

Questions to ask before executing. Use AskUserQuestion tool. Skip if the user already provided this context.

1. **Em quais plataformas quer publicar?** — (determina quais contas conectadas usar e adapta formato do conteúdo)
2. **Quer publicar agora ou agendar para um horário específico?** — (define se usa publish imediato ou scheduling com datetime)
3. **Tem mídia pronta (imagens/vídeos) ou é post somente texto?** — (define se precisa do passo de upload antes da publicação)
4. **O conteúdo é o mesmo para todas as plataformas ou precisa de variações?** — (opcional) (LinkedIn aceita textos longos, X tem limite de caracteres, IG precisa de mídia)

## Prerequisites

- Conta Blotato ativa (blotato.com)
- API key configurada: Blotato Settings > API section
- MCP server configurado no projeto

## Setup

1. Criar conta em blotato.com
2. Conectar redes sociais no painel
3. Ir em Settings > API > copiar API key
4. Configurar env var `BLOTATO_API_KEY`

## Workflow

1. `blotato_list_accounts` — obter IDs das contas e plataformas conectadas
2. `blotato_upload_media` — upload de imagens/vídeos (se necessário)
3. `blotato_create_post` — publicar ou agendar o post
4. `blotato_get_post_status` — confirmar publicação

## Best Practices

- Sempre chamar `blotato_list_accounts` primeiro para IDs válidos
- Posts agendados: usar ISO 8601 para datetime (`2026-03-15T10:00:00-03:00`)
- Após postar, poll `blotato_get_post_status` até "published" ou "scheduled"
- Se status "failed", reportar detalhes do erro ao usuário

## Available Operations

- **List Accounts** — Contas conectadas e tipos de plataforma
- **Upload Media** — Upload de imagens e vídeos
- **Create Post** — Publicar ou agendar post em uma ou mais plataformas
- **Get Post Status** — Monitorar status (published, scheduled, failed)
