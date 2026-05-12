# GitHub Workflows Templates

Templates for GitHub Actions workflows, used by the `*setup-github` task to configure DevOps infrastructure for user projects.

## Available Templates

### ci.yml.template

Basic CI workflow for pull requests and pushes:

- **lint** - ESLint validation
- **typecheck** - TypeScript type checking
- **test** - Jest/Vitest tests with coverage
- **build** - Production build validation

### pr-automation.yml.template

Enhanced PR validation workflow:

- All basic CI checks
- Coverage report as PR comment
- Quality gate summary comment
- CodeRabbit integration status

### release.yml.template

Release automation workflow:

- Triggered on version tags (v*)
- Automatic changelog generation
- GitHub Release creation
- Asset upload (tar.gz distribution)

## Template Variables

Variables are replaced during installation by the `*setup-github` task:

| Variable | Description | Default |
|----------|-------------|---------|
| `{{NODE_VERSION}}` | Node.js version | `20` |
| `{{PYTHON_VERSION}}` | Python version | `3.11` |
| `{{PROJECT_NAME}}` | Project name | From package.json |
| `{{LINT_COMMAND}}` | Lint command | `npm run lint` |
| `{{TEST_COMMAND}}` | Test command | `npm run test:coverage` |
| `{{TYPECHECK_COMMAND}}` | TypeCheck command | `npm run typecheck` |
| `{{BUILD_COMMAND}}` | Build command | `npm run build` |

## Usage

These templates are used automatically by the `*setup-github` task:

```bash
@devops *setup-github
```

Or manually copy and customize:

```bash
# Copy template
cp .aiox-core/infrastructure/templates/github-workflows/ci.yml.template .github/workflows/ci.yml

# Replace variables
sed -i 's/{{NODE_VERSION}}/20/g' .github/workflows/ci.yml
sed -i 's/{{LINT_COMMAND}}/npm run lint/g' .github/workflows/ci.yml
# ... etc
```

## Customization

### Adding New Jobs

Add new jobs to the workflow after the basic checks:

```yaml
custom-check:
  name: Custom Check
  runs-on: ubuntu-latest
  needs: [lint, typecheck]
  steps:
    - uses: actions/checkout@v4
    - run: echo "Custom validation"
```

### Different Languages

For Python projects, use `setup-python@v5`:

```yaml
- name: Setup Python
  uses: actions/setup-python@v5
  with:
    python-version: ${{ env.PYTHON_VERSION }}
    cache: 'pip'
```

For Go projects, use `setup-go@v5`:

```yaml
- name: Setup Go
  uses: actions/setup-go@v5
  with:
    go-version: '1.21'
```

## Related

- [Story 5.10 - GitHub DevOps Setup](../../../docs/stories/v4.0.4/sprint-5/story-5.10-github-devops-user-projects.md)
- [setup-github task](../../development/tasks/setup-github.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
