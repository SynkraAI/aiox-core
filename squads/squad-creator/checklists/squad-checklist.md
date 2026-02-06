# Squad Validation Checklist v3.0

This checklist validates AIOS squads using a **tiered, context-aware approach** based on analysis of gold standard squads (Copy, MMOS, HybridOps, Books).

---

## QUICK REFERENCE

```yaml
validation_tiers:
  tier_1_structure: "Pass/Fail gates - BLOCKING"
  tier_2_coverage: "Ratio requirements - BLOCKING"
  tier_3_quality: "Weighted scoring - THRESHOLD 7.0"
  tier_4_contextual: "Squad-type specific - CONDITIONAL"

squad_types:
  expert: "Mind clones with distinct personalities (Copy, Storytelling)"
  pipeline: "Sequential phase orchestration (Books, MMOS)"
  hybrid: "Process automation with heuristics (HybridOps)"

final_score: "(Tier 3 × 0.8) + (Tier 4 × 0.2)"
pass_threshold: 7.0
excellence_threshold: 9.0
```

---

## STEP 0: SQUAD TYPE DETECTION

Before validating, determine the squad type:

### Detection Criteria

| Signal | Expert | Pipeline | Hybrid |
|--------|--------|----------|--------|
| Multiple agents with distinct personas | ✅ | ❌ | ⚠️ |
| Single orchestrator + many tasks | ❌ | ✅ | ❌ |
| Sequential phase execution | ⚠️ | ✅ | ✅ |
| Mind clones (real people) | ✅ | ❌ | ❌ |
| Heuristic-based validation | ❌ | ⚠️ | ✅ |
| Process automation focus | ❌ | ❌ | ✅ |

### Auto-Detection Rules

```yaml
detect_expert_squad:
  conditions:
    - agents_count >= 5
    - agents_based_on_real_people: true
    - voice_dna_present_in_agents: "> 50%"
  examples: ["copy", "storytelling", "legal"]

detect_pipeline_squad:
  conditions:
    - has_orchestrator_agent: true
    - has_sequential_phases: true
    - tasks_count > agents_count * 3
  examples: ["content-pipeline", "data-processing"]

detect_hybrid_squad:
  conditions:
    - has_process_focus: true
    - has_heuristic_validation: true
    - agents_per_phase: "~1"
  examples: ["workflow-automation", "etl-pipeline"]
```

**Detected Type:** [ ] Expert | [ ] Pipeline | [ ] Hybrid

---

## TIER 1: STRUCTURE (Pass/Fail - BLOCKING)

These are hard requirements. ANY failure = squad rejected.

### 1.1 Configuration

- [ ] `config.yaml` exists in squad root
- [ ] `config.yaml` is valid YAML (no parse errors)
- [ ] Required fields present: `name`, `version`, `description`, `entry_agent`
- [ ] `name` uses kebab-case
- [ ] `version` follows semver (X.Y.Z)

### 1.2 Entry Point

- [ ] `entry_agent` references existing file in `agents/`
- [ ] Entry agent can be activated without errors
- [ ] Entry agent has `commands` section with at least `*help`

### 1.3 File References

- [ ] All files referenced in `config.yaml` dependencies exist
- [ ] All files referenced in agent `dependencies` sections exist
- [ ] No broken symlinks or missing imports

### 1.4 Directory Structure

- [ ] `agents/` directory exists (minimum 1 agent)
- [ ] `tasks/` directory exists if referenced
- [ ] `checklists/` directory exists if tasks are complex
- [ ] `data/` directory exists if referenced

### 1.5 Cross-Reference Validation (BLOCKING)

**Check that internal references are valid:**

```yaml
cross_reference_checks:
  - id: "XREF-001"
    name: "Handoff targets exist"
    check: "All handoff_to references point to existing agents"
    severity: BLOCKING

  - id: "XREF-002"
    name: "Task references valid"
    check: "All tasks referenced in agents/workflows exist in tasks/"
    severity: BLOCKING

  - id: "XREF-003"
    name: "Template references valid"
    check: "All templates referenced in tasks exist in templates/"
    severity: WARNING

  - id: "XREF-004"
    name: "Checklist references valid"
    check: "All checklists referenced in tasks exist in checklists/"
    severity: WARNING

  - id: "XREF-005"
    name: "Data file references valid"
    check: "All data files referenced in agents/tasks exist in data/"
    severity: WARNING
```

| Check | Status | Missing References |
|-------|--------|-------------------|
| Handoff targets | [ ] PASS [ ] FAIL | ___ |
| Task references | [ ] PASS [ ] FAIL | ___ |
| Template references | [ ] PASS [ ] WARN | ___ |
| Checklist references | [ ] PASS [ ] WARN | ___ |
| Data file references | [ ] PASS [ ] WARN | ___ |

### 1.6 Security Scan (BLOCKING)

**Check for accidentally exposed secrets and sensitive data.**

**Reference:** OWASP Secrets Management Cheat Sheet

#### Category 1: API Keys & Tokens (HIGH)

```yaml
api_key_checks:
  - id: "SEC-001"
    name: "No hardcoded API keys"
    pattern: "(api[_-]?key|apikey)\\s*[:=]\\s*['\"][^'\"]{20,}"
    examples:
      - "api_key: 'sk-1234567890abcdef1234567890'"
      - "apiKey = \"AIzaSyD-1234567890abcdef\""
    severity: BLOCKING

  - id: "SEC-002"
    name: "No hardcoded secrets/passwords"
    pattern: "(secret|password|passwd|pwd)\\s*[:=]\\s*['\"][^'\"]{8,}"
    examples:
      - "secret: 'mySecretPassword123'"
      - "password = \"admin123456\""
    severity: BLOCKING

  - id: "SEC-003"
    name: "No bearer/auth tokens"
    pattern: "(bearer|authorization|auth_token)\\s*[:=]\\s*['\"][^'\"]{20,}"
    examples:
      - "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    severity: BLOCKING

  - id: "SEC-004"
    name: "No JWT secrets"
    pattern: "(jwt[_-]?secret|signing[_-]?key)\\s*[:=]\\s*['\"][^'\"]{16,}"
    examples:
      - "jwt_secret: 'super-secret-key-here'"
    severity: BLOCKING
```

#### Category 2: Cloud Provider Credentials (HIGH)

```yaml
cloud_credential_checks:
  - id: "SEC-005"
    name: "No AWS Access Keys"
    pattern: "(AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}"
    examples:
      - "AKIAIOSFODNN7EXAMPLE"
    severity: BLOCKING

  - id: "SEC-006"
    name: "No AWS Secret Keys"
    pattern: "aws[_-]?secret[_-]?access[_-]?key\\s*[:=]\\s*['\"][^'\"]{40}"
    examples:
      - "aws_secret_access_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'"
    severity: BLOCKING

  - id: "SEC-007"
    name: "No GCP Service Account Keys"
    pattern: "\"type\":\\s*\"service_account\""
    file_patterns: ["*.json"]
    severity: BLOCKING

  - id: "SEC-008"
    name: "No Azure Connection Strings"
    pattern: "DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+"
    severity: BLOCKING
```

#### Category 3: Private Keys & Certificates (HIGH)

```yaml
private_key_checks:
  - id: "SEC-009"
    name: "No private keys"
    patterns:
      - "-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"
      - "-----BEGIN PGP PRIVATE KEY BLOCK-----"
    file_extensions: [".pem", ".key", ".p12", ".pfx"]
    severity: BLOCKING

  - id: "SEC-010"
    name: "No SSH private keys"
    file_patterns: ["id_rsa", "id_dsa", "id_ecdsa", "id_ed25519"]
    check: "Files without .pub extension"
    severity: BLOCKING
```

#### Category 4: Database & Connection Strings (HIGH)

```yaml
database_checks:
  - id: "SEC-011"
    name: "No database URLs with credentials"
    patterns:
      - "(postgres|mysql|mongodb|redis)://[^:]+:[^@]+@"
      - "Server=.*;Password=.*"
      - "jdbc:[^;]+password=[^;]+"
    examples:
      - "postgres://user:password@localhost:5432/db"
      - "mongodb://admin:secret@cluster.mongodb.net"
    severity: BLOCKING

  - id: "SEC-012"
    name: "No Supabase/Firebase keys in code"
    patterns:
      - "supabase[_-]?(service[_-]?role[_-]?)?key\\s*[:=]"
      - "firebase[_-]?admin[_-]?sdk"
    note: "Public anon keys are OK, service role keys are NOT"
    severity: BLOCKING
```

#### Category 5: Sensitive Files (BLOCKING)

```yaml
sensitive_file_checks:
  - id: "SEC-013"
    name: "No .env files"
    file_patterns:
      - ".env"
      - ".env.*"
      - "*.env"
    severity: BLOCKING

  - id: "SEC-014"
    name: "No credential files"
    file_patterns:
      - "credentials*.json"
      - "service-account*.json"
      - "*-credentials.json"
      - "secrets.yaml"
      - "secrets.yml"
    severity: BLOCKING

  - id: "SEC-015"
    name: "No key files"
    file_patterns:
      - "*.pem"
      - "*.key"
      - "*.p12"
      - "*.pfx"
      - "*.jks"
    severity: BLOCKING
```

#### Category 6: Code Vulnerabilities (WARNING)

```yaml
code_vulnerability_checks:
  - id: "SEC-016"
    name: "No eval() or exec()"
    pattern: "\\b(eval|exec)\\s*\\("
    language: ["python", "javascript", "ruby"]
    severity: WARNING
    note: "Review context - may be intentional"

  - id: "SEC-017"
    name: "No shell=True in subprocess"
    pattern: "subprocess\\.(call|run|Popen).*shell\\s*=\\s*True"
    language: ["python"]
    severity: WARNING

  - id: "SEC-018"
    name: "No SQL string concatenation"
    pattern: "(SELECT|INSERT|UPDATE|DELETE).*\\+.*\\$|f['\"].*SELECT"
    severity: WARNING
    note: "May indicate SQL injection risk"
```

#### Scan Commands

```bash
# Run all security checks
grep -rE "(api[_-]?key|secret|password|bearer|jwt)\\s*[:=]\\s*['\"][^'\"]{8,}" .
grep -rE "AKIA[A-Z0-9]{16}" .
grep -rE "(postgres|mysql|mongodb)://[^:]+:[^@]+@" .
grep -rE "-----BEGIN.*PRIVATE KEY-----" .
find . -name ".env*" -o -name "*.pem" -o -name "*.key" -o -name "credentials*.json"
```

#### Security Scan Results

| Category | Check IDs | Status | Findings |
|----------|-----------|--------|----------|
| API Keys & Tokens | SEC-001 to SEC-004 | [ ] PASS [ ] FAIL | ___ |
| Cloud Credentials | SEC-005 to SEC-008 | [ ] PASS [ ] FAIL | ___ |
| Private Keys | SEC-009 to SEC-010 | [ ] PASS [ ] FAIL | ___ |
| Database URLs | SEC-011 to SEC-012 | [ ] PASS [ ] FAIL | ___ |
| Sensitive Files | SEC-013 to SEC-015 | [ ] PASS [ ] FAIL | ___ |
| Code Vulnerabilities | SEC-016 to SEC-018 | [ ] PASS [ ] WARN | ___ |

#### False Positive Handling

```yaml
allowed_patterns:
  description: "Patterns that look like secrets but are OK"
  examples:
    - "api_key: \"{{API_KEY}}\"  # Placeholder"
    - "api_key: \"$API_KEY\"     # Environment variable"
    - "api_key: process.env.API_KEY  # Runtime lookup"
    - "password: \"********\"   # Masked"
    - "# Example: api_key = 'your-key-here'  # In comments"

  ignore_patterns:
    - "\\{\\{.*\\}\\}"  # Mustache/Jinja placeholders
    - "\\$[A-Z_]+"      # Shell variables
    - "process\\.env\\." # Node.js env
    - "os\\.environ"    # Python env
    - "ENV\\["          # Ruby env
```

**IMPORTANT:** Any BLOCKING security failure = immediate VETO (V5), regardless of other scores.

### Tier 1 Result

```
[ ] PASS - All structural requirements met
[ ] FAIL - Blocking issues found: _______________
```

---

## TIER 2: COVERAGE (Ratio Requirements - BLOCKING)

Minimum thresholds based on gold standard analysis.

### 2.1 Checklist Coverage for Complex Tasks

**Requirement:** Tasks with >500 lines SHOULD have associated checklist

```yaml
formula: checklists / tasks_over_500_lines >= 0.3 (30%)
```

| Count complex tasks (>500 lines) | ___ |
| Count checklists | ___ |
| Ratio | ___% |
| Status | [ ] PASS (>=30%) | [ ] FAIL |

### 2.2 Orphan Task Detection

**Requirement:** Zero orphan tasks (tasks not referenced by any agent or workflow)

```yaml
check: |
  For each task in tasks/:
    - Is it referenced in an agent's commands/dependencies?
    - Is it referenced in a workflow?
    - If neither: ORPHAN
```

| Total tasks | ___ |
| Orphan tasks | ___ |
| Status | [ ] PASS (0 orphans) | [ ] WARN (1-2) | [ ] FAIL (3+) |

**List orphans:** _______________

### 2.3 Pipeline Phase Coverage (Pipeline squads only)

**Requirement:** All workflow phases have assigned tasks

```yaml
check: |
  For each phase in workflow:
    - Does phase.task reference existing file?
    - Does phase have defined output?
```

| Total phases | ___ |
| Phases with tasks | ___ |
| Coverage | ___% |
| Status | [ ] PASS (100%) | [ ] FAIL |

### 2.4 Data File Usage

**Requirement:** At least 50% of data files should be referenced

```yaml
check: |
  For each file in data/:
    - Is it referenced by any task or agent?
    - If not: UNUSED
```

| Total data files | ___ |
| Referenced files | ___ |
| Usage ratio | ___% |
| Status | [ ] PASS (>=50%) | [ ] WARN (<50%) |

**Unused files:** _______________

### Tier 2 Result

```
[ ] PASS - All coverage requirements met
[ ] FAIL - Coverage issues: _______________
```

---

## TIER 3: QUALITY (Weighted Scoring - 80% of final)

Score each dimension 0-10, then apply weights.

### 3.1 Prompt Quality (25%)

**Question:** "Are task prompts specific, actionable, and reproducible?"

#### Evaluation Criteria

| Criterion | Points | Evidence |
|-----------|--------|----------|
| Has explicit input/output examples | 0-3 | ___ |
| Has anti-patterns section | 0-2 | ___ |
| Has measurable success criteria | 0-2 | ___ |
| Instructions are step-by-step | 0-2 | ___ |
| No vague language ("verify", "ensure") | 0-1 | ___ |

#### Sampling Method

Evaluate 3 representative tasks:
1. Most complex task (highest lines): _______________
2. Entry/main task: _______________
3. Random task: _______________

| Task | Examples | Anti-patterns | Success Criteria | Steps | Clarity | Total |
|------|----------|---------------|------------------|-------|---------|-------|
| ___ | /3 | /2 | /2 | /2 | /1 | /10 |
| ___ | /3 | /2 | /2 | /2 | /1 | /10 |
| ___ | /3 | /2 | /2 | /2 | /1 | /10 |

**Prompt Quality Score:** ___ / 10

### 3.2 Pipeline Coherence (25%)

**Question:** "Does data flow correctly between phases/tasks?"

#### Evaluation Criteria

| Criterion | Points | Evidence |
|-----------|--------|----------|
| Phase N output = Phase N+1 input | 0-3 | ___ |
| No sequence collisions | 0-2 | ___ |
| Checkpoints at critical gates | 0-2 | ___ |
| Failure handling defined | 0-2 | ___ |
| Dependencies explicit | 0-1 | ___ |

#### Coherence Checks

```yaml
check_output_input_chain:
  - "Does task A's output field match task B's input field?"
  - "Are file paths consistent across phases?"

check_sequence_collisions:
  - "Do any tasks share the same sequence number?"
  - "Is execution order unambiguous?"

check_checkpoints:
  - "Are there human_review points for critical decisions?"
  - "Are there quality gates before final output?"
```

| Check | Status | Notes |
|-------|--------|-------|
| Output→Input chain valid | [ ] Yes [ ] No | ___ |
| No sequence collisions | [ ] Yes [ ] No | ___ |
| Checkpoints present | [ ] Yes [ ] No | ___ |
| Failure handling defined | [ ] Yes [ ] No | ___ |

**Pipeline Coherence Score:** ___ / 10

### 3.3 Checklist Actionability (25%)

**Question:** "Are checklists measurable and actionable?"

#### Evaluation Criteria

| Criterion | Points | Evidence |
|-----------|--------|----------|
| Items are measurable (not "verify X") | 0-3 | ___ |
| Has scoring/grading system | 0-2 | ___ |
| Has pass/fail thresholds | 0-2 | ___ |
| Has auto-correction guidance | 0-2 | ___ |
| Covers edge cases | 0-1 | ___ |

#### Actionability Tests

For each checklist item, ask:
1. "Can I answer this with YES/NO without interpretation?"
2. "Is there a specific threshold (number, percentage)?"
3. "If I fail, do I know what to fix?"

#### Bad vs Good Examples

```yaml
bad_checklist_items:
  - "Verify quality is good"  # Subjective
  - "Ensure completeness"  # Vague
  - "Check for errors"  # No threshold

good_checklist_items:
  - "Score >= 85 on quality rubric"  # Measurable
  - "All 8 required fields present"  # Specific
  - "Zero critical errors (see error-types.md)"  # Defined
```

| Checklist | Measurable | Scoring | Thresholds | Correction | Total |
|-----------|------------|---------|------------|------------|-------|
| ___ | /3 | /2 | /2 | /2 | /10 |
| ___ | /3 | /2 | /2 | /2 | /10 |

**Checklist Actionability Score:** ___ / 10

### 3.4 Documentation Completeness (25%)

**Question:** "Can a new user understand and use this squad?"

#### Evaluation Criteria

| Criterion | Points | Evidence |
|-----------|--------|----------|
| README explains purpose clearly | 0-2 | ___ |
| Getting started guide present | 0-2 | ___ |
| Commands documented with examples | 0-2 | ___ |
| Architecture/flow diagram present | 0-1 | ___ |
| Changelog maintained | 0-1 | ___ |
| Error handling documented | 0-1 | ___ |
| Dependencies listed | 0-1 | ___ |

**Documentation Score:** ___ / 10

### Tier 3 Calculation

```yaml
tier_3_score:
  prompt_quality: ___ × 0.25 = ___
  pipeline_coherence: ___ × 0.25 = ___
  checklist_actionability: ___ × 0.25 = ___
  documentation: ___ × 0.25 = ___
  total: ___ / 10
```

---

## TIER 4: CONTEXTUAL VALIDATION (20% of final)

Requirements vary by squad type. Only complete the relevant section.

### 4A. Expert Squad Validation

**Applies to:** Squads with multiple distinct agent personas (Copy, Storytelling, Legal)

#### 4A.1 Voice DNA (REQUIRED for Expert)

- [ ] Each agent has `voice_dna` section
- [ ] `sentence_starters` defined (by context: diagnosis, teaching, correction)
- [ ] `metaphors` defined with usage guidance
- [ ] `vocabulary.always_use` has 5+ terms
- [ ] `vocabulary.never_use` has 3+ terms

| Agent | voice_dna | starters | metaphors | vocab | Score |
|-------|-----------|----------|-----------|-------|-------|
| ___ | [ ] | [ ] | [ ] | [ ] | /4 |
| ___ | [ ] | [ ] | [ ] | [ ] | /4 |
| ___ | [ ] | [ ] | [ ] | [ ] | /4 |

#### 4A.2 Objection Algorithms (REQUIRED for Expert)

- [ ] Each agent has `objection_algorithms` section
- [ ] Minimum 3 objections per agent
- [ ] Each objection has: trigger, diagnosis, response
- [ ] Responses are domain-specific (not generic)

| Agent | Has section | Count | Quality | Score |
|-------|-------------|-------|---------|-------|
| ___ | [ ] | ___ | /5 | /10 |
| ___ | [ ] | ___ | /5 | /10 |

#### 4A.3 Output Examples (REQUIRED for Expert)

- [ ] Each agent has 3+ concrete output examples
- [ ] Examples show input → output transformation
- [ ] Examples are realistic (not placeholder)

#### 4A.4 Tier Organization

- [ ] Tier 0 (Diagnosis) agents exist
- [ ] Tier assignments documented
- [ ] Orchestrator/Chief agent defined

**Expert Squad Score:** ___ / 10

---

### 4B. Pipeline Squad Validation

**Applies to:** Sequential phase orchestration squads (Books, MMOS)

#### 4B.1 Workflow Definition (REQUIRED for Pipeline)

- [ ] Workflow file exists (`.yaml` or defined in orchestrator)
- [ ] Phases are numbered sequentially
- [ ] Each phase has: name, task, description, outputs
- [ ] Phase dependencies explicit

| Phase | Task exists | Output defined | Dependencies | Score |
|-------|-------------|----------------|--------------|-------|
| 0 | [ ] | [ ] | [ ] | /3 |
| 1 | [ ] | [ ] | [ ] | /3 |
| ... | [ ] | [ ] | [ ] | /3 |

#### 4B.2 Phase Checkpoints (REQUIRED for Pipeline)

- [ ] Critical phases have `human_review` or `checkpoint`
- [ ] Quality gates defined (blocker phases)
- [ ] Rework rules specified (what happens on failure)

| Checkpoint | Phase | Type | Rework rule | Score |
|------------|-------|------|-------------|-------|
| ___ | ___ | [ ] human [ ] auto | [ ] Yes | /3 |
| ___ | ___ | [ ] human [ ] auto | [ ] Yes | /3 |

#### 4B.3 Orchestrator Completeness

- [ ] Orchestrator has all phases documented
- [ ] Commands map to tasks
- [ ] Status tracking capability
- [ ] Batch processing (if applicable)

#### 4B.4 Intermediate Outputs

- [ ] Each phase produces trackable output
- [ ] Output paths are consistent
- [ ] Intermediate files can be inspected

#### 4B.5 Automation Script (Large Pipelines - 8+ phases)

**Applies to:** Pipeline squads with 8+ phases or complex multi-step workflows

**Requirement:** Large pipelines SHOULD have a YOLO mode script for autonomous execution.

**What is YOLO Mode?**
A bash script that can execute the entire pipeline autonomously, without human intervention, while maintaining state and allowing resume on failure.

**Required Features:**

| Feature | Description | Check |
|---------|-------------|-------|
| Script exists | `scripts/{squad}.sh` or similar | [ ] |
| Input params | Accepts target/slug as argument | [ ] |
| Help docs | `--help` flag with usage examples | [ ] |
| State mgmt | Persists state to JSON/YAML file | [ ] |
| Progress | Shows current phase/status | [ ] |
| Logging | Writes to `logs/` directory | [ ] |
| Resume | Can continue from last checkpoint | [ ] |

**Optional but Recommended:**

| Feature | Description | Check |
|---------|-------------|-------|
| Metrics | Collects execution metrics (JSONL) | [ ] |
| Parallel exec | Runs independent phases in parallel | [ ] |
| A/B testing | Can compare model outputs | [ ] |
| Dashboard | Visual progress display | [ ] |

**Automation Script Checklist:**

```yaml
script_validation:
  location: "scripts/{name}.sh"
  minimum_features: 5  # of 7 required

  checks:
    - id: "AUTO-001"
      check: "Script accepts positional arguments"
      pattern: '$1, $2, ${1:-default}'

    - id: "AUTO-002"
      check: "Has --help documentation"
      pattern: '--help | -h | show_help'

    - id: "AUTO-003"
      check: "Creates/reads state file"
      pattern: 'state.json | STATE_FILE'

    - id: "AUTO-004"
      check: "Shows progress during execution"
      pattern: 'echo | printf | tput'

    - id: "AUTO-005"
      check: "Logs to file"
      pattern: 'LOG_FILE | tee | >> *.log'

    - id: "AUTO-006"
      check: "Can resume from failure"
      pattern: 'brownfield | resume | continue'

    - id: "AUTO-007"
      check: "Handles errors gracefully"
      pattern: 'set -e | trap | || true'
```

**Scoring:**

| Features Present | Score |
|------------------|-------|
| 7/7 required | 10/10 |
| 6/7 required | 8/10 |
| 5/7 required | 7/10 (minimum pass) |
| <5 required | FAIL |

**Note:** If pipeline has <8 phases, this section is OPTIONAL (nice-to-have).

**Automation Score:** ___ / 10

**Pipeline Squad Score:** ___ / 10

---

### 4C. Hybrid Squad Validation

**Applies to:** Process automation with heuristics (HybridOps)

#### 4C.1 Persona Profile (REQUIRED for Hybrid)

- [ ] Each agent has `persona_profile` section
- [ ] Archetype defined
- [ ] Communication style documented
- [ ] Greeting levels present

#### 4C.2 Behavioral States (REQUIRED for Hybrid)

- [ ] Agents define operational modes
- [ ] Triggers for mode transitions documented
- [ ] Output format per mode specified

#### 4C.3 Heuristic Validation (REQUIRED for Hybrid)

- [ ] Heuristics defined with IDs (e.g., PV_*, SC_*)
- [ ] Each heuristic has: trigger, evaluation, threshold
- [ ] VETO conditions explicit
- [ ] Fallback behavior defined

| Heuristic | ID | Threshold | VETO power | Score |
|-----------|-----|-----------|------------|-------|
| ___ | ___ | ___ | [ ] | /5 |
| ___ | ___ | ___ | [ ] | /5 |

#### 4C.4 Process Standards

- [ ] Task Anatomy (8 fields) enforced
- [ ] BPMN or equivalent notation used
- [ ] Integration points documented

**Hybrid Squad Score:** ___ / 10

---

## TIER 4 RESULT

**Squad Type:** [ ] Expert | [ ] Pipeline | [ ] Hybrid

**Contextual Score:** ___ / 10

---

## VETO CONDITIONS

These conditions **override scores** and force rejection:

### Universal Vetos (All Squad Types)

- [ ] **V1:** No entry agent defined
- [ ] **V2:** Entry agent cannot activate
- [ ] **V3:** >20% of referenced files missing
- [ ] **V4:** config.yaml invalid
- [ ] **V5:** Security issue detected (secrets, API keys, credentials)
- [ ] **V6:** Critical cross-reference broken (handoff to non-existent agent)

### Expert Squad Vetos

- [ ] **VE1:** Zero agents with voice_dna
- [ ] **VE2:** No Tier 0 (diagnosis) capability

### Pipeline Squad Vetos

- [ ] **VP1:** Workflow has sequence collisions
- [ ] **VP2:** Phase outputs don't connect to inputs
- [ ] **VP3:** No quality gate before final output

### Hybrid Squad Vetos

- [ ] **VH1:** No heuristic validation defined
- [ ] **VH2:** Missing fallback behavior

**Veto Triggered:** [ ] None | [ ] V___: _______________

---

## FINAL SCORE CALCULATION

```yaml
calculation:
  tier_1: PASS | FAIL  # Blocking
  tier_2: PASS | FAIL  # Blocking

  tier_3_weighted:
    prompt_quality: ___ × 0.25 = ___
    pipeline_coherence: ___ × 0.25 = ___
    checklist_actionability: ___ × 0.25 = ___
    documentation: ___ × 0.25 = ___
    subtotal: ___

  tier_4_contextual: ___

  final_score: (tier_3 × 0.80) + (tier_4 × 0.20) = ___

  thresholds:
    pass: 7.0
    excellence: 9.0

  veto_override: [ ] None | [ ] Triggered
```

---

## VALIDATION SUMMARY

| Tier | Status | Score/Notes |
|------|--------|-------------|
| 1. Structure | [ ] PASS [ ] FAIL | ___ |
| 2. Coverage | [ ] PASS [ ] FAIL | ___ |
| 3. Quality | ___ / 10 | ___ |
| 4. Contextual | ___ / 10 | ___ |
| **Final** | ___ / 10 | ___ |

### Result

```
[ ] PASS (>= 7.0, no vetos)
[ ] CONDITIONAL PASS (>= 7.0, minor issues)
[ ] FAIL (< 7.0 or veto triggered)
```

### Issues Found

| Priority | Issue | Recommendation |
|----------|-------|----------------|
| CRITICAL | ___ | ___ |
| HIGH | ___ | ___ |
| MEDIUM | ___ | ___ |

### Strengths

1. ___
2. ___
3. ___

---

## SIGN-OFF

```yaml
validator: _______________
date: _______________
squad: _______________
version: _______________
type: [ ] Expert | [ ] Pipeline | [ ] Hybrid
final_score: ___ / 10
result: [ ] PASS | [ ] CONDITIONAL | [ ] FAIL
```

---

## APPENDIX A: GOLD STANDARD BENCHMARKS

Based on analysis of Copy, MMOS, HybridOps, Books squads.

### File Count Benchmarks

| Type | Agents | Tasks | Checklists | Templates |
|------|--------|-------|------------|-----------|
| Expert (Copy) | 22 | 73 | 31 | 30 |
| Pipeline (MMOS) | 9 | 76 | 17 | 63 |
| Pipeline (Books) | 1 | 19 | 2 | 1 |
| Hybrid (HybridOps) | 9 | 12 | 1 | 2 |

### Line Count Benchmarks

| Component | Minimum | Good | Excellent |
|-----------|---------|------|-----------|
| Expert Agent | 300 | 800 | 1200+ |
| Orchestrator Agent | 300 | 500 | 700+ |
| Complex Task | 300 | 500 | 800+ |
| Simple Task | 100 | 200 | 300+ |
| Checklist | 100 | 300 | 500+ |

### Ratio Benchmarks

| Ratio | Expert | Pipeline | Hybrid |
|-------|--------|----------|--------|
| Agent:Task | 1:3-4 | 1:5-10 | 1:1-2 |
| Checklist:ComplexTask | 40%+ | 20%+ | 10%+ |
| Data file usage | 80%+ | 60%+ | 80%+ |

---

## APPENDIX B: COMMON ISSUES & FIXES

### Pipeline Coherence Issues

| Issue | Detection | Fix |
|-------|-----------|-----|
| Orphan task | Not in workflow or agent | Add to workflow or remove |
| Sequence collision | Multiple tasks same number | Renumber sequentially |
| Output/input mismatch | Phase N output ≠ Phase N+1 input | Align file paths/formats |
| Missing checkpoint | No validation before final | Add quality gate |

### Prompt Quality Issues

| Issue | Detection | Fix |
|-------|-----------|-----|
| Vague instructions | "Ensure quality" | Add specific criteria |
| No examples | No input/output samples | Add 2-3 concrete examples |
| No anti-patterns | Missing "don't do" | Add 5+ anti-patterns |
| No success criteria | No measurable outcome | Add threshold/checklist |

### Checklist Issues

| Issue | Detection | Fix |
|-------|-----------|-----|
| Subjective items | "Verify good quality" | Make measurable |
| No scoring | Just checkboxes | Add point system |
| No correction | Items fail, now what? | Add fix guidance |

---

## CHANGELOG

```yaml
v3.0.0 (2026-02-01):
  - Complete rewrite based on gold standard analysis
  - Added squad type detection (Expert/Pipeline/Hybrid)
  - Added 4-tier validation system
  - Made voice_dna/objection_algorithms contextual (Expert only)
  - Added prompt quality evaluation
  - Added pipeline coherence checks
  - Added checklist actionability scoring
  - Added coverage ratio requirements
  - Added veto conditions by squad type
  - Added benchmarks from Copy, MMOS, HybridOps, Books

v2.0.0 (2026-01-15):
  - Added 80/20 qualitative/quantitative scoring
  - Added quality dimensions

v1.0.0 (2025-12-01):
  - Initial checklist
```

---

_Squad Validation Checklist v3.0_
_Based on: Copy (110k lines), MMOS (15k lines), HybridOps (5k lines), Books (8k lines)_
_Compatible with: AIOS-FULLSTACK v5+_
