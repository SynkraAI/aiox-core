# Integration Patterns with Squads

**Purpose:** How design system integrates with MMOS, CreatorOS, InnerLens
**Agent:** Design System (Builder Mode)

---

## Integration Architecture

```typescript
// Design system provides hooks
interface DesignSystemHook {
    getTokens(context: Context): Tokens;
    getComponents(): ComponentLibrary;
    applyTheme(theme: Theme): void;
}

// Squads consume
const designSystem = useDesignSystem();
const tokens = designSystem.getTokens({ personality: 'formal' });
```

---

## MMOS Integration

### Use Case: Cognitive Clone Interfaces

**Problem:** Each clone needs consistent UI that matches personality.

**Solution:** Personality-based token variations.

```typescript
// Personality token mapping
const personalityTokens = {
    formal: {
        fontFamily: 'var(--font-serif)',
        fontSize: 'var(--font-size-base)',
        spacing: 'var(--space-formal)',      // Generous
        colorPrimary: 'var(--color-corporate)',
        colorBackground: 'var(--color-neutral-50)',
    },

    casual: {
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--font-size-lg)',
        spacing: 'var(--space-relaxed)',
        colorPrimary: 'var(--color-friendly)',
        colorBackground: 'var(--color-warm)',
    },

    technical: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--font-size-sm)',
        spacing: 'var(--space-compact)',
        colorPrimary: 'var(--color-technical)',
        colorBackground: 'var(--color-dark)',
    },
};

// Usage in MMOS
<CloneChatInterface
    personality="formal"
    tokens={personalityTokens.formal}
/>
```

### Components Generated

- `CloneChatInterface` (Input + MessageBubble + Avatar)
- `CloneAvatar` (with personality-based styling)
- `CloneSettings` (form fields for clone config)

---

## CreatorOS Integration

### Use Case: Course Platform UIs

**Problem:** Educational interfaces need readability and accessibility.

**Solution:** Learning-optimized tokens.

```typescript
// Educational tokens
const educationalTokens = {
    fontSize: '18px',              // Larger for readability
    lineHeight: 1.6,               // Comprehension
    spacing: 'var(--space-generous)',
    colorFocus: 'var(--color-highlight)',
    colorProgress: 'var(--color-success)',
    colorError: 'var(--color-error)',
};

// Usage in CreatorOS
<CourseVideoPlayer
    tokens={educationalTokens}
    accessibility="WCAG AAA"
/>
```

### Components Generated

- `CourseVideoPlayer` (with controls, transcript, progress)
- `QuizQuestion` (with validation UI)
- `ProgressBar` (visual reinforcement)
- `ChapterNavigation` (clear structure)

---

## InnerLens Integration

### Use Case: Psychometric Assessment Forms

**Problem:** Tests need minimal distractions, neutral design.

**Solution:** Minimal distraction tokens.

```typescript
// Minimal tokens
const minimalTokens = {
    colorPrimary: 'var(--color-neutral-700)',
    colorBackground: 'var(--color-neutral-50)',
    colorBorder: 'var(--color-neutral-200)',
    spacing: 'var(--space-balanced)',
    fontSize: 'var(--font-size-base)',
    // No decorative elements
};

// Usage in InnerLens
<AssessmentForm
    tokens={minimalTokens}
    questionUI={<QuestionPrompt />}
    inputUI={<RadioGroup />}
/>
```

### Components Generated

- `QuestionPrompt` (clear, minimal)
- `RadioGroup` (clean radio buttons)
- `ScaleInput` (Likert scale UI)
- `ProgressIndicator` (non-distracting)

---

## Integration Workflow

### Step 1: Define Pack-Specific Tokens

```yaml
# Squads/mmos/.design-system/tokens/
formal-personality.yaml
casual-personality.yaml
technical-personality.yaml
```

### Step 2: Generate Pack Components

```bash
*agent design-system
*integrate mmos

# Generates MMOS-specific components
# Uses personality tokens
# Creates integration docs
```

### Step 3: Test Integration

```typescript
// Test that MMOS can use design system
import { CloneChatInterface } from '@design-system/mmos';
import { personalityTokens } from '@design-system/tokens';

test('formal clone uses correct tokens', () => {
    const { container } = render(
        <CloneChatInterface personality="formal" />
    );

    expect(container).toHaveStyle({
        fontFamily: personalityTokens.formal.fontFamily,
    });
});
```

---

## Integration Checklist

- [ ] Token variations defined for pack
- [ ] Pack-specific components generated
- [ ] Integration tests pass
- [ ] Documentation created
- [ ] No regressions in pack functionality
- [ ] Pack can import and use components
- [ ] Token changes propagate to pack

---

## Notes

- Each pack has unique requirements
- Token variations maintain consistency
- Components extend base system (don't replace)
- Integration is bidirectional (pack ↔ design system)
- Document in both pack README and design system docs
