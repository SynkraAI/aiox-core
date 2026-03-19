# design-launch-value-stack

## Metadata
```yaml
task_id: HZ_LAUNCH_008
agent: hormozi-launch
type: offer-design
complexity: medium
estimated_time: 30-45min
source: "$100M Launch Playbook - Valor Empilhado (E.V.E.N.T.O)"
```

## Purpose

Design a complete value stack for your launch — the "V" in E.V.E.N.T.O that creates perceived value 10X or higher than the price.

> "Stack de ofertas que supera o preco em 10X minimo." — Alex Hormozi

---

## Input Required

```yaml
value_stack_context:
  product_name: ""
  core_product_description: ""
  target_price: ""
  target_avatar: ""
  main_objections: []  # Top 3 objecoes do avatar
  competitor_offers: []  # O que concorrentes oferecem
```

---

## The Value Stack Architecture

### Formula

```
Produto Core: Valor $X
+ Bonus 1: Valor $Y (Remove objecao principal)
+ Bonus 2: Valor $Z (Acelera resultado)
+ Bonus 3: Valor $W (Seguranca/garantia)
+ Surpresa: Priceless (So durante evento)
= Stack Total: $X+Y+Z+W
Preco Hoje: Stack Total / 3 (ou mais)
```

### Multiplicador Minimo: 10X

| Cenario | Preco | Stack Minimo |
|---------|-------|--------------|
| Low-ticket | $97 | $970+ |
| Mid-ticket | $497 | $4,970+ |
| High-ticket | $2,997 | $29,970+ |

---

## Phase 1: Core Product Value

### Definicao do Core

```yaml
core_product:
  nome: ""
  descricao: ""
  formato: ""  # Curso, servico, produto fisico, software
  entregaveis:
    - item: ""
      valor_percebido: ""
  valor_total_core: ""
  justificativa_valor: ""  # Por que vale isso
```

### Benchmark de Valor

| Comparacao | Preco de Mercado |
|------------|------------------|
| Curso similar | $ |
| Consultoria equivalente | $ |
| Alternativa DIY (tempo x hora) | $ |
| Custo de NAO resolver | $ |

---

## Phase 2: Bonus Stack (Remove Objections)

### Bonus 1: Remove Objecao Principal

**Objecao mais comum:** [Qual e?]

```yaml
bonus_1:
  objecao_que_remove: ""
  nome_do_bonus: ""
  descricao: ""
  formato: ""  # Template, checklist, video, acesso, DFY
  valor_atribuido: ""
  justificativa: ""
```

**Exemplos por Objecao:**

| Objecao | Bonus que Remove |
|---------|------------------|
| "Nao tenho tempo" | Templates prontos, done-for-you |
| "Nao sei por onde comecar" | Roadmap passo-a-passo, quick start |
| "E muito complicado" | Checklists, video tutoriais |
| "Nao vai funcionar pra mim" | Casos de uso especificos, 1-1 call |

---

### Bonus 2: Acelera Resultado

**Resultado principal:** [Qual e?]

```yaml
bonus_2:
  resultado_que_acelera: ""
  nome_do_bonus: ""
  descricao: ""
  formato: ""
  valor_atribuido: ""
  tempo_economizado: ""  # Quanto tempo economiza
```

**Exemplos de Aceleradores:**

| Tipo | Exemplo |
|------|---------|
| Templates | "50 templates prontos para copiar e colar" |
| Automacao | "Setup automatizado em 1 clique" |
| Acesso direto | "Hotline com especialista" |
| Recursos premium | "Banco de 1000+ [recursos]" |

---

### Bonus 3: Seguranca/Garantia

**Medo principal:** [Qual e?]

```yaml
bonus_3:
  medo_que_elimina: ""
  nome_do_bonus: ""
  descricao: ""
  formato: ""
  valor_atribuido: ""
```

**Exemplos de Seguranca:**

| Tipo | Exemplo |
|------|---------|
| Garantia estendida | "365 dias para testar" |
| Suporte premium | "Acesso a grupo VIP vitalicio" |
| Fallback | "Se nao funcionar, fazemos por voce" |
| Certificacao | "Certificado reconhecido por [autoridade]" |

---

## Phase 3: Surpresa (Live Only)

### O Elemento Priceless

```yaml
surpresa:
  nome: ""
  descricao: ""
  condicao: "Apenas para quem comprar durante o evento ao vivo"
  valor_percebido: "Priceless"
  escassez_real: ""  # Por que so durante o evento
```

**Exemplos de Surpresas:**

| Tipo | Exemplo |
|------|---------|
| Acesso exclusivo | "Jantar com [founder]" |
| Conteudo unico | "Bastidores nunca compartilhados" |
| Fisico exclusivo | "Livro autografado enviado" |
| Experiencia | "Ingresso para evento presencial" |

---

## Phase 4: Stack Calculation

### Tabela de Valor

| Item | Valor | Justificativa |
|------|-------|---------------|
| Core Product | $ | |
| Bonus 1 | $ | |
| Bonus 2 | $ | |
| Bonus 3 | $ | |
| Surpresa | Priceless | |
| **STACK TOTAL** | **$** | |

### Pricing

```yaml
pricing:
  stack_total: ""
  preco_regular: ""  # Se vendesse separado
  preco_lancamento: ""
  desconto_percentual: ""
  multiplicador: ""  # Stack / Preco (deve ser >= 10X)
```

---

## Phase 5: Stack Presentation Script

### Framework de Apresentacao

```
"O que voce esta recebendo hoje:

PRIMEIRO, voce recebe [CORE PRODUCT]
- [Beneficio 1]
- [Beneficio 2]
- [Beneficio 3]
Valor: $[X]

MAS ESPERA...

Porque voce esta aqui hoje, voce tambem recebe:

BONUS #1: [NOME]
[Descricao de como remove objecao]
Valor: $[Y]

BONUS #2: [NOME]
[Descricao de como acelera resultado]
Valor: $[Z]

BONUS #3: [NOME]
[Descricao de como da seguranca]
Valor: $[W]

Valor total ate agora: $[SOMA]

E SE VOCE AGIR AGORA...

SURPRESA: [NOME]
[Por que e priceless]
Disponivel APENAS durante este evento.

Entao, seu investimento hoje:
Nao e $[Stack Total]...
Nao e nem $[Stack/2]...

Seu investimento e apenas $[Preco]

Isso e [X]% de desconto, ou [Multiplicador]X o valor."
```

```yaml
presentation_script:
  core_intro: ""
  bonus_1_transition: ""
  bonus_2_transition: ""
  bonus_3_transition: ""
  surpresa_reveal: ""
  preco_reveal: ""
  call_to_action: ""
```

---

## Real Example: $100M Money Models ($5,998)

| Item | Valor | Justificativa |
|------|-------|---------------|
| 200 livros | $6,000 | $30 x 200 unidades |
| 12 Playbooks fisicos | $1,200 | $100 cada |
| Workshop virtual meio-dia | $2,000 | Consultoria em grupo |
| ACQ AI Assistant | $997/ano | Software subscription |
| **STACK TOTAL** | **$10,197** | |
| **PRECO** | **$5,998** | 41% desconto, 1.7X |

*Nota: Neste caso o multiplicador e menor porque e high-ticket com componente fisico.*

---

## Output: Complete Value Stack

```yaml
value_stack_complete:
  overview:
    product: ""
    preco_final: ""
    multiplicador: ""

  core:
    nome: ""
    valor: ""
    entregaveis: []

  bonuses:
    bonus_1:
      nome: ""
      valor: ""
      objecao_remove: ""
    bonus_2:
      nome: ""
      valor: ""
      resultado_acelera: ""
    bonus_3:
      nome: ""
      valor: ""
      seguranca_oferece: ""

  surpresa:
    nome: ""
    condicao: ""

  totals:
    stack_total: ""
    preco_regular: ""
    preco_lancamento: ""
    desconto: ""
    multiplicador: ""

  presentation:
    script: ""
    slides_needed: ""
```

---

## Quality Gate

```yaml
value_stack_quality:
  - [ ] Core product claramente definido com valor
  - [ ] 3 bonuses que removem objecoes especificas
  - [ ] Surpresa exclusiva para evento ao vivo
  - [ ] Multiplicador >= 10X (ou justificativa se menor)
  - [ ] Cada bonus tem valor justificavel
  - [ ] Script de apresentacao pronto
  - [ ] Stack alinhado com avatar e objecoes
```

## Handoff

After completion:
- → `hormozi-copy` para escrever descricoes detalhadas
- → `plan-launch-evento.md` para integrar ao E.V.E.N.T.O
- → Design team para criar slides de apresentacao
- → `hormozi-pricing` para validar pricing strategy

---
*Task: HZ_LAUNCH_008 | Agent: hormozi-launch | Version: 1.0*
*Source: $100M Launch Playbook - Valor Empilhado (E.V.E.N.T.O)*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
