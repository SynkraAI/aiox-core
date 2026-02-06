# 🔒 SPECIAL CASE: Private Individual Mind Mapping

**Mind:** José Amorim
**Type:** Private/Non-Public Individual
**Status:** ⚠️ **REQUIRES NEW WORKFLOW**

---

## 🚨 Critical Difference from Standard MMOS

### Standard MMOS Pipeline (Public Figures)
```
Phase 0: Viability → Research (web scraping) → Analysis → Synthesis → Implementation
```

**Assumes:** Abundant public sources (blogs, interviews, books, YouTube, etc.)

### José Amorim Reality
- ❌ No public blog
- ❌ No published books
- ❌ No public interviews
- ❌ No YouTube channel
- ❌ Limited/no social media presence
- ✅ **Direct access to person** (can interview directly)

---

## 🎯 Required: New "Private Individual" Workflow

### Option A: Interview-First Approach
```
Phase 0: Viability (modified)
  ↓
Phase 1: Structured Interviews (NEW)
  - Deep biographical interview
  - Decision-making scenarios
  - Values exploration
  - Life stories collection
  ↓
Phase 2: Analysis (same)
Phase 3: Synthesis (same)
Phase 4: Implementation (same)
Phase 5: Testing (with person directly)
```

### Option B: Hybrid Approach
```
Phase 0: Viability (modified - assess interview availability)
  ↓
Phase 1A: Limited Public Research
  - LinkedIn profile
  - Any available professional content
  - Second-hand references
  ↓
Phase 1B: Primary Data Collection (NEW)
  - Structured interviews (3-5 sessions)
  - Written reflections
  - Decision logs
  - Personal artifacts
  ↓
Phase 2-5: Standard pipeline
```

---

## 📋 New Artifacts Needed

### Interview Protocols
- **Session 1: Life Story & Values** (2-3 hours)
  - Early life influences
  - Formative experiences
  - Core values identification
  - Major life decisions

- **Session 2: Mental Models & Frameworks** (2 hours)
  - How do you make decisions?
  - What frameworks guide you?
  - Problem-solving approaches
  - Learning strategies

- **Session 3: Expertise Deep Dive** (2 hours)
  - Domain-specific knowledge
  - Unique perspectives
  - Contrarian beliefs
  - Blind spots (self-aware)

- **Session 4: Language & Communication** (1.5 hours)
  - Favorite phrases
  - Communication style
  - Writing samples
  - Vocabulary analysis

- **Session 5: Testing & Calibration** (1.5 hours)
  - Present scenarios
  - Test responses
  - Validate captured patterns
  - Iterative refinement

### New Source Types
```yaml
sources:
  - type: interview
    format: audio_transcript
    session_number: 1
    duration: "2h 30m"
    topics: [life_story, values, formative_experiences]

  - type: written_reflection
    format: document
    prompt: "Describe a difficult decision..."

  - type: decision_log
    format: structured_journal
    entries: 30
    timeframe: "3 months"
```

---

## 🤔 Questions for PO

### 1. Workflow Design
- Should we create a separate `private-individual-workflow.md`?
- Does this merit a new archetype: "Private Individual"?
- How does viability assessment change? (No APEX scoring based on public sources)

### 2. Interview Protocol
- Who conducts interviews? (User? Agent guides questions?)
- How many hours of interviews are sufficient?
- Audio recording + transcription? Or written Q&A?

### 3. Consent & Privacy
- Privacy considerations for private individuals?
- Consent forms needed?
- Data storage guidelines?

### 4. Quality Assurance
- How do we validate accuracy without public sources?
- Can family/friends provide validation?
- Iterative testing with person required?

### 5. MMOS Integration
- New prompts needed? (e.g., `viability_private_individual.md`)
- Modify existing prompts? (e.g., `research_interview_protocol.md`)
- New task in `tasks/` folder?

---

## 💡 Proposed Immediate Actions

### 1. Create New Story
```
Story 2.X: Private Individual Mind Mapping Workflow
Epic: MMOS Expansion
```

**Acceptance Criteria:**
- [ ] Interview protocol templates created
- [ ] Modified viability assessment (no APEX, different criteria)
- [ ] New prompts for interview-based research
- [ ] Testing protocol that involves the person
- [ ] Privacy & consent documentation
- [ ] Example: Successfully map José Amorim

### 2. Update Documentation
- Add "Private Individual" archetype to taxonomy
- Document differences from standard workflow
- Create template for private cases

### 3. Pilot with José Amorim
- Use as test case for new workflow
- Document learnings
- Refine protocol based on experience

---

## 📝 Current Status

**José Amorim Mind:**
- ✅ Directory structure created (standard)
- ⚠️ **BLOCKED:** Cannot proceed with standard MMOS pipeline
- 🔴 **WAITING:** PO decision on workflow approach

**Recommendation:**
Schedule PO discussion to design "Private Individual" workflow before proceeding.

---

## 🎯 Success Criteria for New Workflow

1. **Quality Parity:** Mind quality comparable to public figures
2. **Efficiency:** Complete in 15-20 hours (vs 10-12 for public figures)
3. **Validation:** 85%+ accuracy validated by person
4. **Privacy:** Fully compliant with privacy requirements
5. **Reusability:** Template works for other private individuals

---

**Created:** 2025-10-15
**Next Step:** Convene PO meeting to design workflow
**Priority:** HIGH (blocking José Amorim mind mapping)
