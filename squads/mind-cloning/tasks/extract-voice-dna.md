# Task: Extract Voice DNA

Extract HOW an expert communicates and writes - their complete communication genome.

---

## Metadata
- **task-id:** extract-voice-dna
- **agent:** mind-cloner
- **elicit:** true
- **execution_type:** interactive

## Prerequisites

- Sources collected and validated (collect-sources task completed with GO/CONDITIONAL)
- Source inventory available at `squads/mind-cloning/minds/{mind_slug}/sources_inventory.yaml`

## Instructions

### Phase 1: Vocabulary (15 min)

Extract from sources:

**Power Words (10-15):** Words with emotional weight the expert uses frequently.
For each: word, context (when they use it), weight (high/medium), frequency (count across sources, e.g. "47 occurrences in 9/18 sources") — see AN006.

**Signature Phrases (5-10):** Expressions that identify this person uniquely.
For each: phrase, when they use it.

**Favorite Metaphors (3-5):** How they explain complex concepts through comparison.
For each: concept (what they explain), metaphor (how they explain it).

**Vocabulary Rules:**
- `always_use`: Terms they consistently prefer
- `never_use`: Terms they actively avoid
- `transforms`: Common jargon → how THEY say it instead

### Phase 2: Anecdotes & Stories (15 min)

Extract:

**Recurring Stories:** Stories they tell REPEATEDLY across different contexts.
For each: title, lesson, trigger (when they tell it).

**Story Structure:** How they build narratives:
- `opening`: How they begin stories
- `build_up`: How they develop tension
- `payoff`: How they deliver the point
- `callback`: Whether/how they reference stories later

### Phase 3: Writing Style (15 min)

Extract:

**Structure:**
- Paragraph length (short/medium/long)
- Sentence length (short/medium/long)
- Opening pattern (how they start pieces)
- Closing pattern (how they end pieces)

**Rhetorical Devices:**
- Questions (how/when they use them)
- Repetition (patterns of emphasis)
- Direct address (how they address the audience)
- Humor (type and frequency)

**Formatting:**
- Emphasis style (bold/italic/CAPS)
- Special characters usage
- List/bullet preferences

### Phase 4: Tone & Voice (10 min)

Rate on 1-10 scale across 7 dimensions:

| Dimension | Scale |
|-----------|-------|
| warmth_distance | 1=warm, 10=distant |
| direct_indirect | 1=direct, 10=indirect |
| formal_casual | 1=formal, 10=casual |
| complex_simple | 1=complex, 10=simple |
| emotional_rational | 1=emotional, 10=rational |
| humble_confident | 1=humble, 10=confident |
| serious_playful | 1=serious, 10=playful |

Also map tone shifts by context: teaching, persuading, criticizing, celebrating.

### Phase 5: Communication Anti-Patterns (10 min)

Extract what the expert NEVER says/does:

**Never Say:**
For each: term, reason (why they avoid it), substitute (what they use instead).

**Never Do:**
For each: behavior, reason, workaround.

### Phase 6: Immune System (10 min)

Extract automatic rejections - what they reject BEFORE thinking:

**Automatic Rejections:**
For each: trigger, response speed (immediate/fast), typical response, tone shift.

**Emotional Boundaries:**
For each: boundary, auto-defense mechanism, intensity (1-10).

**Fierce Defenses:**
For each: value defended, how hard they fight, acceptable cost.

### Phase 7: Voice Contradictions (10 min)

CRITICAL: Contradictions make humans REAL. Resolving them = FAKE clone.

**Paradoxes:**
For each: paradox ("Defends X BUT does Y"), how it manifests, trigger for switching, clone instruction (ALWAYS "DO NOT RESOLVE - preserve").

**Preservation Note:** Contradictions are features, not bugs. A "too consistent" clone is a fake clone.

### Phase 8: Identity Statement

Compose a single sentence:
> "[Name] writes/speaks like ________________"

This must capture the ESSENCE of their voice in one phrase.

### Phase 9: Prosody & Parafonics (10 min) — AN008

**Skip if:** Expert has ONLY written content (no audio/video sources).
**Required if:** Expert has podcast, video, or interview audio sources.

Extract oral communication patterns that text alone cannot capture:

**Speech Rhythm:**
- Pace (fast/medium/slow/variable)
- Pause patterns (strategic pauses before punchlines? Thinking pauses?)
- Acceleration/deceleration (speeds up when excited? Slows for emphasis?)

**Vocal Characteristics:**
- Tone range (monotone vs expressive)
- Volume dynamics (gets louder when passionate? Drops voice for intimacy?)
- Vocal fry, breathiness, or other distinctive qualities

**Filler Patterns:**
- Common fillers ("uh", "you know", "right?", "like", "essentially")
- Frequency (rare = polished speaker, frequent = conversational)
- Strategic vs unconscious fillers

**Cadence & Musicality:**
- Sentence rhythm (staccato short bursts? Flowing long sentences?)
- List delivery (rapid-fire? Deliberate pause between items?)
- Question intonation patterns

**Format:** For each element: `{ pattern, frequency, context, example_timestamp_if_available }`

### Step Final: Quality Check

Run checklist from `squads/mind-cloning/checklists/voice-dna-quality.md`:

- [ ] 10+ power words
- [ ] 5+ signature phrases
- [ ] 3+ metaphors
- [ ] 3+ recurring stories
- [ ] Story structure mapped
- [ ] Voice dimensions filled (7/7)
- [ ] 3+ anti-patterns
- [ ] 2+ automatic rejections
- [ ] 1+ paradox documented
- [ ] Identity statement written

**Minimum score:** 8/10 → PASS

### Step Output: Generate Voice DNA File

Save output to `squads/mind-cloning/minds/{mind_slug}/voice_dna.yaml` using the template from `squads/mind-cloning/templates/voice-dna-tmpl.yaml`.

## Important Notes

- Work through sources systematically - don't skip any Tier 0/1 material
- ALWAYS triangulate: if only 1 source mentions something, flag it as hypothesis
- Preserve exact quotes when possible - paraphrasing loses voice DNA
- Voice contradictions are the MOST IMPORTANT section - spend extra time here
- Present findings to user for validation after each phase before moving on
