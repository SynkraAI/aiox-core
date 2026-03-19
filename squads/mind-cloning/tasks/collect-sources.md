# Task: Collect & Validate Sources

Collect, classify and validate sources for mind DNA extraction. This is a BLOCKING GATE - extraction cannot proceed without passing validation.

---

## Metadata
- **task-id:** collect-sources
- **agent:** mind-cloner
- **elicit:** true
- **execution_type:** interactive

## Instructions

### Step 1: Identify the Expert

Ask the user:
1. Expert name
2. Primary domain (business, tech, psychology, etc.)
3. Any materials they can provide directly (Tier 0)

Use AskUserQuestion tool to collect this information.

### Step 2: Classify User Materials (Tier 0)

If the user provides materials:
- Index each as **Tier 0** (maximum confidence)
- Catalog: title, type, estimated volume, key topics
- These are the MOST valuable sources

Types accepted: PDFs, books, transcriptions, course notes, personal notes, interview recordings (transcribed).

### Step 3: Auto-Acquire Sources

#### 3.1 YouTube Auto-Discovery (RECOMMENDED)

Before web searches, run the YouTube captions tool to auto-discover and extract transcripts from the expert's top videos (own channel + podcast appearances, interviews, keynotes):

```bash
python tools/youtube-captions/youtube_captions.py \
  --search "{expert_name}" --max 100 --min-duration 600 \
  -o squads/mind-cloning/minds/{mind_slug}/sources/transcripts/
```

This generates `_INDEX.md` and `_search_manifest.yaml` with extraction stats. Each transcript is a Tier 1 source (primary, by the expert). Requires `YOUTUBE_API_KEY` env var.

#### 3.2 Web Search Queries

Execute ALL these search queries for the expert:

**Primary Content (by the expert):**
```
"{name}" books
"{name}" interview transcript
"{name}" podcast appearance
"{name}" keynote speech
"{name}" masterclass
"{name}" framework methodology
```

**Secondary Content (about the expert):**
```
"{name}" biography
"{name}" case study
"{name}" best quotes
"{name}" principles philosophy
```

For each source found, classify by tier:

| Tier | Type | Confidence | Examples |
|------|------|-----------|----------|
| **Tier 0** | User materials | MAXIMUM | PDFs, books, transcriptions provided |
| **Tier 1** | Primary (by expert) | HIGH | Own books, direct interviews |
| **Tier 2** | Secondary (about expert) | MEDIUM | Biographies, case studies |
| **Tier 3** | Tertiary (aggregated) | LOW | Wikipedia, summaries |

### Step 4: Build Source Inventory

For each source, document:

```yaml
- id: "S01"
  title: ""
  type: "book|interview|article|video|course|podcast"
  tier: 0|1|2|3
  year: ""
  url: ""
  estimated_volume: "X pages / Y minutes"
  key_topics: []
  triangulates: ["S02", "S05"]  # Which other sources confirm same info
```

### Step 5: Validate Against Minimum Criteria (BLOCKING GATE)

**ALL criteria are mandatory:**

- [ ] 10+ total sources
- [ ] 5+ Tier 1 sources (primary)
- [ ] 3+ different source types
- [ ] 5+ hours OR 200+ pages of content
- [ ] Main framework triangulated (3+ sources confirm)

**Decision Matrix:**
- **GO:** 5/5 checks pass → proceed to extraction
- **CONDITIONAL:** 4/5 + acquisition plan → proceed with flag
- **NO-GO:** <4/5 → STOP, need more sources

### Step 6: Present Results

Show the user:
1. Total sources found by tier
2. Validation checklist results
3. GO / CONDITIONAL / NO-GO decision
4. If CONDITIONAL: what's missing and how to acquire
5. If NO-GO: expert may be too obscure, suggest alternatives

### Step 7: Generate Output

Save output to `squads/mind-cloning/minds/{mind_slug}/sources_inventory.yaml` using the template from `squads/mind-cloning/templates/sources-inventory-tmpl.yaml`.

## Important Notes

- NEVER proceed to Voice/Thinking DNA extraction without at least CONDITIONAL status
- Tier 0 (user materials) are worth more than ANY number of Tier 3 sources
- Less gold content > lots of bronze content
- If auto-acquire fails, try manual web search before declaring NO-GO
- Always ask user if they have additional materials before giving NO-GO
