# Task: Execute Full External Audit

```yaml
task:
  name: "Execute Full External Audit"
  id: full-audit
  version: "1.0.0"
  execution_type: Hybrid
  responsible_executor: "site-performance-audit-chief"
  estimated_time: "15-30 min"
  status: pending

  description: >-
    Executa o workflow completo de auditoria externa (wf-external-audit.yaml).
    Coordena coleta de dados, delegacao para agentes especialistas,
    e consolidacao do relatorio final.

  input:
    - name: url
      type: string
      required: true
    - name: strategy
      type: enum
      values: [mobile, desktop, both]
      default: both
    - name: competitor_urls
      type: array
      required: false
    - name: industry
      type: string
      required: false
    - name: business_context
      type: string
      required: false

  output:
    - name: audit_report
      type: markdown
      template: "templates/audit-report-tmpl.md"

  action_items:
    - step: 1
      name: "Validate Prerequisites"
      checks:
        - "GOOGLE_PSI_API_KEY is set"
        - "URL is valid and publicly accessible"
        - "WPT_API_KEY is set (optional, for deep dive)"
      on_missing_api_key: "Run *setup to configure"

    - step: 2
      name: "Phase 1 — Data Collection"
      executor: worker
      actions:
        - "Run collect-psi.md (mobile) — PARALLEL"
        - "Run collect-psi.md (desktop) — PARALLEL"
        - "Run collect-crux.md — PARALLEL"
        - "Run collect-wpt.md (IF PSI score < 50 OR deep_dive=true)"
        - "Run collect-crux.md for competitors (IF provided) — PARALLEL"
      checkpoint: "CP-1: All API responses received"

    - step: 3
      name: "Phase 2 — Score Interpretation"
      executor: agent
      delegate_to:
        - agent: "addy-osmani"
          task: "diagnose-cwv.md"
          input: "PSI + CrUX data"
        - agent: "steve-souders"
          task: "14 Rules compliance check"
          input: "PSI data"
      checkpoint: "CP-2: CWV classified + 14 Rules assessed"

    - step: 4
      name: "Phase 3 — Deep Diagnostics"
      executor: agent
      delegate_to:
        - agent: "patrick-meenan"
          task: "Waterfall analysis"
          input: "PSI/WPT data"
        - agent: "harry-roberts"
          task: "Resource loading audit"
          input: "PSI diagnostics"
        - agent: "tim-kadlec"
          task: "analyze-resources.md"
          input: "PSI data"
      checkpoint: "CP-3: Root causes identified with evidence"

    - step: 5
      name: "Phase 4 — Hypothesis & Prioritization"
      executor: agent
      delegate_to:
        - agent: "barry-pollard"
          task: "benchmark-competitors.md"
          input: "CrUX data + competitor data"
        - agent: "tammy-everts"
          task: "generate-hypotheses.md"
          input: "Root causes + benchmarks + business context"
      checkpoint: "CP-4: Hypotheses with business impact"

    - step: 6
      name: "Phase 5 — Report Generation"
      executor: agent
      agent: "site-performance-audit-chief"
      actions:
        - "Consolidate all phase outputs"
        - "Apply audit-report-tmpl.md template"
        - "Run audit-quality-gate.md checklist"
        - "Generate final report"
      checkpoint: "CP-5: Quality gate passed"

    - step: 7
      name: "Deliver Report"
      output: "audit-{url_slug}-{date}.md"

  acceptance_criteria:
    - "All 5 phases completed"
    - "Quality gate PA-QG-001 passed"
    - "Report has executive summary, CWV card, root causes, hypotheses, action plan"
    - "At least 3 quick wins identified"
    - "All data points backed by evidence"

  veto_conditions:
    - "No API key configured → STOP, run *setup"
    - "URL not accessible → STOP, verify URL"
    - "All APIs fail → STOP, check network/keys"
    - "Report has zero quick wins → REWORK Phase 3-4"
    - "Hypotheses without evidence → REWORK Phase 4"
```
