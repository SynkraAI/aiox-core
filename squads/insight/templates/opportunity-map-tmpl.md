# Mapa de Oportunidades — {{niche}} | {{city}}

**Data:** {{date}} | **Awareness Level:** {{awareness_level}} ({{awareness_description}})

---

## 1. Demanda (Pesquisa de Keywords)

| Keyword | Volume/mês | CPC | Big 5 | BP Score | 80/20 |
|---------|-----------|-----|-------|----------|-------|
{{#each keywords}}
| {{keyword}} | {{volume}} | R$ {{cpc}} | {{big5_category}} | {{bp_score}} | {{golden_tag}} |
{{/each}}

**20% de ouro:** {{golden_count}} keywords = ~{{golden_volume_pct}}% do volume qualificado

---

## 2. Sazonalidade

{{seasonality_narrative}}

| Mês | Tendência | Evento BR |
|-----|-----------|-----------|
{{#each seasonality_months}}
| {{month}} | {{trend}} | {{event}} |
{{/each}}

**Janelas de oportunidade:** {{opportunity_windows}}

---

## 3. Cenário Competitivo

| Player | Maps Reviews | Ads? | Orgânico? | Força |
|--------|-------------|------|-----------|-------|
{{#each competitors}}
| {{name}} | {{reviews}} ({{rating}}⭐) | {{has_ads}} | {{organic_position}} | {{strength}} |
{{/each}}

**Gap competitivo:** {{competitive_gap_narrative}}

---

## 4. Awareness Level: {{awareness_level}}

**Classificação:** {{awareness_level}} (Nível {{awareness_number}}/5 — Schwartz)

{{awareness_narrative}}

**Implicação estratégica:**
{{awareness_strategy}}

---

## 5. Oportunidades Priorizadas (ICE)

| # | Oportunidade | Canal (Unbound) | I | C | E | ICE | Value Eq |
|---|-------------|-----------------|---|---|---|-----|----------|
{{#each opportunities}}
| {{index}} | {{description}} | {{channel}} | {{impact}} | {{confidence}} | {{ease}} | {{ice_score}} | {{value_rating}} |
{{/each}}

---

## 6. Quick Wins

{{#each quick_wins}}
{{index}}. **{{action}}** — {{rationale}} — ICE {{ice_score}}
{{/each}}

---

*Mapa gerado por @market-scout — Insight Squad v1.0.0*
*Frameworks: 8Ps (Adolpho) + Big 5 (Sheridan) + 80/20 (Marshall) + ICE (Ellis) + BP Score (Soulo) + Value Eq (Hormozi) + Awareness (Schwartz) + Unbound (Kiso)*
