# north-star-setup

## Metadata
```yaml
task_id: AFF_GRW_005
agent: growth-optimizer + performance-analyst
type: setup
complexity: medium
estimated_time: "1h-2h"
source: "North Star Metric Framework — Amplitude + Sean Ellis (GrowthHackers) + Josh Elman"
```

## Purpose
Definir a métrica North Star do negócio de afiliados (recomendado: RPV — Revenue Per Visitor), configurar seu rastreamento automatizado, e estabelecer o baseline dos primeiros 30 dias para que toda decisão estratégica futura seja orientada por uma única métrica de negócio alinhada com criação de valor real.

## Prerequisites
- Rastreamento de tráfego e receita configurado (AFF_ANL_001)
- Pelo menos 30 dias de dados históricos no GA4 e na plataforma de afiliados
- Análise de performance inicial executada (AFF_ANL_002) para entender o estado atual
- Clareza sobre o modelo de negócio: qual valor o site entrega para o visitante e como monetiza

## Steps

1. **Entender o modelo de negócio e valor entregue** — Antes de escolher a métrica, responder:
   - O que o visitante vem buscar no site? (informação, comparação, review, lista)
   - O que o site precisa que o visitante faça para gerar receita? (clicar no link afiliado)
   - Qual ação do visitante é o melhor proxy de "recebeu valor E nos gerou receita"?

2. **Avaliar candidatos a North Star** — Comparar as métricas candidatas usando o checklist de qualidade:
   - RPV (Revenue Per Visitor) — recomendado padrão para afiliados
   - EPC (Earnings Per Click em links afiliados)
   - Receita total mensal
   - Número de conversões de afiliado por mês
   Escolher a que melhor reflete simultaneamente valor entregue ao visitante e saúde do negócio.

3. **Selecionar RPV como North Star (padrão)** — RPV é recomendado porque:
   - Incorpora tráfego (quantidade) e conversão (qualidade)
   - Cresce quando você aumenta tráfego OU quando aumenta conversão
   - Não pode ser inflado por tráfego de baixa qualidade (bot traffic, spam clicks)
   - É diretamente comparável entre períodos, canais e nichos
   - Fórmula: `RPV = Receita Total / Sessões Totais`

4. **Calcular baseline de 30 dias** — Calcular RPV para o último mês completo disponível:
   ```
   RPV baseline = Receita do mês (plataforma nativa) / Sessões do mês (GA4)
   ```
   Calcular também por canal (RPV do tráfego orgânico, RPV do tráfego pago, RPV do email) para ter granularidade.

5. **Configurar cálculo automatizado do RPV** — Como o GA4 não calcula RPV nativamente (receita vem da plataforma de afiliados, sessões do GA4):
   - **Opção A (recomendado):** Planilha Google Sheets atualizada semanalmente com fórmula = Receita / Sessões
   - **Opção B:** Looker Studio com Blended Data conectando GA4 (sessões) + planilha de receita (do painel da plataforma)
   - **Opção C:** Configurar e-commerce tracking no GA4 se a plataforma de afiliados suportar pixel de conversão com valor

6. **Definir meta de RPV para os próximos 90 dias** — Com base no baseline, definir uma meta ambiciosa mas realista:
   - Crescimento conservador: +20% em 90 dias
   - Crescimento agressivo: +50% em 90 dias
   - Método: benchmark vs nicho (da tabela AFF_ANL_006) + histórico de crescimento

7. **Criar submétricas (input metrics)** — Identificar 3-4 métricas que, se melhoradas, movem o RPV. Essas são as métricas de execução do squad:
   - Sessões (crescer tráfego)
   - Taxa de conversão (% de visitantes que clicam no link afiliado)
   - EPC (qualidade do clique e do produto)
   - Email list growth rate (canal de maior RPV)

8. **Criar "North Star Statement" do projeto** — Frase que alinha o squad em torno da métrica:
   ```
   "Nosso objetivo é aumentar o RPV de R$X.XX para R$X.XX nos próximos 90 dias,
   entregando conteúdo de alta qualidade que converte o visitante certo no produto certo."
   ```

9. **Configurar visualização no dashboard** — Adicionar RPV como KPI principal no dashboard (AFF_ANL_005):
   - Posição: canto superior esquerdo (primeiro número que o operador vê)
   - Mostrar: valor atual + variação semanal + variação MoM
   - Linha de meta visível no gráfico de linha

10. **Documentar e comunicar para todos os agentes** — O North Star deve ser conhecido por todos os agentes do squad. Cada decisão deve responder: "isso aumenta o RPV?"

## Framework

### Checklist de Qualidade da North Star Metric

| Critério | RPV | EPC | Receita Total | Conversões |
|---------|-----|-----|--------------|-----------|
| Reflete valor entregue ao visitante? | Sim | Parcial | Não | Parcial |
| Incorpora volume E qualidade? | Sim | Não (só qualidade) | Parcial | Parcial |
| Pode ser inflada por vanity traffic? | Não | Não | Sim | Sim |
| É fácil de calcular? | Médio | Fácil | Fácil | Fácil |
| Move-se quando o negócio cresce? | Sempre | Às vezes | Sempre | Sempre |
| **Recomendado?** | **Sim** | Secundária | Terciária | Terciária |

### RPV — Decomposição por Alavancas

```
RPV = Receita / Sessões

Para aumentar RPV, você pode:
├── Aumentar Receita (numerador)
│   ├── Aumentar CR (% que compra)
│   ├── Aumentar EPC (R$ por clique afiliado)
│   └── Adicionar produtos de maior comissão
│
└── Manter Sessões (ou crescer Sessões + Receita proporcionalmente)
    ├── Crescer tráfego orgânico
    ├── Crescer lista de email
    └── Escalar ads com ROAS positivo

ARMADILHA: Crescer sessões sem crescer receita DIMINUI o RPV.
Tráfego de baixa qualidade é inimigo do RPV.
```

### Benchmarks de RPV por Nicho (BR 2025)

| Nicho | RPV Iniciante | RPV Intermediário | RPV Avançado |
|-------|--------------|------------------|-------------|
| Saúde & Emagrecimento | R$0.20 | R$0.50-R$1.00 | > R$1.50 |
| Infoprodutos digitais | R$0.30 | R$0.70-R$1.20 | > R$2.00 |
| Finanças / Investimentos | R$0.50 | R$1.00-R$2.00 | > R$3.00 |
| Prop Trading | R$0.80 | R$2.00-R$4.00 | > R$6.00 |

### Cadência de Acompanhamento do North Star

| Frequência | Métrica | Responsável |
|-----------|---------|------------|
| Diária | Sessões + Receita bruta (proxy de RPV) | growth-optimizer |
| Semanal | RPV da semana vs semana anterior | performance-analyst |
| Mensal | RPV do mês + variação das submétricas | growth-optimizer + performance-analyst |
| Trimestral | RPV vs meta de 90 dias + revisão da meta | affiliates-chief |

## Veto Conditions

- **HARD VETO:** Escolher mais de uma North Star Metric — o conceito exige singularidade; múltiplas "norte" criam conflito de prioridade entre agentes
- **HARD VETO:** Usar "Receita Total" como North Star sem normalizar por tráfego — crescimento de receita pode esconder queda de qualidade se tráfego crescer mais rápido
- **SOFT VETO:** Definir meta de RPV sem baseline de 30 dias confirmado — meta sem referência histórica é arbitrária
- **ALERTA:** RPV calculado misturando fontes de tráfego muito diferentes sem segmentação — RPV de email (R$2.00) vs RPV de cold traffic (R$0.20) médios numa única métrica mascara a realidade; calcular por canal também

## Output

- **File:** `outputs/affiliates/{projeto-slug}/north-star-config.md`
- **Format:** Markdown com definição, baseline, meta e configuração de rastreamento

## Output Example

```yaml
north_star:
  project: "afiliado-fitness-br"
  setup_by: ["growth-optimizer", "performance-analyst"]
  setup_date: "2026-02-18"

  metric: "RPV — Revenue Per Visitor"
  formula: "Receita Total (R$) / Sessões Totais"
  unit: "R$/sessão"
  calculation_source:
    revenue: "Hotmart dashboard — Relatório de comissões (export mensal)"
    sessions: "GA4 — Métricas > Sessões (excluir tráfego de bot se aplicável)"

  statement: "Nosso objetivo é aumentar o RPV de R$0.63 para R$1.00 nos próximos 90 dias, entregando reviews e conteúdo que convertem o visitante de alta intenção no produto certo para o problema certo."

baseline:
  period: "2026-01"
  revenue: "R$3.904"
  sessions: "6.197"
  rpv: "R$0.63"
  by_channel:
    email: "R$2.40"
    organic_seo: "R$0.72"
    meta_ads_warm: "R$0.90"
    meta_ads_cold: "R$0.19"
    direct: "R$0.11"

target:
  rpv_90_days: "R$1.00"
  target_date: "2026-05-18"
  growth_required: "+58.7%"
  rationale: "Benchmark intermediário do nicho Saúde BR = R$0.50-R$1.00. Dado baseline atual de R$0.63, meta de R$1.00 é agressiva mas alcançável via email growth + CRO na bridge page."

input_metrics:
  - metric: "Sessions (organic)"
    current: 4820
    target_90d: 6500
    owner: "seo-content"
  - metric: "Email list size"
    current: 5200
    target_90d: 7000
    owner: "email-nurture"
  - metric: "Blog article CR (clique afiliado)"
    current: "3.1%"
    target_90d: "4.0%"
    owner: "copy-vendas + growth-optimizer"
  - metric: "EPC — produto principal"
    current: "R$1.82"
    target_90d: "R$2.20"
    owner: "growth-optimizer"

tracking:
  tool: "Google Sheets + Looker Studio"
  update_frequency: "weekly"
  sheet_url: "https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXX"
  dashboard_widget: "Scorecard principal — canto superior esquerdo do KPI dashboard"

review_schedule:
  weekly: "toda segunda-feira (growth-optimizer)"
  monthly: "dia 18 de cada mês (portfolio-review)"
  quarterly: "revisão de meta (affiliates-chief)"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
