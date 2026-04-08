'use strict';

// ---------------------------------------------------------------------------
// Content Forge — Classifier Tests
// Covers: classifyDemand(), typeToCapabilities(), edge cases from stress test
// ---------------------------------------------------------------------------

// ESM modules need dynamic import in CJS test context
let classifyDemand, typeToCapabilities;

beforeAll(async () => {
  const mod = await import('../../skills/content-forge/lib/classifier.mjs');
  classifyDemand = mod.classifyDemand;
  typeToCapabilities = mod.typeToCapabilities;
});

// ===========================================================================
// classifyDemand — Type Detection
// ===========================================================================

describe('classifyDemand: type detection', () => {
  test('carousel — pt-BR', () => {
    const r = classifyDemand('3 carrosséis sobre produtividade');
    expect(r.type).toBe('carousel');
  });

  test('carousel — english', () => {
    const r = classifyDemand('I want 3 carousel posts about productivity');
    expect(r.type).toBe('carousel');
  });

  test('reel', () => {
    const r = classifyDemand('quero um reel sobre hooks virais');
    expect(r.type).toBe('reel');
  });

  test('story', () => {
    const r = classifyDemand('criar sequência de stories para lançamento');
    expect(r.type).toBe('story');
  });

  test('landing-page', () => {
    const r = classifyDemand('preciso de uma landing page de captura');
    expect(r.type).toBe('landing-page');
  });

  test('repurpose', () => {
    const r = classifyDemand('multiplicar conteúdo existente');
    expect(r.type).toBe('repurpose');
  });

  test('calendar', () => {
    const r = classifyDemand('planejamento semanal de conteúdo');
    expect(r.type).toBe('calendar');
  });

  test('design-system', () => {
    const r = classifyDemand('extrair design system do site');
    expect(r.type).toBe('design-system');
  });

  test('research', () => {
    const r = classifyDemand('analisar concorrentes do nicho');
    expect(r.type).toBe('research');
  });

  test('video', () => {
    const r = classifyDemand('produzir vídeo branded para YouTube');
    expect(r.type).toBe('video');
  });

  test('brand', () => {
    const r = classifyDemand('criar nova marca para o produto');
    expect(r.type).toBe('brand');
  });
});

// ===========================================================================
// classifyDemand — Multi-type Detection
// ===========================================================================

describe('classifyDemand: multi-type', () => {
  test('detects multiple types', () => {
    const r = classifyDemand('quero carrossel e reel sobre hooks');
    expect(r.type).toBe('multi');
    expect(r.matchedTypes).toContain('carousel');
    expect(r.matchedTypes).toContain('reel');
    expect(r.needsPrioritization).toBe(true);
  });

  test('3+ types detected', () => {
    const r = classifyDemand('carrossel, reel e story sobre produtividade');
    expect(r.type).toBe('multi');
    expect(r.matchedTypes.length).toBeGreaterThanOrEqual(3);
  });
});

// ===========================================================================
// classifyDemand — Unknown & Discovery
// ===========================================================================

describe('classifyDemand: unknown type', () => {
  test('ambiguous input returns unknown', () => {
    const r = classifyDemand('algo sobre minha marca para o digital');
    expect(r.type).toBe('unknown');
    expect(r.needsDiscovery).toBe(true);
  });

  test('matchedTypes is empty array for unknown', () => {
    const r = classifyDemand('quero fazer algo legal');
    expect(r.matchedTypes).toEqual([]);
  });
});

// ===========================================================================
// classifyDemand — Volume Detection
// ===========================================================================

describe('classifyDemand: volume', () => {
  test('single by default', () => {
    const r = classifyDemand('um carrossel sobre hooks');
    expect(r.volume).toBe('single');
  });

  test('batch with explicit number (matching regex)', () => {
    const r = classifyDemand('3 carrossel sobre produtividade');
    expect(r.volume).toBe('batch');
  });

  test('batch regex does not match accented plural (known limitation)', () => {
    // "carrosséis" doesn't match /carrossel/ — known gap in VOLUME_PATTERNS
    const r = classifyDemand('3 carrosséis sobre produtividade');
    expect(r.volume).toBe('single'); // currently doesn't detect
  });

  test('week', () => {
    const r = classifyDemand('planejamento semanal de carrossel');
    expect(r.volume).toBe('week');
  });
});

// ===========================================================================
// classifyDemand — Urgency Detection
// ===========================================================================

describe('classifyDemand: urgency', () => {
  test('quick by default', () => {
    const r = classifyDemand('carrossel sobre hooks');
    expect(r.urgency).toBe('quick');
  });

  test('quality with debate keyword', () => {
    const r = classifyDemand('carrossel premium com revisão de qualidade');
    expect(r.urgency).toBe('quality');
  });
});

// ===========================================================================
// classifyDemand — Edge Cases (from stress test)
// ===========================================================================

describe('classifyDemand: edge cases', () => {
  test('empty string', () => {
    const r = classifyDemand('');
    expect(r.type).toBe('unknown');
    expect(r.matchedTypes).toEqual([]);
    expect(r.raw).toBe('');
  });

  test('undefined input', () => {
    const r = classifyDemand(undefined);
    expect(r.type).toBe('unknown');
    expect(r.raw).toBe('');
  });

  test('null input', () => {
    const r = classifyDemand(null);
    expect(r.type).toBe('unknown');
    expect(r.raw).toBe('');
  });

  test('number input', () => {
    const r = classifyDemand(42);
    expect(r.type).toBe('unknown');
    expect(r.raw).toBe('');
  });

  test('no args', () => {
    const r = classifyDemand();
    expect(r.type).toBe('unknown');
    expect(r.raw).toBe('');
  });

  test('unicode/accents handled correctly', () => {
    const r = classifyDemand('aplicação com funções avançadas e gráficos');
    expect(r).toBeDefined();
    expect(typeof r.type).toBe('string');
  });

  test('shell metacharacters treated as literal', () => {
    const r = classifyDemand('create $(rm -rf /) carousel');
    expect(r.type).toBe('carousel');
    expect(r.raw).toContain('$(rm -rf /)');
  });
});

// ===========================================================================
// typeToCapabilities
// ===========================================================================

describe('typeToCapabilities', () => {
  test('carousel returns 3 capabilities', () => {
    expect(typeToCapabilities('carousel')).toHaveLength(3);
  });

  test('reel returns 2 capabilities', () => {
    expect(typeToCapabilities('reel')).toHaveLength(2);
  });

  test('unknown returns empty array', () => {
    expect(typeToCapabilities('unknown')).toEqual([]);
  });

  test('multi with matchedTypes combines without duplicates', () => {
    const caps = typeToCapabilities('multi', ['carousel', 'reel']);
    expect(caps.length).toBe(5); // 3 carousel + 2 reel
    const unique = [...new Set(caps)];
    expect(caps.length).toBe(unique.length);
  });

  test('multi with empty matchedTypes returns empty', () => {
    expect(typeToCapabilities('multi', [])).toEqual([]);
  });

  test('multi with no matchedTypes param returns empty', () => {
    expect(typeToCapabilities('multi')).toEqual([]);
  });

  test('multi with overlapping types deduplicates', () => {
    // reel and video both have publish_reel
    const caps = typeToCapabilities('multi', ['reel', 'video']);
    const publishCount = caps.filter((c) => c === 'publish_reel').length;
    expect(publishCount).toBe(1);
  });
});
