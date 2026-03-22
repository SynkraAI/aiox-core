/**
 * Color conversion utilities for brand configs.
 * Converts hex colors to HSL, Tailwind config, and shadcn CSS variables.
 */

/**
 * Convert hex color to HSL object.
 * @param {string} hex - Hex color string (e.g. "#6C3CE1")
 * @returns {{ h: number, s: number, l: number }}
 */
export function hexToHSL(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Format HSL object as shadcn CSS value (space-separated, no commas).
 * @param {{ h: number, s: number, l: number }} hsl
 * @returns {string} e.g. "259 69% 56%"
 */
export function hslToString(hsl) {
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

/**
 * Derive a foreground color (light or dark) from a background HSL.
 * @param {{ h: number, s: number, l: number }} bgHSL
 * @returns {{ h: number, s: number, l: number }}
 */
function deriveForeground(bgHSL) {
  return bgHSL.l > 50
    ? { h: bgHSL.h, s: Math.max(bgHSL.s - 30, 5), l: 5 }
    : { h: bgHSL.h, s: Math.max(bgHSL.s - 20, 5), l: 98 };
}

/**
 * Build Tailwind CDN config object from brand colors.
 * Used for inline Tailwind config in GSAP mode.
 * @param {object} brand - Brand config from brand-loader
 * @returns {object} Tailwind theme.extend.colors config
 */
export function brandToTailwindConfig(brand) {
  const c = brand.colors;
  return {
    colors: {
      border: c.border,
      background: c.background,
      foreground: c.text,
      card: { DEFAULT: c.card, foreground: c.text },
      primary: { DEFAULT: c.primary, foreground: c.white, light: c.primary_light },
      accent: { DEFAULT: c.accent, foreground: c.background },
      muted: { DEFAULT: c.border, foreground: c.text_muted },
      highlight: c.highlight,
    },
    fontFamily: {
      sans: [brand.font, 'system-ui', 'sans-serif'],
    },
    borderRadius: {
      lg: '0.75rem',
      md: '0.5rem',
      sm: '0.25rem',
    },
  };
}

/**
 * Build shadcn-style CSS custom properties from brand colors.
 * Returns HSL values in shadcn format for :root.
 * @param {object} brand - Brand config from brand-loader
 * @param {'dark'|'light'} [mode='dark'] - Theme mode
 * @returns {string} CSS custom properties block (without selector)
 */
export function brandToShadcnVars(brand, mode = 'dark') {
  const c = brand.colors;

  const bg = hexToHSL(c.background);
  const fg = hexToHSL(c.text);
  const card = hexToHSL(c.card);
  const primary = hexToHSL(c.primary);
  const primaryLight = hexToHSL(c.primary_light);
  const accent = hexToHSL(c.accent);
  const border = hexToHSL(c.border);
  const muted = hexToHSL(c.text_muted);
  const highlight = hexToHSL(c.highlight);

  const primaryFg = deriveForeground(primary);
  const accentFg = deriveForeground(accent);

  return `  --background: ${hslToString(bg)};
  --foreground: ${hslToString(fg)};
  --card: ${hslToString(card)};
  --card-foreground: ${hslToString(fg)};
  --primary: ${hslToString(primary)};
  --primary-light: ${hslToString(primaryLight)};
  --primary-foreground: ${hslToString(primaryFg)};
  --accent: ${hslToString(accent)};
  --accent-foreground: ${hslToString(accentFg)};
  --muted: ${hslToString(border)};
  --muted-foreground: ${hslToString(muted)};
  --border: ${hslToString(border)};
  --ring: ${hslToString(primary)};
  --highlight: ${hslToString(highlight)};
  --radius: 0.75rem;`;
}

/**
 * Build Framer Motion / Next.js theme object from brand.
 * @param {object} brand - Brand config from brand-loader
 * @returns {object} Theme object with CSS var references
 */
export function brandToFramerMotionTheme(brand) {
  return {
    name: brand.name,
    font: brand.font,
    defaultTheme: brand.theme || 'dark',
    colors: {
      primary: 'hsl(var(--primary))',
      primaryLight: 'hsl(var(--primary-light))',
      accent: 'hsl(var(--accent))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      card: 'hsl(var(--card))',
      cardForeground: 'hsl(var(--card-foreground))',
      muted: 'hsl(var(--muted))',
      mutedForeground: 'hsl(var(--muted-foreground))',
      border: 'hsl(var(--border))',
    },
    cover: brand.cover || {},
    logos: brand.logos || {},
  };
}
