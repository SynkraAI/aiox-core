# CLI Reference — Media Processor Tools

Quick reference for all CLI tools orchestrated by media-processor.

---

## hotmart-downloader

**Location:** `tools/hotmart-downloader/`
**CLI:** `tools/hotmart-downloader/.venv/bin/hotmart-dl`

```bash
# Check authentication
hotmart-dl auth-check

# List available courses
hotmart-dl courses

# Get course info (modules, lessons count)
hotmart-dl info "{course_subdomain}"

# Download course
hotmart-dl download -c "{course_subdomain}" -q best --subtitles --materials
```

**Auth:** Requires browser cookies. Run `auth-check` first. If expired, user must re-authenticate via browser.

---

## cademi-downloader

**Location:** `tools/cademi-downloader/`
**CLI:** `tools/cademi-downloader/.venv/bin/cademi-dl`

```bash
# Check authentication
cademi-dl auth-check

# List available courses
cademi-dl courses

# Download single course
cademi-dl download -c "{course_url}"

# Download all courses (batch)
cademi-dl download --all --select-all

# Audio-only mode
cademi-dl download -c "{course_url}" --audio-only
```

**Auth:** Uses Playwright for browser-based auth. Cookies stored locally.

---

## aios-transcriber

**Location:** `tools/aios-transcriber/`
**CLI:** `python3 tools/aios-transcriber/aios_transcriber.py`

```bash
# YouTube video (uses caption extraction - very fast)
python3 tools/aios-transcriber/aios_transcriber.py youtube "{url}" -o "{output_dir}"

# YouTube playlist
python3 tools/aios-transcriber/aios_transcriber.py youtube --playlist "{url}" -o "{output_dir}"

# Local file transcription (Whisper)
python3 tools/aios-transcriber/aios_transcriber.py local "{file}" -o "{output_dir}" --engine whisper

# Local file transcription (Deepgram)
python3 tools/aios-transcriber/aios_transcriber.py local "{file}" -o "{output_dir}" --engine deepgram

# Get help
python3 tools/aios-transcriber/aios_transcriber.py --help
```

**Notes:**
- YouTube source: Uses caption extraction (seconds, not minutes) - no Whisper needed
- Local files: Choose engine (whisper or deepgram)
- No separate clean/chunk steps - outputs clean markdown directly
- Language detection is automatic via yt-dlp priority for YouTube

---

## System Dependencies

```bash
# Required
ffmpeg --version    # Audio/video processing
ffprobe -version    # Media metadata extraction
yt-dlp --version    # YouTube downloads

# Optional
whisper --help      # If using standalone Whisper
```

---

## Validation Commands

```bash
# Check file with ffprobe
ffprobe -v quiet -print_format json -show_format "{file}"

# Word count of transcription
wc -w "{transcription_clean.md}"

# Count chunks
ls "{chunks_dir}" | wc -l

# Check disk space
df -h .
```

---

## Common Flags

| Flag | Tool | Purpose |
|------|------|---------|
| `--engine whisper` | aios-transcriber | Use Whisper for transcription (local files) |
| `--engine deepgram` | aios-transcriber | Use Deepgram for transcription (local files) |
| `--playlist` | aios-transcriber | Process YouTube playlist |
| `-o {dir}` | aios-transcriber | Output directory |
| `-q best` | hotmart-dl | Quality selection |
| `--subtitles` | hotmart-dl | Download subtitles |
| `--materials` | hotmart-dl | Download materials |
| `--audio-only` | cademi-dl | Audio extraction only |
