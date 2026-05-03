# ACORE Claude Skills Migration Preflight — 2026-05-01

## Resumo

Este preflight prepara o port controlado dos padrões do `sinkra-hub` para o `aiox-core`:

- EPIC-109: `commands -> skills`.
- EPIC-117: `agent.md -> SKILL.md` e ativação determinística.

O escopo inicial é restrito aos 12 agentes core AIOX. Superfícies Claude de comando que não são ativadores de agentes permanecem fora do escopo.

## Estado do Worktree

| Item | Valor |
|------|-------|
| Repo | `/Users/rafaelcosta/Projects/AIOX/aiox-core` |
| Branch | `feat/story-123.9-codex-skills-bootstrap` |
| HEAD | `94842cd0` |
| Mudanças pré-existentes | `.aiox-core/data/entity-registry.yaml`, `.claude/settings.local.json` |

As mudanças pré-existentes não pertencem a esta migração e não devem ser revertidas ou sobrescritas.

## Baseline Quantitativo

| Métrica | Valor |
|---------|-------|
| Agentes core source-of-truth | 12 |
| Memory files de agentes core | 10 |
| Claude AIOX agent commands | 12 |
| Claude skill directories com `SKILL.md` | 7 |
| Arquivos sob `.claude/commands` | 35 |
| Referências a `.claude/commands` no repo | 196 |
| Referências a `activation_type` no repo | 0 |

## Agentes Core

- `aiox-master`
- `analyst`
- `architect`
- `data-engineer`
- `dev`
- `devops`
- `pm`
- `po`
- `qa`
- `sm`
- `squad-creator`
- `ux-design-expert`

## Contrato-Alvo

| Papel | Caminho |
|-------|---------|
| Source of truth | `.aiox-core/development/agents/<agent-id>.md` |
| Claude skill canônica | `.claude/skills/AIOX/agents/<agent-id>/SKILL.md` |
| Claude command legado | `.claude/commands/AIOX/agents/<agent-id>.md` |
| Codex skill existente | `.codex/skills/aiox-<agent-id>/SKILL.md` |

## Superfícies Fora de Escopo

Estas superfícies continuam válidas como comandos e não devem ser migradas nesta primeira fase:

- `.claude/commands/synapse/**`
- `.claude/commands/greet.md`
- `.claude/commands/design-system/**`
- `.claude/commands/cohort-squad/**`

## Principais Consumidores a Adaptar em Stories Futuras

| Área | Arquivos |
|------|----------|
| Config de sync | `.aiox-core/core-config.yaml`, `.aiox-core/framework-config.yaml` |
| Orquestrador de sync | `.aiox-core/infrastructure/scripts/ide-sync/index.js` |
| Transformer Claude | `.aiox-core/infrastructure/scripts/ide-sync/transformers/claude-code.js` |
| Validação Claude | `.aiox-core/infrastructure/scripts/validate-claude-integration.js` |
| Doctor | `.aiox-core/core/doctor/checks/ide-sync.js`, `.aiox-core/core/doctor/checks/commands-count.js`, `.aiox-core/core/doctor/checks/skills-count.js` |
| Hook runtime | `.claude/hooks/synapse-engine.cjs`, `.aiox-core/core/synapse/runtime/hook-runtime.js` |
| Ativação | `.aiox-core/development/scripts/unified-activation-pipeline.js`, `.aiox-core/development/scripts/agent-config-loader.js` |
| Docs e integração | `docs/ide-integration.md`, `docs/guides/ide-sync-guide.md`, `docs/aiox-agent-flows/*` |

## Ordem Recomendada

1. `ACORE-SKILLS.2`: dual-write de Claude agent skills sem remover commands. Concluído em 2026-05-01.
2. `ACORE-SKILLS.3`: validadores e doctor aceitando skills como superfície canônica. Concluído em 2026-05-01.
3. `ACORE-SKILLS.4`: `activation_type: pipeline` e gate determinístico. Concluído em 2026-05-01.
4. `ACORE-SKILLS.5`: cleanup semântico dos comandos AIOX agent legados. Concluído em 2026-05-01.
5. `ACORE-SKILLS.6`: avaliar expansão opcional para `squads/*/agents`. Concluído em 2026-05-01.

## Resultado ACORE-SKILLS.2

- `npm run sync:ide:claude` gera 12 comandos legados e 12 skills em `.claude/skills/AIOX/agents/<agent-id>/SKILL.md`.
- `.claude/commands/AIOX/agents/*.md` permanece como compatibilidade transicional.
- `.gitignore` abre exceção restrita para versionar apenas os novos Claude agent skills AIOX.
- `validate:codex-skills` foi ajustado para não tratar squad-chief skills geradas e válidas como órfãs, preservando falha para órfãos reais.

## Resultado ACORE-SKILLS.3

- `validate:claude-sync` valida 24 arquivos esperados: 12 comandos legados e 12 skills Claude.
- `validate:claude-integration` exige agent skills e mantém comandos como superfície legada com warning se ausentes.
- Doctor `ide-sync` reporta skills e commands separadamente.
- Doctor `skills-count` conta `SKILL.md` recursivo e confirma `12/12` AIOX agent skills.

## Resultado ACORE-SKILLS.4

- Os 12 Claude agent skills declaram `activation_type: pipeline`.
- `validate:claude-integration` falha se o campo estiver ausente em qualquer agent skill core.
- O hook `UserPromptSubmit` foi auditado e não alterado porque não recebe evento estruturado de ativação de skill.

## Resultado ACORE-SKILLS.5

- Os 12 comandos em `.claude/commands/AIOX/agents/*.md` são shims de compatibilidade.
- Cada shim aponta para o `SKILL.md` canônico e mantém fallback para `.aiox-core/development/agents/<agent-id>.md`.
- O transformer full-payload continua disponível para targets que não usam a superfície Claude skills-first.

## Resultado ACORE-SKILLS.6

- Escopo de squads auditado: 1 squad local e 8 squad agent files.
- A expansão para squads não foi implementada nesta migração porque ainda não existe contrato de namespace Claude para `squads/*/agents`.
- Recomendação: criar epic separado `ACORE-SQUAD-SKILLS` se a intenção for projetar squad skills Claude além dos 12 agentes core.

## Gates Finais Reexecutados em 2026-05-03

- `npm run sync:ide:claude` — 12 agents, 12 skills, 24 files synced.
- `npm run validate:claude-sync` — PASS, 24 expected / 24 synced.
- `node .aiox-core/infrastructure/scripts/validate-claude-integration.js` — PASS, 12 skills + 12 legacy commands.
- `npm run sync:skills:codex` — generated 12 local Codex skills.
- `npm run validate:codex-skills` — PASS, 12 skills checked.
- `git diff --check` — PASS.

## Próximo Epic Recomendado

Se a intenção for expandir o mesmo padrão para `squads/*/agents`, abrir um epic separado `ACORE-SQUAD-SKILLS` antes de implementar. Esse epic deve decidir namespace Claude, cobertura por todos os agents vs entry chiefs, validação de sources e relação entre `bootstrap.js`, `sync:skills:codex` e `sync:ide:claude`.
