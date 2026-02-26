# Handoff: Code-Intel RegistryProvider â€” Analise de Integracao no Epic TOK

**From:** @architect (Aria)
**To:** @pm (Morgan)
**CC:** @po (Pax)
**Date:** 2026-02-22
**Type:** Epic Scope Analysis + Backlog Item Review
**Priority:** Medium (nao urgente, decisao antes de iniciar Epic TOK)

---

## 1. Contexto

### O Que Aconteceu

1. **Epic NOG completou 26/26 stories** â€” todo o sistema de Code Intelligence esta implementado e testado
2. **Problema:** Code-intel tem 6 helpers invocados por 15+ tasks no SDLC, mas **todas as chamadas retornam `null`** porque nenhum MCP provider esta configurado
3. **Analise arquitetural** revelou que o code-intel funciona 100% com fallback graceful (zero erros, zero blocking) â€” mas sem dados reais
4. **Analise comparativa** com [Axon.MCP.Server](https://github.com/ali-kamali/Axon.MCP.Server) (produto open-source de code intelligence) validou que nossa arquitetura e superior para nosso caso de uso

### Documentos de Referencia

| Documento | Conteudo |
|-----------|---------|
| [CODE-INTEL-FLOWCHARTS.md](../../architecture/CODE-INTEL-FLOWCHARTS.md) | Mapa completo do sistema code-intel (16 secoes) |
| [SYNAPSE-FLOWCHARTS-v3.md](../../architecture/SYNAPSE/SYNAPSE-FLOWCHARTS-v3.md) | SYNAPSE medido pos-NOG |
| [Epic TOK INDEX](../epics/epic-token-optimization/INDEX.md) | Epic Token Optimization (8 stories) |
| [Backlog Item 1740200000001](../backlog.md) | Item de backlog criado para RegistryProvider |

---

## 2. A Proposta

### RegistryProvider â€” Provider Nativo para Code-Intel

Criar um provider nativo que usa o **Entity Registry** (715 entidades, 14 categorias) como fonte de dados, eliminando a dependencia de MCP para ~70% dos use cases.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     Code-Intel Client                   â”‚
â”‚              (Circuit Breaker + Session Cache)           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚                       â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  RegistryProvider   â”‚  â”‚  CodeGraphProvider       â”‚
    â”‚  (NOVO â€” T1 Always) â”‚  â”‚  (Existente â€” T3 MCP)   â”‚
    â”‚                     â”‚  â”‚                          â”‚
    â”‚  Fonte: entity-     â”‚  â”‚  Fonte: Code Graph MCP   â”‚
    â”‚  registry.yaml      â”‚  â”‚  (quando disponivel)     â”‚
    â”‚                     â”‚  â”‚                          â”‚
    â”‚  PTC-eligible: SIM  â”‚  â”‚  PTC-eligible: NAO       â”‚
    â”‚  Infra: ZERO        â”‚  â”‚  Infra: MCP Server       â”‚
    â”‚  Cobertura: ~70%    â”‚  â”‚  Cobertura: 100% (AST)   â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Primitivas Cobertas pelo RegistryProvider

| Primitiva | Fonte no Registry | Qualidade |
|-----------|------------------|-----------|
| `findReferences` | cross-references do scanner | Boa (pattern-based) |
| `getDefinition` | entities com filepath + line | Boa |
| `getDependencies` | dependency extractors (JS, YAML, MD) | Boa |
| `getEntityInfo` | metadata completa da entidade | Excelente |
| `getSymbolsInFile` | entities filtradas por filepath | Boa |
| `findPatterns` | Nao coberto | Requer AST |
| `analyzeComplexity` | Nao coberto | Requer AST |
| `getCallGraph` | Nao coberto | Requer AST |

**Resultado:** 5/8 primitivas cobertas sem MCP = ~70% dos use cases dos helpers.

---

## 3. A Decisao Para o PM

### Opcao A: Manter no Backlog (Recomendacao do Architect)

**Desenvolver APOS Wave 1 do Epic TOK (TOK-1 + TOK-1.5).**

| Pro | Contra |
|-----|--------|
| Epic TOK mantem escopo limpo e focado | Code-intel continua retornando null durante TOK |
| Wave 1 responde perguntas-chave (registry schema, baseline) | Perde oportunidade de ter T1 real para validar PTC |
| Menos risco de scope creep | Duas fases de trabalho separadas |
| RegistryProvider construido sobre fatos medidos | |

**Trigger para acao:** Apos TOK-1 (Tool Registry) e TOK-1.5 (Baseline) estarem prontos.

### Opcao B: Inserir como Story no Epic TOK

**Adicionar uma story TOK-7: RegistryProvider como primeiro T1 consumer real.**

| Pro | Contra |
|-----|--------|
| RegistryProvider valida T1 tier com dados reais | Aumenta escopo do epic (+16-24h) |
| Code-intel comeca a funcionar durante o epic | Cria dependencia cruzada com Epic NOG artifacts |
| PTC (TOK-3) teria um T1 provider real para testar | Wave 1 foundation fica mais pesada |
| Baseline (TOK-1.5) mediria com vs sem provider | |

**Se escolhida:** Story ficaria em Wave 2 (P1), blocked by TOK-1 (registry schema).

### Opcao C: Hibrida â€” Placeholder em TOK, Execucao Pos-Wave 1

**Reservar slot TOK-7 no INDEX mas so executar apos Wave 1 gate.**

| Pro | Contra |
|-----|--------|
| Escopo do epic inclui a intencao | Pode criar falsa expectativa de entrega |
| Permite planning sem commitment | Wave gate pode atrasar se foundation demora |
| Flexibilidade de timing | |

---

## 4. Informacoes Para Decisao

### Impacto de Nao Fazer (Status Quo)

- **15+ tasks** continuam invocando code-intel helpers e recebendo `null`
- **Zero funcionalidade quebrada** (fallback graceful garante isso)
- **Zero impacto em performance** (circuit breaker abre instantaneamente)
- **Custo:** Apenas oportunidade perdida de ter dados enriched

### Impacto de Fazer

- **5/8 primitivas** passam a retornar dados reais do Entity Registry
- **Helpers** comecam a fornecer: blast radius analysis, dependency mapping, convention checking, duplicate detection, pre-push impact
- **~70% cobertura** sem nenhuma infraestrutura extra
- **PTC-eligible** (ADR-3): RegistryProvider nativo pode ser usado em PTC code blocks

### Esforco Estimado

| Componente | Horas |
|-----------|-------|
| RegistryProvider implementation (5 primitivas) | 8-12h |
| Integration com CodeIntelClient (provider selection) | 2-4h |
| Testes (unit + integration + fallback) | 4-6h |
| Documentacao e CODE-INTEL-FLOWCHARTS update | 2h |
| **Total** | **16-24h** |

### Compatibilidade com Epic TOK

| TOK Story | Impacto do RegistryProvider |
|-----------|---------------------------|
| TOK-1 (Tool Registry) | RegistryProvider seria registrado como T1 tool |
| TOK-1.5 (Baseline) | Poderia medir com/sem provider â€” dados mais ricos |
| TOK-2 (Deferred/Search) | Nenhum (RegistryProvider e T1 Always) |
| TOK-3 (PTC) | **Beneficio direto:** RegistryProvider e PTC-eligible |
| TOK-4A (Handoff) | Nenhum |
| TOK-4B (Input Examples) | Poderia ter examples para RegistryProvider tools |
| TOK-5 (Analytics) | Mais dados para medir (provider invocations) |
| TOK-6 (Dynamic Filtering) | RegistryProvider results sao filtraveis |

---

## 5. Analise Competitiva (Resumo)

Comparacao completa com [Axon.MCP.Server](https://github.com/ali-kamali/Axon.MCP.Server) â€” produto open-source de code intelligence (Python, PostgreSQL, Tree-sitter, 27 MCP tools):

| Dimensao | Axon | AIOS Code-Intel | Veredito |
|----------|------|-----------------|----------|
| Search semantico (embeddings) | pgvector + sentence-transformers | Nao tem | Axon melhor |
| Call graph bidirecional | AST-based, depth 1-5 | `getDependencies` generico | Axon melhor |
| Architecture auto-detection | 4 tools dedicadas | Nao tem | Axon melhor |
| Agent-specific enrichment | Nao tem | 6 domain helpers | **AIOS melhor** |
| SDLC integration | Nao tem | 15+ tasks throughout lifecycle | **AIOS melhor** |
| Zero-infrastructure | Requer Docker+PostgreSQL+Redis | Zero setup (fallback) | **AIOS melhor** |
| Provider abstraction | Monolitico | ProviderInterface swappable | **AIOS melhor** |
| PTC compatibility | Impossivel (MCP) | Nativo (ADR-3) | **AIOS melhor** |
| Multi-repo | Sim (GitLab, Azure DevOps) | Mono-repo | Axon melhor |

**Conclusao:** Axon e superior em raw code intelligence (AST, embeddings, multi-repo). AIOS e superior em agent-centric enrichment e SDLC integration. Sao produtos com propositos diferentes. Nao recomendamos usar Axon como provider (AGPL license, overhead de infra, 80% features irrelevantes para nosso stack).

**Licoes aprendidas do Axon** que podemos aplicar no futuro:
- Semantic search com embeddings (pos-TOK)
- Call graph bidirecional para `getDependencies`
- Architecture detection para `planning-helper`
- Prometheus metrics para code-intel analytics (alinha com TOK-5)

---

## 6. Recomendacao do Architect

**Opcao A (Manter no backlog, executar apos TOK Wave 1)** e a mais segura e pragmatica:

1. Epic TOK mantem escopo limpo (8 stories, ~28-38 pontos)
2. Wave 1 cria o Tool Registry e Baseline â€” fundacao necessaria
3. RegistryProvider e construido sobre fatos medidos, nao suposicoes
4. Zero urgencia â€” fallback graceful garante que nada esta quebrado

**Se o PM decidir pela Opcao B**, a story deveria:
- Ficar em Wave 2 (P1), blocked by TOK-1
- Ser estimada em 3-5 pontos
- Ter @dev como executor e @architect como quality gate
- Incluir medicao de before/after token impact

---

## 7. Decisao Recomendada (para execucao imediata)

**Recomendacao operacional:** seguir **Opcao A** agora (manter RegistryProvider no backlog), com reavaliacao apos gate de Wave 1 do Epic TOK.

**Motivos:**
1. Evita scope creep no Epic TOK enquanto ainda existem ajustes de consistencia em stories/epic.
2. Mantem foco em foundation (TOK-1, TOK-1.5, TOK-2).
3. Reduz risco de bloqueio por boundaries/permissoes em `code-intel`.

---

## 8. Plano de Atualizacao para Agentes Claude Code

### 8.1 @pm (Morgan) - Epic + decisao de produto

1. Atualizar `docs/stories/epics/epic-token-optimization/INDEX.md` com decisao explicita: `TOK-7 fora do epic por enquanto`.
2. Inserir criterio de reentrada: `reavaliar TOK-7 apos W1 concluida e validada`.
3. Atualizar dependency graph e wave notes para refletir que TOK-7 nao bloqueia W1-W3.
4. Registrar decisao em changelog do epic com data e racional.

### 8.2 @po (Pax) - Backlog + ajuste das 8 stories TOK

1. Atualizar `docs/stories/backlog.md` no item `1740200000001` com status: `BLOCKED by TOK W1 gate`.
2. Definir trigger objetivo de desbloqueio: `TOK-1 + TOK-1.5 Done + validacao tecnica`.
3. Ajustar as 8 stories TOK para remover referencias quebradas e adicionar ACs verificaveis.
4. Padronizar secoes obrigatorias em cada story:
   - `Validation Evidence`
   - `Dependencies`
   - `Boundary Impact (L1-L4)`
   - `Scope Source of Truth (project/global)`

### 8.3 @sm (River) - Sequenciamento e readiness

1. Revalidar ordem de execucao por wave apos ajustes de PO.
2. Garantir checklist de readiness em cada story antes de status `Ready`.
3. Atualizar rastreabilidade: story -> dependency -> quality gate.

### 8.4 @architect (Aria) - Gate tecnico

1. Validar compatibilidade de cada story com boundaries e schema atual.
2. Confirmar que nenhuma story depende de path bloqueado sem excecao aprovada.
3. Revisar sizing final por wave apos ajustes de PO/SM.

### 8.5 @qa (Quinn) - Gate de qualidade

1. Definir criterios minimos de teste por story (unit/integration/regression quando aplicavel).
2. Exigir evidencia de comparacao baseline vs pos-ajuste para historias de otimizacao.
3. Marcar bloqueadores antes de qualquer `GO` de wave.

---

## 9. Definition of Ready (obrigatorio para backlog/stories/epic)

Uma story TOK so pode ir para `Ready` se:
1. Todos os paths referenciados existem no repo atual.
2. ACs sao testaveis e possuem comando/metodo de validacao.
3. Dependencias e bloqueios estao explicitados.
4. Boundary impact esta classificado e aprovado.
5. Sizing foi revisado com justificativa tecnica.

---

## 10. Entregaveis esperados apos execucao dos agentes

1. `docs/stories/epics/epic-token-optimization/INDEX.md` atualizado com decisao e gates.
2. `docs/stories/backlog.md` atualizado no item `1740200000001`.
3. Oito stories TOK revisadas com padrao unico de AC/DoR.
4. Registro final de decisao: `GO`, `GO com condicoes`, ou `NO-GO` por wave.

---

## 11. Problemas imediatos a corrigir no Epic TOK (obrigatorio)

1. Referencias obrigatorias para arquivos inexistentes no repositorio atual.
2. Premissa imprecisa sobre bloqueio total de `.aios-core/core/` (existem excecoes em `allow`).
3. Inventario de frontmatter de tasks desatualizado (`requires:` nao esta so em `qa-run-tests.md`).
4. Contagens de testes desatualizadas, impactando sizing e risco.
5. Ambiguidade entre escopo `project (.mcp.json)` e `global (~/.claude.json)`.
6. Criterios PASS/CONCERNS/FAIL e GO/NO-GO sem thresholds operacionais claros.

---

## 12. Ajustes obrigatorios por story TOK (para PO/SM)

### TOK-1 - Unified Tool Registry

1. Adicionar AC explicito de integracao: quem consome `tool-registry.yaml`, onde carrega e fallback.
2. Definir compatibilidade de schema e estrategia de migracao incremental.
3. Mapear profiles para agentes reais em `.claude/agents/`.
4. Reestimar pontos com impacto real em tasks/agents/validacao.

### TOK-1.5 - Baseline Metrics

1. Substituir contagens estaticas por coleta automatizada no momento da execucao.
2. Definir baseline por workflow com amostra minima e variacao aceitavel.
3. Exigir rastreabilidade dos comandos usados para gerar baseline.

### TOK-2 - Deferred Search Capability-Aware

1. Separar ACs para escopo `project` versus `global` com regra de precedencia.
2. Validar capability detection contra MCPs reais disponiveis no projeto.
3. Exigir fallback para ambiente sem Docker Gateway.
4. Reestimar sizing de deteccao + fallback + validacao.

### TOK-3 - PTC Native Bulk Ops

1. Formalizar se `execution_mode` entra no schema v3 ou e metadata transitoria.
2. Exigir inventario real de tasks impactadas antes de implementar.
3. Diferenciar AC de PTC nativo versus automacao shell convencional.
4. Incluir backward compatibility para tasks legadas.

### TOK-4A - Agent Handoff Context Strategy

1. Definir ponto exato de integracao no pipeline SYNAPSE/orchestration.
2. Exigir AC de nao regressao no fluxo atual de subagentes.
3. Definir limites objetivos de compactacao de contexto.
4. Reestimar pontos pela complexidade de integracao.

### TOK-4B - Input Examples Registry

1. Definir limite e formato de `invocationExamples` para evitar degradacao de parsing.
2. Incluir AC de atualizacao do pipeline que popula registry.
3. Exigir validacao de performance apos extensao de schema.

### TOK-5 - Tool Usage Analytics

1. Definir eventos minimos, granularidade e retencao.
2. Vincular promote/demote a thresholds mensuraveis.
3. Incluir AC de privacidade/sanitizacao de payloads sensiveis.

### TOK-6 - Dynamic Filtering

1. Remover premissa de "core totalmente bloqueado" e registrar matriz real deny/allow.
2. Definir path de implementacao permitido por boundary model.
3. Exigir AC de regressao funcional e reducao de tokens com baseline comparavel.
4. Tratar como bloqueador qualquer solucao dependente de path vedado sem excecao aprovada.

---

## 13. Criterios de aceite do trabalho do PO (fechamento do handoff)

1. Todas as 8 stories TOK revisadas com ACs verificaveis e sem referencias inexistentes.
2. Todas com `Dependencies`, `Boundary Impact (L1-L4)` e `Scope Source of Truth`.
3. Sizing revisado e justificado com evidencia tecnica.
4. Stories marcadas `Ready` somente apos validacao de conflitos com rules/constitution.
5. `INDEX.md` atualizado com dependency graph, sizing e criterios GO/NO-GO por wave.

---

*Handoff unificado para execucao multiagente no Claude Code.*
*Escopo: decisao de integracao code-intel + atualizacao de backlog + ajuste de stories e epic TOK.*
