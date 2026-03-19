# create-offer-broadcast

## Metadata
```yaml
task_id: AFF_MKT_004
agent: marketplace-ops
type: creation
complexity: medium
estimated_time: "1h-2h"
source: "Jay Abraham — Offer Architecture (adapted for multi-channel marketplace broadcast)"
```

## Purpose
Operar o sistema diário de curadoria, formatação e distribuição de ofertas de marketplace para múltiplos canais (Telegram, WhatsApp, site), garantindo consistência de qualidade e rastreabilidade de cada oferta publicada.

## Prerequisites
- Canais de distribuição configurados: Telegram (AFF_BR_006), WhatsApp (AFF_BR_005), site/blog ativo
- Links de afiliado gerados para os marketplaces ativos (AFF_MKT_001, 002, 003)
- Ferramentas de encurtamento rastreável configuradas (Bitly Pro ou similar)
- Template de oferta por canal definido
- Planilha de tracking de ofertas criada

## Steps

1. **Curadoria diária de ofertas** — Selecionar as melhores ofertas dos marketplaces ativos.
   - Verificar Amazon BR → Ofertas do Dia + Mais Vendidos do nicho
   - Verificar Shopee → Promoções Flash + Produtos em destaque do nicho
   - Verificar Mercado Livre → Produtos com desconto + Cupons disponíveis
   - Critérios de seleção: desconto real >= 15%, avaliação >= 4.0, estoque disponível, frete incluso ou grátis
   - Selecionar máximo 3-5 ofertas por dia (qualidade > quantidade)

2. **Validar ofertas antes de formatar** — Checar antes de criar o conteúdo.
   - Verificar que o link do produto ainda está ativo (produto não esgotado)
   - Confirmar preço listado na plataforma (preços podem mudar entre seleção e publicação)
   - Checar se o link de afiliado está correto e inclui ID de rastreamento
   - Validar prazo da oferta: promoções relâmpago têm horário de expiração

3. **Formatar oferta por canal** — Adaptar cada oferta para o formato do canal de destino.
   - **Telegram:** formatação Markdown completa, emoji, link rastreável, prazo visível
   - **WhatsApp:** versão mais curta e conversacional, sem Markdown completo, link encurtado
   - **Site/blog:** HTML completo com imagem do produto, tabela de specs, CTA, divulgação de afiliado
   - Usar template padronizado por canal (reduz tempo de formatação para < 5 min/oferta)

4. **Gerar e registrar links rastreáveis** — Criar links únicos por oferta e por canal.
   - Criar link de afiliado na plataforma com parâmetro de sub-tracking (se disponível)
   - Encurtar via Bitly: criar link com título descritivo para fácil identificação
   - Nomenclatura: `{marketplace}-{produto-slug}-{canal}-{data}` (ex: `amz-aspirador-tg-20260218`)
   - Registrar todos os links gerados na planilha de tracking com data e canal

5. **Publicar no Telegram** — Distribuir oferta no canal com formatação correta.
   - Copiar template formatado para o canal
   - Verificar preview antes de enviar (links ativos, formatação correta)
   - Publicar no horário agendado (preferência: 08h ou 19h)
   - Ativar notificação de silêncio quando pertinente (ofertas em horário atípico)

6. **Publicar no WhatsApp** — Enviar broadcast para lista(s) relevante(s).
   - Selecionar segmento(s) da lista mais adequados para o produto
   - Copiar versão WhatsApp do template
   - Enviar para lista correta no WhatsApp Business (ou via API)
   - Registrar envio na planilha: lista, horário, link usado

7. **Publicar no site/blog (quando aplicável)** — Para ofertas premium ou de destaque.
   - Criar post rápido de review de oferta (800-1000 palavras)
   - Incluir imagem do produto (da URL pública da plataforma ou criativo próprio)
   - Adicionar divulgação de afiliado no início do post (obrigatório)
   - Publicar e compartilhar URL do post nos demais canais

8. **Registrar e monitorar performance** — Acompanhar métricas de cada oferta publicada.
   - Registrar na planilha: data, produto, marketplace, canal, link Bitly, clicks 24h, clicks 7d
   - Identificar padrões: quais categorias têm mais cliques? Qual horário converte mais?
   - Pausar ofertas esgotadas: monitorar links e atualizar posts com "oferta encerrada"
   - Usar dados para calibrar curadoria futura

## Framework

### Critérios de Curadoria de Oferta (Score Rápido)

```
PUBLICAR >= 3/4 critérios:
  ✅ Desconto real >= 15% (vs preço histórico, não inflado)
  ✅ Avaliação do produto >= 4.0 com >= 50 avaliações
  ✅ Estoque disponível (não "últimas unidades" genérico)
  ✅ Frete grátis, incluso ou Prime/Full elegível

REJEITAR se qualquer dos seguintes:
  ❌ Produto esgotado ou indisponível
  ❌ "Desconto" que é inflação de preço-base (verificar histórico)
  ❌ Vendedor com reputação negativa ou nova (<6 meses)
  ❌ Sem link de afiliado rastreável disponível
```

### Templates de Oferta por Canal

**Telegram:**
```
🔥 **OFERTA DO DIA — [Marketplace]**

**[Nome do Produto]**
[1-2 linhas sobre o produto e por que é bom]

~~R$[preço original]~~ → **R$[preço com desconto]** ([% de desconto])
[opções de parcelamento se relevante]
[✅ Frete Grátis] / [🚚 Frete: R$X]
⏰ Válido até [data/hora]

👉 [link encurtado rastreável]

📌 [Nome do canal] — t.me/[username]
```

**WhatsApp:**
```
Oi! Oferta boa demais pra não compartilhar 👇

[Emoji do produto] [Nome do produto]
De R$[preço original] por R$[preço com desconto] ([%])
[Frete grátis sim/não]

⏰ Só até [data/hora]

[link encurtado]

Para sair desta lista: SAIR
```

**Site (HTML simplificado):**
```html
<div class="offer-box">
  <img src="[URL imagem produto]" alt="[Nome produto]">
  <h2>[Nome do Produto] — [% Desconto]</h2>
  <p>[Descrição 2-3 parágrafos]</p>
  <del>R$[preço original]</del>
  <strong>R$[preço com desconto]</strong>
  <a href="[link afiliado]" class="cta-btn">Ver oferta no [Marketplace]</a>
  <small>Oferta válida até [data]. Preços sujeitos a alteração.</small>
  <small><em>Divulgação: link de afiliado — ganho comissão em compras qualificadas sem custo adicional para você.</em></small>
</div>
```

### Planilha de Tracking — Estrutura

| Data | Produto | Marketplace | Canal | Link | Clicks 24h | Clicks 7d | Vendas | Comissão |
|------|---------|-----------|-------|------|-----------|---------|--------|----------|
| 2026-02-18 | Aspirador Robô | Amazon | Telegram | bit.ly/xyz | 45 | 120 | 2 | R$18,60 |

### Horários Ideais de Publicação

```
Telegram:  08:00 (manhã) ou 19:30 (prime time)
WhatsApp:  08:30 (manhã) ou 12:30 (almoço) — evitar após 21h
Site:      Qualquer horário (SEO-driven, não hora-driven)
```

## Veto Conditions

- **HARD VETO:** Publicar oferta sem verificar link de afiliado ativo — zero comissão em cliques sem ID
- **HARD VETO:** Publicar no site sem divulgação de afiliado — violação LGPD e termos Amazon/ML
- **HARD VETO:** Publicar produto esgotado — experiência ruim, perda de confiança do canal
- **HARD VETO:** Publicar mais de 5 ofertas/dia no WhatsApp — taxa de opt-out dispara
- **SOFT VETO:** Publicar oferta sem verificação de preço histórico — risco de promover desconto falso e perder credibilidade
- **SOFT VETO:** Usar link longo sem encurtamento rastreável — impossível medir ROI por oferta

## Output

- **File:** `docs/broadcasts/{date}-broadcast-log.md`
- **Format:** Markdown com registro diário de todas as ofertas publicadas

## Output Example

```yaml
broadcast_date: "2026-02-18"
operator: marketplace-ops

offers_curated: 7
offers_published: 3
offers_rejected: 4

rejection_reasons:
  - "Produto esgotado (Amazon aspirador)"
  - "Desconto falso verificado via Meli Price"
  - "Avaliação 3.8 abaixo do threshold"
  - "Sem link de afiliado disponível (produto novo)"

published_offers:
  - product: "Fritadeira Air Fryer 5L XYZ"
    marketplace: Amazon
    original_price: 299.90
    sale_price: 199.90
    discount_pct: 33
    shipping: "Grátis (Prime)"
    valid_until: "2026-02-18 23:59"
    channels:
      telegram:
        published_at: "08:02"
        link: "https://bit.ly/airfryer-xyz-tg-20260218"
        clicks_1h: 23
      whatsapp:
        published_at: "08:15"
        link: "https://bit.ly/airfryer-xyz-wa-20260218"
        list: "invest-principal-20260218"
        clicks_1h: 11

  - product: "Tênis Running Pro Marca X"
    marketplace: Shopee
    original_price: 189.00
    sale_price: 129.00
    discount_pct: 32
    coupon: "AFILIADO10"
    channels:
      telegram:
        published_at: "19:32"
        link: "https://bit.ly/tenis-run-tg-20260218"
        clicks_1h: 18

metrics_snapshot_24h:
  total_clicks: 87
  estimated_conversions: 3
  estimated_commission_brl: 47.20

next_broadcast: "2026-02-19"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
