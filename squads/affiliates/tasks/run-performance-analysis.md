# run-performance-analysis

## Metadata
```yaml
task_id: AFF_ANL_002
agent: performance-analyst
type: analysis
complexity: medium
estimated_time: "1h-3h"
source: "Avinash Kaushik — Occam's Razor Analytics Methodology + STDC Framework (See-Think-Do-Care)"
```

## Purpose
Executar análise de performance semanal ou mensal do negócio de afiliados aplicando o framework STDC de Kaushik, avaliando métricas-chave de cada stage (EPC, CR, RPV, ROAS, tendência de tráfego) e produzindo recomendações priorizadas de ação.

## Prerequisites
- Dashboard de rastreamento configurado (`setup-affiliate-dashboard.md` — AFF_ANL_001 concluída)
- Acesso ao GA4 com dados de pelo menos 14 dias corridos
- Acesso ao dashboard nativo da plataforma de afiliados (Hotmart, Impact, etc.)
- Período de análise definido: semanal (L7D vs L7D anterior) ou mensal (MoM)

## Steps

1. **Definir período e baseline** — Confirmar janela de análise (L7D, L30D, MoM, QoQ), extrair dados do período atual e do período comparativo equivalente. Anotar qualquer evento externo que possa distorcer dados (feriados, campanhas pontuais, mudanças de algoritmo).

2. **Analisar stage SEE — Awareness** — Levantar métricas de topo de funil:
   - Impressões orgânicas (Search Console)
   - Sessões por canal (orgânico, pago, social, email, direto)
   - Usuários novos vs retornantes
   - Calcular variação percentual vs período anterior
   - Identificar canais com crescimento ou queda expressiva (>15%)

3. **Analisar stage THINK — Consideration** — Avaliar engajamento e qualidade do tráfego:
   - Páginas por sessão (benchmark: > 2.0)
   - Tempo médio de engajamento (benchmark: > 1min 30s)
   - Taxa de rejeição efetiva (GA4 bounce = sessão sem engajamento)
   - Scroll depth >= 75% por página de conteúdo
   - Top landing pages por tráfego e taxa de engajamento

4. **Analisar stage DO — Decision/Purchase** — Métricas de conversão e receita:
   - EPC — Earnings Per Click: receita total / total de cliques em links de afiliado
   - CR — Conversion Rate: vendas / cliques em link de afiliado
   - RPV — Revenue Per Visitor: receita total / total de sessões
   - ROAS — Return on Ad Spend (se houver tráfego pago): receita / investimento em ads
   - Receita total por produto, por canal, por campanha
   - Identificar top 3 e bottom 3 produtos por EPC

5. **Analisar stage CARE — Retention** — Métricas de relacionamento e recorrência:
   - Taxa de abertura de emails (benchmark BR: > 22%)
   - Taxa de clique em emails (benchmark: > 3%)
   - Usuários retornantes (> 20% é positivo para site de conteúdo)
   - Crescimento da lista de email (MoM)
   - Unsubscribe rate (alerta se > 0.5%)

6. **Calcular KPIs consolidados** — Produzir scorecard STDC com todos os KPIs e variações vs período anterior. Aplicar RAG (Red/Amber/Green) por métrica:
   - Green: dentro do benchmark ou crescimento positivo
   - Amber: degradação de 10-30% ou próximo do limite inferior
   - Red: queda > 30% ou abaixo do mínimo aceitável

7. **Aplicar metodologia Kaushik — 10/90 Rule** — Identificar as 3 métricas que mais impactam receita (o 10%) e focar 90% das recomendações nelas. Evitar relatório com 20+ métricas sem hierarquia.

8. **Gerar hipóteses e recomendações** — Para cada métrica Red ou Amber, formular hipótese de causa e recomendação de ação:
   - Queda de EPC → possível mudança de comissão na plataforma ou queda de CR
   - Queda de tráfego orgânico → verificar Search Console para perdas de posição
   - Queda de abertura de email → fatiga da lista ou deliverability problem

9. **Priorizar ações via ICE (preview)** — Atribuir score ICE preliminar a cada recomendação (detalhamento em `ice-prioritization.md` — AFF_GRW_001). Listar TOP 3 ações para a próxima semana.

10. **Documentar e distribuir análise** — Salvar relatório no formato de output. Marcar data da próxima análise programada.

## Framework

### STDC — Métricas por Stage

| Stage | Objetivo | KPIs Primários | Benchmarks |
|-------|----------|----------------|------------|
| SEE | Awareness | Impressões, Sessões, Usuários Novos | Crescimento MoM > 5% |
| THINK | Consideration | Páginas/Sessão, Scroll 75%, Engajamento | Páginas/sessão > 2.0 |
| DO | Conversão | EPC, CR, RPV, ROAS | EPC > R$0.50 BR / > $0.80 US |
| CARE | Retenção | Open rate, CTR email, Retornantes | Open rate > 22% BR |

### Kaushik Methodology — Hierarquia de Análise

```
1. Contexto Primeiro — O que aconteceu? (dados brutos)
2. Por Que Aconteceu? — Drill-down, segmentação
3. E Agora? — Recomendação acionável, não apenas observação
```

**Regra de Ouro de Kaushik:** Cada métrica deve ter três elementos:
- Baseline histórica (o que é "normal")
- Alvo (o que queremos atingir)
- Segmentação (qual subconjunto explica o movimento)

### Benchmarks de EPC por Nicho (2025)

| Nicho | EPC Bom (BR) | EPC Bom (US) |
|-------|-------------|-------------|
| Infoproduto / Saúde | > R$1.50 | > $1.50 |
| Suplementos físicos | > R$0.80 | > $1.00 |
| Software / SaaS | > R$1.00 | > $1.80 |
| Finanças / Investimentos | > R$2.00 | > $3.00 |
| Geral / E-commerce | > R$0.50 | > $0.80 |

### RAG por Variação vs Período Anterior

| Variação | Status |
|----------|--------|
| > +10% | Green |
| -10% a +10% | Amber (estável) |
| -10% a -30% | Amber (alerta) |
| < -30% | Red (ação imediata) |

## Veto Conditions

- **HARD VETO:** Executar análise com menos de 7 dias de dados — volume insuficiente para significância estatística
- **HARD VETO:** Comparar períodos com características fundamentalmente diferentes sem ajuste (ex: novembro com mês de Black Friday vs novembro sem) sem nota explícita
- **SOFT VETO:** Emitir recomendação sem hipótese de causa clara — análise sem diagnóstico gera ações aleatórias
- **ALERTA:** Mais de 8 métricas classificadas como Red sem priorização — paralisia por análise; escolher os 3 maiores impactos

## Output

- **File:** `outputs/affiliates/{projeto-slug}/performance-analysis-{YYYY-MM}.md`
- **Format:** Markdown com tabelas, RAG scores e lista de ações

## Output Example

```yaml
performance_analysis:
  project: "afiliado-fitness-br"
  period: "2026-01 vs 2025-12"
  analyst: "performance-analyst"
  analysis_date: "2026-02-18"

stdc_scorecard:
  see:
    organic_sessions: { current: 4820, previous: 4210, delta: "+14.5%", rag: "green" }
    impressions_gsc: { current: 98000, previous: 87000, delta: "+12.6%", rag: "green" }
    new_users_pct: { current: "72%", previous: "68%", rag: "green" }

  think:
    pages_per_session: { current: 2.4, previous: 2.1, delta: "+14.3%", rag: "green" }
    avg_engagement_time: { current: "2m 15s", previous: "1m 48s", rag: "green" }
    scroll_75pct: { current: "44%", previous: "38%", rag: "green" }

  do:
    epc: { current: "R$1.82", previous: "R$2.10", delta: "-13.3%", rag: "amber" }
    cr: { current: "3.1%", previous: "3.8%", delta: "-18.4%", rag: "amber" }
    rpv: { current: "R$0.63", previous: "R$0.72", delta: "-12.5%", rag: "amber" }
    revenue_total: { current: "R$3.040", previous: "R$3.024", delta: "+0.5%", rag: "green" }

  care:
    email_open_rate: { current: "24.2%", previous: "25.8%", rag: "green" }
    email_ctr: { current: "3.4%", previous: "3.2%", rag: "green" }
    returning_users_pct: { current: "28%", previous: "24%", rag: "green" }

top_10_rule:
  critical_metrics: [epc, cr, organic_sessions]
  diagnosis: |
    EPC e CR caíram simultaneamente em jan/26 apesar de volume crescente.
    Hipótese principal: Hotmart alterou comissão do produto "Emagreça em Casa"
    de R$97 para R$79 em 15/01. Confirmar no dashboard da plataforma.

top_3_actions:
  - action: "Verificar e confirmar mudança de comissão no Hotmart"
    ice_preview: 9.0
    deadline: "2026-02-19"
  - action: "Testar headline alternativa na bridge page (CR drop de 18%)"
    ice_preview: 7.5
    deadline: "2026-02-25"
  - action: "Adicionar segundo produto afiliado ao funnel (diversificação EPC)"
    ice_preview: 6.8
    deadline: "2026-03-01"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
