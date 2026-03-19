# Análise de Ancoragem de Preços

**Task ID:** `task-analise-ancoragem`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-21
**Source Mind:** natanael-oliveira
**Source Heuristics:** NO-F012 ("High ticket PRIMEIRO — Efeito Chanel"), NO-F022 ("98% Rule — oferta para quem não comprou")
**Execution Type:** Sub-task (chamada internamente pelo monetizador)

---

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Analisar e Otimizar Ancoragem de Preços |
| **status** | `pending` |
| **responsible_executor** | monetizador |
| **execution_type** | `Internal Sub-Task` |
| **input** | Lista de produtos com preços e ordem de apresentação atual |
| **output** | analise-ancoragem.md com diagnóstico e recomendações |
| **action_items** | 6 steps |
| **acceptance_criteria** | 7 criteria |

**Estimated Time:** 15-30min
**Trigger:** Interno — sub-task do monetizador. Executada durante task-mix-produtos ou revisão de estratégia.

---

## Task Anatomy

## Overview

Sub-task interna para análise e otimização da ancoragem de preços em um mix
de produtos.

Ancoragem de preço é um dos princípios mais poderosos — e mais ignorados —
do marketing digital. O preço de um produto muda dependendo de qual produto
aparece ANTES dele.

**O Efeito Chanel (NO-F012):** Na loja da Chanel, você vê primeiro os produtos
de R$5.000. Quando chega no produto de R$1.500, parece barato. Isso não é
acidente — é arquitetura de percepção de valor.

"SE pessoa não te conhece → high ticket ANTES." Mesmo que ela nunca compre o
high ticket — a âncora muda o valor percebido de tudo que vem depois.

**A 98% Rule (NO-F022):** 98% das pessoas que chegam ao seu produto não vão
comprar na primeira vez. Se você não tem uma oferta para esse grupo, está
desperdiçando 98% do tráfego. A ancoragem também se aplica aqui: qual oferta
apresentar para quem não comprou? E em qual ordem?

Case: Mentoria R$5.000 aparece ANTES de ebook R$14,90. O ebook não parece
caro — parece uma oportunidade óbvia.

---

## Input

- **produtos** (list)
  - Description: Lista de produtos com preços e ordem de apresentação atual
  - Required: Yes
  - Format: nome | preço | ordem atual (ex: "Ebook R$14,90 | posição 1")
  - Example: "Ebook R$14,90 (pos 1), Curso R$297 (pos 2), Mentoria R$5.000 (pos 3)"

- **contexto** (text)
  - Description: Onde os produtos são apresentados (página de vendas, email, pitch ao vivo)
  - Required: No
  - Default: "Página de vendas"
  - Notes: Contexto afeta a recomendação de ordem

- **publico_nivel** (text)
  - Description: Nível de conhecimento do público sobre o negócio
  - Required: No
  - Default: "Misto"
  - Options: "Frio", "Morno", "Quente"

---

## Output

- **analise-ancoragem.md** (markdown)
  - Description: Análise completa com diagnóstico e plano de reordenação
  - Destination: output/
  - Format: Markdown com diagnóstico, problemas identificados e recomendações práticas

  Contém:
  - Diagnóstico da ordem atual (o que está errado e por quê)
  - Verificação do spread entre tickets
  - Verificação da 98% Rule
  - Ordem recomendada por contexto (página, email, pitch)
  - Impacto estimado na conversão

---

## Elicitation

```yaml
elicitation:
  required: true
  mode: minimal
  notes: "Sub-task interna — inputs geralmente chegam via monetizador, não via usuário direto"
  questions:
    - id: produtos
      question: "Liste seus produtos com preços e ordem atual de apresentação"
      type: text
      required: true
      example: "1) Ebook R$14,90 / 2) Curso R$297 / 3) Mentoria R$5.000"

    - id: contexto
      question: "Onde os produtos são apresentados? (página de vendas / email / pitch / tudo)"
      type: text
      required: false
      default: "Página de vendas"

    - id: publico
      question: "O público te conhece? (Frio / Morno / Quente)"
      type: text
      required: false
      default: "Misto"
```

---

## Action Items

### Step 1: Receber e Mapear Lista de Produtos

- [ ] Registrar todos os produtos com preços
- [ ] Registrar ordem de apresentação atual
- [ ] Registrar contexto (onde são apresentados)
- [ ] Identificar ticket mais alto do mix (âncora potencial)
- [ ] Identificar ticket mais baixo (porta de entrada)

**Mapeamento em tabela:**
| Posição Atual | Produto | Preço | Camada |
|---------------|---------|-------|--------|
| 1 | ... | R$... | low/mid/high |

### Step 2: Verificar Ordem de Apresentação (Efeito Chanel — NO-F012)

**Regra de ouro:** High ticket SEMPRE antes de low ticket.

- [ ] O produto mais caro aparece PRIMEIRO?
  - SE NÃO → PROBLEMA CRÍTICO. Ancoragem invertida.
  - SE SIM → verificar gradação

- [ ] Gradação está correta (do mais caro ao mais barato)?
  - Correto: R$5.000 → R$2.500 → R$297 → R$97 → R$27
  - Incorreto: R$27 → R$97 → R$297 → R$5.000 (escada ascendente — perde valor)

- [ ] High ticket está visível antes do clique de compra?
  - Não adianta ter high ticket se aparece só depois que o usuário decidiu comprar o low

**Aplicação por contexto:**

| Contexto | Regra de Ancoragem |
|----------|-------------------|
| Página de vendas | High ticket no topo da página, antes do scroll |
| Email de oferta | Mencionar high ticket no início antes de apresentar o low |
| Pitch ao vivo | Dizer o preço maior primeiro, depois o preço da oferta |
| Instagram Stories | Mostrar high ticket no primeiro slide |
| Página de obrigado | Apresentar upsell de high ticket imediatamente após compra |

- [ ] Verificar em todos os contextos listados
- [ ] Documentar problemas encontrados por contexto

### Step 3: Aplicar Efeito Chanel — "SE não te conhece → High ANTES"

Para público frio (não te conhece):

- [ ] High ticket deve aparecer na primeira interação possível
- [ ] Não é necessário que ele compre — é necessário que ele VÊ o preço alto primeiro
- [ ] Mesmo em ad de low ticket: mencionar "quem quer o acompanhamento completo, acessa a mentoria R$X.XXX"

**Exemplo prático:**

ANTES (errado — público frio):
```
"Meu ebook de precificação custa R$27.
Quem quiser aprofundar, tem o curso por R$297.
E pra quem quer resultado garantido, a mentoria é R$2.500."
```

DEPOIS (correto — ancoragem Chanel):
```
"Pra quem quer resultado garantido com acompanhamento individual,
tenho a Mentoria Premium por R$2.500.
Mas se você quer começar pelo método no próprio ritmo, o curso
completo está disponível por R$297.
E quem quer só o essencial para começar hoje, o guia rápido é R$27."
```

- [ ] Reescrever pitch de apresentação do mix com ordem correta se necessário
- [ ] Verificar: menção ao high ticket aparece antes do "e o mais barato é..."?

### Step 4: Verificar Spread entre Tickets

O spread (diferença de preço entre camadas) deve ser suficiente para criar
percepção de escada de valor.

**Regra de spread saudável:** 3x a 5x entre cada camada.

| Transição | Spread Ideal | Exemplo |
|-----------|-------------|---------|
| Low → Mid | 3x a 5x | R$27 → R$97 (3,6x ✓) |
| Mid → Mid+ | 2x a 3x | R$97 → R$297 (3,1x ✓) |
| Mid+ → High | 5x a 10x | R$297 → R$2.500 (8,4x ✓) |
| High → Premium | 2x a 5x | R$2.500 → R$5.000 (2x ✓) |

- [ ] Calcular spread entre cada par de produtos adjacentes
- [ ] Identificar spreads problemáticos:
  - Spread muito pequeno (< 2x): não cria percepção de escada
  - Spread muito grande (> 15x): gap de acessibilidade, falta camada intermediária

**Spreads problemáticos e soluções:**

| Problema | Exemplo | Solução |
|----------|---------|---------|
| Spread pequeno | R$97 e R$127 | Reposicionar um dos preços |
| Gap grande | R$27 e R$2.500 (sem mid) | Criar produto mid ticket |
| Inversão | R$297 mid e R$197 "premium" | Corrigir naming ou preço |

- [ ] Documentar ajustes de preço recomendados se necessário

### Step 5: Verificar 98% Rule — Oferta para Quem Não Comprou (NO-F022)

98% das pessoas não compram na primeira exposição. A ancoragem precisa se
estender para o remarketing e reengajamento.

- [ ] **Existe oferta para quem NÃO comprou o produto principal?**
  - SE NÃO → ALERTA. 98% do tráfego está sendo desperdiçado.

- [ ] **Sequência de remarketing com ancoragem:**
  1. Não comprou high ticket → oferecer mid ticket (com high como âncora)
  2. Não comprou mid ticket → oferecer low ticket (com mid como âncora)
  3. Não comprou nada → entrar em nutrição (email sequence)

- [ ] **Sequência correta (com ancoragem):**
  - "Vimos que você visitou a Mentoria R$2.500. Entendemos que pode não ser o momento.
    Que tal começar pelo Curso R$297 e chegar lá no próprio ritmo?"

- [ ] **Sequência errada (sem ancoragem):**
  - "Oi! Você ainda tem interesse em nossos produtos?"

- [ ] Verificar se sequência de remarketing existe e aplica ancoragem
- [ ] Propor sequência se não existir

**Touchpoints onde a 98% Rule deve ser ativa:**
- Pixel de remarketing (Facebook/Google)
- Email sequence pós-visita sem compra
- ManyChat follow-up pós-DM
- Página de obrigado por download de material gratuito

- [ ] Mapear touchpoints existentes e propor faltantes

### Step 6: Montar Output analise-ancoragem.md

- [ ] Diagnóstico da situação atual (o que está correto e o que precisa ajustar)
- [ ] Tabela com ordem atual vs ordem recomendada
- [ ] Spreads calculados com diagnóstico
- [ ] 98% Rule: fluxo de remarketing recomendado
- [ ] Exemplo de pitch reescrito com ancoragem correta
- [ ] Priorização: o que ajustar PRIMEIRO para impacto imediato

---

## Acceptance Criteria

A task está completa quando TODOS os critérios são atendidos:

- [ ] **AC-1:** Ordem de apresentação atual mapeada e comparada com ordem recomendada
- [ ] **AC-2:** Efeito Chanel verificado — high ticket aparece primeiro? (NO-F012)
- [ ] **AC-3:** Spread entre tickets calculado para todos os pares
- [ ] **AC-4:** Gaps de spread identificados e soluções propostas
- [ ] **AC-5:** 98% Rule verificada — existe oferta para quem não comprou? (NO-F022)
- [ ] **AC-6:** Sequência de remarketing com ancoragem proposta
- [ ] **AC-7:** analise-ancoragem.md entregue com diagnóstico e recomendações priorizadas

---

## Veto Conditions

| Veto | Heurística | Descrição |
|------|-----------|-----------|
| V1 | NO-F012 | SE high ticket apresentado DEPOIS do low → BLOCK CRÍTICO. Ancoragem invertida destrói percepção de valor. |
| V2 | NO-F012 | SE mix sem high ticket → BLOCK. Não há âncora possível sem high ticket. |
| V3 | NO-F022 | SE sem qualquer oferta para 98% que não compraram → ALERTA CRÍTICO. |
| V4 | — | SE spread entre camadas < 2x → ALERTA. Sem percepção de escada. |
| V5 | — | SE análise sem verificação por contexto (página, email, pitch) → INCOMPLETA. |
| V6 | — | SE recomendações sem priorização → INCOMPLETA. O que fazer PRIMEIRO? |

---

## Quality Gate

```yaml
quality_gate:
  id: "QG-VTD-ANCORAGEM"
  name: "Análise de Ancoragem Quality Gate"
  placement: "exit"
  type: "hybrid"
  severity: "blocking"

  criteria:
    - check: "Ordem recomendada documentada (high PRIMEIRO)"
      type: "boolean"
      weight: 4
    - check: "Spread calculado entre todos os pares de produtos"
      type: "boolean"
      weight: 2
    - check: "98% Rule verificada com fluxo proposto"
      type: "boolean"
      weight: 3
    - check: "Recomendações priorizadas por impacto"
      type: "boolean"
      weight: 1

  thresholds:
    pass: 9
    review: 6
    fail: 3

  pass_action:
    - "Entregar analise-ancoragem.md"
    - "Comunicar ao monetizador os ajustes prioritários"
  fail_action:
    - "Verificar presença de high ticket no mix"
    - "Completar análise de todos os contextos"
```

---

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | Retorna resultado para monetizador (task pai) |
| **Trigger** | analise-ancoragem.md aprovado |
| **Executor** | monetizador → usuário (aplica reordenação nas páginas e pitches) |

### Handoff Checklist

- [ ] analise-ancoragem.md entregue
- [ ] Problemas críticos comunicados ao monetizador
- [ ] Ação prioritária identificada (1 mudança que gera maior impacto)
- [ ] Exemplo de pitch reescrito disponível para uso imediato

### Handoff Package

- **analise-ancoragem.md**: Análise completa com recomendações
- **pitch-reescrito.md**: Exemplo de apresentação do mix com ancoragem correta
- **remarketing-flow.md**: Sequência 98% Rule para configurar

---

## Output Example

```markdown
## Análise de Ancoragem — Confeitaria Lucrativa

**Data:** 2026-02-21 | **Contexto:** Página de vendas + Email sequence

### Diagnóstico

**PROBLEMA CRÍTICO:** High ticket aparece em ÚLTIMO lugar. Ancoragem invertida.

#### Ordem Atual (errada)
1. Ebook Receitas — R$14,90
2. Guia Precificação — R$27
3. Curso Online — R$197
4. Mentoria Premium — R$2.500 ← âncora aparece por último

**Resultado:** Mentoria R$2.500 parece cara porque o público já "decidiu" o
valor do negócio pelos primeiros produtos que viu (R$14,90 e R$27).

#### Ordem Recomendada (Efeito Chanel)
1. Mentoria Premium — R$2.500 (ANCORA — aparece primeiro)
2. Curso Online — R$197 (parece acessível depois da mentoria)
3. Guia Precificação — R$27 (parece quase de graça)
4. Ebook Receitas — R$14,90 (óbvio comprar junto)

### Spread Analysis
| Par | Spread Atual | Status |
|-----|-------------|--------|
| R$14,90 → R$27 | 1,8x | ⚠️ Pequeno |
| R$27 → R$197 | 7,3x | ✅ Saudável |
| R$197 → R$2.500 | 12,7x | ⚠️ Gap grande — falta mid a R$497-997 |

### 98% Rule
❌ Sem sequência de remarketing ativa.
Recomendação: quem visita Mentoria R$2.500 sem comprar → 3 dias → email com Curso R$197 (âncora na mentoria).

### Ação Prioritária
1. Reordenar página de vendas (high ticket primeiro) — impacto imediato
2. Criar produto mid ticket ~R$597 para fechar gap de spread
3. Configurar remarketing com ancoragem (Pixel + Email sequence)

### Pitch Reescrito (com ancoragem)
"Para quem quer resultado com acompanhamento: Mentoria Premium R$2.500.
Para quem prefere aprender no próprio ritmo: Curso Online R$197.
E para começar hoje com o essencial: Guia de Precificação R$27."
```

---

## Error Handling

### Cenário: Mix sem high ticket
- **Trigger:** Nenhum produto acima de R$500 no mix
- **Detection:** Step 1 — mapeamento de produtos
- **Recovery:** BLOQUEAR análise de ancoragem. Retornar ao monetizador com recomendação de criar high ticket primeiro.
- **Prevention:** Ancoragem sem high ticket é análise de mix insuficiente — o problema está antes da ancoragem.

### Cenário: Todos os produtos com preços muito próximos
- **Trigger:** Mix com 5 produtos entre R$27 e R$97 (sem spread)
- **Detection:** Step 4 — cálculo de spread
- **Recovery:** Identificar o mais estratégico para elevar para high ticket. Propor reposicionamento.
- **Prevention:** Mix saudável precisa de camadas distintas com spread perceptível.

### Cenário: Usuário quer apresentar low ticket primeiro "para não assustar"
- **Trigger:** Resistência do usuário à reordenação (Efeito Chanel)
- **Detection:** Step 2 — feedback do usuário
- **Recovery:** Explicar o mecanismo psicológico + apresentar case real de impacto na conversão.
- **Prevention:** "Assustar" com o preço alto é o objetivo — cria ancoragem que torna o low ticket irresistível.

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-21_
_Compliant: Yes_
