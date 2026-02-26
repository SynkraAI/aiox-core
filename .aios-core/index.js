// aios-core/core - CommonJS Entry Point
const MetaAgent = require('./infrastructure/scripts/component-generator.js');
const TaskManager = require('./infrastructure/scripts/batch-creator.js');
const ElicitationEngine = require('./core/elicitation/elicitation-engine.js');
const TemplateEngine = require('./infrastructure/scripts/template-engine.js');
const ComponentSearch = require('./infrastructure/scripts/component-search.js');
const DependencyAnalyzer = require('./infrastructure/scripts/dependency-analyzer.js');

module.exports = {
  MetaAgent: MetaAgent,
  TaskManager: TaskManager,
  ElicitationEngine: ElicitationEngine,
  TemplateEngine: TemplateEngine,
  ComponentSearch: ComponentSearch,
  DependencyAnalyzer: DependencyAnalyzer,
};