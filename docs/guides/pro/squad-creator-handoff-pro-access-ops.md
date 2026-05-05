# Handoff: Squad Creator -> DevOps Pro Access Ops

**Status:** Ready to operationalize
**Validated on:** 2026-04-20
**Target squad/task owner:** `@squad-creator` creating reusable surfaces for `@devops`

---

## Objective

Convert the validated AIOX Pro access grant procedure into a reusable task/workflow pair so DevOps can execute it repeatedly without rediscovering:

- which system is authoritative
- which tables matter
- which API contract is current
- which validations are mandatory

---

## What Is Already Validated

The following is not speculative. It was validated end-to-end on 2026-04-20:

- live license server contract uses `accessToken` in `verify-status` and `activate-pro`
- `activate-pro` returns `licenseKey`
- buyer entitlement comes from `public.buyers`
- local support fallback can be seeded through `public.buyer_validations`
- `activate-pro` is idempotent and restores existing licenses
- guided installer passed in:
  - source checkout flow
  - packaged tarball flow

Validated customer used in this run:

- email: `costa.wanderl@gmail.com`
- password used for validation: `AioxPro2026!`

---

## Artifacts To Use As Inputs

Squad creator should treat these files as the authoritative seed set:

1. `docs/guides/pro/access-grant-ops-playbook.md`
2. `docs/aiox-workflows/pro-access-grant-workflow.md`
3. `.aiox-core/development/tasks/devops-pro-access-grant.md`
4. `docs/stories/PRO-11.1-auth-contract-hardening-and-pro-access-ops.md`

---

## Required Deliverables

Squad creator must create or register:

1. A reusable DevOps task for Pro access grants.
2. Dedicated point-action aliases for common support operations.
3. A reusable workflow that chains:
- preflight
- entitlement grant
- account setup
- API validation
- guided install validation
4. Clear input schema:
- `target_email`
- `target_password`
- `reset_password`
- `run_guided_validation`
5. A closeout/evidence template that never leaks full token or full license key.

Minimum alias set now expected:

- `*pro-access-grant`
- `*pro-check-access`
- `*pro-request-reset`
- `*pro-resend-verification`
- `*pro-reset-password`
- `*pro-validate-login`
- `*pro-verify-status`
- `*pro-activate`

---

## Non-Negotiable Rules

Do not let the generated task/workflow drift from these rules:

- `public.buyers` is the buyer entitlement oracle.
- `check-email` and `login` are the preflight validation pair.
- `verify-status` and `activate-pro` must send `accessToken` in the JSON body.
- `activate-pro` may return success for an already-activated user; that is correct behavior.
- Guided validation must assert Claude and Codex assets exist in the installed project.
- No rediscovery instructions. The output must assume fixed backend context and operator access.

---

## Suggested Registration Shape

### Task name

- `devops-pro-access-grant`

### Workflow name

- `pro-access-grant-workflow`

### Primary agent

- `@devops`

### Secondary references

- `@qa` only for validating future regressions in installer behavior
- `@squad-creator` only for packaging and publishing the reusable assets

---

## Done Criteria

The squad creator work is done only when:

- the task exists in the canonical task surface
- the workflow exists in the canonical workflow surface
- both point back to the validated playbook
- both preserve the exact decision tree and validation order
- a DevOps operator can run the process without asking where buyer data, auth state, or activation checks live

---

## Implementation Notes For Squad Creator

- Prefer copying the validated sequence directly instead of rewriting from scratch.
- Keep the workflow operational, not pedagogical.
- Keep the task biased toward action and evidence collection.
- If you add examples, use masked values for tokens and license keys.
