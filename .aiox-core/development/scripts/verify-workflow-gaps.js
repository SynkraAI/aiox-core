#!/usr/bin/env node

/**
 * Verification Script for Workflow Gap Fixes (GAP 1, 2, 3)
 *
 * Runs all verification checks and reports results.
 * Usage: node .aiox-core/development/scripts/verify-workflow-gaps.js
 *
 * @version 1.0.0
 */

const fs = require('fs');
const _fsPromises = require('fs').promises; // Reserved for future async operations
const path = require('path');
const yaml = require('js-yaml');
const ROOT = path.resolve(__dirname, '..', '..', '..');

// ============ Test Infrastructure ============

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function pass(name) {
  totalTests++;
  passedTests++;
  console.log(`  [PASS] ${name}`);
}

function fail(name, reason) {
  totalTests++;
  failedTests++;
  failures.push({ name, reason });
  console.log(`  [FAIL] ${name}`);
  console.log(`         Reason: ${reason}`);
}

function assert(condition, name, reason) {
  if (condition) {
    pass(name);
  } else {
    fail(name, reason || 'Assertion failed');
  }
}

function section(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

// ============ GAP 1: Context Targeting ============

function verifyGap1() {
  section('GAP 1: Context Targeting');

  // 1.1 create-workflow.md has target_context and squad_name
  const createWf = fs.readFileSync(path.join(ROOT, '.aiox-core/development/tasks/create-workflow.md'), 'utf-8');
  assert(
    createWf.includes('campo: target_context'),
    '1.1a create-workflow.md has target_context field',
    'Missing "campo: target_context" in Entrada',
  );
  assert(
    createWf.includes('campo: squad_name'),
    '1.1b create-workflow.md has squad_name field',
    'Missing "campo: squad_name" in Entrada',
  );
  assert(
    createWf.includes('target_context="squad"'),
    '1.1c create-workflow.md has squad pre-condition',
    'Missing squad existence pre-condition',
  );
  assert(
    createWf.includes('squads/{squad_name}/workflows/'),
    '1.1d create-workflow.md has squad path resolution',
    'Missing squad path in step 4',
  );
  assert(
    createWf.includes('Update Squad Manifest'),
    '1.1e create-workflow.md has step 4.5',
    'Missing step 4.5 for squad manifest update',
  );

  // 1.2 modify-workflow.md
  const modifyWf = fs.readFileSync(path.join(ROOT, '.aiox-core/development/tasks/modify-workflow.md'), 'utf-8');
  assert(
    modifyWf.includes('campo: target_context'),
    '1.2a modify-workflow.md has target_context field',
    'Missing "campo: target_context" in Entrada',
  );
  assert(
    modifyWf.includes('campo: squad_name'),
    '1.2b modify-workflow.md has squad_name field',
    'Missing "campo: squad_name" in Entrada',
  );
  assert(
    modifyWf.includes('Resolve workflow path based on target_context'),
    '1.2c modify-workflow.md has conditional path resolution',
    'Missing path resolution in step 1',
  );

  // 1.3 workflow-elicitation.js
  const steps = require('../../../.aiox-core/core/elicitation/workflow-elicitation.js');
  const firstStep = steps[0];
  assert(
    firstStep.title === 'Target Context',
    '1.3a Elicitation first step is Target Context',
    `First step title is "${firstStep.title}" instead of "Target Context"`,
  );

  const targetContextQ = firstStep.questions.find((q) => q.name === 'targetContext');
  assert(
    !!targetContextQ,
    '1.3b Elicitation has targetContext question',
    'Missing targetContext question',
  );
  assert(
    targetContextQ && targetContextQ.choices.length === 3,
    '1.3c targetContext has 3 choices (core/squad/hybrid)',
    'Expected 3 choices',
  );

  const squadNameQ = firstStep.questions.find((q) => q.name === 'squadName');
  assert(
    !!squadNameQ,
    '1.3d Elicitation has squadName question',
    'Missing squadName question',
  );
  assert(
    squadNameQ && typeof squadNameQ.when === 'function',
    '1.3e squadName has conditional when function',
    'Missing when condition',
  );
  assert(
    squadNameQ && squadNameQ.when({ targetContext: 'squad' }) === true,
    '1.3f squadName shows when targetContext=squad',
    'when() should return true for squad',
  );
  assert(
    squadNameQ && squadNameQ.when({ targetContext: 'core' }) === false,
    '1.3g squadName hidden when targetContext=core',
    'when() should return false for core',
  );
  assert(
    squadNameQ && squadNameQ.validate('my-squad') === true,
    '1.3h squadName accepts valid kebab-case',
    'Should accept "my-squad"',
  );
  assert(
    squadNameQ && squadNameQ.validate('INVALID') !== true,
    '1.3i squadName rejects non-kebab-case',
    'Should reject "INVALID"',
  );

  // 1.4 workflow-template.yaml
  const template = fs.readFileSync(path.join(ROOT, '.aiox-core/product/templates/workflow-template.yaml'), 'utf-8');
  assert(
    template.includes('{{TARGET_CONTEXT}}'),
    '1.4a Template has TARGET_CONTEXT variable',
    'Missing {{TARGET_CONTEXT}}',
  );
  assert(
    template.includes('{{SQUAD_NAME}}'),
    '1.4b Template has SQUAD_NAME variable',
    'Missing {{SQUAD_NAME}}',
  );
  assert(
    template.includes('{{#IF_CONTEXT}}'),
    '1.4c Template has IF_CONTEXT conditional',
    'Missing {{#IF_CONTEXT}}',
  );
}

// ============ GAP 2: Workflow Validation ============

async function verifyGap2() {
  section('GAP 2: Standalone Workflow Validation');

  // 2.1 WorkflowValidator loads
  let WorkflowValidator;
  try {
    ({ WorkflowValidator } = require('../../../.aiox-core/development/scripts/workflow-validator'));
    pass('2.1 WorkflowValidator module loads');
  } catch (e) {
    fail('2.1 WorkflowValidator module loads', e.message);
    return; // Can't continue without module
  }

  // 2.2 Instantiation
  const validator = new WorkflowValidator({ verbose: false });
  assert(
    typeof validator.validate === 'function',
    '2.2a WorkflowValidator has validate() method',
    'Missing validate method',
  );
  assert(
    typeof validator.formatResult === 'function',
    '2.2b WorkflowValidator has formatResult() method',
    'Missing formatResult method',
  );

  // 2.3 Validate known-good workflow
  const goodResult = await validator.validate(path.join(ROOT, '.aiox-core/development/workflows/greenfield-service.yaml'));
  assert(
    goodResult.valid === true,
    '2.3a greenfield-service.yaml validates as valid',
    `Expected valid=true, got valid=${goodResult.valid}. Errors: ${JSON.stringify(goodResult.errors)}`,
  );
  assert(
    goodResult.errors.length === 0,
    '2.3b greenfield-service.yaml has 0 errors',
    `Has ${goodResult.errors.length} errors: ${goodResult.errors.map((e) => e.code).join(', ')}`,
  );
  assert(
    typeof goodResult.warnings === 'object',
    '2.3c Result has warnings array',
    'Missing warnings array',
  );

  // 2.4 formatResult works
  const formatted = validator.formatResult(goodResult, 'greenfield-service.yaml');
  assert(
    formatted.includes('greenfield-service.yaml'),
    '2.4 formatResult includes filename',
    'Missing filename in formatted output',
  );

  // 2.5 Validate broken YAML — missing required fields
  const brokenPath = path.join(__dirname, '_test_broken_wf.yaml');
  fs.writeFileSync(brokenPath, 'workflow:\n  id: broken-test\n');
  try {
    const brokenResult = await validator.validate(brokenPath);
    assert(
      brokenResult.valid === false,
      '2.5a Broken workflow (missing name+sequence) is invalid',
      'Should be invalid',
    );
    const errorCodes = brokenResult.errors.map((e) => e.code);
    assert(
      errorCodes.includes('WF_MISSING_REQUIRED_FIELD'),
      '2.5b Has WF_MISSING_REQUIRED_FIELD error',
      `Error codes: ${errorCodes.join(', ')}`,
    );
  } finally {
    fs.unlinkSync(brokenPath);
  }

  // 2.6 Validate non-existent file
  const missingResult = await validator.validate('/nonexistent/workflow.yaml');
  assert(
    missingResult.valid === false,
    '2.6a Non-existent file returns invalid',
    'Should be invalid',
  );
  assert(
    missingResult.errors.length > 0 && missingResult.errors[0].code === 'WF_FILE_NOT_FOUND',
    '2.6b Error code is WF_FILE_NOT_FOUND',
    `Got: ${missingResult.errors[0]?.code}`,
  );

  // 2.7 Validate invalid YAML syntax
  const badYamlPath = path.join(__dirname, '_test_bad_yaml.yaml');
  fs.writeFileSync(badYamlPath, '{ invalid yaml [[[');
  try {
    const badYamlResult = await validator.validate(badYamlPath);
    assert(
      badYamlResult.valid === false,
      '2.7a Invalid YAML syntax returns invalid',
      'Should be invalid',
    );
    assert(
      badYamlResult.errors.length > 0 && badYamlResult.errors[0].code === 'WF_YAML_PARSE_ERROR',
      '2.7b Error code is WF_YAML_PARSE_ERROR',
      `Got: ${badYamlResult.errors[0]?.code}`,
    );
  } finally {
    fs.unlinkSync(badYamlPath);
  }

  // 2.8 Strict mode — warnings become errors
  const strictValidator = new WorkflowValidator({ strict: true });
  const strictResult = await strictValidator.validate(path.join(ROOT, '.aiox-core/development/workflows/greenfield-service.yaml'));
  assert(
    strictResult.warnings.length === 0,
    '2.8 Strict mode moves all warnings to errors',
    `Still has ${strictResult.warnings.length} warnings`,
  );

  // 2.9 Artifact flow validation
  const artifactTestPath = path.join(__dirname, '_test_artifact_wf.yaml');
  fs.writeFileSync(artifactTestPath, yaml.dump({
    workflow: {
      id: 'artifact-test',
      name: 'Artifact Test',
      type: 'test',
      sequence: [
        { agent: 'dev', creates: 'output-a.md' },
        { agent: 'qa', requires: 'nonexistent.md', creates: 'review.md' },
      ],
    },
  }));
  try {
    const artifactResult = await validator.validate(artifactTestPath);
    const hasArtifactWarning = artifactResult.warnings.some(
      (w) => w.code === 'WF_ARTIFACT_CHAIN_BROKEN',
    );
    assert(
      hasArtifactWarning,
      '2.9 Detects broken artifact chain (requires without creates)',
      'Should warn about missing artifact "nonexistent.md"',
    );
  } finally {
    fs.unlinkSync(artifactTestPath);
  }

  // 2.10 SquadValidator has validateWorkflows
  const { SquadValidator } = require('../../../.aiox-core/development/scripts/squad/squad-validator');
  const sv = new SquadValidator({ verbose: false });
  assert(
    typeof sv.validateWorkflows === 'function',
    '2.10 SquadValidator has validateWorkflows() method',
    'Missing validateWorkflows method',
  );

  // 2.11 framework-analyzer integration
  const FrameworkAnalyzer = require('../../../.aiox-core/infrastructure/scripts/framework-analyzer');
  const fa = new FrameworkAnalyzer();
  const faResult = await fa.validateWorkflow({ id: 'test', name: 'Test', sequence: [] });
  assert(
    faResult.valid !== undefined,
    '2.11 FrameworkAnalyzer.validateWorkflow returns result with valid field',
    'Missing valid field in result',
  );

  // 2.12 validate-workflow.md task exists
  assert(
    fs.existsSync(path.join(ROOT, '.aiox-core/development/tasks/validate-workflow.md')),
    '2.12 validate-workflow.md task file exists',
    'File not found',
  );

  // 2.13 aiox-master has validate-workflow command
  const masterMd = fs.readFileSync(path.join(ROOT, '.aiox-core/development/agents/aiox-master.md'), 'utf-8');
  assert(
    masterMd.includes('name: validate-workflow'),
    '2.13a aiox-master has validate-workflow command',
    'Command not found in aiox-master.md',
  );
  assert(
    masterMd.includes('validate-workflow.md'),
    '2.13b aiox-master has validate-workflow.md in dependencies',
    'Dependency not found',
  );
}

// ============ GAP 3: Guided Workflow Automation ============

async function verifyGap3() {
  section('GAP 3: Guided Workflow Automation');

  // 3.1 WorkflowStateManager loads
  let WorkflowStateManager;
  try {
    ({ WorkflowStateManager } = require('../../../.aiox-core/development/scripts/workflow-state-manager'));
    pass('3.1 WorkflowStateManager module loads');
  } catch (e) {
    fail('3.1 WorkflowStateManager module loads', e.message);
    return;
  }

  const mgr = new WorkflowStateManager({ verbose: false });
  let statePath;

  try {

    // 3.2 Load real workflow and create state
    const wfContent = fs.readFileSync(path.join(ROOT, '.aiox-core/development/workflows/greenfield-service.yaml'), 'utf-8');
    const wfData = yaml.load(wfContent);

    const state = await mgr.createState(wfData, { target_context: 'core' });
    assert(
      !!state.instance_id,
      '3.2a createState generates instance_id',
      'Missing instance_id',
    );
    assert(
      state.status === 'active',
      '3.2b Initial status is active',
      `Got: ${state.status}`,
    );
    assert(
      state.steps.length > 0,
      '3.2c Steps array populated from sequence',
      `Got ${state.steps.length} steps`,
    );
    assert(
      state.current_step_index === 0,
      '3.2d Starts at step 0',
      `Got: ${state.current_step_index}`,
    );
    assert(
      state.workflow_id === 'greenfield-service',
      '3.2e workflow_id matches',
      `Got: ${state.workflow_id}`,
    );
    assert(
      state.target_context === 'core',
      '3.2f target_context is core',
      `Got: ${state.target_context}`,
    );

    // 3.3 State file was written to disk
    statePath = mgr._resolveStatePath(state.instance_id);
    assert(
      fs.existsSync(statePath),
      '3.3 State file exists on disk',
      `File not found: ${statePath}`,
    );

    // 3.4 Progress query
    const progress = mgr.getProgress(state);
    assert(
      progress.completed === 0,
      '3.4a Initial progress: 0 completed',
      `Got: ${progress.completed}`,
    );
    assert(
      progress.total === state.steps.length,
      '3.4b Total matches steps count',
      `Got: ${progress.total}`,
    );
    assert(
      progress.percentage === 0,
      '3.4c Initial percentage is 0',
      `Got: ${progress.percentage}`,
    );

    // 3.5 getCurrentStep
    const currentStep = mgr.getCurrentStep(state);
    assert(
      currentStep !== null,
      '3.5a getCurrentStep returns step object',
      'Got null',
    );
    assert(
      currentStep.step_index === 0,
      '3.5b Current step is index 0',
      `Got: ${currentStep?.step_index}`,
    );

    // 3.6 Mark step completed + advance
    mgr.markStepCompleted(state, 0, ['project-brief.md']);
    assert(
      state.steps[0].status === 'completed',
      '3.6a Step 0 marked completed',
      `Got: ${state.steps[0].status}`,
    );
    assert(
      state.steps[0].artifacts_created.includes('project-brief.md'),
      '3.6b Artifacts recorded',
      `Got: ${state.steps[0].artifacts_created}`,
    );

    mgr.advanceStep(state);
    assert(
      state.current_step_index > 0,
      '3.6c Advanced past step 0',
      `Still at: ${state.current_step_index}`,
    );

    // 3.7 Artifact status
    const artifacts = mgr.getArtifactStatus(state);
    assert(
      artifacts.created.length > 0 || artifacts.pending.length > 0,
      '3.7 getArtifactStatus returns artifacts',
      'No artifacts found',
    );

    // 3.8 Status report
    const report = mgr.generateStatusReport(state);
    assert(
      report.includes('Progress:'),
      '3.8a Status report has progress bar',
      'Missing "Progress:" in report',
    );
    assert(
      report.includes('[x]'),
      '3.8b Status report shows completed step',
      'Missing [x] checkmark',
    );
    assert(
      report.includes('<-- current'),
      '3.8c Status report shows current step marker',
      'Missing "<-- current" marker',
    );

    // 3.9 Handoff context
    const handoff = mgr.generateHandoffContext(state);
    assert(
      handoff.includes('Workflow Handoff Context'),
      '3.9a Handoff has header',
      'Missing header',
    );
    assert(
      handoff.includes('*run-workflow'),
      '3.9b Handoff has resume command',
      'Missing resume command',
    );

    // 3.10 Save and reload
    await mgr.saveState(state);
    const reloaded = await mgr.loadState(state.instance_id);
    assert(
      reloaded !== null,
      '3.10a Reloaded state is not null',
      'loadState returned null',
    );
    assert(
      reloaded.instance_id === state.instance_id,
      '3.10b Reloaded instance_id matches',
      `Got: ${reloaded?.instance_id}`,
    );
    assert(
      reloaded.current_step_index === state.current_step_index,
      '3.10c Reloaded current_step_index matches',
      `Got: ${reloaded?.current_step_index}`,
    );

    // 3.11 Skip optional step
    const optionalIdx = state.steps.findIndex((s) => s.optional && s.status === 'pending');
    if (optionalIdx !== -1) {
      state.current_step_index = optionalIdx;
      mgr.markStepSkipped(state, optionalIdx);
      assert(
        state.steps[optionalIdx].status === 'skipped',
        '3.11a Optional step marked skipped',
        `Got: ${state.steps[optionalIdx].status}`,
      );
    } else {
      pass('3.11a (skip) No optional pending steps — N/A');
    }

    // 3.12 Reject skip on required step
    const requiredIdx = state.steps.findIndex((s) => !s.optional && s.status === 'pending');
    if (requiredIdx !== -1) {
      let threw = false;
      try {
        mgr.markStepSkipped(state, requiredIdx);
      } catch {
        threw = true;
      }
      assert(
        threw,
        '3.12 Rejects skip on required step',
        'Should throw error for non-optional step',
      );
    } else {
      pass('3.12 (skip reject) No required pending steps — N/A');
    }

    // 3.13 List active workflows
    const activeList = await mgr.listActiveWorkflows();
    assert(
      activeList.length >= 1,
      '3.13 listActiveWorkflows finds our test instance',
      `Found ${activeList.length} active workflows`,
    );

    // 3.14 Load non-existent state returns null
    const missing = await mgr.loadState('nonexistent-instance');
    assert(
      missing === null,
      '3.14 loadState returns null for missing instance',
      `Got: ${missing}`,
    );

    // 3.15 WorkflowNavigator state integration
    const WorkflowNavigator = require('../../../.aiox-core/development/scripts/workflow-navigator');
    const nav = new WorkflowNavigator();
    assert(
      typeof nav.detectWorkflowStateFromFile === 'function',
      '3.15a Navigator has detectWorkflowStateFromFile()',
      'Missing method',
    );
    assert(
      typeof nav.suggestNextCommandsFromState === 'function',
      '3.15b Navigator has suggestNextCommandsFromState()',
      'Missing method',
    );

    // 3.16 Navigator detects state from file
    const navState = nav.detectWorkflowStateFromFile(statePath);
    assert(
      navState !== null,
      '3.16a Navigator detects state from file',
      'Got null',
    );
    assert(
      navState && navState.workflow === 'greenfield-service',
      '3.16b Detected correct workflow',
      `Got: ${navState?.workflow}`,
    );

    // 3.17 Navigator suggests commands from state
    const suggestions = nav.suggestNextCommandsFromState(state);
    assert(
      suggestions.length > 0,
      '3.17a Navigator generates suggestions from state',
      'No suggestions',
    );
    assert(
      suggestions.some((s) => s.command.includes('run-workflow')),
      '3.17b Suggestions include run-workflow continue',
      `Commands: ${suggestions.map((s) => s.command).join(', ')}`,
    );

    // 3.18 Navigator returns null for missing file
    const navMissing = nav.detectWorkflowStateFromFile('/nonexistent.yaml');
    assert(
      navMissing === null,
      '3.18 Navigator returns null for non-existent file',
      `Got: ${navMissing}`,
    );

    // 3.19 workflow-patterns.yaml has state_integration
    const patterns = yaml.load(fs.readFileSync(path.join(ROOT, '.aiox-core/data/workflow-patterns.yaml'), 'utf-8'));
    assert(
      !!patterns.state_integration,
      '3.19a workflow-patterns.yaml has state_integration key',
      'Missing state_integration',
    );
    assert(
      !!patterns.state_integration.state_file_location,
      '3.19b state_integration has state_file_location',
      'Missing state_file_location',
    );
    assert(
      !!patterns.state_integration.behavior,
      '3.19c state_integration has behavior section',
      'Missing behavior',
    );
    assert(
      !!patterns.state_integration.commands,
      '3.19d state_integration has commands section',
      'Missing commands',
    );

    // 3.20 workflow-state-schema.yaml exists and is valid YAML
    const schemaContent = fs.readFileSync(path.join(ROOT, '.aiox-core/data/workflow-state-schema.yaml'), 'utf-8');
    const schema = yaml.load(schemaContent);
    assert(
      !!schema.fields,
      '3.20a State schema has fields definition',
      'Missing fields',
    );
    assert(
      !!schema.fields.steps,
      '3.20b State schema defines steps field',
      'Missing steps field',
    );

    // 3.21 run-workflow.md task exists
    assert(
      fs.existsSync(path.join(ROOT, '.aiox-core/development/tasks/run-workflow.md')),
      '3.21 run-workflow.md task file exists',
      'File not found',
    );

    // 3.22 aiox-master has run-workflow command
    const masterMd = fs.readFileSync(path.join(ROOT, '.aiox-core/development/agents/aiox-master.md'), 'utf-8');
    assert(
      masterMd.includes('name: run-workflow'),
      '3.22a aiox-master has run-workflow command',
      'Command not found',
    );
    assert(
      masterMd.includes('run-workflow.md'),
      '3.22b aiox-master has run-workflow.md in dependencies',
      'Dependency not found',
    );

  } finally {
    // Cleanup test state file
    try {
      fs.unlinkSync(statePath);
    } catch {
      // Already cleaned
    }
  }
}

// ============ GAP 4: Cross-Context Agent Support (Hybrid Workflows) ============

async function verifyGap4() {
  section('GAP 4: Cross-Context Agent Support (Hybrid)');

  // 4.1 Elicitation has 3 choices including hybrid
  const steps = require('../../../.aiox-core/core/elicitation/workflow-elicitation.js');
  const firstStep = steps[0];
  const targetContextQ = firstStep.questions.find((q) => q.name === 'targetContext');
  assert(
    targetContextQ && targetContextQ.choices.length === 3,
    '4.1a Elicitation has 3 choices',
    `Expected 3 choices, got ${targetContextQ?.choices?.length}`,
  );
  const hybridChoice = targetContextQ && targetContextQ.choices.find((c) => c.value === 'hybrid');
  assert(
    !!hybridChoice,
    '4.1b Elicitation includes hybrid choice',
    'Missing hybrid choice in targetContext',
  );

  // 4.2 squadName shows for hybrid, hides for core
  const squadNameQ = firstStep.questions.find((q) => q.name === 'squadName');
  assert(
    squadNameQ && squadNameQ.when({ targetContext: 'hybrid' }) === true,
    '4.2a squadName shows when targetContext=hybrid',
    'when() should return true for hybrid',
  );
  assert(
    squadNameQ && squadNameQ.when({ targetContext: 'core' }) === false,
    '4.2b squadName hidden when targetContext=core',
    'when() should return false for core',
  );

  // 4.3 Schema includes hybrid
  const schemaContent = fs.readFileSync(path.join(ROOT, '.aiox-core/data/workflow-state-schema.yaml'), 'utf-8');
  const schema = yaml.load(schemaContent);
  assert(
    schema.fields.target_context.enum.includes('hybrid'),
    '4.3 Schema enum includes hybrid',
    `Enum: ${schema.fields.target_context.enum}`,
  );

  // 4.4 WorkflowValidator accepts squadAgentsPath
  const { WorkflowValidator, WorkflowValidationErrorCodes } = require('../../../.aiox-core/development/scripts/workflow-validator');
  const hybridValidator = new WorkflowValidator({
    squadAgentsPath: '/tmp/fake-squad-agents',
  });
  assert(
    hybridValidator.squadAgentsPath === '/tmp/fake-squad-agents',
    '4.4 WorkflowValidator accepts squadAgentsPath option',
    `Got: ${hybridValidator.squadAgentsPath}`,
  );

  // Setup temp dirs for agent tests
  const tmpDir = path.join(__dirname, '_test_hybrid_agents');
  const tmpCoreAgents = path.join(tmpDir, 'core-agents');
  const tmpSquadAgents = path.join(tmpDir, 'squad-agents');
  fs.mkdirSync(tmpCoreAgents, { recursive: true });
  fs.mkdirSync(tmpSquadAgents, { recursive: true });

  let hybridStateMgr, hybridState;

  try {

    // Create test agent files
    fs.writeFileSync(path.join(tmpCoreAgents, 'architect.md'), '# Architect Agent');
    fs.writeFileSync(path.join(tmpSquadAgents, 'validator.md'), '# Validator Agent');
    fs.writeFileSync(path.join(tmpCoreAgents, 'pm.md'), '# PM Agent');
    fs.writeFileSync(path.join(tmpSquadAgents, 'pm.md'), '# PM Agent (squad)'); // exists in both

    const testValidator = new WorkflowValidator({
      agentsPath: tmpCoreAgents,
      squadAgentsPath: tmpSquadAgents,
    });

    // 4.5 Validator finds agent in core during hybrid mode
    const coreAgentResult = await testValidator.validateAgentReferences([
      { agent: 'architect' },
    ]);
    const coreNotFound = coreAgentResult.warnings.some(
      (w) => w.code === 'WF_AGENT_NOT_FOUND' && w.message.includes('architect'),
    );
    assert(
      !coreNotFound,
      '4.5 Validator finds core agent "architect" in hybrid mode',
      'architect should be found in core agents',
    );

    // 4.6 Validator finds agent in squad during hybrid mode
    const squadAgentResult = await testValidator.validateAgentReferences([
      { agent: 'validator' },
    ]);
    const squadNotFound = squadAgentResult.warnings.some(
      (w) => w.code === 'WF_AGENT_NOT_FOUND' && w.message.includes('validator'),
    );
    assert(
      !squadNotFound,
      '4.6 Validator finds squad agent "validator" in hybrid mode',
      'validator should be found in squad agents',
    );

    // 4.7 Validator warns for agent not found in either context
    const missingResult = await testValidator.validateAgentReferences([
      { agent: 'nonexistent-agent' },
    ]);
    const missingWarning = missingResult.warnings.some(
      (w) => w.code === 'WF_AGENT_NOT_FOUND' && w.message.includes('nonexistent-agent'),
    );
    assert(
      missingWarning,
      '4.7 Validator warns for agent not found in either context',
      'Should warn about nonexistent-agent',
    );

    // 4.8 Core-only validator works identically (backward compat)
    const coreOnlyValidator = new WorkflowValidator({
      agentsPath: tmpCoreAgents,
    // squadAgentsPath NOT set — null
    });
    const coreOnlyResult = await coreOnlyValidator.validateAgentReferences([
      { agent: 'architect' },
    ]);
    const coreOnlyNotFound = coreOnlyResult.warnings.some(
      (w) => w.code === 'WF_AGENT_NOT_FOUND' && w.message.includes('architect'),
    );
    assert(
      !coreOnlyNotFound,
      '4.8 Core-only validator finds architect (backward compat)',
      'architect should be found without squadAgentsPath',
    );

    // 4.9 Explicit prefix core:architect works
    const explicitCoreResult = await testValidator.validateAgentReferences([
      { agent: 'core:architect' },
    ]);
    const explicitCoreNotFound = explicitCoreResult.warnings.some(
      (w) => w.code === 'WF_AGENT_NOT_FOUND',
    );
    assert(
      !explicitCoreNotFound,
      '4.9 Explicit prefix "core:architect" resolves correctly',
      'core:architect should be found',
    );

    // 4.10 Explicit prefix squad:validator works
    const explicitSquadResult = await testValidator.validateAgentReferences([
      { agent: 'squad:validator' },
    ]);
    const explicitSquadNotFound = explicitSquadResult.warnings.some(
      (w) => w.code === 'WF_AGENT_NOT_FOUND',
    );
    assert(
      !explicitSquadNotFound,
      '4.10 Explicit prefix "squad:validator" resolves correctly',
      'squad:validator should be found',
    );

    // 4.11 StateManager.createState with hybrid
    const { WorkflowStateManager } = require('../../../.aiox-core/development/scripts/workflow-state-manager');
    hybridStateMgr = new WorkflowStateManager({ verbose: false });
    const wfData = {
      workflow: {
        id: 'hybrid-test',
        name: 'Hybrid Test Workflow',
        sequence: [
          { agent: 'architect', creates: 'design.md' },
          { agent: 'validator', validates: 'design.md' },
        ],
      },
    };
    hybridState = await hybridStateMgr.createState(wfData, {
      target_context: 'hybrid',
      squad_name: 'test-squad',
    });
    assert(
      hybridState.target_context === 'hybrid',
      '4.11a createState sets target_context=hybrid',
      `Got: ${hybridState.target_context}`,
    );
    assert(
      hybridState.squad_name === 'test-squad',
      '4.11b createState sets squad_name for hybrid',
      `Got: ${hybridState.squad_name}`,
    );

    // 4.12 resolveAgentPaths returns both paths for hybrid
    const hybridPaths = hybridStateMgr.resolveAgentPaths(hybridState);
    assert(
      hybridPaths.corePath !== null && hybridPaths.squadPath !== null,
      '4.12 resolveAgentPaths returns both corePath and squadPath for hybrid',
      `corePath=${hybridPaths.corePath}, squadPath=${hybridPaths.squadPath}`,
    );

    // 4.13 resolveAgentPaths returns null squadPath for core
    const coreState = { target_context: 'core', squad_name: null };
    const corePaths = hybridStateMgr.resolveAgentPaths(coreState);
    assert(
      corePaths.squadPath === null,
      '4.13 resolveAgentPaths returns null squadPath for core',
      `Got squadPath: ${corePaths.squadPath}`,
    );

    // 4.14 workflow-patterns.yaml has cross_context
    const patterns = yaml.load(fs.readFileSync(path.join(ROOT, '.aiox-core/data/workflow-patterns.yaml'), 'utf-8'));
    assert(
      !!patterns.cross_context,
      '4.14a workflow-patterns.yaml has cross_context key',
      'Missing cross_context',
    );
    assert(
      !!patterns.cross_context.resolution_rules,
      '4.14b cross_context has resolution_rules',
      'Missing resolution_rules',
    );
    assert(
      !!patterns.cross_context.explicit_prefix,
      '4.14c cross_context has explicit_prefix',
      'Missing explicit_prefix',
    );
    assert(
      !!patterns.cross_context.hybrid_workflow_storage,
      '4.14d cross_context has hybrid_workflow_storage',
      'Missing hybrid_workflow_storage',
    );
    assert(
      !!patterns.cross_context.validator_behavior,
      '4.14e cross_context has validator_behavior',
      'Missing validator_behavior',
    );

    // 4.15 All 4 task docs mention hybrid
    const taskFiles = [
      'create-workflow.md',
      'modify-workflow.md',
      'validate-workflow.md',
      'run-workflow.md',
    ];
    for (const taskFile of taskFiles) {
      const content = fs.readFileSync(path.join(ROOT, '.aiox-core/development/tasks', taskFile), 'utf-8');
      assert(
        content.includes('hybrid'),
        `4.15 ${taskFile} mentions hybrid`,
        `"hybrid" not found in ${taskFile}`,
      );
    }

    // 4.16 Template mentions hybrid
    const template = fs.readFileSync(path.join(ROOT, '.aiox-core/product/templates/workflow-template.yaml'), 'utf-8');
    assert(
      template.includes('hybrid') || template.includes('IF_HYBRID'),
      '4.16 workflow-template.yaml mentions hybrid',
      'Missing hybrid reference in template',
    );

    // 4.17 WF_AGENT_AMBIGUOUS error code exists
    assert(
      WorkflowValidationErrorCodes.WF_AGENT_AMBIGUOUS === 'WF_AGENT_AMBIGUOUS',
      '4.17a WF_AGENT_AMBIGUOUS error code exists',
      'Missing WF_AGENT_AMBIGUOUS in error codes',
    );

    // Also verify ambiguity detection works (pm exists in both)
    const ambiguousResult = await testValidator.validateAgentReferences([
      { agent: 'pm' },
    ]);
    const ambiguousWarning = ambiguousResult.warnings.some(
      (w) => w.code === 'WF_AGENT_AMBIGUOUS' && w.message.includes('pm'),
    );
    assert(
      ambiguousWarning,
      '4.17b Validator detects ambiguous agent (pm in both contexts)',
      'Should emit WF_AGENT_AMBIGUOUS for pm',
    );
  } finally {
    // Cleanup
    if (hybridStateMgr && hybridState) {
      const cleanupPath = hybridStateMgr._resolveStatePath(hybridState.instance_id);
      try { fs.unlinkSync(cleanupPath); } catch { /* already cleaned */ }
    }
    try { fs.rmSync(tmpDir, { recursive: true }); } catch { /* cleanup */ }
  }
}

// ============ Main ============

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  AIOX Workflow Gaps — Verification Suite');
  console.log('  Running from:', process.cwd());
  console.log('='.repeat(60));

  try {
    verifyGap1();
  } catch (e) {
    fail('GAP 1 unexpected error', e.message);
  }

  try {
    await verifyGap2();
  } catch (e) {
    fail('GAP 2 unexpected error', e.message);
  }

  try {
    await verifyGap3();
  } catch (e) {
    fail('GAP 3 unexpected error', e.message);
  }

  try {
    await verifyGap4();
  } catch (e) {
    fail('GAP 4 unexpected error', e.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  RESULTS');
  console.log('='.repeat(60));
  console.log(`  Total:  ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${failedTests}`);

  if (failures.length > 0) {
    console.log('\n  Failed tests:');
    failures.forEach((f) => {
      console.log(`    - ${f.name}`);
      console.log(`      ${f.reason}`);
    });
  }

  console.log('\n' + (failedTests === 0 ? '  ALL TESTS PASSED' : `  ${failedTests} TEST(S) FAILED`));
  console.log('='.repeat(60) + '\n');

  process.exit(failedTests > 0 ? 1 : 0);
}

main();
