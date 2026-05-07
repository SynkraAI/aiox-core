# aiox-core/governance/patterns/

Catalog of approved framework patterns. Each pattern was promoted from an AuditFinding via FrameworkProposal and approved by Eliel.

See [`../evolution-pipeline.md`](../evolution-pipeline.md) for the promotion flow.

## Pattern catalog

| Pattern | Source proposal | Status | Doc |
|---|---|---|---|
| Vocabulary Contract Store | `PROP-20260507-vocabulary-contract.yaml` | APPROVED | (implementation pattern doc pending) |
| Squad Activation Routing | `PROP-20260507-squad-routing-strategy.yaml` | APPROVED | [`../squad-activation-strategy.md`](../squad-activation-strategy.md) |

## Anatomy of a pattern document

Each pattern doc includes:

1. **Problem** — what real-world failure mode this prevents
2. **Pattern** — the convention itself (rules, structure, code shape)
3. **When to apply** — triggers/heuristics for invocation
4. **When NOT to apply** — anti-patterns and exclusions
5. **Implementation** — code/config snippets, file structure
6. **Examples** — minimum 2 from real projects
7. **Source AuditFinding(s)** — institutional memory link

## Authority

Patterns become canonical only after Eliel approval. Catalog updates happen as part of the FrameworkProposal merge PR.
