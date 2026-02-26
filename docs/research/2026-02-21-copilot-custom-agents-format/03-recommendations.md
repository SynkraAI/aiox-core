# Recommendations for Issue #138

## Implementation Plan

### Overview

Create a GitHub Copilot-specific transformer in the IDE sync pipeline that converts AIOS agent definitions into the `.agent.md` format with proper YAML frontmatter.

### Phase 1: Create GitHub Copilot Transformer

**File:** `.aios-core/infrastructure/scripts/ide-sync/transformers/github-copilot.js`

The transformer must:
1. Parse the agent YAML block from the source `.md` file
2. Extract: `name`, `id`, `title`, `whenToUse`, `icon`
3. Extract persona: `role`, `style`, `core_principles`
4. Extract commands list
5. Generate YAML frontmatter with:
   - `name`: from `agent.id`
   - `description`: from `agent.whenToUse` (single-quoted)
   - `tools`: `['read', 'edit', 'search', 'execute']` (standard set)
6. Generate clean Markdown body (under 30K chars):
   - Role description from `persona.role`
   - Core principles
   - Quick commands reference
   - Sync footer

### Phase 2: Update IDE Sync Configuration

**File:** `.aios-core/infrastructure/scripts/ide-sync/index.js`

Change GitHub Copilot config from:
```javascript
'github-copilot': {
  enabled: true,
  path: '.github/agents',
  format: 'full-markdown-yaml',  // Uses Claude Code transformer
}
```

To:
```javascript
'github-copilot': {
  enabled: true,
  path: '.github/agents',
  format: 'github-copilot',  // Uses new Copilot transformer
  extension: '.agent.md',    // New: file extension override
}
```

### Phase 3: Update core-config.yaml

Update the GitHub Copilot format reference to use the new transformer name.

### Phase 4: Rename Existing Files

Rename `.github/agents/*.md` to `.github/agents/*.agent.md`:
- `dev.md` -> `dev.agent.md`
- `qa.md` -> `qa.agent.md`
- ... (all 12 agents)

### Phase 5: Update Installer

**File:** `packages/installer/src/wizard/ide-config-generator.js`

Update the `copyAgentFiles` function to:
1. Use `.agent.md` extension for GitHub Copilot
2. Apply the GitHub Copilot transformer during installation (not just raw copy)

### Phase 6: Validation

- Run `npm run sync:ide:github-copilot` and verify output format
- Verify YAML frontmatter is valid
- Verify prompt body is under 30,000 characters
- Test in VS Code with GitHub Copilot extension

## Expected Output Format

For each of the 12 agents, the output should look like:

```markdown
---
name: dev
description: 'Full Stack Developer for code implementation, debugging, refactoring, and development best practices'
tools: ['read', 'edit', 'search', 'execute']
---

# Dev Agent (Dex)

You are an expert Senior Software Engineer and Implementation Specialist.

## Role
Expert Senior Software Engineer focused on implementation, debugging, refactoring, and development best practices.

## Style
Extremely concise, pragmatic, code-focused, educational when teaching patterns.

## Core Principles
- Story has ALL info needed for implementation
- Follow story acceptance criteria exactly
- Update file list and checkboxes as work progresses
- Run tests after implementation
- Use CodeRabbit self-healing for quality

## Commands
Use `*` prefix for commands:
- `*help` - Show available commands
- `*develop {story}` - Implement story tasks
- `*review-qa` - Fix issues from QA feedback
- `*exit` - Exit dev mode

---
*AIOS Agent - Synced from .aios-core/development/agents/dev.md*
```

## Mapping: AIOS Agent Fields -> Copilot Frontmatter

| AIOS Field | Copilot Property | Notes |
|------------|-----------------|-------|
| `agent.id` | `name` | Lowercase identifier |
| `agent.whenToUse` | `description` | Single-quoted |
| (derived) | `tools` | Standard: `['read', 'edit', 'search', 'execute']` |
| `persona.role` | Prompt body | First section |
| `persona.style` | Prompt body | Second section |
| `persona.core_principles` | Prompt body | Bullet list |
| `commands[]` | Prompt body | Quick reference |

## Files to Create/Modify

| Action | File |
|--------|------|
| CREATE | `.aios-core/infrastructure/scripts/ide-sync/transformers/github-copilot.js` |
| MODIFY | `.aios-core/infrastructure/scripts/ide-sync/index.js` |
| MODIFY | `.aios-core/core-config.yaml` |
| MODIFY | `packages/installer/src/wizard/ide-config-generator.js` |
| RENAME | `.github/agents/*.md` -> `.github/agents/*.agent.md` |
| DELETE | Old `.github/agents/*.md` files |

## Next Steps

Implementation should be handled by @dev (Dex) with a new story or as a fix under issue #138. Delegate to @pm for story creation if scope warrants it.
