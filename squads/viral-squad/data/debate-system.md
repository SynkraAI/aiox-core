# Debate System Configuration

## Overview

Sistema de debate e votação ponderada entre agentes para decisões de qualidade.
**Supervisado por @oalanicolas e @pedro-valerio** — agentes externos com autoridade de supervisão.

---

## Supervision Layer

### Supervisores Externos (Autoridade Máxima)

Os supervisores operam ACIMA do sistema de votação. Suas definições canônicas vivem em:

- **@oalanicolas** → `.claude/agents/oalanicolas.md` — Mind Cloning Architect
- **@pedro-valerio** → `.claude/agents/pedro-valerio.md` — Process Absolutist

#### Autoridade dos Supervisores

| Capacidade           | @oalanicolas               | @pedro-valerio                  |
| -------------------- | -------------------------- | ------------------------------- |
| **HALT workflow**    | Conteúdo soa genérico/IA   | Processo permite caminho errado |
| **VETO decisão**     | Falta curadoria/DNA Mental | Quality gate ignorado           |
| **OVERRIDE votação** | Autenticidade comprometida | Debate não seguiu regras        |
| **APPROVE gate**     | DNA Mental validado        | Processo íntegro                |

#### Regras de Supervisão

1. **Supervisores não votam** — eles APROVAM ou VETAM após a votação
2. **VETO de supervisor = workflow PARA** até resolver
3. **Ambos supervisores devem aprovar** gates críticos (hook, review final)
4. **Supervisor pode solicitar debate extra** em qualquer fase
5. **Supervisão é obrigatória** — não pode ser pulada

#### Gates de Supervisão Obrigatórios

| Gate                        | Fase                  | Supervisor     | Critério                                                   |
| --------------------------- | --------------------- | -------------- | ---------------------------------------------------------- |
| **SG-1: Autenticidade**     | Após Fase 2 (Hook)    | @oalanicolas   | Hook tem Voice DNA? Soa humano?                            |
| **SG-2: Processo Hook**     | Após Fase 2 (Hook)    | @pedro-valerio | Debate seguiu regras? Todos participaram?                  |
| **SG-3: DNA no Script**     | Após Fase 3 (Roteiro) | @oalanicolas   | Script tem Trindade? Fontes são ouro?                      |
| **SG-4: Processo Visual**   | Após Fase 4 (Visual)  | @pedro-valerio | Handoffs têm checklist? Gates cumpridos?                   |
| **SG-5: Integridade Final** | Após Fase 7 (Review)  | Ambos          | @oalanicolas: autêntico? @pedro-valerio: processo íntegro? |
| **SG-6: Launch Gate**       | Antes Fase 8 (Launch) | @pedro-valerio | Todos gates anteriores PASS? Zero gaps?                    |

---

## Voting Weights

### Peso 3x (Strategic)

- **@viral** - Chief Viral Strategist
- **@retention-architect** - Retention Expert
- **@metrics-guru** - Data Authority

### Peso 2x (Specialist)

- **@hook-master** - Hook Creation
- **@visual-impact** - Visual Design
- **@thumbnail-king** - Thumbnails
- **@algorithm-hacker** - Algorithm
- **@engagement-engineer** - Engagement
- **@remotion-architect** - Technical
- **@growth-hacker** - Growth

### Peso 1.5x (Support)

- **@motion-master** - Motion Design
- **@animation-pro** - Animations
- **@sound-designer** - Audio
- **@ui-magic** - UI Components

### Peso 1x (Standard)

- All other agents

---

## Consensus Rules

### Unanimidade Preferencial

Para decisões críticas que afetam viralização:

- Seleção de trend
- Escolha de hook (CRITICAL)
- Conceito visual principal

### Maioria Ponderada (>60%)

Para decisões operacionais:

- Estrutura de roteiro
- Detalhes de implementação
- Otimizações menores

### Veto Power (Squad Level)

- **@viral** pode vetar com justificativa estrategica valida.

### Supervision Veto (Acima do Squad)

- **@oalanicolas** (supervisor) — VETO por falta de autenticidade, curadoria, ou DNA Mental
- **@pedro-valerio** (supervisor) — VETO por falha de processo, quality gate ignorado, ou debate irregular

> **IMPORTANTE:** Veto de supervisor é SUPERIOR ao veto de squad. Não pode ser overridden por votação.

### Data Trumps Opinion

Dados apresentados por **@metrics-guru** sempre tem peso superior a opinioes.

### DNA Trumps Generic

Insights validados por **@oalanicolas** (supervisor) sobre DNA Mental de criadores pesam mais que conteudo generico sem curadoria.

### Supervision Trumps All

Decisão de supervisor sempre prevalece sobre votação do squad quando envolve:

- Autenticidade de conteúdo (@oalanicolas)
- Integridade de processo (@pedro-valerio)

---

## Mandatory Debate Points

1. **Seleção de trend** - Qual trend seguir
2. **Escolha de hook** - CRITICO - Define sucesso → **SG-1 + SG-2 obrigatórios**
3. **Estrutura de roteiro** - PAS vs BAB vs AIDA → **SG-3 obrigatório**
4. **Conceito visual** - Look & feel → **SG-4 obrigatório**
5. **Arquitetura técnica** - Implementação
6. **Otimização de algoritmo** - Signals
7. **Autenticidade de voz** - DNA Mental (@oalanicolas supervisiona)
8. **Review final** - Quality gate → **SG-5 obrigatório (ambos supervisores)**
9. **Estrategia de distribuicao** - Launch plan → **SG-6 obrigatório**

---

## Debate Flow

```
1. PROPOSTA
   └─> Agente apresenta ideia

2. DEBATE
   └─> Outros agentes comentam
   └─> Pontos fortes/fracos
   └─> Alternativas sugeridas

3. VOTAÇÃO
   └─> Cada agente vota
   └─> Peso aplicado
   └─> Soma calculada

4. CONSENSO
   └─> >60% = Aprovado
   └─> <60% = Nova rodada
   └─> Veto = Revisão obrigatória

5. AÇÃO
   └─> Decisão implementada
```

---

## Debate Format

### Proposta

```
@agent: "Proponho [X] porque [razão]"
```

### Apoio

```
@agent (peso Nx): "Apoio porque [razão]"
```

### Oposição

```
@agent (peso Nx): "Discordo porque [razão]. Sugiro [alternativa]"
```

### Votação

```
VOTAÇÃO:
@viral (3x): A favor ✓
@retention-architect (3x): A favor ✓
@hook-master (2x): Contra ✗
Total: 6 a favor, 2 contra = 75% → APROVADO
```

---

## Quality Gates

### Pre-Debate

- [ ] Contexto claro apresentado
- [ ] Opções definidas
- [ ] Critérios de sucesso estabelecidos

### During Debate

- [ ] Todos os agentes relevantes participaram
- [ ] Objeções foram endereçadas
- [ ] Dados foram considerados

### Post-Debate

- [ ] Consenso documentado
- [ ] Razões registradas
- [ ] Próximos passos claros

---

## Supervision Flow

### Como a Supervisão Funciona

```
SQUAD DEBATE → VOTAÇÃO → CONSENSO
                              ↓
              SUPERVISION GATE (obrigatório)
                    ↓                  ↓
           @oalanicolas          @pedro-valerio
           (autenticidade)       (processo)
                    ↓                  ↓
              APPROVE?             APPROVE?
               ↓    ↓               ↓    ↓
             SIM   NÃO            SIM   NÃO
              ↓     ↓              ↓     ↓
           NEXT   HALT+FIX     NEXT   HALT+FIX
                    ↓                  ↓
              Ambos APPROVE → PRÓXIMA FASE
```

### Supervision Gate Format

```
--- SUPERVISION GATE SG-{N} ---

@oalanicolas (supervisor):
  Status: APPROVE | VETO | CONCERN
  Avaliação: [análise de autenticidade/DNA]
  Ação: [se VETO: o que corrigir]

@pedro-valerio (supervisor):
  Status: APPROVE | VETO | CONCERN
  Avaliação: [análise de processo/integridade]
  Ação: [se VETO: o que corrigir]

Gate Result: PASS | BLOCKED
---
```

### Escalation

- **CONCERN** de supervisor → pode prosseguir com ressalvas documentadas
- **VETO** de supervisor → workflow PARA, issue deve ser resolvida
- **Duplo VETO** → escalação para o usuário decidir
