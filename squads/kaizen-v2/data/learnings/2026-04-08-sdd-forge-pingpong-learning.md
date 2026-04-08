# Session Learning — sdd-forge-pingpong

**Data**: 2026-04-08 18:35
**Sessão**: Análise do framework SDD (Deborah Folloni), implementação de 3 melhorias no Forge, ping-pong review com Codex (4 rounds, 10/10), diagnóstico do bug da critica, stress test do ping-pong (16 cenários)
**Artefatos analisados**: 12
**Findings**: 6 total (2 alta, 3 média, 1 baixa prioridade)

---

## Findings

### [PATTERN] Regra longe do ponto de decisão = regra ignorada

**Causa**: O Codex pulou a critica obrigatória no ping-pong porque a regra estava 300 linhas abaixo do template REVIEW que ele seguiu. Ele leu o template (linha 203) que dizia COMPLETE, mas a seção Critica (linha 495) dizia o contrário.
**Ação**: O bug só foi detectado quando o usuário perguntou "por que o /critica não rodou?". Sem essa pergunta, a violação passaria despercebida.
**Resultado esperado**: Regras críticas devem estar duplicadas no ponto exato onde o agente toma a decisão, não apenas numa seção distante do documento.
**Artefato alvo**: `skills/code-review-ping-pong/SKILL.md`
**Status atual (auditado)**: Totalmente endereçado — fix aplicou a regra em 5 locais distintos (Step 9, Step 10 template, regra isolada, Critica Phase header, flow diagram).
**Melhoria proposta**:

Aplicar este padrão a TODAS as skills orquestradoras do ecossistema: quando uma regra NON-NEGOTIABLE existe numa seção distante, duplicar como guard no ponto de decisão mais próximo. Candidatos a auditar:
- `skills/forge/SKILL.md` — Constitution está na seção 8, mas Phase transitions estão na seção 3-4
- `skills/quest/SKILL.md` — Auto-reconciliation rules (seção de resumption) vs forge-bridge (engine/)
- `skills/content-forge/SKILL.md` — Quality gates vs execution steps

**Prioridade**: alta

---

### [PATTERN] Análise estática de code path como substituto de testes em skills markdown

**Causa**: O stress test do ping-pong usou "trace through the SKILL.md" em vez de executar cenários reais. Isso encontrou 1 CRITICAL (multi-stage archive contradiz critica) que execução real não teria pego facilmente (exigiria um ciclo multi-stage completo até PERFECT).
**Ação**: A análise estática traçou 16 cenários em ~3 minutos de processamento, enquanto execução real levaria horas.
**Resultado esperado**: Análise estática de code path deve ser o método padrão de teste para skills markdown orquestradoras.
**Artefato alvo**: `skills/forge/workflows/stress-test.md`
**Status atual (auditado)**: Parcialmente endereçado — o workflow já usa análise estática nos Tiers 3-5, mas não documenta formalmente o método como "Static Code Path Analysis".
**Melhoria proposta**:

Adicionar seção no stress-test.md:
```markdown
### Método: Static Code Path Analysis (SCPA)

Para skills que são instruções markdown (não código executável), o stress test
usa análise estática de code path:

1. Ler SKILL.md como se fosse um programa
2. Para cada cenário, traçar passo a passo qual instrução seria seguida
3. Identificar onde o fluxo falha, contradiz outra seção, ou é ambíguo
4. Reportar com número de linha e citação direta

Vantagens sobre execução real:
- 10x mais rápido (minutos vs horas)
- Encontra contradições que execução real pode mascarar
- Cobre cenários impossíveis de reproduzir (ex: multi-stage + critica + NEEDS_WORK)
```

**Prioridade**: média

---

### [DECISION] SDD (Spec-Driven Development) como framework de qualidade para o AIOS

**Causa**: A Deborah Folloni apresentou SDD com 3 princípios: (1) separar pesquisa/spec/execução, (2) comprimir contexto entre fases, (3) buscar docs externas sempre. Ao comparar com o Forge, encontramos 3 gaps concretos que viraram melhorias implementadas.
**Ação**: As 3 melhorias (context-hygiene, docs-validation, stamp) foram implementadas, testadas e aprovadas no ping-pong (10/10).
**Resultado esperado**: O SDD não é só para o Forge — os princípios se aplicam a qualquer skill orquestradora do ecossistema.
**Artefato alvo**: `memory/` (nova memória de projeto)
**Status atual (auditado)**: Não endereçado — os princípios SDD não estão documentados como referência reutilizável.
**Melhoria proposta**:

Criar memória de referência:
```markdown
---
name: reference_sdd-framework
description: "SDD (Spec-Driven Development) da Deborah Folloni — framework de qualidade aplicável a skills orquestradoras"
type: reference
---

# SDD Framework — Referência

Source: https://www.youtube.com/watch?v=BcLtqQ3JlMU (Deborah Folloni)

## 3 Princípios Aplicáveis ao AIOS

1. **Separar Pesquisa → Spec → Execução** com /clear entre cada
   - Forge: Phase 0 (Discovery) → Phase 1 (Spec) → Phase 3 (Build)
   - Implementado: context-hygiene plugin gera resumos e sugere /clear

2. **Comprimir contexto a cada transição** — só transferir o essencial
   - Implementado: phase-{N}-summary.md com formato padronizado

3. **Sempre buscar docs externas** — nunca confiar só no knowledge cutoff
   - Implementado: @analyst Mode A (Doc Validation) obrigatório em Phase 1

## Aplicação além do Forge

Qualquer skill orquestradora com fases sequenciais pode usar:
- Plugin context-hygiene como template
- Stamp command para referências de projeto
- Docs validation para stacks técnicas
```

**Prioridade**: alta

---

### [FRICTION] Skills AIOS com "source" field inconsistente nos plugins

**Causa**: O ping-pong review encontrou que o stamp-inject.yaml não tinha `source` field em 2 dos 3 hooks. O SCHEMA.md mostra `source` como campo do schema mas não marca explicitamente como obrigatório ou opcional.
**Ação**: Fix aplicado (adicionou source a todos os hooks). Mas o validate-plugins.cjs não validou a ausência — passou 18/18 sem erro.
**Artefato alvo**: `skills/forge/plugins/SCHEMA.md`
**Status atual (auditado)**: Parcialmente endereçado — o fix individual foi feito, mas o schema e o validator não foram atualizados.
**Melhoria proposta**:

No SCHEMA.md, tornar `source` explicitamente obrigatório:
```yaml
hooks:
  - event: "after:phase:0"
    action: inject
    source: "{FORGE_HOME}/file.md"  # OBRIGATÓRIO — arquivo com instruções detalhadas
    section: "Section Name"         # Opcional: heading específico do source
```

E no validate-plugins.cjs, adicionar check:
```javascript
// Para cada hook, verificar se source existe
if (!hook.source) {
  warnings.push(`${name}: hook "${hook.event}" sem source field`);
}
```

**Prioridade**: média

---

### [FRICTION] Validate.cjs do ping-pong não valida next-step.md

**Causa**: O stress test S-007 descobriu que `next-step.md` é write-only — nenhum modo lê ou valida o arquivo. Um `cycle_state: BANANA` passaria despercebido.
**Ação**: O arquivo funciona como sinal humano, não como input de máquina. Mas valores inválidos confundem o operador.
**Artefato alvo**: `skills/code-review-ping-pong/scripts/validate.cjs`
**Status atual (auditado)**: Não endereçado — validação de next-step.md não foi implementada.
**Melhoria proposta**:

Adicionar modo `next-step` ao validate.cjs:
```javascript
// node validate.cjs next-step.md
if (type === 'next-step') {
  const validStates = ['WAITING_FOR_FIX', 'WAITING_FOR_REVIEW', 'WAITING_FOR_AUDIT', 'WAITING_FOR_CRITICA', 'COMPLETE'];
  const validAgents = ['CLAUDE CODE', 'CODEX', 'GEMINI', 'NONE'];
  if (!validStates.includes(yaml.cycle_state)) errors.push(`Invalid cycle_state: ${yaml.cycle_state}`);
  if (!validAgents.includes(yaml.next_agent)) errors.push(`Invalid next_agent: ${yaml.next_agent}`);
}
```

**Prioridade**: média

---

### [GAP] Stamp do create-t3-app gerado mas sem índice de stamps

**Causa**: O `/forge stamp` salvou o report em `.aios/stamps/create-t3-app.md`, mas não existe um índice de stamps disponíveis. O stamp-inject plugin faz glob por `*.md` — funciona, mas o usuário não tem visibilidade de quais stamps existem.
**Ação**: O plugin pega o mais recente automaticamente, mas sem listagem não há como o usuário escolher.
**Artefato alvo**: `skills/forge/workflows/stamp.md`
**Status atual (auditado)**: Não endereçado.
**Melhoria proposta**:

Adicionar comando `/forge stamp list` no SKILL.md + stamp.md que mostra:
```
Stamps disponíveis:
  1. create-t3-app (2026-04-08) — Next.js + pnpm + Turborepo
  2. shadcn-ui (2026-04-05) — React + Tailwind + Radix
```

**Prioridade**: baixa

---

## Como aplicar

1. Revise os findings acima
2. **Remova do checklist abaixo** os findings que NÃO quer aplicar
3. Responda `aplicar` no terminal quando estiver pronto

## Status de Aplicação

- [ ] [PATTERN] Regra longe do ponto de decisão = regra ignorada — auditar outras skills
- [ ] [PATTERN] Static Code Path Analysis — documentar no stress-test.md
- [ ] [DECISION] SDD como referência — criar memória `reference_sdd-framework.md`
- [ ] [FRICTION] Source field obrigatório nos plugins — atualizar SCHEMA.md + validator
- [ ] [FRICTION] Validar next-step.md — adicionar modo no validate.cjs
- [ ] [GAP] Stamp list command — adicionar no SKILL.md + stamp.md
