# Task: Transcribe Media

## Metadata
- **Task ID:** TASK-MP-001
- **Version:** 1.0.0
- **Status:** Active
- **Created:** 2026-02-23
- **Last Updated:** 2026-02-23
- **Owner:** @media-processor-coordinator
- **Executor Type:** AI Agent (@transcription-engineer)
- **Estimated Duration:** 5-30min (varies by media length)
- **Complexity:** MEDIUM

---

## Purpose

Transcrever arquivos de mídia local (video/audio) usando o aios-transcriber CLI, gerando transcrição estruturada e limpa em markdown para processamento posterior. Usa Whisper ou Deepgram conforme configuração.

**Por que esta task existe:**
- Converte mídia falada em texto estruturado
- Prepara dados para sculpt e distill phases
- Garante qualidade e consistência na transcrição base

---

## Inputs

| Input | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| `media_file` | File path | User-provided or download task | YES | File exists, valid format |
| `output_dir` | Directory path | Lesson folder (same dir as media file) | YES | Writable directory |
| `model` | String | Config or default | NO | One of: tiny, base, small, medium, large |
| `language` | String | Config or default | NO | Valid Whisper language code |
| `source_type` | String | Detected or specified | YES | One of: local, url, vtt, srt, txt, md |

**Default Values:**
- `model`: medium (balanço qualidade/velocidade)
- `language`: pt (português brasileiro)

---

## Preconditions

### System Requirements
- [x] aios-transcriber disponível em `tools/aios-transcriber/`
- [x] Python 3.8+ instalado
- [x] FFmpeg instalado (para extração de audio)
- [x] Whisper ou Deepgram configurado (dependendo do engine escolhido)

### Input Validation
- [x] `media_file` existe e é legível
- [x] Formato suportado: .mp4, .mp3, .wav, .m4a, .webm, .vtt, .srt, .txt, .md
- [x] `output_dir` existe ou pode ser criado
- [x] Espaço em disco suficiente (estimativa: 2x tamanho do arquivo)

### Dependencies
- [x] Nenhuma task blocante (pode rodar em paralelo para múltiplos itens)

---

## Execution Steps

### Step 1: Prepare Environment
```bash
# Validate aios-transcriber installation
test -f <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py || { echo "aios-transcriber not installed"; exit 1; }

# Create output directory
mkdir -p "{output_dir}"
```

### Step 2: Detect Source Type and Route
```bash
# Detect source type
if [[ "{media_file}" =~ ^https?:// ]]; then
  SOURCE_TYPE="url"
elif [[ "{media_file}" =~ \.(vtt|srt)$ ]]; then
  SOURCE_TYPE="subtitle"
elif [[ "{media_file}" =~ \.(txt|md)$ ]]; then
  SOURCE_TYPE="text"
else
  SOURCE_TYPE="local"
fi
```

### Step 3: Execute Transcription (Route A: Local Media with Whisper)
```bash
# For local video/audio files using Whisper
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py \
  local "{media_file}" \
  -o "{output_dir}" \
  --engine whisper

# Validate output
test -f "{output_dir}/transcript.md" || { echo "Transcription failed"; exit 1; }
```

### Step 3b: Execute Transcription (Route B: Local Media with Deepgram)
```bash
# For local video/audio files using Deepgram (faster, paid)
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py \
  local "{media_file}" \
  -o "{output_dir}" \
  --engine deepgram

# Validate output
test -f "{output_dir}/transcript.md" || { echo "Transcription failed"; exit 1; }
```

### Step 3c: Execute Transcription (Route C: YouTube URL)
```bash
# For YouTube URLs (uses caption extraction)
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py \
  youtube "{media_file}" \
  -o "{output_dir}"

# Validate output
test -f "{output_dir}/transcript.md" || { echo "Caption extraction failed"; exit 1; }
```

### Step 4: Validate Output

**Note:** aios-transcriber outputs clean markdown directly. No separate clean/chunk steps needed.

```bash
# Validate transcript exists
test -f "{output_dir}/transcript.md" || { echo "Transcript missing"; exit 1; }

# Validate metadata
test -f "{output_dir}/metadata.json" || { echo "Metadata missing"; exit 1; }
```

### Step 5: Generate Stats
```bash
# Stats are in metadata.json
test -f "{output_dir}/metadata.json" || { echo "Metadata missing"; exit 1; }

# Extract key metrics
WORD_COUNT=$(wc -w < "{output_dir}/transcript.md")
echo "Transcription complete: $WORD_COUNT words"
```

---

## Outputs

| Output | Type | Location | Description |
|--------|------|----------|-------------|
| `transcript.md` | Markdown | `{output_dir}/` | Clean markdown transcript |
| `metadata.json` | JSON | `{output_dir}/` | Video metadata, duration, engine used |

**Output Structure (Lesson Folder = Unidade Atômica):**

All transcription outputs go into the **lesson folder** — the same directory where the downloaded media lives. This keeps all artifacts for a lesson co-located.

```
{lesson_folder}/                    # = output_dir
├── video.mp4                       # Already here from download phase (if applicable)
├── transcript.md                   # Clean markdown transcript
└── metadata.json                   # Metadata
```

**Path convention:** `{session_dir}/{Course}/{NN}{SEP}{Module}/{NN}{SEP}{Lesson}/`
- Hotmart separator: `_` (e.g., `01_Module Name/01_Lesson Name/`)
- Cademi separator: ` - ` (e.g., `01 - Module Name/01 - Lesson Name/`)

---

## Validation Rules

### Quality Gate QG-002: Transcription Quality

**Automated Checks:**
```bash
# 1. All expected files exist
test -f "{output_dir}/transcript.md"
test -f "{output_dir}/metadata.json"

# 2. Content validation
WORD_COUNT=$(wc -w < "{output_dir}/transcript.md")
test "$WORD_COUNT" -gt 0 || { echo "Empty transcription"; exit 1; }

# 3. Markdown readability
MD_LINES=$(wc -l < "{output_dir}/transcript.md")
test "$MD_LINES" -gt 10 || { echo "Transcript too short"; exit 1; }
```

**Manual Review (Optional):**
- [ ] Transcrição reflete o conteúdo da mídia
- [ ] Sem erros críticos de reconhecimento
- [ ] Idioma detectado corretamente
- [ ] Chunks semanticamente coerentes

**Thresholds:**
- Word count > 0 (CRITICAL)
- Duration > 0 (CRITICAL)
- Valid markdown format (CRITICAL)

---

## Quality Threshold

**Pass Criteria:**
- All automated checks pass
- Word count > 100 (for media > 1min)
- Valid markdown format
- No critical errors in logs

**Fail Criteria (Retry):**
- Empty transcription (word count = 0)
- Missing required files
- Invalid media format

**Escalation Criteria:**
- Retry limit exceeded (3 attempts)
- Whisper model download fails
- Unsupported media format
- Corrupted media file

---

## Integration Points

### Downstream Tasks
- **NEXT:** `sculpt-transcript.md` (consumes `transcript.md`)
- **PARALLEL:** Can run for multiple items simultaneously

### Upstream Tasks
- **PREVIOUS:** `download-media.md` (if source is URL) OR direct user input (local file)

### Squad Coordination
- Outputs `transcript.md` to handoff location for transcript-sculptor
- Updates batch status with transcription stats
- Logs completion in session state

---

## Error Handling

### Common Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| `Transcription failed` | Engine error, invalid media | Try different engine (whisper vs deepgram) |
| `FFmpeg not found` | Missing dependency | Install FFmpeg: `brew install ffmpeg` |
| `Empty transcription` | Silent media, wrong engine | Verify media, try different engine |
| `API error` | Deepgram API issue | Fallback to Whisper |

### Retry Strategy
- Max retries: 3
- Backoff: 5s, 10s, 30s
- Retry conditions: Network errors, Whisper timeouts
- NO retry: Invalid media format, corrupted file

---

## Performance Notes

**Benchmarks (estimados):**
- 1min video → ~10-20s transcription (Whisper) or ~5s (Deepgram)
- 10min video → ~2-4min transcription (Whisper) or ~15s (Deepgram)
- 1h video → ~10-20min transcription (Whisper) or ~1min (Deepgram)

**Optimization Tips:**
- Use Deepgram for speed (paid, very fast)
- Use Whisper for free option (slower but good quality)
- Process multiple files in parallel (max 4 concurrent for Whisper)
- For YouTube, use caption extraction instead (10-100x faster)

---

## Configuration

### Environment Variables
```bash
# Optional: Override defaults
export DEEPGRAM_API_KEY="your-key"  # For Deepgram engine
export TRANSCRIPTION_ENGINE="whisper"  # whisper or deepgram
```

### Config File (squad-manifest.yaml)
```yaml
transcription:
  default_engine: whisper  # whisper or deepgram
  parallel_limit: 4
```

---

## Examples

### Example 1: Course Lesson (Cademi) with Whisper
```bash
# Input — media lives in lesson folder from download phase
media_file: "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/video.mp4"
output_dir: "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/"

# Execution
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py \
  local "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/video.mp4" \
  -o "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/" \
  --engine whisper

# Output — all files in the SAME lesson folder
sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/
├── video.mp4                       # Already existed
├── transcript.md                   # NEW (12,450 words)
└── metadata.json                   # NEW
```

### Example 2: Course Lesson (Hotmart)
```bash
# Input — Hotmart uses _ separator
media_file: "sessions/mp-2026-0302-001/Curso Vendas/01_Fundamentos/01_Introdução/video.mp4"
output_dir: "sessions/mp-2026-0302-001/Curso Vendas/01_Fundamentos/01_Introdução/"

# Output — same pattern, output_dir = lesson folder
```

### Example 3: YouTube URL (Caption Extraction)
```bash
# Input — YouTube uses caption extraction (fast)
media_file: "https://www.youtube.com/watch?v=ABC123"
output_dir: "sessions/mp-2026-0302-001/YouTube/01_ABC123-Video-Title/"

# Execution
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py \
  youtube "https://www.youtube.com/watch?v=ABC123" \
  -o "sessions/mp-2026-0302-001/YouTube/01_ABC123-Video-Title/"
```

### Example 4: Local File with Deepgram (Fast)
```bash
# Input — Deepgram for fast transcription (paid)
media_file: "<USER_HOME>/Downloads/recording.mp4"
output_dir: "sessions/mp-2026-0302-001/Local/01_recording/"

# Execution
python3 <PROJECT_ROOT>/tools/aios-transcriber/aios_transcriber.py \
  local "<USER_HOME>/Downloads/recording.mp4" \
  -o "sessions/mp-2026-0302-001/Local/01_recording/" \
  --engine deepgram
```

---

## Notes

- **Engine selection:** Whisper (free, slower) vs Deepgram (paid, very fast)
- **YouTube optimization:** Use `youtube` subcommand for caption extraction (10-100x faster)
- **Language detection:** Auto-detected by engine
- **Clean output:** Markdown directly generated (no separate clean/chunk steps)
- **Parallel processing:** Suporta múltiplos arquivos em paralelo (limite: 4 concurrent para Whisper)

---

## References

- Tool: `tools/aios-transcriber/`
- CLI docs: `tools/aios-transcriber/README.md`
- YouTube module: `tools/aios-transcriber/lib/youtube.py`
- Quality Gate: `.aios-core/core/quality-gates/QG-002-transcription-quality.md`

---

**Task Owner:** @transcription-engineer
**Last Review:** 2026-02-23
**Next Review:** After 10 executions or major video-transcriber update
