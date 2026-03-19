# Changelog — Agent Autonomy Squad

## v1.0.1 (2026-03-01)

### Corrigidos (Kaizen Audit)

- Removida referência quebrada `checklists/aci-checklist.md` em `agent-architect.md` (ACI checklist já definido inline)
- Registrado `QG-SCOUT` (advisory) no `config.yaml` — estava declarado no `ecosystem-scout.md` mas ausente do config
- Corrigido self-referential loop no handoff de `tasks/audit-agent.md` — FM-1 a FM-4 agora roteiam para `tasks/diagnose-autonomy-failure.md` (AA-T003)
- Removidos 4 diretórios vazios (`templates/`, `docs/`, `scripts/`, `config/`) e paths correspondentes do `config.yaml`

## v1.0.0 (2026-03-01)

Criação inicial do squad.

### Adicionados

- 6 agentes em 4 tiers:
  - `autonomy-chief` (Orchestrator) — triage e routing
  - `autonomy-auditor` (Tier 0) — diagnóstico e scoring
  - `agent-architect` (Tier 1) — design e otimização
  - `reasoning-engineer` (Tier 1) — reasoning patterns
  - `tool-smith` (Tier 2) — construção de tools
  - `ecosystem-scout` (Tier 2) — pesquisa open-source
- 7 tasks: audit-agent, create-autonomous-agent, diagnose-autonomy-failure, optimize-agent, suggest-tools, search-ecosystem, teach-reasoning
- 2 workflows: audit-optimize-cycle, create-agent-flow
- 1 checklist: autonomy-checklist (18 items, thresholds L3/L4/L5)
- 1 knowledge base: agent-autonomy-kb (14 elite minds, frameworks consolidados)
- 6 slash commands: chief, audit, create, diagnose, teach, find
- config.yaml com 11 use cases, 6 quality gates, research foundation
- Registrado no squad-registry v1.4.0

### Research Foundation

- 14 elite minds pesquisadas e incorporadas
- 8 key frameworks mapeados
- Referências acadêmicas linkadas (Weng, Yao, Shinn, Zhou)

### Validação

- Score: 7.4/10 (PASS)
- Tipo: Expert Squad
- Vetos: nenhum
- Fix aplicado: referência quebrada `data/autonomy-scoring-rubric.md` removida
