# ⚡ Animation Library Build - Workflow Completo

## Objetivo

Criar biblioteca de 50+ animações reutilizáveis para vídeos virais

## Timeline

**Duração:** 1-2 semanas

## Agentes Envolvidos

- **@motion-master** (líder)
- **@animation-pro** (implementação)
- **@effects-master** (efeitos especiais)
- **@remotion-architect** (arquitetura)

---

## FASE 1: Research & Cataloging (Dias 1-2)

### 1.1 Viral Motion Patterns

```
@motion-master: *catalog-patterns

RESEARCH:
- Analisar top 50 virais do nicho
- Identificar motion patterns recorrentes
- Documentar timing e easing
- Categorizar por uso
```

### 1.2 Pattern Categories

```
HOOKS (0-3s):
- Pattern interrupts
- Text slams
- Zoom impacts
- Split reveals

BODY (3-50s):
- Smooth transitions
- Info reveals
- List animations
- Progress indicators

CTA (50-60s):
- Attention grabbers
- Button animations
- Follow prompts
```

**DELIVERABLE:** Catálogo de 50+ patterns

---

## FASE 2: Core Animations (Dias 3-5)

### 2.1 Entrance Animations

```typescript
@animation-pro: *implement-entrances

// Example: PopIn
export const usePopIn = (frame: number, delay = 0) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 12, stiffness: 200 }
  });
  return {
    scale: interpolate(progress, [0, 1], [0, 1]),
    opacity: progress
  };
};

ENTRANCES (15):
- fadeIn, slideUp, slideDown, slideLeft, slideRight
- scaleIn, popIn, dropIn, typeIn, wordReveal
- lineReveal, blurIn, zoomIn, spinIn, bounceIn
```

### 2.2 Exit Animations

```typescript
@animation-pro: *implement-exits

EXITS (10):
- fadeOut, slideOutUp, slideOutDown
- scaleOut, popOut, blurOut
- zoomOut, dropOut, spinOut, bounceOut
```

### 2.3 Transitions

```typescript
@effects-master: *implement-transitions

TRANSITIONS (15):
- crossFade, slideReplace, scaleReplace
- wipeLeft, wipeRight, wipeUp, wipeDown
- circleReveal, pixelDissolve, zoomTransition
- spinTransition, flipTransition, splitTransition
- morphTransition, glitchTransition
```

### 2.4 Emphasis

```typescript
@motion-master: *implement-emphasis

EMPHASIS (10):
- pulse, shake, wiggle, glow, highlight
- underline, strike, circleEmphasis
- arrowPoint, sparkle
```

---

## FASE 3: Custom Hooks (Dias 6-8)

### 3.1 Animation Hooks

```typescript
@remotion-architect: *create-hooks

// useAnimation - Universal animation hook
export const useAnimation = (
  type: AnimationType,
  frame: number,
  options?: AnimationOptions
) => {
  // Returns transform, opacity, filter values
};

// useSequence - Chain animations
export const useSequence = (
  animations: Animation[],
  frame: number
) => {
  // Returns current animation state
};

// useStagger - Staggered animations
export const useStagger = (
  count: number,
  frame: number,
  delay: number
) => {
  // Returns array of animation states
};
```

### 3.2 Timing Utilities

```typescript
// Timing helpers
export const timing = {
  instant: 0,
  fast: 10, // 0.33s
  normal: 15, // 0.5s
  slow: 30, // 1s
  verySlow: 60, // 2s
};

// Easing presets
export const easing = {
  smooth: { damping: 15, stiffness: 100 },
  snappy: { damping: 12, stiffness: 200 },
  bouncy: { damping: 8, stiffness: 150 },
  gentle: { damping: 20, stiffness: 80 },
};
```

---

## FASE 4: Testing & Performance (Dias 9-10)

### 4.1 Performance Testing

```
@render-master: *test-performance

TESTS:
- Each animation at 60fps
- Memory usage
- Render time
- Mobile performance

TARGETS:
- 60fps consistent
- <50MB memory
- <100ms per frame
```

### 4.2 Visual Testing

```
@motion-master: *visual-qa

TESTS:
- All animations preview
- Edge cases (long text, etc)
- Mobile rendering (1080x1920)
- Combination tests
```

**DEBATE:** Performance vs Visual impact

---

## FASE 5: Documentation (Dias 11-14)

### 5.1 Usage Docs

```markdown
# Animation Library

## Basic Usage

import { useAnimation } from './animations';

const MyComponent = () => {
const frame = useCurrentFrame();
const anim = useAnimation('popIn', frame);

return (

<div style={{
      transform: `scale(${anim.scale})`,
      opacity: anim.opacity
    }}>
Content
</div>
);
};
```

### 5.2 Catalog

```
ANIMATION CATALOG:

| Name | Type | Duration | Best For |
|------|------|----------|----------|
| popIn | Entrance | 0.5s | CTAs, emphasis |
| slideUp | Entrance | 0.5s | Text reveals |
| fadeOut | Exit | 0.3s | Clean exits |
...
```

---

## Output Final

### Deliverables

1. ✅ 50+ animações implementadas
2. ✅ Custom hooks reutilizáveis
3. ✅ Timing/easing presets
4. ✅ Performance optimized
5. ✅ Documentação completa

### Files Structure

```
/animations
  /entrances
    fadeIn.ts
    popIn.ts
    ... (15 files)
  /exits
    fadeOut.ts
    ... (10 files)
  /transitions
    crossFade.ts
    ... (15 files)
  /emphasis
    pulse.ts
    ... (10 files)
  /hooks
    useAnimation.ts
    useSequence.ts
    useStagger.ts
  /utils
    timing.ts
    easing.ts
  index.ts
  README.md
```

### Quality Checklist

- [ ] 50+ animations implemented
- [ ] All hooks working
- [ ] 60fps performance
- [ ] Mobile tested
- [ ] Documentation complete
