---
task-id: catalog-transcript
name: Catalog Transcript — Exhaustive Searchable Index
agent: timestamp-cataloger
version: 1.1.0
purpose: Create exhaustive searchable index of every utterance in a transcript

workflow-mode: hybrid
elicit: false

inputs:
  - name: transcript
    type: file_path
    description: "Raw transcript (CSV-quoted or WebVTT format)"
    required: true
  - name: known_speakers
    type: string_array
    description: "List of known speaker names for attribution"
    required: false
  - name: focus_topics
    type: string_array
    description: "Topics to tag with higher granularity"
    required: false

outputs:
  - path: "timestamp_index.yaml"
    format: yaml
    description: "Complete searchable index with tags, speakers, topics"
  - path: "{transcript_stem}.parsed.json"
    format: json
    description: "Intermediate skeleton for agent tagging"

dependencies:
  scripts:
    - squads/curator/scripts/catalog_transcript.py
  checklists:
    - checklists/timestamp-index-quality.md
---

# Task: Catalog Transcript

**Command:** `*catalog {transcript}`
**Execution Type:** Hybrid (Worker script for parsing/indexing + Agent for tagging)
**Worker Script:** `squads/curator/scripts/catalog_transcript.py`

---

## Task Anatomy

```yaml
task_name: catalog-transcript
status: active
responsible_executor: timestamp-cataloger
execution_type: hybrid
worker_script: "squads/curator/scripts/catalog_transcript.py"
input:
  required:
    - transcript: "Raw transcript (CSV-quoted or WebVTT format)"
  optional:
    - known_speakers: "List of known speaker names for attribution"
    - focus_topics: "Topics to tag with higher granularity"
output:
  file: "timestamp_index.yaml"
  intermediate: "{transcript_stem}.parsed.json (skeleton for Agent tagging)"
action_items:
  - "WORKER: python squads/curator/scripts/catalog_transcript.py parse <transcript> [--speakers ...]"
  - "  → Detects format, parses, normalizes, segments into utterances"
  - "  → Outputs .parsed.json skeleton with empty tags"
  - "AGENT: Read .parsed.json, fill speaker + 4 tagging dimensions per utterance"
  - "  → Only NL interpretation steps (speaker attribution, topic, emotion, action, reference)"
  - "WORKER: python squads/curator/scripts/catalog_transcript.py index <tagged_json> [--output ...]"
  - "  → Builds search indexes, generates timestamp_index.yaml"
  - "  → Runs QG-CAT validation"
acceptance_criteria:
  - "Every utterance cataloged with exact timestamp (no gaps)"
  - "Speaker attribution assigned to each utterance"
  - "All 4 tagging dimensions applied per utterance"
  - "Search indexes built (by_topic, by_speaker, by_emotion, by_reference)"
  - "Metadata complete (duration, utterance count, speakers)"
  - "timestamp_index.yaml generated with utterances and index sections"
```

---

## Hybrid Execution Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│  WORKER (Phase 1+2)                                              │
│  python squads/curator/scripts/catalog_transcript.py parse <transcript>         │
│  → Detect format, parse, normalize, segment                     │
│  → Output: {stem}.parsed.json (skeleton)                        │
├──────────────────────────────────────────────────────────────────┤
│  AGENT (Phase 3)                                                 │
│  Read .parsed.json → fill speaker + 4 tags per utterance        │
│  → Save tagged .parsed.json                                     │
├──────────────────────────────────────────────────────────────────┤
│  WORKER (Phase 4)                                                │
│  python squads/curator/scripts/catalog_transcript.py index <tagged_json>        │
│  → Build indexes, generate YAML, run QG-CAT                     │
│  → Output: timestamp_index.yaml                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## Phases

### PHASE 1+2: Detect, Parse & Segment (WORKER)
**Duration:** <30 seconds
**Executor:** `squads/curator/scripts/catalog_transcript.py parse`
**Mode:** Deterministic

```bash
python squads/curator/scripts/catalog_transcript.py parse <transcript_file> [--speakers "Name1,Name2"]
```

```yaml
steps:
  - step: 1.1
    action: "Read first 5-10 lines to detect format"
    executor: WORKER (regex pattern matching)
    formats:
      csv_quoted: 'First line contains "Timestamp","Segment" or lines match "MM:SS","text"'
      webvtt: "First line is WEBVTT or lines match HH:MM:SS.mmm --> HH:MM:SS.mmm"

  - step: 1.2
    action: "Parse all lines into normalized internal format"
    executor: WORKER (csv/webvtt parser)
    normalize_to: "HH:MM:SS timestamps, utterance objects"

  - step: 1.3
    action: "Report: format detected, total lines parsed, any errors"
    executor: WORKER (console output)

  - step: 2.1
    action: "Break into utterances (natural speech units)"
    executor: WORKER (structural rules)
    csv: "Each row = 1 utterance"
    webvtt: "Each cue = 1 utterance"

  - step: 2.2
    action: "Assign exact timestamps"
    executor: WORKER (extraction from source)
    csv: "Start from row, end estimated from next row"
    webvtt: "Start AND end from cue (truncate ms)"

  - step: 2.3
    action: "Normalize all output to HH:MM:SS"
    executor: WORKER (format conversion)

  - step: 2.4
    action: "Validate timeline (detect gaps/overlaps)"
    executor: WORKER (arithmetic comparison)

  - step: 2.5
    action: "Output skeleton .parsed.json with empty tags"
    executor: WORKER (JSON serialization)
```

**Checkpoint (automated by script):**
- [ ] Format detected correctly
- [ ] All lines parsed without errors
- [ ] Timestamps normalized to HH:MM:SS
- [ ] All utterances segmented
- [ ] Start and end timestamps assigned
- [ ] Timeline validated (gaps/overlaps reported)
- [ ] .parsed.json skeleton generated

---

### PHASE 3: Attribute & Tag (AGENT)
**Duration:** 3-5 min
**Executor:** Agent (timestamp-cataloger)
**Mode:** Semantic interpretation — ONLY phase requiring LLM

**Input:** `{stem}.parsed.json` from Phase 1+2

```yaml
steps:
  - step: 3.1
    action: "Read .parsed.json (pre-parsed, pre-segmented utterances)"
    note: "Utterances already have timestamps and text. Agent ONLY adds tags."

  - step: 3.2
    action: "Identify speaker for each utterance"
    executor: AGENT (requires NL interpretation)
    rules:
      - "Context clues (name mentions, greeting patterns)"
      - "Single speaker = mark all as primary (may be pre-filled by Worker)"
      - "Uncertain = mark as 'unknown' (never guess)"

  - step: 3.3
    action: "Apply 4 tagging dimensions per utterance"
    executor: AGENT (requires semantic understanding)
    dimensions:
      topic: "What is being discussed"
      emotion: "Emotional tone (neutral, excited, frustrated, emphatic, humorous)"
      action: "Speech act (question, statement, story, instruction, greeting)"
      reference: "References to people, products, books, tools, concepts"

  - step: 3.4
    action: "Save tagged .parsed.json (update in place)"
    note: "Set tags fields and speaker field. Keep _meta and structure intact."

  - step: 3.5
    action: "Validate tagging completeness"
    check: "Every utterance has all 4 dimensions tagged"
```

**Checkpoint:**
- [ ] Speaker attribution complete
- [ ] All 4 dimensions tagged per utterance
- [ ] No utterances left untagged
- [ ] .parsed.json saved with tags filled

---

### PHASE 4: Index & Deliver (WORKER)
**Duration:** <30 seconds
**Executor:** `squads/curator/scripts/catalog_transcript.py index`
**Mode:** Deterministic

```bash
python squads/curator/scripts/catalog_transcript.py index <tagged_json_file> [--output <path>]
```

```yaml
steps:
  - step: 4.1
    action: "Build search index structures"
    executor: WORKER (group-by operations)
    indexes:
      by_topic: "Map topic → utterance IDs"
      by_speaker: "Map speaker → utterance IDs"
      by_emotion: "Map emotion → utterance IDs"
      by_reference: "Map reference → utterance IDs"

  - step: 4.2
    action: "Generate timestamp_index.yaml"
    executor: WORKER (YAML serialization)
    include: "Metadata, utterances, all indexes"

  - step: 4.3
    action: "Run QG-CAT validation"
    executor: WORKER (automated checks)

  - step: 4.4
    action: "Report summary"
    executor: WORKER (console output)
    metrics: "Total utterances, topics, speakers, references, quality gate status"
```

**Checkpoint (automated by script):**
- [ ] All 4 indexes built
- [ ] timestamp_index.yaml generated
- [ ] QG-CAT mandatory checks run
- [ ] Summary metrics calculated

---

## Output Format

```yaml
# timestamp_index.yaml structure

catalog:
  metadata:
    cataloger: "timestamp-cataloger"
    date: "YYYY-MM-DD"
    source: "filename or URL"
    format: "csv_quoted | webvtt"
    duration: "HH:MM:SS"
    total_utterances: N
    speakers: ["speaker1", "speaker2"]

  utterances:
    - id: "UTT-001"
      start: "00:00:05"
      end: "00:00:12"
      speaker: "speaker_name"
      text: "The actual utterance text"
      tags:
        topic: "topic_name"
        emotion: "neutral | excited | frustrated | emphatic | humorous"
        action: "question | statement | story | instruction | greeting"
        reference: ["person", "product", "book"]

  indexes:
    by_topic:
      topic_name: ["UTT-001", "UTT-005"]
    by_speaker:
      speaker_name: ["UTT-001", "UTT-002"]
    by_emotion:
      excited: ["UTT-003", "UTT-007"]
    by_reference:
      product_name: ["UTT-004", "UTT-008"]
```

---

## Output Example

Concrete example of `timestamp_index.yaml` output (4 utterances from a transcript):

```yaml
catalog:
  metadata:
    cataloger: "timestamp-cataloger"
    date: "2026-02-18"
    source: "cohort-avancado-aula1.vtt"
    format: "webvtt"
    duration: "01:02:34"
    total_utterances: 312
    speakers: ["Alan", "unknown"]

  utterances:
    - id: "UTT-001"
      start: "00:00:05"
      end: "00:00:18"
      speaker: "Alan"
      text: "Bem-vindos ao cohort avançado. Hoje a gente vai falar sobre algo que a maioria das pessoas ignora completamente."
      tags:
        topic: "abertura"
        emotion: "excited"
        action: "greeting"
        reference: []

    - id: "UTT-002"
      start: "00:00:18"
      end: "00:00:42"
      speaker: "Alan"
      text: "A IA não vai substituir você. Ela vai substituir alguém que sabe usar IA melhor do que você."
      tags:
        topic: "IA e mercado de trabalho"
        emotion: "emphatic"
        action: "statement"
        reference: ["IA"]

    - id: "UTT-003"
      start: "00:01:05"
      end: "00:01:30"
      speaker: "Alan"
      text: "Pergunta pra vocês: quantos de vocês já usaram o ChatGPT hoje antes dessa aula?"
      tags:
        topic: "adoção de IA"
        emotion: "humorous"
        action: "question"
        reference: ["ChatGPT"]

    - id: "UTT-004"
      start: "00:01:30"
      end: "00:01:58"
      speaker: "unknown"
      text: "Eu uso todo dia. Mas ainda não sei se tô usando direito."
      tags:
        topic: "adoção de IA"
        emotion: "neutral"
        action: "statement"
        reference: []

  indexes:
    by_topic:
      "IA e mercado de trabalho": ["UTT-002", "UTT-003"]
      "abertura": ["UTT-001"]
      "adoção de IA": ["UTT-003", "UTT-004"]
    by_speaker:
      "Alan": ["UTT-001", "UTT-002", "UTT-003"]
      "unknown": ["UTT-004"]
    by_emotion:
      "excited": ["UTT-001"]
      "emphatic": ["UTT-002"]
      "humorous": ["UTT-003"]
      "neutral": ["UTT-004"]
    by_reference:
      "IA": ["UTT-002"]
      "ChatGPT": ["UTT-003"]
```

---

## Quality Gate: QG-CAT

**BLOCKING.** Must pass before use in mining or navigation.

```yaml
mandatory_checks:
  - "Every utterance has timestamp"
  - "No gaps in timeline"
  - "Every utterance has speaker attribution"
  - "All 4 tagging dimensions present per utterance"
  - "All 4 indexes generated"
  - "Metadata complete"

quality_checks:
  - "Unknown speakers < 10% of utterances"
  - "At least 3 distinct topics identified"
  - "Timestamp precision ±1 second"
  - "References extracted comprehensively"

pass_criteria:
  mandatory: "ALL must pass (100%)"
  quality: "At least 80% must pass"
```

---

## Anti-Patterns

```yaml
never_do:
  - "Skip format detection"
  - "Approximate timestamps"
  - "Guess speaker when uncertain (mark unknown)"
  - "Skip utterances or leave gaps"
  - "Mix timestamp formats in output"
  - "Leave any tagging dimension blank"
  - "Merge unrelated utterances"

always_do:
  - "Detect format before processing"
  - "Normalize ALL timestamps to HH:MM:SS"
  - "Catalog EVERY utterance"
  - "Apply all 4 tagging dimensions"
  - "Build all search indexes"
  - "Mark uncertainty explicitly (unknown speaker)"
  - "Preserve utterance boundaries"
```

---

## Handoff

```yaml
on_complete:
  pass_to: "curator-chief"
  deliver: "timestamp_index.yaml"
  context: "Catalog complete: {n} utterances, {topics} topics, {speakers} speakers."

alternative_handoffs:
  - to: "content-miner-pro"
    when: "Index ready for moment extraction"
  - to: "timestamp-cataloger"
    when: "Ready for navigation or search operations"
```

---

## Veto Conditions (BLOCKING)

| ID | Condition | Detection | Action |
|----|-----------|-----------|--------|
| VETO-01 | No transcript file provided | `transcript` input is null or file path does not exist on disk | BLOCK — cannot catalog without a transcript; ask user to provide a valid file path |
| VETO-02 | Transcript format unrecognizable | File does not match CSV-quoted pattern (`"Timestamp","Segment"`) nor WebVTT pattern (`WEBVTT` header or `HH:MM:SS.mmm --> HH:MM:SS.mmm` lines) | BLOCK — only `.vtt` WebVTT and CSV-quoted `.csv`/`.txt` are supported; ask user to convert the file |
| VETO-03 | File encoding not UTF-8 | Python `open(file, encoding='utf-8')` raises `UnicodeDecodeError` | BLOCK — re-encode file to UTF-8 before processing (`iconv` or text editor Save As UTF-8) |

---

## Dependencies

| Type | File | When Used |
|------|------|-----------|
| Worker Script | `squads/curator/scripts/catalog_transcript.py` | Phase 1+2 (parse) and Phase 4 (index) |
| Data | `data/moment-types.yaml` | Reference for tagging (Phase 3) |

---

## Usage

```bash
# HYBRID PIPELINE (recommended)

# Step 1: Worker parses transcript → skeleton JSON
python squads/curator/scripts/catalog_transcript.py parse raw/transcripts/video.vtt --speakers "Alan,Guest"
# Output: raw/transcripts/video.parsed.json

# Step 2: Agent tags utterances (speaker + 4 dimensions)
@curator:timestamp-cataloger
# Agent reads video.parsed.json, fills tags, saves

# Step 3: Worker builds indexes → final YAML
python squads/curator/scripts/catalog_transcript.py index raw/transcripts/video.parsed.json
# Output: raw/transcripts/timestamp_index.yaml

# ONE-SHOT (Agent handles everything — legacy, slower)
@curator:timestamp-cataloger
*catalog raw/transcripts/video-001.vtt --speakers "Alan,Guest"
```

---

## Format Detection Details

### CSV-Quoted Format
```csv
"Timestamp","Segment"
"00:00","Hello everyone"
"00:05","Today we're talking about..."
```

**Characteristics:**
- Header row with "Timestamp","Segment" or similar
- Timestamps in MM:SS or HH:MM:SS
- Text in quoted strings

### WebVTT Format
```
WEBVTT

00:00:00.000 --> 00:00:05.000
Hello everyone

00:00:05.000 --> 00:00:12.000
Today we're talking about...
```

**Characteristics:**
- First line: `WEBVTT`
- Timestamp range: `HH:MM:SS.mmm --> HH:MM:SS.mmm`
- Text on separate line after timestamp

---

## Tagging Dimensions Reference

### Topic
What subject is being discussed (not emotional tone).
Examples: marketing, AI, productivity, storytelling, pricing

### Emotion
Emotional tone of delivery.
Values: neutral, excited, frustrated, emphatic, humorous, contemplative

### Action
Speech act being performed.
Values: question, statement, story, instruction, greeting, objection, call-to-action

### Reference
Named entities mentioned.
Categories: person, product, book, tool, concept, company

---

## Methodology: Dialogue Cataloging Method

**6-Step Process:**

1. **Format Recognition** - Detect CSV vs WebVTT, validate structure
2. **Timestamp Normalization** - Convert all to HH:MM:SS
3. **Utterance Segmentation** - Respect natural speech boundaries
4. **Speaker Attribution** - Context clues, never guess
5. **Multi-Dimensional Tagging** - All 4 dimensions per utterance
6. **Index Construction** - Build navigable search structures

**Core Principle:** Every utterance is findable by 4+ paths (time, speaker, topic, emotion, reference).

---

_Task Version: 1.1.0_
_Executor: Hybrid (Worker script + Agent tagging)_
_Worker: squads/curator/scripts/catalog_transcript.py_
_Agent: timestamp-cataloger (Phase 3 only)_
_Quality Gate: QG-CAT (blocking, automated in Worker)_
_Methodology: Dialogue Cataloging Method (6 steps)_
