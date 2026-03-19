# W3C Design Tokens (DTCG) v1.0 — Operational Reference

**Source:** W3C Design Tokens Community Group stable spec (October 28, 2025)
**Purpose:** Quick reference for implementing tokens in DTCG format

---

## Format Structure

Every token has three required properties:

```json
{
  "token-name": {
    "$value": "<the value>",
    "$type": "<type identifier>",
    "$description": "What this token is for"
  }
}
```

- `$value` — The actual design value
- `$type` — One of the supported types (see below)
- `$description` — Human/AI-readable purpose explanation

---

## Supported Types

| Type | Example $value | Notes |
|------|---------------|-------|
| `color` | `"#0066CC"` or `"oklch(0.65 0.15 250)"` | Hex, RGB, HSL, OKLCH |
| `dimension` | `"16px"` or `"1rem"` | Spacing, sizing, radius |
| `fontFamily` | `"Inter, sans-serif"` | Font stack |
| `fontWeight` | `400` or `"bold"` | Numeric or named |
| `duration` | `"200ms"` | Animation timing |
| `cubicBezier` | `[0.4, 0, 0.2, 1]` | Easing curve (4 numbers) |
| `number` | `1.5` | Unitless numbers (line-height, opacity) |
| `strokeStyle` | `"solid"` or object | Border style |
| `border` | `{"color": "...", "width": "...", "style": "..."}` | Composite |
| `transition` | `{"duration": "...", "delay": "...", "timingFunction": [...]}` | Composite |
| `shadow` | `{"color": "...", "offsetX": "...", "offsetY": "...", "blur": "...", "spread": "..."}` | Composite |
| `gradient` | Array of stops | Linear/radial |
| `typography` | `{"fontFamily": "...", "fontSize": "...", "fontWeight": ..., "lineHeight": ...}` | Composite |

---

## Group Nesting

Tokens are organized in groups using nesting:

```json
{
  "color": {
    "$type": "color",
    "primary": {
      "$value": "#0066CC",
      "$description": "Primary brand color"
    },
    "secondary": {
      "$value": "#6B7280",
      "$description": "Secondary/muted color"
    }
  },
  "spacing": {
    "$type": "dimension",
    "xs": { "$value": "4px" },
    "sm": { "$value": "8px" },
    "md": { "$value": "16px" },
    "lg": { "$value": "24px" },
    "xl": { "$value": "32px" }
  }
}
```

Setting `$type` on a group applies it to all children.

---

## Mode Architecture

Modes (light/dark/high-contrast) use token aliases:

```json
{
  "color": {
    "surface": {
      "$type": "color",
      "$value": "{color.white}",
      "$extensions": {
        "mode": {
          "dark": "{color.gray-900}",
          "high-contrast": "{color.black}"
        }
      }
    }
  }
}
```

**Pattern:** Base value = light mode. Extensions define overrides per mode.

---

## Aliases (References)

Tokens can reference other tokens using `{}` syntax:

```json
{
  "color": {
    "brand": { "$value": "#0066CC", "$type": "color" },
    "action-primary": { "$value": "{color.brand}", "$type": "color" }
  }
}
```

This creates semantic layers: primitive → semantic → component tokens.

---

## Tooling Ecosystem

| Tool | Role | DTCG Support |
|------|------|-------------|
| **Style Dictionary 4.x** | Token transformation/export | Full v1.0 |
| **Tokens Studio** | Figma plugin for token management | Full v1.0 |
| **Terrazzo** | CLI token compiler | Full v1.0 |
| **Figma Variables** | Design tool native tokens | Partial (export via plugin) |
| **Penpot** | Open-source design tool | Full v1.0 |

---

## Migration from Proprietary Formats

### From Style Dictionary v3 format
- Add `$` prefix to `value` → `$value`
- Add `$type` to each token or group
- Move `type` from nested `attributes` to top-level `$type`

### From Figma Variables
- Export via Tokens Studio plugin in DTCG format
- Map Figma collections to DTCG groups
- Map Figma modes to `$extensions.mode`

### From custom JSON/YAML
- Restructure to `$value`/`$type`/`$description` format
- Normalize types to DTCG supported types
- Add group hierarchy
