# Changelog — Content Engine

Todas as mudancas notaveis deste squad serao documentadas neste arquivo.

---

## [2.0.1] - 2026-02-11

### Corrigido

- Adicionados agents orfaos ao config.yaml (dan-kennedy, david-ogilvy, social-strategist)
- Adicionados objection_algorithms aos 4 agents que nao tinham (devil-advocate, oraculo-torriani, social-strategist, content-engine)
- Padronizados campos top-level no config.yaml (name, version, entry_agent)
- Adicionado execution_type em todas as tasks
- Adicionada orientacao de auto-correcao em todos os checklists

## [2.0.0] - 2026-02-10

### Adicionado

- Squad unificado: merge de social-strategist (8 agents) + copy (9 agents) + devil-advocate
- Arquitetura 3 camadas: Estrategia, Producao, Qualidade
- Mecanismo de debate obrigatorio para conteudo de feed
- Quality gates (QG-001 a QG-005)
- Orchestrador content-engine com routing inteligente
- Sub-router copy-chief para copy de vendas
- Devil's Advocate para quality challenge
- Visual QA checklist
- 5 workflows: weekly-sprint, mid-week-adapt, debate-session, carousel-creation, content-piece
