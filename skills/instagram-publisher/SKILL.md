---
name: instagram-publisher
description: >
  Publishes Instagram carousel posts from local images.
  Uploads images to imgbb for temporary public hosting, creates Instagram
  media containers via the Graph API, and publishes the carousel.
  Supports 2-10 images per post and retrieves the real post permalink.
description_pt-BR: >
  Publica carrosséis do Instagram a partir de imagens locais.
  Faz upload das imagens para o imgbb como hospedagem pública temporária,
  cria containers de mídia via Graph API e publica o carrossel.
  Suporta de 2 a 10 imagens por post e obtém o permalink real.
description_es: >
  Publica carruseles de Instagram a partir de imágenes locales.
  Sube las imágenes a imgbb como hosting público temporal, crea
  contenedores de medios vía Graph API y publica el carrusel.
  Soporta de 2 a 10 imágenes por post y obtiene el permalink real.
type: script
version: "1.1.0"
script:
  path: scripts/publish.js
  runtime: node
  invoke: "node --env-file=.env {skill_path}/scripts/publish.js --images \"{images}\" --caption \"{caption}\""
env:
  - INSTAGRAM_ACCESS_TOKEN
  - INSTAGRAM_USER_ID
  - IMGBB_API_KEY
categories: [social-media, publishing, instagram]
paths:
  - "skills/instagram-publisher/"
lazy_load: true
context_budget: 1000

category: development
tags: [SKILL]
---

# Instagram Publisher

Publica carrosséis no Instagram direto do terminal. É como ter um social media manager que pega suas imagens, hospeda temporariamente, monta o carrossel e publica — tudo num comando só.

## When to Use This Skill

- Publicar carrosséis (2-10 imagens) no Instagram Business
- Automatizar publicação após geração de conteúdo (ex: após image-creator)
- Testar fluxo de publicação sem publicar de verdade (dry-run)
- Pipeline de conteúdo: squad gera → skill publica

## Do NOT Use This Skill When

- Quer publicar uma única imagem (não carrossel) → use a Graph API diretamente
- Quer publicar Reels/vídeos → use video-generator + API de Reels
- Quer agendar posts para o futuro → use ferramentas de scheduling (Meta Business Suite)
- Conta é pessoal (não Business) → converter para Business primeiro

## Discovery Questions

Perguntas para fazer antes de executar. Use AskUserQuestion tool. Pule se o usuário já forneceu esse contexto.

1. **Onde estão as imagens do carrossel? (caminho da pasta)** — (necessário para listar e ordenar os JPEGs)
2. **Qual a legenda (caption) do post?** — (máximo 2200 caracteres; pode vir de um draft de conteúdo)
3. **Quer rodar em modo teste primeiro? (--dry-run)** — (testa o fluxo completo sem publicar de verdade)

## Prerequisites

- Node.js 18+ instalado
- Conta Instagram Business conectada a uma Página do Facebook
- App criado em [developers.facebook.com](https://developers.facebook.com/) (tipo: **Empresa**)
- Três variáveis de ambiente configuradas (ver Setup abaixo)

## Core Workflow

1. **Listar JPEGs** — Buscar arquivos JPEG em `squads/{squad}/output/images/` ordenados por nome.
   Se nenhum arquivo encontrado: parar e pedir para o usuário adicionar imagens.
2. **Confirmar ordem** — Apresentar lista de imagens ao usuário com AskUserQuestion para confirmar a ordem.
3. **Extrair caption** — Usar texto do hook slide + CTA slide do draft de conteúdo.
   - Máximo 2200 caracteres (limite do Instagram)
   - Incluir hashtags relevantes (máximo 30)
4. **Executar publicação:**
   ```bash
   node --env-file=.env skills/instagram-publisher/scripts/publish.js \
     --images "slide-01.jpg,slide-02.jpg,slide-03.jpg" \
     --caption "Sua legenda aqui #hashtag"
   ```
   Adicionar `--dry-run` para testar sem publicar de verdade.
5. **Sucesso** — Salvar URL do post e post ID no arquivo de output.
6. **Falha** — Exibir o erro e perguntar ao usuário como proceder.

### Dry Run Mode

O modo `--dry-run` executa todo o fluxo (upload de imagens, criação de containers) mas **não publica** o carrossel final. Útil para:
- Validar que as imagens estão corretas
- Verificar que o token está funcionando
- Testar caption e formatação
- Confirmar que o fluxo completo funciona antes de publicar

```bash
node --env-file=.env skills/instagram-publisher/scripts/publish.js \
  --images "slide-01.jpg,slide-02.jpg" \
  --caption "Teste" \
  --dry-run
```

## Constraints

| Restrição | Valor | Notas |
|-----------|-------|-------|
| Imagens por carrossel | 2-10 | Mínimo 2, máximo 10 |
| Formato de imagem | JPEG only | PNG não é suportado pela API |
| Tamanho máximo por imagem | 8MB | Limite do imgbb gratuito |
| Caption | Max 2200 chars | Incluindo hashtags |
| Hashtags | Max 30 | Instagram ignora posts com > 30 |
| Tipo de conta | Business only | Não funciona com Personal ou Creator |
| Rate limit (API) | 25 posts/24h | Limite de publicação via API |
| Rate limit (Graph API) | 200 calls/hour | Limite geral de chamadas à API |

## Rate Limiting — Detalhes

A Graph API do Instagram tem dois níveis de rate limiting:

### Nível 1: Publicação (25/dia)

O Instagram permite no máximo **25 posts publicados via API** num período de 24 horas. Isso inclui:
- Posts de imagem única
- Carrosséis
- Reels

**Se exceder:** A API retorna erro `(#4) Application request limit reached`. Aguardar 24h desde a primeira publicação do período.

### Nível 2: Chamadas à API (200/hora)

Cada operação (upload, create container, publish, check status) conta como uma chamada. Um carrossel de 5 imagens consome ~12 chamadas:
- 5 uploads para imgbb
- 5 container creates
- 1 carousel create
- 1 publish

**Se exceder:** A API retorna erro `(#32) Spam limit reached`. Aguardar até o início da próxima hora.

### Boas Práticas de Rate Limiting

- Agrupar publicações: publicar múltiplos posts de uma vez em vez de espalhar ao longo do dia
- Usar `--dry-run` para testes (não consome cota de publicação, mas consome chamadas)
- Monitorar uso: `GET /me?fields=api_calls_quota` mostra chamadas restantes

## Setup (primeira vez)

Copie `.env.example` para `.env` e preencha as três variáveis:

```
IMGBB_API_KEY=
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_USER_ID=
```

### IMGBB_API_KEY

1. Acesse [https://api.imgbb.com/](https://api.imgbb.com/)
2. Clique em **"Get API Key"** e crie uma conta gratuita (sem cartão de crédito)
3. Após o login, sua chave aparece na própria página inicial
4. Copie e cole em `.env`

> O plano gratuito permite uploads ilimitados. Imagens expiram após o tempo configurado (padrão: sem expiração).

### INSTAGRAM_ACCESS_TOKEN

Pré-requisito: conta Instagram Business conectada a uma Página do Facebook, e um app criado em [developers.facebook.com](https://developers.facebook.com/) (tipo: **Empresa**).

**Para obter um token de longa duração (válido 60 dias):**

1. Acesse seu app → **Graph API Explorer**
2. No dropdown do topo, selecione seu app
3. Clique em **"Gerar token de acesso"**
4. Ative as permissões:
   - `instagram_content_publish`
   - `instagram_basic`
   - `pages_read_engagement`
5. Clique em **"Gerar token de acesso"** e autorize — você receberá um token de curta duração (1h)
6. Converta para longa duração (60 dias) com este GET:
   ```
   https://graph.facebook.com/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id={APP_ID}
     &client_secret={APP_SECRET}
     &fb_exchange_token={TOKEN_CURTO}
   ```
   _(APP_ID e APP_SECRET: seu app → Configurações → Básico)_
7. Copie o `access_token` da resposta e cole em `.env`

> O token expira em 60 dias. Repita o processo para renovar. Considere criar um lembrete no calendário.

### INSTAGRAM_USER_ID

1. No Graph API Explorer (com o token acima), faça GET em:
   ```
   /me/accounts
   ```
2. Localize sua **Página do Facebook** na resposta e anote o `id`
3. Faça GET em:
   ```
   /{page-id}?fields=instagram_business_account
   ```
4. Copie o `id` dentro de `instagram_business_account` — esse é o seu User ID

## Available Operations

| Operação | Descrição | Flag |
|----------|-----------|------|
| Publish Carousel | Upload de imagens + publicação do carrossel | (padrão) |
| Dry Run | Testa o fluxo completo sem publicar | `--dry-run` |
| Image Upload | Upload de imagens locais para imgbb | (interno, parte do fluxo) |
| Status Check | Monitorar processamento do container antes de publicar | (interno, automático) |

## Troubleshooting

### Erro: "OAuthException — Invalid access token"

**Causa:** Token expirado (válido por 60 dias) ou revogado.
**Solução:** Gerar novo token seguindo o processo em Setup → INSTAGRAM_ACCESS_TOKEN.

**Dica:** Após gerar o novo token, testar com:
```bash
curl "https://graph.facebook.com/v21.0/me?access_token=SEU_TOKEN"
```
Se retornar seu nome/ID, o token está válido.

### Erro: "(#4) Application request limit reached"

**Causa:** Excedeu o limite de 25 publicações em 24 horas.
**Solução:** Aguardar 24h desde a primeira publicação do período. Não há como aumentar esse limite.

### Erro: "(#9004) Image URL is not accessible"

**Causa:** O imgbb não conseguiu servir a imagem a tempo, ou a URL expirou.
**Solução:**
1. Verificar se o upload para imgbb retornou sucesso (HTTP 200)
2. Testar a URL retornada no navegador
3. Se persistir, re-executar — pode ser instabilidade temporária do imgbb

### Erro: "(#100) Param images must contain between 2 and 10 media IDs"

**Causa:** Enviando menos de 2 ou mais de 10 imagens.
**Solução:** Verificar a lista de imagens no parâmetro `--images`. Carrosséis exigem mínimo 2 e máximo 10.

### Erro: "(#32) Spam limit reached"

**Causa:** Excedeu o rate limit de chamadas à API (200/hora).
**Solução:** Aguardar até o início da próxima hora. Reduzir número de operações por hora.

### Imagens publicam fora de ordem

**Causa:** Nomes dos arquivos não seguem ordenação alfabética/numérica.
**Solução:** Nomear arquivos com prefixo numérico: `01-hook.jpg`, `02-conteudo.jpg`, `03-cta.jpg`. O script ordena por nome de arquivo.

### Container fica "IN_PROGRESS" indefinidamente

**Causa:** Instagram ainda está processando a imagem. Normalmente leva 5-30 segundos.
**Solução:** O script já tem retry automático com polling. Se exceder 2 minutos:
1. Verificar tamanho da imagem (deve ser < 8MB)
2. Verificar se a imagem não está corrompida
3. Tentar com uma imagem diferente para isolar o problema

### Token expira em 60 dias — como lembrar?

**Estratégias:**
1. Criar evento recorrente no Google Calendar (a cada 50 dias para ter margem)
2. Adicionar checklist no projeto: "Renovar Instagram token"
3. O próprio erro `Invalid access token` é o sinal de que expirou

## Key Files

| Arquivo | Função |
|---------|--------|
| `skills/instagram-publisher/SKILL.md` | Documentação e instruções desta skill |
| `skills/instagram-publisher/scripts/publish.js` | Script Node.js que executa todo o fluxo de publicação |
| `.env` | Variáveis de ambiente (NUNCA commitar) |
| `.env.example` | Template das variáveis necessárias |
