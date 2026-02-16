# AIOS Roadmap

> 🇧🇷 [Versão em Português](ROADMAP-PT.md)

This document outlines the planned development direction for AIOS.

> For detailed tracking, see our [GitHub Project](https://github.com/orgs/SynkraAI/projects/1)

## Vision

AIOS aims to be the most comprehensive open-source AI agent framework, enabling developers to build sophisticated AI-powered applications with specialized agent teams (Squads) and seamless IDE integration.

## Current Focus (Q1 2026)

### v4.0.4 Release

Core framework stabilization and community infrastructure:

- [x] Hybrid installer (npx + interactive wizard)
- [x] 4-module architecture (Core, Squads, MCP Ecosystem, Premium)
- [x] Service Discovery system
- [x] Quality Gates (3 layers: pre-commit, pre-push, CI/CD)
- [x] Template Engine
- [x] CodeRabbit integration for automated code review
- [ ] Open-source community infrastructure (in progress)

### Community Building

- [x] GitHub Discussions setup
- [x] Contribution guides (CONTRIBUTING.md, COMMUNITY.md)
- [x] Feature request process (FEATURE_PROCESS.md)
- [x] Public roadmap (this document!)
- [ ] Starter squad registry

## Next Up (Q2 2026)

### P0 Strategic Focus: Learning Curve Reduction

Primary objective for AIOS 4.0.x execution:

- onboarding-first experience (single "start here" path)
- time-to-first-value <= 10 minutes for new users
- clearer agent activation across IDEs (Codex, Gemini, Cursor, Copilot, Claude)
- runtime-guided next action (state-driven, not command-list driven)

Tracking reference:
- `docs/strategy/AIOS-LEARNING-CURVE-FOCUS-4.0.4.md`
- `docs/strategy/AIOS-DIFFERENTIATION-PLAN-4.0.4.md`

Execution gates:
- P0 gate: onboarding metric + clear IDE matrix + first-value flow + smoke tests
- P1 gate: compatibility contract enforced in CI + risk profiles + handoffs + confidence score
- P2 gate: vertical tracks reproducible + brownfield pipeline + taxonomy lint

### Platform Planning

- Memory Layer implementation for agent context persistence
- Enhanced agent collaboration capabilities
- Performance optimizations for large codebases
- Improved error handling and recovery

### Community Features

- Squads marketplace (community-contributed agent teams)
- Contributor recognition system
- Translation support (PT-BR priority)

## Future Exploration

These items are being explored but not yet committed:

- Multi-language support for agent definitions
- Cloud deployment options for distributed teams
- Visual workflow builder for non-technical users
- Plugin marketplace for third-party integrations
- Enhanced analytics and telemetry (opt-in)

## How to Influence the Roadmap

We welcome community input on our direction! Here's how to participate:

### 1. Vote on Ideas

React with :+1: on existing [Ideas in Discussions](https://github.com/SynkraAI/aios-core/discussions/categories/ideas) to show support.

### 2. Propose Features

Have a new idea? Open an [Idea Discussion](https://github.com/SynkraAI/aios-core/discussions/new?category=ideas) to share it with the community.

### 3. Write an RFC

For significant features that need detailed design, [submit an RFC](/.github/RFC_TEMPLATE.md) following our structured process.

### 4. Contribute Directly

Found something you want to implement? Check our [Contributing Guide](CONTRIBUTING.md) and [Feature Process](docs/FEATURE_PROCESS.md).

## Changelog

For what's already shipped, see [CHANGELOG.md](CHANGELOG.md).

## Update Process

This roadmap is reviewed and updated monthly by the project maintainers.

**Process:**
1. Review progress on current items
2. Update status of completed/in-progress items
3. Add newly approved features from community discussions
4. Remove cancelled or deprioritized items
5. Communicate significant changes via [Announcements](https://github.com/SynkraAI/aios-core/discussions/categories/announcements)

**Responsible:** @pm (Morgan) or @po (Pax) agents, with maintainer oversight.

### Sync with Internal Backlog

This public roadmap is synchronized with our internal sprint planning:

| Public Roadmap | Internal Tracking |
|----------------|-------------------|
| [GitHub Project](https://github.com/orgs/SynkraAI/projects/1) | `docs/strategy/AIOS-DIFFERENTIATION-PLAN-4.0.4.md` |
| High-level features | Detailed stories per sprint |
| Quarterly timeline | Sprint-based execution |

**Sync Checklist (Monthly):**
- [ ] Review completed sprints against strategy docs in `docs/strategy/`
- [ ] Update GitHub Project items status (Done/In Progress)
- [ ] Add new approved features from backlog to Project
- [ ] Update this ROADMAP.md with latest progress

## Disclaimer

This roadmap represents our current plans and is subject to change based on community feedback, technical constraints, and strategic priorities. Dates are estimated quarters, not commitments. We use quarters rather than specific dates to maintain flexibility while providing visibility into our direction.

---

*Last updated: 2026-02-16*
