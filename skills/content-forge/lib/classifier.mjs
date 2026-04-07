/**
 * Content Forge — Demand Classifier
 *
 * Classifies user demand into type, volume, and urgency.
 * Used by Content Forge to determine which capabilities to query.
 */

// Order matters! More specific patterns first to avoid false matches.
// "3 carrosseis pra marca X" should match carousel, not brand.
const TYPE_PATTERNS = {
  carousel: /carross[eé][il]|carousel|slides/i,
  reel: /reel|reels|v[ií]deo curto|shorts|tiktok/i,
  story: /stor(y|ies)|sequ[eê]ncia de stories/i,
  'landing-page': /landing.?page|lp|p[aá]gina de (venda|captura)/i,
  repurpose: /multiplic|repurpos|adaptar|atomiz/i,
  calendar: /\bsemana\b|calend[aá]rio|planejamento|mensal|semanal/i,
  'design-system': /design.?system|\bds\b|tokens.*site|extra[ií]r.*site/i,
  research: /concorr|pesquis|analis|espion/i,
  video: /v[ií]deo|mp4|cinema|movie/i,
  brand: /\b(criar|nova|definir)\s*(marca|brand)|identidade visual|branding/i,
};

const VOLUME_PATTERNS = {
  batch: /\d+\s*(carrossel|carousel|reel|stor|post|pe[çc]a)/i,
  week: /semana|semanal|week/i,
  month: /m[eê]s|mensal|month/i,
};

const URGENCY_PATTERNS = {
  quality: /debate|revis|qualidade|premium|profundo|legendar/i,
  quick: /r[aá]pido|urgente|agora|simples|direto/i,
};

/**
 * Classify a user demand string.
 * @param {string} demand - User's text message
 * @returns {{ type: string, volume: string, urgency: string, raw: string }}
 */
function classifyDemand(demand) {
  let type = 'unknown';
  for (const [key, pattern] of Object.entries(TYPE_PATTERNS)) {
    if (pattern.test(demand)) {
      type = key;
      break;
    }
  }

  let volume = 'single';
  for (const [key, pattern] of Object.entries(VOLUME_PATTERNS)) {
    if (pattern.test(demand)) {
      volume = key;
      break;
    }
  }
  // Detect explicit numbers
  const numberMatch = demand.match(/(\d+)\s*(carrossel|carousel|reel|stor|post|pe[çc]a)/i);
  if (numberMatch) {
    volume = 'batch';
  }

  let urgency = 'quick';
  for (const [key, pattern] of Object.entries(URGENCY_PATTERNS)) {
    if (pattern.test(demand)) {
      urgency = key;
      break;
    }
  }

  return { type, volume, urgency, raw: demand };
}

/**
 * Map a classified type to the capabilities needed.
 * @param {string} type - Classified content type
 * @returns {string[]} Array of capability keys from the capability map
 */
function typeToCapabilities(type) {
  const MAP = {
    carousel:       ['carousel_copy', 'carousel_render', 'publish_ig_carousel'],
    reel:           ['reels_script', 'publish_reel'],
    story:          ['stories_script', 'image_render', 'publish_multi_platform'],
    video:          ['video_branded', 'publish_reel'],
    'landing-page': ['landing_page'],
    calendar:       ['content_calendar'],
    repurpose:      ['content_repurposing'],
    research:       ['competitor_research'],
    brand:          ['brand_strategy'],
    'design-system':['ds_extraction', 'ds_scaffold'],
  };

  return MAP[type] || [];
}

export { classifyDemand, typeToCapabilities, TYPE_PATTERNS };
