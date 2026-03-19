# Task: RMBC Workflow

**Task ID:** rmbc-workflow
**Executor:** Agent (stefan-georgi)
**Execution Type:** Agent
**Quality Gate:** QG-003

---

## Purpose

Executar o metodo RMBC completo (Research, Mechanism, Brief, Copy) para criar copy de alta conversao de forma sistematica. Cada fase deve ser completada antes de avancar.

---

## Inputs

| Input       | Required | Description                               |
| ----------- | -------- | ----------------------------------------- |
| product     | Yes      | Produto/servico                           |
| market      | Yes      | Publico-alvo                              |
| diagnosis   | No       | Output do diagnose-market (se disponivel) |
| type        | Yes      | Tipo de copy (VSL, sales page, email, ad) |
| competitors | No       | URLs ou copys de concorrentes             |

---

## Phase 1: RESEARCH (60-80% do esforco)

### 1.1 Product Research

```
- O que o produto FAZ? (features)
- O que o produto ENTREGA? (benefits)
- POR QUE funciona? (mechanism)
- O que o DIFERENCIA? (USP)
- Qual a PROVA? (resultados, dados)
```

### 1.2 Audience Research

```
- Quem e o buyer persona?
- Quais sao as TOP 3 dores?
- Quais sao os TOP 3 desejos?
- Quais sao as TOP 3 objecoes?
- Que linguagem usam? (VoC)
- O que ja tentaram antes? (frustracao)
- Onde consomem conteudo?
```

### 1.3 Competitor Research

```
- Quais sao os TOP 3 concorrentes?
- Que promessas fazem?
- Que mecanismos usam?
- Quais sao seus pontos fracos?
- O que o mercado diz sobre eles? (reviews)
```

### 1.4 Research Synthesis

```
INSIGHT PRINCIPAL: _______________
DOR #1: _______________
DESEJO #1: _______________
OBJECAO #1: _______________
DIFERENCIAL: _______________
```

**Gate:** Research completa? [ ] Sim → Avanca | [ ] Nao → Completa antes

---

## Phase 2: MECHANISM

### 2.1 Mechanism Discovery

```
O que faz o produto funcionar de forma DIFERENTE?
Nao "melhor" - DIFERENTE.

Perguntas:
1. Qual o processo unico?
2. Por que funciona quando outros falham?
3. Qual e o "ingrediente secreto"?
4. Pode ser nomeado?
5. Pode ser desenhado/explicado em 30s?
6. Um concorrente consegue replicar?
```

### 2.2 Mechanism Naming

```
Nome do Mecanismo: _______________

Checklist:
- [ ] E proprietario (ninguem mais usa)?
- [ ] E visual (pode ser desenhado)?
- [ ] E memoravel (gruda)?
- [ ] Explica o "por que" (nao so o "o que")?
- [ ] E simples (crianca entenderia)?
```

### 2.3 Mechanism Story

```
[Como o mecanismo foi descoberto/criado]
[Por que e contra-intuitivo]
[Prova de que funciona (dados/resultados)]
```

**Gate:** Mecanismo nomeado e validado? [ ] Sim → Avanca | [ ] Nao → Refina

---

## Phase 3: BRIEF

### 3.1 Copy Brief Template

```
PRODUTO: _______________
PUBLICO: _______________
TIPO DE COPY: _______________
CANAL: _______________

AWARENESS LEVEL: _______________
SOPHISTICATION LEVEL: _______________

PROMESSA PRINCIPAL (1 frase):
_______________

MECANISMO UNICO:
Nome: _______________
Como funciona (3 passos): _______________

DOR PRINCIPAL (cena viva):
_______________

DESEJO PRINCIPAL (resultado tangivel):
_______________

OBJECAO PRINCIPAL + RESPOSTA:
_______________

PROVA MAIS FORTE:
_______________

CTA:
_______________

URGENCIA/ESCASSEZ:
_______________

GARANTIA:
_______________
```

**Gate:** Brief completo e aprovado? [ ] Sim → Avanca | [ ] Nao → Completa

---

## Phase 4: COPY

### 4.1 Write First Draft

```
Com R + M + B completos, a copy "se escreve sozinha".

Seguir template adequado:
- Sales page → sales-page-tmpl.md
- VSL → vsl-script-tmpl.md
- Email → email-sequence-tmpl.md
- Headline → headline-formulas-tmpl.md
```

### 4.2 Self-Review

```
Antes de enviar para Torriani, auto-avalie:

- [ ] Promessa e proprietaria (nao generica)?
- [ ] Dor e visceral (nao bonita)?
- [ ] Hook trava scroll?
- [ ] Mecanismo esta presente e nomeado?
- [ ] CTA e claro e unico?
- [ ] Urgencia e real?
- [ ] Garantia presente?
```

### 4.3 Handoff para Validacao

```
Enviar para @oraculo-torriani:
- Copy completa
- Brief preenchido (contexto)
- Tipo de copy
```

---

## Output

1. Research document completo
2. Mechanism nomeado e documentado
3. Brief preenchido
4. Copy final (primeiro draft)
5. Auto-review checklist

---

## Acceptance Criteria

- [ ] Research cobre produto, audiencia e concorrentes
- [ ] Mecanismo unico nomeado e validado
- [ ] Brief completo com todos os campos
- [ ] Copy escrita seguindo template adequado
- [ ] Auto-review passou nos criterios basicos
- [ ] Pronta para handoff ao Torriani
