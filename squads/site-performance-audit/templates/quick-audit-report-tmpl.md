# Quick Audit Report Template

```yaml
template:
  id: quick-audit-report-template
  name: "Quick PSI Audit Report"
  version: "1.0.0"
  output:
    format: markdown
    filename: "{YYYY-MM-DD}-{HHmm}-quick-audit-{sanitized_id}.md"
    filename_note: "MUST follow output-standard.md pattern. Saved to docs/outputs/squads/site-performance-audit/"
  description: >-
    Template for *quick-audit command output. Focused on CWV report card,
    top issues, and quick wins. Shorter than full audit — no deep diagnostics,
    no benchmark, no waterfall analysis.
```

---

## Output Format

```markdown
# Quick Audit — {{url}}

**Data:** {{date}} {{time}}
**Estrategia:** {{strategy}}
**Ferramenta:** PageSpeed Insights API v5 (Lighthouse {{lighthouse_version}})

---

## 1. Scores por Categoria

| Performance | Acessibilidade | Praticas Recomendadas | SEO |
|:-----------:|:--------------:|:---------------------:|:---:|
| {{perf_score}}/100 {{perf_color}} | {{a11y_score}}/100 {{a11y_color}} | {{bp_score}}/100 {{bp_color}} | {{seo_score}}/100 {{seo_color}} |

**Legenda:** {{green}} 90-100 (Bom) | {{orange}} 50-89 (Precisa Melhorar) | {{red}} 0-49 (Ruim)

---

## 2. Core Web Vitals — Report Card

| Metrica | Mobile | Desktop | Status | Threshold |
|---------|:------:|:-------:|:------:|-----------|
| LCP | {{m_lcp}} | {{d_lcp}} | {{lcp_status}} | Good <= 2.5s / Poor > 4.0s |
| CLS | {{m_cls}} | {{d_cls}} | {{cls_status}} | Good <= 0.1 / Poor > 0.25 |
| TBT | {{m_tbt}} | {{d_tbt}} | {{tbt_status}} | Good <= 200ms / Poor > 600ms |
| FCP | {{m_fcp}} | {{d_fcp}} | {{fcp_status}} | Good <= 1.8s / Poor > 3.0s |
| SI | {{m_si}} | {{d_si}} | {{si_status}} | Good <= 3.4s / Poor > 5.8s |

{{#if crux_available}}
### Dados de Campo (CrUX — p75, ultimos 28 dias)

| Metrica | p75 | Status |
|---------|:---:|:------:|
| LCP | {{crux_lcp}} | {{crux_lcp_status}} |
| INP | {{crux_inp}} | {{crux_inp_status}} |
| CLS | {{crux_cls}} | {{crux_cls_status}} |
| TTFB | {{crux_ttfb}} | {{crux_ttfb_status}} |
{{else}}
> **Dados de campo indisponiveis.** Trafego insuficiente para CrUX. Analise baseada em dados de laboratorio.
{{/if}}

---

## 3. Top {{issue_count}} Issues

Ordenados por impacto estimado (maior economia primeiro).

| # | Issue | Economia Estimada | Metrica Impactada |
|---|-------|:-----------------:|:-----------------:|
{{#each top_issues}}
| {{this.rank}} | {{this.title}} | {{this.savings}} | {{this.metric}} |
{{/each}}

---

## 4. Quick Wins

Acoes de alto impacto que podem ser implementadas rapidamente.

{{#each quick_wins}}
- [ ] **{{this.action}}** — Economia: {{this.savings}} | Metrica: {{this.metric}} | Esforco: {{this.effort}}
{{/each}}

{{#if no_quick_wins}}
> Nenhum quick win identificado. Considere um *audit completo para analise aprofundada.
{{/if}}

---

## 5. Veredicto

**Situacao geral:** {{verdict}}

{{verdict_detail}}

{{#if recommend_full_audit}}
> **Recomendacao:** Este site se beneficiaria de um `*audit` completo com analise de waterfall, benchmark e plano de acao detalhado.
{{/if}}

---

*Quick audit por site-performance-audit squad — {{date}}*

Save report? (`*save`) | Deep dive? (`*audit {{url}}`)
```
