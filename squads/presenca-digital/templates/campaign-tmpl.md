# Template de Campanha Semanal

> Define a estrutura de uma campanha de conteúdo semanal. Baseado na Copy Andromeda de Natanael Oliveira: gatilho da semana → criativos por sentimento → sequência de emails → stories.

---

## Metadata

```yaml
template_id: campaign-tmpl
format: campaign
platform: [instagram, linkedin, email, stories]
agent: natanael-oliveira, vanessa-lau
method: copy-andromeda + content-matrix
duration: 7 dias
```

---

## Structure

```
---
CAMPANHA:        {CAMPAIGN_NAME}
SEMANA:          {WEEK_START} a {WEEK_END}
OFERTA-CENTRAL:  {CORE_OFFER}      # produto, serviço, lead magnet ou ideia
GATILHO:         {TRIGGER}         # ex: lançamento, data sazonal, dor recorrente
META:            {CAMPAIGN_GOAL}   # ex: 50 leads, 200 saves, 10 vendas
---

## GATILHO DA SEMANA

Contexto:    {TRIGGER_CONTEXT}
Por que agora: {TIMING_REASON}
Ângulo único:  {UNIQUE_ANGLE}

---

## CRIATIVOS POR SENTIMENTO

### DOR (Segunda/Terça)
Formato:    {FORMAT_DOR}          # ex: post, reel
Copy:       {COPY_DOR}
Visual:     {VISUAL_DOR}
Objetivo:   {OBJECTIVE_DOR}       # ex: identificação, comentários

### OPORTUNIDADE (Quarta)
Formato:    {FORMAT_OPORTUNIDADE}
Copy:       {COPY_OPORTUNIDADE}
Visual:     {VISUAL_OPORTUNIDADE}
Objetivo:   {OBJECTIVE_OPORTUNIDADE}   # ex: salvar, compartilhar

### STORYTELLING (Quinta)
Formato:    {FORMAT_STORY}
Copy:       {COPY_STORY}
Visual:     {VISUAL_STORY}
Objetivo:   {OBJECTIVE_STORY}     # ex: engajamento, conexão

### AUTORIDADE (Sexta)
Formato:    {FORMAT_AUTORIDADE}
Copy:       {COPY_AUTORIDADE}
Visual:     {VISUAL_AUTORIDADE}
Objetivo:   {OBJECTIVE_AUTORIDADE}   # ex: cliques, seguidores

### ESCASSEZ / URGÊNCIA (Sábado)
Formato:    {FORMAT_ESCASSEZ}
Copy:       {COPY_ESCASSEZ}
Visual:     {VISUAL_ESCASSEZ}
Objetivo:   {OBJECTIVE_ESCASSEZ}  # ex: conversão, DM

---

## SEQUÊNCIA DE EMAILS

### Email 1 — {DAY_1} (Abertura)
Assunto:    "{EMAIL_1_SUBJECT}"
Objetivo:   {EMAIL_1_GOAL}
Corpo:      {EMAIL_1_BODY_SUMMARY}
CTA:        {EMAIL_1_CTA}

### Email 2 — {DAY_2} (Conteúdo/Prova)
Assunto:    "{EMAIL_2_SUBJECT}"
Objetivo:   {EMAIL_2_GOAL}
Corpo:      {EMAIL_2_BODY_SUMMARY}
CTA:        {EMAIL_2_CTA}

### Email 3 — {DAY_3} (Oferta/Urgência)
Assunto:    "{EMAIL_3_SUBJECT}"
Objetivo:   {EMAIL_3_GOAL}
Corpo:      {EMAIL_3_BODY_SUMMARY}
CTA:        {EMAIL_3_CTA}

---

## STORIES SEQUENCE

→ Usar stories-sequence-tmpl.md para o roteiro detalhado

Tema stories:   {STORIES_THEME}
Dias:           {STORIES_DAYS}
Objetivo:       {STORIES_GOAL}

---

## MÉTRICAS DE SUCESSO

| Métrica          | Meta      | Resultado |
|------------------|-----------|-----------|
| Reach total      | {META_REACH} | —      |
| Engajamento (%)  | {META_ENG}   | —      |
| Cliques/CTA      | {META_CLICKS}| —      |
| Conversões       | {META_CONV}  | —      |
```

---

## Usage Notes

- Cada sentimento serve um papel diferente na jornada do lead — não trocar a ordem
- DOR precede OPORTUNIDADE — o leitor precisa primeiro se identificar com o problema
- STORYTELLING no meio da semana humaniza a marca após conteúdo educativo
- ESCASSEZ somente no final — usada no início destrói credibilidade
- Todos os criativos devem apontar para a mesma oferta central da semana

## Platform Adaptations

| Platform  | Adjustment                                                                 |
|-----------|----------------------------------------------------------------------------|
| Instagram | Criativos DOR e STORYTELLING performam melhor como reels.                  |
| LinkedIn  | AUTORIDADE e OPORTUNIDADE têm mais alcance orgânico.                       |
| Email     | Taxa de abertura maior terça e quinta entre 8h-10h.                        |
```
