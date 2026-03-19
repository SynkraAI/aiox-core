# Template de Roteiro YouTube

> Define a estrutura de roteiro para vídeos longos no YouTube. Baseado no método CEQCOM: Curiosidade → Empatia → Qualificação → Conteúdo → Oferta → Mensagem final.

---

## Metadata

```yaml
template_id: youtube-script-tmpl
format: youtube-script
platform: [youtube]
agent: paulo-cuenca, camilo-coutinho
method: ceqcom + metodo-cordilheira
duration_target: 8-15min
```

---

## Structure

```
---
TÍTULO: {VIDEO_TITLE}           # inclui keyword principal
KEYWORD-PRINCIPAL: {KEYWORD}
THUMBNAIL-CONCEITO: {THUMBNAIL_CONCEPT}
DURAÇÃO-ALVO: {DURATION}min
---

[C — CURIOSIDADE — 0:00 a 0:45]
Gancho inicial:  "{HOOK_QUESTION_OR_STATEMENT}"
Promessa:        "{WHAT_THEY_WILL_LEARN}"
Preview:         "{QUICK_PREVIEW_OF_VALUE}"  # mostre o resultado antes de explicar
Nota: não apresente o canal ainda — primeiro entregue valor

[E — EMPATIA — 0:45 a 1:30]
Problema:        "{PAIN_POINT_DESCRIPTION}"
Validação:       "{I_UNDERSTAND_YOU_STATEMENT}"
História curta:  "{SHORT_RELATABLE_STORY}"   ← opcional, máx 30s
Nota: faça o espectador sentir que você entende exatamente o que ele vive

[Q — QUALIFICAÇÃO — 1:30 a 2:00]
Para quem é:     "{TARGET_AUDIENCE_STATEMENT}"
Por que você:    "{CREDIBILITY_STATEMENT}"   # sua autoridade no tema
Transição:       "{BRIDGE_TO_CONTENT}"

[C — CONTEÚDO — 2:00 a {TIME_END}]
  [BLOCO 1 — {SECTION_TITLE_1}]
  Explicação:  {CONTENT_BLOCK_1}
  Exemplo:     {EXAMPLE_1}
  Takeaway:    "{TAKEAWAY_1}"

  [BLOCO 2 — {SECTION_TITLE_2}]
  Explicação:  {CONTENT_BLOCK_2}
  Exemplo:     {EXAMPLE_2}
  Takeaway:    "{TAKEAWAY_2}"

  [BLOCO 3 — {SECTION_TITLE_3}]
  Explicação:  {CONTENT_BLOCK_3}
  Exemplo:     {EXAMPLE_3}
  Takeaway:    "{TAKEAWAY_3}"

  [BLOCO 4]  ← adicionar blocos conforme necessidade
  ...

  [CARD DO YOUTUBE — ~{MIDPOINT}min]
  "{CTA_SUBSCRIBE_OR_VIDEO}"   # inserir no meio do vídeo

[O — OFERTA — {TIME_START} a {TIME_END}]
Transição:    "{BRIDGE_TO_OFFER}"
Oferta:       "{OFFER_DESCRIPTION}"   # link, produto, lead magnet, etc.
Benefícios:   "{OFFER_BENEFITS}"
CTA:          "{CTA_OFFER}"

[M — MENSAGEM FINAL — últimos 30s]
Resumo:       "{QUICK_RECAP}"
Próximo passo: "{NEXT_VIDEO_TEASER_OR_ACTION}"
Despedida:    "{SIGN_OFF}"
End screen:   {END_SCREEN_ELEMENTS}   # vídeos sugeridos, assinar

---
NOTAS DE PRODUÇÃO:
B-roll:       {BROLL_NOTES}
Gráficos:     {GRAPHICS_NOTES}
Chapters:     {CHAPTER_TIMESTAMPS}
Descrição:    incluir keyword nos primeiros 100 chars
```

---

## Usage Notes

- C (Curiosidade) deve funcionar como o gancho de um Reel — rápido e impactante
- E (Empatia) é o que diferencia vídeos que retêm vs vídeos que perdem o espectador
- Conteúdo deve ter exemplos concretos — abstrato perde audiência
- Oferta deve ser natural, não agressiva — flui do conteúdo
- Card do YouTube e CTA de inscrição NUNCA no início (espectador ainda não confia)

## Platform Adaptations

| Platform | Adjustment                                                                  |
|----------|-----------------------------------------------------------------------------|
| YouTube  | SEO no título e descrição. Chapters no description. Thumbnail com rosto e texto. |
| YouTube Shorts | Adaptar C+E+C apenas (3 min → 60s) usando reel-script-tmpl em vez deste. |
```
