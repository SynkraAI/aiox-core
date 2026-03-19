# Task: Avaliar Deal/Parceria

**Task ID**: evaluate-deal
**Agent**: @board-orchestrator
**Version**: 1.0.0

---

## Purpose

Avaliar uma oportunidade de parceria ou sociedade usando as 3 lentes do board, com foco especial na estruturação de deal (Naval), matemática de receita (Hormozi) e posicionamento estratégico (Thiel).

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `partner_name` | string | Yes | Nome da pessoa/empresa | "Carlos Eduardo" |
| `partner_profile` | string | Yes | O que a pessoa faz, audiência, faturamento | "Coach de carreira, 30k seguidores, R$15k/mês" |
| `deal_structure` | string | Yes | Como seria a parceria | "Eu analiso genius zone + crio estratégia, ele executa, 40/60" |
| `your_contribution` | string | Yes | O que você entrega | "Genius zone analysis + AIOS strategy + content framework" |
| `expected_revenue` | string | No | Estimativa de receita gerada | "R$30k/mês em 90 dias" |
| `genius_zone_data` | path | No | Análise de genius zone se já existir | `outputs/mentorias/{slug}/phase-1/` |

---

## Workflow

### Step 1: Coleta de Dados do Deal

```markdown
## Deal Brief
- **Parceiro:** [nome + perfil]
- **Modelo:** [como funciona a parceria]
- **Sua contribuição:** [o que você entrega]
- **Contribuição do parceiro:** [o que ele entrega]
- **Split:** [% para cada lado]
- **Receita esperada:** [estimativa]
- **Duração:** [tempo definido ou indefinido]
- **Exit clause:** [como sair se não funcionar]
```

**Se dados faltando:** Perguntar antes de prosseguir.

### Step 2: Naval Ravikant - Análise de Leverage

```markdown
### Naval: Análise de Leverage do Deal

**Specific Knowledge Test:**
- O parceiro tem specific knowledge que não pode ser treinada?
- Você está aportando specific knowledge ou commodity skill?

**Leverage Test:**
- Este deal cria leverage (escala sem mais tempo)?
- Ou cria dependência (mais deals = mais tempo)?

**Equity Thinking:**
- O split reflete o valor real de cada contribuição?
- Quem fica com o upside assimétrico?

**Long-term Game:**
- Você jogaria este jogo por 10 anos com esta pessoa?
- A reputação do parceiro amplifica ou dilui a sua?
```

### Step 3: Alex Hormozi - Matemática do Deal

```markdown
### Hormozi: Unit Economics do Deal

**Value Equation do Parceiro:**
- Dream Outcome do cliente final: [o que ele quer]
- Perceived Likelihood com genius zone: [chance de resultado]
- Time Delay: [quanto demora para resultado]
- Effort & Sacrifice: [quanto esforço do cliente]

**Matemática:**
- Receita potencial mensal: R$ ___
- Seu % = R$ ___/mês
- Horas suas investidas: ___h/mês
- Valor/hora efetivo: R$ ___
- Comparação: Esse valor/hora > seu piso? (R$ ___/h)

**Scaling Test:**
- Quantos deals assim você aguenta simultaneamente?
- CAC de encontrar parceiros: R$ ___ (tempo + energia)
- LTV médio por parceria: R$ ___

**Offer Stack:**
- O que você entrega justifica o % pedido?
- Poderia cobrar mais? Menos?
```

### Step 4: Peter Thiel - Análise Contrarian

```markdown
### Thiel: Análise Monopolística do Deal

**Zero-to-One Test:**
- Este deal cria algo que não existia?
- Ou é mais do mesmo que qualquer consultor faria?

**Monopoly Question:**
- Sua contribuição (genius zone + AIOS) é replicável?
- Se sim, por quanto tempo você tem vantagem?

**Competition Avoidance:**
- Este deal te posiciona como único?
- Ou te coloca competindo com outros "estrategistas"?

**Contrarian Check:**
- O que a maioria faria neste deal? (provavelmente aceitar/rejeitar)
- O oposto é mais inteligente? Por quê?

**Secret:**
- Que verdade sobre este parceiro/mercado poucos entendem?
```

### Step 5: Convergência + Decisão do Agente Chefe

```markdown
### Convergência dos Conselheiros

| Critério | Naval | Hormozi | Thiel | Veredicto |
|----------|-------|---------|-------|-----------|
| Vale o tempo? | | | | |
| Escala? | | | | |
| É único? | | | | |
| Matemática fecha? | | | | |
| Long-term? | | | | |

### Elon Musk (Agente Chefe) - Decisão Final

**Veredicto:** ACEITAR / REJEITAR / RENEGOCIAR
**Condição:** [se renegociar, o que mudar]
**Ação:** [próximo passo concreto]
**Deadline:** [quando agir]
**Kill condition:** [quando abandonar se não funcionar]
```

### Step 6: Salvar

Salvar em `docs/logs/YYYY-MM-DD_board-deal-{partner_slug}.md`

---

## Deal Scoring (Quick Reference)

| Score | Significado | Ação |
|-------|------------|------|
| 3/3 conselheiros SIM | Deal excepcional | Executar HOJE |
| 2/3 SIM | Deal bom com ressalva | Executar com ajuste |
| 1/3 SIM | Deal questionável | Renegociar ou recusar |
| 0/3 SIM | Deal ruim | Recusar imediatamente |

---

## Success Criteria

- [ ] Todos os 3 conselheiros analisaram o deal
- [ ] Matemática calculada (valor/hora, LTV, CAC)
- [ ] Veredicto claro: ACEITAR / REJEITAR / RENEGOCIAR
- [ ] Se renegociar: termos específicos definidos
- [ ] Kill condition definida (quando abandonar)
- [ ] Sessão salva em docs/logs/

---

*Task v1.0.0 - Created: 2026-01-31*
