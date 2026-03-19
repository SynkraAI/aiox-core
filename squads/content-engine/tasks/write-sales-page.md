# Task: Write Sales Page

**Task ID:** write-sales-page
**Executor:** Agent (gary-halbert OR stefan-georgi)
**Execution Type:** Agent
**Quality Gate:** QG-003
**Template:** templates/sales-page-tmpl.md

---

## Purpose

Escrever uma sales page completa de alta conversao seguindo os principios de direct response.

---

## Inputs

| Input           | Required    | Description                   |
| --------------- | ----------- | ----------------------------- |
| product         | Yes         | Produto/servico sendo vendido |
| market          | Yes         | Publico-alvo                  |
| diagnosis       | Recommended | Output do diagnose-market     |
| price           | Yes         | Preco e opcoes de pagamento   |
| guarantee       | Yes         | Tipo e prazo da garantia      |
| testimonials    | Recommended | Depoimentos de clientes       |
| competitor_urls | No          | URLs de concorrentes          |

---

## Steps

1. **Review Diagnosis** - Ler output do diagnose-market (awareness + sophistication)
2. **Load Template** - Carregar sales-page-tmpl.md
3. **Define Mechanism** - Nomear e documentar mecanismo unico
4. **Write Headline Set** - 5+ variacoes de headline
5. **Write Lead** - Escolher tipo (Story/Problem/Secret) e escrever
6. **Write Problem Amplification** - 3 camadas de dor
7. **Write Mechanism Reveal** - Explicar o "por que funciona"
8. **Write Proof Section** - Credibilidade + testimonials
9. **Build Offer Stack** - Usando offer-stack-tmpl.md
10. **Write Guarantee** - Risk reversal
11. **Write CTA** - Call to action
12. **Write PS** - Minimo 1 PS (obrigatorio - Halbert Rule)
13. **Deterministic Pre-Check (textstat + LeIA)** - Analisar por secao:
   - **Headline**: Flesch >= 55, LeIA |compound| >= 0.3
   - **Lead**: Flesch >= 50, LeIA compound < -0.1 (tensao/dor)
   - **Problem Amplification**: LeIA compound < -0.2 (dor forte), avg sentence <= 15 words
   - **Mechanism Reveal**: LeIA compound entre -0.1 e 0.3 (neutro→positivo = esperanca)
   - **Offer Stack**: Flesch >= 55 (clareza), LeIA compound > 0.1 (positivo)
   - **CTA**: LeIA compound > 0.2 (positivo/acao), Flesch >= 60 (ultra-claro)
   - **PS**: LeIA |compound| >= 0.2 (emocional — PS precisa de punch)
   - Arco emocional esperado: negativo → mais negativo → neutro → positivo → positivo forte
   - Se arco esta invertido ou flat = ALERTA com secao especifica
14. **Self-Review** - Checklist pre-Torriani + resultados do pre-check
15. **Handoff** - Enviar para @oraculo-torriani

---

## Acceptance Criteria

- [ ] Headline com beneficio + numero/prazo
- [ ] Lead abre com tensao
- [ ] Mecanismo unico nomeado e visual
- [ ] Dor em cena viva (VoC)
- [ ] Offer stack com valor empilhado
- [ ] Garantia clara
- [ ] CTA binario e especifico
- [ ] PS presente (obrigatorio)
- [ ] Zero cliches de coach
- [ ] Copy proprietaria (teste do concorrente)
