# Template de Newsletter

> Define a estrutura de email newsletter semanal. Baseado no modelo Saturday Solopreneur de Justin Welsh: Subject → Uma grande ideia → História/exemplo → Takeaway → CTA.

---

## Metadata

```yaml
template_id: newsletter-tmpl
format: newsletter
platform: [email, beehiiv, substack, convertkit]
agent: justin-welsh, nicolas-cole
method: content-os + saturday-solopreneur
frequency: weekly
word_count_target: 400-700
```

---

## Structure

```
---
ASSUNTO (Subject Line): {SUBJECT_LINE}    # máx 50 chars, curiosidade ou benefício direto
PREVIEW TEXT:           {PREVIEW_TEXT}    # 40-90 chars, complementa o subject
DATA:                   {SEND_DATE}
SEGMENTO:               {SEGMENT}         # todos / leads / compradores
TEMA DA SEMANA:         {WEEKLY_TOPIC}
---

[SUBJECT LINE]
Opção A: "{SUBJECT_A}"   # curiosidade
Opção B: "{SUBJECT_B}"   # benefício direto
Opção C: "{SUBJECT_C}"   # número/lista
→ Escolhida: {CHOSEN_SUBJECT}

---

[SAUDAÇÃO]
Olá, {FIRST_NAME | Amigo}!

[UMA GRANDE IDEIA — 1 parágrafo]
{BIG_IDEA_PARAGRAPH}
Nota: toda a newsletter orbita esta única ideia — não dispersar

[CONTEXTO / HISTÓRIA — 1-2 parágrafos]
{STORY_OR_CONTEXT}
Nota: história pessoal ou de cliente funciona melhor que abstrato

[DETALHE / EXEMPLO — 1-2 parágrafos]
{EXAMPLE_OR_DATA}

[TAKEAWAY — 1 parágrafo]
{TAKEAWAY_PARAGRAPH}
Nota: o leitor deve conseguir aplicar isso HOJE

[LISTA RÁPIDA] ← opcional, substitui ou complementa o takeaway
{QUICK_LIST_INTRO}:
• {ITEM_1}
• {ITEM_2}
• {ITEM_3}

[CTA — 1 bloco]
{CTA_INTRO}

→ {CTA_ACTION}   # link, produto, resposta ao email, comunidade

[ASSINATURA]
{SIGN_OFF}
{SENDER_NAME}

P.S.: {PS_LINE}   ← opcional, mas lido com alta frequência

---
FOOTER:
Você recebe este email porque {REASON}.
Descadastrar: {UNSUBSCRIBE_LINK}
```

---

## Usage Notes

- Uma ideia por newsletter — mais do que isso e o leitor não absorve nada
- Subject line é o determinante do open rate — testar variações A/B
- O P.S. tem uma das maiores taxas de leitura — use para o CTA mais importante
- Tom conversacional, como email de amigo, não de empresa
- Sempre mobile-first: parágrafos curtos, sem imagens pesadas

## Platform Adaptations

| Platform   | Adjustment                                                                   |
|------------|------------------------------------------------------------------------------|
| Beehiiv    | Boost nativo. Referral program. Analytics detalhado por link.                |
| Substack   | Comentários habilitados. Notes para distribuição extra.                      |
| ConvertKit | Segmentação avançada por tags. Automações de sequência.                      |
| Gmail      | Evitar imagens pesadas. Texto plano tem maior deliverability.                |
```
