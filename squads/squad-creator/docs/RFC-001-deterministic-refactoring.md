# RFC-001: Deterministic Operations Refactoring

**Status:** DRAFT
**Created:** 2026-02-01
**Author:** Squad Architect
**Priority:** High

---

## Summary

Analysis of squad-creator system revealed **107 deterministic operations** that can be handled by Python scripts, and **38 LLM-required operations** that need semantic understanding.

This RFC proposes separating these concerns for:
- Faster validation (no LLM latency)
- Lower cost (no token usage for file checks)
- More reliable results (deterministic = reproducible)
- Better error messages (precise line numbers, exact issues)

---

## Current State

```
User: *validate-squad copy
       ↓
[LLM does EVERYTHING]
- Counts files (could be script)
- Checks YAML syntax (could be script)
- Verifies references exist (could be script)
- Judges content quality (needs LLM)
- Calculates scores (could be script)
       ↓
Result: Mixed deterministic + semantic in one pass
```

**Problems:**
1. Slow: LLM processes everything sequentially
2. Expensive: Tokens spent on file counting
3. Inconsistent: LLM might miss structural issues
4. No caching: Same checks repeated every time

---

## Proposed Architecture

```
User: *validate-squad copy
       ↓
[PHASE 1: DETERMINISTIC SCRIPTS]
├── script_inventory.py          → Counts files, lists components
├── script_yaml_validator.py     → Checks YAML syntax, required keys
├── script_dependency_check.py   → Verifies all references exist
├── script_naming_validator.py   → Checks kebab-case, camelCase
└── script_quality_gate.py       → Checks counts, line numbers
       ↓
[GATE: Any BLOCKING issues?]
├── YES → Stop, report issues, no LLM needed
└── NO  → Continue to Phase 2
       ↓
[PHASE 2: LLM SEMANTIC ANALYSIS]
├── Content quality judgment
├── Voice consistency check
├── Example realism assessment
├── Domain specificity analysis
└── Architecture coherence
       ↓
[PHASE 3: SCORING]
├── script_scoring.py            → Calculate weighted scores
└── Compare to thresholds
       ↓
Result: Structured report with deterministic + semantic
```

---

## Proposed Scripts

### 1. script_inventory.py

**Operations Handled:** 30+

```python
# Input
squad_path: str  # "squads/{your-squad}/"

# Output
{
  "exists": true,
  "components": {
    "agents": {"count": 22, "files": ["expert-agent.md", ...]},
    "tasks": {"count": 58, "files": [...]},
    "workflows": {"count": 3, "files": [...]},
    "templates": {"count": 10, "files": [...]},
    "checklists": {"count": 5, "files": [...]},
    "data": {"count": 2, "files": [...]}
  },
  "required_files": {
    "config.yaml": true,
    "README.md": true,
    "CHANGELOG.md": false
  }
}
```

**What it does:**
- `os.path.exists()` for directory checks
- `glob.glob()` for file counting
- `pathlib` for path operations

### 2. script_yaml_validator.py

**Operations Handled:** 25+

```python
# Input
file_path: str  # "squads/{your-squad}/agents/expert-agent.md"
expected_keys: list  # ["agent", "persona", "commands", "voice_dna"]

# Output
{
  "valid_syntax": true,
  "parse_errors": [],
  "missing_keys": ["voice_dna.emotional_states"],
  "present_keys": ["agent", "persona", "commands", "voice_dna.vocabulary"],
  "nested_counts": {
    "voice_dna.vocabulary.always_use": 8,
    "voice_dna.vocabulary.never_use": 6,
    "output_examples": 3,
    "objection_algorithms": 4,
    "anti_patterns.never_do": 13
  }
}
```

**What it does:**
- `yaml.safe_load()` for parsing
- Recursive key checking
- Array length counting

### 3. script_dependency_check.py

**Operations Handled:** 20+

```python
# Input
agent_file: str  # "squads/{your-squad}/agents/expert-agent.md"

# Output
{
  "references": {
    "tasks": ["create-sales-page.md", "write-headlines.md"],
    "templates": ["sales-page-tmpl.yaml"],
    "checklists": ["copy-quality.md"],
    "data": ["copywriting-kb.md"]
  },
  "resolved": {
    "tasks/create-sales-page.md": true,
    "tasks/write-headlines.md": true,
    "templates/sales-page-tmpl.yaml": false,  # MISSING
    "checklists/copy-quality.md": true,
    "data/copywriting-kb.md": true
  },
  "broken_references": ["templates/sales-page-tmpl.yaml"],
  "orphan_files": ["tasks/unused-task.md"]
}
```

**What it does:**
- Parse YAML `dependencies` block
- Check each referenced file exists
- Scan for files not referenced by any agent

### 4. script_naming_validator.py

**Operations Handled:** 8+

```python
# Input
squad_path: str

# Output
{
  "config_name_matches_folder": true,
  "slash_prefix_valid": true,  # camelCase
  "file_naming": {
    "agents": {"valid": ["expert-agent.md"], "invalid": []},
    "tasks": {"valid": [...], "invalid": ["Create_Sales_Page.md"]}  # Wrong case
  },
  "violations": [
    {"file": "tasks/Create_Sales_Page.md", "issue": "Must be kebab-case"}
  ]
}
```

**What it does:**
- Regex patterns: `^[a-z0-9]+(-[a-z0-9]+)*\.md$` for kebab-case
- Regex patterns: `^[a-z][a-zA-Z0-9]*$` for camelCase
- String comparison for config name vs folder

### 5. script_quality_gate.py

**Operations Handled:** 15+

```python
# Input
agent_file: str
thresholds: dict  # {"min_lines": 300, "min_examples": 3, ...}

# Output
{
  "file": "agents/expert-agent.md",
  "metrics": {
    "lines": 450,
    "vocabulary_always_use": 8,
    "vocabulary_never_use": 6,
    "output_examples": 3,
    "objection_algorithms": 4,
    "anti_patterns_never_do": 13,
    "anti_patterns_always_do": 9
  },
  "gates": {
    "lines_check": {"threshold": 300, "value": 450, "pass": true},
    "examples_check": {"threshold": 3, "value": 3, "pass": true},
    "vocabulary_check": {"threshold": 5, "value": 8, "pass": true}
  },
  "blocking_issues": [],
  "warnings": []
}
```

**What it does:**
- Count lines: `len(file.readlines())`
- Count YAML array items
- Compare against thresholds

### 6. script_scoring.py

**Operations Handled:** 10+

```python
# Input
dimension_scores: dict  # From LLM
{
  "template_conformance": 9,
  "principle_adherence": 8,
  "internal_consistency": 9,
  "integration_quality": 10,
  "practical_utility": 9
}
weights: dict
{
  "template_conformance": 0.25,
  "principle_adherence": 0.25,
  "internal_consistency": 0.20,
  "integration_quality": 0.15,
  "practical_utility": 0.15
}

# Output
{
  "dimension_scores": {...},
  "weighted_scores": {
    "template_conformance": 2.25,  # 9 * 0.25
    "principle_adherence": 2.00,
    ...
  },
  "total_score": 8.95,
  "interpretation": "Good - Ready for production",
  "pass": true,
  "threshold": 7.0
}
```

**What it does:**
- Multiply scores by weights
- Sum weighted scores
- Compare to thresholds
- Return interpretation

### 7. script_registry_manager.py

**Operations Handled:** 5+

```python
# Input
query: str  # "copywriting"
registry_path: str  # "data/squad-registry.yaml"

# Output
{
  "query": "copywriting",
  "matches": [
    {
      "squad": "copy",
      "domain": "copywriting",
      "match_type": "domain_index",
      "confidence": "exact"
    }
  ],
  "related": [
    {"squad": "creator-os", "reason": "content creation"}
  ]
}
```

**What it does:**
- Parse squad-registry.yaml
- Search domain_index
- Search keywords arrays
- Return matches with confidence

---

## Operation Classification Summary

### DETERMINISTIC (107 operations)

| Category | Count | Script |
|----------|-------|--------|
| File/directory existence | 30 | script_inventory.py |
| YAML structure validation | 25 | script_yaml_validator.py |
| Reference/dependency checks | 20 | script_dependency_check.py |
| Naming convention validation | 8 | script_naming_validator.py |
| Threshold comparisons | 15 | script_quality_gate.py |
| Score calculation | 10 | script_scoring.py |

### LLM-REQUIRED (38 operations)

| Category | Count | Why LLM Needed |
|----------|-------|----------------|
| Content quality judgment | 12 | Semantic understanding |
| Voice/persona consistency | 6 | Style analysis |
| Example realism assessment | 5 | Domain knowledge |
| Architecture design | 5 | Creative judgment |
| Domain viability | 4 | Business judgment |
| Gap analysis | 3 | Problem identification |
| Tier classification | 3 | Expert judgment |

---

## Implementation Plan

### Phase 1: Core Scripts (Week 1)

1. **script_inventory.py** - Already created as `refresh-registry.py`
2. **script_yaml_validator.py** - New
3. **script_quality_gate.py** - New

### Phase 2: Dependency & Naming (Week 2)

4. **script_dependency_check.py** - New
5. **script_naming_validator.py** - New

### Phase 3: Scoring & Registry (Week 3)

6. **script_scoring.py** - New
7. **script_registry_manager.py** - Extend refresh-registry.py

### Phase 4: Integration (Week 4)

8. **script_orchestrator.py** - Chains all scripts
9. Update tasks to use scripts
10. Update agent to call scripts first

---

## Interface Between Scripts and LLM

### Script Output → LLM Input

```yaml
# Scripts produce structured data
deterministic_results:
  inventory:
    agents: 22
    tasks: 58
  structure_validation:
    valid: true
    missing_keys: []
  dependency_check:
    broken_references: []
  quality_gates:
    all_pass: true

# LLM receives this context
llm_prompt: |
  The following structural checks have PASSED:
  - 22 agents, 58 tasks found
  - All YAML syntax valid
  - All dependencies resolved
  - All naming conventions followed

  Now evaluate SEMANTIC quality:
  1. Are the examples realistic?
  2. Is the voice consistent?
  3. Are anti-patterns domain-specific?
```

### LLM Output → Script Input

```yaml
# LLM produces dimension scores
llm_output:
  dimension_scores:
    template_conformance: 9
    principle_adherence: 8
    internal_consistency: 9
    integration_quality: 10
    practical_utility: 9

# Script calculates final score
script_scoring.py:
  input: llm_output.dimension_scores
  output:
    total_score: 8.95
    interpretation: "Good"
    pass: true
```

---

## Benefits

| Metric | Before | After |
|--------|--------|-------|
| Validation time | ~30s (all LLM) | ~5s (scripts) + ~10s (LLM) |
| Token cost | High (counting files) | Low (only semantic) |
| Reliability | Variable | Deterministic base |
| Error messages | Generic | Precise (line numbers) |
| Caching | None | Script results cached |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Script bugs give wrong results | Comprehensive unit tests |
| Scripts and LLM disagree | LLM can override with justification |
| Maintenance burden | Single source of truth (scripts), clear interfaces |
| Over-engineering | Start with 3 core scripts, expand as needed |

---

## Next Steps

1. **Review this RFC** - Get feedback on approach
2. **Prototype 3 core scripts** - inventory, yaml_validator, quality_gate
3. **Test on squad-creator itself** - Validate approach works
4. **Integrate with tasks** - Update validate-squad.md to use scripts
5. **Document interfaces** - Clear contracts between scripts and LLM

---

## Appendix: Full Operation List

See analysis output for complete list of 145 operations with classifications.

---

_RFC-001 Version: 1.0_
_Status: Awaiting Review_
