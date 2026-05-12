/**
 * Personalized Output Formatter - Layer 2 of Agent Identity System
 *
 * Implements template engine with personality injection while maintaining
 * fixed output structure (familiaridade + personalização).
 *
 * @module core/utils/output-formatter
 * @migrated Story 2.2 - Core Module Creation
 * Story: 6.1.6 - Output Formatter Implementation
 * Performance Target: <50ms per output generation
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Personalized Output Formatter
 *
 * Generates standardized task execution reports with agent personality injection.
 * Maintains fixed structure (Duration line 7, Tokens line 8, Metrics last) while
 * allowing flexible tone/vocabulary in status messages.
 */
class PersonalizedOutputFormatter {
  /**
   * @param {Object} agent - Agent definition object
   * @param {Object} task - Task information
   * @param {Object} results - Task execution results
   */
  constructor(agent, task, results) {
    this.agent = agent;
    this.task = task;
    this.results = results;
    this.personaProfile = null;
    this.vocabularyCache = new Map();

    // Load persona_profile from agent
    this._loadPersonaProfile();
  }

  /**
   * Load persona_profile from agent file
   * @private
   */
  _loadPersonaProfile() {
    try {
      if (!this.agent || !this.agent.id) {
        console.warn('[OutputFormatter] Agent ID missing, using neutral profile');
        this.personaProfile = this._getNeutralProfile();
        return;
      }

      const agentPath = path.join(process.cwd(), '.aiox-core', 'agents', `${this.agent.id}.md`);

      if (!fs.existsSync(agentPath)) {
        console.warn(`[OutputFormatter] Agent file not found: ${agentPath}`);
        this.personaProfile = this._getNeutralProfile();
        return;
      }

      const content = fs.readFileSync(agentPath, 'utf8');
      const yamlMatch = content.match(/```ya?ml\r?\n([\s\S]*?)\r?\n```/);

      if (!yamlMatch) {
        console.warn('[OutputFormatter] No YAML block found in agent file');
        this.personaProfile = this._getNeutralProfile();
        return;
      }

      const agentConfig = yaml.load(yamlMatch[1]);
      this.personaProfile = agentConfig.persona_profile || this._getNeutralProfile();

      // Cache vocabulary for performance
      if (this.personaProfile.communication?.vocabulary) {
        this.vocabularyCache.set(this.agent.id, this.personaProfile.communication.vocabulary);
      }
    } catch (error) {
      console.warn(`[OutputFormatter] Error loading persona_profile: ${error.message}`);
      this.personaProfile = this._getNeutralProfile();
    }
  }

  /**
   * Get neutral profile for graceful degradation
   * @private
   * @returns {Object} Neutral persona profile
   */
  _getNeutralProfile() {
    return {
      archetype: 'Agent',
      communication: {
        tone: 'neutral',
        emoji_frequency: 'low',
        vocabulary: ['completar', 'executar', 'finalizar'],
        greeting_levels: {
          minimal: 'Agent ready',
          named: 'Agent ready',
          archetypal: 'Agent ready',
        },
        signature_closing: '— Agent',
      },
    };
  }

  /**
   * Generate complete formatted output
   * @returns {string} Formatted markdown output
   */
  format() {
    const startTime = process.hrtime.bigint();

    try {
      const header = this.buildFixedHeader();
      const status = this.buildPersonalizedStatus();
      const output = this.buildOutput();
      const metrics = this.buildFixedMetrics();
      const signature = this.buildSignature();

      const formatted = [
        header,
        '',
        '---',
        '',
        status,
        '',
        output,
        '',
        metrics,
        '',
        '---',
        signature,
      ].join('\n');

      const duration = Number(process.hrtime.bigint() - startTime) / 1000000; // Convert to ms
      if (duration > 100) {
        console.warn(`[OutputFormatter] Performance warning: ${duration.toFixed(2)}ms (target: <50ms)`);
      }

      return formatted;
    } catch (error) {
      console.error(`[OutputFormatter] Format error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build fixed header section (always same format)
   * Line 7: Duration
   * Line 8: Tokens Used
   * @returns {string} Header markdown
   */
  buildFixedHeader() {
    const agentName = this.agent?.name || this.agent?.id || 'Agent';
    const archetype = this.personaProfile?.archetype || 'Agent';
    const taskName = this.task?.name || 'task';
    const startTime = this.results?.startTime || new Date().toISOString();
    const endTime = this.results?.endTime || new Date().toISOString();
    const duration = this.results?.duration || '0s';
    const tokensTotal = this.results?.tokens?.total || 0;
    const tokensFormatted = tokensTotal.toLocaleString('en-US');

    return `## 📊 Task Execution Report

**Agent:** ${agentName} (${archetype})
**Task:** ${taskName}
**Started:** ${startTime}
**Completed:** ${endTime}
**Duration:** ${duration}
**Tokens Used:** ${tokensFormatted} total`;
  }

  /**
   * Build personalized status message
   * Uses agent vocabulary and tone for personality injection
   * @returns {string} Status section markdown
   */
  buildPersonalizedStatus() {
    const tone = this.personaProfile?.communication?.tone || 'neutral';
    const vocabulary = this.personaProfile?.communication?.vocabulary || [];
    const verb = this.selectVerbFromVocabulary(vocabulary);
    const message = this.generateSuccessMessage(tone, verb);
    const statusIcon = this.results?.success !== false ? '✅' : '❌';

    return `### Status
${statusIcon} ${message}`;
  }

  /**
   * Build output section with task-specific content
   * @returns {string} Output section markdown
   */
  buildOutput() {
    const outputContent = this.results?.output || this.results?.content || 'Task completed successfully.';

    return `### Output
${outputContent}`;
  }

  /**
   * Build fixed metrics section (always last)
   * @returns {string} Metrics section markdown
   */
  buildFixedMetrics() {
    const testsPassed = this.results?.tests?.passed || 0;
    const testsTotal = this.results?.tests?.total || 0;
    const coverage = this.results?.coverage || 'N/A';
    const lintStatus = this.results?.linting?.status || '✅ Clean';

    return `### Metrics
- Tests: ${testsPassed}/${testsTotal}
- Coverage: ${coverage}%
- Linting: ${lintStatus}`;
  }

  /**
   * Build signature closing with personality
   * @returns {string} Signature markdown
   */
  buildSignature() {
    const signature = this.personaProfile?.communication?.signature_closing || '— Agent';
    return signature;
  }

  /**
   * Select appropriate verb from vocabulary array
   * @param {Array<string>} vocabulary - Agent vocabulary array
   * @returns {string} Selected verb
   */
  selectVerbFromVocabulary(vocabulary) {
    if (!vocabulary || vocabulary.length === 0) {
      return 'completar';
    }

    // Simple selection: use first verb (can be enhanced with context-aware selection)
    return vocabulary[0];
  }

  /**
   * Generate success message based on tone
   * @param {string} tone - Agent tone (pragmatic, empathetic, analytical, collaborative, neutral)
   * @param {string} verb - Selected verb from vocabulary
   * @returns {string} Personalized status message
   */
  generateSuccessMessage(tone, verb) {
    const verbPast = this._getPastTense(verb);

    switch (tone) {
      case 'pragmatic':
        return `Tá pronto! ${this._capitalize(verbPast)} com sucesso.`;

      case 'empathetic':
        return `${this._capitalize(verbPast)} com cuidado e atenção aos detalhes.`;

      case 'analytical':
        return `${this._capitalize(verbPast)} rigorosamente. Todos os critérios validados.`;

      case 'collaborative':
        return `${this._capitalize(verbPast)} e harmonizado. Todos os aspectos alinhados.`;

      case 'neutral':
      default:
        return `Task ${verbPast} successfully.`;
    }
  }

  /**
   * Get past tense of Portuguese verb (simple conversion)
   * @private
   * @param {string} verb - Verb in infinitive form
   * @returns {string} Past tense verb
   */
  _getPastTense(verb) {
    // Simple Portuguese past tense conversion
    if (verb.endsWith('ar')) {
      return verb.replace(/ar$/, 'ado');
    } else if (verb.endsWith('er')) {
      return verb.replace(/er$/, 'ido');
    } else if (verb.endsWith('ir')) {
      return verb.replace(/ir$/, 'ido');
    } else if (verb.endsWith('or')) {
      // Special case: construir -> construído (but we'll use simple form)
      return verb.replace(/or$/, 'ido');
    }
    return verb; // Fallback
  }

  /**
   * Capitalize first letter
   * @private
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = PersonalizedOutputFormatter;
