# Post-Execution Protocol (PEP)

> **REGRA OBRIGATÓRIA para todos os agents AIOS**
> Após executar qualquer task ou workflow, seguir este protocolo.

## Quando aplicar

Este protocolo é disparado **AUTOMATICAMENTE** após:
- Qualquer comando `*task` completar
- Qualquer workflow fase completar
- Qualquer skill/command de squad completar
- Qualquer task `.md` ser executada

## O que fazer (3 etapas obrigatórias)

### Etapa 1: Compliance Check

Após executar um comando, o agent DEVE:

1. Ler a task/workflow que acabou de executar
2. Extrair as fases/steps obrigatórios definidos
3. Comparar com o que foi realmente feito
4. Gerar relatório de aderência

**Formato obrigatório do relatório:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Compliance Report: {comando}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aderência: {X}% ({N}/{total} completos)

{Se houver gaps:}
❌ GAPS DETECTADOS:
  ✗ {fase} — NÃO EXECUTADO
    → Ref: {arquivo de referência}
    → Impacto: {consequência}

  ⚠ {fase} — PARCIAL ({detalhes})

{Se houver quality gates:}
✅ QUALITY GATES:
  QG-{N}: {PASS|FAIL} ({detalhes})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Etapa 2: Next Step

Sempre mostrar o próximo passo após o relatório:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ PRÓXIMO PASSO:
  Comando: {próximo comando}
  Contexto: {por que este é o próximo}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Lógica de roteamento:
1. Se o contrato/task tem `next_step` → usar
2. Se tem `handoff_to` → mostrar opções
3. Se faz parte de um workflow → mostrar posição + próxima fase
4. Se nada definido → sugerir `*validate-{squad}`

### Etapa 3: Posição no Workflow (se aplicável)

Se o comando executado faz parte de um workflow maior:

```
📍 Posição no workflow: {nome do workflow}
   Fase {N}/{total}: {nome da fase atual}
   → Próxima fase: {nome da próxima fase}
     Tasks: {lista de tasks da próxima fase}
```

## Campos que tasks/workflows DEVEM ter

Para o protocolo funcionar, toda task/workflow deve definir:

### Em tasks (.md)
```yaml
# Obrigatórios para PEP
steps:              # Lista de passos obrigatórios
  - name: "..."
    required: true
next_step:          # O que vem depois
  command: "..."
  context: "..."
quality_gate:       # Gate de qualidade
  name: "..."
  criteria: [...]
veto_conditions:    # Quando parar
  - "..."
```

### Em workflows (.yaml)
```yaml
# Obrigatórios para PEP
phases:
  - id: PHASE_0
    name: "..."
    tasks: [...]
    checkpoint:
      criteria: [...]
      veto_conditions: [...]
next_steps:
  - task: "..."
    input: "..."
```

## Exemplos

### Exemplo 1: Task simples com compliance OK

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Compliance Report: create-carousel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aderência: 100% (7/7 completos)

✅ QUALITY GATES:
  QG-1: PASS (hook score 8/10)
  QG-2: PASS (oráculo 9/10)
  QG-3: PASS (zero clichês)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ PRÓXIMO PASSO:
  Comando: *validate-content carrossel-A04
  Contexto: Workflow wf-content-production → Fase 4 (Validação)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Posição no workflow: wf-content-production
   Fase 3/5: Criação de Conteúdo
   → Próxima fase: Validação Oráculo
     Tasks: validate-content.md, oraculo-check.md
```

### Exemplo 2: Task com gaps

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Compliance Report: create-carousel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aderência: 71% (5/7 completos)

❌ GAPS DETECTADOS:
  ✗ Aplicar narrativa card-by-card — NÃO EXECUTADO
    → Ref: data/narrativas-card-by-card.md
    → Impacto: Slides podem ficar desconexos

  ⚠ Validar content-rules — PARCIAL (6/9 regras)
    → Ref: checklists/content-rules.md
    → Impacto: Faltam regra #3 (proporção), #7 (CTA duplo)

✅ QUALITY GATES:
  QG-1: PASS (hook 8/10)
  QG-2: PASS (oráculo 8/10)
  QG-3: PASS (zero clichês)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ PRÓXIMO PASSO:
  ⚠ Corrigir gaps antes de prosseguir
  Sugestão: Re-executar com foco em narrativa card-by-card
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Exemplo 3: Blind Spot Detection (acumulativo)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Blind Spot Detection — Squad Conteúdo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Execuções analisadas: 20

 CRITICAL  Aplicar narrativa card-by-card
  → PHASE CONSISTENTLY SKIPPED em 85% (17/20)
  → Recomendação: Tornar blocking gate

 HIGH  Validar content-rules checklist
  → PHASE CONSISTENTLY PARTIAL em 60% (12/20)
  → Recomendação: Simplificar ou dividir

Aderência média: 72%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Implementação técnica

Os módulos JavaScript estão em:
- `core/execution/execution-contract.js` — Extrai contrato de task/workflow
- `core/execution/compliance-auditor.js` — Audita execução + Blind Spot Detection
- `core/execution/next-step-router.js` — Roteia próximo passo

## Regras para agents

1. **NUNCA** terminar uma execução sem mostrar o Compliance Report
2. **NUNCA** omitir o Próximo Passo
3. **SEMPRE** comparar steps executados vs steps definidos na task
4. **SEMPRE** mostrar posição no workflow quando aplicável
5. Se aderência < 70% → ALERTAR o usuário antes de prosseguir
6. Se veto condition disparada → HALT imediato + explicar

## Como adicionar PEP a um squad existente

1. Garantir que tasks tenham `steps` com `required: true`
2. Garantir que tasks tenham `next_step` ou `handoff_to`
3. Garantir que workflows tenham `checkpoint` em cada fase
4. O agent chief do squad deve referenciar este protocolo na seção `protocols`

```yaml
# No config.yaml do squad
protocols:
  - name: post-execution
    path: .aiox-core/core/execution/POST-EXECUTION-PROTOCOL.md
    enforcement: mandatory
```
