/**
 * @module entity-graph
 * @description Entity Graph (Story 5.3) — SQLite-based entity index for tracking
 * entities, content associations, and co-occurrence relationships.
 *
 * Replaces Neo4j Knowledge Graph with lightweight SQLite relational tables.
 * Sufficient for < 50k entities with 1-2 hop queries.
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = path.resolve(__dirname, '../../hydra-data/hydra.db');
const _require = createRequire(import.meta.url);

/**
 * Entity Graph backed by SQLite.
 */
export class EntityGraph {
  /**
   * @param {string} [dbPath] - Path to SQLite database file
   */
  constructor(dbPath) {
    this.dbPath = dbPath || DEFAULT_DB_PATH;
    this.db = null;
    this._statements = null;
  }

  /**
   * Initialize database and create entity tables.
   * @returns {EntityGraph}
   */
  init() {
    if (this.db) return this;

    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const Database = _require('better-sqlite3');
    this.db = new Database(this.dbPath);

    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('foreign_keys = ON');

    this._createSchema();
    this._prepareStatements();

    return this;
  }

  /**
   * Create entity tables.
   * @private
   */
  _createSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS entities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'concept',
        normalized_name TEXT NOT NULL,
        first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        mention_count INTEGER DEFAULT 1,
        UNIQUE(normalized_name, type)
      );

      CREATE TABLE IF NOT EXISTS entity_content (
        entity_id INTEGER NOT NULL,
        content_id TEXT NOT NULL,
        domain TEXT,
        relevance REAL DEFAULT 0.5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (entity_id, content_id),
        FOREIGN KEY (entity_id) REFERENCES entities(id)
      );

      CREATE TABLE IF NOT EXISTS entity_relations (
        entity_a_id INTEGER NOT NULL,
        entity_b_id INTEGER NOT NULL,
        relation_type TEXT DEFAULT 'co-occurs',
        strength REAL DEFAULT 0.0,
        co_occurrence_count INTEGER DEFAULT 1,
        UNIQUE(entity_a_id, entity_b_id),
        FOREIGN KEY (entity_a_id) REFERENCES entities(id),
        FOREIGN KEY (entity_b_id) REFERENCES entities(id)
      );

      CREATE INDEX IF NOT EXISTS idx_entity_norm ON entities(normalized_name);
      CREATE INDEX IF NOT EXISTS idx_entity_type ON entities(type);
      CREATE INDEX IF NOT EXISTS idx_ec_content ON entity_content(content_id);
      CREATE INDEX IF NOT EXISTS idx_er_a ON entity_relations(entity_a_id);
      CREATE INDEX IF NOT EXISTS idx_er_b ON entity_relations(entity_b_id);
    `);
  }

  /**
   * Prepare reusable statements.
   * @private
   */
  _prepareStatements() {
    this._statements = {
      upsertEntity: this.db.prepare(`
        INSERT INTO entities (name, type, normalized_name, last_seen, mention_count)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)
        ON CONFLICT(normalized_name, type) DO UPDATE SET
          last_seen = CURRENT_TIMESTAMP,
          mention_count = mention_count + 1
      `),

      getEntityByName: this.db.prepare(`
        SELECT * FROM entities WHERE normalized_name = ?
      `),

      getEntityById: this.db.prepare(`
        SELECT * FROM entities WHERE id = ?
      `),

      linkContent: this.db.prepare(`
        INSERT OR IGNORE INTO entity_content (entity_id, content_id, domain, relevance)
        VALUES (?, ?, ?, ?)
      `),

      upsertRelation: this.db.prepare(`
        INSERT INTO entity_relations (entity_a_id, entity_b_id, relation_type, strength, co_occurrence_count)
        VALUES (?, ?, 'co-occurs', ?, 1)
        ON CONFLICT(entity_a_id, entity_b_id) DO UPDATE SET
          strength = (co_occurrence_count + 1.0) / (co_occurrence_count + 2.0),
          co_occurrence_count = co_occurrence_count + 1
      `),

      findContentByEntity: this.db.prepare(`
        SELECT ec.content_id, ec.domain, ec.relevance, ec.created_at
        FROM entity_content ec
        WHERE ec.entity_id = ?
        ORDER BY ec.created_at DESC
        LIMIT ?
      `),

      findRelatedEntities: this.db.prepare(`
        SELECT
          e.id, e.name, e.type, e.normalized_name, e.mention_count,
          er.strength, er.co_occurrence_count, er.relation_type
        FROM entity_relations er
        JOIN entities e ON (
          CASE WHEN er.entity_a_id = ? THEN er.entity_b_id ELSE er.entity_a_id END = e.id
        )
        WHERE (er.entity_a_id = ? OR er.entity_b_id = ?)
          AND er.strength >= ?
        ORDER BY er.strength DESC
        LIMIT ?
      `),

      getStats: this.db.prepare(`
        SELECT
          (SELECT COUNT(*) FROM entities) as total_entities,
          (SELECT COUNT(*) FROM entity_content) as total_links,
          (SELECT COUNT(*) FROM entity_relations) as total_relations
      `),

      getTopEntities: this.db.prepare(`
        SELECT name, type, mention_count, first_seen, last_seen
        FROM entities
        ORDER BY mention_count DESC
        LIMIT ?
      `),
    };
  }

  /**
   * Normalize an entity name.
   * @param {string} name
   * @returns {string}
   */
  _normalize(name) {
    return (name || '').toLowerCase().trim();
  }

  /**
   * Classify entity type based on heuristics.
   * @param {string} name
   * @returns {string}
   */
  _classifyType(name) {
    const lower = name.toLowerCase();

    // Known technology patterns
    const techPatterns = ['react', 'node', 'python', 'docker', 'kubernetes', 'next.js',
      'supabase', 'typescript', 'javascript', 'rust', 'go ', 'java', 'postgresql',
      'sqlite', 'redis', 'mongodb', 'graphql', 'rest api', 'llm', 'gpt', 'claude',
      'rag', 'embedding', 'transformer', 'neural', 'pytorch', 'tensorflow'];
    if (techPatterns.some(p => lower.includes(p))) return 'technology';

    // Company patterns
    const companyPatterns = ['inc', 'corp', 'google', 'microsoft', 'apple', 'meta',
      'amazon', 'openai', 'anthropic', 'nvidia', 'tesla'];
    if (companyPatterns.some(p => lower.includes(p))) return 'company';

    // Check if it looks like a person name (capitalized words)
    if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(name)) return 'person';

    return 'concept';
  }

  /**
   * Register entities from processed content and create co-occurrence relationships.
   * @param {string} contentId - Content ID
   * @param {string[]} entities - Entity names
   * @param {string} [domain] - Content domain
   * @returns {{ indexed: number, relations: number }}
   */
  registerEntities(contentId, entities, domain) {
    if (!entities || entities.length === 0) {
      return { indexed: 0, relations: 0 };
    }

    // Deduplicate by normalized name
    const seen = new Set();
    const uniqueEntities = [];
    for (const e of entities) {
      const norm = this._normalize(e);
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        uniqueEntities.push(e);
      }
    }

    let indexed = 0;
    let relations = 0;

    const entityIds = [];

    const registerAll = this.db.transaction(() => {
      // Register each entity
      for (const entityName of uniqueEntities) {
        const normalizedName = this._normalize(entityName);
        const type = this._classifyType(entityName);

        this._statements.upsertEntity.run(entityName, type, normalizedName);

        const entity = this._statements.getEntityByName.get(normalizedName);
        if (entity) {
          this._statements.linkContent.run(entity.id, contentId, domain || null, 0.5);
          entityIds.push(entity.id);
          indexed++;
        }
      }

      // Create co-occurrence relationships
      for (let i = 0; i < entityIds.length; i++) {
        for (let j = i + 1; j < entityIds.length; j++) {
          const a = Math.min(entityIds[i], entityIds[j]);
          const b = Math.max(entityIds[i], entityIds[j]);
          const initialStrength = 1.0 / (entityIds.length - 1); // Normalize by group size
          this._statements.upsertRelation.run(a, b, initialStrength);
          relations++;
        }
      }
    });

    registerAll();
    return { indexed, relations };
  }

  /**
   * Find content related to an entity.
   * @param {string} entityName
   * @param {Object} [options]
   * @param {number} [options.limit=20]
   * @returns {{ entity: Object|null, contentIds: string[], relatedEntities: Object[] }}
   */
  findRelated(entityName, options = {}) {
    const limit = options.limit || 20;
    const normalizedName = this._normalize(entityName);

    const entity = this._statements.getEntityByName.get(normalizedName);
    if (!entity) {
      return { entity: null, contentIds: [], relatedEntities: [] };
    }

    const contentRows = this._statements.findContentByEntity.all(entity.id, limit);
    const contentIds = contentRows.map(r => r.content_id);

    const relatedRows = this._statements.findRelatedEntities.all(
      entity.id, entity.id, entity.id, 0.0, limit
    );
    const relatedEntities = relatedRows.map(r => ({
      name: r.name,
      type: r.type,
      strength: Math.round(r.strength * 1000) / 1000,
      coOccurrences: r.co_occurrence_count,
    }));

    return {
      entity: {
        id: entity.id,
        name: entity.name,
        type: entity.type,
        mentionCount: entity.mention_count,
        firstSeen: entity.first_seen,
        lastSeen: entity.last_seen,
      },
      contentIds,
      relatedEntities,
    };
  }

  /**
   * Get graph statistics.
   * @returns {{ totalEntities: number, totalLinks: number, totalRelations: number, topEntities: Object[] }}
   */
  getStats() {
    const stats = this._statements.getStats.get();
    const topEntities = this._statements.getTopEntities.all(10);

    return {
      totalEntities: stats.total_entities,
      totalLinks: stats.total_links,
      totalRelations: stats.total_relations,
      topEntities: topEntities.map(e => ({
        name: e.name,
        type: e.type,
        mentions: e.mention_count,
      })),
    };
  }

  /**
   * Close database connection.
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this._statements = null;
    }
  }
}
