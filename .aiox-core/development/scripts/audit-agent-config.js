/**
 * Agent Config Usage Audit Script
 *
 * Analyzes all 13 AIOX agents to determine which core-config.yaml sections
 * each agent requires, enabling lazy loading optimization.
 *
 * @module audit-agent-config
 * @version 1.0.0
 * @created 2025-01-16 (Story 6.1.2.6)
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * List of all AIOX agents
 */
const AGENTS = [
  'aiox-master',
  'dev',
  'qa',
  'architect',
  'po',
  'pm',
  'sm',
  'analyst',
  'ux-expert',
  'data-engineer',
  'devops',
  'db-sage',
  'security',
];

/**
 * Core config sections that can be lazy loaded
 */
const LAZY_LOADABLE_SECTIONS = [
  'pvMindContext',
  'expansionPacks',
  'registry',
  'toolConfigurations',
  'hybridOpsConfig',
];

/**
 * Always-loaded sections (small, frequently needed)
 */
const ALWAYS_LOADED_SECTIONS = [
  'frameworkDocsLocation',
  'projectDocsLocation',
  'devLoadAlwaysFiles',
  'lazyLoading',
];

/**
 * Extracts dependencies from agent YAML/Markdown
 */
async function extractAgentDependencies(agentId) {
  const agentPath = path.join('.aiox-core', 'agents', `${agentId}.md`);

  try {
    const content = await fs.readFile(agentPath, 'utf8');

    // Extract YAML block
    const yamlMatch = content.match(/```yaml\n([\s\S]+?)\n```/);
    if (!yamlMatch) {
      console.log(`⚠️ No YAML block found in ${agentId}.md`);
      return null;
    }

    const agentConfig = yaml.load(yamlMatch[1]);

    return {
      agentId,
      name: agentConfig.agent?.name || agentId,
      title: agentConfig.agent?.title || 'Unknown',
      dependencies: agentConfig.dependencies || {},
      commands: agentConfig.commands || [],
      customization: agentConfig.agent?.customization || null,
    };
  } catch (error) {
    console.error(`❌ Failed to parse ${agentId}:`, error.message);
    return null;
  }
}

/**
 * Analyzes which config sections an agent needs
 */
function analyzeConfigNeeds(agentData) {
  const needs = {
    always: [...ALWAYS_LOADED_SECTIONS],
    lazy: [],
    optional: [],
  };

  // Check dependencies for heavy sections
  if (agentData.dependencies.tools) {
    const tools = agentData.dependencies.tools;

    // pvMindContext needed for hybrid-ops agents
    if (tools.includes('supabase') || tools.includes('n8n')) {
      needs.lazy.push('pvMindContext');
      needs.lazy.push('hybridOpsConfig');
    }

    // toolConfigurations needed if using external tools
    if (tools.length > 0) {
      needs.lazy.push('toolConfigurations');
    }
  }

  // expansion_packs usage
  if (agentData.dependencies.expansion_packs) {
    needs.lazy.push('expansionPacks');
  }

  // Registry needed for meta operations
  if (agentData.agentId === 'aiox-master' ||
      agentData.customization?.includes('registry')) {
    needs.lazy.push('registry');
  }

  return needs;
}

/**
 * Estimates config size for each section
 */
function estimateConfigSize(sectionName) {
  const sizes = {
    pvMindContext: 75,        // 75KB
    expansionPacks: 20,       // 20KB
    registry: 15,             // 15KB
    toolConfigurations: 10,   // 10KB
    hybridOpsConfig: 25,      // 25KB
    frameworkDocsLocation: 0.1,
    projectDocsLocation: 0.1,
    devLoadAlwaysFiles: 1,
    lazyLoading: 0.5,
  };

  return sizes[sectionName] || 5;
}

/**
 * Calculates potential savings from lazy loading
 */
function calculateSavings(agentNeeds) {
  let totalWithoutLazy = 0;
  let totalWithLazy = 0;

  // Without lazy loading: everyone loads everything
  LAZY_LOADABLE_SECTIONS.forEach(section => {
    totalWithoutLazy += estimateConfigSize(section);
  });

  // With lazy loading: only load what's needed
  agentNeeds.always.forEach(section => {
    totalWithLazy += estimateConfigSize(section);
  });

  agentNeeds.lazy.forEach(section => {
    totalWithLazy += estimateConfigSize(section);
  });

  return {
    without: totalWithoutLazy,
    with: totalWithLazy,
    savings: totalWithoutLazy - totalWithLazy,
    savingsPercent: ((totalWithoutLazy - totalWithLazy) / totalWithoutLazy * 100).toFixed(1),
  };
}

/**
 * Generates audit report
 */
function generateAuditReport(auditResults) {
  let report = `# Agent Config Usage Audit

**Generated:** ${new Date().toISOString()}
**Total Agents:** ${auditResults.length}

---

## 📊 Executive Summary

`;

  // Calculate total savings
  let totalSavingKB = 0;
  let agentsWithSavings = 0;

  auditResults.forEach(result => {
    if (result.savings.savings > 0) {
      totalSavingKB += result.savings.savings;
      agentsWithSavings++;
    }
  });

  const avgSavings = (totalSavingKB / auditResults.length).toFixed(1);

  report += `**Lazy Loading Impact:**
- Average savings per agent: **${avgSavings} KB** (${((totalSavingKB / auditResults.length) / 145 * 100).toFixed(1)}% reduction)
- Agents benefiting from lazy loading: **${agentsWithSavings}/${auditResults.length}**
- Total config saved across all agents: **${totalSavingKB.toFixed(1)} KB**

---

## 🔍 Agent Analysis

`;

  // Sort by savings (highest first)
  auditResults.sort((a, b) => b.savings.savings - a.savings.savings);

  auditResults.forEach(result => {
    const savingsEmoji = result.savings.savings > 50 ? '🟢' :
      result.savings.savings > 20 ? '🟡' : '🔴';

    report += `### ${savingsEmoji} ${result.agent.name} (@${result.agent.agentId})

**Title:** ${result.agent.title}

**Config Needs:**
`;

    report += `- **Always Loaded:** ${result.needs.always.length} sections (${result.needs.always.map(s => `\`${s}\``).join(', ')})\n`;

    if (result.needs.lazy.length > 0) {
      report += `- **Lazy Loaded:** ${result.needs.lazy.length} sections (${result.needs.lazy.map(s => `\`${s}\``).join(', ')})\n`;
    }

    report += `
**Savings:**
- Without lazy loading: ${result.savings.without.toFixed(1)} KB
- With lazy loading: ${result.savings.with.toFixed(1)} KB
- **Savings: ${result.savings.savings.toFixed(1)} KB (${result.savings.savingsPercent}% reduction)**

`;

    // List dependencies
    if (Object.keys(result.agent.dependencies).length > 0) {
      report += '**Dependencies:**\n';
      Object.entries(result.agent.dependencies).forEach(([type, items]) => {
        if (Array.isArray(items) && items.length > 0) {
          report += `- ${type}: ${items.length} items\n`;
        }
      });
      report += '\n';
    }

    report += '---\n\n';
  });

  report += `## 🎯 Recommendations

### High Priority (Agents with >50KB savings)
`;

  const highPriority = auditResults.filter(r => r.savings.savings > 50);
  if (highPriority.length > 0) {
    highPriority.forEach(r => {
      report += `- **@${r.agent.agentId}**: ${r.savings.savings.toFixed(1)} KB savings\n`;
    });
  } else {
    report += '*None - all agents have reasonable config size*\n';
  }

  report += '\n### Medium Priority (Agents with 20-50KB savings)\n';

  const mediumPriority = auditResults.filter(r => r.savings.savings >= 20 && r.savings.savings <= 50);
  if (mediumPriority.length > 0) {
    mediumPriority.forEach(r => {
      report += `- **@${r.agent.agentId}**: ${r.savings.savings.toFixed(1)} KB savings\n`;
    });
  } else {
    report += '*None*\n';
  }

  report += '\n### Low Priority (Agents with <20KB savings)\n';

  const lowPriority = auditResults.filter(r => r.savings.savings < 20);
  if (lowPriority.length > 0) {
    lowPriority.forEach(r => {
      report += `- **@${r.agent.agentId}**: ${r.savings.savings.toFixed(1)} KB savings\n`;
    });
  }

  report += `\n---

## 📋 Implementation Checklist

- [ ] Create agent-config-requirements.yaml with needs mapping
- [ ] Implement lazy loading in config loader
- [ ] Update each agent's activation to use lazy loader
- [ ] Add performance tracking for load times
- [ ] Verify 18% improvement target achieved

---

*Auto-generated by AIOX Agent Config Audit (Story 6.1.2.6)*
`;

  return report;
}

/**
 * Main audit function
 */
async function auditAllAgents() {
  console.log('🔍 Auditing all 13 AIOX agents...\n');

  const auditResults = [];

  for (const agentId of AGENTS) {
    console.log(`📋 Analyzing @${agentId}...`);

    const agentData = await extractAgentDependencies(agentId);
    if (!agentData) {
      console.log('   ⚠️ Skipped (parsing failed)\n');
      continue;
    }

    const needs = analyzeConfigNeeds(agentData);
    const savings = calculateSavings(needs);

    auditResults.push({
      agent: agentData,
      needs,
      savings,
    });

    console.log(`   ✅ Config needs: ${needs.always.length} always + ${needs.lazy.length} lazy`);
    console.log(`   💾 Savings: ${savings.savings.toFixed(1)} KB (${savings.savingsPercent}%)\n`);
  }

  return auditResults;
}

// CLI execution
if (require.main === module) {
  (async () => {
    try {
      const results = await auditAllAgents();

      const report = generateAuditReport(results);

      const outputPath = 'docs/architecture/agent-config-audit.md';
      await fs.writeFile(outputPath, report, 'utf8');

      console.log('✅ Audit complete!');
      console.log(`📄 Report generated: ${outputPath}`);
      console.log(`📊 Audited ${results.length} agents`);

      // Calculate total savings
      const totalSavings = results.reduce((sum, r) => sum + r.savings.savings, 0);
      const avgSavings = totalSavings / results.length;

      console.log(`💾 Average savings: ${avgSavings.toFixed(1)} KB per agent`);
      console.log(`🎯 Target: 18% reduction (current: ${((avgSavings / 145) * 100).toFixed(1)}%)`);

    } catch (error) {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  auditAllAgents,
  extractAgentDependencies,
  analyzeConfigNeeds,
  calculateSavings,
  generateAuditReport,
  AGENTS,
  LAZY_LOADABLE_SECTIONS,
  ALWAYS_LOADED_SECTIONS,
};
