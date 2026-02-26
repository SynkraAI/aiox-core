# Handoff para Revisão Codex — NOG-9 UAP & SYNAPSE Development Plan

**De:** Atlas (Analyst) + Aria (Architect)
**Para:** Decisor humano — revisão final no Codex
**Data:** 2026-02-21
**Objetivo:** Validar o plano de desenvolvimento incremental antes de criar stories de implementação

---

## Contexto

A Story NOG-9 executou 21 pesquisas comparativas (AIOS vs Claude Code, Cursor, Codex CLI, Gemini CLI, Antigravity) e produziu 26 artefatos de análise. O resultado é um plano de desenvolvimento incremental em 4 fases com 20 melhorias mapeadas.

**Repositório de pesquisa:** `docs/research/2026-02-21-uap-synapse-research/`

---

## O Que Precisa de Revisão

### 1. Priorização das Fases

O roadmap propõe 4 fases com ordem específica. Valide se a sequência faz sentido para o negócio:

```
Phase 0 (Imediata — 2h):     Bug fixes + performance crítica
Phase 1 (Próximo Sprint — 8h): Infra + output presets
Phase 2 (Sprint +1 — 12h):    UX + session intelligence
Phase 3 (Estratégica):         Architectural stories
```

### 2. Decisões Arquiteturais Implícitas

| Decisão | Proposta | Alternativa | Trade-off |
|---------|----------|-------------|-----------|
| Output formatter | Post-hoc (sem mudar pipeline) | Inline no pipeline | Simplicidade vs performance |
| Domain format | Migrar KEY=VALUE → Markdown | Manter KEY=VALUE | 34-38% token saving vs migration effort |
| Config separation | Split core-config.yaml em 2 | Manter monolito | Industry alignment vs breaking change |
| Session resume | Novo `--continue` flag | Não implementar | Table stakes vs complexity |
| Skills export | Adotar formato Codex Skills | Formato próprio | Ecosystem play vs vendor lock |

### 3. Gaps vs Vantagens — Equilíbrio Correto?

**Estamos investindo nos gaps certos?**

| Investimento | Custo | Justificativa |
|-------------|-------|---------------|
| Fix brackets (QW-1/2/3) | 75min | Feature sofisticada que estava morta |
| Git speedup (QW-5) | 30min | 830x melhoria, ROI absurdo |
| Output presets (MED-1) | 2h | 97% redução de output |
| Markdown domains (MED-2) | 3h | 34-38% token saving |
| Real token counting (STR-2) | 1 story | Único do mercado com estimativa estática |
| Session resume (STR-3) | 1 story | Table stakes — todos concorrentes têm |

**Estamos protegendo as vantagens certas?**

| Vantagem AIOS | Risco se não proteger | Ação proposta |
|--------------|----------------------|---------------|
| Multi-agent personas | Nenhum concorrente tem | Manter, sem ação |
| Deterministic injection | Cursor é probabilístico | Marketar como feature |
| Cross-IDE sync (6+ IDEs) | Codex Skills pode erodir | STR-6 como hedge |
| Adaptive greeting | Nenhum concorrente tem | Manter, sem ação |

---

## Inventário Completo de Melhorias (20 items)

### Phase 0 — Bug Fixes & Wiring (2h)

| ID | O Que | Por Que | Risco de NÃO fazer |
|----|-------|---------|-------------------|
| **QW-1** | Chamar `updateSession()` no hook-runtime | Brackets nunca atualizam — SYNAPSE sempre FRESH | Feature principal inoperante |
| **QW-2** | Preencher `last_tokens_used` do API response | Token counting usa estimativa fixa de 1500 | Brackets imprecisos |
| **QW-3** | Multiplicar chars/4 por 1.2x para XML | Subestima 15-25% em output SYNAPSE | Over-injection de tokens |
| **QW-5** | Ler `.git/HEAD` direto em vez de `execSync` | 52ms em 3 spawns síncronos | Lentidão visível ao usuário |
| **QW-4** | Remover `_coreConfig` do retorno do activate() | 15-20KB vazam para consumidores | Overhead de serialização |

**Evidência:** C4, C2, C6, A4, comparative-matrix.md

### Phase 1 — Infrastructure (8h)

| ID | O Que | Por Que | Risco de NÃO fazer |
|----|-------|---------|-------------------|
| **QW-6** | Cache JSON para core-config.yaml com mtime | Parse YAML a cada ativação (3.3ms) | Overhead acumulativo |
| **QW-7** | Atomic writes para sessão (write-tmp + rename) | Corrupção possível em crash | Perda silenciosa de estado |
| **QW-8** | Cleanup automático de sessões (TTL 7 dias) | Sessões acumulam indefinidamente | Disco preenchendo |
| **MED-1** | Output formatter com 4 presets | Consumers recebem blob de 25KB sempre | Waste + lentidão |
| **MED-6** | Habilitar git fsmonitor | `git status` leva 50-200ms | ProjectStatus timeout 60% |

**Evidência:** A1, A6, output-taxonomy.md, A7

### Phase 2 — UX & Intelligence (12h)

| ID | O Que | Por Que | Risco de NÃO fazer |
|----|-------|---------|-------------------|
| **MED-2** | Migrar domain bodies de KEY=VALUE → Markdown | Token noise no formato atual | 34-38% waste por prompt |
| **MED-5** | WorkflowNavigator ler story Status (não commands) | Sinal errado → sugestões erradas | UX degradada |
| **MED-4** | ContextDetector usar SessionState rico | Ignora dados ricos já disponíveis | Continuidade imprecisa |
| **MED-3** | Defaults de permissão por agente | Todos agentes começam em "ask" | Friction desnecessária |

**Evidência:** C3, B3, B2, A3

### Phase 3 — Strategic Stories

| ID | O Que | Por Que | Depende De |
|----|-------|---------|-----------|
| **STR-2** | Pipeline real de contagem de tokens | Único com estimativa estática no mercado | QW-1, QW-2 |
| **STR-1** | Separar core-config em settings + context | TODOS concorrentes separam; AIOS = monolito | Phase 1 |
| **STR-3** | Session resume (`--continue`/`--resume`) | Table stakes — Claude Code, Codex, Gemini têm | QW-7, QW-8 |
| **STR-4** | Loading progressivo de domínios SYNAPSE | Carregar metadata primeiro, body on-demand | MED-2 |
| **STR-5** | Memory self-editing (SYNAPSE escreve memórias) | Claude Code e Cursor permitem; AIOS = read-only | STR-2 |
| **STR-6** | Export tasks no formato Codex Skills | Standard aberto ganhando adoção | Nenhum |

**Evidência:** C2, comparative-matrix, D1/D3/D4

---

## Novos Helpers Code-Intel Propostos

| Helper | Consome | Produz | Depende De |
|--------|---------|--------|-----------|
| `synapse-helper.js` | User prompt + domains | Relevância de domínios, estimativa de tokens | QW-1 |
| `activation-helper.js` | Agent ID + session | Quais loaders pular, freshness check | QW-5 |
| `session-helper.js` | Session + project status | Workflow inference, continuidade | MED-4, MED-5 |
| `config-helper.js` | Core config | Análise de uso, sugestão de separação | STR-1 |
| `devops-helper.js` +enhance | Changed files | Impacto em domínios SYNAPSE | Nenhum |
| `qa-helper.js` +enhance | SYNAPSE config | Validação de token budgets | QW-3 |

---

## Métricas de Sucesso Projetadas

| Métrica | Atual | Phase 0 | Phase 1 | Phase 2 | Phase 3 |
|---------|-------|---------|---------|---------|---------|
| UAP p50 (warm) | ~260ms | ~210ms | <150ms | <140ms | <120ms |
| UAP p95 (cold) | ~400ms | ~350ms | <250ms | <230ms | <200ms |
| Bracket accuracy | **0%** | ~80% | ~85% | ~90% | >95% |
| Token estimation | ~70% | ~85% | ~90% | ~90% | >95% |
| Output size | ~25KB | ~600B | ~600B | ~600B | ~600B |
| ProjectStatus timeout | ~60% | ~60% | <10% | <10% | <5% |
| Session continuity | None | None | Atomic | Rich | Resume |

---

## Perguntas para Decisão

1. **Phase 0 — executar imediatamente?** São apenas bug fixes e wiring. 2h de trabalho. Benefício desproporcional.

2. **MED-2 (Markdown domains) — aceitar o migration cost?** 3h de migração para 34-38% de token savings. Afeta todos os domínios existentes.

3. **STR-3 (Session Resume) — qual prioridade real?** É table stakes na indústria, mas AIOS funciona sem. Implementar antes ou depois de STR-2?

4. **STR-6 (Skills Export) — investir agora ou esperar?** Codex Skills está ganhando adoção, mas ainda cedo para saber se será standard. Investir cedo ou wait-and-see?

5. **Helpers novos — implementar junto com as Quick Wins ou separar?** `synapse-helper` e `activation-helper` dependem de QW-1 e QW-5 respectivamente. Faz sentido uma story combinada?

6. **Alguma melhoria que devemos CORTAR?** O roadmap tem 20 itens. Algum é "nice to have" demais para o momento?

---

## Referência de Arquivos para Deep Dive

| Documento | Tamanho | O Que Contém |
|-----------|---------|-------------|
| `RESEARCH-SUMMARY.md` | Executive summary | Visão geral + scorecard + descobertas |
| `comparative-matrix.md` | 11 dimensões | AIOS vs 5 concorrentes, gap analysis |
| `output-taxonomy.md` | Presets completos | 4 presets com interfaces TypeScript + benchmarks |
| `optimization-roadmap.md` | 20 melhorias | Cada item com evidência, esforço, prioridade |
| `code-intel-helpers.md` | 6 helpers | APIs propostas, dependências, test strategy |
| `wave-{1-4}/` (21 files) | Pesquisas brutas | Dados primários de cada pesquisa `/tech-search` |

---

## Próximos Passos Após Revisão

1. Validar/ajustar priorização
2. `@sm *draft` para criar Story NOG-10 (Phase 0 Quick Wins)
3. `@sm *draft` para criar stories estratégicas (STR-1 a STR-6)
4. `@po *validate-story-draft` em cada story criada
5. Executar Phase 0 imediatamente (~2h)

---

*Handoff preparado por Atlas + Aria para revisão humana no Codex.*
