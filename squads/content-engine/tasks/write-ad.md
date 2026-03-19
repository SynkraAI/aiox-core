# Task: Write Ad Copy

**Task ID:** write-ad
**Executor:** Agent (joanna-wiebe OR gary-halbert)
**Execution Type:** Agent
**Quality Gate:** QG-003

---

## Purpose

Escrever ad copy (Facebook, Instagram, Google, YouTube) otimizada para clique e conversao, usando VoC e principios de direct response.

---

## Inputs

| Input          | Required    | Description                          |
| -------------- | ----------- | ------------------------------------ |
| product        | Yes         | Produto/servico                      |
| market         | Yes         | Publico-alvo                         |
| platform       | Yes         | Facebook, Instagram, Google, YouTube |
| diagnosis      | Recommended | Output do diagnose-market            |
| landing_page   | Recommended | URL da landing page destino          |
| num_variations | No          | Quantas variacoes (default: 3)       |

---

## Steps

1. **Review Diagnosis** - Awareness + sophistication level
2. **Platform Rules** - Adaptar formato ao canal
3. **Write Hook Variations** - 5+ hooks (primeiras 2 linhas)
4. **Write Body** - Problema → mecanismo → prova → CTA
5. **Write CTA** - Acao clara e especifica
6. **Create Variations** - 3+ variacoes para teste A/B
7. **Headline Variations** - Para cada variacao
8. **Deterministic Pre-Check (textstat + LeIA)** - Para CADA variacao:
   - `textstat.flesch_reading_ease(ad_copy)` — threshold >= 65 (ads precisam ser ultra-simples)
   - `textstat.reading_time(ad_copy)` — threshold <= 15s (FB/IG), <= 5s (Google), <= 10s (YouTube)
   - `textstat.avg_sentence_length(ad_copy)` — threshold <= 10 palavras (ads = frases curtas)
   - `LeIA` no hook (primeiras 2 linhas): |compound| >= 0.3 (precisa de carga emocional)
   - `LeIA` no CTA: compound > 0.1 (positivo — acao)
   - Se hook tem neu > 0.8 = ALERTA: "Hook neutro = ad invisível. Reformular."
   - Resultado: tabela por variação com métricas e status OK/ALERTA
9. **Self-Review** - Checklist + resultados do pre-check
10. **Handoff** - Enviar para @oraculo-torriani

---

## Platform-Specific Rules

### Facebook/Instagram

- Hook nos primeiros 125 caracteres (antes do "Ver mais")
- Imagem/video > texto (mas copy no criativo tambem)
- CTA no botao + no texto

### Google Ads

- Headline 1: Keyword + beneficio (30 chars)
- Headline 2: USP ou prova (30 chars)
- Descricao: Beneficio + CTA (90 chars)

### YouTube

- Hook nos primeiros 5 segundos (pre-skip)
- Pattern interrupt obrigatorio

---

## Acceptance Criteria

- [ ] Hook trava scroll nos primeiros 2 segundos/linhas
- [ ] Adaptado ao formato da plataforma
- [ ] Minimo 3 variacoes para teste
- [ ] CTA claro e unico por variacao
- [ ] VoC presente (linguagem do publico)
- [ ] Congruente com landing page
- [ ] Zero cliches de coach
