# portfolio-review

## Metadata
```yaml
task_id: AFF_GRW_004
agent: growth-optimizer + performance-analyst
type: analysis
complexity: high
estimated_time: "2h-4h"
source: "BCG Growth-Share Matrix (adapted for affiliate portfolio) + Portfolio Management Theory"
```

## Purpose
Executar revisão mensal do portfólio completo de afiliados aplicando a matriz BCG adaptada, classificar cada produto/canal/campanha em Stars, Cash Cows, Problem Children ou Dogs, e redistribuir budget conforme alocação estratégica recomendada (60/30/10).

## Prerequisites
- Dados de performance de L30D para todos os ativos do portfólio (AFF_ANL_002)
- EPC benchmarking atualizado (AFF_ANL_006)
- Decisões SMPK recentes (AFF_GRW_002) para contexto de iniciativas já avaliadas
- Lista completa de todos produtos afiliados, canais e campanhas ativas

## Steps

1. **Inventariar portfólio completo** — Listar todos os ativos ativos e inativos (recentes) do negócio de afiliados:
   - Produtos afiliados (por plataforma, por nicho, por comissão)
   - Canais de tráfego (orgânico, pago, email, social, YouTube, referral)
   - Campanhas pagas ativas
   - Sites ou propriedades afiliadas (se houver múltiplos sites)

2. **Calcular métricas comparativas por ativo** — Para cada ativo do portfólio:
   - Receita mensal gerada
   - Participação no portfólio (% da receita total)
   - Crescimento MoM (ou MoM médio L3M)
   - EPC e CR
   - Custo/esforço mensal (em horas ou em R$)
   - ROI = Receita / Custo

3. **Classificar na Matriz BCG Adaptada** — Para cada ativo, avaliar dois eixos:
   - **Eixo X — Participação relativa no portfólio:** percentual da receita total que o ativo representa
   - **Eixo Y — Taxa de crescimento:** crescimento MoM do ativo

   Usar os quadrantes:
   ```
   Stars:           Alta participação + Alto crescimento
   Cash Cows:       Alta participação + Baixo crescimento (maduro, estável)
   Problem Children: Baixa participação + Alto crescimento (promissor, precisa de investimento)
   Dogs:            Baixa participação + Baixo crescimento (candidato a Kill)
   ```

4. **Definir thresholds de classificação para o portfólio** — Adaptar BCG ao tamanho atual:
   - "Alta participação" = > 20% da receita total do portfólio
   - "Alto crescimento" = crescimento MoM > 10%
   Recalibrar thresholds se o portfólio for muito concentrado (um ativo > 60%) ou muito distribuído.

5. **Montar Mapa do Portfólio** — Visualizar todos os ativos no quadrante BCG (tabela ou desenho ASCII). Cada ativo deve aparecer em exatamente um quadrante.

6. **Aplicar regra de alocação de budget** — Conforme a classificação BCG:
   - **Stars (60% do budget total):** Máximo investimento — escalar tráfego, mais conteúdo, mais emails
   - **Cash Cows (30% do budget):** Manter investimento — proteger e otimizar, não negligenciar
   - **Problem Children (10% do budget):** Investimento seletivo — validar se problema é de escala ou de produto
   - **Dogs:** Sem novo investimento — manter no ar apenas se custo de manutenção for zero ou próximo

7. **Identificar movimentos estratégicos** — Para cada quadrante, definir objetivo dos próximos 30 dias:
   - Stars: Qual % de crescimento é meta?
   - Cash Cows: Qual otimização incremental é possível sem riscos?
   - Problem Children: O que falta para se tornar Star? É questão de volume ou de product-market fit?
   - Dogs: Kill ou aguardar 30 dias com custo zero?

8. **Calcular concentração de risco** — Verificar se o portfólio está saudavelmente diversificado:
   - Se um único ativo > 50% da receita → alerta de concentração (risco se perder esse ativo)
   - Se um único canal > 60% do tráfego → alerta de dependência de canal
   - Recomendar diversificação se concentração for crítica

9. **Formular plano de portfolio para os próximos 30 dias** — Com base na análise:
   - Quais ativos escalar e como
   - Quais otimizar e o que especificamente
   - Quais validar com experimento (AFF_GRW_003)
   - Quais eliminar (executar via AFF_GRW_002 Kill)
   - Quais novos ativos adicionar (de `channel-expansion-plan.md` AFF_GRW_007)

10. **Documentar e distribuir** — Salvar relatório mensal de portfólio. Compartilhar decisões com agentes relevantes. Agendar próxima revisão (mesmo dia do mês seguinte).

## Framework

### Matriz BCG Adaptada para Afiliados

```
                        CRESCIMENTO ALTO
                              |
    Problem Children          |          Stars
    (baixa participação,      |    (alta participação,
     alto crescimento)        |     alto crescimento)
    → Investimento seletivo   |    → Escalar agressivamente
                              |
------------------------------------- PARTICIPAÇÃO
    Alta ◄──────────────────────────────────── Baixa
                              |
    Dogs                      |          Cash Cows
    (baixa participação,      |    (alta participação,
     baixo crescimento)       |     baixo crescimento)
    → Eliminar ou manter zero |    → Proteger e extrair
                              |
                        CRESCIMENTO BAIXO
```

### Alocação de Budget por Quadrante

| Quadrante | Budget % | Lógica | Ação Principal |
|-----------|---------|--------|---------------|
| Stars | 60% | Alto retorno + Alto potencial | Escalar: mais tráfego, mais conteúdo, mais emails |
| Cash Cows | 30% | Retorno garantido + Maturidade | Proteger: manutenção de qualidade, otimizações incrementais |
| Problem Children | 10% | Potencial não confirmado | Validar: 1-2 experimentos focados para confirmar viabilidade |
| Dogs | 0% | Custo > Retorno | Eliminar ou manter zero esforço |

### Sinais de Risco de Portfólio

| Sinal | Threshold | Ação |
|-------|----------|------|
| Concentração de receita | 1 ativo > 50% | Priorizar diversificação no portfólio plan |
| Dependência de canal | 1 canal > 60% tráfego | Iniciar canal alternativo (AFF_GRW_007) |
| Dogs acima do esperado | > 30% ativos como Dog | Auditar critérios de entrada de novos produtos |
| Stars diminuindo | Stars < 1 ativo | Mover Problem Children promissores para Stars |
| Cash Cows em declínio | CR ou EPC caindo > 20% | Investigar antes de reclassificar; pode ser temporal |

### Cadência do Portfolio Review

| Frequência | Tipo | Escopo |
|-----------|------|--------|
| Semanal | SMPK micro (AFF_GRW_002) | Campanhas pagas |
| Quinzenal | EPC benchmarking (AFF_ANL_006) | Produtos afiliados |
| Mensal | Portfolio Review (este task) | Portfólio completo |
| Trimestral | Attribution Audit (AFF_ANL_003) | Modelo de atribuição |

## Veto Conditions

- **HARD VETO:** Executar portfolio review sem dados de L30D completos para todos os ativos — classificação BCG com dados parciais distorce o quadrante e leva a decisões incorretas
- **HARD VETO:** Classificar ativo com menos de 30 dias de dados como Dog e eliminá-lo — período insuficiente para classificação definitiva; usar Pause primeiro
- **SOFT VETO:** Alocar mais de 70% do budget em um único ativo Stars — concentração extrema amplifica risco mesmo para Star; diversificar gradualmente
- **ALERTA:** Portfolio sem nenhum Star — negócio estagnado; priorizar experimentos de crescimento (AFF_GRW_003) e identificar Problem Children com maior potencial

## Output

- **File:** `outputs/affiliates/{projeto-slug}/portfolio-review-{YYYY-MM}.md`
- **Format:** Markdown com mapa BCG, tabela de ativos e plano dos próximos 30 dias

## Output Example

```yaml
portfolio_review:
  project: "afiliado-fitness-br"
  analysts: ["growth-optimizer", "performance-analyst"]
  period: "2026-01"
  review_date: "2026-02-18"
  total_revenue_month: "R$4.920"
  total_assets_reviewed: 6

bcg_matrix:
  stars:
    - asset: "Email Marketing — Lista Própria"
      type: "canal"
      revenue_month: "R$2.160"
      portfolio_share: "43.9%"
      mom_growth: "+18%"
      epc: "R$2.40"
      budget_action: "Aumentar frequência de envio. Criar segmento VIP para promoções exclusivas."

  cash_cows:
    - asset: "Review Article — Blog Orgânico"
      type: "conteúdo/canal"
      revenue_month: "R$1.490"
      portfolio_share: "30.3%"
      mom_growth: "+4%"
      epc: "R$1.20"
      budget_action: "Manter qualidade do artigo. Testar bônus exclusivo (EXP-007 planejado)."

  problem_children:
    - asset: "Meta Ads — Warm Retargeting"
      type: "campanha_paga"
      revenue_month: "R$750"
      portfolio_share: "15.2%"
      mom_growth: "+22%"
      epc: "R$0.90"
      budget_action: "Aumentar budget de R$300 para R$500/mês. Monitorar ROAS — meta 5x."
      validation: "Precisa confirmar sustentabilidade do crescimento por mais 30 dias"

  dogs:
    - asset: "Pinterest Orgânico"
      type: "canal"
      revenue_month: "R$15"
      portfolio_share: "0.3%"
      mom_growth: "-5%"
      epc: "R$0.12"
      budget_action: "KILL — já decidido em SMPK review. Redirecionar 3h/semana para SEO."

concentration_risk:
  highest_concentration: "Email (43.9%)"
  single_channel_traffic: "SEO: 62% do tráfego"
  risk_level: "MEDIUM"
  recommendation: "Iniciar expansão para canal secundário (YouTube ou Social) nos próximos 90 dias"

budget_allocation:
  stars_target: "60% = R$2.952/mês"
  cash_cows_target: "30% = R$1.476/mês"
  problem_children_target: "10% = R$492/mês"
  dogs_target: "0%"

portfolio_plan_next_30_days:
  - action: "Lançar segmento VIP na lista de email (Stars)"
    owner: "email-nurture"
    deadline: "2026-02-28"
  - action: "Executar EXP-007 — bônus no review article (Cash Cow otimização)"
    owner: "growth-optimizer"
    deadline: "2026-02-20"
  - action: "Aumentar budget Meta Ads Retargeting de R$300 para R$500 (Problem Child)"
    owner: "affiliates-chief"
    deadline: "2026-02-20"
  - action: "Eliminar Pinterest (Dog — KILL)"
    owner: "growth-optimizer"
    deadline: "2026-02-19"

next_review: "2026-03-18"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
