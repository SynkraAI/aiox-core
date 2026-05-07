# aiox-core/audits/

Cross-project audit reports and AuditFinding artifacts. Part of the AIOX Framework Evolution Pipeline.

See [`../governance/evolution-pipeline.md`](../governance/evolution-pipeline.md) for the full pipeline spec.

## Layout

```text
audits/
├── README.md                              # this file
├── <audit-narrative>.md                   # human-readable audit reports (e.g., c-dev-organization-2026-05-07.md)
├── promoted/                              # AuditFindings flagged framework_candidate: true
│   └── AF-<YYYYMMDD>-<slug>.yaml
└── archived/                              # AuditFindings that stayed scope-bound (project-only)
    └── AF-<YYYYMMDD>-<slug>.yaml
```

## When to write an audit here

Write a narrative `.md` audit report at this folder root when:
- Scope crosses 2+ projects, or
- Topic is workspace-level (e.g., `C:/dev/` organization, cross-cutting tooling)

Write a structured AuditFinding YAML in `promoted/` when:
- A specific finding may evolve into framework changes
- See template at `../governance/templates/audit-finding-tmpl.yaml`

## Authority

Any agent may author an audit. Promotion to a framework proposal requires Eliel's approval (see pipeline doc).
