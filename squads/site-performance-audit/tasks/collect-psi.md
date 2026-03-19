# Task: Collect PageSpeed Insights Data

```yaml
task:
  name: "Collect PageSpeed Insights Data"
  id: collect-psi
  version: "1.0.0"
  execution_type: Worker
  responsible_executor: "site-performance-audit-chief"
  estimated_time: "30s-2min"
  status: pending

  description: >-
    Executa chamada a PageSpeed Insights API v5 para coletar
    scores Lighthouse, Core Web Vitals e diagnosticos detalhados.

  input:
    - name: url
      type: string
      required: true
      description: "URL completa da pagina (https://...)"
    - name: strategy
      type: enum
      values: [mobile, desktop]
      required: true
      description: "Tipo de dispositivo"
    - name: api_key
      type: string
      required: true
      source: "dotenv:.env:GOOGLE_PSI_API_KEY"
      fallback: "env:GOOGLE_PSI_API_KEY"
      description: "Google Cloud API Key (free) — loaded from project .env file"

  output:
    - name: psi_result
      type: json
      description: "Resposta completa da PSI API com todas as 4 categorias"
      contains:
        - lighthouseResult.categories.performance.score
        - lighthouseResult.categories.accessibility.score
        - lighthouseResult.categories.best-practices.score
        - lighthouseResult.categories.seo.score
        - lighthouseResult.audits (all audits)
        - lighthouseResult.audits.final-screenshot (page screenshot base64)
        - lighthouseResult.audits.screenshot-thumbnails (filmstrip frames)
        - loadingExperience (field CrUX data if available)
        - originLoadingExperience (origin-level CrUX)

  api_reference:
    endpoint: "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
    method: GET
    params:
      url: "{url}"
      strategy: "{strategy}"
      category: ["performance", "accessibility", "best-practices", "seo"]
      key: "{api_key}"
    note: "MUST request ALL 4 categories in a single call using repeated category params"
    rate_limit: "400 requests per 100 seconds"
    daily_quota: "25,000 requests/day"
    cost: "Free"

  action_items:
    - step: 1
      action: "Validate URL format (must start with http:// or https://)"
      veto: "Invalid URL → STOP, request correction"

    - step: 2
      action: "Load API key from project .env file, then check availability"
      method: |
        IMPORTANT: Follow Claude Code Bash rules — NO &&, NO $(), NO ; chaining.
        Use SEPARATE Bash calls for each step:
        1. Bash call 1: source .env (loads env vars including GOOGLE_PSI_API_KEY)
        2. Bash call 2: echo $GOOGLE_PSI_API_KEY (verify key is loaded)
        3. If empty, fall back to shell environment variable
      veto: "No API key in .env or environment → STOP, guide user to create one"
      guide: |
        1. Go to https://console.cloud.google.com
        2. Create project (or select existing)
        3. Enable "PageSpeed Insights API"
        4. Go to Credentials → Create API Key
        5. Add to project .env: GOOGLE_PSI_API_KEY=your_key

    - step: 3
      action: "Execute API call with ALL 4 categories"
      command: |
        IMPORTANT: Follow Claude Code Bash rules — use SEPARATE Bash calls, never chain with && or ;
        Bash call 1: source .env
        Bash call 2: curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={url}&strategy={strategy}&category=performance&category=accessibility&category=best-practices&category=seo&key=$GOOGLE_PSI_API_KEY"
      note: "Repeat category param for each — returns all scores in one request. Each step must be a separate Bash tool call."

    - step: 4
      action: "Validate response"
      checks:
        - "HTTP 200 received"
        - "lighthouseResult.categories.performance.score exists"
        - "lighthouseResult.categories contains all 4 categories"
        - "lighthouseResult.audits is not empty"
      on_error:
        429: "Rate limited — wait 100s and retry (max 3)"
        400: "Invalid URL — check URL format"
        403: "API key invalid or quota exceeded"

    - step: 5
      action: "Extract ALL category scores"
      extract:
        performance_score: "lighthouseResult.categories.performance.score * 100"
        accessibility_score: "lighthouseResult.categories.accessibility.score * 100"
        best_practices_score: "lighthouseResult.categories['best-practices'].score * 100"
        seo_score: "lighthouseResult.categories.seo.score * 100"

    - step: 6
      action: "Extract CWV metrics"
      extract:
        lcp: "lighthouseResult.audits['largest-contentful-paint'] (numericValue, displayValue, score)"
        cls: "lighthouseResult.audits['cumulative-layout-shift'] (numericValue, displayValue, score)"
        tbt: "lighthouseResult.audits['total-blocking-time'] (numericValue, displayValue, score)"
        fcp: "lighthouseResult.audits['first-contentful-paint'] (numericValue, displayValue, score)"
        si: "lighthouseResult.audits['speed-index'] (numericValue, displayValue, score)"
        inp: "loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT (if available)"
      note: "Each metric has a score (0-1) that determines the color indicator"
      score_to_indicator:
        "score >= 0.9": "Good (green circle)"
        "score >= 0.5": "Needs Improvement (orange square)"
        "score < 0.5": "Poor (red triangle)"

    - step: 7
      action: "Extract screenshot and filmstrip"
      extract:
        screenshot: "lighthouseResult.audits['final-screenshot'].details.data (base64 image)"
        filmstrip: "lighthouseResult.audits['screenshot-thumbnails'].details.items[] (timing + data)"
      note: "Screenshot shows final rendered state. Filmstrip shows loading progression."

    - step: 8
      action: "Extract Insights (grouped audits with group='insights')"
      extract:
        insights: "lighthouseResult.categories.performance.auditRefs where group='insights'"
      note: |
        Insights are audits in the 'insights' group. Map each auditRef.id to its audit
        in lighthouseResult.audits. Include: title, score, displayValue.
        Sort by score (worst first). These map to PSI browser "INSIGHTS" section.
      key_insights:
        - "render-blocking-insight: Render blocking requests"
        - "image-delivery-insight: Improve image delivery"
        - "font-display-insight: Font display"
        - "lcp-breakdown-insight: LCP breakdown"
        - "network-dependency-tree-insight: Network dependency tree"
        - "cache-insight: Use efficient cache lifetimes"
        - "dom-size-insight: Optimize DOM size"
        - "third-parties-insight: Third parties"
        - "document-latency-insight: Document request latency"

    - step: 9
      action: "Extract Diagnostics (grouped audits with group='diagnostics')"
      extract:
        diagnostics: "lighthouseResult.categories.performance.auditRefs where group='diagnostics'"
      note: |
        Diagnostics are audits in the 'diagnostics' group. Map each auditRef.id to its audit.
        Include: title, score, displayValue, details.overallSavingsMs, details.overallSavingsBytes.
        Sort by score (worst first). These map to PSI browser "DIAGNOSTICO" section.
      key_diagnostics:
        - "unused-javascript: Reduce unused JavaScript"
        - "unused-css-rules: Reduce unused CSS"
        - "unsized-images: Images without explicit width/height"
        - "long-tasks: Avoid long main-thread tasks"
        - "unminified-javascript: Minify JavaScript"
        - "unminified-css: Minify CSS"
        - "total-byte-weight: Avoids enormous network payloads"
        - "bootup-time: JavaScript execution time"
        - "mainthread-work-breakdown: Minimizes main-thread work"

    - step: 10
      action: "Extract CrUX field data (if available)"
      extract:
        crux_url: "loadingExperience.metrics (URL-level)"
        crux_origin: "originLoadingExperience.metrics (origin-level fallback)"
      note: "CrUX may not exist for low-traffic sites. Try URL first, fallback to origin."

    - step: 11
      action: "Save raw JSON and extracted metrics"

  acceptance_criteria:
    - "API response saved as valid JSON"
    - "All 4 category scores extracted (Performance, Accessibility, Best Practices, SEO)"
    - "At least LCP, CLS, TBT, FCP, SI metrics present with scores and displayValues"
    - "Screenshot base64 data extracted"
    - "Insights list extracted with scores and savings"
    - "Diagnostics list extracted with scores and savings"
    - "CrUX field data extracted (or flagged as unavailable)"

  veto_conditions:
    - "URL is not publicly accessible → Cannot audit (requires external access)"
    - "API returns consistently 5xx → Service unavailable, try later"
    - "Score is null → Lighthouse failed to run, check if page loads"
```
