# AIOX Framework Evolution Pipeline

**Status:** Draft v1.0
**Date:** 2026-05-07
**Author:** @aiox-master (Orion)
**Approval gate:** Eliel M. Alencar (sole orchestrator approver)
**Triggered by:** Sessão de correção Wave 1.A revelou que descobertas de auditoria em projetos consumidores não retornavam ao framework como evolução formal

---

## Purpose

Define how the AIOX framework (`aiox-core`) evolves from real-world findings discovered in consumer projects (e.g., `business-ai-first`). The framework is not static — it grows via **audited evidence** from production usage. This document specifies the formal pipeline:

```text
Project audit → Finding → Proposal → Eliel approval → aiox-core PR → Distribution
```

Without this pipeline:
- Findings die in project RUN-LOGs
- The same lessons get re-learned in every new epic
- Framework conventions drift as each project re-invents
- Tokens are spent re-discovering what was already discovered

With this pipeline:
- Every audit finding is a candidate framework evolution
- Eliel as orchestrator decides what is generic enough to promote
- Approved findings ship as framework PRs (rules, agents, hooks, tasks, templates)
- Consumer projects pull the evolved framework on next sync

---

## Roles

### Auditor (any agent or Eliel)
- Identifies a finding during project work that may have framework-wide implications
- Writes the finding using the AuditFinding template (below)
- Submits to the Proposal Gate

### Proposer (typically @aiox-master or domain specialist)
- Receives an AuditFinding
- Decides: scope-bound (project-only) vs framework-candidate
- If framework-candidate: drafts a FrameworkProposal using template (below)
- Includes: pattern generalization, target framework artifact, migration path, deprecation plan

### Approver (Eliel — sole authority)
- Reviews FrameworkProposal
- Decides: APPROVED / REJECTED / NEEDS_REVISION
- If APPROVED: signs the proposal with `eliel_approval` field + timestamp
- Approval triggers PR creation against `aiox-core`

### Implementer (@aiox-master + relevant specialist)
- Opens PR in `aiox-core` with the changes specified in approved proposal
- Updates: agent definitions, rules, hooks, tasks, templates, governance docs
- Cross-references the source AuditFinding and FrameworkProposal in PR description

### Distributor (the consumer projects, on demand)
- Consumer project pulls latest `aiox-core` (via npm install / git submodule / vendored copy)
- Existing project conventions evolve to match new framework

---

## Triggers

A finding becomes a candidate for framework evolution when **at least one** of these is true:

| Trigger | Example (from Wave 1.A audit) |
|---|---|
| Same problem appears in 2+ projects | (none yet for Wave 1.A — N=1 currently) |
| Same problem could affect any future project of similar type | YOLO terminal inventing vocabulary without dictionary lookup → **could happen in any DB-touching project** |
| Existing framework rule was violated and the violation was undetectable | Rule `prompt-language.md` (English-only for LLM prompts) was violated in `create_nova_coleta`; no enforcement existed |
| Existing framework artifact is missing or insufficient | `@aiox-master` lacks `triage.routing_matrix` for squad consultation |
| Audit reveals architectural convention drift | 5 vocabularies coexist in same domain — needs canonical store pattern |
| Workflow gate is missing or asymmetric | Gate G0 marked passed based on static CI; no runtime validation |

**Auditor flag:** when writing a finding, the auditor MUST mark `framework_candidate: true|false` with rationale.

---

## Templates

### AuditFinding (YAML)

Lives in: `<project>/docs/audits/<finding-id>.yaml` initially. If approved as framework-candidate, copy to `aiox-core/audits/promoted/<finding-id>.yaml`.

```yaml
audit_finding:
  version: "1.0"
  id: "AF-<YYYYMMDD>-<slug>"          # e.g., AF-20260507-vocabulary-contract-failure
  date: "<ISO-8601>"
  auditor: "<agent-id or eliel>"
  source_session: "<short summary of session that discovered>"

  context:
    project: "<project name>"
    epic: "<epic id>"
    triggered_by: "<event that exposed the finding>"

  finding:
    summary: "<one-sentence finding>"
    evidence:
      - "<concrete evidence 1>"
      - "<concrete evidence 2>"
    impact_observed:
      blast_radius: "low|medium|high|critical"
      affected_artifacts: ["<list>"]
      cost: "<tokens, time, prod incidents, etc>"

  framework_candidate: true|false
  framework_candidate_rationale: |
    <why this is or isn't a framework concern>

  references:
    - kind: ADR
      path: "<path>"
    - kind: code
      path: "<path>"

  proposed_disposition:
    - "<short disposition 1, e.g., 'add hook', 'extend agent triage', 'create rule'>"
```

### FrameworkProposal (YAML)

Lives in: `aiox-core/governance/proposals/PROP-<YYYYMMDD>-<slug>.yaml`.

```yaml
framework_proposal:
  version: "1.0"
  id: "PROP-<YYYYMMDD>-<slug>"
  date: "<ISO-8601>"
  proposer: "<agent-id>"
  source_finding: "AF-<YYYYMMDD>-<slug>"

  target:
    layer: "L1|L2|L3"                 # framework boundary layers (see boundary docs)
    artifact_type: "agent|rule|hook|task|template|governance|workflow"
    artifact_path: "<intended path in aiox-core>"
    operation: "create|modify|deprecate"

  generalization:
    pattern_name: "<name of the pattern, e.g., 'Vocabulary Contract Store'>"
    when_to_apply: |
      <conditions under which any project should apply this>
    examples_from_other_domains: ["<list>"]

  migration_path:
    breaking_change: true|false
    affected_consumers: ["<list of projects/agents that need updating>"]
    rollout_plan: |
      <steps to apply without breaking existing consumers>

  deprecation_plan:
    deprecates: ["<list of artifacts being replaced>"]
    sunset_window: "<duration, e.g., '2 weeks after merge'>"

  cost_benefit:
    cost: "<engineering effort, token cost, complexity added>"
    benefit: "<problems prevented, tokens saved, audit improved>"
    risk: "<low|medium|high — what could go wrong>"

  approval:
    eliel_decision: "PENDING|APPROVED|REJECTED|NEEDS_REVISION"
    eliel_decision_at: "<ISO-8601 or null>"
    eliel_decision_rationale: |
      <reasoning, especially if reject or needs-revision>
    revision_request: ["<list>"]      # filled if NEEDS_REVISION

  implementation:
    pr_url: "<filled when PR opens>"
    merged_at: "<ISO-8601 when shipped>"
    distributed_to: ["<projects that pulled the change>"]
```

---

## Decision flow

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Project session discovers issue                          │
│    (auditor agent or Eliel)                                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Auditor writes AuditFinding YAML                          │
│    Lives in <project>/docs/audits/                          │
│    Marks framework_candidate: true|false                    │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
        false (scope-bound)          true (framework candidate)
              │                             │
              ▼                             ▼
       Project handles it          ┌─────────────────────┐
       internally; finding         │ 3. @aiox-master or   │
       archived in project.        │    domain specialist │
                                   │    drafts            │
                                   │    FrameworkProposal │
                                   └──────────┬──────────┘
                                              │
                                              ▼
                                   ┌─────────────────────┐
                                   │ 4. Eliel reviews     │
                                   │    APPROVED / REJECTED │
                                   │    / NEEDS_REVISION  │
                                   └──────────┬──────────┘
                                              │
                       ┌──────────────────────┼──────────────────────┐
                       │                      │                      │
                     APPROVED             NEEDS_REVISION           REJECTED
                       │                      │                      │
                       ▼                      ▼                      ▼
              ┌──────────────────┐    Loop back to        Document why,
              │ 5. PR opens in    │    proposer          archive proposal,
              │    aiox-core with │    with revision     close finding.
              │    changes        │    notes
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ 6. CI + review +  │
              │    merge          │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ 7. Consumer       │
              │    projects pull  │
              │    on next sync   │
              └──────────────────┘
```

---

## Worked example (retrofit of Wave 1.A)

This is what the pipeline would look like for the Wave 1.A vocabulary contract failure.

### AuditFinding `AF-20260507-vocabulary-contract-failure.yaml`

```yaml
audit_finding:
  version: "1.0"
  id: "AF-20260507-vocabulary-contract-failure"
  date: "2026-05-07T17:00:00Z"
  auditor: "@aiox-master (Orion)"
  source_session: "Wave 1.A correction session in business-ai-first; voice-clone consultation with Akita/Montano/Kira"

  context:
    project: "business-ai-first"
    epic: "EPIC-MVP-CDM-CADASTRO"
    triggered_by: "DBOPS-V1 prod apply failed SQLSTATE 23514 against 17,354 legacy rows"

  finding:
    summary: "YOLO terminal can write a migration with invented vocabulary because no pre-flight forces dictionary lookup."
    evidence:
      - "DBOPS-V1 used humanized PT-BR ('CNH - Primeira Habilitação') invented in YOLO session"
      - "5 vocabularies coexist in tox_exams domain (legacy slug, tx_* prefix, humanized, English drift, target English)"
      - "db-inventory/dictionary/ existed but was never consulted"
      - "Static CI passed; runtime pgTAP never ran"
    impact_observed:
      blast_radius: "high"
      affected_artifacts: ["DBOPS-V1 migration", "Wave 1.A gate G0", "EPIC-MVP-CDM-CADASTRO timeline"]
      cost: "1 reverted migration, ~80 minutes audit + correction session, 1 ADR + 4 deliverables to address root cause"

  framework_candidate: true
  framework_candidate_rationale: |
    Any DB-touching project under AIOX faces this risk. The fix is not project-specific:
    1. Pre-flight hook on Edit/Write of supabase/migrations/*.sql
    2. Vocabulary contract pattern as framework convention
    3. aiox-master triage matrix to consult db-inventory before delegating

  references:
    - kind: ADR
      path: "business-ai-first/docs/decisions/ADR-DBOPS-V1-vocabulary-contract-failure.md"
    - kind: hook
      path: "business-ai-first/.claude/hooks/migration-dictionary-guard.cjs"
    - kind: voice-clone-opinions
      path: "business-ai-first/squads/voice-clones/agents/{fabio-akita,lucas-montano}.md"

  proposed_disposition:
    - "Promote migration-dictionary-guard.cjs to aiox-core/hooks/ as framework hook"
    - "Add Article VII (Vocabulary Contract) to .aiox-core/constitution.md"
    - "Extend @aiox-master with triage.routing_matrix consulting db-inventory before migration tasks"
    - "Document Vocabulary Contract pattern in aiox-core/governance/patterns/"
```

### FrameworkProposal `PROP-20260507-vocabulary-contract.yaml`

```yaml
framework_proposal:
  version: "1.0"
  id: "PROP-20260507-vocabulary-contract"
  date: "2026-05-07T18:30:00Z"
  proposer: "@aiox-master (Orion)"
  source_finding: "AF-20260507-vocabulary-contract-failure"

  target:
    layer: "L1+L2"
    artifact_type: "rule|hook|agent|governance"
    artifact_path: |
      Multiple:
      - aiox-core/.claude/rules/vocabulary-contract.md (NEW)
      - aiox-core/hooks/migration-dictionary-guard.cjs (NEW, copied + generalized)
      - aiox-core/.aiox-core/development/agents/aiox-master.md (MODIFY: add triage.routing_matrix)
      - aiox-core/governance/patterns/vocabulary-store.md (NEW pattern doc)
    operation: "create|modify"

  generalization:
    pattern_name: "Vocabulary Contract Store"
    when_to_apply: |
      Whenever a project has a domain enum or text[] column that:
      1. Has multiple writers (UI form + RPC + scraper + manual SQL)
      2. Has multiple consumer surfaces (DB CHECK + Zod + UI labels + LLM context)
      3. Has historical drift (legacy values that don't match current convention)
    examples_from_other_domains:
      - "Marketing: campaign_status (lead, qualified, converted, churned) needs same treatment"
      - "Finance: payment_method, billing_responsible enums similar"
      - "HR: employee_status, exit_reason if HR squad gets activated"

  migration_path:
    breaking_change: false
    affected_consumers: ["business-ai-first"]
    rollout_plan: |
      1. PR adds files to aiox-core (no existing files broken)
      2. business-ai-first pulls aiox-core update on next sync
      3. business-ai-first migration-dictionary-guard.cjs (project-local) is replaced by aiox-core version (vendor or symlink)
      4. Documentation cross-references updated

  deprecation_plan:
    deprecates: ["business-ai-first/.claude/hooks/migration-dictionary-guard.cjs (project-local copy)"]
    sunset_window: "Immediate after framework version pulled"

  cost_benefit:
    cost: "~3-4 hours engineering to generalize hook + write pattern doc + extend aiox-master"
    benefit: "Prevents the same failure mode in any future AIOX project. Akita-quality fundamental."
    risk: "low — additive changes; no existing behavior modified"

  approval:
    eliel_decision: "PENDING"
    eliel_decision_at: null
    eliel_decision_rationale: ""
    revision_request: []

  implementation:
    pr_url: ""
    merged_at: ""
    distributed_to: []
```

This is the artifact Eliel reviews. On `APPROVED`, the PR opens in `aiox-core`.

---

## Operational rules

1. **No framework change without an approved proposal.** Even if @aiox-master spots an opportunity, it MUST go through the pipeline. Eliel is the gate.
2. **Project-bound findings stay project-bound.** Not every audit promotes. The `framework_candidate: false` path is normal and healthy.
3. **Voice-clone opinions are evidence, not authority.** Akita/Montano/Kira are inputs to the proposal but cannot bypass Eliel.
4. **Approval is per-proposal, not per-class.** Approving one vocabulary-contract proposal does not auto-approve future similar ones.
5. **Reverts use the pipeline.** If a framework change shipped and proves harmful, a new proposal `PROP-<date>-revert-<id>` opens. Same gate.
6. **All proposals (approved + rejected + revised) archived forever.** They are the institutional memory of the framework's evolution.

---

## Storage layout in aiox-core

```text
aiox-core/
├── audits/
│   ├── README.md                              # explains this folder
│   ├── promoted/                              # findings that became proposals
│   │   └── AF-20260507-vocabulary-contract-failure.yaml
│   └── archived/                              # findings that stayed scope-bound (project-only)
│       └── (none yet)
├── governance/
│   ├── evolution-pipeline.md                  # this document
│   ├── handoff-types.md                       # contract handoff vs micro-handoff (TBD)
│   ├── squad-activation-strategy.md           # Entrega 4 (TBD)
│   ├── proposals/
│   │   ├── README.md                          # explains this folder
│   │   ├── PROP-20260507-vocabulary-contract.yaml
│   │   └── archive/                           # rejected or superseded proposals
│   ├── patterns/
│   │   ├── README.md                          # catalog of approved patterns
│   │   └── vocabulary-store.md                # (created on first APPROVED proposal)
│   └── templates/
│       ├── audit-finding-tmpl.yaml            # YAML template (extracted from this doc)
│       └── framework-proposal-tmpl.yaml
```

---

## Out of scope (this version)

- Automated detection of framework-candidate findings (would need ML/heuristic; future work)
- Multi-orchestrator approval (currently Eliel is sole approver; future may add @architect or @qa as co-approvers for non-strategic changes)
- Cross-organization adoption (this is internal to Eliel's projects for now)
- Versioning aiox-core releases (already handled by `CHANGELOG.md` and `package.json` version)

---

— Orion (`@aiox-master`), formalizando o pipeline R&D contínuo do framework AIOX por solicitação de Eliel
