/**
 * Parallel Execution Monitor
 * Story 10.6 - Parallel Agent Execution
 *
 * Provides real-time visibility into parallel executions
 * with CLI commands and dashboard integration.
 */

const EventEmitter = require('events');

class ParallelMonitor extends EventEmitter {
  constructor(config = {}) {
    super();

    // Active executions tracking
    this.activeWaves = new Map();
    this.activeTasks = new Map();

    // Execution history
    this.history = [];
    this.maxHistory = config.maxHistory || 100;

    // Task logs
    this.taskLogs = new Map();
    this.maxLogLines = config.maxLogLines || 1000;

    // Notification settings
    this.notifyOnComplete = config.notifyOnComplete !== false;
    this.notifyOnFailure = config.notifyOnFailure !== false;

    // WebSocket connections (for dashboard)
    this.wsConnections = new Set();
  }

  /**
   * Register a wave execution
   * @param {string} waveId - Wave identifier
   * @param {Object} waveData - Wave data
   */
  registerWave(waveId, waveData) {
    this.activeWaves.set(waveId, {
      id: waveId,
      workflowId: waveData.workflowId,
      index: waveData.index || waveData.waveIndex,
      tasks: waveData.tasks.map((t) => ({
        id: t.id,
        description: t.description,
        agent: t.agent || 'unknown',
        status: 'pending',
      })),
      startedAt: new Date().toISOString(),
      status: 'running',
    });

    this.emit('wave_registered', { waveId, taskCount: waveData.tasks.length });
    this.broadcast('wave_registered', { waveId, wave: this.activeWaves.get(waveId) });
  }

  /**
   * Register a task start
   * @param {string} taskId - Task identifier
   * @param {Object} taskData - Task data
   */
  registerTaskStart(taskId, taskData) {
    const task = {
      id: taskId,
      waveId: taskData.waveId,
      agent: taskData.agent || taskData.agentId,
      description: taskData.description,
      startedAt: new Date().toISOString(),
      status: 'running',
      output: [],
    };

    this.activeTasks.set(taskId, task);
    this.taskLogs.set(taskId, []);

    // Update wave if exists
    const wave = this.activeWaves.get(taskData.waveId);
    if (wave) {
      const waveTask = wave.tasks.find((t) => t.id === taskId);
      if (waveTask) {
        waveTask.status = 'running';
        waveTask.startedAt = task.startedAt;
      }
    }

    this.emit('task_started', { taskId, task });
    this.broadcast('task_started', { taskId, task });
  }

  /**
   * Add output to a task
   * @param {string} taskId - Task identifier
   * @param {string} line - Output line
   */
  addTaskOutput(taskId, line) {
    const logs = this.taskLogs.get(taskId);
    if (logs) {
      logs.push({
        timestamp: new Date().toISOString(),
        line,
      });

      // Trim if too long
      if (logs.length > this.maxLogLines) {
        logs.shift();
      }
    }

    const task = this.activeTasks.get(taskId);
    if (task) {
      task.output.push(line);
      if (task.output.length > 50) {
        task.output.shift();
      }
    }

    this.broadcast('task_output', { taskId, line });
  }

  /**
   * Register a task completion
   * @param {string} taskId - Task identifier
   * @param {Object} result - Task result
   */
  registerTaskComplete(taskId, result) {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.completedAt = new Date().toISOString();
      task.status = result.success ? 'completed' : 'failed';
      task.duration = Date.now() - new Date(task.startedAt).getTime();
      task.error = result.error;
      task.filesModified = result.filesModified || [];

      // Update wave
      const wave = this.activeWaves.get(task.waveId);
      if (wave) {
        const waveTask = wave.tasks.find((t) => t.id === taskId);
        if (waveTask) {
          waveTask.status = task.status;
          waveTask.duration = task.duration;
        }
      }

      // Add to history
      this.history.push({
        taskId,
        waveId: task.waveId,
        agent: task.agent,
        status: task.status,
        duration: task.duration,
        completedAt: task.completedAt,
      });

      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      // Notify
      if (this.notifyOnFailure && !result.success) {
        this.emit('task_failed', { taskId, error: result.error });
      }

      this.emit('task_completed', { taskId, result: task });
      this.broadcast('task_completed', { taskId, task });

      // Remove from active after delay
      setTimeout(() => {
        this.activeTasks.delete(taskId);
      }, 10000);
    }
  }

  /**
   * Register a wave completion
   * @param {string} waveId - Wave identifier
   * @param {Object} result - Wave result
   */
  registerWaveComplete(waveId, result) {
    const wave = this.activeWaves.get(waveId);
    if (wave) {
      wave.completedAt = new Date().toISOString();
      wave.status = result.success ? 'completed' : 'failed';
      wave.duration = Date.now() - new Date(wave.startedAt).getTime();
      wave.metrics = result.metrics;

      // Notify
      if (this.notifyOnComplete) {
        this.emit('wave_completed', { waveId, success: result.success });
      }

      this.broadcast('wave_completed', { waveId, wave });

      // Move to history after delay
      setTimeout(() => {
        this.activeWaves.delete(waveId);
      }, 30000);
    }
  }

  /**
   * Get current status of all active executions
   * @returns {Object} - Status object
   */
  getStatus() {
    const waves = [];

    for (const [waveId, wave] of this.activeWaves) {
      const completed = wave.tasks.filter((t) => t.status === 'completed').length;
      const failed = wave.tasks.filter((t) => t.status === 'failed').length;
      const running = wave.tasks.filter((t) => t.status === 'running').length;
      const pending = wave.tasks.filter((t) => t.status === 'pending').length;

      waves.push({
        waveId,
        workflowId: wave.workflowId,
        index: wave.index,
        status: wave.status,
        progress: {
          completed,
          failed,
          running,
          pending,
          total: wave.tasks.length,
        },
        tasks: wave.tasks,
        startedAt: wave.startedAt,
        duration: wave.duration || Date.now() - new Date(wave.startedAt).getTime(),
      });
    }

    return {
      activeWaves: waves.length,
      activeTasks: this.activeTasks.size,
      waves,
      recentHistory: this.history.slice(-10),
    };
  }

  /**
   * Get logs for a specific task
   * @param {string} taskId - Task identifier
   * @param {number} limit - Max lines
   * @returns {Array} - Log entries
   */
  getTaskLogs(taskId, limit = 100) {
    const logs = this.taskLogs.get(taskId);
    if (!logs) return [];
    return logs.slice(-limit);
  }

  /**
   * Cancel a wave execution
   * @param {string} waveId - Wave identifier
   */
  cancelWave(waveId) {
    const wave = this.activeWaves.get(waveId);
    if (wave && wave.status === 'running') {
      wave.status = 'cancelled';
      wave.completedAt = new Date().toISOString();

      // Mark pending tasks as cancelled
      for (const task of wave.tasks) {
        if (task.status === 'pending' || task.status === 'running') {
          task.status = 'cancelled';
        }
      }

      this.emit('wave_cancelled', { waveId });
      this.broadcast('wave_cancelled', { waveId });
    }
  }

  /**
   * Format progress bar
   * @param {number} completed - Completed count
   * @param {number} failed - Failed count
   * @param {number} running - Running count
   * @param {number} pending - Pending count
   * @returns {string} - ASCII progress bar
   */
  formatProgressBar(completed, failed, running, pending) {
    const total = completed + failed + running + pending;
    if (total === 0) return '[          ] 0/0';

    const width = 20;
    const completedChars = Math.floor((completed / total) * width);
    const failedChars = Math.floor((failed / total) * width);
    const runningChars = Math.floor((running / total) * width);
    const pendingChars = width - completedChars - failedChars - runningChars;

    const bar =
      '▓'.repeat(completedChars) +
      '░'.repeat(failedChars) +
      '▒'.repeat(runningChars) +
      '·'.repeat(Math.max(0, pendingChars));

    return `[${bar}] ${completed + failed}/${total}`;
  }

  /**
   * Format status for CLI output
   * @returns {string} - Formatted status
   */
  formatStatus() {
    const status = this.getStatus();

    let output = '📊 Parallel Execution Status\n';
    output += '━'.repeat(50) + '\n\n';

    if (status.waves.length === 0) {
      output += '  No active executions\n';
    } else {
      for (const wave of status.waves) {
        const { completed, failed, running, pending, total: _total } = wave.progress;
        const progressBar = this.formatProgressBar(completed, failed, running, pending);
        const duration = Math.round(wave.duration / 1000);

        output += `Wave ${wave.index} (${wave.workflowId || 'unknown'})\n`;
        output += `  ${progressBar} (${duration}s)\n`;

        for (const task of wave.tasks) {
          const icon = {
            completed: '✅',
            failed: '❌',
            running: '🔄',
            pending: '⏳',
            cancelled: '🚫',
          }[task.status];

          output += `  ${icon} ${task.id}`;
          if (task.agent) output += ` (${task.agent})`;
          if (task.duration) output += ` - ${Math.round(task.duration / 1000)}s`;
          output += '\n';
        }

        output += '\n';
      }
    }

    if (status.recentHistory.length > 0) {
      output += 'Recent Activity:\n';
      for (const entry of status.recentHistory.slice(-5)) {
        const icon = entry.status === 'completed' ? '✅' : '❌';
        const time = entry.completedAt.split('T')[1].split('.')[0];
        output += `  [${time}] ${icon} ${entry.taskId}\n`;
      }
    }

    return output;
  }

  /**
   * Register a WebSocket connection
   * @param {Object} ws - WebSocket connection
   */
  registerConnection(ws) {
    this.wsConnections.add(ws);

    ws.on('close', () => {
      this.wsConnections.delete(ws);
    });

    // Send current status
    ws.send(
      JSON.stringify({
        type: 'status',
        data: this.getStatus(),
      }),
    );
  }

  /**
   * Broadcast message to all connections
   * @param {string} type - Message type
   * @param {Object} data - Message data
   */
  broadcast(type, data) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });

    for (const ws of this.wsConnections) {
      try {
        ws.send(message);
      } catch (_error) {
        // Connection might be closed
        this.wsConnections.delete(ws);
      }
    }
  }

  /**
   * Get execution history
   * @param {number} limit - Max entries
   * @returns {Array} - History entries
   */
  getHistory(limit = 50) {
    return this.history.slice(-limit);
  }

  /**
   * Clear all data
   */
  clear() {
    this.activeWaves.clear();
    this.activeTasks.clear();
    this.taskLogs.clear();
    this.history = [];
  }
}

// Singleton instance
let instance = null;

/**
 * Get the global ParallelMonitor instance
 * @param {Object} config - Configuration
 * @returns {ParallelMonitor}
 */
function getMonitor(config = {}) {
  if (!instance) {
    instance = new ParallelMonitor(config);
  }
  return instance;
}

module.exports = ParallelMonitor;
module.exports.ParallelMonitor = ParallelMonitor;
module.exports.getMonitor = getMonitor;
