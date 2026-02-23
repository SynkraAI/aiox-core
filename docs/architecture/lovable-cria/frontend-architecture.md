# Lovable Cria Quiz - Frontend Architecture

**Story:** LOV-1 Lovable Quiz Integration
**Author:** @architect (Aria)
**Date:** 2026-02-22

---

## 1. Component Hierarchy

```
App
 |
 +-- QuizContainer (state machine: useReducer)
      |
      +-- ProgressBar (current step / total steps)
      |
      +-- screens (conditional render based on state.step):
      |    |
      |    +-- CoverScreen          (step: 0)  -- headline + CTA "Comecar"
      |    +-- QuestionScreen       (step: 1-7) -- question text + 4 option cards
      |    +-- LeadCaptureScreen    (step: 8)   -- name + email + whatsapp form
      |    +-- LoadingScreen        (step: 9)   -- animated processing state
      |    +-- ResultScreen         (step: 10)  -- archetype reveal + CTA
      |
      +-- LgpdNotice (footer, always visible on form screen)
      |
      +-- ErrorBoundary (wraps QuizContainer)
```

### Organization: Feature-Based

[AUTO-DECISION] Atomic design vs feature-based? --> Feature-based (reason: quiz is a single feature with ~10 components total; atomic design adds unnecessary folder depth for this scope; feature-based is what Lovable generates naturally)

```
src/
  components/
    quiz/
      CoverScreen.tsx
      QuestionScreen.tsx
      LeadCaptureScreen.tsx
      LoadingScreen.tsx
      ResultScreen.tsx
      ProgressBar.tsx
      OptionCard.tsx
      LgpdNotice.tsx
    ui/
      Button.tsx
      Input.tsx
      ErrorBoundary.tsx
  hooks/
    useQuizReducer.ts
    useSubmitQuiz.ts
    useAnalytics.ts
  lib/
    supabase.ts
    archetype-calculator.ts
    validation.ts
    analytics.ts
  types/
    quiz.ts
  data/
    questions.ts
    archetypes.ts
  App.tsx
  main.tsx
```

---

## 2. State Management

### Quiz Reducer

```typescript
// types/quiz.ts

type ArchetypeId = 'comunicador' | 'mentor' | 'construtor' | 'estrategista';

interface QuizState {
  step: number;              // 0=cover, 1-7=questions, 8=lead, 9=loading, 10=result
  answers: (number | null)[]; // index 0-6 for Q1-Q7, value 0-3 for option A-D
  leadData: {
    name: string;
    email: string;
    whatsapp: string;
    lgpdConsent: boolean;
  };
  archetype: ArchetypeId | null;
  submitting: boolean;
  error: string | null;
}

type QuizAction =
  | { type: 'ANSWER_QUESTION'; questionIndex: number; optionIndex: number }
  | { type: 'SET_LEAD_FIELD'; field: keyof QuizState['leadData']; value: string | boolean }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; archetype: ArchetypeId }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'RESET' };
```

### Reducer Logic

```typescript
// hooks/useQuizReducer.ts

const initialState: QuizState = {
  step: 0,
  answers: [null, null, null, null, null, null, null],
  leadData: { name: '', email: '', whatsapp: '', lgpdConsent: false },
  archetype: null,
  submitting: false,
  error: null,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'ANSWER_QUESTION':
      const newAnswers = [...state.answers];
      newAnswers[action.questionIndex] = action.optionIndex;
      return { ...state, answers: newAnswers };
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1, error: null };
    case 'PREV_STEP':
      return { ...state, step: Math.max(0, state.step - 1) };
    case 'SET_LEAD_FIELD':
      return {
        ...state,
        leadData: { ...state.leadData, [action.field]: action.value },
      };
    case 'SUBMIT_START':
      return { ...state, submitting: true, error: null };
    case 'SUBMIT_SUCCESS':
      return { ...state, submitting: false, archetype: action.archetype, step: 10 };
    case 'SUBMIT_ERROR':
      return { ...state, submitting: false, error: action.error, step: 8 };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
```

### Flow Logic

1. **CoverScreen** (step 0): User taps "Comecar" --> dispatches `NEXT_STEP`
2. **QuestionScreen** (steps 1-7): User picks option --> dispatches `ANSWER_QUESTION` + auto-advances via `NEXT_STEP` after 300ms delay (micro-animation)
3. **LeadCaptureScreen** (step 8): User fills form --> dispatches `SET_LEAD_FIELD` per field; on submit dispatches `SUBMIT_START`
4. **LoadingScreen** (step 9): Shown during submission; archetype calculated client-side, Supabase insert happens, then `SUBMIT_SUCCESS`
5. **ResultScreen** (step 10): Displays archetype with WhatsApp CTA

---

## 3. Archetype Calculation

```typescript
// lib/archetype-calculator.ts

// Each question option maps to archetype scores
// Format: [comunicador, mentor, construtor, estrategista]
const SCORING_MATRIX: number[][] = [
  // Q1 options A/B/C/D
  // Q2 options A/B/C/D
  // ... defined in data/questions.ts
];

function calculateArchetype(answers: number[]): ArchetypeId {
  const scores = { comunicador: 0, mentor: 0, construtor: 0, estrategista: 0 };

  answers.forEach((optionIndex, questionIndex) => {
    if (optionIndex === null) return;
    const questionScoring = SCORING_MATRIX[questionIndex];
    const optionScores = questionScoring[optionIndex]; // [c, m, b, e]
    scores.comunicador += optionScores[0];
    scores.mentor += optionScores[1];
    scores.construtor += optionScores[2];
    scores.estrategista += optionScores[3];
  });

  // Return highest scoring archetype (tie-break: first in order)
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)[0][0] as ArchetypeId;
}
```

---

## 4. Screen Specifications

### CoverScreen

- Full viewport height, centered content
- Headline: H1 "Descubra seu perfil de criador digital"
- Subtext: "2 minutos. 7 perguntas. 1 revelacao."
- Primary CTA button with amber glow
- LGPD micro-text at bottom

### QuestionScreen

- Progress bar at top (step X of 7, amber fill)
- Question number label (uppercase, small)
- Question text (H2)
- 4 option cards stacked vertically
- Each card: letter badge (A/B/C/D) + option text
- Selected state: amber border + elevated background
- Auto-advance after selection (300ms delay for visual feedback)
- Back arrow at top-left (except Q1)

### OptionCard

- Dark card (`bg-secondary`) with `border-default`
- On tap: border becomes `accent-primary`, bg becomes `bg-elevated`
- Letter badge: circle with `accent-primary` background on selection
- Transition: 150ms ease-out

### LeadCaptureScreen

- Heading: "Quase la! Seus resultados estao prontos."
- 3 inputs: Nome, Email, WhatsApp (with +55 prefix)
- LGPD consent checkbox (required)
- Submit button (amber, full width)
- Validation: inline error messages below each field
- WhatsApp field: optional but visually encouraged

### LoadingScreen

- Centered content, radial amber gradient pulse
- "Analisando suas respostas..." text
- Animated dots or progress indicator
- Duration: minimum 1.5s (perceived effort), maximum 5s (timeout)
- If Supabase insert fails: show error, return to LeadCaptureScreen

### ResultScreen

- Archetype color band at top (archetype-specific color)
- Archetype name (H1) + identity statement
- 3 strengths (bulleted)
- Recommended business model (highlighted card)
- First action step (clear CTA box)
- Famous example (social proof)
- Primary CTA: WhatsApp deep link button (green, `--whatsapp` color)
- Secondary: "Compartilhar resultado" (share)
- Tertiary: "Refazer quiz" (reset)

---

## 5. Error Handling

### ErrorBoundary

Wraps `QuizContainer`. On crash: shows friendly message with "Tentar novamente" button that calls `RESET`.

### Network Errors

- Supabase insert failure: caught in `useSubmitQuiz` hook
- Dispatches `SUBMIT_ERROR` with user-friendly message
- User returns to LeadCaptureScreen with data preserved
- Retry button available

### Validation Errors

- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- WhatsApp: regex `/^\+?55?\d{10,11}$/` (flexible Brazilian format)
- Name: minimum 2 characters
- LGPD consent: must be checked
- All shown inline below the respective field in `--error` color

---

## 6. Loading States

| Screen | Loading Behavior |
|--------|-----------------|
| CoverScreen | None (static) |
| QuestionScreen | 300ms selection highlight before auto-advance |
| LeadCaptureScreen | Button shows spinner on submit, inputs disabled |
| LoadingScreen | Full screen animated state (1.5-5s) |
| ResultScreen | None (all data available from client calculation) |

---

## 7. TypeScript Interfaces

```typescript
// types/quiz.ts

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

interface QuestionOption {
  label: string;             // "A", "B", "C", "D"
  text: string;              // Option text in PT-BR
  scores: ArchetypeScores;   // Points per archetype
}

interface ArchetypeScores {
  comunicador: number;
  mentor: number;
  construtor: number;
  estrategista: number;
}

interface Archetype {
  id: ArchetypeId;
  name: string;              // "O Comunicador"
  color: string;             // "#F97316"
  identity: string;          // One-line identity statement
  strengths: string[];       // 3 strengths
  businessModel: string;     // Recommended model
  firstStep: string;         // Concrete action
  famousExample: string;     // Social proof
}

interface LeadData {
  name: string;
  email: string;
  whatsapp: string;
  lgpdConsent: boolean;
}

interface QuizSubmission {
  user_name: string;
  user_email: string;
  user_whatsapp: string | null;
  answers: number[];
  archetype: ArchetypeId;
  metadata: {
    source: string;          // UTM params
    device: 'mobile' | 'desktop';
    duration_seconds: number;
    completed_at: string;    // ISO timestamp
  };
}
```

---

## 8. Lovable Integration Notes

When exporting from Lovable:

1. Replace `src/App.tsx` with the generated root component
2. Move generated components into `src/components/quiz/` and `src/components/ui/`
3. Keep `src/lib/supabase.ts` from the scaffold (already configured)
4. Add Tailwind config extensions from the design system doc into `tailwind.config.js`
5. Ensure `Inter` font is loaded via `<link>` in `index.html` or via `@import` in CSS
6. Verify all `import.meta.env.VITE_*` references match the `.env.example`

### What Lovable Should Generate

- Visual components (screens, cards, buttons, inputs)
- Tailwind classes per design system
- Basic screen transition logic

### What We Add Post-Export

- `useQuizReducer` hook (state machine)
- `archetype-calculator.ts` (scoring logic)
- `useSubmitQuiz` hook (Supabase integration)
- `useAnalytics` hook (event tracking)
- Type definitions (`types/quiz.ts`)
- Validation utilities (`lib/validation.ts`)

---

*Frontend Architecture by @architect (Aria) | LOV-1 | Phase 4*
