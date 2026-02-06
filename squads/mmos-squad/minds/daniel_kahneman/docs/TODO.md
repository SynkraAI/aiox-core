# TODO - Daniel Kahneman Clone

**Status:** Research Phase
**Last Updated:** 2025-10-07
**Purpose:** Ensinar a pensar com clareza e reconhecer nossos próprios vieses

---

## Phase 1: Viability ✅ COMPLETE

- [x] Execute APEX scoring (Result: 91/100 - EXCEPTIONAL)
- [x] Execute ICP matching (Result: 98.5% - PERFECT MATCH)
- [x] Present viability recommendation
- [x] Obtain GO/NO-GO decision (✅ GO APPROVED)
- [x] Generate PRD (Product Requirements Document)
- [x] Generate TODO backlog (this file)
- [x] Map dependencies and resources

**Outputs:**
- ✅ `docs/logs/20251007_005132-viability.yaml`
- ✅ `docs/logs/20251007_005132-icp_match.yaml`
- ✅ `docs/logs/20251007_005132-viability_recommendation.md`
- ✅ `docs/PRD.md`
- ✅ `docs/TODO.md`
- ⏳ `metadata/dependencies.yaml` (next)

---

## Phase 2: Research 📚 NEXT

**Estimated Time:** 2-3 hours
**Estimated Tokens:** 800K-1.2M
**Status:** Pending

### 2.1 Source Discovery

- [ ] Identify all Tier 1 sources (books as primary author)
  - [ ] Thinking, Fast and Slow (2011) - PRIMARY SOURCE
  - [ ] Noise: A Flaw in Human Judgment (2021)
  - [ ] Judgment under Uncertainty: Heuristics and Biases (1982)
  - [ ] Choices, Values, and Frames (2000)
  - [ ] Well-Being: The Foundations of Hedonic Psychology (1999)

- [ ] Identify Tier 2 sources (interviews & long-form)
  - [ ] The Knowledge Project (Farnam Street) - Episodes #68 & follow-up
  - [ ] Conversations with Tyler - Episode 56
  - [ ] Hidden Brain (NPR) - "Think Fast with Daniel Kahneman"
  - [ ] Masters in Business with Barry Ritholtz
  - [ ] On Being with Krista Tippett
  - [ ] Additional 12+ podcast appearances

- [ ] Identify Tier 3 sources (validation)
  - [ ] Nobel Prize lecture and biography
  - [ ] Key academic papers (Prospect Theory 1979, Heuristics 1974)
  - [ ] Princeton obituary and academic CV
  - [ ] TED Talks and conference videos

### 2.2 Parallel Collection

**Batch 1 - Priority 1 (Books):**
- [ ] Process "Thinking, Fast and Slow" (PRIMARY - 500+ pages)
  - [ ] Extract key concepts and frameworks
  - [ ] Mine signature phrases and examples
  - [ ] Identify communication patterns
  - [ ] Note System 1/System 2 explanations
  - [ ] Capture Linda problem, Asian disease, other classics

- [ ] Process "Noise: A Flaw in Human Judgment" (2021)
  - [ ] Extract noise framework
  - [ ] Understand noise vs bias distinction
  - [ ] Capture noise audit methodology
  - [ ] Note collaboration with Sibony & Sunstein

- [ ] Process "Judgment under Uncertainty" (1982)
  - [ ] Extract heuristics (anchoring, availability, representativeness)
  - [ ] Understand systematic biases
  - [ ] Note experimental methodology

**Batch 2 - Priority 2 (Long-form Audio/Video):**
- [ ] Transcribe/process The Knowledge Project episodes
  - [ ] Episode #68: "Putting Your Intuition on Ice"
  - [ ] Follow-up: "Algorithms Make Better Decisions Than You"
  - [ ] Extract conversational style and examples

- [ ] Process Conversations with Tyler (Episode 56)
  - [ ] "Cutting Through the Noise"
  - [ ] Identify discussion patterns and spontaneous insights

- [ ] Process Hidden Brain NPR interview
  - [ ] Tversky collaboration stories
  - [ ] Memory and judgment insights

- [ ] Process Masters in Business (Barry Ritholtz)
  - [ ] Behavioral finance applications
  - [ ] Investment decision insights

- [ ] Process additional interviews (17+ episodes total)

**Batch 3 - Priority 3 (Academic & Validation):**
- [ ] Process foundational papers
  - [ ] "Prospect Theory: An Analysis of Decision Under Risk" (1979)
  - [ ] "Judgment under Uncertainty: Heuristics and Biases" (1974)
  - [ ] Key papers on anchoring, availability

- [ ] Review biographical sources
  - [ ] Nobel Prize documentation
  - [ ] Princeton tributes
  - [ ] Academic CV and publication list

- [ ] Collect video content
  - [ ] TED Talks
  - [ ] Nobel lecture
  - [ ] Conference presentations

### 2.3 Sources Master Compilation

- [ ] Generate `sources/sources_master.yaml`
  - [ ] Catalog all collected sources
  - [ ] Tag by type (book, interview, paper, video)
  - [ ] Assign confidence levels (high/medium/low)
  - [ ] Note temporal context (when created)
  - [ ] Track processing status

- [ ] Validate minimum source requirements
  - [ ] Verify ≥15 total sources ✅ (exceeded)
  - [ ] Verify ≥5 high-confidence sources ✅ (5+ books)
  - [ ] Verify ≥3 source types ✅ (books, interviews, papers, videos)
  - [ ] Verify temporal coverage ✅ (1970s-2024)

**Output:** `sources/sources_master.yaml`

---

## Phase 3: Analysis (8 Layers) 🧠

**Estimated Time:** 3-4 hours
**Estimated Tokens:** 600K-800K
**Status:** Pending (blocked by Phase 2)

### 3.1 Layers 1-4 (Observable Patterns)

**Layer 1 - Behavioral Patterns:**
- [ ] Extract observable actions and decisions
  - [ ] Experimental approach to every claim
  - [ ] Collaborative research style (Tversky partnership)
  - [ ] Teaching through examples and thought experiments
  - [ ] Public engagement patterns (talks, interviews)

**Layer 2 - Communication Style:**
- [ ] Analyze linguistic patterns and writing style
  - [ ] Story-driven pedagogy (Linda problem, Asian disease)
  - [ ] Clear structure (define → evidence → implications)
  - [ ] Accessible language for complex concepts
  - [ ] First-person perspective (shares own biases)
  - [ ] Humble tone and acknowledgment of limitations

**Layer 3 - Routine & Habits:**
- [ ] Map temporal patterns and daily practices
  - [ ] Deep thinking routines (System 2 mode)
  - [ ] Collaborative brainstorming sessions
  - [ ] Experimental design and data analysis
  - [ ] Writing and teaching as consolidation

**Layer 4 - Recognition Patterns:**
- [ ] Identify what he notices (mental radars)
  - [ ] Overconfidence in human judgment
  - [ ] Intuition vs statistics conflicts
  - [ ] WYSIATI (What You See Is All There Is)
  - [ ] Base rate neglect and substitution
  - [ ] Systematic errors in probability estimation

**Outputs:**
- `artifacts/behavioral_patterns.md`
- `artifacts/writing_style.md`
- `artifacts/routine_analysis.md`
- `artifacts/recognition_patterns.yaml`

### 3.2 Layer 5 (Mental Models)

- [ ] Extract core thinking frameworks
  - [ ] Dual-process cognition (System 1 / System 2)
  - [ ] Prospect Theory (reference-dependent preferences)
  - [ ] Heuristics as cognitive shortcuts with biases
  - [ ] Experiencing vs remembering self
  - [ ] Noise as unwanted variability in judgment

- [ ] Triangulate across sources
  - [ ] Cross-reference books, papers, interviews
  - [ ] Validate consistency of mental models
  - [ ] Note evolution of ideas over time

**Output:** `artifacts/mental_models.md`

### 3.3 Layer 6 (Values Hierarchy) ⚠️ CRITICAL

- [ ] Extract core values from demonstrated behavior
  - [ ] Intellectual honesty (truth over ego)
  - [ ] Empirical rigor (evidence-based only)
  - [ ] Collaborative discovery (credit others)
  - [ ] Practical impact (research should help decisions)
  - [ ] Humility (acknowledge own biases)

- [ ] Triangulate stated vs demonstrated values
  - [ ] Compare what he says vs what he does
  - [ ] Validate across multiple sources
  - [ ] Check temporal consistency

- [ ] **🔴 HUMAN CHECKPOINT: Validate Layer 6**
  - [ ] Present extracted values hierarchy to user
  - [ ] Obtain APPROVE / REVISE / RE-ANALYZE decision
  - [ ] Apply feedback if revisions needed

**Output:** `artifacts/values_hierarchy.yaml`

### 3.4 Layer 7 (Core Obsessions) ⚠️ CRITICAL

- [ ] Identify central questions and themes
  - [ ] What makes human judgment systematically flawed?
  - [ ] How can we help people make better decisions?
  - [ ] When should we trust intuition vs analysis?
  - [ ] What is experiencing vs remembering difference?
  - [ ] How can we reduce noise in professional judgment?

- [ ] Track obsessive patterns across sources
  - [ ] Recurring topics in books and papers
  - [ ] Questions that drive research programs
  - [ ] Problems that consume attention

- [ ] **🔴 HUMAN CHECKPOINT: Validate Layer 7**
  - [ ] Present core obsessions to user
  - [ ] Obtain APPROVE / REVISE / RE-ANALYZE decision
  - [ ] Apply feedback if needed

**Output:** `artifacts/core_obsessions.yaml`

### 3.5 Layer 8 (Productive Paradoxes) ⚠️ GOLD LAYER

- [ ] Extract contradictions that create depth
  - [ ] **Expert Intuition Paradox:** Intuition often wrong YET valid in stable environments
  - [ ] **Overconfidence Paradox:** Overconfident in predictions YET appropriately confident in knowledge
  - [ ] **Happiness Paradox:** Experiencing self ≠ remembering self (conflict)
  - [ ] **Rationality Paradox:** Irrational by economics YET adaptive heuristics
  - [ ] **Bias Awareness Paradox:** Knowing biases doesn't eliminate YET enables better systems

- [ ] Document how contradictions coexist
  - [ ] Context for each belief
  - [ ] Resolution strategy
  - [ ] Evidence for both sides

- [ ] **🔴 HUMAN CHECKPOINT: Validate Layer 8**
  - [ ] Present productive paradoxes to user
  - [ ] Explain why Layer 8 creates authentic humanity
  - [ ] Obtain APPROVE / REVISE / RE-ANALYZE decision
  - [ ] Apply feedback if needed

**Output:** `artifacts/contradictions.yaml`

### 3.6 Cognitive Architecture Synthesis

- [ ] Synthesize all 8 layers into unified architecture
  - [ ] Integrate observable patterns (Layers 1-4)
  - [ ] Connect mental models (Layer 5)
  - [ ] Embed values (Layer 6)
  - [ ] Encode obsessions (Layer 7)
  - [ ] Implement paradoxes (Layer 8)

- [ ] Validate internal consistency
  - [ ] Check for conflicts between layers
  - [ ] Ensure paradoxes are productive (not contradictory)
  - [ ] Verify temporal coherence

**Output:** `artifacts/cognitive_architecture.yaml`

---

## Phase 4: Synthesis 🔄

**Estimated Time:** 1-2 hours
**Estimated Tokens:** 300K-400K
**Status:** Pending (blocked by Phase 3)

### 4.1 Framework Extraction

- [ ] Extract communication templates
  - [ ] Thought experiment structure
  - [ ] Example-driven explanation pattern
  - [ ] Evidence → insight → implication flow
  - [ ] Humble acknowledgment template

- [ ] Mine signature phrases
  - [ ] "What you see is all there is" (WYSIATI)
  - [ ] "The experiencing self vs the remembering self"
  - [ ] "Nothing in life is as important as you think it is..."
  - [ ] "A reliable way to make people believe in falsehoods..."
  - [ ] Additional 20+ signature expressions

- [ ] Synthesize decision frameworks
  - [ ] System 1/System 2 application guide
  - [ ] Prospect Theory decision analysis
  - [ ] Pre-mortem technique steps
  - [ ] Noise audit methodology
  - [ ] Debiasing checklist

**Outputs:**
- `artifacts/communication_templates.md`
- `artifacts/signature_phrases.md`
- `artifacts/frameworks_synthesized.md`

### 4.2 Knowledge Base Chunking

- [ ] Create optimized KB chunks for RAG
  - [ ] Chunk by topic (biases, frameworks, experiments)
  - [ ] Optimize chunk size (semantic coherence)
  - [ ] Add metadata (source, confidence, temporal)
  - [ ] Create cross-reference links

- [ ] Generate chunk files
  - [ ] `kb/chunk_001_system1_system2.md`
  - [ ] `kb/chunk_002_prospect_theory.md`
  - [ ] `kb/chunk_003_heuristics_biases.md`
  - [ ] `kb/chunk_004_noise_framework.md`
  - [ ] [... additional chunks as needed]

**Output:** `kb/chunk_*.md` (multiple files)

### 4.3 Specialist Recommendations

- [ ] Analyze cognitive architecture for specialist variants
  - [ ] Investment Decision Advisor (behavioral finance focus)
  - [ ] Policy Design Consultant (nudge design focus)
  - [ ] Research Methodology Guide (experimental design focus)
  - [ ] Executive Decision Coach (strategic decisions focus)
  - [ ] Educational Facilitator (teaching focus)

- [ ] Generate recommendations with rationale
  - [ ] Use case description
  - [ ] Target audience
  - [ ] Required adaptations
  - [ ] Expected value

**Output:** `docs/logs/{timestamp}-specialist_recommendations.yaml`

---

## Phase 5: Implementation (System Prompt) 🛠️

**Estimated Time:** 1-2 hours
**Estimated Tokens:** 200K-300K
**Status:** Pending (blocked by Phase 4)

### 5.1 Identity Core Compilation

- [ ] Distill essence into identity primitives
  - [ ] Who: Nobel laureate psychologist, behavioral economics founder
  - [ ] Core expertise: Cognitive biases, decision science, judgment
  - [ ] Communication style: Humble, story-driven, rigorous
  - [ ] Unique qualities: Paradox navigator, cross-domain synthesizer
  - [ ] Legacy: Teaching clear thinking and bias recognition

**Output:** `artifacts/identity_core.yaml`

### 5.2 Meta Axioms Extraction

- [ ] Extract operating principles that govern all behavior
  - [ ] "Evidence over intuition (unless intuition is expert)"
  - [ ] "Acknowledge uncertainty and limitations"
  - [ ] "Use stories to teach complex concepts"
  - [ ] "Credit collaborators, especially Tversky"
  - [ ] "System 2 should check System 1"
  - [ ] [... additional meta axioms]

**Output:** `artifacts/meta_axioms.yaml`

### 5.3 Generalista System Prompt Compilation

- [ ] Compile complete general-purpose system prompt
  - [ ] Integrate identity core (who/what/why)
  - [ ] Embed Layer 8 paradoxes (authentic humanity)
  - [ ] Encode values hierarchy (Layer 6)
  - [ ] Implement mental models (Layer 5) as reasoning
  - [ ] Apply communication style (Layer 2) as voice
  - [ ] Integrate signature phrases naturally
  - [ ] Include debiasing frameworks
  - [ ] Add knowledge integration instructions

- [ ] Version and validate
  - [ ] Tag as v1.0-generalista
  - [ ] Timestamp creation
  - [ ] Count tokens
  - [ ] Validate completeness

**Output:** `system_prompts/{timestamp}-v1.0-generalista.md`

### 5.4 🔴 HUMAN CHECKPOINT: System Prompt Review

- [ ] Present compiled prompt to user
  - [ ] Show prompt statistics (tokens, structure)
  - [ ] Highlight key characteristics encoded
  - [ ] Provide preview snippet
  - [ ] Explain integration approach

- [ ] Obtain review decision
  - [ ] **APPROVE** → Proceed to testing
  - [ ] **ITERATE** → Apply specific changes, re-present
  - [ ] **MAJOR_REVISION** → Return to synthesis, identify gaps

- [ ] If iteration needed:
  - [ ] Apply requested changes
  - [ ] Increment version (v1.1, v1.2, etc.)
  - [ ] Re-present for approval

### 5.5 Specialist Variants (Optional)

- [ ] If user approves specialists from Phase 4:
  - [ ] Fork generalista prompt for each specialist
  - [ ] Inject specialist knowledge domain
  - [ ] Tune instructions for specialist use case
  - [ ] Create specialist directory structure
  - [ ] Version as v1.0 per specialist

**Outputs:** `specialists/{specialist_name}/system_prompts/{timestamp}-v1.0.md`

### 5.6 Operational Manual Generation

- [ ] Create usage guide
  - [ ] How to use the clone
  - [ ] Optimal use cases
  - [ ] Known limitations
  - [ ] Troubleshooting guide
  - [ ] Version history

**Output:** `docs/operational_manual.md`

---

## Phase 6: Validation & Testing 🧪

**Estimated Time:** 1 hour
**Estimated Tokens:** 100K-150K
**Status:** Pending (blocked by Phase 5)

### 6.1 Test Protocol Generation

- [ ] Create comprehensive test suite
  - [ ] **Personality tests:** Does it feel like Kahneman?
    - Humility check
    - Collaborative credit check
    - Story-driven explanation check

  - [ ] **Knowledge tests:** Is information accurate?
    - Bias identification accuracy
    - Framework application correctness
    - Experimental detail precision

  - [ ] **Style tests:** Does it sound like Kahneman?
    - Signature phrase usage
    - Communication pattern matching
    - Tone and voice consistency

  - [ ] **Edge cases:** Layer 8 functioning correctly?
    - Paradox navigation
    - Contextual wisdom
    - Nuanced responses

**Outputs:**
- `docs/testing_protocol.md`
- `docs/logs/{timestamp}-test_cases.yaml`

### 6.2 Execute Validation Tests

- [ ] Run personality validator
  - [ ] Test humble tone (vs arrogance)
  - [ ] Test collaborative credit (acknowledges Tversky)
  - [ ] Test story-driven teaching
  - [ ] **Target:** >94% personality fidelity

- [ ] Run knowledge validator
  - [ ] Test bias explanations (20+ biases)
  - [ ] Test framework applications (System 1/2, Prospect Theory)
  - [ ] Test experimental accuracy (Linda, Asian disease, etc.)
  - [ ] **Target:** >90% knowledge accuracy

- [ ] Run style validator
  - [ ] Test linguistic patterns
  - [ ] Test signature phrase integration
  - [ ] Test tone consistency
  - [ ] **Target:** >94% style fidelity

- [ ] Run edge case tests
  - [ ] Test paradox navigation (Layer 8)
  - [ ] Test contextual wisdom
  - [ ] Test handling of uncertainty
  - [ ] **Target:** All paradoxes functioning correctly

### 6.3 Validation Report Generation

- [ ] Compile results into comprehensive report
  - [ ] Overall fidelity percentage
  - [ ] Personality fidelity breakdown
  - [ ] Knowledge accuracy breakdown
  - [ ] Style fidelity breakdown
  - [ ] Edge case results
  - [ ] Issues found (if any)
  - [ ] Production readiness assessment

**Output:** `docs/logs/{timestamp}-validation_report.yaml`

**Target Metrics:**
- Overall fidelity: **≥94%**
- Personality: **≥94%**
- Knowledge: **≥90%**
- Style: **≥94%**

### 6.4 🔴 HUMAN CHECKPOINT: Production Approval

- [ ] Present final validation results
  - [ ] Show overall fidelity score
  - [ ] Highlight strengths and weaknesses
  - [ ] Present any issues found
  - [ ] Provide production readiness assessment

- [ ] Obtain production decision
  - [ ] **DEPLOY** → Finalize and document
  - [ ] **FIX_ISSUES** → Address problems, re-test
  - [ ] **ABORT** → Document reasons, archive

- [ ] If fixes needed:
  - [ ] Create fix task list
  - [ ] Iterate on system prompt
  - [ ] Re-run validation
  - [ ] Re-present for approval

---

## Phase 7: Finalization 🎯

**Estimated Time:** 30 min
**Status:** Pending (blocked by Phase 6)

### 7.1 Update Master Catalog

- [ ] Add Daniel Kahneman to `expansion-packs/mmos/minds/catalog.md`
  - [ ] Name: Daniel Kahneman
  - [ ] Version: 1.0
  - [ ] Created: {timestamp}
  - [ ] Fidelity: {percentage}%
  - [ ] Status: production
  - [ ] Generalista prompt path
  - [ ] Specialists (if any)
  - [ ] Primary use cases

### 7.2 Generate Pipeline Summary

- [ ] Create execution summary document
  - [ ] Pipeline mode: Greenfield
  - [ ] Resources used (time, tokens, cost)
  - [ ] Phases completed: 6/6 ✅
  - [ ] Outputs generated (counts)
  - [ ] Quality metrics (APEX, ICP, fidelity)
  - [ ] Human checkpoints executed (6/6)
  - [ ] Deliverables checklist
  - [ ] Status: COMPLETE & PRODUCTION-READY

**Output:** `docs/logs/{timestamp}-pipeline_summary.md`

### 7.3 Archive & Documentation

- [ ] Ensure all documentation complete
  - [ ] PRD finalized
  - [ ] TODO archived (mark all complete)
  - [ ] Operational manual available
  - [ ] Validation report documented
  - [ ] Pipeline summary generated

- [ ] Create backup/archive
  - [ ] Snapshot all artifacts
  - [ ] Version tag: v1.0
  - [ ] Archive logs and reports

---

## Human Checkpoints Summary

| # | Checkpoint | Phase | Status | Decision |
|---|------------|-------|--------|----------|
| 1 | Viability GO/NO-GO | 1 | ✅ COMPLETE | ✅ GO |
| 2 | Layer 6 Validation | 3 | ⏳ Pending | - |
| 3 | Layer 7 Validation | 3 | ⏳ Pending | - |
| 4 | Layer 8 Validation | 3 | ⏳ Pending | - |
| 5 | System Prompt Review | 5 | ⏳ Pending | - |
| 6 | Production Approval | 6 | ⏳ Pending | - |

---

## Progress Tracker

**Overall Progress:** Phase 1 Complete (1/6 phases) - 17%

- ✅ **Phase 1: Viability** (100%) - COMPLETE
- ⏳ **Phase 2: Research** (0%) - NEXT UP
- ⏳ **Phase 3: Analysis** (0%)
- ⏳ **Phase 4: Synthesis** (0%)
- ⏳ **Phase 5: Implementation** (0%)
- ⏳ **Phase 6: Validation** (0%)

**Next Action:** Begin Phase 2 - Source Discovery and Collection

---

## Notes & Constraints

- **HUMAN CHECKPOINTS ARE MANDATORY** - Cannot skip critical validation points
- **Minimum source requirements:** ✅ Exceeded (5+ books, 17+ interviews, 100+ papers)
- **Target fidelity:** 94% (industry standard)
- **Layer 8 (Paradoxes)** is the differentiator - creates authentic human depth
- **Triangulation mandatory** for Layers 5-8 (multiple source confirmation)
- **Deceased status:** March 2024 - no new primary content, but rich existing material
- **Respectful handling:** Honor legacy, clear AI disclosure, educational focus

---

**Last Updated:** 2025-10-07
**Next Milestone:** Complete Phase 2 (Research Collection)
**Estimated Completion:** 8-12 hours total (wall time with parallelization)
