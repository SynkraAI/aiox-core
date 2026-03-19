# Timestamp Index Quality Gate (QG-CAT)

**Purpose:** Quality validation checklist for catalog-transcript task output (timestamp index).

**Agent:** @content-miner-pro
**Task:** `squads/curator/tasks/catalog-transcript.md`
**Output:** `{source-slug}/timestamps.md` + `{source-slug}/INDEX.md`
**Applies to:** After Phase 3 (Index Generation), before Phase 4 (Validation)

---

## ✓ Format & Structure

- [ ] All timestamps in HH:MM:SS format (00:00:15, not 15s or "15 seconds")
- [ ] Timestamps are chronological (ascending order, no reversals)
- [ ] Each entry contains exactly: timestamp, type, title, quote snippet (4 required fields)
- [ ] Markdown formatting consistent (no typos in headers, bold, italics)
- [ ] No extra whitespace or formatting corruption
- [ ] File headers match: `# {source-slug} Timestamp Index` and metadata (source, duration, total moments)

---

## ✓ Timestamp Validity

- [ ] No timestamp exceeds source total duration (e.g., if video is 45:30, no timestamp > 45:30)
- [ ] No timestamp before 00:00:00 (no negative or out-of-range times)
- [ ] Timestamps have no leading zeros artifacts (00:05:01 ✓, 00:005:01 ✗)
- [ ] Time separator is colon `:` only (no dots, hyphens, or other separators)
- [ ] At least 3-5 seconds gap between consecutive timestamps (no clustering of overlapping moments)
- [ ] Density check: at least 1 moment per 5 minutes of source (if 30 min video, minimum 6 moments)

---

## ✓ Moment Type Validation

- [ ] All moment `type` values match squads/curator/data/moment-types.yaml IDs:
  - `hook` — attention-grabbing openers
  - `insight` — actionable knowledge, frameworks
  - `story` — narrative with arc
  - `quote` — quotable, shareable statements
  - `transition` — natural bridges between topics
  - `b_roll_cue` — moments needing visual support
- [ ] No invalid types (no typos like "hok", "b-roll", "hookshot", "quotation")
- [ ] Type distribution makes sense for format (e.g., shorts-focused index has multiple hooks; documentary-focused has stories)

---

## ✓ Quotes & Content Accuracy

- [ ] Each quote snippet is EXACT match from transcript (not paraphrased, not truncated mid-word)
- [ ] Quote snippets are representative (start and end at logical word boundaries, not mid-sentence)
- [ ] Quote length is reasonable (20-150 characters typical; flagged if >200 or <10 without note)
- [ ] Title accurately describes the moment (no misleading framing)
- [ ] No corrupted text: no garbled characters, no mid-word line breaks, no HTML entities (&nbsp;, &quot;, etc.)
- [ ] Cross-reference: each quote found in source transcript at or near the timestamp (within ±2 seconds)

---

## ✓ Duplicate & Overlap Detection

- [ ] No exact duplicate timestamps (two moments at 00:15:30)
- [ ] No near-duplicate timestamps within 5-second window (e.g., 00:15:30 and 00:15:32 flagged as overlap)
- [ ] No duplicate quotes (same text appearing twice in index)
- [ ] If near-duplicates exist, one is removed or merged with a note

---

## ✓ INDEX.md Summary Statistics

- [ ] INDEX.md generated with header: `# {source-slug} Index Summary`
- [ ] Metadata present:
  - [ ] Source title and URL
  - [ ] Total duration (HH:MM:SS)
  - [ ] Total moments extracted
  - [ ] Date indexed
- [ ] Type breakdown table: count of each moment type (hook, insight, story, quote, transition, b_roll_cue)
- [ ] Average impact_score (if scoring present in moments data)
- [ ] Density metric: moments per minute (e.g., "1.2 moments per minute")
- [ ] Format recommendation (shorts / longform / documentary) based on type distribution
- [ ] Top 5 moments by quality/impact (if ranked)
- [ ] Link to full `timestamps.md` file

---

## ✓ Dependency & Traceability

- [ ] INDEX.md references the full timestamp file: `→ [Full Index](timestamps.md)`
- [ ] Transcript file referenced: `Source: {source-slug}/transcript.md`
- [ ] Moments data file referenced: `Data: {source-slug}/momentos.md`
- [ ] Backlink verified: each referenced file exists and is accessible
- [ ] Version/changelog entry added to timestamp file (date, agent, phase completed)

---

## ✓ Edge Cases & Completeness

- [ ] If source duration unknown, duration field set to "estimated" with note
- [ ] If fewer than expected moments, flag with reason (e.g., "source is low-intensity tutorial, 0.8 moments/min acceptable")
- [ ] If no moments of a certain type, document why (e.g., "No stories in technical reference guide - expected")
- [ ] Long moments (>120s) flagged if they exceed typical_duration_seconds for their type
- [ ] Short moments (<5s) for hook/quote types verified as intentional (not truncation error)

---

## ✓ Before Approval

- [ ] Read entire `timestamps.md` file for consistency (spot-check 3-5 random timestamps against transcript)
- [ ] Run INDEX.md stats: total moments count matches number of rows in timestamps.md
- [ ] Verify no broken references (all file paths resolve)
- [ ] Check for notes on problematic moments (anything flagged as "review" or "verify")
- [ ] If any item above is unchecked → Return to Phase 2/3 for correction
- [ ] All checks pass → Ready for Phase 4 (Validation) or delivery

---

## Approval Signature

```
Quality Gate: [ ] PASS [ ] NEEDS WORK [ ] HOLD FOR REVIEW

Agent: _________________     Date: _________________

Notes:
```

---

**Reference:**
- moment-types.yaml: `squads/curator/data/moment-types.yaml`
- catalog-transcript task: `squads/curator/tasks/catalog-transcript.md`
- Source format: `_temp/mining/{source-slug}/`
