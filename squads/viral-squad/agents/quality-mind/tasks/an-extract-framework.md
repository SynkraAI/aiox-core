# Task: Extract Framework (Trinity)

**Command:** `*extract-framework {source}`
**Load:** — (uses core knowledge)

## Purpose

Extrair a Trindade completa (Playbook + Framework + Swipe File) de uma fonte especifica.

## Workflow

### Step 1: Identify Source Type

Perguntar: "Qual a fonte? (entrevista, livro, curso, post, video)"

Avaliar qualidade:

- OURO → proceder com extracao completa
- BRONZE → avisar que resultado sera limitado, sugerir buscar ouro

### Step 2: Extract Playbook

O Playbook e a RECEITA — passo a passo da metodologia.

Buscar na fonte:

- "Como ele faz X?" → sequencia de passos
- "Qual o processo dele?" → workflow
- "O que faz primeiro, segundo, terceiro?" → ordem

Template:

```yaml
playbook:
  name: "{nome da metodologia}"
  steps:
    - step: 1
      action: "{o que fazer}"
      details: "{como fazer}"
    - step: 2
      action: "{proximo passo}"
```

### Step 3: Extract Framework

O Framework e a FORMA — regras de decisao SE/ENTAO.

Buscar na fonte:

- "Quando ele ve X, o que faz?" → regra condicional
- "Como decide entre A e B?" → criterio
- "O que NUNCA faria?" → veto condition

Template:

```yaml
framework:
  rules:
    - condition: "SE {situacao}"
      action: "ENTAO {decisao}"
      rationale: "{por que}"
  veto:
    - condition: "SE {situacao}"
      action: "NUNCA {acao proibida}"
```

### Step 4: Extract Swipe File

O Swipe File sao EXEMPLOS — provas que funcionam.

Buscar na fonte:

- Casos reais com numeros
- Exemplos especificos citados
- Analogias e metaforas usadas
- Historias contadas repetidamente

Template:

```yaml
swipe_file:
  cases:
    - title: "{caso}"
      context: "{situacao}"
      result: "{resultado}"
      lesson: "{licao}"
  analogies:
    - concept: "{conceito}"
      analogy: "{analogia usada}"
```

### Step 5: Validate Completeness

Checklist da Trindade:

- [ ] Playbook tem passos claros e sequenciais
- [ ] Framework tem regras SE/ENTAO (nao so teoria)
- [ ] Swipe File tem exemplos REAIS (nao inventados)
- [ ] Os tres se complementam (playbook diz O QUE, framework diz QUANDO, swipe mostra COMO)

Se falta alguma perna: avisar qual e sugerir onde buscar.

## Completion Criteria

- [ ] Playbook extraido (passo a passo)
- [ ] Framework extraido (regras SE/ENTAO)
- [ ] Swipe File extraido (exemplos validados)
- [ ] Completude validada (3 pernas presentes)
