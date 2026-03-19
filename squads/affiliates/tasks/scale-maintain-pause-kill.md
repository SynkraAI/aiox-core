# scale-maintain-pause-kill

## Metadata
```yaml
task_id: AFF_GRW_002
agent: growth-optimizer
type: analysis
complexity: medium
estimated_time: "45min-1h30min"
source: "Performance Marketing Decision Framework — Brad Geddes + ROAS-Based Portfolio Management"
```

## Purpose
Aplicar a matriz de decisão Scale/Maintain/Pause/Kill a cada campanha, canal e produto afiliado ativo, garantindo que orçamento e atenção sejam redistribuídos das iniciativas mortas para as que merecem escala.

## Prerequisites
- Dados de ROAS, EPC e tendência de cada campanha/canal ativo (mínimo L30D)
- ICE scores atualizados (AFF_GRW_001) para contexto de prioridade
- Acesso ao dashboard de performance (AFF_ANL_005)
- Lista de toda iniciativa ativa (campanhas pagas, canais orgânicos, produtos afiliados)

## Steps

1. **Inventariar todas as iniciativas ativas** — Listar cada campanha paga, canal orgânico e produto afiliado ativo com o período de vida atual e investimento/esforço alocado.

2. **Coletar métricas de decisão** — Para cada iniciativa, levantar obrigatoriamente:
   - ROAS (se há investimento em ads): receita / gasto
   - EPC (earnings per click)
   - Tendência de EPC: crescendo / estável / declinando (L14D vs L14D anterior)
   - ICE Score atual (ou estimar rapidamente)
   - Volume de cliques/mês (relevância do canal)

3. **Aplicar Matriz de Decisão Primária** — Usar ROAS como critério primário para campanhas pagas:
   ```
   ROAS > 5x       → SCALE candidate
   ROAS 3x-5x      → MAINTAIN
   ROAS 1x-3x      → PAUSE (reconstruir ou otimizar)
   ROAS < 1x       → KILL (prejuízo)
   ```
   Para canais orgânicos (sem ROAS direto), usar EPC vs benchmark e tendência.

4. **Aplicar filtros secundários** — Antes de confirmar decisão, cruzar com:
   - **EPC Trend:** ROAS 4x com EPC declinando → rebaixar para Maintain ou Pause
   - **Volume:** ROAS 6x com apenas 50 cliques/mês → não é Scale (volume insuficiente para dados confiáveis)
   - **ICE Score:** Campanha com ROAS 4x e ICE alto → priorizar no Maintain vs outras
   - **Sazonalidade:** Pause temporário ≠ Kill; documentar se a pausa é sazonal

5. **Tomar decisão por iniciativa** — Para cada iniciativa, registrar:
   - Decisão: Scale / Maintain / Pause / Kill
   - Justificativa com dados (não opinião)
   - Ação específica (não apenas a decisão)
   - Deadline da ação

6. **Definir ações por decisão** — Traduzir cada decisão em ação concreta:
   - **Scale:** Aumentar budget em X% ou publicar Y artigos adicionais ou escalar lista de email
   - **Maintain:** Manter parâmetros atuais, monitorar semanalmente, testar otimização incremental
   - **Pause:** Desativar campanha por Z dias, revisar ângulo/criativo/produto antes de reativar
   - **Kill:** Desativar permanentemente, redirecionar budget/esforço para Scale candidates

7. **Calcular redistribuição de recursos** — Somar esforço/budget liberado pelas decisões Kill e Pause, e alocar para as iniciativas Scale e Maintain prioritárias. Orçamento morto não pode ficar em reserva — redirecionar imediatamente.

8. **Documentar racional de Kill** — Para cada iniciativa morta, documentar:
   - Por que foi criada originalmente
   - O que foi aprendido
   - O que não fazer novamente
   - Se algum elemento pode ser aproveitado em iniciativas vivas

9. **Criar calendário de revisão** — Definir frequência de revisão por tipo de iniciativa:
   - Campanhas pagas: semanal
   - Canais orgânicos (SEO, YouTube): mensal
   - Produtos afiliados: quinzenal
   - Portfolio completo: mensal (via `portfolio-review.md` AFF_GRW_004)

10. **Salvar decisões e comunicar** — Documentar todas as decisões no arquivo de output. Comunicar ações para agentes responsáveis (copy-vendas para otimizações de copy, seo-content para conteúdo, etc.).

## Framework

### Matriz de Decisão — Critérios por Tipo

#### Campanhas Pagas (ROAS como primário)

| ROAS | EPC Trend | Decisão | Ação |
|------|-----------|---------|------|
| > 5x | Crescendo | SCALE | Aumentar budget 20-50% por semana |
| > 5x | Estável | SCALE | Aumentar budget 20% e monitorar |
| > 5x | Declinando | MAINTAIN | Investigar causa antes de escalar |
| 3x-5x | Crescendo | SCALE candidato | Testar aumento de budget pequeno |
| 3x-5x | Estável | MAINTAIN | Otimizar incrementalmente |
| 3x-5x | Declinando | PAUSE | Revisar criativo e produto |
| 1x-3x | Qualquer | PAUSE | 14 dias off, revisar ângulo completo |
| < 1x | Qualquer | KILL | Desativar e redirecionar |

#### Canais Orgânicos (EPC vs benchmark como primário)

| EPC vs Benchmark | Volume | Tendência | Decisão |
|-----------------|--------|-----------|---------|
| > 150% | Alto | Crescendo | SCALE (mais conteúdo, mais links) |
| > 150% | Baixo | Qualquer | MAINTAIN (aumentar volume gradual) |
| 100-150% | Qualquer | Estável | MAINTAIN |
| 70-99% | Alto | Crescendo | MAINTAIN (otimizar CTA) |
| 70-99% | Qualquer | Declinando | PAUSE (revisar estratégia de conteúdo) |
| < 70% | Qualquer | Qualquer | PAUSE ou KILL (depende de esforço) |

### Regras de Scale Seguro

```
Nunca escalar mais de 50% de budget em uma única semana
Aguardar pelo menos 3 dias de dados após cada aumento antes do próximo
Volume mínimo para dados confiáveis: 200 cliques no link afiliado
Ao escalar budget de ads, manter mesmos criativos e audiências — não mudar variáveis
```

### Diferença entre Pause e Kill

| Critério | PAUSE | KILL |
|---------|-------|------|
| Problema identificável? | Sim — criativo, produto, ângulo | Não — estruturalmente inviável |
| Existe plano de correção? | Sim — definido e com deadline | Não — sem caminho claro |
| Histórico de performance? | Já performou bem antes | Nunca funcionou ou piora consistente |
| Custo de oportunidade? | Baixo (budget menor) | Alto (recurso melhor em outro lugar) |

## Veto Conditions

- **HARD VETO:** Decidir Kill com menos de 14 dias de dados ou menos de 200 cliques — volume insuficiente para decisão definitiva; usar Pause primeiro
- **HARD VETO:** Escalar budget mais de 50% em uma semana sem período de estabilização — algoritmos de ads precisam de tempo para ajustar; escalonamento agressivo queima o aprendizado
- **SOFT VETO:** Kill sem documentar o que foi aprendido — desperdiça conhecimento; o erro tem valor se registrado
- **ALERTA:** Mais de 60% do portfólio no status Maintain — crescimento estagnado; verificar se há novas iniciativas no backlog ICE para executar

## Output

- **File:** `outputs/affiliates/{projeto-slug}/smpk-decisions-{YYYY-MM-DD}.md`
- **Format:** Markdown com tabela de decisões e plano de redistribuição de recursos

## Output Example

```yaml
smpk_review:
  project: "afiliado-fitness-br"
  analyst: "growth-optimizer"
  review_date: "2026-02-18"
  total_initiatives: 7

decisions:
  scale:
    - initiative: "Email sequence — lista própria (5.200 subs)"
      type: "canal_organico"
      epc: "R$2.40"
      vs_benchmark: "240%"
      trend: "estável"
      action: "Aumentar frequência de 1x para 2x por semana. Adicionar email #6 ao final da sequência."
      owner: "email-nurture"
      deadline: "2026-02-25"

    - initiative: "Blog review — artigo principal 'melhor suplemento emagrecimento'"
      type: "canal_organico"
      epc: "R$1.20"
      vs_benchmark: "120%"
      trend: "crescendo (+15% L14D)"
      action: "Publicar 3 artigos de cluster para reforçar autoridade e aumentar tráfego para o review."
      owner: "seo-content"
      deadline: "2026-03-15"

  maintain:
    - initiative: "Meta Ads — Warm Retargeting"
      type: "campanha_paga"
      roas: "4.1x"
      epc: "R$0.90"
      trend: "estável"
      action: "Manter budget atual (R$300/mês). Testar novo criativo de depoimento em próxima sprint."
      review_date: "2026-03-18"

  pause:
    - initiative: "Meta Ads — Cold Audience (Lookalike 1%)"
      type: "campanha_paga"
      roas: "1.8x"
      epc: "R$0.50"
      trend: "declinando"
      action: "Pausar por 14 dias. Reescrever bridge page com novo ângulo (problem-aware). Reativar e testar."
      owner: "copy-vendas"
      pause_deadline: "2026-02-19"
      reactivation_review: "2026-03-05"

  kill:
    - initiative: "Pinterest Orgânico"
      type: "canal_organico"
      epc: "R$0.12"
      vs_benchmark: "12%"
      clicks_per_month: 45
      reason: "Esforço alto (3h/semana), volume irrisório, EPC crítico. ROI de atenção negativo."
      action: "Desativar conta. Redirecionar 3h/semana para cluster de blog."
      lesson_learned: "Nicho fitness no Brasil não tem audiência compradora ativa no Pinterest BR. Testar apenas em US se houver produto global."
      action_date: "2026-02-19"

resource_reallocation:
  freed_budget_monthly: "R$0 (Pinterest era orgânico)"
  freed_time_weekly: "3h"
  reallocation: "3h/semana → criação de artigos para cluster SEO (Scale decision #2)"

next_review: "2026-03-18"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
