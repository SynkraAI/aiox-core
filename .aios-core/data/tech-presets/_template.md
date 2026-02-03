# Tech Preset Template

> Use este template para criar novos presets de arquitetura por tecnologia.

---

## Metadata

```yaml
preset:
  id: technology-name
  name: 'Technology Name Preset'
  version: 1.0.0
  description: 'Brief description of when to use this preset'
  technologies:
    - tech1
    - tech2
  suitable_for:
    - 'Type of project 1'
    - 'Type of project 2'
  not_suitable_for:
    - 'Type of project to avoid'
```

---

## Design Patterns

> Liste os design patterns recomendados para esta tecnologia, com score de execução e anti-bug.

### Pattern 1: [Nome do Pattern]

**Purpose:** [Descrição do propósito]

**Execution Score:** X/10 | **Anti-Bug Score:** X/10

```[language]
// Exemplo de código do pattern
```

**Bugs Eliminated:**

- [ ] Bug type 1
- [ ] Bug type 2

**Why It Works:**

- Reason 1
- Reason 2

---

## Project Structure

> Defina a estrutura de pastas recomendada para projetos usando esta tecnologia.

```
/project-root
  /src
    /[folder1]        # Description
    /[folder2]        # Description
  /tests              # Description
  /config             # Description
```

### Structure Rationale

- **[folder1]:** Explanation
- **[folder2]:** Explanation

---

## Tech Stack

> Liste as tecnologias e bibliotecas recomendadas.

| Category         | Technology | Version | Purpose   |
| ---------------- | ---------- | ------- | --------- |
| Framework        | [name]     | ^X.X.X  | [purpose] |
| State Management | [name]     | ^X.X.X  | [purpose] |
| Testing          | [name]     | ^X.X.X  | [purpose] |
| Styling          | [name]     | ^X.X.X  | [purpose] |

### Required Dependencies

```bash
# Core dependencies
npm install [packages]

# Dev dependencies
npm install -D [packages]
```

---

## Coding Standards

> Defina os padrões de código específicos para esta tecnologia.

### Naming Conventions

| Element    | Convention   | Example       |
| ---------- | ------------ | ------------- |
| Files      | [convention] | `example.ts`  |
| Components | [convention] | `MyComponent` |
| Functions  | [convention] | `myFunction`  |
| Constants  | [convention] | `MY_CONSTANT` |

### Critical Rules

1. **Rule 1:** Description
2. **Rule 2:** Description
3. **Rule 3:** Description

### Code Examples

#### Good Example

```[language]
// Good code example
```

#### Bad Example

```[language]
// Bad code example - avoid this
```

---

## Testing Strategy

> Defina a estratégia de testes para esta tecnologia.

### Test Pyramid

```
         /\
        /E2E\           X% - [description]
       /------\
      /Integration\     X% - [description]
     /------------\
    /  Unit Tests  \    X% - [description]
   /----------------\
```

### What to Test

#### Always Test (Critical)

- [ ] Item 1
- [ ] Item 2

#### Consider Testing

- [ ] Item 1
- [ ] Item 2

#### Never Test

- [ ] Item 1
- [ ] Item 2

### Test File Template

```[language]
// Test file template
describe('[Component/Service]', () => {
  it('should [expected behavior]', () => {
    // Arrange
    // Act
    // Assert
  })
})
```

---

## File Templates

> Forneça templates de arquivos comuns para esta tecnologia.

### Template 1: [Name]

```[language]
// Template content
```

### Template 2: [Name]

```[language]
// Template content
```

---

## Error Handling

> Defina padrões de tratamento de erros.

### Error Handling Pattern

```[language]
// Error handling example
```

### Common Errors and Solutions

| Error     | Cause   | Solution   |
| --------- | ------- | ---------- |
| [Error 1] | [Cause] | [Solution] |
| [Error 2] | [Cause] | [Solution] |

---

## Performance Guidelines

> Diretrizes de performance específicas para esta tecnologia.

### Do's

- [ ] Optimization 1
- [ ] Optimization 2

### Don'ts

- [ ] Anti-pattern 1
- [ ] Anti-pattern 2

---

## Integration with AIOS

> Como este preset se integra com o workflow AIOS.

### Recommended Workflow

1. **Planning Phase:** Use `@architect` with this preset
2. **Development Phase:** Use `@dev` following these patterns
3. **QA Phase:** Use `@qa` with the testing strategy defined

### Related AIOS Templates

- `architecture-tmpl.yaml` - Use for architecture docs
- `front-end-architecture-tmpl.yaml` - Use for frontend specifics

---

## Changelog

| Date       | Version | Changes         |
| ---------- | ------- | --------------- |
| YYYY-MM-DD | 1.0.0   | Initial version |

---

_AIOS Tech Preset - Created with Synkra AIOS Framework_
