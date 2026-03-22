---
name: decision-tree-generator
description: "This skill should be used when the user wants to create structured decision tree documentation for any process or domain. Triggers on requests like 'create a decision tree', 'map this decision process', 'help me choose between options', 'document this decision flow', or any request to transform complex decision-making into structured, actionable documentation with flowcharts, criteria matrices, and implementation guidance."
---

# Decision Tree Documentation Generator

Transform complex decision-making processes into clear, actionable documentation including
decision types, criteria hierarchies, Mermaid flowcharts, comparison matrices, and
implementation guidance.

## Activation

When activated, greet the user and begin elicitation:

> "I'm ready to help you create a comprehensive Decision Tree document. Let's start by
> understanding the process you want to map.
>
> **What decision or process would you like to document?**
>
> (Example: 'Choosing between cloud providers', 'Determining project priority',
> 'Selecting the right marketing channel', etc.)"

## Elicitation Process

Gather information through 5 structured phases before generating documentation.
Ask questions conversationally -- avoid overwhelming the user with all questions at once.

### Phase 1: Process Identification

1. What process or decision are we documenting?
2. What is the context/domain? (technical, business, operational, creative, etc.)
3. Who will use this decision tree? (developers, managers, operators, AI agents, etc.)
4. What triggers this decision? (event, request, condition, etc.)

### Phase 2: Outcome Discovery

1. What are ALL possible final outcomes/decisions?
2. For EACH outcome:
   - When should someone choose it?
   - 2-3 concrete examples where it is the right choice
   - What makes it different from other options?

If fewer than 2 outcomes are provided, probe deeper:
- Are there edge cases or special situations?
- Could a hybrid/combined approach apply?
- Is there a "none of the above" or escalation path?

### Phase 3: Criteria Definition

For each decision point:
1. What question determines the right path?
2. Is it yes/no or multi-answer?
3. What evidence is needed to answer it?

Build a criteria hierarchy:
- **Primary Criteria**: First/most important question
- **Secondary Criteria**: Dependent on primary answer
- **Tertiary Criteria**: Fine-tuning for edge cases

### Phase 4: Metrics & Trade-offs (if applicable)

1. Are there measurable differences? (cost, time, quality, risk)
2. What are the trade-offs of each option?
3. Is there a default/fallback if criteria are unclear?

### Phase 5: Validation

Before generating, summarize and confirm:

```
Based on our conversation:

**Process:** [name]
**Decision Types:** [list]
**Key Criteria:** [list]
**Primary Use Cases:** [list]

Is this correct? Anything missing?
```

## Output Generation

After validation, generate the full decision tree document following the template in
`references/output-template.md`. The output MUST include ALL required sections:

1. **Header** with metadata (date, version, status, domain)
2. **Purpose** section (1-2 paragraphs)
3. **Decision Types** with definitions, criteria, examples, and characteristics tables
4. **Decision Tree** as a Mermaid `graph TD` flowchart with colored outcome nodes
5. **Detailed Decision Criteria** with scenario tables for each criterion
6. **Comparison Matrix** covering all types and attributes
7. **Cost-Benefit Analysis** (when applicable)
8. **Hybrid Strategies** (when applicable)
9. **Real-World Examples** walking through the tree step by step
10. **Quick Reference Checklist** for rapid decision-making
11. **Common Mistakes to Avoid** with explanations and corrections
12. **Version History** table

### Alternative Formats

When requested, also provide YAML or JSON representations.
See `references/output-template.md` for format specifications.

## Domain-Specific Adaptations

Adapt content based on domain:

| Domain | Include | Add |
|--------|---------|-----|
| **Technical** | Performance metrics, system requirements | Error handling paths, fallback strategies |
| **Business** | ROI calculations, stakeholder impact | Approval workflows, escalation paths |
| **Operational** | SLAs, resource requirements | Emergency protocols, handoff points |
| **Creative** | Quality criteria, brand alignment | Review cycles, iteration paths |

## Quality Gate

Before delivering, verify against `references/quality-checklist.md`:
- All types defined with clear definitions and 2-3 examples each
- Mermaid flowchart renders correctly and matches written criteria
- No ambiguous language ("usually", "sometimes", "maybe")
- Each path leads to a clear outcome
- Edge cases addressed
- Document usable as standalone reference during actual decision-making

## Core Principles

1. **Objectivity**: Base decisions on quantifiable, measurable criteria
2. **Transparency**: Make decision logic clear and easy to follow
3. **Completeness**: Cover all possible outcomes and edge cases
4. **Practicality**: Include real-world examples for each path
5. **Scalability**: Design trees that work for simple and complex scenarios
