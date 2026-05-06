# Instagram Graph API - Integration Guide

**Status:** Desativado por padrao

## Pre-requisitos

1. Conta Business ou Creator no Instagram
2. Facebook Page vinculada
3. Facebook Developer Account
4. App registrado no Facebook Developers

## Setup

1. Criar App em developers.facebook.com (tipo Business)
2. Adicionar produto "Instagram Graph API"
3. Obter token de acesso (Graph API Explorer)
4. Converter para token longa duracao (60 dias)
5. Obter Instagram Business Account ID
6. Configurar no config.yaml:

```yaml
platforms:
  instagram:
    api_integration: true
```

## Endpoints Principais

- Publicar imagem: POST /{ig-user-id}/media + /media_publish
- Publicar carousel: criar containers + carousel container + publish
- Obter metricas: GET /{media-id}/insights

## Limitacoes

- Rate limit: 200 calls/hour
- Imagens devem ser URLs publicas
- Reels: limitado via API
- Stories: nao suportado via API

## Seguranca

- NUNCA commit tokens no repositorio
- Usar variaveis de ambiente
- Renovar token a cada 60 dias

Referencia: developers.facebook.com/docs/instagram-api/
