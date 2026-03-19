# Task: Write Landing Page

**Task ID:** write-landing-page
**Executor:** Agent (joanna-wiebe)
**Execution Type:** Agent
**Quality Gate:** QG-003

---

## Purpose

Escrever copy para landing page de captura ou conversao, otimizada para um unico objetivo (lead ou venda), usando VoC e conversion copywriting.

---

## Inputs

| Input          | Required    | Description                                          |
| -------------- | ----------- | ---------------------------------------------------- |
| product        | Yes         | Produto/servico ou lead magnet                       |
| market         | Yes         | Publico-alvo                                         |
| goal           | Yes         | Objetivo: lead capture, sales, webinar signup, trial |
| diagnosis      | Recommended | Output do diagnose-market                            |
| traffic_source | Recommended | De onde vem o trafego (ad, email, organic)           |

---

## Steps

1. **Review Diagnosis** - Awareness level do trafego
2. **Define Page Goal** - UM objetivo, UMA acao
3. **Write Headline** - Beneficio + especificidade
4. **Write Sub-headline** - Expandir promessa
5. **Write Hero Section** - Headline + sub + CTA above the fold
6. **Write Problem Section** - VoC da dor (message mining)
7. **Write Solution Section** - Mecanismo ou beneficios
8. **Write Proof Section** - Testimonials, numeros, logos
9. **Write CTA Section** - Botao + texto de suporte
10. **Write Objection Handlers** - FAQ ou secao de objecoes
11. **Deterministic Pre-Check (textstat + LeIA)** - Por secao:
   - **Hero (headline + sub)**: Flesch >= 60, LeIA |compound| >= 0.3 (impacto emocional)
   - **Problem Section**: LeIA compound < -0.1 (dor), Flesch >= 55
   - **Solution Section**: LeIA compound > 0.1 (positivo), avg sentence <= 15 words
   - **Proof Section**: LeIA compound > 0.2 (confianca), Flesch >= 55
   - **CTA Section**: LeIA compound > 0.2 (acao), Flesch >= 65 (ultra-claro)
   - **Full page**: reading time <= 3min (landing = rapida), Flesch >= 55
   - Se hero tem neu > 0.7 = ALERTA: "Hero sem impacto emocional = bounce alto"
12. **Conversion Audit** - Wiebe's 5 checks + resultados do pre-check
13. **Handoff** - Enviar para @oraculo-torriani

---

## Wiebe's Conversion Checks

1. **Clarity** - Visitante entende em 5 segundos?
2. **Relevance** - Congruente com a fonte de trafego?
3. **Value** - Beneficio claro e desejavel?
4. **Anxiety** - Elementos de confianca presentes?
5. **Distraction** - Apenas UM CTA, sem links externos?

---

## Acceptance Criteria

- [ ] UM objetivo claro por pagina
- [ ] Headline visivel above the fold
- [ ] CTA acima e abaixo da dobra
- [ ] VoC presente (palavras do publico)
- [ ] Prova social incluida
- [ ] Zero links de saida (exceto CTA)
- [ ] Congruente com fonte de trafego
- [ ] Wiebe's 5 checks passaram
- [ ] Zero cliches de coach
