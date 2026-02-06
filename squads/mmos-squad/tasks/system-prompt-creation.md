---
task-id: system-prompt-creation
name: System Prompt Compilation (Generalista & Specialists)
agent: system-prompt-architect
version: 1.0.0
purpose: Compile production-ready system prompts integrating all 8 cognitive layers for 94% fidelity

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Synthesis phase complete with all artifacts validated
  - cognitive-spec.yaml validated
  - Frameworks and KB chunks generated

inputs:
  - name: mind_name
    type: string
    required: true
  - name: mode
    type: enum
    required: true
    options: ["identity_core", "meta_axioms", "instructions_core", "generalista", "specialist", "operational_manual", "testing_protocol", "full"]
    default: "full"
  - name: cognitive_spec_path
    type: file_path
    required: true
  - name: synthesis_path
    type: directory_path
    required: true

outputs:
  - path: "squads/mmos-squad/minds/{mind_name}/system_prompts/generalista.md"
    description: Production-ready generalista system prompt
  - path: "squads/mmos-squad/minds/{mind_name}/system_prompts/specialists/"
    description: Specialist variant system prompts

dependencies:
  templates:
    - system-prompt-generalista.md
    - system-prompt-specialist.md
  checklists:
    - system-prompt-validation-checklist.md

validation:
  success-criteria:
    - "All 8 layers integrated into prompt"
    - "Contradiction handling rules defined"
    - "Signature phrases incorporated"
    - "Operational manual generated"

estimated-duration: "4-6 hours for full compilation"

mcp_integration:
  context7:
    usage: "Reference prompt engineering best practices"
    required: false
    tools:
      - mcp__docker-gateway__resolve-library-id
      - mcp__docker-gateway__get-library-docs
---

# System Prompt Creation Task

## MCP Integration: Context7 for Best Practices

**Optionally reference prompt engineering best practices:**

### Step 1: Resolve Library ID

```
mcp__docker-gateway__resolve-library-id
libraryName: "anthropic claude"
```

### Step 2: Get Relevant Documentation

```
mcp__docker-gateway__get-library-docs
context7CompatibleLibraryID: "{resolved_id}"
topic: "system prompts best practices"
tokens: 10000
```

**Use for:**
- System prompt structure patterns
- Persona consistency guidelines
- Guardrail implementation patterns

---

## Purpose

Compile complete production-ready system prompts (generalista and specialists) by integrating all 8 layers of cognitive architecture, synthesized frameworks, contradiction handling rules, and signature voice elements. This task transforms cognitive analysis and synthesis artifacts into executable AI personality prompts targeting 94% fidelity.

**Critical Output:** The system prompt is the final deliverable - everything else leads to this.

## When to Use This Task

**Use this task when:**
- Phase 4 (Synthesis) complete with all artifacts validated
- Ready to begin Phase 5 (Implementation) from execute-mmos-pipeline
- Need to generate generalista or specialist system prompts
- Creating operational manual and testing protocols

**Do NOT use this task when:**
- Synthesis not complete (finish synthesis-compilation first)
- Updating existing prompts (use brownfield-update)
- Only validating prompts (use mind-validation)
- **Target LLM**: Claude/GPT-4/other (for prompt optimization)
- **Context Window**: Token limit for prompt size
- **Specialist Name**: If creating specialist variant

### Mode Descriptions

**`identity_core`** - Compile absolute identity essence (who they are)
**`meta_axioms`** - Extract operating principles (how they operate)
**`instructions_core`** - Build fundamental instructions (what they do)
**`generalista`** - Compile complete general-purpose system prompt + **HUMAN CHECKPOINT**
**`specialist`** - Create specialist variant from generalista
**`operational_manual`** - Generate user guide for the mind clone
**`testing_protocol`** - Create QA and validation procedures
**`full`** - Execute complete implementation pipeline

## Key Activities & Instructions

### Mode: Identity Core

#### Objective

Distill the absolute essence of who they are into identity primitives.

**Identity Extraction:**
```yaml
identity_core_components:
  core_identity:
    - "Who are they at the most fundamental level?"
    - "What would remain if everything else was stripped away?"
    - "Source: Layer 7 obsessions, Layer 8 paradoxes"

  identity_anchors:
    - "Non-negotiable aspects of self"
    - "What they would never compromise"
    - "Source: Layer 6 values hierarchy"

  identity_expression:
    - "How identity manifests in behavior"
    - "Distinctive markers of 'them-ness'"
    - "Source: Layers 1-4 observable patterns"

  identity_evolution:
    - "How identity has developed"
    - "Core vs peripheral changes"
    - "Source: Temporal analysis"
```

**Compilation Process:**

1. **Extract from Layer 7** (Core Obsessions) - what drives them
2. **Extract from Layer 8** (Paradoxes) - complexity that defines them
3. **Extract from Layer 6** (Values) - what they stand for
4. **Synthesize into essence statement** (2-3 sentences)
5. **Expand into identity description** (1 paragraph)

**Output:** `minds/{mind}/artifacts/identity_core.yaml`

```yaml
identity_core:
  essence_statement: |
    {{2-3_sentence_distillation_of_who_they_are}}

  core_identity:
    primary: "{{fundamental_self_description}}"
    secondary: ["{{aspect_1}}", "{{aspect_2}}"]

  identity_anchors:
    non_negotiables: [{{what_they_wont_compromise}}]
    defining_characteristics: [{{distinctive_markers}}]

  identity_expression:
    behavioral: "{{how_identity_shows_in_actions}}"
    communicative: "{{how_identity_shows_in_voice}}"
    relational: "{{how_identity_shows_in_relationships}}"

  identity_paradoxes:
    - "{{Layer_8_paradox_that_defines_them}}"
    - "{{Layer_8_paradox_that_defines_them}}"

  prompt_integration:
    identity_block: |
      You are {{name}}, {{essence_statement}}

      Your core identity is defined by:
      - {{anchor_1}}
      - {{anchor_2}}
      [... etc ...]

      You embody these paradoxes:
      - {{paradox_1}}
      - {{paradox_2}}
```

### Mode: Meta Axioms

#### Objective

Extract operating principles that govern all behavior and decision-making.

**Axiom Categories:**
```yaml
meta_axiom_types:
  epistemic_axioms:
    - "How they know what they know"
    - "Truth and evidence standards"
    - "Source: Layer 5 mental models"

  ethical_axioms:
    - "Moral principles that guide action"
    - "Right vs wrong framework"
    - "Source: Layer 6 values"

  operational_axioms:
    - "How they approach work and problems"
    - "Effectiveness principles"
    - "Source: Layers 1, 3, 5"

  relational_axioms:
    - "How they engage with others"
    - "Collaboration and communication principles"
    - "Source: Layers 1, 2, 4"

  meta_cognitive_axioms:
    - "How they think about thinking"
    - "Learning and growth principles"
    - "Source: Layers 5, 7"
```

**Extraction Process:**

1. **Mine all layers** for stated principles
2. **Infer implicit axioms** from consistent patterns
3. **Validate across sources** (≥3 source confirmation)
4. **Prioritize** by centrality to their operation
5. **Format as prompt rules**

**Output:** `minds/{mind}/artifacts/meta_axioms.yaml`

```yaml
meta_axioms:
  epistemic:
    - axiom: "{{principle_about_knowledge}}"
      manifestation: "{{how_it_shows_in_behavior}}"
      prompt_rule: "Always {{instruction}}"

  ethical:
    [... same structure ...]

  operational:
    [... same structure ...]

  relational:
    [... same structure ...]

  meta_cognitive:
    [... same structure ...]

  axiom_conflicts:
    - conflict: "{{axiom_A}} vs {{axiom_B}}"
      resolution: "{{how_they_navigate}}"
      prompt_handling: "{{instruction}}"
```

### Mode: Instructions Core

#### Objective

Build fundamental behavioral instructions from cognitive architecture.

**Instruction Categories:**
```yaml
instruction_types:
  communication_instructions:
    - "How to communicate (from Layer 2)"
    - "Tone, style, structure rules"

  reasoning_instructions:
    - "How to think (from Layer 5)"
    - "Apply which mental models when"

  response_instructions:
    - "How to respond to different requests"
    - "Question types and appropriate responses"

  framework_instructions:
    - "When and how to apply frameworks"
    - "Step-by-step guidance"

  value_based_instructions:
    - "How to filter and prioritize (from Layer 6)"
    - "What to emphasize and avoid"

  paradox_instructions:
    - "How to navigate contradictions (from Layer 8)"
    - "Context-dependent responses"
```

**Compilation Process:**

1. **Extract communication rules** from templates and phrases
2. **Extract reasoning rules** from mental models
3. **Extract behavior rules** from patterns
4. **Extract value rules** from hierarchy
5. **Extract paradox rules** from contradictions synthesis
6. **Format as executable instructions**

**Output:** `minds/{mind}/artifacts/instructions_core.yaml`

```yaml
instructions_core:
  communication:
    style:
      - "{{instruction_1}}"
      - "{{instruction_2}}"

    structure:
      - "When explaining, use {{template}}"
      - "When arguing, follow {{pattern}}"

    phrases:
      - "Regularly use: [{{signature_phrases}}]"
      - "Avoid: [{{anti_patterns}}]"

  reasoning:
    mental_models:
      - "For {{situation}}, apply {{model}}"
      - "Default to {{primary_framework}}"

    decision_making:
      - "{{instruction_from_Layer_5}}"

  response_patterns:
    questions:
      - "For 'how' questions, {{approach}}"
      - "For 'why' questions, {{approach}}"

    requests:
      - "For advice, {{framework}}"
      - "For critique, {{approach}}"

  values_application:
    filters:
      - "Prioritize {{value_1}} over {{value_2}}"
      - "{{instruction_from_Layer_6}}"

  paradox_navigation:
    - paradox: "{{name}}"
      instruction: |
        When {{context_A}}, apply {{side_A}}
        When {{context_B}}, apply {{side_B}}

  meta_instructions:
    - "Always acknowledge limitations from LIMITATIONS.md"
    - "Stay in character as {{name}}"
    - "Reference sources when providing factual claims"
```

### Mode: Generalista (Complete System Prompt)

**This is the main compilation - integrates everything.**

#### Objective

Compile production-ready general-purpose system prompt with 94% fidelity target.

**System Prompt Structure:**
```markdown
# System Prompt Structure

## Section 1: Identity Block (from identity_core)
Who you are, essence statement, core characteristics

## Section 2: Operating Principles (from meta_axioms)
Fundamental axioms that govern behavior

## Section 3: Core Instructions (from instructions_core)
How to communicate, reason, respond

## Section 4: Frameworks (from frameworks_synthesized)
Actionable methodologies to apply

## Section 5: Knowledge Integration (from KB chunks)
How to access and apply knowledge base

## Section 6: Paradox Handling (from contradictions_synthesized)
Context-dependent contradiction navigation

## Section 7: Limitations & Boundaries (from LIMITATIONS.md)
Known constraints and gaps

## Section 8: Meta-Cognitive Instructions
Self-awareness and adaptation rules
```

**Compilation Process:**

1. **Assemble identity block** from identity_core.yaml
2. **Integrate meta axioms** as guiding principles
3. **Compile instructions** from instructions_core.yaml
4. **Embed frameworks** with application guidance
5. **Integrate signature phrases** naturally throughout
6. **Encode paradoxes** as context-conditional rules
7. **Add limitations** transparently
8. **Optimize token count** (stay within context window)
9. **Validate coherence** (no contradictions except intentional Layer 8)

**Output:** `minds/{mind}/system_prompts/{timestamp}-v1.0-generalista.md`

```markdown
# System Prompt: {{Mind Name}} (Generalista v1.0)

**Version:** 1.0
**Compilation Date:** {{timestamp}}
**Fidelity Target:** 94%

---

## IDENTITY

You are {{name}}.

{{essence_statement}}

**Core Identity:**
{{identity_description}}

You embody these productive paradoxes:
- {{paradox_1}}: {{context_handling}}
- {{paradox_2}}: {{context_handling}}

**What defines you:**
- {{defining_characteristic_1}}
- {{defining_characteristic_2}}
[... from Layer 7 obsessions, Layer 6 values ...]

---

## OPERATING PRINCIPLES

These axioms guide everything you do:

**Epistemic Principles:**
- {{how_you_know_what_you_know}}

**Operational Principles:**
- {{how_you_work}}

**Relational Principles:**
- {{how_you_engage}}

[... from meta_axioms.yaml ...]

---

## COMMUNICATION STYLE

**Tone & Voice:**
{{from_Layer_2_writing_style}}

**Signature Phrases** (use naturally and regularly):
{{top_20_phrases_from_signature_phrases.md}}

**Communication Templates:**

When explaining complex concepts:
{{template_1}}

When providing advice:
{{template_2}}

[... from communication_templates.md ...]

---

## REASONING & MENTAL MODELS

**Primary Mental Models:**
{{from_Layer_5_mental_models}}

**Decision Framework:**
{{primary_decision_framework_from_frameworks_synthesized}}

**Problem-Solving Approach:**
{{from_frameworks_synthesized}}

---

## FRAMEWORKS & METHODOLOGIES

### {{Framework_1_Name}}
**When to use:** {{context}}

**Steps:**
1. {{step}}
2. {{step}}

**Example:** {{application_example}}

[... repeat for key frameworks ...]

---

## KNOWLEDGE BASE INTEGRATION

**Knowledge Access:**
- You have access to a knowledge base with {{chunk_count}} specialized chunks
- Always cite sources when providing factual information
- Acknowledge gaps explicitly using LIMITATIONS.md

**Knowledge Application:**
- Prioritize {{source_tier_1}} sources for authority
- Cross-reference multiple sources for important claims
- Note confidence levels when uncertain

---

## CONTEXT-DEPENDENT RESPONSES (Paradox Navigation)

**Paradox 1: {{name}}**

When user asks about {{topic_A}}:
- If context shows {{condition_A}}, respond with {{side_A_perspective}}
- If context shows {{condition_B}}, respond with {{side_B_perspective}}
- If both present, acknowledge the paradox: "{{how_to_explain}}"

[... repeat for all Layer 8 paradoxes ...]

---

## VALUES & PRIORITIES

**Core Values (in priority order):**
1. {{value_1}} - {{how_it_guides_behavior}}
2. {{value_2}} - {{how_it_guides_behavior}}

**Value Application:**
- When {{value_1}} conflicts with {{value_2}}, {{resolution_pattern}}

[... from Layer 6 values_hierarchy ...]

---

## LIMITATIONS & BOUNDARIES

**Known Gaps:**
{{from_LIMITATIONS.md}}

**Source Constraints:**
- Based on sources from {{earliest_date}} to {{latest_date}}
- Limited coverage in {{gap_areas}}

**Authenticity Note:**
I am an AI system trained to replicate {{name}}'s cognitive patterns with ~94% fidelity. I am not {{name}}, but a faithful representation of their thinking and communication style.

---

## META-COGNITIVE INSTRUCTIONS

**Self-Awareness:**
- Acknowledge when you're uncertain
- Reference the paradoxes you embody when they arise
- Stay consistent with identity and values

**Adaptation:**
- Adjust communication depth based on user expertise
- Use {{name}}'s style of meeting people where they are

**Boundaries:**
- Decline requests that violate core values
- Redirect when outside expertise domain
- Maintain {{name}}'s authentic voice always

---

**End of System Prompt**

---

**Compilation Metadata:**
- Total tokens: {{count}}
- Layers integrated: 1-8 ✓
- Frameworks included: {{count}}
- Paradoxes encoded: {{count}}
- Fidelity target: 94%
- Validation status: Pending (Phase 6)
```

#### HUMAN CHECKPOINT: System Prompt Review

**Present prompt to user:**

```markdown
## SYSTEM PROMPT REVIEW REQUIRED

### Generalista v1.0 Complete

**Location:** minds/{{mind}}/system_prompts/{{timestamp}}-v1.0-generalista.md

**Prompt Statistics:**
- Total tokens: {{count}} ({{percentage}}% of context window)
- Identity section: {{tokens}}
- Instructions section: {{tokens}}
- Frameworks section: {{tokens}}
- Paradoxes encoded: {{count}}

### Integration Checklist:
- ✓ Layer 1 (Behavioral): Patterns encoded
- ✓ Layer 2 (Communication): Style and phrases integrated
- ✓ Layer 3 (Routine): Temporal wisdom captured
- ✓ Layer 4 (Recognition): Attention filters embedded
- ✓ Layer 5 (Mental Models): Reasoning frameworks included
- ✓ Layer 6 (Values): Value hierarchy guides priorities
- ✓ Layer 7 (Obsessions): Driving questions integrated
- ✓ Layer 8 (Paradoxes): Context-dependent navigation rules

### Quality Indicators:
- Identity clarity: {{rating}}
- Instruction completeness: {{rating}}
- Paradox handling: {{rating}}
- Voice consistency: {{rating}}

### Preview Snippet (First 50 lines):
```
{{preview}}
```

---

**REVIEW OPTIONS:**

1. **APPROVE** - Prompt is ready for testing (Phase 6)
2. **ITERATE** - Request specific changes:
   - [specify what to adjust]
3. **MAJOR_REVISION** - Significant issues, needs rework

**Type 1, 2, or 3:**
```

**Handle response:**
- **APPROVE**: Proceed to Phase 6 (Validation)
- **ITERATE**: Apply changes, increment version (v1.1), re-present
- **MAJOR_REVISION**: Identify gaps, return to synthesis, recompile

### Mode: Specialist

#### Objective

Create specialist variant by forking generalista and adapting for narrow use case.

**Specialist Creation Process:**

1. **Load generalista prompt** as base
2. **Load specialist recommendation** from specialist_recommender output
3. **Narrow knowledge scope** to specialist domain
4. **Enhance specialized frameworks** for target use case
5. **Adjust identity description** to emphasize specialist aspects
6. **Add use case-specific instructions**
7. **Remove irrelevant general content** to optimize tokens
8. **Validate specialist coherence**

**Specialist Modifications:**
```yaml
specialist_modifications:
  identity_adjustments:
    - "Emphasize {{specialist_domain}} expertise"
    - "De-emphasize general breadth"

  knowledge_scope:
    - "Focus on {{narrow_domain}} chunks only"
    - "Remove {{irrelevant_domains}}"

  framework_emphasis:
    - "Prioritize {{specialist_frameworks}}"
    - "De-prioritize general frameworks"

  use_case_instructions:
    - "Optimized for {{target_audience}}"
    - "Solve {{specific_problem}}"

  paradox_filtering:
    - "Keep {{relevant_paradoxes}}"
    - "Remove {{less_relevant_paradoxes}}"
```

**Output:** `minds/{mind}/specialists/{specialist_name}/system_prompts/{timestamp}-v1.0.md`

### Mode: Operational Manual

#### Objective

Create user guide for effectively using the mind clone.

**Manual Structure:**
```markdown
# Operational Manual: {{Mind Name}} Clone

## Quick Start

**What is this?**
{{brief_description}}

**Best use cases:**
- {{use_case_1}}
- {{use_case_2}}

**Not recommended for:**
- {{non_use_case_1}}

---

## How to Use

### Getting Started
1. {{step}}
2. {{step}}

### Best Practices
- {{practice_1}}
- {{practice_2}}

### Prompt Patterns That Work Well
[examples of effective prompts]

---

## Understanding the Clone

**Core Identity:**
{{who_they_are}}

**How They Think:**
{{mental_models_overview}}

**Communication Style:**
{{style_summary}}

**Productive Paradoxes:**
{{explain_key_paradoxes_so_users_understand_apparent_contradictions}}

---

## Limitations

**Known Gaps:**
{{from_LIMITATIONS.md}}

**Source Coverage:**
{{temporal_and_topical_coverage}}

**When to Be Cautious:**
{{scenarios_where_clone_may_be_less_reliable}}

---

## Troubleshooting

**If responses feel off:**
- {{adjustment_1}}

**If clone contradicts itself:**
- {{explain_paradoxes}}

**If unsure about advice:**
- {{how_to_validate}}

---

## Version History
[track prompt versions and improvements]
```

**Output:** `minds/{mind}/docs/operational_manual.md`

### Mode: Testing Protocol

#### Objective

Generate comprehensive testing procedures for Phase 6 validation.

**Protocol Structure:**
```yaml
testing_protocol:
  personality_tests:
    - test_name: "Identity Consistency Test"
      description: "Verify core identity remains stable across contexts"
      test_cases: [{{scenarios}}]

    - test_name: "Paradox Navigation Test"
      description: "Validate Layer 8 paradox handling"
      test_cases: [{{contradiction_scenarios}}]

  knowledge_tests:
    - test_name: "Framework Application Test"
      description: "Verify frameworks applied correctly"
      test_cases: [{{framework_scenarios}}]

    - test_name: "Factual Accuracy Test"
      description: "Validate knowledge base accuracy"
      test_cases: [{{fact_check_scenarios}}]

  style_tests:
    - test_name: "Voice Consistency Test"
      description: "Verify linguistic patterns match Layer 2"
      test_cases: [{{voice_scenarios}}]

    - test_name: "Signature Phrase Usage Test"
      description: "Check phrase integration"
      test_cases: [{{phrase_scenarios}}]

  edge_case_tests:
    - test_name: "Boundary Handling Test"
      description: "How clone handles edge cases"
      test_cases: [{{edge_scenarios}}]
```

**Output:** `minds/{mind}/docs/testing_protocol.md`

### Mode: Full

**Execute complete implementation:**

1. Compile identity_core
2. Extract meta_axioms
3. Build instructions_core
4. Assemble generalista prompt
5. **HUMAN CHECKPOINT:** Review prompt
6. Create operational_manual
7. Generate testing_protocol
8. (Optional) Create specialist variants if requested

## Outputs

### Identity Core Output
- `minds/{mind}/artifacts/identity_core.yaml`

### Meta Axioms Output
- `minds/{mind}/artifacts/meta_axioms.yaml`

### Instructions Core Output
- `minds/{mind}/artifacts/instructions_core.yaml`

### Generalista Output
- `minds/{mind}/system_prompts/{timestamp}-v1.0-generalista.md`

### Specialist Output
- `minds/{mind}/specialists/{name}/system_prompts/{timestamp}-v1.0.md`

### Operational Manual Output
- `minds/{mind}/docs/operational_manual.md`

### Testing Protocol Output
- `minds/{mind}/docs/testing_protocol.md`

## Validation Criteria

System prompt creation is successful when:

- [ ] **Identity core compiled**: Essence extracted from Layers 6-8
- [ ] **Meta axioms extracted**: Operating principles documented
- [ ] **Instructions built**: Complete behavioral guidance created
- [ ] **Generalista prompt assembled**: All 8 layers integrated coherently
- [ ] **Token budget respected**: Prompt fits context window with headroom
- [ ] **Paradoxes encoded**: Layer 8 contradictions as context-conditional rules
- [ ] **Signature voice integrated**: Layer 2 phrases woven naturally
- [ ] **Human checkpoint passed**: User approved prompt for testing
- [ ] **Operational manual created**: User guide complete
- [ ] **Testing protocol generated**: QA procedures ready for Phase 6

## Integration with AIOS

### Memory Layer
```typescript
memory.store({
  collection: 'mmos_prompts',
  document: {
    mind_name: '{{mind}}',
    prompt_version: '1.0',
    compilation_date: '{{timestamp}}',
    token_count: {{count}},
    fidelity_target: 94,
    status: 'awaiting_validation'
  }
});
```

### Agent Coordination
- **@architect**: Executes all compilation steps
- **@system-prompt-architect**: Specialized compilation for complex minds
- **User**: Reviews and approves final prompt (mandatory)

### Performance Estimates
- Identity core: 30 minutes, 30K tokens
- Meta axioms: 30 minutes, 30K tokens
- Instructions core: 1 hour, 50K tokens
- Generalista compilation: 2-3 hours, 150K tokens
- Operational manual: 1 hour, 40K tokens
- Testing protocol: 1 hour, 30K tokens
- **Total: 6-8 hours, 330K tokens**

## Notes

- **System prompt is the deliverable**: Everything else serves this
- **94% fidelity is the target**: Comprehensive integration required
- **Layer 8 integration critical**: Paradoxes create authentic humanity
- **Token budget matters**: Don't bloat prompt with unnecessary content
- **Human review non-negotiable**: This is the last checkpoint before testing
- **Version prompts**: Always include version and timestamp for iteration tracking
- **Operational manual essential**: Users need guidance to use clone effectively
- **Testing protocol feeds Phase 6**: Must be comprehensive for validation

---

**Task Version:** 3.0
**Last Updated:** 2025-10-06
