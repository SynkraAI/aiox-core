---

# collaborative-edit

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: collaborativeEdit()
responsável: River (Facilitator)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-5 min (estimated)
cost_estimated: $0.001-0.003
token_usage: ~1,000-3,000 tokens
```

**Optimization Notes:**
- Parallelize independent operations; reuse atom results; implement early exits

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---

# No checklists needed - this task manages real-time collaborative editing sessions, no document validation required
tools:
  - github-cli
---

# Collaborative Edit - AIOX Developer Task

## Purpose
Create and manage collaborative editing sessions for real-time component modification with multiple participants.

## Command Pattern
```
*collaborative-edit <action> [options]
```

## Actions
- `start`: Start a new collaborative editing session
- `join`: Join an existing session
- `leave`: Leave current session
- `end`: End a collaborative session
- `status`: Check session status

## Parameters
### Start Session
- `--component <path>`: Component to edit collaboratively
- `--participants <users>`: Initial participants (comma-separated)
- `--mode <mode>`: Editing mode (live, turn-based, review)
- `--timeout <minutes>`: Session timeout

### Join Session
- `--session-id <id>`: Session ID to join
- `--role <role>`: Participant role (editor, reviewer, observer)

## Examples
```bash
# Start collaborative editing session
*collaborative-edit start --component aiox-core/agents/data-agent.md --participants alice,bob --mode live

# Join existing session
*collaborative-edit join --session-id session-1234567890 --role editor

# Check session status
*collaborative-edit status --session-id session-1234567890

# End session and merge changes
*collaborative-edit end --session-id session-1234567890 --merge-strategy collaborative
```

## Implementation

```javascript
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const EventEmitter = require('events');

class CollaborativeEditTask extends EventEmitter {
  constructor() {
    super();
    this.taskName = 'collaborative-edit';
    this.description = 'Manage collaborative editing sessions';
    this.rootPath = process.cwd();
    this.sessionDir = path.join(this.rootPath, '.aiox', 'sessions');
    this.synchronizer = null;
    this.conflictManager = null;
    this.currentSession = null;
    this.editHistory = [];
  }

  async execute(params) {
    try {
      console.log(chalk.blue('👥 AIOX Collaborative Editing'));
      console.log(chalk.gray('Real-time collaborative modification system\n'));

      // Parse action and parameters
      const { action, config } = await this.parseParameters(params);
      
      // Initialize dependencies
      await this.initializeDependencies();

      // Execute action
      let result;
      switch (action) {
        case 'start':
          result = await this.startSession(config);
          break;
        case 'join':
          result = await this.joinSession(config);
          break;
        case 'leave':
          result = await this.leaveSession(config);
          break;
        case 'end':
          result = await this.endSession(config);
          break;
        case 'status':
          result = await this.getSessionStatus(config);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return result;

    } catch (error) {
      console.error(chalk.red(`\n❌ Collaborative edit failed: ${error.message}`));
      throw error;
    }
  }

  async parseParameters(params) {
    if (params.length < 1) {
      throw new Error('Usage: *collaborative-edit <action> [options]');
    }

    const action = params[0];
    const config = {
      sessionId: null,
      componentPath: null,
      participants: [],
      mode: 'live',
      timeout: 60,
      role: 'editor',
      mergeStrategy: 'collaborative'
    };

    // Parse options
    for (let i = 1; i < params.length; i++) {
      const param = params[i];
      
      if (param.startsWith('--session-id') && params[i + 1]) {
        config.sessionId = params[++i];
      } else if (param.startsWith('--component') && params[i + 1]) {
        config.componentPath = params[++i];
      } else if (param.startsWith('--participants') && params[i + 1]) {
        config.participants = params[++i].split(',').map(p => p.trim());
      } else if (param.startsWith('--mode') && params[i + 1]) {
        config.mode = params[++i];
      } else if (param.startsWith('--timeout') && params[i + 1]) {
        config.timeout = parseInt(params[++i]);
      } else if (param.startsWith('--role') && params[i + 1]) {
        config.role = params[++i];
      } else if (param.startsWith('--merge-strategy') && params[i + 1]) {
        config.mergeStrategy = params[++i];
      }
    }

    // Validate action
    const validActions = ['start', 'join', 'leave', 'end', 'status'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid action: ${action}. Must be one of: ${validActions.join(', ')}`);
    }

    return { action, config };
  }

  async initializeDependencies() {
    // const ModificationSynchronizer = require('../scripts/modification-synchronizer'); // Archived in archived-utilities/ (Story 3.1.3)
    // this.synchronizer = new ModificationSynchronizer({ rootPath: this.rootPath }); // Archived in archived-utilities/ (Story 3.1.3)
    // await this.synchronizer.initialize(); // Archived in archived-utilities/ (Story 3.1.3)

    // const ConflictManager = require('../scripts/conflict-manager'); // Archived in archived-utilities/ (Story 3.1.2)
    // this.conflictManager = new ConflictManager({ rootPath: this.rootPath }); // Archived in archived-utilities/ (Story 3.1.2)

    await fs.mkdir(this.sessionDir, { recursive: true });
  }

  async startSession(config) {
    console.log(chalk.blue('🚀 Starting collaborative session...'));

    // Validate component exists
    const component = await this.validateComponent(config.componentPath);

    // Generate session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // Create session
    const session = {
      id: sessionId,
      componentPath: config.componentPath,
      componentType: component.type,
      participants: [
        {
          id: process.env.USER || 'initiator',
          role: 'owner',
          joinedAt: new Date().toISOString(),
          status: 'active'
        }
      ],
      mode: config.mode,
      status: 'active',
      createdAt: new Date().toISOString(),
      timeout: config.timeout,
      editHistory: [],
      locks: new Map(),
      metadata: {
        originalContent: component.content,
        currentContent: component.content,
        version: 0
      }
    };

    // Add initial participants
    for (const participant of config.participants) {
      if (participant !== session.participants[0].id) {
        session.participants.push({
          id: participant,
          role: 'editor',
          joinedAt: new Date().toISOString(),
          status: 'invited'
        });
      }
    }

    // Save session
    await this.saveSession(session);

    // Start synchronization
    await this.synchronizer.startSync();
    
    // Create collaborative workspace
    await this.createCollaborativeWorkspace(session);

    // Set as current session
    this.currentSession = session;

    // Start real-time monitoring
    this.startRealtimeMonitoring(session);

    console.log(chalk.green('\n✅ Collaborative session created'));
    console.log(chalk.gray(`   Session ID: ${sessionId}`));
    console.log(chalk.gray(`   Component: ${config.componentPath}`));
    console.log(chalk.gray(`   Mode: ${config.mode}`));
    console.log(chalk.gray(`   Participants: ${session.participants.length}`));
    
    if (config.mode === 'live') {
      console.log(chalk.blue('\n📡 Live editing enabled - changes sync in real-time'));
    }

    return {
      success: true,
      sessionId: sessionId,
      componentPath: config.componentPath,
      participants: session.participants,
      mode: config.mode,
      workspace: await this.getWorkspaceInfo(session)
    };
  }

  async joinSession(config) {
    if (!config.sessionId) {
      throw new Error('Session ID required to join');
    }

    console.log(chalk.blue(`🔗 Joining session ${config.sessionId}...`));

    // Load session
    const session = await this.loadSession(config.sessionId);
    
    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    // Check if already participant
    const participantId = process.env.USER || 'user';
    let participant = session.participants.find(p => p.id === participantId);
    
    if (!participant) {
      // Add new participant
      participant = {
        id: participantId,
        role: config.role,
        joinedAt: new Date().toISOString(),
        status: 'active'
      };
      session.participants.push(participant);
    } else {
      // Update existing participant
      participant.status = 'active';
      participant.role = config.role;
    }

    // Update session
    await this.saveSession(session);

    // Set as current session
    this.currentSession = session;

    // Subscribe to updates
    await this.subscribeToSessionUpdates(session);

    // Load current state
    const workspace = await this.loadWorkspace(session);

    console.log(chalk.green('\n✅ Joined collaborative session'));
    console.log(chalk.gray(`   Role: ${config.role}`));
    console.log(chalk.gray(`   Active participants: ${session.participants.filter(p => p.status === 'active').length}`));
    console.log(chalk.gray(`   Current version: ${session.metadata.version}`));

    // Show current editing status
    if (session.mode === 'turn-based') {
      const currentEditor = this.getCurrentEditor(session);
      console.log(chalk.yellow(`\n⏳ Current editor: ${currentEditor || 'None'}`));
    }

    return {
      success: true,
      sessionId: session.id,
      role: config.role,
      workspace: workspace,
      participants: session.participants.filter(p => p.status === 'active')
    };
  }

  async leaveSession(config) {
    const sessionId = config.sessionId || (this.currentSession && this.currentSession.id);
    
    if (!sessionId) {
      throw new Error('No active session to leave');
    }

    console.log(chalk.blue(`👋 Leaving session ${sessionId}...`));

    // Load session
    const session = await this.loadSession(sessionId);
    
    // Update participant status
    const participantId = process.env.USER || 'user';
    const participant = session.participants.find(p => p.id === participantId);
    
    if (participant) {
      participant.status = 'left';
      participant.leftAt = new Date().toISOString();
    }

    // Save any pending changes
    if (this.currentSession && this.editHistory.length > 0) {
      await this.saveEditHistory(session);
    }

    // Update session
    await this.saveSession(session);

    // Clear current session
    this.currentSession = null;

    console.log(chalk.green('✅ Left collaborative session'));

    return {
      success: true,
      sessionId: sessionId
    };
  }

  async endSession(config) {
    if (!config.sessionId) {
      throw new Error('Session ID required to end session');
    }

    console.log(chalk.blue(`🏁 Ending session ${config.sessionId}...`));

    // Load session
    const session = await this.loadSession(config.sessionId);
    
    // Check permissions
    const participantId = process.env.USER || 'user';
    const participant = session.participants.find(p => p.id === participantId);
    
    if (!participant || participant.role !== 'owner') {
      throw new Error('Only session owner can end the session');
    }

    // Finalize all pending edits
    await this.finalizeEdits(session);

    // Merge changes
    console.log(chalk.gray('Merging collaborative changes...'));
    const mergeResult = await this.mergeCollaborativeChanges(session, config.mergeStrategy);

    // Update session status
    session.status = 'completed';
    session.endedAt = new Date().toISOString();
    session.mergeResult = mergeResult;

    // Save final session state
    await this.saveSession(session);

    // Stop synchronization
    await this.synchronizer.stopSync();

    // Archive session
    await this.archiveSession(session);

    console.log(chalk.green('\n✅ Collaborative session ended'));
    console.log(chalk.gray(`   Total edits: ${session.editHistory.length}`));
    console.log(chalk.gray(`   Participants: ${session.participants.length}`));
    console.log(chalk.gray(`   Duration: ${this.calculateDuration(session)}`));
    
    if (mergeResult.success) {
      console.log(chalk.green(`   Changes merged successfully`));
    }

    return {
      success: true,
      sessionId: session.id,
      mergeResult: mergeResult,
      statistics: this.getSessionStatistics(session)
    };
  }

  async getSessionStatus(config) {
    const sessionId = config.sessionId || (this.currentSession && this.currentSession.id);
    
    if (!sessionId) {
      // Show all active sessions
      return await this.listActiveSessions();
    }

    // Load specific session
    const session = await this.loadSession(sessionId);
    
    console.log(chalk.blue('\n📊 Session Status'));
    console.log(chalk.gray('━'.repeat(50)));
    
    console.log(`ID: ${chalk.white(session.id)}`);
    console.log(`Component: ${chalk.white(session.componentPath)}`);
    console.log(`Status: ${this.formatStatus(session.status)}`);
    console.log(`Mode: ${chalk.white(session.mode)}`);
    console.log(`Created: ${chalk.white(new Date(session.createdAt).toLocaleString())}`);
    
    console.log(chalk.blue('\n👥 Participants:'));
    session.participants.forEach(p => {
      const status = p.status === 'active' ? chalk.green('●') : chalk.gray('○');
      console.log(`  ${status} ${p.id} (${p.role})`);
    });

    console.log(chalk.blue('\n📝 Edit History:'));
    console.log(`  Total edits: ${session.editHistory.length}`);
    console.log(`  Current version: ${session.metadata.version}`);
    
    if (session.editHistory.length > 0) {
      const recentEdits = session.editHistory.slice(-5);
      console.log('  Recent edits:');
      recentEdits.forEach(edit => {
        console.log(`    - ${edit.author} at ${new Date(edit.timestamp).toLocaleTimeString()}`);
      });
    }

    if (session.mode === 'turn-based') {
      const currentEditor = this.getCurrentEditor(session);
      console.log(chalk.yellow(`\n⏳ Current turn: ${currentEditor || 'None'}`));
    }

    return {
      success: true,
      session: session,
      activeParticipants: session.participants.filter(p => p.status === 'active').length,
      isCurrentSession: sessionId === (this.currentSession && this.currentSession.id)
    };
  }

  // Helper methods

  async validateComponent(componentPath) {
    const fullPath = path.resolve(this.rootPath, componentPath);
    
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isFile()) {
        throw new Error('Component path must be a file');
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      const type = this.detectComponentType(fullPath);

      return {
        path: componentPath,
        fullPath: fullPath,
        type: type,
        content: content,
        size: stats.size
      };

    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Component not found: ${componentPath}`);
      }
      throw error;
    }
  }

  detectComponentType(filePath) {
    if (filePath.includes('/agents/')) return 'agent';
    if (filePath.includes('/tasks/')) return 'task';
    if (filePath.includes('/workflows/')) return 'workflow';
    if (filePath.includes('/utils/')) return 'util';
    return 'unknown';
  }

  async saveSession(session) {
    const sessionFile = path.join(this.sessionDir, `${session.id}.json`);
    await fs.writeFile(sessionFile, JSON.stringify(session, null, 2));
  }

  async loadSession(sessionId) {
    const sessionFile = path.join(this.sessionDir, `${sessionId}.json`);
    
    try {
      const content = await fs.readFile(sessionFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Session not found: ${sessionId}`);
      }
      throw error;
    }
  }

  async createCollaborativeWorkspace(session) {
    const workspaceDir = path.join(this.sessionDir, session.id, 'workspace');
    await fs.mkdir(workspaceDir, { recursive: true });

    // Create working copy
    const workingFile = path.join(workspaceDir, 'working.txt');
    await fs.writeFile(workingFile, session.metadata.originalContent);

    // Create version history
    const versionDir = path.join(workspaceDir, 'versions');
    await fs.mkdir(versionDir, { recursive: true });
    
    const v0File = path.join(versionDir, 'v0.txt');
    await fs.writeFile(v0File, session.metadata.originalContent);

    // Create edit log
    const editLog = path.join(workspaceDir, 'edits.jsonl');
    await fs.writeFile(editLog, '');

    return workspaceDir;
  }

  async loadWorkspace(session) {
    const workspaceDir = path.join(this.sessionDir, session.id, 'workspace');
    const workingFile = path.join(workspaceDir, 'working.txt');
    
    const currentContent = await fs.readFile(workingFile, 'utf-8');
    
    return {
      workspaceDir: workspaceDir,
      currentContent: currentContent,
      version: session.metadata.version,
      lastEdit: session.editHistory.length > 0 ? 
        session.editHistory[session.editHistory.length - 1] : null
    };
  }

  startRealtimeMonitoring(session) {
    if (session.mode !== 'live') return;

    // Set up file watcher for workspace
    const workspaceDir = path.join(this.sessionDir, session.id, 'workspace');
    const workingFile = path.join(workspaceDir, 'working.txt');

    // Monitor for changes
    let lastContent = session.metadata.currentContent;
    
    this.monitorInterval = setInterval(async () => {
      try {
        const currentContent = await fs.readFile(workingFile, 'utf-8');
        if (currentContent !== lastContent) {
          // Detect and broadcast changes
          const edit = {
            id: `edit-${Date.now()}`,
            author: process.env.USER || 'unknown',
            timestamp: new Date().toISOString(),
            type: 'content_change',
            diff: this.generateDiff(lastContent, currentContent)
          };

          await this.broadcastEdit(session, edit);
          lastContent = currentContent;
        }
      } catch (error) {
        // Workspace may have been cleaned up
      }
    }, 1000); // Check every second
  }

  async subscribeToSessionUpdates(session) {
    // Subscribe to edit broadcasts
    const editLog = path.join(this.sessionDir, session.id, 'workspace', 'edits.jsonl');
    
    // Watch for new edits
    let lastSize = 0;
    this.watchInterval = setInterval(async () => {
      try {
        const stats = await fs.stat(editLog);
        if (stats.size > lastSize) {
          // Read new edits
          const content = await fs.readFile(editLog, 'utf-8');
          const lines = content.trim().split('\n');
          const newEdits = lines.slice(this.editHistory.length);
          
          for (const line of newEdits) {
            if (line) {
              const edit = JSON.parse(line);
              await this.applyRemoteEdit(session, edit);
              this.editHistory.push(edit);
            }
          }
          
          lastSize = stats.size;
        }
      } catch (error) {
        // Edit log may not exist yet
      }
    }, 500); // Check every 500ms
  }

  async broadcastEdit(session, edit) {
    // Add to session history
    session.editHistory.push(edit);
    session.metadata.version++;
    
    // Write to edit log
    const editLog = path.join(this.sessionDir, session.id, 'workspace', 'edits.jsonl');
    await fs.appendFile(editLog, JSON.stringify(edit) + '\n');
    
    // Save session state
    await this.saveSession(session);
    
    // Emit event
    this.emit('edit_broadcast', { sessionId: session.id, edit });
  }

  async applyRemoteEdit(session, edit) {
    if (edit.author === (process.env.USER || 'unknown')) {
      return; // Skip own edits
    }

    console.log(chalk.gray(`📝 ${edit.author} made changes`));

    // Apply edit to workspace
    const workingFile = path.join(this.sessionDir, session.id, 'workspace', 'working.txt');
    
    if (edit.type === 'content_change' && edit.content) {
      await fs.writeFile(workingFile, edit.content);
    }
  }

  generateDiff(oldContent, newContent) {
    // Simple diff generation
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    const diff = {
      additions: 0,
      deletions: 0,
      changes: []
    };
    
    // Compare lines
    const maxLines = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (oldLines[i] !== newLines[i]) {
        if (i >= oldLines.length) {
          diff.additions++;
          diff.changes.push({ type: 'add', line: i, content: newLines[i] });
        } else if (i >= newLines.length) {
          diff.deletions++;
          diff.changes.push({ type: 'delete', line: i, content: oldLines[i] });
        } else {
          diff.changes.push({ type: 'modify', line: i, old: oldLines[i], new: newLines[i] });
        }
      }
    }
    
    return diff;
  }

  getCurrentEditor(session) {
    if (session.mode !== 'turn-based') return null;
    
    // Find current turn holder
    const activeTurn = session.editHistory.find(edit => 
      edit.type === 'turn_taken' && !edit.completed
    );
    
    return activeTurn ? activeTurn.author : null;
  }

  async saveEditHistory(session) {
    // Save current edit state
    const workspaceDir = path.join(this.sessionDir, session.id, 'workspace');
    const versionDir = path.join(workspaceDir, 'versions');
    
    const versionFile = path.join(versionDir, `v${session.metadata.version}.txt`);
    const workingFile = path.join(workspaceDir, 'working.txt');
    
    const content = await fs.readFile(workingFile, 'utf-8');
    await fs.writeFile(versionFile, content);
  }

  async finalizeEdits(session) {
    // Ensure all edits are saved
    await this.saveEditHistory(session);
    
    // Clear any locks
    session.locks = new Map();
    
    // Mark all participants as inactive
    session.participants.forEach(p => {
      if (p.status === 'active') {
        p.status = 'completed';
      }
    });
  }

  async mergeCollaborativeChanges(session, strategy) {
    const result = {
      success: false,
      finalContent: null,
      mergeDetails: []
    };

    try {
      const workingFile = path.join(this.sessionDir, session.id, 'workspace', 'working.txt');
      const finalContent = await fs.readFile(workingFile, 'utf-8');
      
      // Apply to actual component
      const componentPath = path.resolve(this.rootPath, session.componentPath);
      await fs.writeFile(componentPath, finalContent);
      
      result.success = true;
      result.finalContent = finalContent;
      result.mergeDetails.push(`Applied final collaborative edits using ${strategy} strategy`);
      
    } catch (error) {
      result.mergeDetails.push(`Merge failed: ${error.message}`);
    }

    return result;
  }

  calculateDuration(session) {
    const start = new Date(session.createdAt);
    const end = session.endedAt ? new Date(session.endedAt) : new Date();
    
    const duration = end - start;
    const minutes = Math.floor(duration / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  async archiveSession(session) {
    const archiveDir = path.join(this.sessionDir, 'archive');
    await fs.mkdir(archiveDir, { recursive: true });
    
    const archiveFile = path.join(archiveDir, `${session.id}.json`);
    await fs.writeFile(archiveFile, JSON.stringify(session, null, 2));
    
    // Clean up active session files
    const sessionFile = path.join(this.sessionDir, `${session.id}.json`);
    await fs.unlink(sessionFile);
  }

  async listActiveSessions() {
    console.log(chalk.blue('\n📋 Active Collaborative Sessions'));
    console.log(chalk.gray('━'.repeat(50)));
    
    const files = await fs.readdir(this.sessionDir);
    const sessions = [];
    
    for (const file of files) {
      if (file.endsWith('.json') && !file.startsWith('archive')) {
        try {
          const session = await this.loadSession(file.replace('.json', ''));
          if (session.status === 'active') {
            sessions.push(session);
          }
        } catch (error) {
          // Skip invalid files
        }
      }
    }
    
    if (sessions.length === 0) {
      console.log(chalk.gray('No active sessions'));
    } else {
      sessions.forEach(session => {
        console.log(`\n${chalk.white(session.id)}`);
        console.log(`  Component: ${session.componentPath}`);
        console.log(`  Mode: ${session.mode}`);
        console.log(`  Participants: ${session.participants.filter(p => p.status === 'active').length}`);
        console.log(`  Started: ${new Date(session.createdAt).toLocaleString()}`);
      });
    }
    
    return {
      success: true,
      activeSessions: sessions.length,
      sessions: sessions.map(s => ({
        id: s.id,
        component: s.componentPath,
        participants: s.participants.length,
        mode: s.mode
      }))
    };
  }

  getSessionStatistics(session) {
    const stats = {
      totalEdits: session.editHistory.length,
      participants: session.participants.length,
      activeParticipants: session.participants.filter(p => p.status === 'active').length,
      duration: this.calculateDuration(session),
      editsByAuthor: {}
    };
    
    // Count edits by author
    session.editHistory.forEach(edit => {
      if (!stats.editsByAuthor[edit.author]) {
        stats.editsByAuthor[edit.author] = 0;
      }
      stats.editsByAuthor[edit.author]++;
    });
    
    return stats;
  }

  formatStatus(status) {
    const statusMap = {
      active: chalk.green('ACTIVE'),
      completed: chalk.blue('COMPLETED'),
      cancelled: chalk.red('CANCELLED'),
      error: chalk.red('ERROR')
    };
    return statusMap[status] || status;
  }

  // Cleanup
  cleanup() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
    }
  }
}

module.exports = CollaborativeEditTask;
```

## Validation Rules

### Session Management
- Only one active session per component allowed
- Session owner has administrative privileges
- Participants must be invited or have appropriate permissions
- Sessions timeout after specified duration
- All edits must be tracked and versioned

### Editing Modes
- **Live**: Real-time collaborative editing with instant sync
- **Turn-based**: Sequential editing with explicit turn management
- **Review**: Changes require approval before applying

### Conflict Prevention
- Automatic locking for turn-based editing
- Real-time conflict detection for live editing
- Version tracking for all changes
- Rollback capability for problematic edits

## Integration Points

### Modification Synchronizer
- Handles real-time synchronization of edits
- Manages edit broadcasting and receiving
- Tracks version consistency
- Handles network interruptions

### Conflict Manager
- Detects and resolves editing conflicts
- Manages locks and turn-based access
- Handles merge strategies
- Provides conflict visualization

### Notification Service
- Notifies participants of session events
- Alerts on turn changes
- Broadcasts edit notifications
- Handles session invitations

## Security Considerations
- Validate participant permissions
- Encrypt sensitive session data
- Audit all collaborative actions
- Prevent unauthorized access to sessions
- Secure communication channels 