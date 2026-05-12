# AIOX Documentation Template

**Version:** 1.0.0
**Last Updated:** 2026-01-28
**Status:** Active

---

## Overview

This document provides the standard template structure for AIOX documentation. All documentation in the AIOX framework should follow this template to ensure consistency and ease of navigation.

---

## Usage

### Creating New Documentation

1. Copy this template to your target location
2. Replace placeholder sections with actual content
3. Remove any sections that are not applicable
4. Follow the i18n guidelines if creating multilingual docs

### Template Variables

| Variable      | Description       | Example                         |
| ------------- | ----------------- | ------------------------------- |
| `{{TITLE}}`   | Document title    | "Agent Configuration Guide"     |
| `{{VERSION}}` | Document version  | "1.0.0"                         |
| `{{DATE}}`    | Last updated date | "2026-01-28"                    |
| `{{STATUS}}`  | Document status   | "Active", "Draft", "Deprecated" |

---

## Template Structure

### Minimal Template

```markdown
# {{TITLE}}

**Version:** {{VERSION}}
**Last Updated:** {{DATE}}
**Status:** {{STATUS}}

---

## Overview

Brief description of the document's purpose.

---

## Content

Main content goes here.

---

_Last Updated: {{DATE}} | AIOX Framework Team_
```

### Full Template with i18n

```markdown
# {{TITLE}}

> **EN** | [PT](../pt/path/{{FILENAME}}) | [ES](../es/path/{{FILENAME}})

---

**Version:** {{VERSION}}
**Last Updated:** {{DATE}}
**Status:** {{STATUS}}

---

## Table of Contents

- [Overview](#overview)
- [Section 1](#section-1)
- [Section 2](#section-2)
- [Related Documents](#related-documents)

---

## Overview

Brief description of what this document covers and its purpose within the AIOX framework.

### Key Points

| Aspect            | Description              |
| ----------------- | ------------------------ |
| **Purpose**       | What problem this solves |
| **Audience**      | Who should read this     |
| **Prerequisites** | What readers should know |

---

## Section 1

### Subsection 1.1

Content with code examples:

\`\`\`javascript
// Example code
const example = "value";
\`\`\`

### Subsection 1.2

Content with diagrams:

\`\`\`
┌─────────────────┐
│ Component A │
└────────┬────────┘
│
▼
┌─────────────────┐
│ Component B │
└─────────────────┘
\`\`\`

---

## Section 2

### Tables

| Column 1 | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Value 1  | Value 2  | Value 3  |

### Lists

**Ordered:**

1. First item
2. Second item
3. Third item

**Unordered:**

- Item A
- Item B
- Item C

---

## Related Documents

- [Related Doc 1](./path-to-doc-1.md)
- [Related Doc 2](./path-to-doc-2.md)

---

_Last Updated: {{DATE}} | AIOX Framework Team_
```

---

## Section Templates

### Architecture Decision Record (ADR)

```markdown
# ADR-{{NUMBER}}: {{TITLE}}

> **EN** | [PT](../../pt/architecture/adr/{{FILENAME}}) | [ES](../../es/architecture/adr/{{FILENAME}})

---

**Story:** {{STORY_ID}}
**Date:** {{DATE}}
**Status:** {{STATUS}} (Proposed | Accepted | Deprecated | Superseded)
**Author:** @{{AGENT}}

---

## Context

What is the issue that we're seeing that is motivating this decision or change?

---

## Decision

What is the change that we're proposing and/or doing?

---

## Consequences

### Positive

- Benefit 1
- Benefit 2

### Negative

- Drawback 1
- Drawback 2

### Neutral

- Observation 1

---

## Related Documents

- [Related ADR](./related-adr.md)

---

_Decision made as part of {{STORY_ID}}._
```

### Guide Template

```markdown
# {{TITLE}} Guide

> **EN** | [PT](../pt/guides/{{FILENAME}}) | [ES](../es/guides/{{FILENAME}})

---

**Version:** {{VERSION}}
**Last Updated:** {{DATE}}
**Audience:** {{TARGET_AUDIENCE}}

---

## Prerequisites

Before starting, ensure you have:

- [ ] Prerequisite 1
- [ ] Prerequisite 2

---

## Quick Start

\`\`\`bash

# Quick start command

aiox command --flag
\`\`\`

---

## Step-by-Step Instructions

### Step 1: {{STEP_TITLE}}

Description of step 1.

\`\`\`bash

# Command for step 1

\`\`\`

### Step 2: {{STEP_TITLE}}

Description of step 2.

---

## Configuration

| Option    | Type    | Default | Description |
| --------- | ------- | ------- | ----------- |
| `option1` | string  | `""`    | Description |
| `option2` | boolean | `false` | Description |

---

## Troubleshooting

### Issue: {{ISSUE_DESCRIPTION}}

**Cause:** Explanation of why this happens.

**Solution:**

\`\`\`bash

# Fix command

\`\`\`

---

## Related Guides

- [Related Guide 1](./related-guide-1.md)

---

_Last Updated: {{DATE}} | AIOX Framework Team_
```

### API/Reference Template

```markdown
# {{COMPONENT}} Reference

> **EN** | [PT](../pt/reference/{{FILENAME}}) | [ES](../es/reference/{{FILENAME}})

---

**Version:** {{VERSION}}
**Module:** {{MODULE_NAME}}

---

## Overview

Brief description of the component.

---

## API

### {{METHOD_NAME}}

\`\`\`typescript
function {{METHOD_NAME}}(param1: Type1, param2: Type2): ReturnType
\`\`\`

**Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| `param1`  | `Type1` | Yes      | Description |
| `param2`  | `Type2` | No       | Description |

**Returns:** `ReturnType` - Description of return value.

**Example:**

\`\`\`typescript
const result = {{METHOD_NAME}}("value1", { option: true });
\`\`\`

---

## Types

### {{TYPE_NAME}}

\`\`\`typescript
interface {{TYPE_NAME}} {
property1: string;
property2?: number;
}
\`\`\`

| Property    | Type     | Required | Description |
| ----------- | -------- | -------- | ----------- |
| `property1` | `string` | Yes      | Description |
| `property2` | `number` | No       | Description |

---

_Last Updated: {{DATE}} | AIOX Framework Team_
```

---

## i18n Guidelines

### File Structure

```
docs/
├── en/              # English (primary)
│   └── guides/
│       └── example.md
├── pt/              # Portuguese
│   └── guides/
│       └── example.md
└── es/              # Spanish
    └── guides/
        └── example.md
```

### Language Header

Always include the language navigation header:

```markdown
> **EN** | [PT](../pt/path/file.md) | [ES](../es/path/file.md)
```

### Translation Notes

- Keep technical terms in English (API, CLI, etc.)
- Translate UI text and descriptions
- Maintain consistent terminology across documents
- Update all language versions when making changes

---

## Style Guide

### Headings

- Use `#` for document title (only one per document)
- Use `##` for main sections
- Use `###` for subsections
- Use `####` sparingly for deeper nesting

### Code Blocks

- Always specify language for syntax highlighting
- Use `bash` for shell commands
- Use `javascript` or `typescript` for code examples
- Use `yaml` for configuration files

### Tables

- Use tables for structured data comparisons
- Keep tables simple and readable
- Use alignment for better readability

### Links

- Use relative paths for internal links
- Use descriptive link text (not "click here")
- Verify all links are valid

---

## Examples

### Example 1: Creating an Agent Guide

```markdown
# Creating Custom Agents

> **EN** | [PT](../pt/guides/creating-agents.md) | [ES](../es/guides/creating-agents.md)

---

**Version:** 1.0.0
**Last Updated:** 2026-01-28
**Audience:** Developers extending AIOX

---

## Overview

This guide explains how to create custom agents for the AIOX framework.

## Prerequisites

- [ ] AIOX Core installed
- [ ] Understanding of agent concepts

## Creating an Agent

### Step 1: Define Agent Metadata

Create a new file in `.aiox-core/development/agents/`:

\`\`\`yaml
id: custom-agent
name: Custom Agent
persona: Expert in specific domain
\`\`\`

---

_Last Updated: 2026-01-28 | AIOX Framework Team_
```

---

## Related Documents

- [AIOX Framework Documentation](/docs/README.md)
- [Contributing Guide](/CONTRIBUTING.md)
- [Style Guide](/docs/guides/style-guide.md)

---

_Last Updated: 2026-01-28 | AIOX Framework Team_
