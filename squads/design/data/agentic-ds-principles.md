# Agentic Design Systems — Principles for DS+AI

**Source:** Brad Frost's 2026 work on AI-constrained design systems
**Purpose:** Guide for making design systems AI-ready and using DS as a constraint layer for generative AI

---

## What Is an Agentic Design System?

An Agentic DS is a design system where AI agents are **deliberately constrained** to work only with the system's approved materials — tokens, components, patterns, and composition rules. The AI doesn't freestyle; it assembles from sanctioned building blocks.

**Key distinction:** The DS becomes the AI's vocabulary. If a token doesn't exist, the AI can't use that value. If a component isn't in the library, the AI can't invent one.

---

## The "Vibe Coding" Problem

Unconstrained AI generates plausible-looking but undisciplined output:
- Hardcoded color values instead of tokens
- Custom spacing that doesn't follow your scale
- Components that look right but don't match your API
- Accessibility gaps because the AI optimized for appearance

When AI is constrained to DS materials:
- Every color comes from your token set
- Every spacing value follows your scale
- Every component matches your documented API
- Accessibility is inherited from tested components

---

## Machine-Readable Infrastructure Requirements

### Structured Design Tokens

```json
{
  "color": {
    "primary": {
      "$value": "#0066CC",
      "$type": "color",
      "$description": "Primary brand color. Use for CTAs and key actions."
    }
  }
}
```

### Component API Documentation

Every component needs:
- **Props/API surface** — what inputs it accepts, with types
- **Variants** — enumerated options (size: sm | md | lg)
- **Composition rules** — what goes inside, what doesn't
- **Usage guidelines** — when to use vs. alternatives
- **Accessibility** — ARIA roles, keyboard behavior

### Storybook MCP Addon

The Storybook MCP addon exposes component stories as structured context for LLMs:
1. Storybook indexes your component library
2. MCP addon wraps that index as a tool for AI agents
3. AI queries the tool before generating UI code
4. Generated code uses real components with correct props

Without MCP: AI generates `<div className="nav-item">` with custom CSS
With MCP: AI generates `<NavItem variant="primary" icon={HomeIcon}>` using your actual component

---

## Checklist: Is Your DS AI-Ready?

### Tokens
- [ ] Tokens in W3C DTCG JSON format (not just Figma variables)
- [ ] Every token has `$description` explaining usage intent
- [ ] Modes (light/dark/hc) defined with explicit mappings
- [ ] Token files published as versioned artifacts

### Components
- [ ] Every component has typed prop definitions
- [ ] Variants are enumerated, not open-ended
- [ ] Composition rules documented (what nests inside what)
- [ ] Storybook stories exist for every component and variant
- [ ] Accessibility requirements documented per component

### Infrastructure
- [ ] Storybook MCP addon installed and configured
- [ ] Component metadata exportable as JSON
- [ ] API docs auto-generated from source
- [ ] Version-pinned so AI references a stable snapshot

### Governance
- [ ] Process for AI-generated contributions (review, lint, test)
- [ ] Token validation in CI (no hardcoded values)
- [ ] Component usage auditing (detect drift from DS)

---

## Key Takeaway

The design system that wins in an AI-assisted world isn't the prettiest — it's the most **machine-readable**. Structured tokens, typed component APIs, and explicit composition rules turn your DS from a reference guide into an enforcement mechanism.
