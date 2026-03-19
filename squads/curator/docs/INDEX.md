# Curator Squad — Documentation Index

> Central reference for Curator Squad documentation.

## Squad Reference

| Document | Path | Description |
|----------|------|-------------|
| README | `squads/curator/README.md` | Squad overview, architecture, pipeline |
| CHANGELOG | `squads/curator/CHANGELOG.md` | Version history and release notes |
| Config | `squads/curator/config.yaml` | Squad configuration and quality gates |

## Data Files

| File | Path | Description |
|------|------|-------------|
| Moment Types | `squads/curator/data/moment-types.yaml` | Taxonomy of content moment types |
| Viral Triggers | `squads/curator/data/viral-triggers.yaml` | 7 ATHENA viral trigger definitions |
| MQR Rubric | `squads/curator/data/moment-quality-rubric.yaml` | 4-dimension scoring rubric |
| STT Corrections | `squads/curator/data/stt-corrections.yaml` | Speech-to-text correction patterns |
| Tool Registry | `squads/curator/data/tool-registry.yaml` | Catalog of scripts, tools, MCPs |
| Security | `squads/curator/checklists/security-validation.md` | Security & compliance checklist |

## Workflows

| Workflow | Path | Purpose |
|----------|------|---------|
| Mine to Cut | `workflows/wf-mine-to-cut.yaml` | Complete curation: mine → narrative → format |
| Shorts Pipeline | `workflows/wf-shorts-pipeline.yaml` | Sub-60s content (TikTok, Reels) |
| Longform Pipeline | `workflows/wf-longform-pipeline.yaml` | 10+ min content with retention |
| Longform Simple | `workflows/wf-longform-simple-pipeline.yaml` | Conversation-based longform cuts |
| Multi-Format | `workflows/wf-multi-format.yaml` | Mine once, format many (parallel) |

---

_Version: 3.3.0_
_Created: 2026-02-09_
