# Workflow: Download Only

**Version:** 1.0.0
**Status:** Active
**Owner:** @media-chief (Atlas)
**Created:** 2026-02-23

---

## Purpose

Pipeline simplificado que apenas classifica e faz download do conteúdo, sem transcrição ou processamento adicional. Útil quando o usuário quer apenas obter os arquivos de mídia.

---

## Trigger

- `*download {URL}` — Ativa download-only pipeline

---

## Phases

### Phase 1: Classify

| Field | Value |
|-------|-------|
| **Agent** | @media-chief |
| **Task** | `classify-request.md` |
| **Duration** | 1-3 min |
| **Input** | URL do usuario |
| **Output** | `classification_result` |

**Veto Conditions:**
- URL não corresponde a plataforma suportada → HALT
- Local file path provided → Redirect to `*transcribe` or `*process`

**Checkpoint:**
- [ ] Platform detected
- [ ] Session initialized
- [ ] Manifest created

---

### Phase 2: Download

| Field | Value |
|-------|-------|
| **Agent** | @media-chief |
| **Task** | Platform-specific download task |
| **Duration** | 5 min - 2h |
| **Input** | `classification_result` |
| **Output** | Media files |
| **Gate** | QG-001 (Download Validation) |

**Platform routing:**
| Platform | Task | CLI |
|----------|------|-----|
| Hotmart | `download-hotmart.md` | `hotmart-dl download` |
| Cademi | `download-cademi.md` | `cademi-dl download` |
| YouTube | `download-youtube.md` | `aios-transcriber youtube` (caption extraction) |

**Veto Conditions:**
- Auth expired → HALT, prompt re-authentication
- Disk space < 5GB → HALT

**Checkpoint:**
- [ ] All items downloaded OR failures isolated
- [ ] QG-001 passed per item
- [ ] Manifest updated
- [ ] Final report: N downloaded, M failed, K skipped

---

## Completion Criteria

- [ ] All media files downloaded and validated
- [ ] QG-001 passed for each item
- [ ] `pipeline-status.json` shows status: completed
- [ ] Download location reported to user

---

## Output

```
{session_dir}/
├── downloads/
│   ├── {module-1}/
│   │   ├── {lesson-1}.mp4
│   │   └── {lesson-2}.mp4
│   └── {module-2}/
│       └── ...
├── pipeline-status.json
└── processing-manifest.json
```
