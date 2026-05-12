# Meta-Agent Commands Reference

> 🌐 **EN** | [PT](./pt/meta-agent-commands.md) | [ES](./es/meta-agent-commands.md)

---

Complete reference guide for all Synkra AIOX meta-agent commands.

## Table of Contents

1. [Command Syntax](#command-syntax)
2. [Core Commands](#core-commands)
3. [Agent Management](#agent-management)
4. [Task Operations](#task-operations)
5. [Workflow Commands](#workflow-commands)
6. [Code Generation](#code-generation)
7. [Analysis & Improvement](#analysis--improvement)
8. [Memory Layer](#memory-layer)
9. [Self-Modification](#self-modification)
10. [System Commands](#system-commands)
11. [Advanced Commands](#advanced-commands)

## Command Syntax

All meta-agent commands follow this pattern:

```
*command-name [required-param] [--optional-flag value]
```

- Commands start with `*` (asterisk)
- Parameters in `[]` are required
- Flags start with `--` and may have values
- Multiple flags can be combined

### Examples

```bash
*create-agent my-agent
*analyze-code src/app.js --depth full
*generate-tests --type unit --coverage 80
```

## Core Commands

### *help

Display all available commands or get help for specific command.

```bash
*help                    # Show all commands
*help create-agent       # Help for specific command
*help --category agents  # Commands by category
```

### *status

Show current system status and active agents.

```bash
*status                  # Basic status
*status --detailed       # Detailed system information
*status --health        # Health check results
```

### *config

View or modify configuration.

```bash
*config                  # View current config
*config --set ai.model gpt-4      # Set config value
*config --reset         # Reset to defaults
*config --export        # Export configuration
```

### *version

Display version information.

```bash
*version                # Current version
*version --check-update # Check for updates
*version --changelog    # Show changelog
```

## Agent Management

### *create-agent

Create a new AI agent.

```bash
*create-agent <name> [options]

Options:
  --type <type>         Agent type: assistant, analyzer, generator, specialist
  --template <name>     Use template: basic, advanced, custom
  --capabilities        Interactive capability builder
  --from-file <path>    Create from YAML definition

Examples:
*create-agent code-reviewer --type analyzer
*create-agent api-builder --template advanced
*create-agent custom-bot --from-file agents/template.yaml
```

### *list-agents

List all available agents.

```bash
*list-agents                      # List all agents
*list-agents --active            # Only active agents
*list-agents --type analyzer     # Filter by type
*list-agents --detailed          # Show full details
```

### *activate

Activate an agent for use.

```bash
*activate <agent-name>            # Activate single agent
*activate agent1 agent2          # Activate multiple
*activate --all                  # Activate all agents
*activate --type assistant       # Activate by type
```

### *deactivate

Deactivate an agent.

```bash
*deactivate <agent-name>         # Deactivate single agent
*deactivate --all               # Deactivate all agents
*deactivate --except agent1     # Deactivate all except specified
```

### *modify-agent

Modify existing agent configuration.

```bash
*modify-agent <name> [options]

Options:
  --add-capability <name>        Add new capability
  --remove-capability <name>     Remove capability
  --update-instructions         Update instructions
  --version <version>           Update version
  --interactive                 Interactive modification

Examples:
*modify-agent helper --add-capability translate
*modify-agent analyzer --update-instructions
*modify-agent bot --interactive
```

### *delete-agent

Remove an agent (with confirmation).

```bash
*delete-agent <name>            # Delete single agent
*delete-agent --force          # Skip confirmation
*delete-agent --backup         # Create backup before deletion
```

### *clone-agent

Create a copy of existing agent.

```bash
*clone-agent <source> <target>  # Basic clone
*clone-agent bot bot-v2 --modify  # Clone and modify
```

## Task Operations

### *create-task

Create a new reusable task.

```bash
*create-task <name> [options]

Options:
  --type <type>           Task type: command, automation, analysis
  --description <text>    Task description
  --parameters           Define parameters interactively
  --template <name>      Use task template

Examples:
*create-task validate-input --type command
*create-task daily-backup --type automation
*create-task code-metrics --template analyzer
```

### *list-tasks

List available tasks.

```bash
*list-tasks                     # List all tasks
*list-tasks --type automation  # Filter by type
*list-tasks --recent          # Recently used tasks
*list-tasks --search <query>  # Search tasks
```

### *run-task

Execute a specific task.

```bash
*run-task <task-name> [params]

Examples:
*run-task validate-input --data "user input"
*run-task generate-report --format pdf
*run-task backup-database --incremental
```

### *schedule-task

Schedule task execution.

```bash
*schedule-task <task> <schedule>

Schedule formats:
  --cron "0 0 * * *"           Cron expression
  --every "1 hour"             Interval
  --at "14:30"                 Specific time
  --on "monday,friday"         Specific days

Examples:
*schedule-task cleanup --cron "0 2 * * *"
*schedule-task report --every "6 hours"
*schedule-task backup --at "03:00" --on "sunday"
```

### *modify-task

Update task configuration.

```bash
*modify-task <name> [options]

Options:
  --add-param <name>           Add parameter
  --update-logic              Update implementation
  --change-type <type>        Change task type
  --rename <new-name>         Rename task
```

## Workflow Commands

### *create-workflow

Create automated workflow.

```bash
*create-workflow <name> [options]

Options:
  --steps                Interactive step builder
  --trigger <type>      Trigger type: manual, schedule, event
  --template <name>     Use workflow template
  --from-file <path>    Import from YAML

Examples:
*create-workflow ci-pipeline --trigger push
*create-workflow daily-tasks --trigger "schedule:0 9 * * *"
*create-workflow deployment --template standard-deploy
```

### *list-workflows

Display available workflows.

```bash
*list-workflows                 # All workflows
*list-workflows --active       # Currently running
*list-workflows --scheduled    # Scheduled workflows
*list-workflows --failed       # Failed executions
```

### *run-workflow

Execute a workflow.

```bash
*run-workflow <name> [options]

Options:
  --params <json>             Workflow parameters
  --skip-steps <steps>        Skip specific steps
  --dry-run                   Preview without execution
  --force                     Force run even if running

Examples:
*run-workflow deploy --params '{"env":"staging"}'
*run-workflow backup --skip-steps "upload"
*run-workflow test-suite --dry-run
```

### *stop-workflow

Stop running workflow.

```bash
*stop-workflow <name>          # Stop specific workflow
*stop-workflow --all          # Stop all workflows
*stop-workflow --force        # Force stop
```

### *workflow-status

Check workflow execution status.

```bash
*workflow-status <name>        # Single workflow status
*workflow-status --all        # All workflow statuses
*workflow-status --history    # Execution history
```

## Code Generation

### *generate-component

Generate new components with AI assistance.

```bash
*generate-component <name> [options]

Options:
  --type <type>              Component type: react, vue, angular, web-component
  --features <list>          Component features
  --style <type>             Styling: css, scss, styled-components
  --tests                    Generate tests
  --storybook               Generate Storybook stories
  --template <name>         Use component template

Examples:
*generate-component UserProfile --type react --features "avatar,bio,stats"
*generate-component DataTable --type vue --tests --storybook
*generate-component CustomButton --template material-ui
```

### *generate-api

Generate API endpoints.

```bash
*generate-api <resource> [options]

Options:
  --operations <list>        CRUD operations: create,read,update,delete
  --auth                     Add authentication
  --validation              Add input validation
  --docs                    Generate API documentation
  --tests                   Generate API tests
  --database <type>         Database type: postgres, mongodb, mysql

Examples:
*generate-api users --operations crud --auth --validation
*generate-api products --database mongodb --docs
*generate-api analytics --operations "read" --tests
```

### *generate-tests

Generate test suites.

```bash
*generate-tests [target] [options]

Options:
  --type <type>             Test type: unit, integration, e2e
  --framework <name>        Test framework: jest, mocha, cypress
  --coverage <percent>      Target coverage percentage
  --mocks                   Generate mock data
  --fixtures               Generate test fixtures

Examples:
*generate-tests src/utils/ --type unit --coverage 90
*generate-tests src/api/ --type integration --mocks
*generate-tests --type e2e --framework cypress
```

### *generate-documentation

Generate documentation.

```bash
*generate-documentation [target] [options]

Options:
  --format <type>           Format: markdown, html, pdf
  --type <type>            Doc type: api, user-guide, technical
  --include-examples       Add code examples
  --diagrams              Generate diagrams
  --toc                   Generate table of contents

Examples:
*generate-documentation src/ --type api --format markdown
*generate-documentation --type user-guide --include-examples
*generate-documentation components/ --diagrams --toc
```

## Analysis & Improvement

### *analyze-framework

Analyze entire codebase.

```bash
*analyze-framework [options]

Options:
  --depth <level>          Analysis depth: surface, standard, deep
  --focus <areas>          Focus areas: performance, security, quality
  --report-format <type>   Format: console, json, html
  --save-report <path>     Save analysis report
  --compare-previous      Compare with previous analysis

Examples:
*analyze-framework --depth deep
*analyze-framework --focus "performance,security"
*analyze-framework --save-report reports/analysis.json
```

### *analyze-code

Analyze specific code files.

```bash
*analyze-code <path> [options]

Options:
  --metrics               Show code metrics
  --complexity           Analyze complexity
  --dependencies         Analyze dependencies
  --suggestions          Get improvement suggestions
  --security             Security analysis

Examples:
*analyze-code src/app.js --metrics --complexity
*analyze-code src/api/ --security --suggestions
*analyze-code package.json --dependencies
```

### *improve-code-quality

Improve code quality with AI assistance.

```bash
*improve-code-quality <path> [options]

Options:
  --focus <aspects>        Focus: readability, performance, maintainability
  --refactor-level <level> Level: minor, moderate, major
  --preserve-logic        Don't change functionality
  --add-comments          Add explanatory comments
  --fix-eslint           Fix linting issues

Examples:
*improve-code-quality src/utils.js --focus readability
*improve-code-quality src/legacy/ --refactor-level major
*improve-code-quality src/api.js --fix-eslint --add-comments
```

### *suggest-refactoring

Get refactoring suggestions.

```bash
*suggest-refactoring <path> [options]

Options:
  --type <type>           Refactoring type: extract, inline, rename
  --scope <level>         Scope: function, class, module, project
  --impact-analysis      Show impact of changes
  --preview              Preview changes
  --auto-apply          Apply suggestions automatically

Examples:
*suggest-refactoring src/helpers.js --type extract
*suggest-refactoring src/models/ --scope module
*suggest-refactoring src/app.js --preview --impact-analysis
```

### *detect-patterns

Detect code patterns and anti-patterns.

```bash
*detect-patterns [path] [options]

Options:
  --patterns <list>       Specific patterns to detect
  --anti-patterns        Focus on anti-patterns
  --suggest-fixes        Suggest pattern improvements
  --severity <level>     Minimum severity: low, medium, high

Examples:
*detect-patterns --anti-patterns --suggest-fixes
*detect-patterns src/ --patterns "singleton,factory"
*detect-patterns --severity high
```

## Memory Layer

### *memory

Memory layer operations.

```bash
*memory <operation> [options]

Operations:
  status                 Show memory layer status
  search <query>        Semantic search
  rebuild               Rebuild memory index
  clear-cache          Clear memory cache
  optimize             Optimize memory performance
  export <path>        Export memory data
  import <path>        Import memory data

Examples:
*memory status
*memory search "authentication flow"
*memory rebuild --verbose
*memory optimize --aggressive
```

### *learn

Learn from code changes and patterns.

```bash
*learn [options]

Options:
  --from <source>         Source: recent-changes, commits, patterns
  --period <time>         Time period: "1 week", "1 month"
  --focus <areas>         Focus areas for learning
  --update-patterns      Update pattern recognition
  --save-insights        Save learning insights

Examples:
*learn --from recent-changes
*learn --from commits --period "1 week"
*learn --focus "error-handling,api-calls"
```

### *remember

Store important information in memory.

```bash
*remember <key> <value> [options]

Options:
  --type <type>          Info type: pattern, preference, rule
  --context <context>    Context for the memory
  --expires <time>       Expiration time
  --priority <level>     Priority: low, normal, high

Examples:
*remember coding-style "use-functional-components" --type preference
*remember api-pattern "always-validate-input" --context security
*remember temp-fix "skip-test-x" --expires "1 week"
```

### *forget

Remove information from memory.

```bash
*forget <key>              # Forget specific key
*forget --pattern <regex>  # Forget by pattern
*forget --older-than <time> # Forget old memories
*forget --type <type>      # Forget by type
```

## Self-Modification

### *improve-self

Meta-agent self-improvement.

```bash
*improve-self [options]

Options:
  --aspect <area>         Improvement area: speed, accuracy, features
  --based-on <data>      Base on: usage, feedback, analysis
  --preview              Preview improvements
  --backup              Create backup before changes
  --test-improvements   Test improvements before applying

Examples:
*improve-self --aspect accuracy --based-on feedback
*improve-self --preview --test-improvements
*improve-self --aspect features --backup
```

### *evolve

Evolve capabilities based on usage.

```bash
*evolve [options]

Options:
  --strategy <type>      Evolution strategy: conservative, balanced, aggressive
  --focus <areas>        Focus areas for evolution
  --generations <num>    Number of evolution cycles
  --fitness-metric      Define fitness metrics
  --rollback-point     Create rollback point

Examples:
*evolve --strategy balanced
*evolve --focus "code-generation,analysis" --generations 3
*evolve --fitness-metric "task-success-rate" --rollback-point
```

### *adapt

Adapt to project-specific needs.

```bash
*adapt [options]

Options:
  --to <context>         Adapt to: project-type, team-style, domain
  --learn-from <source>  Learn from: codebase, commits, reviews
  --adaptation-level     Level: minimal, moderate, full
  --preserve <aspects>   Preserve specific behaviors

Examples:
*adapt --to project-type --learn-from codebase
*adapt --to team-style --adaptation-level moderate
*adapt --to domain --preserve "core-functions"
```

### *optimize-performance

Optimize meta-agent performance.

```bash
*optimize-performance [options]

Options:
  --target <metric>      Target: speed, memory, accuracy
  --profile             Profile before optimization
  --benchmark          Run benchmarks
  --aggressive         Aggressive optimization
  --safe-mode         Safe optimization only

Examples:
*optimize-performance --target speed --profile
*optimize-performance --target memory --safe-mode
*optimize-performance --benchmark --aggressive
```

## System Commands

### *backup

Create system backup.

```bash
*backup [options]

Options:
  --include <items>      Items: config, agents, memory, all
  --exclude <items>     Exclude specific items
  --destination <path>  Backup destination
  --compress           Compress backup
  --encrypt           Encrypt backup

Examples:
*backup --include all --compress
*backup --include "agents,config" --destination backups/
*backup --exclude memory --encrypt
```

### *restore

Restore from backup.

```bash
*restore <backup-file> [options]

Options:
  --items <list>        Specific items to restore
  --preview            Preview restore operation
  --force             Force restore without confirmation
  --merge             Merge with existing data

Examples:
*restore backups/backup-2024-01-01.zip
*restore backup.tar.gz --items "agents,config"
*restore latest-backup --preview
```

### *update

Update Synkra AIOX.

```bash
*update [options]

Options:
  --check              Check for updates only
  --version <version>  Update to specific version
  --beta              Include beta versions
  --force            Force update
  --backup          Create backup before update

Examples:
*update --check
*update --version 2.0.0 --backup
*update --beta --force
```

### *uninstall

Uninstall components or entire system.

```bash
*uninstall [component] [options]

Options:
  --keep-data         Keep user data
  --keep-config      Keep configuration
  --complete         Complete uninstallation
  --dry-run         Preview uninstallation

Examples:
*uninstall agent-name
*uninstall --complete --keep-data
*uninstall memory-layer --dry-run
```

### *doctor

System diagnostics and repair.

```bash
*doctor [options]

Options:
  --fix              Auto-fix detected issues
  --deep            Deep system scan
  --report <path>   Save diagnostic report
  --component <name> Check specific component

Examples:
*doctor
*doctor --fix
*doctor --deep --report diagnosis.json
*doctor --component memory-layer
```

## Advanced Commands

### *export

Export configurations, agents, or data.

```bash
*export <type> [options]

Types:
  config              Export configuration
  agents             Export agents
  workflows          Export workflows
  memory            Export memory data
  all              Export everything

Options:
  --format <type>     Format: json, yaml, archive
  --destination <path> Export destination
  --include-sensitive Include sensitive data
  --pretty          Pretty formatting

Examples:
*export config --format yaml
*export agents --destination exports/agents/
*export all --format archive --destination backup.zip
```

### *import

Import configurations, agents, or data.

```bash
*import <file> [options]

Options:
  --type <type>       Import type: config, agents, workflows
  --merge            Merge with existing
  --replace         Replace existing
  --validate       Validate before import
  --dry-run       Preview import

Examples:
*import agents.json --type agents --merge
*import config.yaml --replace --validate
*import backup.zip --dry-run
```

### *benchmark

Run performance benchmarks.

```bash
*benchmark [suite] [options]

Suites:
  all               Run all benchmarks
  generation       Code generation speed
  analysis        Analysis performance
  memory          Memory operations
  e2e            End-to-end workflows

Options:
  --iterations <num>   Number of iterations
  --compare <baseline> Compare with baseline
  --save-results      Save benchmark results
  --profile          Include profiling data

Examples:
*benchmark all --iterations 10
*benchmark generation --compare v1.0.0
*benchmark memory --profile --save-results
```

### *debug

Debug mode operations.

```bash
*debug <command> [options]

Commands:
  enable              Enable debug mode
  disable            Disable debug mode
  logs <level>       Show debug logs
  trace <operation>  Trace specific operation
  breakpoint <location> Set breakpoint

Options:
  --verbose          Verbose output
  --filter <pattern> Filter debug output
  --save <path>     Save debug session

Examples:
*debug enable --verbose
*debug logs error --filter "api"
*debug trace create-agent --save debug-session.log
```

### *plugin

Plugin management.

```bash
*plugin <operation> [options]

Operations:
  install <name>      Install plugin
  remove <name>      Remove plugin
  list              List installed plugins
  search <query>    Search available plugins
  create <name>     Create new plugin

Options:
  --version <ver>     Plugin version
  --source <url>     Plugin source
  --enable          Enable after install
  --dev            Development mode

Examples:
*plugin install code-formatter --enable
*plugin create my-custom-plugin --dev
*plugin search "testing" 
*plugin list --detailed
```

## Command Shortcuts

Common commands have shortcuts:

```bash
*h     → *help
*s     → *status
*la    → *list-agents
*lt    → *list-tasks
*lw    → *list-workflows
*ca    → *create-agent
*ct    → *create-task
*cw    → *create-workflow
*a     → *analyze-framework
*i     → *improve-code-quality
```

## Command Chaining

Chain multiple commands:

```bash
# Using && for sequential execution
*analyze-framework && *suggest-improvements && *generate-report

# Using pipes for data flow
*analyze-code src/ | *improve-code-quality | *generate-tests

# Using ; for independent execution
*backup ; *update ; *doctor --fix
```

## Interactive Mode

Enter interactive mode for continuous commands:

```bash
*interactive

AIOX> create-agent helper
AIOX> activate helper
AIOX> helper translate "Hello" --to spanish
AIOX> exit
```

## Environment Variables

Control behavior with environment variables:

```bash
AIOX_AI_PROVIDER=openai          # AI provider
AIOX_AI_MODEL=gpt-4             # AI model
AIOX_LOG_LEVEL=debug            # Log level
AIOX_TELEMETRY=disabled         # Telemetry setting
AIOX_TIMEOUT=30000             # Command timeout (ms)
AIOX_MEMORY_CACHE=true         # Memory caching
```

## Error Handling

Common error responses and solutions:

```bash
# Permission denied
*sudo <command>                 # Run with elevated permissions

# Command not found
*help <command>                # Check correct command name
*update                       # Update to latest version

# Timeout error
*config --set timeout 60000   # Increase timeout
*<command> --async           # Run asynchronously

# Memory error
*memory clear-cache          # Clear memory cache
*optimize-performance --target memory
```

---

**Pro Tips:**

1. Use `*help <command>` liberally - it provides detailed examples
2. Tab completion works for commands and parameters
3. Command history is available with up/down arrows
4. Use `--dry-run` to preview dangerous operations
5. Combine commands with pipes and chains for powerful workflows

Remember: The meta-agent learns from your usage patterns. The more you use it, the better it becomes at anticipating your needs!