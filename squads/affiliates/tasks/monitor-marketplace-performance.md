# monitor-marketplace-performance

## Metadata
```yaml
task_id: AFF_MKT_005
agent: marketplace-ops + performance-analyst
type: analysis
complexity: medium
estimated_time: "1h-2h"
source: "Avinash Kaushik — Occam's Razor Performance Framework (adapted for affiliate marketplace)"
```

## Purpose
Executar review semanal de performance por marketplace (clicks, conversões, receita, top products, trends) para identificar canais sub-performando, produtos emergentes e oportunidades de otimização antes da semana seguinte.

## Prerequisites
- Mínimo de 7 dias de dados no painel de afiliados de cada marketplace ativo
- Acesso aos painéis: Amazon Associates, Shopee Affiliate, Mercado Afiliados
- Acesso à planilha de tracking de broadcasts (AFF_MKT_004)
- Acesso ao Bitly ou ferramenta de rastreamento de links para dados de click por canal

## Steps

1. **Coletar dados brutos de cada marketplace** — Exportar relatórios do período (7 dias).
   - **Amazon Associates BR:** Relatório → Por link → Período 7 dias → Exportar CSV
     - Coletar: clicks, pedidos, itens ordenados, receita estimada, taxa de conversão
   - **Shopee Affiliate:** Painel → Relatórios → Semanal → Exportar
     - Coletar: clicks, pedidos, comissão, taxa de conversão, top products
   - **Mercado Afiliados:** Relatórios → Período → Por produto → Exportar
     - Coletar: clicks, vendas, comissão, taxa de conversão, ticket médio
   - Consolidar em planilha unificada de comparação inter-marketplace

2. **Calcular métricas-chave por marketplace** — Processar dados brutos em indicadores acionáveis.
   - Taxa de conversão: `(vendas / clicks) × 100` por marketplace
   - EPC (Earnings Per Click): `comissão_total / clicks_totais`
   - ROAS (quando há tráfego pago): `comissão / custo_tráfego`
   - Revenue por produto: ordenar top 10 produtos por comissão gerada
   - Comparar com semana anterior: variação % em cada métrica

3. **Identificar top products da semana** — Descobrir quais produtos geraram mais resultado.
   - Listar top 5 produtos por cliques
   - Listar top 5 produtos por comissão
   - Identificar discrepâncias: produto com muitos cliques mas baixa conversão (problema de landing page ou relevância)
   - Identificar produto emergente: crescimento > 50% vs semana anterior

4. **Analisar performance por canal de distribuição** — Cruzar dados de marketplace com canais.
   - Puxar clicks por link rastreável da planilha de broadcasts (AFF_MKT_004)
   - Comparar EPC por canal: Telegram vs WhatsApp vs Site vs E-mail
   - Identificar canal de maior ROI para o nicho/produto
   - Identificar canal com clicks mas sem conversão (revisar copy ou produto)

5. **Identificar tendências emergentes** — Detectar sinais de oportunidade ou risco.
   - Produto com crescimento de clicks > 100% vs semana anterior: potencial trending
   - Categoria com queda de conversão > 30%: investigar mudança de preço ou concorrência
   - Sazonalidade: verificar se data/evento está impactando demand
   - Novo produto no top 10: potencial para review ou conteúdo dedicado

6. **Emitir diagnóstico por marketplace** — Classificar cada marketplace na semana.
   - Comparar cada marketplace com benchmarks internos (médias históricas)
   - Classificar: ACIMA DA META / NA META / ABAIXO DA META
   - Para cada classificação: identificar causa-raiz e recomendação específica
   - Priorizar top 3 ações para a semana seguinte

7. **Atualizar dashboard de performance** — Registrar dados na visão histórica.
   - Inserir métricas da semana na planilha histórica (uma linha por semana por marketplace)
   - Atualizar gráficos de tendência (clicks, conversão, receita) se existentes
   - Comparar com meta mensal: % atingido na semana vs meta proporcional

8. **Documentar relatório semanal** — Registrar análise no arquivo de output.
   - Escrever sumário executivo em 3-5 bullets
   - Listar top 3 insights da semana
   - Definir top 3 ações prioritárias para a próxima semana
   - Salvar arquivo com data no diretório de analytics

## Framework

### Benchmarks Internos por Marketplace (referência inicial)

| Marketplace | CTR Esperado | Conv Rate | EPC | Revisão |
|-------------|------------|-----------|-----|---------|
| Amazon BR | >2% | >0.5% | >R$0.20 | Baixo (cookie 24h) |
| Shopee | >3% | >1.0% | >R$0.30 | Médio |
| Mercado Livre | >3% | >0.8% | >R$0.35 | Alto (ticket maior) |

*Benchmarks iniciais — ajustar após 4 semanas de dados reais*

### Matriz de Diagnóstico por Métrica

```
CLICKS ALTOS + CONVERSÃO BAIXA → Problema de oferta ou landing page
  Ação: verificar preço, disponibilidade, page de destino, relevância do produto

CLICKS BAIXOS + CONVERSÃO ALTA → Copy fraca ou distribuição insuficiente
  Ação: aumentar frequência de distribuição, testar headline, ampliar canais

CLICKS ALTOS + CONVERSÃO ALTA → Escalar imediatamente
  Ação: aumentar frequência, criar mais conteúdo similar, testar tráfego pago

CLICKS BAIXOS + CONVERSÃO BAIXA → Produto errado ou canal errado
  Ação: testar produto diferente ou canal diferente antes de descartar
```

### Template de Relatório Semanal (estrutura)

```markdown
## Relatório Semanal — Semana {N} ({data_inicio} a {data_fim})

### Sumário Executivo
- Receita total: R${X} ({+/-Y}% vs semana anterior)
- Marketplace líder: {nome} (R${X} / {% do total})
- Produto destaque: {nome} ({N} vendas)
- Alerta: {qualquer anomalia importante}

### Por Marketplace
| Marketplace | Clicks | Vendas | Comissão | Conv% | EPC | vs Ant |
|-------------|--------|--------|----------|-------|-----|--------|
| Amazon BR | | | | | | |
| Shopee | | | | | | |
| ML | | | | | | |

### Top 5 Produtos (por comissão)
1. [Produto] — R$X — [Marketplace]
...

### Top 3 Insights
1. [Insight acionável]
2. [Insight acionável]
3. [Insight acionável]

### Ações Para Esta Semana
1. [ ] [Ação específica]
2. [ ] [Ação específica]
3. [ ] [Ação específica]
```

### Frequência e Calendário de Reviews

```
SEMANAL (toda segunda-feira, 09h):
  Review completa da semana anterior
  Definição de prioridades da semana atual
  Duração: 60-90 minutos

MENSAL (primeira segunda do mês):
  Review acumulada do mês
  Comparação vs meta mensal
  Ajuste de estratégia por marketplace
  Duração: 2-3 horas

TRIMESTRAL:
  Revisão de portfólio completo
  Decisões de escala ou descontinuação por marketplace
  Planejamento de calendário sazonal do próximo trimestre
```

## Veto Conditions

- **HARD VETO:** Escalar investimento em marketplace sem review semanal atual — decisões cegas de capital
- **HARD VETO:** Publicar relatório com dados de período < 7 dias — amostra insuficiente para qualquer decisão
- **SOFT VETO:** Analisar sem benchmarks históricos — sem contexto, qualquer número parece bom ou ruim
- **SOFT VETO:** Review sem action items definidos — análise sem consequência não tem valor operacional

## Output

- **File:** `docs/analytics/marketplace-weekly-{YYYY-WXX}.md`
- **Format:** Markdown com tabelas de métricas, insights e action items

## Output Example

```yaml
report_week: "2026-W08"
period: "2026-02-11 to 2026-02-17"
generated_by: "marketplace-ops + performance-analyst"

summary:
  total_revenue_brl: 387.40
  total_revenue_change_pct: +23.4
  total_clicks: 2847
  total_conversions: 31
  overall_conv_rate: "1.09%"
  overall_epc: 0.136

by_marketplace:
  amazon_br:
    clicks: 1203
    conversions: 6
    commission_brl: 38.20
    conv_rate: "0.50%"
    epc: 0.032
    status: ABAIXO_DA_META
    insight: "Cookie 24h limita conversão; foco em conteúdo decisional"

  shopee:
    clicks: 987
    conversions: 18
    commission_brl: 201.60
    conv_rate: "1.82%"
    epc: 0.204
    status: ACIMA_DA_META
    insight: "Live de quinta-feira gerou 40% das conversões da semana"

  mercado_livre:
    clicks: 657
    conversions: 7
    commission_brl: 147.60
    conv_rate: "1.07%"
    epc: 0.225
    status: NA_META
    insight: "Produto Aspirador Robô lidera com R$89.40 em comissão"

top_products:
  - rank: 1
    product: "Kit Skincare Vitamina C"
    marketplace: Shopee
    commission_brl: 94.50
    conversions: 15
  - rank: 2
    product: "Aspirador Robô 5000"
    marketplace: ML
    commission_brl: 89.40
    conversions: 3

top_3_insights:
  - "Shopee Live (quinta 19h) gerou EPC 3x superior ao broadcast Telegram"
  - "Amazon BR abaixo da meta — migrar conteúdo para produtos de decisão rápida"
  - "Produto Skincare emergente: crescimento 180% vs semana anterior — criar review dedicada"

action_items:
  - "[ ] Criar review completa do Kit Skincare Vitamina C (Shopee) — publicar até quarta"
  - "[ ] Agendar nova Shopee Live para quinta-feira próxima — mesmo horário"
  - "[ ] Testar produto de ticket alto Amazon (Eletrodoméstico > R$500) — novo conteúdo"

next_review: "2026-02-24"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
