# Task: DevOps Pro Request Reset

> **Version:** 1.0.0
> **Created:** 2026-04-20
> **Type:** SUPPORT-OPS
> **Agent:** `@devops`

## Purpose

Trigger the user-facing password reset email flow for an AIOX Pro account.

## Input

- `target_email`

## Endpoint

- `POST https://aiox-license-server.vercel.app/api/v1/auth/request-reset`

## Execution

1. Call `request-reset` with the target email.
2. Report the HTTP status.
3. Treat the generic success message as expected anti-enumeration behavior.
4. If the endpoint returns `429`, report the rate limit window.

## Pass Criteria

- request returns `200` with the generic message
- or a clear `429` with retry guidance

## Source Of Truth

- `docs/guides/pro/access-grant-ops-playbook.md`
