# Design System Squad - Source Tree

## Squad Structure

```text
squads/design/
├── config.yaml
├── squad.yaml
├── README.md
├── agents/
│   ├── design-chief.md
│   ├── brad-frost.md
│   ├── dan-mall.md
│   ├── dave-malouf.md
│   └── nano-banana-generator.md
├── tasks/
│   ├── ds-*.md
│   ├── a11y-audit.md
│   ├── aria-audit.md
│   ├── contrast-matrix.md
│   ├── focus-order-audit.md
│   ├── atomic-refactor-plan.md
│   ├── atomic-refactor-execute.md
│   ├── design-triage.md
│   └── design-review-orchestration.md
├── checklists/
├── templates/
├── data/
├── workflows/
├── protocols/
└── scripts/
```

## Responsibilities

| Agent | File | Responsibility |
|---|---|---|
| Design Chief | `agents/design-chief.md` | triage, routing, orchestration |
| Brad Frost | `agents/brad-frost.md` | DS architecture, components, tokens |
| Dan Mall | `agents/dan-mall.md` | DS buy-in, adoption messaging |
| Dave Malouf | `agents/dave-malouf.md` | design ops, process, governance |
| Nano Banana | `agents/nano-banana-generator.md` | visual utility support |

## Task Domains

| Domain | Prefix/Files | Owner |
|---|---|---|
| Design System Core | `ds-*` | Brad Frost |
| Accessibility | `a11y-audit`, `aria-audit`, `contrast-matrix`, `focus-order-audit` | Brad Frost |
| Atomic Refactor | `atomic-refactor-*` | Brad Frost |
| DesignOps | `designops-*`, `design-process-optimization`, `design-team-scaling`, `design-tooling-audit` | Dave Malouf |
| Orchestration | `design-triage`, `design-review-orchestration` | Design Chief |
| Utilities | remaining utility tasks | Mixed |

## Cross-Squad Policy

- Brand/logo/pricing requests -> `squads/brand`
- Thumbnail/photo/video requests -> `squads/content-visual`
- `squads/design` does not execute those domains anymore.
