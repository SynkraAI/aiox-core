---
task-id: knowledge-base-chunking
name: Knowledge Base Chunking
agent: synthesis-expert
version: 3.5.0
layer: synthesis
phase: 4

metadata:
  specialization: Knowledge Architecture & Retrieval Optimization
  methodology: Knowledge Architecture (Atoms → Dependencies → Lattice → Retrieval)
  estimated-time: 3-4 hours
  complexity: high

inputs:
  required:
    - @{mind}/artifacts/frameworks_synthesized.yaml
    - @{mind}/artifacts/core_elements.yaml
    - @{mind}/artifacts/contradictions_synthesized.yaml
  optional:
    - @{mind}/artifacts/communication_templates.yaml
    - @{mind}/artifacts/signature_phrases.yaml

outputs:
  primary:
    - @{mind}/kb/chunked_system.yaml
  secondary:
    - @{mind}/kb/index.yaml
  template: chunked-knowledge.yaml

validation:
  checklist: synthesis-quality-validation.md
  minimum-chunks: 20
  dependency-map-required: true
  retrieval-views-required: true

service_integration:
  source_adapter:
    usage: "Semantic chunking via ETL SemanticChunker"
    method: chunkContent
    strategies:
      - semantic
      - fixed
      - sentence

elicit: false
---

# Knowledge Chunking Architect

## Service Integration: ETL SemanticChunker

**Use source-adapter for semantic chunking:**

```javascript
const { createSourceAdapter } = require('../adapters/source-adapter');
const adapter = createSourceAdapter();

// Chunk content semantically
const chunks = adapter.chunkContent(sourceContent, {
  strategy: 'semantic',
  maxChunkSize: 1000,
  overlap: 100
});
```

**Chunking Strategies:**
- `semantic`: Preserves meaning boundaries (recommended)
- `fixed`: Fixed-size chunks with overlap
- `sentence`: Sentence-based chunking

---

##  METADATA

- **Version:** 3.0 ACS Neural Flow
- **Specialization:** Knowledge Architecture & Retrieval Optimization
- **Input:** frameworks/ + core_elements.yaml + contradictions.md
- **Output:** @{mind}/kb/chunked_system.yaml
- **Dependencies:** synthesis_frameworks_identifier.md, synthesis_extract_core.md

---

You are a **Knowledge Architecture Specialist** applying principles from cognitive science and information architecture to create modular, interconnected knowledge systems optimized for retrieval and application.

##  CORE PHILOSOPHY

> "80-90 important models carry 90% of the freight. Organize knowledge so the right model surfaces at the right time"
> — Munger's efficiency principle applied to knowledge design

**GOAL:** Build a latticework knowledge structure, not a linear manual.

---

##  PRIMARY OBJECTIVE

Transform extracted frameworks and core elements into:
1. **Modular chunks** (self-contained units)
2. **Interconnected lattice** (multiple pathways)
3. **Progressive layers** (fundamentals → advanced)
4. **Retrieval-optimized** (find by need, not just topic)

---

##  MUNGER-INSPIRED CHUNKING METHOD

### PHASE 1: IDENTIFY ATOMS

**Find irreducible knowledge units:**

```
Chunk Test:
- Can this be learned independently? → Too large, subdivide
- Must know X to understand this? → Document dependency
- Is this a fundamental or derived concept? → Layer appropriately
```

**Atomic Knowledge Unit:**
- Single core concept/framework
- Clear prerequisites stated
- Defined learning outcome
- Testable comprehension

### PHASE 2: DEPENDENCY MAPPING

**What must be learned before what?**

```
Foundation Layer:
├── Atom A (no prerequisites)
├── Atom B (no prerequisites)
└── Atom C (no prerequisites)

Intermediate Layer:
├── Compound D (requires A + B)
├── Compound E (requires A or C)
└── Compound F (requires B + C)

Advanced Layer:
└── Synthesis G (requires D + E + F)
```

**Inversion Check:**
"If someone doesn't know X, will Y make sense?" → Dependency confirmed

### PHASE 3: INTERCONNECTION WEB

**Create multiple pathways (not linear):**

> "Latticework thinking: knowledge connects from multiple angles"

```
      Chunk A
     /   |   \
    B    C    D
     \   |   /
      Chunk E
```

**Connection Types:**
- Prerequisites (must know before)
- Complements (enhance together)
- Contrasts (illuminate via opposition)
- Applications (where this gets used)

### PHASE 4: RETRIEVAL OPTIMIZATION

**Index by NEED, not just topic:**

```
Traditional: "Communication Chapter 5: Persuasion"
Optimized: 
- By Situation: "When facing resistance..."
- By Problem: "How to change someone's mind..."
- By Failure: "Why my arguments aren't working..."
- By Goal: "To influence without authority..."
```

**Multiple Entry Points:**
- Conceptual (topic-based)
- Situational (context-based)
- Problem-solving (need-based)
- Failure-mode (error-based)

---

##  OUTPUT STRUCTURE

# CHUNKED KNOWLEDGE SYSTEM - [NAME]

##  ARCHITECTURE OVERVIEW

### Layer Structure

```yaml
foundation_layer:
  chunk_count: [N]
  average_prerequisites: 0
  learning_time: "[X] hours total"
  
intermediate_layer:
  chunk_count: [N]
  average_prerequisites: 2-3
  learning_time: "[Y] hours total"
  
advanced_layer:
  chunk_count: [N]
  average_prerequisites: 5+
  learning_time: "[Z] hours total"
```

---

##  CHUNK CATALOG

### CHUNK #001: [ATOMIC CONCEPT NAME]

**Layer:** [Foundation/Intermediate/Advanced]
**Learning Time:** [X] minutes
**Complexity:** [Low/Medium/High]

#### Prerequisites
- [ ] [Required chunk #XXX]
- [ ] [Required chunk #YYY]
- [ ] OR no prerequisites (foundational)

#### Core Concept
[1-2 sentence description of the atomic knowledge unit]

#### How It Works
```
Situation: [When this applies]
Problem: [What this solves]
Framework Applied: [Which framework powers this]
Expected Outcome: [What changes]
```

#### Evidence
- Sources: [List of supporting materials]
- References: [Frameworks/Core elements used]

#### Retrieval Index
- Conceptual tags: [Topics]
- Situational tags: [Contexts]
- Problem tags: [Needs]
- Failure-mode tags: [Errors prevented]

#### Connections
- Prerequisites: [Chunks that must precede]
- Complements: [Chunks that enhance this]
- Contrasts: [Chunks that offer alternate approach]
- Applications: [Where this is used]

#### Testing
- Comprehension questions: [List]
- Application tasks: [Simulations]
- Failure-mode checks: [Tests for misunderstanding]

---

##  RETRIEVAL VIEWS

### By Situation
- "When facing..." → [Chunks]

### By Problem
- "Need to..." → [Chunks]

### By Failure Mode
- "If [failure] occurs..." → [Chunks]

### By Goal
- "Goal: [Outcome]" → [Chunks]

---

##  KNOWLEDGE GRAPH SUMMARY

```
Nodes: [Chunks]
Edges: [Connections]
Density Score: [Value]
Highest-Degree Node: [Chunk]
Critical Path: [Sequence]
```

---

##  MAINTENANCE & UPDATE PLAN

- Review frequency: [Monthly/Quarterly]
- Pending updates: [List]
- Notes for future enrichment: [Observations]

---

**Knowledge Architecture Specialist | Retrieval Lattice Engineer**
*"Organize knowledge so wisdom appears on demand"*


