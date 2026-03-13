# Workflow: Transcribe Only

**Version:** 1.0.0
**Status:** Active
**Owner:** @media-chief (Atlas)
**Created:** 2026-02-23

---

## Purpose

Pipeline simplificado que transcreve arquivos locais de vídeo/áudio sem download nem processamento editorial. Útil para arquivos já baixados ou gravações locais.

---

## Trigger

- `*transcribe {path}` — Transcreve arquivo ou diretorio local

---

## Phases

### Phase 1: Classify

| Field | Value |
|-------|-------|
| **Agent** | @media-chief |
| **Task** | `classify-request.md` |
| **Duration** | 30 sec - 1 min |
| **Input** | Path local (arquivo ou diretorio) |
| **Output** | File list, format validation |

**Supported formats:** `.mp4`, `.mkv`, `.webm`, `.m4a`, `.mp3`, `.wav`

**Veto Conditions:**
- Path não existe → HALT
- No supported media files found → HALT
- URL provided instead of path → Redirect to `*process` or `*download`

**Checkpoint:**
- [ ] Files discovered and listed
- [ ] All files have supported format
- [ ] Session initialized

---

### Phase 2: Transcribe

| Field | Value |
|-------|-------|
| **Agent** | @media-chief |
| **Task** | `transcribe-media.md` |
| **Duration** | 5 min - 1h per file |
| **Input** | Media file path (in lesson folder) |
| **Output** | `transcript.md` + metadata (in same lesson folder) |
| **Gate** | QG-002 (Transcription Quality) |

**Path Convention:** `output_dir` = lesson folder (same directory as media file)
```bash
python3 tools/aios-transcriber/aios_transcriber.py \
  local "{file}" -o "{lesson_folder}/" --engine whisper
```

**Veto Conditions:**
- ffprobe fails → SKIP file, report invalid media
- Whisper OOM → Retry with smaller model
- Audio duration 0 → SKIP file

**Checkpoint:**
- [ ] transcript.md exists in lesson folder per file
- [ ] Metadata.json generated in lesson folder
- [ ] QG-002 passed per file
- [ ] Manifest updated

---

## Completion Criteria

- [ ] All files transcribed or failures isolated
- [ ] QG-002 passed for each successful transcription
- [ ] Transcription files organized in output directory
- [ ] Final report: N transcribed, M failed

---

## Output

Transcription outputs live in the **lesson folder** alongside the media files (Lesson Folder = Unidade Atômica).

```
{session_dir}/
├── {Course or source}/
│   └── {Module}/
│       └── {Lesson}/                   # Lesson folder
│           ├── video.mp4               # Original media
│           ├── transcript.md           # Clean markdown transcript
│           └── metadata.json           # Metrics
├── pipeline-status.json
└── processing-manifest.json
```

For local files without course hierarchy, a simple structure is used:
```
{session_dir}/
├── Local/
│   ├── 01_{filename}/                  # Lesson folder per file
│   │   ├── video.mp4
│   │   ├── transcript.md
│   │   └── metadata.json
│   └── 02_{filename}/
│       └── ...
├── pipeline-status.json
└── processing-manifest.json
```
