# Task: Create Conditional Rules

**Task ID:** CCM-CONFIG-003
**Version:** 1.0.0
**Command:** `*create-rules`
**Orchestrator:** Sigil (config-engineer)
**Purpose:** Create conditional rules in `.claude/rules/` with proper `paths:` YAML frontmatter for context-efficient loading, ensuring rules only activate when relevant files are being worked on.

---

## Overview

```
  +------------------+     +------------------+     +------------------+
  | 1. Identify      | --> | 2. Create Rule   | --> | 3. Write Rule    |
  |    Rule Need     |     |    File with     |     |    Content       |
  +------------------+     |    Frontmatter   |     +------------------+
                            +------------------+          |
                                                          v
                            +------------------+     +------------------+
                            | 5. Test Rule     | <-- | 4. Validate      |
                            |    Activation    |     |    Rule Loading  |
                            +------------------+     +------------------+
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| rule_name | string | User parameter | Yes | Kebab-case filename (e.g., `api-conventions`) |
| rule_type | string | User parameter | No | `conditional` (default) or `always-on` |
| target_paths | array | User parameter or auto-detected | No | Glob patterns for conditional loading |
| description | string | User parameter | No | Purpose of the rule |

---

## Preconditions

- .claude/ directory exists (or will be created)
- Understanding of which directories/files the rule should apply to
- No existing rule file with the same name (or user confirms overwrite)

---

## Execution Phases

### Phase 1: Identify Rule Need

Determine what kind of rule to create:

1. Ask the user what behavior they want to enforce or what context they want to inject
2. Categorize the rule:

| Category | Example Rules | Typical Paths |
|----------|---------------|---------------|
| API conventions | Endpoint patterns, error handling, validation | `src/api/**`, `server/**` |
| Component patterns | React patterns, styling, props conventions | `src/components/**/*.tsx` |
| Test conventions | Testing patterns, mock strategies, coverage | `tests/**`, `**/*.test.*` |
| Database rules | Migration patterns, query conventions, RLS | `migrations/**`, `supabase/**` |
| Documentation | Doc formatting, README structure, changelog | `docs/**`, `*.md` |
| Security | Input validation, auth patterns, OWASP | `src/auth/**`, `src/middleware/**` |
| Configuration | Config file conventions, env var patterns | `*.config.*`, `.env.*` |
| Always-on | Project-wide conventions (no paths: needed) | (none -- loads always) |

3. If the user is unsure: scan the project structure and suggest rules based on detected directories

### Phase 2: Create Rule File with Frontmatter

1. Determine the file path: `.claude/rules/{rule_name}.md`
2. For **conditional rules**, generate the `paths:` YAML frontmatter:

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "src/api/**/*.tsx"
  - "server/**/*.ts"
---
```

**Glob pattern reference:**
- `*` matches any single path segment
- `**` matches zero or more path segments (recursive)
- `*.ts` matches TypeScript files in current directory
- `**/*.ts` matches TypeScript files recursively
- `src/{api,server}/**` matches multiple directories
- `**/*.{ts,tsx}` matches multiple extensions using brace expansion

3. For **always-on rules**, omit the frontmatter entirely (no `---` blocks)
4. Create subdirectories if organizing by domain: `.claude/rules/frontend/`, `.claude/rules/backend/`

### Phase 3: Write Rule Content

Write the rule body following these guidelines:

1. **Start with a clear header** explaining the rule's purpose
2. **Use imperative instructions** -- tell Claude what to do, not what to consider
3. **Be specific and verifiable** -- include code examples when relevant
4. **Keep rules concise** -- target 20-60 lines per rule file
5. **Use bullet points** for individual rules

**Rule template:**

```markdown
---
paths:
  - "{glob-patterns}"
---
# {Rule Title}

## Conventions

- {Specific, actionable instruction}
- {Another instruction with example}

## Patterns

When creating {X}, follow this pattern:

```{language}
{code example}
```

## Anti-patterns

- Do NOT {specific thing to avoid}
- Do NOT {another thing to avoid}
```

### Phase 4: Validate Rule Loading

1. Verify the frontmatter YAML is valid:
   - Proper `---` delimiters (opening and closing)
   - `paths:` is a YAML array (each item starts with `- `)
   - Glob patterns are quoted strings
   - No trailing whitespace or tab characters in frontmatter
2. Verify the file is saved in `.claude/rules/` (or a subdirectory)
3. Check that the glob patterns match actual files in the project:
   - Run a glob match test against the project structure
   - Warn if patterns match zero files (possibly incorrect)
   - Warn if patterns match too many files (overly broad)

### Phase 5: Test Rule Activation

1. Explain to the user how to verify the rule loads:
   - Open a file matching one of the glob patterns
   - The rule should appear in Claude's context for that interaction
   - Rules without paths: frontmatter load on every interaction
2. Suggest a test prompt that would trigger the rule's instructions
3. If the rule conflicts with CLAUDE.md content, flag the conflict:
   - Rules and CLAUDE.md instructions should complement, not contradict
   - If contradiction exists: recommend removing the instruction from CLAUDE.md (the rule file is more targeted)

---

## Output Format

```markdown
## Rule Created

**File:** .claude/rules/{rule_name}.md
**Type:** {conditional | always-on}
**Lines:** {N}

### Loading Behavior

{For conditional:}
This rule loads when Claude reads files matching:
- `{pattern-1}` -- matches {N} files
- `{pattern-2}` -- matches {N} files

{For always-on:}
This rule loads on every interaction.

### Content Summary

{1-2 sentence summary of what the rule enforces}

### Verification

Open any file matching the paths above and ask Claude to follow the
conventions. The rule will be active in that context.
```

---

## Veto Conditions

- **NEVER** create a rule that contradicts instructions in CLAUDE.md without flagging the conflict and recommending resolution.
- **NEVER** create a conditional rule without testing that its glob patterns match at least one existing file. Warn if zero matches.
- **NEVER** write a rule file over 100 lines. Split into multiple focused rules instead.
- **NEVER** include secrets, API keys, or credentials in rule files (they are committed to git).
- **NEVER** create an always-on rule for content that should be conditional. Large always-on rules waste context budget on every interaction.

---

## Completion Criteria

- [ ] Rule need identified and categorized
- [ ] File created in .claude/rules/ with correct path
- [ ] Frontmatter YAML validated (for conditional rules)
- [ ] Rule content follows the template with specific, actionable instructions
- [ ] Glob patterns tested against project structure
- [ ] No conflicts with existing CLAUDE.md instructions
