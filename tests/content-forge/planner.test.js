'use strict';

// ---------------------------------------------------------------------------
// Content Forge — Planner Tests
// Covers: buildPlan(), renderPlan(), edge cases from stress test
// ---------------------------------------------------------------------------

let buildPlan, renderPlan;

beforeAll(async () => {
  const mod = await import('../../skills/content-forge/lib/planner.mjs');
  buildPlan = mod.buildPlan;
  renderPlan = mod.renderPlan;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_BRAND = {
  meta: { name: 'TestBrand', theme: 'light' },
  colors: { semantic: { primary: '#FF0000' } },
  typography: { family: { display: 'Inter', body: 'DM Sans' } },
};

const VALID_CLASSIFICATION = {
  type: 'carousel',
  volume: 'single',
  urgency: 'quick',
  raw: '3 carrosséis sobre produtividade',
};

// ===========================================================================
// buildPlan — Happy Path
// ===========================================================================

describe('buildPlan: happy path', () => {
  test('produces steps for valid capabilities', () => {
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: VALID_BRAND,
      capabilities: ['carousel_copy', 'carousel_render'],
    });
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.brand.name).toBe('TestBrand');
  });

  test('steps have required fields', () => {
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: VALID_BRAND,
      capabilities: ['carousel_copy'],
    });
    const step = plan.steps[0];
    expect(step).toHaveProperty('number');
    expect(step).toHaveProperty('title');
    expect(step).toHaveProperty('executor');
    expect(step).toHaveProperty('input');
    expect(step).toHaveProperty('output');
  });

  test('generatedAt is ISO timestamp', () => {
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: VALID_BRAND,
      capabilities: ['carousel_copy'],
    });
    expect(() => new Date(plan.generatedAt)).not.toThrow();
  });
});

// ===========================================================================
// buildPlan — Brand Edge Cases (from stress test S-008)
// ===========================================================================

describe('buildPlan: brand edge cases', () => {
  test('brand = undefined', () => {
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: undefined,
      capabilities: ['carousel_copy'],
    });
    expect(plan.brand.name).toBe('Marca desconhecida');
    expect(plan.brand.theme).toBe('light');
    expect(plan.brand.fonts).toContain('—');
  });

  test('brand = null', () => {
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: null,
      capabilities: ['carousel_copy'],
    });
    expect(plan.brand.name).toBe('Marca desconhecida');
  });

  test('brand = {} (empty object)', () => {
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: {},
      capabilities: ['carousel_copy'],
    });
    expect(plan.brand.name).toBe('Marca desconhecida');
    expect(plan.brand.primary).toBeUndefined();
  });

  test('brand without meta', () => {
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: { colors: { semantic: { primary: '#000' } } },
      capabilities: ['carousel_copy'],
    });
    expect(plan.brand.name).toBe('Marca desconhecida');
    expect(plan.brand.primary).toBe('#000');
  });
});

// ===========================================================================
// buildPlan — Classification Edge Cases
// ===========================================================================

describe('buildPlan: classification edge cases', () => {
  test('classification = undefined', () => {
    const plan = buildPlan({
      brand: VALID_BRAND,
      capabilities: ['carousel_copy'],
    });
    expect(plan.steps.length).toBeGreaterThan(0);
  });

  test('classification = null', () => {
    const plan = buildPlan({
      classification: null,
      brand: VALID_BRAND,
      capabilities: ['carousel_copy'],
    });
    expect(plan.steps.length).toBeGreaterThan(0);
  });

  test('classification = {} (empty)', () => {
    const plan = buildPlan({
      classification: {},
      brand: VALID_BRAND,
      capabilities: ['carousel_copy'],
    });
    expect(plan.steps.length).toBeGreaterThan(0);
  });
});

// ===========================================================================
// buildPlan — MAX_PLAN_STEPS (from stress test S-014)
// ===========================================================================

describe('buildPlan: MAX_PLAN_STEPS', () => {
  test('caps at 15 steps', () => {
    const bigCaps = Array.from({ length: 20 }, (_, i) => `cap_${i}`);
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: VALID_BRAND,
      capabilities: bigCaps,
    });
    expect(plan.steps.length).toBeLessThanOrEqual(15);
  });

  test('adds limit decision when over MAX', () => {
    const bigCaps = Array.from({ length: 20 }, (_, i) => `cap_${i}`);
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: VALID_BRAND,
      capabilities: bigCaps,
    });
    const limitDecision = plan.decisions.find((d) => d.type === 'limit');
    expect(limitDecision).toBeDefined();
    expect(limitDecision.message).toContain('20');
  });

  test('exactly 15 caps produces no limit decision', () => {
    const caps = Array.from({ length: 15 }, (_, i) => `cap_${i}`);
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: VALID_BRAND,
      capabilities: caps,
    });
    const limitDecision = plan.decisions.find((d) => d?.type === 'limit');
    expect(limitDecision).toBeUndefined();
  });
});

// ===========================================================================
// buildPlan — Params Edge Cases
// ===========================================================================

describe('buildPlan: params edge cases', () => {
  test('no args — buildPlan()', () => {
    const plan = buildPlan();
    expect(plan).toBeDefined();
    expect(plan.steps).toEqual([]);
    expect(plan.brand.name).toBe('Marca desconhecida');
  });

  test('buildPlan(null)', () => {
    // null destructures to {} with default param
    expect(() => buildPlan(null)).not.toThrow();
  });

  test('empty capabilities', () => {
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: VALID_BRAND,
      capabilities: [],
    });
    expect(plan.steps).toEqual([]);
  });
});

// ===========================================================================
// renderPlan — Happy Path
// ===========================================================================

describe('renderPlan: happy path', () => {
  test('renders plan with steps', () => {
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: VALID_BRAND,
      capabilities: ['carousel_copy', 'carousel_render'],
    });
    const text = renderPlan(plan);
    expect(text).toContain('PLANO DE PRODUÇÃO');
    expect(text).toContain('TestBrand');
    expect(text).toContain('Etapa 1');
  });

  test('renders limit decisions as warnings', () => {
    const bigCaps = Array.from({ length: 20 }, (_, i) => `cap_${i}`);
    const plan = buildPlan({
      classification: VALID_CLASSIFICATION,
      brand: VALID_BRAND,
      capabilities: bigCaps,
    });
    const text = renderPlan(plan);
    expect(text).toContain('⚠️');
    expect(text).toContain('20');
  });

  test('renders empty plan without crash', () => {
    const plan = buildPlan();
    const text = renderPlan(plan);
    expect(text).toContain('Marca desconhecida');
  });
});

// ===========================================================================
// renderPlan — Edge Cases
// ===========================================================================

describe('renderPlan: edge cases', () => {
  test('decisions with undefined entries', () => {
    const plan = {
      brand: { name: 'X', theme: 'light', primary: '#000', fonts: 'A / B' },
      steps: [],
      decisions: [undefined, null, { type: 'limit', message: 'test' }],
    };
    expect(() => renderPlan(plan)).not.toThrow();
    const text = renderPlan(plan);
    expect(text).toContain('test');
  });

  test('plan without decisions key', () => {
    const plan = {
      brand: { name: 'X', theme: 'light', primary: '#000', fonts: 'A / B' },
      steps: [],
    };
    expect(() => renderPlan(plan)).not.toThrow();
  });
});
