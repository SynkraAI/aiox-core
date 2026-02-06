---
task-id: frameworks-identifier-analysis
name: Framework Extraction & Latticework Architecture
agent: synthesis-expert
version: 3.5.0
layer: synthesis
phase: 4

metadata:
  specialization: Mental Model Discovery & Latticework Architecture
  methodology: Munger-Inspired 5-Phase Framework Extraction
  estimated-time: 4-6 hours
  complexity: high

inputs:
  required:
    - @{mind}/artifacts/cognitive_architecture.yaml
    - @{mind}/artifacts/behavioral_patterns.md
    - @{mind}/artifacts/decision_patterns.yaml
    - @{mind}/artifacts/values_hierarchy.yaml
  optional:
    - @{mind}/artifacts/mental_models.md
  context:
    - clone_name: "[Mind name]"
    - archetype_principal: "[Identified archetype]"
    - domain_expertise: "[Area of specialization]"
    - temporal_period: "[Period covered by sources]"

outputs:
  primary:
    - @{mind}/artifacts/frameworks_synthesized.yaml
  format: yaml
  template: frameworks-synthesized.yaml

validation:
  checklist: synthesis-quality-validation.md
  required-frameworks: 7+
  evidence-per-framework: 3+
  cross-domain-validation: true
  first-principles-decomposition: true
  latticework-connections: true

quality-gates:
  - "Minimum 7 distinct frameworks extracted"
  - "Each framework has 3+ behavioral examples"
  - "Cross-domain applications tested"
  - "First-principles decomposition performed"
  - "Inversion boundaries documented"
  - "Latticework connections mapped"
  - "Bias patterns identified"
  - "Meta-framework specified"
  - "Validation tests passed"
  - "Implementation logic clear"

elicit: false
---

# Framework Extraction Specialist

## CORE PHILOSOPHY

> "You can't really know anything if you just remember isolated facts. If facts don't hang together on a latticework of theory, you don't have them in a usable form"
> — Charlie Munger

**METHODOLOGY OVER CATALOG:** Don't list known mental models. Extract frameworks SPECIFIC to this mind from raw data.

---

## PRIMARY OBJECTIVE

Discover and map the mental models this specific person uses to:
- Process information (perception frameworks)
- Make decisions (decision frameworks)
- Solve problems (problem-solving frameworks)
- Navigate relationships (social frameworks)
- Generate creative output (innovation frameworks)

Build a latticework showing how these frameworks interconnect and reinforce each other.

---

## MUNGER-INSPIRED EXTRACTION METHODOLOGY

### PHASE 1: PATTERN HUNTING (Discovery Mode)

**Objective:** Find repeating cognitive structures in raw behavioral data

#### Step 1.1: Decision Tree Extraction

Analyze documented decisions and extract implicit if-then rules:

```
When [Situation Type A] occurs:
  IF [Condition 1]
    THEN [Action/Conclusion Pattern]
  ELSE IF [Condition 2]
    THEN [Different Action Pattern]
```

**Evidence Required:**
- Minimum 3 instances of same pattern
- Consistent across different contexts
- Documented with dates/sources

#### Step 1.2: Causal Chain Mapping

Identify recurring cause-effect reasoning:

```
Person believes: A → B → C
Evidence:
- [Quote showing A→B reasoning]
- [Action showing B→C belief]
- [Outcome confirming C expectation]
```

**Look for:**
- Stated beliefs about causation
- Implicit assumptions in arguments
- Repeated explanatory patterns
- Predictive models they use

#### Step 1.3: Constraint Identification

What limits/boundaries does this person consistently respect?

```
Constraint Type: [Resource/Ethical/Practical/Temporal]
Manifestation: [How it shapes decisions]
Never violated in: [X] observed instances
Exception conditions: [When/if broken]
```

#### Step 1.4: Heuristic Discovery

Extract mental shortcuts consistently applied:

```
Heuristic Pattern: "[Name it descriptively]"
Rule: "When X, assume Y"
Accuracy: [How often correct?]
Domains: [Where applied?]
```

---

### PHASE 2: FIRST-PRINCIPLES DECOMPOSITION

**Goal:** Test if frameworks work across multiple domains (Munger's acid test)

**Method:** Domain Translation Challenge

For each framework candidate from Phase 1:

1. **Identify original domain:**
   ```
   Example: "First-principles thinking"
   Original domain: Engineering/Physics
   ```

2. **Test in 2+ different domains:**
   ```
   Domain Translation Test:

   Engineering → Philosophy:
   - Does first-principles thinking work for ethics?
   - Can you decompose "what is good?" to atomic truths?
   → YES: Socratic method is first-principles ethics

   Engineering → Business:
   - Does it work for market analysis?
   - Can you rebuild industry assumptions from scratch?
   → YES: Elon Musk rebuilding rocket cost structure

   VERDICT: Cross-domain validated ✅
   ```

3. **Document domain applicability map:**
   ```yaml
   framework:
     name: "First-Principles Thinking"
     cross_domain_validation:
       original_domain: "Engineering"
       tested_domains:
         - domain: "Philosophy"
           works: true
           example: "Socratic method"
         - domain: "Business"
           works: true
           example: "Cost structure rebuilding"
         - domain: "Psychology"
           works: partially
           example: "Behavioral assumptions can be questioned"
           limitations: "Emotions aren't always rational"
   ```

4. **Boundary testing:** Where does framework break down?
   ```
   First-Principles Limits:
   - Doesn't work well for: Emergent phenomena (consciousness, culture)
   - Fails when: System complexity > decomposition ability
   - Context-dependent: Better for physics than sociology
   ```

**Munger Filter:** If framework only works in one domain, it's not a framework - it's domain-specific knowledge. Discard or reclassify.

**Output Phase 2:** 8-15 cross-domain validated frameworks with applicability maps

---

### Phase 3: First-Principles Decomposition - Atomic Truth Extraction (45 min)

**Goal:** Break each framework to irreducible components

**Method:** Munger's "Remove All Context" Test

For each validated framework:

1. **Question all assumptions:**
   ```
   Framework: "80/20 Pareto Principle"

   Question 1: WHY does 80/20 emerge?
   → Answer: Power law distributions in complex systems

   Question 2: What MUST be true for this to work?
   → Answer 1: Inputs are NOT equal in impact
   → Answer 2: Distribution follows exponential not linear pattern
   → Answer 3: System has feedback loops amplifying small differences

   Question 3: What's left when we remove the numbers?
   → Core Axiom: "Unequal distribution of impact is natural law"
   ```

2. **Strip domain-specific language:**
   ```
   Domain-specific: "80/20 rule in sales productivity"
   Abstracted: "Concentration of outcomes in minority of inputs"

   Domain-specific: "Focus on high-leverage activities"
   Abstracted: "Optimize by identifying disproportionate impact factors"
   ```

3. **Inversion test** (Munger's favorite):
   ```
   Normal: "How does 80/20 help me succeed?"
   Inverted: "How would IGNORING 80/20 guarantee failure?"

   Failure Modes:
   - Treating all inputs as equal → wasted effort on trivial 80%
   - No measurement of impact → blind to what matters
   - Democratic resource allocation → spread thin

   Insight: Inversion reveals critical dependency on measurement
   ```

4. **Document atomic structure:**
   ```yaml
   framework:
     name: "Pareto Principle (80/20)"
     first_principles_decomposition:
       core_axioms:
         - "Unequal distribution is natural in complex systems"
         - "Small causes can have disproportionate effects"
         - "Feedback loops amplify initial advantages"

       necessary_conditions:
         - "Inputs must be measurable"
         - "System must have heterogeneous elements"
         - "Sufficient complexity for power law emergence"

       inversion_insights:
         failure_mode: "Equal treatment of unequal inputs"
         critical_dependency: "Measurement and tracking"
         false_assumption: "Democracy in resource allocation"
   ```

**Output Phase 3:** Each framework reduced to 3-5 core axioms with logical structure

---

### Phase 4: Interconnection Building - Weaving the Latticework (60 min)

**Goal:** Map how frameworks support, enhance, or contradict each other

**Method:** Munger's Latticework Construction

**NOT a list** - build a **knowledge web**:

1. **Complementary Pairing:** Which frameworks work better together?
   ```
   Pair: First-Principles + Inversion

   Synergy:
   - First-principles finds atomic truths
   - Inversion finds catastrophic failure modes
   - Together: Build from truth, avoid known disasters

   Enhanced Power: 1 + 1 = 3 (lollapalooza effect)
   ```

2. **Contradiction Mapping:** Which frameworks conflict?
   ```
   Conflict: "Move Fast Break Things" vs "Measure Twice Cut Once"

   Contradiction Analysis:
   - Both can't be true simultaneously...or can they?
   - Meta-framework: Speed vs accuracy is CONTEXT-DEPENDENT
   - Resolution: "Move fast in low-risk exploration, measure twice in high-risk execution"

   Synthesis: Context-switching rules elevate contradiction to wisdom
   ```

3. **Sequential Dependency:** Which must be understood before which?
   ```
   Dependency Chain:
   1. Circle of Competence (know what you know)
   2. First-Principles (decompose within competence)
   3. Cross-Domain Transfer (apply outside competence with care)

   Teaching Order: Must learn #1 before attempting #3
   ```

4. **Domain Bridging:** Which frameworks connect disparate fields?
   ```
   Bridge: "Evolution/Natural Selection"

   Connects:
   - Biology → Business (competitive markets select for fitness)
   - Economics → Culture (memes compete like genes)
   - Psychology → AI (neural networks evolve through selection)

   Power: Universal pattern recognition across all domains
   ```

5. **Build latticework map:**
   ```yaml
   framework_latticework:
     nodes:
       - id: "first_principles"
         name: "First-Principles Thinking"

       - id: "inversion"
         name: "Inversion"

       - id: "pareto"
         name: "80/20 Pareto"

     edges:
       - from: "first_principles"
         to: "inversion"
         relationship: "complementary_pair"
         synergy: "Build from truth + avoid failure = robust solutions"

       - from: "pareto"
         to: "first_principles"
         relationship: "sequential_dependency"
         note: "Must identify the vital 20% using first-principles analysis"

       - from: "inversion"
         to: "pareto"
         relationship: "validation_check"
         note: "Inverting Pareto: what if all inputs were equal? System would be linear not exponential"
   ```

**Munger Wisdom:** *"You've got to have models in your head and you've got to array your experience—both vicarious and direct—on this latticework of models"*

**Output Phase 4:** Complete latticework map showing framework relationships

---

### Phase 5: Usability Testing - Predictive Power Validation (45 min)

**Goal:** Ensure frameworks generate insights, not just explain known facts

**Method:** Munger's "Does it predict or just describe?" test

For each framework:

1. **Prediction Test:** Apply to novel situation not in source data
   ```
   Framework: "Skin in the Game"

   Known fact it explains: "Why investors who risk own money outperform"

   Novel prediction: "Will a consultant with no equity stake give same advice as one with 10% ownership?"
   → Prediction: No. Aligned incentives change recommendations.

   Test: Find example in real world...
   → Validated: McKinsey consultant (no skin) recommended expansion
   → Validated: Board member (20% equity) recommended consolidation

   VERDICT: Framework has predictive power ✅
   ```

2. **Explanation Test:** Does it explain previously mysterious patterns?
   ```
   Framework: "Lollapalooza Effects (multiple biases compound)"

   Mystery: Why do bubbles get so extreme before popping?

   Explanation using framework:
   - Social proof (everyone buying)
   - Authority bias (experts saying it's different this time)
   - Commitment/consistency (can't admit mistake)
   - Incentive (brokers earn on transactions)

   ALL acting together = 10x effect (not 4x)

   VERDICT: Previously inexplicable now makes sense ✅
   ```

3. **Action Guidance Test:** Does it suggest non-obvious actions?
   ```
   Framework: "Inversion (solve by avoiding failure)"

   Common approach: "How to build great company?"
   Inversion approach: "How to destroy company quickly?"

   Inverted Insights:
   - Hire for credentials not character → toxic culture
   - Optimize for quarterly earnings → sacrifice long-term
   - Avoid all risk → miss all opportunities

   Non-obvious actions:
   → Explicitly design failure-prevention systems
   → Hire slow (avoid #1), fire fast (fix #1 mistakes)
   → Define "unacceptable" before defining "desirable"

   VERDICT: Generates actionable insights ✅
   ```

4. **Error Reduction Test:** Does it prevent known failure modes?
   ```
   Framework: "Circle of Competence"

   Known failure mode: Experts confidently wrong outside their domain

   Prevention mechanism:
   - Explicitly mark competence boundaries
   - Acknowledge "I don't know" outside circle
   - Defer to domain experts when venturing out

   Example:
   - Buffett: "I don't understand tech, so I avoid it"
   - Result: Avoided dot-com bubble in 2000

   VERDICT: Directly prevents overconfidence errors ✅
   ```

5. **Document usability validation:**
   ```yaml
   framework:
     name: "Skin in the Game"
     usability_validation:
       prediction_test:
         novel_scenario: "Consultant advice with vs without equity"
         predicted_outcome: "Advice differs based on incentive alignment"
         real_world_validation: "Validated in multiple cases"
         result: PASS

       explanation_test:
         mystery: "Why do agency problems persist?"
         framework_explanation: "Misaligned incentives create perverse outcomes"
         explanatory_power: HIGH
         result: PASS

       action_guidance:
         situation: "Hiring advisors/consultants"
         framework_recommendation: "Ensure skin in game via equity/performance fees"
         non_obviousness: MEDIUM
         result: PASS

       error_prevention:
         failure_mode: "Bad advice from low-accountability advisors"
         prevention_mechanism: "Require aligned incentives"
         effectiveness: HIGH
         result: PASS
   ```

**Munger Standard:** If framework only describes, it's historical trivia. If it predicts and guides action, it's usable wisdom.

**Output Phase 5:** Validated frameworks with proven predictive and action-guidance power

---

## Output Format

Use template: `templates/frameworks-synthesized.yaml`

**Critical Sections:**

```yaml
frameworks_latticework:
  metadata:
    mind_name: ""
    analyst: "synthesis-expert"
    methodology: "Munger Latticework Construction"

  frameworks:  # 8-15 frameworks
    - framework_id: "fw_01"
      name: ""
      type: "[cause-effect/decision/constraint/optimization/pattern/heuristic]"

      description:
        summary: "[2-3 sentence explanation]"
        when_to_use: "[Contexts where applicable]"
        when_not_to_use: "[Known failure contexts]"

      cross_domain_validation:
        original_domain: ""
        validated_domains: []
        applicability_map: {}
        boundary_conditions: []

      first_principles:
        core_axioms: []
        necessary_conditions: []
        inversion_insights: {}

      latticework_connections:
        complements: []  # Which frameworks enhance this
        contradicts: []  # Which frameworks conflict
        prerequisites: []  # What must be known first
        enhances: []  # What this framework enhances

      usability:
        prediction_power: "[HIGH/MEDIUM/LOW]"
        explanation_power: "[HIGH/MEDIUM/LOW]"
        action_guidance: "[HIGH/MEDIUM/LOW]"
        error_prevention: "[HIGH/MEDIUM/LOW]"

  latticework_map:
    nodes: []  # Framework IDs
    edges: []  # Relationships between frameworks

  meta_insights:
    dominant_framework_types: []
    cross_domain_champions: []  # Frameworks that work everywhere
    context_sensitive: []  # Frameworks that need careful boundary management
    lollapalooza_combinations: []  # Which frameworks compound together
```

---

## Validation Checklist

After completion, execute: `*validate-synthesis`

Munger Quality Gates:
- [ ] **GATE 1:** Are frameworks interconnected (latticework) not isolated (list)?
- [ ] **GATE 2:** Has first-principles decomposition been performed rigorously?
- [ ] **GATE 3:** Have cross-domain applications been validated?
- [ ] **GATE 4:** Do frameworks have predictive power (not just descriptive)?
- [ ] **GATE 5:** Is inversion thinking applied to each framework?
- [ ] **GATE 6:** Are context boundaries clearly defined (when works vs fails)?
- [ ] **GATE 7:** Have lollapalooza combinations been identified?
- [ ] **GATE 8:** Does this enable multi-model thinking (not single-lens analysis)?

---

## Common Pitfalls

❌ **Listing famous frameworks without extraction**
- ✅ Solution: Extract frameworks FROM the mind's actual usage, don't impose external lists

❌ **Single-discipline frameworks**
- ✅ Solution: Every framework must validate across 2+ domains

❌ **Skipping first-principles decomposition**
- ✅ Solution: No framework accepted without atomic axiom extraction

❌ **Isolated frameworks (no latticework)**
- ✅ Solution: Build interconnection map showing relationships

❌ **Descriptive-only frameworks**
- ✅ Solution: Test prediction and action-guidance power

❌ **Ignoring inversion**
- ✅ Solution: Ask "how would this fail?" for every framework

---

**Munger's Final Wisdom:**

*"You may have noticed students who just try to remember and pound back what is remembered. Well, they fail in school and in life. You've got to hang experience on a latticework of models in your head."*

---

**Status:** Ready for execution
**Agent:** synthesis-expert (Charlie)
**Next Task:** communication-templates-extraction.md
