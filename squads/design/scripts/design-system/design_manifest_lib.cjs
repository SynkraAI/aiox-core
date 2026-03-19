#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8')) || {};
}

function writeYaml(filePath, data) {
  const text = yaml.dump(data, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });
  fs.writeFileSync(filePath, text, 'utf8');
}

function normalizeDescription(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
}

function buildTierSystem(squad, currentConfig) {
  const source = squad.tier_system || {};
  const fallback = (currentConfig && currentConfig.tier_system) || {};

  return {
    tier_0_foundation: {
      description:
        (source.tier_0_foundation && source.tier_0_foundation.purpose) ||
        (fallback.tier_0_foundation && fallback.tier_0_foundation.description) ||
        'Entry point agents for diagnosis and strategy',
      agents: (source.tier_0_foundation && source.tier_0_foundation.agents) || [],
    },
    tier_1_masters: {
      description:
        (source.tier_1_masters && source.tier_1_masters.purpose) ||
        (fallback.tier_1_masters && fallback.tier_1_masters.description) ||
        'Execution masters with specialized expertise',
      agents: (source.tier_1_masters && source.tier_1_masters.agents) || [],
    },
    tier_2_specialists: {
      description:
        (source.tier_2_specialists && source.tier_2_specialists.purpose) ||
        (fallback.tier_2_specialists && fallback.tier_2_specialists.description) ||
        'Deep specialists for specific deliverables',
      agents: (source.tier_2_specialists && source.tier_2_specialists.agents) || [],
    },
    orchestrator: {
      description:
        (fallback.orchestrator && fallback.orchestrator.description) || 'Routes requests to appropriate agents',
      agent:
        (currentConfig && currentConfig.entry_agent) ||
        (squad.config && squad.config.default_agent) ||
        'design-chief',
    },
  };
}

function buildGeneratedConfig(squad, currentConfig) {
  const metadata = squad.metadata || {};

  return {
    ...currentConfig,
    name: metadata.name || currentConfig.name,
    version: metadata.version || currentConfig.version,
    title: metadata.display_name || currentConfig.title,
    description: normalizeDescription(squad.description) || currentConfig.description,
    entry_agent:
      currentConfig.entry_agent ||
      (squad.config && squad.config.default_agent) ||
      'design-chief',
    tier_system: buildTierSystem(squad, currentConfig),
    agents: (squad.agents || []).map((agent) => agent.id),
    tasks: (squad.tasks || []).map((task) => task.id),
    templates: (squad.templates || []).map((template) => template.id),
    checklists: (squad.checklists || []).map((checklist) => checklist.id),
    workflows: (squad.workflows || []).map((workflow) => workflow.id),
    tags: squad.tags || currentConfig.tags || [],
  };
}

function getCanonicalProjection(config) {
  return {
    name: config.name,
    version: config.version,
    entry_agent: config.entry_agent,
    tier_system: config.tier_system,
    agents: config.agents,
    tasks: config.tasks,
    templates: config.templates,
    checklists: config.checklists,
    workflows: config.workflows,
    tags: config.tags,
  };
}

function sortObjectDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortObjectDeep);
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    const sorted = {};
    for (const key of keys) {
      sorted[key] = sortObjectDeep(value[key]);
    }
    return sorted;
  }
  return value;
}

function stableJson(value) {
  return JSON.stringify(sortObjectDeep(value), null, 2);
}

function getDesignPaths(rootDir) {
  const base = path.join(rootDir, 'squads/design');
  return {
    squadPath: path.join(base, 'squad.yaml'),
    configPath: path.join(base, 'config.yaml'),
  };
}

module.exports = {
  buildGeneratedConfig,
  getCanonicalProjection,
  getDesignPaths,
  readYaml,
  stableJson,
  writeYaml,
};
