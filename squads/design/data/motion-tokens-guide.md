# Motion Tokens — Duration, Easing & Accessibility Guide

**Source:** Industry best practices, Razorpay Blade DS reference implementation, Val Head (Tier 2 DNA)
**Purpose:** Standard for defining motion tokens and ensuring accessibility
**v4.1:** Enriched with Val Head's 5-purpose framework and UI choreography principles

---

## Motion Token Categories

### 1. Duration

How long an animation takes.

| Token | Value | Use Case |
|-------|-------|----------|
| `duration.instant` | `0ms` | Immediate state changes (checkbox toggle) |
| `duration.fast` | `100ms` | Micro-interactions (hover, focus ring) |
| `duration.normal` | `200ms` | Standard transitions (color, opacity) |
| `duration.moderate` | `300ms` | Medium transitions (expand, slide) |
| `duration.slow` | `400ms` | Larger animations (modal enter, drawer) |
| `duration.deliberate` | `600ms` | Full-page transitions, complex orchestration |

**Rule of thumb:** The bigger the element, the longer the duration. A button hover = fast. A page transition = deliberate.

### 2. Easing

How an animation accelerates/decelerates.

| Token | Cubic Bezier | Use Case |
|-------|-------------|----------|
| `easing.standard` | `[0.4, 0, 0.2, 1]` | Default for most transitions |
| `easing.entrance` | `[0, 0, 0.2, 1]` | Elements entering the viewport |
| `easing.exit` | `[0.4, 0, 1, 1]` | Elements leaving the viewport |
| `easing.emphasized` | `[0.2, 0, 0, 1]` | Attention-grabbing, primary actions |
| `easing.linear` | `[0, 0, 1, 1]` | Progress bars, continuous motion |

**W3C DTCG format:**
```json
{
  "easing": {
    "standard": {
      "$value": [0.4, 0, 0.2, 1],
      "$type": "cubicBezier",
      "$description": "Default easing for standard UI transitions"
    }
  }
}
```

### 3. Motion Actions

Semantic motion patterns combining duration + easing.

| Action | Duration | Easing | Description |
|--------|----------|--------|-------------|
| `enter` | moderate | entrance | Element appears in view |
| `exit` | normal | exit | Element leaves view |
| `expand` | moderate | standard | Container grows (accordion, dropdown) |
| `collapse` | normal | standard | Container shrinks |
| `fade-in` | normal | entrance | Opacity 0 → 1 |
| `fade-out` | fast | exit | Opacity 1 → 0 |
| `slide-in` | moderate | entrance | Element slides into position |
| `slide-out` | normal | exit | Element slides out |
| `scale-up` | normal | emphasized | Element scales from small to full |
| `scale-down` | fast | exit | Element scales from full to small |

---

## CSS Custom Properties Pattern

```css
:root {
  /* Duration */
  --motion-duration-instant: 0ms;
  --motion-duration-fast: 100ms;
  --motion-duration-normal: 200ms;
  --motion-duration-moderate: 300ms;
  --motion-duration-slow: 400ms;
  --motion-duration-deliberate: 600ms;

  /* Easing */
  --motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --motion-easing-entrance: cubic-bezier(0, 0, 0.2, 1);
  --motion-easing-exit: cubic-bezier(0.4, 0, 1, 1);
  --motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
}

/* Usage */
.modal-enter {
  transition: opacity var(--motion-duration-moderate) var(--motion-easing-entrance),
              transform var(--motion-duration-moderate) var(--motion-easing-entrance);
}
```

---

## prefers-reduced-motion — Mandatory Handling

### The Rule

**Never disable animation entirely. Reduce, don't remove.**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Better Approach — Preserve Meaning

```css
@media (prefers-reduced-motion: reduce) {
  .modal-enter {
    /* Keep opacity (low-motion), remove transform (high-motion) */
    transition: opacity var(--motion-duration-fast) var(--motion-easing-standard);
    transform: none;
  }
}
```

### What to Reduce vs. Remove

| Keep (reduced) | Remove |
|----------------|--------|
| Opacity transitions | Bouncing/spring animations |
| Color changes | Parallax scrolling |
| Simple fades | Auto-playing animations |
| State indicators | Decorative motion |

---

## Testing Motion

### Visual Regression
- Capture before/after states (not mid-animation)
- Test both motion-enabled and reduced-motion states
- Validate duration tokens match implementation

### Accessibility Audit
- [ ] prefers-reduced-motion respected on ALL animated elements
- [ ] No animation causes seizure risk (3 flashes/second max)
- [ ] Motion is not the only way to convey information
- [ ] Autoplay content has pause/stop controls
- [ ] Animation does not block interaction

### Reference: Razorpay Blade DS
Blade DS provides a production-grade reference implementation with:
- Consistent duration/easing token scale
- Shared motion primitives across components
- prefers-reduced-motion handling on every animated component
- Storybook stories showing motion in isolation

---

## Val Head's 5-Purpose Framework (v4.1)

Every animation MUST serve at least one of these purposes. If it serves none, remove it.

| Purpose | Definition | Example |
|---------|-----------|---------|
| **Orient** | Help users understand spatial relationships | Page transitions showing view hierarchy |
| **Direct Attention** | Guide focus to important elements | Notification badge animating in |
| **Show Causality** | Demonstrate cause-and-effect | Button press triggering visible action |
| **Provide Feedback** | Confirm user actions and system state | Loading spinner, success checkmark |
| **Express Brand** | Communicate brand personality through motion | Custom easing curves, signature transitions |

### UI Choreography (Val Head)

> "Animations should feel like siblings who move similarly but are different people"

- All animations in a product should have **coherent motion character**
- Never design animations in isolation — consider the full motion vocabulary
- Start with brand **voice and tone documents** as motion character input
- Custom easing curves per brand — **never use CSS defaults** (ease, ease-in-out)

### CSS vs JavaScript Decision (Val Head)

| Use CSS | Use JavaScript |
|---------|---------------|
| Simple state transitions (hover, focus) | Chaining 3+ animations |
| Single property changes | Runtime-dynamic values |
| Performance-critical (compositor thread) | Physics-based / spring easing |
| Declarative, predictable | Complex orchestration (staggered lists) |

### Motion Audit Process (Val Head)

1. **Inventory** — Catalogue ALL existing animations (CSS + JS)
2. **Evaluate UX** — Does each animation pass the 5-purpose test?
3. **Evaluate Brand** — Does motion character match brand personality?
4. **Identify Redundancy** — Similar animations with different values?
5. **Extract Tokens** — Normalize to duration/easing token scale
6. **Create System** — Define motion token system from audit findings

> "Motion has brand personality just like color and typography" — Val Head
