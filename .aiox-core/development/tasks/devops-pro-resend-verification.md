# Task: DevOps Pro Resend Verification

> **Version:** 1.0.0
> **Created:** 2026-04-20
> **Type:** SUPPORT-OPS
> **Agent:** `@devops`

## Purpose

Resend the email verification link for an AIOX Pro user account.

## Input

- `target_email`

## Endpoint

- `POST https://aiox-license-server.vercel.app/api/v1/auth/resend-verification`

## Execution

1. Call `resend-verification` with the target email.
2. Report status and generic delivery message.
3. If `429`, report resend rate limit and retry guidance.

## Pass Criteria

- endpoint returns success-style response without leaking account existence

## Source Of Truth

- `docs/guides/pro/access-grant-ops-playbook.md`
