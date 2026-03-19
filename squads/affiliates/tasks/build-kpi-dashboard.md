# build-kpi-dashboard

## Metadata
```yaml
task_id: AFF_ANL_005
agent: performance-analyst
type: creation
complexity: medium
estimated_time: "2h-4h"
source: "Avinash Kaushik — STDC Dashboard Framework + Looker Studio Best Practices"
```

## Purpose
Construir um dashboard centralizado de KPIs organizado por stage STDC (See-Think-Do-Care) que consolida dados do GA4, Search Console e plataformas de afiliados em uma visão única, operacional e tomável em decisão.

## Prerequisites
- Rastreamento configurado e funcionando (AFF_ANL_001)
- Conta Google Looker Studio (gratuito) ou acesso a Notion / planilha equivalente
- GA4 com pelo menos 30 dias de dados históricos
- Google Search Console vinculado ao GA4
- Acesso ao relatório financeiro da(s) plataforma(s) de afiliados
- Pelo menos uma análise de performance executada (AFF_ANL_002) para definir benchmarks

## Steps

1. **Definir audiência e frequência do dashboard** — Confirmar quem usa o dashboard, com qual frequência (diário, semanal, mensal) e para quais decisões. Dashboard operacional (diário) tem KPIs diferentes de dashboard estratégico (mensal).

2. **Mapear KPIs por stage STDC** — Selecionar no máximo 3-4 KPIs por stage (regra de Kaushik: menos métricas, mais foco). Usar a tabela do Framework como base e adaptar ao nicho específico.

3. **Criar conexões de dados no Looker Studio** — Conectar as fontes:
   - GA4 Property → Conector nativo do Looker Studio
   - Google Search Console → Conector nativo
   - Plataforma de afiliados → Exportar CSV semanal / usar planilha intermediária (se não houver API)

4. **Construir seção SEE (Awareness)** — Adicionar widgets:
   - Scorecard: Sessões totais + variação vs período anterior
   - Scorecard: Impressões orgânicas (GSC)
   - Gráfico de linha: Sessões por dia (L30D)
   - Tabela: Sessões por canal (orgânico, pago, social, email, referral)
   - Mapa geográfico (se mercado multi-estado ou BR vs Internacional)

5. **Construir seção THINK (Consideration)** — Adicionar widgets:
   - Scorecard: Páginas por sessão
   - Scorecard: Tempo médio de engajamento
   - Tabela: Top 10 páginas por sessões + scroll depth (via GA4 event)
   - Gráfico de barras: Distribuição de scroll depth (25%, 50%, 75%, 100%)

6. **Construir seção DO (Decision/Conversion)** — Adicionar widgets:
   - Scorecard: EPC (calculado: receita / cliques em link afiliado)
   - Scorecard: Taxa de conversão (CR)
   - Scorecard: RPV (Revenue Per Visitor)
   - Scorecard: Receita total (período selecionado)
   - Gráfico de linha: Receita diária (L30D)
   - Tabela: Receita por produto afiliado

7. **Construir seção CARE (Retention)** — Adicionar widgets:
   - Scorecard: Taxa de abertura de email (fonte: planilha exportada do ESP)
   - Scorecard: Taxa de clique email
   - Scorecard: Usuários retornantes (%)
   - Gráfico: Crescimento de lista de email (MoM)

8. **Adicionar filtros e controles** — Inserir controles de data (date range picker), filtro de canal, filtro de produto afiliado. Garantir que todos os widgets respondam aos filtros.

9. **Configurar alertas de threshold** — No GA4, configurar "Insights" automáticos para:
   - Queda de sessões > 20% semana a semana
   - Queda de receita > 15% semana a semana
   Para plataformas sem alertas nativos, configurar verificação manual semanal no calendário.

10. **Publicar e compartilhar** — Publicar o dashboard no Looker Studio, configurar acesso (view only para stakeholders), e documentar URL + instruções de leitura no arquivo de output.

## Framework

### KPIs STDC por Stage — Mapa Completo

| Stage | KPI | Fórmula | Fonte | Benchmark |
|-------|-----|---------|-------|-----------|
| **SEE** | Sessões totais | — | GA4 | Crescimento MoM > 5% |
| **SEE** | Impressões GSC | — | Search Console | Crescimento MoM > 8% |
| **SEE** | Usuários novos | — | GA4 | > 60% das sessões |
| **SEE** | Alcance social | — | Plataforma social | — |
| **THINK** | Páginas/Sessão | sessões / pageviews | GA4 | > 2.0 |
| **THINK** | Tempo engajamento | média em segundos | GA4 | > 90s |
| **THINK** | Scroll depth 75% | eventos scroll / sessões | GA4 | > 35% |
| **THINK** | Taxa de rejeição | sessões sem engajamento / total | GA4 | < 60% |
| **DO** | EPC | receita / cliques afiliado | Plataforma + GA4 | > R$0.50 BR |
| **DO** | CR | vendas / cliques afiliado | Plataforma | > 2% |
| **DO** | RPV | receita / sessões | Plataforma + GA4 | > R$0.30 |
| **DO** | ROAS | receita / gasto em ads | Ads + Plataforma | > 3x |
| **CARE** | Open rate email | aberturas / enviados | ESP | > 22% BR |
| **CARE** | CTR email | cliques / aberturas | ESP | > 3% |
| **CARE** | Retornantes % | usuários retornantes / total | GA4 | > 20% |
| **CARE** | Crescimento lista | novos subs / mês | ESP | > 5% MoM |

### Estrutura de Layout Recomendada — Looker Studio

```
┌─────────────────────────────────────────────────┐
│  HEADER: Logo + Nome do Projeto + Date Range     │
├──────────┬──────────┬──────────┬─────────────────┤
│  SEE     │  THINK   │  DO      │  CARE           │
│ Sessões  │ Pág/Sess │ EPC      │ Open Rate Email  │
│ Impress. │ Engaj.   │ CR       │ CTR Email        │
│ Usuários │ Scroll   │ RPV      │ Retornantes %    │
│ Novos    │ 75%      │ Receita  │ Lista Growth     │
├──────────┴──────────┴──────────┴─────────────────┤
│  Gráfico de Linha: Receita e Sessões L30D        │
├─────────────────────────────────────────────────┤
│  Tabela: Top 10 Páginas | Tabela: Top Produtos   │
└─────────────────────────────────────────────────┘
```

### Regras de Design do Dashboard

1. **Máximo 4 KPIs por stage** — excesso de métricas paralisa decisão
2. **Sempre mostrar variação vs período anterior** — contexto é tudo
3. **Código de cores RAG** — Verde/Amarelo/Vermelho por threshold definido
4. **Um filtro de data global** — todos os widgets respondem ao mesmo período
5. **Fonte de dados explícita** — indicar de onde vem cada métrica

## Veto Conditions

- **HARD VETO:** Dashboard sem fonte de dados de conversão/receita validada — dashboard de vaidade (sessões sem receita) não suporta decisões de negócio
- **HARD VETO:** Criar dashboard antes de rastreamento configurado (AFF_ANL_001) — dados incorretos levam a conclusões incorretas
- **SOFT VETO:** Dashboard com mais de 20 KPIs — cada estágio deve ter no máximo 4 KPIs foco; criar seção de "métricas detalhadas" separada se necessário
- **ALERTA:** Ausência de comparação temporal (sem variação vs período anterior) — scorecard sem contexto é apenas um número, não uma métrica

## Output

- **File:** `outputs/affiliates/{projeto-slug}/kpi-dashboard-spec.md`
- **Format:** Markdown com especificação completa + URL do Looker Studio publicado

## Output Example

```yaml
kpi_dashboard:
  project: "afiliado-fitness-br"
  created_by: "performance-analyst"
  created_at: "2026-02-18"
  tool: "Google Looker Studio"
  url: "https://lookerstudio.google.com/reporting/XXXXXXXX"
  refresh_rate: "daily"
  audience: "operacional — verificação diária pelo operador"

data_sources:
  - name: "GA4 — afiliado-fitness-br"
    connector: "Google Analytics (native)"
    property_id: "G-XXXXXXXXXX"
  - name: "Search Console"
    connector: "Search Console (native)"
    property: "sc-domain:seudominio.com.br"
  - name: "Hotmart — Receita e EPC"
    connector: "Google Sheets (planilha exportada semanalmente)"
    sheet_id: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

kpis_configured:
  see:
    - metric: "Sessões Totais"
      current_value: "5.240"
      benchmark: "> 4.500/mês"
      rag: "green"
    - metric: "Impressões GSC"
      current_value: "112.000"
      benchmark: "> 80.000/mês"
      rag: "green"
    - metric: "Usuários Novos %"
      current_value: "74%"
      benchmark: "> 60%"
      rag: "green"

  think:
    - metric: "Páginas por Sessão"
      current_value: "2.6"
      benchmark: "> 2.0"
      rag: "green"
    - metric: "Tempo Médio Engajamento"
      current_value: "2m 28s"
      benchmark: "> 1m 30s"
      rag: "green"

  do:
    - metric: "EPC"
      current_value: "R$1.82"
      benchmark: "> R$1.50"
      rag: "green"
    - metric: "CR"
      current_value: "3.1%"
      benchmark: "> 2.0%"
      rag: "green"
    - metric: "Receita Total (mês)"
      current_value: "R$4.920"
      benchmark: "meta: R$5.000"
      rag: "amber"

  care:
    - metric: "Open Rate Email"
      current_value: "24.2%"
      benchmark: "> 22%"
      rag: "green"
    - metric: "Usuários Retornantes %"
      current_value: "26%"
      benchmark: "> 20%"
      rag: "green"

alerts_configured:
  - trigger: "Sessões semanais caem > 20%"
    channel: "GA4 Insights + email"
  - trigger: "Receita semanal cai > 15%"
    channel: "verificação manual — calendário toda segunda-feira"

next_review: "2026-03-18"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
