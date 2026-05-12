# Update Source Tree Task

## Purpose

Validate document governance for all data files referenced by agents. Ensures every file in `agent-config-requirements.yaml` exists on disk, is documented in `source-tree.md`, and has a documented owner and fill rule.

---

## Task Definition

```yaml
task: updateSourceTree()
responsavel: Orion (Master)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: mode
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: audit|fix

**Saida:**
- campo: governance_report
  tipo: object
  destino: Console
  persistido: false
```

---

## Execution Steps

### Step 1: Load agent-config-requirements.yaml

Read `.aiox-core/data/agent-config-requirements.yaml` and extract all `files_loaded[].path` entries across all agents.

### Step 2: Verify file existence

For each referenced file path:
1. Check if the file exists on disk relative to project root
2. Record results as OK or MISSING

### Step 3: Load source-tree.md

Read `docs/framework/source-tree.md` and extract all files listed in the "Data File Governance" section tables.

### Step 4: Cross-reference

Compare files from step 1 with files from step 3:
- Files in config but NOT in source-tree = **Undocumented** (governance gap)
- Files in source-tree but NOT in config = **Unused** (may be stale)

### Step 5: Check ownership

For each file in the governance tables:
- Verify it has a documented **Owner** (agent @name)
- Verify it has a documented **Fill Rule** (when/how it gets updated)
- Verify it has a documented **Update Trigger** (what triggers the update)

### Step 6: Report

Present findings:

```
Source Tree Governance Report
=============================

Files referenced in agent-config-requirements.yaml: {count}
Files documented in source-tree.md: {count}

File Existence:
  OK: {count}
  MISSING: {count} [LIST]

Governance Coverage:
  Documented: {count}
  Undocumented: {count} [LIST]

Ownership:
  With owner: {count}
  Without owner: {count} [LIST]

Fill Rules:
  With fill rule: {count}
  Without fill rule: {count} [LIST]
```

### Step 7: Fix (if mode=fix)

If `mode=fix`:
1. Add missing files to source-tree.md governance tables
2. Use the file's directory to infer likely owner
3. Flag entries needing human review for fill rule

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] All files in agent-config-requirements.yaml verified to exist on disk
    tipo: acceptance-criterion
    blocker: true
  - [ ] All files in agent-config-requirements.yaml documented in source-tree.md
    tipo: acceptance-criterion
    blocker: true
  - [ ] All documented files have owner and fill rule
    tipo: acceptance-criterion
    blocker: true
```

---

## Error Handling

**Strategy:** report-and-continue

1. **Missing file**: Report as MISSING but continue validation
2. **Parse error in YAML**: Abort with clear error message
3. **Parse error in source-tree.md**: Warn and attempt best-effort parsing

---

## Metadata

```yaml
story: ACT-8
version: 1.0.0
dependencies: []
tags:
  - governance
  - documentation
  - validation
updated_at: 2026-02-06
```
