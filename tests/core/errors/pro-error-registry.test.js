const { proErrorRegistry, PRO_ERROR_DEFINITIONS } = require('../../../.aiox-core/core/errors/pro-error-registry');
const { defaultErrorRegistry, ErrorCategory } = require('../../../.aiox-core/core/errors');

describe('proErrorRegistry (PRO-UX.1)', () => {
  it('registers exactly 5 top-5 codes', () => {
    expect(PRO_ERROR_DEFINITIONS).toHaveLength(5);
    expect(proErrorRegistry.size).toBeGreaterThanOrEqual(5);
  });

  it('assertUnique passes (no duplicate codes)', () => {
    expect(() => proErrorRegistry.assertUnique()).not.toThrow();
  });

  it('maps every code to an EXISTING ErrorCategory (no invented categories)', () => {
    const valid = new Set(Object.values(ErrorCategory));
    for (const def of PRO_ERROR_DEFINITIONS) {
      expect(valid.has(def.category)).toBe(true);
    }
  });

  it('uses the documented category mapping', () => {
    const byCode = Object.fromEntries(PRO_ERROR_DEFINITIONS.map((d) => [d.code, d]));
    expect(byCode.SEAT_LIMIT_EXCEEDED.category).toBe(ErrorCategory.PERMISSION);
    expect(byCode.NOT_A_BUYER.category).toBe(ErrorCategory.PERMISSION);
    expect(byCode.REVOKED_KEY.category).toBe(ErrorCategory.PERMISSION);
    expect(byCode.RATE_LIMITED.category).toBe(ErrorCategory.NETWORK);
    expect(byCode.PRO_ARTIFACT_UNAVAILABLE.category).toBe(ErrorCategory.EXTERNAL_EXECUTOR);
  });

  it('does NOT collide with default registry core codes', () => {
    for (const def of PRO_ERROR_DEFINITIONS) {
      expect(defaultErrorRegistry.has(def.code)).toBe(false);
    }
  });

  it('every definition has non-empty userMessage + recovery array', () => {
    for (const def of PRO_ERROR_DEFINITIONS) {
      expect(typeof def.userMessage).toBe('string');
      expect(def.userMessage.length).toBeGreaterThan(10);
      expect(Array.isArray(def.recovery)).toBe(true);
      expect(def.recovery.length).toBeGreaterThan(0);
    }
  });

  it('NOT_A_BUYER and REVOKED_KEY share opening sentence (threat model)', () => {
    const byCode = Object.fromEntries(PRO_ERROR_DEFINITIONS.map((d) => [d.code, d]));
    const opening = 'Hmm, sua licença Pro não está ativa no momento.';
    expect(byCode.NOT_A_BUYER.userMessage.startsWith(opening)).toBe(true);
    expect(byCode.REVOKED_KEY.userMessage.startsWith(opening)).toBe(true);
  });
});
