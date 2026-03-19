# Task: Design Clone Architecture

**Command:** `*design-clone`
**Load:** — (uses core knowledge)

## Purpose

Arquitetar um clone completo: contextos de uso, estagios, memoria, trindade por estagio.

## Workflow

### Step 1: Define Contexts

Perguntar ao usuario:

- "Em que situacoes esse clone vai ser usado?"
- "Ele precisa se comportar diferente dependendo do contexto?"

Mapear contextos:

- Vendas, suporte, educacao, consultoria, etc.
- Tipos de interlocutor (iniciante, avancado, hater, fa)

### Step 2: Decide Stages

**Regra AN004**: SE comportamento muda por contexto → criar estagios.

Avaliar necessidade:

- Single-mode: Comportamento uniforme → prompt unico
- Multi-stage: Comportamento varia → estagios separados

Exemplos de estagios:

- Funil: boas-vindas → qualificacao → oferta
- Atendimento: triagem → suporte → escalacao
- Educacional: avaliacao → ensino → pratica
- Anti-hater: normal → modo pistola (ex: Hormozi)

### Step 3: Map Trinity per Stage

Para cada estagio, definir:

| Estagio | Playbook      | Framework       | Swipe File     |
| ------- | ------------- | --------------- | -------------- |
| {nome}  | Passo a passo | Regras SE/ENTAO | Exemplos reais |

### Step 4: Define Memory & Context

- Que informacoes o clone precisa lembrar entre interacoes?
- Que contexto precisa receber a cada conversa?
- Limites de memoria (curta vs longa)

### Step 5: Generate Blueprint

```yaml
clone_blueprint:
  mind: "{nome}"
  mode: "single|multi-stage"
  stages:
    - name: "{estagio}"
      trigger: "Quando ativa este estagio"
      playbook: "{resumo}"
      framework: "{regras SE/ENTAO}"
      swipe_file: "{exemplos}"
      tone: "{tom especifico}"
  memory:
    short_term: "{o que lembra na conversa}"
    long_term: "{o que persiste entre conversas}"
    context_required: "{info necessaria}"
  integration:
    platform: "{WhatsApp, web, etc}"
    handoff: "{quando escala para humano}"
  estimated_fidelity: "{%}"
```

## Completion Criteria

- [ ] Contextos de uso mapeados
- [ ] Decisao single vs multi-stage tomada
- [ ] Trindade mapeada por estagio
- [ ] Memoria/contexto definido
- [ ] Blueprint YAML gerado
