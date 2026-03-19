---
task-id: discover-sources
name: Source Discovery - Web Search & Cataloging
agent: mind-content-updater
version: 1.0.0
purpose: Discover all available content for a person across the web using semantic and keyword search

workflow-mode: interactive
elicit: true
elicitation-type: custom

inputs:
  - name: mind_name
    type: string
    description: Full name of the person (e.g., "Sam Altman")
    required: true

  - name: mind_slug
    type: string
    description: Snake_case identifier (e.g., "sam_altman")
    required: true

  - name: language
    type: string
    description: Primary language of content to search for
    required: false
    default: "en"

  - name: known_urls
    type: array
    description: URLs the user already knows about (skip these in discovery)
    required: false

  - name: focus_areas
    type: array
    description: Specific topics or content types to prioritize
    required: false

outputs:
  - path: "squads/mmos-squad/minds/{mind_slug}/docs/logs/{timestamp}-discovery-report.yaml"
    description: Complete discovery report with all found sources categorized by tier
    format: yaml

  - path: "squads/mmos-squad/minds/{mind_slug}/docs/logs/{timestamp}-url-list.txt"
    description: Plain text list of all discovered URLs for quick reference
    format: text

validation:
  success-criteria:
    - "At least 20 unique URLs discovered"
    - "At least 3 different content types found"
    - "At least 5 T1/T2 sources identified"
    - "Discovery report generated with tier classification"
  warning-conditions:
    - "10-19 URLs discovered (limited coverage)"
    - "Only 2 content types found"
  failure-conditions:
    - "<10 URLs discovered"
    - "Only 1 content type found"

estimated-duration: "15-30 minutes"
---

# Source Discovery Task

## Purpose

Execute systematic web search to discover all available content authored by or featuring a specific person. This is the first step of the source harvesting pipeline - finding what exists before collecting it.

## Elicitation (Step 0)

Before starting discovery, gather the following from the user:

```
SOURCE DISCOVERY - {mind_name}
================================

I need some info to optimize the search:

1. What is the person's full name?
   (Include any known aliases, e.g., "Thiago Finch" / "Thiago Nigro")

2. What language(s) do they primarily publish in?
   Options: en / pt / es / multi
   Default: en

3. Any known URLs or platforms to include?
   (e.g., their blog URL, YouTube channel, Twitter handle)

4. Any specific focus areas?
   (e.g., "their views on AI safety", "marketing frameworks")

5. Scope preference?
   1. Quick scan (top results only, ~10 min)
   2. Standard sweep (comprehensive, ~20 min)
   3. Deep dive (exhaustive, ~30 min)
   Default: 2

Type your answers or press Enter for defaults:
```

## Execution Steps

### Step 1: Prepare Search Strategy

Based on the person, build a search matrix:

```yaml
search_strategy:
  mind_name: "{mind_name}"
  mind_slug: "{mind_slug}"
  language: "{language}"
  search_categories:
    - category: "written_content"
      priority: 1
      queries_exa:
        - "{name} blog posts essays writing"
        - "{name} articles published author"
        - "{name} newsletter substack medium"
      queries_web:
        - "{name} official blog website"
        - "{name} substack newsletter"
    - category: "video_audio"
      priority: 2
      queries_exa:
        - "{name} interviews podcasts conversations"
        - "{name} keynote talk conference presentation"
      queries_web:
        - "{name} YouTube channel"
        - "{name} podcast episodes guest appearances"
        - "{name} TED talk"
    - category: "books_courses"
      priority: 1
      queries_exa:
        - "{name} books author published"
        - "{name} course masterclass workshop"
      queries_web:
        - "{name} books amazon goodreads"
        - "{name} online course udemy coursera"
    - category: "frameworks_thinking"
      priority: 2
      queries_exa:
        - "{name} framework methodology approach philosophy"
        - "{name} mental model principles decision making"
        - "{name} advice lessons learned"
    - category: "social_media"
      priority: 3
      queries_exa:
        - "{name} twitter threads best insights"
        - "{name} linkedin posts"
      queries_web:
        - "{name} twitter X account"
        - "{name} linkedin profile"
```

### Step 2: Execute Discovery Sweeps

For each category, execute searches using the appropriate MCP tool:

**Exa Search (semantic discovery):**
```
For each query in queries_exa:
  Use mcp__exa__web_search_exa with:
    query: "{query}"
    numResults: 10

  For each result:
    - Record: title, url, snippet
    - Classify content type
    - Assign preliminary tier (T1/T2/T3)
    - Generate semantic slug
```

**WebSearch (targeted discovery):**
```
For each query in queries_web:
  Use WebSearch with:
    query: "{query}"

  For each result:
    - Record: title, url, snippet
    - Deduplicate against Exa results
    - Classify content type
    - Assign preliminary tier
```

### Step 3: Deduplicate and Classify

Merge all results and deduplicate by URL (normalize URLs - remove tracking params, www prefix, trailing slashes):

```yaml
classification_rules:
  content_type:
    blog: "Personal blog post, essay, article on their own site"
    article: "Article on external publication (Forbes, HBR, etc.)"
    interview: "Interview or podcast appearance (text transcript)"
    youtube: "YouTube video (requires aios-transcriber)"
    social: "Twitter thread, LinkedIn post"
    book: "Published book (requires manual PDF)"
    course: "Online course or workshop material"
    talk: "Conference talk, keynote, TED talk"
    about: "About page, bio, personal page"

  tier:
    T1: "Authored by the person, official content, books, personal blog"
    T2: "Long-form interviews, conference talks, guest articles"
    T3: "Social media posts, third-party summaries, brief mentions"
```

### Step 4: Build Priority Matrix

Score each source:

```yaml
scoring:
  factors:
    tier_weight: 40
    depth_weight: 30
    recency_weight: 15
    accessibility_weight: 15

  depth_scores:
    book: 10
    course: 9
    long_interview: 8
    blog_post: 7
    conference_talk: 7
    article: 6
    social_thread: 4
    brief_mention: 2

  recency_scores:
    last_1_year: 10
    last_3_years: 8
    last_5_years: 6
    older: 4

  accessibility_scores:
    free_web: 10
    free_video: 8
    paywall_soft: 5
    paywall_hard: 3
    requires_purchase: 2
```

### Step 5: Generate Discovery Report

Output the discovery report to `minds/{mind_slug}/docs/logs/{timestamp}-discovery-report.yaml`:

```yaml
discovery_report:
  mind_name: "{name}"
  mind_slug: "{slug}"
  discovery_date: "{ISO timestamp}"
  search_scope: "{quick/standard/deep}"
  language: "{lang}"

  summary:
    total_urls_discovered: {count}
    unique_domains: {count}
    by_tier:
      T1: {count}
      T2: {count}
      T3: {count}
    by_type:
      blog: {count}
      article: {count}
      interview: {count}
      youtube: {count}
      social: {count}
      book: {count}
      course: {count}
      talk: {count}
      about: {count}

  sources:
    - url: "{url}"
      title: "{title}"
      type: "{content_type}"
      tier: "{T1/T2/T3}"
      slug: "{semantic-slug}"
      priority_score: {number}
      accessibility: "{free_web/paywall/etc}"
      snippet: "{brief description}"
      collection_method: "{web_fetch/video_transcriber/manual}"

  collection_plan:
    batch_1_critical:
      description: "T1 sources - collect first"
      sources: [{slugs}]
      estimated_time: "{minutes}"
    batch_2_important:
      description: "T2 sources - collect second"
      sources: [{slugs}]
      estimated_time: "{minutes}"
    batch_3_supplementary:
      description: "T3 sources - collect if time permits"
      sources: [{slugs}]
      estimated_time: "{minutes}"

  manual_collection_needed:
    - type: "book"
      title: "{book title}"
      note: "User needs to provide PDF in sources/manual/"
    # ... repeat for paywalled content

  recommendations:
    proceed_to_collection: true/false
    concerns: ["{any issues}"]
    suggested_focus: "{guidance}"
```

### Step 6: Present Summary to User

After generating the report, present a clean summary:

```
DISCOVERY COMPLETE - {mind_name}
=================================

Found {total} sources across {domains} domains:

  T1 (Authoritative):  {count} sources
  T2 (Valuable):       {count} sources
  T3 (Supplementary):  {count} sources

Content types found:
  - Blog posts:    {count}
  - Articles:      {count}
  - Interviews:    {count}
  - YouTube:       {count}
  - Social:        {count}
  - Books:         {count}

Collection plan:
  Batch 1 (Critical):     {count} sources (~{time} min)
  Batch 2 (Important):    {count} sources (~{time} min)
  Batch 3 (Nice-to-have): {count} sources (~{time} min)

Manual collection needed: {count} items (books, paywalled content)

Report saved to: minds/{slug}/docs/logs/{timestamp}-discovery-report.yaml

Next steps:
  1. Review the report
  2. Run *collect {mind_slug} to start collecting
  3. Place manual PDFs in minds/{slug}/sources/manual/
```

## Notes

- Exa is preferred for discovery because it finds content by meaning, not just keywords
- WebSearch complements Exa by finding specific platforms and official pages
- Always deduplicate before presenting results
- Books are flagged for manual collection since they require PDFs
- Paywalled content is flagged but still recorded for the user to provide later
- The discovery report becomes the input for the collect-content task
