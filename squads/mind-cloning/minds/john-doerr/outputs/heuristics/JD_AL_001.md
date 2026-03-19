# JD_AL_001 — Alignment Check

**Type:** Decision Heuristic
**Phase:** 2 (Alinhamento Organizacional)
**Agent:** @kaizen:john-doerr
**Pattern:** JD-ALIGN-001 (Validação de Alinhamento Vertical e Horizontal)

## Purpose

Valida se os OKRs estão alinhados vertical (empresa → time → indivíduo) e horizontalmente (entre times). Identifica silos, desconexões e conflitos. Alinhamento é o superpower que transforma OKRs individuais em um sistema organizacional coerente.

## Configuration

```yaml
JD_AL_001:
  name: "Alignment Check"
  phase: 2

  weights:
    vertical_alignment: 0.95
    horizontal_alignment: 0.9
    bottom_up_contribution: 0.85
    transparency_level: 0.9
    conflict_detection: 0.85
    cross_team_dependencies: 0.8

  thresholds:
    vertical_coverage: "cada OKR de time deve conectar a pelo menos 1 OKR empresa"
    horizontal_links: "times com dependências devem ter OKRs compartilhados"
    bottom_up_ratio: "~40% dos OKRs devem vir de baixo para cima"
    visibility: "100% dos OKRs devem ser visíveis para toda a organização"

  veto_conditions:
    - condition: "OKRs de time sem conexão com OKRs da empresa"
      action: "VETO — OKRs desconectados são esforço desperdiçado. Onde está o link com a estratégia?"
    - condition: "OKRs 100% top-down sem input das equipes"
      action: "REVIEW — Alinhamento é bidirecional. Sem bottom-up, você perde inovação e ownership."
    - condition: "OKRs confidenciais/restritos a gestores"
      action: "VETO — Transparência é o oxigênio dos OKRs. Se ninguém vê, ninguém alinha."
    - condition: "Dois times com OKRs conflitantes"
      action: "REVIEW — Conflito detectado. Resolver antes de prosseguir."
    - condition: "OKRs de indivíduos desconectados do time"
      action: "REVIEW — OKRs individuais devem contribuir para OKRs do time."

  decision_tree: |
    IF OKRs de todos os níveis são visíveis para todos → AVALIAR alinhamento vertical
    IF OKRs são restritos → VETO — transparência obrigatória
    IF cada OKR de time contribui para pelo menos 1 OKR empresa → AVALIAR horizontal
    IF OKRs de time sem link → VETO — desconexão estratégica
    IF times interdependentes têm OKRs coordenados → APPROVE
    IF times trabalham em silos com OKRs conflitantes → REVIEW — resolver
    TERMINATION: Organização recusa transparência total de OKRs
```

## Application

**Input:** OKRs de todos os níveis (empresa, time, indivíduo) com mapeamento de dependências
**Process:** Verificar conexões verticais, identificar links horizontais, detectar conflitos e gaps de transparência.
**Output:** Mapa de alinhamento com gaps, conflitos e recomendações de correção

## Decision Tree

```text
STEP 1: VERIFICAR transparência

IF (Todos os OKRs visíveis para toda a organização)
  THEN APPROVE — "Transparência presente. Alinhamento pode fluir."
ELSE IF (OKRs restritos a gestores)
  THEN VETO — "Um OKR confidencial é um OKR morto. Abra para todos."
ELSE IF (Parcialmente visível)
  THEN REVIEW — "Quais OKRs estão escondidos e por quê?"

STEP 2: VERIFICAR alinhamento vertical (top-down)

IF (Cada OKR de time contribui para pelo menos 1 OKR empresa)
  THEN APPROVE — "Alinhamento vertical presente."
ELSE IF (OKRs de time sem conexão)
  THEN ALERTAR — "Time '[nome]' tem OKRs que não contribuem para nenhum
  OKR da empresa. Esforço válido mas desalinhado."

STEP 3: VERIFICAR contribuição bottom-up

IF (~40% dos OKRs foram propostos pelas equipes)
  THEN APPROVE — "Mix saudável de direção e autonomia."
ELSE IF (100% top-down)
  THEN REVIEW — "Sem input das equipes, você perde:
  1) Insights de quem está na linha de frente
  2) Ownership — pessoas se comprometem mais com o que ajudaram a criar
  3) Inovação — as melhores ideias frequentemente vêm de baixo"
ELSE IF (100% bottom-up)
  THEN REVIEW — "Sem direção estratégica, cada time otimiza para si.
  Precisa de OKRs da empresa para dar coerência."

STEP 4: VERIFICAR alinhamento horizontal

IF (Times interdependentes têm OKRs compartilhados ou complementares)
  THEN APPROVE — "Colaboração cross-team presente."
ELSE IF (Times com dependências mas sem OKRs coordenados)
  THEN REVIEW — "Marketing depende de Produto para lançamento,
  mas seus OKRs não refletem isso. Crie KRs compartilhados."
ELSE IF (OKRs conflitantes entre times)
  THEN ESCALATE — "Conflito: Time A quer 'maximizar volume' e
  Time B quer 'maximizar margem'. Resolver no nível de liderança."

STEP 5: VERIFICAR alinhamento individual

IF (OKRs de cada pessoa contribuem para OKRs do time)
  THEN APPROVE — "Cada indivíduo sabe como contribui para o todo."
ELSE IF (OKRs individuais desconectados)
  THEN REVIEW — "OKRs pessoais devem ser ponte entre desenvolvimento
  individual e contribuição para o time."

TERMINATION: Organização opera em silos e recusa transparência
FALLBACK: Começar alinhamento pelo top — alinhar empresa→times, depois times→indivíduos
```

## Mapa de Alinhamento Visual

```text
                    [OKR EMPRESA]
                   /      |       \
        [OKR Time A] [OKR Time B] [OKR Time C]
         /    |        |    |        |    \
      [P1]  [P2]    [P3]  [P4]    [P5]  [P6]

Verificações:
↕ VERTICAL: Cada nível contribui para o acima
↔ HORIZONTAL: Times com dependências têm KRs compartilhados
↑ BOTTOM-UP: ~40% dos OKRs propostos pelas equipes
👁 TRANSPARÊNCIA: Todos veem todos os OKRs
⚡ CONFLITOS: Zero OKRs conflitantes entre times
```

## Examples

### APPROVE: Alinhamento Completo

- **Empresa:** "Tornar-se líder em satisfação do cliente no segmento"
  - KR: NPS > 80 até Q4
- **Time Produto:** "Criar a experiência mais intuitiva do mercado"
  - KR: Reduzir time-to-value de 15min para 3min (contribui para NPS empresa)
- **Time Suporte:** "Resolver problemas antes que o cliente perceba"
  - KR: First contact resolution > 90% (contribui para NPS empresa)
- **Doerr diz:** "Veja como todos tocam a mesma música. Alinhamento perfeito."

### VETO: Silos

- **Empresa:** "Dobrar receita recorrente"
- **Time Marketing:** "Aumentar leads em 300%"
- **Time Vendas:** "Aumentar ticket médio em 50%"
- **Problema:** Marketing otimiza volume (leads baratos), Vendas otimiza valor (leads premium). Conflito direto.
- **Doerr diz:** "Esses dois times estão puxando em direções opostas. O OKR da empresa precisa desdobrar de forma que os dois convirjam, não conflitem."

### REVIEW: 100% Top-Down

- **Situação:** CEO define todos os OKRs, times apenas executam
- **Doerr diz:** "Andy Grove me ensinou que as melhores ideias frequentemente vêm de quem está mais perto do problema. Quando o Google implementou OKRs, cerca de metade veio bottom-up. Permita que as equipes proponham seus OKRs."

## Core Quotes

- "Quando todos podem ver os OKRs de todos, a colaboração emerge naturalmente."
- "Alinhamento não é controle — é orquestra. Cada instrumento toca diferente, mas a música é a mesma."
- "OKRs confidenciais são OKRs mortos."
- "As melhores ideias frequentemente vêm de baixo. Dê espaço para bottom-up."

---

**Pattern Compliance:** JD-ALIGN-001 (Validação de Alinhamento)
**Source:** JD Mind DNA — OKR Alignment Superpower
