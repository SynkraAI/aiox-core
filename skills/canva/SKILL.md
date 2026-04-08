---
name: canva
description: "Integração oficial com Canva via MCP. É como ter acesso ao Canva direto do terminal."
  Crie, busque, preencha templates e exporte designs do Canva via MCP.
  OAuth oficial, suporta apresentações, posts sociais, logos e mais.
  Autofill de templates com assets da marca.
risk: safe
source: opensquad
paths:
  - "skills/canva/"
lazy_load: true
context_budget: 400
mcp:
  server_name: canva
  transport: http
  url: "https://mcp.canva.com/mcp"

version: 1.0.0
category: design
tags: [SKILL]
---

# Canva Connect

Integração oficial com Canva via MCP. É como ter acesso ao Canva direto do terminal.

## When to Use This Skill

- Criar designs visuais (apresentações, posts sociais, logos)
- Preencher templates do Canva com conteúdo gerado por agentes
- Buscar designs existentes na conta do usuário
- Exportar designs como PNG, PDF, JPG

## Do NOT Use This Skill When

- Precisa de controle pixel-perfect (use image-creator com HTML)
- Design precisa ser versionado em código (use HTML/CSS)
- Usuário não tem conta Canva

## Discovery Questions

Questions to ask before executing. Use AskUserQuestion tool. Skip if the user already provided this context.

1. **Que tipo de design precisa? (apresentação, post social, logo, documento)** — (determina template e dimensões corretas)
2. **Tem um template específico do Canva ou quer buscar um?** — (se já tem, pula busca; se não, filtra por categoria)
3. **Em qual formato quer exportar? (PNG, PDF, JPG)** — (PNG para social media, PDF para documentos, JPG para compressão)
4. **Tem elementos de marca (logo, cores, fontes) para incluir?** — (opcional) (autofill de brand assets requer plano pago)

## Prerequisites

- Conta Canva (free ou paid)
- OAuth autorizado no primeiro uso (popup no browser)
- Autofill de templates requer plano pago

## Workflow

1. Buscar template adequado ou criar design do zero
2. Preencher com conteúdo (texto, imagens, elementos de marca)
3. Exportar no formato necessário (PNG para social, PDF para docs)

## Best Practices

- Usar templates quando possível (mais rápido e on-brand)
- Ao preencher, combinar conteúdo com nomes dos placeholders do template
- Exportar no formato mais útil para o pipeline
- Respeitar limitações do plano (autofill requer paid)

## Available Operations

- **Create Design** — Novo design do zero ou a partir de template
- **Search Designs** — Buscar designs existentes na conta
- **Autofill Template** — Preencher placeholders com texto, imagens e elementos
- **Export Design** — Exportar como PDF, PNG, JPG
- **Browse Templates** — Buscar templates na biblioteca do Canva
