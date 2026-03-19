---
task-id: analyze-sources
name: Source Analysis - Extract Frameworks, Quotes & Concepts
agent: mind-content-updater
version: 1.0.0
purpose: Analyze collected sources to extract key frameworks, signature phrases, recurring concepts, and philosophy

workflow-mode: interactive
elicit: true
elicitation-type: custom

inputs:
  - name: mind_slug
    type: string
    description: Snake_case identifier for the mind
    required: true

  - name: scope
    type: enum
    description: Which sources to analyze
    required: false
    options: ["all", "new_only", "specific_type"]
    default: "all"

  - name: specific_type
    type: string
    description: If scope=specific_type, which type (blogs/youtube/articles/interviews/social)
    required: false

outputs:
  - path: "squads/mmos-squad/minds/{mind_slug}/docs/logs/{timestamp}-analysis-report.yaml"
    description: Consolidated analysis report with all extracted insights
    format: yaml

  - path: "squads/mmos-squad/minds/{mind_slug}/docs/logs/{timestamp}-frameworks-extracted.yaml"
    description: All identified frameworks and mental models
    format: yaml

  - path: "squads/mmos-squad/minds/{mind_slug}/docs/logs/{timestamp}-signature-phrases.yaml"
    description: Characteristic vocabulary and recurring phrases
    format: yaml

prerequisites:
  - "Sources collected (run *collect first)"
  - "At least 5 source files available for meaningful analysis"

validation:
  success-criteria:
    - "At least 3 frameworks/mental models identified"
    - "At least 10 signature phrases extracted"
    - "Key concepts mapped with frequency counts"
    - "Analysis report generated with per-source summaries"
  warning-conditions:
    - "1-2 frameworks identified (limited depth)"
    - "5-9 signature phrases (need more sources)"
  failure-conditions:
    - "0 frameworks identified"
    - "<5 signature phrases"

estimated-duration: "15-45 minutes depending on source volume"
---

# Source Analysis Task

## Purpose

Read all collected source materials and perform a pre-analysis to extract key patterns that will accelerate the MMOS cognitive analysis phase. This is NOT a replacement for full MMOS analysis - it is a lightweight extraction of the most obvious patterns.

## Elicitation (Step 0)

```
SOURCE ANALYSIS - {mind_slug}
==============================

Analysis scope:
  1. All collected sources
  2. New sources only (not previously analyzed)
  3. Specific type only (blogs/youtube/articles/interviews/social)
  Default: 1

Analysis depth:
  1. Quick scan (key phrases + top frameworks, ~10 min)
  2. Standard (frameworks + concepts + phrases, ~20 min)
  3. Deep (everything + cross-source patterns, ~40 min)
  Default: 2

Type your choices:
```

## Execution Steps

### Step 1: Inventory Available Sources

Scan the sources directory and build a list:

```
1. Read all files in squads/mmos-squad/minds/{mind_slug}/sources/
2. Filter by scope (all/new_only/specific_type)
3. Sort by tier (T1 first) then by word count (longest first)
4. Build analysis queue:
   - Read frontmatter for metadata
   - Calculate total word count
   - Estimate analysis time
```

### Step 2: Per-Source Analysis

For each source file, read the content and extract:

```yaml
per_source_extraction:
  source_slug: "{slug}"
  source_type: "{type}"

  # Key claims and ideas
  key_ideas:
    - idea: "{core idea or claim}"
      quote: "{supporting quote from text}"
      significance: "{why this matters for understanding the person}"

  # Frameworks and mental models
  frameworks:
    - name: "{framework name}"
      description: "{how they describe it}"
      components: ["{part 1}", "{part 2}", "..."]
      source_quote: "{original phrasing}"

  # Signature phrases and vocabulary
  signature_phrases:
    - phrase: "{exact phrase or expression}"
      context: "{how they use it}"
      frequency_note: "{if it appears multiple times}"

  # Recurring themes
  themes:
    - theme: "{theme name}"
      mentions: {count}
      related_ideas: ["{idea refs}"]

  # Notable opinions and positions
  positions:
    - topic: "{topic}"
      position: "{their stance}"
      strength: "{strong/moderate/nuanced}"
      quote: "{supporting quote}"

  # Source quality assessment
  quality:
    depth: "{deep/medium/shallow}"
    unique_insights: {count}
    recommended_for_layers: ["{L1-L8 MMOS layers this source is good for}"]
```

### Step 3: Cross-Source Pattern Detection

After analyzing all individual sources, identify patterns across the corpus:

```yaml
cross_source_patterns:
  # Frameworks that appear in multiple sources
  recurring_frameworks:
    - framework: "{name}"
      sources_found_in: ["{slug1}", "{slug2}", "..."]
      consistency: "{consistent/evolving/contradictory}"
      description: "{synthesized description}"

  # Phrases that repeat across sources
  recurring_phrases:
    - phrase: "{phrase}"
      frequency: {count across all sources}
      sources: ["{slugs}"]
      context_variations: ["{how usage varies}"]

  # Themes that dominate the content
  dominant_themes:
    - theme: "{theme}"
      source_coverage: "{X of Y sources mention this}"
      centrality: "{core/supporting/peripheral}"

  # Evolution over time (if temporal data available)
  thinking_evolution:
    - topic: "{topic}"
      early_position: "{what they said before}"
      current_position: "{what they say now}"
      sources: ["{early_slug}", "{recent_slug}"]

  # Contradictions and paradoxes
  contradictions:
    - topic: "{topic}"
      position_a: "{one thing they say}"
      position_b: "{contradicting thing}"
      sources: ["{slug_a}", "{slug_b}"]
      note: "{possible explanation}"
```

### Step 4: MMOS Layer Mapping

Map extracted insights to MMOS DNA Mental layers:

```yaml
layer_mapping:
  L1_core_essence:
    coverage: "{adequate/limited/none}"
    key_findings: ["{insight}"]
    best_sources: ["{slugs}"]

  L2_signature_phrases:
    coverage: "{adequate/limited/none}"
    phrases_found: {count}
    best_sources: ["{slugs}"]

  L3_mental_models:
    coverage: "{adequate/limited/none}"
    frameworks_found: {count}
    best_sources: ["{slugs}"]

  L4_communication_templates:
    coverage: "{adequate/limited/none}"
    patterns_found: {count}
    best_sources: ["{slugs}"]

  L5_values_hierarchy:
    coverage: "{adequate/limited/none}"
    values_identified: ["{values}"]
    best_sources: ["{slugs}"]

  L6_obsessions:
    coverage: "{adequate/limited/none}"
    obsessions_found: ["{topics}"]
    best_sources: ["{slugs}"]

  L7_singularity:
    coverage: "{adequate/limited/none}"
    unique_traits: ["{traits}"]
    best_sources: ["{slugs}"]

  L8_paradoxes:
    coverage: "{adequate/limited/none}"
    paradoxes_found: ["{paradoxes}"]
    best_sources: ["{slugs}"]
```

### Step 5: Generate Analysis Reports

**Main analysis report** - `{timestamp}-analysis-report.yaml`:

```yaml
analysis_report:
  mind_name: "{name}"
  mind_slug: "{slug}"
  analysis_date: "{ISO timestamp}"
  analysis_depth: "{quick/standard/deep}"

  corpus_stats:
    total_sources_analyzed: {count}
    total_word_count: {sum}
    by_type:
      blogs: {count}
      articles: {count}
      interviews: {count}
      youtube: {count}
      social: {count}

  executive_summary: |
    {2-3 paragraph summary of who this person is based on the sources,
    what they care about most, how they think, and what makes them distinctive.}

  top_frameworks:
    - name: "{framework 1}"
      description: "{description}"
      frequency: {count}
    - name: "{framework 2}"
      # ...

  top_signature_phrases:
    - "{phrase 1}"
    - "{phrase 2}"
    # ... (top 15-20)

  dominant_themes:
    - "{theme 1}: {brief description}"
    - "{theme 2}: {brief description}"
    # ...

  layer_coverage:
    L1_core_essence: "{adequate/limited/none}"
    L2_signature_phrases: "{adequate/limited/none}"
    L3_mental_models: "{adequate/limited/none}"
    L4_communication_templates: "{adequate/limited/none}"
    L5_values_hierarchy: "{adequate/limited/none}"
    L6_obsessions: "{adequate/limited/none}"
    L7_singularity: "{adequate/limited/none}"
    L8_paradoxes: "{adequate/limited/none}"

  gaps_identified:
    - layer: "{L-number}"
      gap: "{what is missing}"
      suggestion: "{how to fill it}"

  mmos_readiness: "{ready/needs_more_sources/insufficient}"

  per_source_summaries:
    - slug: "{slug}"
      type: "{type}"
      key_ideas_count: {count}
      frameworks_count: {count}
      quality: "{deep/medium/shallow}"
      recommended_layers: ["{layers}"]
```

**Frameworks file** - `{timestamp}-frameworks-extracted.yaml`
**Signature phrases file** - `{timestamp}-signature-phrases.yaml`

### Step 6: Present Summary

```
ANALYSIS COMPLETE - {mind_name}
=================================

Analyzed: {count} sources ({total_words} total words)

Top Frameworks Found ({count} total):
  1. {framework 1}
  2. {framework 2}
  3. {framework 3}

Signature Phrases ({count} total):
  - "{phrase 1}"
  - "{phrase 2}"
  - "{phrase 3}"
  ... and {remaining} more

MMOS Layer Coverage:
  L1 Core Essence:           {status}
  L2 Signature Phrases:      {status}
  L3 Mental Models:          {status}
  L4 Communication:          {status}
  L5 Values:                 {status}
  L6 Obsessions:             {status}
  L7 Singularity:            {status}
  L8 Paradoxes:              {status}

MMOS Readiness: {ready/needs_more_sources/insufficient}

{If gaps exist:}
Gaps to address:
  - {gap 1}: {suggestion}
  - {gap 2}: {suggestion}

Reports saved to: minds/{slug}/docs/logs/

Next steps:
  1. Run *inventory {slug} to update sources_master.yaml
  2. Use MMOS squad for full cognitive analysis (@mind-mapper *map {slug})
```

## Notes

- This is a PRE-analysis, not a replacement for full MMOS cognitive analysis
- Focus on extracting the most obvious and recurring patterns
- The output feeds into MMOS's deeper 8-layer analysis
- Quality > quantity: better to identify 3 real frameworks than 10 weak ones
- Always include source attribution (which source each insight came from)
- Layer coverage mapping helps MMOS analysts know where to focus
