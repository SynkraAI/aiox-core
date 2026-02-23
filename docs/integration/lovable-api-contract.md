# Lovable-AIOS API Contract

**Author:** Aria (Architect Agent)
**Date:** 2026-02-22
**Status:** Draft
**Related:** [lovable-aios-architecture.md](./lovable-aios-architecture.md)

---

## 1. MCP Tool Definitions

All tools follow the MCP tool specification. Lovable's agent invokes these tools via the configured MCP server.

---

### 1.1 `aios_strategize`

**Description:** Generate product strategy and requirements from a user spec.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "spec": {
      "type": "string",
      "description": "Natural language product specification from user"
    },
    "context": {
      "type": "object",
      "properties": {
        "industry": { "type": "string" },
        "target_audience": { "type": "string" },
        "budget_tier": { "type": "string", "enum": ["startup", "scaleup", "enterprise"] }
      }
    }
  },
  "required": ["spec"]
}
```

**Output:**

```json
{
  "requirements": {
    "functional": [
      { "id": "FR-1", "description": "User registration with email", "priority": "must" }
    ],
    "non_functional": [
      { "id": "NFR-1", "description": "Page load under 2s", "category": "performance" }
    ],
    "constraints": [
      { "id": "CON-1", "description": "Must use Supabase for backend" }
    ]
  },
  "strategy_summary": "string",
  "estimated_complexity": "simple | standard | complex"
}
```

---

### 1.2 `aios_design_architecture`

**Description:** Produce system architecture from requirements.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "spec": {
      "type": "string",
      "description": "Product spec or requirements JSON"
    },
    "requirements": {
      "type": "object",
      "description": "Output from aios_strategize (optional, enhances quality)"
    },
    "stack_preference": {
      "type": "string",
      "description": "Preferred tech stack (e.g., 'nextjs-react', 'vite-react')"
    }
  },
  "required": ["spec"]
}
```

**Output:**

```json
{
  "architecture": {
    "stack": {
      "frontend": "Next.js 16 + React + TypeScript + Tailwind",
      "backend": "Supabase (PostgreSQL + Auth + Storage + Edge Functions)",
      "deployment": "Vercel"
    },
    "data_model": {
      "entities": [
        {
          "name": "User",
          "fields": [
            { "name": "id", "type": "uuid", "primary": true },
            { "name": "email", "type": "string", "unique": true }
          ]
        }
      ],
      "relationships": [
        { "from": "User", "to": "Quiz", "type": "one-to-many" }
      ]
    },
    "api_design": {
      "endpoints": [
        { "method": "GET", "path": "/api/quizzes", "description": "List quizzes" }
      ]
    },
    "security": {
      "auth_strategy": "Supabase Auth with RLS",
      "rls_policies": ["Users can only read their own data"]
    }
  },
  "architecture_markdown": "string (full architecture document in markdown)"
}
```

---

### 1.3 `aios_design_ux`

**Description:** Generate UX specification with wireframe descriptions and design tokens.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "spec": { "type": "string" },
    "requirements": { "type": "object" },
    "architecture": { "type": "object" },
    "style_preference": {
      "type": "string",
      "description": "Visual style (e.g., 'minimal', 'corporate', 'playful')"
    }
  },
  "required": ["spec"]
}
```

**Output:**

```json
{
  "ux_spec": {
    "user_flows": [
      {
        "name": "Registration Flow",
        "steps": ["Landing page", "Sign up form", "Email verification", "Onboarding"]
      }
    ],
    "pages": [
      {
        "name": "Dashboard",
        "components": ["Sidebar", "StatCards", "RecentActivity", "QuickActions"],
        "layout": "sidebar-main"
      }
    ],
    "design_tokens": {
      "colors": {
        "primary": "#6366F1",
        "secondary": "#8B5CF6",
        "background": "#FFFFFF",
        "text": "#1F2937"
      },
      "typography": {
        "font_family": "Inter",
        "heading_sizes": { "h1": "2.25rem", "h2": "1.875rem", "h3": "1.5rem" }
      },
      "spacing": { "unit": "0.25rem", "scale": [1, 2, 3, 4, 6, 8, 12, 16] }
    },
    "component_library": "shadcn/ui"
  },
  "ux_markdown": "string"
}
```

---

### 1.4 `aios_generate_code`

**Description:** Generate implementation code from spec + architecture + UX.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "spec": { "type": "string" },
    "architecture": { "type": "object" },
    "ux_spec": { "type": "object" },
    "target_files": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Specific files to generate (optional, generates all if omitted)"
    },
    "framework": {
      "type": "string",
      "default": "nextjs-react",
      "description": "Target framework preset"
    }
  },
  "required": ["spec"]
}
```

**Output:**

```json
{
  "files": [
    {
      "path": "src/app/page.tsx",
      "content": "// Generated code...",
      "language": "typescript"
    },
    {
      "path": "src/components/Dashboard.tsx",
      "content": "// Generated code...",
      "language": "typescript"
    }
  ],
  "dependencies": {
    "production": { "@supabase/supabase-js": "^2.x" },
    "development": { "@types/node": "^20.x" }
  },
  "setup_instructions": "string"
}
```

---

### 1.5 `aios_full_pipeline`

**Description:** Run the complete agent pipeline. Returns immediately with a job ID for long-running orchestrations.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "spec": { "type": "string", "description": "Full product specification" },
    "phases": {
      "type": "array",
      "items": { "type": "string", "enum": ["strategy", "architecture", "ux", "code"] },
      "default": ["strategy", "architecture", "ux", "code"]
    },
    "stack_preference": { "type": "string" },
    "style_preference": { "type": "string" },
    "webhook_url": {
      "type": "string",
      "format": "uri",
      "description": "URL to POST completion notification (optional)"
    }
  },
  "required": ["spec"]
}
```

**Output (immediate):**

```json
{
  "job_id": "job_abc123def456",
  "status": "running",
  "phases_queued": ["strategy", "architecture", "ux", "code"],
  "estimated_duration_seconds": 120
}
```

---

### 1.6 `aios_get_status`

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "job_id": { "type": "string" }
  },
  "required": ["job_id"]
}
```

**Output:**

```json
{
  "job_id": "job_abc123def456",
  "status": "running | completed | failed | timeout",
  "phases": {
    "strategy": { "status": "completed", "duration_ms": 8500 },
    "architecture": { "status": "running", "started_at": "2026-02-22T10:30:00Z" },
    "ux": { "status": "queued" },
    "code": { "status": "queued" }
  },
  "progress_percent": 35,
  "error": null
}
```

---

### 1.7 `aios_get_artifact`

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "job_id": { "type": "string" },
    "artifact_type": {
      "type": "string",
      "enum": ["strategy", "architecture", "ux", "code", "all"]
    }
  },
  "required": ["job_id", "artifact_type"]
}
```

**Output:** Returns the corresponding tool output (same shape as the individual tool outputs above).

---

## 2. Webhook Payload (Async Completion)

When `webhook_url` is provided in `aios_full_pipeline`, a POST is sent on completion:

```http
POST {webhook_url}
Content-Type: application/json
X-AIOS-Signature: sha256=<hmac_hex>
X-AIOS-Timestamp: 1740230400

{
  "event": "pipeline.completed",
  "job_id": "job_abc123def456",
  "status": "completed",
  "phases_completed": ["strategy", "architecture", "ux", "code"],
  "artifact_urls": {
    "strategy": "https://api.aios.synkra.com/artifacts/job_abc123/strategy",
    "architecture": "https://api.aios.synkra.com/artifacts/job_abc123/architecture",
    "ux": "https://api.aios.synkra.com/artifacts/job_abc123/ux",
    "code": "https://api.aios.synkra.com/artifacts/job_abc123/code"
  },
  "duration_ms": 95000
}
```

### Webhook Signature Verification

```
signature = HMAC-SHA256(webhook_secret, timestamp + "." + request_body)
```

Verify by computing the HMAC and comparing to `X-AIOS-Signature` header value. Reject if `X-AIOS-Timestamp` is older than 5 minutes.

---

## 3. Error Response Format

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "The 'spec' field is required and must be a non-empty string",
    "details": {
      "field": "spec",
      "constraint": "required"
    },
    "request_id": "req_xyz789"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or expired API key |
| `RATE_LIMITED` | Too many requests |
| `INVALID_INPUT` | Malformed or missing input |
| `AGENT_TIMEOUT` | Agent did not respond within timeout |
| `AGENT_FAILURE` | Agent encountered an internal error |
| `JOB_NOT_FOUND` | Job ID does not exist or has expired |
| `ARTIFACT_NOT_READY` | Requested artifact phase not yet complete |
| `INTERNAL_ERROR` | Unexpected server error |

---

## 4. Rate Limiting Headers

All responses include:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 54
X-RateLimit-Reset: 1740230460
Retry-After: 30  (only on 429 responses)
```

---

## 5. Versioning

API version is embedded in the MCP server URL:

```
https://mcp.aios.synkra.com/v1
```

Breaking changes increment the version. Old versions supported for 6 months after deprecation notice.
