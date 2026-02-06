# MMOS Methodology Knowledge Base

> **Purpose:** Core reference for MMOS (Mind Mapping OS) cognitive clone development
> **Used by:** All MMOS squad agents
> **Version:** 1.0.0

---

## What is MMOS?

MMOS (Mind Mapping OS) is a methodology for creating high-fidelity cognitive clones of real people using AI. The goal is to capture not just what someone says, but how they think - their mental models, decision patterns, values, and unique perspective.

**Target:** 94% fidelity (indistinguishable from original in blind tests)

---

## DNA Mental™ 8-Layer Model

The core of MMOS is the DNA Mental 8-layer cognitive architecture. Each layer captures a different depth of the person's cognition.

### Layer 1: Biographical Facts

**What:** Observable, verifiable information about the person.

**Includes:**
- Birth date, location, nationality
- Education and credentials
- Career timeline
- Key achievements
- Family and relationships
- Public milestones

**Sources:** Wikipedia, bios, interviews, public records

**Why It Matters:** Foundation for context and credibility. Errors here undermine everything.

---

### Layer 2: Communication Patterns

**What:** How they express ideas - their distinctive voice.

**Includes:**
- Signature phrases (e.g., "skin in the game")
- Vocabulary preferences
- Sentence structure patterns
- Tone and register
- Rhetorical devices
- Analogies and metaphors they use

**Sources:** Written works, interviews, social media

**Why It Matters:** First thing users notice. Critical for immersion and authenticity.

---

### Layer 3: Mental Models & Frameworks

**What:** The thinking tools they use to analyze problems.

**Includes:**
- Named frameworks (e.g., "Barbell Strategy")
- Unnamed but consistent patterns
- How they structure problems
- Categories they use
- Analytical approaches

**Sources:** Books, lectures, detailed interviews

**Why It Matters:** Core value proposition - thinking like the original.

---

### Layer 4: Values Hierarchy

**What:** What they prioritize when making decisions.

**Includes:**
- Explicit stated values
- Implicit values (revealed through choices)
- Trade-off patterns
- What they sacrifice for what
- Non-negotiables

**Sources:** Decision examples, value conflicts, personal statements

**Why It Matters:** Determines how clone handles ethical dilemmas and trade-offs.

---

### Layer 5: Decision Architecture

**What:** How they structure and execute decisions.

**Includes:**
- Decision criteria
- Information gathering patterns
- Risk assessment approach
- Time horizons
- Reversibility considerations
- Heuristics and shortcuts

**Sources:** Career decisions, investment choices, life pivots

**Why It Matters:** Makes clone useful for advice and decision support.

---

### Layer 6: Core Obsessions

**What:** The deep drives that motivate their work.

**Includes:**
- Recurring themes across career
- What they return to obsessively
- Emotional investments
- Life missions
- What angers or excites them

**Sources:** Long-form content, personal essays, pattern analysis

**Why It Matters:** The "soul" of the clone - what makes them driven.

---

### Layer 7: Unique Singularity

**What:** What makes them irreplaceable - their unique perspective.

**Includes:**
- Unique combination of experiences
- Insights no one else has
- Original contributions
- Contrarian positions
- What differentiates them from peers

**Sources:** Deep analysis, peer comparisons, original works

**Why It Matters:** Captures what can't be replicated - their special "X factor."

---

### Layer 8: Productive Paradoxes

**What:** The contradictions they hold that make them human.

**Includes:**
- Beliefs that seem contradictory
- Tensions they navigate
- How they hold opposites
- Evolution/changes of mind
- Admitted inconsistencies

**Sources:** Long-form vulnerable content, evolution of views

**Why It Matters:** Humanity and nuance - prevents robotic consistency.

---

## Pipeline Phases

### Phase 1: VIABILITY

**Purpose:** Determine if clone development is feasible and worthwhile.

**Key Activities:**
- APEX scoring (Accessibility, Public Profile, Expert Domain, X-Factor)
- ICP matching (does this person fit our use case?)
- GO/NO-GO decision

**Output:** Viability report with recommendation

**Checkpoint:** Human approval required to proceed

---

### Phase 2: RESEARCH

**Purpose:** Collect all source material for analysis.

**Key Activities:**
- Source identification and prioritization
- Content collection (books, interviews, articles, social)
- Transcript generation
- Organization and cataloging

**Output:** sources-master.yaml, organized source files

**Checkpoint:** Research quality checklist pass

---

### Phase 3: ANALYSIS

**Purpose:** Extract cognitive patterns from sources.

**Key Activities:**
- Layer-by-layer extraction
- Pattern identification
- Triangulation and verification
- Contradiction documentation

**Output:** 8 layer files in artifacts/

**Checkpoint:** Layer completion review

---

### Phase 4: SYNTHESIS

**Purpose:** Compile analysis into knowledge base.

**Key Activities:**
- Cross-layer synthesis
- KB fragment generation
- Token budget management
- Quality assessment

**Output:** kb/ directory with fragments, synthesis-report.md

**Checkpoint:** KB quality review

---

### Phase 5: PROMPT

**Purpose:** Generate system prompt for clone.

**Key Activities:**
- Architecture design
- Layer integration
- Instruction crafting
- Safety guardrails

**Output:** system-prompt.md

**Checkpoint:** Prompt review

---

### Phase 6: TESTING

**Purpose:** Validate clone fidelity.

**Key Activities:**
- Fidelity testing protocols
- Blind tests
- Iteration based on results

**Output:** Fidelity score, test results

**Checkpoint:** 94% target or iteration plan

---

## Fidelity Targets

| Level | Percentage | Description |
|-------|------------|-------------|
| **Excellent** | 94%+ | Indistinguishable from original |
| **Good** | 85-93% | High quality, minor gaps |
| **Acceptable** | 70-84% | Functional but needs work |
| **Poor** | <70% | Requires significant iteration |

---

## Key Principles

### 1. Depth Over Breadth

Better to deeply understand 5 sources than superficially process 50. Quality of extraction matters more than quantity.

### 2. Layer 6-8 Are Gold

Deep layers (obsessions, singularity, paradoxes) are hardest to capture but most valuable. Prioritize long-form content that reveals these.

### 3. Triangulate Everything

Never trust a single source for important claims. Verify through multiple sources before treating as fact.

### 4. Human Checkpoints Matter

AI can do 90% of the work, but human judgment at checkpoints catches errors AI misses. Don't skip reviews.

### 5. 94% or Iterate

Don't ship clones below target fidelity. It's better to iterate than release something that misrepresents the person.

### 6. Respect the Original

The goal is authentic representation, not caricature. Clones should honor the person's genuine thinking.

---

## Common Failure Modes

### 1. Surface-Level Extraction

**Problem:** Clone has facts but no depth
**Cause:** Relying on Layer 1-2 sources only
**Fix:** Add long-form content for Layers 6-8

### 2. Generic Voice

**Problem:** Clone sounds like generic AI
**Cause:** Insufficient Layer 2 extraction
**Fix:** More signature phrases, communication examples

### 3. Framework Misapplication

**Problem:** Clone uses frameworks incorrectly
**Cause:** Understanding what but not how/when
**Fix:** More application examples in training

### 4. Robotic Consistency

**Problem:** Clone never contradicts itself
**Cause:** Missing Layer 8 (paradoxes)
**Fix:** Document and incorporate productive tensions

### 5. Knowledge Hallucination

**Problem:** Clone invents facts
**Cause:** KB gaps, over-extrapolation
**Fix:** Better KB coverage, explicit boundaries

---

## Tools & Templates

### Research Phase
- `sources-master.yaml` - Source tracking
- `research-quality-checklist.md` - Quality validation

### Analysis Phase
- Layer extraction templates
- Cognitive analysis framework

### Synthesis Phase
- `synthesis-compilation.md` - KB compilation task
- Fragment templates

### Testing Phase
- `fidelity-benchmarks.yaml` - Target metrics
- Test protocols (quick/standard/comprehensive/blind)

### Activation Phase
- `clone-metadata.yaml` - Mind metadata
- `clone-activation-report.yaml` - Activation tracking

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-09 | Initial knowledge base |

---

*MMOS Knowledge Base - Foundation for cognitive clone development.*
