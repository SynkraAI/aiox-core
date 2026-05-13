# aiox-core/governance/proposals/

FrameworkProposals — formal change requests to evolve the AIOX framework based on AuditFindings.

See [`../evolution-pipeline.md`](../evolution-pipeline.md) for full pipeline.

## Layout

```text
proposals/
├── README.md                              # this file
├── PROP-<YYYYMMDD>-<slug>.yaml            # active proposals (PENDING / APPROVED / NEEDS_REVISION)
└── archive/                               # rejected or superseded proposals
    └── PROP-<YYYYMMDD>-<slug>.yaml
```

## Status of a proposal

- **PENDING** — awaiting Eliel's review
- **APPROVED** — Eliel signed; implementer can open PR in aiox-core
- **REJECTED** — Eliel declined; proposal moves to `archive/` with rationale
- **NEEDS_REVISION** — Eliel requested changes; proposer addresses and resubmits

## Authority

Only Eliel sets `eliel_decision` field. Any agent can write a proposal but cannot self-approve.
