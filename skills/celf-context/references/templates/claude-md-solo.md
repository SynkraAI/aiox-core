# Template: CLAUDE.md for SOLO Profile

Copy and customize. Replace all {placeholders}.

---

```markdown
# {Project Name}

## Identity
I am {your name}. I build {what you do} for {who you serve}.

## Rules
1. Read before writing. Ratio 2:1 minimum.
2. When uncertain, state confidence (HIGH/MEDIUM/LOW) or say "I don't know."
3. Outputs go in outputs/. Never create files at root.
4. Before creating content, read .brain/ for product/persona facts.
5. 2 failed attempts with same approach = change strategy.
6. Keep this file under 50 lines. Move details to separate files.

## Paths
| What | Where |
|------|-------|
| Product & persona | .brain/BRAIN.yaml |
| Customer research | inputs/intelligence/ |
| Generated work | outputs/ |

## What I value
- Directness over politeness
- Working code over perfect code
- Shipping over planning
```

---

**Customization notes:**
- Replace "What I value" with your actual preferences
- Add domain-specific rules only if they change behavior in >50% of sessions
- If you use agents/skills, add a Routing section
- Never put product details here — those go in .brain/
