# Handoff Codex QA — Revisão Crítica NOG-11

**De:** Codex (QA crítico)
**Para:** @architect (Aria)
**Data:** 2026-02-21
**Escopo:** Crítica do handoff `HANDOFF-NOG-11-TOKEN-SOURCE.md` contra pesquisa NOG-11, ADR e story.

---

## Veredito

**GO condicionado**, não GO direto.

A direção técnica (Stop hook + JSONL) é promissora e consistente com a reclassificação de QW-2. Porém, há lacunas de implementação e governança que podem gerar regressão silenciosa se não forem fechadas antes da story de implementação.

---

## Findings Priorizados

### 1) ALTO — Risco de dupla contagem de `prompt_count`

O handoff propõe usar `updateSession()` no Stop hook para persistir métricas de token. Hoje `updateSession()` incrementa `prompt_count` em toda chamada.

- Handoff: `docs/research/2026-02-21-uap-synapse-research/HANDOFF-NOG-11-TOKEN-SOURCE.md:83`
- Handoff: `docs/research/2026-02-21-uap-synapse-research/HANDOFF-NOG-11-TOKEN-SOURCE.md:102`
- Código: `.aios-core/core/synapse/session/session-manager.js:224`

**Risco:** se UserPromptSubmit também atualizar sessão (QW-1), haverá 2 increments por turno.

---

### 2) ALTO — Path de configuração de hook inconsistente

O handoff manda alterar `.claude/settings.json`, mas esse arquivo não existe neste repo. Os arquivos reais são `.claude/settings.local.json` e `.claude/setup/settings.json`.

- Handoff: `docs/research/2026-02-21-uap-synapse-research/HANDOFF-NOG-11-TOKEN-SOURCE.md:94`
- Arquivo real: `.claude/settings.local.json:1`

**Risco:** story entra em implementação sem alvo claro de configuração.

---

### 3) ALTO — Conclusão de confiabilidade/accuracy acima da evidência disponível

O handoff afirma `>99.9%` confiabilidade e ~99% accuracy, mas a evidência apresentada mostra apenas 2 sessões reais.

- Handoff: `docs/research/2026-02-21-uap-synapse-research/HANDOFF-NOG-11-TOKEN-SOURCE.md:200`
- ADR: `docs/architecture/adrs/ADR-NOG-11-token-source.md:98`
- Evidência base: `docs/research/2026-02-21-uap-synapse-research/HANDOFF-NOG-11-TOKEN-SOURCE.md:32`

**Risco:** overconfidence em produção com perfis de sessão/modelo diferentes.

---

### 4) MÉDIO — Buffer fixo de 50KB sem fallback adaptativo formal

A decisão de tail read com 50KB é válida como baseline, mas falta definir fallback progressivo quando a última mensagem útil não estiver no bloco.

- Handoff: `docs/research/2026-02-21-uap-synapse-research/HANDOFF-NOG-11-TOKEN-SOURCE.md:144`

---

### 5) MÉDIO — Pseudocódigo diverge da assinatura real de `context-tracker`

A proposta usa `estimateContextPercent(session, maxContext)`, mas o contrato atual é `estimateContextPercent(promptCount, options)`.

- Handoff: `docs/research/2026-02-21-uap-synapse-research/HANDOFF-NOG-11-TOKEN-SOURCE.md:228`
- Código real: `.aios-core/core/synapse/context/context-tracker.js:110`

**Risco:** implementação inconsistente e quebra de call sites.

---

### 6) MÉDIO — Evidência de benchmark não reproduzível no workspace atual

A story cita `.tmp-coverage/bench-jsonl.js`, mas o arquivo não está presente.

- Story: `docs/stories/epics/epic-nogic-code-intelligence/story-NOG-11-token-usage-source-discovery.md:120`

**Risco:** não auditabilidade da medição.

---

### 7) MÉDIO — Status/story progression sem fechamento explícito de ACs

A story está em `Ready for Review` e com tasks concluídas, mas AC1/AC2 continuam unchecked.

- Status: `docs/stories/epics/epic-nogic-code-intelligence/story-NOG-11-token-usage-source-discovery.md:10`
- ACs: `docs/stories/epics/epic-nogic-code-intelligence/story-NOG-11-token-usage-source-discovery.md:43`

**Risco:** perda de rastreabilidade de aceite.

---

## Condições para GO (pré-implementação)

1. Definir estratégia para evitar double increment de prompt (`updateSession` com flag `incrementPrompt: false` ou caminho separado para métricas).
2. Fixar arquivo/caminho oficial para registrar o Stop hook neste repo e no fluxo de sync.
3. Formalizar tail read adaptativo (50KB -> 100KB -> 200KB -> fallback).
4. Validar empiricamente `effective_context` com critério de aceite explícito.
5. Corrigir story governance: ACs marcados, benchmark script/versionado e evidência rastreável.

---

## Recomendação

Prosseguir com a implementação apenas após fechar as 5 condições acima em um mini-design de implementação (1 página) anexado à próxima story (ex.: NOG-15). Isso mantém o ganho técnico do NOG-11 e reduz risco de regressão/ruído operacional.

---

*Handoff emitido por Codex QA com foco em consistência entre pesquisa, decisão arquitetural e executabilidade segura.*
