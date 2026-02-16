/**
 * Subagent Prompt Builder - Assembles prompts from REAL TASKS
 *
 * This module does NOT generate generic prompts. Instead, it loads:
 * - Complete agent definition (.md file)
 * - Complete task definition (.md file)
 * - Referenced checklists
 * - Referenced templates
 *
 * The subagent receives the FULL task instructions, not a summary.
 *
 * @module core/orchestration/subagent-prompt-builder
 * @version 1.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Builds structured prompts for subagents using real task definitions
 */
class SubagentPromptBuilder {
  /**
   * @param {string} projectRoot - Project root directory
   */
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.aiosCoreRoot = path.join(projectRoot, '.aios-core');

    // Paths to AIOS components
    this.paths = {
      agents: path.join(this.aiosCoreRoot, 'development', 'agents'),
      tasks: path.join(this.aiosCoreRoot, 'development', 'tasks'),
      checklists: path.join(this.aiosCoreRoot, 'product', 'checklists'),
      templates: path.join(this.aiosCoreRoot, 'product', 'templates'),
    };
  }

  /**
   * Build a complete prompt for a subagent
   * Loads REAL task files, NOT generic prompts
   *
   * @param {string} agentId - Agent identifier (e.g., 'architect', 'data-engineer')
   * @param {string} taskFile - Task file name (e.g., 'document-project.md')
   * @param {Object} context - Execution context
   * @returns {Promise<string>} Complete prompt for subagent
   */
  async buildPrompt(agentId, taskFile, context = {}) {
    // 1. Load complete agent definition
    const agentDef = await this.loadAgentDefinition(agentId);

    // 2. Load complete task definition
    const taskDef = await this.loadTaskDefinition(taskFile);

    // 3. Extract and load referenced checklists from task
    const checklists = await this.extractAndLoadChecklists(taskDef, context.checklist);

    // 4. Extract and load referenced templates from task
    const templates = await this.extractAndLoadTemplates(taskDef, context.template);

    // 5. Build context section from previous phases
    const contextSection = this.formatContextSection(context);

    // 6. Assemble the complete prompt
    return this.assemblePrompt({
      agentId,
      agentDef,
      taskFile,
      taskDef,
      checklists,
      templates,
      context,
      contextSection,
    });
  }

  /**
   * Load complete agent definition file
   * @param {string} agentId - Agent identifier
   * @returns {Promise<string>} Complete agent .md file content
   */
  async loadAgentDefinition(agentId) {
    // Try different file naming patterns
    const patterns = [
      `${agentId}.md`,
      `${agentId.replace(/-/g, '_')}.md`,
    ];

    for (const pattern of patterns) {
      const filePath = path.join(this.paths.agents, pattern);
      if (await fs.pathExists(filePath)) {
        return await fs.readFile(filePath, 'utf8');
      }
    }

    // Agent not found - return minimal definition
    console.warn(`[SubagentPromptBuilder] Agent definition not found: ${agentId}`);
    return `# Agent: ${agentId}\nNo definition file found.`;
  }

  /**
   * Load complete task definition file
   * @param {string} taskFile - Task file name
   * @returns {Promise<string>} Complete task .md file content
   */
  async loadTaskDefinition(taskFile) {
    // Ensure .md extension
    const fileName = taskFile.endsWith('.md') ? taskFile : `${taskFile}.md`;
    const filePath = path.join(this.paths.tasks, fileName);

    if (await fs.pathExists(filePath)) {
      return await fs.readFile(filePath, 'utf8');
    }

    // Try to find by action name (e.g., 'document-project' -> 'document-project.md')
    const altPath = path.join(this.paths.tasks, `${taskFile.replace('*', '')}.md`);
    if (await fs.pathExists(altPath)) {
      return await fs.readFile(altPath, 'utf8');
    }

    console.warn(`[SubagentPromptBuilder] Task definition not found: ${taskFile}`);
    return `# Task: ${taskFile}\nNo definition file found.`;
  }

  /**
   * Extract checklist references from task and load them
   * @param {string} taskDef - Task definition content
   * @param {string} overrideChecklist - Checklist from phase config (takes precedence)
   * @returns {Promise<Object[]>} Array of loaded checklists
   */
  async extractAndLoadChecklists(taskDef, overrideChecklist = null) {
    const checklists = [];

    // Priority 1: Override checklist from phase config
    if (overrideChecklist) {
      const content = await this.loadChecklist(overrideChecklist);
      if (content) {
        checklists.push({ name: overrideChecklist, content });
      }
    }

    // Priority 2: Checklists referenced in task frontmatter
    const frontmatterMatch = taskDef.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      try {
        const frontmatter = yaml.load(frontmatterMatch[1]);
        if (frontmatter?.checklists) {
          for (const checklistName of frontmatter.checklists) {
            if (checklistName !== overrideChecklist) {
              const content = await this.loadChecklist(checklistName);
              if (content) {
                checklists.push({ name: checklistName, content });
              }
            }
          }
        }
      } catch (_e) {
        // Invalid YAML frontmatter - continue
      }
    }

    return checklists;
  }

  /**
   * Load a single checklist file
   * @param {string} checklistName - Checklist file name
   * @returns {Promise<string|null>} Checklist content or null
   */
  async loadChecklist(checklistName) {
    const fileName = checklistName.endsWith('.md') ? checklistName : `${checklistName}.md`;
    const filePath = path.join(this.paths.checklists, fileName);

    if (await fs.pathExists(filePath)) {
      return await fs.readFile(filePath, 'utf8');
    }

    return null;
  }

  /**
   * Extract template references from task and load them
   * @param {string} taskDef - Task definition content
   * @param {string} overrideTemplate - Template from phase config (takes precedence)
   * @returns {Promise<Object[]>} Array of loaded templates
   */
  async extractAndLoadTemplates(taskDef, overrideTemplate = null) {
    const templates = [];

    // Priority 1: Override template from phase config
    if (overrideTemplate) {
      const content = await this.loadTemplate(overrideTemplate);
      if (content) {
        templates.push({ name: overrideTemplate, content });
      }
    }

    // Priority 2: Templates referenced in task frontmatter
    const frontmatterMatch = taskDef.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      try {
        const frontmatter = yaml.load(frontmatterMatch[1]);
        if (frontmatter?.templates) {
          for (const templateName of frontmatter.templates) {
            if (templateName !== overrideTemplate) {
              const content = await this.loadTemplate(templateName);
              if (content) {
                templates.push({ name: templateName, content });
              }
            }
          }
        }
      } catch (_e) {
        // Invalid YAML frontmatter - continue
      }
    }

    return templates;
  }

  /**
   * Load a single template file
   * @param {string} templateName - Template file name
   * @returns {Promise<string|null>} Template content or null
   */
  async loadTemplate(templateName) {
    // Try both .yaml and .md extensions
    const extensions = ['.yaml', '.yml', '.md'];
    const baseName = templateName.replace(/\.(yaml|yml|md)$/, '');

    for (const ext of extensions) {
      const filePath = path.join(this.paths.templates, `${baseName}${ext}`);
      if (await fs.pathExists(filePath)) {
        return await fs.readFile(filePath, 'utf8');
      }
    }

    return null;
  }

  /**
   * Format context from previous phases
   * @param {Object} context - Execution context
   * @returns {string} Formatted context section
   */
  formatContextSection(context) {
    if (!context.previousPhases || Object.keys(context.previousPhases).length === 0) {
      return '(No previous phase outputs available)';
    }

    let section = '';
    for (const [phaseNum, phaseData] of Object.entries(context.previousPhases)) {
      section += `### Phase ${phaseNum}: ${phaseData.agent}\n`;
      section += `- Action: ${phaseData.action}\n`;
      if (phaseData.result?.output_path) {
        section += `- Output: ${phaseData.result.output_path}\n`;
      }
      if (phaseData.result?.summary) {
        section += `- Summary: ${phaseData.result.summary}\n`;
      }
      section += '\n';
    }

    return section;
  }

  /**
   * Assemble the final prompt from all components
   * @param {Object} components - All loaded components
   * @returns {string} Complete assembled prompt
   */
  assemblePrompt(components) {
    const {
      agentId,
      agentDef,
      taskFile,
      taskDef,
      checklists,
      templates,
      context,
      contextSection,
    } = components;

    let prompt = `# AGENT TRANSFORMATION

You are being activated as the **@${agentId}** agent.

## COMPLETE AGENT DEFINITION

The following is your COMPLETE agent definition. Adopt this persona fully.

---
${agentDef}
---

## TASK TO EXECUTE

**Task File:** ${taskFile}
**Expected Output:** ${context.creates || 'See task definition'}
**Execution Mode:** ${context.yoloMode ? 'YOLO (autonomous)' : 'Interactive'}
**Execution Profile:** ${context.executionProfile || 'balanced'}
**Elicitation Required:** ${context.elicit ? 'Yes' : 'No'}
**Risk Policy:** ${JSON.stringify(context.executionPolicy || {}, null, 0)}

### Complete Task Definition:

---
${taskDef}
---
`;

    // Add checklists if available
    if (checklists.length > 0) {
      prompt += '\n## QUALITY CHECKLISTS\n\n';
      prompt += 'Execute these checklists to validate your work:\n\n';
      for (const checklist of checklists) {
        prompt += `### ${checklist.name}\n\n`;
        prompt += `---\n${checklist.content}\n---\n\n`;
      }
    }

    // Add templates if available
    if (templates.length > 0) {
      prompt += '\n## OUTPUT TEMPLATES\n\n';
      prompt += 'Use these templates as the basis for your output:\n\n';
      for (const template of templates) {
        prompt += `### ${template.name}\n\n`;
        prompt += `\`\`\`yaml\n${template.content}\n\`\`\`\n\n`;
      }
    }

    // Add context from previous phases
    prompt += '\n## CONTEXT FROM PREVIOUS PHASES\n\n';
    prompt += contextSection;

    // Add execution instructions
    prompt += `
## EXECUTION INSTRUCTIONS

1. **Adopt the persona completely** - Use the communication style and vocabulary defined
2. **Follow the task definition exactly** - Do not improvise or skip steps
3. **Use the templates provided** - They ensure consistency and quality
4. **Run the checklists** - Validate your work before marking complete
5. **Create the expected output** - Save to: ${context.creates || 'as specified in task'}

### Output Format

Return a structured result:

\`\`\`json
{
  "status": "success|failed",
  "output_path": "${context.creates || 'path/to/output'}",
  "summary": "Brief summary of what was accomplished",
  "findings": ["Key findings or items discovered"],
  "next_phase_context": {
    // Data relevant for the next phase
  }
}
\`\`\`
`;

    return prompt;
  }
}

module.exports = SubagentPromptBuilder;
