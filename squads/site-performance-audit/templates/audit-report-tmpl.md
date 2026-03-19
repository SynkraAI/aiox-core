# Performance Audit Report Template

```yaml
template:
  id: audit-report-template
  name: "External Performance Audit Report"
  version: "2.0.0"
  output:
    format: markdown
    filename: "{YYYY-MM-DD}-{HHmm}-audit-{sanitized_id}.md"
    filename_note: "MUST follow output-standard.md pattern. Saved to docs/outputs/squads/site-performance-audit/"
  changelog:
    - version: "2.0.0"
      changes:
        - "Added all 4 category scores (Performance, Accessibility, Best Practices, SEO)"
        - "Added page screenshot section"
        - "Added Insights section (matches PSI browser INSIGHTS)"
        - "Added Diagnostics section (matches PSI browser DIAGNOSTICO)"
        - "Added score-to-indicator mapping (red/orange/green)"
        - "Added test environment metadata"
```

---

## Output Format

```markdown
# Performance Audit Report
**Site:** {{url}}
**Data:** {{date}}
**Estrategia:** {{strategy}} (mobile/desktop/both)
**Ferramentas:** PageSpeed Insights API v5 (Lighthouse {{lighthouse_version}}), CrUX API{{#if wpt_used}}, WebPageTest{{/if}}

---

## 1. Screenshot da Pagina

> **Captura:** {{capture_timestamp}}
> **Dispositivo:** {{device_emulation}} | **Rede:** {{network_throttling}}
> **Carregamento:** Pagina inicial

{{screenshot_base64_or_link}}

---

## 2. Scores por Categoria

| Performance | Acessibilidade | Praticas Recomendadas | SEO |
|:-----------:|:--------------:|:---------------------:|:---:|
| {{perf_score}}/100 {{perf_color}} | {{a11y_score}}/100 {{a11y_color}} | {{bp_score}}/100 {{bp_color}} | {{seo_score}}/100 {{seo_color}} |

**Legenda de cores:**
- {{green}} 90-100 (Bom)
- {{orange}} 50-89 (Precisa Melhorar)
- {{red}} 0-49 (Ruim)

---

## 3. Metricas — Core Web Vitals

| Metrica | Valor | Score | Indicador | Threshold |
|---------|:-----:|:-----:|:---------:|-----------|
| First Contentful Paint | {{fcp_value}} | {{fcp_score}} | {{fcp_indicator}} | Good <= 1.8s / Poor > 3.0s |
| Largest Contentful Paint | {{lcp_value}} | {{lcp_score}} | {{lcp_indicator}} | Good <= 2.5s / Poor > 4.0s |
| Total Blocking Time | {{tbt_value}} | {{tbt_score}} | {{tbt_indicator}} | Good <= 200ms / Poor > 600ms |
| Cumulative Layout Shift | {{cls_value}} | {{cls_score}} | {{cls_indicator}} | Good <= 0.1 / Poor > 0.25 |
| Speed Index | {{si_value}} | {{si_score}} | {{si_indicator}} | Good <= 3.4s / Poor > 5.8s |

**Indicadores:**
- RED TRIANGLE = Poor (score < 0.5)
- ORANGE SQUARE = Needs Improvement (score 0.5-0.89)
- GREEN CIRCLE = Good (score >= 0.9)

> **Ambiente de teste:**
> - Captura: {{capture_timestamp}}
> - Dispositivo: {{device_emulation}} com Lighthouse {{lighthouse_version}}
> - Sessao de uma unica pagina
> - Carregamento inicial da pagina
> - Rede: {{network_throttling}}

---

## 4. Dados de Campo (CrUX)

{{#if crux_available}}
**Periodo:** Ultimos 28 dias | **Percentil:** p75

| Metrica | p75 | Status | Good % | NI % | Poor % |
|---------|:---:|:------:|:------:|:----:|:------:|
| LCP | {{crux_lcp_p75}} | {{crux_lcp_status}} | {{crux_lcp_good}}% | {{crux_lcp_ni}}% | {{crux_lcp_poor}}% |
| INP | {{crux_inp_p75}} | {{crux_inp_status}} | {{crux_inp_good}}% | {{crux_inp_ni}}% | {{crux_inp_poor}}% |
| CLS | {{crux_cls_p75}} | {{crux_cls_status}} | {{crux_cls_good}}% | {{crux_cls_ni}}% | {{crux_cls_poor}}% |
| FCP | {{crux_fcp_p75}} | {{crux_fcp_status}} | {{crux_fcp_good}}% | {{crux_fcp_ni}}% | {{crux_fcp_poor}}% |
| TTFB | {{crux_ttfb_p75}} | {{crux_ttfb_status}} | {{crux_ttfb_good}}% | {{crux_ttfb_ni}}% | {{crux_ttfb_poor}}% |
{{else}}
> **Dados de campo indisponiveis.** Site com trafego insuficiente no Chrome para dados CrUX.
> Analise baseada apenas em dados de laboratorio (Lighthouse).
> Para dados de campo, implemente web-vitals.js para RUM proprio.
{{/if}}

---

## 5. Insights

Insights identificam oportunidades especificas para melhorar o carregamento da pagina.
Ordenados por severidade (piores primeiro).

| Indicador | Insight | Economia Estimada |
|:---------:|---------|:-----------------:|
{{#each insights}}
| {{this.indicator}} | {{this.title}} | {{this.savings}} |
{{/each}}

### Detalhamento dos Insights

{{#each insights_with_details}}
#### {{this.indicator}} {{this.title}} — {{this.savings}}
{{this.description}}

{{#if this.items}}
| Recurso | Tamanho | Economia |
|---------|:-------:|:--------:|
{{#each this.items}}
| {{this.url}} | {{this.size}} | {{this.savings}} |
{{/each}}
{{/if}}
{{/each}}

---

## 6. Diagnostico

Diagnosticos fornecem informacoes adicionais sobre o desempenho.
Estes numeros nao afetam diretamente o indice de desempenho.

| Indicador | Diagnostico | Detalhes |
|:---------:|-------------|----------|
{{#each diagnostics}}
| {{this.indicator}} | {{this.title}} | {{this.displayValue}} |
{{/each}}

### Detalhamento dos Diagnosticos

{{#each diagnostics_with_details}}
#### {{this.indicator}} {{this.title}} — {{this.displayValue}}
{{this.description}}

{{#if this.items}}
| Recurso | Tamanho | Economia |
|---------|:-------:|:--------:|
{{#each this.items}}
| {{this.url}} | {{this.size}} | {{this.savings}} |
{{/each}}
{{/if}}
{{/each}}

---

## 7. Core Web Vitals — Analise Detalhada

### 7.1 LCP (Largest Contentful Paint)
- **Valor:** {{lcp_value}}
- **Threshold:** <= 2.5s (Good) | 2.5-4.0s (NI) | > 4.0s (Poor)
- **Elemento LCP:** {{lcp_element}}
- **Causa-raiz identificada:** {{lcp_root_cause}}
- **Evidencia:** {{lcp_evidence}}

### 7.2 CLS (Cumulative Layout Shift)
- **Valor:** {{cls_value}}
- **Threshold:** <= 0.1 (Good) | 0.1-0.25 (NI) | > 0.25 (Poor)
- **Elementos causadores:** {{cls_elements}}
- **Causa-raiz identificada:** {{cls_root_cause}}

### 7.3 INP (Interaction to Next Paint)
- **Valor (Campo):** {{inp_value}}
- **Threshold:** <= 200ms (Good) | 200-500ms (NI) | > 500ms (Poor)
{{#if no_crux_data}}
- **Campo indisponivel:** TBT de {{tbt_value}} usado como proxy lab
{{/if}}

---

## 8. Lab vs Field — Comparacao

| Metrica | Lab (Lighthouse) | Field (CrUX p75) | Delta | Interpretacao |
|---------|:----------------:|:-----------------:|:-----:|--------------|
| LCP | {{lab_lcp}} | {{field_lcp}} | {{delta_lcp}} | {{interp_lcp}} |
| CLS | {{lab_cls}} | {{field_cls}} | {{delta_cls}} | {{interp_cls}} |
| FCP | {{lab_fcp}} | {{field_fcp}} | {{delta_fcp}} | {{interp_fcp}} |
| TTFB | {{lab_ttfb}} | {{field_ttfb}} | {{delta_ttfb}} | {{interp_ttfb}} |

> **Nota:** Divergencias significativas entre Lab e Field indicam que
> condicoes reais de rede/dispositivo dos usuarios diferem do ambiente simulado.

---

## 9. Souders 14 Rules — Compliance

| # | Regra | Status | Evidencia |
|---|-------|:------:|-----------|
| 1 | Make Fewer HTTP Requests | {{r1_status}} | {{r1_evidence}} |
| 2 | Use a CDN | {{r2_status}} | {{r2_evidence}} |
| 3 | Add Expires/Cache-Control Header | {{r3_status}} | {{r3_evidence}} |
| 4 | Gzip/Compress Components | {{r4_status}} | {{r4_evidence}} |
| 5 | Put Stylesheets at the Top | {{r5_status}} | {{r5_evidence}} |
| 6 | Put Scripts at the Bottom | {{r6_status}} | {{r6_evidence}} |
| 7 | Avoid CSS Expressions | N/A | Obsolete |
| 8 | Make JS and CSS External | {{r8_status}} | {{r8_evidence}} |
| 9 | Reduce DNS Lookups | {{r9_status}} | {{r9_evidence}} |
| 10 | Minify JavaScript | {{r10_status}} | {{r10_evidence}} |
| 11 | Avoid Redirects | {{r11_status}} | {{r11_evidence}} |
| 12 | Remove Duplicate Scripts | {{r12_status}} | {{r12_evidence}} |
| 13 | Configure ETags | {{r13_status}} | {{r13_evidence}} |
| 14 | Make AJAX Cacheable | {{r14_status}} | {{r14_evidence}} |

---

## 10. Resource Breakdown

### Por Tipo de Conteudo
| Tipo | Requests | Tamanho | % do Total |
|------|:--------:|:-------:|:----------:|
| HTML | {{html_req}} | {{html_size}} | {{html_pct}}% |
| JavaScript | {{js_req}} | {{js_size}} | {{js_pct}}% |
| CSS | {{css_req}} | {{css_size}} | {{css_pct}}% |
| Imagens | {{img_req}} | {{img_size}} | {{img_pct}}% |
| Fontes | {{font_req}} | {{font_size}} | {{font_pct}}% |
| Outros | {{other_req}} | {{other_size}} | {{other_pct}}% |
| **Total** | **{{total_req}}** | **{{total_size}}** | **100%** |

### Third-Party Scripts
| Dominio | Requests | Tamanho | Blocking? | Impacto |
|---------|:--------:|:-------:|:---------:|---------|
{{#each third_parties}}
| {{this.domain}} | {{this.requests}} | {{this.size}} | {{this.blocking}} | {{this.impact}} |
{{/each}}

---

{{#if benchmark_data}}
## 11. Benchmark — Comparacao com Industria

### vs Industria ({{industry}})
| Metrica | Este Site | Mediana da Industria | Posicao |
|---------|:---------:|:--------------------:|:-------:|
| LCP | {{site_lcp}} | {{industry_lcp}} | {{position_lcp}} |
| CLS | {{site_cls}} | {{industry_cls}} | {{position_cls}} |
| INP | {{site_inp}} | {{industry_inp}} | {{position_inp}} |

{{#if competitors}}
### vs Concorrentes
| Site | LCP | CLS | INP | Score |
|------|:---:|:---:|:---:|:-----:|
{{#each competitors}}
| {{this.url}} | {{this.lcp}} | {{this.cls}} | {{this.inp}} | {{this.score}} |
{{/each}}
{{/if}}
{{/if}}

---

## 12. Hipoteses de Causa-Raiz

| # | Hipotese | Metrica Impactada | Impacto Estimado | Esforco | Prioridade |
|---|---------|:-----------------:|:----------------:|:-------:|:----------:|
{{#each hypotheses}}
| {{@index}} | {{this.hypothesis}} | {{this.metric}} | {{this.impact}} | {{this.effort}} | {{this.priority}} |
{{/each}}

---

## 13. Plano de Acao

### Quick Wins (1-2 dias)
{{#each quick_wins}}
- [ ] **{{this.action}}** — Impacto: {{this.impact}} | Metrica: {{this.metric}}
{{/each}}

### Medium Term (1-2 semanas)
{{#each medium_term}}
- [ ] **{{this.action}}** — Impacto: {{this.impact}} | Metrica: {{this.metric}}
{{/each}}

### Strategic (1+ mes)
{{#each strategic}}
- [ ] **{{this.action}}** — Impacto: {{this.impact}} | Metrica: {{this.metric}}
{{/each}}

---

## 14. Metodologia

**Ferramentas utilizadas:**
- PageSpeed Insights API v5 (Lighthouse {{lighthouse_version}})
- CrUX API (dados dos ultimos 28 dias)
{{#if wpt_used}}- WebPageTest ({{wpt_location}}, {{wpt_runs}} runs){{/if}}

**Categorias avaliadas:**
- Performance (Lighthouse)
- Accessibility (Lighthouse)
- Best Practices (Lighthouse)
- SEO (Lighthouse)

**Frameworks aplicados:**
- Core Web Vitals (Addy Osmani / Google Chrome)
- 14 Rules for High Performance (Steve Souders)
- Waterfall Analysis (Patrick Meenan / WebPageTest)
- Performance Budget (Harry Roberts / CSS Wizardry)
- Business Impact Correlation (Tammy Everts / Time Is Money)
- CrUX Benchmarking (Barry Pollard / Web Almanac)
- JavaScript Cost Analysis (Tim Kadlec)

**Limitacoes:**
- Auditoria externa — sem acesso a codigo-fonte ou servidor
- Hipoteses baseadas em evidencias observaveis (scores, waterfall, recursos)
- Dados de campo dependem de trafego suficiente do Chrome
- Resultados de lab variam por condicoes de rede e hardware do servidor de teste

---

*Gerado por site-performance-audit squad v2.0.0 — {{date}}*

Save report? (`*save`)
```
