# AIOX Guides

> **EN** | [PT](../pt/guides/README.md) | [ES](../es/guides/README.md)

---

Complete documentation index for AIOX system guides.

---

## MCP Configuration (Docker MCP Toolkit)

**Status:** Production-Ready
**Token Reduction:** 85%+ (vs direct MCPs)
**Setup Time:** 10-20 minutes

### Quick Start

**Want optimized MCP configuration?**
Use the DevOps agent: `@devops` then `*setup-mcp-docker`

### MCP Management Commands

| Command             | Description                      | Agent   |
| ------------------- | -------------------------------- | ------- |
| `*setup-mcp-docker` | Initial Docker MCP Toolkit setup | @devops |
| `*search-mcp`       | Search available MCPs in catalog | @devops |
| `*add-mcp`          | Add MCP server to Docker gateway | @devops |
| `*list-mcps`        | List currently enabled MCPs      | @devops |
| `*remove-mcp`       | Remove MCP from Docker gateway   | @devops |

### Architecture Reference

| Guide                                                                     | Purpose                         | Time   | Audience  |
| ------------------------------------------------------------------------- | ------------------------------- | ------ | --------- |
| **[MCP Global Setup Guide](./mcp-global-setup.md)**                       | Global MCP server configuration | 10 min | All users |
| **[MCP API Keys Management](../architecture/mcp-api-keys-management.md)** | Secure credential handling      | 10 min | DevOps    |

> **Note:** 1MCP documentation has been deprecated. AIOX now uses Docker MCP Toolkit exclusively (Story 5.11). Archived docs available in `.github/deprecated-docs/guides/`.

---

## v4.2 Framework Documentation

**Status:** Complete (Story 2.16)
**Version:** 2.1.0
**Last Updated:** 2025-12-17

### Core Architecture

| Guide                                                              | Purpose                               | Time   | Audience               |
| ------------------------------------------------------------------ | ------------------------------------- | ------ | ---------------------- |
| **[Module System Architecture](../architecture/module-system.md)** | v4.2 modular architecture (4 modules) | 15 min | Architects, Developers |
| **[Service Discovery Guide](./service-discovery.md)**              | Worker discovery and registry API     | 10 min | Developers             |
| **[Migration Guide v2.0→v4.2](../migration/migration-guide.md)**      | Step-by-step migration instructions   | 20 min | All users upgrading    |

### System Configuration

| Guide                                                 | Purpose                         | Time   | Audience       |
| ----------------------------------------------------- | ------------------------------- | ------ | -------------- |
| **[Quality Gates Guide](./quality-gates.md)**         | 3-layer quality gate system     | 15 min | QA, DevOps     |
| **[Quality Dashboard Guide](./quality-dashboard.md)** | Dashboard metrics visualization | 10 min | Tech Leads, QA |
| **[MCP Global Setup Guide](./mcp-global-setup.md)**   | Global MCP server configuration | 10 min | All users      |

### Development Tools (Sprint 3)

| Guide                                             | Purpose                    | Time   | Audience   |
| ------------------------------------------------- | -------------------------- | ------ | ---------- |
| **[Template Engine v2](./template-engine-v2.md)** | Document generation engine | 10 min | Developers |

### Quick Navigation (v4)

**...understand the 4-module architecture**
→ [`module-system.md`](../architecture/module-system.md) (15 min)

**...discover available workers and tasks**
→ [`service-discovery.md`](./service-discovery.md) (10 min)

**...migrate from v2.0 to v4.2**
→ [`migration-guide.md`](../migration/migration-guide.md) (20 min)

**...configure quality gates**
→ [`quality-gates.md`](./quality-gates.md) (15 min)

**...monitor quality metrics dashboard**
→ [`quality-dashboard.md`](./quality-dashboard.md) (10 min)

**...use the template engine**
→ [`template-engine-v2.md`](./template-engine-v2.md) (10 min)

**...setup CodeRabbit integration**

**...setup global MCP servers**
→ [`mcp-global-setup.md`](./mcp-global-setup.md) (10 min)

---

## Other Guides

- [Agent Reference Guide](../agent-reference-guide.md)
- [Git Workflow Guide](../git-workflow-guide.md)
- [Getting Started](../getting-started.md)
- [Installation Troubleshooting](./installation-troubleshooting.md)
- [Troubleshooting](../troubleshooting.md)

---

## Sprint 3 Documentation

| Document                                          | Lines | Status   |
| ------------------------------------------------- | ----- | -------- |
| [Quality Gates Guide](./quality-gates.md)         | ~600  | Complete |
| [Quality Dashboard Guide](./quality-dashboard.md) | ~350  | Complete |
| [Template Engine v2](./template-engine-v2.md)     | ~400  | Complete |
| [CodeRabbit Integration](./coderabbit/)           | ~1000 | Complete |

---

## Support

- **GitHub Issues:** Tag `documentation`, `guides`, `mcp`
- **Experts:** See CODEOWNERS file

---

**Last Updated:** 2025-12-17
**Version:** 2.1 (Story 6.14)
