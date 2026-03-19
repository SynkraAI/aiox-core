---
task-id: collect-content
name: Content Collection - Download & Extract Sources
agent: mind-content-updater
version: 1.0.0
purpose: Collect content from discovered URLs using WebFetch and aios-transcriber

workflow-mode: interactive
elicit: true
elicitation-type: custom

inputs:
  - name: mind_slug
    type: string
    description: Snake_case identifier for the mind
    required: true

  - name: source
    type: enum
    description: Where to get the list of URLs to collect
    required: true
    options: ["discovery_report", "manual_urls"]
    default: "discovery_report"

  - name: urls
    type: array
    description: Manual list of URLs to collect (if source=manual_urls)
    required: false

  - name: batch
    type: enum
    description: Which batch to collect (if source=discovery_report)
    required: false
    options: ["all", "batch_1", "batch_2", "batch_3"]
    default: "all"

  - name: language
    type: string
    description: Primary language for video transcription
    required: false
    default: "en"

outputs:
  - path: "squads/mmos-squad/minds/{mind_slug}/sources/{type}/{slug}.md"
    description: Collected source files with frontmatter metadata
    format: markdown

  - path: "squads/mmos-squad/minds/{mind_slug}/sources/youtube/{slug}/"
    description: YouTube transcripts with metadata
    format: directory

  - path: "squads/mmos-squad/minds/{mind_slug}/docs/logs/{timestamp}-collection-report.yaml"
    description: Collection progress and results report
    format: yaml

prerequisites:
  - "Discovery report exists (run *discover first) OR user provides manual URL list"
  - "aios-transcriber dependencies installed (for YouTube content): pip3 install yt-dlp"

validation:
  success-criteria:
    - "80%+ of targeted URLs successfully collected"
    - "All files have proper frontmatter metadata"
    - "All files named with semantic slugs"
    - "YouTube transcripts complete with metadata"
  failure-conditions:
    - "<50% of targeted URLs collected"
    - "Video transcriber errors for all YouTube sources"

estimated-duration: "30-90 minutes depending on source count and YouTube videos"
---

# Content Collection Task

## Purpose

Download and extract content from URLs discovered in the discovery phase (or provided manually by the user). Saves each source as a markdown file with YAML frontmatter in the correct MMOS directory structure.

## Elicitation (Step 0)

```
CONTENT COLLECTION - {mind_slug}
=================================

Collection source:
  1. From discovery report (uses latest discovery-report.yaml)
  2. Manual URL list (provide URLs directly)
  Default: 1

If using discovery report, which batch?
  1. All batches (T1 + T2 + T3)
  2. Batch 1 only (T1 - Critical)
  3. Batch 2 only (T2 - Important)
  4. Batch 3 only (T3 - Supplementary)
  Default: 1

Language for video transcription: [en/pt/es]
  Default: en

Type your choices:
```

## Execution Steps

### Step 1: Load Source List

**If source=discovery_report:**
```
1. Find latest discovery report in minds/{mind_slug}/docs/logs/
2. Parse the sources list
3. Filter by selected batch (or take all)
4. Skip sources marked as "manual" (books, paywalled)
5. Sort by priority_score descending
```

**If source=manual_urls:**
```
1. Take the provided URL list
2. For each URL, auto-detect content type:
   - youtube.com / youtu.be -> youtube
   - twitter.com / x.com -> social
   - linkedin.com -> social
   - Contains /blog/ or /post/ -> blog
   - Default -> article
3. Generate semantic slug for each
4. Assign estimated tier based on URL domain
```

### Step 2: Create Directory Structure

Ensure the output directories exist:

```
squads/mmos-squad/minds/{mind_slug}/sources/
  blogs/
  youtube/
  articles/
  interviews/
  social/
  manual/
```

### Step 3: Collect Content by Type

Process each URL based on its content type:

#### Blog Posts / Articles / Interviews (WebFetch)

```
For each URL of type blog/article/interview/about:
  1. Use WebFetch to extract content:
     WebFetch(url, prompt="Extract the full main content of this page. Include the title, author, date if available, and all body text. Ignore navigation, ads, and sidebars.")

  2. Generate frontmatter:
     ---
     source_id: "{slug}"
     title: "{extracted title}"
     type: "{blog/article/interview}"
     tier: "{T1/T2/T3}"
     url: "{original url}"
     collected_at: "{ISO timestamp}"
     collection_method: "web_fetch"
     word_count: {approximate}
     language: "{detected language}"
     slug: "{semantic-slug}"
     mind: "{mind_slug}"
     ---

  3. Save to: sources/{type}/{slug}.md
  4. Log: success/failure + word count
```

#### YouTube Videos (aios-transcriber)

```
For each URL of type youtube:
  1. Create output directory: sources/youtube/{slug}/

  2. Run aios-transcriber:
     python3 tools/aios-transcriber/aios_transcriber.py youtube "{url}" -o "sources/youtube/{slug}/"

  3. This generates:
     {slug}/
       metadata.json          # title, url, duration, channel
       transcription.json     # Whisper raw output
       transcription_clean.json  # Cleaned
       transcription_clean.md    # Markdown with timestamps
       stats.json             # Cleaning statistics
       chunks/                # Chunked text files

  4. Create summary frontmatter file: sources/youtube/{slug}/source.md
     ---
     source_id: "{slug}"
     title: "{from metadata.json}"
     type: "youtube"
     tier: "{T1/T2/T3}"
     url: "{youtube url}"
     channel: "{from metadata.json}"
     duration_seconds: {from metadata.json}
     collected_at: "{ISO timestamp}"
     collection_method: "aios_transcriber"
     word_count: {from transcript}
     language: "{lang}"
     slug: "{slug}"
     mind: "{mind_slug}"
     ---

     # {title}

     Transcript available in `transcription_clean.md`.
     Chunks available in `chunks/` directory.

  5. Log: success/failure + duration + word count
```

#### Social Media (WebFetch with special handling)

```
For each URL of type social:
  1. Use WebFetch to extract content:
     WebFetch(url, prompt="Extract the full text content of this social media post or thread. Include the author, date, and all text. For Twitter/X threads, extract all tweets in order.")

  2. Generate frontmatter:
     ---
     source_id: "{slug}"
     title: "{extracted title or first 80 chars}"
     type: "social"
     tier: "T3"
     platform: "{twitter/linkedin/etc}"
     url: "{original url}"
     collected_at: "{ISO timestamp}"
     collection_method: "web_fetch"
     word_count: {approximate}
     language: "{detected}"
     slug: "{semantic-slug}"
     mind: "{mind_slug}"
     ---

  3. Save to: sources/social/{slug}.md
  4. Log: success/failure
```

### Step 4: Handle Errors

For each failed collection:

```yaml
error_handling:
  url_unreachable:
    action: "Log as failed, mark reason, continue to next source"
    retry: false

  paywall_detected:
    action: "Log as 'requires_manual', save what partial content is available"
    user_note: "Flagged for manual collection in sources/manual/"

  video_transcriber_error:
    action: "Log error, suggest manual transcript search"
    fallback: "Try WebFetch on YouTube page for description and comments"

  rate_limited:
    action: "Wait 30 seconds, retry once"
    retry: true

  content_too_short:
    threshold: 100  # words
    action: "Log as 'low_quality', save anyway but flag in report"
```

### Step 5: Progress Tracking

Show progress during collection:

```
COLLECTION PROGRESS - {mind_name}
===================================
Batch 1 (Critical):     [================    ] 8/10   (2 remaining)
Batch 2 (Important):    [========            ] 4/10   (6 remaining)
Batch 3 (Supplementary): [                    ] 0/5    (queued)

Current: Collecting "How to Be Successful" (blog) via WebFetch...
Total: 12/25 sources collected (48%)

Successes: 11  |  Failures: 1  |  Skipped: 0
```

### Step 6: Generate Collection Report

Output to `minds/{mind_slug}/docs/logs/{timestamp}-collection-report.yaml`:

```yaml
collection_report:
  mind_name: "{name}"
  mind_slug: "{slug}"
  collection_date: "{ISO timestamp}"

  summary:
    total_attempted: {count}
    successful: {count}
    failed: {count}
    skipped: {count}
    requires_manual: {count}

    total_word_count: {sum}
    total_files_created: {count}

    by_type:
      blogs: {count}
      articles: {count}
      interviews: {count}
      youtube: {count}
      social: {count}

    by_tier:
      T1: {count}
      T2: {count}
      T3: {count}

  collected_sources:
    - slug: "{slug}"
      type: "{type}"
      tier: "{tier}"
      url: "{url}"
      file_path: "sources/{type}/{slug}.md"
      word_count: {count}
      status: "success"

  failed_sources:
    - slug: "{slug}"
      url: "{url}"
      reason: "{error description}"
      suggestion: "{how to resolve}"

  manual_collection_needed:
    - title: "{title}"
      type: "{book/paywalled}"
      url: "{url if available}"
      instruction: "Place PDF in sources/manual/{slug}.pdf"

  next_steps:
    - "Run *analyze {mind_slug} to extract frameworks and key concepts"
    - "Run *inventory {mind_slug} to generate sources_master.yaml"
    - "Place manual sources in sources/manual/ and re-run *inventory"
```

### Step 7: Present Summary

```
COLLECTION COMPLETE - {mind_name}
===================================

Collected: {success}/{total} sources ({percentage}%)
Failed:    {failed} (see collection report for details)
Manual:    {manual} items need user-provided content

Files created:
  sources/blogs/      {count} files ({words} words)
  sources/articles/   {count} files ({words} words)
  sources/interviews/ {count} files ({words} words)
  sources/youtube/    {count} directories ({words} words)
  sources/social/     {count} files ({words} words)

Total word count: {total_words} words

Report saved to: minds/{slug}/docs/logs/{timestamp}-collection-report.yaml

Next steps:
  1. Run *analyze {slug} to extract frameworks and key concepts
  2. Run *inventory {slug} to generate sources_master.yaml
  3. Place manual PDFs in sources/manual/ if needed
```

## Notes

- WebFetch extracts clean markdown from most websites
- aios-transcriber handles YouTube download + transcription automatically
- youtube-captions can be used in discovery phase to find YouTube videos by expert name
- Social media extraction can be unreliable due to dynamic loading - flag failures
- Always save partial content rather than nothing
- Frontmatter metadata is critical for the inventory and analysis tasks
- Existing files with the same slug are SKIPPED (idempotent operation)
- The collection report is the audit trail for what was collected and what failed
