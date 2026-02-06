# Integrated Frameworks: Cagan + Patton

**Mind:** cagan_patton
**Purpose:** Reusable methodologies and decision frameworks
**Source:** Synthesized from 12 sources + 8-layer DNA Mental™ analysis

---

## Framework 1: Strategic Opportunity Assessment (Cagan)

### Purpose
Filter and validate product opportunities before committing resources.

### When to Use
- Considering new product/feature initiatives
- Quarterly/annual planning
- When stakeholders request features
- Before starting discovery work

### The 10 Questions

1. **What problem will this solve?** (Value proposition)
   - Must be crisp, clear, compelling
   - NOT a feature list

2. **For whom will this solve it?** (Target market)
   - Specific customer segments
   - Can you reach them?

3. **How big is the opportunity?** (Market size)
   - TAM, SAM, SOM analysis
   - Revenue potential

4. **What alternatives are customers using today?** (Competitive landscape)
   - Direct and indirect competitors
   - Current workarounds

5. **Why are we best suited to pursue this?** (Differentiation)
   - Unique capabilities
   - Competitive advantages

6. **Why now?** (Market timing)
   - What's changed?
   - Why is this the right moment?

7. **How will we go to market?** (GTM strategy)
   - Distribution channels
   - Customer acquisition strategy

8. **How will we measure success?** (Success metrics)
   - Outcome measures (not output)
   - Leading and lagging indicators

9. **What factors are critical to success?** (Success requirements)
   - Must-haves for this to work
   - Risks and dependencies

10. **What's your recommendation?** (Go/no-go)
    - Build, buy, partner, or pass?
    - Confidence level

### Output
- Written assessment (2-4 pages, NOT 50-page MRD)
- Go/no-go decision
- Strategic context for empowered team

### Integration with Patton
- **If GO:** Proceed to Story Mapping (Framework 2)
- **If NO-GO:** Document reasoning, prevent future debates

---

## Framework 2: User Story Mapping (Patton)

### Purpose
Visually decompose solutions to create shared understanding and enable incremental delivery.

### When to Use
- After opportunity validated (Framework 1)
- Starting new product/major feature
- When team lacks shared understanding
- Planning releases and MVPs

### The Process

#### Step 1: Identify User Activities (The Backbone)
- **What:** High-level things users do
- **How:** Brainstorm activities, arrange left-to-right in user journey sequence
- **Example:** [Find Product] → [Purchase] → [Receive] → [Use] → [Get Support]

#### Step 2: Break into User Tasks (The Skeleton)
- **What:** Detailed steps under each activity
- **How:** For each activity, list specific tasks users perform
- **Arrange:** Vertically by priority (most important at top)

#### Step 3: Add Implementation Details
- **What:** User stories describing how system enables each task
- **How:** Stack vertically under tasks
- **Prioritize:** Top to bottom = essential to nice-to-have

#### Step 4: Identify Walking Skeleton
- **What:** Minimum end-to-end functionality
- **How:** Draw horizontal line through highest-priority items across ALL activities
- **Result:** Complete but simple system ("all the ribs")

#### Step 5: Slice Releases (Good → Better → Best)
- **Good:** Walking skeleton (MVP)
- **Better:** Enhanced version with more capability
- **Best:** Full-featured ideal state
- **Decision:** Choose based on time/value trade-offs

### Visual Structure

```
┌────────────────────────────────────────────────────────────┐
│ BACKBONE:  [Activity 1] → [Activity 2] → [Activity 3]     │
├────────────────────────────────────────────────────────────┤
│ SKELETON:     Task 1.1       Task 2.1       Task 3.1      │
│               Task 1.2       Task 2.2       Task 3.2      │
│  (Priority)      │               │               │         │
│     ↓         Story 1.1.1    Story 2.1.1    Story 3.1.1   │
│  DETAILS     Story 1.1.2    Story 2.1.2    Story 3.1.2   │
│              Story 1.2.1    Story 2.2.1    Story 3.2.1   │
├────────────────────────────────────────────────────────────┤
│ RELEASE 1: ═══════════════════ (Walking Skeleton)         │
│ RELEASE 2: ────────────────────────── (Enhanced)          │
│ RELEASE 3: ──────────────────────────────────── (Full)    │
└────────────────────────────────────────────────────────────┘
```

### Output
- Visual story map (physical or digital)
- Walking skeleton identified
- Release slices defined
- Shared understanding achieved

### Integration with Cagan
- **Input:** Validated opportunity from Framework 1
- **Process:** Empowered team leads mapping workshop
- **Output:** Feeds Framework 3 (Delivery Planning)

---

## Framework 3: Dual-Track Integration (Cagan + Patton)

### Purpose
Run discovery and delivery simultaneously within one team.

### Core Principles

#### 1. One Team, Two Tracks
- **NOT** separate discovery and delivery teams
- **NOT** sequential discovery then delivery phases
- **YES** same team doing both, continuously

#### 2. Different Characteristics

**Discovery Track:**
- Focus: Fast learning and validation
- Output: Validated assumptions, killed ideas
- Velocity: Variable (some experiments fail fast)
- Quality: Cheap prototypes, not production code

**Delivery Track:**
- Focus: Predictability and quality
- Output: Shippable product increments
- Velocity: Steady sprint rhythm
- Quality: Production-ready, scalable

#### 3. Whole-Team Participation
- Product Manager/Designer/Senior Engineer may lead discovery
- But entire team participates where possible
- Engineers contribute technology insights during discovery
- PMs/Designers understand delivery constraints

#### 4. Idea Elimination is Success
- "If we're doing discovery right, we substantially change and kill lots of ideas"
- Failed experiments = valuable learning
- Not all discovery work proceeds to delivery

#### 5. Continuous Measurement
- Discovery doesn't stop at launch
- Monitor outcomes post-release
- Feed learnings back into discovery

### How It Works

```
Sprint N:
  Discovery: Test 3 prototype variations with users
  Delivery: Ship stories from validated Sprint N-2 work

  Discovery findings influence Sprint N+2 delivery
  Delivery learnings inform Sprint N+1 discovery
```

### Integration Points
- **Discovery validates** what to build (Framework 1 - Opportunity Assessment)
- **Story mapping decomposes** how to build it (Framework 2)
- **Delivery implements** validated, decomposed solutions
- **Outcomes measurement** (Framework 5) feeds back to discovery

---

## Framework 4: Empowered Team Structure (Cagan)

### Purpose
Enable teams to deliver outcomes, not just output.

### The Empowerment Litmus Test

**True Empowerment =**
1. Team assigned **meaningful problems** (not features)
2. Team decides **HOW to solve** (method autonomy)
3. Team accountable for **outcomes** (not output)

**If leadership prescribes the solution → NOT empowered**

### Team Composition: The Product Trio

**Minimum Viable Team:**
- 1 Product Manager (business/value decisions)
- 1 Designer (user experience decisions)
- 1-10 Engineers (technical decisions)

**Why these three:**
- Different judgment domains
- Complementary expertise
- Irreducible for quality decisions

### Leadership Responsibilities

1. **Product Vision:** Where are we going? (North star)
2. **Product Strategy:** Which problems to solve? (Focus)
3. **Team Topology:** How work divided among teams? (Structure)
4. **Team Objectives:** What outcomes to achieve? (Results)
5. **Coaching:** How to improve? (Development)

### Management Responsibilities

1. **Staffing:** Hire for competence + character
2. **Coaching:** Weekly 1-on-1s, skill development
3. **Objectives:** Quarterly outcome-based goals

### Anti-Patterns to Avoid

- ❌ Feature roadmaps (prescribe solutions)
- ❌ Output metrics (stories completed)
- ❌ Separate discovery/delivery teams
- ❌ Stakeholder-driven priorities
- ❌ "Cultural fit" hiring (narrows diversity)

### Integration
- Empowered teams use Framework 1 (Opportunity Assessment)
- Teams facilitate Framework 2 (Story Mapping)
- Teams run Framework 3 (Dual-Track)
- Teams measure Framework 5 (Outcomes)

---

## Framework 5: Outcomes Over Output (Cagan)

### Purpose
Measure what matters: results, not activity.

### The Distinction

| Output | Outcome |
|--------|---------|
| Features shipped | Customer problems solved |
| Story points completed | Business metrics moved |
| Releases delivered | User behavior changed |
| Velocity maintained | Revenue/engagement/retention improved |

### Why Outcomes Are Hard

#### Problem 1: Vague Objectives
- ❌ "Provide integrated platform"
- ✅ "Help customers solve issues without contacting support"

#### Problem 2: Wrong Metrics
- Using existing KPIs (gas gauge) instead of problem-specific measures
- "The tachometer is a KPI, but not measuring if you solved the problem"

#### Problem 3: Missing Data Infrastructure
- Teams lack telemetry to measure outcomes
- Can't tell if solutions work

#### Problem 4: No Product Strategy
- Without strategy, can't connect business goals to team problems

### Prerequisites for Outcomes

1. **Adopt product model first** (can't layer OKRs onto feature factory)
2. **Clear problem statements**
3. **Appropriate success metrics defined upfront**
4. **Instrumentation in place**
5. **Product strategy connecting goals to problems**

### Measurement Framework

For each problem:
1. **Leading indicator:** Early signal (e.g., trial signups)
2. **Lagging indicator:** Actual outcome (e.g., conversion to paid)
3. **Counter-metric:** Prevent gaming (e.g., trial quality, not just quantity)

### Integration
- Opportunity Assessment (Framework 1) defines success metrics
- Empowered teams (Framework 4) accountable for outcomes
- Discovery/Delivery (Framework 3) iterates toward outcomes

---

## Framework 6: Strategic Focus (Cagan)

### Purpose
Concentrate resources on few pivotal objectives for maximum impact.

### The Core Principle

> "Good strategy works by focusing energy and resources on one, or a very few, pivotal objectives whose accomplishment will lead to a cascade of favorable outcomes."
> — Richard Rumelt (cited by Cagan)

### The Focus Problem

**Most organizations:**
- Believe they're focused
- Maintain 20-30 "critical" priorities
- Reality: 10x too many

**Causes:**
- Fear of missing opportunities
- Pressure from customers/stakeholders
- Reluctance to disappoint
- Need to explain lost deals

### The Real Constraint

**You can realistically focus on:** 1-3 pivotal objectives at org level

**More than that creates:**
- Context switching
- Management overhead
- Reduced throughput
- Activity without impact

### How to Focus

#### Step 1: List All Potential Objectives
- Don't filter yet
- Get everything on the table

#### Step 2: Apply Strategic Elimination
- Which 1-3 create "cascade of favorable outcomes"?
- What's the opportunity cost of each?
- Which can we defer without severe consequences?

#### Step 3: Say "No" with Strategic Courage
- Explain why (strategic reasoning)
- Document for future reference
- Resist stakeholder pressure

#### Step 4: Set WIP Limits at Org Level
- Not just team-level (Kanban boards)
- Limit number of concurrent initiatives
- Finish before starting new

### Integration with Story Mapping

- Strategic focus constrains WHICH problems (Cagan)
- Story mapping explores HOW to solve within bounds (Patton)
- Different scopes: Focus = problem selection; Mapping = solution exploration

---

## Framework 7: Shared Understanding Through Conversation (Patton)

### Purpose
Build genuine shared understanding, not just shared documents.

### The Core Insight

> "Shared documents aren't shared understanding."
> — Jeff Patton

### The Problem

- People sign off on documents
- Believe they understand
- Actually have different interpretations
- Misalignment emerges during execution

### The Solution: Conversation

**Documents as vacation photos:**
- Help you remember details
- Trigger memories of the experience
- Can't transfer the experience itself

**Understanding emerges from conversation:**
- Not from reading
- Through dialogue
- Via collaborative artifact creation

### The Story Lifecycle

1. **Card:** Write story on card (conversation prompt)
2. **Conversation:** Discuss what it means, how to test, edge cases
3. **Confirmation:** Agree on acceptance criteria

### Workshop Facilitation Pattern

#### Before Workshop
- Identify user activities (prep work)
- Prepare materials (cards, wall space)
- Set context (problem being solved)

#### During Workshop
- Facilitate, don't dictate
- Use questions to guide discovery
- Build map collaboratively
- Ensure all voices heard
- Document as you go

#### After Workshop
- Capture map visually
- Document decisions (as memory aid)
- Share with broader team
- Use as information radiator

### Anti-Patterns

- ❌ PM writes stories alone, hands to team
- ❌ Detailed specs without conversation
- ❌ Sign-off meetings (not workshops)
- ❌ Documents substituting for dialogue

### Integration
- Framework 2 (Story Mapping) creates conversation structure
- Framework 4 (Empowered Teams) participate in conversations
- Framework 3 (Dual-Track) uses conversation in discovery

---

## Framework 8: PRD → Story Map → Agent Tasks (Combo Integration)

### Purpose
End-to-end flow from strategy to executable tasks (unique to Cagan-Patton combo).

### The Integration Protocol

```
Phase 1: Strategic Validation (Cagan)
  ↓
[Opportunity Assessment - Framework 1]
  ↓
Decision: GO / NO-GO
  ↓
Phase 2: Solution Decomposition (Patton)
  ↓
[Story Mapping Workshop - Framework 2]
  ↓
Output: Visual map with walking skeleton identified
  ↓
Phase 3: Release Planning (Patton)
  ↓
[Slice releases: Good → Better → Best]
  ↓
Output: Prioritized release plan
  ↓
Phase 4: Execution (Cagan + Patton)
  ↓
[Dual-Track Development - Framework 3]
  ↓
Output: Shippable increments + ongoing discovery
  ↓
Phase 5: Validation (Cagan)
  ↓
[Outcomes Measurement - Framework 5]
  ↓
Output: Results data → Feed back to discovery
```

### Handoff Points

**Cagan → Patton Handoff:**
- Input: Validated opportunity + strategic context
- Process: Story mapping workshop with empowered team
- Output: Visual decomposition ready for implementation

**Patton → Cagan Validation:**
- Input: Delivered increment
- Process: Measure outcomes
- Output: Learning fed back to next cycle

### For AI Agent Decomposition

**Use this combo when:**
- AI needs to generate both PRD (Cagan) and tasks (Patton)
- Converting strategy into execution
- Ensuring strategic alignment + tactical clarity

**Process:**
1. Generate PRD using Opportunity Assessment (Framework 1)
2. Decompose PRD into story map (Framework 2)
3. Identify walking skeleton (minimum viable)
4. Extract tasks from map
5. Prioritize using good/better/best
6. Define outcome metrics (Framework 5)

---

## Framework Application Guide

| Situation | Primary Framework | Supporting Frameworks |
|-----------|-------------------|----------------------|
| New product idea | F1: Opportunity Assessment | F6: Strategic Focus |
| Feature request | F1: Opportunity Assessment | F4: Empowered Teams (problem, not feature) |
| Unclear requirements | F2: Story Mapping | F7: Shared Understanding |
| Team feeling like mercenaries | F4: Empowered Teams | F3: Dual-Track |
| Shipping features without impact | F5: Outcomes Over Output | F1: Opportunity Assessment |
| Too many priorities | F6: Strategic Focus | F1: Filter with assessments |
| Misaligned team | F7: Shared Understanding | F2: Story Mapping workshop |
| End-to-end product development | F8: Combo Integration | All frameworks |

---

## Provenance

**Synthesized from:**
- 12 source documents
- 8-layer DNA Mental™ analysis
- Cagan: SVPG blog articles + book concepts
- Patton: jpattonassociates.com + book concepts

**Validation:** All frameworks triangulated across multiple sources
**Confidence:** High
**Ready for:** System prompt generation, KB chunks, clone deployment
