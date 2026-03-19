# Framework Primario: Lean Analytics (OMTM + 5 Stages)

**Type:** Primary Operating Framework
**Agent:** @kaizen:alistair-croll
**Status:** Validado por milhares de startups desde 2013

## Overview

O sistema operacional de Alistair Croll e construido sobre duas camadas: o OMTM como disciplina de foco radical, e os 5 Business Stages como mapa de navegacao. O OMTM responde "no que focar agora." Os 5 Stages respondem "onde estamos e para onde ir." Juntos, transformam medicao de exercicio de vaidade em motor de decisao.

## Framework 1: One Metric That Matters (OMTM)

### Definicao

Em qualquer momento, existe UMA metrica que importa mais que todas as outras. Foque nela obsessivamente. Quando ela atingir o threshold de saida do estagio atual, mude o OMTM para o proximo estagio.

### As 4 Propriedades de Uma Boa Metrica

```text
1. COMPARATIVA
   - Permite comparar periodos: "retencao melhorou 15% vs. mes anterior"
   - Permite comparar cohorts: "usuarios de Janeiro retém 2x mais que de Marco"
   - Permite comparar segmentos: "enterprise retém 3x mais que SMB"
   - Numero absoluto NAO e comparativo: "temos 10.000 usuarios" nao diz nada

2. COMPREENSIVEL
   - Toda a equipe entende sem explicacao tecnica
   - Se precisa de 5 minutos para explicar a metrica, e complexa demais
   - Teste: pergunte a 3 pessoas da equipe o que a metrica significa

3. RATIO OU RATE
   - Ratios contextualizam: "30% de retencao" > "3.000 usuarios retidos"
   - Rates mostram velocidade: "crescimento de 15%/mes" > "ganhamos 500 usuarios"
   - Numeros absolutos sao quase sempre metricas vaidade
   - Excecao: revenue absoluto (MRR) quando combinado com growth rate

4. MUDA COMPORTAMENTO
   - A propriedade MAIS importante
   - Teste: "se essa metrica melhorar 20%, mudamos algo no que fazemos?"
   - Se a resposta e "nao" ou "nao sei" — NAO e sua metrica
   - Metricas que mudam comportamento criam accountability e foco
```

### Vanity vs. Actionable Metrics

| Vanity Metric | Actionable Alternative |
|---------------|----------------------|
| Total users | Active users (DAU/MAU ratio) |
| Page views | Engagement rate ou time-on-page |
| Total downloads | Activation rate (download -> core action) |
| Followers | Engagement rate per post |
| Revenue (absoluto) | Revenue per user, LTV/CAC ratio |
| Features shipped | Feature adoption rate |
| Total signups | Signup-to-activation conversion |
| Emails sent | Email open rate x click-through rate |

### OMTM Selection Process (Step-by-Step)

**Step 1:** Identifique seu estagio atual (Empathy → Stickiness → Virality → Revenue → Scale)

**Step 2:** Liste 3-5 metricas candidatas para o estagio

**Step 3:** Score cada candidata nas 4 propriedades (0-4)

**Step 4:** Valide a top candidata com a equipe: "se melhorar 20%, o negocio melhora?"

**Step 5:** Estabeleca baseline (7 dias de medicao sem intervencao)

**Step 6:** Otimize com experimentos de 7-14 dias, um por vez

---

## Framework 2: The 5 Business Stages

### Mapa Completo

```text
[EMPATHY] → [STICKINESS] → [VIRALITY] → [REVENUE] → [SCALE]
   |              |              |             |            |
   v              v              v             v            v
"O problema    "O produto    "Usuarios     "A conta     "Crescemos
 existe?"      retém?"       trazem        fecha?"      eficiente-
                             outros?"                    mente?"
```

### Stage 1: Empathy

**Objetivo:** Validar que o problema existe e e doloroso o suficiente para pagar por solucao.

| Aspecto | Detalhe |
|---------|---------|
| Foco | Qualitativo, nao quantitativo |
| Metodo | Entrevistas, observacao, prototipos de papel |
| OMTM | Problem validation rate (qualitativo) |
| Exit criteria | 20+ entrevistas com padroes claros de dor |
| Duracao tipica | 2-8 semanas |
| Erro fatal | Construir produto antes de validar problema |

**Perguntas-chave:**
- "Me conte a ultima vez que voce teve esse problema."
- "O que voce fez para resolver?"
- "Quanto voce pagaria para nao ter mais esse problema?"

### Stage 2: Stickiness

**Objetivo:** Construir produto que as pessoas usam E voltam para usar.

| Aspecto | Detalhe |
|---------|---------|
| Foco | Retencao e engagement com funcao core |
| Metodo | MVP, analytics de retencao, cohort analysis |
| OMTM | Retention rate (D7 ou D30) |
| Exit criteria | Retencao D30 >= 20%, estavel ou crescente |
| Duracao tipica | 2-6 meses |
| Erro fatal | Investir em aquisicao antes de ter retencao |

**Exercicio "Aha Moment":**
1. Identifique a acao core do produto (a coisa #1 que usuarios fazem)
2. Compare retencao de quem completou a acao core vs. quem nao completou
3. Se a diferenca e > 2x, voce encontrou seu "aha moment"
4. Otimize o caminho ate essa acao (onboarding, UX, prompts)

### Stage 3: Virality

**Objetivo:** Usuarios existentes trazem novos usuarios organicamente.

| Aspecto | Detalhe |
|---------|---------|
| Foco | Mecanismos de referral e compartilhamento natural |
| Metodo | Referral programs, social features, NPS |
| OMTM | Viral coefficient (K-factor) |
| Exit criteria | K > 0.5, growth organico sustentavel |
| Duracao tipica | 2-4 meses |
| Erro fatal | Forcar viralidade com incentivos em produto nao-sticky |

**Formula do Viral Coefficient:**
```text
K = i * c
  i = numero de convites enviados por usuario
  c = taxa de conversao dos convites

  K > 1.0 = crescimento viral (cada usuario traz mais que 1)
  K = 0.5-1.0 = crescimento amplificado (ajuda, mas nao autossuficiente)
  K < 0.5 = sem viralidade significativa
```

### Stage 4: Revenue

**Objetivo:** Monetizacao sustentavel com unit economics positiva.

| Aspecto | Detalhe |
|---------|---------|
| Foco | Pricing, LTV, CAC, unit economics |
| Metodo | Pricing experiments, cohort LTV analysis |
| OMTM | LTV/CAC ratio ou Net Revenue Retention |
| Exit criteria | LTV/CAC > 3x, CAC payback < 12 meses |
| Duracao tipica | 3-6 meses |
| Erro fatal | Crescer receita topline sem unit economics positiva |

**Unit Economics Checklist:**
- [ ] LTV calculado por cohort (nao media geral)
- [ ] CAC inclui TODOS os custos de aquisicao
- [ ] LTV/CAC > 3x
- [ ] CAC payback < 12 meses
- [ ] Net Revenue Retention > 100% (expansion > churn)

### Stage 5: Scale

**Objetivo:** Crescer de forma sustentavel e eficiente.

| Aspecto | Detalhe |
|---------|---------|
| Foco | Eficiencia de crescimento, novos segmentos |
| Metodo | Channel optimization, market expansion |
| OMTM | Growth efficiency ratio ou CAC payback |
| Exit criteria | Crescimento sustentavel com margem |
| Duracao tipica | Continuo |
| Erro fatal | Escalar antes de ter PMF e unit economics |

---

## Framework 3: Lean Analytics Cycle

### O Ciclo

```text
[HYPOTHESIS] → [METRIC] → [EXPERIMENT] → [LEARN] → [DECIDE]
      ^                                                  |
      |                                                  |
      +------ ITERATE / PIVOT / PERSEVERE ---------------+
```

### Regras do Ciclo

1. **Hipotese antes de metrica.** Nunca meça sem saber por que.
2. **Uma hipotese por experimento.** Isole variaveis. Uma mudanca por vez.
3. **Defina "sucesso" ANTES.** Se o threshold nao e predefinido, voce vai racionalizar qualquer resultado.
4. **Ciclos curtos.** 7-14 dias. Quanto mais longo, mais bias de confirmacao.
5. **Registro explicito.** Documente: hipotese, metrica, threshold, resultado, aprendizado, proxima acao.

### Template de Experimento

```text
HIPOTESE: "Se fizermos [mudanca], esperamos que [metrica] melhore [X%] em [Y dias]."
METRICA: [nome da metrica]
BASELINE: [valor atual]
TARGET: [valor esperado]
DURACAO: [dias]
RESULTADO: [valor obtido]
APRENDIZADO: [o que aprendemos]
DECISAO: [ITERAR | PIVOTAR | PERSEVERAR]
```

---

## Integration: Como os Frameworks se Conectam

```text
5 Business Stages (onde estamos?) →
  OMTM Selection (o que medir?) →
    Lean Analytics Cycle (como melhorar?) →
      Stage Transition (avancamos?) →
        New OMTM (ciclo recomeça)
```

Os Stages definem ONDE voce esta. O OMTM define NO QUE focar. O Lean Analytics Cycle define COMO melhorar. Quando o OMTM atinge o threshold de saida, voce avanca de estagio e seleciona novo OMTM. O ciclo nunca para.

---

**Source:** AC Mind DNA - Operational Frameworks
