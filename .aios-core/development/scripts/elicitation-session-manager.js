/**
 * Elicitation Session Manager
 * Handles saving and loading elicitation sessions
 * @module elicitation-session-manager
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class ElicitationSessionManager {
  constructor(sessionDir = '.aios-sessions') {
    this.sessionDir = path.resolve(process.cwd(), sessionDir);
    this.activeSession = null;
  }

  /**
   * Initialize session storage
   */
  async init() {
    await fs.ensureDir(this.sessionDir);
  }

  /**
   * Create a new session
   * @param {string} type - Component type (agent, task, workflow)
   * @param {Object} metadata - Additional session metadata
   * @returns {Promise<string>} Session ID
   */
  async createSession(type, metadata = {}) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      type,
      version: '1.0',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      status: 'active',
      currentStep: 0,
      totalSteps: 0,
      answers: {},
      metadata: {
        ...metadata,
        user: process.env.USER || 'unknown',
        hostname: require('os').hostname()
      }
    };

    this.activeSession = session;
    await this.saveSession(session);
    
    return sessionId;
  }

  /**
   * Save current session state
   * @param {Object} session - Session data to save
   */
  async saveSession(session = null) {
    const sessionToSave = session || this.activeSession;
    if (!sessionToSave) {
      throw new Error('No active session to save');
    }

    sessionToSave.updated = new Date().toISOString();
    
    const sessionPath = this.getSessionPath(sessionToSave.id);
    await fs.writeJson(sessionPath, sessionToSave, { spaces: 2 });
  }

  /**
   * Load an existing session
   * @param {string} sessionId - Session ID to load
   * @returns {Promise<Object>} Session data
   */
  async loadSession(sessionId) {
    const sessionPath = this.getSessionPath(sessionId);
    
    if (!await fs.pathExists(sessionPath)) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const session = await fs.readJson(sessionPath);
    this.activeSession = session;
    
    return session;
  }

  /**
   * Update session answers
   * @param {Object} answers - New answers to merge
   * @param {number} stepIndex - Current step index
   */
  async updateAnswers(answers, stepIndex = null) {
    if (!this.activeSession) {
      throw new Error('No active session');
    }

    // Merge answers
    Object.assign(this.activeSession.answers, answers);
    
    // Update step index if provided
    if (stepIndex !== null) {
      this.activeSession.currentStep = stepIndex;
    }

    await this.saveSession();
  }

  /**
   * List all sessions
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of sessions
   */
  async listSessions(filters = {}) {
    const files = await fs.readdir(this.sessionDir);
    const sessions = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const sessionPath = path.join(this.sessionDir, file);
          const session = await fs.readJson(sessionPath);
          
          // Apply filters
          if (filters.type && session.type !== filters.type) continue;
          if (filters.status && session.status !== filters.status) continue;
          if (filters.after && new Date(session.created) < new Date(filters.after)) continue;
          
          sessions.push({
            id: session.id,
            type: session.type,
            created: session.created,
            updated: session.updated,
            status: session.status,
            progress: session.totalSteps > 0 ? 
              Math.round((session.currentStep / session.totalSteps) * 100) : 0
          });
        } catch (_error) {
          // Skip invalid session files
          console.warn(`Invalid session file: ${file}`);
        }
      }
    }

    // Sort by updated date (newest first)
    sessions.sort((a, b) => new Date(b.updated) - new Date(a.updated));
    
    return sessions;
  }

  /**
   * Resume a session
   * @param {string} sessionId - Session ID to resume
   * @returns {Promise<Object>} Session data with resume info
   */
  async resumeSession(sessionId) {
    const session = await this.loadSession(sessionId);
    
    // Calculate resume information
    const resumeInfo = {
      ...session,
      resumeFrom: session.currentStep,
      completedSteps: Object.keys(session.answers).length,
      remainingSteps: session.totalSteps - session.currentStep,
      percentComplete: session.totalSteps > 0 ? 
        Math.round((session.currentStep / session.totalSteps) * 100) : 0
    };

    return resumeInfo;
  }

  /**
   * Complete a session
   * @param {string} result - Completion result (success, cancelled, error)
   */
  async completeSession(result = 'success') {
    if (!this.activeSession) {
      throw new Error('No active session');
    }

    this.activeSession.status = 'completed';
    this.activeSession.completedAt = new Date().toISOString();
    this.activeSession.result = result;
    
    await this.saveSession();
    
    // Move to completed directory if success
    if (result === 'success') {
      const completedDir = path.join(this.sessionDir, 'completed');
      await fs.ensureDir(completedDir);
      
      const oldPath = this.getSessionPath(this.activeSession.id);
      const newPath = path.join(completedDir, path.basename(oldPath));
      
      await fs.move(oldPath, newPath, { overwrite: true });
    }

    this.activeSession = null;
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID to delete
   */
  async deleteSession(sessionId) {
    const sessionPath = this.getSessionPath(sessionId);
    const completedPath = path.join(this.sessionDir, 'completed', `${sessionId}.json`);
    
    // Check both active and completed directories
    if (await fs.pathExists(sessionPath)) {
      await fs.remove(sessionPath);
    } else if (await fs.pathExists(completedPath)) {
      await fs.remove(completedPath);
    } else {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Clear active session if it matches
    if (this.activeSession && this.activeSession.id === sessionId) {
      this.activeSession = null;
    }
  }

  /**
   * Export session data
   * @param {string} sessionId - Session ID to export
   * @param {string} format - Export format (json, yaml)
   * @returns {Promise<string>} Exported data
   */
  async exportSession(sessionId, format = 'json') {
    const session = await this.loadSession(sessionId);
    
    switch (format) {
      case 'json':
        return JSON.stringify(session, null, 2);
        
      case 'yaml':
        const yaml = require('js-yaml');
        return yaml.dump(session);
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Clean up old sessions
   * @param {number} daysOld - Delete sessions older than this many days
   */
  async cleanupOldSessions(daysOld = 30) {
    const sessions = await this.listSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let deletedCount = 0;
    
    for (const session of sessions) {
      if (new Date(session.updated) < cutoffDate && session.status !== 'active') {
        await this.deleteSession(session.id);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  /**
   * Generate a unique session ID
   * @private
   */
  generateSessionId() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Get session file path
   * @private
   */
  getSessionPath(sessionId) {
    return path.join(this.sessionDir, `${sessionId}.json`);
  }

  /**
   * Get active session
   * @returns {Object|null} Active session or null
   */
  getActiveSession() {
    return this.activeSession;
  }

  /**
   * Clear active session
   */
  clearActiveSession() {
    this.activeSession = null;
  }
}

module.exports = ElicitationSessionManager;