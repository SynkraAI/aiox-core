# Ciclo de Vida do Produto — Análise e Estratégia

**Task ID:** `task-ciclo-produto`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-21
**Source Mind:** natanael-oliveira
**Source Heuristics:** NO-H001 ("Pesquisar antes de criar"), NO-H014 ("Copy por sentimento")
**Execution Type:** Sub-task (chamada internamente pelo pesquisador-ia)

---

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Analisar Ciclo de Vida de Produto/Tema |
| **status** | `pending` |
| **responsible_executor** | pesquisador-ia |
| **execution_type** | `Internal Sub-Task` |
| **input** | Tema ou produto a analisar |
| **output** | ciclo-{tema}.md com fase, estratégia e copy recomendada |
| **action_items** | 5 steps |
| **acceptance_criteria** | 7 criteria |

**Estimated Time:** 20-40min
**Trigger:** Interno — sub-task do pesquisador-ia. Não possui trigger de usuário direto.

---

## Overview

Sub-task interna para análise de ciclo de vida de produto ou tema.

Nem todo produto está no mesmo momento de mercado. Um tema que gerava
leads a R$0,80 há 6 meses pode estar custando R$2,50 hoje — não porque
a copy piorou, mas porque o mercado saturou.

O método Natanael usa análise de ciclo de vida para calibrar estratégia:
tema em Crescimento recebe empilhamento agressivo de produtos; tema em
Declínio recebe pivô antes que o CPL queime o budget.

**Case real:** "Prompts de copy" (tema em Maturidade, CPL R$2,50) foi
substituído por "Escreva seu livro em 48h" (tema em Crescimento, CPL R$0,80).
Mesma audiência, mesmo produto base — resultado 3x melhor pelo timing correto.

Esta task é executada pelo pesquisador-ia antes de qualquer decisão de
lançamento ou criação de produto novo.

---

## Input

- **tema** (text)
  - Description: Tema ou produto a analisar (pode ser assunto, ângulo ou produto específico)
  - Required: Yes
  - Example: "Prompts de copywriting para Instagram" / "Precificação para confeiteiras" / "App IA financeiro"

- **nicho** (text)
  - Description: Nicho de mercado para contextualizar a pesquisa
  - Required: Yes
  - Example: "Marketing digital / Confeitaria / Finanças pessoais"

- **contexto** (text)
  - Description: Contexto da análise (lançamento? migração? pivô?)
  - Required: No
  - Default: "Lançamento de produto"
  - Notes: Contexto define urgência e profundidade da análise

---

## Output

- **ciclo-{tema}.md** (markdown)
  - Description: Análise completa do ciclo de vida com estratégia recomendada
  - Destination: output/
  - Format: Markdown com fase, evidências, estratégia e copy recomendada

  Contém:
  - Fase atual: Introdução / Crescimento / Maturidade / Declínio / Evergreen
  - Evidências da fase (dados coletados)
  - CPL estimado para a fase (referência de mercado)
  - Estratégia recomendada por fase
  - Recomendação de copy alinhada com o momento
  - Alerta de pivô (se necessário)

---

## Elicitation

```yaml
elicitation:
  required: true
  mode: minimal
  notes: "Sub-task interna — inputs geralmente chegam via pesquisador-ia, não via usuário direto"
  questions:
    - id: tema
      question: "Qual tema ou produto analisar?"
      type: text
      required: true

    - id: nicho
      question: "Em qual nicho está inserido?"
      type: text
      required: true

    - id: contexto
      question: "Qual o contexto? (lançamento / migração / pivô / revisão)"
      type: text
      required: false
      default: "lançamento"
```

---

## Action Items

### Step 1: Receber Input do Tema

- [ ] Registrar: tema a analisar
- [ ] Registrar: nicho de mercado
- [ ] Registrar: contexto da análise
- [ ] Definir janela de pesquisa: últimos 12 meses para tendência, últimos 30 dias para urgência

**Regra:** Análise de ciclo é sempre relativa ao nicho. "Finanças pessoais" está em
Crescimento global mas "planilha de gastos" pode estar em Declínio dentro de finanças.

### Step 2: Pesquisar Tendências

Coletar sinais de mercado usando IA e fontes disponíveis:

**Fontes de pesquisa:**

- [ ] **Google Trends (comportamento):**
  - Tendência dos últimos 12 meses: subindo, estável, caindo?
  - Comparar tema atual com tema alternativo
  - Sazonalidade: tem pico em algum mês?

- [ ] **Redes Sociais (engajamento):**
  - Posts sobre o tema têm comentários ativos ou estão sendo ignorados?
  - Criadores do nicho estão abandonando o tema ou entrando nele?
  - Hashtags relevantes: crescendo ou saturando?

- [ ] **Grupos e Fóruns (conversas):**
  - O tema ainda gera perguntas espontâneas ou as pessoas já sabem?
  - Reclamações sobre o tema são sobre o problema (bom — mercado ativo) ou sobre soluções (ruim — mercado saturado)?

- [ ] **Concorrência (sinal de fase):**
  - Poucos players: Introdução ou nicho inexistente
  - Muitos players em crescimento: Crescimento
  - Players consolidados com preços altos: Maturidade
  - Players abandonando o tema: Declínio
  - Players presentes há anos sem mudança: Evergreen

- [ ] Consolidar sinais em tabela com peso por sinal

### Step 3: Classificar a Fase do Ciclo

Com os dados coletados, classificar em uma das 5 fases:

**Introdução:**
- Sinais: pouca concorrência, poucos criadores, conversas iniciais, CPL alto (público frio ao tema)
- Característica: mercado existe mas ainda não sabe que existe
- CPL estimado: R$1,50-3,00 (educação necessária)
- Oportunidade: quem entra AGORA ganha vantagem de pioneiro

**Crescimento:**
- Sinais: concorrência surgindo, engajamento alto, CPL caindo, público procurando ativamente
- Característica: o mercado "acordou" e quer a solução
- CPL estimado: R$0,50-1,20 (demanda ativa, fácil de converter)
- Oportunidade: janela ideal para escalar agressivamente

**Maturidade:**
- Sinais: muita concorrência, CPL subindo, público saturado, necessidade de diferenciação
- Característica: todos sabem do tema, vence quem tem melhor posicionamento
- CPL estimado: R$1,80-4,00 (concorrência eleva o custo)
- Estratégia: diferenciação de ângulo, high ticket, nicho dentro do nicho

**Declínio:**
- Sinais: engajamento caindo, criadores migrando, CPL alto sem conversão proporcional
- Característica: o mercado cansou do tema
- CPL estimado: R$3,00+ (custo sem retorno)
- Estratégia: PIVOTAR para tema adjacente antes de queimar budget

**Evergreen:**
- Sinais: presença constante ao longo dos anos, sem pico e sem queda, demanda previsível
- Característica: problema que sempre existiu e sempre existirá (ex: emagrecimento, dinheiro)
- CPL estimado: R$1,00-2,50 (estável, mas competitivo)
- Estratégia: mix completo com diferenciação de ângulo

- [ ] Fase classificada com evidências documentadas
- [ ] CPL estimado registrado

### Step 4: Definir Estratégia por Fase

Com a fase definida, aplicar estratégia correspondente:

**Introdução → Estratégia:**
- [ ] Produto de low ticket para teste rápido (R$9-27)
- [ ] Budget de ads conservador (R$50-100/dia)
- [ ] Copy educacional: explica o problema antes de oferecer solução
- [ ] Meta: validar conversão, não escalar ainda
- [ ] Sinal de progresso: CPL caindo mês a mês

**Crescimento → Estratégia:**
- [ ] Empilhamento agressivo de produtos (low + mid + high)
- [ ] Escalar budget de ads rapidamente (R$200-500/dia)
- [ ] Copy de oportunidade e FOMO: "o momento é agora"
- [ ] Meta: dominar o mercado antes que sature
- [ ] Sinal de alerta: CPL subindo — pode estar entrando em Maturidade

**Maturidade → Estratégia:**
- [ ] High ticket + diferenciação de nicho dentro do nicho
- [ ] Copy de status e resultado específico (não promessa genérica)
- [ ] Investir em prova social e cases de sucesso
- [ ] Considerar pivô de ângulo: mesmo produto, novo ângulo
- [ ] Sinal de alerta: CPL > 2x do Crescimento — pode estar entrando em Declínio

**Declínio → Estratégia:**
- [ ] PIVOTAR para tema adjacente urgentemente
- [ ] Aproveitar base existente com upsell de produto novo
- [ ] Não investir em ads no tema em declínio
- [ ] Documentar o que funcionou para replicar no próximo tema
- [ ] Tema pode virar bônus ou complemento de produto novo

**Evergreen → Estratégia:**
- [ ] Mix completo de produtos (toda a escada)
- [ ] Diferenciação por nicho, ângulo ou método exclusivo
- [ ] Atualização constante (o mercado muda, o problema é o mesmo)
- [ ] Autoridade é o diferencial: quem é você no tema?

- [ ] Estratégia documentada com táticas específicas

### Step 5: Montar Output ciclo-{tema}.md

- [ ] Resumo executivo (fase + CPL + recomendação em 3 linhas)
- [ ] Evidências coletadas por fonte (Google Trends, redes, concorrência)
- [ ] Fase classificada com justificativa
- [ ] CPL estimado e comparativo (se dados disponíveis)
- [ ] Estratégia completa para a fase atual
- [ ] Recomendação de copy alinhada com o momento
- [ ] Alerta de pivô se necessário (com tema adjacente sugerido)

---

## Acceptance Criteria

A task está completa quando TODOS os critérios são atendidos:

- [ ] **AC-1:** Pesquisa realizada em mínimo 3 fontes (Google Trends, redes, concorrência)
- [ ] **AC-2:** Fase do ciclo classificada com evidências documentadas
- [ ] **AC-3:** CPL estimado para a fase registrado
- [ ] **AC-4:** Estratégia completa definida para a fase atual
- [ ] **AC-5:** Recomendação de copy alinhada com o momento do ciclo
- [ ] **AC-6:** Alerta de pivô incluído (se Declínio ou Maturidade avançada)
- [ ] **AC-7:** ciclo-{tema}.md entregue com resumo executivo

---

## Veto Conditions

| Veto | Heurística | Descrição |
|------|-----------|-----------|
| V1 | NO-H001 | SE análise sem pesquisa real → BLOCK. Feeling não é dado. |
| V2 | — | SE fase classificada sem evidências → BLOCK. Citar fontes é obrigatório. |
| V3 | — | SE tema em Declínio sem alerta de pivô → BLOCK. Pivotar antes de queimar budget. |
| V4 | — | SE estratégia não corresponde à fase → BLOCK. Estratégia de Crescimento em Declínio = prejuízo. |
| V5 | — | SE sem CPL estimado → ALERTA. Decisão de escalar sem referência de custo é perigosa. |

---

## Quality Gate

```yaml
quality_gate:
  id: "QG-VTD-CICLO"
  name: "Ciclo de Produto Quality Gate"
  placement: "exit"
  type: "hybrid"
  severity: "blocking"

  criteria:
    - check: "Pesquisa em 3+ fontes"
      type: "count"
      value: 3
      operator: ">="
      weight: 3
    - check: "Fase classificada com evidências"
      type: "boolean"
      weight: 3
    - check: "Estratégia alinhada com a fase"
      type: "boolean"
      weight: 3
    - check: "CPL estimado registrado"
      type: "boolean"
      weight: 1

  thresholds:
    pass: 8
    review: 5
    fail: 3

  pass_action:
    - "Entregar ciclo-{tema}.md"
    - "Alertar pesquisador-ia sobre fase e estratégia"
  fail_action:
    - "Complementar fontes de pesquisa"
    - "Justificar classificação de fase"
```

---

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | Retorna resultado para pesquisador-ia (task pai) |
| **Trigger** | ciclo-{tema}.md aprovado |
| **Executor** | pesquisador-ia → monetizador (estratégia de produto) |

### Handoff Checklist

- [ ] ciclo-{tema}.md entregue
- [ ] Fase identificada e comunicada ao pesquisador-ia
- [ ] Estratégia priorizada (1 ação principal para executar agora)
- [ ] Alerta de pivô comunicado se necessário

### Handoff Package

- **ciclo-{tema}.md**: Análise completa
- **resumo-executivo.md**: 3 linhas para decisão rápida (fase + CPL + ação)

---

## Output Example

```markdown
## Ciclo de Vida — "Prompts de Copy para Instagram"

**Nicho:** Marketing Digital
**Data da Análise:** 2026-02-21

### Resumo Executivo
**Fase:** Maturidade
**CPL Estimado:** R$2,50 (vs R$0,80 há 6 meses)
**Recomendação:** PIVOTAR ângulo. Manter audiência, mudar tema.

### Evidências

| Fonte | Sinal | Peso |
|-------|-------|------|
| Google Trends | Estável com leve queda nos últimos 6 meses | Maturidade |
| Instagram | 47 contas ensinando "prompts de copy" em jan/26 | Maturidade |
| Grupos Facebook | Perguntas sobre prompts diminuíram 60% vs ago/25 | Maturidade→Declínio |
| Concorrência | 3 players com produto completo a R$297+ | Maturidade consolidada |

### Estratégia Recomendada
- NÃO escalar ads no tema atual (CPL inviável)
- PIVOTAR para "Escreva seu livro em 48h" (Crescimento, CPL R$0,80)
- APROVEITAR base com upsell do novo produto
- MANTER produto de prompts como bônus (não como produto principal)

### Tema Adjacente Sugerido
"Escreva seu livro em 48h com IA" — mesmo público (criadores de conteúdo),
problema diferente (autoridade via livro), tema em Crescimento.
```

---

## Error Handling

### Cenário: Dados insuficientes para classificar fase
- **Trigger:** Nicho muito específico sem dados públicos disponíveis
- **Detection:** Step 2 — menos de 3 fontes com dados conclusivos
- **Recovery:** Classificar como "Introdução com incerteza" + recomendar teste com budget mínimo antes de escalar.
- **Prevention:** Niche tão específico que não tem dados = mercado novo. Tratar como Introdução.

### Cenário: Tema classificado erroneamente pelo contexto
- **Trigger:** Usuário acredita que está em Crescimento mas dados mostram Maturidade
- **Detection:** Step 3 — divergência entre expectativa e dados
- **Recovery:** Apresentar dados com transparência. Não validar ilusão de mercado.
- **Prevention:** Análise baseada em dados, nunca em intuição do usuário.

### Cenário: Múltiplos temas para analisar simultaneamente
- **Trigger:** Pesquisador-ia solicita análise de 3+ temas de uma vez
- **Detection:** Input com múltiplos temas
- **Recovery:** Analisar 1 por vez, em paralelo se possível. Entregar ciclo-{tema}.md separado para cada.
- **Prevention:** Task é atômica — 1 tema por execução.

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-21_
_Compliant: Yes_
