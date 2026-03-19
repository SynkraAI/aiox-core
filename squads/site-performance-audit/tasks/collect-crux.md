# Task: Collect CrUX Field Data

```yaml
task:
  name: "Collect CrUX Field Data"
  id: collect-crux
  version: "1.0.0"
  execution_type: Worker
  responsible_executor: "site-performance-audit-chief"
  estimated_time: "10-30s"
  status: pending

  description: >-
    Coleta dados de campo (Real User Monitoring) do Chrome User Experience Report.
    Retorna metricas reais de usuarios do Chrome nos ultimos 28 dias.
    Complementa dados sinteticos do Lighthouse com dados de campo reais.

  input:
    - name: url
      type: string
      required: true
      description: "URL da pagina OU origem (dominio)"
    - name: form_factor
      type: enum
      values: [PHONE, DESKTOP, ALL_FORM_FACTORS]
      default: ALL_FORM_FACTORS
    - name: api_key
      type: string
      required: true
      source: "dotenv:.env:GOOGLE_PSI_API_KEY"
      fallback: "env:GOOGLE_PSI_API_KEY"
      description: "Same API key as PSI — loaded from project .env file"

  output:
    - name: crux_result
      type: json
      description: "CrUX record with field metrics"
      contains:
        - record.metrics.largest_contentful_paint (histogram + percentiles)
        - record.metrics.cumulative_layout_shift (histogram + percentiles)
        - record.metrics.interaction_to_next_paint (histogram + percentiles)
        - record.metrics.first_contentful_paint
        - record.metrics.time_to_first_byte
        - record.key (url or origin)
        - urlNormalizationDetails

  api_reference:
    endpoint: "https://chromeuxreport.googleapis.com/v1/records:queryRecord"
    method: POST
    body:
      url: "{url}"
      formFactor: "{form_factor}"
    headers:
      Content-Type: "application/json"
    params:
      key: "{api_key}"
    rate_limit: "150 requests per minute"
    cost: "Free (no paid tier)"

  action_items:
    - step: 1
      action: "Try URL-level CrUX first"
      request: |
        POST https://chromeuxreport.googleapis.com/v1/records:queryRecord?key={api_key}
        {"url": "{url}"}

    - step: 2
      action: "If URL-level returns 404, fallback to origin-level"
      reason: "Low-traffic pages may not have URL-level data"
      request: |
        POST https://chromeuxreport.googleapis.com/v1/records:queryRecord?key={api_key}
        {"origin": "https://{domain}"}

    - step: 3
      action: "Extract p75 values for each metric"
      extract:
        lcp_p75: "record.metrics.largest_contentful_paint.percentiles.p75"
        cls_p75: "record.metrics.cumulative_layout_shift.percentiles.p75"
        inp_p75: "record.metrics.interaction_to_next_paint.percentiles.p75"
        ttfb_p75: "record.metrics.time_to_first_byte.percentiles.p75"
        fcp_p75: "record.metrics.first_contentful_paint.percentiles.p75"

    - step: 4
      action: "Classify each metric"
      thresholds:
        lcp:
          good: "<= 2500ms"
          needs_improvement: "2500-4000ms"
          poor: "> 4000ms"
        cls:
          good: "<= 0.1"
          needs_improvement: "0.1-0.25"
          poor: "> 0.25"
        inp:
          good: "<= 200ms"
          needs_improvement: "200-500ms"
          poor: "> 500ms"
        ttfb:
          good: "<= 800ms"
          needs_improvement: "800-1800ms"
          poor: "> 1800ms"

    - step: 5
      action: "Extract histogram distribution"
      note: "Shows % of users in good/NI/poor buckets"

  acceptance_criteria:
    - "CrUX response received (200 or 404)"
    - "If 200: p75 values extracted for at least LCP, CLS, INP"
    - "If 404: marked as 'no field data' — not an error"
    - "Metrics classified as Good/NI/Poor"

  error_handling:
    no_data:
      status: 404
      meaning: "Site has insufficient traffic for CrUX data"
      action: "Mark as 'Field data unavailable — low traffic'"
      report_note: "This site does not have enough Chrome users for field data. Relying on lab data only."

  veto_conditions:
    - "API key missing → STOP"
    - "Rate limit (429) → Wait 60s, retry"
```
