# Task: Classify Media Request

**Version:** 1.0.0
**Status:** Active
**Owner:** @navigator (Navigator)
**Created:** 2026-02-23
**Last Updated:** 2026-02-23

---

## Purpose

Classify user input (URL, file path, or directory) into the correct platform and workflow. Acts as the intelligent router for the media-processor squad, detecting source type and recommending the optimal processing pipeline.

---

## Executor Type

**Agent:** @navigator (Navigator)
**Mode:** Interactive (classification requires context gathering)
**Estimated Duration:** 1-3 minutes
**Complexity:** SIMPLE (score: 5/20)

---

## Inputs

| Input | Type | Required | Source | Example |
|-------|------|----------|--------|---------|
| `user_input` | string | YES | User message | "https://app.hotmart.com/workspace/..." |
| `context` | string | NO | User clarification | "This is a playlist" |
| `scan_depth` | number | NO | User preference | 2 (for directories) |

---

## Preconditions

- [ ] User has provided a URL, path, or directory reference
- [ ] Navigator agent is active and ready
- [ ] Access to file system for path validation (if local path)

---

## Steps

### Step 1: Extract and Normalize Input

```bash
# If user provides a URL, extract it
# If user provides a path, resolve to absolute path
# If user provides multiple items, process each
```

**Action:**
1. Parse user message for URLs using regex patterns
2. Parse for file paths (absolute or relative to cwd)
3. Parse for directory references
4. Normalize all inputs to absolute references

**Output:** `normalized_inputs` array

---

### Step 2: Classify Each Input

For each normalized input, apply detection rules:

#### Rule Set: Platform Detection

| Pattern | Platform | Source Type | Workflow |
|---------|----------|-------------|----------|
| `*.hotmart.com*` | Hotmart | hotmart | download-hotmart |
| `*.cademi.com.br*` | Cademi | cademi | download-cademi |
| `youtube.com/watch*` | YouTube | youtube | download-youtube (caption extraction) |
| `youtu.be/*` | YouTube | youtube | download-youtube (caption extraction) |
| `youtube.com/playlist*` | YouTube Playlist | youtube_playlist | download-youtube (batch captions) |
| `*.mp4`, `*.mkv`, `*.webm`, `*.avi`, `*.mov` | Local Video | local_video | transcribe-media |
| `*.m4a`, `*.mp3`, `*.wav`, `*.ogg`, `*.flac` | Local Audio | local_audio | transcribe-media |
| `*.md`, `*.txt`, `*.vtt`, `*.srt` | Local Text | local_transcription | sculpt-transcript |
| Directory path (exists) | Local Directory | local_directory | (recursive scan) |

**Action:**
1. For URLs: Match against platform patterns
2. For paths: Check file extension and existence
3. For directories: Scan contents recursively up to `scan_depth`
4. Collect metadata (file size, duration estimate if possible)

**Output:** Classification object per input

---

### Step 3: Handle Directory Scanning

If input is a directory:

```bash
# Use Glob tool to find media files
# Classify each file found
# Group by source type
```

**Action:**
1. Use `Glob` tool with pattern: `**/*.{mp4,mkv,webm,m4a,mp3,wav,md,txt,vtt,srt}`
2. Classify each file using Step 2 rules
3. Group results by `source_type`
4. Calculate aggregate statistics (total size, estimated duration)

**Output:** Directory scan report with grouped classifications

---

### Step 4: Recommend Workflow

Based on classification results:

| Scenario | Recommended Workflow |
|----------|---------------------|
| Single Hotmart URL | `download-hotmart` task |
| Single Cademi URL | `download-cademi` task |
| Single YouTube video | `download-youtube` task |
| YouTube playlist | `download-youtube` task (batch mode) |
| Single local video/audio | `transcribe-media` task |
| Single local transcription | `sculpt-transcript` task |
| Multiple local videos | `transcribe-media` task (batch mode) |
| Mixed directory | Sequential: download → transcribe → sculpt |
| Multiple URLs (same platform) | Batch mode for platform-specific task |
| Multiple URLs (different platforms) | Sequential execution per platform |

**Action:**
1. Analyze classification results
2. Determine optimal execution order
3. Calculate estimated time and storage requirements
4. Generate workflow recommendation with parameters

**Output:** Workflow recommendation object

---

### Step 5: Present Classification Report

Generate user-friendly report:

```markdown
# Media Classification Report

## Summary
- **Total Items:** {count}
- **Source Type:** {type}
- **Platform:** {platform}
- **Estimated Size:** {size}
- **Estimated Duration:** {duration}

## Items Detected

### {platform_1}
1. {item_1} — {metadata}
2. {item_2} — {metadata}

### {platform_2}
1. {item_3} — {metadata}

## Recommended Workflow

**Primary Task:** {task_name}
**Mode:** {interactive|batch}
**Estimated Time:** {time}
**Storage Required:** {size}

**Parameters:**
- `source_urls`: [{urls}]
- `output_dir`: {dir}
- `quality`: {quality}
- `transcribe`: {yes|no}

## Next Steps

1. Confirm classification is correct
2. Adjust parameters if needed
3. Execute recommended workflow
```

**Action:**
1. Render classification data into report template
2. Present to user for confirmation
3. Await user approval or parameter adjustment

**Output:** Classification report (markdown)

---

## Outputs

### Primary Output

**File:** `classification-report-{timestamp}.json`
**Location:** `.aios-core/cache/media-processor/classifications/`

```json
{
  "timestamp": "2026-02-23T10:30:00Z",
  "user_input": "https://youtube.com/playlist?list=...",
  "classifications": [
    {
      "input": "https://youtube.com/playlist?list=...",
      "normalized": "https://youtube.com/playlist?list=PLxxx",
      "source_type": "youtube_playlist",
      "platform": "YouTube",
      "metadata": {
        "item_count": 15,
        "estimated_duration_minutes": 180,
        "estimated_size_gb": 2.5
      }
    }
  ],
  "recommendation": {
    "workflow": "download-youtube",
    "mode": "batch",
    "primary_task": "download-youtube",
    "parameters": {
      "source_url": "https://youtube.com/playlist?list=PLxxx",
      "output_dir": "<PROJECT_ROOT>/squads/media-processor/downloads/youtube/",
      "quality": "best",
      "transcribe": true,
      "model": "medium",
      "language": "pt"
    },
    "estimated_time_minutes": 45,
    "storage_required_gb": 3.0
  }
}
```

### Secondary Output

**Markdown Report:** Classification report for user review (see Step 5)

---

## Validation

### QG-CLASSIFY-001: Classification Accuracy

**Criteria:**
- [ ] All inputs successfully classified (no "unknown" types)
- [ ] Platform detection matches known patterns
- [ ] File paths validated (exist and readable)
- [ ] Metadata extracted (size, duration estimates)

**Method:** Automated validation of classification results

**Threshold:** 100% classification success rate

---

### QG-CLASSIFY-002: Workflow Recommendation Validity

**Criteria:**
- [ ] Recommended workflow exists in squad
- [ ] Parameters are valid for recommended task
- [ ] Execution order is logical (download → transcribe → sculpt)
- [ ] Resource estimates are reasonable

**Method:** Validation against task registry

**Threshold:** Valid workflow for 100% of classifications

---

## Quality Threshold

**Minimum Acceptable:**
- Classification accuracy: 100%
- Metadata extraction: >= 80% of items
- Workflow recommendation: Valid for 100% of inputs

**Target:**
- Classification accuracy: 100%
- Metadata extraction: 100% of items
- Workflow recommendation: Optimal path for 100% of inputs
- User confirmation rate: >= 90%

---

## Error Handling

### Common Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| `UNKNOWN_URL_PATTERN` | URL doesn't match known platforms | Ask user for clarification |
| `FILE_NOT_FOUND` | Local path doesn't exist | Prompt for correct path |
| `UNSUPPORTED_FORMAT` | File extension not supported | List supported formats |
| `DIRECTORY_TOO_DEEP` | Scan depth exceeded | Ask user to limit depth |
| `MIXED_PLATFORMS` | Multiple platforms detected | Recommend sequential execution |

### Recovery Strategies

1. **Ambiguous Input:** Present classification options, ask user to confirm
2. **Partial Classification:** Process valid items, report failures
3. **No Match:** Ask user for explicit platform/type declaration
4. **Resource Constraints:** Recommend batch mode with smaller chunks

---

## Integration

### Feeds To

- **download-hotmart** — If Hotmart URL detected
- **download-cademi** — If Cademi URL detected
- **download-youtube** — If YouTube URL detected
- **transcribe-media** — If local video/audio detected
- **sculpt-transcript** — If local transcription detected

### Depends On

- **None** — This is the entry point for all workflows

### Observability

**Metrics Tracked:**
- Classification requests per day
- Platform distribution (% Hotmart vs Cademi vs YouTube vs Local)
- Average items per request
- Workflow recommendation accuracy (user confirmation rate)

**Dashboard Integration:**
- Classification history in `.synapse/metrics/media-processor-metrics.json`
- Platform trend charts

---

## Examples

### Example 1: Single Hotmart Course

**Input:**
```
User: "https://app.hotmart.com/workspace/courses/meu-curso"
```

**Classification:**
```json
{
  "source_type": "hotmart",
  "platform": "Hotmart",
  "metadata": {
    "course_subdomain": "meu-curso",
    "estimated_modules": "unknown"
  },
  "recommendation": {
    "workflow": "download-hotmart",
    "parameters": {
      "course_subdomain": "meu-curso",
      "quality": "best",
      "subtitles": true,
      "materials": true
    }
  }
}
```

---

### Example 2: YouTube Playlist

**Input:**
```
User: "https://youtube.com/playlist?list=PLxxxxxxxxxxx"
```

**Classification:**
```json
{
  "source_type": "youtube_playlist",
  "platform": "YouTube",
  "metadata": {
    "playlist_id": "PLxxxxxxxxxxx",
    "estimated_videos": 15
  },
  "recommendation": {
    "workflow": "download-youtube",
    "mode": "batch",
    "parameters": {
      "source_url": "https://youtube.com/playlist?list=PLxxxxxxxxxxx",
      "batch": true,
      "transcribe": true
    }
  }
}
```

---

### Example 3: Local Video Directory

**Input:**
```
User: "<USER_HOME>/Downloads/videos/"
```

**Classification:**
```json
{
  "source_type": "local_directory",
  "platform": "Local",
  "metadata": {
    "total_files": 8,
    "videos": 5,
    "audio": 2,
    "transcriptions": 1,
    "total_size_gb": 1.2
  },
  "recommendation": {
    "workflow": "transcribe-media",
    "mode": "batch",
    "parameters": {
      "input_dir": "<USER_HOME>/Downloads/videos/",
      "file_pattern": "*.{mp4,mkv,m4a,mp3}",
      "output_dir": "<PROJECT_ROOT>/squads/media-processor/transcriptions/",
      "model": "medium",
      "language": "pt"
    }
  }
}
```

---

## Notes

- Classification is **non-destructive** — no files are downloaded or modified
- Metadata extraction is **best-effort** — some platforms may not provide accurate counts
- Directory scanning respects `.gitignore` patterns if present
- Large directories (>100 files) trigger confirmation before full scan
- Mixed-platform inputs generate sequential workflow recommendations

---

## References

- **Hotmart Detection:** Tools/hotmart-downloader documentation
- **Cademi Detection:** Tools/cademi-downloader documentation
- **YouTube Detection:** Tools/video-transcriber documentation
- **File Type Registry:** `.aios-core/core/registry/media-types.yaml`

---

**Task Classification:** SIMPLE
**Estimated Tokens:** ~2000 (classification) + ~500 (report generation)
**Success Rate:** 95% (based on pattern matching accuracy)
