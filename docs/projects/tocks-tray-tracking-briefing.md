# Briefing Técnico — Tracking Google Ads na Loja Tray (Tocks)

**Para:** Dev externo responsável pela loja Tray `tockscustom.com.br`
**De:** Equipe Tocks (Breno)
**Data:** 2026-04-23
**Prazo sugerido:** 1 dia de desenvolvimento + 2 dias de validação
**Contato:** brenodecerqueira@gmail.com

---

## 1. Contexto executivo

Hoje a loja Tray do Tocks **não está rastreando corretamente nenhuma conversão do Google Ads**. Temos campanhas rodando e gastando, mas o Smart Bidding está cego porque:

1. O **gclid** (identificador de clique do Google Ads) **não é capturado** quando a pessoa chega no site por um anúncio.
2. Eventos-chave como **início de checkout** e **adição ao carrinho** não estão sendo enviados para o Google Ads / GTM.
3. **Pedidos pagos** na Tray não retornam pro Google Ads como "Compra" (offline conversion).

Sua missão é fechar essas três lacunas. Nós (Tocks) já temos o **backend pronto** que recebe os webhooks e faz o upload das conversões para o Google Ads. Você precisa apenas:

- Adicionar **1 script JavaScript** no tema da Tray (captura o gclid e passa pro nosso backend).
- Configurar **2 webhooks** no painel Tray (pedido-pago, carrinho-abandonado) apontando pros nossos endpoints.
- Ajustar o **GTM** (container `GTM-P4DNHJTK`) — 2 cenários detalhados abaixo.

Tudo documentado aqui, sem jargão interno. Se algo estiver confuso, me avisa por email.

---

## 2. Ação 1 — Captura do gclid (JavaScript no tema Tray)

### 2.1 O que precisa ser feito

Adicionar um `<script>` no `<head>` (ou final do `<body>`) do tema da loja Tray. Esse script:

1. Lê o parâmetro `gclid` da URL (quando a pessoa chega vinda de um anúncio).
2. Salva em um cookie chamado `tocks_gclid` (90 dias — janela de atribuição do Google Ads).
3. Faz um `POST` assíncrono para o nosso endpoint `/api/capture-gclid` enviando o gclid + email/telefone se já estiverem disponíveis (form logado, cookie salvo anteriormente etc.).

### 2.2 Código pronto para colar

Cole este bloco **exatamente** no tema Tray (recomendação: arquivo de header/template, para rodar em todas as páginas):

```html
<script>
(function () {
  'use strict';

  // URL do backend Tocks — este valor será fornecido pela equipe Tocks
  // antes do deploy. Deve ser um domínio HTTPS (ex.: https://tracking.tockscustom.com.br).
  var TOCKS_BACKEND = 'https://tracking.tockscustom.com.br';

  var COOKIE_NAME = 'tocks_gclid';
  var COOKIE_DAYS = 90;

  function getParam(name) {
    var m = window.location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + d.toUTCString() +
      '; path=/; SameSite=Lax; Secure';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function readClientEmailPhone() {
    // Prioridade 1: variáveis globais expostas pelo checkout Tray (se houver)
    var email = (window.Tray && window.Tray.customer && window.Tray.customer.email) || null;
    var phone = (window.Tray && window.Tray.customer && window.Tray.customer.phone) || null;

    // Prioridade 2: dataLayer (GTM)
    if (!email && window.dataLayer) {
      for (var i = 0; i < window.dataLayer.length; i++) {
        var e = window.dataLayer[i];
        if (e && e.user_data) {
          email = email || e.user_data.email;
          phone = phone || e.user_data.phone;
        }
      }
    }

    // Prioridade 3: inputs visíveis no DOM (form de cadastro/checkout)
    if (!email) {
      var emailInput = document.querySelector('input[type="email"], input[name="email"]');
      if (emailInput && emailInput.value) email = emailInput.value;
    }
    if (!phone) {
      var phoneInput = document.querySelector('input[name="phone"], input[name="telefone"], input[type="tel"]');
      if (phoneInput && phoneInput.value) phone = phoneInput.value;
    }

    return { email: email || null, phone: phone || null };
  }

  function sendToBackend(gclid) {
    try {
      var user = readClientEmailPhone();
      var payload = {
        gclid: gclid,
        email: user.email,
        phone: user.phone,
        session_id: (window.Tray && window.Tray.sessionId) || null,
        source_url: window.location.href
      };

      // Usa sendBeacon se disponível (não bloqueia navegação)
      if (navigator.sendBeacon) {
        var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(TOCKS_BACKEND + '/api/capture-gclid', blob);
      } else {
        fetch(TOCKS_BACKEND + '/api/capture-gclid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(function () { /* silent */ });
      }
    } catch (e) {
      // Falha silenciosa — tracking nunca pode quebrar o site
    }
  }

  // Fluxo principal
  var gclidFromUrl = getParam('gclid');
  var gclidFromCookie = getCookie(COOKIE_NAME);

  if (gclidFromUrl) {
    setCookie(COOKIE_NAME, gclidFromUrl, COOKIE_DAYS);
    // Envia com delay de 50ms para não atrasar o paint
    setTimeout(function () { sendToBackend(gclidFromUrl); }, 50);
  } else if (gclidFromCookie) {
    // Re-enviar em páginas críticas (checkout/thank-you) para amarrar email/phone
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf('checkout') >= 0 || path.indexOf('obrigado') >= 0 || path.indexOf('thank') >= 0) {
      setTimeout(function () { sendToBackend(gclidFromCookie); }, 200);
    }
  }
})();
</script>
```

### 2.3 Pontos importantes

- **HTTPS obrigatório.** O cookie tem flag `Secure`. A loja Tray já roda em HTTPS, então sem problema.
- **A URL `TOCKS_BACKEND`** será fornecida antes do deploy. Vai ser algo como `https://tracking.tockscustom.com.br`. Substitua no código antes de subir.
- **Nunca envia senha ou dado sensível** — só email/phone (que já são conhecidos do cliente logado) e o gclid (identificador opaco do Google).
- **Fail-safe:** tudo dentro de `try/catch`. Se o backend estiver offline, o site não quebra.
- Esse script precisa rodar em **todas as páginas** (home, categoria, produto, checkout). Nossa preferência é colocar no `<head>`.

---

## 3. Ação 2 — Eventos dataLayer customizados (GTM)

A Tray nativamente dispara alguns eventos GTM (ex.: `purchase`), mas **não dispara** `begin_checkout` nem linka email/phone. Precisamos disso para que o Google Ads enriqueça as conversões ("Enhanced Conversions").

### 3.1 Evento `begin_checkout`

Quando o cliente entrar na página `/checkout` (ou equivalente), disparar:

```html
<script>
(function () {
  if (window.location.pathname.indexOf('checkout') < 0) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'begin_checkout',
    ecommerce: {
      currency: 'BRL',
      value: (window.Tray && window.Tray.cart && window.Tray.cart.total) || 0,
      items: (window.Tray && window.Tray.cart && window.Tray.cart.items) || []
    }
  });
})();
</script>
```

### 3.2 Linkar email/phone no dataLayer

Na página de checkout e na thank-you page, adicionar:

```html
<script>
(function () {
  var customer = (window.Tray && window.Tray.customer) || null;
  if (!customer) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'user_data_ready',
    user_data: {
      email: customer.email || null,
      phone: customer.phone || null,
      first_name: customer.firstName || null,
      last_name: customer.lastName || null
    }
  });
})();
</script>
```

Esses dados chegam no GTM e são usados pelas tags de Enhanced Conversions (detalhe na Ação 4).

---

## 4. Ação 3 — Webhooks Tray apontando pros nossos endpoints

No **painel da Tray** (Admin → Apps → Webhooks ou equivalente), cadastrar **dois webhooks**:

### 4.1 Webhook 1: Pedido pago

- **Evento Tray:** `order-paid` (ou `pedido-pago`, conforme nomenclatura do painel)
- **URL destino:** `https://tracking.tockscustom.com.br/api/tray-webhook-purchase` (URL final será fornecida antes do deploy)
- **Método:** `POST`
- **Payload esperado pelo nosso backend (JSON):**

```json
{
  "order_id": "123456",
  "customer_email": "cliente@exemplo.com",
  "customer_phone": "+5547999991234",
  "total_value": 19900.00,
  "currency": "BRL",
  "paid_at": "2026-04-23T14:30:00Z",
  "items": [
    { "name": "Mesa Ouro Preto", "quantity": 1, "price": 19900.00 }
  ]
}
```

- **Campos obrigatórios:** `order_id`, `total_value`, e pelo menos um entre `customer_email`/`customer_phone`. Os demais são recomendados mas não bloqueantes.
- **Headers obrigatórios:**
  - `Content-Type: application/json`
  - `X-Webhook-Id: <id único por evento>` — se a Tray gerar, ótimo. Se não, nosso backend calcula hash do payload.
  - `X-Tray-Signature: sha256=<hmac>` — **opcional** (veja 4.3 sobre segurança).

### 4.2 Webhook 2: Carrinho abandonado

- **Evento Tray:** `cart-abandoned` (ou `carrinho-abandonado`)
- **URL destino:** `https://tracking.tockscustom.com.br/api/tray-webhook-lead`
- **Método:** `POST`
- **Payload esperado:**

```json
{
  "cart_id": "789",
  "customer_email": "cliente@exemplo.com",
  "customer_phone": "+5547999991234",
  "abandoned_at": "2026-04-23T14:45:00Z",
  "estimated_value": 19900.00
}
```

- `estimated_value` é **opcional**. Se ausente, nosso backend usa o default R$ 13.000 (ticket médio Tocks).

### 4.3 Segurança — HMAC **obrigatório** (fail-closed)

**Importante:** nosso backend de produção recusa webhooks não-assinados. Sem um segredo compartilhado, qualquer pessoa que descubra a URL pública pode injetar "pedidos pagos" falsos e contaminar o Smart Bidding do Google Ads. Por isso a validação HMAC é **não-negociável** em produção.

**Fluxo padrão (Tray suporta HMAC nativo):**

1. **Nós (Tocks) geramos o segredo.** Você recebe um valor de 32 bytes em hex (ex.: `openssl rand -hex 32`). Nunca gere o segredo do seu lado — quem controla o backend gera.
2. **Canal seguro para compartilhar o segredo:** Signal, WhatsApp, 1Password share, ou envelope lacrado. **Nunca email**, nunca commit em repositório.
3. **Você configura no painel Tray** esse segredo como "Webhook secret".
4. A Tray gera o header `X-Tray-Signature: sha256=<hex>` onde `<hex> = HMAC_SHA256(secret, rawBody)`.
5. Nosso backend valida e rejeita requests com assinatura inválida (HTTP 401).

**Fluxo alternativo (Tray NÃO suporta HMAC nativo):**

Se a Tray não tem campo "Webhook secret" no painel, use **secret-na-URL** — ainda é assinado, só que no query string:

- URL webhook pedido-pago: `https://tracking.tockscustom.com.br/api/tray-webhook-purchase?k=<SEGREDO_32B>`
- URL webhook carrinho-abandonado: `https://tracking.tockscustom.com.br/api/tray-webhook-lead?k=<SEGREDO_32B>`

O `<SEGREDO_32B>` é o mesmo hex de 32 bytes gerado pela Tocks. O backend valida que o query param `k` bate com o secret configurado.

**O que NUNCA é aceito:** webhook sem qualquer forma de autenticação. Se a Tray não suportar nem HMAC nem secret-na-URL, pause o setup e me avise — vamos resolver.

### 4.3.1 Quem gera o segredo?

**Tocks gera, não você.** Você recebe o valor pronto e apenas cola no painel Tray. Isso é intencional: o secret protege tanto você (evita phishing pra pedir segredo) quanto o backend (não dependemos de entropia do terminal do dev externo).

### 4.4 Retries da Tray

A Tray costuma re-entregar webhooks em falhas. Nosso backend é **idempotente** (usa `X-Webhook-Id` como chave única), então duplicatas são ignoradas automaticamente. Não é necessário desabilitar retries.

---

## 5. Ação 4 — Estratégia GTM (2 cenários)

O container atual é `GTM-P4DNHJTK` (já instalado no tema).

### 5.1 Cenário A: Você consegue admin do container existente

**Passos:**

1. Entrar em https://tagmanager.google.com/ com a conta que administra `GTM-P4DNHJTK`.
2. **Criar 2 tags novas** (Google Ads Conversion Tracking):
   - **Tag 1 — AddToCart:**
     - Trigger: custom event `add_to_cart` (já disparado pelo tema Tray nativo).
     - Conversion ID: `AW-17199097350`.
     - Conversion Label: **criar um novo no Google Ads** (Ferramentas & Configurações → Conversões → Nova conversão → E-commerce → Add to Cart). Depois voltar no GTM e colar o label.
   - **Tag 2 — BeginCheckout:**
     - Trigger: custom event `begin_checkout` (você criou na Ação 2.1).
     - Conversion ID: `AW-17199097350`.
     - Conversion Label: idem, **novo conversion action** no Google Ads chamado "Begin Checkout".
3. **Configurar Enhanced Conversions** nas duas tags novas:
   - Ativar "Include user-provided data in your conversions".
   - Fonte: "Custom Variables" → criar DLV (Data Layer Variable) para `user_data.email`, `user_data.phone`.
4. **Publicar a versão** do container com descrição clara: `feat: add_to_cart + begin_checkout + enhanced conversions`.

### 5.2 Cenário B: Você NÃO consegue admin do container atual

**Passos:**

1. Criar **novo container GTM** na sua conta Google (conta_Tocks@ ou similar).
2. Copiar o snippet do novo container e **substituir** o código GTM existente no tema Tray.
3. Replicar as tags essenciais que o container antigo tinha:
   - GA4 Configuration + Page View.
   - Meta Pixel Base (se aplicável).
   - Google Ads Remarketing (Conversion ID `AW-17199097350`, sem label — é remarketing tag).
4. Adicionar as 2 tags novas (Ação 5.1 passos 2-3).
5. Publicar container.
6. **Avisar a equipe Tocks** do ID do novo container — vamos documentar e arquivar o antigo.

### 5.3 Importante em ambos os cenários

- **Usar Google Tag Assistant** para validar antes de publicar. Acessar o site, clicar em produto, ir pro checkout, verificar que os eventos disparam.
- **Não remover** tags de concorrência/audience/remarketing existentes — só adicionar as novas.

---

## 6. Ação 5 — Remover tag antiga com label errado (após 48h de observação)

Existe uma tag antiga no GTM com label `TGd-CMr4h9caEN7ckoBA` que dispara evento de conversão mas está vinculada a um **conversion action inexistente ou desalinhado** no Google Ads.

**Quando fazer:**

Depois de **48 horas** das novas tags rodando em produção (GTM publicado + webhooks recebendo pedidos). Validar no Google Ads que as novas conversões estão chegando (Ferramentas → Conversões → ver contagem).

**Como fazer:**

1. GTM → Tags → localizar a tag com label `TGd-CMr4h9caEN7ckoBA`.
2. **Pausar** (não deletar). Clicar em "Pause" ou renomear adicionando prefixo `[PAUSED 2026-04-XX] `.
3. Publicar versão com comentário: `chore: pause legacy conversion tag TGd-CMr4h9caEN7ckoBA — replaced by new setup`.
4. Deixar pausada por 14 dias antes de deletar (segurança — caso precisemos reverter).

---

## 7. Testes de aceitação (como você valida que está funcionando)

### 7.1 Captura de gclid

1. Abrir **aba anônima** do navegador.
2. Acessar `https://tockscustom.com.br/?gclid=TESTE_GCLID_123`.
3. Abrir DevTools → **Network** → filtrar `capture-gclid`.
4. Deve aparecer 1 request `POST /api/capture-gclid` com status `202`.
5. Aba **Application → Cookies → tockscustom.com.br**: deve ter cookie `tocks_gclid=TESTE_GCLID_123`.

### 7.2 Webhook pedido-pago

1. Fazer um pedido de teste na loja (produto barato, cupom 100%, o que for mais fácil).
2. Pagar (ou marcar como pago manualmente no admin Tray).
3. Nos logs da Tray (Admin → Webhooks → Histórico), deve aparecer `POST ...tray-webhook-purchase` com status `202`.
4. Me avisar quando rodar esse teste que eu verifico do nosso lado se o gclid foi associado e o upload pro Google Ads deu certo.

### 7.3 Eventos GTM

1. Instalar extensão **Google Tag Assistant** no Chrome.
2. Navegar no site: home → produto → adicionar ao carrinho → ir pro checkout.
3. No Tag Assistant, confirmar que disparam: `Page View`, `View Item`, `Add to Cart`, `Begin Checkout`.
4. Nas duas últimas, conferir que "User Data" está populado com email/phone (quando logado).

### 7.4 Google Ads (validação final — 48h depois)

1. Entrar no Google Ads.
2. Ferramentas → Conversões.
3. As conversões "Add to Cart", "Begin Checkout", "Compras Loja Tray Tocks", "Lead Qualificado Tocks" devem mostrar contagens > 0 e "Status: Recording conversions".

---

## 8. Timeline sugerida

| Dia | Atividade | Responsável |
|-----|-----------|-------------|
| D0  | Você recebe este briefing + URL do backend | Tocks → Você |
| D0-D1 | Desenvolver Ação 1 (script gclid), Ação 2 (dataLayer events), Ação 4 (GTM tags) | Você |
| D1  | Configurar webhooks no painel Tray (Ação 3) | Você |
| D1  | Entregar para staging/produção | Você |
| D2-D3 | Validação (testes de aceitação 7.1-7.3) + monitoramento | Você + Tocks |
| D3+48h | Pausar tag antiga (Ação 5) | Você |

Se precisar de **mais tempo** (ex.: admin GTM demorar para ser liberado), me avisa — não é problema estender 1-2 dias.

---

## 9. Dúvidas e comunicação

- **Email direto:** brenodecerqueira@gmail.com — respondo em até 24h.
- **Dúvidas técnicas sobre o backend (formato de payload, erros HTTP, etc.):** me mande a mensagem com o `event_id` ou `order_id` que estou olhando, e eu checo do lado do backend em minutos.
- **Pontos bloqueantes urgentes:** marca como URGENTE no subject e me dá um screenshot do que está acontecendo.

---

## 10. Anexos — IDs que você vai precisar

| Item | Valor |
|------|-------|
| Google Ads Conversion ID | `AW-17199097350` |
| GTM Container atual | `GTM-P4DNHJTK` |
| Meta Pixel (Facebook) | `1382948639707224` |
| Domínio da loja | `tockscustom.com.br` |
| URL do backend Tocks | **(será fornecida)** — algo como `https://tracking.tockscustom.com.br` |
| Conversion Action "Compras Loja Tray Tocks" | já existe no Google Ads (ID interno: 7161904202) — você não precisa criar |
| Conversion Action "Lead Qualificado Tocks" | já existe (ID interno: 7550396040) — você não precisa criar |
| Conversion Action "Add to Cart" | **novo** — você cria no Google Ads Ação 5.1 |
| Conversion Action "Begin Checkout" | **novo** — você cria no Google Ads Ação 5.1 |

---

**Fim do briefing.** Obrigado pela colaboração. Qualquer dúvida, email.
