# Template: Prompt para Nano Banana 3.0 (Gemini)

Gera imagens com texto renderizado diretamente. Cada capa é única — preencha os 5 blocos com base na copy do post.

**OBRIGATÓRIO**: Antes de preencher, leia `data/visual-rules.md` (regras visuais baseadas em neurociência + 8M fotos analisadas). Todo prompt DEVE seguir os 7 Princípios de Alta Performance e o Checklist Rápido desse arquivo.

---

## Bloco 1: Direção de Arte

Estilo visual, iluminação e atmosfera.

```
ESTILO: [cinematic | editorial | minimal | abstract | documentary | fine art]
ILUMINAÇÃO: [natural lateral | golden hour | low-key | high-key | rim light | contraluz | difusa]
SOMBRAS: [suaves | duras | dramáticas | inexistentes]
CONTRASTE: [alto | baixo | médio | moody]
PALETA: [tons frios | quentes | monocromático | dessaturado | B&W com accent | navy+gold]
MOOD: [introspectivo | urgente | empoderador | confessional | provocador | sereno | tenso]
```

---

## Bloco 2: Direção Técnica

Câmera, qualidade e formato.

```
ENQUADRAMENTO: [close-up | meio corpo | corpo inteiro | overhead | macro | silhueta]
ÂNGULO: [frontal | perfil | 3/4 | overhead | low angle | dutch angle]
FOCO: [sharp no sujeito | soft geral | selective]
PROFUNDIDADE: [rasa (fundo borrado) | profunda | tilt-shift]
LENTE: [35mm | 50mm | 85mm | 135mm]
ASPECT RATIO: [4:5 feed | 9:16 story | 16:9 youtube | 1:1]
QUALIDADE: 4K, photorealistic, ultra-detailed, sharp focus, cinematic lighting, masterpiece
  (usar "4K" em maiúscula — Gemini rejeita minúscula)
```

---

## Bloco 3: Direção de Ambiente

Cenário, sujeito e contexto.

```
CENÁRIO: [descrição do ambiente]
SUJEITO: [descrição da pessoa/objeto principal]
OBJETOS: [elementos secundários no cenário]
HARMONIA: [organizado | caótico controlado | minimalista]
NEGATIVE PROMPT: sem marca d'água, sem logos, sem badge, sem setas, sem indicadores de slide
```

---

## Bloco 4: Direção de Texto

Texto renderizado DENTRO da imagem pelo Nano Banana. Cada linha separada.

**IMPORTANTE — Boas Práticas de Posicionamento (Gemini/Nano Banana):**
- Descreva posição em **linguagem natural**, não pixels — "at the center-left of the lower third", não "150px from bottom"
- Texto **sempre entre aspas** — `"eu era"` garante renderização exata
- Fonte em **linguagem descritiva** — "clean bold sans-serif" funciona, "Inter ExtraBold 800" não
- Use **posição relativa** entre elementos — "directly beneath line 1", "same horizontal line as the arrow"
- Adicione **"Text is clear and readable, tidy typography"** ao final do bloco de texto
- **Escreva instruções de layout em inglês** — Gemini entende melhor spatial instructions em inglês
- **1-3 frases por bloco** — prompts longos diluem a atenção do modelo
- Indicadores (→, 1/N) como **elementos separados** com tamanho "tiny" e opacidade baixa

```
OVERLAY: [cor] semitransparente sobre a foto
  - cor: #14213D (navy) | #2D2D2D (confessional) | #000000 (preto)

At the [posição do texto], place [N] lines of [estilo da fonte] text, [alinhamento]:
- Line 1: "[texto]" in [cor], [tamanho] [peso]
- Line 2: "[texto]" in [cor], [tamanho] [peso], directly beneath line 1
- Line N: "[texto]" in [cor], [tamanho] [peso], directly beneath line N-1

Text is clear and readable, tidy typography. [Descrição da fonte].

At the very bottom-right corner, place a small subtle arrow "→" in faint white (opacity 40%), tiny size.
At the very bottom-left corner, place "[N/total]" in faint white (opacity 40%), same tiny size as the arrow.
Both indicators must sit on the same horizontal line, near the bottom edge but not touching it.
```

### Exemplo preenchido (capa carrossel):

```
OVERLAY: navy #14213D semitransparente sobre a foto.

At the center-left of the lower third, place three lines of bold sans-serif text, left-aligned:
- Line 1: "eu era" in white (#FFFFFF), extra large bold
- Line 2: "viciado em" in white (#FFFFFF), extra large bold, directly beneath line 1
- Line 3: "estar ocupado." in gold (#C9A84C), extra large bold, directly beneath line 2

Text is clear and readable, tidy typography. Clean bold sans-serif font.

At the very bottom-right corner, place a small subtle arrow "→" in faint white (opacity 40%), tiny size.
At the very bottom-left corner, place "1/8" in faint white (opacity 40%), same tiny size as the arrow.
Both indicators must sit on the same horizontal line, near the bottom edge but not touching it.
```

---

## Bloco 5: Direção de Design

Efeitos e composição final.

```
EFEITOS: [nenhum | grain/noise | vinheta | blur bordas | color grading]
BORDAS: [sem borda | borda fina branca | borda fina gold]
COMPOSIÇÃO: [clean e minimal | layered | split]
```

---

## Regras

### Gerais
1. **TODA capa com imagem** usa este template — preencher os 5 blocos
2. **Negative prompt obrigatório** em todos os prompts
3. **Aspect ratio** deve corresponder ao formato (4:5 feed, 9:16 story) — usar formato exato "4:5"
4. **Texto no prompt** = Nano Banana renderiza imagem + texto juntos
5. **Sem texto no prompt** = só foto, overlay via template HTML (cover.html)
6. **Se usa pessoa de referência**: "Keep the person's original physical appearance exactly as provided in the reference image"

### Neurociência Visual (data/visual-rules.md)
7. **SEMPRE incluir grain/noise** no Bloco 5 (+79% engagement vs flat)
8. **Saturação SEMPRE baixa** no Bloco 1 (+18% engagement)
9. **Espaço vazio >40%** no Bloco 3 (+29% engagement)
10. **Se rosto**: expressão contemplativa/vulnerável, NUNCA sorriso genérico (+38% likes com rostos)

### Boas Práticas Gemini/Nano Banana (posicionamento de texto)
11. **Posição em linguagem natural** — "at the lower third, left-aligned", nunca pixels
12. **Texto entre aspas** — `"texto exato"` garante renderização correta
13. **Fonte descritiva** — "clean bold sans-serif", não nomes técnicos de fonte
14. **Layout em inglês** — Gemini entende melhor spatial instructions em inglês
15. **Prompts curtos** — 1-3 frases por bloco, não parágrafos longos
16. **"Text is clear and readable, tidy typography"** — frase mágica ao final do Bloco 4
17. **Resolução em maiúscula** — "4K" (não "4k"), "1080x1350"
18. **Referência visual** — enviar imagem de referência no aspect ratio desejado ajuda na composição

## Checklist

- [ ] 5 blocos preenchidos
- [ ] `data/visual-rules.md` consultado
- [ ] Negative prompt presente
- [ ] Aspect ratio correto
- [ ] Se tem texto: posição, cor e margem definidos
- [ ] Quality tags presentes
- [ ] Cor dominante é navy OU branco (Princípio 1)
- [ ] Textura/grain incluído no Bloco 5 (Princípio 5)
- [ ] >40% espaço vazio (Princípio 4)
- [ ] Gold usado como accent apenas, max 1 elemento (Princípio 3)
