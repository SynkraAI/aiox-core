# Synkra AIOS Installation Documentation

> 🌐 **EN** | [PT](../pt/installation/README.md) | [ES](../es/installation/README.md)

**Version:** 2.1.0
**Last Updated:** 2025-01-24

---

## Overview

This directory contains comprehensive installation and setup documentation for Synkra AIOS.

---

## Documentation Index

### Platform-Specific Guides

| Platform       | Guide                                      | Status      |
| -------------- | ------------------------------------------ | ----------- |
| 🍎 **macOS**   | [macOS Installation Guide](./macos.md)     | ✅ Complete |
| 🐧 **Linux**   | [Linux Installation Guide](./linux.md)     | ✅ Complete |
| 🪟 **Windows** | [Windows Installation Guide](./windows.md) | ✅ Complete |

### General Documentation

| Document                                    | Description                 | Audience  |
| ------------------------------------------- | --------------------------- | --------- |
| [Quick Start (v4)](./v4-quick-start.md) | Fast setup for new users    | Beginners |
| [Troubleshooting](./troubleshooting.md)     | Common issues and solutions | All users |
| [FAQ](./faq.md)                             | Frequently asked questions  | All users |

---

## Quick Links

### New Installation

```bash
npx aios-core install
```

### Upgrading

```bash
npx aios-core install --force-upgrade
```

### Having Issues?

1. Check [Troubleshooting Guide](./troubleshooting.md)
2. Search [FAQ](./faq.md)
3. Open a [GitHub Issue](https://github.com/SynkraAI/aios-core/issues)

---

## Prerequisites

- Node.js 18.0.0+
- npm 9.0.0+
- Git 2.30+

---

## Supported Platforms

| Platform      | Status       |
| ------------- | ------------ |
| Windows 10/11 | Full Support |
| macOS 12+     | Full Support |
| Ubuntu 20.04+ | Full Support |
| Debian 11+    | Full Support |

---

## Supported IDEs

| IDE            | Agent Activation    |
| -------------- | ------------------- |
| Claude Code    | `/dev`, `/qa`, etc. |
| Cursor         | `@dev`, `@qa`, etc. |
| Gemini CLI     | Mention in prompt   |
| GitHub Copilot | Chat modes          |

---

## Related Documentation

- [Coding Standards](../framework/coding-standards.md)
- [Tech Stack](../framework/tech-stack.md)
- [Architecture](../architecture/)
- [Changelog](../CHANGELOG.md)

---

## Support

- **GitHub Issues**: [aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Documentation**: [docs/](../)
