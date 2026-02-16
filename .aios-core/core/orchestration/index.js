/**
 * AIOS Core Orchestration Module
 *
 * Multi-agent workflow orchestration with:
 * - Real subagent dispatch with persona transformation
 * - Task-based execution (no generic prompts)
 * - Deterministic code for file operations
 * - Checklist-based quality validation
 * - V3.1: Pre-flight stack detection and Skill dispatch
 *
 * @module core/orchestration
 * @version 1.1.0
 */

const WorkflowOrchestrator = require('./workflow-orchestrator');
const SubagentPromptBuilder = require('./subagent-prompt-builder');
const ContextManager = require('./context-manager');
const ChecklistRunner = require('./checklist-runner');
const ParallelExecutor = require('./parallel-executor');

// V3.1 Components
const TechStackDetector = require('./tech-stack-detector');
const ConditionEvaluator = require('./condition-evaluator');
const SkillDispatcher = require('./skill-dispatcher');
const executionProfileResolver = require('./execution-profile-resolver');

// Epic 0: Master Orchestrator (ADE)
const MasterOrchestrator = require('./master-orchestrator');
const { RecoveryHandler, RecoveryStrategy, RecoveryResult } = require('./recovery-handler');
const { GateEvaluator, GateVerdict, DEFAULT_GATE_CONFIG } = require('./gate-evaluator');

// Story 0.7: Agent Invoker
const { AgentInvoker, SUPPORTED_AGENTS, InvocationStatus } = require('./agent-invoker');

// Story 0.8: Dashboard Integration
const { DashboardIntegration, NotificationType } = require('./dashboard-integration');

// Story 0.9: CLI Commands
const cliCommands = require('./cli-commands');

// Story 11.1: Executor Assignment (Projeto Bob)
const ExecutorAssignment = require('./executor-assignment');

// Story 11.2: Terminal Spawner (Projeto Bob)
const TerminalSpawner = require('./terminal-spawner');

// Story 11.3: Workflow Executor (Projeto Bob)
const {
  WorkflowExecutor,
  createWorkflowExecutor,
  executeDevelopmentCycle,
  PhaseStatus,
  CheckpointDecision,
} = require('./workflow-executor');

// Story 11.4: Surface Checker (Projeto Bob)
const {
  SurfaceChecker,
  createSurfaceChecker,
  shouldSurface,
} = require('./surface-checker');

// Story 11.5: Session State Persistence (Projeto Bob)
const {
  SessionState,
  createSessionState,
  sessionStateExists,
  loadSessionState,
  ActionType,
  Phase,
  ResumeOption,
  SESSION_STATE_VERSION,
  SESSION_STATE_FILENAME,
  CRASH_THRESHOLD_MINUTES,
} = require('./session-state');

// Story 11.6: Observability Panel (Projeto Bob)
const {
  ObservabilityPanel,
  createPanel,
  PanelMode,
  PipelineStage,
  createDefaultState,
  PanelRenderer,
  BOX,
  STATUS,
} = require('../ui');

// Story 12.3: Bob Orchestrator (Projeto Bob)
const { BobOrchestrator, ProjectState } = require('./bob-orchestrator');
const LockManager = require('./lock-manager');

// Story 12.5: Data Lifecycle Manager (Projeto Bob)
const {
  DataLifecycleManager,
  createDataLifecycleManager,
  runStartupCleanup,
  STALE_SESSION_DAYS,
  STALE_SNAPSHOT_DAYS,
} = require('./data-lifecycle-manager');

// Story 12.4: Epic Context Accumulator (Projeto Bob)
const {
  EpicContextAccumulator,
  createEpicContextAccumulator,
  CompressionLevel,
  COMPRESSION_FIELDS,
  estimateTokens,
  getCompressionLevel,
  buildFileIndex,
  hasFileOverlap,
  TOKEN_LIMIT,
  HARD_CAP_PER_STORY,
} = require('./epic-context-accumulator');

// Story 12.6: Bob Status Writer (Projeto Bob)
const {
  BobStatusWriter,
  BOB_STATUS_SCHEMA,
  BOB_STATUS_VERSION,
  DEFAULT_PIPELINE_STAGES,
  createDefaultBobStatus,
} = require('./bob-status-writer');

// Story 12.7: Message Formatter (Educational Mode)
const {
  MessageFormatter,
  createMessageFormatter,
} = require('./message-formatter');

// Story 12.8: Brownfield Handler (Projeto Bob)
const {
  BrownfieldHandler,
  BrownfieldPhase,
  PostDiscoveryChoice,
  PhaseFailureAction,
} = require('./brownfield-handler');

// Story 12.13: Greenfield Handler (Projeto Bob)
const {
  GreenfieldHandler,
  GreenfieldPhase,
  PhaseFailureAction: GreenfieldPhaseFailureAction,
  DEFAULT_GREENFIELD_INDICATORS,
  PHASE_1_SEQUENCE,
} = require('./greenfield-handler');

module.exports = {
  // Main orchestrators
  WorkflowOrchestrator,
  MasterOrchestrator, // Epic 0: ADE Master Orchestrator

  // Supporting modules
  SubagentPromptBuilder,
  ContextManager,
  ChecklistRunner,
  ParallelExecutor,

  // V3.1: Pre-flight and Skill modules
  TechStackDetector,
  ConditionEvaluator,
  SkillDispatcher,
  ExecutionProfileResolver: executionProfileResolver,
  resolveExecutionProfile: executionProfileResolver.resolveExecutionProfile,

  // Epic 0: Orchestrator constants
  OrchestratorState: MasterOrchestrator.OrchestratorState,
  EpicStatus: MasterOrchestrator.EpicStatus,
  EPIC_CONFIG: MasterOrchestrator.EPIC_CONFIG,

  // Story 0.5: Recovery Handler
  RecoveryHandler,
  RecoveryStrategy,
  RecoveryResult,

  // Story 0.6: Gate Evaluator
  GateEvaluator,
  GateVerdict,
  DEFAULT_GATE_CONFIG,

  // Story 0.7: Agent Invoker
  AgentInvoker,
  SUPPORTED_AGENTS,
  InvocationStatus,

  // Story 0.8: Dashboard Integration
  DashboardIntegration,
  NotificationType,

  // Story 0.9: CLI Commands
  cliCommands,
  orchestrate: cliCommands.orchestrate,
  orchestrateStatus: cliCommands.orchestrateStatus,
  orchestrateStop: cliCommands.orchestrateStop,
  orchestrateResume: cliCommands.orchestrateResume,

  // Story 11.1: Executor Assignment (Projeto Bob)
  ExecutorAssignment,
  detectStoryType: ExecutorAssignment.detectStoryType,
  assignExecutor: ExecutorAssignment.assignExecutor,
  assignExecutorFromContent: ExecutorAssignment.assignExecutorFromContent,
  validateExecutorAssignment: ExecutorAssignment.validateExecutorAssignment,
  EXECUTOR_ASSIGNMENT_TABLE: ExecutorAssignment.EXECUTOR_ASSIGNMENT_TABLE,

  // Story 11.2: Terminal Spawner (Projeto Bob)
  TerminalSpawner,
  spawnAgent: TerminalSpawner.spawnAgent,
  createContextFile: TerminalSpawner.createContextFile,
  pollForOutput: TerminalSpawner.pollForOutput,
  isSpawnerAvailable: TerminalSpawner.isSpawnerAvailable,
  getPlatform: TerminalSpawner.getPlatform,
  cleanupOldFiles: TerminalSpawner.cleanupOldFiles,

  // Story 11.3: Workflow Executor (Projeto Bob)
  WorkflowExecutor,
  createWorkflowExecutor,
  executeDevelopmentCycle,
  PhaseStatus,
  CheckpointDecision,

  // Story 11.4: Surface Checker (Projeto Bob)
  SurfaceChecker,
  createSurfaceChecker,
  shouldSurface,

  // Story 11.5: Session State Persistence (Projeto Bob)
  SessionState,
  createSessionState,
  sessionStateExists,
  loadSessionState,
  ActionType,
  Phase,
  ResumeOption,
  SESSION_STATE_VERSION,
  SESSION_STATE_FILENAME,
  CRASH_THRESHOLD_MINUTES,

  // Factory function for easy instantiation
  createOrchestrator(workflowPath, options = {}) {
    return new WorkflowOrchestrator(workflowPath, options);
  },

  // Factory function for MasterOrchestrator (Epic 0)
  createMasterOrchestrator(projectRoot, options = {}) {
    return new MasterOrchestrator(projectRoot, options);
  },

  // Utility to create context manager standalone
  createContextManager(workflowId, projectRoot) {
    return new ContextManager(workflowId, projectRoot);
  },

  // Utility to run checklists standalone
  async runChecklist(checklistName, targetPaths, projectRoot) {
    const runner = new ChecklistRunner(projectRoot);
    return await runner.run(checklistName, targetPaths);
  },

  // V3.1: Utility to detect tech stack standalone
  async detectTechStack(projectRoot) {
    const detector = new TechStackDetector(projectRoot);
    return await detector.detect();
  },

  // Story 11.6: Observability Panel (Projeto Bob)
  ObservabilityPanel,
  createPanel,
  PanelMode,
  PipelineStage,
  createDefaultState,
  PanelRenderer,
  BOX,
  STATUS,

  // Story 12.3: Bob Orchestrator (Projeto Bob)
  BobOrchestrator,
  ProjectState,
  LockManager,

  // Story 12.5: Data Lifecycle Manager (Projeto Bob)
  DataLifecycleManager,
  createDataLifecycleManager,
  runStartupCleanup,
  STALE_SESSION_DAYS,
  STALE_SNAPSHOT_DAYS,

  // Story 12.4: Epic Context Accumulator (Projeto Bob)
  EpicContextAccumulator,
  createEpicContextAccumulator,
  CompressionLevel,
  COMPRESSION_FIELDS,
  estimateTokens,
  getCompressionLevel,
  buildFileIndex,
  hasFileOverlap,
  TOKEN_LIMIT,
  HARD_CAP_PER_STORY,

  // Story 12.6: Bob Status Writer (Projeto Bob)
  BobStatusWriter,
  BOB_STATUS_SCHEMA,
  BOB_STATUS_VERSION,
  DEFAULT_PIPELINE_STAGES,
  createDefaultBobStatus,

  // Story 12.7: Message Formatter (Educational Mode)
  MessageFormatter,
  createMessageFormatter,

  // Story 12.8: Brownfield Handler (Projeto Bob)
  BrownfieldHandler,
  BrownfieldPhase,
  PostDiscoveryChoice,
  PhaseFailureAction,

  // Story 12.13: Greenfield Handler (Projeto Bob)
  GreenfieldHandler,
  GreenfieldPhase,
  GreenfieldPhaseFailureAction,
  DEFAULT_GREENFIELD_INDICATORS,
  PHASE_1_SEQUENCE,
};
