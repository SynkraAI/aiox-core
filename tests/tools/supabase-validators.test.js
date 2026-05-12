// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolValidationHelper = require('../../common/utils/tool-validation-helper');

/**
 * Supabase Tool Validators Test Suite
 *
 * Tests all 5 validators defined in supabase.yaml:
 * 1. validate-execute-sql
 * 2. validate-apply-migration
 * 3. validate-create-branch
 * 4. validate-deploy-edge-function
 * 5. validate-create-project
 */
describeIntegration('Supabase Tool Validators', () => {
  let validator;
  let supabaseTool;

  beforeAll(async () => {
    // Set search path to aiox-core/tools
    const toolsPath = path.join(__dirname, '../../aiox-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve supabase tool
    supabaseTool = await toolResolver.resolveTool('supabase');

    // Create validator instance
    validator = new ToolValidationHelper(supabaseTool.executable_knowledge.validators);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve supabase tool from aiox-core/tools/mcp', async () => {
      expect(supabaseTool).toBeDefined();
      expect(supabaseTool.id).toBe('supabase');
      expect(supabaseTool.type).toBe('mcp');
      expect(supabaseTool.schema_version).toBe(2.0);
    });

    test('should have executable_knowledge with validators', () => {
      expect(supabaseTool.executable_knowledge).toBeDefined();
      expect(supabaseTool.executable_knowledge.validators).toBeDefined();
      expect(Array.isArray(supabaseTool.executable_knowledge.validators)).toBe(true);
      expect(supabaseTool.executable_knowledge.validators.length).toBe(5);
    });

    test('should have all required validator IDs', () => {
      const validatorIds = supabaseTool.executable_knowledge.validators.map(v => v.id);
      expect(validatorIds).toContain('validate-execute-sql');
      expect(validatorIds).toContain('validate-apply-migration');
      expect(validatorIds).toContain('validate-create-branch');
      expect(validatorIds).toContain('validate-deploy-edge-function');
      expect(validatorIds).toContain('validate-create-project');
    });
  });

  describeIntegration('validate-execute-sql', () => {
    test('should pass with valid SQL query', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'SELECT * FROM posts WHERE user_id = auth.uid()',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail without project_id', async () => {
      const result = await validator.validate('execute_sql', {
        query: 'SELECT * FROM posts',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('project_id is required');
    });

    test('should fail without query', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('query is required');
    });

    test('should reject DROP TABLE operations', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'DROP TABLE users',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('DROP operations not allowed via execute_sql - use apply_migration');
    });

    test('should reject DROP DATABASE operations', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'drop database test',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('DROP operations not allowed via execute_sql - use apply_migration');
    });

    test('should reject CREATE TABLE (DDL)', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'CREATE TABLE test (id int)',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('DDL operations not allowed in execute_sql - use apply_migration instead');
    });

    test('should reject ALTER TABLE (DDL)', async () => {
      const result = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'ALTER TABLE users ADD COLUMN email text',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('DDL operations not allowed in execute_sql - use apply_migration instead');
    });

    test('should accept DML operations (INSERT, UPDATE, DELETE)', async () => {
      const insertResult = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'INSERT INTO posts (title) VALUES (\'test\')',
      });
      expect(insertResult.valid).toBe(true);

      const updateResult = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'UPDATE posts SET title = \'updated\' WHERE id = 1',
      });
      expect(updateResult.valid).toBe(true);

      const deleteResult = await validator.validate('execute_sql', {
        project_id: 'proj_abc123',
        query: 'DELETE FROM posts WHERE id = 1',
      });
      expect(deleteResult.valid).toBe(true);
    });
  });

  describeIntegration('validate-apply-migration', () => {
    test('should pass with valid migration', async () => {
      const result = await validator.validate('apply_migration', {
        project_id: 'proj_abc123',
        name: 'create_posts_table',
        query: 'CREATE TABLE posts (id uuid PRIMARY KEY)',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail without project_id', async () => {
      const result = await validator.validate('apply_migration', {
        name: 'test_migration',
        query: 'CREATE TABLE test (id int)',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('project_id is required');
    });

    test('should fail without name', async () => {
      const result = await validator.validate('apply_migration', {
        project_id: 'proj_abc123',
        query: 'CREATE TABLE test (id int)',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    test('should fail without query', async () => {
      const result = await validator.validate('apply_migration', {
        project_id: 'proj_abc123',
        name: 'test_migration',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('query is required');
    });

    test('should reject invalid migration name (camelCase)', async () => {
      const result = await validator.validate('apply_migration', {
        project_id: 'proj_abc123',
        name: 'createPostsTable',
        query: 'CREATE TABLE posts (id int)',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('migration name must be snake_case (lowercase letters, numbers, underscores only)');
    });

    test('should reject invalid migration name (with spaces)', async () => {
      const result = await validator.validate('apply_migration', {
        project_id: 'proj_abc123',
        name: 'create posts table',
        query: 'CREATE TABLE posts (id int)',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('migration name must be snake_case (lowercase letters, numbers, underscores only)');
    });

    test('should accept valid snake_case names', async () => {
      const result = await validator.validate('apply_migration', {
        project_id: 'proj_abc123',
        name: 'create_posts_table_v2',
        query: 'CREATE TABLE posts (id int)',
      });

      expect(result.valid).toBe(true);
    });

    test('should warn about hardcoded UUIDs', async () => {
      const result = await validator.validate('apply_migration', {
        project_id: 'proj_abc123',
        name: 'insert_test_data',
        query: 'INSERT INTO users (id) VALUES (\'123e4567-e89b-12d3-a456-426614174000\')',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('hardcoded UUID');
    });
  });

  describeIntegration('validate-create-branch', () => {
    test('should pass with valid branch creation', async () => {
      const result = await validator.validate('create_branch', {
        project_id: 'proj_abc123',
        confirm_cost_id: 'cost_xyz789',
        name: 'develop',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail without project_id', async () => {
      const result = await validator.validate('create_branch', {
        confirm_cost_id: 'cost_xyz789',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('project_id is required');
    });

    test('should fail without confirm_cost_id', async () => {
      const result = await validator.validate('create_branch', {
        project_id: 'proj_abc123',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('confirm_cost_id is required - call confirm_cost first');
    });

    test('should reject invalid branch name (uppercase)', async () => {
      const result = await validator.validate('create_branch', {
        project_id: 'proj_abc123',
        confirm_cost_id: 'cost_xyz789',
        name: 'Develop',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('branch name must be lowercase letters, numbers, and hyphens only');
    });

    test('should reject invalid branch name (underscores)', async () => {
      const result = await validator.validate('create_branch', {
        project_id: 'proj_abc123',
        confirm_cost_id: 'cost_xyz789',
        name: 'develop_branch',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('branch name must be lowercase letters, numbers, and hyphens only');
    });

    test('should accept valid branch names', async () => {
      const result = await validator.validate('create_branch', {
        project_id: 'proj_abc123',
        confirm_cost_id: 'cost_xyz789',
        name: 'feature-123',
      });

      expect(result.valid).toBe(true);
    });
  });

  describeIntegration('validate-deploy-edge-function', () => {
    test('should pass with valid edge function deployment', async () => {
      const result = await validator.validate('deploy_edge_function', {
        project_id: 'proj_abc123',
        name: 'my-function',
        files: [
          { name: 'index.ts', content: 'Deno.serve(() => new Response("Hello"))' },
        ],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail without project_id', async () => {
      const result = await validator.validate('deploy_edge_function', {
        name: 'my-function',
        files: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('project_id is required');
    });

    test('should fail without name', async () => {
      const result = await validator.validate('deploy_edge_function', {
        project_id: 'proj_abc123',
        files: [],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    test('should fail without files', async () => {
      const result = await validator.validate('deploy_edge_function', {
        project_id: 'proj_abc123',
        name: 'my-function',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('files array is required');
    });

    test('should fail with non-array files', async () => {
      const result = await validator.validate('deploy_edge_function', {
        project_id: 'proj_abc123',
        name: 'my-function',
        files: 'not-an-array',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('files must be an array');
    });

    test('should fail with file missing name', async () => {
      const result = await validator.validate('deploy_edge_function', {
        project_id: 'proj_abc123',
        name: 'my-function',
        files: [
          { content: 'test' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("missing required 'name' field");
    });

    test('should fail with file missing content', async () => {
      const result = await validator.validate('deploy_edge_function', {
        project_id: 'proj_abc123',
        name: 'my-function',
        files: [
          { name: 'index.ts' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("missing required 'content' field");
    });

    test('should warn about non-TypeScript entrypoint', async () => {
      const result = await validator.validate('deploy_edge_function', {
        project_id: 'proj_abc123',
        name: 'my-function',
        files: [{ name: 'index.js', content: 'test' }],
        entrypoint_path: 'index.js',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('entrypoint_path should be a TypeScript file (.ts)');
    });
  });

  describeIntegration('validate-create-project', () => {
    test('should pass with valid project creation', async () => {
      const result = await validator.validate('create_project', {
        name: 'My Project',
        region: 'us-east-1',
        organization_id: 'org_123',
        confirm_cost_id: 'cost_xyz',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail without name', async () => {
      const result = await validator.validate('create_project', {
        region: 'us-east-1',
        organization_id: 'org_123',
        confirm_cost_id: 'cost_xyz',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    test('should fail without region', async () => {
      const result = await validator.validate('create_project', {
        name: 'My Project',
        organization_id: 'org_123',
        confirm_cost_id: 'cost_xyz',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('region is required');
    });

    test('should fail without organization_id', async () => {
      const result = await validator.validate('create_project', {
        name: 'My Project',
        region: 'us-east-1',
        confirm_cost_id: 'cost_xyz',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('organization_id is required');
    });

    test('should fail without confirm_cost_id', async () => {
      const result = await validator.validate('create_project', {
        name: 'My Project',
        region: 'us-east-1',
        organization_id: 'org_123',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('confirm_cost_id is required - call confirm_cost first');
    });

    test('should reject invalid region', async () => {
      const result = await validator.validate('create_project', {
        name: 'My Project',
        region: 'invalid-region',
        organization_id: 'org_123',
        confirm_cost_id: 'cost_xyz',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('region must be one of:');
    });

    test('should accept all valid regions', async () => {
      const validRegions = [
        'us-west-1', 'us-east-1', 'us-east-2', 'ca-central-1',
        'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
        'ap-south-1', 'ap-southeast-1', 'ap-northeast-1',
      ];

      for (const region of validRegions) {
        const result = await validator.validate('create_project', {
          name: 'My Project',
          region: region,
          organization_id: 'org_123',
          confirm_cost_id: 'cost_xyz',
        });
        expect(result.valid).toBe(true);
      }
    });
  });

  describeIntegration('Validator Performance', () => {
    test('validation should complete in <50ms (target from Story 5.1)', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await validator.validate('execute_sql', {
          project_id: 'proj_test123',
          query: 'SELECT * FROM posts WHERE user_id = auth.uid()',
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      console.log(`\nSupabase Validator Performance: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(50);
    });
  });
});
