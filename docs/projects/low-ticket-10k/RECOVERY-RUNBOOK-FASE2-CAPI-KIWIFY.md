# Recovery Runbook — Fase 2: CAPI Server-side via Kiwify Nativo

**Projeto:** Low Ticket 10k — Vorza/Metodo3C
**Data:** 27/Abr/2026
**Owner:** USER (UI-only, ZERO código)
**Tempo estimado:** 6-10 minutos
**Pré-requisitos:** Fase 1 concluída + acesso à conta Kiwify do produto `pay.kiwify.com.br/SnVHKmN`

---

## Decisão técnica (justificativa)

Avaliei 3 opções:

| Opção | Custo | Tempo setup | Manutenção | Confiabilidade |
|-------|-------|-------------|------------|----------------|
| A — Cloudflare Worker custom (webhook → CAPI) | $0-5/mo | 2-4h dev | Médio (rotacionar token, monitorar 4xx) | Alta se bem feito |
| B — Zapier/Make.com (webhook intermediário) | $20-30/mo | 30-60min | Baixo | Média (latência 30-60s, rate limits) |
| **C — Integração nativa Kiwify-Meta CAPI** | **$0** | **5-10 min** | **Zero (Kiwify atualiza)** | **Alta (oficial)** |

**Verdict: opção C.**

A Kiwify já tem **integração CAPI nativa** documentada em <https://ajuda.kiwify.com.br/pt-br/article/como-configurar-a-api-de-conversao-do-facebook-194ipi9/>. Cola o token gerado no Meta Pixel e a Kiwify dispara `Purchase` server-side automaticamente quando uma compra é aprovada (cartão ou PIX). Zero código, zero custo, zero infra extra. Eventos enviados:

- **InitiateCheckout** (server) — quando lead chega no checkout Kiwify
- **Purchase** (server) — quando pagamento é aprovado (cartão ou PIX)
- Boleto gerado dispara evento próprio (não-Purchase)

**Importante:** o Pixel client-side da LP continua disparando PageView (já validado). A CAPI Kiwify complementa com server-side InitiateCheckout + Purchase. Meta deduplica via `event_id` automaticamente — não há duplicação.

---

## Passo 1 — Gerar Access Token da Conversions API (3 min)

### 1.1 Abrir o pixel no Events Manager

1. Acesse https://business.facebook.com/events_manager2
2. Confirme BM **Vorza** no canto superior.
3. Selecione o pixel `26458851600417959`.

### 1.2 Gerar token

1. Aba **Configurações** (Settings) — menu superior do pixel.
2. Role até a seção **API de Conversões** (Conversions API).
3. Clique em **Gerar token de acesso** (Generate access token).
4. **Copie o token IMEDIATAMENTE** (em texto seguro, ex: senha do gerenciador, NÃO commitado em git, NÃO em memory). O token aparece **uma única vez** — se perder, precisa gerar novo.

**Padrão visual do token:** longa string `EAA...` (200+ chars).

### 1.3 Anote (efêmero, descartar depois de usar)

```
Pixel ID:        26458851600417959
Access Token:    EAA[...colar aqui temporariamente...]
Test Event Code: TEST53251 (ou outro — ver passo 3)
```

---

## Passo 2 — Configurar CAPI no produto Kiwify (3 min)

### 2.1 Abrir o produto

1. Acesse https://dashboard.kiwify.com.br
2. Menu lateral → **Produtos** → encontre o produto associado à URL `pay.kiwify.com.br/SnVHKmN` (provavelmente "Método 3C — Petições em 18 minutos" ou similar).
3. Clique para editar.

### 2.2 Localizar Pixels

1. Aba **Configurações** ou **Pixels** dentro do produto.
2. Encontre seção **Pixels do Facebook** ou **Pixel da Meta**.

### 2.3 Configurar pixel + CAPI

Pode haver 2 cenários:

**Cenário A — Pixel já configurado:**
- Aparece a entrada do pixel `26458851600417959` na lista.
- Clique no ícone de engrenagem/config ao lado.
- Cole o **Access Token** copiado no passo 1.2 no campo correspondente.
- Salve.

**Cenário B — Pixel não configurado:**
- Clique em **Adicionar Pixel** ou **+ Novo Pixel**.
- Cole o ID `26458851600417959`.
- Cole o Access Token gerado.
- Marque eventos: **Purchase** (obrigatório), **InitiateCheckout** (recomendado).
- Salve.

### 2.4 Confirmação

A Kiwify deve mostrar status **Ativo/Conectado** ao pixel. Se aparecer erro tipo "Token inválido" — gere outro token (passo 1.2) e tente de novo. Tokens podem ter caracteres especiais que copy/paste truncam — copie do botão "copiar" da Meta, não selecionando manualmente.

---

## Passo 3 — Validar com Test Events ANTES de despausar (2-3 min)

Este passo é **CRÍTICO**. É a única forma de saber se Kiwify→CAPI realmente está funcionando antes de queimar R$74/dia.

### 3.1 Abrir Test Events

1. Events Manager → pixel `26458851600417959` → aba **Testar Eventos** (Test Events).
2. Copie o **Test Event Code** mostrado no topo (formato `TESTxxxxx`).

### 3.2 Configurar Test Event Code temporariamente na Kiwify

(Esta parte depende da UI da Kiwify — pode estar:)
- No mesmo lugar do Access Token, há um campo **Código de Teste** ou **Test Event Code**.
- Cole o `TESTxxxxx` ali.
- Salve.

### 3.3 Fazer compra teste

**Não use a LP em produção pra teste** — pode poluir conversion data. Use cupom 100% off se a Kiwify permitir, ou:

**Plano A (gratuito):** Procure no produto Kiwify se há opção de criar **cupom de teste 100% off** (existe na maioria dos planos).

**Plano B (R$37):** Faça uma compra real com cartão. Após o teste, peça reembolso (Kiwify processa em ~7 dias). Marque pra reverter o evento `Purchase` registrado se ele atrapalhar learning phase.

**Plano C (mais limpo):** No Events Manager → aba Test Events, há opção **Enviar evento de teste manualmente** com payload custom — mas isso é redundante com o que queremos testar (a integração Kiwify funcionando).

→ **Recomendado: Plano A.**

### 3.4 Verificar evento no Test Events

- Logo após pagamento aprovado, o Events Manager → Test Events deve mostrar **Purchase** chegando.
- Confirme:
  - **Source:** Server (não Browser) → indica que veio via CAPI, não pixel
  - **Event:** Purchase
  - **Event Match Quality (EMQ):** ≥ 5/10 (idealmente 7+) — Kiwify envia hashed customer data
  - **Deduplicação:** se aparecer também um evento Browser para o mesmo Purchase, OK — Meta deduplica via `event_id`.

### 3.5 Remover Test Event Code (PRODUÇÃO)

**CRÍTICO:** após validação OK, **REMOVA** o Test Event Code da configuração Kiwify. Eventos com test_event_code **não são contados** para optimization — ficam só no Test Events panel. Se esquecer disso, todos os Purchases reais cairão no test events e os adsets nunca aprenderão.

---

## Passo 4 — Domain Verification (4 min — pode rodar em paralelo)

Mesmo com CAPI configurada, iOS 14.5+ exige **Domain Verification** para tracking funcionar plenamente em browsers Safari Mobile (que é boa parte da audiência B2C/Advocacia mobile).

### 4.1 Iniciar verificação

1. Business Settings → **Segurança da Marca** (Brand Safety) → **Domínios** (Domains).
2. Clique em **Adicionar** → digite `vorza-metodo3c.netlify.app`.
3. Salve.

### 4.2 Escolher método de verificação

A Meta oferece 3 métodos:

- **Meta-tag HTML** — adicionar `<meta name="facebook-domain-verification" content="..."/>` no `<head>` da LP.
- **Upload de arquivo HTML** — colocar arquivo `xxx.html` na raiz do domínio.
- **Registro DNS TXT** — adicionar TXT record na zona DNS do domínio.

**Recomendação:** Como a LP está hospedada no Netlify e o repo local está vazio (working tree drift), o caminho mais simples é **Meta-tag HTML** — exige editar o HTML da LP no Netlify (UI de drag-drop do site ou via deploy).

### 4.3 Adicionar meta-tag

A Meta vai gerar um valor único. Exemplo:

```html
<meta name="facebook-domain-verification" content="abc123def456ghi789xyz" />
```

**Onde colar:**

- Se a LP foi deployada via **Netlify Drop** (drag-drop): baixe o ZIP da LP, edite o `index.html` adicionando a tag dentro de `<head>`, faça novo deploy.
- Se for via **Git connect**: adicione na branch principal e o Netlify rebuilda.
- Se quiser **alternativa rápida**: use o método **TXT DNS record**. No Netlify → Domains → DNS records → adicionar TXT record com o valor fornecido pela Meta.

### 4.4 Confirmar verificação

- Após a alteração propagar (Netlify deploy ~1min, DNS ~5-30min), volte em Business Settings → Domains.
- Clique em **Verificar Domínio** ao lado de `vorza-metodo3c.netlify.app`.
- Status deve mudar para **Verificado** (verde).

---

## Confirmação para Orion (a fazer)

Quando concluir, envie ao Orion:

**OPÇÃO A — tudo OK:**
```
Fase 2 OK:
- Token CAPI gerado: SIM
- Token colado no produto Kiwify: SIM
- Test Events recebeu Purchase com source=Server e EMQ ≥ 5: SIM
- Test Event Code REMOVIDO da Kiwify (modo produção): SIM
- Domain vorza-metodo3c.netlify.app verificado no BM: SIM
```

**OPÇÃO B — bloqueado:**
```
Fase 2 BLOQUEADO no passo {N}: {descrição}
```

---

## Anti-checklist

- ❌ NÃO esqueça de remover o Test Event Code após validação. Esse é o erro mais comum.
- ❌ NÃO commite o Access Token CAPI em código/memory. Token grava no painel Kiwify e no BM, não em git.
- ❌ NÃO configure CAPI em outro produto que não seja o `SnVHKmN`. Configuração é por produto na Kiwify.
- ❌ NÃO ainda despause os ads. Fase 3 valida tudo unido antes da Fase 4.
