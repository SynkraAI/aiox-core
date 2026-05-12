/**
 * Output Pattern Validator
 * 
 * Validates that formatted output follows the fixed structure:
 * - Header section exists
 * - Duration appears on line 7
 * - Tokens appears on line 8
 * - Status section before Output section
 * - Metrics section is last
 * 
 * Story: 6.1.6 - Output Formatter Implementation
 */

/**
 * Output Pattern Validator
 * 
 * Validates task execution report structure compliance
 */
class OutputPatternValidator {
  /**
   * Validate output structure
   * @param {string} output - Formatted output to validate
   * @returns {Object} Validation result with errors array
   */
  validate(output) {
    const errors = [];
    const lines = output.split('\n');

    // Check required sections
    this._validateSections(output, errors);
    
    // Check fixed line positions
    this._validateLinePositions(lines, errors);
    
    // Check section order
    this._validateSectionOrder(output, errors);

    return {
      valid: errors.length === 0,
      errors: errors,
    };
  }

  /**
   * Validate required sections exist
   * @private
   * @param {string} output - Output content
   * @param {Array} errors - Errors array to populate
   */
  _validateSections(output, errors) {
    const requiredSections = ['Header', 'Status', 'Output', 'Metrics'];
    const sectionPatterns = {
      'Header': /^## 📊 Task Execution Report/m,
      'Status': /^### Status/m,
      'Output': /^### Output/m,
      'Metrics': /^### Metrics/m,
    };

    for (const section of requiredSections) {
      const pattern = sectionPatterns[section];
      if (!pattern.test(output)) {
        errors.push({
          type: 'missing_section',
          section: section,
          message: `❌ Validation Error: Missing required section '${section}'. Required sections: Header, Status, Output, Metrics`,
        });
      }
    }
  }

  /**
   * Validate fixed line positions
   * @private
   * @param {Array<string>} lines - Output lines
   * @param {Array} errors - Errors array to populate
   */
  _validateLinePositions(lines, errors) {
    // Find Header section start
    let headerStart = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^## 📊 Task Execution Report/)) {
        headerStart = i;
        break;
      }
    }

    if (headerStart === -1) {
      return; // Already reported as missing section
    }

    // Check Duration on line 7 (0-indexed: line 6, relative to header start)
    const expectedDurationLine = headerStart + 6; // Header is line 0, Duration should be line 6 (7th line)
    const expectedTokensLine = headerStart + 7; // Tokens should be line 7 (8th line)
    
    // Find actual positions
    let actualDurationLine = -1;
    let actualTokensLine = -1;
    
    for (let i = headerStart; i < Math.min(headerStart + 15, lines.length); i++) {
      if (lines[i].match(/^\*\*Duration:\*\*/)) {
        actualDurationLine = i;
      }
      if (lines[i].match(/^\*\*Tokens Used:\*\*/)) {
        actualTokensLine = i;
      }
    }
    
    // Validate Duration position
    if (actualDurationLine === -1) {
      errors.push({
        type: 'missing_field',
        field: 'Duration',
        message: '❌ Validation Error: Duration field not found. Expected on line 7. Expected format: **Duration:** {value}',
      });
    } else if (actualDurationLine !== expectedDurationLine) {
      errors.push({
        type: 'wrong_position',
        field: 'Duration',
        expectedLine: expectedDurationLine + 1,
        actualLine: actualDurationLine + 1,
        message: `❌ Validation Error: Duration must appear on line ${expectedDurationLine + 1}, but found on line ${actualDurationLine + 1}. Expected format: **Duration:** {value}`,
      });
    }

    // Validate Tokens position
    if (actualTokensLine === -1) {
      errors.push({
        type: 'missing_field',
        field: 'Tokens',
        message: '❌ Validation Error: Tokens Used field not found. Expected on line 8. Expected format: **Tokens Used:** {value} total',
      });
    } else if (actualTokensLine !== expectedTokensLine) {
      errors.push({
        type: 'wrong_position',
        field: 'Tokens',
        expectedLine: expectedTokensLine + 1,
        actualLine: actualTokensLine + 1,
        message: `❌ Validation Error: Tokens must appear on line ${expectedTokensLine + 1}, but found on line ${actualTokensLine + 1}. Expected format: **Tokens Used:** {value} total`,
      });
    }
  }

  /**
   * Validate section order
   * @private
   * @param {string} output - Output content
   * @param {Array} errors - Errors array to populate
   */
  _validateSectionOrder(output, errors) {
    const sectionOrder = ['Header', 'Status', 'Output', 'Metrics'];
    const sectionMarkers = {
      'Header': /^## 📊 Task Execution Report/m,
      'Status': /^### Status/m,
      'Output': /^### Output/m,
      'Metrics': /^### Metrics/m,
    };

    const positions = {};
    for (const section of sectionOrder) {
      const match = output.match(sectionMarkers[section]);
      if (match) {
        positions[section] = match.index;
      }
    }

    // Check Status before Output
    if (positions['Status'] !== undefined && positions['Output'] !== undefined) {
      if (positions['Status'] > positions['Output']) {
        errors.push({
          type: 'wrong_order',
          message: '❌ Validation Error: Status section must appear before Output section. Expected order: Header → Status → Output → Metrics',
        });
      }
    }

    // Check Metrics is last
    if (positions['Metrics'] !== undefined) {
      const metricsIndex = positions['Metrics'];
      const afterMetrics = output.substring(metricsIndex + 10); // Skip "### Metrics" marker
      
      // Check if there are any other sections after Metrics
      const otherSections = ['Header', 'Status', 'Output'];
      for (const section of otherSections) {
        if (afterMetrics.match(sectionMarkers[section])) {
          errors.push({
            type: 'wrong_order',
            section: section,
            message: `❌ Validation Error: Metrics section must be last, but found '${section}' after it. Expected order: Header → Status → Output → Metrics`,
          });
          break;
        }
      }
    }
  }

  /**
   * Get formatted error messages
   * @param {Object} validationResult - Result from validate()
   * @returns {string} Formatted error messages
   */
  formatErrors(validationResult) {
    if (validationResult.valid) {
      return '✅ Output structure is valid';
    }

    return validationResult.errors
      .map(err => err.message)
      .join('\n');
  }
}

module.exports = OutputPatternValidator;

