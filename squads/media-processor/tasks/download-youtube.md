# Task: Download from YouTube

**Version:** 1.0.0
**Status:** Active
**Owner:** @downloader (Downloader)
**Created:** 2026-02-23
**Last Updated:** 2026-02-23

---

## Purpose

Download and transcribe videos or playlists from YouTube using the `aios-transcriber` CLI tool. **IMPORTANT:** The `aios-transcriber youtube` command performs download + caption extraction + markdown generation in a single step (seconds, not minutes). For YouTube content, it extracts existing captions instead of using Whisper, making it 10-100x faster than traditional transcription. Handles single videos and playlists with automatic language detection.

---

## Executor Type

**Agent:** @downloader (Downloader)
**Mode:** YOLO (deterministic download + transcription process)
**Estimated Duration:** 10-90 minutes (depends on video length and playlist size)
**Complexity:** STANDARD (score: 11/20)

---

## Inputs

| Input | Type | Required | Source | Example |
|-------|------|----------|--------|---------|
| `source_url` | string | YES | Classification or user | "https://youtube.com/watch?v=xxx" |
| `source_type` | string | YES | Classification | "youtube" or "youtube_playlist" |
| `output_dir` | string | NO | Default or user | "<PROJECT_ROOT>/squads/media-processor/transcriptions/youtube/" |
| `model` | string | NO | User preference | "medium" (default), "small", "large" |
| `language` | string | NO | User preference | "pt" (default), "en", "auto" |
| `quality` | string | NO | User preference | "best" (default), "1080p", "720p" |
| `keep_video` | boolean | NO | User preference | false (default, saves space) |
| `dry_run` | boolean | NO | Testing flag | false (default) |

---

## Preconditions

- [ ] `aios-transcriber` is available at `<PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py`
- [ ] Python 3.8+ is installed
- [ ] Output directory is writable
- [ ] Sufficient disk space (downloads can be large if keeping videos)
- [ ] yt-dlp is installed (installed with aios-transcriber dependencies)
- [ ] No Whisper model needed for YouTube (uses caption extraction)

---

## Steps

### Step 1: Validate Prerequisites

```bash
# Check aios-transcriber installation
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py --help

# Check yt-dlp
which yt-dlp

# Check disk space
df -h {output_dir}
```

**Expected Output:**
```
usage: aios_transcriber.py [-h] {youtube,local} ...
/opt/homebrew/bin/yt-dlp
Filesystem      Size   Used  Avail Capacity
/dev/disk1     500Gi  250Gi  248Gi    51%
```

**Action:**
1. Verify aios-transcriber is available
2. Verify yt-dlp is installed
3. Check available disk space (warn if < 5GB)
4. If any prerequisite missing, halt and notify user

**Validation:**
- [ ] aios-transcriber script exists
- [ ] yt-dlp is available
- [ ] Disk space >= 5GB

---

### Step 2: Get Video/Playlist Metadata

For single video:
```bash
yt-dlp --print title --print duration "{source_url}"
```

For playlist:
```bash
yt-dlp --flat-playlist --print title "{source_url}"
```

**Expected Output (single video):**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up",
  "duration_seconds": 212,
  "duration_formatted": "03:32",
  "estimated_size_mb": 15,
  "has_captions": true,
  "language": "en"
}
```

**Expected Output (playlist):**
```json
{
  "playlist_id": "PLxxxxxxxxxx",
  "title": "Marketing Digital 2024",
  "total_videos": 15,
  "total_duration_minutes": 180,
  "estimated_size_gb": 2.5,
  "videos": [
    {
      "video_id": "xxx",
      "title": "Aula 1 - Introdução",
      "duration_seconds": 600
    }
  ]
}
```

**Action:**
1. Run info command to retrieve metadata
2. Parse JSON output
3. Display summary to user:
   - Video/playlist title
   - Total duration
   - Estimated download size
   - Caption availability
4. Ask for confirmation if playlist > 10 videos or size > 5GB

**Output:** Video/playlist metadata object

---

### Step 3: Construct Process Command

**IMPORTANT:** The `youtube` command does download + caption extraction + markdown generation in one step (very fast).

#### Single Video:

```bash
# Full command (uses caption extraction, no Whisper)
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py \
  youtube "{source_url}" \
  -o "{output_dir}"
```

#### Playlist (Batch Mode):

```bash
# Batch playlist command
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py \
  youtube --playlist "{source_url}" \
  -o "{output_dir}"
```

**Action:**
1. Determine command type (process vs batch-playlist)
2. Build command string with all flags
3. Log full command to `.aios-core/logs/media-processor/download-youtube.log`
4. Display command to user for review
5. Await confirmation if not in YOLO mode

**Output:** Complete CLI command string

---

### Step 4: Execute Download + Caption Extraction

**Single Video:**
```bash
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py youtube "{source_url}" -o "{output_dir}"
```

**Playlist:**
```bash
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py youtube --playlist "{source_url}" -o "{output_dir}"
```

**Action:**
1. Execute command
2. Monitor progress (aios-transcriber shows progress):
   - Caption extraction progress
   - Markdown generation status
3. Log all output to `.aios-core/logs/media-processor/download-youtube.log`
4. Handle interruptions (Ctrl+C) gracefully:
   - Save partial progress
   - Offer resume option
5. Track progress in real-time

**What aios-transcriber does automatically for YouTube:**
1. **Download Captions:** Uses yt-dlp to extract existing captions (seconds)
2. **Language Priority:** Auto-selects best available caption track
3. **Generate Markdown:** Creates clean markdown transcript
4. **No Whisper:** Caption extraction, not transcription (10-100x faster)
5. **No Video Download:** Extracts captions only (saves disk space)
6. **Fallback:** If no captions, can optionally use Whisper (slower)

**Expected Output Structure:**
```
{output_dir}/
├── {VideoTitle}/
│   ├── transcript.md         # Clean markdown transcript (from captions)
│   └── metadata.json         # Video metadata + caption info
└── ...
```

**Note:** No video file is downloaded (captions only). No separate chunks or cleaning steps needed.

**Progress Tracking:**
- Current video (for playlists)
- Download progress (%)
- Transcription progress (%)
- ETA

---

### Step 5: Verify Output

```bash
# Check transcript files
find "{output_dir}" -name "transcript.md" | wc -l
find "{output_dir}" -name "metadata.json" | wc -l
```

**Action:**
1. Count transcript.md files
2. Count metadata files
3. Compare counts with metadata from Step 2
4. Check for incomplete transcripts (empty files)
5. Verify metadata.json content

**Validation Criteria:**
- [ ] One transcript.md per video
- [ ] One metadata.json per video
- [ ] No 0-byte files
- [ ] Transcript contains actual caption text

**Output:** Verification report

---

### Step 6: Generate Caption Extraction Report

Create comprehensive report:

```markdown
# YouTube Caption Extraction Report

**Source:** {source_url}
**Type:** {single video|playlist}
**Date:** {timestamp}
**Duration:** {total_duration_minutes} minutes

## Summary

- **Total Videos:** {video_count}
- **Total Duration:** {total_duration_formatted}
- **Captions Extracted:** {caption_count}
- **Method:** Caption extraction (not Whisper)
- **Language:** {detected_language}

## Videos Processed

### {Video_1_Title}
- **Duration:** {duration}
- **Caption Track:** ✓ transcript.md
- **Language:** {language}
- **Caption Source:** {auto-generated|manual}

### {Video_2_Title}
- **Duration:** {duration}
- **Caption Track:** ✓ transcript.md
- **Language:** {language}
- **Caption Source:** {auto-generated|manual}

## Output Location

**Directory:** `{output_dir}/`

## Performance

- **Average Extraction Time:** ~5-10 seconds per video
- **Total Processing Time:** {total_time_seconds} seconds (not minutes!)
- **Speed Improvement:** 10-100x faster than Whisper

## Verification

- [x] All captions extracted
- [x] Markdown transcripts generated
- [x] No video files downloaded (captions only)
- [x] Minimal disk space used

## Next Steps

1. Review transcripts in `{output_dir}/`
2. Run `sculpt-transcript` task for content extraction
3. (Optional) Run full pipeline for additional processing
```

**Action:**
1. Render report template with actual data
2. Save report to `{output_dir}/YOUTUBE-DOWNLOAD-REPORT.md`
3. Display summary to user
4. Update `.synapse/metrics/media-processor-metrics.json` with stats

**Output:** Download + Transcription report (markdown)

---

### Step 7: Quality Gate Validation (QG-001 + QG-002)

Run both QG-001 (download) and QG-002 (transcription) validations:

**Action:**
1. Execute all QG-001 checks (download completeness)
2. Execute all QG-002 checks (transcription quality)
3. Generate validation report
4. If FAIL, log issues and notify user
5. If PASS, mark task as complete

---

## Outputs

### Primary Output

**Transcriptions:**
- **Location:** `{output_dir}/{VideoTitle}/`
- **Files:**
  - `original.txt` — Raw Whisper output
  - `cleaned.txt` — Cleaned transcript
  - `chunks/chunk_*.txt` — Semantic chunks
  - `metadata.json` — Video + transcription metadata

### Secondary Outputs

1. **Download Report:** `{output_dir}/YOUTUBE-DOWNLOAD-REPORT.md`
2. **Download Log:** `.aios-core/logs/media-processor/download-youtube.log`
3. **Metrics Update:** `.synapse/metrics/media-processor-metrics.json`

```json
{
  "downloads": {
    "youtube": {
      "total_videos": 42,
      "total_playlists": 3,
      "total_duration_hours": 28.5,
      "total_transcriptions": 42,
      "last_download": "2026-02-23T16:20:00Z"
    }
  }
}
```

---

## Validation

### QG-001: Download Completeness

**Criteria:**
- [ ] All videos downloaded (count matches metadata)
- [ ] No failed downloads
- [ ] Audio extracted successfully for all videos

**Method:** Automated file count verification

**Threshold:** 100% download success

**Severity:** CRITICAL

---

### QG-002: Caption Extraction Quality

**Criteria:**
- [ ] All videos have captions extracted (one transcript.md per video)
- [ ] Metadata.json exists and valid for all videos
- [ ] No empty transcript files
- [ ] Caption language matches expected (from metadata)

**Method:** Automated quality checks on caption outputs

**Threshold:** 100% caption extraction completeness

**Severity:** CRITICAL

---

### QG-003: Output Verification

**Criteria:**
- [ ] Only caption files generated (no video/audio downloads)
- [ ] Transcript files are valid markdown
- [ ] Metadata includes caption source info

**Method:** File system verification

**Threshold:** 100% caption-only extraction (no unnecessary downloads)

**Severity:** MEDIUM (efficiency verification)

---

## Quality Threshold

**Minimum Acceptable:**
- Caption extraction completeness: 100%
- Caption availability: >= 80% of videos have captions
- Output validity: 100%

**Target:**
- Caption extraction completeness: 100%
- Caption availability: >= 95% of videos have captions
- Output validity: 100%
- Average processing speed: 5-10 seconds per video (caption extraction is very fast)

---

## Error Handling

### Common Errors

| Error Code | Cause | Recovery |
|------------|-------|----------|
| `VIDEO_UNAVAILABLE` | Video is private, deleted, or geo-blocked | Notify user, skip if playlist |
| `NO_CAPTIONS` | Video has no caption tracks available | Fallback to Whisper (slower) or skip |
| `CAPTION_EXTRACTION_FAILED` | yt-dlp caption download error | Retry up to 3 times with 30s delay |
| `NETWORK_ERROR` | Connection timeout | Retry with exponential backoff |
| `PLAYLIST_EMPTY` | Playlist has no videos | Notify user, exit gracefully |

### Recovery Strategies

1. **Video Unavailable (Playlist Context):**
   ```bash
   # Skip unavailable video, continue with playlist
   # Log skipped video to report
   ```

2. **Network Error:**
   ```bash
   # Retry with exponential backoff (30s, 60s, 120s)
   # If still fails after 3 retries, halt and notify
   ```

3. **Disk Space:**
   ```bash
   # Check available space before each video
   # If space < 1GB, pause and notify user
   # Offer to cleanup old downloads
   ```

4. **No Captions Available:**
   ```bash
   # Option 1: Fallback to Whisper (much slower)
   # Option 2: Skip video and continue with playlist
   # Option 3: Notify user and ask for preference
   ```

---

## Integration

### Feeds To

- **sculpt-transcript** — Caption transcripts ready for content extraction
- **organize-content** — Transcriptions ready for organization

### Depends On

- **classify-request** — Receives `source_url`, `source_type`, and parameters from classification

### Observability

**Metrics Tracked:**
- Total videos processed
- Total playlists processed
- Total duration extracted (hours)
- Caption availability rate (% with captions)
- Success rate (% successful caption extractions)
- Average processing speed (seconds per video)

**Dashboard Integration:**
- Download + transcription history in `.synapse/metrics/media-processor-metrics.json`
- Real-time progress (via log tailing if dashboard integrated)

---

## Flags Reference

### aios-transcriber CLI Flags

| Flag | Description | Example |
|------|-------------|---------|
| `youtube` | Process YouTube video/playlist (caption extraction) | `youtube "{url}"` |
| `--playlist` | Process as playlist | `youtube --playlist "{url}"` |
| `-o, --output` | Output directory | `-o /path/to/output` |
| `--engine whisper` | Use Whisper for local files (not YouTube) | `local "{file}" --engine whisper` |
| `--engine deepgram` | Use Deepgram for local files | `local "{file}" --engine deepgram` |

**Note:** YouTube processing uses caption extraction by default (no Whisper needed). Language is auto-detected via yt-dlp.

---

## Examples

### Example 1: Single Video (Caption Extraction)

**Input:**
```json
{
  "source_url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "source_type": "youtube"
}
```

**Command:**
```bash
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py youtube "https://youtube.com/watch?v=dQw4w9WgXcQ" -o "<PROJECT_ROOT>/squads/media-processor/transcriptions/youtube/"
```

**Output:**
```
transcriptions/youtube/
└── Rick_Astley_Never_Gonna_Give_You_Up/
    ├── transcript.md
    └── metadata.json
```

---

### Example 2: Playlist (Batch Caption Extraction)

**Input:**
```json
{
  "source_url": "https://youtube.com/playlist?list=PLxxxxxxxxxx",
  "source_type": "youtube_playlist"
}
```

**Command:**
```bash
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py youtube --playlist "https://youtube.com/playlist?list=PLxxxxxxxxxx" -o "<PROJECT_ROOT>/squads/media-processor/transcriptions/youtube/"
```

**Output:**
```
transcriptions/youtube/
├── Aula_01_Introducao/
│   ├── transcript.md
│   └── metadata.json
├── Aula_02_Fundamentos/
│   ├── transcript.md
│   └── metadata.json
├── ...
└── YOUTUBE-CAPTION-REPORT.md
```

---

### Example 3: Fallback to Whisper (No Captions Available)

**Input:**
```json
{
  "source_url": "https://youtube.com/watch?v=xxx",
  "source_type": "youtube",
  "fallback_whisper": true
}
```

**Command:**
```bash
# If caption extraction fails, download video and use Whisper
yt-dlp "https://youtube.com/watch?v=xxx" -o "video.mp4"
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py local "video.mp4" -o "<PROJECT_ROOT>/squads/media-processor/transcriptions/youtube/" --engine whisper
```

**Output:**
```
transcriptions/youtube/
└── Video_Title/
    ├── transcript.md
    └── metadata.json
```

**Note:** This is slower (uses Whisper) but works when captions aren't available.

---

## Notes

- **Caption Extraction:** `aios-transcriber youtube` extracts existing captions (10-100x faster than Whisper)
- **Playlist Handling:** `--playlist` flag processes all videos in sequence with error recovery
- **No Video Download:** Only captions are extracted (saves disk space and time)
- **Language Auto-Detection:** Uses yt-dlp language priority (pt, en, etc.)
- **Resume Support:** Interrupted extractions can resume
- **Whisper Fallback:** If no captions available, can manually use Whisper (much slower)
- **Clean Output:** Generates markdown directly (no separate clean/chunk steps)

---

## References

- **aios-transcriber Documentation:** `<PROJECT_ROOT>/tools/aios-transcriber/README.md`
- **yt-dlp Documentation:** https://github.com/yt-dlp/yt-dlp
- **Caption Extraction Guide:** `<PROJECT_ROOT>/tools/aios-transcriber/lib/youtube.py`

---

**Task Classification:** STANDARD
**Estimated Tokens:** ~2000 (caption extraction) + ~500 (validation) + ~500 (reporting)
**Success Rate:** 95% (based on YouTube availability, network, and caption availability)
**Speed Improvement:** 10-100x faster than Whisper-based transcription
