# Task: Benchmark Against Competitors & Industry

```yaml
task:
  name: "Benchmark Against Competitors & Industry"
  id: benchmark-competitors
  version: "1.0.0"
  execution_type: Agent
  responsible_executor: "barry-pollard"
  estimated_time: "2-3 min"
  status: pending

  description: >-
    Compara performance do site contra concorrentes e medianas da industria
    usando dados CrUX. Posiciona o site no contexto do mercado.

  input:
    - name: site_crux
      type: json
      required: true
      source: "collect-crux output"
    - name: competitor_urls
      type: array
      required: false
    - name: industry
      type: string
      required: false

  output:
    - name: benchmark_report
      type: markdown
      sections:
        - "Site vs Industry percentiles"
        - "Site vs Competitors table"
        - "Competitive position assessment"

  action_items:
    - step: 1
      name: "Collect Competitor CrUX Data"
      action: "Run collect-crux for each competitor URL"
      parallel: true
      max_competitors: 5

    - step: 2
      name: "Build Comparison Matrix"
      format: |
        | Site | LCP (p75) | CLS (p75) | INP (p75) | CWV Pass? |
        |------|:---------:|:---------:|:---------:|:---------:|

    - step: 3
      name: "Industry Context"
      framework: "Web Almanac benchmarking"
      reference:
        global_pass_rates:
          all_cwv: "48% mobile, 56% desktop pass all 3 CWV"
          lcp: "~60% pass LCP threshold"
          cls: "~75% pass CLS threshold"
          inp: "~57% pass INP threshold"
        industry_benchmarks:
          ecommerce: "LCP ~3.2s mobile, CLS ~0.08, INP ~280ms"
          saas: "LCP ~2.8s, CLS ~0.05, INP ~220ms"
          media: "LCP ~3.5s, CLS ~0.15, INP ~310ms"
          blog: "LCP ~2.5s, CLS ~0.04, INP ~180ms"

    - step: 4
      name: "Position Assessment"
      classify:
        leader: "All CWV pass + better than 75% of competitors"
        competitive: "All CWV pass + similar to competitors"
        behind: "1-2 CWV fail OR worse than most competitors"
        critical: "All CWV fail OR significantly worse than competitors"

  acceptance_criteria:
    - "Competitor data collected (if URLs provided)"
    - "Comparison matrix complete"
    - "Industry context included"
    - "Position assessment clear"

  veto_conditions:
    - "CrUX unavailable for target site AND no competitor data → SKIP benchmarking, note in report as insufficient field data"
    - "No competitor URLs provided AND no industry specified → Provide global benchmarks only, flag limited context"
    - "Comparison matrix shows data for < 2 sites (target + at least 1 competitor or industry median) → REWORK, add industry context"
```
