# Changelog — Squad Insight

## [1.1.0] - 2026-02-18

### Added
- `entry_agent: insight-chief` in config.yaml
- 3 handoff templates: `handoff-production-tmpl.md`, `handoff-automation-tmpl.md`, `handoff-operations-tmpl.md`
- `objection_algorithms` section in all 4 agents (12 objections total)
- `core_principles` section in market-scout and data-storyteller
- `metaphors` in voice_dna for all 4 agents (16 metaphors total)
- +1 `output_example` in market-scout (`*keywords` command)
- +1 `output_example` in data-storyteller (`*dashboard-weekly` command)
- Command reference table in README.md
- This CHANGELOG.md

### Changed
- config.yaml: templates list expanded (4 → 7)

## [1.0.0] - 2026-02-11

### Added
- Initial squad creation
- 4 agents: insight-chief, digital-profiler, market-scout, data-storyteller
- 5 tasks: run-profiler, run-scout, run-storyteller, qa-checkpoint, prepare-handoff
- 2 workflows: wf-new-lead, wf-recurring-reports
- 4 templates: dossie-tmpl, opportunity-map-tmpl, impact-report-tmpl, monthly-report-tmpl
- 1 checklist: qa-checkpoint-checklist
- 5 data files: niche-config, scoring-rubric, brazilian-context, tool-strategies, capability-tools
- 2 doc files: tool-discovery-report, tool-integration-plan
- README.md with quick start and output conventions
