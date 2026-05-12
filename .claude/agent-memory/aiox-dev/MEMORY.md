# Dex (Builder) Agent Memory

## Key Patterns

### Greeting System Architecture (Story ACT-6 Unified Pipeline)
- `UnifiedActivationPipeline` in `.aiox-core/development/scripts/unified-activation-pipeline.js` is the single entry point for ALL 12 agents
- `generate-greeting.js` is now a thin wrapper that delegates to `UnifiedActivationPipeline.activate(agentId)`
- `GreetingBuilder` is the core greeting assembly engine, called by the pipeline with pre-loaded enriched context
- `loadUserProfile()` is called in `buildGreeting()` and passed to `_buildContextualGreeting()` to avoid double `resolveConfig()` calls
- `GreetingPreferenceManager.getPreference(userProfile)` now accepts optional userProfile param for bob mode restriction
- PM agent bypasses bob mode preference restriction (PM is primary interface in bob mode)
- Bob mode non-PM agents: when preference === 'auto', redirect message is shown; when preference forced to 'named', simple named greeting is shown
- Pipeline phases: Phase 1 (parallel 5 loaders via Promise.all) -> Phase 2 (agent def) -> Phase 3 (sequential: preference, session type, workflow) -> Phase 4 (enriched context) -> Phase 5 (GreetingBuilder)

### Agent Visibility Metadata
- 8 agents have `visibility: [full, quick, key]` array metadata on commands
- 4 agents (`qa`, `data-engineer`, `devops`, `ux-design-expert`) have NO visibility metadata -- fall back to first 12 commands
- `aiox-master` uses string format `visibility: full` instead of array
- Bob mode returns empty commands for non-PM (redirect shown instead)

### Test Mocking Pattern
- When mocking `resolveConfig`, use `mockReturnValue` (not `mockReturnValueOnce`) if the function is called multiple times
- `validate-user-profile.js` `validateUserProfile()` is a pure function (no filesystem) -- can be used without mocking in tests
- Always mock `fs`, `js-yaml`, `config-resolver`, and dependency modules BEFORE requiring the module under test

### Config Layered Resolution
- `resolveConfig()` merges L1-L5 config layers; L5 (user-config.yaml) has highest priority
- `user_profile` is categorized as USER_FIELD in migrate-config.js
- `toggleUserProfile()` in config-resolver.js flips bob<->advanced

### Permissions System (Story ACT-4)
- `PermissionMode` and `OperationGuard` in `.aiox-core/core/permissions/` are fully functional
- `cycleMode()` and `enforcePermission()` added to `index.js` as wiring layer
- Mode cycle: `explore`(0) -> `ask`(1) -> `auto`(2) -- PermissionMode.MODE_CYCLE
- `*yolo` command is universal across all 12 agents
- Badge from `_safeGetPermissionBadge()` in greeting-builder.js

### Agent File Command Formats
- Two formats exist: structured (`name: xxx`) and compact (`key: 'value'`)
- Compact: qa, devops, data-engineer, ux-design-expert
- Always match existing format when editing

### IDE Sync
- Source: `.aiox-core/development/agents/` -- Claude mirror: `.claude/commands/AIOX/agents/`
- These are separate files; `ideSync` handles sync separately

### File Locking (Cross-Platform)
- Use `fs.writeFile(path, data, { flag: 'wx' })` for exclusive create lock - simpler and more testable than `fs.open('wx')`
- Include PID + timestamp in lock data for stale detection
- Stale threshold ~10s; lock timeout ~3s with polling at 50ms intervals

### Atomic File Writes
- Temp file (`{path}.tmp.{pid}`) + `fs.rename()` pattern
- Windows: `rename` fails if target exists -- fall back to direct `fs.writeFile()`

### Git State Fingerprinting
- `.git/HEAD` mtime + `.git/index` mtime = cache fingerprint
- `git rev-parse --git-dir` for worktree-aware git path
- `git rev-parse --git-common-dir` to detect worktree vs main tree

### Jest Mock Ordering for writeFile
- When `writeFile` serves dual purpose (lock + cache), use broad `mockResolvedValue` and verify via `mock.calls` filtering
- Mock `child_process.execSync` separately from `execa` (different modules)
- `jest.requireActual('fs')` for real filesystem checks in hook existence tests

### Context-Aware Greeting Sections (Story ACT-7)
- All section builders (`buildPresentation`, `buildRoleDescription`, `buildProjectStatus`, `buildFooter`, `buildContextSection`) now accept optional `sectionContext` param
- `_buildContextualGreeting` creates `sectionContext` object from enriched pipeline context and passes to all builders
- When `sectionContext` is present: presentation uses named greeting (brief) for existing/workflow sessions instead of archetypal
- When `sectionContext` is absent: falls back to archetypal (backward compatible)
- `_formatProjectStatusNarrative()` produces natural language sentences; legacy `_formatProjectStatus()` still used without context
- `_safeBuildSection(fn)` wraps section builders with SECTION_TIMEOUT (150ms) + try/catch
- `Promise.all([contextSection, workflowSection])` parallelizes independent sections
- Footer varies: new="*guide", existing="*help + *session-info", workflow="Focused on **{story}**"
- ACT-5 changes (lines 661-816 in greeting-builder.js) must NOT be touched -- they own workflow navigator section

### IDS Verification Gate Engine (Story IDS-5a)
- `VerificationGate` base class at `.aiox-core/core/ids/verification-gate.js` - Template Method pattern
- `CircuitBreaker` at `.aiox-core/core/ids/circuit-breaker.js` - 3-state machine (CLOSED/OPEN/HALF_OPEN)
- Gates G1-G4 at `.aiox-core/core/ids/gates/g{n}-*.js` - all compose with `IncrementalDecisionEngine.analyze()` (PUBLIC API only)
- G1 (@pm): advisory, G2 (@sm): advisory, G3 (@po): soft block (can override), G4 (@dev): informational/logged
- `verify()` handles timeout+circuit-breaker+logging, delegates to `_doVerify()` in subclasses
- All gates gracefully degrade: timeout->warn-and-proceed, error->log-and-proceed, circuit open->skip
- G3 needs `Boolean()` wrapper on override check: `false || "string"` evaluates to string in JS, not boolean
- Jest `--testPathPattern` flag renamed to `--testPathPatterns` in newer Jest versions
- Pre-existing test failure in `incremental-decision-engine.test.js` (non-string intent) -- unrelated to IDS-5a

### IDS Self-Healing Registry (Story IDS-4a)
- `RegistryHealer` at `.aiox-core/core/ids/registry-healer.js` - 6 detection rules, 5 auto-healers
- Reuses `computeChecksum` and `extractKeywords` from `populate-entity-registry.js` (DO NOT duplicate)
- Registry entities are nested by category: `registry.entities[category][entityId]` - need `buildEntityIndex()` to flatten
- `NotificationManager` at `.aiox-core/core/quality-gates/notification-manager.js` supports console+file channels
- Healing backups go to `.aiox-core/data/registry-backups/healing/` (subfolder of updater's backup dir)
- JSONL audit log at `.aiox-core/data/registry-healing-log.jsonl`
- `bin/aiox-ids.js` is shared by multiple IDS stories (IDS-2, IDS-4a, IDS-7) - linter may auto-merge changes from other stories
- DO NOT mock `populate-entity-registry.js` in tests - functions work on any filesystem path; just use `os.tmpdir()` temp dirs
- `jest.mock()` path hoisting: cannot use `path.resolve()` in mock path argument because `jest.mock()` is hoisted before `const path = require('path')`

## Gotchas
- Double `loadUserProfile()` call caused test failures when `mockReturnValueOnce` was used for resolveConfig
- `console.warn` with template literal is one argument, not two -- match with `stringContaining()` only
- Existing `greeting-builder.test.js` mocks GreetingPreferenceManager globally returning 'auto' -- this means bob mode falls through to contextual path where redirect logic lives
- Pre-existing lint errors (279 errors, 860 warnings) -- verify only your changed files lint clean
- Use `os.tmpdir()` with unique suffixes for temp dirs in tests; cleanup with `fs.rmSync`
- **CRITICAL**: `jest.clearAllMocks()` does NOT reset `mockImplementation()` -- only clears call history. If tests override `mockImplementation`, subsequent tests inherit the override. Fix: explicitly restore default mock implementations in `beforeEach`, or use `jest.restoreAllMocks()` (which only works with `jest.spyOn`). For `jest.mock()` factories, must manually re-apply defaults.
- When tests change mock constructors (e.g., `AgentConfigLoader.mockImplementation(...)`) and later tests need the default, the `pipeline` created in `beforeEach` will use whatever mock was active at construction time -- but runtime calls inside the pipeline (like `new SessionContextLoader()`) will use the CURRENT mock at call time.
