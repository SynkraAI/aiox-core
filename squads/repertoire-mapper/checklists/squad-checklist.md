# Squad Checklist — Repertoire Mapper

## Structure
- [x] Squad directory exists at `squads/repertoire-mapper/`
- [x] All required subdirectories created (agents, tasks, workflows, templates, checklists, data, docs)
- [x] config.yaml is valid YAML

## Agents
- [ ] Orchestrator agent exists (repertoire-chief)
- [ ] At least one Tier 0 agent exists (polanyi, collins)
- [ ] All agents have tier assigned
- [ ] All agents have voice_dna section
- [ ] All agents have commands defined
- [ ] All agents are 300+ lines
- [ ] All agents reference their frameworks
- [ ] All agents have integration section (handoffs)

## Workflows
- [x] full-mapping-pipeline.md — Complete end-to-end pipeline
- [x] quick-qa-session.md — Low-friction Q&A with Kelly
- [x] source-ingestion.md — Process single source
- [x] repertoire-validation.md — Validate with Argyris
- [x] knowledge-graph-update.md — Update graph incrementally
- [ ] All workflows have 3+ phases
- [ ] All workflows have quality gates
- [ ] All workflows have agent assignments

## Tasks
- [ ] All tasks follow Task Anatomy (8 fields: id, purpose, executor, inputs, preconditions, steps, outputs, validation)
- [ ] Complex tasks are 500+ lines
- [ ] Executor assigned for each task

## Documentation
- [ ] README.md complete with all sections
- [ ] Usage examples provided
- [ ] Installation instructions clear
- [ ] Knowledge base populated

## Quality
- [ ] Overall score >= 7.0
- [ ] No blocking items failed
- [ ] Research foundation documented (9 elite minds)
- [ ] All quality gates defined (QG-001 through QG-005)

## Integration
- [ ] Dependencies on ETL and MMOS documented
- [ ] Embedded tools defined (Dreyfus, Ericsson, Lakoff, Codex Vitae)
- [ ] Commands registered for slash_prefix
