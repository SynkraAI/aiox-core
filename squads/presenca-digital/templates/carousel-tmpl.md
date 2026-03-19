# Template de Carousel — Instagram / LinkedIn

> Define a estrutura de carousel de até 10 slides. Slide 1 = capa/hook, slides 2-9 = conteúdo, slide final = CTA.

---

## Metadata

```yaml
template_id: carousel-tmpl
format: carousel
platform: [instagram, linkedin]
agent: vanessa-lau, brendan-kane, nicolas-cole
method: content-matrix + hook-point + atomic-essay
slides_max: 10
```

---

## Structure

```
---
PLATAFORMA: {PLATFORM}
PILAR: {CONTENT_PILLAR}
TEMA: {TOPIC}
PROMESSA: {PROMISE}    # o que o leitor vai ganhar ao chegar no fim
---

[SLIDE 1 — CAPA / HOOK]
Título principal:  {HOOK_TITLE}
Subtítulo:         {HOOK_SUBTITLE}   ← opcional
Visual:            {VISUAL_DESCRIPTION}
Nota: deve funcionar como thumbnail — claro, direto, curioso

[SLIDE 2 — CONTEXTO / PROBLEMA]
Título:   {SLIDE_2_TITLE}
Corpo:    {SLIDE_2_BODY}
          ← máx 3 linhas de texto por slide

[SLIDE 3 — PONTO 1]
Título:   {POINT_1_TITLE}
Corpo:    {POINT_1_BODY}
Exemplo:  {POINT_1_EXAMPLE}  ← opcional

[SLIDE 4 — PONTO 2]
Título:   {POINT_2_TITLE}
Corpo:    {POINT_2_BODY}

[SLIDE 5 — PONTO 3]
Título:   {POINT_3_TITLE}
Corpo:    {POINT_3_BODY}

[SLIDE 6 — PONTO 4]  ← opcional
Título:   {POINT_4_TITLE}
Corpo:    {POINT_4_BODY}

[SLIDE 7 — PONTO 5]  ← opcional
Título:   {POINT_5_TITLE}
Corpo:    {POINT_5_BODY}

[SLIDE 8 — VIRADA / INSIGHT PRINCIPAL]
Título:   {KEY_INSIGHT_TITLE}
Corpo:    {KEY_INSIGHT_BODY}
Nota: slide mais importante — deve ser o "aha moment"

[SLIDE 9 — RESUMO / LISTA RÁPIDA]  ← opcional
Título:   "Resumo:"
Corpo:    • {RECAP_1}
          • {RECAP_2}
          • {RECAP_3}

[SLIDE 10 — CTA FINAL]
Título:   {CTA_TITLE}
CTA:      {CTA_ACTION}   # ex: "Salva este post", "Manda para alguém que precisa"
Follow:   {FOLLOW_PROMPT}  # ex: "Me segue para mais conteúdo sobre {TOPIC}"
Visual:   {VISUAL_DESCRIPTION}
```

---

## Usage Notes

- Cada slide deve fazer sentido isolado (alguém pode tirar print de qualquer slide)
- Máx 3 linhas de texto por slide — o leitor passa rápido
- Slide 1 determina o CTR — invista mais tempo no hook
- Slide final deve ter o CTA mais claro de todo o carousel
- Consistência visual entre slides (mesma paleta, fonte, layout)

## Platform Adaptations

| Platform  | Adjustment                                                                 |
|-----------|----------------------------------------------------------------------------|
| Instagram | Formato quadrado (1:1) ou portrait (4:5). Swipe horizontal. Máx 10 slides. |
| LinkedIn  | Formato portrait (4:5) funciona melhor. Documento PDF nativo. Sem hashtags em excesso. |
```
