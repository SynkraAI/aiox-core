# Infrastructure Module

Base layer of the AIOX modular architecture. Contains tools, integrations, scripts, and PM adapters.

## Structure

```
infrastructure/
├── tools/                      # Tool configurations (14 files)
│   ├── cli/                    # CLI tools (github-cli, railway-cli, supabase-cli)
│   ├── local/                  # Local tools (ffmpeg)
│   ├── mcp/                    # MCP tools (9 configs)
│   └── README.md
│
├── scripts/                    # Infrastructure scripts (50+)
│   ├── _archived/              # Archived migration scripts
│   └── *.js                    # Active infrastructure scripts
│
├── integrations/               # External integrations
│   └── pm-adapters/            # PM tool adapters (4 adapters)
│
├── tests/                      # Test utilities
│   ├── project-status-loader.test.js
│   └── regression-suite-v2.md
│
├── index.js                    # Module exports
└── README.md                   # This file
```

## Dependency Direction

Infrastructure is the **base layer** - it has no dependencies on other modules:

```
infrastructure/ ← core/ ← development/ ← product/
```

- `infrastructure/` CAN import from: nothing (base layer)
- `core/` CAN import from: `infrastructure/`
- `development/` CAN import from: `infrastructure/`, `core/`
- `product/` CAN import from: `infrastructure/`, `core/`

## Key Components

### Git Integration
- `GitWrapper` - Git CLI wrapper for all git operations
- `GitConfigDetector` - Detects git configuration status
- `BranchManager` - Branch management utilities
- `CommitMessageGenerator` - Generates commit messages

### PM Integration
- `getPMAdapter()` - Factory for PM tool adapters
- `PMAdapter` - Base adapter class
- Adapters: ClickUp, GitHub Projects, Jira, Local (standalone)

### Template & Generation
- `TemplateEngine` - Template rendering
- `ComponentGenerator` - AIOX component generation
- `BatchCreator` - Batch operations

### Validation
- `AioxValidator` - AIOX component validation
- `TemplateValidator` - Template validation
- `SpotCheckValidator` - Spot check validation

### Analysis
- `DependencyAnalyzer` - Dependency analysis
- `SecurityChecker` - Security validation
- `CapabilityAnalyzer` - Capability analysis

### Testing
- `TestGenerator` - Test file generation
- `CoverageAnalyzer` - Coverage analysis
- `SandboxTester` - Sandbox testing

### Performance
- `PerformanceAnalyzer` - Performance analysis
- `PerformanceTracker` - Performance tracking
- `PerformanceOptimizer` - Performance optimization

### Quality
- `CodeQualityImprover` - Code quality improvements
- `RefactoringSuggester` - Refactoring suggestions
- `ImprovementEngine` - General improvements

## Usage

```javascript
// Import from infrastructure module
const {
  GitWrapper,
  getPMAdapter,
  TemplateEngine,
  resolveTool
} = require('.aiox-core/infrastructure');

// Or import directly from scripts
const GitWrapper = require('.aiox-core/infrastructure/scripts/git-wrapper');
```

## Tool Resolution

```javascript
const { resolveTool } = require('.aiox-core/infrastructure');

// Get tool configuration
const clickupTool = await resolveTool('clickup');
const githubCli = await resolveTool('github-cli');
```

## PM Adapters

```javascript
const { getPMAdapter, isPMToolConfigured } = require('.aiox-core/infrastructure');

// Check if PM tool is configured
if (isPMToolConfigured()) {
  const adapter = getPMAdapter();
  await adapter.syncStory(storyPath);
}
```

## Migration Reference

Created as part of Story 2.5 - Infrastructure Module Creation.
See [ADR-002 Migration Map](../../docs/architecture/decisions/ADR-002-migration-map.md).
