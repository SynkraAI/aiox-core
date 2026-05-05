# Playbook: AIOX Pro Access Grant Ops

**Status:** Validated on 2026-04-20
**Primary operator:** `@devops`
**Source story:** `PRO-11.1`

---

## Objective

Grant or restore AIOX Pro access for a user without rediscovering the backend flow each time.

This playbook is based on the live contract validated against:

- License server: `https://aiox-license-server.vercel.app`
- Vercel project: `aiox-license-server`
- Vercel project id: `prj_URy89BjALJ8vMKcYQHJa1N2GLXle`
- Vercel team id: `team_KZMs9FZJuVgsxQFZZp8I1p9t`
- Supabase project ref: `evvvnarpwcdybxdvcwjh`

---

## System Of Record

### Backend tables and auth surfaces

- `public.buyers`
  - Entitlement oracle for buyer status.
  - Required by `validate_buyer` and by `POST /api/v1/auth/check-email`.
- `public.buyer_validations`
  - Local 24h cache and support fallback.
  - Can be used as a positive local override when the upstream buyer RPC is unavailable.
- `auth.users`
  - Account existence oracle.
- `licenses`
  - Active Pro license storage.
  - `POST /api/v1/auth/activate-pro` creates a license when missing and is idempotent when one already exists.

### Live auth endpoints

- `POST /api/v1/auth/check-email`
  - Request: `{ "email": "user@example.com" }`
  - Response: `{ isBuyer, hasAccount, email }`
- `POST /api/v1/auth/login`
  - Request: `{ "email": "...", "password": "..." }`
  - Response includes `accessToken`
- `POST /api/v1/auth/verify-status`
  - Request: `{ "accessToken": "..." }`
  - Response: `{ email, emailVerified }`
- `POST /api/v1/auth/activate-pro`
  - Request: `{ "accessToken": "...", "machineId": "...", "version": "...", "aioxCoreVersion": "..." }`
  - Response on first activation: `201` with `licenseKey`
  - Response on reinstall: `200` with existing `licenseKey`

---

## Decision Tree

### Case A: `isBuyer=false` and `hasAccount=false`

You must grant entitlement first, then create the account.

1. Upsert a positive row in `public.buyers`.
2. Create or confirm the auth user with the requested password.
3. Confirm the email.
4. Optionally seed `public.buyer_validations` if you want a local support override immediately available.
5. Validate with `check-email`, `login`, `verify-status`, and `activate-pro`.

### Case B: `isBuyer=true` and `hasAccount=false`

The entitlement already exists. Only create the auth user, confirm email, and validate.

### Case C: `isBuyer=true` and `hasAccount=true`

The user already exists. Only reset password if requested, confirm email status if needed, then validate `login` and `activate-pro`.

### Case D: `check-email` fails with buyer service unavailable

Treat this as an upstream buyer validation issue.

1. Confirm `public.buyers` contains an active row for the email.
2. Seed `public.buyer_validations` with `is_valid=true` for the target user.
3. Retry `check-email` and `activate-pro`.

---

## Step-By-Step Operator Runbook

## Dedicated DevOps Aliases

For repeat operations, prefer these `@devops` commands:

- `@devops *pro-access-grant EMAIL SENHA`
- `@devops *pro-check-access EMAIL`
- `@devops *pro-request-reset EMAIL`
- `@devops *pro-resend-verification EMAIL`
- `@devops *pro-reset-password EMAIL NOVA_SENHA`
- `@devops *pro-validate-login EMAIL SENHA`
- `@devops *pro-verify-status ACCESS_TOKEN`
- `@devops *pro-activate ACCESS_TOKEN [MACHINE_ID] [VERSION]`

### 1. Preflight

Run:

```bash
curl -sS https://aiox-license-server.vercel.app/api/v1/auth/check-email \
  -H 'content-type: application/json' \
  -d '{"email":"TARGET_EMAIL"}'
```

Expected outputs:

- `isBuyer=true` means entitlement exists.
- `hasAccount=true` means `auth.users` already contains the email.

### 2. Grant buyer entitlement in Supabase

Use the Supabase SQL editor for project `evvvnarpwcdybxdvcwjh` and run:

```sql
insert into public.buyers (email, source, is_active, metadata)
values (
  lower(trim('TARGET_EMAIL')),
  'manual_support',
  true,
  jsonb_build_object(
    'granted_by', 'devops',
    'reason', 'manual_aiox_pro_access_grant',
    'granted_at', now()
  )
)
on conflict (email)
do update set
  source = excluded.source,
  is_active = true,
  metadata = coalesce(public.buyers.metadata, '{}'::jsonb) || excluded.metadata;
```

Rules:

- Always normalize to lowercase email.
- Always set `is_active = true`.
- Use `source='manual_support'` for manual support grants.

### 3. Create or update the auth user

Preferred path: Supabase Auth dashboard for the same project.

Required values:

- Email: requested customer email
- Password: requested or support-default password
- Email confirmed: `true`

If the user already exists:

- update the password if support explicitly asked for a reset
- ensure the email is confirmed

If you need an API path instead of the dashboard, use the same admin capability the server uses (`supabaseAdmin.auth.admin.createUser`).

### 4. Seed the local buyer validation fallback

Do this when:

- buyer RPC is unstable
- you want support override resilience
- `check-email` still returns buyer false right after the grant

First fetch the auth user id for the email, then run:

```sql
insert into public.buyer_validations (user_id, email, is_valid, validated_at, expires_at)
values (
  'TARGET_USER_ID',
  lower(trim('TARGET_EMAIL')),
  true,
  now(),
  now() + interval '24 hours'
)
on conflict (user_id)
do update set
  email = excluded.email,
  is_valid = true,
  validated_at = now(),
  expires_at = now() + interval '24 hours';
```

### 5. Validate the API flow directly

Run in order.

#### 5.1 `check-email`

```bash
curl -sS https://aiox-license-server.vercel.app/api/v1/auth/check-email \
  -H 'content-type: application/json' \
  -d '{"email":"TARGET_EMAIL"}'
```

Expected:

- `isBuyer=true`
- `hasAccount=true`

#### 5.2 `login`

```bash
curl -sS https://aiox-license-server.vercel.app/api/v1/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"TARGET_EMAIL","password":"TARGET_PASSWORD"}'
```

Expected:

- `200`
- response contains `accessToken`

#### 5.3 `verify-status`

```bash
curl -sS https://aiox-license-server.vercel.app/api/v1/auth/verify-status \
  -H 'content-type: application/json' \
  -d '{"accessToken":"ACCESS_TOKEN"}'
```

Expected:

- `emailVerified=true`

#### 5.4 `activate-pro`

```bash
curl -sS https://aiox-license-server.vercel.app/api/v1/auth/activate-pro \
  -H 'content-type: application/json' \
  -d '{
    "accessToken":"ACCESS_TOKEN",
    "machineId":"ops-validation-machine",
    "version":"5.0.3",
    "aioxCoreVersion":"5.0.3"
  }'
```

Expected:

- first activation: `201` with `licenseKey`
- reinstall or already-provisioned user: `200` with message similar to `License restored`

### 6. Validate the guided installer as the user

This story validated both paths below with:

- email: `costa.wanderl@gmail.com`
- password: `AioxPro2026!`
- result: success in source install and packaged install

#### 6.1 Source checkout path

```bash
node bin/aiox.js install
```

Wizard choices used in validation:

1. `Portugues`
2. `Modo Avancado`
3. `Greenfield`
4. IDEs: `Claude Code` and `Codex CLI`
5. tech preset: `nextjs-react`
6. edition: `Pro`
7. activation method: `Login ou criar conta`
8. user email and password

Expected success signals:

- `Conteudo Pro instalado`
- final verification report shows `Overall Status: All checks passed`
- generated project contains:
  - `.claude/skills`
  - `.claude/commands`
  - `.codex/skills`

#### 6.2 Packaged tarball path

Pack first:

```bash
npm pack
```

Then validate from a clean target directory:

```bash
npm exec --yes --package=/absolute/path/to/aiox-core-<version>.tgz aiox-core -- install
```

Use the same wizard answers and expect the same success signals.

---

## Validated Results From 2026-04-20

### Direct API smoke test

Validated against production for `costa.wanderl@gmail.com`:

- `check-email`: `isBuyer=true`, `hasAccount=true`
- `login`: `200`, `accessToken` present, `emailVerified=true`
- `verify-status`: `200`, `emailVerified=true`
- `activate-pro`: `200`, `activated=true`, existing license restored

### Guided installation validation

Validated successfully:

- source checkout install
- packaged tarball install

The final installer verification passed in both cases and the generated projects contained the expected Claude and Codex assets.

---

## Troubleshooting

### `activate-pro` returns `400 Invalid input: expected string, received undefined`

Cause:

- outdated client contract

Fix:

- caller must send `{ accessToken }` in the JSON body
- newer installer build already does this

### `check-email` returns `isBuyer=false` right after granting the user

Check:

- `public.buyers` row exists and `is_active=true`
- email normalized to lowercase
- if buyer RPC is degraded, seed `public.buyer_validations`

### `login` works but `verify-status` says not verified

Fix:

- confirm the user email in Supabase Auth

### Installer completes but `.codex/skills` or `.claude/skills` are missing

This story fixed the packaging and generation path. Rebuild with the updated installer package and rerun.

### Installer emits false dependency warnings in a normal user project

This story fixed the dependency validator to avoid flagging installer-internal packages in user projects. Rebuild with the updated package and rerun.

---

## Evidence To Attach In Support Closure

- `check-email` response
- `login` response status only
- `verify-status` response
- `activate-pro` response status only
- source guided install result
- tarball guided install result

Do not paste the full `accessToken` or the full `licenseKey` into tickets or chat.
