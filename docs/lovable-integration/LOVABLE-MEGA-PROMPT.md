# LOVABLE MEGA-PROMPT -- Metodo Cria Quiz

> **INSTRUCTIONS:** Copy everything below the line into Lovable's editor. This is the complete specification.

---

## WHAT TO BUILD

Build a single-page quiz application called "Metodo Cria Quiz". It is a personality quiz that determines which of 4 digital creator archetypes a person is. The quiz collects their name, email, and WhatsApp before starting, then asks 7 questions, shows a loading animation, and reveals their archetype result with a WhatsApp CTA.

Target audience: Brazilian digital creators aged 25-40. All copy is in Brazilian Portuguese. The app must be mobile-first, dark-themed, and high-converting.

Tech stack: React, TypeScript, Tailwind CSS, Supabase (client SDK).

---

## VISUAL DESIGN SYSTEM

### Colors (Dark Theme)

Background colors:
- Page background: `#0F0F0F`
- Card/input backgrounds: `#1A1A1A`
- Hover/elevated states: `#252525`

Text colors:
- Primary text (headings, body): `#F5F5F5`
- Secondary text (labels, sub-text): `#A3A3A3`
- Muted text (micro-copy, LGPD): `#737373`

Accent colors:
- Primary accent (CTAs, progress bar): `#F59E0B` (amber)
- Hover accent: `#D97706`
- Pressed accent: `#B45309`

Borders:
- Default border: `#2E2E2E`
- Focus border: `#F59E0B`

Semantic colors:
- Success: `#22C55E`
- Error: `#EF4444`
- WhatsApp green: `#25D366`

Archetype-specific colors (used on result screen only):
- O Comunicador: `#F97316` (warm orange)
- O Mentor: `#14B8A6` (deep teal)
- O Construtor: `#3B82F6` (strong blue)
- O Estrategista: `#8B5CF6` (rich purple)

### Typography

Font: **Inter** from Google Fonts. Load weights 400, 500, 600, 700, 800.

```
Google Fonts URL: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap
```

Type scale:
- H1 (headline, archetype name): 28px mobile / 32px desktop, weight 800, line-height 1.2, tracking tight
- H2 (question text): 22px mobile / 24px desktop, weight 700, line-height 1.3
- H3 (taglines): 18px mobile / 20px desktop, weight 600, line-height 1.4
- Body: 16px, weight 400, line-height 1.6
- Label (section titles): 14px, weight 700, uppercase, letter-spacing 0.05em
- Micro (LGPD, footnotes): 12px, weight 400
- CTA button text: 16px mobile / 18px desktop, weight 700
- Option card text: 16px, weight 500
- Option letter (A/B/C/D): 20px, weight 600

### Spacing

Base unit: 4px. Use Tailwind defaults:
- `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px), `p-8` (32px), `p-10` (40px), `p-12` (48px)

### Layout

- Max content width: 480px, centered
- Page horizontal padding: 24px (so effective width on mobile = 100vw - 48px)
- Min supported width: 320px
- Background: full bleed edge-to-edge `#0F0F0F`
- Content: single centered column at all breakpoints

### Shadows

- CTA button glow: `0 2px 8px rgba(245,158,11,0.25)`
- CTA hover glow: `0 4px 16px rgba(245,158,11,0.35)`
- Focus ring: `0 0 0 3px rgba(245,158,11,0.3)`
- Card shadow: `0 1px 3px rgba(0,0,0,0.3)`

### Border Radius

- Input fields: 8px
- Option cards, buttons: 12px
- Result card: 16px
- Progress bar, badges: 9999px (pill)

---

## TAILWIND CONFIG EXTENSIONS

Add these to the Tailwind config:

```javascript
{
  theme: {
    extend: {
      colors: {
        cria: {
          bg: '#0F0F0F',
          'bg-secondary': '#1A1A1A',
          'bg-elevated': '#252525',
          accent: '#F59E0B',
          'accent-hover': '#D97706',
          'accent-pressed': '#B45309',
          border: '#2E2E2E',
          success: '#22C55E',
          error: '#EF4444',
          whatsapp: '#25D366',
        },
        archetype: {
          comunicador: '#F97316',
          mentor: '#14B8A6',
          construtor: '#3B82F6',
          estrategista: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        result: '16px',
      },
      boxShadow: {
        'cta-glow': '0 2px 8px rgba(245,158,11,0.25)',
        'cta-glow-hover': '0 4px 16px rgba(245,158,11,0.35)',
        'focus-ring': '0 0 0 3px rgba(245,158,11,0.3)',
      },
    },
  },
}
```

---

## SCREEN 1: ENTRY FORM (step 0)

This is the landing screen. Full viewport height, content centered vertically.

**Layout (top to bottom):**

1. Small logo text "Metodo Cria" at top-left (14px, muted color, optional)

2. Headline (H1):
```
Qual tipo de criador digital voce ja e (e ainda nao sabe)?
```

3. Sub-headline (16px, muted color):
```
Sem enrolacao. 2 minutos. Resultado na hora.
```

4. Three input fields stacked with 16px gap:
   - "Seu nome" (text input)
   - "Seu melhor email" (email input)
   - "WhatsApp (recomendado)" (tel input, with static "+55" prefix inside the field on the left side)

5. Primary CTA button (full width, 56px height, amber background `#F59E0B`, dark text `#0F0F0F`, bold, 12px border-radius, amber glow shadow):
```
DESCOBRIR MEU PERFIL
```

6. LGPD micro-copy below button (12px, muted):
```
Ao continuar, voce concorda com nossa Politica de Privacidade. Usamos seus dados apenas para enviar seu perfil e, se voce quiser, conteudos do Metodo Cria.
```

**Input field specs:**
- Height: 52px
- Background: `#1A1A1A`
- Border: 1px `#2E2E2E`
- Border-radius: 8px
- Padding: 16px horizontal
- Font: 16px (prevents mobile zoom)
- On focus: border becomes `#F59E0B` (2px), add focus ring shadow
- Floating label that moves up on focus/fill
- Error state: border `#EF4444`, error message below in red 14px

**Validation:**
- Name: minimum 2 characters
- Email: standard email format
- WhatsApp: optional but visually encouraged. If provided, validate Brazilian format

---

## SCREENS 2-8: QUESTIONS (steps 1-7)

All 7 question screens share identical layout. Only the question text, options, and progress percentage change.

**Layout (top to bottom):**

1. Progress bar at top: full width, 4px height, background track `#252525`, amber fill `#F59E0B`, pill shape. Fill percentage = (questionNumber / 7) * 100. Smooth fill transition over 500ms with slight overshoot easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`.

2. Question counter (14px, muted): "Pergunta N de 7"

3. Question text (H2, 22px bold)

4. Four option cards stacked vertically with 12px gap between them

5. Encouragement micro-copy (14px, amber color, centered, fades in AFTER user selects an option -- see micro-copy per question below)

**Option card specs:**
- Full width, min-height 72px
- Background: `#1A1A1A`
- Border: 1px `#2E2E2E`
- Border-radius: 12px
- Padding: 16px
- Layout: flex row, items-center, gap 16px
- Left side: letter label (A/B/C/D), 20px semi-bold, 32px fixed width, muted color
- Right side: option text, 16px medium weight
- Hover: background shifts to `#252525`, border lightens
- Selected: border 2px `#F59E0B`, background `rgba(245,158,11,0.08)`, letter turns amber
- When one option is selected, OTHER cards dim to opacity 0.5

**Auto-advance behavior:**
- When user taps an option, highlight it for 200ms
- Dim other cards
- Then slide-transition to next question (300ms slide-left + fade)
- No "Next" button, no "Back" button
- Total time from tap to next question visible: ~700ms

**Screen transitions between questions:**
- Entering question slides in from right: `translateX(40px)` to `translateX(0)`, opacity 0 to 1, 300ms ease-out
- Exiting question slides out left: `translateX(0)` to `translateX(-40px)`, opacity 1 to 0, 200ms ease-in

### QUESTION 1 (Warm-up)

Question text:
```
Sabado de manha, sem compromissos. O que voce faz?
```

Options:
- A) Pesquiso algo que estou querendo aprender
- B) Chamo alguem para conversar ou fazer algo junto
- C) Organizo minhas ideias e planejo a semana
- D) Comeco aquele projeto que ficou parado

Encouragement after selection: "Bom comeco!"

### QUESTION 2 (Communication style)

Question text:
```
Quando voce aprende algo novo, qual sua reacao natural?
```

Options:
- A) Saio contando pra todo mundo
- B) Penso em como isso pode ajudar alguem que conheco
- C) Ja imagino como transformar isso em algo concreto
- D) Anoto e guardo pra conectar com outras ideias depois

### QUESTION 3 (Risk tolerance)

Question text:
```
Um amigo propoe um projeto paralelo. Qual sua primeira reacao?
```

Options:
- A) "Bora! Quando comecamos?"
- B) "Quem mais vai participar?"
- C) "Me fala mais sobre o plano"
- D) "Deixa eu analisar se faz sentido"

Encouragement after selection: "Ja estamos na metade"

### QUESTION 4 (Values)

Question text:
```
Se voce pudesse escolher apenas uma coisa, o que mais importa?
```

Options:
- A) Liberdade para decidir meu proprio horario
- B) Impactar a vida de outras pessoas
- C) Construir algo que funciona mesmo sem mim
- D) Ser reconhecido pelo que sei fazer

### QUESTION 5 (Work style)

Question text:
```
No seu dia ideal de trabalho, voce prefere...
```

Options:
- A) Estar na frente das pessoas, apresentando ideias
- B) Conversas profundas, um a um
- C) Cabeca baixa, construindo algo
- D) Analisando dados e planejando estrategias

Encouragement after selection: "Quase la..."

### QUESTION 6 (Content behavior)

Question text:
```
Quando voce consome um conteudo que muda sua visao, o que faz?
```

Options:
- A) Crio um post ou video sobre aquilo
- B) Compartilho com alguem que precisa ouvir
- C) Aplico imediatamente no que estou fazendo
- D) Anoto os padroes e conecto com o que ja sei

### QUESTION 7 (Identity -- emotional peak)

Question text:
```
Qual frase mais parece ter sido escrita para voce?
```

Options (NOTE: on this screen, do NOT show letter labels A/B/C/D. Show only the quoted text. Use italic style. Slightly larger padding 20px):
- "Eu preciso compartilhar o que descubro -- e nao consigo ficar quieto"
- "Eu enxergo o potencial das pessoas antes delas mesmas"
- "Eu so descanso quando vejo a coisa funcionando"
- "Eu conecto os pontos que ninguem mais ve"

After selection on Q7: progress bar fills to 100% with 600ms animation. 200ms pause, then fade transition (NOT slide) to loading screen over 500ms.

---

## SCREEN 9: LOADING (step 8)

**Duration:** Exactly 3 seconds, then auto-transition to results.

**Layout:** Centered vertically and horizontally on page. Dark background with subtle radial amber gradient pulse: `radial-gradient(circle at 50% 40%, rgba(245,158,11,0.05) 0%, transparent 70%)` that pulses opacity between 0.3 and 1 over 3s.

**Elements:**

1. Animated spinner: 48px, amber color, spinning circle (stroke-dasharray animation)

2. Three text lines that fade in sequentially (each: 16px, muted color, fade-in with translateY(8px) to translateY(0) over 400ms):
   - At 0s: "Analisando suas respostas..."
   - At 1s: "Identificando seu perfil..."
   - At 2s: "Preparando seu resultado..."

Transition to results: fade-up (`translateY(20px)` to `translateY(0)`, 600ms ease-out)

---

## SCREEN 10: RESULTS (step 9)

This is the longest screen. It scrolls on mobile (2-3 screen heights). Content appears with a staggered reveal animation.

**Staggered reveal sequence:**
1. Color band: 0ms delay, 300ms, expands width from center
2. Archetype icon: 200ms delay, 400ms, scale from 0.5 to 1 + fade
3. "Voce e:" text: 400ms delay, 300ms, fade in
4. Archetype name: 500ms delay, 400ms, fade in + slight scale up
5. Tagline: 700ms delay, 300ms, fade in
6. Body + all sections: 1000ms delay, 400ms, fade in all at once
7. CTA section: 1400ms delay, 400ms, fade-up from 20px

**Layout (top to bottom):**

1. **Color band**: Full width, 4px height, archetype-specific color

2. **Archetype icon**: Centered, 64px, tinted with archetype color. Use a simple SVG icon or emoji per archetype (a speech bubble for Comunicador, a lightbulb for Mentor, a wrench/hammer for Construtor, a chess piece for Estrategista).

3. **Small label**: "Voce e:" (14px, muted)

4. **Archetype name** (H1, 32px extra-bold, archetype color):
   - "O COMUNICADOR" or "O MENTOR" or "O CONSTRUTOR" or "O ESTRATEGISTA"

5. **Tagline** (18px italic, secondary text color):
   - Comunicador: "Voce transforma conhecimento em conexao"
   - Mentor: "Voce enxerga o potencial antes dos outros"
   - Construtor: "Voce so descansa quando ve funcionando"
   - Estrategista: "Voce conecta os pontos que ninguem ve"

6. **Divider** (1px, 8% white opacity)

7. **Description paragraph** (16px body, 1.6 line-height):
   - Comunicador: "Voce e aquela pessoa que nao consegue guardar uma boa ideia so pra si. Quando descobre algo, sua reacao natural e compartilhar -- e as pessoas ao redor percebem isso. Voce tem o dom de traduzir coisas complexas em algo que qualquer um entende."
   - Mentor: "Voce tem um olhar raro: consegue enxergar o que os outros podem se tornar antes mesmo deles perceberem. Sua paciencia para ensinar e sua capacidade de simplificar o complexo fazem de voce um guia natural."
   - Construtor: "Voce nao se contenta em planejar -- precisa ver a coisa funcionando. Enquanto outros discutem, voce ja esta testando. Sua energia pratica e a capacidade de transformar ideias em realidade sao seus maiores diferenciais."
   - Estrategista: "Voce enxerga o mapa completo quando outros veem apenas a proxima esquina. Sua mente conecta padroes, dados e oportunidades de um jeito que parece magica -- mas e pura analise."

8. **Divider**

9. **Section: "SEUS PONTOS FORTES"** (14px bold uppercase label, then 3 bullet points):
   - Comunicador: Comunicacao clara e envolvente / Capacidade de criar conexao rapida com audiencia / Habilidade natural para ensinar
   - Mentor: Didatica natural / Paciencia para ensinar / Conhecimento profundo
   - Construtor: Execucao rapida / Pensamento pratico / Resolucao de problemas
   - Estrategista: Visao sistemica / Planejamento estrategico / Analise de mercado

10. **Divider**

11. **Section: "SEU MODELO DIGITAL IDEAL"** (label + body text):
    - Comunicador: "Criacao de conteudo e influencia digital -- YouTube, podcast, ou newsletter."
    - Mentor: "Cursos online e mentoria."
    - Construtor: "SaaS, ferramentas e produtos digitais."
    - Estrategista: "Consultoria e servicos estrategicos."

12. **Divider**

13. **Section: "SEU PROXIMO PASSO"** (label + body text):
    - Comunicador: "Escolha UM tema que voce ja domina e grave um video de 3 minutos explicando para um amigo. Nao publique. Apenas grave. Esse e o seu primeiro treino."
    - Mentor: "Escolha um topico que voce ensina bem e crie um roteiro de 5 aulas."
    - Construtor: "Identifique um problema que voce resolve bem e crie um MVP esta semana."
    - Estrategista: "Mapeie 3 problemas do seu setor e escolha o mais lucrativo para resolver."

14. **48px gap**

15. **CTA heading** (H2, 20px): "Seu perfil completo esta pronto. Para onde enviamos?"

16. **WhatsApp CTA button** (full width, 56px height, background `#25D366`, white text, bold, 12px radius, WhatsApp icon SVG on the left):
```
Receber no WhatsApp (recomendado)
```
This button opens: `https://wa.me/5511999999999?text=Oi!%20Fiz%20o%20quiz%20do%20Metodo%20Cria%20e%20meu%20perfil%20e:%20[ARCHETYPE].%20Quero%20receber%20meu%20perfil%20completo!`

Replace `[ARCHETYPE]` with the actual archetype name. Replace the phone number with an environment variable or constant.

17. **Secondary button** (full width, 52px height, transparent background, 1px border `#2E2E2E`, white text, semi-bold):
```
Tambem enviar por email
```

18. **32px gap**

19. **Share section**: Small shareable card preview (300x180px, archetype color gradient background, white text showing archetype name + tagline + "Descubra o seu: metodocria.com/quiz", 16px border-radius). Below it a small outlined button "Compartilhar resultado".

20. **Footer** (micro-copy, 12px, muted, centered): "Metodo Cria | Politica de Privacidade"

---

## ARCHETYPE SCORING LOGIC

Each question has 4 options (index 0-3). Each option awards points to the 4 archetypes as `[comunicador, mentor, construtor, estrategista]`:

```typescript
// For ALL questions, option A maps to Comunicador, B to Mentor, C to Construtor, D to Estrategista
// Scoring: the chosen option gets 3 points for its primary archetype, 1 point for its secondary

const SCORING_MATRIX = [
  // Q1: options A, B, C, D -> [comunicador, mentor, construtor, estrategista]
  [[3, 0, 1, 0], [1, 3, 0, 0], [0, 0, 1, 3], [0, 0, 3, 1]],
  // Q2
  [[3, 0, 0, 1], [0, 3, 0, 1], [0, 0, 3, 1], [0, 1, 0, 3]],
  // Q3
  [[3, 0, 1, 0], [1, 3, 0, 0], [0, 1, 3, 0], [0, 0, 1, 3]],
  // Q4
  [[3, 0, 0, 1], [0, 3, 0, 0], [0, 0, 3, 1], [1, 0, 0, 3]],
  // Q5
  [[3, 0, 0, 0], [0, 3, 0, 0], [0, 0, 3, 0], [0, 0, 0, 3]],
  // Q6
  [[3, 0, 0, 1], [0, 3, 0, 0], [0, 0, 3, 0], [0, 1, 0, 3]],
  // Q7
  [[3, 0, 0, 0], [0, 3, 0, 0], [0, 0, 3, 0], [0, 0, 0, 3]],
];
```

Calculate archetype by summing scores across all 7 questions. The archetype with the highest total wins. On tie, use first in order: comunicador > mentor > construtor > estrategista.

---

## STATE MANAGEMENT

Use `useReducer` for quiz state:

```typescript
interface QuizState {
  step: number;           // 0=entry, 1-7=questions, 8=loading, 9=result
  answers: (number | null)[];  // 7 elements, each 0-3 or null
  leadData: {
    name: string;
    email: string;
    whatsapp: string;
  };
  archetype: string | null;
  submitting: boolean;
  error: string | null;
}
```

Flow:
1. Step 0 (Entry): User fills form, taps CTA. Validate inputs. If valid, save to Supabase, then advance to step 1.
2. Steps 1-7 (Questions): User taps option. Record answer. Auto-advance after 200ms visual feedback.
3. Step 8 (Loading): Calculate archetype client-side. Submit data to Supabase. Show loading animation for minimum 3 seconds. On success, advance to step 9.
4. Step 9 (Result): Display archetype result.

IMPORTANT: Lead data is collected FIRST (step 0), not after the quiz. The entry form IS the lead capture.

---

## SUPABASE INTEGRATION

Initialize Supabase client using environment variables:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Submit quiz response (after loading screen calculates archetype):

```typescript
const { data, error } = await supabase
  .from('quiz_responses')
  .insert({
    user_name: leadData.name.trim(),
    user_email: leadData.email.trim().toLowerCase(),
    user_whatsapp: leadData.whatsapp || null,
    answers: answers,           // [0, 2, 1, 3, 0, 2, 1] array of option indices
    archetype: calculatedArchetype,  // 'comunicador' | 'mentor' | 'construtor' | 'estrategista'
    metadata: {
      device: window.innerWidth < 768 ? 'mobile' : 'desktop',
      completed_at: new Date().toISOString(),
    },
  })
  .select('id, archetype')
  .single();
```

### Deduplication check (before inserting):

Check if this email already submitted today. If so, return the existing archetype instead of inserting again:

```typescript
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const { data: existing } = await supabase
  .from('quiz_responses')
  .select('archetype')
  .eq('user_email', email.toLowerCase())
  .gte('created_at', todayStart.toISOString())
  .is('deleted_at', null)
  .single();

if (existing) {
  // Skip insert, use existing archetype
}
```

### Error handling:

- On Supabase error: show "Algo deu errado. Tente novamente." with a retry button
- On duplicate (error code 23505): show "Voce ja respondeu hoje! Quer ver seu resultado?" and show their existing archetype
- Network errors: "Erro de conexao. Tente novamente."

---

## FORM VALIDATION

- Name: minimum 2 characters. Error: "Nome deve ter pelo menos 2 caracteres"
- Email: regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`. Error: "Email invalido"
- WhatsApp: optional. If provided, regex `^\+?55?\d{10,11}$`. Error: "Numero de WhatsApp invalido"
- Show errors inline below each field in red (`#EF4444`), 14px
- Error shake animation: input shakes horizontally 3 times over 400ms

---

## ACCESSIBILITY

- All inputs have proper labels (floating labels with `aria-label`)
- Option cards use `role="radio"` and `aria-checked`
- Progress bar uses `role="progressbar"` with `aria-valuenow` and `aria-valuemax`
- Loading screen uses `aria-live="polite"`
- Minimum touch target: 48x48px (buttons are 56px, cards are 72px min-height)
- Color contrast: all text meets WCAG 2.1 AA (4.5:1 minimum)
- Support `prefers-reduced-motion`: disable all animations, show content immediately

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- Full keyboard navigation support
- Semantic HTML structure

---

## RESPONSIVE DESIGN

Mobile-first (320px minimum). Single column at all breakpoints.

| Breakpoint | Container | Font scale | Card padding |
|-----------|-----------|-----------|-------------|
| 320-480px | 100% - 48px padding | Base | 16px |
| 768px+ | 520px centered | 1.1x | 20px |
| 1024px+ | 520px centered | 1.15x | 24px |

On desktop, the quiz simply centers in a narrow column with generous whitespace on the sides.

---

## ANIMATIONS SUMMARY

All animations use `transform` and `opacity` only (GPU-accelerated).

| Element | Trigger | Effect | Duration |
|---------|---------|--------|----------|
| Question transition | Auto-advance | Slide-left + fade | 300ms |
| Progress bar fill | Question advance | Smooth fill with overshoot | 500ms |
| Option card select | Tap | Amber border + tint, others dim | 150ms |
| Button press | Touch | Scale down to 0.97 | 100ms |
| Loading text | Timed | Staggered fade-in-up | 400ms each, 1s intervals |
| Result sections | Page load | Staggered reveal fade-in-up | 200ms intervals |
| Input focus | Tab/tap | Amber border + ring | 200ms |
| Error | Invalid input | Horizontal shake | 400ms |

---

## ENVIRONMENT VARIABLES

The app needs these two environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## FILE STRUCTURE

Generate code organized as:

```
src/
  components/
    quiz/
      EntryScreen.tsx       (step 0: lead capture form)
      QuestionScreen.tsx    (steps 1-7: question + options)
      LoadingScreen.tsx     (step 8: animated loading)
      ResultScreen.tsx      (step 9: archetype result + CTAs)
      ProgressBar.tsx       (reused in question screens)
      OptionCard.tsx        (single option card component)
    ui/
      Button.tsx            (primary + secondary + whatsapp variants)
      Input.tsx             (text input with floating label)
  hooks/
    useQuizReducer.ts       (state machine with useReducer)
  lib/
    supabase.ts             (Supabase client init)
    archetype-calculator.ts (scoring logic)
    validation.ts           (form validation functions)
  data/
    questions.ts            (all 7 questions with options and scoring)
    archetypes.ts           (4 archetype definitions with all copy)
  types/
    quiz.ts                 (TypeScript interfaces)
  App.tsx                   (root: renders QuizContainer)
  main.tsx                  (entry point)
```

---

## COMPONENT NAMES

- `EntryScreen` -- the landing/lead-capture form
- `QuestionScreen` -- renders any of the 7 questions (receives question data as prop)
- `LoadingScreen` -- 3-second animated loading
- `ResultScreen` -- archetype result with all sections and CTAs
- `ProgressBar` -- amber progress bar
- `OptionCard` -- single tappable option card
- `Button` -- primary (amber), secondary (outlined), whatsapp (green) variants
- `Input` -- text input with floating label and validation states

---

## WHAT NOT TO DO

- Do NOT add routing (react-router). This is a single-page linear flow.
- Do NOT add a back button on questions. Forward only.
- Do NOT use any external CSS framework besides Tailwind.
- Do NOT use any external state management library. Use `useReducer` only.
- Do NOT add a skip button. All questions are required.
- Do NOT use light theme anywhere. Everything is dark.
- Do NOT add any marketing language about courses, products, or money-making in the UI.
