# Regras Visuais — Content Engine

**Source of Truth para direção de arte de TODA imagem gerada.**
**Pesquisa completa**: `data/visual-research.md` (440 linhas, 25+ fontes)

---

## Paleta Validada

| Cor | Hex | Uso | Evidência |
|-----|-----|-----|-----------|
| Navy | #14213D | Fundo primário dark | Azul +24% likes (Curalate, 8M fotos). Transmite confiança, foco, clareza |
| Branco | #FFFFFF | Fundo primário light | Alta luminosidade +24% likes. Respiro, simplicidade |
| Gold | #C9A84C | Accent APENAS (highlight, badge, linha) | Premium, aspiração. NUNCA dominante — contradiz anti-hustle |
| Cinza claro | #F0F0F0 | Background alternativo suave | Neutro de suporte |
| Cinza escuro | #2D2D2D | Fundo confessional | Alternativa ao navy para tom vulnerável |
| Dark Gray | #6B7280 | Texto secundário, subtexto | Suporte |
| Chaos Red | #E63946 | Raramente (1 em 10 posts) | Pattern interrupt extremo. Só em slides de "problema/caos" |

**Regra**: Max 5 cores por conta. Mais de 5 = -18% engagement (Toolzu).

---

## 7 Princípios de Alta Performance

Baseados no estudo Curalate (8M fotos Instagram) + neurociência.

| # | Princípio | Impacto | Como aplicar |
|---|-----------|---------|--------------|
| 1 | **Cor única dominante** | +17% likes | Navy OU branco como base. Nunca ambos lutando por espaço |
| 2 | **Alta luminosidade** | +24% likes | Mesmo com navy, manter áreas claras significativas |
| 3 | **Baixa saturação** | +18% likes | Gold muted (#C9A84C) é perfeito. Evitar cores vibrantes |
| 4 | **Background amplo** | +29% likes | >40% de espaço vazio. Resistir a encher o slide |
| 5 | **Textura sutil** | +79% likes | Grain/noise de filme analógico no fundo. NUNCA flat puro |
| 6 | **Texto no 1o segundo** | 72% retêm | Headline legível em 50ms. Bold, curta, contraste máximo |
| 7 | **Alternância claro/escuro** | Contraste interno | Slides ímpares = claro, pares = escuro. Cria ritmo |

---

## Rostos e Expressão

| Dado | Fonte |
|------|-------|
| Rostos: +38% likes, +32% comentários | Georgia Tech, 1.1M fotos |
| Presença moderada > constante | ScienceDirect 2025 |
| Expressão ideal: contemplativo, vulnerável | Kontent.ai (pattern interrupt) |

**Regras para rostos:**
- Rosto pensativo/contemplativo — NUNCA sorriso genérico de stock
- Olhar para baixo ou lateral — não direto para câmera (salvo provocação)
- Presença moderada: usar rosto em ~30-40% dos posts, não em todos
- Se rosto + texto: overlay 50-65% para legibilidade
- **Fotos do Tiago como referência**: sempre enviar imagem anexa junto com o prompt
- Instrução obrigatória no prompt: "referência na imagem enviada, mantenha as características físicas originais (exclua apenas o óculos)"

---

## Hierarquia de Atenção (Eye-Tracking)

Ordem que o cérebro processa (neurociência):
1. **Rostos humanos** — reconhecimento pré-consciente
2. **Contraste** — objetos contrastantes detectados primeiro
3. **Movimento/mudança** — thumbnails de vídeo > estático
4. **Texto sobre imagem** — viewers pausam para ler
5. **Cores inesperadas** — pattern interrupt cromático

---

## Fórmula de Capa (Alta Performance)

```
CAPA = Fundo Navy/Branco
     + Headline Bold (Inter ExtraBold, max 8 palavras)
     + [Opcional] Subtexto Leve (Courier Prime)
     + Accent Gold (1 uso: linha, underline ou highlight)
     + Espaço Generoso (>40% da área)
     + Textura Sutil (grain/noise)
     + [Opcional] Rosto Contemplativo (recortado, overlay 55%)
     + [Carrossel OBRIGATÓRIO] Indicador de swipe (ver seção abaixo)
```

---

## Indicador de Swipe (Capas de Carrossel)

**OBRIGATÓRIO em toda capa de carrossel.** Sem o cue visual, parte da audiência trata como post estático e não swipa.

**Padrão recomendado**: seta `→` + counter `N/N`

```
SETA: "→"
  - cor: #C9A84C (gold) — accent, chama atenção sem competir com headline
  - tamanho: medium
  - posição: canto inferior direito, dentro da margem segura

COUNTER: "1/N"
  - cor: rgba(255,255,255,0.4) — muted, informativo, não compete
  - tamanho: small
  - posição: canto inferior esquerdo, dentro da margem segura
```

**Regras:**
- Seta e counter NUNCA competem com headline (font-size <= 18px, cor muted)
- Posição: sempre na faixa inferior, dentro da margem segura (150px bottom)
- Se Nano Banana (imagem gerada): incluir como LINHA extra no Bloco 4
- Se template HTML (cover.html): usar variáveis COUNTER e ARROW_VISIBLE do template

---

## Tipos de Capa por Impacto

| Tipo | Quando usar | Impacto |
|------|-------------|---------|
| **Headline Bold sobre Navy** | Provocação, desafio de crença | ALTO |
| **Headline Bold sobre Branco** | Clareza, instrução, lista | ALTO |
| **Rosto + Headline** | História pessoal, vulnerabilidade | ALTO |
| **Número/Estatística Grande** | Dados, pesquisa, prova social | MÉDIO-ALTO |
| **Quote com Typewriter** | Reflexão, filosofia, insight | MÉDIO |

---

## Rotação de Cor de Fundo (entre posts do feed)

**REGRA OBRIGATÓRIA: Alternar cores de fundo entre posts consecutivos no feed.**

| Cor de fundo | Hex | Classificação |
|-------------|-----|---------------|
| Navy | #14213D | ESCURO |
| Cinza escuro | #2D2D2D | ESCURO |
| Branco | #FFFFFF | CLARO |
| Cinza claro | #F0F0F0 | CLARO |

**Regras de alternância:**
- Se último post = ESCURO → próximo DEVE ser CLARO
- Se 2 últimos = ESCURO → próximo OBRIGATÓRIO CLARO (bloqueante)
- Se 2 últimos = CLARO → próximo OBRIGATÓRIO ESCURO (bloqueante)
- Chaos Red (#E63946) NUNCA como fundo — apenas accent
- Exceção: cover_type_override do usuário pode quebrar alternância (documentar no rotation tracker)

**Gold como fundo (EXCEÇÃO ESPECIAL):**
- Gold (#C9A84C) pode ser usado como cor de fundo APENAS para marcos importantes:
  - Lançamentos (produto, serviço, feature)
  - Conquistas e celebrações (números redondos, metas atingidas)
  - Datas importantes (aniversários, marcos do negócio)
- Objetivo: ser facilmente visualizado e lembrado no feed (destaque visual)
- Texto sobre gold: navy (#14213D) ou branco (#FFFFFF) — nunca cinza
- Frequência máxima: 1 a cada 15-20 posts (raridade = impacto)
- Gold como fundo conta como CLARO na alternância

**Sequência ideal (máxima variedade):**
```
Navy → Branco → Cinza escuro → Cinza claro → Navy → Branco → ...
```

---

## Anti-Patterns (NUNCA fazer)

1. Múltiplas cores saturadas na mesma capa
2. Texto longo demais na headline (>8 palavras)
3. Imagens de stock genéricas (zero pattern interrupt)
4. Gold como cor dominante (perde autenticidade anti-hustle)
5. Mesmo layout em todos os posts (feed previsível = sem pattern interrupt)
6. Fundo flat sem textura (perde +79% de engagement)
7. Sorriso genérico de stock photo
8. Overlay <40% sobre foto com texto (ilegível)
9. **Dois posts consecutivos com mesma cor de fundo (quebra alternância)**
10. **Mais de 3 posts sem rosto (frequência facial < 30%)**

---

## Gap Competitivo

Ninguém no nicho BR combina:
- Navy + Gold + Tipografia híbrida (Inter ExtraBold + Courier Prime)
- Posição visual única entre "preto e branco frio" (Dan Koe) e "beige quente" (slow living)
- Transmite **clareza COM autoridade**, não apenas calma

---

## Janelas Temporais Críticas

| Métrica | Tempo | Implicação |
|---------|-------|------------|
| Impressão visual | **50ms** | Capa precisa comunicar valor visualmente antes de ler |
| Decisão parar/continuar | **1.5s** | Hook visual + headline devem funcionar juntos nesse tempo |
| Processamento de imagem | **13ms** | Cérebro processa imagem 60.000x mais rápido que texto |

---

## Checklist Rápido (para todo prompt de imagem)

- [ ] Cor dominante é navy OU branco (nunca split)
- [ ] Saturação baixa (cores muted)
- [ ] >40% de espaço vazio
- [ ] Textura/grain no fundo
- [ ] Headline legível em 50ms (bold, contraste alto)
- [ ] Se rosto: contemplativo, não sorriso genérico
- [ ] Gold usado como accent apenas (max 1 elemento)
- [ ] Negative prompt inclui: sem marca d'água, sem logos, sem badge
- [ ] Aspect ratio correto (4:5 feed, 9:16 story)
- [ ] Se carrossel: indicador de swipe (seta → + counter N/N) presente na capa
