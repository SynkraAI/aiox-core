import { jest } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';

import {
  routeToMindClones,
  calculateKeywordOverlap,
  departmentMatchesDomains,
  getTierBonus,
  getPriority,
  findTargetProjects,
  applyFeedbackAdjustments,
  normalizeKeyword,
} from '../../src/distribution/mind-clone-router.js';

describe('mind-clone-router (Story 5.1)', () => {
  let tmpDir;

  const mockMindClones = [
    {
      id: 'chip-huyen',
      name: 'chip-huyen',
      department: 'ai-science',
      source: 'mega-brain',
      keywords: ['ai', 'embedding', 'rag', 'fine-tuning', 'llm', 'machine learning', 'pipeline'],
    },
    {
      id: 'martin-fowler',
      name: 'martin-fowler',
      department: 'expert-council',
      source: 'mega-brain',
      keywords: ['architecture', 'refactoring', 'testing', 'ci/cd', 'microservices', 'design patterns'],
    },
    {
      id: 'alex-hormozi',
      name: 'alex-hormozi',
      department: 'growth',
      source: 'mega-brain',
      keywords: ['marketing', 'growth', 'lead', 'pricing', 'strategy', 'funnel'],
    },
    {
      id: 'seth-godin',
      name: 'seth-godin',
      department: 'marketing',
      source: 'mega-brain',
      keywords: ['marketing', 'copywriting', 'brand', 'storytelling'],
    },
    {
      id: 'andrej-karpathy',
      name: 'andrej-karpathy',
      department: 'ai-science',
      source: 'mega-brain',
      keywords: ['ai', 'deep learning', 'neural', 'transformer', 'llm', 'gpt'],
    },
  ];

  const mockDomains = {
    domains: {
      'ai-ml': {
        keywords: ['LLM', 'transformer', 'embedding', 'RAG'],
        projects: ['aios', 'serenity-ai'],
      },
      marketing: {
        keywords: ['funil', 'conversao', 'Google Ads'],
        projects: ['tocks', 'low-ticket-10k'],
      },
      engenharia: {
        keywords: ['Node.js', 'TypeScript', 'React'],
        projects: ['aios', 'tocks'],
      },
    },
  };

  const mockRouting = {
    routing: {
      min_relevance_score: 0.3,
      max_clones_per_item: 10,
      keyword_weight: 0.6,
      department_weight: 0.3,
      tier_weight: 0.1,
      feedback_floor: 0.2,
      tier_priority_map: { S: 'urgent', A: 'normal', B: 'low' },
      forced_routes: {
        'ai-ml': ['andrej-karpathy', 'chip-huyen'],
        marketing: ['alex-hormozi', 'seth-godin'],
      },
    },
  };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydra-router-test-'));

    // Write mock config files
    const configDir = path.join(tmpDir, 'config');
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(path.join(configDir, 'routing.yaml'), yaml.dump(mockRouting), 'utf-8');
    fs.writeFileSync(path.join(configDir, 'domains.yaml'), yaml.dump(mockDomains), 'utf-8');

    // Write mock index
    fs.writeFileSync(path.join(tmpDir, 'index.json'), JSON.stringify(mockMindClones), 'utf-8');

    // Write mock map
    fs.writeFileSync(path.join(tmpDir, 'map.yaml'), yaml.dump({ agents: {} }), 'utf-8');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('calculateKeywordOverlap', () => {
    test('finds exact matches', () => {
      const result = calculateKeywordOverlap(['ai', 'embedding'], ['ai', 'llm', 'embedding']);
      expect(result.hits).toBe(2);
      expect(result.matched).toContain('ai');
      expect(result.matched).toContain('embedding');
    });

    test('finds partial matches (substring)', () => {
      const result = calculateKeywordOverlap(['machine learning models'], ['machine learning']);
      expect(result.hits).toBe(1);
    });

    test('returns 0 for no overlap', () => {
      const result = calculateKeywordOverlap(['cooking', 'recipes'], ['ai', 'llm']);
      expect(result.hits).toBe(0);
      expect(result.ratio).toBe(0);
    });

    test('handles empty arrays', () => {
      expect(calculateKeywordOverlap([], ['ai']).hits).toBe(0);
      expect(calculateKeywordOverlap(['ai'], []).hits).toBe(0);
    });

    test('is case insensitive', () => {
      const result = calculateKeywordOverlap(['AI', 'LLM'], ['ai', 'llm']);
      expect(result.hits).toBe(2);
    });

    test('ratio is capped at 1.0', () => {
      const result = calculateKeywordOverlap(['a', 'b', 'c', 'd'], ['a']);
      expect(result.ratio).toBeLessThanOrEqual(1);
    });
  });

  describe('departmentMatchesDomains', () => {
    test('matches direct department-domain alignment', () => {
      expect(departmentMatchesDomains('marketing', ['marketing'], mockDomains)).toBe(true);
    });

    test('matches via department-to-domain map', () => {
      expect(departmentMatchesDomains('ai-science', ['ai-ml'], mockDomains)).toBe(true);
    });

    test('returns false for unrelated department', () => {
      expect(departmentMatchesDomains('design', ['ai-ml'], mockDomains)).toBe(false);
    });

    test('handles null/empty inputs', () => {
      expect(departmentMatchesDomains(null, ['ai-ml'], mockDomains)).toBe(false);
      expect(departmentMatchesDomains('ai-science', [], mockDomains)).toBe(false);
    });
  });

  describe('getTierBonus', () => {
    test('S tier gets highest bonus', () => {
      expect(getTierBonus('S')).toBe(1.0);
    });

    test('A tier gets medium bonus', () => {
      expect(getTierBonus('A')).toBe(0.7);
    });

    test('B tier gets lower bonus', () => {
      expect(getTierBonus('B')).toBe(0.4);
    });

    test('unknown tier gets minimum bonus', () => {
      expect(getTierBonus('D')).toBe(0.1);
    });
  });

  describe('getPriority', () => {
    test('maps tiers to priorities', () => {
      const map = { S: 'urgent', A: 'normal', B: 'low' };
      expect(getPriority('S', map)).toBe('urgent');
      expect(getPriority('A', map)).toBe('normal');
      expect(getPriority('B', map)).toBe('low');
    });
  });

  describe('findTargetProjects', () => {
    test('finds projects from domains config', () => {
      const projects = findTargetProjects(['ai-ml'], mockDomains);
      expect(projects).toContain('aios');
      expect(projects).toContain('serenity-ai');
    });

    test('returns empty for unknown domain', () => {
      const projects = findTargetProjects(['unknown-domain'], mockDomains);
      expect(projects).toEqual([]);
    });

    test('deduplicates projects across multiple domains', () => {
      const projects = findTargetProjects(['ai-ml', 'engenharia'], mockDomains);
      const aiosCount = projects.filter(p => p === 'aios').length;
      expect(aiosCount).toBe(1);
    });
  });

  describe('applyFeedbackAdjustments', () => {
    test('returns base score when no adjustments exist', () => {
      expect(applyFeedbackAdjustments('clone-x', 0.5, ['ai'], {}, 0.2)).toBe(0.5);
    });

    test('applies keyword boost', () => {
      const adjustments = {
        'chip-huyen': { keyword_boosts: { ai: 0.1 } },
      };
      const score = applyFeedbackAdjustments('chip-huyen', 0.5, ['ai'], adjustments, 0.2);
      expect(score).toBeCloseTo(0.6);
    });

    test('applies keyword penalty', () => {
      const adjustments = {
        'chip-huyen': { keyword_penalties: { marketing: -0.2 } },
      };
      const score = applyFeedbackAdjustments('chip-huyen', 0.5, ['marketing'], adjustments, 0.2);
      expect(score).toBeCloseTo(0.3);
    });

    test('respects floor minimum', () => {
      const adjustments = {
        'chip-huyen': { keyword_penalties: { ai: -0.9 } },
      };
      const score = applyFeedbackAdjustments('chip-huyen', 0.5, ['ai'], adjustments, 0.2);
      expect(score).toBeGreaterThanOrEqual(0.2);
    });
  });

  describe('routeToMindClones', () => {
    test('routes AI content to AI clones', () => {
      const result = routeToMindClones(
        {
          contentId: 'hydra-abc123',
          domains: ['ai-ml'],
          keywords: ['llm', 'embedding', 'rag'],
          tags: ['ai'],
          entities: ['GPT', 'Claude'],
          tier: 'S',
        },
        {
          configDir: path.join(tmpDir, 'config'),
          indexPath: path.join(tmpDir, 'index.json'),
          mapPath: path.join(tmpDir, 'map.yaml'),
        }
      );

      expect(result.contentId).toBe('hydra-abc123');
      expect(result.targetClones.length).toBeGreaterThan(0);
      expect(result.priority).toBe('urgent');

      // chip-huyen and andrej-karpathy should be in results
      const cloneIds = result.targetClones.map(c => c.id);
      expect(cloneIds).toContain('chip-huyen');
      expect(cloneIds).toContain('andrej-karpathy');
    });

    test('routes marketing content to marketing clones', () => {
      const result = routeToMindClones(
        {
          contentId: 'hydra-mkt001',
          domains: ['marketing'],
          keywords: ['growth', 'funnel', 'lead'],
          tags: ['marketing'],
          tier: 'A',
        },
        {
          configDir: path.join(tmpDir, 'config'),
          indexPath: path.join(tmpDir, 'index.json'),
          mapPath: path.join(tmpDir, 'map.yaml'),
        }
      );

      const cloneIds = result.targetClones.map(c => c.id);
      expect(cloneIds).toContain('alex-hormozi');
      expect(result.priority).toBe('normal');
    });

    test('returns empty when no match above threshold', () => {
      const result = routeToMindClones(
        {
          contentId: 'hydra-no-match',
          domains: ['cooking'],
          keywords: ['recipe', 'cake'],
          tags: [],
          tier: 'C',
        },
        {
          configDir: path.join(tmpDir, 'config'),
          indexPath: path.join(tmpDir, 'index.json'),
          mapPath: path.join(tmpDir, 'map.yaml'),
        }
      );

      expect(result.targetClones.length).toBe(0);
    });

    test('respects maxClones limit', () => {
      const result = routeToMindClones(
        {
          contentId: 'hydra-all-match',
          domains: ['ai-ml', 'marketing', 'engenharia'],
          keywords: ['ai', 'marketing', 'architecture', 'growth', 'embedding', 'neural'],
          tags: [],
          tier: 'S',
        },
        {
          configDir: path.join(tmpDir, 'config'),
          indexPath: path.join(tmpDir, 'index.json'),
          mapPath: path.join(tmpDir, 'map.yaml'),
          maxClones: 2,
        }
      );

      expect(result.targetClones.length).toBeLessThanOrEqual(2);
    });

    test('includes target projects from domain mapping', () => {
      const result = routeToMindClones(
        {
          contentId: 'hydra-proj-test',
          domains: ['ai-ml'],
          keywords: ['llm'],
          tags: [],
          tier: 'A',
        },
        {
          configDir: path.join(tmpDir, 'config'),
          indexPath: path.join(tmpDir, 'index.json'),
          mapPath: path.join(tmpDir, 'map.yaml'),
        }
      );

      expect(result.targetProjects).toContain('aios');
      expect(result.targetProjects).toContain('serenity-ai');
    });

    test('clones are sorted by relevance score descending', () => {
      const result = routeToMindClones(
        {
          contentId: 'hydra-sort-test',
          domains: ['ai-ml'],
          keywords: ['ai', 'llm', 'embedding', 'rag'],
          tags: [],
          tier: 'S',
        },
        {
          configDir: path.join(tmpDir, 'config'),
          indexPath: path.join(tmpDir, 'index.json'),
          mapPath: path.join(tmpDir, 'map.yaml'),
        }
      );

      for (let i = 1; i < result.targetClones.length; i++) {
        expect(result.targetClones[i - 1].relevanceScore).toBeGreaterThanOrEqual(
          result.targetClones[i].relevanceScore
        );
      }
    });

    test('includes matchedKeywords in clone results', () => {
      const result = routeToMindClones(
        {
          contentId: 'hydra-kw-test',
          domains: ['ai-ml'],
          keywords: ['embedding', 'rag'],
          tags: [],
          tier: 'S',
        },
        {
          configDir: path.join(tmpDir, 'config'),
          indexPath: path.join(tmpDir, 'index.json'),
          mapPath: path.join(tmpDir, 'map.yaml'),
        }
      );

      const chipClone = result.targetClones.find(c => c.id === 'chip-huyen');
      expect(chipClone).toBeDefined();
      expect(chipClone.matchedKeywords.length).toBeGreaterThan(0);
    });

    test('forced routes ensure clone passes threshold', () => {
      const result = routeToMindClones(
        {
          contentId: 'hydra-forced',
          domains: ['ai-ml'],
          keywords: [],
          tags: [],
          tier: 'B',
        },
        {
          configDir: path.join(tmpDir, 'config'),
          indexPath: path.join(tmpDir, 'index.json'),
          mapPath: path.join(tmpDir, 'map.yaml'),
        }
      );

      const cloneIds = result.targetClones.map(c => c.id);
      // Forced routes for ai-ml include andrej-karpathy and chip-huyen
      expect(cloneIds).toContain('andrej-karpathy');
      expect(cloneIds).toContain('chip-huyen');
    });
  });

  describe('normalizeKeyword', () => {
    test('lowercases and trims', () => {
      expect(normalizeKeyword('  AI  ')).toBe('ai');
    });

    test('handles null/undefined', () => {
      expect(normalizeKeyword(null)).toBe('');
      expect(normalizeKeyword(undefined)).toBe('');
    });
  });
});
