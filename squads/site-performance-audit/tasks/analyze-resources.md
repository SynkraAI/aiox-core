# Task: Analyze Resources & Third-Party Impact

```yaml
task:
  name: "Analyze Resources & Third-Party Impact"
  id: analyze-resources
  version: "1.0.0"
  execution_type: Agent
  responsible_executor: "tim-kadlec"
  estimated_time: "3-5 min"
  status: pending

  description: >-
    Analisa JavaScript bundles, third-party scripts e distribuicao
    de recursos a partir dos dados de PSI e WPT.

  input:
    - name: psi_data
      type: json
      required: true
    - name: wpt_data
      type: json
      required: false

  output:
    - name: resource_analysis
      type: markdown
      sections:
        - "JavaScript analysis (total bytes, blocking scripts, coverage)"
        - "Third-party inventory (domains, requests, sizes, blocking)"
        - "Image analysis (formats, sizes, optimization opportunities)"
        - "Font analysis (loading strategy, formats)"
        - "Resource loading recommendations"

  action_items:
    - step: 1
      name: "JavaScript Budget Analysis"
      framework: "Tim Kadlec JS analysis"
      checks:
        - "Total JS bytes (target: < 300KB compressed for mobile)"
        - "Number of JS files"
        - "Render-blocking scripts identified"
        - "Unused JavaScript percentage (from Lighthouse audit)"
        - "Main thread blocking time from JS"
      thresholds:
        js_budget_mobile: "< 300KB compressed"
        js_budget_desktop: "< 500KB compressed"
        unused_js_warning: "> 20% unused"
        unused_js_critical: "> 40% unused"

    - step: 2
      name: "Third-Party Script Inventory"
      extract_from: "PSI network requests + diagnostics"
      for_each_third_party:
        - "Domain name"
        - "Number of requests"
        - "Total transfer size"
        - "Is render-blocking? (in critical path)"
        - "Main thread blocking time contribution"
        - "Category (analytics, ads, social, cdn, other)"
      assessment: |
        For each third-party:
        - CRITICAL: Blocks rendering OR > 500ms main thread time
        - WARNING: > 100KB transfer OR > 200ms blocking
        - OK: Minimal impact
      common_offenders:
        - "Google Tag Manager (often loads many sub-scripts)"
        - "Facebook Pixel (can block rendering)"
        - "Chat widgets (Intercom, Drift — heavy JS)"
        - "A/B testing tools (often render-blocking)"
        - "Ad networks (multiple redirects, heavy scripts)"

    - step: 3
      name: "Image Analysis"
      checks:
        - "Total image bytes"
        - "Images in modern format (WebP/AVIF)?"
        - "Properly sized images (not oversized for viewport)"
        - "LCP image optimization (preloaded, fetchpriority)"
        - "Lazy loading on below-fold images?"
        - "Responsive images (srcset/sizes)?"

    - step: 4
      name: "Font Analysis"
      checks:
        - "Number of font files"
        - "Total font bytes"
        - "font-display strategy (swap, optional, block)"
        - "Preloaded critical fonts?"
        - "Using system fonts for non-brand text?"
        - "Subsetting applied?"

    - step: 5
      name: "Resource Loading Recommendations"
      framework: "Harry Roberts resource loading"
      patterns:
        preconnect: "For critical third-party origins"
        preload: "For LCP image, critical fonts"
        defer: "For non-critical JavaScript"
        async: "For analytics and tracking scripts"
        lazy: "For below-fold images and iframes"
        fetchpriority: "high for LCP resource, low for below-fold"

  acceptance_criteria:
    - "JS total bytes and budget assessment complete"
    - "Third-party inventory with impact classification"
    - "Image optimization opportunities identified"
    - "Font loading strategy assessed"
    - "Specific resource loading recommendations provided"

  veto_conditions:
    - "PSI data missing or invalid → STOP, rerun collect-psi"
    - "No network request data available in PSI response → STOP, verify API fields"
    - "Third-party inventory lists domains without impact classification (blocking/TBT) → REWORK Step 2"
    - "Recommendations are generic ('optimize images') without specific format/size/loading details → REWORK Step 5"
```
