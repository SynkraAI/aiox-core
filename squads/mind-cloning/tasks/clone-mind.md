# Task: Clone Mind (Full Workflow)

Orchestrate the complete mind cloning pipeline: Collect Sources → Extract Voice DNA → Extract Thinking DNA → Synthesize → Smoke Test.

---

## Metadata
- **task-id:** clone-mind
- **agent:** mind-cloner
- **elicit:** true
- **execution_type:** interactive

## Instructions

### Step 1: Identify Expert

Ask the user:
1. **Expert name** (required)
2. **Domain** (business, tech, psychology, philosophy, etc.)
3. **Target fidelity** (Basic, Intermediate, Premium, Elite)
4. **Materials available?** (PDFs, books, transcriptions, etc.)
5. **Output directory** (default: `squads/mind-cloning/minds/{mind_slug}/`)

Create the output directory if it doesn't exist.

### Step 2: Phase 1 - Collect Sources (BLOCKING GATE)

Execute task: `squads/mind-cloning/tasks/collect-sources.md`

**If NO-GO:** Stop workflow. Inform user that expert has insufficient sources.
**If CONDITIONAL:** Proceed with flag, note gaps.
**If GO:** Continue to Phase 2.

### Step 3: Phase 2 - Extract Voice DNA (BLOCKING GATE)

Execute task: `squads/mind-cloning/tasks/extract-voice-dna.md`

Work through all 9 phases systematically (including Phase 9: Prosody).
Present each phase's findings to user for validation.

**Gate:** Voice score must be >= 8/10 to proceed. See `workflows/full-mind-clone.yaml` for enforcement details.

### Step 4: Phase 3 - Extract Thinking DNA (BLOCKING GATE)

Execute task: `squads/mind-cloning/tasks/extract-thinking-dna.md`

Work through all 7 phases systematically.
Present each phase's findings to user for validation.

**Gate:** Thinking score must be >= 7/9 to proceed. See `workflows/full-mind-clone.yaml` for enforcement details.

NOTE: Phases 2 and 3 CAN run in parallel if separate sessions are available.

### Step 5: Phase 4 - Synthesize Mind (BLOCKING GATE)

Execute task: `squads/mind-cloning/tasks/synthesize-mind.md`

Combine Voice + Thinking DNA into complete mind DNA.
Calculate fidelity level. Generate quality dashboard.
Run synthesis quality checklist: `squads/mind-cloning/checklists/synthesis-quality.md`

**Gate:** DNA Mental coverage must be >= 6/8 layers. See `workflows/full-mind-clone.yaml` for enforcement details.

### Step 6: Phase 5 - Smoke Tests (BLOCKING GATE)

Execute task: `squads/mind-cloning/tasks/smoke-test.md`

Run 3 validation tests with user participation.
**All 3 tests must pass (score >= 7/10 each).**

### Step 7: Final Report

Present complete results:

```
🧬 Mind Clone Complete: {expert_name}

📊 Results:
   - Sources: {total} ({tier_1} Tier 1)
   - Voice DNA: {score}/10
   - Thinking DNA: {score}/9
   - Fidelity: {level} ({percentage}%)
   - Smoke Tests: {passed}/3

📁 Output files:
   - sources_inventory.yaml
   - voice_dna.yaml
   - thinking_dna.yaml
   - mind_dna_complete.yaml
   - smoke_test_result.yaml
   - quality_dashboard.md

🚀 Next steps:
   1. Review mind_dna_complete.yaml
   2. Use to create an agent: @squad-creator *create-agent
   3. Or use directly as system prompt context
```

## Important Notes

- This is the FULL workflow - expect 2-4 hours for Premium/Elite fidelity
- **Five BLOCKING GATES:** Sources (Phase 1), Voice DNA (Phase 2), Thinking DNA (Phase 3), Synthesis (Phase 4), Smoke Tests (Phase 5)
- Enforcement details and gate conditions are defined in `workflows/full-mind-clone.yaml` (single source of truth for pipeline logic)
- User participation is required at multiple points
- For faster iteration, users can run individual phases separately
- The workflow produces 6 output files in the mind's directory
- Default output directory: `.claude/commands/mind-cloning/minds/{mind_slug}/outputs/`
