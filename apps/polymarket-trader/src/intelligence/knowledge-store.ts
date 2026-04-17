/**
 * Knowledge Store — Loads and indexes the prediction market knowledge base
 * for retrieval-augmented trading decisions.
 *
 * 307 markdown files organized by domain (strategies, academic, verticals, etc.)
 * Indexed by: vertical, keywords, tags. Retrieved via TF-IDF scoring.
 *
 * Zero external dependencies — pure Node.js.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, basename } from 'path';
import type { Vertical } from '../types/index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KnowledgeDocument {
  id: string;
  title: string;
  domain: string;          // folder name: strategies, academic, verticals, etc.
  vertical: Vertical | null;
  summary: string;         // first ~500 chars of content
  insights: string[];      // extracted "Key Insights" bullets
  botApplication: string;  // extracted "Bot Application" / "How This Applies" section
  keywords: string[];      // extracted keywords for matching
  filePath: string;
  wordCount: number;
}

interface RetrievalResult {
  doc: KnowledgeDocument;
  score: number;
  matchReason: string;
}

// ---------------------------------------------------------------------------
// Keyword extraction helpers
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'don', 'now', 'and', 'but', 'or', 'if', 'this', 'that',
  'these', 'those', 'what', 'which', 'who', 'whom', 'its', 'it',
  'market', 'markets', 'prediction', 'trading', 'trade', 'trades',
  'using', 'based', 'data', 'also', 'like', 'about', 'new',
]);

/** Extract keywords from text, filtering stop words and short tokens. */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
}

/** Map vertical-related keywords to vertical type. */
const VERTICAL_KEYWORDS: Record<Vertical, string[]> = {
  weather: ['weather', 'temperature', 'hurricane', 'tornado', 'rainfall', 'climate', 'drought', 'flood', 'heat', 'storm', 'forecast', 'meteorolog'],
  crypto: ['bitcoin', 'ethereum', 'crypto', 'blockchain', 'defi', 'token', 'solana', 'stablecoin', 'nft', 'binance', 'coinbase', 'halving'],
  politics: ['election', 'president', 'congress', 'senate', 'democrat', 'republican', 'trump', 'biden', 'geopolitic', 'tariff', 'legislation', 'ceasefire', 'supreme court', 'polling'],
  sports: ['nba', 'nfl', 'mlb', 'nhl', 'ufc', 'soccer', 'football', 'basketball', 'baseball', 'championship', 'playoff', 'injury', 'sports', 'athlete'],
  pop_culture: ['oscar', 'grammy', 'emmy', 'movie', 'album', 'netflix', 'celebrity', 'tiktok', 'viral', 'entertainment', 'streaming', 'youtube'],
  finance: ['fed', 'inflation', 'gdp', 'unemployment', 'interest rate', 'treasury', 'recession', 'stock', 'nasdaq', 'bond', 'macro', 'economic'],
  science: ['spacex', 'nasa', 'launch', 'openai', 'fda', 'vaccine', 'quantum', 'artificial intelligence', 'clinical trial', 'space', 'asteroid'],
};

/** Detect vertical from document content/title. */
function detectDocVertical(text: string): Vertical | null {
  const lower = text.toLowerCase();
  let bestMatch: Vertical | null = null;
  let bestCount = 0;

  for (const [vertical, keywords] of Object.entries(VERTICAL_KEYWORDS)) {
    const count = keywords.filter(kw => lower.includes(kw)).length;
    if (count > bestCount) {
      bestCount = count;
      bestMatch = vertical as Vertical;
    }
  }

  return bestCount >= 2 ? bestMatch : null;
}

// ---------------------------------------------------------------------------
// Knowledge Store
// ---------------------------------------------------------------------------

export class KnowledgeStore {
  private documents: KnowledgeDocument[] = [];
  private verticalIndex: Map<Vertical, KnowledgeDocument[]> = new Map();
  private keywordIndex: Map<string, KnowledgeDocument[]> = new Map();
  private idf: Map<string, number> = new Map();

  /** Load all markdown files from a directory tree. */
  loadFromDirectory(rootPath: string): number {
    const startTime = Date.now();
    let loaded = 0;

    try {
      const entries = readdirSync(rootPath);
      for (const entry of entries) {
        const fullPath = join(rootPath, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          loaded += this.loadSubdirectory(fullPath, entry);
        } else if (entry.endsWith('.md') && !entry.startsWith('_')) {
          const doc = this.parseDocument(fullPath, 'root');
          if (doc) {
            this.documents.push(doc);
            loaded++;
          }
        }
      }

      this.buildIndices();
      const elapsed = Date.now() - startTime;
      console.log(`[KnowledgeStore] Loaded ${loaded} documents in ${elapsed}ms (${this.documents.length} indexed, ${this.keywordIndex.size} keywords)`);
    } catch (err) {
      console.error(`[KnowledgeStore] Failed to load from ${rootPath}: ${err instanceof Error ? err.message : err}`);
    }

    return loaded;
  }

  private loadSubdirectory(dirPath: string, domain: string): number {
    let count = 0;
    try {
      const files = readdirSync(dirPath).filter(f => f.endsWith('.md') && !f.startsWith('_'));
      for (const file of files) {
        const doc = this.parseDocument(join(dirPath, file), domain);
        if (doc) {
          this.documents.push(doc);
          count++;
        }
      }
    } catch { /* skip unreadable dirs */ }
    return count;
  }

  /** Parse a markdown file into a KnowledgeDocument. */
  private parseDocument(filePath: string, domain: string): KnowledgeDocument | null {
    try {
      const content = readFileSync(filePath, 'utf-8');
      if (content.length < 100) return null; // skip tiny files

      const fileName = basename(filePath, '.md');

      // Extract title from first # heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : fileName;

      // Extract "Key Insights" section
      const insightsMatch = content.match(/##\s*Key Insights\s*\n([\s\S]*?)(?=\n##\s|\n---|\Z)/i);
      const insightsRaw = insightsMatch ? insightsMatch[1] : '';
      const insights = insightsRaw
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[\s*-]+/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 8);

      // Extract "Bot Application" / "How This Applies" section
      const botMatch = content.match(/##\s*(?:Bot Application|How This Applies|Application to (?:Automated|Our) (?:Trading )?Bot)\s*\n([\s\S]*?)(?=\n##\s|\n---|\Z)/i);
      const botApplication = botMatch
        ? botMatch[1].trim().substring(0, 800)
        : '';

      // Summary: first substantial paragraph after title
      const paragraphs = content.split('\n\n').filter(p => p.length > 50 && !p.startsWith('#'));
      const summary = paragraphs[0]?.substring(0, 500) || '';

      // Extract keywords from title + insights + first 2000 chars
      const textForKeywords = `${title} ${insightsRaw} ${content.substring(0, 2000)}`;
      const keywords = [...new Set(extractKeywords(textForKeywords))];

      // Detect vertical
      const vertical = detectDocVertical(`${title} ${content.substring(0, 3000)}`);

      return {
        id: `${domain}/${fileName}`,
        title,
        domain,
        vertical,
        summary,
        insights,
        botApplication,
        keywords,
        filePath,
        wordCount: content.split(/\s+/).length,
      };
    } catch {
      return null;
    }
  }

  /** Build inverted indices for fast retrieval. */
  private buildIndices(): void {
    this.verticalIndex.clear();
    this.keywordIndex.clear();

    for (const doc of this.documents) {
      // Vertical index
      if (doc.vertical) {
        const list = this.verticalIndex.get(doc.vertical) || [];
        list.push(doc);
        this.verticalIndex.set(doc.vertical, list);
      }

      // Keyword inverted index
      for (const kw of doc.keywords) {
        const list = this.keywordIndex.get(kw) || [];
        list.push(doc);
        this.keywordIndex.set(kw, list);
      }
    }

    // Compute IDF for all keywords
    const N = this.documents.length;
    for (const [kw, docs] of this.keywordIndex) {
      this.idf.set(kw, Math.log(N / docs.length));
    }
  }

  /**
   * Find the most relevant documents for a market.
   * Uses TF-IDF scoring + vertical boost + domain diversity.
   */
  findRelevant(marketQuestion: string, vertical: Vertical, limit = 5): RetrievalResult[] {
    if (this.documents.length === 0) return [];

    const queryKeywords = extractKeywords(marketQuestion);
    const scores: Map<string, { doc: KnowledgeDocument; score: number; reasons: string[] }> = new Map();

    // Score each document by TF-IDF keyword overlap
    for (const kw of queryKeywords) {
      const matchingDocs = this.keywordIndex.get(kw);
      if (!matchingDocs) continue;

      const idfScore = this.idf.get(kw) || 1;
      for (const doc of matchingDocs) {
        const entry = scores.get(doc.id) || { doc, score: 0, reasons: [] };
        entry.score += idfScore;
        if (!entry.reasons.includes(kw)) entry.reasons.push(kw);
        scores.set(doc.id, entry);
      }
    }

    // Boost documents matching the market's vertical
    const verticalDocs = this.verticalIndex.get(vertical) || [];
    for (const doc of verticalDocs) {
      const entry = scores.get(doc.id) || { doc, score: 0, reasons: [] };
      entry.score += 3.0; // vertical match boost
      if (!entry.reasons.includes(`vertical:${vertical}`)) {
        entry.reasons.push(`vertical:${vertical}`);
      }
      scores.set(doc.id, entry);
    }

    // Boost documents with bot application sections (more actionable)
    for (const [id, entry] of scores) {
      if (entry.doc.botApplication.length > 100) {
        entry.score += 1.5;
      }
      // Boost strategy and microstructure domains (most actionable)
      if (entry.doc.domain === 'strategies' || entry.doc.domain === 'market-microstructure') {
        entry.score += 1.0;
      }
      scores.set(id, entry);
    }

    // Sort by score, ensure domain diversity (max 2 per domain)
    const sorted = [...scores.values()].sort((a, b) => b.score - a.score);
    const domainCounts: Map<string, number> = new Map();
    const results: RetrievalResult[] = [];

    for (const entry of sorted) {
      if (results.length >= limit) break;
      const domainCount = domainCounts.get(entry.doc.domain) || 0;
      if (domainCount >= 2) continue; // diversity cap
      domainCounts.set(entry.doc.domain, domainCount + 1);
      results.push({
        doc: entry.doc,
        score: entry.score,
        matchReason: entry.reasons.slice(0, 4).join(', '),
      });
    }

    return results;
  }

  /**
   * Format retrieved documents as context for the LLM prompt.
   * Concise format to minimize token usage while maximizing signal.
   */
  formatForPrompt(results: RetrievalResult[], maxTokenBudget = 1500): string {
    if (results.length === 0) return '';

    const sections: string[] = [];
    let approxTokens = 0;

    for (const { doc } of results) {
      // Build concise context block
      const parts: string[] = [];
      parts.push(`[${doc.domain}] ${doc.title}`);

      // Add top insights (most dense info)
      if (doc.insights.length > 0) {
        const topInsights = doc.insights.slice(0, 3);
        parts.push('Insights: ' + topInsights.join(' | '));
      }

      // Add bot application (most actionable)
      if (doc.botApplication) {
        const truncated = doc.botApplication.substring(0, 300);
        parts.push('Application: ' + truncated);
      }

      const block = parts.join('\n');
      const blockTokens = Math.ceil(block.length / 4); // ~4 chars per token

      if (approxTokens + blockTokens > maxTokenBudget) break;
      approxTokens += blockTokens;
      sections.push(block);
    }

    return sections.join('\n---\n');
  }

  /**
   * Get vertical-specific trading insights as a structured brief.
   * Used by the heuristic analyzer when no LLM is available.
   */
  getVerticalBrief(vertical: Vertical): {
    biases: string[];
    edgePatterns: string[];
    riskFactors: string[];
    avgEdgePercent: number;
  } {
    const docs = this.verticalIndex.get(vertical) || [];

    // Aggregate insights from all docs in this vertical
    const allInsights = docs.flatMap(d => d.insights);
    const allBotApps = docs.map(d => d.botApplication).filter(Boolean);
    const combined = allInsights.join(' ') + ' ' + allBotApps.join(' ');
    const lower = combined.toLowerCase();

    // Extract bias mentions
    const biasKeywords = ['bias', 'overconfidence', 'anchoring', 'recency', 'herding', 'favorite-longshot', 'narrative'];
    const biases = biasKeywords.filter(b => lower.includes(b));

    // Extract edge patterns
    const edgeKeywords = ['arbitrage', 'mispricing', 'inefficiency', 'edge', 'alpha', 'contrarian', 'mean reversion', 'momentum'];
    const edgePatterns = edgeKeywords.filter(e => lower.includes(e));

    // Extract risk factors
    const riskKeywords = ['manipulation', 'resolution risk', 'liquidity', 'slippage', 'oracle', 'dispute'];
    const riskFactors = riskKeywords.filter(r => lower.includes(r));

    // Estimate average edge from data points in knowledge base
    const edgeMatches = combined.match(/(\d+(?:\.\d+)?)\s*%\s*(?:edge|alpha|profit|return)/gi) || [];
    const edges = edgeMatches.map(m => parseFloat(m)).filter(n => !isNaN(n) && n > 0 && n < 50);
    const avgEdgePercent = edges.length > 0 ? edges.reduce((a, b) => a + b, 0) / edges.length : 5;

    return { biases, edgePatterns, riskFactors, avgEdgePercent };
  }

  /** Get stats about the loaded knowledge base. */
  getStats() {
    const byDomain: Record<string, number> = {};
    const byVertical: Record<string, number> = {};

    for (const doc of this.documents) {
      byDomain[doc.domain] = (byDomain[doc.domain] || 0) + 1;
      if (doc.vertical) {
        byVertical[doc.vertical] = (byVertical[doc.vertical] || 0) + 1;
      }
    }

    return {
      totalDocuments: this.documents.length,
      totalKeywords: this.keywordIndex.size,
      byDomain,
      byVertical,
      totalWords: this.documents.reduce((sum, d) => sum + d.wordCount, 0),
    };
  }
}
