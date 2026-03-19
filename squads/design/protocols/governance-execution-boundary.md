# Governance-Execution Boundary Protocol

## Purpose

Define the strict boundary between governance (rule-making) and execution (rule-using) within the Design Squad.

## Principle

> "Governance creates, execution uses."

No execution agent may create new governance artifacts (rules, tokens specs, protocols, checklists). No governance agent should implement components or run audits directly.

## Ownership Matrix

### Governance Agents (Create Rules)

| Agent | Owns | Creates |
|-------|------|---------|
| @design-chief | Orchestration, routing | Quality gate definitions, routing rules |
| @dave-malouf | DesignOps, process | Maturity models, scaling protocols, operational checklists |
| @dan-mall | Adoption, stakeholder | Adoption frameworks, narrative guidelines |

### Execution Agents (Use Rules)

| Agent | Owns | Uses |
|-------|------|------|
| @brad-frost | Architecture, components | Token specs, component matrix, WCAG checklists |
| @nano-banana-generator | Visual support | Visual spec templates, brand tokens |

## Artifact Ownership

| Artifact Type | Owner (Governance) | Consumer (Execution) |
|---------------|-------------------|---------------------|
| Token specifications | @design-chief | @brad-frost |
| Component matrix | @dave-malouf | @brad-frost |
| WCAG checklists | @dave-malouf | @brad-frost |
| Prompt injection templates | @design-chief | All agents |
| Registry schema | @design-chief | @brad-frost |
| Handoff protocols | @dave-malouf | All agents |
| Visual specs | @design-chief | @nano-banana-generator |

## Decision Escalation

1. **Execution agent needs new rule** → Request to @design-chief
2. **Governance conflict** → @design-chief mediates
3. **Cross-squad governance** → Follow handoff protocol
4. **Emergency override** → @design-chief with documented justification

## Enforcement

- Agents MUST check their role before creating artifacts
- Governance agents MUST NOT implement code directly
- Execution agents MUST cite governance source for every decision
- Violations are logged and reviewed in squad retrospectives

## Related

- [AI-First Governance](ai-first-governance.md)
- [Handoff Protocol](handoff.md)
