# Task: Diagnose Core Web Vitals

```yaml
task:
  name: "Diagnose Core Web Vitals"
  id: diagnose-cwv
  version: "1.0.0"
  execution_type: Agent
  responsible_executor: "addy-osmani"
  estimated_time: "3-5 min"
  status: pending

  description: >-
    Analisa dados de PSI e CrUX para diagnosticar problemas
    em cada Core Web Vital (LCP, CLS, INP) com causa-raiz.

  dependencies:
    - name: cwv-thresholds
      path: "data/cwv-thresholds.yaml"
      description: "Source of truth for all CWV threshold values (Good/NI/Poor)"
      usage: "All threshold references in this task use values from this file"

  input:
    - name: psi_mobile
      type: json
      required: true
    - name: psi_desktop
      type: json
      required: true
    - name: crux_data
      type: json
      required: false

  output:
    - name: cwv_diagnosis
      type: markdown
      sections:
        - "Category Scores (Performance, Accessibility, Best Practices, SEO)"
        - "Metrics with indicators (red triangle / orange square / green circle)"
        - "Insights list (from PSI insights group, sorted by severity)"
        - "Diagnostics list (from PSI diagnostics group, sorted by severity)"
        - "LCP Analysis (cause, element, recommendations)"
        - "CLS Analysis (shifting elements, causes)"
        - "INP Analysis (interaction bottlenecks)"
        - "Lab vs Field comparison"

  output_format:
    quick_audit: |
      The *quick-audit output MUST include these sections in order:

      1. CATEGORY SCORES — All 4 scores with color indicators
      2. METRICS — All 5 metrics with values, colored indicators, and thresholds
      3. Test environment metadata (device, lighthouse version, network, timestamp)
      4. INSIGHTS — All failing insights sorted by severity (worst first)
         Format: indicator + title + estimated savings
      5. DIAGNOSTICS — All failing diagnostics sorted by severity
         Format: indicator + title + estimated savings
      6. Quick diagnosis summary with top hypotheses

    indicator_mapping:
      "score >= 0.9": "GREEN CIRCLE (good)"
      "score >= 0.5 and < 0.9": "ORANGE SQUARE (needs improvement)"
      "score < 0.5": "RED TRIANGLE (poor)"
      "score is null": "GRAY CIRCLE (not applicable/no data)"

  action_items:
    - step: 1
      name: "LCP Diagnosis"
      framework: "Addy Osmani LCP Optimization"
      checks:
        - "What is the LCP element? (image, text block, video)"
        - "Is the LCP resource discoverable? (in initial HTML vs JS-loaded)"
        - "Is the LCP resource preloaded? (link rel=preload)"
        - "Does the LCP resource have fetchpriority=high?"
        - "Is the server response slow? (TTFB > good threshold — see data/cwv-thresholds.yaml)"
        - "Is render blocked by CSS or JS?"
        - "Is the LCP image optimized? (format, size, dimensions)"
      common_causes:
        - "Slow server response (TTFB)"
        - "Render-blocking resources"
        - "Slow resource load time"
        - "Client-side rendering"

    - step: 2
      name: "CLS Diagnosis"
      framework: "Layout Shift Sources"
      checks:
        - "Are images/videos missing width/height attributes?"
        - "Are ads or embeds injected without reserved space?"
        - "Are web fonts causing FOIT/FOUT?"
        - "Is dynamic content injected above the fold?"
        - "Are animations using non-composited properties?"
      common_causes:
        - "Images without dimensions"
        - "Ads/embeds without size"
        - "Font loading (flash of unstyled/invisible text)"
        - "Dynamic content injection"

    - step: 3
      name: "INP Diagnosis"
      framework: "Interaction Responsiveness"
      checks:
        - "Is Total Blocking Time high? (proxy for INP in lab)"
        - "Are there long tasks (>50ms) on the main thread?"
        - "Is JavaScript execution heavy during interactions?"
        - "Are event handlers doing synchronous work?"
        - "Is there excessive DOM size (>1500 elements)?"
      common_causes:
        - "Long JavaScript tasks"
        - "Excessive DOM size"
        - "Synchronous XHR in event handlers"
        - "Heavy third-party scripts"

    - step: 4
      name: "Present Insights (PSI insights group)"
      analysis: |
        Extract all audits from the 'insights' group in performance auditRefs.
        For each audit with score < 1 (has issues):
        1. Map score to indicator (red triangle / orange square / green circle)
        2. Show title + estimated savings (displayValue)
        3. Sort by score ascending (worst first)
        4. Include expandable details when available (resource list, LCP breakdown, etc.)

        Key insights to always check:
        - render-blocking-insight: Render blocking requests
        - image-delivery-insight: Improve image delivery
        - font-display-insight: Font display
        - lcp-breakdown-insight: LCP breakdown
        - network-dependency-tree-insight: Network dependency tree
        - cache-insight: Use efficient cache lifetimes
        - dom-size-insight: Optimize DOM size
        - third-parties-insight: Third parties
        - document-latency-insight: Document request latency

    - step: 5
      name: "Present Diagnostics (PSI diagnostics group)"
      analysis: |
        Extract all audits from the 'diagnostics' group in performance auditRefs.
        For each audit with score < 1 (has issues):
        1. Map score to indicator
        2. Show title + displayValue (savings in KiB, count, etc.)
        3. Sort by score ascending (worst first)
        4. Include resource-level details (specific files, sizes, savings)

        Key diagnostics to always check:
        - unused-javascript: Reduce unused JavaScript (overallSavingsBytes)
        - unused-css-rules: Reduce unused CSS (overallSavingsBytes)
        - unsized-images: Images without explicit width and height
        - long-tasks: Avoid long main-thread tasks
        - bootup-time: JavaScript execution time
        - mainthread-work-breakdown: Minimizes main-thread work
        - total-byte-weight: Avoids enormous network payloads

        Note: "These numbers do not directly affect the performance score"
        (but they provide important diagnostic information)

    - step: 6
      name: "Lab vs Field Comparison"
      analysis: |
        Compare Lighthouse (lab) values with CrUX (field) values.
        Significant divergence indicates:
        - Lab better than Field → Real users on slower networks/devices
        - Lab worse than Field → Lab throttling is overly aggressive
        - Similar values → Lab is a good proxy for real-world

  thresholds_note: >-
    All threshold values (LCP 2.5s/4.0s, CLS 0.1/0.25, INP 200ms/500ms, TTFB 800ms/1800ms, FCP 1.8s/3.0s)
    are defined in data/cwv-thresholds.yaml — that file is the single source of truth.
    Do NOT hardcode threshold values; always reference the YAML.

  acceptance_criteria:
    - "All 3 CWV metrics diagnosed with specific causes"
    - "LCP element identified"
    - "CLS sources identified (if CLS > good threshold per data/cwv-thresholds.yaml)"
    - "Lab vs Field comparison narrative included"
    - "Each diagnosis backed by data from PSI/CrUX"

  veto_conditions:
    - "PSI data missing or invalid for both mobile and desktop → STOP, rerun collect-psi"
    - "No CWV metric data available (neither lab nor field) → STOP, verify API response"
    - "Diagnosis lists causes without citing specific data points → REWORK with evidence"
    - "LCP element not identified → REWORK Step 1"
```
