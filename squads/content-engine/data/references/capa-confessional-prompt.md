# Prompt Modelo — Capa Confessional (Nano Banana)

**Imagem de referência**: `capa-confessional-reference.png` (nesta pasta)
**Resultado**: capa de carrossel storytelling com foto + texto renderizado pelo Gemini

---

## Essência do Prompt

Este prompt combina **foto cinematográfica com overlay escuro + texto bold sobreposto**. O Nano Banana renderiza tudo em uma única passada — foto, overlay e tipografia. A chave é o contraste entre a vulnerabilidade do sujeito e a força tipográfica.

### O que funciona neste prompt:

1. **Low-key lighting + rim light** — cria profundidade sem iluminar demais
2. **Overlay navy semitransparente** — unifica foto e texto na mesma paleta
3. **Texto no terço inferior esquerdo** — não compete com o rosto do sujeito
4. **Gold na linha de impacto** — destaca a palavra-chave sem poluir
5. **Expressão contemplativa (olhar para baixo)** — vulnerabilidade > confiança
6. **Fundo texturizado com grain** — evita flat, adiciona profundidade analógica
7. **Indicadores tiny e muted** — presentes mas invisíveis ao olhar casual

---

## Prompt Abstrato (preencher os [ ])

```
Bloco 1: Direção de Arte

ESTILO: cinematic confessional
ILUMINAÇÃO: low-key com rim light lateral sutil
SOMBRAS: dramáticas, direcionais
CONTRASTE: alto (navy profundo vs highlights sutis)
PALETA: navy #14213D dominante, dessaturado, monocromático frio
MOOD: [introspectivo | vulnerável | confessional | reflexivo] — "[frase curta do sentimento]"

Bloco 2: Direção Técnica

ENQUADRAMENTO: [meio corpo | close-up], recortado na [cintura | peito]
ÂNGULO: 3/4, levemente de cima para baixo
FOCO: selective — sharp no sujeito, fundo soft
PROFUNDIDADE: rasa (fundo borrado, bokeh sutil)
LENTE: 85mm
ASPECT RATIO: 4:5 feed (1080x1350)
QUALIDADE: 8K, photorealistic, ultra-detailed, sharp focus, cinematic lighting, masterpiece

Bloco 3: Direção de Ambiente

CENÁRIO: ambiente escuro minimalista, parede texturizada navy/cinza escuro com grain visível
SUJEITO: [descrição ou referência] — olhando levemente para baixo, não para câmera. Expressão contemplativa, não tristeza.
OBJETOS: nenhum — cenário limpo, >40% de espaço vazio ao redor
HARMONIA: minimalista extremo — só sujeito + fundo
NEGATIVE PROMPT: sem marca d'água, sem logos, sem badge, sem sorriso, sem pose de sucesso, sem laptop, sem celular

Bloco 4: Direção de Texto

OVERLAY: navy #14213D a [50-60]% sobre a foto

LINHA 1: "[texto linha 1]"
  - cor: #FFFFFF (branco)
  - tamanho: extra large
  - peso: extra bold
  - posição: terço inferior da imagem, alinhado à esquerda com margem generosa

LINHA 2: "[texto linha 2]"
  - cor: #FFFFFF (branco)
  - tamanho: extra large
  - peso: extra bold
  - posição: logo abaixo da linha 1, mesmo alinhamento

LINHA 3: "[texto linha 3 — a de impacto]"
  - cor: #C9A84C (gold)
  - tamanho: extra large
  - peso: extra bold
  - posição: logo abaixo da linha 2, mesmo alinhamento

INDICADOR DE SETA: "→"
  - cor: rgba(255,255,255,0.4) — quase invisível, muito sutil
  - tamanho: tiny — aproximadamente 1/3 do tamanho do texto principal
  - posição: canto inferior direito absoluto da imagem, rente à margem — nos últimos 10% verticais e últimos 10% horizontais
  - IMPORTANTE: deve ficar ACIMA da borda inferior em pelo menos 11% da altura total da imagem (zona segura para dots do carrossel)

INDICADOR DE NÚMERO: "[N/total]"
  - cor: rgba(255,255,255,0.4) — mesma opacidade sutil da seta
  - tamanho: tiny — mesmo tamanho da seta
  - posição: canto inferior esquerdo absoluto da imagem, espelhado à seta — nos últimos 10% verticais e primeiros 10% horizontais
  - IMPORTANTE: mesma altura vertical que a seta (alinhados na mesma linha horizontal)

REGRA CRÍTICA DOS INDICADORES: seta e número devem estar na mesma linha horizontal, bem próximos à borda inferior mas NUNCA nos últimos 4% da imagem (zona dos dots do Instagram). Devem ser discretos — elementos de UI, não parte do design principal.

Bloco 5: Direção de Design

EFEITOS: grain/noise sutil (textura de filme analógico), vinheta leve nas bordas
BORDAS: sem borda
COMPOSIÇÃO: clean e minimal — texto no terço inferior esquerdo, sujeito levemente à direita, espaço generoso. Indicadores (seta e número) são elementos de UI secundários no rodapé, não competem com o headline.
```

---

## Quando Usar

- Capas de carrossel storytelling/confessional
- Posts com foto pessoal + frase de impacto
- Conteúdo vulnerável/introspectivo (burnout, mudança, reflexão)
- Qualquer peça que precise de "scroll-stop" com rosto + texto bold

## Variações Possíveis

| Variação | Mudança no prompt |
|----------|-------------------|
| Sem rosto (só texto) | Remover SUJEITO, manter cenário texturizado |
| Mais luminoso | Trocar low-key por "soft diffused", overlay a 40% |
| Urgente/provocador | MOOD: urgente, CONTRASTE: extremo, gold em todas as linhas |
| Sereno | ILUMINAÇÃO: golden hour lateral, SOMBRAS: suaves |
