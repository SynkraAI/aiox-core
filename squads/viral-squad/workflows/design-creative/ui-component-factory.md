# ✨ UI Component Factory

Workflow para criar componentes UI de alta qualidade usando 21st.dev MCP e integrá-los com Remotion.

## Metadata

```yaml
name: ui-component-factory
command: /viral:ui-component-factory
category: design-creative
duration: 30min - 2h
agents:
  - "@ui-magic" # Lead
  - "@visual-impact"
  - "@remotion-architect"
  - "@motion-master"
mcp_tools:
  - mcp__magic__21st_magic_component_builder
  - mcp__magic__21st_magic_component_inspiration
  - mcp__magic__21st_magic_component_refiner
  - mcp__magic__logo_search
```

## Quando Usar

- Criar componentes UI profissionais para vídeos
- Buscar inspiração visual de alta qualidade
- Refinar componentes existentes
- Adicionar logos de marcas aos vídeos

## Workflow Steps

### Phase 1: Discovery (10min)

#### Step 1.1: Gather Requirements

```
@ui-magic: "Qual tipo de componente você precisa?"

Opções comuns:
1. Text Card (statements, quotes, stats)
2. CTA Button (subscribe, like, follow)
3. Lower Third (name tags, titles)
4. Hero Section (opening frames)
5. Social Proof (testimonials, metrics)
6. Logo Display (brand integrations)
7. Custom (descreva sua necessidade)
```

#### Step 1.2: Get Inspiration

```bash
# Buscar inspiração via 21st.dev
@ui-magic *get-inspiration "[tipo de componente]"
```

**MCP Call:**

```yaml
tool: mcp__magic__21st_magic_component_inspiration
params:
  message: "[User's full request]"
  searchQuery: "[2-4 word query]"
```

#### Step 1.3: Debate - Visual Direction

```
DEBATE POINT: Direção visual do componente

Participantes:
- @ui-magic (lead) - Propõe opções do 21st.dev
- @visual-impact (2x) - Valida impacto visual
- @motion-master (1.5x) - Considera animações

Output: Direção visual aprovada
```

### Phase 2: Creation (20min)

#### Step 2.0: Token Import Obrigatorio

**ANTES de qualquer geracao de codigo**, garantir que os tokens do Design System estao acessiveis. Nenhum componente pode ser criado sem essa base.

```typescript
// IMPORT OBRIGATORIO - deve estar presente em TODO componente Remotion
import {
  colors,
  typography,
  spacing,
  animation,
  video,
  layout,
} from "@/styles/tokens";
```

**Fonte de verdade:** `academia-lendaria-ds/src/tokens/remotion.ts`
**Re-export no projeto:** `viral-automacao-video/src/styles/tokens.ts`

```
CHECKLIST PRE-GERACAO:
[ ] Arquivo @/styles/tokens.ts existe e re-exporta corretamente
[ ] Token colors disponivel (background, foreground, primary, muted)
[ ] Token typography disponivel (ui, body, weights, sizes)
[ ] Token spacing disponivel (xs, sm, md, lg, xl, xxl)
[ ] Token animation disponivel (fast, normal, slow, easing)
[ ] Token video disponivel (width, height, fps)
[ ] Token layout disponivel (safeZone, margin, contentWidth)
```

> Para referencia completa dos tokens, consulte `workflows/design-creative/21st-to-remotion-pipeline.md`

#### Step 2.1: Build Component

```bash
# Criar componente via 21st.dev
@ui-magic *build-component "[descrição detalhada]"
```

**MCP Call:**

```yaml
tool: mcp__magic__21st_magic_component_builder
params:
  message: "[Full user message with context]"
  searchQuery: "[optimized search query]"
  absolutePathToCurrentFile: "[target file path]"
  absolutePathToProjectDirectory: "[project root]"
  standaloneRequestQuery: "[extracted component spec]"
```

#### Step 2.2: Apply Design System + Tailwind-to-Inline Transformation

Aplicar Academia Lendaria v4.1 e converter Tailwind para inline styles:

```typescript
// Cores (importar de @/styles/tokens, NAO hardcodar)
import { colors, typography, spacing } from "@/styles/tokens";

// colors.background = "#000000"  (70% da tela)
// colors.foreground = "#FFFFFF"  (22% da tela)
// colors.primary    = "#C9B298"  (MAX 8% - REGRA SAGRADA)
// colors.muted      = "#A8A8A8"

// typography.ui   = 'Inter, system-ui, sans-serif'   (SemiBold 600)
// typography.body = '"Source Serif 4", Georgia, serif' (Regular 400)
```

**CHECKLIST DE TRANSFORMACAO Tailwind -> Inline Style:**

```
CONVERSAO OBRIGATORIA (executar nesta ordem):

1. REMOCAO
   [ ] Remover TODOS os className do componente
   [ ] Remover hover:*, focus:*, active:* (nao existem em video)
   [ ] Remover cursor-pointer, transition, @keyframes
   [ ] Remover media queries (md:, lg:) - video e 1080x1920 fixo
   [ ] Remover useState, useEffect, onClick, onMouseEnter

2. ESTILOS (className -> style={{}})
   [ ] Converter bg-* para backgroundColor com token colors.*
   [ ] Converter text-[cor] para color com token colors.*
   [ ] Converter text-[tamanho] para fontSize com token typography.sizes.*
   [ ] Converter font-* para fontFamily/fontWeight com token typography.*
   [ ] Converter p-*/m-*/gap-* para spacing com token spacing.*
   [ ] Converter flex/items/justify para inline equivalente
   [ ] Converter rounded-* para borderRadius numerico
   [ ] Converter shadow-* para boxShadow string

3. ANIMACOES (CSS -> Remotion)
   [ ] Adicionar useCurrentFrame() no topo do componente
   [ ] Converter animate-fade-in para interpolate(frame, ...)
   [ ] Converter animate-scale para spring({ frame, ... })
   [ ] Converter transition-* para interpolate ou spring baseado em frame
   [ ] Adicionar extrapolateRight: 'clamp' em todo interpolate

4. VALIDACAO FINAL
   [ ] Zero ocorrencias de className no arquivo
   [ ] Todos os valores de cor usando tokens (sem hex hardcoded)
   [ ] Todos os tamanhos de fonte usando typography.sizes.*
   [ ] Todos os espacamentos usando spacing.*
```

> Para tabelas completas de conversao Tailwind -> Inline, consulte `workflows/design-creative/21st-to-remotion-pipeline.md`

#### Step 2.3: Add Logos (if needed)

```bash
# Adicionar logos de marcas
@ui-magic *add-logo "[lista de marcas]"
```

**MCP Call:**

```yaml
tool: mcp__magic__logo_search
params:
  queries: ["brand1", "brand2"]
  format: "TSX"
```

### Phase 3: Remotion Integration (15min)

#### Step 3.1: Adapt for Remotion

```typescript
// @remotion-architect adapta o componente

import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const ViralComponent: React.FC<ComponentProps> = (props) => {
  const frame = useCurrentFrame();

  // Fade in animation
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp'
  });

  // Scale animation
  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* 21st.dev component adapted */}
      <UIComponent {...props} />
    </AbsoluteFill>
  );
};
```

#### Step 3.2: 8% Gold Rule Validation

**PASSO OBRIGATORIO** antes de prosseguir. Validar que o gold (#C9B298 / `colors.primary`) respeita o limite de 8% da area visivel.

```
VALIDACAO DA REGRA 8% GOLD:

Area total da tela: 1080 x 1920 = 2.073.600 px
Limite gold (8%): 165.888 px

CALCULAR:
[ ] Listar todos os elementos que usam colors.primary (fill, background, border)
[ ] Para cada elemento: largura x altura = area gold
    - Bordas: perimetro x espessura (ex: 200x2 + 200x2 = 800px)
    - Icones: largura x altura do path preenchido
    - Textos: IGNORAR (texto gold conta muito pouco)
    - Backgrounds: largura x altura total do elemento
[ ] Somar area total de gold
[ ] Dividir por 2.073.600 e multiplicar por 100 = percentual

RESULTADO:
[ ] Se <= 8%: APROVADO - prosseguir
[ ] Se > 8%: REPROVADO - aplicar correcoes abaixo

CORRECOES (se reprovado):
- Trocar backgroundColor gold por borderColor gold (2px)
- Reduzir tamanho de elementos gold
- Usar opacity baixa: rgba(201, 178, 152, 0.15)
- Converter fill para outline/stroke
- Limitar gold a um unico elemento focal por cena
```

> Para exemplos detalhados de calculo, consulte `workflows/design-creative/21st-to-remotion-pipeline.md` (Passo 6 do Exemplo Completo)

#### Step 3.3: Add Animations

```
@motion-master adiciona animacoes:
- Entry animation (fade, scale, slide)
- Exit animation
- Timing optimization
- NOTA: hover states NAO existem em video -- remover se presentes
```

### Phase 4: Refinement (15min)

#### Step 4.1: Refine Component

```bash
# Refinar se necessário
@ui-magic *refine-ui /path/to/component.tsx "[melhorias]"
```

**MCP Call:**

```yaml
tool: mcp__magic__21st_magic_component_refiner
params:
  userMessage: "[refinement request]"
  absolutePathToRefiningFile: "[component path]"
  context: "[specific improvements]"
```

#### Step 4.2: Final Validation

```
CHECKLIST DE QUALIDADE:

[ ] Design System compliance (8% gold rule)
[ ] Remotion compatible (no CSS animations conflicting)
[ ] Performance optimized (memoization where needed)
[ ] Responsive (works in 1080x1920)
[ ] Accessible (contrast, readability)
[ ] Animated smoothly (60fps)
```

### Phase 5: Export & Document

#### Step 5.1: File Structure

```
src/components/ui/
├── [ComponentName]/
│   ├── index.tsx           # Main component
│   ├── [ComponentName].tsx # Implementation
│   ├── styles.ts           # Styled components (if any)
│   └── types.ts            # TypeScript types
```

#### Step 5.2: Usage Documentation

```typescript
/**
 * [ComponentName]
 * Created via 21st.dev MCP
 *
 * @usage
 * <Sequence from={0} durationInFrames={90}>
 *   <ComponentName
 *     title="Your Title"
 *     subtitle="Your Subtitle"
 *   />
 * </Sequence>
 */
```

## Common Patterns

### Pattern 1: Viral Text Card

```bash
/viral:ui-component-factory

Request: "Text card for bold statement with gold accent"

Output: Card component with:
- Black background
- White bold text
- 8% gold border/accent
- Fade + scale entry animation
```

### Pattern 2: CTA Button

```bash
/viral:ui-component-factory

Request: "Subscribe button with pulse animation"

Output: Button component with:
- Gold background (#C9B298)
- Black text
- Pulse animation on loop
- Click effect
```

### Pattern 3: Lower Third

```bash
/viral:ui-component-factory

Request: "Name tag lower third for speaker"

Output: Lower third with:
- Left-aligned layout
- Name in white
- Title in gold
- Slide-in animation
- Background blur
```

### Pattern 4: Social Proof Grid

```bash
/viral:ui-component-factory

Request: "Grid showing 3 brand logos"

Output: Grid component with:
- Responsive layout
- Logos via logo_search
- Staggered entry
- Consistent sizing
```

## Tips

### Otimizar Busca 21st.dev

```
❌ "Um card bonito para mostrar texto"
✅ "text card gradient border"

❌ "Botão de inscrever"
✅ "subscribe button pulse"

❌ "Coisa para mostrar nome"
✅ "name tag lower third"
```

### Adaptar para Vídeo

```typescript
// Web component → Video component

// Remove hover states (no mouse in video)
// Replace CSS animations with Remotion interpolate
// Ensure fixed dimensions
// Optimize for 30fps rendering
```

## Troubleshooting

### 21st.dev não retornou resultado

1. Refine search query (2-4 words)
2. Try alternative terms
3. Use inspiration tool first
4. Build custom if needed

### Componente não renderiza no Remotion

1. Check for CSS animations (conflitam)
2. Verify absolute positioning
3. Ensure dimensions are fixed
4. Remove client-side only hooks

### Performance issues

1. Memoize expensive calculations
2. Preload assets
3. Simplify animations
4. Reduce component complexity

---

**UI Component Factory - Componentes profissionais via 21st.dev** ✨
