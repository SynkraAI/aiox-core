# GHIM-001: GitHub Issue Management — Automation & Triage System

**Story ID:** GHIM-001
**Epic:** Standalone — Repository Governance
**Status:** Ready
**Priority:** High
**Created:** 2026-02-20
**Owner:** @devops (Gage)
**Research:** `docs/research/2026-02-20-github-issue-management/`

---

## Description

Implementar um sistema completo de gestao de issues do GitHub para o repositorio aios-core, incluindo templates estruturados (issue forms), taxonomia de labels com prefixos, automacao via GitHub Actions (auto-labeling, stale management, welcome bot), e uma task formal de triage para @devops.

### Problem Statement

O repositorio aios-core possui 27 issues abertos, todos com label generico `needs-triage`, sem templates estruturados para coleta de informacao, sem automacao de triage, e sem estrategia de labeling consistente. Isso resulta em:
- Issues com informacao incompleta
- Classificacao manual demorada
- Nenhum SLA de resposta
- Contribuidores sem feedback automatico
- Backlog de issues stale sem gestao

### Research Basis

Pesquisa completa em `docs/research/2026-02-20-github-issue-management/` cobrindo:
- GitHub Issue Forms YAML (GitHub Docs)
- GitHub Agentic Workflows (2026)
- actions/stale v10, github/issue-labeler v3.4
- Kubernetes Issue Triage Guidelines
- Label taxonomy best practices (freeCodeCamp, Dave Lunny)
- CODEOWNERS para routing

---

## Acceptance Criteria

### Phase 1: Foundation

- [x] Label taxonomy implementada no repositorio com prefixos (`type:`, `priority:`, `status:`, `area:`, `community:`)
- [x] Labels existentes migradas para nova taxonomia
- [x] Issue form: Bug Report (`1-bug-report.yml`) criado e funcional
- [x] Issue form: Feature Request (`2-feature-request.yml`) criado e funcional
- [x] Issue form: Test Coverage (`3-test-coverage.yml`) criado e funcional
- [x] `config.yml` configurado para template chooser
- [x] CODEOWNERS verificado — ja existente e bem estruturado em `.github/CODEOWNERS`

### Phase 2: Automation

- [x] GitHub Action: `issue-labeler.yml` — auto-label baseado em regex do body/title
- [x] GitHub Action: `stale.yml` — marca stale 30d, fecha 7d, exempt P1/P2
- [x] GitHub Action: `welcome.yml` — atualizada com labels novos + `pull_request_target`
- [x] Configuracao: `.github/issue-labeler.yml` regex para issues + `.github/labeler.yml` atualizado para PRs
- [ ] Cada Action executou pelo menos 1 vez com sucesso em issue de teste

### Phase 3: Triage Process

- [x] Task criada: `.aios-core/development/tasks/github-issue-triage.md`
- [x] Checklist criada: `.aios-core/development/checklists/issue-triage-checklist.md`
- [x] Script de triage batch: `.aios-core/development/scripts/issue-triage.js`
- [x] 31 issues existentes triados com novas labels aplicadas (0 untriaged remaining)
- [x] Documentacao de processo de triage no script/task

---

## Scope

### IN Scope

- Label taxonomy com prefixos e cores
- 3 issue form templates YAML
- config.yml para template chooser
- CODEOWNERS file
- 3 GitHub Actions workflows (labeler, stale, welcome)
- Task de triage para @devops
- Checklist de triage
- Script de triage batch
- Triage dos 27 issues existentes

### Risks

- Labels com `:` no nome podem causar problemas no GitHub CLI — testar `gh issue edit --add-label "type: bug"` antes do rollout
- `config.yml` bloqueando issues sem template pode frustrar contribuidores que nao encontram template adequado — manter link para "Open a blank issue" como fallback
- `actions/stale` pode fechar issues legitimamente ativos se exemptions mal configuradas — validar lista de exempt labels antes de ativar
- Migracao de labels existentes pode desconectar issues de filtros salvos por contribuidores — comunicar mudanca via issue/discussion

### OUT of Scope

- GitHub Projects board setup (future story)
- GitHub Agentic Workflows / AI triage (requires GitHub Enterprise, future epic)
- Issue metrics/analytics dashboard
- SLA enforcement automation
- Slack/Discord notifications para issues

---

## Dependencies

### Existing Tasks (Related)

| Task | Relationship |
|------|-------------|
| `github-devops-repository-cleanup.md` | Complementar — stale issues |
| `github-devops-github-pr-automation.md` | Paralelo — PR + Issue automation |
| `setup-github.md` | Extend — adicionar templates ao setup |

### New Artifacts to Create

| Type | Path | Description |
|------|------|-------------|
| Task | `.aios-core/development/tasks/github-issue-triage.md` | Processo formal de triage |
| Checklist | `.aios-core/development/checklists/issue-triage-checklist.md` | Checklist por issue |
| Script | `.aios-core/development/scripts/issue-triage.js` | Triage batch via `gh` CLI |
| Template | `.github/ISSUE_TEMPLATE/1-bug-report.yml` | Bug report form |
| Template | `.github/ISSUE_TEMPLATE/2-feature-request.yml` | Feature request form |
| Template | `.github/ISSUE_TEMPLATE/3-test-coverage.yml` | Test coverage PR |
| Config | `.github/ISSUE_TEMPLATE/config.yml` | Template chooser config |
| Config | `.github/labeler.yml` | Regex rules para auto-labeling |
| Action | `.github/workflows/issue-labeler.yml` | Auto-label on issue open |
| Action | `.github/workflows/stale.yml` | Stale issue management |
| Action | `.github/workflows/welcome.yml` | Welcome first-timers |
| Config | `.github/CODEOWNERS` | Code ownership routing |

---

## Technical Notes

### Label Taxonomy

```
type: bug          (#d73a4a)    type: feature      (#a2eeef)
type: enhancement  (#a2eeef)    type: docs         (#0075ca)
type: test         (#ededed)    type: chore        (#ededed)

priority: P1       (#b60205)    priority: P2       (#d93f0b)
priority: P3       (#fbca04)    priority: P4       (#0e8a16)

status: needs-triage  (#ededed)    status: needs-info  (#d876e3)
status: confirmed     (#0e8a16)    status: in-progress (#1d76db)
status: stale         (#ffffff)

area: core         (#006b75)    area: installer    (#006b75)
area: synapse      (#006b75)    area: cli          (#006b75)
area: pro          (#006b75)    area: health-check (#006b75)

community: good first issue  (#7057ff)
community: help wanted       (#008672)
governance (#006b75)  duplicate (#cfd3d7)  wontfix (#ffffff)
```

### Stale Policy

- Issues: stale after 30 days, close after 7 more days
- PRs: stale after 45 days, never auto-close (`days-before-pr-close: -1`)
- Exempt: `priority: P1`, `priority: P2`, `status: in-progress`
- Schedule: daily at 01:30 UTC

### Key Actions

- `github/issue-labeler@v3.4` — regex-based auto-labeling
- `actions/stale@v9` — stale issue lifecycle
- Custom welcome workflow — first-time contributor greeting

---

## Definition of Done

- [ ] Todas as labels criadas e visiveis no repositorio (`gh label list` retorna taxonomia completa)
- [ ] Issue forms renderizam corretamente no GitHub (testar criando issue de teste)
- [ ] GitHub Actions executam sem erros no primeiro run (check Actions tab)
- [ ] 27 issues existentes re-triados com novas labels aplicadas
- [ ] Task de triage documentada e disponivel via `*help` do @devops
- [ ] Labels existentes (`needs-triage`, `enhancement`, `bug`, etc.) migradas ou removidas
- [ ] Nenhum issue sem pelo menos 1 label de `type:` e 1 de `priority:` apos triage

---

## Complexity

| Dimension | Score (1-5) | Notes |
|-----------|------------|-------|
| Scope | 3 | 12 novos arquivos, label setup |
| Integration | 2 | GitHub API, Actions |
| Infrastructure | 2 | CI workflows |
| Knowledge | 2 | GitHub Issue Forms, Actions |
| Risk | 1 | Nao-destrutivo, incremental |
| **Total** | **10** | STANDARD complexity |

---

## Estimation

- **Phase 1 (Foundation):** 1-2 horas
- **Phase 2 (Automation):** 1-2 horas
- **Phase 3 (Triage):** 2-3 horas
- **Total:** ~5-7 horas

---

## File List

_Updated as implementation progresses._

| File | Action | Status |
|------|--------|--------|
| `docs/stories/active/GHIM-001.story.md` | Create | Done |
| `docs/research/2026-02-20-github-issue-management/` | Create | Done |
| `.github/ISSUE_TEMPLATE/1-bug-report.yml` | Create | Done |
| `.github/ISSUE_TEMPLATE/2-feature-request.yml` | Create | Done |
| `.github/ISSUE_TEMPLATE/3-test-coverage.yml` | Create | Done |
| `.github/ISSUE_TEMPLATE/config.yml` | Create | Done |
| `.github/ISSUE_TEMPLATE/bug_report.md` | Delete | Done |
| `.github/ISSUE_TEMPLATE/feature_request.md` | Delete | Done |
| GitHub Labels (44 total) | Migrate/Create | Done |
| `.github/workflows/issue-labeler.yml` | Create | Done |
| `.github/workflows/stale.yml` | Create | Done |
| `.github/workflows/welcome.yml` | Update | Done |
| `.github/issue-labeler.yml` | Create | Done |
| `.github/labeler.yml` | Update | Done |
| `.github/issue-labeler.yml` | Create | Done |
| `.aios-core/development/tasks/github-issue-triage.md` | Create | Done |
| `.aios-core/development/checklists/issue-triage-checklist.md` | Create | Done |
| `.aios-core/development/scripts/issue-triage.js` | Create | Done |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-02-20 | @devops (Gage) | Story created with research basis |
| 2026-02-20 | @po (Pax) | Validated: GO CONDICIONAL (7/10). Applied fixes: Risks section, DoD section, epic alignment, AC refinement. Status Draft → Ready |
| 2026-02-20 | @devops (Gage) | Phase 1 complete: 13 labels renamed, 12 labels created, 6 obsolete deleted. 3 issue forms YAML + config.yml created. Old .md templates removed. |
| 2026-02-20 | @devops (Gage) | Phase 2 complete: 3 workflows created/updated (issue-labeler, stale, welcome). issue-labeler.yml config with regex rules. labeler.yml updated for PR file-based labeling with new label names. |
| 2026-02-20 | @devops (Gage) | Phase 3 complete: Task, checklist, script created. 31 issues triaged (5 bugs, 17 tests, 4 features, 3 chores, 1 docs, 1 governance). 0 untriaged remaining. |
