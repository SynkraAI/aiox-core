/**
 * Effect presets for GSAP and Next.js premium output modes.
 * Defines which visual effects are enabled per preset level.
 */

/**
 * All available effect names.
 * @type {string[]}
 */
export const VALID_EFFECTS = [
  'textReveal',
  'animatedCounters',
  'parallax',
  'staggeredCards',
  'magneticButtons',
  'cursorGlow',
  'loadingScreen',
  'smoothScroll',
  'hoverEffects',
  // Phase 4 — premium visual effects
  'gradientText',
  'glowCards',
  'meshBackground',
  'gridPattern',
  'floatingElements',
  'typewriter',
  'spotlightCursor',
  'shimmerBorder',
  'glassmorphism',
];

/**
 * Effect presets with boolean flags for each effect.
 */
export const EFFECTS_PRESETS = {
  'full-framer': {
    textReveal: true,
    animatedCounters: true,
    parallax: true,
    staggeredCards: true,
    magneticButtons: true,
    cursorGlow: true,
    loadingScreen: true,
    smoothScroll: true,
    hoverEffects: true,
    // Phase 4
    gradientText: true,
    glowCards: true,
    meshBackground: true,
    gridPattern: true,
    floatingElements: true,
    typewriter: true,
    spotlightCursor: true,
    shimmerBorder: true,
    glassmorphism: true,
  },
  premium: {
    textReveal: false,
    animatedCounters: true,
    parallax: true,
    staggeredCards: true,
    magneticButtons: false,
    cursorGlow: false,
    loadingScreen: false,
    smoothScroll: true,
    hoverEffects: true,
    // Phase 4
    gradientText: true,
    glowCards: true,
    meshBackground: true,
    gridPattern: false,
    floatingElements: false,
    typewriter: false,
    spotlightCursor: false,
    shimmerBorder: false,
    glassmorphism: true,
  },
  minimal: {
    textReveal: false,
    animatedCounters: false,
    parallax: false,
    staggeredCards: false,
    magneticButtons: false,
    cursorGlow: false,
    loadingScreen: false,
    smoothScroll: true,
    hoverEffects: true,
    // Phase 4
    gradientText: false,
    glowCards: false,
    meshBackground: false,
    gridPattern: false,
    floatingElements: false,
    typewriter: false,
    spotlightCursor: false,
    shimmerBorder: false,
    glassmorphism: false,
  },
};

/**
 * Resolve an effects configuration from a preset name + optional custom overrides.
 * @param {string} preset - 'full-framer' | 'premium' | 'minimal'
 * @param {object} [customFlags={}] - Override individual effects { effectName: true/false }
 * @returns {object} Resolved effects config with all flags
 */
export function getEffectsConfig(preset, customFlags = {}) {
  const base = EFFECTS_PRESETS[preset];
  if (!base) {
    console.warn(`Unknown effects preset "${preset}", falling back to "premium".`);
    return { ...EFFECTS_PRESETS.premium, ...customFlags };
  }
  return { ...base, ...customFlags };
}

/**
 * Get human-readable label for a preset.
 * @param {string} preset
 * @returns {string}
 */
export function getPresetLabel(preset) {
  const labels = {
    'full-framer': 'Full Framer (all effects)',
    premium: 'Premium (scroll, hover, counters, parallax, gradient text, glassmorphism)',
    minimal: 'Minimal (smooth scroll, hover only)',
  };
  return labels[preset] || preset;
}
