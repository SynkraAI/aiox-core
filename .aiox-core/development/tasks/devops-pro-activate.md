# Task: DevOps Pro Activate

> **Version:** 1.0.0
> **Created:** 2026-04-20
> **Type:** SUPPORT-OPS
> **Agent:** `@devops`

## Purpose

Call the live `activate-pro` endpoint directly to validate or restore AIOX Pro activation for a session.

## Inputs

- `access_token`
- `machine_id` (optional, default: `ops-validation-machine`)
- `version` (optional, default: current installer version)

## Endpoint

- `POST https://aiox-license-server.vercel.app/api/v1/auth/activate-pro`

## Execution

1. Build the request body with:
   - `accessToken`
   - `machineId`
   - `version`
   - `aioxCoreVersion`
2. Call `activate-pro`.
3. Report:
   - HTTP status
   - `activated`
   - whether activation was new or restored
4. Never paste the full `licenseKey` into logs or tickets.

## Pass Criteria

- `201` on first activation or `200` on idempotent restore

## Source Of Truth

- `docs/guides/pro/access-grant-ops-playbook.md`
