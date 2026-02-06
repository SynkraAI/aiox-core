---
task-id: signature-phrases-mining
name: Signature Phrases Mining
agent: synthesis-expert
version: 3.5.0
layer: synthesis
phase: 4

metadata:
  specialization: Linguistic Fingerprint Extraction
  methodology: Cognitive Pattern Analysis (3-Phase)
  estimated-time: 2-3 hours
  complexity: medium

inputs:
  required:
    - @{mind}/sources/quotes/
    - @{mind}/sources/transcripts/
    - @{mind}/sources/written_works/
  optional:
    - @{mind}/artifacts/communication_patterns.md
    - @{mind}/artifacts/writing_style.md
  dependencies:
    - `quote-extraction` task concluída

outputs:
  primary:
    - @{mind}/artifacts/signature_phrases.yaml
  format: yaml
  template: signature-phrases.yaml

validation:
  checklist: synthesis-quality-validation.md
  minimum-phrases: 10
  minimum-frequency: 5
  cognitive-depth-required: true
  temporal-persistence: true

quality-gates:
  - "Frequency: 5+ uses OR unique coinage"
  - "Cognitive Depth: Reveals mental model"
  - "Temporal Persistence: Spans time period"
  - "Context Variation: Multiple situations"
  - "Predictive: Can anticipate when used"

elicit: false
---

# Signature Phrase Miner

## CORE PHILOSOPHY

> "Signature phrases are cognitive fingerprints. They reveal how someone thinks, not just what they say"

**FOCUS:** Patterns that reveal mental models, not just catchy phrases.

---

## EXTRACTION METHODOLOGY

### PHASE 1: FREQUENCY MINING

**Statistical signature phrases:**

```
Phrase: "[Exact or pattern]"
Frequency: [N occurrences]
First use: [Date]
Last use: [Date]
Contexts: [Where appears]
```

**Threshold:** 5+ uses OR unique coined term

### PHASE 2: COGNITIVE PATTERN ANALYSIS

**What does this phrase reveal?**

```
Phrase: "[Example]"

Reveals Mental Model:
- Underlying framework: [What thinking pattern]
- Assumption embedded: [What's taken as given]
- Value signaled: [Priority shown]

Example:
"Always invert" → Reveals: Munger's systematic use of inversion thinking
```

### PHASE 3: CONTEXTUAL MAPPING

**When does phrase activate?**

- Situation type: [Triggers]
- Emotional state: [When said]
- Function: [What it accomplishes]

---

## OUTPUT STRUCTURE

# LINGUISTIC FINGERPRINTS - [NAME]

## 🎯 TIER 1: SIGNATURE PHRASES (10-15)

### PHRASE #1: "[Exact phrase or pattern]"

**Frequency:** [N] documented uses
**Temporal Span:** [First → Last appearance]

**Cognitive Reveal:**
[What mental model this phrase exposes]

**Contexts:**
1. [Situation where used]
2. [Another context]
3. [Third instance]

**Function:**
[What this phrase accomplishes communicatively]

---

## 🧠 TIER 2: THINKING PATTERNS (Structural)

### PATTERN: "[Type of construction]"

**Example:** "[Illustration]"
**Frequency:** [How often]
**Reveals:** [Cognitive mechanism]

---

## MUNGER QUALITY CHECKS

- [ ] **Frequency:** 5+ uses OR unique coinage
- [ ] **Cognitive Depth:** Reveals mental model
- [ ] **Temporal Persistence:** Spans time period
- [ ] **Context Variation:** Multiple situations
- [ ] **Predictive:** Can anticipate when used

---

**Signature Phrase Miner | Cognitive Linguist**
*"Every repeated phrase is a window into thought patterns"*
