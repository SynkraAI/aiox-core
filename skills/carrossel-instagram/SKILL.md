---
name: carrossel-instagram
description: >-
  Gera carrosséis completos para Instagram: copy persuasiva + HTML visual + PNGs prontos.
  Entry point único — um comando, um carrossel pronto para publicar.
  Combina frameworks de copy do ecossistema com design system visual.
risk: safe
source: aios
version: 1.0.0
category: content-production
tags: [carousel, instagram, copy, html, design, social-media]
paths:
  - "skills/carrossel-instagram/"
lazy_load: true
context_budget: 2000
---

# Carrossel Instagram

Gera carrosséis completos para Instagram — da ideia ao PNG pronto para publicar.
É como uma linha de montagem: entra o tema, sai o carrossel pronto. Uma chamada, um resultado.

## When to Use This Skill

- Criar carrossel para Instagram (qualquer nicho)
- Post com múltiplas imagens/slides para feed
- Conteúdo visual swipeable para redes sociais
- Carousel design com copy persuasiva integrada

**Triggers:** "criar carrossel", "fazer slides pro Instagram", "post carrossel", "carousel", "carrossel sobre X"

## Do NOT Use This Skill When

- Precisa APENAS de copy sem design visual → use `squads/conteudo` diretamente
- Precisa editar carrossel existente → edite o HTML gerado manualmente
- Quer publicar no Instagram → use `instagram-publisher` skill após gerar os PNGs

## Prerequisites

- MCP server Playwright configurado (para renderização PNG)
- Python 3 (para HTTP server local do image-creator)

---

## FASE 1: Discovery (Coletar Contexto)

Antes de gerar QUALQUER coisa, coletar informações. Use `AskUserQuestion`.

### Perguntas obrigatórias (se não fornecidas):

**Bloco 1 — Conteúdo:**
1. **Tema do carrossel** — sobre o que será o conteúdo?
2. **Público-alvo** — quem vai ler? (idade, nível, dor principal)
3. **Intenção** — Atração / Consciência / Aquecimento / Venda?
4. **Quantos slides?** — 5, 7 ou 10? (sugerir 7 como ideal)

**Bloco 2 — Marca:**
5. **Nome da marca** — exibido no primeiro e último slides
6. **@ do Instagram** — mostrado no header
7. **Cor principal** — código hex ou descrição (ex: "azul marinho", "#1E3A5F")
8. **Logo** — SVG, URL, usar inicial do nome, ou pular?
9. **Estilo de fonte** — editorial (serif+sans), moderno (só sans), ou específica?
10. **Tom de voz** — profissional, casual, provocativo, minimalista?

### Atalho: se o usuário já forneceu marca antes

Se existir contexto de marca em `squads/conteudo/data/nucleo.md` ou em memória, usar esses dados e pular Bloco 2. Confirmar: "Vou usar a marca X com cor Y. OK?"

### Atalho: modo rápido

Se o usuário disser "carrossel rápido sobre X" ou "faz um carrossel sobre X":
- Perguntar APENAS: marca, cor, público
- Usar defaults: 7 slides, tom provocativo, fonte moderna, intenção atração

---

## FASE 2: Copy (Gerar Conteúdo Persuasivo)

### 2.1 Escolher tipo de post + framework

Com base no tema e intenção, selecionar automaticamente:

| Intenção | Tipo Recomendado | Framework Recomendado |
|----------|------------------|-----------------------|
| Atração | Polêmico ou Curiosidade | Abertura Curiosa ou Pergunta Impactante |
| Consciência | Crença ou Problema | Benefício Direto ou Lista Valiosa |
| Aquecimento | Imperial ou História | Autoridade ou Testemunho Real |
| Venda | Oferta ou Imperial | Benefício Direto ou Urgência |

Referências completas em:
- `squads/conteudo/data/tipos-de-post.md` — 7 tipos narrativos
- `squads/conteudo/data/frameworks-copy.md` — 9 frameworks
- `squads/conteudo/data/templates-prompt-carrossel.md` — 8 templates especializados

### 2.2 Gerar copy slide a slide

Para cada slide, gerar texto seguindo estas regras (NON-NEGOTIABLE):

- **Slide 1 (Hook):** máximo 15 palavras. Sem pergunta. Choque, curiosidade ou tensão pura. Gerar 3 variações.
- **Slides intermediários:** máximo 30 palavras por slide. Cada slide adiciona informação nova.
- **Último slide (CTA):** comando claro + palavra-chave. Gerar 3 variações.
- **Progressão emocional:** Reptiliano (1-3) → Límbico (4-6) → Neocórtex (7+)
- **Nunca:** usar "dica", emojis excessivos, linguagem genérica de IA

### 2.3 Apresentar copy para aprovação

Mostrar ao usuário:

```
📝 COPY DO CARROSSEL — [Tipo] + [Framework]
Tema: [tema]
Slides: [X]

🎯 HOOKS (escolha 1):
  A) "texto opção 1"
  B) "texto opção 2"
  C) "texto opção 3"

📄 SLIDES:
  S1: [hook selecionado]
  S2: [texto]
  S3: [texto]
  ...

🚀 CTAs (escolha 1):
  A) "texto opção 1"
  B) "texto opção 2"
  C) "texto opção 3"

📱 CAPTION SUGERIDA:
  [legenda 170-250 palavras + hashtags]
```

**CHECKPOINT:** Aguardar aprovação antes de renderizar. Se o usuário ajustar, aplicar e mostrar novamente.

---

## FASE 3: Design (Gerar HTML Visual)

### 3.1 Derivar sistema de cores

A partir da COR PRINCIPAL fornecida pelo usuário, calcular 6 tokens:

```
BRAND_PRIMARY   = {cor do usuário}                     // Destaque: barra de progresso, ícones, tags
BRAND_LIGHT     = {primary clareada ~20%}               // Tags em fundo escuro, pills
BRAND_DARK      = {primary escurecida ~30%}             // Texto do CTA, âncora do gradiente
LIGHT_BG        = {off-white com tom da marca}          // Fundo slides claros (nunca #fff puro)
LIGHT_BORDER    = {1 tom mais escuro que LIGHT_BG}      // Divisores em slides claros
DARK_BG         = {quase-preto com tom da marca}        // Fundo slides escuros
```

Regras:
- Cor quente (vermelho, laranja, amarelo) → LIGHT_BG creme, DARK_BG `#1A1918`
- Cor fria (azul, verde, roxo) → LIGHT_BG cinza-azulado, DARK_BG `#0F172A`
- Gradiente da marca: `linear-gradient(165deg, BRAND_DARK 0%, BRAND_PRIMARY 50%, BRAND_LIGHT 100%)`

### 3.2 Escolher tipografia

| Estilo do Usuário | Fonte Título | Fonte Corpo |
|--------------------|--------------|-------------|
| Editorial / premium | Playfair Display | DM Sans |
| Moderno / limpo | Plus Jakarta Sans (700) | Plus Jakarta Sans (400) |
| Acolhedor / amigável | Lora | Nunito Sans |
| Técnico / afiado | Space Grotesk | Space Grotesk |
| Ousado / expressivo | Fraunces | Outfit |
| Clássico / confiável | Libre Baskerville | Work Sans |

Escala fixa:
- Títulos: 28–34px, peso 600, letter-spacing -0.3 a -0.5px, line-height 1.1–1.15
- Corpo: 14px, peso 400, line-height 1.5–1.55
- Tags/rótulos: 10px, peso 600, letter-spacing 2px, caixa alta
- Números de etapa: fonte título, 26px, peso 300

### 3.3 Gerar HTML dos slides

Gerar UM arquivo HTML por slide, seguindo a spec em `skills/carrossel-instagram/references/design-system.md`.

Cada HTML:
- Self-contained (CSS inline, Google Fonts via `@import`)
- Viewport: `1080px × 1350px` (4:5 Instagram)
- Inclui: barra de progresso, seta de arraste (exceto último slide)
- Alterna fundos LIGHT_BG ↔ DARK_BG para ritmo visual

Sequência padrão de fundos para 7 slides:

| Slide | Tipo | Fundo |
|-------|------|-------|
| 1 | Hero/Hook | LIGHT_BG |
| 2 | Problema/Contexto | DARK_BG |
| 3 | Solução/Tese | Gradiente da marca |
| 4 | Features/Lista | LIGHT_BG |
| 5 | Profundidade | DARK_BG |
| 6 | Passo a passo | LIGHT_BG |
| 7 | CTA | Gradiente da marca |

Salvar HTMLs em:
```
squads/conteudo/output/carrossel-{slug}/slide-01.html
squads/conteudo/output/carrossel-{slug}/slide-02.html
...
```

---

## FASE 4: Renderização (HTML → PNG)

Usar o workflow do `skills/image-creator/SKILL.md`:

1. Iniciar HTTP server local:
   ```bash
   python3 -m http.server 8765 --directory "OUTPUT_DIR" &
   for i in $(seq 1 30); do curl -s http://localhost:8765 > /dev/null 2>&1 && break || sleep 0.1; done
   ```

2. Para cada slide HTML, via Playwright MCP:
   - `browser_navigate` → `http://localhost:8765/slide-{N}.html`
   - `browser_resize` → `1080 × 1350`
   - `browser_take_screenshot` → salvar como `slide-{N}.png`

3. Verificar qualidade: ler cada screenshot e confirmar legibilidade

4. Parar server:
   ```bash
   pkill -f "http.server 8765" 2>/dev/null || true
   ```

---

## FASE 5: Entrega

Mostrar ao usuário:

```
✅ CARROSSEL PRONTO

📁 Arquivos:
  squads/conteudo/output/carrossel-{slug}/
  ├── slide-01.png  (Hook)
  ├── slide-02.png  (Problema)
  ├── slide-03.png  (Solução)
  ├── slide-04.png  (Features)
  ├── slide-05.png  (Profundidade)
  ├── slide-06.png  (Passo a passo)
  └── slide-07.png  (CTA)

📱 Caption:
  [caption copiável]

🏷️ Hashtags:
  [hashtags]

📤 Para publicar: use /instagram-publisher com as imagens acima
```

---

## Referências Internas

| Recurso | Caminho | O que tem |
|---------|---------|-----------|
| Tipos de post | `squads/conteudo/data/tipos-de-post.md` | 7 narrativas completas |
| Frameworks de copy | `squads/conteudo/data/frameworks-copy.md` | 9 abordagens |
| Templates de prompt | `squads/conteudo/data/templates-prompt-carrossel.md` | 8 prompts especializados |
| Design system | `skills/carrossel-instagram/references/design-system.md` | Componentes HTML/CSS |
| Image creator | `skills/image-creator/SKILL.md` | Workflow de renderização |
| Instagram publisher | `skills/instagram-publisher/SKILL.md` | Publicação via API |

---

## Modo Avançado

### Com mind clone

Se o usuário especificar uma persona (ex: "carrossel no tom do Alex Hormozi"):
1. Carregar mind de `squads/mind-cloning/minds/{slug}/`
2. Aplicar Voice DNA no tom da copy
3. Manter estrutura de slides e design intactos

### Com imagens do usuário

Se o usuário fornecer imagens:
1. Incorporar como `<img>` nos HTMLs (path absoluto ou base64)
2. Ajustar layout para acomodar imagem + texto
3. Manter regras de legibilidade (texto sobre imagem precisa de overlay)

### Sem renderização PNG

Se Playwright não estiver disponível, entregar apenas os HTMLs:
- O usuário pode abrir no browser e fazer screenshot manual
- Ou usar ferramentas externas de HTML→PNG
