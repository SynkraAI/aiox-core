---
name: Squad Pull Request
about: Submit a new squad or update to existing squad
title: '[SQUAD] '
labels: 'squad', 'needs-po-review'
assignees: ''
---

# Squad Pull Request

## Package Information

- **Squad Name:**
- **Version:**
- **Type:** [ ] New Squad [ ] Update to Existing Squad
- **License:** [ ] Open-Source (MIT) [ ] Proprietary (separate repo)

## Description

A clear description of what this squad does and what changes are included.

## Purpose

What problem does this squad solve? What domain does it cover?

## Files Changed

- File 1
- File 2
- File 3

## Structure

- **Agents:** X agents
- **Tasks:** Y tasks
- **Workflows:** Z workflows
- **Templates:** W templates

## Compliance Checklist

- [ ] Follows AIOS squad structure (see [Squads Guide](docs/guides/squads-guide.md))
- [ ] All agents follow naming convention (`agent-id.md`)
- [ ] All tasks have proper structure
- [ ] `manifest.yaml` is properly configured
- [ ] README.md is complete with usage examples
- [ ] No hard dependencies on proprietary squads
- [ ] All code follows project style guidelines

## Testing

- [ ] Squad can be installed successfully
- [ ] All agents can be activated
- [ ] All tasks can be executed
- [ ] Integration with core framework works
- [ ] No breaking changes to existing functionality

## Documentation

- [ ] README.md updated
- [ ] Agent documentation complete
- [ ] Task documentation complete
- [ ] Usage examples provided
- [ ] Integration guide included (if applicable)

## Integration

- [ ] Works with core AIOS framework
- [ ] No conflicts with other squads
- [ ] External dependencies documented

## Example Usage

```bash
# Example of how to use this squad
@squad-name:agent-name
*task-name
```

## Security

- [ ] No sensitive data included
- [ ] No hardcoded credentials
- [ ] API keys use environment variables
- [ ] Security best practices followed

## Contributor

- **Author:**
- [ ] Willing to maintain this squad
- [ ] Can provide support

## Impact Assessment

- [ ] No breaking changes
- [ ] Backward compatible
- [ ] Performance impact: [ ] None [ ] Low [ ] Medium [ ] High

---

**IMPORTANT:** This PR requires Product Owner (PO) approval before merge. The PO will review:

- Squad quality and completeness
- Compliance with AIOS standards
- Integration with framework
- Documentation quality

**Review Process:**

1. Code review by maintainers
2. PO review and approval
3. Merge after approval
