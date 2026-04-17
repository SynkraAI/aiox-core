/**
 * GSAP Animation Presets for Tocks Custom
 *
 * Usage: import and apply in 'use client' components
 * using useGSAP hook from @gsap/react
 */

export const ANIMATION_DEFAULTS = {
  DURATION: 0.8,
  EASE: 'power3.out',
  STAGGER: 0.15,
} as const

/** Fade in from below — used for section reveals */
export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: ANIMATION_DEFAULTS.DURATION,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
} as const

/** Fade in from the side */
export const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: ANIMATION_DEFAULTS.DURATION,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
} as const

export const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  transition: {
    duration: ANIMATION_DEFAULTS.DURATION,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
} as const

/** Scale up reveal — used for images */
export const scaleReveal = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    duration: 1,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
} as const

/** Stagger container for children animations */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: ANIMATION_DEFAULTS.STAGGER,
      delayChildren: 0.1,
    },
  },
} as const

/** Gold line expand animation */
export const lineExpand = {
  initial: { scaleX: 0 },
  animate: { scaleX: 1 },
  transition: {
    duration: 1.2,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
} as const

/**
 * GSAP ScrollTrigger defaults for section-level animations.
 * Use with gsap.registerPlugin(ScrollTrigger) in client components.
 */
export const scrollTriggerDefaults = {
  start: 'top 85%',
  end: 'bottom 20%',
  toggleActions: 'play none none reverse',
} as const
