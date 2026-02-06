---
task: Extract SOP from Transcript
responsavel: "@sop-extractor"
responsavel_type: agent
atomic_layer: task
elicit: true
phase: discovery

# Dependencies
templates:
  - pop-extractor-prompt
config:
  - squad-config
---

# Extract SOP from Transcript

**Squad:** squad-creator
**Phase:** Discovery
**Agent:** @sop-extractor
**Pattern:** SC-PE-001 (SOP Extraction Standard)

## Purpose

Extract a complete, AIOS-ready Standard Operating Procedure (SOP) from a meeting transcript where someone explained a business process. The output is structured to enable immediate squad creation for hybrid automation.

## Task Anatomy (HO-TP-001)

| Field | Value |
|-------|-------|
| task_name | Extract SOP from Transcript |
| status | pending |
| responsible_executor | @sop-extractor |
| execution_type | Hybrid (Agent extracts, Human validates) |
| estimated_time | 1-2h per process |
| input | transcript, domain_context |
| output | sop_document, squad_blueprint, gap_report |
| action_items | See Execution section |
| acceptance_criteria | All 11 parts completed, gaps documented |

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| transcript | text/file | Yes | Meeting transcript (text, audio transcription, or video transcript) |
| domain_context | string | No | Business domain/area for terminology context |
| existing_docs | file[] | No | Current SOPs, manuals, or process docs |
| process_owner | string | No | Who to validate extracted SOP with |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| sop_document | MD | Complete SOP following SC-PE-001 template |
| squad_blueprint | YAML | Ready-to-use squad structure (Part 8) |
| gap_report | MD | Missing information and clarifying questions |
| automation_analysis | MD | Summary of automation potential (Part 7) |

## Execution

### Step 0: Fetch Transcript (Data Source Resolution)

1. Load configuration from `config/squad-config.yaml`
2. Read `data_sources.transcripts.active_source`
3. Fetch transcript based on source type:

**Source Resolution:**

```yaml
# Read active_source from squad-config.yaml
active_source: {{squad_config.data_sources.transcripts.active_source}}

# Execute appropriate fetch
if active_source == "supabase":
  - Connect using env vars from squad_config.data_sources.transcripts.sources.supabase.connection
  - Execute query from squad_config.data_sources.transcripts.sources.supabase.query
  - Map fields using field_mapping

elif active_source == "local_file":
  - Read from squad_config.data_sources.transcripts.sources.local_file.config.base_path
  - Parse based on file extension
  - Map fields if JSON

elif active_source == "api":
  - Call endpoint from squad_config.data_sources.transcripts.sources.api.endpoints.get
  - Parse response using data_path
  - Map fields

elif active_source == "direct":
  - Use transcript passed as input parameter
```

**Output:** Transcript object with standard schema:
```yaml
transcript:
  transcript_id: string
  transcript_content: string
  transcript_source: string (optional)
  transcript_url: string (optional)
  transcript_duration: number (optional)
  transcript_participants: array (optional)
  transcript_date: date (optional)
  transcript_language: string (optional)
  transcript_metadata: object (optional)
```

**Elicit if source not configured:**
```
Which transcript source should I use?
1. Supabase database (default)
2. Local file (provide path)
3. External API (requires config)
4. Direct input (paste transcript)
```

---

### Step 1: Transcript Preparation

1. Validate transcript was fetched successfully
2. Identify language and normalize if needed
3. Mark timestamps or speaker changes
4. Identify main process explainer
5. Apply chunking if transcript exceeds `max_tokens_per_chunk`

**Elicit if unclear:**
```
What is the business domain of this process?
Who is the process owner to validate with?
Are there existing documents to cross-reference?
```

### Step 2: First Pass - Structure Identification

1. Identify process name and objective
2. List all mentioned steps (even informal)
3. Note all people/roles mentioned
4. Capture all tools/systems referenced
5. Mark decision points ("if", "when", "depends")

**Output:** Raw extraction notes

### Step 3: Second Pass - Task Anatomy Mapping

For each identified step, extract:

```yaml
step_template:
  task_name: "[Verb] + [Object]"
  responsible_executor: "[Role or @agent]"
  execution_type: "Human | Agent | Hybrid | Worker"
  estimated_time: "[Xh/Xm]"
  input: ["list of inputs"]
  output: ["list of outputs"]
  action_items: ["atomic steps"]
  acceptance_criteria: ["how to verify success"]
```

**Classification Guide:**

| Cognitive Signal | Executor Type |
|------------------|---------------|
| "I look at...", "I check..." | Agent (perception) |
| "I decide based on...", "It depends..." | Hybrid (judgment) |
| "I talk to...", "I convince..." | Human (relationship) |
| "I copy...", "I move...", "I send..." | Worker (deterministic) |

### Step 4: Third Pass - Decision Rules Extraction

For each "depends", "usually", "sometimes":

1. Identify the condition
2. Identify possible outcomes
3. Translate to IF/THEN rule
4. Mark if automatable or requires human judgment

**Output:** Decision rules table + heuristics list

### Step 5: Automation Analysis (PV_PM_001)

For each step, evaluate:

| Criterion | Question |
|-----------|----------|
| Frequency | How often? (>4x/mo = high) |
| Impact | What if it fails? (business impact) |
| Automatability | Can code/AI do it? (determinism level) |
| Guardrails | Can we add safeguards? (required for automation) |

**Apply Decision Matrix:**
- AUTOMATE: High freq + High impact + High auto + Has guardrails
- DELEGATE: High freq + High impact + Low auto
- KEEP_MANUAL: Low freq + High impact
- ELIMINATE: Low freq + Low impact
- VETO: No guardrails possible

### Step 6: Quality Assessment (META-AXIOMAS)

Score the process on 10 dimensions (0-10):

1. Truthfulness - Is the process described accurately?
2. Coherence - Do steps align logically?
3. Strategic Alignment - Does it serve business goals?
4. Operational Excellence - Is it efficient?
5. Innovation Capacity - Can it evolve?
6. Risk Management - Are risks addressed?
7. Resource Optimization - Is it lean?
8. Stakeholder Value - Does it serve users?
9. Sustainability - Is it maintainable?
10. Adaptability - Can it handle change?

**Threshold:** Overall ≥7.0 to proceed

### Step 7: Squad Blueprint Generation

Based on extracted data, generate:

1. **Agents needed** - One per major responsibility
2. **Tasks to create** - One per workflow phase
3. **Checkpoints** - Where human validation required
4. **Guardrails** - Required safeguards per task
5. **Workflow YAML** - Orchestration definition

### Step 8: Gap Analysis

Document all:

1. **Missing information** - What wasn't explained
2. **Ambiguities** - Multiple interpretations possible
3. **Assumptions** - What was inferred (mark [INFERRED])
4. **Red flags** - Single points of failure, undocumented exceptions

**Output:** Gap report with clarifying questions

### Step 9: Document Assembly

Assemble final SOP using template `pop-extractor-prompt.md`:

1. Fill all 11 parts
2. Generate Mermaid diagrams
3. Complete all tables
4. Add glossary terms
5. Set metadata

## Validation

**Validation Type:** Human review required

**Validation Checklist:**

- [ ] All 11 parts of SC-PE-001 completed
- [ ] Task Anatomy (8 fields) for each step
- [ ] Executor type assigned to each step
- [ ] Decision rules extracted as IF/THEN
- [ ] Automation analysis completed (PV_PM_001)
- [ ] META-AXIOMAS score ≥7.0
- [ ] Squad blueprint generated
- [ ] Gaps documented with questions
- [ ] No [INFERRED] items left unvalidated

**Quality Gate:**

| Criterion | Threshold | Action if Failed |
|-----------|-----------|------------------|
| Parts completed | 11/11 | Block until complete |
| Steps with Task Anatomy | 100% | Block until complete |
| Gaps documented | All listed | Review with process owner |
| META-AXIOMAS score | ≥7.0 | Review weak dimensions |

## Handoff

```yaml
handoff:
  to: "create-squad"
  trigger: "sop_validated = true"
  data_transferred:
    - sop_document
    - squad_blueprint
    - gap_report
  validation: "Process owner confirms accuracy"
```

## Tools

| Tool | Purpose |
|------|---------|
| Transcript parser | Extract text from audio/video |
| Mermaid | Generate flow diagrams |
| YAML validator | Validate squad blueprint |

## Templates

- `pop-extractor-prompt.md` - SOP extraction template (SC-PE-001)

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Incomplete transcript | Audio quality, speaker overlap | Request clarification from process owner |
| Conflicting information | Multiple speakers disagree | Document both versions, flag for validation |
| Missing steps | Tacit knowledge not verbalized | Add to gaps, schedule follow-up interview |
| Unclear executor | Role not specified | Default to Hybrid, flag for validation |

## Examples

**Good transcript signals:**
- "First, I do X, then Y, then Z" → Clear sequence
- "If the client says no, I do A, otherwise B" → Decision rule
- "I always check this before proceeding" → Precondition
- "This takes about 30 minutes" → Time estimate

**Red flag signals:**
- "It depends" (without criteria) → Needs clarification
- "João knows how to do this" → Single point of failure
- "We figure it out" → Undocumented exception
- "It's always been this way" → May be obsolete

---

**Pattern Compliance:** SC-PE-001 ✓ | HO-TP-001 ✓ | HO-TP-002 ✓
