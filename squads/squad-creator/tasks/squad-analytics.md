# Task: Squad Analytics

**Task ID:** squad-analytics
**Version:** 1.0.0
**Purpose:** Generate detailed analytics report for all squads in the AIOS ecosystem
**Orchestrator:** @squad-architect
**Mode:** Deterministic (Script-based)

---

## Overview

Generates a comprehensive analytics report showing:
- Total counts per squad (agents, tasks, workflows, templates, checklists, data, scripts)
- Quality indicators
- Top squads by category
- Ecosystem summary

```
TRIGGER (*squad-analytics)
    ↓
[STEP 1: RUN SCRIPT]
    → python3 scripts/squad-analytics.py [options]
    → Output: Formatted analytics report
    ↓
[STEP 2: DISPLAY]
    → Show formatted output to user
    ↓
OUTPUT: Analytics dashboard
```

---

## Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--format table` | ASCII table format (human-readable) | ✓ |
| `--format json` | JSON format (machine-readable) | |
| `--format yaml` | YAML format | |
| `--detailed` / `-d` | Show component names, not just counts | |
| `--sort-by name` | Sort alphabetically | |
| `--sort-by agents` | Sort by agent count | |
| `--sort-by tasks` | Sort by task count | |
| `--sort-by total` | Sort by total components | ✓ |

---

## Execution

### Standard (Table View)

```bash
python3 squads/squad-creator/scripts/squad-analytics.py
```

**Output:**
```
====================================================================================================
📊 AIOS SQUAD ANALYTICS
Generated: 2026-02-01
====================================================================================================

📈 ECOSYSTEM SUMMARY
   Squads: 19 | Agents: 68 | Tasks: 142 | Workflows: 23
   Templates: 45 | Checklists: 38 | Data: 52 | Scripts: 15
   Total Components: 383

----------------------------------------------------------------------------------------------------
Squad                Agents   Tasks    WFs  Tmpls  Checks    Data  Scripts  Total Quality
----------------------------------------------------------------------------------------------------
squad-creator             2      12      3     10       8       5        8     48 ⭐⭐⭐
squad-creator                  5      18      2      6       4       8        2     45 ⭐⭐
...
----------------------------------------------------------------------------------------------------

🏆 TOP SQUADS BY CATEGORY

   Most Agents: squad-creator (5), squad-creator (2)
   Most Tasks: squad-creator (18), squad-creator (12)
   Most Workflows: squad-creator (3), squad-creator (2)
   Most Checklists: squad-creator (8), squad-creator (4)

====================================================================================================
```

### Detailed View

```bash
python3 squads/squad-creator/scripts/squad-analytics.py --detailed
```

Shows component names under each squad:
```
copy                     15      58      3     12       8       3        0     99 ⭐⭐⭐
   └─ agents: gary-halbert, eugene-schwartz, dan-kennedy, claude-hopkins, joe-sugarman (+10 more)
   └─ tasks: create-sales-page, create-email-sequence, avatar-research (+55 more)
   └─ checklists: copy-quality-checklist, rmbc-checklist (+6 more)
```

### JSON/YAML Export

```bash
# For programmatic use
python3 squads/squad-creator/scripts/squad-analytics.py --format json > squad-analytics.json
python3 squads/squad-creator/scripts/squad-analytics.py --format yaml > squad-analytics.yaml
```

---

## Quality Indicators

| Indicator | Meaning |
|-----------|---------|
| ⭐⭐⭐ | Complete squad (agents + tasks + workflows + templates + checklists + docs) |
| ⭐⭐ | Good squad (agents + tasks + some workflows/templates) |
| ⭐ | Basic squad (agents + tasks) |
| 🔨 | Work in progress (minimal components) |

**Scoring:**
- +2 for having agents
- +2 for having tasks
- +1 for workflows
- +1 for templates
- +1 for checklists
- +1 for data files
- +1 for README.md
- +1 for config.yaml

---

## Usage in Squad Architect

```bash
# Activation
@squad-architect

# Command
*squad-analytics           # Default table view
*squad-analytics --detailed  # Show component names
*squad-analytics --format json  # Export JSON
```

---

## Integration with refresh-registry

The `*squad-analytics` command provides a **read-only view** of the current state.

To **update the registry** with new metadata, use:
```bash
*refresh-registry
```

Both commands use the same underlying data but serve different purposes:
- `*squad-analytics`: View/export current state
- `*refresh-registry`: Update registry with new squads/changes

---

## Script Location

```
squads/squad-creator/scripts/squad-analytics.py
```

**Dependencies:** Python 3.8+, PyYAML

---

_Task Version: 1.0.0_
_Created: 2026-02-01_
_Author: squad-architect_
