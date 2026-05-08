# ADR: Error Governance Contract

## Status

Accepted for initial implementation.

## Context

Issue #701 formalizes the remaining error governance work from #621. The
runtime robustness slices already landed, but `main` did not have a canonical
`AIOXError` or `ErrorRegistry` surface.

Existing behavior must be preserved:

- Installer errors already have user-safe formatting in `bin/utils/install-errors.js`.
- Build attempt logs already sanitize JSON-unsafe values and redact stacks by default.
- Synapse layer failures already flow through metrics without interrupting hooks.
- Hook paths intentionally preserve silent failure policies in several contexts.

## Decision

Introduce `.aiox-core/core/errors/` as the canonical core error-governance
surface.

The initial contract contains:

- `AIOXError`: an `Error` subclass with stable `code`, `category`, `severity`,
  `retryable`, optional `exitCode`, structured `metadata`, and preserved `cause`.
- `ErrorRegistry`: a static taxonomy registry for known error codes. It is not
  a runtime event log.
- Serialization helpers that convert typed and generic errors into JSON-safe
  structures, preserve own error properties, tolerate circular references, and
  redact stack traces unless debug stack flags are explicitly enabled.
- Normalization helpers that wrap generic errors without breaking generic
  `Error` compatibility.

## Categories

The initial categories are:

- `configuration`
- `validation`
- `filesystem`
- `network`
- `registry`
- `orchestration`
- `synapse`
- `execution`
- `permission`
- `external_executor`
- `unknown`

## Compatibility Rules

- Generic `Error` consumers continue to work.
- No broad migration of existing `throw new Error(...)` call-sites happens in
  this first implementation.
- CLI output, exit codes, persisted logs, and silent hook behavior must remain
  unchanged unless a later story explicitly approves a bounded migration.
- Stack traces remain redacted by default in serialized contracts.

## Consequences

Future migrations can target bounded domains first: build-state persistence,
Synapse layer metrics, IDS registry failures, external executor failures, and
installer taxonomy bridging. Each migration must keep its own compatibility
tests.

## Related

- GitHub issue: #701
- Parent epic: #621
- Runtime remediation PRs: #691, #694, #695, #696, #697, #698, #699, #700
