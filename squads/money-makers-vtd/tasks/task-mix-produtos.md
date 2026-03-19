# Mix de Produtos — Meta de Faturamento

**Task ID:** `task-mix-produtos`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-21
**Source Mind:** natanael-oliveira
**Source Heuristics:** NO-F012 ("High ticket PRIMEIRO"), NO-H003 ("1 problema = 1 produto"), NO-F033 ("Zero custo fixo novo")

---

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Criar Mix de Produtos para Meta de Faturamento |
| **status** | `pending` |
| **responsible_executor** | monetizador |
| **execution_type** | `Agent` |
| **input** | Meta mensal, nicho, produtos existentes |
| **output** | Mix de produtos estruturado + plano 1K/dia decomposto |
| **action_items** | 7 steps |
| **acceptance_criteria** | 8 criteria |

**Estimated Time:** 45-75min
**Trigger:** `*mix-produtos {meta}`

---

## Overview

Task para criar ou otimizar o mix de produtos de um negócio digital para
atingir uma meta de faturamento mensal.

O mix de produtos do método Vendas Todos os Dias funciona em três camadas:
low ticket (atração e volume), mid ticket (rentabilidade principal) e high
ticket (ancoragem e aspiração). A ausência de qualquer camada cria um gap
que impede o crescimento.

"Quem tem 1 produto tem 1 problema: 1 preço, 1 persona, 0 estratégia."

A lógica do plano 1K/dia: decompor a meta em combinações de tickets que
somam R$1.000/dia. Ex: 10x R$27 + 5x R$97 + 2x R$297 = ~R$1.350/dia.
Combinação = resiliência. Depender de 1 ticket = fragilidade.

---

## Input

- **meta_mensal** (number)
  - Description: Meta de faturamento mensal em R$
  - Required: Yes
  - Example: 30000

- **nicho** (text)
  - Description: Nicho ou mercado do negócio
  - Required: Yes
  - Example: "Confeitaria, nutrição esportiva, copywriting"

- **produtos_existentes** (list)
  - Description: Produtos já existentes com preço (pode ser vazio)
  - Required: No
  - Example: "Ebook Receitas R$14,90 / Curso Básico R$97"
  - Notes: Se vazio, o agente cria mix do zero

- **publico_nivel** (text)
  - Description: Nível de consciência do público com o negócio
  - Required: No
  - Default: "Misto"
  - Options: "Frio (não te conhece)", "Morno (já ouviu falar)", "Quente (já comprou)"

---

## Output

- **mix-produtos-{nicho}.md** (markdown)
  - Description: Mix completo de produtos com plano de faturamento
  - Destination: output/
  - Format: Markdown com tabela de produtos, decomposição da meta e plano 1K/dia

  Contém:
  - Mapa do mix atual (gaps identificados)
  - Mix proposto por camada (low / mid / high)
  - Plano 1K/dia: combinação de tickets para meta diária
  - Ordem de apresentação (ancoragem — high PRIMEIRO)
  - Produtos novos propostos para completar gaps

---

## Elicitation

```yaml
elicitation:
  required: true
  mode: basic
  questions:
    - id: meta
      question: "Qual a meta de faturamento mensal? (ex: R$10.000, R$30.000)"
      type: number
      required: true
      example: "30000"

    - id: nicho
      question: "Qual o nicho do negócio? (ex: confeitaria, marketing digital, finanças)"
      type: text
      required: true

    - id: produtos
      question: "Quais produtos você JÁ tem? (nome + preço. Pode ser 'nenhum')"
      type: text
      required: false
      example: "Ebook R$14,90 / Curso Online R$197"

    - id: publico
      question: "Seu público te conhece? (Frio = não conhece / Morno / Quente = já comprou)"
      type: text
      required: false
      default: "Misto"
```

---

## Action Items

### Step 1: Elicitar Meta, Nicho e Produtos Existentes

- [ ] Coletar: meta mensal em R$
- [ ] Coletar: nicho do negócio
- [ ] Coletar: produtos existentes (nome + preço)
- [ ] Coletar: nível de consciência do público
- [ ] Mapear: meta diária (meta mensal ÷ 22 dias úteis)

**Exemplo:**
- Meta mensal: R$30.000
- Meta diária: R$30.000 ÷ 22 = ~R$1.364/dia
- Objetivo: montar mix que gera R$1.364/dia de forma combinada

### Step 2: Calcular Decomposição da Meta

Decompor em quantas vendas de cada ticket são necessárias por dia:

| Ticket | Vendas/dia para R$1K | Vendas/dia para R$1,3K | Realismo |
|--------|---------------------|------------------------|---------|
| R$9-44 (low) | 23-111 vendas | 30-144 vendas | Alto volume exigido |
| R$97 (mid low) | 11 vendas | 14 vendas | Viável com ads |
| R$197 (mid) | 6 vendas | 7 vendas | Viável com lista |
| R$297 (mid high) | 4 vendas | 5 vendas | Confortável |
| R$997+ (high) | 1-2 vendas | 1-2 vendas | Alta margem, baixo volume |
| R$5.000 (premium) | 0,2 vendas | 0,3 vendas | 1 venda a cada 5 dias |

- [ ] Calcular combinação de tickets para atingir meta diária
- [ ] Garantir que a combinação é realista (não depende de 100 vendas low/dia)
- [ ] Recomendar combinação 1K/dia como benchmark

**Fórmula 1K/dia benchmark:**
```
10x R$27 = R$270
5x R$97  = R$485
2x R$297 = R$594
Total    = R$1.349/dia → R$29.678/mês
```

### Step 3: Identificar Gaps no Mix

Analisar produtos existentes e mapear ausências:

- [ ] **Falta Low Ticket?** (R$9-44)
  - Papel: entrada, volume, lista de compradores
  - SE ausente: público frio sem porta de entrada barata
  - Risco: CAC alto, conversão baixa em ads

- [ ] **Falta Mid Ticket?** (R$97-297)
  - Papel: rentabilidade principal, recorrência
  - SE ausente: ou vende muito pouco (só high) ou trabalha demais (só low)
  - É a espinha dorsal do faturamento

- [ ] **Falta High Ticket?** (R$997-5.000)
  - Papel: ANCORAGEM + margem
  - SE ausente: BLOCK — sem high ticket = sem ancoragem (NO-F012)
  - Público compara mid ticket sem referência de valor maior

- [ ] Documentar gaps identificados com impacto no faturamento

### Step 4: Propor Novos Produtos para Completar Mix

Para cada gap identificado, propor produto no nicho:

**Templates por camada:**

**Low Ticket (R$9-44):**
- Ebook (resultado específico em 1 problema — NO-H003)
- Planilha / Template / Checklist
- Mini-curso (2-4 aulas sobre 1 problema específico)
- Exemplo: "Guia de Precificação Rápida — R$27"

**Mid Ticket (R$97-297):**
- Curso online completo (módulos, aulas gravadas)
- Grupo de estudos / Comunidade mensal
- Consultoria via chat (30 dias de acesso)
- Exemplo: "Curso Confeitaria Lucrativa — R$197"

**High Ticket (R$997-5.000):**
- Mentoria individual (sessões ao vivo)
- Programa intensivo (4-8 semanas com acompanhamento)
- Mastermind / Grupo VIP com acesso direto
- Exemplo: "Mentoria Precificação Premium — R$2.500"

- [ ] Propor mínimo 1 produto por gap
- [ ] Cada produto resolve 1 problema específico (NO-H003)
- [ ] Nome do produto deixa claro o resultado esperado

### Step 5: Aplicar Ancoragem (High Ticket PRIMEIRO — NO-F012)

**Efeito Chanel:** mostrar o mais caro ANTES do barato aumenta percepção de
valor do barato.

- [ ] Definir ORDEM de apresentação do mix (não preço, não popularidade)
- [ ] High ticket aparece PRIMEIRO em todas as páginas, pitches e conversas
- [ ] Exemplo de ordem correta:

```
1. Mentoria Premium — R$2.500 (ANCORA)
2. Curso Completo — R$297 (parece barato depois da mentoria)
3. Mini-Curso — R$97 (parece acessível)
4. Ebook — R$27 (quase de graça)
```

**"SE pessoa não te conhece → high ticket ANTES."**
Mesmo que ela não vá comprar o high — a percepção que fica é de quem
cobra caro. E isso sobe o valor percebido de tudo.

- [ ] Criar sequência de ancoragem documentada
- [ ] Alertar se high ticket aparecer DEPOIS do low ticket em algum canal

### Step 6: Calcular Plano 1K/dia com o Mix Final

Com o mix completo (existentes + novos), montar combinação que atinge meta:

- [ ] Calcular combinação otimizada por ticket
- [ ] Verificar realismo: número de vendas por ticket é alcançável?
- [ ] Apresentar 3 cenários:
  - **Conservador:** Só com produtos existentes
  - **Moderado:** Mix atual + 1 produto novo
  - **Ambicioso:** Mix completo com todos os gaps preenchidos

**Formato do plano 1K/dia:**
```
Meta diária: R$1.350

Cenário Moderado:
└── 5x R$97 (Curso Online)  = R$485
└── 3x R$297 (Mentoria Gp) = R$891
└── 10x R$27 (Ebook)        = R$270
    Total                    = R$1.646/dia ✓
```

### Step 7: Montar Output mix-produtos-{nicho}.md

- [ ] Tabela com mix completo (camada, produto, preço, status)
- [ ] Gaps identificados com impacto
- [ ] Novos produtos propostos
- [ ] Ordem de ancoragem definida
- [ ] Plano 1K/dia nos 3 cenários

---

## Acceptance Criteria

A task está completa quando TODOS os critérios são atendidos:

- [ ] **AC-1:** Meta mensal decomposta em meta diária e vendas por ticket
- [ ] **AC-2:** Gaps no mix identificados (low / mid / high)
- [ ] **AC-3:** High ticket presente ou proposto (obrigatório — NO-F012)
- [ ] **AC-4:** Mínimo 1 produto proposto por gap
- [ ] **AC-5:** Cada produto resolve 1 problema específico (NO-H003)
- [ ] **AC-6:** Ordem de ancoragem documentada (high PRIMEIRO)
- [ ] **AC-7:** Plano 1K/dia com 3 cenários (conservador, moderado, ambicioso)
- [ ] **AC-8:** mix-produtos-{nicho}.md entregue

---

## Veto Conditions

| Veto | Heurística | Descrição |
|------|-----------|-----------|
| V1 | NO-F012 | SE mix sem high ticket → BLOCK. Sem ancoragem = percepção de valor destruída. |
| V2 | NO-H003 | SE 1 produto para múltiplos problemas → BLOCK. Dividir em produtos separados. |
| V3 | — | SE plano 1K/dia requer 100+ vendas low ticket por dia → ALERTA. Irrealista. |
| V4 | NO-F033 | SE proposta exige custo fixo novo → VETO. Mix = produto digital, zero custo. |
| V5 | — | SE high ticket apresentado DEPOIS do low → BLOCK. Ancoragem quebrada. |
| V6 | NO-H003 | SE 1 produto = vários públicos diferentes → BLOCK. 1 produto = 1 persona. |

---

## Quality Gate

```yaml
quality_gate:
  id: "QG-VTD-MIX"
  name: "Mix de Produtos Quality Gate"
  placement: "exit"
  type: "hybrid"
  severity: "blocking"

  criteria:
    - check: "High ticket presente no mix"
      type: "boolean"
      weight: 4
    - check: "3 camadas cobertas (low/mid/high)"
      type: "count"
      value: 3
      operator: ">="
      weight: 3
    - check: "Plano 1K/dia com 3 cenários"
      type: "boolean"
      weight: 2
    - check: "Ordem de ancoragem documentada"
      type: "boolean"
      weight: 2

  thresholds:
    pass: 10
    review: 7
    fail: 4

  pass_action:
    - "Entregar mix-produtos-{nicho}.md"
    - "Recomendar próximo produto a criar (quick win)"
  fail_action:
    - "Resolver gap de high ticket (crítico)"
    - "Revisar decomposição da meta"
```

---

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | task-escala-ia (se gap for preenchido com app IA) |
| **Trigger** | Mix aprovado com plano 1K/dia definido |
| **Executor** | monetizador → usuário (cria produtos propostos) |

### Handoff Checklist

- [ ] Mix completo documentado
- [ ] Produtos novos priorizados (qual criar primeiro)
- [ ] Plano 1K/dia nos 3 cenários
- [ ] Ancoragem documentada para uso em copy e páginas de vendas

### Handoff Package

- **mix-produtos-{nicho}.md**: Mix completo com plano
- **ancoragem-{nicho}.md**: Ordem de apresentação para copy e páginas
- **quick-win.md**: Produto recomendado para criar primeiro (menor esforço, maior impacto)

---

## Output Example

```markdown
## Mix de Produtos — Confeitaria Lucrativa

**Meta Mensal:** R$30.000 | **Meta Diária:** R$1.364 | **Nicho:** Confeitaria

### Mix Atual (Diagnóstico)
| Camada | Produto | Preço | Status |
|--------|---------|-------|--------|
| Low | Ebook Receitas | R$14,90 | ✅ Existe |
| Mid | — | — | ❌ GAP |
| High | — | — | ❌ GAP CRÍTICO |

### Mix Proposto
| Camada | Produto | Preço | Ação |
|--------|---------|-------|------|
| Low | Ebook Receitas | R$14,90 | Manter |
| Low | Guia Precificação | R$27 | Criar |
| Mid | Curso Confeitaria Lucrativa | R$197 | Criar |
| Mid | Planilha Gestão Confeitaria | R$97 | Criar |
| High | Mentoria Premium | R$2.500 | Criar (ANCORA) |

### Plano 1K/dia — Cenário Moderado
10x R$27 + 5x R$97 + 3x R$197 = R$1.522/dia → R$33.484/mês ✓

### Ordem de Ancoragem
1. Mentoria Premium R$2.500 → 2. Curso R$197 → 3. Planilha R$97 → 4. Guia R$27 → 5. Ebook R$14,90
```

---

## Error Handling

### Cenário: Sem nenhum produto existente
- **Trigger:** "nenhum" na elicitation de produtos
- **Detection:** Step 1
- **Recovery:** Criar mix do zero. Recomendar começar pelo mid ticket (maior ROI de esforço).
- **Prevention:** Mid ticket primeiro porque low sozinho não sustenta e high exige mais autoridade.

### Cenário: Meta irrealista para o estágio do negócio
- **Trigger:** Meta de R$100k/mês com 0 produtos e 0 lista
- **Detection:** Step 2 — cálculo de vendas necessárias
- **Recovery:** Recalibrar expectativa. Apresentar meta realista para o estágio atual.
- **Prevention:** Transparência na decomposição: "Para R$100k/mês você precisaria de X vendas/dia de Y ticket."

### Cenário: Produtos que resolvem múltiplos problemas
- **Trigger:** "Curso Completo de Negócios para Confeiteiras" (muito amplo)
- **Detection:** Step 4 — análise de nicho do produto
- **Recovery:** BLOQUEAR e propor divisão em produtos específicos (NO-H003).
- **Prevention:** Cada produto = 1 problema = 1 resultado = 1 persona.

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-21_
_Compliant: Yes_
