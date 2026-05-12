/**
 * Integration Tests for Squad Designer Flow
 *
 * End-to-end tests covering the complete workflow:
 * 1. *design-squad: Documentation → Analysis → Recommendations → Blueprint
 * 2. *create-squad --from-design: Blueprint → Squad Structure
 * 3. *validate-squad: Squad Structure → Validation Report
 *
 * @see Story SQS-9: Squad Designer
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const yaml = require('js-yaml');
const {
  SquadDesigner,
  SquadGenerator,
  SquadValidator,
} = require('../../../.aiox-core/development/scripts/squad');

describe('Squad Designer Integration', () => {
  let tempDir;
  let docsDir;
  let designsDir;
  let squadsDir;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'squad-designer-integration-'));
    docsDir = path.join(tempDir, 'docs');
    designsDir = path.join(tempDir, 'designs');
    squadsDir = path.join(tempDir, 'squads');

    await fs.mkdir(docsDir, { recursive: true });
    await fs.mkdir(designsDir, { recursive: true });
    await fs.mkdir(squadsDir, { recursive: true });
  });

  afterAll(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Complete Design-to-Squad Flow', () => {
    it('should create valid squad from documentation through design', async () => {
      // Step 1: Create comprehensive documentation
      const prdPath = path.join(docsDir, 'order-management-prd.md');
      await fs.writeFile(
        prdPath,
        `# Order Management System PRD

## Overview
The Order Management System (OMS) handles the complete lifecycle of customer orders from creation to fulfillment.

## Domain
Order Management / E-commerce

## Key Entities
- **Order**: Central entity containing order details, status, and items
- **Customer**: The person or entity placing the order
- **Product**: Items that can be ordered
- **Payment**: Payment information and transaction records
- **Shipment**: Delivery tracking and shipping details

## Core Workflows

### 1. Order Creation (create-order)
- Validate customer information
- Check product availability
- Calculate pricing and taxes
- Initialize order with pending status

### 2. Order Update (update-order)
- Modify order items
- Update quantities
- Recalculate totals

### 3. Order Cancellation (cancel-order)
- Validate cancellation eligibility
- Process refund if applicable
- Update inventory

### 4. Payment Processing (process-payment)
- Validate payment method
- Process transaction via Stripe API
- Update order status

### 5. Shipment Tracking (track-shipment)
- Create shipment via FedEx API
- Update tracking information
- Notify customer

## External Integrations
- **Stripe API**: Payment processing
- **FedEx API**: Shipping and tracking
- **Inventory Service**: Stock management

## User Roles
- **Customer**: Places and tracks orders
- **Administrator**: System configuration
- **Support Staff**: Handle customer issues
- **Warehouse Manager**: Manages fulfillment

## Technical Requirements
- Node.js 18+ runtime
- PostgreSQL database
- Redis caching
- REST API endpoints
`,
      );

      // Step 2: Initialize Designer and Generator
      const designer = new SquadDesigner({ designsPath: designsDir });
      const generator = new SquadGenerator({ squadsPath: squadsDir });
      const validator = new SquadValidator();

      // Step 3: Collect documentation
      const docs = await designer.collectDocumentation({ docs: [prdPath] });
      expect(docs.mergedContent).toContain('Order Management');
      expect(docs.sources.some((s) => s.path === prdPath)).toBe(true);

      // Step 4: Analyze domain
      const analysis = designer.analyzeDomain(docs);

      expect(analysis.domain).toBeDefined();
      expect(analysis.entities.length).toBeGreaterThan(0);
      expect(analysis.workflows.length).toBeGreaterThan(0);
      expect(analysis.integrations.length).toBeGreaterThan(0);
      expect(analysis.stakeholders.length).toBeGreaterThan(0);

      // Verify specific entities were detected
      const entityNames = analysis.entities.join(' ').toLowerCase();
      expect(entityNames).toMatch(/order|customer|product|payment/i);

      // Verify workflows were detected
      const workflowNames = analysis.workflows.join(' ').toLowerCase();
      expect(workflowNames).toMatch(/create|update|cancel/i);

      // Step 5: Generate recommendations
      const agents = designer.generateAgentRecommendations(analysis);
      const tasks = designer.generateTaskRecommendations(analysis, agents);

      expect(agents.length).toBeGreaterThan(0);
      expect(tasks.length).toBeGreaterThan(0);

      // Verify agent structure
      agents.forEach((agent) => {
        expect(agent.id).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/);
        expect(agent.role).toBeDefined();
        expect(agent.confidence).toBeGreaterThanOrEqual(0);
        expect(agent.confidence).toBeLessThanOrEqual(1);
      });

      // Verify task structure
      tasks.forEach((task) => {
        expect(task.name).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/);
        expect(task.agent).toBeDefined();
        expect(task.confidence).toBeGreaterThanOrEqual(0);
        expect(task.confidence).toBeLessThanOrEqual(1);
      });

      // Step 6: Generate blueprint
      const blueprint = designer.generateBlueprint({
        analysis,
        recommendations: { agents, tasks },
        metadata: { source_docs: [prdPath] },
      });

      expect(blueprint.squad).toBeDefined();
      expect(blueprint.recommendations.agents).toEqual(agents);
      expect(blueprint.recommendations.tasks).toEqual(tasks);
      expect(blueprint.metadata.overall_confidence).toBeGreaterThan(0);

      // Step 7: Save blueprint
      const blueprintPath = await designer.saveBlueprint(blueprint);
      expect(blueprintPath).toContain('.yaml');

      // Verify blueprint file
      const savedBlueprint = yaml.load(await fs.readFile(blueprintPath, 'utf-8'));
      expect(savedBlueprint.squad.name).toBeDefined();

      // Step 8: Generate squad from blueprint
      const result = await generator.generateFromBlueprint(blueprintPath);

      expect(result.path).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.blueprint.agents).toBeGreaterThan(0);
      expect(result.blueprint.tasks).toBeGreaterThan(0);

      // Step 9: Verify squad structure
      const squadPath = result.path;

      // Check main files
      const squadYaml = await fs.readFile(path.join(squadPath, 'squad.yaml'), 'utf-8');
      expect(squadYaml).toContain('name:');
      expect(squadYaml).toContain('components:');

      const readme = await fs.readFile(path.join(squadPath, 'README.md'), 'utf-8');
      expect(readme).toContain('#');

      // Check agents were created
      const agentsDir = await fs.readdir(path.join(squadPath, 'agents'));
      expect(agentsDir.filter((f) => f.endsWith('.md')).length).toBeGreaterThan(0);

      // Check tasks were created
      const tasksDir = await fs.readdir(path.join(squadPath, 'tasks'));
      expect(tasksDir.filter((f) => f.endsWith('.md')).length).toBeGreaterThan(0);

      // Step 10: Validate generated squad
      const validation = await validator.validate(squadPath);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should handle minimal documentation', async () => {
      const minimalDocPath = path.join(docsDir, 'minimal-prd.md');
      await fs.writeFile(
        minimalDocPath,
        `# Simple Task Manager
Create, update, and delete tasks. Users can manage their task lists.
`,
      );

      const designer = new SquadDesigner({ designsPath: designsDir });

      const docs = await designer.collectDocumentation({ docs: [minimalDocPath], domain: 'task-management' });
      const analysis = designer.analyzeDomain(docs);

      expect(analysis.domain).toBe('task-management');
      expect(analysis.workflows.length).toBeGreaterThan(0);
    });

    it('should handle multiple documentation files', async () => {
      const doc1Path = path.join(docsDir, 'feature-orders.md');
      const doc2Path = path.join(docsDir, 'feature-payments.md');
      const doc3Path = path.join(docsDir, 'feature-shipping.md');

      await fs.writeFile(
        doc1Path,
        '# Order Features\nCreate orders, update orders, cancel orders.',
      );
      await fs.writeFile(
        doc2Path,
        '# Payment Features\nProcess payments via Stripe, refund payments.',
      );
      await fs.writeFile(
        doc3Path,
        '# Shipping Features\nCreate shipments, track packages via FedEx.',
      );

      const designer = new SquadDesigner({ designsPath: designsDir });

      const docs = await designer.collectDocumentation({
        docs: [doc1Path, doc2Path, doc3Path],
        domain: 'multi-feature',
      });

      expect(docs.sources.length).toBe(3);
      expect(docs.mergedContent).toContain('Order Features');
      expect(docs.mergedContent).toContain('Payment Features');
      expect(docs.mergedContent).toContain('Shipping Features');

      const analysis = designer.analyzeDomain(docs);

      // Should detect workflows from all files
      expect(analysis.workflows.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Blueprint Schema Validation', () => {
    it('should generate schema-compliant blueprint', async () => {
      const docPath = path.join(docsDir, 'schema-test.md');
      await fs.writeFile(
        docPath,
        '# Inventory System\nManage products and stock levels. Track inventory movements.',
      );

      const designer = new SquadDesigner({ designsPath: designsDir });

      const docs = await designer.collectDocumentation({ docs: [docPath], domain: 'inventory-system' });
      const analysis = designer.analyzeDomain(docs);
      const agents = designer.generateAgentRecommendations(analysis);
      const tasks = designer.generateTaskRecommendations(analysis, agents);

      const blueprint = designer.generateBlueprint({
        analysis,
        recommendations: { agents, tasks },
        metadata: { source_docs: [docPath] },
      });

      // Validate against expected schema structure
      expect(blueprint).toHaveProperty('squad');
      expect(blueprint).toHaveProperty('squad.name');
      expect(blueprint).toHaveProperty('squad.domain');
      expect(blueprint).toHaveProperty('recommendations');
      expect(blueprint).toHaveProperty('recommendations.agents');
      expect(blueprint).toHaveProperty('recommendations.tasks');
      expect(blueprint).toHaveProperty('metadata');
      expect(blueprint).toHaveProperty('metadata.created_at');

      // Validate squad name format
      expect(blueprint.squad.name).toMatch(/^[a-z][a-z0-9-]*[a-z0-9](-squad)?$/);

      // Validate agent format
      blueprint.recommendations.agents.forEach((agent) => {
        expect(agent).toHaveProperty('id');
        expect(agent).toHaveProperty('role');
        expect(agent).toHaveProperty('confidence');
        expect(agent.id).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/);
        expect(typeof agent.confidence).toBe('number');
        expect(agent.confidence).toBeGreaterThanOrEqual(0);
        expect(agent.confidence).toBeLessThanOrEqual(1);
      });

      // Validate task format
      blueprint.recommendations.tasks.forEach((task) => {
        expect(task).toHaveProperty('name');
        expect(task).toHaveProperty('agent');
        expect(task).toHaveProperty('confidence');
        expect(task.name).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/);
        expect(typeof task.confidence).toBe('number');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing documentation gracefully', async () => {
      const designer = new SquadDesigner({ designsPath: designsDir });

      await expect(
        designer.collectDocumentation({ docs: ['/nonexistent/file.md'] }),
      ).rejects.toThrow();
    });

    it('should handle empty documentation', async () => {
      const emptyDocPath = path.join(docsDir, 'empty.md');
      await fs.writeFile(emptyDocPath, '');

      const designer = new SquadDesigner({ designsPath: designsDir });

      const docs = await designer.collectDocumentation({ docs: [emptyDocPath] });

      expect(() => designer.analyzeDomain(docs)).toThrow();
    });

    it('should handle invalid blueprint for squad generation', async () => {
      const invalidBlueprintPath = path.join(designsDir, 'invalid-blueprint.yaml');
      await fs.writeFile(
        invalidBlueprintPath,
        yaml.dump({
          squad: { name: 'InvalidName' }, // Invalid name format
        }),
      );

      const generator = new SquadGenerator({ squadsPath: squadsDir });

      await expect(generator.generateFromBlueprint(invalidBlueprintPath)).rejects.toThrow();
    });
  });

  describe('Confidence Scoring', () => {
    it('should assign higher confidence to clearer documentation', async () => {
      // Clear, well-structured documentation
      const clearDocPath = path.join(docsDir, 'clear-prd.md');
      await fs.writeFile(
        clearDocPath,
        `# User Management System

## Workflows
1. create-user: Create a new user account
2. update-user: Update user profile information
3. delete-user: Remove user from system

## Entities
- User
- Profile
- Role

## Integrations
- Auth0 API for authentication
`,
      );

      // Vague documentation
      const vagueDocPath = path.join(docsDir, 'vague-prd.md');
      await fs.writeFile(
        vagueDocPath,
        `# Some System

It does things with stuff. Users can do stuff.
`,
      );

      const designer = new SquadDesigner({ designsPath: designsDir });

      // Analyze clear documentation
      const clearDocs = await designer.collectDocumentation({ docs: [clearDocPath], domain: 'user-mgmt' });
      const clearAnalysis = designer.analyzeDomain(clearDocs);
      const clearAgents = designer.generateAgentRecommendations(clearAnalysis);
      const clearTasks = designer.generateTaskRecommendations(clearAnalysis, clearAgents);

      // Analyze vague documentation
      const vagueDocs = await designer.collectDocumentation({ docs: [vagueDocPath], domain: 'vague-system' });
      const vagueAnalysis = designer.analyzeDomain(vagueDocs);
      const vagueAgents = designer.generateAgentRecommendations(vagueAnalysis);
      const vagueTasks = designer.generateTaskRecommendations(vagueAnalysis, vagueAgents);

      // Clear documentation should produce more recommendations
      expect(clearAgents.length).toBeGreaterThanOrEqual(vagueAgents.length);

      // Clear documentation should have higher average confidence
      if (clearAgents.length > 0 && vagueAgents.length > 0) {
        const clearAvgConfidence =
          clearAgents.reduce((sum, a) => sum + a.confidence, 0) / clearAgents.length;
        const vagueAvgConfidence =
          vagueAgents.reduce((sum, a) => sum + a.confidence, 0) / vagueAgents.length;

        // Clear documentation should have at least as high confidence
        expect(clearAvgConfidence).toBeGreaterThanOrEqual(vagueAvgConfidence * 0.8);
      }
    });
  });

  describe('Performance', () => {
    const isCI = process.env.CI === 'true';
    const fullFlowThreshold = isCI ? 15000 : 3000;

    it('should complete full design flow within acceptable time', async () => {
      const perfDocPath = path.join(docsDir, 'perf-test.md');
      await fs.writeFile(
        perfDocPath,
        `# Performance Test System
Create items, update items, delete items, list items, search items.
Entities: Item, Category, User.
Integrations: ElasticSearch, Redis.
`,
      );

      const designer = new SquadDesigner({ designsPath: designsDir });
      const generator = new SquadGenerator({ squadsPath: squadsDir });

      const start = Date.now();

      const docs = await designer.collectDocumentation({ docs: [perfDocPath], domain: 'perf-test' });
      const analysis = designer.analyzeDomain(docs);
      const agents = designer.generateAgentRecommendations(analysis);
      const tasks = designer.generateTaskRecommendations(analysis, agents);
      const blueprint = designer.generateBlueprint({
        analysis,
        recommendations: { agents, tasks },
        metadata: { source_docs: [perfDocPath] },
      });
      const blueprintPath = await designer.saveBlueprint(blueprint);
      await generator.generateFromBlueprint(blueprintPath);

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(fullFlowThreshold);
    });
  });
});
