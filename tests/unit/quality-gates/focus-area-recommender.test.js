/**
 * Focus Area Recommender Unit Tests
 *
 * Tests for Story 3.5 - Human Review Orchestration (Layer 3)
 * Smoke Test: HUMAN-04 (Focus Areas)
 *
 * @story 3.5 - Human Review Orchestration
 */

const { FocusAreaRecommender } = require('../../../.aiox-core/core/quality-gates/focus-area-recommender');

describe('FocusAreaRecommender', () => {
  let recommender;

  beforeEach(() => {
    recommender = new FocusAreaRecommender();
  });

  describe('constructor', () => {
    it('should create recommender with default config', () => {
      expect(recommender).toBeDefined();
      expect(recommender.strategicAreas).toContain('architecture');
      expect(recommender.strategicAreas).toContain('security');
      expect(recommender.strategicAreas).toContain('business-logic');
    });

    it('should have skip areas defined', () => {
      expect(recommender.skipAreas).toContain('syntax');
      expect(recommender.skipAreas).toContain('formatting');
      expect(recommender.skipAreas).toContain('simple-logic');
    });

    it('should accept custom strategic areas', () => {
      const custom = new FocusAreaRecommender({
        strategicAreas: ['custom-area'],
      });
      expect(custom.strategicAreas).toContain('custom-area');
    });
  });

  describe('analyzeChangedFiles', () => {
    it('should return empty categories for no files', () => {
      const analysis = recommender.analyzeChangedFiles([]);
      expect(Object.keys(analysis.categories)).toHaveLength(0);
      expect(analysis.riskLevel).toBe('low');
    });

    it('should detect security-sensitive files', () => {
      const files = ['src/auth/login.js', 'src/utils/password.js'];
      const analysis = recommender.analyzeChangedFiles(files);

      expect(analysis.categories['security']).toBeDefined();
      expect(analysis.categories['security']).toHaveLength(2);
      expect(analysis.riskLevel).toBe('critical');
    });

    it('should detect API changes', () => {
      const files = ['src/api/users.routes.js', 'src/api/endpoints.js'];
      const analysis = recommender.analyzeChangedFiles(files);

      expect(analysis.categories['api']).toBeDefined();
      expect(analysis.highlights).toContain('API endpoint changes detected');
    });

    it('should detect database changes', () => {
      // Use files that only match data-integrity pattern (avoid 'database' which contains 'base')
      const files = ['src/migrations/migration-001.js', 'src/models/user.model.js'];
      const analysis = recommender.analyzeChangedFiles(files);

      expect(analysis.categories['data-integrity']).toBeDefined();
      expect(analysis.riskLevel).toBe('high');
    });

    it('should detect UI/UX changes', () => {
      const files = ['src/components/Header.tsx', 'src/pages/Dashboard.vue'];
      const analysis = recommender.analyzeChangedFiles(files);

      expect(analysis.categories['ux']).toBeDefined();
      expect(analysis.highlights).toContain('UI/UX component changes');
    });

    it('should detect business logic changes', () => {
      const files = ['src/services/order.service.js', 'src/handlers/payment.handler.js'];
      const analysis = recommender.analyzeChangedFiles(files);

      expect(analysis.categories['business-logic']).toBeDefined();
    });

    it('should detect architecture changes', () => {
      const files = ['src/core/base-service.js', 'src/abstract/interface.ts'];
      const analysis = recommender.analyzeChangedFiles(files);

      expect(analysis.categories['architecture']).toBeDefined();
      expect(analysis.riskLevel).toBe('critical');
    });

    it('should detect AIOX framework changes', () => {
      const files = ['src/agents/developer.js', 'src/workflows/review.yaml'];
      const analysis = recommender.analyzeChangedFiles(files);

      expect(analysis.categories['aiox-core']).toBeDefined();
    });

    it('should detect configuration changes', () => {
      const files = ['.env.example', 'config/settings.yaml'];
      const analysis = recommender.analyzeChangedFiles(files);

      expect(analysis.categories['configuration']).toBeDefined();
    });
  });

  describe('determinePrimaryAreas', () => {
    it('should prioritize security over other areas', () => {
      const fileAnalysis = {
        categories: {
          security: ['auth.js'],
          ux: ['button.js', 'form.js'],
        },
      };
      const primary = recommender.determinePrimaryAreas(fileAnalysis, {});

      expect(primary[0].area).toBe('security');
    });

    it('should include architecture as primary', () => {
      const fileAnalysis = {
        categories: {
          architecture: ['base.js'],
          configuration: ['config.yaml'],
        },
      };
      const primary = recommender.determinePrimaryAreas(fileAnalysis, {});

      expect(primary.some(p => p.area === 'architecture')).toBe(true);
    });

    it('should limit to 3 primary areas', () => {
      const fileAnalysis = {
        categories: {
          security: ['auth.js'],
          architecture: ['base.js'],
          'data-integrity': ['migration.js'],
          'business-logic': ['service.js'],
          api: ['routes.js'],
        },
      };
      const primary = recommender.determinePrimaryAreas(fileAnalysis, {});

      expect(primary.length).toBeLessThanOrEqual(3);
    });

    it('should add code-quality area for high CodeRabbit issues', () => {
      const fileAnalysis = { categories: {} };
      const layer2Result = {
        results: [{
          check: 'coderabbit',
          issues: { high: 5 },
        }],
      };
      const primary = recommender.determinePrimaryAreas(fileAnalysis, layer2Result);

      expect(primary.some(p => p.area === 'code-quality')).toBe(true);
    });
  });

  describe('determineSecondaryAreas', () => {
    it('should include ux as secondary', () => {
      const fileAnalysis = {
        categories: {
          ux: ['component.js'],
        },
      };
      const secondary = recommender.determineSecondaryAreas(fileAnalysis, {});

      expect(secondary.some(s => s.area === 'ux')).toBe(true);
    });

    it('should limit to 2 secondary areas', () => {
      const fileAnalysis = {
        categories: {
          ux: ['a.js'],
          configuration: ['b.yaml'],
          performance: ['c.js'],
          'aiox-core': ['d.js'],
        },
      };
      const secondary = recommender.determineSecondaryAreas(fileAnalysis, {});

      expect(secondary.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getReviewQuestions (HUMAN-04)', () => {
    it('should return security questions for security category', () => {
      const questions = recommender.getReviewQuestions('security');
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some(q => q.includes('authentication') || q.includes('sensitive'))).toBe(true);
    });

    it('should return architecture questions for architecture category', () => {
      const questions = recommender.getReviewQuestions('architecture');
      expect(questions.some(q => q.includes('architectural') || q.includes('dependencies'))).toBe(true);
    });

    it('should return data-integrity questions', () => {
      const questions = recommender.getReviewQuestions('data-integrity');
      expect(questions.some(q => q.includes('migration') || q.includes('validation'))).toBe(true);
    });

    it('should return business-logic questions', () => {
      const questions = recommender.getReviewQuestions('business-logic');
      expect(questions.some(q => q.includes('business') || q.includes('requirements'))).toBe(true);
    });

    it('should return default questions for unknown category', () => {
      const questions = recommender.getReviewQuestions('unknown-category');
      expect(questions.length).toBe(2);
      expect(questions[0]).toContain('necessary');
    });
  });

  describe('recommend', () => {
    it('should return complete recommendations structure', async () => {
      const context = {
        prContext: {
          changedFiles: ['src/auth/login.js', 'src/components/Header.tsx'],
        },
      };
      const recommendations = await recommender.recommend(context);

      expect(recommendations).toHaveProperty('primary');
      expect(recommendations).toHaveProperty('secondary');
      expect(recommendations).toHaveProperty('skip');
      expect(recommendations).toHaveProperty('summary');
      expect(recommendations).toHaveProperty('highlightedAspects');
    });

    it('should include skip areas', async () => {
      const recommendations = await recommender.recommend({});

      expect(recommendations.skip).toContain('syntax');
      expect(recommendations.skip).toContain('formatting');
    });
  });

  describe('generateSummary', () => {
    it('should generate summary with primary areas', () => {
      const recommendations = {
        primary: [
          { area: 'security', reason: '2 security files' },
        ],
        secondary: [],
        highlightedAspects: ['Security-sensitive code changes'],
        skip: ['syntax', 'formatting'],
      };
      const summary = recommender.generateSummary(recommendations);

      expect(summary).toContain('security');
      expect(summary).toContain('Skip automated-covered areas');
    });

    it('should include highlighted aspects', () => {
      const recommendations = {
        primary: [],
        secondary: [],
        highlightedAspects: ['API endpoint changes detected', 'Database changes'],
        skip: ['syntax'],
      };
      const summary = recommender.generateSummary(recommendations);

      expect(summary).toContain('Key aspects');
      expect(summary).toContain('API endpoint changes');
    });
  });

  describe('calculatePriority', () => {
    it('should return P0 for critical areas', () => {
      const recommendations = {
        primary: [{ area: 'security' }],
      };
      expect(recommender.calculatePriority(recommendations)).toBe('P0');
    });

    it('should return P1 for high areas', () => {
      const recommendations = {
        primary: [{ area: 'business-logic' }],
      };
      expect(recommender.calculatePriority(recommendations)).toBe('P1');
    });

    it('should return P2 for other areas', () => {
      const recommendations = {
        primary: [{ area: 'ux' }],
      };
      expect(recommender.calculatePriority(recommendations)).toBe('P2');
    });
  });
});
