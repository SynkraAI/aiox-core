# Setup DS Governance Model

> Task ID: brad-ds-governance
> Agent: Brad (Design System Architect)
> Version: 1.0.0
> **Execution Type:** `Hybrid`
> **Human Checkpoint:** Review and approve the governance model, contribution flow, and decision-making process before implementation
> **Dependencies:** depends_on: `[]` · enables: `[ds-designops]` · workflow: `governance`

## Description

Setup a governance model for your design system based on Nathan Curtis's team model frameworks. Defines contribution flow, decision-making process, versioning strategy, and communication channels.

## Output Schema
- **produces:** `outputs/design-system/{project}/governance/governance-model.md`
- **format:** Markdown report
- **consumed_by:** ds-designops

## Prerequisites

- Existing or planned design system
- Understanding of team structure
- Read data/ds-reference-architectures.md for governance patterns

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - Team size (DS team + consuming teams)
   - Current DS maturity (new, growing, established)
   - Decision-making style (centralized authority vs. consensus)
   - Number of consuming products/teams

2. **Model Recommendation**
   Based on inputs, recommend one of:
   - **Centralized:** Dedicated DS team builds and maintains everything. Best for: small org, new DS, need consistency.
   - **Federated:** Product teams contribute components. Best for: large org, mature DS, diverse needs.
   - **Hybrid:** Central team + product contributions with review. Best for: mid-size org, growing DS.

### Steps

1. **Define Governance Model**
   - Select model based on elicitation
   - Define DS team responsibilities
   - Define consuming team responsibilities
   - Define escalation path for disagreements
   - Check: selected model's team_size range includes user's team_size AND maturity level matches

2. **Create Contribution Flow**
   - Propose: How teams request new components or changes
   - Review: Who reviews contributions and with what criteria
   - Approve: Decision authority and timeline expectations
   - Release: How approved changes get into the DS
   - Document the flow with clear steps and owners
   - Check: contribution flow has exactly 4+ named stages with owner and SLA per stage

3. **Define Decision Log Template**
   - What was decided
   - Why (rationale with alternatives considered)
   - Who decided
   - When it can be revisited
   - Impact on existing consumers
   - Check: decision log template has >= 5 fields: what, why, who, when, impact

4. **Setup Communication Channels**
   - Announcements: Major releases, breaking changes
   - Support: Questions, bug reports, feature requests
   - Contribution: PRs, reviews, discussions
   - Recommendations per platform (Slack channels, GitHub discussions, etc.)
   - Check: each channel has: platform, purpose (1 sentence), audience (team list), and notification rules

5. **Define Versioning Strategy**
   - Semantic versioning rules (major/minor/patch)
   - Breaking change policy (deprecation period, migration guides)
   - Release cadence (fixed schedule vs. continuous)
   - Changelog requirements
   - Check: versioning strategy defines: semver rules, breaking change deprecation period (in sprints), and changelog format

6. **Generate Governance Documentation**
   - governance-model.md — Model description and rationale
   - contribution-guide.md — How to contribute to the DS
   - decision-log-template.md — Template for recording decisions
   - Update .state.yaml

## Examples

### Example 1: Centralized Model (Startup, 30 people)

**Input:** `*ds-govern` with team_size=30, maturity=new, style=centralized, products=2

**Output (governance-model.md excerpt):**
```
# Design System Governance — Acme Corp

## Model: Centralized

### DS Team (3 people)
- 1 DS Lead (owns roadmap, reviews all contributions)
- 1 DS Engineer (builds components, maintains tokens)
- 1 DS Designer (Figma library, documentation)

### Decision Authority
| Decision Type | Who Decides | SLA |
|--------------|-------------|-----|
| New component | DS Lead | 5 business days |
| Token change | DS Engineer + DS Designer | 3 business days |
| Breaking change | DS Lead + Engineering Manager | 10 business days |
| Bug fix | Any DS team member | 1 business day |

### Contribution Flow
1. Consumer team opens GitHub Issue with component request
2. DS Designer reviews design feasibility (2 days)
3. DS Lead approves/rejects with rationale (3 days)
4. If approved: DS Engineer implements, DS Designer reviews
5. Release in next scheduled version (bi-weekly)
```

### Example 2: Federated Model (Enterprise, 200+ people)

**Input:** `*ds-govern` with team_size=200, maturity=established, style=federated, products=8

**Output (contribution-guide.md excerpt):**
```
# Contributing to the Design System

## Who Can Contribute
Any product team can propose components. The DS Core Team reviews all PRs.

## Contribution Checklist
- [ ] Component follows Atomic Design naming (atoms/molecules/organisms)
- [ ] All styling uses design tokens (zero hardcoded values)
- [ ] Unit tests with >80% coverage
- [ ] Storybook stories for all variants
- [ ] WCAG AA accessibility verified
- [ ] TypeScript strict mode, no `any` types
- [ ] Documentation in component README

## Review Process
1. **Draft PR** — contributor opens PR with component + tests + stories
2. **Automated checks** — CI runs lint, typecheck, tests, visual regression
3. **DS Core review** — 2 reviewers from Core Team (SLA: 5 business days)
4. **Design review** — DS Designer verifies Figma alignment (SLA: 3 business days)
5. **Merge** — Squash merge to main, auto-publish to npm
6. **Announce** — Changelog entry + Slack #design-system notification
```

## Anti-Patterns

- **"Governance by committee"** — Having >5 approvers for every change. Creates bottlenecks and frustration. Fix: Define clear ownership per component area
- **"Phantom governance"** — Writing governance docs that nobody follows. Fix: Automate enforcement via CI checks and PR templates
- **"One-size-fits-all"** — Applying enterprise governance to a 10-person startup (or vice versa). Fix: Match governance complexity to org size
- **"No deprecation policy"** — Removing components without warning. Fix: Minimum 2-sprint deprecation window with migration guide
- **"Silent changes"** — Pushing breaking changes without announcement. Fix: Mandatory changelog entry + Slack notification for every release

## Output

- `governance-model.md` — Governance model documentation
- `contribution-guide.md` — Contribution workflow guide
- `decision-log-template.md` — Decision log template
- `.state.yaml` updated

## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`
- `squads/design/checklists/ds-migration-readiness-checklist.md`

## Failure Handling

- **Team size or maturity level doesn't match any standard model:** Create custom hybrid model combining elements from centralized and federated, document rationale for deviation from reference architectures
- **No consensus on decision authority mapping:** Document competing viewpoints in decision log, escalate to stakeholder vote, implement temporary interim model with 30-day review checkpoint
- **Communication channels unavailable (no Slack/GitHub):** Substitute with available platforms (email lists, Teams, Jira), maintain same channel purposes with adapted notification rules
- **Contribution flow SLAs rejected as unrealistic:** Negotiate revised timelines with stakeholders, document capacity constraints, phase implementation with lighter-weight initial version

## Success Criteria

- [ ] Governance model document generated (governance-model.md) with decision authority table
- [ ] Contribution flow defined with specific SLAs per decision type (in business days)
- [ ] Decision log template has minimum 5 fields (what, why, who, when, impact)
- [ ] Communication channels defined with platform and audience for each
- [ ] Versioning strategy includes breaking change policy with deprecation period
- [ ] All generated documentation is actionable (contains tables, checklists, or templates — not just prose)


## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
