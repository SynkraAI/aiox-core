# Block: Context Loading

> **Block ID:** `context-loading`
> **Version:** 1.0.0
> **Type:** Reusable Include Block

## Purpose

Load AIOS project context before task execution. Provides git state, gotchas filtered by category, technical preferences, and core configuration.

## Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | No | `null` | Filter gotchas by category (e.g., `supabase`, `frontend`, `auth`) |
| `include_git` | boolean | No | `true` | Include git status and recent commits |
| `include_gotchas` | boolean | No | `true` | Load gotchas from memory |
| `include_preferences` | boolean | No | `true` | Load technical preferences |

## Output

| Field | Type | Description |
|-------|------|-------------|
| `git.status` | string | Output of `git status --short` |
| `git.recentCommits` | string[] | Last 5 commits (oneline format) |
| `gotchas` | Gotcha[] | Filtered gotchas relevant to current task |
| `preferences` | object | Technical preferences from data file |
| `config` | object | Core configuration keys |

## Execution Steps

```yaml
steps:
  - name: Load Git Context
    condition: include_git == true
    actions:
      - run: git status --short
      - run: git log --oneline -5
    output: git.status, git.recentCommits

  - name: Load Gotchas
    condition: include_gotchas == true
    actions:
      - read: .aios/gotchas.json
      - filter: by category if provided
    output: gotchas

  - name: Load Technical Preferences
    condition: include_preferences == true
    actions:
      - read: .aios-core/data/technical-preferences.md
    output: preferences

  - name: Load Core Config
    actions:
      - read: .aios-core/core-config.yaml
      - extract: devLoadAlwaysFiles, project.*, deployment.*
    output: config
```

## Usage

### Include in Task File

```markdown
<!-- Include: blocks/context-loading.md -->
<!-- Parameters: category=supabase -->
```

### Programmatic Usage

```javascript
const { loadContext } = require('.aios-core/utils/context-loader');

const context = await loadContext({
  category: 'supabase',
  include_git: true,
  include_gotchas: true,
  include_preferences: true
});

// Access loaded context
console.log(context.git.status);
console.log(context.gotchas);
console.log(context.config.devLoadAlwaysFiles);
```

## Files Accessed

| File | Purpose |
|------|---------|
| `.aios/gotchas.json` | Known issues and workarounds |
| `.aios-core/data/technical-preferences.md` | User-defined patterns |
| `.aios-core/core-config.yaml` | Project configuration |

## Error Handling

| Error | Behavior |
|-------|----------|
| File not found | Log warning, continue with empty value |
| Parse error | Log error, use empty default |
| Git not available | Skip git context, log info |

## Notes

- Block executes in <2 seconds for typical projects
- Gotchas are cached per session to avoid repeated reads
- Git commands are non-blocking and fail gracefully
