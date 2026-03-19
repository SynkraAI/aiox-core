# Task: Write Email Sequence

**Task ID:** write-email-sequence
**Executor:** Agent (gary-halbert OR joanna-wiebe)
**Execution Type:** Agent
**Quality Gate:** QG-003
**Template:** templates/email-sequence-tmpl.md

---

## Purpose

Escrever uma sequencia de emails de alta conversao, desde welcome ate venda, usando principios de direct response e VoC.

---

## Inputs

| Input         | Required    | Description                                             |
| ------------- | ----------- | ------------------------------------------------------- |
| product       | Yes         | Produto/servico sendo vendido                           |
| market        | Yes         | Publico-alvo                                            |
| diagnosis     | Recommended | Output do diagnose-market                               |
| sequence_type | Yes         | Tipo: welcome, launch, nurture, cart-abandon, re-engage |
| num_emails    | No          | Quantidade (default: 7)                                 |
| testimonials  | No          | Depoimentos de clientes                                 |

---

## Steps

1. **Review Diagnosis** - Ler output do diagnose-market
2. **Load Template** - Carregar email-sequence-tmpl.md
3. **Define Sequence Arc** - Mapear arco emocional da sequencia
4. **Write Subject Lines** - 3+ variacoes por email
5. **Write Email 1** - Welcome/Hook (confianca + curiosidade)
6. **Write Email 2** - Story (identificacao + autoridade)
7. **Write Email 3** - Value (ensinar algo util)
8. **Write Email 4** - Problem (amplificar dor)
9. **Write Email 5** - Mechanism (revelar o "por que")
10. **Write Email 6** - Proof (social proof + resultados)
11. **Write Email 7** - Offer (CTA principal + urgencia)
12. **Deterministic Pre-Check (textstat + LeIA)** - Para CADA email:
   - **Subject line**: textstat.char_count() <= 50, LeIA |compound| >= 0.2 (curiosidade ou tensao)
   - **Body**: Flesch >= 55, avg sentence <= 15 words, reading time <= 3min por email
   - **LeIA por email** (arco emocional da sequencia):
     - Email 1 (Welcome): compound entre 0.1 e 0.4 (confianca + curiosidade)
     - Email 2 (Story): compound entre -0.2 e 0.2 (identificacao)
     - Email 3 (Value): compound > 0.1 (positivo — ensinando)
     - Email 4 (Problem): compound < -0.2 (dor amplificada)
     - Email 5 (Mechanism): compound entre 0.0 e 0.3 (esperanca)
     - Email 6 (Proof): compound > 0.2 (positivo — resultados)
     - Email 7 (Offer): compound > 0.1 (positivo + urgencia)
   - **Arco da sequencia**: Se emails consecutivos tem mesmo tom (ex: 3 positivos seguidos) = ALERTA "Arco flat"
   - Resultado: tabela com metrica por email + arco emocional visual
13. **Self-Review** - Checklist pre-Torriani + resultados do pre-check
14. **Handoff** - Enviar para @oraculo-torriani

---

## Acceptance Criteria

- [ ] Subject lines com curiosidade (nao clickbait)
- [ ] Email 1 cria confianca e loop aberto
- [ ] Arco emocional coerente (nao repetitivo)
- [ ] Cada email tem UMA mensagem principal
- [ ] CTA claro em cada email (nao necessariamente venda)
- [ ] PS presente em todos (Halbert Rule)
- [ ] VoC presente (linguagem do publico)
- [ ] Urgencia real no email final
- [ ] Zero cliches de coach
