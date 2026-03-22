/**
 * Landing Page effect presets.
 * Extends the base effects from md-to-branded-pdf with 6 LP-specific effects.
 */

import { EFFECTS_PRESETS as BASE_PRESETS, getEffectsConfig as getBaseEffectsConfig } from '../../md-to-branded-pdf/lib/effects-config.mjs';

/**
 * LP-specific effect names (not in base presets).
 */
export const LP_EFFECTS = [
  'ctaPulse',
  'testimonialCarousel',
  'pricingGlow',
  'stickyCTA',
  'faqAccordion',
  'parallaxHero',
];

/**
 * LP effect presets — merges base presets with LP-specific flags.
 */
export const LP_EFFECTS_PRESETS = {
  'full-framer': {
    ...BASE_PRESETS['full-framer'],
    ctaPulse: true,
    testimonialCarousel: true,
    pricingGlow: true,
    stickyCTA: true,
    faqAccordion: true,
    parallaxHero: true,
  },
  premium: {
    ...BASE_PRESETS.premium,
    ctaPulse: true,
    testimonialCarousel: true,
    pricingGlow: true,
    stickyCTA: true,
    faqAccordion: true,
    parallaxHero: false,
  },
  minimal: {
    ...BASE_PRESETS.minimal,
    ctaPulse: false,
    testimonialCarousel: false,
    pricingGlow: false,
    stickyCTA: false,
    faqAccordion: true,
    parallaxHero: false,
  },
};

/**
 * Resolve LP effects config from preset name + optional custom overrides.
 * @param {string} preset - 'full-framer' | 'premium' | 'minimal'
 * @param {object} [customFlags={}] - Override individual effects
 * @returns {object} Resolved effects config with all flags (base + LP)
 */
export function getLPEffectsConfig(preset, customFlags = {}) {
  const base = LP_EFFECTS_PRESETS[preset];
  if (!base) {
    console.warn(`Unknown LP effects preset "${preset}", falling back to "premium".`);
    return { ...LP_EFFECTS_PRESETS.premium, ...customFlags };
  }
  return { ...base, ...customFlags };
}

/**
 * Get human-readable label for an LP preset.
 * @param {string} preset
 * @returns {string}
 */
export function getLPPresetLabel(preset) {
  const labels = {
    'full-framer': 'Full Framer (all base + CTA pulse, carousel, pricing glow, sticky CTA, FAQ accordion, parallax hero)',
    premium: 'Premium (scroll, hover, counters + CTA pulse, carousel, pricing glow, sticky CTA, FAQ accordion)',
    minimal: 'Minimal (smooth scroll, hover + FAQ accordion only)',
  };
  return labels[preset] || preset;
}
