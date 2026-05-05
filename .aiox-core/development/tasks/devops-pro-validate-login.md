# Task: DevOps Pro Validate Login

> **Version:** 1.0.0
> **Created:** 2026-04-20
> **Type:** SUPPORT-OPS
> **Agent:** `@devops`

## Purpose

Validate whether AIOX Pro login works for a given email and password pair.

## Inputs

- `target_email`
- `target_password`

## Endpoint

- `POST https://aiox-license-server.vercel.app/api/v1/auth/login`

## Execution

1. Call `login` with the provided credentials.
2. Report:
   - HTTP status
   - whether `accessToken` was issued
   - whether `emailVerified=true`
3. Do not expose the raw access token in logs or handoffs.

## Pass Criteria

- `200` response with `accessToken`

## Source Of Truth

- `docs/guides/pro/access-grant-ops-playbook.md`
