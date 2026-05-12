## Agent Contribution

<!-- Thank you for contributing an agent to AIOX! Please fill out this template. -->

### Agent Information

- **Agent Name:** <!-- e.g., security-auditor -->
- **Agent ID:** <!-- e.g., security-auditor (kebab-case) -->
- **Agent Type:** <!-- core | expansion | community -->

### Changes Made

- [ ] New agent definition
- [ ] Updated existing agent
- [ ] New commands added
- [ ] New task dependencies added

### Description

<!-- Describe what this agent does and why it's useful -->

### Checklist

#### Required

- [ ] Agent follows AIOX agent YAML structure
- [ ] `persona_profile` is complete (archetype, communication, greeting_levels)
- [ ] All commands have corresponding task dependencies
- [ ] No hardcoded credentials or sensitive data
- [ ] Local validation passes (`npm run lint && npm run typecheck && npm test`)

#### Recommended

- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated
- [ ] Example usage provided

### Testing

<!-- Describe how you tested this agent -->

```bash
# Commands used to test
```

### Related Issues

<!-- Link to related issues: Fixes #123, Relates to #456 -->

---

_By submitting this PR, I confirm I have read the [Contribution Guidelines](../../CONTRIBUTING.md) and [External Contribution Guide](../../docs/guides/external-contribution-guide.md)_
