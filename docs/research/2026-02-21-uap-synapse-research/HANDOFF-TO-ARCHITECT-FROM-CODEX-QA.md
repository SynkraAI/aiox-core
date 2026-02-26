# Handoff de QA para @architect (Claude Code)

**De:** Codex (revisão crítica / advogado do diabo)
**Para:** @architect (Aria) no Claude Code
**Data:** 2026-02-21
**Escopo:** Revisão criteriosa do plano incremental NOG-9 (UAP + SYNAPSE)
**Fonte revisada:** `HANDOFF-CODEX-REVIEW.md` + artefatos de suporte (`optimization-roadmap.md`, `output-taxonomy.md`, `code-intel-helpers.md`, `comparative-matrix.md`) + validação de código real no repositório.

---

## Resumo Executivo

O plano está bem direcionado e captura gaps reais, mas há pontos com **escopo subestimado** e **riscos de regressão** que precisam ser corrigidos antes de virar backlog executável.

Conclusão principal:
- Aprovar execução imediata de parte da Phase 0.
- Reclassificar QW-2 (token real) para story técnica dedicada.
- Expandir QW-7 (atomic writes) para todos os pontos de persistência relevantes.
- Tratar MED-6 (`core.fsmonitor`) como opt-in experimental.
- Adiar STR-5 até existir política de segurança/memória.

---

## Findings Priorizados

### 1) CRÍTICO — QW-2 não está implementável como quick win no desenho atual

**Problema:** O plano propõe preencher `last_tokens_used` via `usage.input_tokens`, mas o runtime do hook atual não recebe payload da resposta da API Claude. Ele processa apenas `prompt` + `session` e retorna XML.

**Impacto:** risco de criar story impossível ou de acoplamento indevido para “forçar” uma fonte de token não disponível neste fluxo.

**Evidências:**
- `docs/research/2026-02-21-uap-synapse-research/HANDOFF-CODEX-REVIEW.md:72`
- `docs/research/2026-02-21-uap-synapse-research/optimization-roadmap.md:34`
- `.claude/hooks/synapse-engine.cjs:50`
- `.aios-core/core/synapse/runtime/hook-runtime.js:15`
- `.aios-core/core/synapse/engine.js:226`

---

### 2) ALTO — QW-7 (atomic write) com escopo incompleto

**Problema:** O plano cita atomic write em `session-manager.js`/`context-loader.js`, mas existem outros writes de estado relevantes fora desse perímetro.

**Impacto:** mesmo implementando QW-7 “como descrito”, continua existindo janela de corrupção/inconsistência.

**Evidências (writes diretos):**
- `.aios-core/core/session/context-detector.js:194`
- `.aios-core/development/scripts/unified-activation-pipeline.js:713`
- `.aios-core/development/scripts/unified-activation-pipeline.js:759`

---

### 3) ALTO — QW-5 (.git/HEAD direto) tem risco funcional sem fallback robusto

**Problema:** leitura direta de `.git/HEAD` melhora latência, mas quebra sem tratamento adequado em detached HEAD, worktrees e cenários de gitfile.

**Impacto:** branch detection incorreto/intermitente, regressão funcional silenciosa em alguns ambientes.

**Evidências:**
- `docs/research/2026-02-21-uap-synapse-research/HANDOFF-CODEX-REVIEW.md:74`
- `docs/research/2026-02-21-uap-synapse-research/optimization-roadmap.md:62`
- `.aios-core/infrastructure/scripts/git-config-detector.js:136`

---

### 4) ALTO — MED-6 (`core.fsmonitor`) é arriscado como default

**Problema:** ativar `core.fsmonitor` indiscriminadamente depende de suporte/ambiente e pode gerar inconsistências.

**Impacto:** risco operacional e de troubleshooting em dev machines heterogêneas.

**Evidências:**
- `docs/research/2026-02-21-uap-synapse-research/HANDOFF-CODEX-REVIEW.md:87`
- `docs/research/2026-02-21-uap-synapse-research/optimization-roadmap.md:133`

---

### 5) ALTO — STR-5 (memory self-editing) sem guardrails de segurança

**Problema:** proposta ainda não define validação, auditoria, allowlist/denylist e rollback de memórias.

**Impacto:** risco de persistence poisoning por prompt injection e degradação cumulativa do contexto.

**Evidências:**
- `docs/research/2026-02-21-uap-synapse-research/HANDOFF-CODEX-REVIEW.md:110`
- `docs/research/2026-02-21-uap-synapse-research/optimization-roadmap.md:185`

---

### 6) MÉDIO — ganho de output na Phase 0 pode estar superestimado para o caminho principal

**Problema:** o texto sugere impacto amplo de reduzir blob de contexto, porém `generate-greeting` já retorna só `greeting` na interface CLI comum.

**Impacto:** risco de priorizar prematuramente otimização com menor efeito no fluxo dominante.

**Evidências:**
- `docs/research/2026-02-21-uap-synapse-research/HANDOFF-CODEX-REVIEW.md:138`
- `.aios-core/development/scripts/generate-greeting.js:60`
- `.aios-core/development/scripts/unified-activation-pipeline.js:342`

---
### 7) MÉDIO — narrativa “sem cleanup” está parcialmente inconsistente com código existente

**Problema:** já existe `cleanStaleSessions` (24h), mas sem integração efetiva no fluxo. O roadmap descreve como ausência total.

**Impacto:** risco de duplicar solução em vez de conectar e parametrizar a existente.

**Evidências:**
- `docs/research/2026-02-21-uap-synapse-research/HANDOFF-CODEX-REVIEW.md:85`
- `.aios-core/core/synapse/session/session-manager.js:22`
- `.aios-core/core/synapse/session/session-manager.js:305`

---

### 8) MÉDIO — novos helpers podem piorar p50 se entrarem sem budget e fallback rígidos

**Problema:** `activation-helper`/`synapse-helper` adicionam inteligência adicional sem contrato explícito de custo por chamada no caminho quente.

**Impacto:** regressão de latência no UAP, justamente no plano que busca ganho de performance.

**Evidências:**
- `docs/research/2026-02-21-uap-synapse-research/HANDOFF-CODEX-REVIEW.md:121`
- `docs/research/2026-02-21-uap-synapse-research/code-intel-helpers.md:63`
- `.aios-core/development/scripts/unified-activation-pipeline.js:76`

---

### 9) MÉDIO — faltam critérios de aceite executáveis por item

**Problema:** roadmap forte em diagnóstico, fraco em Definition of Done por melhoria (bench, teste, rollback, observabilidade).

**Impacto:** aumenta subjetividade de “concluído” e risco de regressão incremental.

**Evidência:**
- `docs/research/2026-02-21-uap-synapse-research/HANDOFF-CODEX-REVIEW.md:173`

---

## Recomendações (Objetivas)

1. **Aprovar Phase 0 com ajuste de escopo:** executar QW-1, QW-3, QW-4 e QW-5 com fallback robusto.
2. **Reclassificar QW-2 para story técnica dedicada** (descoberta + integração de fonte real de token usage).
3. **Transformar QW-7 em hardening transversal de escrita de estado** (não apenas `session-manager`).
4. **Tornar MED-6 opt-in experimental**, com detecção de suporte + rollback automático + documentação de fallback.
5. **Postergar STR-5** até existir modelo de segurança de memória (validação, auditoria, aprovação e rollback).
6. **Exigir AC mensurável por melhoria**, mínimo:
   - benchmark antes/depois
   - testes automatizados de regressão
   - estratégia de rollback
   - sinal de observabilidade

---

## Perguntas para Decisão (Arquitetura)

1. Qual é a **fonte real e confiável** de `usage.input_tokens` no runtime atual (hook/provider/log)?
2. Branch detection deve suportar formalmente **detached HEAD/worktree/gitfile**? (se sim, QW-5 precisa fallback explícito)
3. `core.fsmonitor` será política de **projeto**, de **máquina local** ou apenas **opt-in de dev avançado**?
4. Para STR-5, qual política mínima de segurança será mandatória: allowlist, revisão humana, assinatura, versionamento, rollback?
5. Quais KPIs serão gate de aprovação por fase (p50/p95, timeout rate, accuracy real observada em produção)?

---

## Proposta de Replanejamento (Pragmático)

### Fase 0 (imediata)
- QW-1
- QW-3
- QW-4
- QW-5 (com fallback multi-cenário)

### Fase 1 (próximo sprint)
- Hardening de persistência (QW-7 expandido)
- Integração de cleanup existente (`cleanStaleSessions`) + policy TTL
- MED-1 (output presets), priorizando consumidores de maior impacto real

### Fase 2
- MED-5 (story status como sinal primário)
- MED-4 (rich session state)
- MED-3 (permission defaults)

### Estratégico
- STR-2 apenas após esclarecer fonte de token usage
- STR-3 após estabilização de persistência
- STR-5 depois de security design
- STR-6 em modo monitorado (wait-and-see orientado por adoção)

---

## Solicitação ao @architect

Se concordar com este ajuste, sugiro gerar:
1. Story “Phase 0A (safe quick wins)”
2. Story “Token usage source discovery + integration design” (substitui QW-2 como quick win)
3. Story “State persistence hardening (atomic + consistency)”
4. Story “fsmonitor experimental rollout”
5. ADR de segurança para memory self-editing (pré-requisito STR-5)

---

*Handoff emitido por Codex com foco em QA crítico, redução de risco de regressão e executabilidade incremental.*
