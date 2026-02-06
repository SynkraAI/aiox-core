# Task: Validate Squad

**Task ID:** validate-squad
**Version:** 3.0.0
**Purpose:** Validate a squad against AIOS principles using tiered, context-aware validation
**Orchestrator:** @squad-architect
**Mode:** Tiered validation (structure → coverage → quality → contextual)

**Core Philosophy:**
```
Quality comes from adherence to principles AND context-awareness.
An orchestrator doesn't need voice_dna. An expert agent does.
Validation must understand WHAT type of squad it's validating.
```

**Frameworks Used:**
- `data/squad-type-definitions.yaml` → Squad type detection and requirements
- `checklists/squad-checklist.md` → Complete validation checklist (v3.0)
- `data/quality-dimensions-framework.md` → Quality scoring
- `data/tier-system-framework.md` → Agent tier validation

---

## Validation Flow

```
INPUT (squad_name)
    ↓
[PHASE 0: TYPE DETECTION]
    → Detect squad type (Expert/Pipeline/Hybrid)
    → Load type-specific requirements
    ↓
[PHASE 1: STRUCTURE - TIER 1]
    → config.yaml exists and valid
    → Entry agent defined and activatable
    → All referenced files exist
    → BLOCKING: Any failure = ABORT
    ↓
[PHASE 2: COVERAGE - TIER 2]
    → Checklist coverage for complex tasks (>=30%)
    → Orphan task detection (max 2)
    → Pipeline phase coverage (Pipeline squads)
    → Data file usage (>=50%)
    → BLOCKING: Coverage failures = ABORT
    ↓
[PHASE 3: QUALITY - TIER 3]
    → Prompt Quality (25%)
    → Pipeline Coherence (25%)
    → Checklist Actionability (25%)
    → Documentation (25%)
    → Score 0-10, threshold 7.0
    ↓
[PHASE 4: CONTEXTUAL - TIER 4]
    → Expert: voice_dna, objection_algorithms, tiers
    → Pipeline: workflow, checkpoints, orchestrator
    → Hybrid: persona, behavioral_states, heuristics
    → Score 0-10, weighted 20% of final
    ↓
[PHASE 5: VETO CHECK]
    → Check type-specific veto conditions
    → Any veto = FAIL regardless of score
    ↓
[PHASE 6: SCORING & REPORT]
    → Calculate: (Tier 3 × 0.80) + (Tier 4 × 0.20)
    → Generate detailed report
    ↓
OUTPUT: Validation Report + Final Score
```

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `squad_name` | string | Yes | Name of squad to validate | `"copy"`, `"books"` |
| `squad_path` | string | No | Override default path | `"squads/{your-squad}/"` |
| `type_override` | string | No | Force squad type | `"expert"`, `"pipeline"`, `"hybrid"` |

---

## PHASE 0: TYPE DETECTION

**Duration:** < 30 seconds
**Mode:** Autonomous
**Reference:** `data/squad-type-definitions.yaml`

### Step 0.1: Analyze Squad Structure

```yaml
detection_signals:
  count_agents:
    action: "Count files in agents/"
    weight_expert: "high count (+)"
    weight_pipeline: "low count (+)"

  check_voice_dna:
    action: "Grep for 'voice_dna:' in agent files"
    weight_expert: "present (+3)"
    weight_pipeline: "absent (neutral)"
    weight_hybrid: "absent (neutral)"

  check_workflow:
    action: "Look for workflow.yaml or sequential phases in orchestrator"
    weight_pipeline: "present (+3)"

  check_heuristics:
    action: "Grep for heuristic IDs (PV_*, SC_*)"
    weight_hybrid: "present (+3)"

  calculate_ratio:
    action: "tasks_count / agents_count"
    weight_pipeline: "ratio > 3 (+2)"
    weight_expert: "ratio 2-4 (+1)"
    weight_hybrid: "ratio ~1 (+2)"
```

### Step 0.2: Determine Type

```yaml
detection_algorithm:
  expert_score: 0
  pipeline_score: 0
  hybrid_score: 0

  # Apply weights from signals
  if agents_count >= 5: expert_score += 2
  if voice_dna_present_in_50_percent: expert_score += 3
  if has_tier_organization: expert_score += 1

  if has_orchestrator_agent: pipeline_score += 2
  if has_sequential_phases: pipeline_score += 3
  if tasks_count > agents_count * 3: pipeline_score += 2

  if has_heuristic_validation: hybrid_score += 3
  if has_persona_profile_pattern: hybrid_score += 2
  if agents_count ~= phases_count: hybrid_score += 1

  # Determine winner
  detected_type: max(expert_score, pipeline_score, hybrid_score)

  # Handle ties
  if tie:
    if real_person_names_in_agents: "expert"
    elif phase_numbering_present: "pipeline"
    else: "pipeline"  # default
```

### Step 0.3: Load Type Requirements

```yaml
load_requirements:
  file: "data/squad-type-definitions.yaml"
  section: "squad_types.{detected_type}"

  output:
    required_components: [...]
    optional_components: [...]
    veto_conditions: [...]
    benchmarks: {...}
```

**Output (PHASE 0):**
```yaml
phase_0_output:
  detected_type: "pipeline"  # or "expert" or "hybrid"
  confidence: 0.85
  signals:
    agents_count: 1
    voice_dna_present: false
    has_workflow: true
    task_agent_ratio: 19
  requirements_loaded: true
```

---

## PHASE 1: STRUCTURE (TIER 1 - BLOCKING)

**Duration:** < 1 minute
**Mode:** Autonomous
**Result:** PASS or ABORT

### 1.1 Configuration Check

```yaml
structure_checks:
  - id: "T1-CFG-001"
    check: "config.yaml exists in squad root"
    action: "ls {squad_path}/config.yaml"
    on_fail: "ABORT - No config.yaml found"

  - id: "T1-CFG-002"
    check: "config.yaml is valid YAML"
    action: "Parse YAML, check for errors"
    on_fail: "ABORT - Invalid YAML syntax"

  - id: "T1-CFG-003"
    check: "Required fields present"
    fields: ["name", "version", "description", "entry_agent"]
    on_fail: "ABORT - Missing required field: {field}"

  - id: "T1-CFG-004"
    check: "name uses kebab-case"
    pattern: "^[a-z0-9]+(-[a-z0-9]+)*$"
    on_fail: "ABORT - Name must be kebab-case"

  - id: "T1-CFG-005"
    check: "version follows semver"
    pattern: "^\\d+\\.\\d+\\.\\d+$"
    on_fail: "ABORT - Version must be X.Y.Z"
```

### 1.2 Entry Point Check

```yaml
entry_point_checks:
  - id: "T1-ENT-001"
    check: "entry_agent file exists"
    action: "ls {squad_path}/agents/{entry_agent}.md"
    on_fail: "ABORT - Entry agent file not found"

  - id: "T1-ENT-002"
    check: "entry_agent has activation-instructions"
    action: "Grep for 'activation-instructions:'"
    on_fail: "ABORT - Entry agent not activatable"

  - id: "T1-ENT-003"
    check: "entry_agent has *help command"
    action: "Grep for '*help' in commands section"
    on_fail: "ABORT - Entry agent missing *help command"
```

### 1.3 File Reference Check

```yaml
reference_checks:
  - id: "T1-REF-001"
    check: "All config.yaml dependencies exist"
    action: |
      For each file in config.yaml dependencies:
        Check file exists at {squad_path}/{type}/{file}
    threshold: "100%"
    on_fail: "ABORT - Missing dependency: {file}"

  - id: "T1-REF-002"
    check: "All agent dependencies exist"
    action: |
      For each agent:
        For each file in dependencies:
          Check file exists
    threshold: "80%"  # Allow some missing
    on_fail_above_threshold: "ABORT - >20% missing references"

  - id: "T1-REF-003"
    check: "Required directories exist"
    directories: ["agents/"]
    conditional:
      - "tasks/ if any tasks referenced"
      - "checklists/ if complex tasks exist"
    on_fail: "ABORT - Missing required directory"
```

### 1.4 Cross-Reference Validation

```yaml
cross_reference_checks:
  - id: "T1-XREF-001"
    check: "All handoff_to targets exist"
    action: |
      For each agent with handoff_to:
        Verify target agent file exists
    on_fail: "ABORT - Handoff to non-existent agent: {target}"

  - id: "T1-XREF-002"
    check: "All task references valid"
    action: |
      For each task referenced in agents/workflows:
        Verify task file exists in tasks/
    on_fail: "ABORT - Task reference invalid: {task}"

  - id: "T1-XREF-003"
    check: "All template references valid"
    action: |
      For each template referenced in tasks:
        Verify template file exists
    on_fail: "WARNING - Template missing: {template}"

  - id: "T1-XREF-004"
    check: "All checklist references valid"
    action: |
      For each checklist referenced:
        Verify checklist file exists
    on_fail: "WARNING - Checklist missing: {checklist}"
```

### 1.5 Security Scan

**Reference:** OWASP Secrets Management, squad-checklist.md SEC-001 to SEC-018

```yaml
security_scan:
  description: "Comprehensive security scan for secrets and vulnerabilities"

  # Category 1: API Keys & Tokens (BLOCKING)
  api_tokens:
    - id: "T1-SEC-001"
      check: "No hardcoded API keys"
      action: "grep -rE '(api[_-]?key|apikey)\\s*[:=]\\s*[^${}]{20,}'"
      exclude: "# Placeholder|{{|\\$[A-Z]"
      on_match: "ABORT - API key found"

    - id: "T1-SEC-002"
      check: "No hardcoded secrets/passwords"
      action: "grep -rE '(secret|password|passwd)\\s*[:=]\\s*['\"][^'\"${}]{8,}'"
      on_match: "ABORT - Secret/password found"

    - id: "T1-SEC-003"
      check: "No bearer/JWT tokens"
      action: "grep -rE '(bearer|jwt[_-]?secret)\\s*[:=]\\s*['\"][^'\"]{20,}'"
      on_match: "ABORT - Token found"

  # Category 2: Cloud Credentials (BLOCKING)
  cloud_credentials:
    - id: "T1-SEC-004"
      check: "No AWS Access Keys"
      action: "grep -rE 'AKIA[A-Z0-9]{16}'"
      on_match: "ABORT - AWS Access Key found"

    - id: "T1-SEC-005"
      check: "No AWS Secret Keys"
      action: "grep -rE 'aws[_-]?secret.*['\"][A-Za-z0-9/+=]{40}'"
      on_match: "ABORT - AWS Secret Key found"

    - id: "T1-SEC-006"
      check: "No GCP Service Account Keys"
      action: "grep -rE '\"type\":\\s*\"service_account\"'"
      on_match: "ABORT - GCP Service Account found"

  # Category 3: Private Keys (BLOCKING)
  private_keys:
    - id: "T1-SEC-007"
      check: "No private keys in content"
      action: "grep -rE '-----BEGIN.*PRIVATE KEY-----'"
      on_match: "ABORT - Private key content found"

    - id: "T1-SEC-008"
      check: "No private key files"
      action: "find . -name '*.pem' -o -name '*.key' -o -name 'id_rsa' -o -name 'id_ecdsa'"
      on_match: "ABORT - Private key file found"

  # Category 4: Database URLs (BLOCKING)
  database_urls:
    - id: "T1-SEC-009"
      check: "No database URLs with credentials"
      action: "grep -rE '(postgres|mysql|mongodb|redis)://[^:]+:[^@]+@'"
      on_match: "ABORT - Database URL with password found"

    - id: "T1-SEC-010"
      check: "No Supabase service role keys"
      action: "grep -rE 'supabase.*service[_-]?role.*eyJ'"
      on_match: "ABORT - Supabase service role key found"

  # Category 5: Sensitive Files (BLOCKING)
  sensitive_files:
    - id: "T1-SEC-011"
      check: "No .env files"
      action: "find . -name '.env*' -o -name '*.env'"
      on_match: "ABORT - .env file found"

    - id: "T1-SEC-012"
      check: "No credential files"
      action: "find . -name 'credentials*.json' -o -name 'service-account*.json' -o -name 'secrets.yaml'"
      on_match: "ABORT - Credential file found"

  # Category 6: Code Vulnerabilities (WARNING)
  code_vulnerabilities:
    - id: "T1-SEC-013"
      check: "No dangerous eval/exec"
      action: "grep -rE '\\b(eval|exec)\\s*\\(' --include='*.py' --include='*.js'"
      severity: WARNING
      on_match: "WARNING - eval/exec found, review context"

  # False positive exclusions
  exclude_patterns:
    - "{{.*}}"           # Jinja/Mustache placeholders
    - "$[A-Z_]+"         # Shell variables
    - "process.env."     # Node.js env
    - "os.environ"       # Python env
    - "# Example:"       # Example in comments
    - "your-.*-here"     # Placeholder text
```

**Tier 1 Output:**
```yaml
tier_1_result:
  status: "PASS"  # or "ABORT"
  checks_run: 11
  checks_passed: 11
  checks_failed: 0
  blocking_issues: []
```

---

## PHASE 2: COVERAGE (TIER 2 - BLOCKING)

**Duration:** 1-2 minutes
**Mode:** Autonomous
**Result:** PASS or ABORT

### 2.1 Checklist Coverage

```yaml
checklist_coverage:
  id: "T2-COV-001"
  description: "Complex tasks should have checklists"

  calculation:
    step_1: "Count tasks with >500 lines"
    step_2: "Count checklists in checklists/"
    step_3: "Calculate ratio: checklists / complex_tasks"

  threshold: 0.30  # 30%
  result:
    pass_if: "ratio >= 0.30"
    warn_if: "ratio >= 0.20"
    fail_if: "ratio < 0.20"

  on_fail: "ABORT - Insufficient checklist coverage ({ratio}% < 30%)"
```

### 2.2 Orphan Task Detection

```yaml
orphan_detection:
  id: "T2-ORP-001"
  description: "Tasks must be referenced somewhere"

  calculation:
    for_each_task_in_tasks:
      check_1: "Is task referenced in any agent's commands?"
      check_2: "Is task referenced in any agent's dependencies?"
      check_3: "Is task referenced in any workflow?"
      if_none: "Mark as ORPHAN"

  threshold: 2  # Max orphans allowed
  result:
    pass_if: "orphan_count <= 2"
    warn_if: "orphan_count <= 5"
    fail_if: "orphan_count > 5"

  on_fail: "ABORT - Too many orphan tasks: {orphan_list}"
```

### 2.3 Pipeline Phase Coverage (Pipeline squads only)

```yaml
phase_coverage:
  id: "T2-PHS-001"
  description: "All workflow phases must have tasks"
  applies_to: "pipeline"

  calculation:
    step_1: "List all phases in workflow"
    step_2: "For each phase, verify task reference exists"
    step_3: "Calculate coverage %"

  threshold: 1.0  # 100%
  result:
    pass_if: "coverage == 100%"
    fail_if: "coverage < 100%"

  on_fail: "ABORT - Phases without tasks: {missing_phases}"
```

### 2.4 Data File Usage

```yaml
data_usage:
  id: "T2-DAT-001"
  description: "Data files should be referenced"

  calculation:
    step_1: "List all files in data/"
    step_2: "For each file, grep all agents and tasks for filename"
    step_3: "Calculate usage %"

  threshold: 0.50  # 50%
  result:
    pass_if: "usage >= 50%"
    warn_if: "usage >= 30%"
    fail_if: "usage < 30%"

  on_warn: "WARNING - Low data file usage: {unused_files}"
  # Not blocking, just warning
```

**Tier 2 Output:**
```yaml
tier_2_result:
  status: "PASS"  # or "ABORT"
  metrics:
    checklist_coverage: "35%"
    orphan_tasks: 1
    phase_coverage: "100%"  # if pipeline
    data_usage: "67%"
  issues: []
```

---

## PHASE 3: QUALITY (TIER 3 - SCORING)

**Duration:** 5-10 minutes
**Mode:** Autonomous with sampling
**Result:** Score 0-10

### 3.1 Prompt Quality (25%)

```yaml
prompt_quality:
  id: "T3-PQ"
  weight: 0.25
  question: "Are task prompts specific, actionable, and reproducible?"

  sampling:
    method: "Select 3 representative tasks"
    selection:
      - "Most complex (highest lines)"
      - "Entry/main task"
      - "Random task"

  criteria:
    - name: "Explicit examples"
      points: 3
      check: "Task has input/output examples?"

    - name: "Anti-patterns"
      points: 2
      check: "Task has 'don't do' section?"

    - name: "Success criteria"
      points: 2
      check: "Task has measurable completion criteria?"

    - name: "Step-by-step"
      points: 2
      check: "Instructions are sequential and clear?"

    - name: "No vague language"
      points: 1
      check: "Avoids 'verify', 'ensure', 'check' without specifics?"

  scoring:
    per_task: "Sum criteria points (max 10)"
    final: "Average of 3 sampled tasks"
```

### 3.2 Pipeline Coherence (25%)

```yaml
pipeline_coherence:
  id: "T3-PC"
  weight: 0.25
  question: "Does data flow correctly between components?"

  criteria:
    - name: "Output→Input chain"
      points: 3
      check: |
        For each phase transition:
          Phase N output field == Phase N+1 input field?
          File paths consistent?

    - name: "No sequence collisions"
      points: 2
      check: "No two tasks have same sequence number?"

    - name: "Checkpoints present"
      points: 2
      check: |
        Quality gate before final output?
        Human review at critical points?

    - name: "Failure handling"
      points: 2
      check: "Rework rules defined for failures?"

    - name: "Dependencies explicit"
      points: 1
      check: "Task dependencies are listed, not implicit?"

  scoring:
    method: "Sum criteria points (max 10)"
```

### 3.3 Checklist Actionability (25%)

```yaml
checklist_actionability:
  id: "T3-CA"
  weight: 0.25
  question: "Are checklists measurable and actionable?"

  sampling:
    method: "Evaluate all checklists (or max 3)"

  criteria:
    - name: "Measurable items"
      points: 3
      check: |
        Items can be answered YES/NO?
        Avoids 'verify quality', 'ensure completeness'?

    - name: "Scoring system"
      points: 2
      check: "Has point values or grades?"

    - name: "Pass/fail thresholds"
      points: 2
      check: "Defines what score = pass?"

    - name: "Auto-correction"
      points: 2
      check: "If item fails, guidance on how to fix?"

    - name: "Edge cases"
      points: 1
      check: "Covers unusual scenarios?"

  scoring:
    per_checklist: "Sum criteria points (max 10)"
    final: "Average of all checklists"
```

### 3.4 Documentation (25%)

```yaml
documentation:
  id: "T3-DOC"
  weight: 0.25
  question: "Can a new user understand and use this squad?"

  criteria:
    - name: "README purpose"
      points: 2
      check: "README clearly explains what squad does?"

    - name: "Getting started"
      points: 2
      check: "Installation/activation instructions present?"

    - name: "Command examples"
      points: 2
      check: "Commands documented with usage examples?"

    - name: "Architecture diagram"
      points: 1
      check: "Visual flow or structure diagram?"

    - name: "Changelog"
      points: 1
      check: "Version history maintained?"

    - name: "Error handling"
      points: 1
      check: "Common errors and fixes documented?"

    - name: "Dependencies"
      points: 1
      check: "External dependencies listed?"

  scoring:
    method: "Sum criteria points (max 10)"
```

**Tier 3 Output:**
```yaml
tier_3_result:
  scores:
    prompt_quality: 8.5
    pipeline_coherence: 7.0
    checklist_actionability: 6.5
    documentation: 8.0
  weighted_total: 7.5
  details:
    prompt_quality_samples: ["brutal-extractor.md", "final-writer.md", "gap-analyzer.md"]
    coherence_issues: ["Phase 3.5 not in workflow.yaml", "Sequence 10 collision"]
    checklist_issues: ["book-summary-scoring.md missing auto-correction for some items"]
```

---

## PHASE 4: CONTEXTUAL VALIDATION (TIER 4)

**Duration:** 3-5 minutes
**Mode:** Type-specific
**Result:** Score 0-10

### 4A. Expert Squad Validation

```yaml
expert_validation:
  applies_to: "expert"

  checks:
    voice_dna:
      id: "T4E-VD"
      weight: 0.30
      required: true
      criteria:
        - "Each agent has voice_dna section"
        - "sentence_starters defined by context"
        - "metaphors defined with usage"
        - "vocabulary.always_use has 5+ terms"
        - "vocabulary.never_use has 3+ terms"

    objection_algorithms:
      id: "T4E-OA"
      weight: 0.25
      required: true
      criteria:
        - "Each agent has objection_algorithms"
        - "Minimum 3 objections per agent"
        - "Responses are domain-specific"

    output_examples:
      id: "T4E-OE"
      weight: 0.25
      required: true
      criteria:
        - "Each agent has 3+ examples"
        - "Examples show input→output"
        - "Examples are realistic"

    tier_organization:
      id: "T4E-TO"
      weight: 0.20
      required: true
      criteria:
        - "Tier 0 (diagnosis) agents exist"
        - "Tier assignments documented"
        - "Orchestrator/Chief defined"
```

### 4B. Pipeline Squad Validation

```yaml
pipeline_validation:
  applies_to: "pipeline"

  checks:
    workflow_definition:
      id: "T4P-WD"
      weight: 0.30
      required: true
      criteria:
        - "Workflow file exists"
        - "Phases numbered sequentially"
        - "Each phase has: name, task, outputs"
        - "Dependencies explicit"

    phase_checkpoints:
      id: "T4P-PC"
      weight: 0.30
      required: true
      criteria:
        - "Critical phases have checkpoints"
        - "Quality gate before final output"
        - "Rework rules on failure"

    orchestrator_completeness:
      id: "T4P-OC"
      weight: 0.25
      required: true
      criteria:
        - "All phases documented in orchestrator"
        - "Commands map to tasks"
        - "Status tracking capability"

    intermediate_outputs:
      id: "T4P-IO"
      weight: 0.10
      required: true
      criteria:
        - "Each phase produces output"
        - "Output paths consistent"
        - "Outputs inspectable"

    automation_script:
      id: "T4P-AS"
      weight: 0.15
      required: false  # Required only if phases >= 8
      applies_when: "phases_count >= 8"
      criteria:
        - "Script exists in scripts/ directory"
        - "Accepts input parameters (slug/target)"
        - "Has --help documentation"
        - "Has state management (state.json)"
        - "Has progress tracking"
        - "Logs to logs/ directory"
        - "Supports resume capability"
      scoring:
        7_of_7: 10
        6_of_7: 8
        5_of_7: 7  # minimum pass
        below_5: "FAIL"
```

### 4C. Hybrid Squad Validation

```yaml
hybrid_validation:
  applies_to: "hybrid"

  checks:
    persona_profile:
      id: "T4H-PP"
      weight: 0.25
      required: true
      criteria:
        - "Each agent has persona_profile"
        - "Archetype defined"
        - "Communication style documented"

    behavioral_states:
      id: "T4H-BS"
      weight: 0.25
      required: true
      criteria:
        - "Operational modes defined"
        - "Mode triggers documented"
        - "Output format per mode"

    heuristic_validation:
      id: "T4H-HV"
      weight: 0.30
      required: true
      criteria:
        - "Heuristics have IDs (PV_*, SC_*)"
        - "Each has: trigger, evaluation, threshold"
        - "VETO conditions explicit"
        - "Fallback behavior defined"

    process_standards:
      id: "T4H-PS"
      weight: 0.20
      required: true
      criteria:
        - "Task Anatomy (8 fields) enforced"
        - "BPMN or equivalent used"
        - "Integration points documented"
```

**Tier 4 Output:**
```yaml
tier_4_result:
  squad_type: "pipeline"
  score: 7.5
  checks:
    workflow_definition: 8.0
    phase_checkpoints: 6.0  # Missing rework rules
    orchestrator_completeness: 9.0
    intermediate_outputs: 7.0
  issues:
    - "Phase checkpoints missing rework rules"
    - "Some phases lack explicit outputs"
```

---

## PHASE 5: VETO CHECK

**Duration:** < 30 seconds
**Mode:** Autonomous
**Result:** VETO or PROCEED

### Universal Vetos

```yaml
universal_vetos:
  - id: "V1"
    condition: "No entry agent defined"
    check: "tier_1_result.entry_agent_exists == false"
    result: "VETO"

  - id: "V2"
    condition: "Entry agent cannot activate"
    check: "tier_1_result.entry_agent_activatable == false"
    result: "VETO"

  - id: "V3"
    condition: ">20% of referenced files missing"
    check: "tier_1_result.missing_references > 20%"
    result: "VETO"

  - id: "V4"
    condition: "config.yaml invalid"
    check: "tier_1_result.config_valid == false"
    result: "VETO"

  - id: "V5"
    condition: "Security issue detected"
    check: "tier_1_result.security_issues > 0"
    result: "VETO"
    message: "Secrets, API keys, or credentials found"

  - id: "V6"
    condition: "Critical cross-reference broken"
    check: "tier_1_result.broken_handoffs > 0"
    result: "VETO"
    message: "Handoff to non-existent agent"
```

### Expert Squad Vetos

```yaml
expert_vetos:
  - id: "VE1"
    condition: "Zero agents with voice_dna"
    check: "tier_4_result.voice_dna_coverage == 0"
    result: "VETO"

  - id: "VE2"
    condition: "No Tier 0 (diagnosis) capability"
    check: "tier_4_result.has_tier_0 == false"
    result: "VETO"
```

### Pipeline Squad Vetos

```yaml
pipeline_vetos:
  - id: "VP1"
    condition: "Workflow has sequence collisions"
    check: "tier_3_result.sequence_collisions > 0"
    result: "VETO"

  - id: "VP2"
    condition: "Phase outputs don't connect"
    check: "tier_3_result.broken_output_chain == true"
    result: "VETO"

  - id: "VP3"
    condition: "No quality gate before final"
    check: "tier_4_result.has_quality_gate == false"
    result: "VETO"
```

### Hybrid Squad Vetos

```yaml
hybrid_vetos:
  - id: "VH1"
    condition: "No heuristic validation defined"
    check: "tier_4_result.heuristic_count == 0"
    result: "VETO"

  - id: "VH2"
    condition: "Missing fallback behavior"
    check: "tier_4_result.has_fallback == false"
    result: "VETO"
```

**Veto Output:**
```yaml
veto_result:
  status: "PROCEED"  # or "VETO"
  triggered: null  # or veto ID
  message: null  # or veto message
```

---

## PHASE 6: SCORING & REPORT

**Duration:** 1-2 minutes
**Mode:** Autonomous

### Final Score Calculation

```yaml
score_calculation:
  # Only if Tier 1 and Tier 2 passed
  precondition:
    tier_1: "PASS"
    tier_2: "PASS"
    veto: "PROCEED"

  formula: "(tier_3_score × 0.80) + (tier_4_score × 0.20)"

  example:
    tier_3_score: 7.5
    tier_4_score: 7.5
    final: (7.5 × 0.80) + (7.5 × 0.20) = 6.0 + 1.5 = 7.5

  interpretation:
    9.0-10.0: "EXCELLENT - Gold standard reference"
    7.0-8.9: "PASS - Production ready"
    5.0-6.9: "CONDITIONAL - Needs improvements"
    0.0-4.9: "FAIL - Significant rework needed"
```

### Report Format

```yaml
report_structure:
  header:
    squad_name: "{name}"
    squad_type: "{detected_type}"
    version: "{version}"
    validation_date: "{date}"
    validator: "Squad Architect v3.0"

  executive_summary:
    final_score: "X.X/10"
    result: "PASS | CONDITIONAL | FAIL"
    type_detected: "Expert | Pipeline | Hybrid"
    key_strengths:
      - "..."
    key_issues:
      - "..."

  tier_results:
    tier_1_structure:
      status: "PASS | ABORT"
      checks: X/Y
      blocking_issues: []

    tier_2_coverage:
      status: "PASS | ABORT"
      metrics:
        checklist_coverage: "X%"
        orphan_tasks: N
        data_usage: "X%"

    tier_3_quality:
      score: "X.X/10"
      breakdown:
        prompt_quality: "X.X (25%)"
        pipeline_coherence: "X.X (25%)"
        checklist_actionability: "X.X (25%)"
        documentation: "X.X (25%)"

    tier_4_contextual:
      type: "Expert | Pipeline | Hybrid"
      score: "X.X/10"
      breakdown: {...}

  veto_status:
    triggered: "None | VXX"
    message: "..."

  issues_by_priority:
    critical:
      - issue: "..."
        component: "..."
        fix: "..."
    high:
      - issue: "..."
        fix: "..."
    medium:
      - issue: "..."
        fix: "..."

  recommendations:
    immediate: ["..."]
    short_term: ["..."]

  sign_off:
    validator: "Squad Architect"
    date: "{date}"
    final_score: "X.X/10"
    result: "PASS | CONDITIONAL | FAIL"
```

---

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Validation Report | Console + `{squad_path}/docs/validation-report-{date}.md` | Full report |
| Score Summary | Console | Quick pass/fail with score |

---

## Usage

```bash
# Validate entire squad
@squad-architect
*validate-squad books

# With type override (skip detection)
*validate-squad books --type=pipeline

# Verbose mode
*validate-squad copy --verbose
```

---

## Quick Reference: What's Required by Type

| Component | Expert | Pipeline | Hybrid |
|-----------|--------|----------|--------|
| voice_dna | REQUIRED | optional | optional |
| objection_algorithms | REQUIRED | optional | optional |
| output_examples | REQUIRED | optional | optional |
| tier_organization | REQUIRED | optional | optional |
| workflow_definition | optional | REQUIRED | optional |
| phase_checkpoints | optional | REQUIRED | optional |
| orchestrator | optional | REQUIRED | optional |
| automation_script | optional | **IF 8+ phases** | optional |
| persona_profile | optional | optional | REQUIRED |
| behavioral_states | optional | optional | REQUIRED |
| heuristic_validation | optional | optional | REQUIRED |

---

## Related

| Command | Purpose |
|---------|---------|
| `*validate-squad {name}` | Full squad validation |
| `*validate-agent {file}` | Single agent validation |
| `*validate-task {file}` | Single task validation |

| Reference | File |
|-----------|------|
| Checklist | `checklists/squad-checklist.md` |
| Type Definitions | `data/squad-type-definitions.yaml` |
| Quality Framework | `data/quality-dimensions-framework.md` |

---

## Changelog

```yaml
v3.0.0 (2026-02-01):
  - Added squad type detection (Expert/Pipeline/Hybrid)
  - Added 4-tier validation system
  - Made voice_dna/objection_algorithms contextual
  - Added prompt quality, pipeline coherence, checklist actionability
  - Added coverage ratio checks
  - Added type-specific veto conditions
  - Aligned with squad-checklist.md v3.0

v2.0.0 (2026-01-15):
  - Qualitative validation approach
  - Principle-based checks

v1.0.0 (2025-12-01):
  - Initial task
```

---

_Task Version: 3.0.0_
_Philosophy: Context-aware validation - different squads need different things_
_Reference: squad-checklist.md v3.0, squad-type-definitions.yaml v1.0_
