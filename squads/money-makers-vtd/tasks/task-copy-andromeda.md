# Copy Andromeda — Criativos por Sentimento

**Task ID:** `task-copy-andromeda`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-21
**Source Mind:** natanael-oliveira
**Source Heuristic:** NO-H014 ("Copy por EMOÇÃO, não por demografia — 30-70 variações por sentimento")

---

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Gerar Criativos por Sentimento — Método Andromeda |
| **status** | `pending` |
| **responsible_executor** | copy-andromeda |
| **execution_type** | `Agent` |
| **input** | Produto/oferta, público-alvo, gatilho principal |
| **output** | Pack de criativos organizados por sentimento e gatilho |
| **action_items** | 6 steps |
| **acceptance_criteria** | 8 criteria |

**Estimated Time:** 45-90min
**Trigger:** `*copy-andromeda`

---

## Overview

Task para geração de criativos usando o Método Andromeda: copy criada por
SENTIMENTO, não por segmentação demográfica.

A descoberta central do método: o mesmo público reage de formas completamente
diferentes dependendo do estado emocional em que está no momento do clique.
Uma mãe pode estar com DOR (filho não dorme), MEDO (dívida acumulando) ou
CURIOSIDADE (viu resultado de outra mãe) — e cada sentimento exige um criativo
diferente.

"Você não escreve para a persona. Você escreve para o sentimento que ela está
sentindo AGORA."

O output desta task é um pack com 30-70 variações organizadas por emoção,
prontas para teste A/B em tráfego pago.

---

## Input

- **produto_oferta** (text)
  - Description: Produto ou oferta a ser promovida
  - Required: Yes
  - Example: "Mentoria de Precificação para Confeiteiras — R$297"

- **publico** (text)
  - Description: Descrição do público-alvo (quem é, o que faz, principal dor)
  - Required: Yes
  - Example: "Confeiteiras autônomas que trabalham muito e não conseguem aumentar os preços"

- **gatilho_principal** (number)
  - Description: Gatilho do sistema de recompensa central (1-7)
  - Required: No
  - Default: Identificado pelo agente no Step 2
  - Notes: 1=Segurança, 2=Excitação, 3=Pertencimento, 4=Prazer, 5=Liberdade, 6=Status, 7=Poder

- **volume** (number)
  - Description: Quantidade de variações a gerar
  - Required: No
  - Default: 30
  - Notes: Mínimo 30, ideal 50-70 para campanhas de escala

---

## Output

- **pack-criativos-{produto}.md** (markdown)
  - Description: Pack completo de criativos organizados por sentimento
  - Destination: output/
  - Format: Tabela markdown com sentimento, gatilho, hook, punch, premissa e CTA

  Contém:
  - Tabela com 30+ criativos
  - Coluna: sentimento dominante
  - Coluna: gatilho (1-7)
  - Coluna: hook (abertura que para o scroll)
  - Coluna: punch (consequência / prova)
  - Coluna: premissa (o que o produto faz)
  - Coluna: CTA (call-to-action)
  - Agrupamento por sentimento para facilitar teste A/B

---

## Elicitation

```yaml
elicitation:
  required: true
  mode: basic
  questions:
    - id: produto
      question: "Qual produto ou oferta vamos promover? (nome + preço)"
      type: text
      required: true
      example: "Curso de Bolo Vulcão — R$97"

    - id: publico
      question: "Quem é o público? Descreva em 2-3 frases: quem é, o que faz, maior dor"
      type: text
      required: true
      example: "Mulheres 25-45 que vendem doces em casa mas não conseguem sair do
        prejuízo. Trabalham no fim de semana, marido reclamando, dinheiro sumindo."

    - id: volume
      question: "Quantas variações quer gerar? (mínimo 30, ideal 50-70)"
      type: number
      required: false
      default: 30

    - id: formato
      question: "Qual formato principal? (Stories, Feed, Reels, Email, WhatsApp)"
      type: text
      required: false
      default: "Todos os formatos"
```

---

## Action Items

### Step 1: Elicitar Produto e Público

- [ ] Coletar: qual produto/oferta?
- [ ] Coletar: descrição do público (quem é, o que faz, maior dor)
- [ ] Confirmar volume de variações desejado (padrão: 30)
- [ ] Mapear contexto: o público está em fase de descoberta ou já conhece a solução?

**Regra:** Não começar a escrever copy antes de entender o estado emocional médio do público.

### Step 2: Identificar Sentimento Dominante

Mapear os 5 sentimentos primários e estimar proporção no público:

- [ ] **DOR** — O problema está causando sofrimento ativo agora
  - Sinais: reclamações, frustração, exaustão, "não aguento mais"
  - Exemplo: "Trabalho 14h e ainda fico no zero"

- [ ] **OPORTUNIDADE** — Existe um resultado possível que ainda não alcançou
  - Sinais: ambição, inveja positiva, "quero isso também"
  - Exemplo: "Ela triplicou o faturamento em 3 meses"

- [ ] **MEDO** — Existe uma consequência negativa que quer evitar
  - Sinais: ansiedade, procrastinação, "e se não funcionar"
  - Exemplo: "Se não aprender precificação, vou fechar"

- [ ] **ALÍVIO** — Quer sair de uma situação ruim, não necessariamente chegar a um resultado
  - Sinais: burnout, sobrecarga, "queria só respirar"
  - Exemplo: "Quero só trabalhar menos e ganhar o mesmo"

- [ ] **CURIOSIDADE** — Viu algo que chamou atenção, quer entender
  - Sinais: "como ela fez isso?", "o que é isso?", comentários com perguntas
  - Exemplo: "Confeiteira fatura R$15k/mês trabalhando 4 dias — como?"

**Output do Step 2:** Distribuição estimada dos sentimentos no público.

### Step 3: Gerar 30-70 Variações por EMOÇÃO

Aplicar framework Hook → Punch → Premissa em cada variação (NO-H014):

**Hook:** Para o scroll. Primeira frase que prende. Deve atacar o sentimento.
**Punch:** Consequência, prova ou agravamento. Por que isso importa AGORA?
**Premissa:** O produto como solução. Resultado esperado + tempo.

**Regra de distribuição por sentimento:**
```
DOR:          25% das variações (dói — a mais eficaz para conversão)
OPORTUNIDADE: 25% das variações (inspira — boa para tráfego frio)
MEDO:         20% das variações (urgência — boa para remarketing)
ALÍVIO:       20% das variações (suave — boa para públicos esgotados)
CURIOSIDADE:  10% das variações (engajamento — boa para topo de funil)
```

**Para cada variação:**
- [ ] Sentimento identificado
- [ ] Gatilho mapeado (1-7)
- [ ] Hook escrito (máx 15 palavras)
- [ ] Punch escrito (máx 20 palavras)
- [ ] Premissa escrita (máx 20 palavras)
- [ ] CTA definido (específico para o sentimento)

**NUNCA:** Copy genérica que serve para qualquer público.
**NUNCA:** Mesmo hook para sentimentos diferentes.

### Step 4: Aplicar Hook → Punch → Premissa

Exemplos de estrutura por sentimento:

**DOR:**
- Hook: "Você trabalha mais e ganha menos que ano passado?"
- Punch: "Quem não aprende a precificar, trabalha de graça — e ainda paga para trabalhar"
- Premissa: "Mentoria Precificação te coloca no lucro em 30 dias"
- CTA: "Quero parar de trabalhar no prejuízo →"

**OPORTUNIDADE:**
- Hook: "Essa confeiteira fatura R$12k/mês com 3 produtos"
- Punch: "Ela não tem mais seguidores que você. Ela só cobra certo."
- Premissa: "Aprenda o método dela em 4 semanas"
- CTA: "Quero esse resultado também →"

**MEDO:**
- Hook: "Quantas confeiteiras vão fechar esse ano por não saber precificar?"
- Punch: "A margem negativa não aparece no começo — aparece quando a dívida já acumulou"
- Premissa: "Diagnóstico de precificação antes que seja tarde"
- CTA: "Corrigir antes que quebre →"

**ALÍVIO:**
- Hook: "Imagina calcular o preço do bolo e já saber que vai sobrar dinheiro"
- Punch: "Sem planilha complicada. Sem fórmula de gestão financeira."
- Premissa: "Método simples que qualquer confeiteira consegue aplicar hoje"
- CTA: "Quero simplificar isso →"

**CURIOSIDADE:**
- Hook: "Por que confeiteiras que estudam precificação cobram 3x mais e vendem mais?"
- Punch: "O cliente não foge do preço alto. Ele foge da falta de confiança."
- Premissa: "Entenda a psicologia do preço em 2 horas"
- CTA: "Quero entender →"

### Step 5: Classificar por Gatilho (7 Gatilhos)

Para cada criativo, identificar o gatilho do sistema de recompensa central:

| Gatilho | Número | Ativa quando... | Exemplo de CTA |
|---------|--------|-----------------|----------------|
| Segurança | 1 | Pessoa quer proteção, previsibilidade | "Garanta sua renda fixa" |
| Excitação | 2 | Pessoa quer novidade, adrenalina | "Descobre o método novo" |
| Pertencimento | 3 | Pessoa quer fazer parte de grupo | "Entra para o grupo das que faturam" |
| Prazer | 4 | Pessoa quer conforto, facilidade | "Trabalha menos, ganha mais" |
| Liberdade | 5 | Pessoa quer independência | "Para de depender do marido" |
| Status | 6 | Pessoa quer reconhecimento | "Vira referência no bairro" |
| Poder | 7 | Pessoa quer controle, influência | "Você decide quanto quer ganhar" |

- [ ] Cada criativo recebe número do gatilho (1-7)
- [ ] Verificar se CTAs estão alinhados com o gatilho
- [ ] Garantir que todos os 7 gatilhos estão representados no pack

### Step 6: Montar Output — Pack Organizado

Organizar criativos em tabela por sentimento:

- [ ] Tabela com colunas: Sentimento | Gatilho | Hook | Punch | Premissa | CTA
- [ ] Agrupados por sentimento (DOR juntos, OPORTUNIDADE juntos, etc.)
- [ ] Numerados para facilitar referência no teste A/B
- [ ] Notas de formato por criativo (Stories, Feed, Reels, Email)
- [ ] Recomendação dos top 5 para testar primeiro

---

## Acceptance Criteria

A task está completa quando TODOS os critérios são atendidos:

- [ ] **AC-1:** Sentimento dominante do público identificado e documentado
- [ ] **AC-2:** Mínimo 30 variações de criativos geradas
- [ ] **AC-3:** Todos os 5 sentimentos representados (DOR, OPORTUNIDADE, MEDO, ALÍVIO, CURIOSIDADE)
- [ ] **AC-4:** Todos os 7 gatilhos representados no pack
- [ ] **AC-5:** Estrutura Hook → Punch → Premissa aplicada em cada criativo
- [ ] **AC-6:** CTAs específicos por sentimento (não genérico "Compre agora")
- [ ] **AC-7:** Criativos organizados por sentimento em tabela
- [ ] **AC-8:** Top 5 criativos recomendados para teste A/B identificados

---

## Veto Conditions

| Veto | Heurística | Descrição |
|------|-----------|-----------|
| V1 | NO-H014 | SE copy sem variação por sentimento → BLOCK. Mínimo 5 sentimentos distintos. |
| V2 | NO-H014 | SE copy genérica sem Hook específico → BLOCK. Hook deve parar o scroll. |
| V3 | — | SE menos de 30 variações → BLOCK. Volume é estratégia, não capricho. |
| V4 | — | SE Hook > 15 palavras → ALERTA. Hook longo não para scroll. |
| V5 | — | SE todos os criativos usam mesmo gatilho → BLOCK. Diversidade de gatilhos é obrigatória. |
| V6 | — | SE CTA genérico ("Saiba mais", "Clique aqui") → VETO. CTA deve refletir sentimento. |

---

## Quality Gate

```yaml
quality_gate:
  id: "QG-VTD-ANDROMEDA"
  name: "Copy Andromeda Quality Gate"
  placement: "exit"
  type: "hybrid"
  severity: "blocking"

  criteria:
    - check: "Mínimo 30 variações geradas"
      type: "count"
      value: 30
      operator: ">="
      weight: 3
    - check: "5 sentimentos distintos representados"
      type: "count"
      value: 5
      operator: ">="
      weight: 3
    - check: "7 gatilhos mapeados"
      type: "count"
      value: 7
      operator: ">="
      weight: 2
    - check: "Hook → Punch → Premissa em cada criativo"
      type: "boolean"
      weight: 2

  thresholds:
    pass: 9
    review: 6
    fail: 4

  pass_action:
    - "Entregar pack-criativos-{produto}.md"
    - "Indicar top 5 para teste A/B imediato"
  fail_action:
    - "Revisar distribuição de sentimentos"
    - "Completar volume mínimo de 30 variações"
```

---

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | task-copy-campanha (se for campanha completa) |
| **Trigger** | Pack com 30+ criativos aprovado |
| **Executor** | copy-andromeda → usuário (sobe ads) |

### Handoff Checklist

- [ ] Pack de criativos entregue com mínimo 30 variações
- [ ] Criativos organizados por sentimento
- [ ] Top 5 para teste A/B identificados
- [ ] Formato de cada criativo indicado (Stories, Feed, Reels)

### Handoff Package

- **pack-criativos-{produto}.md**: Tabela completa por sentimento
- **top5-teste-ab.md**: Os 5 melhores para testar primeiro
- **notas-gatilho.md**: Análise dos gatilhos dominantes do público

---

## Output Example

```markdown
## Pack Criativos — Mentoria Precificação Confeiteiras

**Produto:** Mentoria Precificação — R$297
**Público:** Confeiteiras autônomas com prejuízo oculto
**Total de Variações:** 35
**Sentimento Dominante:** DOR (47% do público estimado)

### Criativos — DOR (9 variações)

| # | Hook | Punch | Premissa | CTA | Gatilho |
|---|------|-------|----------|-----|---------|
| 1 | "Você trabalha 12h e ainda deve pro mercado?" | "Quem não precifica certo, paga para trabalhar" | "Método em 30 dias sai do prejuízo" | "Quero parar de trabalhar de graça →" | 1 |
| 2 | "Quantas horas você trabalhou essa semana?" | "E quanto ficou no seu bolso de verdade?" | "Precificação correta = lucro garantido" | "Calcular meu lucro real →" | 7 |
| ... | ... | ... | ... | ... | ... |

### Top 5 para Teste A/B Imediato

1. **#1 DOR/Gatilho-1** — Alta conversão em público frio
2. **#12 OPORTUNIDADE/Gatilho-6** — Alta conversão em lookalike
3. **#19 MEDO/Gatilho-1** — Alta conversão em remarketing
4. **#25 ALÍVIO/Gatilho-4** — Boa para público esgotado
5. **#31 CURIOSIDADE/Gatilho-2** — Bom para topo de funil frio
```

---

## Error Handling

### Cenário: Público muito amplo
- **Trigger:** Descrição do público vaga ("todo mundo que quer ganhar dinheiro")
- **Detection:** Step 1 — Elicitation
- **Recovery:** Fazer perguntas de refinamento: qual a dor específica? qual resultado deseja?
- **Prevention:** Pedir 2-3 frases concretas sobre o dia a dia do público.

### Cenário: Produto sem diferencial claro
- **Trigger:** Produto genérico sem promessa específica
- **Detection:** Step 1 — análise do produto
- **Recovery:** Elicitar resultado mais específico: "Em quanto tempo? Qual transformação exata?"
- **Prevention:** Copy do Andromeda funciona melhor com resultado tangível.

### Cenário: Menos de 30 variações geradas
- **Trigger:** Volume insuficiente de variações
- **Detection:** Step 6 — contagem
- **Recovery:** Ampliar sentimentos sub-representados. DOR e OPORTUNIDADE têm mais variações naturais.
- **Prevention:** Definir volume mínimo no início e distribuir por sentimento antes de começar.

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-21_
_Compliant: Yes_
