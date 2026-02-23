# Lovable Cria Quiz - Interaction Design & Animations

**Story:** LOV-1 Lovable Quiz Integration
**Author:** @ux-design-expert (Uma)
**Date:** 2026-02-22

---

## 1. Screen Transitions

[AUTO-DECISION] Transition type? --> Slide-left with fade (reason: slide communicates forward progress which reinforces the quiz momentum; pure fade feels static; slide-right would feel like going backward; Lovable handles CSS transitions well)

| Transition | Duration | Easing | CSS |
|-----------|----------|--------|-----|
| Question to question | 300ms | ease-out | `transform: translateX(-100%); opacity: 0` entering from right |
| Entry to Q1 | 400ms | ease-out | Same slide-left |
| Q7 to Loading | 500ms | ease-in-out | Fade only (no slide -- signals mode change) |
| Loading to Result | 600ms | ease-out | Fade-up (`translateY(20px)` to `translateY(0)`) |

### Implementation

```css
/* Question transition */
.question-enter {
  opacity: 0;
  transform: translateX(40px);
}
.question-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}
.question-exit {
  opacity: 1;
  transform: translateX(0);
}
.question-exit-active {
  opacity: 0;
  transform: translateX(-40px);
  transition: opacity 200ms ease-in, transform 200ms ease-in;
}

/* Result reveal */
.result-enter {
  opacity: 0;
  transform: translateY(20px);
}
.result-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 600ms ease-out, transform 600ms ease-out;
}
```

---

## 2. Button Interactions

[AUTO-DECISION] Button effect? --> Smooth scale-down on press (reason: ripple adds complexity for Lovable; bounce feels playful which clashes with the "ignition" brand; scale-down is universally understood as "pressed" and simple to implement)

| Interaction | Effect | Duration |
|------------|--------|----------|
| Hover | Background darkens, shadow grows | 200ms |
| Active/Press | `scale(0.97)`, shadow disappears | 100ms |
| Release | Return to default | 200ms |
| Disabled | No interaction | -- |

```css
.primary-button {
  transition: all 200ms ease;
}
.primary-button:hover {
  background-color: var(--accent-hover);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.35);
}
.primary-button:active {
  transform: scale(0.97);
  box-shadow: none;
  transition-duration: 100ms;
}
```

---

## 3. Progress Bar Animation

[AUTO-DECISION] Smooth fill or step-based? --> Smooth fill with slight overshoot (reason: smooth feels satisfying and modern; step-based feels mechanical; the slight overshoot using cubic-bezier adds a subtle "bounce" that creates micro-delight)

| Event | Animation |
|-------|-----------|
| Question answered | Fill expands to next percentage over 500ms |
| Easing | `cubic-bezier(0.34, 1.56, 0.64, 1)` -- slight overshoot |
| Final question | Fills to 100% with 600ms duration |

```css
.progress-fill {
  transition: width 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 4. Option Card Interactions

| Interaction | Effect | Duration |
|------------|--------|----------|
| Hover | Background shifts to `--bg-elevated`, border lightens | 150ms |
| Tap/Click | Border turns amber (2px), background gets amber tint (8%) | 150ms |
| Post-select | 200ms pause showing selected state, then auto-advance | 200ms delay |
| Other cards | Fade slightly (opacity 0.5) when one is selected | 200ms |

```css
.option-card {
  transition: all 150ms ease;
}
.option-card:hover {
  background-color: var(--bg-elevated);
  border-color: #525252;
}
.option-card[data-selected="true"] {
  border: 2px solid var(--accent-primary);
  background-color: rgba(245, 158, 11, 0.08);
}
.option-card[data-dimmed="true"] {
  opacity: 0.5;
  pointer-events: none;
}
```

**Flow after selection:**
1. Selected card highlights immediately (150ms)
2. Other cards dim (200ms)
3. 200ms pause (user sees their choice confirmed)
4. Slide transition to next question (300ms)
5. Total perceived time: ~700ms from tap to next question visible

---

## 5. Loading Screen Animations

### Spinner

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}
.spinner {
  animation: spin 1s linear infinite;
}
.spinner-container {
  animation: pulse 2s ease-in-out infinite;
}
```

### Staggered Text Fade-in

```css
.loading-text {
  opacity: 0;
  transform: translateY(8px);
  animation: fadeInUp 400ms ease-out forwards;
}
.loading-text:nth-child(1) { animation-delay: 0ms; }
.loading-text:nth-child(2) { animation-delay: 1000ms; }
.loading-text:nth-child(3) { animation-delay: 2000ms; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Background Pulse (Subtle)

```css
.loading-screen {
  background: radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.05) 0%, transparent 70%);
  animation: bgPulse 3s ease-in-out infinite;
}
@keyframes bgPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
```

---

## 6. Form Focus Animations

| Event | Effect | Duration |
|-------|--------|----------|
| Focus | Border transitions to amber, focus ring appears | 200ms |
| Label float | Label moves up 12px, shrinks to 12px, turns amber | 200ms |
| Blur (filled) | Label stays up, border returns to default, label turns muted | 200ms |
| Blur (empty) | Label returns to placeholder position | 200ms |
| Error shake | Input shakes horizontally 3 times | 400ms |

```css
/* Floating label */
.input-label {
  position: absolute;
  top: 16px;
  left: 16px;
  font-size: 16px;
  color: var(--text-muted);
  transition: all 200ms ease;
  pointer-events: none;
}
.input:focus ~ .input-label,
.input:not(:placeholder-shown) ~ .input-label {
  top: 4px;
  font-size: 12px;
  color: var(--accent-primary);
}

/* Error shake */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  50% { transform: translateX(6px); }
  75% { transform: translateX(-4px); }
}
.input-error {
  animation: shake 400ms ease;
}
```

---

## 7. Result Reveal Animation

[AUTO-DECISION] Build anticipation or instant? --> Build anticipation with staggered reveal (reason: after the loading screen builds suspense, an instant result would feel anticlimactic; staggered sections appearing one by one extends the "wow" moment and increases the perceived value of the result)

**Sequence:**

| Step | Element | Delay | Duration | Effect |
|------|---------|-------|----------|--------|
| 1 | Color band | 0ms | 300ms | Width expands from center |
| 2 | Archetype icon | 200ms | 400ms | Scale from 0.5 to 1 + fade in |
| 3 | "Voce e:" | 400ms | 300ms | Fade in |
| 4 | Archetype name | 500ms | 400ms | Fade in + slight scale up |
| 5 | Tagline | 700ms | 300ms | Fade in |
| 6 | Body + sections | 1000ms | 400ms | Fade in (all at once -- no more waiting) |
| 7 | CTA section | 1400ms | 400ms | Fade-up from 20px |

**Total reveal time:** ~1.8 seconds. Long enough to feel special, short enough to not frustrate.

```css
.reveal-item {
  opacity: 0;
  transform: translateY(12px);
  animation: revealUp 400ms ease-out forwards;
}
@keyframes revealUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Apply delays via inline style or nth-child */
```

---

## 8. Micro-interaction Summary

| Element | Trigger | Animation | Purpose |
|---------|---------|-----------|---------|
| Encouragement text | After option select | Fade-in (300ms) | Positive reinforcement |
| Progress fill | Question advance | Smooth fill with overshoot | Completion momentum |
| Card selection | Tap | Border + tint (150ms) | Immediate feedback |
| Button press | Touch/click | Scale down 0.97 (100ms) | Tactile feedback |
| Focus ring | Tab/focus | Amber ring appear (200ms) | Accessibility |
| Error shake | Invalid input | Horizontal shake (400ms) | Error attention |
| Loading text | Timed | Staggered fade-in (1s intervals) | Build suspense |
| Result sections | Page load | Staggered reveal (200ms intervals) | Anticipation |

---

## 9. Performance Considerations

- All animations use `transform` and `opacity` only (GPU-accelerated, no layout thrash)
- No animations exceed 600ms (keeps interface feeling responsive)
- `prefers-reduced-motion` media query: disable all animations, show content immediately
- Loading screen: use CSS animations only (no JS timers for the visual part)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

*Interaction Design by @ux-design-expert (Uma) | LOV-1 | Phase 2*
