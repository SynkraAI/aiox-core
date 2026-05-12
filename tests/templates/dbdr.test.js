/**
 * DBDR Template Tests
 *
 * Test suite for Database Decision Record template.
 *
 * @module tests/dbdr
 * @story 3.10 - Template DBDR
 */

'use strict';

const path = require('path');
const { TemplateEngine } = require('../../.aiox-core/product/templates/engine');

describe('DBDR Template', () => {
  let engine;

  beforeAll(() => {
    engine = new TemplateEngine({
      interactive: false,
      baseDir: path.join(__dirname, '..', '..'),
    });
  });

  /**
   * DBDR-01: Generate DBDR with required fields
   * Priority: P0
   * AC: AC3.10.6 - JSON Schema valida output gerado
   */
  describe('DBDR-01: Generate DBDR with required fields', () => {
    it('should generate a valid DBDR document with all required fields', async () => {
      const context = {
        number: 1,
        title: 'Implement User Audit Trail Table',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'Data Engineer',
        context: 'We need to track all user actions for compliance and debugging purposes.',
        decision: 'Create a dedicated audit_trail table with partitioning by date for performance.',
        migrationStrategy: 'Blue-green deployment with dual-write during migration period.',
        rollbackPlan: 'Restore from pre-migration backup and disable audit triggers if issues occur.',
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      expect(result.content).toBeDefined();
      expect(result.content).toContain('# DBDR 001: Implement User Audit Trail Table');
      expect(result.content).toContain('**Status:** Proposed');
      expect(result.content).toContain('**Owner:** Data Engineer');
      expect(result.content).toContain('**Database:** PostgreSQL');
      expect(result.content).toContain('## Context');
      expect(result.content).toContain('## Decision');
      expect(result.content).toContain('## Migration Strategy');
      expect(result.content).toContain('## Rollback Plan');
      expect(result.templateType).toBe('dbdr');
    });

    it('should fail validation without required fields', async () => {
      const incompleteContext = {
        number: 1,
        title: 'Test',
        // Missing: status, dbType, owner, context, decision, migrationStrategy, rollbackPlan
      };

      await expect(
        engine.generate('dbdr', incompleteContext, { validate: true, save: false }),
      ).rejects.toThrow(/required.*has no default|missing required/i);
    });
  });

  /**
   * DBDR-02: Schema changes table renders
   * Priority: P0
   * AC: AC3.10.2 - Inclui seção de Schema Changes específica
   */
  describe('DBDR-02: Schema changes table renders', () => {
    it('should render schema changes as a table', async () => {
      const context = {
        number: 2,
        title: 'Add User Preferences Schema',
        status: 'Approved',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing schema changes rendering in DBDR template.',
        decision: 'Add new user_preferences table with JSON column for flexibility.',
        migrationStrategy: 'Online migration with zero downtime using pg_repack.',
        rollbackPlan: 'Drop table and restore from backup if validation fails.',
        schemaChanges: [
          { table: 'user_preferences', changeType: 'CREATE', description: 'New preferences table' },
          { table: 'users', changeType: 'ALTER', description: 'Add preference_id foreign key' },
          { table: 'user_preferences', changeType: 'INDEX', description: 'Index on user_id' },
        ],
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      // Check table headers
      expect(result.content).toContain('| Table | Change Type | Description |');
      expect(result.content).toContain('|-------|-------------|-------------|');

      // Check table rows
      expect(result.content).toContain('`user_preferences`');
      expect(result.content).toContain('CREATE');
      expect(result.content).toContain('New preferences table');
      expect(result.content).toContain('ALTER');
      expect(result.content).toContain('INDEX');
    });

    it('should show placeholder when no schema changes', async () => {
      const context = {
        number: 3,
        title: 'Query Optimization Decision',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing empty schema changes rendering.',
        decision: 'Optimize existing queries without schema changes.',
        migrationStrategy: 'No schema migration needed, only query updates.',
        rollbackPlan: 'Revert query changes via git if performance degrades.',
        // No schemaChanges
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      expect(result.content).toContain('_No schema changes required._');
    });
  });

  /**
   * DBDR-03: SQL blocks render correctly
   * Priority: P0
   */
  describe('DBDR-03: SQL blocks render correctly', () => {
    it('should render SQL migration blocks when provided', async () => {
      const context = {
        number: 4,
        title: 'Add Audit Columns',
        status: 'Approved',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing SQL blocks rendering in DBDR template.',
        decision: 'Add created_at and updated_at columns to all core tables.',
        migrationStrategy: 'Batch migration during maintenance window with locks.',
        rollbackPlan: 'Drop columns using pre-generated rollback script.',
        schemaChanges: [
          {
            table: 'users',
            changeType: 'ALTER',
            description: 'Add audit columns',
            sql: 'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();',
          },
          {
            table: 'orders',
            changeType: 'ALTER',
            description: 'Add audit columns',
            sql: 'ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();',
          },
        ],
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      // Check SQL blocks
      expect(result.content).toContain('```sql');
      expect(result.content).toContain('-- users: ALTER');
      expect(result.content).toContain('ALTER TABLE users ADD COLUMN created_at');
      expect(result.content).toContain('-- orders: ALTER');
      expect(result.content).toContain('ALTER TABLE orders ADD COLUMN updated_at');
    });

    it('should render rollback scripts when provided', async () => {
      const context = {
        number: 5,
        title: 'Test Rollback Scripts',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing rollback scripts rendering.',
        decision: 'Test decision with rollback scripts.',
        migrationStrategy: 'Standard migration with rollback capability.',
        rollbackPlan: 'Execute rollback script to restore previous state.',
        rollbackScripts: 'DROP TABLE IF EXISTS new_table;\nALTER TABLE users DROP COLUMN IF EXISTS new_column;',
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      expect(result.content).toContain('### Rollback Scripts');
      expect(result.content).toContain('DROP TABLE IF EXISTS new_table');
      expect(result.content).toContain('ALTER TABLE users DROP COLUMN');
    });
  });

  /**
   * DBDR-04: Validation fails without rollbackPlan
   * Priority: P0
   * AC: AC3.10.5 - Inclui seção de Rollback Plan
   */
  describe('DBDR-04: Validation fails without rollbackPlan', () => {
    it('should fail when rollbackPlan is missing', async () => {
      const context = {
        number: 6,
        title: 'Test Missing Rollback Plan',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing validation of rollback plan field.',
        decision: 'Test decision requiring rollback plan.',
        migrationStrategy: 'Standard migration approach with blue-green.',
        // Missing: rollbackPlan
      };

      await expect(
        engine.generate('dbdr', context, { validate: true, save: false }),
      ).rejects.toThrow(/required.*has no default|missing required/i);
    });

    it('should fail when rollbackPlan is too short', async () => {
      const context = {
        number: 7,
        title: 'Test Short Rollback Plan',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing validation of rollback plan minimum length.',
        decision: 'Test decision with short rollback plan.',
        migrationStrategy: 'Standard migration approach.',
        rollbackPlan: 'Too short', // Less than 20 chars
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      // Should have validation errors
      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('rollbackPlan'))).toBe(true);
    });
  });

  /**
   * DBDR-05: Performance metrics table renders
   * Priority: P1
   * AC: AC3.10.4 - Inclui seção de Performance Impact
   */
  describe('DBDR-05: Performance metrics table renders', () => {
    it('should render performance metrics table when provided', async () => {
      const context = {
        number: 8,
        title: 'Test Performance Metrics',
        status: 'Approved',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing performance metrics rendering in DBDR template.',
        decision: 'Add indexes to improve query performance.',
        migrationStrategy: 'Create indexes concurrently to avoid locks.',
        rollbackPlan: 'Drop indexes if performance degrades unexpectedly.',
        performanceMetrics: [
          { metric: 'Query Time (avg)', before: '500ms', after: '50ms', acceptable: 'Yes' },
          { metric: 'Index Size', before: '0 MB', after: '150 MB', acceptable: 'Yes' },
          { metric: 'Write Latency', before: '10ms', after: '15ms', acceptable: 'Acceptable' },
        ],
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      // Check performance table headers
      expect(result.content).toContain('| Metric | Before | After | Acceptable? |');
      expect(result.content).toContain('|--------|--------|-------|-------------|');

      // Check table rows
      expect(result.content).toContain('Query Time (avg)');
      expect(result.content).toContain('500ms');
      expect(result.content).toContain('50ms');
      expect(result.content).toContain('Index Size');
      expect(result.content).toContain('150 MB');
    });

    it('should render indexing strategy when provided', async () => {
      const context = {
        number: 9,
        title: 'Test Indexing Strategy',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing indexing strategy rendering.',
        decision: 'Add composite indexes for common query patterns.',
        migrationStrategy: 'Create indexes during low traffic period.',
        rollbackPlan: 'Drop indexes if space or performance issues arise.',
        indexes: [
          { name: 'idx_users_email', table: 'users', columns: 'email', reason: 'Unique lookup by email' },
          { name: 'idx_orders_user_date', table: 'orders', columns: 'user_id, created_at', reason: 'User order history queries' },
        ],
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      expect(result.content).toContain('### Indexing Strategy');
      expect(result.content).toContain('`idx_users_email`');
      expect(result.content).toContain('`users(email)`');
      expect(result.content).toContain('Unique lookup by email');
      expect(result.content).toContain('`idx_orders_user_date`');
      expect(result.content).toContain('`orders(user_id, created_at)`');
    });
  });

  /**
   * DBDR-06: Validation fails without migrationStrategy
   * Priority: P0
   * AC: AC3.10.7 - Valida que migration strategy não está vazia
   */
  describe('DBDR-06: Validation fails without migrationStrategy', () => {
    it('should fail when migrationStrategy is missing', async () => {
      const context = {
        number: 10,
        title: 'Test Missing Migration Strategy',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing validation of migration strategy field.',
        decision: 'Test decision requiring migration strategy.',
        rollbackPlan: 'Execute rollback script to restore previous state.',
        // Missing: migrationStrategy
      };

      await expect(
        engine.generate('dbdr', context, { validate: true, save: false }),
      ).rejects.toThrow(/required.*has no default|missing required/i);
    });

    it('should fail when migrationStrategy is empty', async () => {
      const context = {
        number: 11,
        title: 'Test Empty Migration Strategy',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing validation of empty migration strategy.',
        decision: 'Test decision with empty migration strategy.',
        migrationStrategy: '', // Empty string
        rollbackPlan: 'Execute rollback script to restore previous state.',
      };

      await expect(
        engine.generate('dbdr', context, { validate: true, save: false }),
      ).rejects.toThrow(/required.*has no default|missing required/i);
    });

    it('should fail when migrationStrategy is too short', async () => {
      const context = {
        number: 12,
        title: 'Test Short Migration Strategy',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing validation of migration strategy minimum length.',
        decision: 'Test decision with short migration strategy.',
        migrationStrategy: 'Too short', // Less than 20 chars
        rollbackPlan: 'Execute rollback script to restore previous state.',
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      // Should have validation errors
      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.some(e => e.includes('migrationStrategy'))).toBe(true);
    });
  });

  /**
   * DBDR-07: CLI command executes successfully
   * Priority: P0
   * AC: AC3.10.8 - Template registrado no TemplateEngine
   * AC: AC3.10.9 - Geração via CLI: aiox generate dbdr
   */
  describe('DBDR-07: CLI command executes successfully', () => {
    it('should be included in supported types', () => {
      expect(engine.supportedTypes).toContain('dbdr');
    });

    it('should load template info successfully', async () => {
      const info = await engine.getTemplateInfo('dbdr');

      expect(info.type).toBe('dbdr');
      expect(info.name).toBe('Database Decision Record');
      expect(info.version).toBeDefined();
      expect(info.variables).toBeDefined();
      expect(Array.isArray(info.variables)).toBe(true);

      // Check required variables
      const requiredVars = info.variables.filter(v => v.required);
      const requiredNames = requiredVars.map(v => v.name);

      expect(requiredNames).toContain('number');
      expect(requiredNames).toContain('title');
      expect(requiredNames).toContain('dbType');
      expect(requiredNames).toContain('migrationStrategy');
      expect(requiredNames).toContain('rollbackPlan');
    });

    it('should list dbdr in available templates', async () => {
      const templates = await engine.listTemplates();
      const dbdrTemplate = templates.find(t => t.type === 'dbdr');

      expect(dbdrTemplate).toBeDefined();
      expect(dbdrTemplate.status).not.toBe('missing');
    });
  });

  /**
   * Additional tests for optional sections
   */
  describe('Optional sections rendering', () => {
    it('should render migration phases when provided', async () => {
      const context = {
        number: 13,
        title: 'Test Migration Phases',
        status: 'Approved',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing migration phases rendering.',
        decision: 'Implement phased migration for zero-downtime.',
        migrationStrategy: 'Phased migration with validation at each step.',
        rollbackPlan: 'Rollback to previous phase on validation failure.',
        migrationPhases: [
          { phase: 'Preparation', duration: '1 day', description: 'Create new schema', validation: 'Schema exists' },
          { phase: 'Dual Write', duration: '3 days', description: 'Write to both schemas', validation: 'Data parity check' },
          { phase: 'Cutover', duration: '1 hour', description: 'Switch to new schema', validation: 'All queries work' },
        ],
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      expect(result.content).toContain('### Phases');
      expect(result.content).toContain('**Preparation**');
      expect(result.content).toContain('1 day');
      expect(result.content).toContain('Dual Write');
      expect(result.content).toContain('Cutover');
    });

    it('should render consequences when provided', async () => {
      const context = {
        number: 14,
        title: 'Test Consequences Rendering',
        status: 'Approved',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing consequences section rendering.',
        decision: 'Denormalize for read performance.',
        migrationStrategy: 'Background job to populate denormalized data.',
        rollbackPlan: 'Drop denormalized columns and revert to joins.',
        positiveConsequences: [
          'Read queries 10x faster',
          'Simpler application logic',
          'Better user experience',
        ],
        negativeConsequences: [
          'Increased storage requirements',
          'More complex write logic',
          'Potential for data inconsistency',
        ],
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      expect(result.content).toContain('## Consequences');
      expect(result.content).toContain('### Positive');
      expect(result.content).toContain('✅ Read queries 10x faster');
      expect(result.content).toContain('### Negative (Trade-offs)');
      expect(result.content).toContain('⚠️ Increased storage requirements');
    });

    it('should render data volume considerations when provided', async () => {
      const context = {
        number: 15,
        title: 'Test Data Volume',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing data volume considerations rendering.',
        decision: 'Implement table partitioning for large audit table.',
        migrationStrategy: 'Create partitions and migrate data in batches.',
        rollbackPlan: 'Merge partitions back to single table if issues.',
        dataVolume: {
          current: '500 GB',
          projected: '2 TB (1 year)',
          retention: '7 years regulatory',
        },
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      expect(result.content).toContain('### Data Volume Considerations');
      expect(result.content).toContain('**Current Size:** 500 GB');
      expect(result.content).toContain('**Projected Growth:** 2 TB (1 year)');
      expect(result.content).toContain('**Retention Policy:** 7 years regulatory');
    });

    it('should render related decisions when provided', async () => {
      const context = {
        number: 16,
        title: 'Test Related Decisions',
        status: 'Proposed',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing related decisions rendering.',
        decision: 'Extend previous audit implementation.',
        migrationStrategy: 'Incremental migration building on DBDR-001.',
        rollbackPlan: 'Revert to state before this migration.',
        relatedDBDRs: [
          { number: 1, title: 'Implement User Audit Trail Table' },
          { number: 5, title: 'Add User Preferences Schema' },
        ],
        relatedADRs: [
          { number: 3, title: 'Use PostgreSQL for Primary Database' },
        ],
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      expect(result.content).toContain('## Related Decisions');
      expect(result.content).toContain('[DBDR 1]');
      expect(result.content).toContain('Implement User Audit Trail Table');
      expect(result.content).toContain('### Related ADRs');
      expect(result.content).toContain('[ADR 3]');
    });

    it('should render testing sections when provided', async () => {
      const context = {
        number: 17,
        title: 'Test Testing Sections',
        status: 'Approved',
        dbType: 'PostgreSQL',
        owner: 'DBA',
        context: 'Testing pre/post migration tests rendering.',
        decision: 'Add comprehensive testing for migration.',
        migrationStrategy: 'Test-driven migration with automated validation.',
        rollbackPlan: 'Automated rollback on any test failure.',
        preMigrationTests: [
          'Verify backup is complete and valid',
          'Confirm staging environment matches production',
          'Run load tests on new schema',
        ],
        postMigrationValidation: [
          'Verify row counts match expected',
          'Run integrity checks on all foreign keys',
          'Validate query performance benchmarks',
        ],
      };

      const result = await engine.generate('dbdr', context, { validate: true, save: false });

      expect(result.content).toContain('### Pre-Migration Testing');
      expect(result.content).toContain('[ ] Verify backup is complete');
      expect(result.content).toContain('### Post-Migration Validation');
      expect(result.content).toContain('[ ] Verify row counts');
    });
  });
});
