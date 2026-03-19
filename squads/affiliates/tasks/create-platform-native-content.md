# create-platform-native-content

## Metadata
```yaml
task_id: AFF_SOC_004
agent: social-strategist
type: creation
complexity: medium
estimated_time: "1h-2h30min"
source: "GaryVee — Document Don't Create; Later.com Native Content Research; TikTok Business Creative Playbook 2024"
```

## Purpose
Adaptar o pillar content central da operação de afiliado para cada plataforma de forma nativa, convertendo uma peça de conteúdo longo ou um tema em versões específicas para TikTok, Reels, Shorts, Feed e Stories, respeitando as convenções, algoritmos e comportamento de audiência de cada plataforma.

## Prerequisites
- Pillar content definido (tema central, ângulo, mensagem principal)
- Produto afiliado definido (para inclusão natural no conteúdo)
- Plataformas ativas listadas e conta criada em cada uma
- Materiais brutos disponíveis (vídeo base, imagens, dados, texto)
- Calendário editorial mensal criado (`design-social-calendar.md` executado)

## Steps

1. **Definir o pillar content** — Identificar a peça de conteúdo central (pode ser: artigo de blog, vídeo longo do YouTube, episódio de podcast, ou simplesmente um tema-chave do nicho).

2. **Extrair os micro-ângulos** — A partir do pillar, identificar 5-8 ângulos ou pontos específicos que podem virar peças independentes por plataforma.

3. **Planejar a versão TikTok/Reels** — Vídeo vertical 9:16, 30-60s. Hook nos primeiros 3s. Legenda automática. Texto on-screen nos pontos-chave. Foco em UM insight do pillar.

4. **Planejar a versão Shorts** — Similar ao TikTok/Reels mas otimizado para audiência YouTube: mais didático, tom ligeiramente mais formal, thumbnail importa (aparece no YouTube principal).

5. **Planejar a versão Feed (Carrossel)** — 5-10 slides com Slide 1 = hook visual, slides 2-N = insights sequenciais, último slide = CTA. Salva são a principal métrica do feed.

6. **Planejar a versão Stories** — 3-5 stories encadeados. Cada story tem UMA informação. Usar recursos nativos: enquete, pergunta, slider, contagem regressiva, link sticker.

7. **Garantir diferenciação entre versões** — Cada versão deve parecer criada para aquela plataforma — não uma adaptação óbvia. Mudar o formato, o tom, a profundidade e o ponto de entrada no conteúdo.

8. **Documentar a adaptação** — Registrar todas as versões com especificações e diferenciações no arquivo de output.

## Framework

### Pillar → Micro-Content Breakdown

```
PILLAR CONTENT (longo)
"Como Afiliados Ganham R$5k/mês Sem Aparecer em Vídeo"
                ↓
┌─────────────────────────────────────────────────────────┐
│ MICRO-ÂNGULOS EXTRAÍDOS:                                │
│                                                         │
│ 1. "Os 3 modelos de afiliado que não precisam de rosto" │
│ 2. "Quanto paga um afiliado de {nicho} sem aparecer"    │
│ 3. "Erro #1: achar que precisa de câmera para vender"   │
│ 4. "Case: afiliado anônimo que faz R$8k/mês"           │
│ 5. "Funil simples para afiliado sem aparecer"           │
│ 6. "Comparativo: com câmera vs sem câmera (dados reais)"│
└─────────────────────────────────────────────────────────┘
                ↓
┌──────────────┬───────────────┬──────────────┬──────────┐
│ TikTok/Reels │ YouTube Short │ Feed Carros. │ Stories  │
│ Ângulo 3     │ Ângulo 1      │ Ângulo 5     │ Ângulo 4 │
└──────────────┴───────────────┴──────────────┴──────────┘
```

### Especificações por Plataforma

```yaml
tiktok_reels:
  ratio: "9:16 (vertical)"
  duration: "30-60s (TikTok) / 15-30s (Reels)"
  resolution: "1080x1920px"
  audio: "Trending sound OU voz original (sem música de fundo genérica)"
  text_on_screen: "Obrigatório nos pontos-chave (audiência sem som = 85%)"
  captions: "Automáticas no TikTok / SRT no Reels"
  hook_position: "0-3s — antes de qualquer introdução"
  native_elements: "Duet, Stitch, trending effects, texto animado nativo"
  algorithm_tip: "Primeiros 30s de watch time são cruciais para distribuição"
  affiliate_tip: "Link APENAS na bio — mencionar 'link na bio' no vídeo"
  watermark_rule: "NUNCA usar conteúdo com watermark de outra plataforma"

youtube_shorts:
  ratio: "9:16 (vertical)"
  duration: "30-60s"
  thumbnail: "Gerada automaticamente — escolher frame de maior impacto"
  hook_style: "Ligeiramente mais didático que TikTok — audiência espera conteúdo"
  tone: "Educativo mas dinâmico — mais próximo do YouTube long-form em tom"
  captions: "Automáticas pelo YouTube Studio"
  algorithm_tip: "Shorts geram subscribers para o canal principal — incluir CTA para canal"
  affiliate_tip: "Link na descrição + mencionar no vídeo"

instagram_feed_carousel:
  ratio: "1:1 (quadrado) ou 4:5 (retrato)"
  slides: "5-10 slides"
  slide_1: "HOOK — grande, visual, pouquíssimo texto"
  slide_2_to_n: "Um insight por slide — máximo 3 linhas de texto"
  last_slide: "CTA — 'Salva para não perder' + 'Segue para mais'"
  design_rule: "Consistência visual (paleta, fonte) — cria identidade"
  algorithm_tip: "Salvas são o principal sinal de qualidade no Feed — otimizar para saves"
  affiliate_tip: "Citar o produto naturalmente — affiliate disclosure no último slide"

stories:
  ratio: "9:16 (vertical)"
  duration: "15s por story (máximo)"
  stories_per_sequence: "3-5 (mais que isso perde audiência)"
  story_1: "Hook — o que vem a seguir (fazer o usuário ir para o próximo)"
  stories_2_to_n: "Um ponto por story — rápido e direto"
  native_elements: "Enquete, pergunta, quiz, slider, countdown, link sticker"
  tone: "Mais casual e pessoal do que feed — bastidores são naturais aqui"
  algorithm_tip: "Stories diários mantêm conta no topo do feed dos seguidores"
  affiliate_tip: "Link sticker disponível para todas as contas — melhor canal de CTA direto"
```

### Exemplo de Adaptação por Plataforma (mesmo tema)

| Plataforma | Ângulo de Entrada | Hook | Profundidade | CTA |
|-----------|------------------|------|-------------|-----|
| TikTok | Resultado (desejo) | "R$5k/mês sem aparecer em vídeo" | Superficial — 1 insight | "Link na bio" |
| Reels | Curiosidade | "Você não precisa de câmera para isso" | Superficial — demonstração | "Me segue" |
| Shorts | Educativo | "3 formas de ser afiliado sem rosto" | Médio — 3 pontos rápidos | "Canal para mais" |
| Feed | Tutorial | "5 passos para afiliado anônimo de sucesso" | Profundo — guia completo | "Salva + segue" |
| Stories | Bastidores | "Te mostro meu funil de afiliado anônimo" | Pessoal — processo real | "Link sticker" |

### Regras de Diferenciação Cross-Platform

```
NUNCA fazer isso:
✗ Postar o mesmo vídeo do TikTok no Reels sem remover watermark
✗ Pegar o carrossel do Feed e postar como Stories (formatos incompatíveis)
✗ Usar o mesmo hook em todas as plataformas (audiências podem se sobrepor)
✗ Gravar uma vez e republicar identicamente em todas (algoritmos percebem)

SEMPRE fazer isso:
✓ Mudar o ângulo de entrada do conteúdo por plataforma
✓ Adaptar a profundidade (TikTok = superficial, YouTube long = profundo)
✓ Usar recursos nativos de cada plataforma (Stitch, Reels collab, etc.)
✓ Respeitar a linguagem da comunidade de cada plataforma
```

## Veto Conditions
- Publicar mesmo vídeo TikTok com watermark no Reels → BLOQUEAR (Instagram penaliza e reduz alcance em até 80%)
- Carrossel do Feed usado sem adaptação como Stories → BLOQUEAR (formato incompatível — não abre em paisagem completa)
- Conteúdo idêntico publicado simultaneamente em todas as plataformas sem qualquer diferenciação → ALERTAR (seguidores que te seguem em múltiplas plataformas veem o mesmo — perda de engajamento)
- Vídeo de mais de 90s publicado como Short ou TikTok principal → ALERTAR (usar como corte — não o vídeo completo)
- Stories sem nenhum recurso interativo (só texto estático) → ALERTAR (stories sem interação têm completion rate 40% menor)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/platform-native-content-{tema}.md`
- **Format:** Markdown com especificações por plataforma para cada peça de conteúdo

## Output Example
```yaml
platform_native_content:
  project: "afiliado-investimentos"
  pillar_theme: "Como afiliados de investimentos faturam sem ser analistas CNPI"
  micro_angles_extracted:
    - "Erro de achar que precisa de certificação"
    - "Modelos de afiliado que não precisam de credencial"
    - "Quanto paga afiliado de plataforma de investimentos"
    - "Case: afiliado sem certificação que faz R$7k/mês"
    - "Funil simples: blog review → afiliado → comissão"

adaptations:
  tiktok:
    angle: "micro_angle_1 — erro comum"
    hook: "Se você acha que precisa de CNPI para ser afiliado de investimentos, assistir até o final"
    duration: "45s"
    structure: "Hook 3s → Erro 5s → Por que não precisa 25s → CTA 12s"
    production_notes: "Talking head. Texto animado nos momentos-chave. Trending sound instrumental."

  instagram_reels:
    angle: "micro_angle_3 — quanto paga"
    hook: "Quanto ganha um afiliado de plataforma de investimentos? (dados reais)"
    duration: "30s"
    structure: "Hook 3s → Tabela de comissões animada 20s → CTA 7s"
    production_notes: "Screen recording do dashboard + voice over. Sem câmera necessária."

  instagram_feed:
    angle: "micro_angle_5 — funil simples"
    hook_slide_1: "O funil de R$0 que uso para ganhar com afiliados de investimentos"
    slides: 8
    slide_breakdown:
      - "1: Hook visual"
      - "2: O modelo — diagrama simples"
      - "3: Passo 1 — criar review"
      - "4: Passo 2 — SEO básico"
      - "5: Passo 3 — link de afiliado"
      - "6: Resultado esperado"
      - "7: Disclosure de afiliado"
      - "8: CTA — salva + segue"
    affiliate_disclosure: "Slide 7 — explícito e claro"

  stories:
    angle: "micro_angle_4 — case real"
    story_sequence: 4
    story_1: "Deixa eu te contar sobre uma pessoa que faz R$7k/mês como afiliado sem CNPI →"
    story_2: "O que ele faz: reviews de plataformas + comparativos (enquete: 'já fez algo assim?' Sim/Não)"
    story_3: "Quanto ele ganha: screenshot do dashboard (com dados pessoais ocultos)"
    story_4: "Quer saber como montar o mesmo sistema? → Link sticker"
    link_sticker: "true"

  youtube_shorts:
    angle: "micro_angle_2 — modelos sem credencial"
    hook: "3 formas de ser afiliado de investimentos sem nenhuma certificação"
    duration: "60s"
    structure: "Hook 3s → Modelo 1: 15s → Modelo 2: 15s → Modelo 3: 15s → CTA canal 12s"
    production_notes: "Voz + texto animado. Mais didático que TikTok. Mencionar canal para playlist completa."
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
