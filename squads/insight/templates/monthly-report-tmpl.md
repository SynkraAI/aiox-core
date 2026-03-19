# Report Mensal — {{client_name}} | {{month_year}}

## Headline

**{{abt_headline}}**

---

## Highlight do Mês {{highlight_emoji}}

{{highlight_narrative}}

---

## O Que Fizemos Este Mês

{{#each actions_taken}}
- {{description}} {{status_emoji}}
{{/each}}

---

## Resultados com Contexto

| Métrica | {{prev_month}} | {{current_month}} | Δ | Contexto |
|---------|----------------|-------------------|---|----------|
{{#each metrics}}
| {{label}} | {{prev_value}} | {{current_value}} | {{delta}} | {{context}} |
{{/each}}

---

## Evolução do Score

| Canal | {{prev_month}} | {{current_month}} | Δ |
|-------|----------------|-------------------|---|
{{#each score_channels}}
| {{channel}} | {{prev_score}} | {{current_score}} | {{delta}} |
{{/each}}
| **Total** | **{{prev_total}}** | **{{current_total}}** | **{{total_delta}}** |

---

{{#if alerts}}
## Atenção Necessária ⚠️

{{#each alerts}}
- {{description}}
{{/each}}
{{/if}}

---

## Próximos Passos ({{next_month}})

{{#each next_steps}}
{{index}}. {{description}}
{{/each}}

---

*Report gerado por @data-storyteller — Insight Squad v1.0.0*
*Período: {{period_start}} a {{period_end}}*
