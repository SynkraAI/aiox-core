# Template de Calendário Editorial

> Define a grade editorial semanal. Dia → Plataforma → Formato → Tema → Pilar → Agente → Status.

---

## Metadata

```yaml
template_id: content-calendar-tmpl
format: content-calendar
platform: [all]
agent: vanessa-lau, chief
method: content-matrix
period: weekly
```

---

## Structure

```
---
SEMANA:    {WEEK_START} a {WEEK_END}
TEMA:      {WEEKLY_THEME}
OFERTA:    {CORE_OFFER}           # o que a semana apoia
OBJETIVO:  {WEEKLY_GOAL}
---

## GRADE SEMANAL

| Dia     | Plataforma  | Formato       | Tema/Título                  | Pilar          | Agente              | Status  |
|---------|-------------|---------------|------------------------------|----------------|---------------------|---------|
| SEG     | {PLATFORM}  | {FORMAT}      | {TOPIC_TITLE}                | {PILLAR}       | {AGENT}             | {STATUS}|
| TER     | {PLATFORM}  | {FORMAT}      | {TOPIC_TITLE}                | {PILLAR}       | {AGENT}             | {STATUS}|
| QUA     | {PLATFORM}  | {FORMAT}      | {TOPIC_TITLE}                | {PILLAR}       | {AGENT}             | {STATUS}|
| QUI     | {PLATFORM}  | {FORMAT}      | {TOPIC_TITLE}                | {PILLAR}       | {AGENT}             | {STATUS}|
| SEX     | {PLATFORM}  | {FORMAT}      | {TOPIC_TITLE}                | {PILLAR}       | {AGENT}             | {STATUS}|
| SÁB     | {PLATFORM}  | {FORMAT}      | {TOPIC_TITLE}                | {PILLAR}       | {AGENT}             | {STATUS}|
| DOM     | {PLATFORM}  | {FORMAT}      | {TOPIC_TITLE}                | {PILLAR}       | {AGENT}             | {STATUS}|

---

## DETALHE POR PUBLICAÇÃO

### {DAY} — {PLATFORM} — {FORMAT}
Título/Hook:   {TITLE_OR_HOOK}
Pilar:         {PILLAR}
Objetivo:      {GOAL}             # ex: alcance, engajamento, conversão
Agente:        {AGENT}
Template:      {TEMPLATE_USED}    # ex: post-tmpl, carousel-tmpl
Brief:         {BRIEF_SUMMARY}    # 2-3 linhas do que o conteúdo aborda
CTA:           {CTA}
Horário:       {PUBLISH_TIME}
Status:        {STATUS}           # backlog / em-criação / revisão / aprovado / publicado

→ Repetir bloco para cada publicação

---

## LEGENDA

### Pilares
- EDUCAÇÃO      — ensina algo prático e aplicável
- AUTORIDADE    — demonstra expertise e credibilidade
- COMUNIDADE    — gera identificação e pertencimento
- ENTRETENIMENTO — engaja e gera compartilhamento
- CONVERSÃO     — direciona para oferta ou ação

### Status
- backlog       — ideia registrada, não iniciada
- em-criação    — agente trabalhando
- revisão       — aguardando aprovação
- aprovado      — pronto para publicar
- publicado     — no ar
- arquivado     — descartado ou adiado

### Formatos
- post          — texto estático
- carousel      — múltiplos slides
- reel          — vídeo curto
- stories       — sequência de stories
- newsletter    — email
- blog          — artigo longo
- youtube       — vídeo longo

---

## BALANÇO SEMANAL RECOMENDADO

| Pilar          | % ideal |
|----------------|---------|
| Educação       | 40%     |
| Autoridade     | 20%     |
| Comunidade     | 20%     |
| Entretenimento | 10%     |
| Conversão      | 10%     |
```

---

## Usage Notes

- O calendário deve ser preenchido com 1 semana de antecedência mínima
- Manter balanço de pilares — não publicar conversão sem antes entregar valor
- Status atualizado em tempo real — calendário é fonte da verdade do squad
- Cada publicação deve ter template associado antes de ir para criação

## Platform Adaptations

| Platform  | Adjustment                                                                 |
|-----------|----------------------------------------------------------------------------|
| Instagram | Melhor horário: 11h-13h e 19h-21h. Reels têm alcance orgânico maior.      |
| LinkedIn  | Melhor horário: 8h-10h, terça a quinta. Menos posts, maior qualidade.      |
| YouTube   | Melhor dia: quarta ou quinta. Consistência de horário é mais importante.   |
| Email     | Melhor horário: terça ou quinta, 8h-10h. Evitar segunda e sexta.           |
```
