# Workflow: Full Media Processing Pipeline

**Version:** 1.0.0
**Status:** Active
**Owner:** @media-chief (Atlas)
**Created:** 2026-02-23

---

## Purpose

Orquestra o pipeline completo: desde a classificação da fonte até a construção de knowledge base. Suporta Hotmart, Cademi, YouTube e arquivos locais. Cada item avança individualmente pelas fases (per-item streaming).

---

## Trigger

- `*process {URL_or_path}` — Ativa o pipeline completo
- Qualquer URL de plataforma suportada quando usuario pede processamento

---

## Phases

### Phase 1: Classify

| Field | Value |
|-------|-------|
| **Agent** | @media-chief |
| **Task** | `classify-request.md` |
| **Duration** | 1-3 min |
| **Input** | URL ou path do usuario |
| **Output** | `classification_result` (platform, type, item_count, pipeline_path) |
| **Gate** | NONE |

**Veto Conditions:**
- URL não corresponde a nenhuma plataforma conhecida → HALT, pedir clarificação
- Path local não existe → HALT, reportar erro

**Checkpoint:**
- [ ] Platform detectada corretamente
- [ ] Pipeline path determinado
- [ ] Session directory criado
- [ ] Manifest inicializado via `update-status.md`

---

### Phase 2: Download

| Field | Value |
|-------|-------|
| **Agent** | @media-chief |
| **Task** | `download-hotmart.md` / `download-cademi.md` / `download-youtube.md` |
| **Duration** | 5 min - 2h (depends on content size) |
| **Input** | `classification_result` |
| **Output** | Media files in session directory |
| **Gate** | QG-001 (Download Validation) per item |

**Veto Conditions:**
- Auth expired → HALT, prompt re-authentication
- Disk space < 5GB → HALT, report space needed
- Platform returned 0 items → HALT, verify URL

**Checkpoint:**
- [ ] All items downloaded OR failures isolated
- [ ] QG-001 passed for each successful download
- [ ] Manifest updated with download status per item
- [ ] pipeline-status.json reflects current progress

**Streaming Rule:** Cada item avança para Phase 3 assim que seu download + validação passa. NÃO esperar todos os downloads.

---

### Phase 3: Transcribe

| Field | Value |
|-------|-------|
| **Agent** | @media-chief |
| **Task** | `transcribe-media.md` |
| **Duration** | 5 min - 1h per item |
| **Input** | Downloaded media file (in lesson folder) |
| **Output** | `transcription_clean.md` + chunks (in same lesson folder) |
| **Gate** | QG-002 (Transcription Quality) per item |

**Path Convention:** `output_dir` = lesson folder (same dir as video.mp4 or where captions are extracted)
```
{session_dir}/{Course}/{Module}/{Lesson}/transcript.md
{session_dir}/{Course}/{Module}/{Lesson}/metadata.json
```

**Veto Conditions:**
- Audio duration 0 → SKIP item, log reason
- Whisper OOM → Retry with smaller model (medium → small → base)
- After 2 retries still failing → SKIP item, log as failed

**Checkpoint:**
- [ ] transcript.md exists in lesson folder and non-empty
- [ ] Metadata.json exists
- [ ] QG-002 passed
- [ ] Manifest updated

**Note for YouTube:** `aios-transcriber youtube` extracts captions only (no video download, very fast). Skip Phase 2 and start here with `youtube` command.

---

### Phase 4: Sculpt

| Field | Value |
|-------|-------|
| **Agent** | transcript-sculptor (delegation) |
| **Task** | `sculpt-transcript.md` |
| **Duration** | 10-30 min per item |
| **Input** | `{lesson_folder}/transcript.md` |
| **Output** | `{lesson_folder}/masterpiece.md` (same folder) |
| **Gate** | NONE (sculptor has internal quality) |

**Path Convention:** `output_dir` = lesson folder (masterpiece.md alongside transcript)
```
/transcript-sculptor:process {lesson_folder}/transcript.md {lesson_folder}/
```

**Veto Conditions:**
- Transcription has < 500 words → SKIP sculpting, pass raw to distill
- Sculptor returns error → Log as incomplete, continue pipeline

**Post-Process (obrigatório para pt-BR):**
Após o sculptor gerar o masterpiece, aplicar skill `pt-br-accentuation`:
- Corrigir acentos, cedilhas, tils ausentes (comum em output Whisper)
- Zero tolerância para Top 20 erros críticos (não, você, são, ação, etc.)
- Skill: `.aios/skills/pt-br-accentuation/SKILL.md`
- Skip se conteúdo não for pt-BR

**Checkpoint:**
- [ ] masterpiece.md exists in lesson folder
- [ ] Masterpiece > 80% of original word count (no excessive truncation)
- [ ] PT-BR accentuation applied (if applicable)
- [ ] Manifest updated with sculpt status

---

### Phase 5: Distill

| Field | Value |
|-------|-------|
| **Agent** | video-content-distillery (delegation) |
| **Task** | `distill-content.md` |
| **Duration** | 15-45 min per item |
| **Input** | `{lesson_folder}/masterpiece.md` |
| **Output** | `{lesson_folder}/distilled/` (subfolder) |
| **Gate** | NONE |

**Path Convention:** `output_dir` = `{lesson_folder}/distilled/` (subfolder to avoid polluting lesson root)
```
/video-content-distillery:distill {lesson_folder}/masterpiece.md {lesson_folder}/distilled/
```

**Veto Conditions:**
- Masterpiece < 1000 words → Generate summary only, skip full distillation
- Distillery returns error → Log as incomplete, continue

**Checkpoint:**
- [ ] At least 1 framework or summary extracted in distilled/
- [ ] Content pieces generated
- [ ] Manifest updated

---

### Phase 6: Build Knowledge Base

| Field | Value |
|-------|-------|
| **Agent** | knowledge-base-builder (delegation) |
| **Task** | `build-knowledge-base.md` |
| **Duration** | 30 min - 2h |
| **Input** | Course directory (recursive scan for masterpieces) |
| **Output** | `{session_dir}/knowledge-base/` |
| **Gate** | QG-003 (Pipeline Completion) |

**IMPORTANT:** This phase runs ONLY AFTER all items complete Phase 5 (batch gate).

**Path Convention:** KB is at session level. Scans course hierarchy recursively for masterpieces.
```
/knowledge-base-builder:ingest {session_dir}/{course_name}/ {session_dir}/knowledge-base/
```
The `find` command discovers `masterpiece.md` and `distilled/knowledge-fragments.json` throughout the course hierarchy.

**Veto Conditions:**
- 0 masterpieces available → SKIP KB build, report pipeline incomplete
- < 50% of items have masterpieces → WARN, ask user if should proceed

**Checkpoint:**
- [ ] Knowledge base directory created at session level
- [ ] QG-003 passed (pipeline completion)
- [ ] Final summary generated
- [ ] Dashboard updated with completion status

---

## Error Handling

| Error | Phase | Recovery |
|-------|-------|----------|
| Auth expired | 2 (Download) | HALT, prompt re-auth |
| Video unavailable | 2 | SKIP item, continue |
| Whisper OOM | 3 (Transcribe) | Retry smaller model |
| Disk space low | Any | HALT pipeline |
| Sculptor error | 4 | Log incomplete, continue |
| Distillery error | 5 | Log incomplete, continue |

**Per-item isolation:** Failures in one item do NOT block others. Each item has independent tracking in the manifest.

---

## Resume Support

Pipeline can be resumed at any point:
1. Read `processing-manifest.json`
2. Skip items with `status: completed` in current phase
3. Retry items with `status: failed`
4. Process items with `status: pending`

Command: `*resume {session_directory}`

---

## Completion Criteria

- [ ] All items processed (completed, skipped, or failed)
- [ ] QG-001 passed for all successful downloads
- [ ] QG-002 passed for all successful transcriptions
- [ ] QG-003 passed for pipeline completion
- [ ] `pipeline-status.json` shows `status: completed`
- [ ] Final summary displayed to user with statistics
