# Report de Impacto — {{business_name}}

## Headline

**{{abt_headline}}**

<!-- ABT Structure:
  AND: {{context_and}}
  BUT: {{tension_but}}
  THEREFORE: {{action_therefore}}
-->

---

## Score de Maturidade: {{total_score}}/100

<!-- Visual: gauge/progress bar -->
<!-- Context: média do nicho = {{niche_average}}, líder = {{niche_leader_score}} -->

Para referência: a média {{niche_label}} em {{city}} que investem em digital é
{{niche_average}}/100. O líder ({{niche_leader_name}}) está em {{niche_leader_score}}/100.

---

## {{gap_count}} Gaps Que Estão Custando {{gap_cost_description}}

{{#each top_gaps}}
### {{index}}. {{title}}

{{#if has_comparison}}
| | {{business_name}} | {{competitor_name}} |
|---|---|---|
{{#each comparison_rows}}
| {{metric}} | {{value_business}} | {{value_competitor}} |
{{/each}}
{{/if}}

**Impacto:** {{impact_narrative}}

{{/each}}

---

## {{quickwin_count}} Quick Wins (alto impacto, baixo esforço)

{{#each quick_wins}}
{{index}}. **{{action}}** — custo: {{cost}} | tempo: {{time}} | impacto: {{impact}}
{{/each}}

**Score estimado após quick wins: {{estimated_score}}/100 (+{{delta}} pontos)**

---

## Projeção de Impacto

| Cenário | Score | Timeline |
|---------|-------|----------|
| Atual | {{total_score}}/100 | Hoje |
| Após quick wins | {{score_after_quickwins}}/100 | {{timeline_quickwins}} |
| Plano completo | {{score_after_all}}/100 | {{timeline_all}} |
| Média do mercado | {{niche_average}}/100 | Referência |

---

## Próximo Passo

{{cta_text}}

---

*Report gerado por @data-storyteller — Insight Squad v1.0.0*
*Dados de {{date}} — válido por 30 dias*
