# Task: Refresh Squad Registry

**Task ID:** refresh-registry
**Version:** 2.0.0
**Purpose:** Scan all squads in the ecosystem and update squad-registry.yaml
**Orchestrator:** @squad-architect
**Mode:** Hybrid (Script + LLM)

**Architecture:**
```
DETERMINISTIC (Python Script)          LLM (Semantic Understanding)
├── Count agents, tasks, etc.          ├── Infer domain category
├── Read config.yaml metadata          ├── Extract keywords from README
├── List directory contents            ├── Generate highlights
├── Validate YAML syntax               ├── Generate example_use
└── Output structured JSON             └── Analyze gaps
```

**Script:** `scripts/refresh-registry.py`

---

## Overview

This task uses a hybrid approach:
1. **Python script** handles all deterministic operations (counts, file reads)
2. **LLM** handles semantic understanding (keywords, domain inference)

```
TRIGGER (hook or command)
    ↓
[STEP 1: RUN SCRIPT] (Deterministic)
    → python3 scripts/refresh-registry.py --output json
    → Gets: counts, config metadata, agent names
    → Output: structured JSON with factual data
    ↓
[STEP 2: LLM ENRICHMENT] (Semantic)
    → For each squad:
      - Infer domain from description
      - Extract keywords from README
      - Generate highlights
      - Generate example_use
    ↓
[STEP 3: MERGE]
    → Combine script output + LLM enrichment
    → Preserve manual annotations (quality_reference)
    → Update domain_index
    ↓
[STEP 4: WRITE]
    → Write updated squad-registry.yaml
    → Validate YAML syntax
    ↓
OUTPUT: Updated squad-registry.yaml
```

---

## Triggers (Hooks)

### 1. Manual Command
```bash
*refresh-registry
```

### 2. On Squad-Creator Activation (Optional)
```yaml
# In squad-architect.md activation-instructions
auto_refresh:
  enabled: false  # Set to true for auto-refresh
  condition: "registry older than 24 hours"
```

### 3. After Creating New Squad
```yaml
# Automatic trigger after *create-squad completes
post_create_hook:
  action: "refresh-registry"
  when: "squad creation successful"
```

### 4. Pre-Commit Hook (Recommended)
```bash
# .claude/hooks/refresh-registry.sh
# Trigger: Changes to squads/*/config.yaml

#!/bin/bash
if git diff --cached --name-only | grep -q "squads/.*/config.yaml"; then
  echo "Squad config changed, refreshing registry..."
  # Claude Code will handle this via hook
fi
```

---

## Inputs

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `squads_path` | string | No | `squads/` | Base path to scan |
| `preserve_manual` | boolean | No | `true` | Keep manual highlights, quality_reference |
| `update_gaps` | boolean | No | `false` | Re-analyze gaps (slower) |

---

## Execution Steps

### Step 1: Run Python Script (DETERMINISTIC)

```bash
# Run the refresh script
python3 squads/squad-creator/scripts/refresh-registry.py --output json --registry-format
```

**Script Output:**
```json
{
  "metadata": {
    "scan_date": "2026-02-01T13:04:19",
    "total_squads": 22
  },
  "squads": {
    "copy": {
      "path": "squads/{your-squad}/",
      "version": "1.0.0",
      "description": "Copywriting squad...",
      "counts": {
        "agents": 22,
        "tasks": 58,
        "workflows": 3,
        "templates": 10,
        "checklists": 5,
        "data_files": 2
      },
      "agent_names": ["gary-halbert", "eugene-schwartz", ...],
      "domain": "_TO_BE_INFERRED_",  // LLM will fill
      "keywords": [],                 // LLM will fill
      "highlights": [],               // LLM will fill
      "example_use": ""               // LLM will fill
    }
  },
  "summary": {
    "total_agents": 124,
    "total_tasks": 291,
    "total_workflows": 49
  }
}
```

**What Script Does (Deterministic):**
- Scans `squads/` directory
- Reads each `config.yaml`
- Counts files in each subdirectory
- Lists agent names
- Checks for README.md, CHANGELOG.md
- Validates YAML syntax

**What Script Does NOT Do:**
- Infer domain category
- Extract keywords
- Generate highlights
- Generate example_use

### Step 2: LLM Enrichment (SEMANTIC)

For each squad in script output, LLM analyzes:

```yaml
llm_enrichment:
  for_each_squad:
    # Read README.md for context
    read: "squads/{name}/README.md"

    infer_domain:
      from: "description + README overview"
      categories:
        - content_marketing
        - technical
        - business_ops
        - people_psychology
        - meta_frameworks
      output: "Single category that best fits"

    extract_keywords:
      from: "README.md + agent_names + description"
      method: |
        1. Extract nouns and key phrases
        2. Include agent names as keywords
        3. Add domain-specific terms
        4. Deduplicate and lowercase
      output: "List of 5-15 keywords"

    generate_highlights:
      from: "README.md + counts + agent_names"
      method: |
        1. What makes this squad unique?
        2. Key features or capabilities
        3. Notable agents or frameworks
      output: "List of 2-4 bullet points"

    generate_example_use:
      from: "purpose + keywords"
      method: "Create realistic usage example"
      output: "Single sentence starting with verb"
```

### Step 3: Build Registry Entry

```yaml
build_entry:
  template: |
    {squad_name}:
      path: "squads/{squad_name}/"
      domain: "{inferred_domain}"
      purpose: "{description_from_config}"
      keywords: {extracted_keywords}
      agents: {agent_count}
      tasks: {task_count}
      workflows: {workflow_count}
      highlights:
        - "{auto_generated_highlight_1}"
        - "{auto_generated_highlight_2}"
      example_use: "{generated_example}"

  preserve_if_exists:
    - highlights  # Keep manual annotations
    - quality_reference
    - example_use  # Keep if manually set
```

### Step 4: Update Domain Index

```yaml
update_domain_index:
  for_each_squad:
    - Add squad.domain → squad_name mapping
    - Add each keyword → squad_name mapping

  handle_conflicts:
    # If keyword maps to multiple squads
    action: "keep both, note in comments"
    example: |
      analytics: ["data", "monitor"]  # Multiple squads cover this
```

### Step 5: Update Gaps Analysis

```yaml
update_gaps:
  # Only if update_gaps=true (slower operation)
  known_domains:
    - finance
    - health
    - sales
    - customer_success
    - product_management
    - research
    - real_estate

  for_each_gap:
    check: "Is there now a squad covering this?"
    if_covered: "Remove from gaps"
    if_not_covered: "Keep in gaps"
```

### Step 6: Write Updated Registry

```yaml
write_registry:
  file: "squads/squad-creator/data/squad-registry.yaml"

  structure:
    metadata:
      version: "1.0.0"
      last_updated: "{current_date}"
      total_squads: "{count}"
      maintainer: "squad-creator"

    squads: "{all_squad_entries}"
    domain_index: "{all_mappings}"
    gaps: "{remaining_gaps}"
    quality_references: "{preserved_from_original}"
    conventions: "{preserved_from_original}"

  validate:
    - "YAML syntax valid"
    - "No duplicate squad names"
    - "All paths exist"
```

---

## Output

```yaml
output:
  file: "squads/squad-creator/data/squad-registry.yaml"
  console: |
    Registry updated successfully!

    Squads: {total} ({new} new, {updated} updated)
    Domains covered: {domain_count}
    Gaps remaining: {gap_count}

    New squads detected:
    - {new_squad_1}
    - {new_squad_2}

    Updated squads:
    - {updated_squad_1}: +2 agents, +1 task
```

---

## Hook Configuration

### Add to .claude/hooks/

Create `.claude/hooks/post-squad-create.py`:

```python
#!/usr/bin/env python3
"""
Hook: Refresh registry after squad creation
Trigger: After successful *create-squad execution
"""

import os
import sys

def should_run(event):
    """Check if this hook should run"""
    # Run after create-squad task completes
    return (
        event.get('task') == 'create-squad' and
        event.get('status') == 'success'
    )

def main():
    # Signal to Claude Code to run refresh-registry
    print("HOOK: Squad created, triggering registry refresh")
    print("ACTION: run-task refresh-registry")
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

### Add to squad-architect.md

```yaml
post_command_hooks:
  "*create-squad":
    on_success:
      - task: "refresh-registry"
        silent: true  # Don't show output unless error
```

---

## Usage Examples

### Manual Refresh
```bash
@squad-architect
*refresh-registry
```

### Refresh with Gap Analysis
```bash
*refresh-registry --update-gaps
```

### Check Registry Status
```bash
*show-registry
# Shows current registry contents

*registry-status
# Shows: last updated, total squads, any issues
```

---

## Validation

After refresh, verify:

```yaml
validation:
  - All squads in squads/ are in registry
  - All registry entries have valid paths
  - domain_index has no orphan entries
  - YAML is valid and parseable
  - No duplicate keywords pointing to wrong squads
```

---

_Task Version: 1.0.0_
_Created: 2026-02-01_
_Trigger: Manual, post-create-squad, or pre-commit hook_
