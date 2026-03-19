# Design Web Components Strategy for Multi-Framework DS

> Task ID: brad-multi-framework
> Agent: Brad (Design System Architect)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `multi-framework`

## Description

Design a strategy to make your design system work across multiple frameworks (React, Vue, Angular, Svelte) using Web Components as the interop layer. Evaluates current framework coupling, assesses Web Components viability, and creates a migration path.

## Prerequisites

- Existing DS in at least one framework
- Read data/ds-reference-architectures.md for multi-framework patterns

## Workflow

### Interactive Elicitation

1. **Gather Parameters**
   - Current framework(s) in use
   - Target frameworks to support
   - Component count and complexity
   - Performance requirements

2. **Strategy Selection**
   - **Lit** — Google's Web Components library, lightweight, reactive
   - **StencilJS** — Ionic's compiler, generates framework wrappers automatically
   - **Vanilla Web Components** — No library, maximum control, more boilerplate
   - Recommend based on team size and target frameworks

### Steps

1. **Assess Current Framework Coupling**
   - Identify framework-specific patterns (React hooks, Vue composables, Angular services)
   - Separate pure logic from framework-specific rendering
   - Identify components that are framework-agnostic vs. tightly coupled
   - Check: each component has coupling score (framework-agnostic / tightly-coupled) AND migration difficulty rating — log "{agnostic} agnostic, {coupled} coupled components"

2. **Design Web Components Architecture**
   - Define component API surface (attributes, properties, events, slots)
   - Plan styling strategy (CSS custom properties, shadow DOM, light DOM)
   - Define custom element naming convention ({prefix}-{component})
   - Plan server-side rendering approach (declarative shadow DOM)
   - Check: architecture defines API surface (attributes, properties, events, slots) AND styling strategy documented — abort with "Architecture missing: {missing section}"

3. **Create Framework Wrappers**
   - React wrapper: handle synthetic events, ref forwarding, prop mapping
   - Vue wrapper: v-model support, event mapping, slot forwarding
   - Angular wrapper: NgModule/standalone, input/output binding
   - Check: wrapper exists for each target framework AND handles events + refs + props — abort with "Wrapper missing or incomplete for: {framework}"

4. **Build Proof-of-Concept Component**
   - Select a medium-complexity component (e.g., Select, Dialog, Tabs)
   - Implement as Web Component with chosen library
   - Generate wrappers for each target framework
   - Test in each framework's development environment
   - Check: PoC component renders AND passes same test suite in each target framework — abort with "PoC failed in: {framework}: {error}"

5. **Create Migration Path**
   - Phase 1: New components built as Web Components
   - Phase 2: High-reuse existing components migrated
   - Phase 3: Framework-specific components gradually replaced
   - Check: migration plan has 3 phases AND component priority list with migration order — abort with "Migration plan incomplete: {missing section}"

## Output

- `multi-framework-strategy.md` — Architecture and decision documentation
- `poc/{component}/` — Proof-of-concept Web Component + framework wrappers
- `migration-plan.md` — Phased migration with component priorities
- `.state.yaml` updated

## Failure Handling

- **Web Component library incompatible with target framework:** If chosen library (Lit/Stencil/Vanilla) fails to render or causes runtime errors in one of the target frameworks, document the failure, test with alternate library, and recommend library switch if issue persists
- **Shadow DOM breaks framework styling:** If shadow DOM encapsulation prevents framework's CSS-in-JS or scoped styles from applying, switch strategy to light DOM with CSS custom properties for theming, document trade-offs in multi-framework-strategy.md
- **SSR/SSG not supported in target framework:** If framework requires server-side rendering (Next.js, Nuxt) but Web Components cause hydration errors or are not SSR-compatible, implement declarative shadow DOM polyfill or defer component initialization to client-side, note limitation in migration-plan.md
- **Framework wrapper overhead exceeds 5KB:** If wrapper code for React/Vue/Angular is too large (e.g., event mapping complexity, prop transformation), refactor to minimize wrapper logic, move complexity into Web Component itself, and re-measure — if still over threshold, document performance impact and suggest tree-shaking optimization

## Success Criteria

- PoC component works identically in all target frameworks
- Wrapper overhead < 2KB per framework
- No functionality loss compared to framework-native implementation
- Clear migration path with prioritized component list


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
