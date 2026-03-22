# SYNAPSE Assets

Templates for creating custom SYNAPSE domains and manifest entries.

## Templates Location

Templates are maintained as the single source of truth in the CRUD commands directory:

| Template | Location |
|----------|----------|
| **Domain template** | `.claude/commands/synapse/templates/domain-template` |
| **Manifest entry template** | `.claude/commands/synapse/templates/manifest-entry-template` |

These templates are used by the `*synapse create` command to scaffold new domains.

## Usage

To create a new domain using these templates, run:

```
*synapse create
```

Or reference the templates directly when creating domains manually.

## Template Formats

### Domain Template

```
# ==========================================
# SYNAPSE Domain: {DOMAIN_NAME}
# Created: {CURRENT_DATE}
# Description: {DESCRIPTION}
# ==========================================

# Rules
{DOMAIN_KEY}_RULE_0={FIRST_RULE}
```

### Manifest Entry Template

```
# Layer 6: {domain-name}
{DOMAIN_KEY}_STATE=active
{DOMAIN_KEY}_RECALL={KEYWORDS}
{DOMAIN_KEY}_EXCLUDE=
```

For the complete KEY=VALUE format specification, see [../references/manifest.md](../references/manifest.md).
