# Rewrite UX Copy for Sixth-Grade Literacy

> Task ID: brad-ux-rewrite-sixth-grade
> Agent: Brad (Design System Architect)
> Version: 1.0.0

## Description

Rewrite interface copy so a person with sixth-grade literacy can understand it quickly without losing product intent.

Use this as a simplification gate for:
- onboarding flows
- settings screens
- forms and validation messages
- dashboards with instructional text

## Prerequisites

- Screen text inventory (titles, descriptions, labels, helper text, empty states, errors)
- Business-critical terms that cannot be removed
- Locale defined (pt-BR or en)

## Workflow

1. **Extract Copy**
- Capture all visible strings from the target screen.
- Group by element type: heading, action, instruction, error, hint.

2. **Detect Complexity**
- Flag long sentences (>20 words).
- Flag jargon, passive voice, and abstract terms.
- Flag multi-idea paragraphs.

3. **Rewrite to Sixth-Grade Level**
- Prefer short sentences (8-14 words).
- Use common words and concrete verbs.
- Keep one idea per sentence.
- Convert passive to active voice.
- Replace vague text with clear user action.

4. **Preserve Critical Precision**
- Keep legal/compliance terms when required.
- Keep domain terms only when unavoidable, then explain in plain language.

5. **Run Clarity Checks**
- "Can I understand this in one read?"
- "Can I act without asking support?"
- "Can a new user explain this screen in their own words?"

6. **Deliver Before/After Table**
- Include rationale per change.
- Mark high-impact rewrites first (primary CTA, errors, key instructions).

## Output

- `before-after-copy.md` with full rewrite map
- Prioritized list of copy changes
- Optional "Do/Don't" style guide snippets for the product

## Success Criteria

- [ ] Primary actions understood in <5 seconds
- [ ] No sentence above 20 words in critical paths
- [ ] Jargon removed or explained
- [ ] Error messages include cause + next step
- [ ] User can complete core flow without external explanation

## Notes

- Simplify, do not infantilize.
- Clarity beats cleverness.
- If copy must stay complex for legal reasons, add a plain-language helper line.


## Related Checklists

- `squads/design/checklists/reading-accessibility-checklist.md`

## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
