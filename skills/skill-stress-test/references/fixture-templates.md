# Fixture Templates — Minimal Test Projects

Exact file contents for each fixture archetype. Used by `engine/fixture-factory.md`.

---

## node-minimal

Minimal Node.js project. Use for skills that expect a JavaScript/TypeScript project.

### package.json
```json
{
  "name": "stress-test-fixture",
  "version": "1.0.0",
  "description": "Fixture project for skill stress testing",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "echo \"no tests yet\" && exit 0",
    "dev": "node src/index.js"
  },
  "keywords": [],
  "license": "MIT"
}
```

### src/index.js
```js
// Stress test fixture — minimal entry point
console.log('Fixture app running');

function greet(name) {
  return `Hello, ${name}!`;
}

module.exports = { greet };
```

### README.md
```markdown
# Stress Test Fixture

Minimal project created by skill-stress-test for testing purposes.

## Stack
- Node.js
- No framework (vanilla)

## How to run
npm start
```

---

## python-minimal

Minimal Python project. Use for skills that expect a Python project.

### pyproject.toml
```toml
[project]
name = "stress-test-fixture"
version = "1.0.0"
description = "Fixture project for skill stress testing"
requires-python = ">=3.9"

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.backends._legacy:_Backend"
```

### src/main.py
```python
"""Stress test fixture — minimal entry point."""


def greet(name: str) -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    print("Fixture app running")
```

### README.md
```markdown
# Stress Test Fixture

Minimal Python project created by skill-stress-test for testing purposes.

## Stack
- Python 3.9+
- No framework (vanilla)

## How to run
python src/main.py
```

---

## brownfield

Node.js project with git history, tests, and existing structure.
Simulates a real project that's been worked on.

### All files from node-minimal, PLUS:

### tests/index.test.js
```js
const { greet } = require('../src/index');

describe('greet', () => {
  test('returns greeting with name', () => {
    expect(greet('World')).toBe('Hello, World!');
  });

  test('handles empty name', () => {
    expect(greet('')).toBe('Hello, !');
  });
});
```

### src/utils.js
```js
// Utility functions
function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = { slugify, capitalize };
```

### .gitignore
```
node_modules/
dist/
.env
*.log
```

### Git history to create (5 commits):
```bash
git init
git add README.md && git commit -m "docs: initial readme"
git add package.json && git commit -m "chore: add package.json"
git add src/index.js && git commit -m "feat: add entry point with greet function"
git add src/utils.js && git commit -m "feat: add utility functions"
git add tests/ .gitignore && git commit -m "test: add initial test suite"
```

### Additional package.json overrides for brownfield:
```json
{
  "scripts": {
    "test": "jest",
    "lint": "echo 'no linter configured'"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

---

## chaos-empty

Completely empty directory. Tests how skills handle "no project found".

### Contents:
- Nothing. Just the directory itself.
- No .git, no package.json, no files at all.

---

## chaos-mismatch

Project of wrong type. Tests how skills handle unexpected project types.

### Cargo.toml (Rust project when skill expects Node)
```toml
[package]
name = "stress-test-fixture"
version = "0.1.0"
edition = "2021"

[dependencies]
```

### src/main.rs
```rust
fn main() {
    println!("This is a Rust project, not what you expected!");
}
```

### README.md
```markdown
# Wrong Project Type

This is intentionally a Rust project to test how the skill handles
receiving an unexpected project type.
```

---

## chaos-corrupt-state

Project with pre-existing but corrupted state files.
Tests how skills handle damaged state from previous runs.

### All files from node-minimal, PLUS:

### .aios/quest-log.yaml (corrupted)
```yaml
# This file is intentionally malformed
items:
  - id: 1
    status: [this is not valid yaml
    name: "broken entry
  - id: 2
    status: done
    # missing closing bracket from above
```

### .aios/forge-runs/run-001/state.json (corrupted)
```json
{
  "discovery": {
    "market_research": "done",
    "mvp_scope": null
  },
  "phases": {
    "0": { "status": "completed" },
    "1": { "status": "running"
  }
}
```
Note: the JSON above is intentionally malformed (missing closing brace).

### .aios/memory/project-context.md
```markdown
---
stack: Node.js + React
database: PostgreSQL
---

# Project Context

This project uses a legacy stack that was partially migrated.
Some state files may be from an older version of the framework.
```
