# Audit Quality Gate Checklist

```yaml
checklist:
  id: audit-quality-gate
  name: "Performance Audit Quality Gate"
  version: "1.0.0"
  purpose: "Validate audit report completeness and accuracy before delivery"
  gate_id: "PA-QG-001"
  pass_threshold: "ALL blocking items must pass"
```

---

## Blocking Requirements (ALL must pass)

### Data Completeness
- [ ] PSI mobile score collected and valid (0-100)
- [ ] PSI desktop score collected and valid (0-100)
- [ ] CrUX data collected OR explicitly marked as unavailable (low-traffic)
- [ ] All 3 Core Web Vitals (LCP, CLS, INP) reported with values and status
- [ ] Lab vs Field comparison included (even if field data unavailable)

### Diagnosis Quality
- [ ] At least 3 root causes identified with specific evidence
- [ ] Each root cause linked to a specific CWV metric
- [ ] Root causes are SPECIFIC (not generic like "optimize images")
- [ ] Evidence references actual data points (scores, timings, request counts)
- [ ] Third-party scripts catalogued with blocking assessment

### Hypothesis Quality
- [ ] At least 5 hypotheses formulated
- [ ] Each hypothesis has estimated business impact
- [ ] Hypotheses backed by data from Phases 2-3
- [ ] NO hypotheses are generic or unsupported
- [ ] Priority matrix complete (impact x effort)

### Action Plan
- [ ] At least 3 quick wins identified (high impact, low effort)
- [ ] Each action linked to specific hypothesis
- [ ] Actions are concrete and actionable (not vague recommendations)
- [ ] Timeline categories present (quick wins / medium / strategic)

### Report Format
- [ ] Executive summary fits in 1 screen
- [ ] Scores clearly displayed with Good/NI/Poor classification
- [ ] Souders 14 Rules compliance matrix included
- [ ] Resource breakdown by content type included
- [ ] Methodology section documents tools and frameworks used
- [ ] Limitations section included
- [ ] Report follows the appropriate template (audit-report-tmpl, quick-audit-report-tmpl, or benchmark-report-tmpl)

### Output Persistence
- [ ] User was offered *save after report generation (heuristic PAC-H-008)
- [ ] If saved: file path follows output-standard (YYYY-MM-DD-HHmm-command-id.ext)
- [ ] If saved: _index.yaml updated with new entry

## Recommended (Should Pass)

### Benchmarking
- [ ] Industry benchmark comparison (if CrUX data available)
- [ ] Competitor comparison (if competitor URLs provided)
- [ ] Historical trend (if repeat audit)

### Depth
- [ ] Waterfall analysis narrative (if WPT used)
- [ ] Font loading strategy assessment
- [ ] Image format optimization check (WebP/AVIF)
- [ ] JavaScript budget analysis

## Veto Conditions (Immediate FAIL)

- Report has NO data (all scores missing) → Cannot deliver
- Hypotheses are copy-pasted generic advice → Must be site-specific
- Action plan has zero quick wins → Re-analyze Phase 3
- Report exceeds 20 pages without executive summary → Add summary
