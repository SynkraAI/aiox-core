# Quinn (QA) Agent Memory

## IDS Module Patterns
- IDS modules live in `.aios-core/core/ids/` with tests in `tests/core/ids/`
- Test fixtures at `tests/core/ids/fixtures/` (valid-registry.yaml, empty-registry.yaml)
- RegistryLoader uses underscore-prefixed "internal" methods (_findById, _getAllEntities, _ensureLoaded) that are used externally by FrameworkGovernor -- implicit contract risk
- RegistryLoader.queryByPath() IS a public method (no underscore) -- safe for gates to use
- Gates (G1-G4) should ONLY use IncrementalDecisionEngine.analyze() public API, not _private methods
- RegistryHealer (IDS-4a) is optional dependency pattern: try/catch import, null fallback
- Full IDS regression: 359 tests, 8 suites (as of IDS-5a, 2026-02-10)
- Verification gate files: circuit-breaker.js, verification-gate.js, gates/g1-g4
- Circuit breaker spec defaults: failure_threshold=5, success_threshold=3, reset_timeout_ms=60000
- Shared utilities (computeChecksum, extractKeywords, REPO_ROOT, REGISTRY_PATH) live in `populate-entity-registry.js` -- reused by registry-healer.js and registry-updater.js
- Registry write pattern: `yaml.dump(data, { lineWidth: 120, noRefs: true, sortKeys: false })`
- Audit logs: JSONL format, 5MB rotation cap, non-blocking failures
- RegistryHealer uses lazy-loaded NotificationManager with null fallback

## Review Patterns
- Story AC traceability tables with line-number evidence are highly effective
- Always run both targeted tests AND full module regression
- Check for timer leak patterns in _withTimeout-style code (clearTimeout in both paths)
- Verify advisory mode: shouldProceed must always be true for non-blocking checks
- Check function reuse: grep for function definitions to confirm no duplication
- Verify lazy loading patterns when modules have optional dependencies
- Check non-critical failures (logging, notifications) are non-blocking

## Gate Files
- Location: `docs/qa/gates/` (from core-config.yaml qa.qaLocation)
- Naming: `{story-slug}.yml`
- Quality score: 100 - (20*FAILs) - (10*CONCERNS)

## Project Test Commands
- `npx jest --testPathPatterns="pattern" --no-coverage` for targeted runs
- `npx jest --testPathPatterns="core/ids" --no-coverage` for IDS regression
- Tests run fast (~0.6s for single suite, ~2s for all IDS)

## Story File Rules
- ONLY update "QA Results" section
- NEVER modify Status, Tasks, Dev Notes, AC, or other sections
- Use AC traceability table mapping each AC to code evidence with line references
