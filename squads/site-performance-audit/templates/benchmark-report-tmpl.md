# Benchmark Report Template

```yaml
template:
  id: benchmark-report-template
  name: "Competitive Benchmark Report"
  version: "1.0.0"
  output:
    format: markdown
    filename: "{YYYY-MM-DD}-{HHmm}-benchmark-{sanitized_id}.md"
    filename_note: "MUST follow output-standard.md pattern. Saved to docs/outputs/squads/site-performance-audit/"
  description: >-
    Template for *benchmark command output. Compares target site against
    competitors using CrUX field data and PSI lab data. Focuses on
    relative positioning and competitive gaps.
```

---

## Output Format

```markdown
# Benchmark — {{url}} vs Concorrentes

**Data:** {{date}} {{time}}
**Estrategia:** {{strategy}}
**Fontes:** CrUX API (campo, p75, 28 dias), PSI API v5 (laboratorio)
{{#if industry}}**Industria:** {{industry}}{{/if}}

---

## 1. Matriz Comparativa — Scores

| Site | Performance | Acessibilidade | Best Practices | SEO |
|------|:-----------:|:--------------:|:--------------:|:---:|
| **{{target_url}}** (alvo) | {{target_perf}} | {{target_a11y}} | {{target_bp}} | {{target_seo}} |
{{#each competitors}}
| {{this.url}} | {{this.perf}} | {{this.a11y}} | {{this.bp}} | {{this.seo}} |
{{/each}}

---

## 2. Matriz Comparativa — Core Web Vitals (Lab)

| Site | LCP | CLS | TBT | FCP | SI |
|------|:---:|:---:|:---:|:---:|:--:|
| **{{target_url}}** (alvo) | {{target_lcp}} | {{target_cls}} | {{target_tbt}} | {{target_fcp}} | {{target_si}} |
{{#each competitors}}
| {{this.url}} | {{this.lcp}} | {{this.cls}} | {{this.tbt}} | {{this.fcp}} | {{this.si}} |
{{/each}}

**Legenda:** {{green}} Good | {{orange}} Needs Improvement | {{red}} Poor

---

## 3. Dados de Campo (CrUX — p75)

{{#if crux_available}}
| Site | LCP | INP | CLS | TTFB | CWV Status |
|------|:---:|:---:|:---:|:----:|:----------:|
| **{{target_url}}** (alvo) | {{target_crux_lcp}} | {{target_crux_inp}} | {{target_crux_cls}} | {{target_crux_ttfb}} | {{target_cwv_pass}} |
{{#each competitors}}
| {{this.url}} | {{this.crux_lcp}} | {{this.crux_inp}} | {{this.crux_cls}} | {{this.crux_ttfb}} | {{this.cwv_pass}} |
{{/each}}

> **CWV Status:** PASS = todas as 3 metricas core (LCP, INP, CLS) no threshold Good.
{{else}}
> **Dados de campo indisponiveis** para um ou mais sites. Comparacao baseada em dados de laboratorio.
{{/if}}

---

## 4. Ranking por Metrica

{{#each metric_rankings}}
### {{this.metric_name}}

| Posicao | Site | Valor | Status |
|:-------:|------|:-----:|:------:|
{{#each this.rankings}}
| {{this.position}} | {{this.url}} {{this.is_target}} | {{this.value}} | {{this.status}} |
{{/each}}
{{/each}}

---

## 5. Gap Analysis

Diferenca entre o site alvo e o melhor concorrente em cada metrica.

| Metrica | Alvo | Melhor Concorrente | Gap | Acao Necessaria |
|---------|:----:|:------------------:|:---:|-----------------|
{{#each gaps}}
| {{this.metric}} | {{this.target_value}} | {{this.best_value}} ({{this.best_url}}) | {{this.gap}} | {{this.action}} |
{{/each}}

---

## 6. Vantagens Competitivas

Metricas onde o site alvo supera todos os concorrentes.

{{#if advantages}}
{{#each advantages}}
- **{{this.metric}}:** {{this.target_value}} vs melhor concorrente {{this.best_competitor_value}} ({{this.best_competitor_url}})
{{/each}}
{{else}}
> Nenhuma vantagem competitiva identificada nas metricas avaliadas.
{{/if}}

---

## 7. Resumo Executivo

**Posicao geral:** {{overall_position}} de {{total_sites}} sites analisados

**Pontos fortes:**
{{#each strengths}}
- {{this}}
{{/each}}

**Gaps criticos:**
{{#each critical_gaps}}
- {{this}}
{{/each}}

**Recomendacao:** {{recommendation}}

---

## 8. Metodologia

**Sites analisados:** {{total_sites}}
**Periodo CrUX:** Ultimos 28 dias (p75)
**Teste lab:** PSI API v5 — {{strategy}}, conexao {{network_throttling}}
{{#if industry}}**Industria de referencia:** {{industry}}{{/if}}

**Limitacoes:**
- Dados de campo dependem de trafego Chrome suficiente
- Teste lab reflete um ponto no tempo, nao tendencia
- Concorrentes podem ter audiencias com perfis de dispositivo/rede diferentes

---

*Benchmark por site-performance-audit squad — {{date}}*

Save report? (`*save`)
```
