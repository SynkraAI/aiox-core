// Integration test - requires external services
const path = require('path');
const toolResolver = require('../../common/utils/tool-resolver');
const ToolHelperExecutor = require('../../common/utils/tool-helper-executor');

/**
 * Supabase Tool Helpers Test Suite
 *
 * Tests all 8 helpers defined in supabase.yaml:
 * 1. build-select-query
 * 2. build-insert-query
 * 3. build-update-query
 * 4. validate-rls-policy
 * 5. format-realtime-subscription
 * 6. validate-table-permissions
 * 7. parse-postgres-error
 * 8. generate-migration-name
 */
describeIntegration('Supabase Tool Helpers', () => {
  let executor;
  let supabaseTool;

  beforeAll(async () => {
    // Set search path to aiox-core/tools
    const toolsPath = path.join(__dirname, '../../aiox-core/tools');
    toolResolver.setSearchPaths([toolsPath]);

    // Resolve supabase tool
    supabaseTool = await toolResolver.resolveTool('supabase');

    // Create helper executor instance
    executor = new ToolHelperExecutor(supabaseTool.executable_knowledge.helpers);
  });

  afterAll(() => {
    toolResolver.resetSearchPaths();
    toolResolver.clearCache();
  });

  describeIntegration('Tool Resolution', () => {
    test('should resolve supabase tool with helpers', async () => {
      expect(supabaseTool).toBeDefined();
      expect(supabaseTool.executable_knowledge).toBeDefined();
      expect(supabaseTool.executable_knowledge.helpers).toBeDefined();
      expect(Array.isArray(supabaseTool.executable_knowledge.helpers)).toBe(true);
      expect(supabaseTool.executable_knowledge.helpers.length).toBe(8);
    });

    test('should have all required helper IDs', () => {
      const helperIds = supabaseTool.executable_knowledge.helpers.map(h => h.id);
      expect(helperIds).toContain('build-select-query');
      expect(helperIds).toContain('build-insert-query');
      expect(helperIds).toContain('build-update-query');
      expect(helperIds).toContain('validate-rls-policy');
      expect(helperIds).toContain('format-realtime-subscription');
      expect(helperIds).toContain('validate-table-permissions');
      expect(helperIds).toContain('parse-postgres-error');
      expect(helperIds).toContain('generate-migration-name');
    });
  });

  describeIntegration('build-select-query', () => {
    test('should build simple SELECT query', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
      });

      expect(result).toEqual({
        query: 'SELECT * FROM posts',
        requiresRLS: true,
        hint: 'Ensure RLS policies are enabled on this table',
      });
    });

    test('should build SELECT with specific columns', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'users',
        columns: ['id', 'email', 'name'],
      });

      expect(result.query).toBe('SELECT id, email, name FROM users');
      expect(result.requiresRLS).toBe(true);
    });

    test('should build SELECT with WHERE clause', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
        where: { user_id: 'abc123', published: true },
      });

      expect(result.query).toContain('SELECT * FROM posts WHERE');
      expect(result.query).toContain("user_id = 'abc123'");
      expect(result.query).toContain('published = true');
    });

    test('should build SELECT with ORDER BY', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
        orderBy: 'created_at DESC',
      });

      expect(result.query).toBe('SELECT * FROM posts ORDER BY created_at DESC');
    });

    test('should build SELECT with LIMIT', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
        limit: 10,
      });

      expect(result.query).toBe('SELECT * FROM posts LIMIT 10');
    });

    test('should build SELECT with all options', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
        columns: ['id', 'title'],
        where: { published: true },
        orderBy: 'created_at DESC',
        limit: 5,
      });

      expect(result.query).toBe('SELECT id, title FROM posts WHERE published = true ORDER BY created_at DESC LIMIT 5');
    });

    test('should skip RLS check when requested', async () => {
      const result = await executor.execute('build-select-query', {
        table: 'posts',
        checkRLS: false,
      });

      expect(result.requiresRLS).toBe(false);
      expect(result.hint).toBeNull();
    });

    test('should return error for missing table', async () => {
      const result = await executor.execute('build-select-query', {});

      expect(result).toEqual({ error: 'Table name is required' });
    });
  });

  describeIntegration('build-insert-query', () => {
    test('should build INSERT query', async () => {
      const result = await executor.execute('build-insert-query', {
        table: 'posts',
        data: { title: 'Test Post', content: 'Content here' },
      });

      expect(result.query).toContain('INSERT INTO posts');
      expect(result.query).toContain('title, content');
      expect(result.query).toContain("VALUES ('Test Post', 'Content here')");
      expect(result.requiresRLS).toBe(true);
    });

    test('should build INSERT with RETURNING', async () => {
      const result = await executor.execute('build-insert-query', {
        table: 'posts',
        data: { title: 'Test' },
        returning: 'id',
      });

      expect(result.query).toContain('RETURNING id');
    });

    test('should build INSERT with RETURNING *', async () => {
      const result = await executor.execute('build-insert-query', {
        table: 'posts',
        data: { title: 'Test' },
        returning: true,
      });

      expect(result.query).toContain('RETURNING *');
    });

    test('should handle numeric values', async () => {
      const result = await executor.execute('build-insert-query', {
        table: 'products',
        data: { name: 'Widget', price: 19.99, stock: 100 },
      });

      expect(result.query).toContain("VALUES ('Widget', 19.99, 100)");
    });

    test('should return error for missing table', async () => {
      const result = await executor.execute('build-insert-query', {
        data: { title: 'Test' },
      });

      expect(result).toEqual({ error: 'Table name is required' });
    });

    test('should return error for missing data', async () => {
      const result = await executor.execute('build-insert-query', {
        table: 'posts',
      });

      expect(result).toEqual({ error: 'Data object is required' });
    });
  });

  describeIntegration('build-update-query', () => {
    test('should build UPDATE query', async () => {
      const result = await executor.execute('build-update-query', {
        table: 'posts',
        data: { title: 'Updated Title' },
        where: { id: '123' },
      });

      expect(result.query).toContain('UPDATE posts SET');
      expect(result.query).toContain("title = 'Updated Title'");
      expect(result.query).toContain("WHERE id = '123'");
      expect(result.requiresRLS).toBe(true);
    });

    test('should build UPDATE with multiple SET clauses', async () => {
      const result = await executor.execute('build-update-query', {
        table: 'posts',
        data: { title: 'New Title', published: true },
        where: { id: '123' },
      });

      expect(result.query).toContain("title = 'New Title'");
      expect(result.query).toContain('published = true');
    });

    test('should build UPDATE with multiple WHERE clauses', async () => {
      const result = await executor.execute('build-update-query', {
        table: 'posts',
        data: { views: 100 },
        where: { user_id: 'abc', published: true },
      });

      expect(result.query).toContain("user_id = 'abc'");
      expect(result.query).toContain('published = true');
    });

    test('should build UPDATE with RETURNING', async () => {
      const result = await executor.execute('build-update-query', {
        table: 'posts',
        data: { title: 'Updated' },
        where: { id: '123' },
        returning: 'id, title',
      });

      expect(result.query).toContain('RETURNING id, title');
    });

    test('should build UPDATE with RETURNING *', async () => {
      const result = await executor.execute('build-update-query', {
        table: 'posts',
        data: { title: 'Updated' },
        where: { id: '123' },
        returning: true,
      });

      expect(result.query).toContain('RETURNING *');
    });

    test('should return error for missing table', async () => {
      const result = await executor.execute('build-update-query', {
        data: { title: 'Test' },
        where: { id: '123' },
      });

      expect(result).toEqual({ error: 'Table name is required' });
    });

    test('should return error for missing data', async () => {
      const result = await executor.execute('build-update-query', {
        table: 'posts',
        where: { id: '123' },
      });

      expect(result).toEqual({ error: 'Data object is required' });
    });

    test('should return error for missing where', async () => {
      const result = await executor.execute('build-update-query', {
        table: 'posts',
        data: { title: 'Test' },
      });

      expect(result).toEqual({ error: 'WHERE condition is required for UPDATE' });
    });
  });

  describeIntegration('validate-rls-policy', () => {
    test('should validate complete policy', async () => {
      const result = await executor.execute('validate-rls-policy', {
        policy: {
          name: 'user_posts_policy',
          using: 'auth.uid() = user_id',
          withCheck: 'auth.uid() = user_id',
        },
        table: 'posts',
        operation: 'ALL',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate SELECT policy without WITH CHECK', async () => {
      const result = await executor.execute('validate-rls-policy', {
        policy: {
          name: 'read_policy',
          using: 'auth.uid() IS NOT NULL',
        },
        table: 'posts',
        operation: 'SELECT',
      });

      expect(result.valid).toBe(true);
    });

    test('should fail without policy object', async () => {
      const result = await executor.execute('validate-rls-policy', {
        table: 'posts',
        operation: 'SELECT',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Policy object is required');
    });

    test('should fail without policy name', async () => {
      const result = await executor.execute('validate-rls-policy', {
        policy: { using: 'true' },
        table: 'posts',
        operation: 'SELECT',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Policy name is required');
    });

    test('should fail without table', async () => {
      const result = await executor.execute('validate-rls-policy', {
        policy: { name: 'test_policy' },
        operation: 'SELECT',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Table name is required');
    });

    test('should fail without operation', async () => {
      const result = await executor.execute('validate-rls-policy', {
        policy: { name: 'test_policy' },
        table: 'posts',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Operation is required (SELECT, INSERT, UPDATE, DELETE, ALL)');
    });

    test('should fail with invalid operation', async () => {
      const result = await executor.execute('validate-rls-policy', {
        policy: { name: 'test_policy' },
        table: 'posts',
        operation: 'INVALID',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Operation must be one of: SELECT, INSERT, UPDATE, DELETE, ALL');
    });

    test('should require USING for SELECT operation', async () => {
      const result = await executor.execute('validate-rls-policy', {
        policy: { name: 'test_policy' },
        table: 'posts',
        operation: 'SELECT',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('USING clause is required for this operation');
    });

    test('should recommend WITH CHECK for INSERT', async () => {
      const result = await executor.execute('validate-rls-policy', {
        policy: {
          name: 'insert_policy',
          using: 'auth.uid() IS NOT NULL',
        },
        table: 'posts',
        operation: 'INSERT',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('WITH CHECK clause recommended for this operation');
    });
  });

  describeIntegration('format-realtime-subscription', () => {
    test('should format basic subscription', async () => {
      const result = await executor.execute('format-realtime-subscription', {
        table: 'posts',
      });

      expect(result.channel).toBe('public:posts');
      expect(result.config).toEqual({
        event: 'INSERT,UPDATE,DELETE',
        schema: 'public',
        table: 'posts',
      });
      expect(result.example).toContain('.channel(');
    });

    test('should format subscription with specific event', async () => {
      const result = await executor.execute('format-realtime-subscription', {
        table: 'posts',
        event: 'INSERT',
      });

      expect(result.config.event).toBe('INSERT');
    });

    test('should format subscription with multiple events', async () => {
      const result = await executor.execute('format-realtime-subscription', {
        table: 'posts',
        event: ['INSERT', 'UPDATE'],
      });

      expect(result.config.event).toBe('INSERT,UPDATE');
    });

    test('should format subscription with custom schema', async () => {
      const result = await executor.execute('format-realtime-subscription', {
        table: 'posts',
        schema: 'private',
      });

      expect(result.channel).toBe('private:posts');
      expect(result.config.schema).toBe('private');
    });

    test('should format subscription with filter', async () => {
      const result = await executor.execute('format-realtime-subscription', {
        table: 'posts',
        filter: 'user_id=eq.123',
      });

      expect(result.config.filter).toBe('user_id=eq.123');
    });

    test('should return error for missing table', async () => {
      const result = await executor.execute('format-realtime-subscription', {});

      expect(result).toEqual({ error: 'Table name is required' });
    });
  });

  describeIntegration('validate-table-permissions', () => {
    test('should validate secure table', async () => {
      const result = await executor.execute('validate-table-permissions', {
        table: 'posts',
        hasRLS: true,
        policies: [
          { name: 'user_policy', using: 'auth.uid() = user_id' },
        ],
      });

      expect(result.rlsEnabled).toBe(true);
      expect(result.isSecure).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    test('should warn about disabled RLS', async () => {
      const result = await executor.execute('validate-table-permissions', {
        table: 'posts',
        hasRLS: false,
      });

      expect(result.rlsEnabled).toBe(false);
      expect(result.isSecure).toBe(false);
      expect(result.warnings).toContain('RLS is disabled - table data is publicly accessible');
      expect(result.recommendations).toContain('Enable RLS with: ALTER TABLE posts ENABLE ROW LEVEL SECURITY');
    });

    test('should warn about RLS without policies', async () => {
      const result = await executor.execute('validate-table-permissions', {
        table: 'posts',
        hasRLS: true,
        policies: [],
      });

      expect(result.rlsEnabled).toBe(true);
      expect(result.isSecure).toBe(false);
      expect(result.warnings).toContain('RLS is enabled but no policies exist - table is inaccessible');
    });

    test('should warn about overly permissive policy (true)', async () => {
      const result = await executor.execute('validate-table-permissions', {
        table: 'posts',
        hasRLS: true,
        policies: [
          { name: 'all_access', using: 'true' },
        ],
      });

      expect(result.warnings).toContain("Policy 'all_access' allows access to all rows");
    });

    test('should warn about overly permissive policy (true in parens)', async () => {
      const result = await executor.execute('validate-table-permissions', {
        table: 'posts',
        hasRLS: true,
        policies: [
          { name: 'all_access', using: '(true)' },
        ],
      });

      expect(result.warnings).toContain("Policy 'all_access' allows access to all rows");
    });

    test('should warn about ALL operation without restrictions', async () => {
      const result = await executor.execute('validate-table-permissions', {
        table: 'posts',
        hasRLS: true,
        policies: [
          { name: 'unrestricted', operation: 'ALL', using: 'true' },
        ],
      });

      expect(result.warnings).toContain("Policy 'unrestricted' allows all operations without restrictions");
    });

    test('should return error for missing table', async () => {
      const result = await executor.execute('validate-table-permissions', {});

      expect(result).toEqual({ error: 'Table name is required' });
    });
  });

  describeIntegration('parse-postgres-error', () => {
    test('should parse unique constraint violation', async () => {
      const result = await executor.execute('parse-postgres-error', {
        error: {
          message: 'duplicate key value violates unique constraint',
          code: '23505',
        },
      });

      expect(result.message).toBe('duplicate key value violates unique constraint');
      expect(result.code).toBe('23505');
      expect(result.hint).toBe('Unique constraint violation');
    });

    test('should parse foreign key violation', async () => {
      const result = await executor.execute('parse-postgres-error', {
        error: { code: '23503' },
      });

      expect(result.hint).toBe('Foreign key constraint violation');
    });

    test('should parse not null violation', async () => {
      const result = await executor.execute('parse-postgres-error', {
        error: { code: '23502' },
      });

      expect(result.hint).toBe('Not null constraint violation');
    });

    test('should parse table not found', async () => {
      const result = await executor.execute('parse-postgres-error', {
        error: { code: '42P01' },
      });

      expect(result.hint).toBe('Table does not exist');
    });

    test('should parse column not found', async () => {
      const result = await executor.execute('parse-postgres-error', {
        error: { code: '42703' },
      });

      expect(result.hint).toBe('Column does not exist');
    });

    test('should parse permission denied with RLS hint', async () => {
      const result = await executor.execute('parse-postgres-error', {
        error: { code: '42501' },
      });

      expect(result.hint).toBe('Permission denied - check RLS policies and user authentication');
      expect(result.rlsHint).toBe('Ensure user is authenticated and RLS policy allows this operation');
    });

    test('should detect permission denied in message', async () => {
      const result = await executor.execute('parse-postgres-error', {
        error: {
          message: 'permission denied for table posts',
          code: '42501',
        },
      });

      expect(result.rlsHint).toBe('Ensure user is authenticated and RLS policy allows this operation');
    });

    test('should include query context', async () => {
      const query = 'SELECT * FROM posts WHERE user_id = $1';
      const result = await executor.execute('parse-postgres-error', {
        error: { message: 'Error occurred' },
        query: query,
      });

      expect(result.context).toContain('Query:');
      expect(result.context).toContain('SELECT * FROM posts');
    });

    test('should truncate long queries', async () => {
      const longQuery = 'SELECT * FROM table WHERE ' + 'x = 1 AND '.repeat(50);
      const result = await executor.execute('parse-postgres-error', {
        error: { message: 'Error' },
        query: longQuery,
      });

      expect(result.context.length).toBeLessThan(150);
      expect(result.context).toContain('...');
    });

    test('should return null for missing error', async () => {
      const result = await executor.execute('parse-postgres-error', {});

      expect(result).toBeNull();
    });
  });

  describeIntegration('generate-migration-name', () => {
    test('should generate migration name with timestamp', async () => {
      const result = await executor.execute('generate-migration-name', {
        description: 'add user authentication',
      });

      expect(result.name).toMatch(/^\d{14}_add_user_authentication$/);
      expect(result.timestamp).toMatch(/^\d{14}$/);
      expect(result.description).toBe('add_user_authentication');
    });

    test('should convert to snake_case', async () => {
      const result = await executor.execute('generate-migration-name', {
        description: 'Create Users Table',
      });

      expect(result.description).toBe('create_users_table');
      expect(result.name).toContain('create_users_table');
    });

    test('should remove special characters', async () => {
      const result = await executor.execute('generate-migration-name', {
        description: 'add user@email & phone#',
      });

      expect(result.description).toBe('add_user_email_phone');
    });

    test('should handle multiple spaces', async () => {
      const result = await executor.execute('generate-migration-name', {
        description: 'add    multiple    spaces',
      });

      expect(result.description).toBe('add_multiple_spaces');
    });

    test('should trim leading/trailing underscores', async () => {
      const result = await executor.execute('generate-migration-name', {
        description: '__test__',
      });

      expect(result.description).toBe('test');
    });

    test('should include example usage', async () => {
      const result = await executor.execute('generate-migration-name', {
        description: 'test migration',
      });

      expect(result.example).toContain('apply_migration');
      expect(result.example).toContain(result.name);
    });

    test('should return error for missing description', async () => {
      const result = await executor.execute('generate-migration-name', {});

      expect(result).toEqual({ error: 'Description is required' });
    });
  });

  describeIntegration('Helper Performance', () => {
    test('helper execution should complete in <100ms (target from Story 5.1)', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await executor.execute('build-select-query', {
          table: 'posts',
          columns: ['id', 'title'],
          where: { published: true },
          orderBy: 'created_at DESC',
          limit: 10,
        });
        const duration = Date.now() - start;
        durations.push(duration);
      }

      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      console.log(`\nSupabase Helper Performance: avg=${avgDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms`);

      expect(avgDuration).toBeLessThan(100);
    });
  });
});
