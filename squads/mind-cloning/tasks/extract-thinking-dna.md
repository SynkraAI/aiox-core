# Task: Extract Thinking DNA

Extract HOW an expert thinks - their frameworks, heuristics, and decision architecture.

---

## Metadata
- **task-id:** extract-thinking-dna
- **agent:** mind-cloner
- **elicit:** true
- **execution_type:** interactive

## Prerequisites

- Sources collected and validated (collect-sources task completed with GO/CONDITIONAL)
- Source inventory available at `squads/mind-cloning/minds/{mind_slug}/sources_inventory.yaml`

## Instructions

### Phase 0: Recognition Patterns - "Mental Radars" (10 min)

Extract what the expert NOTICES FIRST that others don't.

**Instant Detection:**
For each: domain, pattern (what they see in < 2 seconds), accuracy (X/10).

**Blind Spots:**
For each: domain, what they miss, why they miss it.

**Attention Triggers:**
For each: trigger ("When they see/hear..."), response ("Immediately does..."), intensity (high/medium/low).

### Phase 1: Frameworks (20 min)

**Primary Framework - The "Operating System":**

Every expert has ONE framework they use for EVERYTHING.

Questions to identify it:
- What process do they ALWAYS follow?
- What do they teach first?
- If they could teach ONE thing, what would it be?

Document:
- Name, purpose
- Steps (numbered, with action and output for each)
- When to use / when NOT to use

**Secondary Frameworks:**
For each: name, purpose, trigger (when to use).

**Diagnostic Framework:**
- Questions they ask to diagnose problems
- Red flags they look for
- Green flags they look for

### Phase 2: Heuristics (20 min)

Format: "IF [condition] → THEN [action]"

**Decision Heuristics:**
For each: ID (H001, H002...), rule ("IF ___ THEN ___"), rationale, exceptions.

**Veto Heuristics:**
For each: trigger ("IF ___"), action ("THEN stop/reject"), reason.

**Prioritization Heuristics:**
For each: rule, example.

### Phase 3: Decision Architecture (15 min)

**Decision Pipeline:**
Map the expert's decision-making process as stages:
- Input stage: what information they gather
- Analysis stage: what frameworks they apply
- Selection stage: how they choose between options
- Validation stage: how they confirm the decision

**Decision Weights:**
For each criterion: name, weight (high/medium/low), rationale.

**Risk Profile:**
- Overall tolerance (high/medium/low)
- Risk-seeking domains
- Risk-averse domains

### Phase 4: Thinking Anti-Patterns (10 min)

**Never Do:**
For each: action, reason why they never do it.

**Common Mistakes (that the expert corrects):**
For each: mistake, correction, how the expert does it instead.

### Phase 5: Objection Handling (10 min)

How the expert reacts to challenges:

**Common Objections:**
For each: objection, typical response, tone (educational/defensive/aggressive).

**Pushback Triggers:**
For each: trigger, auto-response, escalation behavior.

**Argumentation Style:**
- Debate preference (Socratic/direct/evidence-based)
- Use of evidence (data/anecdotes/authority)
- Willingness to admit being wrong

### Phase 6: Handoff Triggers (10 min)

When the expert delegates or stops:

**Limits:**
For each: domain, trigger condition, typical response, to whom they delegate.

**Self-Awareness:**
- Knows their limits? (true/false)
- Defensive about gaps? (true/false)
- Confidence in handoff?

### Step Final: Quality Check

Run checklist from `squads/mind-cloning/checklists/thinking-dna-quality.md`:

- [ ] Primary framework with 3+ steps
- [ ] 5+ documented heuristics
- [ ] 2+ veto heuristics
- [ ] Decision pipeline mapped
- [ ] 3+ anti-patterns
- [ ] 2+ recognition patterns
- [ ] 2+ objection responses
- [ ] 1+ handoff trigger
- [ ] All rules have rationale

**Minimum score:** 7/9 → PASS

### Step Output: Generate Thinking DNA File

Save output to `squads/mind-cloning/minds/{mind_slug}/thinking_dna.yaml` using the template from `squads/mind-cloning/templates/thinking-dna-tmpl.yaml`.

## Important Notes

- The primary framework is the MOST CRITICAL extraction - spend extra time identifying it
- Heuristics must be in IF/THEN format - vague descriptions are useless
- Anti-patterns are as important as patterns - what they DON'T do defines them
- Veto heuristics reveal values and non-negotiables - pay special attention
- Present findings to user for validation after each phase
- Can run in PARALLEL with extract-voice-dna if sources are already validated
