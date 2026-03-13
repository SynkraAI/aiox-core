# Task: Create Squad from DNA Files

**Agent:** oalanicolas (Mind Cloning Architect)
**Type:** Integration Task
**Duration:** 1-2h
**Version:** 1.0.0

---

## Purpose

Generate a complete squad (agents, tasks, workflows, data, checklists, templates) using DNA files as the personality and cognitive foundation.

This task bridges **Mind Cloning** (DNA extraction) with **Squad Creator** (orchestration).

---

## Input

### Required
```yaml
mind_slug: string           # e.g., "tim_ferriss", "naval_ravikant"
dna_path: string            # Path to DNA files directory
```

### Optional
```yaml
expert_name: string         # Full name (auto-derived if not provided)
domain: string              # Primary domain of expertise
specialist_count: number    # Number of specialist agents (default: 5-8)
```

### DNA Files Expected
```
{dna_path}/
├── voice_dna.yaml          # REQUIRED - Voice DNA from Mind Cloning
├── thinking_dna.yaml       # REQUIRED - Thinking DNA from Mind Cloning
└── mind_dna_complete.yaml  # REQUIRED - Synthesized complete DNA
```

---

## Process

### STEP 1: Load and Validate DNA Files

```yaml
validation:
  - Check all 3 DNA files exist
  - Verify DNA Mental 8-layer coverage >= 6/8
  - Confirm fidelity_percentage >= 85% for Premium squads
  - Extract identity_statement for squad theme
```

**Script:**
```javascript
const fs = require('fs');
const yaml = require('js-yaml');

const voiceDNA = yaml.load(fs.readFileSync(`${dnaPath}/voice_dna.yaml`));
const thinkingDNA = yaml.load(fs.readFileSync(`${dnaPath}/thinking_dna.yaml`));
const completeDNA = yaml.load(fs.readFileSync(`${dnaPath}/mind_dna_complete.yaml`));

// Validate coverage
if (completeDNA.dna_mental_coverage.layers_covered < 6) {
  throw new Error('Insufficient DNA coverage. Need 6/8 layers minimum.');
}
```

---

### STEP 2: Determine Squad Architecture

Based on domain and DNA, decide specialist structure:

#### Example: Tim Ferriss (Productivity/Meta-Learning)
```yaml
specialists:
  - id: chief
    role: "Master orchestrator"
    dna_focus: [thinking.frameworks, voice.tone]

  - id: productivity
    role: "4-Hour Workweek specialist"
    dna_focus: [thinking.frameworks.DEAL, thinking.heuristics.elimination]

  - id: meta-learning
    role: "DiSSS framework specialist"
    dna_focus: [thinking.frameworks.DiSSS, thinking.decision_architecture]

  - id: health
    role: "4-Hour Body specialist"
    dna_focus: [thinking.recognition_patterns, thinking.anti_patterns]

  - id: interviewing
    role: "Podcast/interview specialist"
    dna_focus: [voice.storytelling, voice.tone.by_context]

  - id: business
    role: "Startup/business specialist"
    dna_focus: [thinking.frameworks.startup, thinking.heuristics.decision]
```

#### Heuristic for Specialist Count
```
If frameworks.primary.length > 3:
  specialists = 5-8 (multi-domain expert)
Else:
  specialists = 3-5 (focused expert)
```

---

### STEP 3: Generate Agents (with DNA Embedded)

For each specialist, create agent markdown with DNA personality:

**Template Structure:**
```markdown
# {mind_slug}-{specialist_id}

## DNA Foundation (Auto-Generated from DNA Files)

voice_dna:
  vocabulary: {extract from voice_dna.vocabulary}
  signature_phrases: {extract from voice_dna.vocabulary.signature_phrases}
  tone: {extract from voice_dna.tone}
  storytelling: {extract from voice_dna.storytelling}
  immune_system: {extract from voice_dna.immune_system}

thinking_dna:
  frameworks: {extract relevant frameworks for this specialist}
  heuristics: {extract relevant heuristics}
  decision_architecture: {extract from thinking_dna.decision_architecture}
  anti_patterns: {extract from thinking_dna.anti_patterns}

## Persona
{Generate persona using DNA as source}

## Commands
{Generate commands based on frameworks}
```

**Example Output (tim-ferriss-productivity.md):**
```yaml
voice_dna:
  vocabulary:
    power_words: ["optimize", "eliminate", "automate", "liberate", "muse"]
    signature_phrases:
      - "What if the opposite were true?"
      - "Test everything, assume nothing"
    never_use: ["hustle", "grind", "balance"]

  tone:
    dimensions:
      directness: 8/10
      enthusiasm: 7/10
      formality: 3/10
    by_context:
      teaching: "Socratic + provocative"

thinking_dna:
  frameworks:
    primary:
      DEAL:
        description: "Define, Eliminate, Automate, Liberate"
        when_to_use: "Productivity optimization, time management"

  heuristics:
    decision:
      - "If it can be eliminated, eliminate it first"
      - "Automation before delegation"
      - "80/20 applies to everything"
```

---

### STEP 4: Generate Tasks (Framework-Based)

Map thinking DNA frameworks → executable tasks:

```yaml
task_generation_logic:
  for each framework in thinking_dna.frameworks:
    create_task:
      id: "execute-{framework.id}"
      name: "Execute {framework.name}"
      description: "{framework.description}"
      steps: {framework.steps or generate from description}
      validation: {framework.validation_criteria}
```

**Example: DEAL Framework → Task**
```markdown
# Task: Execute DEAL Framework

## Input
- Current situation description
- Time/resource constraints

## Steps
1. **Define:** What is the desired outcome?
2. **Eliminate:** What can be removed completely?
3. **Automate:** What can be systemized?
4. **Liberate:** What creates freedom?

## Output
- DEAL analysis document
- Action plan with prioritized steps

## DNA Source
- Framework: thinking_dna.frameworks.DEAL
- Heuristics: thinking_dna.heuristics.elimination_first
```

---

### STEP 5: Generate Workflows (Mental Model-Based)

Detect workflow patterns in thinking DNA and create orchestrations:

```yaml
workflow_detection:
  if thinking_dna.decision_architecture.pipeline exists:
    create workflow from pipeline steps

  if thinking_dna.frameworks has sequential steps:
    create workflow following framework sequence

  if voice_dna.storytelling.story_structure exists:
    create narrative-based workflow
```

**Example: Meta-Learning Workflow (DiSSS)**
```yaml
workflow:
  id: wf-meta-learning
  name: "DiSSS Meta-Learning Framework"
  phases:
    - id: deconstruction
      agent: tim-ferriss-meta-learning
      task: deconstruct-skill

    - id: selection
      agent: tim-ferriss-meta-learning
      task: select-20-percent
      depends_on: deconstruction

    - id: sequencing
      agent: tim-ferriss-meta-learning
      task: sequence-learning
      depends_on: selection

    - id: stakes
      agent: tim-ferriss-meta-learning
      task: create-stakes
      depends_on: sequencing
```

---

### STEP 6: Generate Data Files

Copy and adapt DNA files into squad data directory:

```yaml
data_files:
  - minds/{mind_slug}-voice-dna.yaml      # Copy from input
  - minds/{mind_slug}-thinking-dna.yaml   # Copy from input
  - minds/{mind_slug}-complete-dna.yaml   # Copy from input
  - frameworks/                           # Extract from thinking_dna.frameworks
  - case-library.yaml                     # Extract from voice_dna.storytelling.recurring_stories
  - source-index.yaml                     # Create based on dna metadata
```

---

### STEP 7: Generate Checklists

Create checklists from immune system and anti-patterns:

```yaml
checklist_generation:
  - From voice_dna.immune_system → validation checklists
  - From thinking_dna.anti_patterns → quality gates
  - From thinking_dna.frameworks → execution checklists
```

**Example:**
```markdown
# Checklist: DEAL Framework Validation

## Pre-Execution
- [ ] Situation clearly defined?
- [ ] All stakeholders identified?

## Elimination Phase
- [ ] Questioned "Could this be eliminated entirely?"
- [ ] Listed 3+ elimination options
- [ ] Checked anti-patterns: {thinking_dna.anti_patterns.never_do}

## Immune System Triggers
{voice_dna.immune_system.automatic_rejections}
```

---

### STEP 8: Generate Templates

Create output templates for common operations:

```yaml
templates:
  - experiment-template.yaml    # If "experiment" in thinking patterns
  - analysis-template.md        # Based on frameworks
  - decision-template.yaml      # From decision_architecture
```

---

### STEP 9: Create config.yaml

Generate squad configuration with DNA metadata:

```yaml
pack:
  name: {mind_slug}
  title: "{expert_name} Squad"
  version: "1.0.0"
  author: "AIOS Elite Mind Cloning Pipeline"
  description: "Squad created from DNA files with {fidelity_percentage}% fidelity"
  icon: "🧠"
  entry_agent: "{mind_slug}-chief"

dna_metadata:
  source: "Mind Cloning Squad"
  extraction_date: {completeDNA.metadata.extraction_date}
  fidelity_level: {completeDNA.metadata.fidelity_level}
  fidelity_percentage: {completeDNA.metadata.fidelity_percentage}
  dna_mental_coverage: {completeDNA.metadata.dna_mental_coverage}
  voice_score: {completeDNA.metadata.voice_score}
  thinking_score: {completeDNA.metadata.thinking_score}

agents:
  {generate from STEP 3}

mental_models:
  {extract from thinking_dna.frameworks}
```

---

### STEP 10: Generate README.md

Create comprehensive squad documentation:

```markdown
# {Expert Name} Squad

> {completeDNA.identity_statement}

## DNA Fidelity: {fidelity_percentage}%

## Specialists
{list all agents with their roles}

## Mental Models
{extract from thinking_dna.frameworks}

## Key Frameworks
{detailed framework documentation}

## Commands
{aggregate all agent commands}

## DNA Source
- Voice DNA Score: {voice_score}/10
- Thinking DNA Score: {thinking_score}/9
- DNA Mental Coverage: {layers_covered}/8

## Source Material
{extract from completeDNA or source_index if available}
```

---

## Output Structure

```
squads/{mind_slug}/
├── config.yaml
├── README.md
├── CHANGELOG.md
│
├── agents/
│   ├── {mind_slug}-chief.md
│   ├── {mind_slug}-{specialist1}.md
│   ├── {mind_slug}-{specialist2}.md
│   └── ...
│
├── tasks/
│   ├── execute-{framework1}.md
│   ├── execute-{framework2}.md
│   └── ...
│
├── workflows/
│   ├── wf-{primary-workflow}.yaml
│   └── ...
│
├── data/
│   ├── minds/
│   │   ├── {mind_slug}-voice-dna.yaml
│   │   ├── {mind_slug}-thinking-dna.yaml
│   │   └── {mind_slug}-complete-dna.yaml
│   ├── frameworks/
│   │   └── {framework-name}.md
│   ├── case-library.yaml
│   └── source-index.yaml
│
├── checklists/
│   ├── {framework}-checklist.md
│   └── immune-system-validation.md
│
└── templates/
    └── {domain}-template.yaml
```

---

## Validation Checklist

Before considering this task complete:

- [ ] All DNA files copied to squad data directory
- [ ] Minimum 3 specialist agents created (5+ recommended)
- [ ] Each agent has DNA sections (voice + thinking)
- [ ] Tasks generated for primary frameworks (min 3)
- [ ] At least 1 workflow created
- [ ] config.yaml includes DNA metadata
- [ ] README.md documents fidelity and coverage
- [ ] Checklists created from immune system
- [ ] Squad can be activated (`@{mind_slug}-chief`)

---

## Error Handling

### DNA Files Missing
```
ERROR: Required DNA file not found: {file}
ACTION: Verify dna_path is correct. Expected files:
  - voice_dna.yaml
  - thinking_dna.yaml
  - mind_dna_complete.yaml
```

### Insufficient Coverage
```
WARNING: DNA Mental coverage is {layers_covered}/8 (below recommended 6/8)
ACTION: Squad will be created but may have lower fidelity.
RECOMMENDATION: Run diagnose-clone and re-extract missing layers.
```

### Framework Parsing Error
```
ERROR: Failed to parse framework: {framework_name}
ACTION: Skipping framework. Will create basic task structure.
LOG: frameworks_skipped += 1
```

---

## Examples

### Example 1: Tim Ferriss
```bash
Input:
  mind_slug: "tim_ferriss"
  dna_path: "./squads/mind-cloning/minds/tim_ferriss/"
  domain: "productivity, meta-learning, lifestyle-design"

Output:
  squads/tim-ferriss/
    agents/ (6 specialists)
    tasks/ (12 tasks: DEAL, DiSSS, Fear-Setting, etc)
    workflows/ (3 workflows)
    data/minds/ (3 DNA files)
```

### Example 2: Naval Ravikant
```bash
Input:
  mind_slug: "naval_ravikant"
  dna_path: "./squads/mind-cloning/minds/naval_ravikant/"
  domain: "startups, philosophy, wealth"

Output:
  squads/naval-ravikant/
    agents/ (5 specialists)
    tasks/ (8 tasks: leverage, specific knowledge, etc)
    workflows/ (2 workflows)
    data/minds/ (3 DNA files)
```

---

## Integration with Pipeline

This task is **Phase 3** of the Elite Mind Cloning Pipeline:

```
Phase 0: Collect Sources
Phase 1a: Extract Voice DNA
Phase 1b: Extract Thinking DNA
Phase 2: Synthesize DNA
Phase 3: Create Squad from DNA ← THIS TASK
Phase 4: Discover Tools
Phase 5: Smoke Test
Phase 6: Refine (if needed)
```

---

## Related Files

- Workflow: `squads/squad-creator/workflows/wf-elite-mind-clone.yaml`
- Agent: `squads/squad-creator/agents/oalanicolas.md` (executor)
- Templates: `squads/mind-cloning/templates/*.yaml` (DNA structures)

---

*Created: 2026-02-12*
*Version: 1.0.0*
*Part of: Elite Mind Cloning Pipeline*
