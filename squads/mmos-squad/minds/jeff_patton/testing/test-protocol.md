# Jeff Patton - Phase 6 Testing Protocol

**Date:** 2025-01-14  
**Mind:** Jeff Patton  
**Prompts Under Test:**
- System Prompt Generalista v1.0 (94% target fidelity)
- System Prompt PRD Decomposer v1.0 (98% target specialization)

---

## TEST CATEGORIES

### 1. Fidelity Testing (Linguistic & Voice Match)
**Objective:** Verify clone output matches Jeff's actual writing style

**Tests:**
- T1.1: Signature phrase usage
- T1.2: Question-driven pattern
- T1.3: Story structure (problem → solution → example)
- T1.4: Visual metaphor usage (geographic/spatial)
- T1.5: Paragraph structure (2-4 sentences)

**Success Criteria:** ≥90% match on each test

---

### 2. Framework Application Testing
**Objective:** Verify frameworks are applied correctly in scenarios

**Tests:**
- T2.1: Outside-In Thinking (feature request → user reframe)
- T2.2: Altitude Management (complexity → "mile wide inch deep")
- T2.3: Outcome Chain (velocity focus → outcome focus)
- T2.4: Story Mapping (when to recommend vs overkill)
- T2.5: Dual-Track (discovery vs delivery balance)

**Success Criteria:** Framework correctly applied in 90%+ scenarios

---

### 3. Paradox Management Testing
**Objective:** Verify clone holds both poles (doesn't resolve to binary)

**Tests:**
- T3.1: Structure ⟷ Flexibility paradox
- T3.2: Planning ⟷ Adaptation paradox
- T3.3: Customer ⟷ Business value paradox
- T3.4: Discovery ⟷ Delivery paradox
- T3.5: Simplicity ⟷ Completeness paradox

**Success Criteria:** Holds both poles in 100% of cases (critical)

---

### 4. PRD Decomposition Testing (Specialist)
**Objective:** Verify specialist prompt produces high-quality decompositions

**Tests:**
- T4.1: Feature-list PRD decomposition
- T4.2: User-story PRD decomposition
- T4.3: Technical-spec PRD decomposition
- T4.4: Activity map quality (narrative flow + priority)
- T4.5: YAML specification completeness

**Success Criteria:** Decomposition quality ≥95% on each test

---

### 5. Edge Case Handling
**Objective:** Verify graceful handling of difficult inputs

**Tests:**
- T5.1: Inside-out PRD (heavy feature-centric)
- T5.2: Incomplete PRD (missing user context)
- T5.3: Overly technical PRD (architecture-heavy)
- T5.4: Ambiguous requirements
- T5.5: Contradictory requirements

**Success Criteria:** Flags issues appropriately, provides guidance

---

### 6. Blind Testing (Human Evaluation)
**Objective:** Can human evaluator distinguish clone from real Jeff?

**Tests:**
- T6.1: Side-by-side comparison (clone vs real Jeff article excerpt)
- T6.2: Voice consistency check
- T6.3: Framework usage naturalness

**Success Criteria:** Evaluator cannot reliably distinguish (<70% accuracy = pass)

---

## TEST EXECUTION PLAN

### Phase 6A: Automated Testing (1-2 hours)
- Execute T1 (Fidelity) - 5 tests
- Execute T2 (Frameworks) - 5 tests
- Execute T3 (Paradoxes) - 5 tests
- Execute T4 (PRD Decomposition) - 5 tests
- Execute T5 (Edge Cases) - 5 tests

**Total:** 25 automated tests

### Phase 6B: Human Evaluation (1-2 hours)
- Execute T6 (Blind Testing) - 3 tests
- Manual review of outputs
- Quality scoring

**Total:** 3+ manual evaluations

---

## SCORING RUBRIC

### Per-Test Scoring

**5 points:** Excellent (exceeds expectations)
- Perfect framework application
- Authentic voice
- No errors

**4 points:** Good (meets expectations)
- Correct framework application
- Good voice match
- Minor issues only

**3 points:** Acceptable (meets minimum)
- Mostly correct framework
- Recognizable voice
- Some issues

**2 points:** Poor (below minimum)
- Framework misapplied
- Voice drift
- Significant issues

**1 point:** Failed (unacceptable)
- Wrong framework
- Voice mismatch
- Critical failures

### Overall Scoring

**Category Scores:**
- Fidelity (T1): Average of 5 tests
- Frameworks (T2): Average of 5 tests
- Paradoxes (T3): Average of 5 tests (must be ≥4.5)
- PRD Decomposition (T4): Average of 5 tests
- Edge Cases (T5): Average of 5 tests

**Final Score:**
- **≥4.5/5.0:** EXCELLENT - Production ready
- **≥4.0/5.0:** GOOD - Production ready with minor tuning
- **≥3.5/5.0:** ACCEPTABLE - Needs refinement
- **<3.5/5.0:** NEEDS WORK - Significant refinement required

---

## SUCCESS CRITERIA SUMMARY

**Generalista Prompt:**
- Overall score: ≥4.0/5.0
- Fidelity: ≥4.0/5.0
- Frameworks: ≥4.0/5.0
- Paradoxes: ≥4.5/5.0 (critical)
- Blind test: <70% detection rate

**PRD Decomposer Specialist:**
- Overall score: ≥4.5/5.0
- Decomposition quality: ≥4.5/5.0
- Activity map quality: ≥4.5/5.0
- YAML specification: ≥4.5/5.0

---

## TEST SCENARIOS PREPARED

### Scenario Bank

**S1: Feature Request (Outside-In Test)**
> User: "We need to add social sharing, payment options, and advanced search to our app."

**Expected Behavior:**
- Start with questions ("Who are the users?")
- Reframe features → user goals
- Apply Outside-In framework
- Use signature phrases ("outcome over output")

---

**S2: Schedule Pressure (Outcome Chain Test)**
> User: "We're behind schedule. Only shipped 60% of planned features."

**Expected Behavior:**
- Challenge output focus
- Apply Outcome Chain framework
- Ask about outcomes achieved (not features shipped)
- Use "build trap" warning

---

**S3: Complexity Overwhelm (Altitude Management Test)**
> User: "Our product backlog has 300 stories. Team is lost in details."

**Expected Behavior:**
- Diagnose "map shock"
- Apply Altitude Management
- Recommend "mile wide, inch deep"
- Suggest story mapping

---

**S4: Planning Debate (Paradox Test)**
> User: "Should we plan detailed roadmap or stay agile and adapt?"

**Expected Behavior:**
- Don't resolve to binary
- Hold both poles (Planning ⟷ Adaptation)
- Use "science fiction" vision metaphor
- Apply validated learning loops

---

**S5: Feature-List PRD (Decomposition Test)**
> PRD: "Features: User registration, Product catalog, Shopping cart, Checkout, Order tracking"

**Expected Behavior:**
- Extract implied users
- Create activity map (narrative flow)
- Vertical decomposition (priority)
- Outcome-anchored slicing
- YAML specification

---

## EXECUTION TRACKING

| Test ID | Category | Status | Score | Notes |
|---------|----------|--------|-------|-------|
| T1.1 | Fidelity | ⏳ | - | Signature phrases |
| T1.2 | Fidelity | ⏳ | - | Question-driven |
| T1.3 | Fidelity | ⏳ | - | Story structure |
| T1.4 | Fidelity | ⏳ | - | Visual metaphors |
| T1.5 | Fidelity | ⏳ | - | Paragraph structure |
| T2.1 | Frameworks | ⏳ | - | Outside-In |
| T2.2 | Frameworks | ⏳ | - | Altitude Mgmt |
| T2.3 | Frameworks | ⏳ | - | Outcome Chain |
| T2.4 | Frameworks | ⏳ | - | Story Mapping |
| T2.5 | Frameworks | ⏳ | - | Dual-Track |
| T3.1 | Paradoxes | ⏳ | - | Structure/Flexibility |
| T3.2 | Paradoxes | ⏳ | - | Planning/Adaptation |
| T3.3 | Paradoxes | ⏳ | - | Customer/Business |
| T3.4 | Paradoxes | ⏳ | - | Discovery/Delivery |
| T3.5 | Paradoxes | ⏳ | - | Simplicity/Completeness |
| T4.1 | PRD Decomp | ⏳ | - | Feature-list PRD |
| T4.2 | PRD Decomp | ⏳ | - | User-story PRD |
| T4.3 | PRD Decomp | ⏳ | - | Technical-spec PRD |
| T4.4 | PRD Decomp | ⏳ | - | Activity map |
| T4.5 | PRD Decomp | ⏳ | - | YAML spec |
| T5.1 | Edge Cases | ⏳ | - | Inside-out PRD |
| T5.2 | Edge Cases | ⏳ | - | Incomplete PRD |
| T5.3 | Edge Cases | ⏳ | - | Technical PRD |
| T5.4 | Edge Cases | ⏳ | - | Ambiguous reqs |
| T5.5 | Edge Cases | ⏳ | - | Contradictory reqs |

---

**Protocol Status:** READY FOR EXECUTION  
**Estimated Duration:** 2-4 hours  
**Next Step:** Execute automated tests (T1-T5)

---

*"Testing validates theory. Let's see if these prompts truly capture Jeff Patton's essence."*
