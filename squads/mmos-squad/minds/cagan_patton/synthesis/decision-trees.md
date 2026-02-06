# Decision Trees: Cagan + Patton Combo

**Mind:** cagan_patton
**Purpose:** Structured decision logic and prioritization frameworks
**Source:** Layer 4 (Decision Architecture) + Frameworks synthesis

---

## Decision Tree 1: Should We Pursue This Opportunity?

**Use Case:** Filtering product/feature ideas
**Framework:** Cagan's Opportunity Assessment

```
START: New product/feature idea proposed
  ↓
Q1: Can we articulate the problem crisply?
  NO → REJECT (unclear value proposition)
  YES → Continue
  ↓
Q2: Can we identify specific customer segments?
  NO → REJECT (undefined market)
  YES → Continue
  ↓
Q3: Is the market opportunity significant?
  NO → DEFER (may revisit if market grows)
  YES → Continue
  ↓
Q4: Can we differentiate vs. alternatives?
  NO → REJECT (commoditized offering)
  YES → Continue
  ↓
Q5: Why are we best suited to solve this?
  NO CLEAR ADVANTAGE → REJECT (not strategic fit)
  CLEAR ADVANTAGE → Continue
  ↓
Q6: Why now? (What's changed?)
  NO CATALYST → DEFER (timing not right)
  CLEAR CATALYST → Continue
  ↓
Q7: Do we have a go-to-market strategy?
  NO → REJECT (can't reach customers)
  YES → Continue
  ↓
Q8: Can we measure success with outcomes?
  NO → RETURN TO Q1 (problem not clear enough)
  YES → Continue
  ↓
Q9: What must be true for this to succeed?
  CRITICAL FACTORS UNCERTAIN → DEFER (de-risk first)
  CRITICAL FACTORS ACHIEVABLE → Continue
  ↓
Q10: Build, buy, partner, or pass?
  BUILD → GO (proceed to Decision Tree 2)
  BUY/PARTNER → Acquisition/Partnership evaluation
  PASS → REJECT (document reasoning)
```

**Output:** GO/NO-GO + Strategic context document

---

## Decision Tree 2: How Should We Decompose This Solution?

**Use Case:** After opportunity validated (Tree 1 = GO)
**Framework:** Patton's Story Mapping process

```
START: Validated opportunity (from Tree 1)
  ↓
STEP 1: Assemble Team
  Product Manager + Designer + Senior Engineers
  ↓
STEP 2: Identify User Activities
  Brainstorm: What do users DO?
  Arrange: Left-to-right in journey sequence
  Validate: Does this tell the user's story?
    NO → Refine activities
    YES → Continue
  ↓
STEP 3: Break Into User Tasks
  For each activity, list specific tasks
  Arrange vertically by importance
  Validate: Do we have shared understanding?
    NO → More conversation needed
    YES → Continue
  ↓
STEP 4: Add Implementation Details
  User stories under each task
  Stack by priority (top = essential)
  ↓
STEP 5: Identify Walking Skeleton
  Draw horizontal line across ALL activities
  Include minimum from each activity
  Validate: Can we deliver end-to-end value?
    NO → Adjust line position
    YES → Continue
  ↓
STEP 6: Slice Releases
  GOOD: Walking skeleton (MVP)
  BETTER: Enhanced capabilities
  BEST: Full-featured ideal state
  ↓
OUTPUT: Visual story map with release slices
  → Proceed to Decision Tree 3 (Execution mode)
```

---

## Decision Tree 3: What's Our Execution Mode?

**Use Case:** Choosing development approach
**Framework:** Cagan's Dual-Track integration

```
START: Story map complete (from Tree 2)
  ↓
Q: How much do we know about the solution?
  ↓
  LOW CONFIDENCE (unvalidated assumptions)
    → DISCOVERY-HEAVY MODE
       - Build rapid prototypes
       - Test with users
       - Validate assumptions
       - Expect to kill/change ideas
       - When validated → Delivery track
  ↓
  MEDIUM CONFIDENCE (some validation)
    → BALANCED DUAL-TRACK MODE
       - Discovery on sprint N
       - Delivery on sprint N-2 validated work
       - Continuous learning loop
       - Both tracks run simultaneously
  ↓
  HIGH CONFIDENCE (proven solution, scaling)
    → DELIVERY-FOCUSED MODE
       - Emphasis on quality/scalability
       - Discovery for optimization
       - Predictable sprint rhythm
       - Outcome measurement post-launch

OUTPUT: Execution strategy with track balance
```

---

## Decision Tree 4: Is This Team Truly Empowered?

**Use Case:** Evaluating team empowerment level
**Framework:** Cagan's Empowerment Litmus Test

```
START: Assessing team empowerment
  ↓
Q1: Is the team assigned a PROBLEM or a FEATURE?
  FEATURE → NOT EMPOWERED (stakeholder-driven)
  PROBLEM → Continue
  ↓
Q2: Does the team decide HOW to solve it?
  NO (solution prescribed) → NOT EMPOWERED
  YES → Continue
  ↓
Q3: Is the team accountable for OUTCOMES?
  NO (measured on output) → NOT EMPOWERED
  YES → Continue
  ↓
Q4: Does the team have Product Trio?
  NO (missing PM/Designer/Engineer) → INCOMPLETE EMPOWERMENT
  YES → Continue
  ↓
Q5: Can the team run discovery AND delivery?
  NO (separate teams/phases) → LIMITED EMPOWERMENT
  YES → Continue
  ↓
Q6: Does leadership provide strategic context?
  NO (no vision/strategy) → DIRECTIONLESS
  YES → FULLY EMPOWERED ✓

SCORE:
- All YES → Truly empowered
- 4-5 YES → Mostly empowered (identify gaps)
- 2-3 YES → Limited empowerment (structural changes needed)
- 0-1 YES → Feature factory (systemic transformation required)
```

---

## Decision Tree 5: Should We Focus or Add This Priority?

**Use Case:** Managing strategic focus
**Framework:** Cagan's Strategic Focus principles

```
START: New priority/objective proposed
  ↓
Q1: How many current "critical" priorities exist?
  1-3 → Continue to Q2
  4-6 → WARNING ZONE (evaluate all priorities)
  7+ → OVERCOMMITTED (strategic review required)
  ↓
Q2: Will solving this create "cascade of favorable outcomes"?
  NO → REJECT
  YES → Continue
  ↓
Q3: What's the opportunity cost?
  What must we STOP to do this?
  NOTHING → Confirm we're not overcommitted (return to Q1)
  SOMETHING SPECIFIC → Continue
  ↓
Q4: Is the new priority MORE pivotal than what we'd stop?
  NO → REJECT new priority, keep current
  YES → Continue
  ↓
Q5: Can we explain WHY this is strategic to the team?
  NO → Not truly strategic (REJECT)
  YES → ADD TO FOCUS (replace lower-priority item)

RULE: Maximum 3 concurrent pivotal objectives
```

---

## Decision Tree 6: Do We Have Shared Understanding?

**Use Case:** Validating team alignment
**Framework:** Patton's Shared Understanding principles

```
START: Team about to execute on plan
  ↓
Q1: Can each team member draw/explain the user journey?
  NO → Shared documents ≠ shared understanding
      → FACILITATE STORY MAPPING WORKSHOP
  YES → Continue
  ↓
Q2: Do we agree on what "done" looks like for MVP?
  NO → Walking skeleton not identified
      → RETURN TO STORY MAP (draw release line)
  YES → Continue
  ↓
Q3: Can we describe value from user perspective?
  NO → Feature-focused (not user-outcome focused)
      → REVISIT USER ACTIVITIES
  YES → Continue
  ↓
Q4: Have we had the conversation (not just read docs)?
  NO → Document-driven (risky)
      → SCHEDULE COLLABORATIVE SESSION
  YES → Continue
  ↓
Q5: Can the team slice work into thin vertical increments?
  NO → Unclear decomposition
      → REFINE STORY MAP
  YES → SHARED UNDERSTANDING ACHIEVED ✓

OUTPUT: Ready for execution OR Specific workshop needed
```

---

## Decision Tree 7: What Outcome Metric Should We Use?

**Use Case:** Defining success measurement
**Framework:** Cagan's Outcomes Over Output

```
START: Need to measure initiative success
  ↓
Q1: Does the problem statement include measurable impact?
  NO → RETURN TO OPPORTUNITY ASSESSMENT (Q1)
  YES → Continue
  ↓
Q2: Is the metric focused on customer behavior change?
  NO (internal activity) → OUTPUT METRIC (not outcome)
      → REFRAME: What changes for customers?
  YES → Continue
  ↓
Q3: Can we measure it with existing instrumentation?
  NO → ADD INSTRUMENTATION (before starting)
  YES → Continue
  ↓
Q4: Is there a leading indicator (early signal)?
  NO → IDENTIFY ONE (can't wait for lagging)
  YES → Continue
  ↓
Q5: Is there a counter-metric (prevent gaming)?
  NO → ADD COUNTER-METRIC (prevent unintended consequences)
  YES → Continue
  ↓
VALIDATION: Can we answer "Did solving this move the metric?"
  NO → Metric not outcome-focused (revisit)
  YES → OUTCOME METRIC DEFINED ✓

OUTPUT:
- Primary outcome metric (lagging)
- Leading indicator
- Counter-metric
```

---

## Decision Tree 8: How Should We Slice This Release?

**Use Case:** Release planning
**Framework:** Patton's Good/Better/Best slicing

```
START: Story map complete with activities and tasks
  ↓
STEP 1: Identify Walking Skeleton
  Select minimum from EACH activity for end-to-end flow
  Validate: Can users complete core journey?
    NO → Adjust selection
    YES → GOOD (MVP)
  ↓
STEP 2: Add Enhancements
  Add depth to highest-value activities
  Improve UX, add flexibility
  Validate: Does this significantly improve user experience?
    NO → Move to BEST
    YES → BETTER (Enhanced)
  ↓
STEP 3: Add Full Features
  Complete all remaining stories
  All nice-to-haves
  → BEST (Full-Featured)
  ↓
DECISION POINT: Which slice to build?

EVALUATE:
- Time to market pressure? → GOOD (ship walking skeleton)
- Competitive differentiation needed? → BETTER (enhanced UX)
- Market leader positioning? → BEST (full feature set)

PATTON'S RULE: "Better to have GOOD in customers' hands than BEST in development"
```

---

## Decision Tree 9: Discovery or Delivery? (Real-time Triage)

**Use Case:** Sprint planning - allocating team capacity
**Framework:** Dual-Track integration

```
START: Sprint planning with backlog of work
  ↓
FOR EACH WORK ITEM:
  ↓
  Q: Is this validated with customers/users?
    ↓
    NO → DISCOVERY TRACK
      - Estimate: Small (prototype can fail fast)
      - Output: Learning (may kill idea)
      - Acceptance: Validated assumption OR killed idea
      - Assign: Product Trio leads (whole team can contribute)
    ↓
    YES → DELIVERY TRACK
      - Estimate: Standard story points
      - Output: Shippable increment
      - Acceptance: Production quality + tests
      - Assign: Full team capacity
  ↓
CAPACITY ALLOCATION:
  Early-stage product: 60% discovery, 40% delivery
  Growth-stage product: 40% discovery, 60% delivery
  Mature product: 20% discovery, 80% delivery

RULE: Never 0% discovery (continuous learning required)
```

---

## Decision Tree 10: Should We Write a PRD or Start Mapping?

**Use Case:** Choosing documentation approach
**Framework:** Combo integration protocol

```
START: Need to document/plan product work
  ↓
Q1: Is this a new opportunity (unvalidated)?
  YES → WRITE PRD FIRST
      - Use Opportunity Assessment framework
      - Answer 10 questions
      - Get GO/NO-GO decision
      - Then proceed to Q2
  NO (already validated) → Skip to Q2
  ↓
Q2: Do we need strategic context for leadership/stakeholders?
  YES → INCLUDE PRD SUMMARY
      - Problem, market, opportunity size
      - Strategic rationale
      - Success metrics
  NO → Proceed to Q3
  ↓
Q3: Do we need to build team shared understanding?
  YES → FACILITATE STORY MAPPING
      - Visual decomposition
      - Collaborative workshop
      - Walking skeleton identification
  NO → Proceed to Q4
  ↓
Q4: Do we need to communicate release plan externally?
  YES → EXTRACT FROM STORY MAP
      - Good/Better/Best slices
      - Timeline estimates
      - Value proposition per release
  NO → Done
  ↓
OUTPUT COMBINATION:
- Strategic opportunity: PRD (Cagan) + Story Map (Patton)
- Tactical feature: Story Map only
- External communication: PRD summary + Release slices
```

---

## Meta-Decision: Which Decision Tree Should I Use?

**Decision Tree Router:**

```
I need to decide...

...whether to pursue an idea
  → Tree 1: Opportunity Assessment

...how to decompose a solution
  → Tree 2: Story Mapping

...our development approach
  → Tree 3: Execution Mode

...if a team is truly empowered
  → Tree 4: Empowerment Litmus Test

...whether to add another priority
  → Tree 5: Strategic Focus

...if we're aligned as a team
  → Tree 6: Shared Understanding

...how to measure success
  → Tree 7: Outcome Metrics

...how to slice a release
  → Tree 8: Release Slicing

...discovery vs delivery allocation
  → Tree 9: Discovery/Delivery Triage

...what documentation to create
  → Tree 10: PRD vs Story Map
```

---

## Decision Heuristics Quick Reference

### Cagan's Quick Filters
- "Can we solve this better than alternatives?"
- "Will this create cascading value?"
- "Are we measuring outcomes or output?"
- "Does the team decide HOW?"
- "Do we have competence + character?"

### Patton's Quick Checks
- "Does this tell the user's story?"
- "Do we have shared understanding (not just documents)?"
- "Can we deliver end-to-end value?"
- "What's the next thin slice?"
- "Have we had the conversation?"

### Combo Integration Checks
- "Strategic context clear?" (Cagan) → "Visual decomposition ready?" (Patton)
- "Opportunity validated?" (Cagan) → "User journey mapped?" (Patton)
- "Outcome metrics defined?" (Cagan) → "Walking skeleton identified?" (Patton)

---

## Anti-Pattern Detection

**Use these decision trees to identify anti-patterns:**

| Anti-Pattern | Detection Tree | Remedy |
|--------------|----------------|--------|
| Feature factory | Tree 4 (Empowerment) | Transform to problem assignment |
| Too many priorities | Tree 5 (Focus) | Strategic elimination to 1-3 |
| Flat backlog chaos | Tree 2 (Story Mapping) | Visual 2D decomposition |
| Misaligned team | Tree 6 (Shared Understanding) | Facilitated workshop |
| Output-focused | Tree 7 (Outcome Metrics) | Define customer behavior change |
| Big-bang releases | Tree 8 (Release Slicing) | Identify walking skeleton |
| No discovery | Tree 9 (Track Allocation) | Add discovery capacity |

---

## Provenance

**Synthesized from:**
- Layer 4: Decision Architecture analysis
- Framework compilation (Frameworks.md)
- 12 triangulated source documents

**Validation:** All decision logic traced to specific source evidence
**Confidence:** High
**Ready for:** System prompt decision calibration, agent task generation
