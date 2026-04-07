# 🎨 Design System Creation - Workflow Completo

## Objetivo

Criar Design System do projeto completo para vídeos virais

## Timeline

**Duração:** 3-4 semanas

## Agentes Envolvidos

- **@color-psychologist** (líder visual)
- **@layout-architect** (composição)
- **@remotion-architect** (implementação)
- **@ui-magic** (componentes 21st.dev)

---

## FASE 1: Foundation (Semana 1)

### 1.1 Design Tokens

```
@color-psychologist: *define-tokens

OUTPUT:
colors:
  background: "#000000"  # 70%
  foreground: "#FFFFFF"  # 22%
  primary: "#C9B298"     # MAX 8%
  muted: "#A8A8A8"

spacing:
  base: 8px
  xs: 8px | sm: 16px | md: 24px | lg: 32px | xl: 48px

typography:
  ui: "Inter SemiBold 600"
  body: "Source Serif 4 Regular 400"
```

### 1.2 Color System

```
@color-psychologist: *8-percent-rule

RULE: Primary accent color (from brand tokens) NUNCA excede 8% da tela
USO PERMITIDO: CTAs, highlights, números, borders
USO PROIBIDO: Backgrounds, texto corrido
```

### 1.3 Typography Scale

```
@layout-architect: *type-scale

HEADLINES: 48-72px (Inter SemiBold)
TITLES: 32-48px (Inter SemiBold)
LABELS: 24-32px (Inter SemiBold)
BODY: 24-32px (Source Serif 4)
SMALL: 18-24px
```

**DEBATE:** Brand consistency vs Flexibility
**DELIVERABLE:** Design tokens documentados

---

## FASE 2: Component Library (Semana 2)

### 2.1 Core Components

```
@ui-magic + @remotion-architect

COMPONENTS (20):
1. TextCard - Bold statements
2. QuoteCard - Quotes
3. StatCard - Statistics
4. CTAButton - Calls to action
5. ProgressBar - Progress indicators
6. LowerThird - Name tags
7. NumberReveal - Animated numbers
8. IconBadge - Icon + label
9. SplitScreen - Before/After
10. ListItem - Checklist items
```

### 2.2 Layout Components

```
11. HeroSection - Full screen intro
12. GridLayout - Multi-element
13. CenterStage - Single focus
14. CornerBadge - Corner elements
15. BottomBar - Bottom CTA bar
```

### 2.3 Interactive Components

```
16. PollOption - A vs B
17. CountdownTimer - Urgency
18. ReactionBubble - Emoji reactions
19. SwipeIndicator - Swipe cues
20. FollowPrompt - Follow CTA
```

**DEBATE:** Reusability vs Customization
**DELIVERABLE:** 20 componentes Remotion

---

## FASE 3: Animation Library (Semana 3)

### 3.1 Entrance Animations (15)

```
@motion-master + @animation-pro

ENTRANCES:
1. FadeIn - Opacity 0→1
2. SlideUp - Y offset + fade
3. SlideDown - Y offset + fade
4. SlideLeft - X offset + fade
5. SlideRight - X offset + fade
6. ScaleIn - Scale 0→1 + fade
7. PopIn - Spring scale
8. DropIn - Fall + bounce
9. TypeIn - Letter by letter
10. WordReveal - Word by word
11. LineReveal - Line by line
12. BlurIn - Blur + fade
13. ZoomIn - Scale + move
14. SpinIn - Rotation + fade
15. BounceIn - Spring bounce
```

### 3.2 Exit Animations (10)

```
16. FadeOut
17. SlideOutUp
18. SlideOutDown
19. ScaleOut
20. PopOut
21. BlurOut
22. ZoomOut
23. DropOut
24. SpinOut
25. BounceOut
```

### 3.3 Transition Animations (15)

```
26. CrossFade - Smooth transition
27. SlideReplace - Slide out/in
28. ScaleReplace - Scale transition
29. WipeLeft - Wipe effect
30. WipeRight
31. WipeUp
32. WipeDown
33. CircleReveal - Circular wipe
34. PixelDissolve - Pixel transition
35. ZoomTransition - Zoom through
36. SpinTransition - Rotation
37. FlipTransition - 3D flip
38. SplitTransition - Split screen
39. MorphTransition - Shape morph
40. GlitchTransition - Glitch effect
```

### 3.4 Emphasis Animations (10)

```
41. Pulse - Scale pulse
42. Shake - Horizontal shake
43. Wiggle - Rotation wiggle
44. Glow - Glow effect
45. Highlight - Color highlight
46. Underline - Animated underline
47. Strike - Strikethrough
48. CircleEmphasis - Circle around
49. ArrowPoint - Arrow pointing
50. Sparkle - Sparkle effect
```

**DEBATE:** Performance vs Visual impact
**DELIVERABLE:** 50 animações prontas

---

## FASE 4: Documentation (Semana 4)

### 4.1 Usage Guidelines

```
@tech-writer (se disponível)

DOCS:
- Color usage guide
- Typography guide
- Spacing guide
- Component catalog
- Animation catalog
- Best practices
- Do's and Don'ts
```

### 4.2 Code Examples

```
// Example: TextCard usage
import { TextCard } from './components';

<TextCard
  text="Você está ERRADO"
  size="large"
  animation="popIn"
  primary={true}
/>
```

### 4.3 Storybook/Preview

```
@remotion-architect: *preview-system

- Live preview of all components
- Animation previews
- Combination examples
- Mobile preview (1080x1920)
```

**DELIVERABLE:** Documentação completa

---

## Quality Checklist

### Design System Validation

- [ ] All colors defined
- [ ] 8% primary rule enforced
- [ ] Typography scale consistent
- [ ] Spacing system complete
- [ ] 20+ components created
- [ ] 50+ animations ready
- [ ] Documentation complete
- [ ] Mobile optimized (1080x1920)

---

## Output Final

### Deliverables

1. ✅ Design tokens (colors, spacing, typography)
2. ✅ 20 componentes Remotion
3. ✅ 50 animações prontas
4. ✅ Documentação completa
5. ✅ Preview system

### Files Structure

```
/design-system
  /tokens
    colors.ts
    spacing.ts
    typography.ts
  /components
    TextCard.tsx
    StatCard.tsx
    ... (20 components)
  /animations
    entrances.ts
    exits.ts
    transitions.ts
    emphasis.ts
  /docs
    README.md
    usage-guide.md
```
