# epc-benchmarking

## Metadata
```yaml
task_id: AFF_ANL_006
agent: performance-analyst
type: analysis
complexity: medium
estimated_time: "45min-1h30min"
source: "Affiliate Industry EPC Benchmarks 2025 — ClickBank, ShareASale, Impact + Niche-Specific Data"
```

## Purpose
Produzir análise comparativa de EPC (Earnings Per Click) entre campanhas, canais e nichos, identificando quais combinações performam acima do benchmark de mercado e onde existem oportunidades de otimização de rendimento por clique.

## Prerequisites
- Dados de EPC disponíveis em pelo menos 2 campanhas ou canais diferentes
- Acesso ao dashboard da plataforma de afiliados (mínimo L30D de dados)
- Acesso ao GA4 com dados de cliques por canal/campanha
- Benchmarks de EPC do nicho (tabela no Framework abaixo como referência inicial)

## Steps

1. **Coletar dados de EPC por dimensão** — Extrair EPC segmentado pelas três dimensões principais:
   - **Cross-campaign:** EPC por campanha ativa (bridge page A vs B, review article vs comparativo)
   - **Cross-channel:** EPC por canal de tráfego (orgânico, Meta Ads, email, YouTube)
   - **Cross-niche:** Se o portfólio tiver múltiplos nichos, EPC por nicho

2. **Calcular EPC por segmento** — Para cada segmento, calcular:
   ```
   EPC = Receita total do segmento / Total de cliques no link afiliado do segmento
   ```
   Incluir volume de cliques (mínimo 100 cliques para relevância estatística).

3. **Construir tabela comparativa** — Organizar todos os segmentos em tabela com:
   - Segmento (campanha/canal/nicho)
   - Cliques totais
   - Receita gerada
   - EPC calculado
   - Benchmark de referência para o segmento
   - Status: Above / At / Below benchmark

4. **Aplicar benchmarks de mercado 2025** — Comparar EPC interno com benchmarks do setor usando a tabela do Framework. Classificar cada segmento como:
   - **Elite:** > 150% do benchmark
   - **Strong:** 100-150% do benchmark
   - **Average:** 70-99% do benchmark
   - **Below:** < 70% do benchmark
   - **Critical:** < 50% do benchmark (ação imediata)

5. **Analisar fatores de EPC alto** — Para segmentos Elite ou Strong, identificar fatores que podem explicar o desempenho superior:
   - Qualidade do tráfego (intenção de compra alta)
   - Tipo de conteúdo (review detalhado vs artigo genérico)
   - CTA posicionado above the fold
   - Produto com alta conversão na página do produtor
   - Audiência aquecida (email vs cold traffic)

6. **Analisar fatores de EPC baixo** — Para segmentos Below ou Critical:
   - Tráfego frio sem pre-sell adequado
   - Produto com baixa taxa de conversão na página do produtor
   - Comissão baixa (estrutural, não operacional)
   - CTA enterrado abaixo do fold ou pouco claro
   - Nicho sem demanda suficiente (tráfego existe, compra não)

7. **Calcular EPC alvo por segmento** — Definir meta de EPC realista para os próximos 90 dias para cada segmento Below ou Critical, com base no potencial identificado e ações planejadas.

8. **Identificar Quick Wins** — Apontar 1-3 ações de curto prazo (< 2 semanas) que têm maior probabilidade de elevar EPC de segmentos Average ou Below:
   - Mover CTA para posição mais visível
   - Adicionar bônus exclusivo para aumentar conversão
   - Testar produto alternativo com comissão maior
   - Melhorar pre-sell na bridge page

9. **Priorizar otimizações via potencial de impacto** — Rankear ações por: (EPC atual) × (volume de cliques) × (delta EPC esperado). Maior impacto monetário primeiro.

10. **Documentar e programar revisão** — Salvar relatório de benchmarking. Programar próxima revisão em 30 dias para medir progresso das ações de otimização.

## Framework

### Benchmarks de EPC por Nicho e Mercado (2025)

| Nicho | EPC Bom (BR) | EPC Bom (US/Global) | EPC Elite (BR) | EPC Elite (US) |
|-------|-------------|---------------------|---------------|----------------|
| Saúde & Emagrecimento | > R$1.00 | > $1.20 | > R$2.00 | > $2.50 |
| Infoprodutos Digitais | > R$0.80 | > $1.00 | > R$1.80 | > $2.00 |
| Suplementos Físicos | > R$0.60 | > $0.90 | > R$1.20 | > $1.80 |
| Finanças / Crypto | > R$1.50 | > $2.00 | > R$3.00 | > $4.00 |
| Software / SaaS | > R$0.80 | > $1.50 | > R$2.00 | > $3.00 |
| Relacionamentos | > R$0.70 | > $0.80 | > R$1.50 | > $1.80 |
| Pet Care | > R$0.40 | > $0.70 | > R$1.00 | > $1.50 |
| E-commerce / Amazon | > R$0.20 | > $0.40 | > R$0.50 | > $0.80 |
| Prop Trading / Finanças BR | > R$2.00 | > $3.00 | > R$5.00 | > $8.00 |

### Benchmarks por Canal (Delta vs EPC Base)

| Canal | Multiplicador Típico | Explicação |
|-------|---------------------|-----------|
| Email (lista aquecida) | 1.5x - 2.5x | Audiência qualificada, relação de confiança |
| SEO Orgânico (review) | 1.2x - 2.0x | Alta intenção de compra (keyword de decisão) |
| YouTube (review) | 1.0x - 1.8x | Evidência visual do produto aumenta conversão |
| Meta Ads (warm) | 0.8x - 1.2x | Retargeting funciona, cold ads variável |
| Meta Ads (cold) | 0.4x - 0.8x | Requer bridge page forte para converter |
| Social Orgânico | 0.3x - 0.7x | Tráfego de curiosidade, intenção baixa |

### Cálculo de Prioridade de Otimização

```
Impacto Monetário Potencial =
  (Cliques mensais do segmento)
  × (EPC alvo - EPC atual)
  × (Probabilidade de atingir alvo)

Exemplo:
  Segmento: Blog Orgânico — Artigo Review
  Cliques/mês: 450
  EPC atual: R$0.90
  EPC alvo: R$1.50 (benchmark elite)
  Probabilidade: 70% (ajuste de CTA + bônus)

  Impacto = 450 × (1.50 - 0.90) × 0.70 = R$189/mês adicional
```

### Classificação de Desempenho por Benchmark

| Classificação | Threshold | Ação |
|-------------|----------|------|
| Elite | > 150% do benchmark | Escalar volume (mais tráfego para este canal) |
| Strong | 100-150% | Manter e testar otimizações incrementais |
| Average | 70-99% | Otimizar CTA, pre-sell, produto alternativo |
| Below | 50-70% | Revisar funil completo — problema estrutural |
| Critical | < 50% | Pausar ou substituir — custo de oportunidade alto |

## Veto Conditions

- **HARD VETO:** Calcular EPC com menos de 100 cliques no segmento — volume insuficiente para dado confiável; agregar períodos ou aguardar volume
- **HARD VETO:** Comparar EPC de canais sem isolar o produto afiliado — produto diferente = benchmark diferente, comparação inválida
- **SOFT VETO:** Recomendar pausar canal com EPC Below sem verificar sazonalidade — queda temporária não é EPC estruturalmente ruim
- **ALERTA:** EPC calculado com dados de plataforma nativa sem cruzamento com GA4 cliques — plataforma pode registrar cliques diferentes (postbacks vs clicks); documenta a fonte usada

## Output

- **File:** `outputs/affiliates/{projeto-slug}/epc-benchmarking-{YYYY-MM}.md`
- **Format:** Markdown com tabela comparativa, classificação e plano de otimização

## Output Example

```yaml
epc_benchmarking:
  project: "afiliado-fitness-br"
  period: "2026-01"
  analyst: "performance-analyst"
  benchmark_reference: "Saúde & Emagrecimento BR 2025"
  benchmark_good: "R$1.00"
  benchmark_elite: "R$2.00"

segments:
  - segment: "Email — Lista Própria (5.200 subs)"
    clicks: 380
    revenue: "R$912"
    epc: "R$2.40"
    vs_benchmark: "240%"
    classification: "Elite"
    action: "Escalar — aumentar frequência de emails para 2x/semana"

  - segment: "Blog Orgânico — Review Article"
    clicks: 520
    revenue: "R$624"
    epc: "R$1.20"
    vs_benchmark: "120%"
    classification: "Strong"
    action: "Testar bônus exclusivo para elevar para Elite"

  - segment: "Meta Ads — Warm Retargeting"
    clicks: 210
    revenue: "R$189"
    epc: "R$0.90"
    vs_benchmark: "90%"
    classification: "Average"
    action: "Testar novo criativo com depoimento. CTA mais direto."

  - segment: "Meta Ads — Cold Audience"
    clicks: 310
    revenue: "R$155"
    epc: "R$0.50"
    vs_benchmark: "50%"
    classification: "Critical"
    action: "Pausar. Redirecionar budget para email e orgânico enquanto bridge page não for otimizada."

  - segment: "YouTube Orgânico"
    clicks: 88
    revenue: null
    epc: null
    note: "Volume insuficiente (< 100 cliques) — aguardar mais dados"

portfolio_epc_weighted: "R$1.24"
portfolio_vs_benchmark: "124% — Strong"

quick_wins:
  - action: "Reescrever CTA da bridge page de Meta Ads Cold"
    expected_epc_lift: "+R$0.30"
    effort: "2h"
    deadline: "2026-02-22"
    ice_score: 7.8

  - action: "Adicionar bônus exclusivo (PDF checklist) no review article"
    expected_epc_lift: "+R$0.20"
    effort: "3h"
    deadline: "2026-02-28"
    ice_score: 7.2

next_benchmarking: "2026-03-18"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
