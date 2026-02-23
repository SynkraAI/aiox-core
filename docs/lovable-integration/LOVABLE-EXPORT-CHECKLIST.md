# Lovable Export Verification Checklist

**Purpose:** Quality gates to verify before integrating Lovable-generated code.

---

## Visual Verification (In Lovable Preview)

- [ ] Dark background `#0F0F0F` applied across all screens
- [ ] Amber accent `#F59E0B` on all CTA buttons
- [ ] Inter font loaded and rendering (check weight variation: regular vs bold vs extrabold)
- [ ] Entry screen: 3 input fields + amber CTA button visible
- [ ] Question screens: progress bar visible and filling correctly
- [ ] Option cards: 4 per question, correct text, tappable
- [ ] Q7: no letter labels (A/B/C/D), only italic quoted text
- [ ] Loading screen: spinner + 3 staggered text lines
- [ ] Result screen: archetype name in archetype color, not amber
- [ ] WhatsApp button is green `#25D366`, not amber
- [ ] Mobile preview at 375px: no horizontal overflow, text readable

## Functional Verification (After Export + Local Run)

- [ ] Entry form validates: empty name shows error, invalid email shows error
- [ ] Tapping option on Q1 auto-advances to Q2 (no Next button)
- [ ] Progress bar animates smoothly between questions
- [ ] After Q7, loading screen appears (not another question)
- [ ] Loading screen auto-advances after ~3 seconds
- [ ] Result screen shows one of 4 archetypes with correct copy
- [ ] WhatsApp CTA opens wa.me link with correct archetype in message
- [ ] Secondary "email" button exists on result page
- [ ] Supabase insert works (check dashboard for new row in quiz_responses)
- [ ] Duplicate email same day shows friendly message instead of error

## Code Quality Verification

- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] No `any` types in the generated code
- [ ] `useReducer` used for state management (not useState soup)
- [ ] Supabase client uses `import.meta.env.VITE_SUPABASE_URL` (not hardcoded)
- [ ] No hardcoded API keys anywhere in source files
- [ ] Scoring matrix matches the spec (7 questions x 4 options x 4 archetype scores)
- [ ] All 7 question texts match the copy direction exactly
- [ ] All 4 archetype descriptions match the copy direction
- [ ] No console.log statements left in production code (console.error is OK for error handling)
- [ ] Animations use only `transform` and `opacity` (no layout-triggering properties)

## Accessibility Verification

- [ ] All inputs have associated labels (floating label or aria-label)
- [ ] Option cards have `role="radio"` or equivalent ARIA
- [ ] Progress bar has `role="progressbar"` with `aria-valuenow`
- [ ] Tab key navigates through all interactive elements
- [ ] `prefers-reduced-motion` media query present in CSS
- [ ] Minimum font size is 16px on inputs (prevents iOS zoom)
- [ ] Touch targets are minimum 48px

## Responsive Verification

- [ ] 320px viewport: no overflow, all text visible, CTA tappable
- [ ] 375px viewport (iPhone SE): full flow works
- [ ] 768px viewport (tablet): content centered, max-width 520px
- [ ] 1024px viewport (desktop): centered column with whitespace on sides

## Common Lovable Issues and Fixes

| Issue | How to Detect | Fix |
|-------|--------------|-----|
| Lovable invents extra screens | More than 10 components | Delete extras, verify flow matches spec |
| Scoring logic wrong or missing | Test: answer all A options, should get Comunicador | Replace with exact scoring matrix from mega-prompt |
| Hardcoded Supabase URL | Grep for `supabase.co` in source | Replace with `import.meta.env.VITE_SUPABASE_URL` |
| Missing Inter font | Text renders in system font | Add Google Fonts link to index.html |
| WhatsApp link broken | Tap does nothing or wrong URL | Fix the `wa.me` URL template in ResultScreen |
| Option cards don't auto-advance | User has to click a Next button | Remove Next button, add auto-advance on option tap with 200ms delay |
| Light theme leaks through | White backgrounds on some elements | Find and replace white backgrounds with `#0F0F0F` or `#1A1A1A` |
| Archetype colors not applied | Result page uses amber for all archetypes | Map archetype ID to its specific color in ResultScreen |
| Copy paraphrased by Lovable | Text doesn't match spec exactly | Replace with exact copy from mega-prompt |
| Missing LGPD text | No privacy notice on entry screen | Add micro-copy below CTA |

## Requesting Lovable Adjustments

If the generated code has issues, paste these focused fix requests into Lovable:

**For missing dark theme:**
> "Change ALL backgrounds to dark theme. Page background should be #0F0F0F, card backgrounds #1A1A1A, elevated states #252525. All text should be #F5F5F5 for primary and #A3A3A3 for secondary."

**For missing animations:**
> "Add slide-left transition between questions (300ms ease-out). Add staggered fade-in on result screen sections (200ms intervals). Add smooth progress bar fill with overshoot easing."

**For wrong scoring:**
> "Replace the archetype scoring logic with this exact matrix: [paste the SCORING_MATRIX from mega-prompt]"

**For missing auto-advance:**
> "Remove the Next button from question screens. When user taps an option card, highlight it for 200ms, dim other cards, then automatically transition to the next question."

---

*Export Checklist | Metodo Cria Quiz | LOV-1 Phase 5*
