# AIOS Glossary

Official terminology for AIOS 4.x differentiation.

## Official Terms

| Official Term | Definition | Use When |
| --- | --- | --- |
| `squad` | Group of specialized AI agents for one domain/workstream. | Describing domain bundles and reusable agent sets. |
| `flow-state` | Runtime-determined state of workflow progression and next action. | Referring to state-based orchestration behavior. |
| `confidence gate` | Delivery decision gate based on delivery confidence score/threshold. | Discussing merge/block decisions from confidence score. |
| `execution profile` | Risk-based autonomy profile (`safe`, `balanced`, `aggressive`). | Controlling agent autonomy by context/risk. |

## Deprecated Terms

| Deprecated | Replacement | Notes |
| --- | --- | --- |
| `expansion pack` | `squad` | Keep only in historical release notes. |
| `permission mode` | `execution profile` | Use in migration notes only with explicit replacement. |
| `workflow state` | `flow-state` | Prefer `flow-state` in product-facing docs. |

## Semantic Lint Policy

- Enforced by `scripts/semantic-lint.js`.
- Error-level terms block commits/CI.
- Warning-level terms are reported for gradual migration.
