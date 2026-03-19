# Task: Extract SOP from Video/Transcript

## Task Anatomy

| Field | Value |
|-------|-------|
| **Task ID** | `extract-from-video` |
| **Version** | `1.0.0` |
| **Status** | `active` |
| **Responsible Executor** | `sop-extractor` |
| **Execution Type** | `Agent` |

## Metadata
```yaml
id: extract-from-video
name: "Extract SOP from Video/Transcript"
category: extraction
agent: sop-extractor
elicit: true
autonomous: false
description: "Convert a video tutorial transcript or spoken-word process description into a structured SOP. Separates procedural instructions from commentary, identifies temporal sequence, and assigns confidence scores based on the directness of instruction."
```

## Purpose

Videos and recorded walkthroughs are one of the richest sources of process knowledge, yet they are unsearchable, unversioned, and impossible to use as reference documents. This task takes a video transcript (or detailed video description) and extracts a structured SOP from it, filtering out commentary, filler, and tangential content to isolate the actual procedural steps.

This is particularly valuable for:
- Converting training videos into formal SOPs
- Capturing expert knowledge from screen recordings
- Documenting processes demonstrated in live sessions
- Extracting procedures from podcast/interview explanations

## Prerequisites

- [ ] Transcript of the video is available (text format)
- [ ] Process name is identified
- [ ] Video context is understood (training video, screen recording, live demo, interview)

## Inputs

```yaml
inputs:
  transcript:
    type: string
    required: true
    description: "Full text transcript of the video. Can include timestamps, speaker labels, and auto-generated captions. Accepts raw, unedited transcription."

  video_context:
    type: string
    required: false
    description: "Context about the video: what type (training, demo, interview), who is speaking (expert, trainer, novice), what is being shown (screen, physical, whiteboard), and intended audience."

  process_name:
    type: string
    required: true
    description: "Name of the process being demonstrated or described in the video"
```

## Transcript Content Classification

```yaml
content_types:
  procedural_instruction:
    description: "Direct instructions on how to perform a step"
    examples:
      - "First, you click on the Settings icon"
      - "Now drag the file into the upload area"
      - "Make sure you check the box before submitting"
    confidence: 0.9
    include: true

  demonstration_narration:
    description: "Narration of what the speaker is doing in real-time"
    examples:
      - "So I'm going to go ahead and open the dashboard"
      - "And here you can see I'm selecting the dropdown"
      - "Watch as I enter the values into each field"
    confidence: 0.8
    include: true

  explanation:
    description: "Why something is done, not how"
    examples:
      - "The reason we do this first is because..."
      - "This is important because if you skip it..."
      - "The way this works under the hood is..."
    confidence: 0.6
    include: "as context notes, not as steps"

  tangential:
    description: "Off-topic comments, jokes, filler"
    examples:
      - "By the way, did you see the new office?"
      - "Um, let me think about that for a second"
      - "Sorry, my dog just walked in"
    confidence: 0.0
    include: false

  conditional_instruction:
    description: "Instructions that apply only in certain situations"
    examples:
      - "If you're on a Mac, you'd use Command instead"
      - "For enterprise accounts, there's an extra step here"
      - "In case you get an error, try restarting"
    confidence: 0.7
    include: "as conditional steps or notes"

  safety_warning:
    description: "Cautions or warnings about what NOT to do"
    examples:
      - "Never do this in production without a backup"
      - "Be careful not to delete the original"
      - "Warning: this action cannot be undone"
    confidence: 0.9
    include: "as WARNING markers before relevant steps"

  tip_optimization:
    description: "Optional tips for better results"
    examples:
      - "A pro tip here is to also..."
      - "You can speed this up by..."
      - "What I like to do is..."
    confidence: 0.5
    include: "as TIP notes after relevant steps"
```

## Workflow / Steps

### 1. Parse Transcript

```
ACTION: Process the raw transcript into analyzable segments

OPERATIONS:
  a) Clean transcript
     - Remove filler words (um, uh, like, you know) from analysis
     - Preserve timestamps if present
     - Identify speaker changes if multiple speakers

  b) Segment by topic
     - Break transcript into logical segments
     - Each segment = one topic or action group
     - Use transitions as segment boundaries:
       "next", "now", "then", "after that", "moving on",
       "the next step", "once that's done"

  c) Classify each segment
     - procedural_instruction
     - demonstration_narration
     - explanation
     - tangential
     - conditional_instruction
     - safety_warning
     - tip_optimization

OUTPUT: segments = [
  {
    id: <number>,
    timestamp: "<if available>",
    speaker: "<if identified>",
    text: "<segment text>",
    type: "<content classification>",
    include: <true|false>,
    confidence: <0.0-1.0>
  }
]
```

### 2. Extract Procedural Steps

```
ACTION: Filter and transform included segments into procedure steps

EXTRACTION RULES:
  a) Include ONLY segments classified as:
     - procedural_instruction (as main steps)
     - demonstration_narration (as main steps)
     - conditional_instruction (as conditional branches)
     - safety_warning (as WARNING markers)

  b) Transform natural language to action steps:
     - "So I'm going to click on Settings" -> "Click on Settings"
     - "You want to make sure you save first" -> "Save the current work"
     - "And then what you do is drag it over" -> "Drag the item to the target area"

  c) Preserve speaker's specific terminology
     - If they say "the blue button", keep "the blue button"
     - If they name a specific menu item, keep the exact name

  d) Extract embedded details:
     - UI element names (buttons, menus, fields)
     - File names and paths
     - Specific values or settings
     - Keyboard shortcuts

FOR EACH extracted step:
  step = {
    number: <sequential>,
    action: "<transformed action statement>",
    original_text: "<verbatim from transcript>",
    timestamp: "<if available>",
    tools_mentioned: ["<tools>"],
    ui_elements: ["<buttons, menus, fields>"],
    expected_result: "<if mentioned>",
    warnings: ["<any safety warnings>"],
    tips: ["<any optimization tips>"],
    conditions: ["<any conditions that apply>"],
    confidence: <score>,
    confidence_marker: "<marker>"
  }
```

### 3. Identify Sequence

```
ACTION: Order steps chronologically based on transcript position and logical dependencies

ORDERING RULES:
  a) Default: transcript order (temporal sequence)
  b) Override if logical dependency requires reordering
  c) Group related steps into phases
  d) Identify parallel paths (things done simultaneously in the video)

HANDLE COMMON VIDEO PATTERNS:
  - Backtracking: "Actually, I should have done X first" -> reorder X before current
  - Repetition: "Let me show that again" -> don't duplicate the step
  - Alternative demo: "Another way to do this is..." -> add as alternative path
  - Error correction: "Oops, that was wrong. Let me..." -> use the corrected version
  - Preview then detail: "In a moment we'll... but first..." -> maintain logical order

OUTPUT: ordered_steps[] with phase groupings
```

### 4. Add Context

```
ACTION: Enrich steps with contextual information from the transcript

EXTRACT AND ATTACH:
  a) Materials/Prerequisites
     - Software versions mentioned
     - Account types or permissions needed
     - Files or data required
     - Prior setup steps referenced

  b) Tools and Systems
     - Software applications shown/mentioned
     - Browser, OS specifics
     - Hardware requirements
     - Plugins or extensions

  c) Environment Details
     - Screen resolution or display setup
     - Network requirements
     - Security context (VPN, credentials)

  d) Explanatory Context
     - WHY certain steps are done (from explanation segments)
     - Common mistakes mentioned
     - Troubleshooting tips shared

ATTACH context to relevant steps as notes
```

### 5. Structure as SOP Draft

```
ACTION: Apply human SOP template to extracted content

APPLY create-sop-human template with additions:
  - Mark as "DRAFT - EXTRACTED FROM VIDEO"
  - Include "Video Source" in references section
  - Add transcript segments as appendix (optional)
  - Include confidence markers on each step

SPECIAL SECTIONS:
  - Video Source: title, URL (if known), duration, speaker
  - Extraction Notes: what was clear vs. inferred
  - Screenshots Needed: flag steps that would benefit from screenshots
    (the video had visual context that text cannot convey)
```

### 6. Mark Confidence

```
ACTION: Assign final confidence scores to all extracted steps

CONFIDENCE RULES FOR VIDEO EXTRACTION:
  - Direct instruction with demonstration: 0.9
    "Click here" while showing the click
  - Direct instruction without demonstration: 0.8
    "You would click here" (not shown)
  - Demonstration without instruction: 0.7
    Speaker does something but doesn't verbally explain
  - Implied from context: 0.6
    Step not stated but logically required between stated steps
  - Inferred from explanation: 0.4
    "The system does X" (not shown, not instructed)
  - Assumed from industry knowledge: 0.3
    Standard practice not mentioned in video

ADD SPECIAL FLAGS:
  - [VISUAL] = Step relies on visual context from video (screenshot needed)
  - [AUDIO] = Step includes audio cue (alarm, notification sound)
  - [SPEED] = Video was sped up here (may be missing micro-steps)
  - [CUT] = Video had a cut here (steps may be missing)
```

## Output

```yaml
outputs:
  primary:
    path: "outputs/sop-factory/extraction/{process-name}-video-draft-sop-v{version}.md"
    format: markdown
    description: "Draft SOP extracted from video transcript with confidence annotations"

  secondary:
    - path: "outputs/sop-factory/extraction/{process-name}-video-extraction-log.md"
      format: markdown
      description: "Detailed extraction log showing transcript-to-step mapping"

  metadata:
    transcript_word_count: "<number>"
    segments_total: "<number>"
    segments_procedural: "<number>"
    segments_excluded: "<number>"
    steps_extracted: "<number>"
    avg_confidence: "<0.0-1.0>"
    visual_flags: "<number of steps needing screenshots>"
    gaps_identified: "<number>"
```

## Acceptance Criteria

- [ ] Steps are extracted from actual instructions, not commentary
- [ ] Confidence annotations are present on every step
- [ ] Temporal order is maintained (or logically corrected with notes)
- [ ] Tangential content is excluded from procedure steps
- [ ] Safety warnings are preserved and positioned before relevant steps
- [ ] Visual-dependent steps are flagged with [VISUAL] marker
- [ ] Video source information is documented in references
- [ ] Draft is clearly marked as extracted from video (not original SOP)
- [ ] Steps that relied on visual demonstration include notes about what was shown
- [ ] Extraction log maps each step back to transcript segment

## Veto Conditions

- STOP if transcript is empty or has fewer than 100 words
- STOP if transcript contains no identifiable procedural content (purely conversational)
- STOP if transcript language cannot be interpreted (corrupted auto-captions with < 50% intelligibility)
- STOP if process name cannot be determined from transcript and is not provided
- STOP if the transcript covers multiple unrelated processes without clear boundaries (ask user to specify which process)
