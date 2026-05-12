#!/usr/bin/env node
/**
 * Command Execution Hook
 * 
 * Updates session state after command execution for workflow continuity.
 * 
 * Responsibilities:
 * - Track command execution history
 * - Update session type (new → existing → workflow)
 * - Record agent transitions
 * - Enable intelligent greeting adaptation
 * 
 * Usage:
 *   const { updateSessionAfterCommand } = require('./command-execution-hook');
 *   await updateSessionAfterCommand(agentId, commandName);
 * 
 * Part of Story 6.1.4: Unified Greeting System Integration
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Session state storage location
 */
const SESSION_DIR = path.join(process.cwd(), '.aiox-core', '.session');
const SESSION_FILE = path.join(SESSION_DIR, 'current-session.json');

/**
 * Maximum command history to keep
 */
const MAX_HISTORY_LENGTH = 10;

/**
 * Update session state after command execution
 * 
 * @param {string} agentId - Current agent ID
 * @param {string} commandName - Executed command name
 * @param {Object} options - Optional metadata
 * @param {string} options.previousAgent - Previous agent (for transitions)
 * @param {any} options.result - Command execution result
 * @returns {Promise<Object>} Updated session state
 */
async function updateSessionAfterCommand(agentId, commandName, options = {}) {
  try {
    // Ensure session directory exists
    await fs.mkdir(SESSION_DIR, { recursive: true });
    
    // Load current session or create new
    const session = await loadSession();
    
    // Update command history
    const commandEntry = {
      command: commandName,
      agent: agentId,
      timestamp: Date.now(),
      success: options.result !== undefined ? !options.result.error : true,
    };
    
    session.commandHistory = session.commandHistory || [];
    session.commandHistory.push(commandEntry);
    
    // Keep only last MAX_HISTORY_LENGTH commands
    if (session.commandHistory.length > MAX_HISTORY_LENGTH) {
      session.commandHistory = session.commandHistory.slice(-MAX_HISTORY_LENGTH);
    }
    
    // Update session type based on history
    session.sessionType = determineSessionType(session.commandHistory);
    
    // Track agent transitions
    if (options.previousAgent && options.previousAgent !== agentId) {
      session.previousAgent = options.previousAgent;
      session.agentTransitions = session.agentTransitions || [];
      session.agentTransitions.push({
        from: options.previousAgent,
        to: agentId,
        timestamp: Date.now(),
      });
    }
    
    // Update current agent
    session.currentAgent = agentId;
    session.lastUpdated = Date.now();
    
    // Save session
    await saveSession(session);
    
    return session;
    
  } catch (error) {
    console.warn('[command-execution-hook] Failed to update session:', error.message);
    // Non-blocking: return empty session on error
    return {
      sessionType: 'new',
      currentAgent: agentId,
      commandHistory: [],
      lastUpdated: Date.now(),
    };
  }
}

/**
 * Load current session from disk
 * @private
 * @returns {Promise<Object>} Session object
 */
async function loadSession() {
  try {
    const content = await fs.readFile(SESSION_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // New session
      return {
        sessionType: 'new',
        commandHistory: [],
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };
    }
    throw error;
  }
}

/**
 * Save session to disk
 * @private
 * @param {Object} session - Session object to save
 */
async function saveSession(session) {
  await fs.writeFile(
    SESSION_FILE,
    JSON.stringify(session, null, 2),
    'utf8',
  );
}

/**
 * Determine session type based on command history
 * @private
 * @param {Array} commandHistory - Command history array
 * @returns {string} Session type (new|existing|workflow)
 */
function determineSessionType(commandHistory) {
  if (!commandHistory || commandHistory.length === 0) {
    return 'new';
  }
  
  if (commandHistory.length === 1) {
    return 'existing';
  }
  
  // Workflow detection: 3+ commands or agent transitions
  if (commandHistory.length >= 3) {
    return 'workflow';
  }
  
  return 'existing';
}

/**
 * Get current session state
 * 
 * @returns {Promise<Object>} Current session
 */
async function getCurrentSession() {
  try {
    return await loadSession();
  } catch (error) {
    console.warn('[command-execution-hook] Failed to load session:', error.message);
    return {
      sessionType: 'new',
      commandHistory: [],
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };
  }
}

/**
 * Clear current session (for testing or manual reset)
 * 
 * @returns {Promise<void>}
 */
async function clearSession() {
  try {
    await fs.unlink(SESSION_FILE);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  updateSessionAfterCommand,
  getCurrentSession,
  clearSession,
};

