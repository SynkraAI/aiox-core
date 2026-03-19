# calculo-roi-campanha

## Metadata
```yaml
task_id: AFF_BR_007
agent: performance-analyst
type: analysis
complexity: medium
estimated_time: "30min-1h"
source: "Andrew Chen — Growth Accounting Framework (adapted for affiliate campaign ROI)"
```

## Purpose
Calcular ROI líquido de campanha de afiliado BR decompondo comissão bruta, custo de tráfego e custo de ferramentas, e determinar o ponto de break-even por canal para decisões de escala ou pausa.

## Prerequisites
- Campanha ativa ou concluída com dados de clicks, vendas e receita
- Dados de custo por canal (tráfego pago: gasto Meta/Google; orgânico: custo de ferramentas)
- Comissão por produto confirmada (bruta, após taxas da plataforma)
- Período de análise definido (7 dias, 14 dias, 30 dias)

## Steps

1. **Coletar dados de receita** — Reunir todas as comissões do período.
   - Acessar painel da plataforma (Hotmart, Kiwify, Monetizze) → Relatório de vendas
   - Exportar: número de vendas, comissão bruta total, taxas descontadas, comissão líquida
   - Separar por produto e por canal (usando parâmetro SRC/UTM)
   - Registrar reembolsos e estornos do período (diminui receita líquida)

2. **Coletar dados de custo de tráfego** — Consolidar gastos por canal.
   - Meta Ads: exportar gasto total do período por campanha/adset
   - Google Ads: exportar gasto total por campanha
   - Orgânico (WhatsApp, Telegram, SEO): custo = zero tráfego, mas registrar tempo gasto
   - Registrar CPL (custo por lead) e CPC (custo por clique) por canal

3. **Coletar custo de ferramentas** — Ratear custo mensal de ferramentas pelo período.
   - Listar ferramentas ativas: autoresponder, encurtador, design, analytics, API WhatsApp
   - Calcular custo diário: `custo_mensal / 30`
   - Multiplicar pelo número de dias do período de análise
   - Incluir apenas ferramentas usadas diretamente na campanha

4. **Calcular métricas brutas por canal** — Para cada canal ativo:
   - Clicks totais no período
   - Conversões (vendas atribuídas ao canal)
   - Taxa de conversão: `(vendas / clicks) × 100`
   - Comissão bruta gerada pelo canal
   - Custo de tráfego do canal

5. **Calcular ROI por canal** — Aplicar fórmula de ROI e margem líquida.
   - Fórmula ROI: `((comissão_líquida - custo_total) / custo_total) × 100`
   - Margem líquida: `comissão_líquida - custo_tráfego - custo_ferramentas_rateado`
   - ROAS (para tráfego pago): `comissão_bruta / custo_tráfego`
   - EPC (earnings per click): `comissão_líquida / clicks_totais`

6. **Calcular break-even por canal** — Determinar ponto mínimo de viabilidade.
   - Break-even clicks: `custo_total / EPC`
   - Break-even vendas: `custo_total / comissão_líquida_por_venda`
   - Break-even CPL máximo: `comissão_líquida × taxa_conversão_media`
   - Documentar break-even no output para referência de escala

7. **Emitir diagnóstico e recomendação** — Classificar cada canal e definir ação.
   - Aplicar thresholds de decisão (ver Framework)
   - Identificar canal mais eficiente e canal com maior potencial de escala
   - Recomendar: ESCALAR / MANTER / OTIMIZAR / PAUSAR por canal
   - Definir próximo teste de hipótese se resultado for OTIMIZAR

8. **Documentar resultado e atualizar tracking** — Salvar análise e atualizar dashboard.
   - Registrar todos os dados no arquivo de output
   - Atualizar planilha de ROI histórico do portfólio
   - Definir data da próxima revisão (recomendado: 7 dias para campanhas pagas, 30 para orgânico)

## Framework

### Fórmulas Centrais

```
COMISSÃO LÍQUIDA POR VENDA
  = (ticket × %_comissão) - taxa_plataforma

ROI DA CAMPANHA (%)
  = ((comissão_líquida_total - custo_total) / custo_total) × 100

ROAS (Return on Ad Spend)
  = comissão_bruta_total / custo_tráfego_pago

EPC (Earnings Per Click)
  = comissão_líquida_total / clicks_totais

CPL MÁXIMO VIÁVEL
  = comissão_líquida_por_venda × taxa_conversão_lead_para_venda

BREAK-EVEN VENDAS
  = custo_total_campanha / comissão_líquida_por_venda

MARGEM LÍQUIDA
  = comissão_líquida_total - custo_tráfego - custo_ferramentas_rateado
```

### Break-Even Calculator — Tabela Rápida

| Comissão Líquida | Conv Rate (Lead→Venda) | CPL Máximo Viável |
|-----------------|----------------------|-------------------|
| R$ 50 | 5% | R$ 2,50 |
| R$ 100 | 5% | R$ 5,00 |
| R$ 150 | 5% | R$ 7,50 |
| R$ 50 | 10% | R$ 5,00 |
| R$ 100 | 10% | R$ 10,00 |
| R$ 150 | 10% | R$ 15,00 |
| R$ 200 | 10% | R$ 20,00 |

### Thresholds de Decisão por Canal

```
ESCALAR   ROI > 100% e ROAS > 2.5 — Dobrar orçamento com monitoramento semanal
MANTER    ROI 30-100% e ROAS 1.5-2.5 — Canal saudável, otimizar incrementalmente
OTIMIZAR  ROI 0-30% ou ROAS 1.0-1.5 — Testar nova copy/oferta/segmentação
PAUSAR    ROI < 0 (prejuízo) — Pausar imediatamente, investigar causa-raiz
```

### Custo Padrão de Ferramentas para Rateio

| Ferramenta | Custo Mensal (estimativa) | Rateio Diário |
|-----------|--------------------------|---------------|
| Autoresponder (MailerLite Pro) | R$ 150 | R$ 5,00 |
| API WhatsApp (Zapi básico) | R$ 100 | R$ 3,33 |
| Encurtador/Analytics (Bitly Pro) | R$ 80 | R$ 2,67 |
| Design (Canva Pro) | R$ 70 | R$ 2,33 |
| Total estimado | R$ 400 | R$ 13,33 |

*Ajustar conforme ferramentas reais em uso*

## Veto Conditions

- **HARD VETO:** Continuar campanha com ROAS < 1.0 por 7+ dias sem mudança de estratégia — queima de caixa sem justificativa
- **HARD VETO:** Não incluir custo de ferramentas no cálculo — subestima custo real e distorce ROI
- **SOFT VETO:** Escalar campanha sem atingir mínimo de 50 conversões no período — amostra insuficiente para decisão estatística
- **SOFT VETO:** Analisar ROI sem separar canais — agrega resultados e mascara canais deficitários

## Output

- **File:** `docs/analytics/{date}-roi-{produto-slug}-{periodo}.md`
- **Format:** Markdown com tabelas de métricas e recomendações por canal

## Output Example

```yaml
analysis_date: "2026-02-18"
product: "Curso Investimentos Descomplicados"
period: "2026-02-04 to 2026-02-18 (14 dias)"
commission_net_per_sale: 103.93

revenue:
  sales_total: 23
  refunds: 1
  net_sales: 22
  commission_gross: 2390.39
  platform_fees: 296.46
  commission_net: 2093.93

costs:
  meta_ads: 890.00
  google_ads: 0
  tools_14d: 186.62  # R$13.33/dia × 14 dias
  total_cost: 1076.62

metrics:
  roi_pct: 94.5         # ((2093.93 - 1076.62) / 1076.62) × 100
  roas: 2.68            # 2390.39 / 890.00
  margin_net: 1017.31   # 2093.93 - 1076.62
  epc_total: 0.73       # 2093.93 / 2869 clicks totais

by_channel:
  - channel: meta_ads
    clicks: 1847
    sales: 18
    conversion_rate: "0.97%"
    commission_net: 1870.74
    cost: 890.00
    roi_pct: 110.2
    roas: 2.10
    recommendation: ESCALAR

  - channel: telegram_organic
    clicks: 612
    sales: 3
    conversion_rate: "0.49%"
    commission_net: 311.79
    cost: 0
    roi_pct: "∞ (zero cost)"
    epc: 0.51
    recommendation: MANTER

  - channel: whatsapp_broadcast
    clicks: 410
    sales: 1
    conversion_rate: "0.24%"
    commission_net: 103.93
    cost: 0
    roi_pct: "∞ (zero cost)"
    epc: 0.25
    recommendation: OTIMIZAR  # conv rate abaixo do esperado, revisar copy

break_even:
  min_sales_to_break_even: 10.4  # 1076.62 / 103.93
  max_cpl_viavel: 5.20           # 103.93 × 5% conv rate

next_review: "2026-02-25"
next_action: "Escalar Meta Ads em 50% de orçamento; testar nova copy WhatsApp"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
