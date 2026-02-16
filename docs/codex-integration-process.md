# Integracao AIOS com Codex CLI (Estado Atual)

Este documento descreve o estado operacional atual da integracao AIOS + Codex CLI no AIOS `4.0.4`.
O foco aqui nao e historico: e operacao pratica, compatibilidade real e como manter sem regressao.

## Resumo Executivo

O Codex hoje e alvo de primeira classe no AIOS:

- `AGENTS.md` como contrato operacional do projeto no Codex
- suporte oficial no installer/sync (`codex` em `ide-configs`)
- skills nativas via `.codex/skills` com estrategia local-first
- pipeline canonico de greeting/ativacao compartilhado
- validadores dedicados para detectar drift rapidamente
- suporte a notify command e hooks de ferramenta em releases recentes do Codex CLI

Em termos praticos: Codex esta no mesmo trilho arquitetural das integracoes principais do AIOS, sem caminho paralelo legado.

## Status de Compatibilidade (AIOS 4.0.4)

| O que você quer fazer | Funciona no Codex? | Como fazer |
| --- | --- | --- |
| Ativar agentes AIOS | Works | `/skills` depois escolha `aios-<agent-id>` |
| Sincronizar e validar arquivos AIOS | Works | `npm run sync:ide:codex` e `npm run validate:codex-sync` |
| Checagens automáticas antes/depois de ações | Limited | Rode `npm run validate:parity` manualmente; parte da automação depende de disciplina no fluxo |

Regra prática para iniciantes:
- Se você quer o máximo de automação (checagens automáticas sem precisar rodar comandos), prefira Claude Code ou Gemini CLI.
- Se você usa Codex, siga o fluxo local-first: ative agentes via `/skills` e rode os validadores após cada mudança.

## Arquitetura Canonica

### Fonte de verdade

- Agentes canonicos: `.aios-core/development/agents/*.md`
- Regras de projeto Codex: `AGENTS.md`

### Pipeline de ativacao

- Runtime: `.aios-core/development/scripts/activation-runtime.js`
- Entrada de greeting: `.aios-core/development/scripts/generate-greeting.js`
- Contrato: skills e atalhos carregam agente canonico e renderizam greeting via pipeline unificado

### Artefatos Codex no projeto

- Agentes auxiliares: `.codex/agents/`
- Skills locais: `.codex/skills/aios-*/SKILL.md`

## Fluxo Operacional Recomendado

1. Sincronizar artefatos Codex de projeto:
   - `npm run sync:ide:codex`
2. Gerar/atualizar skills locais:
   - `npm run sync:skills:codex`
3. Validar consistencia:
   - `npm run validate:codex-sync`
   - `npm run validate:codex-integration`
   - `npm run validate:codex-skills`
   - `npm run validate:paths`
4. No Codex, usar `/skills` e escolher `aios-<agent-id>` como ativacao padrao.

Fallback: atalhos definidos em `AGENTS.md` (`@architect`, `/architect`, etc.).

## Politica de Escopo (Importante)

Este repositorio usa local-first para skills:

- preferir `.codex/skills` versionado no projeto
- evitar duplicar com `~/.codex/skills`
- usar `npm run sync:skills:codex:global` apenas quando quiser instalacao global explicitamente

Isso evita menu duplicado no `/skills` e reduz drift entre equipe/CI.

## Guardrails e Anti-Regressao

Comando consolidado de paridade:
- `npm run validate:parity` (Claude + Codex + Gemini + guardrails de paths/skills)

### Validadores

- Integracao estrutural: `.aios-core/infrastructure/scripts/validate-codex-integration.js`
- Skills: `.aios-core/infrastructure/scripts/codex-skills-sync/validate.js`
- Paths/contratos: `.aios-core/infrastructure/scripts/validate-paths.js`

### Smoke test rapido

```bash
npm run sync:ide:codex
npm run sync:skills:codex
npm run validate:codex-sync
npm run validate:codex-integration
npm run validate:codex-skills
npm run validate:paths
```

Criterio de sucesso:

- `AGENTS.md` presente e coerente
- `.codex/agents/*.md` existente
- `.codex/skills/aios-*/SKILL.md` existente
- validadores sem erro

## Recursos Recentes do Codex (AIOS 4.0)

- `notify` command configuravel no `config.toml`
- aprovacoes por preset (`suggest`/`auto-edit`/`full-auto`)
- hooks de ferramenta e de execucao de comandos em evolucao no CLI

No AIOS, o caminho recomendado continua: `AGENTS.md` + `/skills` + MCP + scripts de sync/validacao.

## Limitacoes de Hooks no Codex (Impacto Real)

Mesmo com melhorias recentes, o Codex ainda nao replica 1:1 o lifecycle de hooks do Claude.

Impactos praticos:

- menor automacao de eventos de ciclo de sessao (`SessionStart/SessionEnd`) no padrao AIOS
- menor capacidade de enforcement automatico em `beforeTool/afterTool`
- trilha automatica de auditoria menos rica quando comparada ao fluxo com hooks completos

Mitigacao operacional no AIOS:

- fortalecer `AGENTS.md` como contrato de execucao
- usar `/skills` como ativacao padrao de agentes
- usar MCP para contexto e integracoes
- rodar sync + validadores com disciplina (`sync:ide:codex`, `sync:skills:codex`, `validate:codex-sync`, `validate:codex-integration`, `validate:codex-skills`)

## Problemas Classicos e Correcao

### Skills duplicadas no `/skills`

Causa tipica:
- artefatos duplicados entre `.codex/skills` e `~/.codex/skills`

Correcao:
- manter local-first neste repo
- evitar sync global durante desenvolvimento local

### Greeting diferente entre Codex e outros alvos

Causa tipica:
- pular pipeline canonico de greeting

Correcao:
- sempre gerar greeting via `generate-greeting.js` (runtime unificado)
- garantir skill apontando para agente canonico em `.aios-core/development/agents/`

### Drift entre agente canonico e skill

Causa tipica:
- editar skill manualmente sem resync

Correcao:
- rodar `npm run sync:skills:codex`
- validar com `npm run validate:codex-skills`

## Relacao com a Documentacao Geral

Este documento complementa:

- `AGENTS.md` (contrato operacional no Codex)
- `docs/ide-integration.md` (visao comparativa por IDE)
- `README.md` (quick start e comandos principais)

Se houver divergencia entre estes documentos, a ordem de verdade para operacao de projeto e:

1. `AGENTS.md`
2. scripts reais em `package.json`
3. este documento
4. docs de overview
