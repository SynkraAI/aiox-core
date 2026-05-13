# Task: DevOps Pro Check Access

> **Version:** 1.0.0
> **Created:** 2026-04-20
> **Type:** SUPPORT-OPS
> **Agent:** `@devops`

## Purpose

Check whether an email already has AIOX Pro buyer entitlement and whether an auth account exists.

## Input

- `target_email`

## Endpoint

- `POST https://aiox-license-server.vercel.app/api/v1/auth/check-email`

## Execution

1. Call `check-email` with the target email.
2. Report `isBuyer`, `hasAccount`, and normalized `email`.
3. If `isBuyer=false`, recommend `*pro-access-grant`.
4. If `isBuyer=true` and `hasAccount=false`, recommend account creation or `*pro-access-grant`.

## Pass Criteria

- request returns `200`
- response clearly identifies buyer/account state

## Source Of Truth

- `docs/guides/pro/access-grant-ops-playbook.md`
