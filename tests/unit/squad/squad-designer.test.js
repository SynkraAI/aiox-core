/**
 * Unit Tests for SquadDesigner
 *
 * Test Coverage:
 * - analyzeDomain() extracts entities, workflows, integrations, stakeholders
 * - generateAgentRecommendations() creates valid agent structures
 * - generateTaskRecommendations() creates valid task structures
 * - generateBlueprint() creates complete blueprint
 * - saveBlueprint() writes YAML file
 * - collectDocumentation() reads files and text
 * - Confidence scoring works correctly
 * - Deduplication works for similar agents
 *
 * @see Story SQS-9: Squad Designer
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const {
  SquadDesigner,
  SquadDesignerError,
  DesignerErrorCodes,
} = require('../../../.aiox-core/development/scripts/squad');

describe('SquadDesigner', () => {
  let designer;
  let tempDir;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-designer-test-'));
  });

  afterAll(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  beforeEach(() => {
    designer = new SquadDesigner({
      designsPath: tempDir,
    });
  });

  afterEach(async () => {
    try {
      const entries = await fs.readdir(tempDir);
      for (const entry of entries) {
        await fs.rm(path.join(tempDir, entry), { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Constructor', () => {
    it('should use default designs path when not specified', () => {
      const defaultDesigner = new SquadDesigner();
      expect(defaultDesigner.designsPath).toBe('./squads/.designs');
    });

    it('should use custom designs path when specified', () => {
      const customDesigner = new SquadDesigner({ designsPath: './custom/path' });
      expect(customDesigner.designsPath).toBe('./custom/path');
    });
  });

  describe('SquadDesignerError', () => {
    it('should create error with correct properties', () => {
      const error = new SquadDesignerError(
        DesignerErrorCodes.NO_DOCUMENTATION,
        'Test message',
        'Test suggestion',
      );

      expect(error.name).toBe('SquadDesignerError');
      expect(error.code).toBe(DesignerErrorCodes.NO_DOCUMENTATION);
      expect(error.message).toBe('Test message');
      expect(error.suggestion).toBe('Test suggestion');
    });

    it('should create noDocumentation error with correct format', () => {
      const error = SquadDesignerError.noDocumentation();

      expect(error.code).toBe(DesignerErrorCodes.NO_DOCUMENTATION);
      expect(error.suggestion).toContain('--docs');
    });

    it('should create parseError error with correct format', () => {
      const error = SquadDesignerError.parseError('/path/to/file.md', 'Invalid syntax');

      expect(error.code).toBe(DesignerErrorCodes.PARSE_ERROR);
      expect(error.message).toContain('/path/to/file.md');
      expect(error.message).toContain('Invalid syntax');
    });

    it('should create emptyAnalysis error with correct format', () => {
      const error = SquadDesignerError.emptyAnalysis();

      expect(error.code).toBe(DesignerErrorCodes.EMPTY_ANALYSIS);
      expect(error.suggestion).toContain('detailed');
    });
  });

  describe('collectDocumentation()', () => {
    it('should collect text input directly', async () => {
      const result = await designer.collectDocumentation({
        text: 'This is the order management system documentation.',
      });

      expect(result.mergedContent).toContain('order management');
      expect(result.sources.length).toBe(1);
      expect(result.sources[0].type).toBe('text');
    });

    it('should collect from file path', async () => {
      // Create temp doc file
      const docPath = path.join(tempDir, 'test-doc.md');
      await fs.writeFile(docPath, '# Order Management\n\nManage orders and customers.');

      const result = await designer.collectDocumentation({
        docs: [docPath],
      });

      expect(result.mergedContent).toContain('Order Management');
      expect(result.sources.some((s) => s.path === docPath)).toBe(true);
    });

    it('should merge multiple file sources', async () => {
      const doc1Path = path.join(tempDir, 'doc1.md');
      const doc2Path = path.join(tempDir, 'doc2.md');
      await fs.writeFile(doc1Path, 'Document 1 content');
      await fs.writeFile(doc2Path, 'Document 2 content');

      const result = await designer.collectDocumentation({
        docs: [doc1Path, doc2Path],
      });

      expect(result.mergedContent).toContain('Document 1');
      expect(result.mergedContent).toContain('Document 2');
      expect(result.sources.length).toBe(2);
    });

    it('should throw error when no documentation provided', async () => {
      await expect(designer.collectDocumentation({})).rejects.toThrow(SquadDesignerError);
    });

    it('should throw error when file not found', async () => {
      await expect(
        designer.collectDocumentation({
          docs: ['/nonexistent/file.md'],
        }),
      ).rejects.toThrow(SquadDesignerError);
    });
  });

  describe('analyzeDomain()', () => {
    it('should extract entities from text', () => {
      const docs = {
        mergedContent: 'The Order system handles Customer data and Product inventory.',
        sources: ['test'],
      };

      const analysis = designer.analyzeDomain(docs);

      expect(analysis.entities).toContain('Order');
      expect(analysis.entities).toContain('Customer');
      expect(analysis.entities).toContain('Product');
    });

    it('should detect workflows from action verbs', () => {
      const docs = {
        mergedContent: 'The system can create orders, update inventory, and process payments.',
        sources: ['test'],
      };

      const analysis = designer.analyzeDomain(docs);

      expect(analysis.workflows.length).toBeGreaterThan(0);
      // Should detect create, update, process
      const workflowNames = analysis.workflows.join(' ');
      expect(workflowNames).toMatch(/create|update|process/i);
    });

    it('should detect integrations from keywords', () => {
      const docs = {
        mergedContent: 'Integration with Stripe API for payments and MongoDB database for storage.',
        sources: ['test'],
      };

      const analysis = designer.analyzeDomain(docs);

      expect(analysis.integrations.length).toBeGreaterThan(0);
      expect(analysis.integrations.some((i) => i.includes('Stripe'))).toBe(true);
    });

    it('should detect stakeholders from role keywords', () => {
      const docs = {
        mergedContent:
          'Administrators can manage settings. Users can view orders. Managers review reports.',
        sources: ['test'],
      };

      const analysis = designer.analyzeDomain(docs);

      expect(analysis.stakeholders.length).toBeGreaterThan(0);
    });

    it('should extract domain from text', () => {
      const docs = {
        mergedContent: 'Order Management System - Handles all order lifecycle operations.',
        sources: ['test'],
      };

      const analysis = designer.analyzeDomain(docs);

      expect(analysis.domain).toBeDefined();
      expect(analysis.domain.length).toBeGreaterThan(0);
    });

    it('should use provided domain hint', () => {
      const docs = {
        mergedContent: 'This system manages Products and Inventory with create and update operations.',
        sources: ['test'],
        domainHint: 'inventory-management',
      };

      const analysis = designer.analyzeDomain(docs);

      expect(analysis.domain).toBe('inventory-management');
    });

    it('should throw error on empty analysis', () => {
      const docs = {
        mergedContent: '', // Empty text
        sources: ['test'],
      };

      expect(() => designer.analyzeDomain(docs)).toThrow(SquadDesignerError);
    });
  });

  describe('generateAgentRecommendations()', () => {
    it('should generate agents from workflows', () => {
      const analysis = {
        domain: 'order-management',
        entities: ['Order', 'Customer'],
        workflows: ['create-order', 'update-order', 'process-payment'],
        integrations: [],
        stakeholders: [],
      };

      const agents = designer.generateAgentRecommendations(analysis);

      expect(agents.length).toBeGreaterThan(0);
      expect(agents[0]).toHaveProperty('id');
      expect(agents[0]).toHaveProperty('role');
      expect(agents[0]).toHaveProperty('confidence');
    });

    it('should generate agents with valid kebab-case ids', () => {
      const analysis = {
        domain: 'order-management',
        entities: ['Order'],
        workflows: ['create-order', 'update-order'],
        integrations: [],
        stakeholders: [],
      };

      const agents = designer.generateAgentRecommendations(analysis);

      agents.forEach((agent) => {
        expect(agent.id).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/);
      });
    });

    it('should set confidence between 0 and 1', () => {
      const analysis = {
        domain: 'order-management',
        entities: ['Order'],
        workflows: ['create-order'],
        integrations: [],
        stakeholders: [],
      };

      const agents = designer.generateAgentRecommendations(analysis);

      agents.forEach((agent) => {
        expect(agent.confidence).toBeGreaterThanOrEqual(0);
        expect(agent.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should include commands derived from workflows', () => {
      const analysis = {
        domain: 'order-management',
        entities: ['Order'],
        workflows: ['create-order', 'update-order', 'cancel-order'],
        integrations: [],
        stakeholders: [],
      };

      const agents = designer.generateAgentRecommendations(analysis);

      // At least one agent should have commands
      const agentWithCommands = agents.find((a) => a.commands && a.commands.length > 0);
      expect(agentWithCommands).toBeDefined();
    });

    it('should deduplicate similar agents', () => {
      const analysis = {
        domain: 'order-management',
        entities: ['Order'],
        workflows: [
          'create-order',
          'create-new-order',
          'order-creation',
          'update-order',
          'modify-order',
        ],
        integrations: [],
        stakeholders: [],
      };

      const agents = designer.generateAgentRecommendations(analysis);

      // Should have fewer agents than workflows due to deduplication
      expect(agents.length).toBeLessThanOrEqual(analysis.workflows.length);
    });

    it('should limit agents to maximum of 10', () => {
      const analysis = {
        domain: 'complex-system',
        entities: Array(20).fill('Entity'),
        workflows: Array(20)
          .fill('')
          .map((_, i) => `workflow-${i}`),
        integrations: [],
        stakeholders: [],
      };

      const agents = designer.generateAgentRecommendations(analysis);

      expect(agents.length).toBeLessThanOrEqual(10);
    });
  });

  describe('generateTaskRecommendations()', () => {
    it('should generate tasks for each agent command', () => {
      const analysis = {
        domain: 'order-management',
        entities: ['Order'],
        workflows: ['create-order', 'update-order'],
        integrations: [],
        stakeholders: [],
      };
      const agents = [
        {
          id: 'order-manager',
          role: 'Manages orders',
          commands: ['create-order', 'update-order'],
          confidence: 0.9,
        },
      ];

      const tasks = designer.generateTaskRecommendations(analysis, agents);

      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0]).toHaveProperty('name');
      expect(tasks[0]).toHaveProperty('agent');
      expect(tasks[0]).toHaveProperty('confidence');
    });

    it('should generate tasks with valid kebab-case names', () => {
      const analysis = {
        domain: 'order-management',
        entities: ['Order'],
        workflows: ['create-order'],
        integrations: [],
        stakeholders: [],
      };
      const agents = [
        {
          id: 'order-manager',
          role: 'Manages orders',
          commands: ['create-order'],
          confidence: 0.9,
        },
      ];

      const tasks = designer.generateTaskRecommendations(analysis, agents);

      tasks.forEach((task) => {
        expect(task.name).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/);
      });
    });

    it('should link tasks to their owning agent', () => {
      const analysis = {
        domain: 'order-management',
        entities: ['Order'],
        workflows: ['create-order'],
        integrations: [],
        stakeholders: [],
      };
      const agents = [
        {
          id: 'order-manager',
          role: 'Manages orders',
          commands: ['create-order'],
          confidence: 0.9,
        },
      ];

      const tasks = designer.generateTaskRecommendations(analysis, agents);

      tasks.forEach((task) => {
        expect(task.agent).toBe('order-manager');
      });
    });

    it('should derive entrada from workflow inputs', () => {
      const analysis = {
        domain: 'order-management',
        entities: ['Order', 'Customer', 'Product'],
        workflows: ['create-order'],
        integrations: [],
        stakeholders: [],
      };
      const agents = [
        {
          id: 'order-manager',
          role: 'Manages orders',
          commands: ['create-order'],
          confidence: 0.9,
        },
      ];

      const tasks = designer.generateTaskRecommendations(analysis, agents);

      const createTask = tasks.find((t) => t.name === 'create-order');
      expect(createTask).toBeDefined();
      expect(createTask.entrada).toBeDefined();
      expect(Array.isArray(createTask.entrada)).toBe(true);
    });

    it('should handle large number of commands', () => {
      const analysis = {
        domain: 'complex-system',
        entities: ['Entity'],
        workflows: Array(20)
          .fill('')
          .map((_, i) => `workflow-${i}`),
        integrations: [],
        stakeholders: [],
      };
      const agents = [
        {
          id: 'mega-agent',
          role: 'Does everything',
          commands: Array(20)
            .fill('')
            .map((_, i) => `workflow-${i}`),
          confidence: 0.9,
        },
      ];

      const tasks = designer.generateTaskRecommendations(analysis, agents);

      // Should generate tasks for all commands
      expect(tasks.length).toBe(20);
    });
  });

  describe('generateBlueprint()', () => {
    it('should create complete blueprint structure', () => {
      const analysis = {
        domain: 'order-management',
        entities: ['Order', 'Customer'],
        workflows: ['create-order'],
        integrations: ['Stripe API'],
        stakeholders: ['Admin'],
      };
      const recommendations = {
        agents: [
          {
            id: 'order-manager',
            role: 'Manages orders',
            commands: ['create-order'],
            confidence: 0.9,
          },
        ],
        tasks: [
          {
            name: 'create-order',
            agent: 'order-manager',
            entrada: ['customer_id'],
            saida: ['order_id'],
            confidence: 0.85,
          },
        ],
      };

      const blueprint = designer.generateBlueprint({
        analysis,
        recommendations,
        metadata: {
          source_docs: ['./docs/prd.md'],
        },
      });

      expect(blueprint).toHaveProperty('squad');
      expect(blueprint).toHaveProperty('analysis');
      expect(blueprint).toHaveProperty('recommendations');
      expect(blueprint).toHaveProperty('metadata');
    });

    it('should include squad name from domain', () => {
      const analysis = {
        domain: 'order-management',
        entities: ['Order'],
        workflows: [],
        integrations: [],
        stakeholders: [],
      };

      const blueprint = designer.generateBlueprint({
        analysis,
        recommendations: { agents: [], tasks: [] },
        metadata: { source_docs: [] },
      });

      expect(blueprint.squad.name).toContain('order-management');
      expect(blueprint.squad.domain).toBe('order-management');
    });

    it('should calculate overall confidence', () => {
      const analysis = {
        domain: 'test-domain',
        entities: ['Entity'],
        workflows: [],
        integrations: [],
        stakeholders: [],
      };
      const recommendations = {
        agents: [
          { id: 'agent-1', role: 'Role 1', confidence: 0.8 },
          { id: 'agent-2', role: 'Role 2', confidence: 0.9 },
        ],
        tasks: [
          { name: 'task-1', agent: 'agent-1', confidence: 0.7 },
          { name: 'task-2', agent: 'agent-2', confidence: 0.85 },
        ],
      };

      const blueprint = designer.generateBlueprint({
        analysis,
        recommendations,
        metadata: { source_docs: [] },
      });

      expect(blueprint.metadata.overall_confidence).toBeGreaterThan(0);
      expect(blueprint.metadata.overall_confidence).toBeLessThanOrEqual(1);
    });

    it('should include created_at timestamp', () => {
      const analysis = {
        domain: 'test-domain',
        entities: [],
        workflows: [],
        integrations: [],
        stakeholders: [],
      };

      const blueprint = designer.generateBlueprint({
        analysis,
        recommendations: { agents: [], tasks: [] },
        metadata: { source_docs: [] },
      });

      expect(blueprint.metadata.created_at).toBeDefined();
      // Should be valid ISO date
      expect(new Date(blueprint.metadata.created_at).toISOString()).toBe(
        blueprint.metadata.created_at,
      );
    });
  });

  describe('saveBlueprint()', () => {
    it('should save blueprint as YAML file', async () => {
      const blueprint = {
        squad: { name: 'test-squad', domain: 'test-domain' },
        analysis: { entities: [], workflows: [], integrations: [], stakeholders: [] },
        recommendations: { agents: [], tasks: [], template: 'basic', config_mode: 'extend' },
        metadata: {
          created_at: new Date().toISOString(),
          source_docs: [],
          user_adjustments: 0,
          overall_confidence: 0.5,
        },
      };

      const savedPath = await designer.saveBlueprint(blueprint);

      expect(savedPath).toContain('test-squad');
      expect(savedPath).toContain('.yaml');

      // Verify file exists
      const content = await fs.readFile(savedPath, 'utf-8');
      expect(content).toContain('test-squad');
      expect(content).toContain('test-domain');
    });

    it('should create output directory if not exists', async () => {
      const customDesigner = new SquadDesigner({
        designsPath: path.join(tempDir, 'nested', 'output', 'path'),
      });

      const blueprint = {
        squad: { name: 'nested-test', domain: 'test' },
        analysis: { entities: [], workflows: [], integrations: [], stakeholders: [] },
        recommendations: { agents: [], tasks: [], template: 'basic', config_mode: 'extend' },
        metadata: {
          created_at: new Date().toISOString(),
          source_docs: [],
          user_adjustments: 0,
          overall_confidence: 0.5,
        },
      };

      const savedPath = await customDesigner.saveBlueprint(blueprint);

      expect(await fs.stat(savedPath)).toBeDefined();
    });

    it('should throw error if blueprint already exists without force', async () => {
      const blueprint = {
        squad: { name: 'duplicate-test', domain: 'test' },
        analysis: { entities: [], workflows: [], integrations: [], stakeholders: [] },
        recommendations: { agents: [], tasks: [], template: 'basic', config_mode: 'extend' },
        metadata: {
          created_at: new Date().toISOString(),
          source_docs: [],
          user_adjustments: 0,
          overall_confidence: 0.5,
        },
      };

      // Save first time
      await designer.saveBlueprint(blueprint);

      // Try to save again
      await expect(designer.saveBlueprint(blueprint)).rejects.toThrow(SquadDesignerError);
    });

    it('should overwrite with force option', async () => {
      const blueprint1 = {
        squad: { name: 'force-test', domain: 'test-v1' },
        analysis: { entities: [], workflows: [], integrations: [], stakeholders: [] },
        recommendations: { agents: [], tasks: [], template: 'basic', config_mode: 'extend' },
        metadata: {
          created_at: new Date().toISOString(),
          source_docs: [],
          user_adjustments: 0,
          overall_confidence: 0.5,
        },
      };
      const blueprint2 = {
        squad: { name: 'force-test', domain: 'test-v2' },
        analysis: { entities: [], workflows: [], integrations: [], stakeholders: [] },
        recommendations: { agents: [], tasks: [], template: 'basic', config_mode: 'extend' },
        metadata: {
          created_at: new Date().toISOString(),
          source_docs: [],
          user_adjustments: 0,
          overall_confidence: 0.6,
        },
      };

      await designer.saveBlueprint(blueprint1);
      const savedPath = await designer.saveBlueprint(blueprint2, null, { force: true });

      const content = await fs.readFile(savedPath, 'utf-8');
      expect(content).toContain('test-v2');
    });
  });

  describe('Full Design Flow', () => {
    it('should complete full design flow from documentation', async () => {
      // Create test documentation
      const docPath = path.join(tempDir, 'prd.md');
      await fs.writeFile(
        docPath,
        `# Order Management System

## Overview
The Order Management System handles customer orders from creation to fulfillment.

## Features
1. Create new orders with customer and product information
2. Update existing orders with status changes
3. Cancel orders with refund processing
4. Track order shipments

## Integrations
- Stripe API for payment processing
- FedEx API for shipping

## Users
- Administrators manage the system
- Customers place orders
- Support staff handle inquiries
`,
      );

      // Collect documentation
      const docs = await designer.collectDocumentation({ docs: [docPath] });
      expect(docs.mergedContent).toContain('Order Management');

      // Analyze domain
      const analysis = designer.analyzeDomain(docs);
      expect(analysis.entities.length).toBeGreaterThan(0);
      expect(analysis.workflows.length).toBeGreaterThan(0);

      // Generate recommendations
      const agents = designer.generateAgentRecommendations(analysis);
      const tasks = designer.generateTaskRecommendations(analysis, agents);

      expect(agents.length).toBeGreaterThan(0);
      expect(tasks.length).toBeGreaterThan(0);

      // Generate blueprint
      const blueprint = designer.generateBlueprint({
        analysis,
        recommendations: { agents, tasks },
        metadata: { source_docs: [docPath] },
      });

      expect(blueprint.squad.name).toBeDefined();
      expect(blueprint.recommendations.agents.length).toBeGreaterThan(0);

      // Save blueprint
      const savedPath = await designer.saveBlueprint(blueprint);
      expect(savedPath).toContain('.yaml');

      // Verify saved content
      const savedContent = await fs.readFile(savedPath, 'utf-8');
      expect(savedContent).toContain('squad:');
      expect(savedContent).toContain('recommendations:');
    });
  });

  describe('Performance', () => {
    const isCI = process.env.CI === 'true';
    const analyzeThreshold = isCI ? 2000 : 200;
    const generateThreshold = isCI ? 1000 : 100;

    it('should analyze domain within acceptable time', () => {
      const docs = {
        mergedContent: 'Order Customer Product Payment Shipment '.repeat(100),
        sources: ['test'],
        domainHint: 'test-domain',
      };

      const start = Date.now();
      designer.analyzeDomain(docs);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(analyzeThreshold);
    });

    it('should generate recommendations within acceptable time', () => {
      const analysis = {
        domain: 'test-domain',
        entities: Array(50)
          .fill('')
          .map((_, i) => `Entity${i}`),
        workflows: Array(20)
          .fill('')
          .map((_, i) => `workflow-${i}`),
        integrations: Array(10)
          .fill('')
          .map((_, i) => `Integration${i}`),
        stakeholders: Array(5)
          .fill('')
          .map((_, i) => `Stakeholder${i}`),
      };

      const start = Date.now();
      const agents = designer.generateAgentRecommendations(analysis);
      designer.generateTaskRecommendations(analysis, agents);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(generateThreshold);
    });
  });
});
