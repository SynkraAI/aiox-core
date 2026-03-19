# Generate AI-Readable Component Metadata

> Task ID: brad-ds-generate-ai-metadata
> Agent: Brad (Design System Architect)
> Version: 1.0.0

## Description

Create machine-readable metadata for design system components so AI agents can discover, reason about, and assemble UI with real components (not hallucinated variants).

## Prerequisites

- Components organized in workspace/system and workspace/ui
- Token hierarchy available (primitives/semantic/component)
- Registry strategy defined (`registry.json`)
- Governance protocol available: `squads/design/protocols/ai-first-governance.md`

## Workflow

1. **Collect Component Inventory**
- Enumerate each component with canonical path and export name.
- Resolve variants, slots, and composition relations.

2. **Attach Design Semantics**
- For each component, define:
  - intent (e.g. `form-submit`, `navigation`, `feedback`)
  - allowed contexts (marketing, dashboard, onboarding)
  - interaction model (controlled/uncontrolled)

3. **Attach Technical Contracts**
- Props schema with type, required, default.
- Variant schema (`cva` variants, compound variants).
- Accessibility contract (`role`, keyboard behavior, aria requirements).

4. **Link Tokens and Dependencies**
- Map semantic tokens used by each variant.
- Capture dependencies (primitives, icons, hooks, utilities).

5. **Write Metadata Artifacts**
- Per-component metadata JSON files.
- Consolidated index:
  - `workspace/domains/design-system/metadata/components.json`

6. **Quality Validation**
- Validate metadata against JSON schema.
- Reject components with missing a11y contract or token mapping.

7. **AI-First Governance Check (Required)**
- Confirm canonical references are used (no alternate policy paths).
- Mark status of each dependency: `Implemented`, `Partially implemented`, `Concept only`.
- Flag unresolved dependencies explicitly.

## Deliverables

- Component metadata files (JSON)
- Central metadata index in domains/design-system/metadata
- Validation output (pass/fail by component)

## Success Criteria

- [ ] 100% of exported components represented in metadata index
- [ ] Every component includes a11y contract and token mapping
- [ ] Metadata schema validation passes with zero errors
- [ ] Metadata can be consumed by MCP handlers and RAG pipelines

## Notes

- Prefer explicit schemas over prose.
- Keep metadata deterministic and versioned.
- Machine-readable documentation is part of the product, not optional docs.


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
