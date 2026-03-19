# design-affiliate-funnel

## Metadata
```yaml
task_id: AFF_FUN_001
agent: funnel-architect
type: creation
complexity: high
estimated_time: "45min-2h"
source: "Russell Brunson — DotCom Secrets, Funnel Hacking Framework"
```

## Purpose
Desenhar o funil de afiliado completo, selecionando o tipo ideal (bridge, review, webinar, quiz ou lead-magnet) com base no nicho, produto e temperatura do tráfego, e mapeando todas as páginas, etapas e fluxo de conversão.

## Prerequisites
- Produto afiliado definido (URL, comissão, cookie window)
- Nicho e avatar do comprador identificados
- Temperatura do tráfego conhecida (cold/warm/hot)
- Value Ladder do negócio esboçada (ou executar `design-value-ladder.md` primeiro)

## Steps

1. **Coletar contexto do funil** — Obter: produto afiliado, nicho, público-alvo (avatar), temperatura do tráfego (cold/warm/hot), plataforma de tráfego (Meta Ads, YouTube, orgânico, email), orçamento estimado e prazo.

2. **Selecionar tipo de funil via Decision Tree** — Aplicar a árvore de decisão abaixo para escolher o tipo mais adequado ao contexto.

3. **Mapear as páginas e etapas** — Para cada tipo selecionado, detalhar: nome de cada página, objetivo único da página, copy principal (headline + CTA), métrica-alvo por etapa.

4. **Definir o fluxo de tráfego** — Desenhar o caminho completo: fonte de tráfego → página 1 → página 2 → link de afiliado → thank you / upsell (se existir).

5. **Planejar email sequence de suporte** — Independente do tipo de funil, definir sequência mínima: 5 emails pós opt-in que nutrem e conduzem ao link de afiliado.

6. **Definir métricas-alvo por etapa** — Benchmarks esperados para cada transição do funil (ver seção Framework).

7. **Documentar o funil** — Gerar arquivo `funnel-map.md` no diretório de outputs do projeto com todas as informações estruturadas.

## Framework

### Decision Tree — Tipo de Funil

```
TRÁFEGO COLD (não conhece você nem o produto)?
├── Produto de alto CPL ou nicho complexo?
│   ├── SIM → QUIZ FUNNEL (qualifica antes de apresentar)
│   └── NÃO → BRIDGE PAGE (pre-sell + story antes do link)
│
TRÁFEGO WARM (conhece você, não conhece o produto)?
├── Produto $97+?
│   ├── SIM → WEBINAR FUNNEL (convicção precisa de tempo)
│   └── NÃO → REVIEW FUNNEL (conteúdo + comparação)
│
TRÁFEGO HOT (procura ativamente o produto)?
└── REVIEW FUNNEL ou link direto com bridge mínima

OBJETIVO PRINCIPAL = CAPTAR LEADS?
└── LEAD MAGNET FUNNEL (isca → opt-in → email sequence → afiliado)
```

### Tipos de Funil e Estruturas

| Tipo | Páginas | Melhor Para |
|------|---------|-------------|
| Bridge | Tráfego → Bridge Page → Link Afiliado | Cold traffic, social ads |
| Review | SEO/Busca → Review Page → Link Afiliado | Warm/hot, orgânico |
| Webinar | Ads → Reg Page → Webinar Room → Replay → Link | Produto $197+, warm |
| Quiz | Ads → Quiz (5-8q) → Resultado Segmentado → Link | Cold, nicho amplo |
| Lead Magnet | Ads/Orgânico → Opt-in → TY → Email Seq → Link | Qualquer temperatura |

### Métricas-Alvo por Etapa

| Etapa | Benchmark |
|-------|-----------|
| Ad CTR | > 1.5% (Meta) / > 3% (busca) |
| Opt-in rate (lead magnet) | 25-45% |
| Bridge page CTR para afiliado | 15-35% |
| Quiz completion rate | 55-75% |
| Webinar registration rate | 20-40% |
| Webinar show rate | 25-50% |
| Conversão em compra (EPC base) | > R$1,50/clique |

### Elementos Obrigatórios em Todo Funil
- Affiliate disclosure visível antes do link de afiliado (LGPD/FTC)
- Um objetivo por página — nunca dois CTAs concorrentes
- Email sequence ativa independente do tipo de funil
- Mobile-first em todas as páginas (>70% tráfego BR é mobile)

## Veto Conditions
- Produto afiliado sem programa formal identificado → BLOQUEAR (não há link para converter)
- Tráfego cold direcionado diretamente ao link de afiliado sem bridge → BLOQUEAR (viola boas práticas e queima orçamento)
- Funil com mais de 4 etapas antes do link de afiliado sem justificativa → ALERTAR (fricção excessiva)
- Ausência de email sequence → ALERTAR (lead morre sem follow-up em 48h)
- Dois ou mais CTAs concorrentes em mesma página → BLOQUEAR (regra: 1 página = 1 objetivo)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/funnel-map.md`
- **Format:** Markdown com seções por tipo de funil

## Output Example
```yaml
funnel:
  project: "afiliado-fitness-digital"
  type: bridge
  traffic_source: "Meta Ads (cold)"
  avatar: "Homem 28-45 anos, quer emagrecer sem academia"
  affiliate_product: "Programa Emagreça em Casa — Hotmart"
  commission: "R$97 por venda (40%)"

pages:
  - step: 1
    name: "Bridge Page"
    url_slug: "/antes-de-comecar"
    objective: "Pre-sell — criar crença na solução antes do link"
    headline: "Por que eu perdi 12kg sem academia (e sem dieta maluca)"
    cta: "Quero ver o método completo →"
    cta_target: "link afiliado"
    target_ctr: "25%"

  - step: 2
    name: "Página de Vendas do Produtor"
    url_slug: "[externo — hotmart]"
    objective: "Conversão em compra"
    target_cr: "3-5%"

email_sequence:
  trigger: "opt-in na bridge (se houver captura)"
  emails:
    - day: 0
      subject: "Você pediu — aqui está"
      type: "deliver + set stage"
    - day: 1
      subject: "O erro que quase me fez desistir"
      type: "story + credibility"
    - day: 3
      subject: "O que eu descobri que mudou tudo"
      type: "epiphany + pre-sell"
    - day: 5
      subject: "Resultados que não esperava"
      type: "hidden benefits + soft CTA"
    - day: 7
      subject: "Última chance de aproveitar o bônus"
      type: "urgency + hard CTA"

metrics_targets:
  ad_ctr: "> 1.5%"
  bridge_ctr: "> 25%"
  affiliate_cr: "> 3%"
  epc_target: "> R$2.00"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
