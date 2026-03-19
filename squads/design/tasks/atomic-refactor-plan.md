# Atomic Design Refactoring Plan

> Task ID: atomic-refactor-plan
> Agent: Brad Frost (Design System)
> Version: 2.0.0
>
> **ATUALIZADO Jan/2026:** Adicionados gates anti-over-engineering.
> **Execution Type:** `Hybrid`
> **Human Checkpoint:** Review and approve the refactoring plan, component classification, and complexity gates before execution begins
> **Dependencies:** depends_on: `[]` · enables: `[atomic-refactor-execute]` · workflow: `refactoring`

## Output Schema
- **produces:** `outputs/design-system/{project}/refactoring/refactor-plan.yaml`
- **format:** YAML data
- **consumed_by:** atomic-refactor-execute

## ⛔ LIÇÃO APRENDIDA (LER PRIMEIRO)

Em Jan/2026 atomizamos 22 componentes. Resultado em alguns casos:
- FragmentsTab: 475 → 1003 linhas (+111%)
- 73% dos hooks criados sem reuso externo
- 476 arquivos <30 linhas (boilerplate)

**Nova regra:** Só incluir na lista componentes que realmente precisam E terão hooks reusáveis.

## Description

Analyzes codebase to identify components that **REALMENTE** need Atomic Design refactoring, classifies them by domain and tier, and generates parallel work distribution plans with ready-to-use agent prompts.

This task automates the analysis workflow used to create `docs/refactoring/COMPONENT_REFACTORING_ROADMAP.md` and `docs/refactoring/PARALLEL_REFACTORING_PLAN.md`.

## Prerequisites

- Codebase with React/TypeScript components
- At least one reference component already refactored (e.g., `app/components/ops/users/`)
- `docs/refactoring/` directory exists

## Workflow

### Interactive Elicitation

1. **Select Analysis Scope**
   - Entire codebase or specific directory
   - Minimum line threshold (default: 300)
   - Exclude patterns (e.g., `**/ui/**`, `**/*.test.tsx`)

2. **Configure Work Distribution**
   - Number of parallel agents (2-5, default: 3)
   - Distribution strategy: by domain (default) or by tier
   - Shared components owner (which agent creates shared/)

3. **Review Plan**
   - Show domain distribution
   - Confirm tier classification
   - Preview agent prompts

### Steps

1. **Scan Components**
   - Find all `.tsx` files in target directory
   - Count lines per file (excluding imports/whitespace)
   - Filter by threshold
   - Check: candidate count > 0 AND each has file path + line count — log "Found {N} components above {threshold} line threshold"

2. **Group by Domain**
   - Extract domain from path (e.g., `creator/`, `ops/`, `books/`)
   - Aggregate by domain
   - Calculate total lines per domain
   - Check: all candidates assigned to a domain AND no component unassigned — log "{N} domains with {total} components, {lines} total lines"

3. **Classify by Tier**
   - TIER 1: >800 lines (critical, start first)
   - TIER 2: 500-800 lines (medium priority)
   - ~~TIER 3: 300-500 lines~~ **REMOVIDO v2.0** - muito pequeno, organizar inline
   - Check: every candidate has TIER 1 or TIER 2 classification — log "TIER 1: {N1} components, TIER 2: {N2} components"

4. **⛔ NEW: Filtrar por Potencial de Reuso**
   - Para cada componente, perguntar: "Os hooks serão reusados?"
   - Se NÃO → **EXCLUIR DA LISTA**
   - Apenas componentes com hooks reusáveis em 2+ lugares passam
   - Check: all remaining candidates have reusable hooks (used in 2+ places) — log "{N} components passed reuse filter, {excluded} excluded"

5. **Identify Patterns**
   - Scan for `render{X}()` functions → organisms
   - Count `useState` hooks → custom hooks needed
   - Find repeated UI patterns → molecules
   - Check: each component has render function count + useState count + repeated pattern count — log "Pattern analysis: {hooks} hooks, {renders} render fns, {patterns} repeated patterns"

5. **Distribute Work**
   - Group domains into N agents
   - Balance line count across agents (±20%)
   - Ensure no domain split across agents
   - Check: max agent line count <= min agent line count * 1.4 (within 20% balance) — log "Distribution: {N} agents, range {min}-{max} lines, variance {pct}%"

6. **Generate Shared Components List**
   - Identify commonly needed molecules
   - List hooks that can be generalized
   - Create shared component checklist
   - Check: shared component list count >= 0 AND generalized hooks list exists — log "{N} shared molecules, {M} generalizable hooks identified"

7. **Generate Agent Prompts**
   - Create detailed prompt for each agent
   - Include domain assignments
   - Add checklist and rules
   - Include reference to existing pattern
   - Check: prompt file count == agent count AND each file size > 0 — abort with "Prompt generation failed for agent {N}"

8. **Generate Documentation**
   - Update/create COMPONENT_REFACTORING_ROADMAP.md
   - Update/create PARALLEL_REFACTORING_PLAN.md
   - Create SHARED_REQUESTS.md template
   - Check: `test -f COMPONENT_REFACTORING_ROADMAP.md` AND `test -f PARALLEL_REFACTORING_PLAN.md` AND `test -f SHARED_REQUESTS.md` — abort with "Documentation generation failed: {missing file}"

## Output

- **docs/refactoring/COMPONENT_REFACTORING_ROADMAP.md**: Complete inventory
- **docs/refactoring/PARALLEL_REFACTORING_PLAN.md**: Work distribution
- **docs/refactoring/SHARED_REQUESTS.md**: Shared component request template
- **Console output**: Ready-to-use prompts for each agent

## Related Checklists

- `squads/design/checklists/atomic-refactor-checklist.md`
- `squads/design/checklists/ds-component-quality-checklist.md`

### Output Format

```markdown
# Refactoring Analysis Complete

## Summary
- Components found: {count}
- Total lines: {lines}
- Domains: {domains}
- Agents: {n}

## Distribution

| Agent | Domains | Components | Lines |
|-------|---------|------------|-------|
| 1 | creator/, lms/ | 21 | ~12,600 |
| 2 | ops/, books/, auth/ | 39 | ~20,400 |
| 3 | shared/, design-system/, minds/ | 69 | ~35,300 |

## Prompts Ready

Copy the prompt for each agent from:
- docs/refactoring/prompts/agent-1-prompt.md
- docs/refactoring/prompts/agent-2-prompt.md
- docs/refactoring/prompts/agent-3-prompt.md
```

## Failure Handling

- **Component too complex to refactor atomically:** Decompose into sub-components first. Create intermediate refactoring step
- **Missing design tokens for component:** Run *tokenize for the component's patterns before planning refactor
- **Breaking changes unavoidable:** Document all consumers. Create compatibility layer with deprecation timeline (minimum 2 sprints)
- **No test coverage on target component:** Write characterization tests BEFORE refactoring to prevent regressions

## Success Criteria

- [ ] All components >threshold identified
- [ ] Components classified by tier (TIER 1/2/3)
- [ ] Domains grouped without overlap
- [ ] Work balanced across agents (±20% lines)
- [ ] Agent prompts include all rules and checklists
- [ ] Documentation files generated/updated

## Error Handling

- **No reference component**: Suggest running `atomic-refactor-execute` on smallest component first
- **Single domain only**: Suggest using single agent or splitting by subdomain
- **Imbalanced distribution**: Warn and suggest manual adjustment
- **Existing files**: Ask to overwrite or append

## Examples

### Example 1: Full Analysis

```bash
/atomic-refactor-plan
```

Output:
```
🔍 Uma: Analyzing codebase for refactoring opportunities...

📊 Scan Results:
  Directory: app/components/
  Threshold: 300 lines
  Files scanned: 847
  Candidates found: 131

📁 Domains Found:
  ops/           20 components  ~11,200 lines
  design-system/ 19 components  ~11,700 lines
  books/         18 components  ~8,600 lines
  ...

📈 Tier Classification:
  TIER 1 (>800)  : 10 components  ~10,800 lines ⚠️ Priority
  TIER 2 (500-800): 41 components  ~25,500 lines
  TIER 3 (300-500): 80 components  ~29,000 lines

🤖 Work Distribution (3 agents):
  Agent 1: creator/, lms/       → 21 components (~12,600 lines)
  Agent 2: ops/, books/, auth/  → 39 components (~20,400 lines)
  Agent 3: shared/, design-system/, minds/, prd/, marketing/, sales/
                                → 69 components (~35,300 lines)

📝 Generated:
  ✓ docs/refactoring/COMPONENT_REFACTORING_ROADMAP.md
  ✓ docs/refactoring/PARALLEL_REFACTORING_PLAN.md
  ✓ docs/refactoring/prompts/agent-1-prompt.md
  ✓ docs/refactoring/prompts/agent-2-prompt.md
  ✓ docs/refactoring/prompts/agent-3-prompt.md

🚀 Ready! Copy prompts and start agents in parallel.

Uma says: "Structure before style. Architecture before aesthetics."
```

### Example 2: Specific Directory

```bash
/atomic-refactor-plan app/components/creator/ --agents=2 --threshold=400
```

Analyzes only `creator/` with custom settings.

## Tier Classification Reference

| Tier | Lines | Priority | Typical Effort |
|------|-------|----------|----------------|
| 1 | >800 | Critical | 2-4 hours |
| 2 | 500-800 | Medium | 1-2 hours |
| 3 | 300-500 | Lower | 30-60 min |

## Agent Prompt Template

Each generated prompt includes:

1. **Domain Assignment**: Which directories this agent owns
2. **Reference Component**: Where to look for the pattern
3. **TIER 1 Priority**: Which component to start with
4. **TIER 2 List**: Remaining components in priority order
5. **Target Structure**: Folder/file structure for decomposition
6. **Rules**: What NOT to modify (other domains, shared/)
7. **Checklist**: Per-component steps to follow
8. **Communication**: How to request shared components

## Notes

- Run this task before starting any large refactoring effort
- Agent 3 (shared owner) should complete shared components before others start
- All agents should `git pull` frequently to avoid conflicts
- Update status in ROADMAP.md as components are completed
- Use SHARED_REQUESTS.md to coordinate cross-agent dependencies


## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
