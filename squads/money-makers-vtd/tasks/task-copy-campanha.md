# Copy Campanha Semanal

**Task ID:** `task-copy-campanha`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-21
**Source Mind:** natanael-oliveira
**Source Heuristics:** NO-H006 ("Escassez domingo"), NO-H005 ("Aula manhã 11h"), NO-H014 ("Copy por sentimento")

---

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Criar Copy Completa para Campanha Semanal |
| **status** | `pending` |
| **responsible_executor** | copy-andromeda |
| **execution_type** | `Agent` |
| **input** | Gatilho (1-7), produto, ticket, público |
| **output** | Campanha completa: emails, criativos Instagram, script ManyChat |
| **action_items** | 6 steps |
| **acceptance_criteria** | 9 criteria |

**Estimated Time:** 60-120min
**Trigger:** `*copy-campanha`

---

## Overview

Task para criação de copy completa de uma campanha semanal do método
Vendas Todos os Dias.

O método Natanael opera com campanhas semanais: cada semana tem um gatilho
diferente, uma oferta diferente e copy alinhada com o estado emocional
do público naquela semana.

Uma campanha completa inclui: headline principal, 3 emails (abertura com
gatilho / conteúdo-demonstração / escassez domingo), 5 criativos para
Instagram (Stories + Feed + Reels), e script ManyChat para captura e
qualificação via DM.

"Campanha boa não é aquela que tem o melhor produto. É aquela que
aparece na hora certa, com o sentimento certo, para a pessoa certa."

---

## Input

- **gatilho** (number)
  - Description: Gatilho do sistema de recompensa central (1-7)
  - Required: Yes
  - Notes: 1=Segurança, 2=Excitação, 3=Pertencimento, 4=Prazer, 5=Liberdade, 6=Status, 7=Poder

- **produto** (text)
  - Description: Nome e descrição do produto a ser promovido
  - Required: Yes
  - Example: "Mentoria Precificação para Confeiteiras"

- **ticket** (number)
  - Description: Preço do produto em R$
  - Required: Yes
  - Example: 297

- **publico** (text)
  - Description: Descrição do público-alvo
  - Required: Yes

- **semana** (text)
  - Description: Semana de referência para nomenclatura dos arquivos
  - Required: No
  - Default: semana atual (ex: "2026-W08")

---

## Output

- **campanha-{semana}.md** (markdown)
  - Description: Campanha completa pronta para execução
  - Destination: output/
  - Format: Markdown com todas as peças de copy

  Contém:
  - Headline principal da semana (Hook→Punch→Premissa)
  - Email 1: Abertura com gatilho (segunda-feira)
  - Email 2: Conteúdo/demonstração (quarta-feira)
  - Email 3: Escassez domingo (domingo)
  - 5 criativos Instagram (2 Stories + 2 Feed + 1 Reels)
  - Script ManyChat completo (abertura + qualificação + oferta)

---

## Elicitation

```yaml
elicitation:
  required: true
  mode: basic
  questions:
    - id: gatilho
      question: "Qual gatilho desta semana? (1-Segurança, 2-Excitação, 3-Pertencimento,
        4-Prazer, 5-Liberdade, 6-Status, 7-Poder)"
      type: number
      required: true
      example: "6 (Status — confeiteiras que querem ser referência)"

    - id: produto
      question: "Qual produto será promovido esta semana? (nome + breve descrição)"
      type: text
      required: true
      example: "Mentoria Precificação — ensina a cobrar mais sem perder clientes"

    - id: ticket
      question: "Qual o preço do produto? (R$)"
      type: number
      required: true
      example: "297"

    - id: publico
      question: "Descreva o público em 2-3 frases. Quem é? O que quer? O que teme?"
      type: text
      required: true

    - id: semana
      question: "Qual semana de referência? (ex: Semana 1 de Março)"
      type: text
      required: false
      default: "Semana atual"
```

---

## Action Items

### Step 1: Elicitar Gatilho, Produto e Público

- [ ] Coletar: gatilho da semana (1-7)
- [ ] Coletar: produto a ser promovido
- [ ] Coletar: ticket do produto
- [ ] Coletar: descrição do público
- [ ] Mapear: alinhamento entre gatilho e público (o gatilho ressoar com o público?)

**Regra:** Gatilho e público devem se alinhar. Ex: Gatilho Status (6) + público que quer ser
reconhecido como expert = alinhamento forte. Gatilho Status + público em dívida = desalinhamento.

### Step 2: Criar Headline Principal

A headline é o fio condutor de toda a campanha. Tudo converge para ela.

Aplicar estrutura Hook → Punch → Premissa:

- [ ] **Hook:** Para o scroll + ativa o gatilho da semana
  - Deve mencionar o resultado desejado OU o problema que dói
  - Máx 15 palavras
  - Exemplo (Gatilho 6/Status): "Como confeiteiras anônimas viram referência no bairro — e triplicam o preço"

- [ ] **Punch:** Por que isso é urgente AGORA?
  - Prova social, dado, consequência de não agir
  - Exemplo: "Quem não posiciona, compete por preço. E quem compete por preço, sempre perde."

- [ ] **Premissa:** O produto como caminho
  - Resultado específico + tempo + sem o custo indesejado
  - Exemplo: "Mentoria Precificação te posiciona como expert em 30 dias, sem virar coach"

- [ ] Headline aprovada e consistente com o gatilho

### Step 3: Criar 3 Emails da Semana

Calendário de disparo:
- **Email 1:** Segunda-feira — abre a semana com o gatilho
- **Email 2:** Quarta-feira — conteúdo/demonstração de valor
- **Email 3:** Domingo — escassez real (NO-H006)

**Email 1 — Abertura com Gatilho (Segunda):**
- [ ] Assunto: ativa o gatilho + curiosidade (máx 50 chars)
- [ ] Abertura: história ou dado que ativa o sentimento
- [ ] Corpo: contexto do problema + apresentação da solução
- [ ] CTA: único e específico (não "saiba mais" — "quero isso →")
- [ ] Comprimento: 250-400 palavras
- [ ] Horário recomendado: 11h (NO-H005)

**Email 2 — Conteúdo/Demonstração (Quarta):**
- [ ] Assunto: entrega valor antes de pedir venda
- [ ] Abertura: dica real, case ou demonstração do método
- [ ] Corpo: conteúdo que mostra o produto funcionando (prova viva)
- [ ] Transição: "E se você quiser ir mais fundo..."
- [ ] CTA: retoma a oferta de forma suave
- [ ] Comprimento: 300-500 palavras

**Email 3 — Escassez Domingo (NO-H006):**
- [ ] Assunto: urgência real, não falsa ("Encerra hoje à meia-noite")
- [ ] Abertura: recap do que foi oferecido na semana
- [ ] Corpo: último lembrete + escassez REAL (prazo, vagas, bônus)
- [ ] CTA: direto e urgente ("Última chance →")
- [ ] Comprimento: 150-250 palavras (domingo = curto e direto)
- [ ] Horário recomendado: 20h (última janela antes de meia-noite)

**"Tenho certeza que mando muito email. O que é pior, receber email ou ficar sem vender?"**

### Step 4: Criar 5 Criativos Instagram

Distribuição: 2 Stories + 2 Feed + 1 Reels

Cada criativo aplicando Andromeda (NO-H014) — sentimentos diferentes:

**Story 1 — DOR (formato vertical 9:16):**
- [ ] Hook visual (texto grande, impacto imediato)
- [ ] Copy curta: Hook + CTA em 3 linhas
- [ ] Swipe up / Link na bio

**Story 2 — ESCASSEZ (formato vertical 9:16):**
- [ ] Contador regressivo ou vagas restantes
- [ ] Copy: "X vagas restantes" + benefício principal
- [ ] CTA urgente

**Feed 1 — OPORTUNIDADE (carrossel ou imagem):**
- [ ] Imagem 1: Hook que para o scroll
- [ ] Imagens 2-5: sequência que desenvolve a oportunidade
- [ ] Última imagem: CTA claro
- [ ] Legenda: 150-300 palavras com Punch + Premissa

**Feed 2 — PROVA SOCIAL:**
- [ ] Resultado de cliente real (com permissão) ou case do método
- [ ] Legenda: história de transformação + convite

**Reels — CURIOSIDADE (15-30s):**
- [ ] Abertura: frase que para o scroll nos primeiros 3 segundos
- [ ] Desenvolvimento: responde parcialmente (gera curiosidade pro próximo)
- [ ] Fechamento: CTA para bio ou DM

### Step 5: Criar Script ManyChat

Script para automação de DM no Instagram (abertura → qualificação → oferta):

**Estrutura do fluxo:**
- [ ] **Mensagem 1 — Abertura:** Agradece o interesse + pergunta qualificadora
  - Exemplo: "Oi! Vi que você quer saber mais sobre precificação.
    Me conta: você vende pelo preço que quer ou pelo que o cliente aceita?"

- [ ] **Mensagem 2 — Qualificação:** Baseada na resposta, aprofunda
  - Ramo A (problema ativo): "Entendo. Quantas horas por semana você trabalha?"
  - Ramo B (está bem): "Que ótimo! E quanto você fatura por mês hoje?"

- [ ] **Mensagem 3 — Oferta:** Apresenta a solução contextualizada
  - "Perfeito. Tenho algo que pode resolver exatamente isso: [produto]
    por [preço]. Quer que eu te mande o link?"

- [ ] **Mensagem 4 — CTA:** Link direto para checkout
  - "Aqui está: [link]. Só até domingo à meia-noite."

- [ ] **Fallback:** Se não responder em 24h → reengajamento automático
  - "Ei, você ainda pensa em [problema]? Só avisando que encerra hoje."

### Step 6: Montar Campanha Completa

- [ ] Reunir headline + emails + criativos + ManyChat em campanha-{semana}.md
- [ ] Verificar consistência de mensagem em todas as peças
- [ ] Verificar que escassez é a MESMA em todos os canais (mesmo prazo)
- [ ] Verificar calendário: segunda (email 1) / quarta (email 2) / domingo (email 3)
- [ ] Adicionar checklist de execução semanal

---

## Acceptance Criteria

A task está completa quando TODOS os critérios são atendidos:

- [ ] **AC-1:** Gatilho definido e consistente em todas as peças
- [ ] **AC-2:** Headline principal criada com Hook→Punch→Premissa
- [ ] **AC-3:** Email 1 (abertura segunda) com CTA específico
- [ ] **AC-4:** Email 2 (conteúdo quarta) com demonstração de valor
- [ ] **AC-5:** Email 3 (escassez domingo) com prazo REAL (NO-H006)
- [ ] **AC-6:** 5 criativos Instagram (2 Stories + 2 Feed + 1 Reels)
- [ ] **AC-7:** Script ManyChat com 4 mensagens (abertura + qualificação + oferta + CTA)
- [ ] **AC-8:** Sentimentos variados nos criativos (Andromeda / NO-H014)
- [ ] **AC-9:** Calendário de execução semanal documentado

---

## Veto Conditions

| Veto | Heurística | Descrição |
|------|-----------|-----------|
| V1 | — | SE email sem call-to-action → BLOCK. Todo email precisa de CTA. |
| V2 | NO-H006 | SE email 3 (domingo) sem escassez real → BLOCK. Escassez falsa = queima de lista. |
| V3 | NO-H014 | SE todos os criativos com mesmo sentimento → BLOCK. Mínimo 3 sentimentos distintos. |
| V4 | NO-H005 | SE email 1 sem recomendação de horário 11h → ALERTA. |
| V5 | — | SE ManyChat sem qualificação → BLOCK. Script sem qualificação = spam. |
| V6 | — | SE campanha sem calendário de execução → BLOCK. Quando postar cada peça? |

---

## Quality Gate

```yaml
quality_gate:
  id: "QG-VTD-CAMPANHA"
  name: "Copy Campanha Quality Gate"
  placement: "exit"
  type: "hybrid"
  severity: "blocking"

  criteria:
    - check: "3 emails completos (segunda, quarta, domingo)"
      type: "count"
      value: 3
      operator: ">="
      weight: 3
    - check: "5 criativos Instagram (2S+2F+1R)"
      type: "count"
      value: 5
      operator: ">="
      weight: 2
    - check: "Script ManyChat com 4 mensagens"
      type: "count"
      value: 4
      operator: ">="
      weight: 2
    - check: "Escassez real no email de domingo"
      type: "boolean"
      weight: 3

  thresholds:
    pass: 9
    review: 6
    fail: 4

  pass_action:
    - "Entregar campanha-{semana}.md"
    - "Incluir checklist de execução semanal"
  fail_action:
    - "Completar peças faltantes"
    - "Revisar CTA em todos os emails"
```

---

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | Execução manual pelo usuário |
| **Trigger** | Campanha completa entregue |
| **Executor** | Humano (agenda emails, sobe criativos, configura ManyChat) |

### Handoff Checklist

- [ ] Campanha completa em campanha-{semana}.md
- [ ] Emails prontos para copiar/colar na ferramenta de email
- [ ] Criativos descritos com copy e formato
- [ ] Script ManyChat pronto para configurar
- [ ] Calendário de execução claro

### Handoff Package

- **campanha-{semana}.md**: Campanha completa
- **emails-semana.md**: 3 emails formatados
- **criativos-instagram.md**: 5 criativos com copy e especificações
- **script-manychat.md**: Fluxo de DM completo

---

## Output Example

```markdown
## Campanha Semana 1 Março — Gatilho: Status (6)
**Produto:** Mentoria Precificação | **Ticket:** R$297

### Headline Principal
**Hook:** "Confeiteiras que cobram mais também vendem mais — e aqui está o motivo"
**Punch:** "Preço baixo não atrai cliente. Atrai quem não tem dinheiro."
**Premissa:** "Método de posicionamento para cobrar 3x mais sem perder clientes"

### Email 1 — Segunda 11h
**Assunto:** Ela cobrava R$14,90 o bolo. Hoje cobra R$140.
[...]
**CTA:** Quero aprender esse reposicionamento →

### Email 3 — Domingo 20h
**Assunto:** Última chance — Mentoria Precificação encerra hoje
[...]
**CTA:** Ainda tenho X vagas. Última chance →

### ManyChat — Abertura
"Oi! 👋 Vi que você se interessou por precificação.
Me conta: hoje você cobra o preço que quer cobrar?"
```

---

## Error Handling

### Cenário: Gatilho e público desalinhados
- **Trigger:** Gatilho escolhido não ressoa com a dor do público
- **Detection:** Step 1 — análise de alinhamento
- **Recovery:** Sugerir gatilho mais alinhado com exemplos. Usuário confirma.
- **Prevention:** Apresentar os 7 gatilhos com exemplos de público ideal para cada.

### Cenário: Produto sem resultado tangível
- **Trigger:** Produto descrito de forma vaga ("te ajuda a crescer")
- **Detection:** Step 2 — criação da headline
- **Recovery:** Elicitar resultado específico: "Em quanto tempo? Qual métrica muda?"
- **Prevention:** Copy precisa de resultado tangível para funcionar.

### Cenário: Escassez não tem prazo real
- **Trigger:** Usuário quer "colocar escassez" mas sem data definida
- **Detection:** Step 3 — Email 3
- **Recovery:** BLOQUEAR. Definir prazo real antes de prosseguir.
- **Prevention:** Escassez falsa queima a lista. Melhor sem escassez do que com escassez falsa.

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-21_
_Compliant: Yes_
