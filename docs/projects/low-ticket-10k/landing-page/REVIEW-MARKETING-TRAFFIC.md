# Review de Marketing & Trafego Pago — Landing Page Metodo 3C

**Data:** 2026-03-27
**Analista:** Traffic Masters Chief (Media Buy Chief)
**Framework:** @depesh-mandalia (BPM) + @nicholas-kusmich (Lead Gen Funnel)
**Especialista referencia:** @molly-pittman (Traffic Engine, Message Match)

---

## AD READINESS SCORE: 5/10

> A LP tem qualidade visual e copywriting acima da media, mas possui **bloqueadores criticos** que impedem o lancamento seguro de ads. Corrigir antes de gastar um centavo.

---

## 1. MESSAGE MATCH (Ads -> LP)

### 1.1 PRECO INCONGRUENTE — BLOQUEADOR CRITICO

| Elemento | Valor |
|----------|-------|
| LP (headline, CTAs, body, pixel) | **R$27** |
| Criativos Ads (headlines, body copy) | **R$37** |
| Pixel ViewContent value | **R$27.00** |

**Diagnostico:** Os 10 criativos em `criativos-ads.md` referenciam R$37 em multiplos pontos (headlines, body, comparacoes). A LP inteira usa R$27. O usuario que clicar no ad prometendo R$37 e chegar numa LP que cobra R$27 tera uma desconexao cognitiva — embora positiva neste caso (mais barato), causa desconfianca e confusao.

**Acao:** Decidir o preco final (R$27 ou R$37) e alinhar TODOS os assets:
- Se R$27: atualizar todos os criativos de ads
- Se R$37: atualizar toda a LP + pixel value
- **NUNCA** rodar ads com preco diferente da LP

### 1.2 Headline Match

| Criativo Ad | Headline Ad | Headline LP |
|-------------|-------------|-------------|
| #1 | "147 prompts de IA para advogados — R$37" | "147 Prompts Prontos que Transformam 3 Horas de Peticao em 18 Minutos" |
| #2 | "De 3 horas para 20 minutos. Por R$37." | OK — promessa compativel |
| #3 | "147 prompts de IA que mudaram meu escritorio" | OK — narrativa compativel |
| #4 | "Seu novo estagiario custa R$37 e trabalha 24h" | Preco divergente |
| #5 | "Em 2025, o advogado que nao usa IA..." | Ano desatualizado (estamos em 2026) |

**Diagnostico:** A promessa central (3h -> 18-20min) e consistente entre ads e LP. Porem:
- Preco divergente em 7 dos 10 criativos
- Criativo #5 referencia 2025 (desatualizado)
- A LP usa "18 minutos" no hero, ads variam entre 15-20 minutos (leve inconsistencia)

### 1.3 Preco Acima do Fold

O preco R$27 aparece no CTA do hero: "QUERO MEUS 147 PROMPTS POR R$27". Para low ticket, isso e **correto**. O preco baixo e o proprio gatilho de conversao — esconder seria contra-producente.

**Veredicto Message Match: 4/10** (incongruencia de preco e bloqueadora)

---

## 2. PIXEL & TRACKING

### 2.1 Configuracao Atual

```javascript
fbq('init', '26458851600417959');           // OK
fbq('track', 'PageView');                    // OK
fbq('track', 'ViewContent', {
  content_name: 'Metodo 3C',
  content_type: 'product',
  value: 27.00,                              // OK (se preco = R$27)
  currency: 'BRL'
});
```

### 2.2 Eventos FALTANTES — BLOQUEADOR

| Evento | Status | Onde Disparar |
|--------|--------|---------------|
| PageView | OK | LP load |
| ViewContent | OK | LP load (value: 27.00, BRL) |
| **InitiateCheckout** | **FALTANDO** | Clique no CTA (qualquer botao de compra) |
| **Purchase** | **FALTANDO** | Thank you page do Kiwify |
| **AddToCart** | Opcional | Pode ser usado como micro-conversao |

**Acao OBRIGATORIA antes de ads:**

1. **InitiateCheckout** — Adicionar em TODOS os 7 CTAs:
```javascript
// Em cada link de CTA, adicionar onclick:
fbq('track', 'InitiateCheckout', {
  content_name: 'Metodo 3C',
  value: 27.00,
  currency: 'BRL'
});
```

2. **Purchase** — Configurar no Kiwify:
   - Kiwify tem integracao nativa com Meta Pixel
   - Configurar pixel ID `26458851600417959` no painel Kiwify
   - O Kiwify dispara Purchase automaticamente na thank you page
   - **SEM ISSO, O META NAO CONSEGUE OTIMIZAR PARA COMPRA**

3. **Verificacao:** Instalar Meta Pixel Helper (extensao Chrome) e testar todos os eventos

### 2.3 Parametros UTM

Nenhum parametro UTM esta configurado nos links. Para rastrear performance por criativo:

```
?utm_source=meta&utm_medium=paid&utm_campaign=metodo3c_abo&utm_content=criativo01&utm_term=interesse_advocacia
```

**Acao:** Criar versoes dos links Kiwify com UTM para cada criativo/conjunto de anuncios.

**Veredicto Pixel: 4/10** (ViewContent OK, mas sem InitiateCheckout e Purchase = cego)

---

## 3. PERFORMANCE DA LP PARA ADS

### 3.1 Peso Total das Imagens

| Imagem | Tamanho | Carrega em |
|--------|---------|------------|
| vorza-product (hero, above fold) | 797 KB | Imediato |
| vorza-pain | 1.191 KB | lazy |
| vorza-solution | 900 KB | lazy |
| vorza-hero (CTA final) | 487 KB | lazy |
| vorza-pattern (background) | 361 KB | Imediato (hero bg) |
| vorza-guarantee | 332 KB | lazy |
| **TOTAL** | **4.07 MB** | — |
| **Above fold (imediato)** | **~1.16 MB** | Critico |

### 3.2 Impacto no CPC e Bounce Rate

| Metrica | Estimativa | Alvo |
|---------|------------|------|
| Tempo de carregamento (3G mobile) | ~6-8s | < 3s |
| Tempo de carregamento (4G mobile) | ~3-4s | < 2s |
| Bounce rate estimado (mobile 3G) | 45-55% | < 30% |
| Impacto CPC | +15-25% vs LP otimizada | — |

**Problemas identificados:**
1. **Imagens PNG sem compressao** — deviam ser WebP com fallback
2. **vorza-product (797KB)** carrega acima do fold sem lazy loading
3. **vorza-pattern (361KB)** como background do hero = carrega imediato
4. **Font preconnect OK** (Google Fonts Inter) mas sem `font-display: swap` no CSS
5. **CSS inline ausente** — o styles.css (40KB) bloqueia a renderizacao
6. **JS no final** — bom, nao bloqueia

### 3.3 Otimizacoes de Performance

| Prioridade | Acao | Impacto |
|------------|------|---------|
| P0 | Converter todas as imagens para WebP | -60-70% tamanho |
| P0 | Comprimir vorza-product para < 150KB | Above fold mais rapido |
| P1 | Inline critical CSS (acima do fold) | First paint mais rapido |
| P1 | Adicionar `loading="lazy"` no vorza-pattern | Menos dados iniciais |
| P2 | Usar CDN (Cloudflare Pages, Vercel) | TTFB < 100ms global |
| P2 | Adicionar `font-display: swap` | Texto visivel mais rapido |

### 3.4 Mobile Score Estimado

| Aspecto | Score | Notas |
|---------|-------|-------|
| Viewport meta | OK | `width=device-width, initial-scale=1.0` |
| Mobile-first CSS | OK | Breakpoints 768px e 1024px |
| Touch targets | OK | Botoes com padding generoso (20-24px) |
| Font sizes | OK | 17px base, headline 36px mobile |
| Sticky CTA mobile | OK | Aparece apos scroll 600px, oculta desktop |
| Hero min-height | ATENCAO | `min-height: 100vh` pode causar scroll longo em mobile |
| Imagem pain oculta mobile | VERIFICAR | `.pain__image-col` pode estar `display:none` em mobile |

**Veredicto Performance: 5/10** (funcional, mas imagens pesadas vao matar o CPC)

---

## 4. CRO PARA TRAFEGO PAGO

### 4.1 CTAs

| # | Localizacao | Texto | Tipo |
|---|-------------|-------|------|
| 1 | Hero | "QUERO MEUS 147 PROMPTS POR R$27" | btn--primary btn--xl |
| 2 | Metodo 3C (secao 3) | "ACESSAR O METODO 3C POR R$27" | btn--primary |
| 3 | Stack de Valor (secao 4) | "SIM, QUERO OS 147 PROMPTS POR R$27" | btn--white btn--xl |
| 4 | Prova Social (secao 6) | "QUERO MEUS 147 PROMPTS POR R$27" | btn--primary |
| 5 | Dicotomia (secao 7) | "SIM, QUERO OS 147 PROMPTS POR APENAS R$27" | btn--primary btn--xl |
| 6 | CTA Final (secao 10) | "QUERO OS 147 PROMPTS POR R$27 — ACESSO IMEDIATO" | btn--white btn--xl |
| 7 | Sticky CTA (mobile) | "QUERO MEUS 147 PROMPTS - R$27" | sticky bottom bar |

**7 CTAs total — excelente para long-form LP.** Distribuicao bem espacada.

### 4.2 Sticky CTA Mobile

- **Existe:** Sim, barra fixa no bottom
- **Ativacao:** Apos scroll 600px (bom)
- **Oculta no desktop:** Sim (correto, via media query 1024px)
- **Funcional:** O link aponta para `#LINK_KIWIFY_CHECKOUT` (placeholder!)

**BLOQUEADOR:** Todos os 7 CTAs apontam para `#LINK_KIWIFY_CHECKOUT` — um placeholder. Nenhum link real de checkout existe.

### 4.3 Urgencia / Escassez

| Elemento | Presente | Recomendacao |
|----------|----------|--------------|
| Countdown timer | NAO | Para low ticket, timer de oferta ajuda (+10-15% conversao) |
| "Vagas limitadas" | NAO | Nao recomendado para produto digital (falta credibilidade) |
| Preco de lancamento | NAO | "Preco de lancamento R$27 (volta para R$47)" — valido |
| Social proof dinamico | SIM | "2.847+ advogados" (bom, mas verificar se e real) |
| FOMO natural | SIM | Copy sobre concorrentes usando IA — bom |

**Recomendacao:** Adicionar um banner sutil de "Preco de lancamento" acima do preco. NAO usar countdown fake para publico de advogados (sao ceticos por profissao).

### 4.4 Exit Intent

- **Presente:** NAO
- **Recomendacao:** Para low ticket R$27, exit intent popup com desconto extra (R$19.90?) ou email capture pode recuperar 5-8% dos abandonos. Porem, para primeira versao da LP, nao e bloqueador. Implementar na fase de otimizacao.

### 4.5 Elementos de Confianca

| Elemento | Status |
|----------|--------|
| Garantia 7 dias | OK (secao dedicada) |
| Selo de pagamento seguro | OK (trust badges) |
| Formas de pagamento | OK (Visa/Master/Elo/PIX) |
| Depoimentos | OK (4 depoimentos) |
| Dados estatisticos | OK (Thomson Reuters, ABA, OAB) |
| Provimento OAB 213/2025 | OK (valida uso etico de IA) |
| Email de suporte | OK (suporte@vorza.com.br) |
| Politica de privacidade | PLACEHOLDER (link `#`) |
| Termos de uso | PLACEHOLDER (link `#`) |

**Veredicto CRO: 7/10** (bem estruturada, mas links placeholder sao bloqueadores)

---

## 5. ESTRUTURA DE FUNIL

### 5.1 Fluxo Atual

```
Meta Ad -> LP (index.html) -> ??? (link placeholder) -> ???
```

### 5.2 Fluxo Necessario

```
Meta Ad
  -> LP (ViewContent + PageView)
    -> Clique CTA (InitiateCheckout)
      -> Checkout Kiwify (AddPaymentInfo)
        -> Purchase (Purchase event)
          -> Thank You Page Kiwify (order bump R$27)
            -> Email sequence (automacao Kiwify)
```

### 5.3 Itens Faltantes no Funil

| Item | Status | Prioridade |
|------|--------|------------|
| Link real de checkout Kiwify | **FALTANDO** | P0 BLOQUEADOR |
| Pixel no Kiwify (Purchase event) | **FALTANDO** | P0 BLOQUEADOR |
| Order bump configurado no Kiwify | **FALTANDO** | P1 |
| Thank you page personalizada | **FALTANDO** | P1 |
| Sequencia de email pos-compra | **FALTANDO** | P2 |
| Pagina de politica de privacidade | **FALTANDO** | P1 (Meta exige) |
| Pagina de termos de uso | **FALTANDO** | P1 (Meta exige) |

### 5.4 Order Bump

O briefing menciona order bump de R$27. O Kiwify suporta nativamente order bump no checkout. Deve ser configurado ANTES de lancar ads para maximizar o AOV (Average Order Value) desde o dia 1.

**Veredicto Funil: 3/10** (so tem a LP, falta todo o resto)

---

## 6. OTIMIZACOES PARA META ADS

### 6.1 Prontidao para ABO

A estrategia de ads mencionada e ABO 1-4-2 (1 campanha, 4 conjuntos, 2 criativos por conjunto).

| Requisito ABO | Status |
|---------------|--------|
| LP funcional com checkout | **NAO** |
| Pixel com Purchase event | **NAO** |
| Criativos prontos | **SIM** (10 criativos) |
| Publicos definidos | **SIM** (no doc de criativos) |
| Budget definido | **SIM** (R$30-50/dia por criativo) |
| UTMs configurados | **NAO** |

### 6.2 Congruencia Publicos Frios vs Quentes

| Publico | Criativos Recomendados | LP Section Focus |
|---------|------------------------|------------------|
| Frio (interesses) | #1, #2, #5 (dados, logica, preco) | Hero + Dor + Metodo |
| Morno (remarketing 7d) | #6, #7, #8 (stories, prova social) | Stack + Garantia + CTA |
| Quente (remarketing 3d) | #9, #10 (urgencia, FOMO) | Dicotomia + CTA final |

A LP atual tem uma jornada linear completa que funciona para todos os segmentos. Nao e necessario criar multiplas LPs para a V1.

### 6.3 Estrutura de Campanha Recomendada (corrigida)

O doc de criativos sugere CBO. Para low ticket com budget < R$200/dia, ABO e mais recomendado:

```
Campanha ABO: Metodo 3C — Advogados
├── Conjunto 1: Interesses Advocacia (R$30/dia)
│   ├── Criativo 1 (Cronometro)
│   └── Criativo 2 (Matematica)
├── Conjunto 2: Interesses Direito/OAB (R$30/dia)
│   ├── Criativo 3 (Carta Aberta)
│   └── Criativo 5 (Advogado do Futuro) — ATUALIZAR para 2026
├── Conjunto 3: Stories/Reels (R$30/dia)
│   ├── Criativo 6 (15 Minutos)
│   └── Criativo 10 (FOMO)
└── Conjunto 4: Broad (sem interesses, 25-55, Brasil) (R$30/dia)
    ├── Criativo 1
    └── Criativo 4 (Estagiario)

Budget total: R$120/dia = R$3.600/mes
```

**Remarketing (separado, apos 500+ visitas):**
```
Campanha ABO: Metodo 3C — Remarketing
├── Conjunto 1: Visitou LP 7d (R$15/dia)
│   └── Criativo 7 (Antes vs Depois) + Criativo 8 (Prova Social)
└── Conjunto 2: Iniciou Checkout 3d (R$15/dia)
    └── Criativo 9 (Pergunta Provocativa)
```

### 6.4 Metricas Alvo

| Metrica | Alvo | Kill Line |
|---------|------|-----------|
| CPA (Custo por Purchase) | < R$15 | > R$25 |
| CTR (link click) | > 1.5% | < 0.8% |
| CPC (link click) | < R$1.50 | > R$3.00 |
| ROAS (sem order bump) | > 1.8x | < 1.0x |
| ROAS (com order bump 30%) | > 2.5x | < 1.5x |
| Conversao LP | > 5% | < 2% |

---

## BLOQUEADORES (impedem lancamento de ads)

### CRITICOS (P0 — corrigir ANTES de gastar qualquer centavo)

1. **Links de checkout placeholder** — Todos os 7 CTAs apontam para `#LINK_KIWIFY_CHECKOUT`. Substituir pelo link real do produto no Kiwify.

2. **Preco incongruente Ads vs LP** — Criativos dizem R$37, LP diz R$27. Decidir e alinhar.

3. **Pixel Purchase ausente** — Sem evento de Purchase configurado no Kiwify, o Meta nao consegue otimizar para compra. Campanha vai gastar budget sem aprender.

4. **Evento InitiateCheckout ausente** — Sem micro-conversao, nao ha como medir drop-off entre LP e checkout.

5. **Paginas legais inexistentes** — Meta pode reprovar anuncios sem Politica de Privacidade e Termos de Uso acessiveis.

### ALTOS (P1 — corrigir antes do lancamento ou na primeira semana)

6. **Imagens sem compressao** — 4MB+ total, hero acima do fold ~1.2MB. Converter para WebP e comprimir.

7. **Order bump nao configurado no Kiwify** — Sem order bump, o AOV fica em R$27. Com order bump, pode subir para R$35-40 (assumindo 30% take rate), melhorando o ROAS significativamente.

8. **UTMs nao configurados** — Impossivel rastrear qual criativo/conjunto gera mais vendas.

9. **Criativo #5 desatualizado** — Referencia 2025, estamos em 2026.

### MEDIOS (P2 — otimizar nas primeiras 2 semanas)

10. **Email de boas-vindas pos-compra** — Sem sequencia de email, perde oportunidade de upsell e reativacao.

11. **Exit intent popup** — Para recuperacao de abandonos.

12. **CDN/hosting otimizado** — Se a LP estiver em hosting lento, o CPC sobe.

13. **Social proof "2.847 advogados"** — Se o produto e novo, esse numero precisa ser verdadeiro. Meta pode reprovar por "misleading claims".

---

## CHECKLIST PRE-LANCAMENTO DE ADS

### Infraestrutura (fazer AGORA)
- [ ] Criar produto no Kiwify com preco definitivo (R$27 ou R$37)
- [ ] Configurar order bump no Kiwify (R$27)
- [ ] Obter link de checkout real do Kiwify
- [ ] Substituir `#LINK_KIWIFY_CHECKOUT` pelo link real em TODOS os 7 CTAs
- [ ] Configurar pixel Meta no Kiwify (ID: 26458851600417959)
- [ ] Verificar se Kiwify dispara Purchase event corretamente

### Pixel & Tracking
- [ ] Adicionar InitiateCheckout nos cliques dos CTAs (onclick ou event listener)
- [ ] Instalar Meta Pixel Helper e testar: PageView, ViewContent, InitiateCheckout
- [ ] Verificar Purchase event na thank you page do Kiwify (compra teste)
- [ ] Configurar UTMs nos links de checkout

### Conteudo & Legal
- [ ] Decidir preco final e alinhar ads + LP + Kiwify
- [ ] Criar pagina de Politica de Privacidade (pode ser pagina simples no Kiwify)
- [ ] Criar pagina de Termos de Uso
- [ ] Atualizar Criativo #5 de "2025" para "2026"
- [ ] Verificar se numero "2.847 advogados" e defensavel

### Performance
- [ ] Converter imagens para WebP (alvo: < 150KB cada)
- [ ] Hospedar LP em CDN (Cloudflare Pages, Vercel, Netlify — gratis)
- [ ] Testar carregamento em 3G (PageSpeed Insights / GTmetrix)
- [ ] Testar em 3 dispositivos mobile reais

### Meta Ads
- [ ] Criar conta de anuncios (se nao existe)
- [ ] Verificar dominio no Business Manager
- [ ] Configurar eventos prioritarios (Purchase > InitiateCheckout > ViewContent)
- [ ] Criar publicos customizados (interesses, remarketing)
- [ ] Subir criativos (minimo 4 para fase de teste)
- [ ] Configurar campanha ABO com R$120/dia
- [ ] Ativar regras automaticas: pausar ad se CPA > R$25 apos 1000 impressoes

### Pos-Lancamento (primeiras 72h)
- [ ] Monitorar CPA a cada 12h
- [ ] Verificar se eventos estao disparando corretamente
- [ ] Analisar CTR por criativo (matar < 0.8% apos 1000 impressoes)
- [ ] Verificar taxa de conversao da LP (se < 2%, problema na LP)
- [ ] Verificar take rate do order bump

---

## CONFIGURACAO DE PIXEL RECOMENDADA

### Na LP (index.html)

```html
<!-- HEAD: Pixel Base -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', '26458851600417959');
  fbq('track', 'PageView');
  fbq('track', 'ViewContent', {
    content_name: 'Metodo 3C',
    content_type: 'product',
    content_ids: ['metodo-3c-147-prompts'],
    value: 27.00,
    currency: 'BRL'
  });
</script>
```

### Nos CTAs (adicionar a cada link de compra)

```html
<a href="https://kiwify.com.br/LINK_REAL"
   onclick="fbq('track', 'InitiateCheckout', {
     content_name: 'Metodo 3C',
     content_ids: ['metodo-3c-147-prompts'],
     value: 27.00,
     currency: 'BRL',
     num_items: 1
   });"
   class="btn btn--primary">
  QUERO MEUS 147 PROMPTS POR R$27
</a>
```

### No Kiwify (painel do produto)

1. Integracoes > Meta Pixel
2. Pixel ID: `26458851600417959`
3. Eventos: Purchase (automatico), AddPaymentInfo (automatico)
4. Valor: preencher automaticamente com valor da compra
5. Moeda: BRL

### Eventos Priorizados no Business Manager

Configurar em Events Manager > Aggregated Event Measurement:

| Prioridade | Evento | Janela |
|------------|--------|--------|
| 1 | Purchase | 7-day click |
| 2 | InitiateCheckout | 7-day click |
| 3 | ViewContent | 1-day click |
| 4 | PageView | 1-day click |

---

## RESUMO EXECUTIVO

A LP tem copy profissional, estrutura persuasiva solida (dor -> mecanismo -> prova -> oferta -> garantia -> CTA) e design acima da media para low ticket brasileiro. Porem, esta em estado de **prototipo** — nao de **producao**.

**O que falta para ficar pronta:**

1. Conectar ao Kiwify (links reais)
2. Alinhar preco entre ads e LP
3. Completar setup de pixel (InitiateCheckout + Purchase no Kiwify)
4. Comprimir imagens para WebP
5. Criar paginas legais (privacidade + termos)
6. Hospedar em CDN

**Estimativa de tempo para correcao:** 2-4 horas de trabalho focado.

**Apos correcoes, o Ad Readiness Score sobe para 8-9/10.**

---

*Review gerado por Traffic Masters Chief | Framework BPM + Traffic Engine*
*Metricas alvo: CPA < R$15 | ROAS > 1.8x | Conversao LP > 5%*
