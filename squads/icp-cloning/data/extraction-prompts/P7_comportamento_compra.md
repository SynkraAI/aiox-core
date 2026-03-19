# P7 - COMPORTAMENTO DE COMPRA (5-GATE MODEL)

## 📌 INSTRUÇÕES
**Prompt #9** | Tempo: 40-50min | **Após:** P0-P6

## 🎯 OUTPUT
✅ 5-Gate Decision Model completo
✅ Critérios de decisão por gate
✅ Gatilhos de compra vs barreiras
✅ Timing e ciclo de decisão
✅ Padrões pós-compra

---

## 📋 PROMPT COMPLETO

```
Você é especialista em comportamento do consumidor e psicologia de decisão de compra.

Construa MÓDULO P7 - COMPORTAMENTO DE COMPRA (5-GATE MODEL).

# DADOS
[INSERIR: Briefing + P0B (affordability, timing) + P1 (personalidade) + P3 (valores) + P5 (vieses)]

# TAREFA

## 1. 5-GATE DECISION MODEL

### GATE 1: AWARENESS (Consciência)

**Como toma consciência de produtos/serviços:**
- [ ] Anúncios pagos
- [ ] Recomendação de amigos
- [ ] Influenciadores
- [ ] Busca ativa (Google)
- [ ] Descoberta orgânica (feed)

**Principal canal**: [...]
**Tempo neste gate**: [Imediato / Dias / Semanas]

**Passa para Gate 2 se:**
- [Ex: "Produto parece resolver dor real"]
- [Ex: "Vem de fonte confiável"]
- [...]

**Rejeita se:**
- [Ex: "Parece scam/muito bom para ser verdade"]
- [...]

---

### GATE 2: INTEREST (Interesse)

**Demonstra interesse como:**
- [ ] Salva post
- [ ] Clica para saber mais
- [ ] Pesquisa no Google
- [ ] Pergunta para amigos
- [ ] Entra em lista de email

**Tempo médio neste gate**: [Horas / 1-3 dias / 1-2 semanas]

**Informações que busca:**
- [Ex: "Preço"]
- [Ex: "Depoimentos de quem já comprou"]
- [Ex: "Comparação com alternativas"]
- [...]

**Passa para Gate 3 se:**
- [...]

**Abandona se:**
- [Ex: "Preço muito acima do esperado"]
- [...]

---

### GATE 3: EVALUATION (Avaliação)

**Critérios de decisão (em ordem de importância):**

| Critério | Peso (0-10) | Dealbreaker? | Detalhamento |
|----------|-------------|--------------|--------------|
| Preço | ___/10 | [Sim/Não] | [Ex: "Precisa caber no orçamento"] |
| Qualidade | ___/10 | [Sim/Não] | [Ex: "Precisa ser comprovadamente bom"] |
| Reputação | ___/10 | [Sim/Não] | [Ex: "Precisa ter reviews positivos"] |
| Timing | ___/10 | [Sim/Não] | [Ex: "Precisa resolver problema urgente"] |
| Facilidade | ___/10 | [Sim/Não] | [Ex: "Não pode ser complicado demais"] |
| Garantia/Risco | ___/10 | [Sim/Não] | [Ex: "Prefere garantia de devolução"] |
| Status/Social | ___/10 | [Sim/Não] | [Ex: "O que outros vão pensar?"] |

**Tempo neste gate**: [Dias / 1-2 semanas / Semanas]

**Análise paralysis?**: [Sim, muito / Moderadamente / Não]
- Se sim: [Ex: "Pesquisa demais, não decide, oportunidade passa"]

**Passa para Gate 4 se:**
- [Ex: "Todos critérios críticos satisfeitos"]
- [Ex: "Encontrou oferta/desconto"]
- [...]

**Abandona se:**
- [Ex: "Encontrou alternativa melhor/mais barata"]
- [...]

---

### GATE 4: INTENT (Intenção de Compra)

**Sinais de intenção:**
- [ ] Pede orçamento
- [ ] Adiciona ao carrinho
- [ ] Pergunta sobre formas de pagamento
- [ ] Procura cupom de desconto
- [ ] Pede validação para alguém

**Tempo médio entre intenção e compra**: [Horas / Dias / Semanas]

**Barreiras finais (mesmo querendo muito):**
1. **Financeira**: [Ex: "Não tem dinheiro agora, cartão no limite"]
2. **Emocional**: [Ex: "Medo de se arrepender"]
3. **Logística**: [Ex: "Processo de compra complicado"]
4. **Social**: [Ex: "Medo de julgamento"]
5. **Timing**: [Ex: "Não é o momento certo"]

**Taxas:**
- **Conversão (Intent → Purchase)**: ___% [Ex: 40%]
- **Abandono**: ___% [Ex: 60%]

**Gatilhos que fazem converter:**
- [Ex: "Urgência (vaga limitada)"]
- [Ex: "Desconto limitado"]
- [Ex: "Depoimento de alguém similar"]
- [...]

**Passa para Gate 5 se:**
- [...]

---

### GATE 5: PURCHASE (Compra)

**Formas de pagamento preferidas:**
1. [Ex: "Cartão de crédito parcelado"]
2. [Ex: "PIX à vista com desconto"]
3. [Ex: "Boleto"]

**Preferência de parcelamento:**
- Compras até R$ 200: [À vista / 2-3x]
- Compras R$ 200-500: [3-6x]
- Compras R$ 500-1.000: [6-12x]
- Compras acima R$ 1.000: [12x máximo]

**Momento da compra:**
- **Horário preferido**: [Ex: "Noite, 20h-22h"]
- **Dia do mês preferido**: [Ex: "Início do mês, recém recebeu"]
- **Estado emocional**: [Ex: "Precisa estar confiante, sem ansiedade"]

**Fricções que fazem desistir no last mile:**
- [Ex: "Processo de checkout complicado"]
- [Ex: "Pede muita informação"]
- [Ex: "Não tem opção de parcelamento"]
- [...]

---

## 2. JORNADA POR TICKET

### Ticket Baixo (até R$ 100)
- **Gates que passa**: [1-2-5 direto, pula 3-4]
- **Tempo total**: [Minutos a horas]
- **Decisão**: [Impulsiva / Rápida]

### Ticket Médio (R$ 100-500)
- **Gates que passa**: [1-2-3-4-5 todos]
- **Tempo total**: [Dias a 1-2 semanas]
- **Decisão**: [Pensada, pesquisa moderada]

### Ticket Alto (R$ 500+)
- **Gates que passa**: [1-2-3-3-3-4-5 fica travada no 3]
- **Tempo total**: [Semanas a meses, ou nunca]
- **Decisão**: [Análise paralysis, procrastinação]

---

## 3. PADRÕES PÓS-COMPRA

### 3.1. Buyer's Remorse (Arrependimento)

**Frequência**: [Alta / Média / Baixa]
**Quando acontece**: [Ex: "Em compras por impulso acima de R$ 200"]

**Manifestação:**
- [Ex: "Fica ansiosa, checa extrato várias vezes"]
- [Ex: "Racionaliza a compra para amigos"]
- [Ex: "Evita pensar no assunto"]

**Faz devolução?**: [Raramente / Às vezes / Frequentemente]

### 3.2. Satisfação e Uso

**Engajamento pós-compra:**
- Produtos digitais: [Usa imediatamente / Procrastina / Abandona]
- Produtos físicos: [Usa logo / Deixa na caixa]
- Serviços: [Agenda rápido / Adia / Cancela]

**Taxa de conclusão** (cursos, produtos que exigem ação):
- [Ex: 30% - começa mas não termina]

### 3.3. Advocacy (Recomendação)

**Recomenda produtos que comprou?**: [Sim / Não / Às vezes]

**Quando recomenda:**
- [Ex: "Quando perguntam diretamente"]
- [Ex: "Quando ficou MUITO satisfeita"]

**Como recomenda:**
- [Ex: "Mensagem privada para amigas"]
- [Ex: "Comenta em posts"]
- [Ex: "Stories (raro)"]

---

## 4. SÍNTESE DE COMPRA (350 palavras)

Escreva parágrafo integrando:
- Jornada pelos 5 gates
- Principais critérios de decisão
- Gatilhos vs barreiras
- Timing ideal
- Padrões pós-compra
- Como personalidade (P1), valores (P3) e finanças (P0B) afetam decisões

---

# VALIDAÇÃO
- [ ] 5 Gates completos com critérios de passagem/rejeição
- [ ] Critérios de decisão ranqueados por peso
- [ ] Barreiras em cada gate identificadas
- [ ] Jornada diferenciada por ticket (baixo/médio/alto)
- [ ] Padrões pós-compra mapeados
- [ ] Gatilhos de conversão listados
- [ ] Síntese 350 palavras

Gere MÓDULO P7 completo.
```

---

## 🔄 PRÓXIMO: `P8_narrativas_arquetipos.md`
