# Configuration Override Guide

Reference documentation for the AIOS layered config system (ADR-PRO-002).

---

## Config Hierarchy

```
L1 Framework (.aios-core/framework-config.yaml)   — Read-only, shipped with npm
  ↓ deep merge
L2 Project (.aios-core/project-config.yaml)        — Team-shared, committed
  ↓ deep merge
Pro Extension (pro/pro-config.yaml)                 — Optional Pro submodule
  ↓ deep merge
L3 App ({appDir}/aios-app.config.yaml)             — Monorepo app-specific
  ↓ deep merge
L4 Local (.aios-core/local-config.yaml)            — Machine-specific, gitignored
  ↓ deep merge
L5 User (~/.aios/user-config.yaml)                 — Cross-project user prefs
```

Higher levels override lower levels. See `merge-utils.js` for merge semantics.

---

## Merge Behavior

| Type | Strategy | Example |
|------|----------|---------|
| Scalar | Last-wins | `"v4"` overrides `"v3"` |
| Object | Deep merge | L2 `{ a: 1 }` + L4 `{ b: 2 }` = `{ a: 1, b: 2 }` |
| Array | Replace | L2 `[a, b]` replaced by L4 `[c]` |
| Array+append | Concat | `key+append: [c]` = `[a, b, c]` |
| null | Delete | `key: null` removes key from merged result |

### +append Pattern

To add items to an array without replacing it, use the `+append` suffix:

```yaml
# L2 project-config.yaml
utility_scripts_registry:
  helpers+append:
    - my-custom-helper
```

This appends `my-custom-helper` to the L1 default helpers array.

---

## Overridable Keys

### L1 Framework Keys (framework-config.yaml)

| Key | Type | Default | Override Level | Description |
|-----|------|---------|---------------|-------------|
| `metadata.name` | string | `"Synkra AIOS"` | Never | Framework name |
| `metadata.framework_version` | string | `"4.0.0"` | Never | Framework version |
| `markdownExploder` | boolean | `true` | L2+ | Enable markdown exploder |
| `resource_locations.agents_dir` | string | `.aios-core/development/agents` | L2+ | Agent definitions path |
| `resource_locations.tasks_dir` | string | `.aios-core/development/tasks` | L2+ | Task definitions path |
| `resource_locations.templates_dir` | string | `.aios-core/development/templates` | L2+ | Templates path |
| `resource_locations.checklists_dir` | string | `.aios-core/development/checklists` | L2+ | Checklists path |
| `resource_locations.tools_dir` | string | `.aios-core/tools` | L2+ | Tools path |
| `resource_locations.scripts.*` | string | various | L2+ | Script paths by category |
| `resource_locations.data_dir` | string | `.aios-core/data` | L2+ | Data directory |
| `performance_defaults.lazy_loading.enabled` | boolean | `true` | L2+ | Lazy loading toggle |
| `performance_defaults.lazy_loading.heavy_sections` | array | `[pvMindContext, squads, registry]` | L2+ | Sections to lazy-load |
| `performance_defaults.git.cache_time_seconds` | integer | `300` | L4+ | Git cache TTL |
| `ide_sync_system.enabled` | boolean | `true` | L2+ | IDE sync toggle |
| `ide_sync_system.targets.*` | object | various | L2+ | Per-IDE configuration |
| `template_overrides.story.sections_order` | array/null | `null` | L2+ | Custom story section order |
| `template_overrides.story.optional_sections` | array | `[]` | L2+ | Skippable story sections |

### L2 Project Keys (project-config.yaml)

| Key | Type | Description |
|-----|------|-------------|
| `project.type` | string | `EXISTING_AIOS`, `NEW_PROJECT`, `BROWNFIELD` |
| `project.version` | string | Project config version |
| `documentation_paths.stories_dir` | string | Stories directory |
| `documentation_paths.dev_load_always_files` | array | Files loaded on dev activation |
| `github_integration.enabled` | boolean | GitHub CLI integration toggle |
| `github_integration.pr.conventional_commits.enabled` | boolean | Conventional commits |
| `coderabbit_integration.enabled` | boolean | CodeRabbit toggle |
| `coderabbit_integration.self_healing.max_iterations` | integer | Max auto-fix iterations |
| `coderabbit_integration.severity_handling.*` | string | `auto_fix`, `document_as_debt`, `ignore` |
| `squads.auto_load` | boolean | Auto-load squads on activation |
| `logging.decision_logging.enabled` | boolean | Decision log toggle |
| `story_backlog.enabled` | boolean | Backlog feature toggle |
| `auto_claude.worktree.enabled` | boolean | Worktree isolation toggle |
| `boundary.frameworkProtection` | boolean | Deny rules toggle (default: true) |
| `boundary.protected` | array | Protected path globs |
| `boundary.exceptions` | array | Exception path globs |
| `template_overrides.story.*` | object | Story template customization |

### L4 Local Keys (local-config.yaml)

| Key | Type | Description |
|-----|------|-------------|
| `ide.editor` | string | IDE preference |
| `mcp.docker_gateway.enabled` | boolean | Docker MCP toggle |

### L5 User Keys (~/.aios/user-config.yaml)

| Key | Type | Description |
|-----|------|-------------|
| `user_profile` | string | `bob` or `advanced` |

---

## Common Override Examples

### Disable Framework Protection (for contributors)

```yaml
# project-config.yaml
boundary:
  frameworkProtection: false
```

### Skip Community Origin Section in Stories

```yaml
# project-config.yaml
template_overrides:
  story:
    optional_sections:
      - community-origin
```

### Disable CodeRabbit Integration

```yaml
# project-config.yaml
coderabbit_integration:
  enabled: false
```

### Override Git Cache Locally

```yaml
# local-config.yaml (gitignored)
performance_defaults:
  git:
    cache_time_seconds: 60
```

### Add Custom Helper Scripts

```yaml
# project-config.yaml
utility_scripts_registry:
  helpers+append:
    - my-project-helper
```

---

## Schema Validation

Schemas validate configs at load time via Ajv. Invalid configs produce warnings (non-blocking):

```
project-config.yaml inválido: campo 'boundary/frameworkProtection' must be boolean
```

Schema files: `.aios-core/core/config/schemas/`

---

## Template Override Section IDs

Valid section IDs for `template_overrides.story`:

| Section ID | Description |
|-----------|-------------|
| `community-origin` | Community origin metadata |
| `status` | Story status tracking |
| `executor-assignment` | Agent assignment |
| `story` | User story statement |
| `acceptance-criteria` | AC definitions |
| `coderabbit-integration` | CodeRabbit config |
| `tasks-subtasks` | Implementation tasks |
| `dev-notes` | Developer notes |
| `change-log` | Version history |
| `dev-agent-record` | Dev agent execution record |
| `qa-results` | QA gate results |

---

*Story BM-4 — Boundary Schema Enrichment & Template Customization*
