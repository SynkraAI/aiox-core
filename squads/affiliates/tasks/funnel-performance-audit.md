# funnel-performance-audit

## Metadata
```yaml
task_id: AFF_FUN_007
agent: performance-analyst
type: audit
complexity: medium
estimated_time: "1h-2h"
source: "Affiliate Marketing Analytics; Google Analytics 4; Meta Ads Attribution; Hotmart/Eduzz Reports"
```

## Purpose
Executar auditoria completa de performance do funil de afiliado, consolidando métricas de opt-in rate, bridge CTR, conversion rate, EPC, revenue per visitor e funnel completion rate para identificar oportunidades e emitir relatório acionável.

## Prerequisites
- Funil de afiliado ativo com mínimo de 30 dias de dados e 1.000+ visitantes
- Acesso a: plataforma de anúncios (Meta/Google Ads), Google Analytics 4, plataforma de email (ESP), dashboard da plataforma afiliado (Hotmart/Eduzz/Monetizze/ShareASale)
- Definição clara das etapas do funil e suas URLs/eventos de rastreamento
- Pixels instalados e eventos configurados (Pixel Meta, GA4 events)

## Steps

1. **Configurar o painel de coleta de dados** — Criar planilha/documento de consolidação com as 7 métricas principais + breakdowns por período, canal e segmento.

2. **Extrair dados por fonte** — Coletar métricas de: (a) plataforma de ads, (b) Google Analytics 4 / analytics da opt-in page, (c) ESP (taxas de abertura, clique), (d) plataforma afiliado (cliques, conversões, EPC, comissões).

3. **Calcular métricas consolidadas** — Calcular cada KPI usando as fórmulas definidas no Framework. Identificar períodos de anomalia (picos/quedas anormais).

4. **Analisar funil por canal de tráfego** — Separar performance por origem: Meta Ads, Google Ads, orgânico, email, social. Identificar quais canais têm melhor EPC e ROI.

5. **Analisar funil por segmento** — Se houver segmentação (por quiz, por lead magnet, por tag ESP), comparar performance por segmento.

6. **Calcular ROI e payback period** — Cruzar investimento em tráfego pago com comissões recebidas. Calcular dias até recuperar investimento.

7. **Identificar oportunidades e riscos** — Listar 3-5 principais oportunidades de melhoria e 2-3 riscos ativos (dependência excessiva de canal, queda de performance, produto com reembolso alto).

8. **Gerar relatório** — Documentar todas as descobertas com dados e recomendações priorizadas no arquivo de output.

## Framework

### As 7 Métricas de Performance do Funil

| # | Métrica | Fórmula | Benchmark |
|---|---------|---------|-----------|
| 1 | Opt-in rate | Opt-ins / Visitantes opt-in page | > 30% |
| 2 | Bridge CTR | Cliques no link afiliado / Visitantes bridge page | > 20% |
| 3 | Conversion rate | Vendas / Cliques no link afiliado | > 3% |
| 4 | EPC (Earnings Per Click) | Comissões totais / Cliques no link afiliado | > R$1,50 |
| 5 | Revenue Per Visitor | Comissões totais / Visitantes totais | > R$0,30 |
| 6 | Funnel Completion Rate | Vendas / Visitantes totais | > 2% |
| 7 | ROI (se tráfego pago) | (Comissões - Investimento) / Investimento × 100 | > 30% |

### Scorecard de Saúde do Funil

```
Para cada métrica, classificar:
VERDE  (≥ benchmark): Saudável — manter e monitorar
AMARELO (70-99% do benchmark): Atenção — otimizar em 30 dias
VERMELHO (< 70% do benchmark): Crítico — otimizar imediatamente

Saúde Geral:
5-7 VERDE = Funil Saudável
3-4 VERDE = Funil Funcional — otimizar
0-2 VERDE = Funil em risco — parar tráfego pago e corrigir
```

### Análise por Canal de Tráfego

| Canal | Investimento | Visitantes | Opt-ins | Vendas | EPC | ROI |
|-------|-------------|------------|---------|--------|-----|-----|
| Meta Ads | R$X | Y | Z | W | R$X | X% |
| Google Ads | R$X | Y | Z | W | R$X | X% |
| Orgânico | R$0 | Y | Z | W | R$∞ | ∞% |
| Email | R$0 | Y | Z | W | R$X | ∞% |

**Insight esperado:** Canais orgânicos e email geralmente têm EPC 2-5x maior que tráfego pago. Identificar se investimento em pago está financeiramente justificado.

### Cálculo de Payback Period

```
Payback Period (dias) = Investimento Total em Ads / (Comissões Diárias Médias)

Exemplo:
Investimento mensal: R$3.000
Comissões mensais: R$4.200
Lucro: R$1.200 (40% ROI)
Payback period: 3.000 / (4.200/30) = 21 dias
```

### Análise de Reembolsos e Chargebacks

```
Taxa de reembolso saudável: < 5%
Taxa de reembolso preocupante: 5-10%
Taxa de reembolso crítica: > 10% → revisar produto afiliado ou qualificação de tráfego
```

## Veto Conditions
- Auditar período com menos de 1.000 visitantes ou 30 dias → ALERTAR (dados insuficientes para conclusões estatísticas confiáveis)
- Emitir relatório sem separar dados por canal de tráfego → ALERTAR (canais têm performance muito diferente — consolidado mascara problemas)
- Recomendar escalar tráfego pago com ROI < 0% → BLOQUEAR (escalar prejuízo acelera falência)
- Ignorar taxa de reembolso > 10% nas recomendações → BLOQUEAR (produto ou qualificação com problema grave)
- Auditar sem verificar atribuição (pixels e eventos configurados corretamente) → ALERTAR (dados incorretos levam a decisões erradas)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/funnel-performance-audit.md`
- **Format:** Markdown com scorecard, tabelas de dados e recomendações priorizadas

## Output Example
```yaml
funnel_performance_audit:
  project: "afiliado-fitness-digital"
  period: "2026-01-15 to 2026-02-14"
  total_visitors: 8420
  data_sources:
    - "Meta Ads Manager"
    - "Google Analytics 4"
    - "ActiveCampaign"
    - "Hotmart Dashboard"

kpi_scorecard:
  optin_rate:
    value: "28%"
    benchmark: "30%"
    status: "AMARELO"
    trend: "↑ (era 22% em dezembro)"

  bridge_ctr:
    value: "19%"
    benchmark: "20%"
    status: "AMARELO"
    trend: "→ estável"

  conversion_rate:
    value: "4.2%"
    benchmark: "3%"
    status: "VERDE"
    trend: "↑ excelente"

  epc:
    value: "R$1.68"
    benchmark: "R$1.50"
    status: "VERDE"
    trend: "→ estável"

  revenue_per_visitor:
    value: "R$0.31"
    benchmark: "R$0.30"
    status: "VERDE"
    trend: "↑"

  funnel_completion_rate:
    value: "2.2%"
    benchmark: "2%"
    status: "VERDE"
    trend: "↑"

  roi_paid_traffic:
    value: "38%"
    benchmark: "30%"
    status: "VERDE"
    investment: "R$5.200"
    commissions: "R$7.176"
    profit: "R$1.976"

overall_health: "FUNIL SAUDÁVEL — 5/7 VERDE"

channel_breakdown:
  meta_ads:
    investment: "R$4.800"
    visitors: 5800
    opt_ins: 1508
    sales: 49
    commissions: "R$4.753"
    epc: "R$1.63"
    roi: "-0.97%"  # ATENÇÃO — quase no break-even
    note: "ROI marginal — otimizar criativos ou pausar"

  organic_seo:
    investment: "R$0"
    visitors: 1820
    opt_ins: 601
    sales: 38
    commissions: "R$3.686"
    epc: "R$2.10"
    roi: "∞ (orgânico)"
    note: "Melhor canal — investir em SEO"

  email_list:
    investment: "R$0"
    visitors: 800
    opt_ins: "N/A (já na lista)"
    sales: 37
    commissions: "R$3.589"
    epc: "R$4.49"
    roi: "∞ (lista própria)"
    note: "EPC 2.7x maior que Meta Ads"

refund_analysis:
  total_sales: 124
  refunds: 4
  refund_rate: "3.2%"
  status: "SAUDÁVEL (< 5%)"

opportunities:
  - priority: 1
    area: "Canal Orgânico"
    action: "Aumentar produção de conteúdo SEO — EPC R$2.10 vs R$1.63 do pago"
    estimated_impact: "+R$1.500/mês em comissões sem investimento adicional"

  - priority: 2
    area: "Opt-in Rate"
    action: "Testar remoção de campo 'telefone' e nova headline"
    estimated_impact: "+28%→35% opt-in = +R$800/mês"

  - priority: 3
    area: "Meta Ads ROI"
    action: "Pausar adsets com ROAS < 1.2x, escalar os com ROAS > 2x"
    estimated_impact: "Mesmo gasto, +20% ROI"

risks:
  - risk: "Dependência de produto único (100% das comissões em 1 produto)"
    level: "MÉDIO"
    action: "Adicionar segundo produto afiliado como backup e upsell"

  - risk: "Meta Ads ROI próximo de break-even"
    level: "ALTO"
    action: "Otimizar criativos em 2 semanas ou redirecionar budget para SEO"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
