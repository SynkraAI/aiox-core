# Verify Subtask

> **Phase:** Execution - Verification
> **Owner Agent:** @dev
> **Pipeline:** execution-pipeline

---

## Purpose

Verify that a subtask has been completed successfully by running the configured verification type (command, api, browser, e2e). Uses the subtask-verifier.js script for execution.

---

## autoClaude

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: execution-verify

  deterministic: true
  elicit: false
  composable: true

  inputs:
    - name: subtaskId
      type: string
      required: true
      description: "Subtask ID from implementation.yaml (e.g., '1.1', '2.3')"

    - name: storyId
      type: string
      required: true
      description: 'Story ID for locating implementation.yaml'

    - name: implementationPath
      type: file
      path: docs/stories/{storyId}/plan/implementation.yaml
      required: true

  outputs:
    - name: verificationResult
      type: object
      schema:
        subtaskId: string
        passed: boolean
        verificationType: string
        duration: number
        logs: array
        attempts: number
        error: object|null

  verification:
    type: script
    script: .aiox-core/infrastructure/scripts/subtask-verifier.js
    timeout: 120
```

---

## Command Integration (@dev)

```yaml
command:
  name: '*verify-subtask'
  syntax: '*verify-subtask {subtask-id}'
  agent: dev

  examples:
    - '*verify-subtask 1.1'
    - '*verify-subtask 2.3'

  aliases:
    - '*verify'
```

---

## Execution

### Step 1: Locate Implementation Plan

```yaml
step_1:
  actions:
    - action: find_implementation
      paths:
        - docs/stories/{storyId}/plan/implementation.yaml
        - .aiox/plans/{storyId}/implementation.yaml

  validation:
    check: 'implementation.yaml found'
    onFailure: halt
```

### Step 2: Run Verification Script

```yaml
step_2:
  actions:
    - action: execute_script
      script: |
        node .aiox-core/infrastructure/scripts/subtask-verifier.js {subtaskId} \
          --implementation {implementationPath} \
          --verbose \
          --update

  timeout: 120000

  output:
    verificationResult: object
```

### Step 3: Report Results

```yaml
step_3:
  actions:
    - action: display_report
      format: |
        ## Verification Result: {subtaskId}

        **Status:** {passed ? '✅ PASS' : '❌ FAIL'}
        **Type:** {verificationType}
        **Duration:** {duration}ms
        **Attempts:** {attempts}

        {error ? '### Error\n' + error.message : ''}

        ### Logs
        {logs.slice(-5).join('\n')}
```

---

## Verification Types Supported

| Type      | Description                         | Config Fields                                   |
| --------- | ----------------------------------- | ----------------------------------------------- |
| `command` | Run shell command, check exit code  | `command`, `timeout`                            |
| `api`     | HTTP request, check status/response | `url`, `expectedStatus`, `method`, `body`       |
| `browser` | Playwright UI verification          | `url`, `selector`, `expectedText`, `screenshot` |
| `e2e`     | End-to-end test suite               | `testCommand`, `timeout`                        |

---

## Examples

### Command Verification

```yaml
# In implementation.yaml
subtasks:
  - id: '1.1'
    description: 'Create store module'
    verification:
      type: command
      command: 'npm run typecheck'
      timeout: 60
```

### API Verification

```yaml
subtasks:
  - id: '2.1'
    description: 'Implement login endpoint'
    verification:
      type: api
      url: 'http://localhost:3000/api/auth/login'
      method: POST
      body:
        email: 'test@example.com'
        password: 'test123'
      expectedStatus: 200
```

### Browser Verification

```yaml
subtasks:
  - id: '3.1'
    description: 'Add login form'
    verification:
      type: browser
      url: 'http://localhost:3000/login'
      selector: "form[data-testid='login-form']"
      expectedText: 'Sign In'
```

---

## Error Handling

```yaml
errors:
  - id: implementation-not-found
    condition: 'implementation.yaml not found'
    action: halt
    message: 'Cannot verify - implementation.yaml not found for {storyId}'

  - id: subtask-not-found
    condition: 'Subtask ID not in plan'
    action: halt
    message: 'Subtask {subtaskId} not found in implementation.yaml'

  - id: verification-failed
    condition: 'Verification failed after retries'
    action: report
    message: 'Verification failed for {subtaskId}: {error}'

  - id: timeout
    condition: 'Verification timed out'
    action: report
    message: 'Verification timed out after {timeout}ms'
```

---

## Metadata

```yaml
metadata:
  story: '4.5'
  epic: 'Epic 4 - Execution Pipeline'
  created: '2026-01-28'
  author: '@architect (Aria)'
  version: '1.0.0'
  tags:
    - execution-pipeline
    - verification
    - subtask
    - development
```
