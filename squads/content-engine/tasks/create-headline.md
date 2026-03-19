# Task: Create Headlines

**Task ID:** create-headline
**Executor:** Agent (claude-hopkins OR david-ogilvy)
**Execution Type:** Agent
**Quality Gate:** QG-002
**Template:** templates/headline-formulas-tmpl.md

---

## Purpose

Criar headlines de alta conversao usando principios cientificos (Hopkins) e criativos (Ogilvy). Headlines sao 80% do trabalho de qualquer peca de copy.

---

## Inputs

| Input         | Required | Description                                         |
| ------------- | -------- | --------------------------------------------------- |
| product       | Yes      | Produto/servico                                     |
| market        | Yes      | Publico-alvo                                        |
| type          | Yes      | Tipo: sales page, email subject, ad, blog, VSL hook |
| benefit       | Yes      | Beneficio principal                                 |
| mechanism     | No       | Mecanismo unico (se definido)                       |
| num_headlines | No       | Quantidade (default: 10)                            |

---

## Steps

1. **Review Context** - Produto, mercado, tipo, beneficio
2. **Load Formulas** - Carregar headline-formulas-tmpl.md
3. **Generate Category 1** - Beneficio direto (5+ variacoes)
4. **Generate Category 2** - Curiosidade (5+ variacoes)
5. **Generate Category 3** - Prova/numeros (5+ variacoes)
6. **Generate Category 4** - Preemptive claims (3+ variacoes)
7. **Apply Hopkins Filter** - Especificidade, razao, testabilidade
8. **Apply Ogilvy Filter** - Clareza, promessa, seleção de audiencia
9. **Deterministic Scoring (textstat + LeIA)** - Para CADA headline:
   - **Script `copy-pre-check.py` valida** (automático):
     - `textstat.flesch_reading_ease(headline)` — threshold >= 60
     - `LeIA |compound|` >= 0.3 (carga emocional mínima)
     - Headlines com Flesch < 50 = eliminadas automaticamente
   - **Agente LLM valida** (manual, por categoria):
     - Benefício: compound > 0.2 (positivo)
     - Curiosidade: |compound| < 0.3 (neutro intencional — cria gap)
     - Prova/números: compound > 0.1 (levemente positivo)
     - Preemptive: compound < -0.1 (negativo — ataca objeção)
     - Headlines com mismatch categoria x emoção = flag ALERTA
10. **Rank Top 10** - Ordenar por: (score subjetivo × 0.6) + (score textstat × 0.2) + (match LeIA × 0.2)
11. **Suggest Test Plan** - Quais testar primeiro e como

---

## Headline Quality Checklist (Hopkins + Ogilvy)

- [ ] Contem beneficio claro?
- [ ] Seleciona a audiencia certa?
- [ ] Tem numero especifico?
- [ ] Gera curiosidade sem clickbait?
- [ ] Funciona sozinha (sem body copy)?
- [ ] E testavel (A/B)?
- [ ] Preemptive claim aplicavel?

---

## Acceptance Criteria

- [ ] Minimo 10 headlines geradas
- [ ] 4 categorias cobertas (beneficio, curiosidade, prova, preemptive)
- [ ] Cada headline passa no checklist de qualidade
- [ ] Top 3 rankeadas com justificativa
- [ ] Plano de teste sugerido
- [ ] Zero cliches genericos
