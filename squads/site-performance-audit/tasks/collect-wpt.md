# Task: Collect WebPageTest Data

```yaml
task:
  name: "Collect WebPageTest Data"
  id: collect-wpt
  version: "1.0.0"
  execution_type: Worker
  responsible_executor: "site-performance-audit-chief"
  estimated_time: "1-3 min"
  status: pending

  description: >-
    Executa teste no WebPageTest para coleta de waterfall detalhado,
    filmstrip e metricas avancadas. Uso seletivo — consome quota limitada.

  trigger_conditions:
    - "PSI performance score < 50 (critical issues)"
    - "User explicitly requests deep dive"
    - "Waterfall analysis needed for root cause identification"
    - "Third-party blocking analysis required"

  input:
    - name: url
      type: string
      required: true
    - name: api_key
      type: string
      required: true
      source: "dotenv:.env:WPT_API_KEY"
      fallback: "env:WPT_API_KEY"
      description: "WebPageTest API key (free at webpagetest.org/signup) — loaded from project .env file"
    - name: location
      type: string
      default: "Dulles:Chrome"
      description: "Test location:browser"
    - name: runs
      type: integer
      default: 3
      description: "Number of test runs (median used)"
    - name: connectivity
      type: enum
      values: [Cable, 3G, 4G, LTE, Native]
      default: Cable

  output:
    - name: wpt_result
      type: json
      contains:
        - data.median.firstView (all metrics)
        - data.median.firstView.requests (waterfall)
        - data.median.firstView.breakdown (by content type)
        - data.runs[].firstView.videoFrames (filmstrip)

  api_reference:
    submit_endpoint: "https://www.webpagetest.org/runtest.php"
    result_endpoint: "https://www.webpagetest.org/jsonResult.php"
    method: GET
    params:
      url: "{url}"
      k: "{api_key}"
      f: json
      runs: "{runs}"
      location: "{location}"
      connectivity: "{connectivity}"
      lighthouse: 1
      video: 1
    rate_limit: "No daily limit"
    monthly_quota: "300 tests/month (free)"
    cost: "Free (300/mo) | $15/mo (1K)"

  action_items:
    - step: 1
      action: "Check remaining monthly quota"
      note: "Track usage in data/wpt-usage.json"
      veto: "Quota exhausted → SKIP, note in report"

    - step: 2
      action: "Submit test"
      command: |
        curl -s "https://www.webpagetest.org/runtest.php?url={url}&k={api_key}&f=json&runs={runs}&location={location}&lighthouse=1&video=1"

    - step: 3
      action: "Poll for results"
      poll_url: "https://www.webpagetest.org/jsonResult.php?test={test_id}"
      poll_interval: "10 seconds"
      max_wait: "180 seconds"
      status_check: "data.statusCode == 200 means complete"

    - step: 4
      action: "Extract key waterfall data"
      extract:
        ttfb: "data.median.firstView.TTFB"
        start_render: "data.median.firstView.render"
        speed_index: "data.median.firstView.SpeedIndex"
        lcp: "data.median.firstView.chromeUserTiming.LargestContentfulPaint"
        cls: "data.median.firstView.chromeUserTiming.CumulativeLayoutShift"
        total_bytes: "data.median.firstView.bytesIn"
        requests: "data.median.firstView.requestsFull"
        dom_elements: "data.median.firstView.domElements"
        blocking_time: "data.median.firstView.TotalBlockingTime"

    - step: 5
      action: "Extract content breakdown"
      extract:
        html_bytes: "data.median.firstView.breakdown.html.bytes"
        js_bytes: "data.median.firstView.breakdown.js.bytes"
        css_bytes: "data.median.firstView.breakdown.css.bytes"
        image_bytes: "data.median.firstView.breakdown.image.bytes"
        font_bytes: "data.median.firstView.breakdown.font.bytes"
        other_bytes: "data.median.firstView.breakdown.other.bytes"

    - step: 6
      action: "Extract third-party requests"
      note: "Identify requests to domains different from the tested URL"

    - step: 7
      action: "Save test URL for future reference"
      format: "https://www.webpagetest.org/result/{test_id}/"

  acceptance_criteria:
    - "Test completed (status 200)"
    - "Waterfall data available"
    - "Content breakdown extracted"
    - "At least 1 complete run available"

  veto_conditions:
    - "Monthly quota exhausted → SKIP entirely, use PSI data"
    - "Test timeout after 180s → SKIP, note in report"
    - "API key invalid → STOP, guide user to signup"

  quota_tracking:
    file: "data/wpt-usage.json"
    format: |
      {
        "month": "2026-03",
        "tests_used": 0,
        "tests_limit": 300,
        "tests_remaining": 300,
        "history": []
      }
```
