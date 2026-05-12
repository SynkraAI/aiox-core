# Configuration Migration Guide

Migrate from monolithic `core-config.yaml` to the layered configuration hierarchy.

**ADR:** [ADR-PRO-002 — Configuration Hierarchy](../architecture/adr/adr-pro-002-configuration-hierarchy.md)
**Story:** PRO-4 — Core-Config Split Implementation

---

## Overview

AIOX v3.12+ introduces a 4-level configuration hierarchy that replaces the single `core-config.yaml` file:

| Level | File | Git Status | Purpose |
|-------|------|------------|---------|
| **L1** Framework | `framework-config.yaml` | Committed (read-only) | Framework defaults, resource locations |
| **L2** Project | `project-config.yaml` | Committed | Project metadata, integrations, squads |
| **Pro** Extension | `pro/pro-config.yaml` | Submodule | Premium features (aiox-pro) |
| **L3** App | `apps/<name>/aiox-app.config.yaml` | Committed | Per-app overrides |
| **L4** Local | `local-config.yaml` | Gitignored | IDE, MCP, secrets, machine-specific |

Resolution order: L1 → L2 → Pro → L3 → L4 (last wins for scalars, deep merge for objects).

---

## Quick Migration

### Automatic (Recommended)

```bash
# Preview what will happen
aiox config migrate --dry-run

# Run migration
aiox config migrate

# Verify
aiox config validate
aiox config show --debug
```

### Manual

1. Copy the template for local config:
   ```bash
   aiox config init-local
   ```

2. The framework and project configs are already in place. Edit `project-config.yaml` for project-specific values.

3. Edit `local-config.yaml` for machine-specific settings (IDE, MCP, secrets).

---

## Merge Strategy

| Type | Behavior | Example |
|------|----------|---------|
| **Scalars** | Last wins | L2 `timeout: 30` overrides L1 `timeout: 10` |
| **Objects** | Deep merge | L2 adds keys to L1 objects |
| **Arrays** | Replace | L2 array replaces L1 array entirely |
| **+append** | Concatenate | `+append: [new]` appends to parent array |
| **null** | Delete key | `key: null` removes key from merged result |

---

## Which File to Edit?

| Setting | Level | File |
|---------|-------|------|
| Project name, description | L2 | `project-config.yaml` |
| GitHub integration | L2 | `project-config.yaml` |
| CodeRabbit config (non-secret) | L2 | `project-config.yaml` |
| CodeRabbit secrets/commands | L4 | `local-config.yaml` |
| IDE selection | L4 | `local-config.yaml` |
| MCP configuration | L4 | `local-config.yaml` |
| Squad definitions | L2 | `project-config.yaml` |
| Performance overrides | L4 | `local-config.yaml` |
| Framework resource locations | L1 | `framework-config.yaml` (do not edit) |
| Framework performance defaults | L1 | `framework-config.yaml` (do not edit) |

---

## Environment Variables

Only `local-config.yaml` (L4) should contain `${ENV_VAR}` references:

```yaml
# local-config.yaml
mcp:
  docker_mcp:
    gateway:
      url: "${MCP_GATEWAY_URL:-http://localhost:8080/mcp}"
```

If `${...}` patterns are found in L1 or L2, `aiox config validate` will warn — these files are committed to git and should not contain environment-specific values.

---

## Backward Compatibility

The monolithic `core-config.yaml` continues to work. If it exists and no `framework-config.yaml` is found, the system loads in **legacy mode** automatically.

### Deprecation Timeline

| Version | Behavior |
|---------|----------|
| **v3.12.0** | Layered config available, monolithic still supported |
| **v3.13.0** | Deprecation warnings when legacy mode detected |
| **v4.0.0** | Monolithic support removed |

To suppress deprecation warnings: `AIOX_SUPPRESS_DEPRECATION=1`

---

## Troubleshooting

### Config not loading after migration

```bash
# Check which mode is active
aiox config show --debug
# Look for "[Legacy]" vs "[L1]", "[L2]", "[L4]" annotations
```

### Values not appearing in resolved config

```bash
# Compare levels to find where a value is set
aiox config diff --levels L1,L2

# Check a specific level
aiox config show --level L2
```

### YAML syntax errors

```bash
# Validate all levels
aiox config validate

# Validate specific level
aiox config validate --level L4
```

### Local config not working

1. Ensure `local-config.yaml` exists (not just the template):
   ```bash
   aiox config init-local
   ```
2. Check it's not accidentally committed — it should be in `.gitignore`.

### Environment variables not resolved

- Only L4 (local-config.yaml) supports `${ENV_VAR}` interpolation.
- Check the variable is set: `echo $ENV_VAR` / `echo %ENV_VAR%`
- Use `${ENV_VAR:-default}` syntax for optional variables.

---

## CLI Reference

| Command | Description |
|---------|-------------|
| `aiox config show` | Show fully resolved configuration |
| `aiox config show --level L2` | Show single level (raw, no merge) |
| `aiox config show --debug` | Show with source annotations per value |
| `aiox config diff --levels L1,L2` | Compare two levels |
| `aiox config migrate` | Migrate monolithic to layered |
| `aiox config migrate --dry-run` | Preview migration without changes |
| `aiox config validate` | Validate YAML syntax and patterns |
| `aiox config init-local` | Create local-config.yaml from template |

---

## FAQ

**Q: Do I need to delete `core-config.yaml` after migration?**
A: No. Keep it as backup. The system detects layered mode by the presence of `framework-config.yaml`. The migration command preserves it as `core-config.yaml.backup`.

**Q: Can team members use different IDEs?**
A: Yes. IDE selection is in L4 (local-config.yaml), which is gitignored. Each developer configures their own.

**Q: What if I need a setting that doesn't fit any level?**
A: Use L2 (project-config.yaml) for shared settings, L4 (local-config.yaml) for personal/secret settings.

**Q: How does aiox-pro config work?**
A: Pro config (`pro/pro-config.yaml`) merges between L2 and L3. When the `pro/` submodule is absent, the resolution skips it silently.

---

*Story PRO-4 | ADR-PRO-002 | CLI First*
