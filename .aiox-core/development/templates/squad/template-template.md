# {{COMPONENTNAME}} Template

> {{DESCRIPTION}}
> Squad: {{SQUADNAME}}
> Created: {{CREATEDAT}}
{{#IF STORYID}}
> Story: {{STORYID}}
{{/IF}}

---

## Template Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `{{VAR1}}` | string | Yes | Description of variable 1 |
| `{{VAR2}}` | string | No | Description of variable 2 |
| `{{VAR3}}` | date | No | Description of variable 3 |

---

## Usage

```javascript
const { renderTemplate } = require('.aiox-core/infrastructure/scripts/template-engine');

const result = await renderTemplate('{{COMPONENTNAME}}.md', {
  VAR1: 'value1',
  VAR2: 'value2',
  VAR3: new Date().toISOString(),
});
```

---

## Template Content

<!-- BEGIN TEMPLATE -->

# {{VAR1}}

> Created: {{VAR3}}

## Section 1

{{VAR2}}

### Subsection 1.1

Content here...

### Subsection 1.2

Content here...

## Section 2

Additional content...

## Section 3

Final content...

---

*Generated from {{COMPONENTNAME}} template*

<!-- END TEMPLATE -->

---

## Examples

### Example 1: Basic Usage

```javascript
const result = await renderTemplate('{{COMPONENTNAME}}.md', {
  VAR1: 'My Document',
  VAR2: 'This is the introduction text.',
  VAR3: '2025-01-01',
});
```

### Example 2: With Conditionals

```javascript
const result = await renderTemplate('{{COMPONENTNAME}}.md', {
  VAR1: 'My Document',
  VAR2: 'Introduction',
  VAR3: new Date().toISOString(),
  INCLUDE_EXTRA: true,
});
```

---

*Template created by squad-creator*
