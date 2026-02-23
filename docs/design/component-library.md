# Lovable Cria Quiz - Component Library

**Story:** LOV-1 Lovable Quiz Integration
**Author:** @ux-design-expert (Uma)
**Date:** 2026-02-22

---

## Atoms

### 1. TextInput

**Props:** `label`, `placeholder`, `type`, `value`, `error`, `prefix`

| State | Border | Background | Label Color |
|-------|--------|-----------|-------------|
| Default | `--border-default` (#2E2E2E) | `--bg-secondary` (#1A1A1A) | `--text-secondary` (#A3A3A3) |
| Focus | `--border-focus` (#F59E0B) 2px | `--bg-secondary` | `--accent-primary` (#F59E0B) |
| Filled | `--border-default` | `--bg-secondary` | `--text-secondary` |
| Error | `--error` (#EF4444) 2px | `--bg-secondary` | `--error` |
| Success | `--success` (#22C55E) 1px | `--bg-secondary` | `--text-secondary` |

**Specs:**
- Height: 52px
- Border-radius: 8px (`rounded-lg`)
- Padding: 16px horizontal
- Font: 16px regular (prevents mobile zoom)
- Label: floating above, 14px, transitions on focus
- WhatsApp variant: static "+55" prefix inside left side

**Tailwind:**
```
<input class="w-full h-[52px] bg-cria-bg-secondary border border-cria-border
  rounded-lg px-4 text-base text-white placeholder:text-neutral-500
  focus:border-cria-accent focus:ring-2 focus:ring-cria-accent/30
  focus:outline-none transition-colors" />
```

---

### 2. PrimaryButton

**Props:** `children`, `onClick`, `disabled`, `loading`, `variant`

| State | Background | Text | Shadow |
|-------|-----------|------|--------|
| Default | `--accent-primary` (#F59E0B) | #0F0F0F (dark) | `cta-glow` |
| Hover | `--accent-hover` (#D97706) | #0F0F0F | `cta-glow-hover` |
| Active/Pressed | `--accent-pressed` (#B45309) | #0F0F0F | none |
| Disabled | #404040 | #737373 | none |
| Loading | `--accent-primary` 60% opacity | spinner | none |

**Specs:**
- Height: 56px
- Border-radius: 12px (`rounded-card`)
- Font: 16px bold, uppercase tracking
- Full width on mobile
- Min touch target: 48x48px (exceeds with 56px height)

**Tailwind:**
```
<button class="w-full h-14 bg-cria-accent text-cria-bg font-bold text-base
  rounded-card shadow-cta-glow hover:bg-cria-accent-hover
  hover:shadow-cta-glow-hover active:bg-cria-accent-pressed
  active:shadow-none disabled:bg-neutral-700 disabled:text-neutral-500
  disabled:shadow-none transition-all duration-200" />
```

---

### 3. SecondaryButton

**Props:** `children`, `onClick`, `disabled`

| State | Border | Background | Text |
|-------|--------|-----------|------|
| Default | `--border-default` 1px | transparent | `--text-primary` |
| Hover | `--text-secondary` 1px | #1A1A1A | `--text-primary` |
| Active | `--accent-primary` 1px | #252525 | `--accent-primary` |

**Specs:**
- Height: 52px
- Border-radius: 12px
- Font: 16px semi-bold

**Tailwind:**
```
<button class="w-full h-[52px] border border-cria-border bg-transparent
  text-white font-semibold text-base rounded-card
  hover:bg-cria-bg-secondary hover:border-neutral-500
  active:border-cria-accent active:text-cria-accent
  transition-all duration-200" />
```

---

### 4. WhatsAppButton (PrimaryButton variant)

| State | Background | Icon |
|-------|-----------|------|
| Default | `--whatsapp` (#25D366) | WhatsApp icon (white) |
| Hover | #1EBE5A | WhatsApp icon (white) |

**Specs:**
- Same as PrimaryButton but with WhatsApp green
- Includes WhatsApp SVG icon on the left (20px)
- Text: "Receber no WhatsApp"
- "(recomendado)" as smaller text or badge

---

### 5. ProgressBar

**Props:** `current` (1-7), `total` (7)

**Specs:**
- Height: 4px
- Background track: `--bg-elevated` (#252525)
- Fill: `--accent-primary` (#F59E0B)
- Border-radius: full (pill)
- Width: 100%
- Fill percentage: (current / total) * 100

**Tailwind:**
```
<div class="w-full h-1 bg-cria-bg-elevated rounded-full overflow-hidden">
  <div class="h-full bg-cria-accent rounded-full transition-all duration-500 ease-out"
    style="width: {percentage}%" />
</div>
```

**Animation:** Fill transitions smoothly over 500ms (`transition-all duration-500 ease-out`)

---

### 6. OptionCard

**Props:** `label` (A/B/C/D), `text`, `selected`, `onClick`

| State | Border | Background | Label Color |
|-------|--------|-----------|-------------|
| Default | `--border-default` 1px | `--bg-secondary` | `--text-secondary` |
| Hover | `--text-secondary` 1px | `--bg-elevated` | `--text-primary` |
| Selected | `--accent-primary` 2px | `--accent-primary` 8% | `--accent-primary` |
| Selected (brief) | Same as selected | Same | Same |

**Specs:**
- Min-height: 72px (ensures touch target)
- Border-radius: 12px
- Padding: 16px
- Letter label: left side, 20px semi-bold, fixed 32px width
- Text: right side, 16px medium, flex-1
- Layout: flex row, align-center

**Tailwind:**
```
<button class="w-full min-h-[72px] flex items-center gap-4 p-4
  bg-cria-bg-secondary border border-cria-border rounded-card
  hover:bg-cria-bg-elevated hover:border-neutral-500
  data-[selected=true]:border-cria-accent data-[selected=true]:border-2
  data-[selected=true]:bg-cria-accent/[0.08]
  transition-all duration-200 text-left cursor-pointer" />
```

**Q7 Variant (no letter label):**
- Text in italic
- Padding: 20px
- Text centered
- Slightly larger font (16px but with more line-height)

---

### 7. LoadingSpinner

**Props:** `size` (sm/md/lg)

**Specs:**
- Size: 48px (md default)
- Color: `--accent-primary`
- Animation: spin 1s linear infinite + pulse 2s ease-in-out infinite
- SVG circle with stroke-dasharray animation

---

### 8. SectionLabel

**Props:** `children`

**Specs:**
- Font: 14px bold, uppercase, letter-spacing: 0.05em
- Color: `--text-secondary`
- Margin-bottom: 8px

**Tailwind:** `text-sm font-bold uppercase tracking-wider text-neutral-400`

---

### 9. MicroCopy

**Props:** `children`, `variant` (encouragement/legal/error)

| Variant | Color | Size | Alignment |
|---------|-------|------|----------|
| encouragement | `--accent-primary` | 14px | center |
| legal | `--text-muted` | 12px | center |
| error | `--error` | 14px | left |

---

## Molecules

### 10. QuestionScreen

**Composition:** ProgressBar + QuestionCounter + QuestionHeading + OptionCard x4 + MicroCopy

**Props:** `questionNumber`, `totalQuestions`, `questionText`, `options[]`, `encouragementText?`, `onSelect`

**Layout:**
```
[ProgressBar]                    -- top, full width
[QuestionCounter]                -- "Pergunta N de 7", 14px muted
[32px gap]
[QuestionHeading]                -- H2, the question
[24px gap]
[OptionCard]                     -- 12px gap between each
[OptionCard]
[OptionCard]
[OptionCard]
[16px gap]
[MicroCopy: encouragement]       -- only after selection, fade in
```

---

### 11. EntryForm

**Composition:** Heading + SubHeading + TextInput x3 + PrimaryButton + MicroCopy

**Layout:**
```
[Logo]                           -- small, top left
[48px gap]
[Heading H1]                     -- main headline
[8px gap]
[SubHeading]                     -- "2 minutos. Resultado na hora."
[32px gap]
[TextInput: nome]                -- 16px gap between inputs
[TextInput: email]
[TextInput: whatsapp]
[24px gap]
[PrimaryButton: CTA]
[12px gap]
[MicroCopy: LGPD]
```

---

### 12. LoadingScreen

**Composition:** LoadingSpinner + AnimatedText x3

**Layout:**
```
[centered vertically]
[LoadingSpinner]
[24px gap]
[AnimatedText: "Analisando..."]       -- opacity 0->1 at 0s
[8px gap]
[AnimatedText: "Identificando..."]    -- opacity 0->1 at 1s
[8px gap]
[AnimatedText: "Preparando..."]       -- opacity 0->1 at 2s
```

---

### 13. ArchetypeResult

**Composition:** ArchetypeHeader + BodyText + StrengthsList + SectionContent x2 + CTAGroup + ShareCard

**Layout:**
```
[Color Band]                     -- full width, 4px, archetype color
[32px gap]
[Archetype Icon]                 -- 64px, archetype color tint
[8px gap]
["Voce e:"]                      -- 14px muted
[Archetype Name]                 -- H1, 32px, archetype color
[8px gap]
[Tagline]                        -- 18px italic
[32px gap]
[Body description]               -- 16px, 1.6 line-height
[32px gap]
[SectionLabel: "SEUS PONTOS FORTES"]
[StrengthsList: 3 bullets]
[32px gap]
[SectionLabel: "SEU MODELO DIGITAL IDEAL"]
[SectionContent]
[32px gap]
[SectionLabel: "SEU PROXIMO PASSO"]
[SectionContent]
[48px gap]
[CTA heading]                    -- "Seu perfil completo esta pronto..."
[16px gap]
[WhatsAppButton]
[12px gap]
[SecondaryButton: email]
[32px gap]
[ShareCard + ShareButton]
[24px gap]
[Footer]
```

---

### 14. ShareCard

**Purpose:** Screenshot-worthy card for Instagram Stories sharing

**Specs:**
- Aspect ratio: optimized for 9:16 crop
- Contains: archetype icon + name + tagline + "Descubra o seu: [link]"
- Background: archetype color gradient
- Text: white
- Size: 300px x 180px (preview in-page)
- Border-radius: 16px

---

## Component Summary Table

| Component | Type | States | Accessibility |
|-----------|------|--------|--------------|
| TextInput | Atom | default, focus, filled, error, success | aria-label, aria-invalid |
| PrimaryButton | Atom | default, hover, active, disabled, loading | aria-disabled, role=button |
| SecondaryButton | Atom | default, hover, active | role=button |
| WhatsAppButton | Atom | default, hover | aria-label with context |
| ProgressBar | Atom | dynamic fill | role=progressbar, aria-valuenow |
| OptionCard | Atom | default, hover, selected | role=radio, aria-checked |
| LoadingSpinner | Atom | spinning | role=status, aria-label="Carregando" |
| SectionLabel | Atom | static | semantic heading |
| MicroCopy | Atom | 3 variants | aria-live for encouragement |
| QuestionScreen | Molecule | per question | role=radiogroup |
| EntryForm | Molecule | form states | form with labels |
| LoadingScreen | Molecule | animated | aria-live=polite |
| ArchetypeResult | Molecule | per archetype | semantic sections |
| ShareCard | Molecule | static | decorative |

---

*Component Library by @ux-design-expert (Uma) | LOV-1 | Phase 2*
