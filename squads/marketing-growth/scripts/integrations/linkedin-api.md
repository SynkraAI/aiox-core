# LinkedIn Marketing API - Integration Guide

**Status:** Desativado por padrao

## Pre-requisitos

1. LinkedIn Company Page (para empresa) ou perfil pessoal
2. LinkedIn Developer Account
3. App registrado em linkedin.com/developers
4. Produto "Share on LinkedIn" aprovado

## Setup

1. Criar App no LinkedIn Developers
2. Solicitar "Share on LinkedIn"
3. Obter OAuth 2.0 token
4. Configurar no config.yaml:

```yaml
platforms:
  linkedin:
    api_integration: true
```

## Endpoints Principais

- Post texto: POST /v2/ugcPosts
- Post com imagem: registerUpload + upload + ugcPosts
- Artigo: ugcPosts com shareMediaCategory ARTICLE

## Limitacoes

- Rate limit: 100 posts/day
- Token expira em 60 dias (refresh: 365)
- Carousel PDF: nao suportado via API
- Analytics requer "Marketing Developer Platform"

## Seguranca

- NUNCA commit tokens
- Usar variaveis de ambiente
- Implementar refresh token flow

Referencia: learn.microsoft.com/en-us/linkedin/
