// Design tokens — Academia Lendária v4.1 (Minimalismo Lendário)
// 8% Gold Rule: accent NEVER exceeds 8% of visible screen area

export const COLORS = {
  BG: '#000000',
  FG: '#FFFFFF',
  ACCENT: '#C9B298',
  MUTED: '#A8A8A8',
  DANGER: '#EF4444',
} as const;

export const FONTS = {
  UI: 'Inter, system-ui, -apple-system, sans-serif',
  UI_WEIGHT: 600,
  BODY_WEIGHT: 400,
} as const;

export const SIZES = {
  HERO: 84,
  TITLE: 56,
  BODY: 40,
  CAPTION: 28,
  MARGIN: 40,
  SAFE_TOP: 200,
  SAFE_BOTTOM: 1720,
} as const;

export const VIDEO = {
  WIDTH: 1080,
  HEIGHT: 1920,
  FPS: 30,
  DURATION_SECONDS: 60,
} as const;

// Section timing in frames (30fps)
export const TIMING = {
  HOOK_START: 0,
  HOOK_END: 3 * VIDEO.FPS,          // 0-3s = 0-90
  AGITATION_START: 3 * VIDEO.FPS,
  AGITATION_END: 10 * VIDEO.FPS,    // 3-10s = 90-300
  BEFORE_START: 10 * VIDEO.FPS,
  BEFORE_END: 25 * VIDEO.FPS,       // 10-25s = 300-750
  AFTER_START: 25 * VIDEO.FPS,
  AFTER_END: 40 * VIDEO.FPS,        // 25-40s = 750-1200
  BRIDGE_START: 40 * VIDEO.FPS,
  BRIDGE_END: 50 * VIDEO.FPS,       // 40-50s = 1200-1500
  CTA_START: 50 * VIDEO.FPS,
  CTA_END: 57 * VIDEO.FPS,          // 50-57s = 1500-1710
  SIGNATURE_START: 57 * VIDEO.FPS,
  SIGNATURE_END: 60 * VIDEO.FPS,    // 57-60s = 1710-1800
} as const;
