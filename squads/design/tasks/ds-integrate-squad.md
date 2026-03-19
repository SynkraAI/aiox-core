# Integrate with Squad

> Task ID: atlas-integrate-squad
> Agent: Merovingian (Design System Builder)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `integration`

## Description

Connect design system with MMOS, CreatorOS, or InnerLens expansion packs. Generates pack-specific patterns, token variations, and integration documentation.

## Prerequisites

- Design system setup complete
- Components built
- Target expansion pack installed

## Workflow

### Steps

1. **Detect Target Pack** - Identify MMOS, CreatorOS, or InnerLens
2. **Load Pack Requirements** - Read pack-specific pattern needs
3. **Generate Token Variations** - Personality/theme-based tokens
4. **Generate Pack-Specific Patterns** - Custom components for pack
5. **Create Integration Hooks** - Connect pack workflows
6. **Generate Integration Docs** - Usage guide for pack
7. **Test Integration** - Validate pack can use patterns
8. **Update State** - Track integration completion

## Output

- Pack-specific components
- Token variations
- Integration documentation
- Example usage

## Failure Handling

- **Target pack not found in expected location:** If MMOS/CreatorOS/InnerLens directory does not exist at standard paths, prompt user for custom pack location or exit with "Pack not found — verify pack is installed and provide path"
- **Pack-specific token variations conflict with base tokens:** If personality/theme tokens (e.g., MMOS formal mode) override base system tokens causing visual inconsistency, namespace the pack tokens (e.g., mmos-formal-*) and document in integration guide
- **Pack imports fail due to missing dependencies:** If pack requires DS components not yet built (e.g., CreatorOS needs VideoPlayer but DS has no media components), generate placeholder component stubs and note "Stubs created for: {list} — implement full components before production"
- **Integration test suite fails in pack context:** If DS components render incorrectly or error when imported by pack (e.g., missing context provider, broken prop types), isolate failing components, document integration requirements, and suggest pack-specific wrapper pattern

## Success Criteria

- [ ] Pack can import and use design system
- [ ] Token variations work correctly
- [ ] Pack-specific patterns functional
- [ ] Integration documented
- [ ] No regressions in pack functionality

## Examples

### MMOS Integration

```typescript
// Personality token variations
{
  formal: {
    fontFamily: 'var(--font-serif)',
    spacing: 'var(--space-formal)',
    colorPrimary: 'var(--color-corporate)'
  },
  casual: {
    fontFamily: 'var(--font-sans)',
    spacing: 'var(--space-relaxed)',
    colorPrimary: 'var(--color-friendly)'
  }
}

// CloneChatInterface component
<CloneChatInterface
  personality="formal"
  tokens={personalityTokens.formal}
/>
```

### CreatorOS Integration

```typescript
// Educational token variations
{
  fonts: 'readable (18px)',
  lineHeight: '1.6 (comprehension)',
  spacing: 'generous',
  colors: 'highlight focus'
}

// CourseVideoPlayer component
<CourseVideoPlayer
  tokens={educationalTokens}
  accessibility="WCAG AAA"
/>
```

### InnerLens Integration

```typescript
// Minimal distraction tokens
{
  colors: 'neutral, minimal',
  layout: 'clean, focused',
  spacing: 'balanced'
}

// AssessmentForm component
<AssessmentForm
  tokens={minimalTokens}
  validationUI={systemValidation}
/>
```

## Notes

- Each pack has unique requirements
- Token variations maintain consistency
- Pack-specific components extend base system
- Integration is bidirectional (pack ↔ design system)
- Document in pack's README


## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-pattern-audit-checklist.md`

## Process Guards
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.
