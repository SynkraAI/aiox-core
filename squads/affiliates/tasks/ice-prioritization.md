# ice-prioritization

## Metadata
```yaml
task_id: AFF_GRW_001
agent: growth-optimizer
type: analysis
complexity: low
estimated_time: "30min-1h"
source: "ICE Scoring Framework — Sean Ellis (GrowthHackers) + Intercom Growth Team Adaptation"
```

## Purpose
Avaliar e priorizar iniciativas de crescimento do negócio de afiliados usando o framework ICE (Impact × Confidence × Ease), garantindo que o esforço seja sempre alocado nas ações de maior retorno esperado antes de passar para ações de menor score.

## Prerequisites
- Lista de iniciativas ou hipóteses de crescimento identificadas (mínimo 5 itens para comparação significativa)
- Contexto suficiente de cada iniciativa para pontuar as três dimensões
- Dados de performance recente disponíveis (da análise AFF_ANL_002 ou KPI dashboard AFF_ANL_005)

## Steps

1. **Coletar e listar todas as iniciativas** — Reunir todas as iniciativas, oportunidades e experimentos pendentes em uma lista consolidada. Incluir iniciativas de qualquer dimensão: conteúdo, funil, email, ads, produto, parceria.

2. **Definir critérios de pontuação para o contexto** — Antes de pontuar, calibrar o que significam os extremos (1 e 10) para cada dimensão no contexto atual do negócio:
   - Impact 10 = duplicar receita mensal; Impact 1 = impacto irrelevante
   - Confidence 10 = evidência forte (A/B test anterior ou dado confirmado); Confidence 1 = hipótese sem nenhuma base
   - Ease 10 = 1 hora de trabalho; Ease 1 = 3+ semanas de implementação

3. **Pontuar Impact (1-10) para cada iniciativa** — Estimar o impacto potencial na métrica North Star (RPV ou receita) se a iniciativa funcionar conforme o esperado. Considerar:
   - Quantas pessoas são afetadas?
   - Qual o uplift esperado na métrica principal?
   - É impacto único ou recorrente?

4. **Pontuar Confidence (1-10) para cada iniciativa** — Avaliar o nível de certeza de que a iniciativa vai funcionar:
   - 9-10: Dados históricos próprios + dados de mercado + intuição forte
   - 7-8: Dados de benchmarks de terceiros ou teste piloto positivo
   - 5-6: Analogia de outro nicho ou lógica razoável sem dados
   - 3-4: Hipótese baseada em intuição sem suporte de dados
   - 1-2: Shot in the dark

5. **Pontuar Ease (1-10) para cada iniciativa** — Avaliar o custo de implementação:
   - 9-10: < 2h de trabalho, sem dependências externas
   - 7-8: < 1 dia, dependências mínimas (copy, design simples)
   - 5-6: 2-5 dias, requer planejamento ou colaboração
   - 3-4: 1-2 semanas, múltiplas dependências ou habilidades
   - 1-2: > 3 semanas ou requer orçamento significativo

6. **Calcular ICE Score** — Para cada iniciativa:
   ```
   ICE Score = (Impact + Confidence + Ease) / 3
   ```
   Arredondar para 1 casa decimal.

7. **Classificar e categorizar por score** — Aplicar as categorias de decisão:
   - **Execute Now (>= 7.0):** Ação prioritária — iniciar na próxima sprint
   - **Schedule (5.0-6.9):** Planejar para próximas 4 semanas
   - **Backlog (3.0-4.9):** Manter na lista, revisar mensalmente
   - **Discard (< 3.0):** Remover da lista — custo de oportunidade maior que benefício

8. **Verificar dependências** — Para iniciativas Execute Now, confirmar que não há bloqueios: pré-requisito de outra iniciativa, orçamento, acesso, aprovação externa.

9. **Definir owner e deadline para Execute Now** — Cada iniciativa Execute Now deve ter:
   - Responsável claro (agente ou operador)
   - Deadline definido
   - Métrica de sucesso (KPI que vai se mover)
   - Critério de conclusão

10. **Documentar e comunicar backlog priorizado** — Salvar lista ICE ordenada. Distribuir para agentes responsáveis pelas iniciativas Execute Now.

## Framework

### ICE Score — Guia de Pontuação

| Dimensão | 10 | 7 | 5 | 3 | 1 |
|---------|---|---|---|---|---|
| **Impact** | Duplica receita | +30% receita | +10% receita | +3% receita | Impacto marginal |
| **Confidence** | Dado confirmado (A/B) | Benchmark sólido | Analogia válida | Palpite fundamentado | Shot in the dark |
| **Ease** | < 2h de trabalho | < 1 dia | 2-5 dias | 1-2 semanas | > 3 semanas |

### Categorias de Decisão

```
ICE >= 7.0   → EXECUTE NOW   — Sprint atual (próximos 14 dias)
ICE 5.0-6.9  → SCHEDULE      — Próximas 4 semanas
ICE 3.0-4.9  → BACKLOG       — Revisão mensal
ICE < 3.0    → DISCARD       — Remover da lista
```

### Armadilhas Comuns do ICE

| Armadilha | Sintoma | Correção |
|-----------|---------|---------|
| Viés de facilidade | Tarefas fáceis dominam o topo | Ponderar mais Impact; questionar se Ease 9 com Impact 3 vale a atenção |
| Inflação de Confidence | Todos os scores ficam 8-9 | Calibrar: quantas das últimas 5 iniciativas confiantes realmente funcionaram? |
| Scope creep no Impact | Impact estimado sem base | Exigir: "qual KPI específico, em quanto, em qual janela?" |
| ICE estático | Scores não mudam com novos dados | Revisar ICE mensalmente com dados reais |

### Anti-padrões de Priorização

- Escolher pela iniciativa mais interessante (não a de maior score)
- Executar múltiplas iniciativas simultâneas que afetam a mesma métrica (sem isolamento)
- Nunca descartar iniciativas (backlog vira cemitério de ideias)
- Não definir critério de sucesso antes de executar

## Veto Conditions

- **HARD VETO:** Executar iniciativa com ICE < 3.0 enquanto existem iniciativas >= 7.0 não iniciadas — desperdício de capital de execução
- **HARD VETO:** Não definir métrica de sucesso antes de iniciar iniciativa Execute Now — impossibilita aprendizado após execução
- **SOFT VETO:** Score de Confidence >= 8 para iniciativa sem nenhum dado de suporte — recalibrar; confiança alta sem dado é wishful thinking
- **ALERTA:** Mais de 3 iniciativas simultâneas no status Execute Now — foco é vantagem competitiva; limitar a 2 por sprint

## Output

- **File:** `outputs/affiliates/{projeto-slug}/ice-backlog-{YYYY-MM}.md`
- **Format:** Markdown com tabela ICE ordenada e plano de execução

## Output Example

```yaml
ice_prioritization:
  project: "afiliado-fitness-br"
  analyst: "growth-optimizer"
  date: "2026-02-18"
  total_initiatives: 9
  north_star_metric: "RPV (Revenue Per Visitor)"

backlog:
  execute_now:
    - id: "GRW-001"
      initiative: "Adicionar bônus exclusivo (PDF checklist) ao review article principal"
      impact: 8
      confidence: 8
      ease: 9
      ice_score: 8.3
      owner: "copy-vendas"
      deadline: "2026-02-22"
      success_kpi: "EPC do artigo sobe de R$1.20 para R$1.50+"
      status: "EXECUTE NOW"

    - id: "GRW-002"
      initiative: "Reescrever CTA da bridge page de Meta Ads (mais direto + urgência)"
      impact: 7
      confidence: 7
      ease: 8
      ice_score: 7.3
      owner: "copy-vendas"
      deadline: "2026-02-25"
      success_kpi: "CTR da bridge page sobe de 18% para 25%+"
      status: "EXECUTE NOW"

  schedule:
    - id: "GRW-003"
      initiative: "Criar sequência de 7 emails de nutrição para novos leads"
      impact: 8
      confidence: 7
      ease: 4
      ice_score: 6.3
      owner: "email-nurture"
      deadline: "2026-03-15"
      status: "SCHEDULE"

    - id: "GRW-004"
      initiative: "Publicar 3 artigos de cauda longa no cluster de emagrecimento"
      impact: 7
      confidence: 6
      ease: 5
      ice_score: 6.0
      owner: "seo-content"
      deadline: "2026-03-30"
      status: "SCHEDULE"

  backlog:
    - id: "GRW-005"
      initiative: "Criar canal YouTube com reviews em vídeo"
      impact: 8
      confidence: 5
      ease: 2
      ice_score: 5.0
      review_date: "2026-04-01"
      status: "BACKLOG"

  discard:
    - id: "GRW-006"
      initiative: "Criar podcast semanal sobre fitness"
      impact: 4
      confidence: 3
      ease: 1
      ice_score: 2.7
      reason: "Alto esforço, baixa confiança de impacto em EPC no horizonte relevante"
      status: "DISCARD"

next_review: "2026-03-18"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
