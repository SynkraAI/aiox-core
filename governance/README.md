# aiox-core/governance/

Governance documents for the AIOX framework. This is where the framework's **own evolution rules** live.

## Documents

| Document | Purpose |
|---|---|
| [`evolution-pipeline.md`](evolution-pipeline.md) | Defines how the framework evolves: audit → proposal → approval → PR → distribution |
| [`squad-activation-strategy.md`](squad-activation-strategy.md) | Conditional consult-squad-first routing for `@aiox-master` |
| `handoff-types.md` (TBD) | Distinguishes contract handoffs vs micro-handoffs vs phase handoffs |

## Layout

```text
governance/
├── README.md                       # this file
├── evolution-pipeline.md           # core pipeline spec
├── squad-activation-strategy.md    # squad routing for @aiox-master
├── proposals/                      # FrameworkProposal YAMLs awaiting/processed by Eliel
│   ├── README.md
│   ├── PROP-<YYYYMMDD>-<slug>.yaml
│   └── archive/                    # rejected or superseded proposals
├── patterns/                       # approved framework patterns
│   ├── README.md                   # catalog of patterns
│   └── <pattern-name>.md
└── templates/                      # YAML templates for finding + proposal
    ├── audit-finding-tmpl.yaml
    └── framework-proposal-tmpl.yaml
```

## Authority

- **Authors of governance docs:** any agent or Eliel
- **Approver of governance changes:** Eliel (sole orchestrator approver)
- **Implementers:** @aiox-master + relevant specialist agents
