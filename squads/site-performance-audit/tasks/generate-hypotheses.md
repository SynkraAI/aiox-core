# Task: Generate Performance Hypotheses

```yaml
task:
  name: "Generate Performance Hypotheses"
  id: generate-hypotheses
  version: "1.0.0"
  execution_type: Agent
  responsible_executor: "tammy-everts"
  estimated_time: "3-5 min"
  status: pending

  description: >-
    Formula hipoteses de causa-raiz priorizadas por impacto no negocio.
    Cada hipotese inclui metrica impactada, impacto estimado e esforco.
    Usa framework "Time Is Money" para correlacao performance-negocio.

  input:
    - name: cwv_diagnosis
      type: markdown
      source: "diagnose-cwv output"
    - name: root_causes
      type: array
      source: "Phase 3 diagnosis"
    - name: benchmark_data
      type: json
      source: "CrUX benchmarking (optional)"
    - name: business_context
      type: string
      description: "E-commerce, SaaS, media, blog, etc."

  output:
    - name: hypothesis_matrix
      type: markdown
      format: |
        | # | Hipotese | Metrica | Impacto Estimado | Esforco | Prioridade |
        |---|---------|---------|------------------|---------|------------|

    - name: action_plan
      type: markdown
      sections:
        - "Quick Wins (1-2 dias)"
        - "Medium Term (1-2 semanas)"
        - "Strategic (1+ mes)"

  action_items:
    - step: 1
      name: "Correlate Performance to Business"
      framework: "Tammy Everts — Time Is Money"
      reference_data:
        lcp_impact:
          - "LCP 2.5s → 4.0s: ~7-10% conversion drop (e-commerce)"
          - "LCP improvement 1s: ~2-5% conversion lift"
        cls_impact:
          - "CLS > 0.25: users 24% more likely to abandon"
          - "Layout shifts increase rage clicks"
        inp_impact:
          - "INP > 500ms: users perceive site as broken"
          - "Every 100ms INP improvement → measurable engagement lift"
        general:
          - "53% of mobile users abandon pages taking > 3s (Google)"
          - "1s delay in page load → 7% reduction in conversions (Akamai)"
          - "Amazon: 100ms latency cost 1% in sales"
          - "Walmart: every 1s improvement → 2% conversion increase"

    - step: 2
      name: "Classify Each Root Cause as Hypothesis"
      format_per_hypothesis:
        hypothesis: "Statement of what the issue is"
        evidence: "Data point from the audit that supports this"
        metric_impacted: "Which CWV metric this affects"
        business_impact: |
          Estimate using correlations:
          - High: Directly impacts conversion/revenue (LCP, INP)
          - Medium: Impacts user experience/engagement (CLS, FCP)
          - Low: Impacts SEO ranking signal only
        effort: |
          Classify based on what can be observed:
          - Low: Configuration change (headers, preload, async)
          - Medium: Code optimization (image formats, lazy loading)
          - High: Architecture change (SSR, CDN, code splitting)
        priority: |
          Matrix:
          - P1 (Critical): High impact + Low effort → Quick Win
          - P2 (High): High impact + Medium effort
          - P3 (Medium): Medium impact + any effort
          - P4 (Low): Low impact + High effort → Backlog

    - step: 3
      name: "Generate Action Plan"
      categorize:
        quick_wins:
          criteria: "P1 — can be done in 1-2 days"
          examples:
            - "Add fetchpriority=high to LCP image"
            - "Add width/height to images causing CLS"
            - "Defer non-critical JavaScript"
            - "Enable text compression (gzip/brotli)"
            - "Preconnect to critical third-party origins"
        medium_term:
          criteria: "P2 — requires 1-2 weeks"
          examples:
            - "Convert images to WebP/AVIF"
            - "Implement lazy loading for below-fold images"
            - "Optimize web font loading (font-display: swap)"
            - "Audit and reduce third-party scripts"
            - "Implement critical CSS"
        strategic:
          criteria: "P3/P4 — requires 1+ month"
          examples:
            - "Implement server-side rendering (SSR)"
            - "Set up CDN for global distribution"
            - "Code splitting and bundle optimization"
            - "Migrate to modern image CDN (Cloudinary, imgix)"
            - "Implement service worker for caching"

    - step: 4
      name: "Validate Hypotheses"
      checks:
        - "Every hypothesis has evidence from actual audit data?"
        - "No generic/unsupported hypotheses?"
        - "At least 3 quick wins identified?"
        - "Impact estimates reference known correlations?"

  acceptance_criteria:
    - "At least 5 hypotheses with complete data"
    - "Priority matrix filled (impact x effort)"
    - "At least 3 quick wins in action plan"
    - "Business impact quantified with reference data"
    - "Action plan has all 3 timeline categories"

  veto_conditions:
    - "Hypothesis without evidence → REMOVE"
    - "Generic advice without specifics → REWORK"
    - "Zero quick wins → Re-analyze root causes"
```
