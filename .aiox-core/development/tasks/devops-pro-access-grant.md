# Task: DevOps Pro Access Grant

> **Version:** 1.0.0
> **Created:** 2026-04-20
> **Type:** SUPPORT-OPS
> **Agent:** `@devops`

## Purpose

Grant, restore, or validate AIOX Pro access for a customer using the live license server, Supabase Auth, and guided installer validation.

## Inputs

Required:

- `target_email`
- `target_password`

Optional:

- `reset_password` (`true|false`, default: `false`)
- `run_guided_validation` (`true|false`, default: `true` after code changes, `false` for pure entitlement-only support)
- `source` (default: `manual_support`)

## Source Of Truth

- `docs/guides/pro/access-grant-ops-playbook.md`
- `docs/aiox-workflows/pro-access-grant-workflow.md`

## Execution Order

1. Run `POST /api/v1/auth/check-email` for `target_email`.
2. If buyer is missing, upsert `public.buyers` with `source=manual_support` and `is_active=true`.
3. If account is missing, create or update the Supabase Auth user with `target_password` and confirmed email.
4. If buyer validation is unstable or stale, upsert `public.buyer_validations` with `is_valid=true` for the target `user_id`.
5. Validate `login`.
6. Validate `verify-status`.
7. Validate `activate-pro`.
8. If `run_guided_validation=true`, validate:
   - source checkout installer path
   - packaged tarball installer path
9. Attach evidence and close the support request.

## Mandatory Checks

- `check-email` must end with `isBuyer=true` and `hasAccount=true`
- `login` must return `accessToken`
- `verify-status` must return `emailVerified=true`
- `activate-pro` must return success

## Guided Validation Checklist

- installer path from source checkout passes
- installer path from packed `.tgz` passes
- final report says all checks passed
- generated project contains `.claude/skills`
- generated project contains `.claude/commands`
- generated project contains `.codex/skills`

## Failure Branches

### Buyer missing after grant

- confirm lowercase email in `public.buyers`
- confirm `is_active=true`
- seed `public.buyer_validations`

### `activate-pro` returns invalid input for token

- caller is outdated
- resend using `{ accessToken }` in JSON body

### Email not verified

- confirm the Auth user email manually
- rerun `verify-status`

### Installer validation misses Claude or Codex assets

- rebuild using the updated package
- rerun source and tarball validation

## Evidence Pack

Capture:

- `check-email` response
- `login` status
- `verify-status` response
- `activate-pro` status
- guided install result

Do not store full `accessToken` or full `licenseKey` in tickets, handoffs, or chat.
