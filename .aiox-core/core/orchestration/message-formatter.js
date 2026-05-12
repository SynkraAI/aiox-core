/**
 * Message Formatter — Educational Mode Message Formatting
 *
 * Story 12.7: Modo Educativo (Opt-in)
 * PRD Reference: §0.5 (Modo Educativo do Bob)
 *
 * Formats Bob's messages based on educational mode:
 * - OFF (default): Concise messages, just results
 * - ON: Detailed explanations with trade-offs, reasoning, and agent info
 *
 * @module core/orchestration/message-formatter
 * @version 1.0.0
 */

'use strict';

/**
 * Message Formatter class
 */
class MessageFormatter {
  /**
   * Creates a new MessageFormatter instance
   * @param {Object} options - Formatter options
   * @param {boolean} [options.educationalMode=false] - Enable educational mode
   */
  constructor(options = {}) {
    this.educationalMode = options.educationalMode || false;
  }

  /**
   * Sets the educational mode
   * @param {boolean} enabled - Whether educational mode is enabled
   */
  setEducationalMode(enabled) {
    this.educationalMode = Boolean(enabled);
  }

  /**
   * Gets the current educational mode state
   * @returns {boolean} Current educational mode state
   */
  isEducationalMode() {
    return this.educationalMode;
  }

  /**
   * Formats an action result message
   *
   * @param {string} action - Action name (e.g., 'Autenticação JWT')
   * @param {Object} details - Action details
   * @param {number} [details.filesCreated=0] - Number of files created
   * @param {number} [details.filesModified=0] - Number of files modified
   * @param {string} [details.reason] - Why this action (educational mode)
   * @param {string[]} [details.steps] - Steps taken (educational mode)
   * @param {Object[]} [details.agents] - Agents involved (educational mode)
   * @param {Object[]} [details.tradeoffs] - Trade-offs considered (educational mode)
   * @returns {string} Formatted message
   */
  formatActionResult(action, details = {}) {
    const {
      filesCreated = 0,
      filesModified = 0,
      reason,
      steps,
      agents,
      tradeoffs,
    } = details;

    const totalFiles = filesCreated + filesModified;

    if (!this.educationalMode) {
      // OFF mode: Concise message
      let fileInfo = '';
      if (filesCreated > 0 && filesModified > 0) {
        fileInfo = `${filesCreated} arquivo${filesCreated > 1 ? 's' : ''} criado${filesCreated > 1 ? 's' : ''}, ${filesModified} modificado${filesModified > 1 ? 's' : ''}.`;
      } else if (filesCreated > 0) {
        fileInfo = `${filesCreated} arquivo${filesCreated > 1 ? 's' : ''} criado${filesCreated > 1 ? 's' : ''}.`;
      } else if (filesModified > 0) {
        fileInfo = `${filesModified} arquivo${filesModified > 1 ? 's' : ''} modificado${filesModified > 1 ? 's' : ''}.`;
      } else if (totalFiles === 0) {
        fileInfo = 'Concluído.';
      }

      return `✅ ${action} implementada. ${fileInfo}`;
    }

    // ON mode: Detailed message with explanations
    let message = `Vou implementar ${action}.\n`;

    // Add reason (📚 Por quê?)
    if (reason) {
      message += '\n📚 Por quê?\n';
      message += `   ${reason}\n`;
    }

    // Add trade-offs if provided
    if (tradeoffs && tradeoffs.length > 0) {
      message += '\n   Trade-offs:\n';
      for (const tradeoff of tradeoffs) {
        message += `   - ${tradeoff.choice}: ${tradeoff.selected}\n`;
        if (tradeoff.reason) {
          message += `     Motivo: ${tradeoff.reason}\n`;
        }
      }
    }

    // Add steps (🔧 O que vou fazer)
    if (steps && steps.length > 0) {
      message += '\n🔧 O que vou fazer:\n';
      steps.forEach((step, index) => {
        message += `   ${index + 1}. ${step}\n`;
      });
    }

    // Add agents involved
    if (agents && agents.length > 0) {
      message += '\n👥 Agentes envolvidos:\n';
      for (const agent of agents) {
        message += `   - ${agent.id} (${agent.name}): ${agent.task}\n`;
      }
    }

    // Add file summary
    if (totalFiles > 0) {
      message += `\n📁 Arquivos: ${filesCreated} criado${filesCreated !== 1 ? 's' : ''}, ${filesModified} modificado${filesModified !== 1 ? 's' : ''}\n`;
    }

    return message;
  }

  /**
   * Formats a decision explanation
   *
   * @param {string} decision - Decision description
   * @param {Object[]} [tradeoffs] - Trade-offs considered
   * @param {string} [tradeoffs[].choice] - The choice made
   * @param {string} [tradeoffs[].selected] - Selected option
   * @param {string} [tradeoffs[].reason] - Reason for selection
   * @returns {string} Formatted explanation (empty string if educational mode is OFF)
   */
  formatDecisionExplanation(decision, tradeoffs = []) {
    if (!this.educationalMode) {
      // OFF mode: Silence (no output)
      return '';
    }

    // ON mode: Detailed explanation
    let message = `\n💡 Decisão: ${decision}\n`;

    if (tradeoffs && tradeoffs.length > 0) {
      message += '\n📊 Trade-offs considerados:\n';
      for (const tradeoff of tradeoffs) {
        message += `   • ${tradeoff.choice}\n`;
        message += `     → Escolhido: ${tradeoff.selected}\n`;
        if (tradeoff.reason) {
          message += `     → Motivo: ${tradeoff.reason}\n`;
        }
      }
    }

    return message;
  }

  /**
   * Formats an agent assignment message
   *
   * @param {string} agentId - Agent ID (e.g., '@dev')
   * @param {string} agentName - Agent name (e.g., 'Dex')
   * @param {string} task - Task description
   * @param {string} [reason] - Why this agent was chosen
   * @returns {string} Formatted message (empty string if educational mode is OFF)
   */
  formatAgentAssignment(agentId, agentName, task, reason = null) {
    if (!this.educationalMode) {
      // OFF mode: No output for agent assignments
      return '';
    }

    // ON mode: Explain agent assignment
    let message = `\n🤖 ${agentId} (${agentName}) assumindo: ${task}\n`;

    if (reason) {
      message += `   Por quê: ${reason}\n`;
    }

    return message;
  }

  /**
   * Formats the educational mode toggle feedback message
   *
   * @param {boolean} enabled - Whether educational mode was enabled
   * @returns {string} Feedback message
   */
  formatToggleFeedback(enabled) {
    if (enabled) {
      return '🎓 Modo educativo ativado! Agora você verá explicações detalhadas sobre cada decisão.';
    }
    return '📋 Modo educativo desativado. Mensagens voltarão a ser concisas.';
  }

  /**
   * Formats the persistence choice prompt
   *
   * @returns {string} Prompt for session vs permanent choice
   */
  formatPersistencePrompt() {
    return `Ativar apenas para esta sessão ou permanentemente?

[1] Sessão (temporário, só dura esta sessão)
[2] Permanente (salvo nas suas preferências)`;
  }

  /**
   * Formats a phase transition message
   *
   * @param {string} phase - Phase name
   * @param {string} storyId - Story ID
   * @param {string} [executor] - Executor agent
   * @returns {string} Formatted message (empty string if educational mode is OFF)
   */
  formatPhaseTransition(phase, storyId, executor = null) {
    if (!this.educationalMode) {
      return '';
    }

    let message = `\n📍 Fase: ${phase} → Story ${storyId}\n`;

    if (executor) {
      message += `   Executor: ${executor}\n`;
    }

    return message;
  }

  /**
   * Formats an error message
   *
   * @param {string} error - Error message
   * @param {Object} [context] - Error context
   * @param {string} [context.phase] - Phase where error occurred
   * @param {string} [context.agent] - Agent that encountered error
   * @param {string} [context.suggestion] - Suggested fix
   * @returns {string} Formatted error message
   */
  formatError(error, context = {}) {
    const { phase, agent, suggestion } = context;

    let message = `❌ Erro: ${error}\n`;

    if (this.educationalMode) {
      if (phase) {
        message += `   Fase: ${phase}\n`;
      }
      if (agent) {
        message += `   Agente: ${agent}\n`;
      }
      if (suggestion) {
        message += `   💡 Sugestão: ${suggestion}\n`;
      }
    }

    return message;
  }
}

/**
 * Creates a new MessageFormatter instance
 * @param {Object} options - Formatter options
 * @returns {MessageFormatter} MessageFormatter instance
 */
function createMessageFormatter(options = {}) {
  return new MessageFormatter(options);
}

module.exports = {
  MessageFormatter,
  createMessageFormatter,
};
