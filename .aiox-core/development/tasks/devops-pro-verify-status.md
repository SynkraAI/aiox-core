# Task: DevOps Pro Verify Status

> **Version:** 1.0.0
> **Created:** 2026-04-20
> **Type:** SUPPORT-OPS
> **Agent:** `@devops`

## Purpose

Check email verification status for an authenticated AIOX Pro session.

## Input

- `access_token`

## Endpoint

- `POST https://aiox-license-server.vercel.app/api/v1/auth/verify-status`

## Execution

1. Call `verify-status` with `{ accessToken }`.
2. Report `email` and `emailVerified`.
3. If `emailVerified=false`, route to `*pro-resend-verification`.

## Pass Criteria

- `200` response
- clear verified/unverified state

## Source Of Truth

- `docs/guides/pro/access-grant-ops-playbook.md`
