# Task: DevOps Pro Reset Password

> **Version:** 1.0.0
> **Created:** 2026-04-20
> **Type:** SUPPORT-OPS
> **Agent:** `@devops`

## Purpose

Reset an AIOX Pro password administratively, then validate login with the new password.

## Inputs

- `target_email`
- `new_password`

## Execution

1. Ensure the auth user exists for the target email.
2. Update the password in Supabase Auth.
3. Ensure the email remains confirmed.
4. Validate the new password with `login`.

## Pass Criteria

- auth user password updated successfully
- `POST /api/v1/auth/login` returns `200` and `accessToken`

## Recommended Follow-Up

- if the request was really a recovery flow for the user, also offer `*pro-request-reset {email}`

## Source Of Truth

- `docs/guides/pro/access-grant-ops-playbook.md`
- `.aiox-core/development/tasks/devops-pro-access-grant.md`
