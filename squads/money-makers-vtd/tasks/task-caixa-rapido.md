# Caixa Rápido 24h

**Task ID:** `task-caixa-rapido`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-21
**Source Mind:** natanael-oliveira
**Source Heuristic:** NO-H020 ("SE precisa de caixa rápido → ENTÃO oferta irresistível + R$50-100 em ads")

---

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Gerar Caixa Rápido em 24h |
| **status** | `pending` |
| **responsible_executor** | monetizador |
| **execution_type** | `Agent` |
| **input** | Nicho, produtos existentes, meta de caixa, budget disponível |
| **output** | Plano de caixa rápido 24h com oferta, copy, ads e sequência |
| **action_items** | 7 steps |
| **acceptance_criteria** | 8 criteria |

**Estimated Time:** 30-60min
**Trigger:** `*caixa-rapido {meta}`

---

## Overview

Task de emergência para gerar caixa em 24 horas.

Cenário: o negócio precisa de receita HOJE. Não é hora de funil elaborado ou
campanha semanal — é hora de oferta direta, budget mínimo e execução imediata.

"Só vende quem oferece." — Com R$50-100 em ads e uma oferta irresistível,
é possível gerar caixa no mesmo dia.

Este é o "botão de emergência" do método Vendas Todos os Dias.

---

## Input

- **nicho** (text)
  - Description: Nicho ou tema do negócio
  - Required: Yes

- **produtos_existentes** (list)
  - Description: Produtos já prontos para vender (nome + preço)
  - Required: Yes
  - Notes: Priorizar produtos que JÁ existem. Não criar produto novo para caixa rápido.

- **meta_caixa** (number)
  - Description: Quanto precisa faturar nas próximas 24h (ex: R$1.000, R$5.000)
  - Required: Yes

- **budget_ads** (number)
  - Description: Budget disponível para tráfego pago (mínimo R$50)
  - Required: Yes
  - Default: R$100

- **base_email** (number)
  - Description: Tamanho da base de email/WhatsApp (se tiver)
  - Required: No
  - Notes: Base existente = ouro. Email primeiro, ads depois.

---

## Output

- **plano-caixa-rapido.md** (markdown)
  - Description: Plano completo de execução para caixa em 24h
  - Destination: output/
  - Format: Markdown com checklist executável

  Contém:
  - Oferta irresistível definida
  - Copy da oferta (3 variações por sentimento)
  - Configuração de ads (budget, público, objetivo)
  - Sequência de emails/WhatsApp (se tiver base)
  - Timeline hora-a-hora das 24h
  - Meta decomposta (quantas vendas de qual produto)

---

## Elicitation

```yaml
elicitation:
  required: true
  mode: basic
  questions:
    - id: meta
      question: "Quanto precisa faturar nas próximas 24h?"
      type: text
      required: true
      example: "R$1.000"

    - id: produtos
      question: "Quais produtos você tem PRONTOS para vender agora? (nome + preço)"
      type: text
      required: true
      example: "Ebook Receitas R$14,90, Curso Precificação R$297, Mentoria R$2.500"

    - id: base
      question: "Tem base de email ou WhatsApp? Quantos contatos?"
      type: text
      required: false
      example: "3.000 emails, 500 WhatsApp"

    - id: budget
      question: "Quanto pode investir em ads AGORA? (mín R$50)"
      type: number
      required: true
      default: 100

    - id: urgencia
      question: "Qual o motivo da urgência? (ajuda a calibrar a oferta)"
      type: text
      required: false
```

---

## Action Items

### Step 1: Diagnóstico Relâmpago

Analisar em 2 minutos:
- [ ] Qual produto existente tem MELHOR margem?
- [ ] Qual produto existente tem MENOR fricção de compra?
- [ ] Tem base de email/WhatsApp? (base > ads para caixa rápido)
- [ ] Budget disponível para ads?

**Regra:** NUNCA criar produto novo para caixa rápido. Usar o que já existe.

### Step 2: Montar Oferta Irresistível

Aplicar framework do Natanael:
- [ ] Pegar produto de maior valor (ex: curso R$297)
- [ ] Criar oferta com desconto agressivo + bônus (ex: R$297 por R$97 + bônus X)
- [ ] OU empacotar 2-3 produtos low ticket num bundle (ex: 3 ebooks por R$27)
- [ ] Definir escassez REAL (24h, vagas limitadas, bônus expira)

**Heurística NO-H020:** Oferta irresistível + R$50-100 em ads = caixa rápido.

**Regra Funil Americano:** Oferta direta. Sem nutrição, sem aquecimento.
Lead vê → oferta aparece → compra ou sai.

**Ancoragem (NO-F012):** Mesmo em caixa rápido, mostrar o high ticket ANTES.
"A mentoria individual custa R$2.500. Mas hoje você pode ter o curso completo
por R$97."

### Step 3: Criar Copy Urgente (3 variações)

Aplicar Andromeda (copy por sentimento, NO-H014):

**Variação 1 — DOR:**
- Hook: "{problema que está doendo AGORA}"
- Punch: "{consequência de não resolver}"
- Premissa: "{produto resolve em X tempo}"
- CTA: "Aproveita que é só até meia-noite"

**Variação 2 — OPORTUNIDADE:**
- Hook: "{resultado que parece impossível}"
- Punch: "{prova de que funciona — case real}"
- Premissa: "{oferta torna acessível}"
- CTA: "Últimas X vagas"

**Variação 3 — ALÍVIO:**
- Hook: "{situação estressante que o público vive}"
- Punch: "{existe solução simples}"
- Premissa: "{produto elimina o estresse}"
- CTA: "Começa agora, resultado em X horas"

**NUNCA:** Copy genérica. Cada variação ataca um SENTIMENTO diferente.

### Step 4: Configurar Ads Relâmpago

- [ ] Objetivo: Conversão (não alcance, não engajamento)
- [ ] Budget: 80% do budget em visita ao perfil, 20% em conversão (NO-F042)
- [ ] Público: Lookalike de compradores (se tiver) OU interesses diretos
- [ ] Criativos: As 3 variações de copy do Step 3
- [ ] Duração: 24h (sem otimização, sem esperar aprendizado)

**Se budget < R$50:** Focar 100% em email/WhatsApp (Step 5). Ads não escala com menos.

### Step 5: Disparar para Base Existente

Se tem base de email/WhatsApp — essa é a PRIMEIRA ação (antes dos ads):

**Sequência de 3 disparos em 24h:**

- [ ] **Disparo 1 (Hora 0 — imediato):**
  - Assunto: "[URGENTE] {oferta} só hoje"
  - Corpo: Copy variação DOR + link direto
  - Canal: Email + WhatsApp simultâneo

- [ ] **Disparo 2 (Hora 6 — meio do dia):**
  - Assunto: "Já viu isso? {prova social}"
  - Corpo: Copy variação OPORTUNIDADE + depoimento
  - Canal: Email

- [ ] **Disparo 3 (Hora 18 — escassez final):**
  - Assunto: "Última chance — encerra à meia-noite"
  - Corpo: Copy variação ALÍVIO + countdown
  - Canal: Email + WhatsApp + Stories

**"Tenho certeza que mando muito email. O que é pior, receber email ou ficar sem vender?"**

### Step 6: Timeline 24h

Montar cronograma hora-a-hora:

```
00h — Montar oferta + criar copy (30min)
01h — Configurar página/checkout
02h — Disparar email/WhatsApp #1 (base existente)
03h — Subir ads com 3 criativos
08h — Disparar email #2 (prova social)
12h — Checar métricas: CTR, conversão, CPL
14h — Ajustar: pausar criativo pior, dobrar no melhor
18h — Disparar email #3 (escassez final)
20h — Stories de escassez + última chamada
23h — Encerrar oferta (escassez REAL)
24h — Balanço: faturamento, custo, lucro
```

### Step 7: Calcular Meta Decomposta

Decompor a meta em vendas necessárias:

| Meta | Produto R$14,90 | Produto R$97 | Produto R$297 | Produto R$2.500 |
|------|-----------------|--------------|---------------|-----------------|
| R$1.000 | 68 vendas | 11 vendas | 4 vendas | 1 venda |
| R$3.000 | 202 vendas | 31 vendas | 11 vendas | 2 vendas |
| R$5.000 | 336 vendas | 52 vendas | 17 vendas | 2 vendas |

**Recomendação:** Combinar tickets. Ex: para R$3.000 →
5 x R$297 + 10 x R$97 + 20 x R$14,90 = R$2.753 + empilhamento pega o resto.

---

## Acceptance Criteria

A task está completa quando TODOS os critérios são atendidos:

- [ ] **AC-1:** Oferta irresistível definida com produto existente (NÃO produto novo)
- [ ] **AC-2:** Ancoragem high ticket presente (NO-F012)
- [ ] **AC-3:** 3 variações de copy por sentimento (Andromeda / NO-H014)
- [ ] **AC-4:** Hook→Punch→Premissa em cada variação
- [ ] **AC-5:** Configuração de ads definida (budget, público, criativos)
- [ ] **AC-6:** Sequência de 3 disparos para base (se existir base)
- [ ] **AC-7:** Timeline 24h hora-a-hora
- [ ] **AC-8:** Meta decomposta em vendas por produto

---

## Veto Conditions

| Veto | Heurística | Descrição |
|------|-----------|-----------|
| V1 | NO-H020 | SE budget = R$0 E base = 0 → BLOQUEIA. Sem ads E sem base = impossível. |
| V2 | NO-F012 | SE oferta sem ancoragem high ticket → ALERTA. Perda de percepção de valor. |
| V3 | — | SE quer criar produto novo para caixa rápido → VETO. Usar o que existe. |
| V4 | NO-H014 | SE copy única (sem variação por sentimento) → VETO. Mínimo 3 variações. |
| V5 | NO-F048 | SE plano depende só do orgânico → VETO. Orgânico é consequência. |
| V6 | NO-F033 | SE plano requer custo fixo novo → VETO. Caixa rápido = zero custo novo. |

---

## Quality Gate

```yaml
quality_gate:
  id: "QG-VTD-CAIXA"
  name: "Caixa Rápido Quality Gate"
  placement: "exit"
  type: "hybrid"
  severity: "blocking"

  criteria:
    - check: "Oferta usa produto existente"
      type: "boolean"
      weight: 3
    - check: "3 variações de copy por sentimento"
      type: "count"
      value: 3
      operator: ">="
      weight: 2
    - check: "Timeline 24h completa"
      type: "boolean"
      weight: 2
    - check: "Meta decomposta em vendas"
      type: "boolean"
      weight: 1

  thresholds:
    pass: 8
    review: 6
    fail: 4

  pass_action:
    - "Entregar plano-caixa-rapido.md"
    - "Alertar: EXECUTAR IMEDIATAMENTE"
  fail_action:
    - "Revisar gaps"
    - "Refazer steps incompletos"
```

---

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | Execução manual pelo usuário |
| **Trigger** | Task completa com plano aprovado |
| **Executor** | Humano (executa ads, dispara emails) |

### Handoff Checklist

- [ ] Plano de caixa rápido entregue
- [ ] Copy pronta para copiar/colar
- [ ] Configuração de ads definida
- [ ] Timeline clara

### Handoff Package

- **plano-caixa-rapido.md**: Plano completo executável
- **copy-3-variacoes.md**: 3 copies prontas por sentimento
- **config-ads.md**: Configuração de ads para subir

---

## Output Example

```markdown
## Caixa Rápido 24h — Confeitaria Lucrativa

**Meta:** R$3.000 em 24h
**Budget ads:** R$100
**Base:** 2.000 emails + 300 WhatsApp

### Oferta Irresistível
**Produto:** Curso "Precificação para Confeiteiras" (normalmente R$297)
**Oferta:** R$297 por R$97 + bônus "Planilha de Custos Automática"
**Escassez:** Só hoje até meia-noite. 50 vagas.

**Ancoragem:** "A Mentoria Individual de Confeitaria Lucrativa custa R$2.500.
Mas hoje você pode ter o curso completo + planilha por apenas R$97."

### Copy Variação 1 — DOR
**Hook:** "Você trabalha 12h por dia na cozinha e no final do mês mal sobra R$500?"
**Punch:** "Enquanto isso, confeiteiras que precificam CERTO trabalham MENOS e faturam 3x mais"
**Premissa:** "O problema não é o bolo. É o PREÇO do bolo."
**CTA:** "Curso Precificação + Planilha por R$97 (só hoje)"

### Meta Decomposta
31 vendas x R$97 = R$3.007
Com base de 2.000 emails, precisa de 1.5% de conversão = viável.

### Timeline
08h — Disparo email + WhatsApp #1 (DOR)
12h — Subir ads R$100 (3 criativos)
14h — Disparo email #2 (OPORTUNIDADE + depoimento)
20h — Disparo email #3 + Stories (ESCASSEZ)
23h59 — Encerrar oferta

Só vende quem oferece. Bora nessa?
```

---

## Error Handling

### Cenário: Budget insuficiente
- **Trigger:** Budget < R$50
- **Detection:** Elicitation step 4
- **Recovery:** Focar 100% em base existente (email/WhatsApp). Sem ads.
- **Prevention:** Alertar que caixa rápido sem budget E sem base é muito limitado.

### Cenário: Sem produto pronto
- **Trigger:** Nenhum produto existente para vender
- **Detection:** Elicitation step 2
- **Recovery:** Criar oferta de serviço/consultoria rápida (1h por R$X)
- **Prevention:** Manter sempre 1+ produto pronto no inventário.

### Cenário: Base muito pequena
- **Trigger:** Base < 100 contatos
- **Detection:** Elicitation step 3
- **Recovery:** Aumentar budget de ads para compensar. Usar Stories como disparo.
- **Prevention:** Funil perpétuo de aquisição deve estar rodando (wf-aquisicao-funil).

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-21_
_Compliant: Yes_
