# Lovable Cria Quiz - Wireframes (9 Screens)

**Story:** LOV-1 Lovable Quiz Integration
**Author:** @ux-design-expert (Uma)
**Date:** 2026-02-22
**Fidelity:** Mid-fidelity (layout + hierarchy + component placement)

---

## Screen 1: Entry / Landing

**Purpose:** Hook + lead capture (nome, email, WhatsApp)
**Emotion:** Curiosity + Recognition
**Target:** 70% click "Descobrir meu perfil"

```
+------------------------------------------+
|                                          |
|  [Logo: Metodo Cria - small, top-left]   |
|                                          |
|  ----------------------------------------|
|                                          |
|       Qual tipo de criador digital       |
|     voce ja e (e ainda nao sabe)?        |
|           [H1 - 28px mobile]             |
|                                          |
|   Sem enrolacao. 2 minutos.              |
|   Resultado na hora.                     |
|           [Sub - 16px, muted]            |
|                                          |
|  ----------------------------------------|
|                                          |
|   Seu nome                               |
|   +------------------------------------+ |
|   |                                    | |
|   +------------------------------------+ |
|                                          |
|   Seu melhor email                       |
|   +------------------------------------+ |
|   |                                    | |
|   +------------------------------------+ |
|                                          |
|   WhatsApp (recomendado)                 |
|   +------------------------------------+ |
|   | +55 |                              | |
|   +------------------------------------+ |
|                                          |
|   +------------------------------------+ |
|   |    DESCOBRIR MEU PERFIL            | |
|   |    [Primary CTA - full width]      | |
|   +------------------------------------+ |
|                                          |
|   [LGPD consent micro-copy, 12px]       |
|   Ao continuar, voce concorda com       |
|   nossa Politica de Privacidade.        |
|                                          |
+------------------------------------------+
```

**Layout Notes:**
- Single column, centered content
- Max-width: 480px (centered on desktop)
- Padding: 24px horizontal, 48px top
- Form inputs stacked vertically with 16px gap
- CTA button: 56px height, full width, bold text
- WhatsApp field includes country code prefix (+55) as static label
- LGPD text below CTA, not as checkbox (consent by action)

**Component Inventory:**
- TextInput x3 (name, email, whatsapp)
- PrimaryButton x1
- Heading (H1)
- SubHeading
- MicroCopy (LGPD)
- Logo (small)

---

## Screen 2: Question 1 (Warm-up)

**Purpose:** Easy engagement, reduce friction
**Emotion:** Light, fun, relatable

```
+------------------------------------------+
|                                          |
|  [Progress Bar: 14% filled]             |
|  Pergunta 1 de 7                        |
|                                          |
|  ----------------------------------------|
|                                          |
|   Sabado de manha, sem compromissos.    |
|   O que voce faz?                        |
|           [H2 - 22px]                    |
|                                          |
|  +--------------------------------------+|
|  |  A                                   ||
|  |  Pesquiso algo que estou             ||
|  |  querendo aprender                   ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  |  B                                   ||
|  |  Chamo alguem para conversar         ||
|  |  ou fazer algo junto                 ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  |  C                                   ||
|  |  Organizo minhas ideias e            ||
|  |  planejo a semana                    ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  |  D                                   ||
|  |  Comeco aquele projeto que           ||
|  |  ficou parado                        ||
|  +--------------------------------------+|
|                                          |
|  [Micro-copy: "Bom comeco!" after Q1]   |
|                                          |
+------------------------------------------+
```

**Layout Notes:**
- Progress bar at top: full width, 4px height
- Question counter: small text above question (14px, muted)
- Question text: H2, left-aligned
- Option cards: full-width, 72px min-height, 12px gap between
- Tap on card auto-advances to next screen (no separate "Next" button)
- Selected state: border highlight + background tint
- Letter label (A/B/C/D) on left side of card, 20px, semi-bold

**Component Inventory:**
- ProgressBar
- QuestionCounter (text)
- QuestionHeading (H2)
- OptionCard x4
- MicroCopy (encouragement, shown after selection)

---

## Screen 3: Question 2

**Purpose:** Communication style detection
**Emotion:** Self-reflection starting

```
+------------------------------------------+
|  [Progress Bar: 28% filled]             |
|  Pergunta 2 de 7                        |
|                                          |
|   Quando voce aprende algo novo,        |
|   qual sua reacao natural?               |
|                                          |
|  +--------------------------------------+|
|  |  A  Saio contando pra todo mundo     ||
|  +--------------------------------------+|
|  +--------------------------------------+|
|  |  B  Penso em como isso pode          ||
|  |     ajudar alguem que conheco        ||
|  +--------------------------------------+|
|  +--------------------------------------+|
|  |  C  Ja imagino como transformar      ||
|  |     isso em algo concreto            ||
|  +--------------------------------------+|
|  +--------------------------------------+|
|  |  D  Anoto e guardo pra conectar      ||
|  |     com outras ideias depois         ||
|  +--------------------------------------+|
+------------------------------------------+
```

**Same layout pattern as Screen 2. All question screens (2-7) share identical structure.**

---

## Screen 4: Question 3

**Purpose:** Risk tolerance / action orientation
**Progress:** 42%

```
Question: "Um amigo propoe um projeto paralelo.
          Qual sua primeira reacao?"

Options:
A) "Bora! Quando comecamos?"
B) "Quem mais vai participar?"
C) "Me fala mais sobre o plano"
D) "Deixa eu analisar se faz sentido"
```

---

## Screen 5: Question 4

**Purpose:** Core values (most revealing)
**Progress:** 57%
**Micro-copy trigger:** "Ja estamos na metade" after selection

```
Question: "Se voce pudesse escolher apenas
          uma coisa, o que mais importa?"

Options:
A) Liberdade para decidir meu proprio horario
B) Impactar a vida de outras pessoas
C) Construir algo que funciona mesmo sem mim
D) Ser reconhecido pelo que sei fazer
```

---

## Screen 6: Question 5

**Purpose:** Work style preference
**Progress:** 71%
**Micro-copy trigger:** "Quase la..." after selection

```
Question: "No seu dia ideal de trabalho,
          voce prefere..."

Options:
A) Estar na frente das pessoas, apresentando ideias
B) Conversas profundas, um a um
C) Cabeca baixa, construindo algo
D) Analisando dados e planejando estrategias
```

---

## Screen 7: Question 6

**Purpose:** Content relationship / behavior
**Progress:** 85%

```
Question: "Quando voce consome um conteudo
          que muda sua visao, o que faz?"

Options:
A) Crio um post ou video sobre aquilo
B) Compartilho com alguem que precisa ouvir
C) Aplico imediatamente no que estou fazendo
D) Anoto os padroes e conecto com o que ja sei
```

---

## Screen 8: Question 7 (Emotional Peak)

**Purpose:** Identity statement, deepest engagement
**Progress:** 100% (fills completely on selection)

```
+------------------------------------------+
|  [Progress Bar: 100% filled]            |
|  Pergunta 7 de 7                        |
|                                          |
|   Qual frase mais parece ter sido       |
|   escrita para voce?                     |
|           [H2 - 22px]                    |
|                                          |
|  +--------------------------------------+|
|  |  "Eu preciso compartilhar o que      ||
|  |   descubro -- e nao consigo          ||
|  |   ficar quieto"                      ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  |  "Eu enxergo o potencial das         ||
|  |   pessoas antes delas mesmas"        ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  |  "Eu so descanso quando vejo         ||
|  |   a coisa funcionando"              ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  |  "Eu conecto os pontos que           ||
|  |   ninguem mais ve"                   ||
|  +--------------------------------------+|
|                                          |
+------------------------------------------+
```

**Special Notes:**
- Options in quotes (italic) for intimate feel
- No letter labels on this screen -- pure text for emotional weight
- Slightly larger card padding (20px vs 16px)
- After selection, 200ms pause then auto-transition to loading

---

## Screen 9: Loading / Transition (3 seconds)

**Purpose:** Build anticipation, perceived sophistication
**Emotion:** Excitement, suspense

```
+------------------------------------------+
|                                          |
|                                          |
|                                          |
|                                          |
|         [Animated spinner/pulse]         |
|                                          |
|     Analisando suas respostas...         |
|              [fade in at 0s]             |
|                                          |
|     Identificando seu perfil...          |
|              [fade in at 1s]             |
|                                          |
|     Preparando seu resultado...          |
|              [fade in at 2s]             |
|                                          |
|                                          |
|                                          |
|                                          |
+------------------------------------------+
```

**Layout Notes:**
- Centered vertically and horizontally
- Dark background (matches brand)
- Spinner: 48px, uses primary accent color
- Text fades in sequentially: 0s, 1s, 2s
- Total duration: 3 seconds, then auto-transition to results
- Each line: 16px, muted text, fades from 0 to 1 opacity

**Component Inventory:**
- LoadingSpinner
- AnimatedText x3 (staggered fade-in)

---

## Screen 10: Results with Archetype

**Purpose:** Validation + excitement + lead deepening
**Emotion:** "This is ME" moment
**Target:** 90% read full result

```
+------------------------------------------+
|                                          |
|  [Archetype color band - full width]    |
|                                          |
|       [Archetype Icon - 64px]           |
|                                          |
|         Voce e:                          |
|       O COMUNICADOR                      |
|    [H1 - 32px, archetype color]         |
|                                          |
|  "Voce transforma conhecimento          |
|   em conexao"                            |
|    [Tagline - 18px italic]              |
|                                          |
|  ----------------------------------------|
|                                          |
|  Voce e aquela pessoa que nao           |
|  consegue guardar uma boa ideia so      |
|  pra si. Quando descobre algo, sua      |
|  reacao natural e compartilhar -- e     |
|  as pessoas ao redor percebem isso.     |
|    [Body - 16px, 1.6 line-height]       |
|                                          |
|  ----------------------------------------|
|                                          |
|  SEUS PONTOS FORTES                      |
|    [Label - 14px, uppercase, bold]      |
|                                          |
|  * Comunicacao clara e envolvente       |
|  * Capacidade de criar conexao rapida   |
|  * Habilidade natural para ensinar      |
|                                          |
|  ----------------------------------------|
|                                          |
|  SEU MODELO DIGITAL IDEAL               |
|  Conteudo educativo -- YouTube,         |
|  podcast, ou newsletter.                |
|                                          |
|  ----------------------------------------|
|                                          |
|  SEU PROXIMO PASSO                       |
|  Escolha UM tema que voce ja domina     |
|  e grave um video de 3 minutos          |
|  explicando para um amigo.              |
|                                          |
|  ----------------------------------------|
|                                          |
|  Seu perfil completo esta pronto.       |
|  Para onde enviamos?                     |
|    [H2 - 20px]                          |
|                                          |
|  +--------------------------------------+|
|  |  Receber no WhatsApp (recomendado)  ||
|  |  [Primary CTA - WhatsApp green]     ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  |  Tambem enviar por email            ||
|  |  [Secondary CTA - outlined]         ||
|  +--------------------------------------+|
|                                          |
|  ----------------------------------------|
|                                          |
|  [Shareable card preview - mini]        |
|  Compartilhar resultado                  |
|  [Share button - outlined, small]       |
|                                          |
|  ----------------------------------------|
|  [Footer micro-copy]                    |
|  Metodo Cria | Politica de Privacidade  |
|                                          |
+------------------------------------------+
```

**Layout Notes:**
- Color band at top uses archetype-specific color (full bleed)
- Archetype icon centered, large (64px)
- Result sections separated by subtle dividers (1px, 8% opacity)
- CTA section: WhatsApp button is primary (green), email is secondary (outlined)
- Shareable card: mini preview of what gets shared to Instagram Stories (9:16 safe)
- Single column, max-width 480px on desktop
- Generous padding: 24px horizontal, 32px between sections
- Total scroll: approximately 2-3 screen heights on mobile (intentional -- invested users scroll)

**Component Inventory:**
- ArchetypeHeader (icon + name + tagline + color band)
- BodyText
- StrengthsList (bulleted)
- SectionLabel (uppercase, small)
- SectionContent
- PrimaryButton (WhatsApp CTA)
- SecondaryButton (Email CTA)
- ShareCard (mini preview)
- ShareButton
- Footer

---

## Cross-Screen Navigation Flow

```
Screen 1 (Entry)
    | [tap CTA]
    v
Screen 2 (Q1) --> Screen 3 (Q2) --> Screen 4 (Q3) --> Screen 5 (Q4)
    | [auto-advance on option tap]
    v
Screen 6 (Q5) --> Screen 7 (Q6) --> Screen 8 (Q7)
    | [auto-advance on option tap]
    v
Screen 9 (Loading - 3s auto)
    |
    v
Screen 10 (Results)
    | [WhatsApp CTA] --> wa.me deep link
    | [Email CTA] --> confirmation toast
    | [Share] --> native share / screenshot prompt
```

**Navigation Rules:**
- No back button during questions (reduces abandonment)
- No skip button (all questions required)
- Auto-advance on option selection (200ms delay for visual feedback)
- Loading screen auto-transitions (no user action needed)
- Results page is terminal -- CTAs lead to external actions

---

## Responsive Breakpoints

| Breakpoint | Max-width container | Font scale | Card padding |
|-----------|-------------------|-----------|-------------|
| Mobile (320-480px) | 100% - 48px padding | 1x (base) | 16px |
| Tablet (768px) | 520px centered | 1.1x | 20px |
| Desktop (1024px+) | 520px centered | 1.15x | 24px |

The quiz is a single narrow column at all breakpoints. On desktop it simply centers with generous whitespace on sides.

---

*Wireframes by @ux-design-expert (Uma) | LOV-1 | Phase 2*
