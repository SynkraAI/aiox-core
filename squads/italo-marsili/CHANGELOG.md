# Changelog — Squad italo-marsili

## [1.2.0] — 2026-03-02

### Added
- `checklists/mentor-session-quality.md` — checklist de validação para `*mentor-session` (7 critérios)
- `checklists/temperament-quality.md` — checklist de validação para `*temperament-analysis` (7 critérios)
- `checklists/vocation-quality.md` — checklist de validação para `*vocation-guidance` (7 critérios)
- `completion_criteria` para temperament-analysis e vocation-guidance no agent file
- `[SOURCE:]` tags em todas as signature_phrases (rastreabilidade para fontes primárias)
- `checklists` section em config.yaml (5 checklists registrados)

### Improved
- Checklist coverage de 40% para 100% (5 checklists / 5 tasks)
- Completion criteria coverage de 60% para 100% (5/5 tasks cobertas)
- Voice DNA com rastreabilidade total (12 phrases com [SOURCE:])
- Validation score de 8.99 para ~9.3 (EXCELLENT)

## [1.1.0] — 2026-03-02

### Added
- `config.yaml` normalizado para formato padrão AIOS (slashPrefix, entry_agent, independence, tags)
- `workflows/mentoring-flow.yaml` — workflow sequencial de 5 steps com gates de qualidade
- `checklists/diagnose-quality.md` — checklist de validação para task `*diagnose`
- `docs/validation-report-2026-03-02.md` — relatório de validação formal (7.8/10, PASS)
- `CHANGELOG.md` — este arquivo
- README expandido com exemplos de uso e diagrama de fluxo

### Fixed
- `config.yaml` sem campo `entry_agent` (usava `settings.default_agent`)
- Checklist coverage de 20% para 40% (2 checklists / 5 tasks)

## [1.0.0] — 2026-02-22

### Added
- Squad criado por @mind-cloner (Helix) + @squad-chief
- Agent `italo-marsili.md` (659 linhas, hybrid-style, DNA inline)
- 5 tasks: mentor-session, diagnose, temperament-analysis, vocation-guidance, evaluate-content
- 1 checklist: content-quality.md
- 1 data file: frameworks-reference.md
- Mind DNA source: `squads/mind-cloning/minds/italo-marsili/mind_dna_complete.yaml`
- Smoke test: 3/3 PASS (10/10 em todos)
- Fidelity: Elite (95%), Voice: 10/10, Thinking: 9/9
