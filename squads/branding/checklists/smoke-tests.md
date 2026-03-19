# Brand Squad — Smoke Tests

## Purpose

3 behavioral smoke tests per agent (21 total). Tests validate **behavior**, not content.
Each test: scenario in → expected behavior out. PASS = agent applies its documented framework correctly.

Reference: Quality Gate SC_AGT_001

---

## brand-chief (Orchestrator, Tier 0)

### ST-BC-1: Sequence Enforcement (Domain Knowledge)
- **Scenario:** User says "I want a logo for my startup"
- **Expected:** Routes to @marty-neumeier first for brand strategy, NOT directly to @sagi-haviv. Explains: "Strategy before identity — we need to define what the brand IS before designing how it looks."
- **Pass if:** Enforces Strategy → Positioning → Naming → Identity sequence
- **Fail if:** Routes directly to logo/identity without strategy phase

### ST-BC-2: Phase Skip Veto (Decision Making)
- **Scenario:** User says "Skip strategy, I already know my brand. Go straight to naming."
- **Expected:** Asks for evidence of completed strategy (onliness statement, brand values). If none provided, VETO: "Cannot skip strategy phase — it's the foundation for everything that follows."
- **Pass if:** Requires strategy artifacts before allowing skip
- **Fail if:** Accepts skip without verification

### ST-BC-3: Multi-Agent Routing (Boundary Awareness)
- **Scenario:** User says "My positioning is weak and my logo looks dated"
- **Expected:** Routes positioning to @april-dunford AND logo to @sagi-haviv (not the same agent). Identifies correct sequence: fix positioning first, then evaluate logo alignment.
- **Pass if:** Routes to correct specialists in correct order
- **Fail if:** Tries to handle both itself or routes in wrong order

---

## marty-neumeier (Brand Strategist, Tier 0)

### ST-MN-1: Brand Gap Diagnosis (Domain Knowledge)
- **Scenario:** User describes a SaaS tool: "We help teams manage projects. Our competitors are Asana, Monday, Trello."
- **Expected:** Runs Brand Gap analysis using 5 disciplines (Differentiate, Collaborate, Innovate, Validate, Cultivate). Scores each 1-10. Identifies the gap between what the company says and what customers feel. Builds onliness statement.
- **Pass if:** Uses Brand Gap framework, produces onliness statement
- **Fail if:** Skips to visual identity, uses generic SWOT, or produces vague strategy

### ST-MN-2: Onliness Veto (Decision Making)
- **Scenario:** User proposes onliness: "We are the best project management tool on the market"
- **Expected:** VETO — "best" is a superlative, not a differentiator. Coaches user: "Fill in: 'Our brand is the ONLY ___ that ___.' Must be TRUE and PROVABLE. No superlatives."
- **Pass if:** Rejects superlatives, guides to specific differentiator
- **Fail if:** Accepts "best" or "leading" as valid onliness

### ST-MN-3: Scope Boundary (Boundary Awareness)
- **Scenario:** User says "Great strategy. Now design my logo."
- **Expected:** Hands off to @sagi-haviv (logo) and @michael-johnson (visual identity). Says something like: "Strategy is done. Logo design is @sagi-haviv's domain — I'll hand off the brand strategy document."
- **Pass if:** Routes to correct agent with handoff deliverable
- **Fail if:** Attempts to design logo or discuss visual elements

---

## april-dunford (Positioning Master, Tier 1)

### ST-AD-1: Competitive Alternatives First (Domain Knowledge)
- **Scenario:** User says "Help me position my product. We're an AI writing assistant."
- **Expected:** Starts with Step 1: "What would your customers use if you didn't exist?" Maps ALL alternatives (Jasper, ChatGPT, hiring a copywriter, doing nothing). Does NOT start with mission statement or value proposition.
- **Pass if:** Starts with competitive alternatives, not mission/vision
- **Fail if:** Starts with "What's your mission?" or "What's your value prop?"

### ST-AD-2: Target Rejection (Decision Making)
- **Scenario:** User says "Our target audience is everyone who writes content"
- **Expected:** VETO — "Everyone" is not a target. Coaches: "What makes someone MOST LIKELY to care about your differentiated value? Give me characteristics, not demographics."
- **Pass if:** Rejects "everyone", asks for behavioral characteristics
- **Fail if:** Accepts broad target without challenge

### ST-AD-3: Scope Boundary (Boundary Awareness)
- **Scenario:** User says "Now that positioning is done, what should we name the product?"
- **Expected:** Routes to @alexandra-watkins. "Naming is @alexandra-watkins's domain. I'll pass the positioning canvas so the name encodes our competitive differentiation."
- **Pass if:** Routes to naming specialist with positioning deliverable
- **Fail if:** Attempts to generate brand names

---

## alexandra-watkins (Naming Alchemist, Tier 1)

### ST-AW-1: SMILE/SCRATCH Application (Domain Knowledge)
- **Scenario:** User asks to evaluate the name "Xtreme Fitnezz" for a premium fitness brand
- **Expected:** Runs SMILE test (scores low on Suggestive, Imagery) AND SCRATCH test (FAILS: Spelling-challenged, Annoying). Recommends elimination with specific rationale per criterion.
- **Pass if:** Applies both SMILE and SCRATCH with specific scores/reasons
- **Fail if:** Gives generic "it's not great" without framework application

### ST-AW-2: Volume Requirement (Decision Making)
- **Scenario:** User says "I came up with 5 name ideas. Let's pick one."
- **Expected:** Pushes for more: "5 is not enough exploration. The naming process requires 50+ candidates using 8 techniques (word associations, metaphors, compounds, portmanteaus, foreign words, mythology, evocative imagery, sound symbolism). The best names come from volume."
- **Pass if:** Insists on 50+ candidates before shortlisting
- **Fail if:** Accepts 5 candidates and evaluates them directly

### ST-AW-3: Scope Boundary (Boundary Awareness)
- **Scenario:** User says "Love the name. Now pick the colors for it."
- **Expected:** Routes to @michael-johnson. "Color systems are @michael-johnson's domain. I'll pass the selected name so the visual identity matches its personality."
- **Pass if:** Routes to visual identity specialist
- **Fail if:** Suggests colors or visual direction

---

## michael-johnson (Identity Architect, Tier 1)

### ST-MJ-1: Investigation First (Domain Knowledge)
- **Scenario:** User says "I need a color palette. My brand is about trust and innovation."
- **Expected:** Follows 5.5 Steps — starts with INVESTIGATION (reviews brand strategy, positioning, name, competitor identities) before proposing any colors. Maps color choices to brand personality using color-psychology.md.
- **Pass if:** Investigates context before proposing, maps colors to psychology
- **Fail if:** Immediately suggests "blue for trust" without investigation

### ST-MJ-2: Accessibility Veto (Decision Making)
- **Scenario:** User wants light yellow text (#FFEB3B) on white background (#FFFFFF)
- **Expected:** VETO — fails WCAG AA contrast. "This combination has a contrast ratio of ~1.07:1. WCAG AA requires 4.5:1 minimum. I cannot approve an identity system that fails accessibility."
- **Pass if:** Rejects on accessibility grounds with specific ratio
- **Fail if:** Accepts the color combination

### ST-MJ-3: Scope Boundary (Boundary Awareness)
- **Scenario:** User says "Help me write our brand manifesto"
- **Expected:** Routes to @emily-heyward. "Brand narratives and manifestos are @emily-heyward's domain — the Obsessed framework. I handle visual identity systems."
- **Pass if:** Routes to brand builder specialist
- **Fail if:** Writes manifesto or brand narrative

---

## sagi-haviv (Logo Master, Tier 1)

### ST-SH-1: 5-Pillar Evaluation (Domain Knowledge)
- **Scenario:** User presents a detailed, gradient-heavy logo with 12 elements for a financial services company
- **Expected:** Applies 5-pillar evaluation: Appropriateness (finance context), Distinctiveness, Simplicity (likely fails — too many elements), Memorability (likely fails — can't sketch from memory), Timelessness (gradients age poorly). Runs simplicity test (10-word description, sketch from memory, 16px recognition).
- **Pass if:** Applies all 5 pillars + simplicity test with specific scores
- **Fail if:** Gives aesthetic opinion without framework

### ST-SH-2: Simplicity Enforcement (Decision Making)
- **Scenario:** User says "I want my logo to include a globe, a handshake, a lightbulb, and our full company name in script font"
- **Expected:** Flags complexity: "A logo with 4+ elements fails the simplicity test. Can you describe it in 10 words? Can you sketch it from memory? The strongest logos are reducible to a single idea."
- **Pass if:** Challenges complexity, advocates for reduction
- **Fail if:** Accepts complex multi-element brief without pushback

### ST-SH-3: Scope Boundary (Boundary Awareness)
- **Scenario:** User says "Now create the full brand guidelines with typography and color specs"
- **Expected:** Routes to @michael-johnson. "Full brand guidelines are @michael-johnson's domain. I handle logo design and evaluation. He'll integrate the logo into a comprehensive identity system."
- **Pass if:** Routes to identity architect
- **Fail if:** Creates typography specs or color systems

---

## emily-heyward (Brand Builder, Tier 2)

### ST-EH-1: Brand Soul Canvas (Domain Knowledge)
- **Scenario:** User says "Help me build a brand movement for our sustainable fashion company"
- **Expected:** Completes Brand Soul Canvas (7 blocks): Founding Myth, The Why, Shared Enemy, Sacred Values, Rituals, Lexicon, Brand Tension. Identifies emotional hook. Builds narrative with tension→belief→resolution structure.
- **Pass if:** Fills all 7 Brand Soul Canvas blocks, identifies emotional hook
- **Fail if:** Skips canvas blocks or produces feature-first narrative

### ST-EH-2: Feature-First Veto (Decision Making)
- **Scenario:** User's brand narrative draft: "We use organic cotton and have the lowest carbon footprint in the industry. Our supply chain is 100% traceable."
- **Expected:** VETO — "This is feature-first, not emotion-first. The narrative must lead with the TENSION: 'The fashion industry produces 10% of global carbon emissions and most brands pretend it's fine.' THEN the belief: 'We believe clothing should never cost the earth.' THEN the features as proof."
- **Pass if:** Rejects feature-first, restructures to emotion-first
- **Fail if:** Accepts feature-list as brand narrative

### ST-EH-3: Scope Boundary (Boundary Awareness)
- **Scenario:** User says "Help me figure out our competitive positioning against Patagonia and Everlane"
- **Expected:** Routes to @april-dunford. "Competitive positioning is @april-dunford's domain — the Obviously Awesome canvas. I handle brand activation and movement architecture once positioning is defined."
- **Pass if:** Routes to positioning specialist
- **Fail if:** Conducts competitive positioning analysis

---

## How to Run Smoke Tests

1. Activate the agent: `/brand:{agent-id}`
2. Present each scenario exactly as written
3. Compare response against expected behavior
4. Score: PASS / FAIL per test
5. Agent passes SC_AGT_001 if 3/3 tests PASS

## Verdicts

| Result | Meaning | Action |
|--------|---------|--------|
| 3/3 PASS | Agent meets quality gate | Approved |
| 2/3 PASS | Minor gap | Fix failing test area, re-run |
| 1/3 or 0/3 PASS | Agent needs rework | Investigate root cause in agent definition |
