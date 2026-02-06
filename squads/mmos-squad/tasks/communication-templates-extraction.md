---
task-id: communication-templates-extraction
name: Communication Templates Extraction
agent: synthesis-expert
version: 3.5.0
layer: synthesis
phase: 4

metadata:
  specialization: Communication Pattern Architecture
  methodology: Structural Pattern Extraction (Munger-Inspired)
  estimated-time: 3-4 hours
  complexity: medium-high

inputs:
  required:
    - @{mind}/artifacts/communication_patterns.md
    - @{mind}/artifacts/signature_phrases.yaml
  dependencies:
    - `quote-extraction` task concluída
    - `signature-phrases-mining` task concluída

outputs:
  primary:
    - @{mind}/artifacts/communication_templates.yaml
  format: yaml
  template: communication-templates.yaml

validation:
  checklist: synthesis-quality-validation.md
  minimum-templates: 5
  evidence-per-template: 5+
  cross-context-validation: true
  psychological-basis: true

quality-gates:
  - "Pattern appears 5+ times minimum"
  - "Cross-context validation (multiple situations)"
  - "Psychological basis clearly documented"
  - "Boundary conditions defined (when NOT to use)"
  - "Predictive power (can anticipate usage in new contexts)"

elicit: false
---

# Communication Template Extractor

## CORE PHILOSOPHY

> "Communication patterns reveal cognitive architecture. The structure someone uses repeatedly is a window into how their mind organizes ideas"

**METHODOLOGY:** Extract frameworks, not just phrases. Find the template behind the content.

---

## MUNGER-INSPIRED EXTRACTION

### PHASE 1: STRUCTURAL PATTERN HUNTING

**Look for repeating architectures:**

```
Opening Formula:
[Hook type] → [Context setter] → [Main point]

Development Pattern:
[Principle] → [Example] → [Implication]

Closing Signature:
[Summary type] → [Call-to-action style]
```

**Evidence Requirement:**
- Pattern appears 5+ times
- Across different topics
- Spans temporal period

### PHASE 2: SITUATIONAL MAPPING

**When does each template activate?**

```
Template A:
- Audience: [Type]
- Goal: [Persuade/Teach/Challenge]
- Medium: [Written/Verbal/Formal]
- Stakes: [High/Low]

Template B:
- Different contextual triggers...
```

### PHASE 3: PSYCHOLOGICAL BASIS

**Why does this structure work?**

- Cognitive load management: [How it eases understanding]
- Attention hooks: [What keeps engagement]
- Memory anchors: [What makes it stick]
- Emotional resonance: [What creates connection]

---

## OUTPUT STRUCTURE

# COMMUNICATION TEMPLATES - [NAME]

## 📋 TEMPLATE #1: [DESCRIPTIVE NAME]

### Structural Formula

```
OPENING:
[Hook Pattern] +
[Context Pattern] +
[Positioning Statement]

BODY:
[Development Method] × N
(Recursive structure)

CLOSING:
[Synthesis Pattern] +
[Action Prompt]
```

### Situational Activation

**Deploys When:**
- Audience type: [Characteristics]
- Goal: [What's being achieved]
- Constraints: [Time/medium/formality]

**Does NOT Use When:**
- Anti-pattern: [Situations to avoid]
- Reason: [Why it would fail]

### Linguistic Fingerprints

**Signature Phrases:**
- Opening: "[Typical phrase pattern]"
- Transitions: "[How connects ideas]"
- Emphasis: "[Markers for importance]"
- Closing: "[Wrap-up pattern]"

### Psychological Mechanism

**Works Because:**
1. [Cognitive principle 1]
2. [Engagement mechanism]
3. [Memory principle]

### Evidence Instances

1. **[Date/Context]:** [Example usage]
2. **[Date/Context]:** [Another instance]
3. **[Date/Context]:** [Third confirmation]

**Effectiveness:** [Documented outcomes]

---

## MUNGER QUALITY CHECKS

- [ ] **Pattern Frequency:** 5+ documented uses
- [ ] **Cross-Context:** Multiple situations
- [ ] **Psychological Basis:** Clear mechanism
- [ ] **Boundary Conditions:** When NOT to use
- [ ] **Predictive:** Can anticipate usage

---

**Communication Template Extractor | Structure Specialist**
*"Finding the architecture behind the words"*
