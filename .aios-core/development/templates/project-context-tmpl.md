# CONTEXT.md — {{PROJECT_NAME}}

**Purpose:** Domain glossary + system map. Read FIRST when working on this project. Reduces token cost (no re-explaining vocab) and prevents naming drift across sessions.

**Source pattern:** Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) CONTEXT.md philosophy — shared language reduces complexity.

**Update rule:** When a new term, alias, or concept stabilizes during work, add it here BEFORE closing the session. Stale CONTEXT.md is worse than none.

---

## 1. One-line Identity

> What this project IS, in 1 sentence. If a new agent reads only this line, they should know what they're walking into.

`{{ONE_LINE_IDENTITY}}`

---

## 2. Domain Glossary

Project-specific terms that are NOT obvious from the code. Skip generic web/infra terms.

| Term | Meaning | Notes |
|------|---------|-------|
| `{{TERM_1}}` | {{MEANING_1}} | {{NOTES_1}} |
| `{{TERM_2}}` | {{MEANING_2}} | {{NOTES_2}} |

---

## 3. Product Lines / SKUs / Verticals

If the project sells multiple things or operates across verticals — list them with naming conventions.

| Code | Name | Price | Notes |
|------|------|-------|-------|
| `{{CODE}}` | {{NAME}} | {{PRICE}} | {{NOTES}} |

---

## 4. Stack & Key Files

| Layer | Tech | Entry point |
|-------|------|-------------|
| Frontend | {{TECH}} | `{{PATH}}` |
| Backend | {{TECH}} | `{{PATH}}` |
| Data | {{TECH}} | `{{PATH}}` |
| Deploy | {{TECH}} | {{URL}} |

**Source repo:** `{{REPO_URL_OR_PATH}}`
**Production URL:** `{{PROD_URL}}`
**Preview URL:** `{{PREVIEW_URL}}`

---

## 5. Active People & Roles

> Who decides what. Avoids "who is X again?" questions cross-session.

| Person | Role | Notes |
|--------|------|-------|
| {{NAME}} | {{ROLE}} | {{NOTES}} |

---

## 6. Tracking / Pixels / IDs

Critical IDs that get re-asked every session.

| System | ID | Notes |
|--------|----|-------|
| Meta Pixel | `{{ID}}` | {{NOTES}} |
| Google Ads Conv | `{{ID}}` | {{NOTES}} |
| GTM | `{{ID}}` | {{NOTES}} |
| Other | `{{ID}}` | {{NOTES}} |

---

## 7. Constraints & Non-Negotiables

> Hard rules. Violations = rework. Things the user has corrected before.

- {{RULE_1}}
- {{RULE_2}}

---

## 8. Known Dead Ends

> Approaches already tried and failed. Cross-link to `.out-of-scope/` entries when applicable.

- ❌ {{APPROACH}} — {{WHY_FAILED}} — see `.out-of-scope/{{slug}}.md`

---

## 9. Current State Snapshot

> One paragraph: where the project is RIGHT NOW. Update at end of every session.

Last updated: `{{ISO_DATE}}`
Branch / HEAD: `{{BRANCH_OR_COMMIT}}`
Live in production? {{YES_NO}}
Active blockers: {{LIST}}

---

## 10. Cross-References

- PRD: `{{PATH}}`
- Architecture: `{{PATH}}`
- MEMORY.md keys: {{LIST_OF_MEMORY_FILES}}
- Related projects: {{LIST}}
