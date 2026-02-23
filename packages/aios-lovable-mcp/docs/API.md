# AIOS Lovable MCP - REST API Reference

## 📖 Overview

The AIOS Lovable MCP Server exposes a REST API for job management alongside the MCP protocol interface. This guide covers all HTTP endpoints.

**Base URL:** `https://your-railway-url`

**Authentication:** Bearer token in `Authorization` header or `api_key` query parameter

---

## 🔐 Authentication

All endpoints (except `/health`) require an API key:

### Option 1: Bearer Token (Recommended)
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-url/api/jobs
```

### Option 2: Query Parameter
```bash
curl "https://your-url/api/jobs?api_key=YOUR_API_KEY"
```

### Getting Started
1. Generate an API key: See [Deployment Guide](./DEPLOYMENT.md#generating-api-keys)
2. Set `AIOS_API_KEYS` environment variable
3. Use key in requests

---

## ✅ Health Check

**Endpoint:** `GET /health`

No authentication required.

### Response
```json
{
  "status": "healthy",
  "uptime": 3600.5,
  "timestamp": "2026-02-22T15:30:00Z"
}
```

### Example
```bash
curl https://your-url/health
```

---

## 🚀 Create Job

**Endpoint:** `POST /api/jobs`

Create an async job for AIOS orchestration.

### Request
```bash
curl -X POST https://your-url/api/jobs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "aios_full_pipeline",
    "input": {
      "product_name": "My App",
      "description": "A powerful new app that does X",
      "target_segments": ["SMBs", "Enterprise"],
      "key_problems": ["Problem 1", "Problem 2"],
      "design_preferences": {
        "primary_color": "#3B82F6",
        "style": "modern"
      }
    },
    "webhook_url": "https://lovable.app/webhooks/job-status"
  }'
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tool` | string | ✅ | MCP tool name (e.g., `aios_strategize`, `aios_design_ux`) |
| `input` | object | ✅ | Tool-specific input data |
| `webhook_url` | string | ❌ | URL to receive job status updates |

### Response
```json
{
  "job_id": "cm3x7b9k2j",
  "status": "queued",
  "status_url": "/api/jobs/cm3x7b9k2j",
  "polling_interval_ms": 1000
}
```

### Status Codes
- `202 Accepted` - Job created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid API key
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## 📊 Get Job Status

**Endpoint:** `GET /api/jobs/:jobId`

Check status and progress of an async job.

### Request
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-url/api/jobs/cm3x7b9k2j
```

### Response
```json
{
  "job_id": "cm3x7b9k2j",
  "status": "processing",
  "progress": 45,
  "output": null,
  "error": null
}
```

### Status Values
| Status | Description |
|--------|-------------|
| `queued` | Waiting in queue |
| `processing` | Currently executing |
| `completed` | Finished successfully |
| `failed` | Execution failed |

### Response Headers
```
X-RateLimit-Remaining: 59
```

---

## 📡 Real-Time Updates (SSE)

**Endpoint:** `GET /api/jobs/:jobId/stream`

Subscribe to real-time job status updates via Server-Sent Events.

### Request
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-url/api/jobs/cm3x7b9k2j/stream
```

### Response (Streaming)
```
data: {"type":"connected","job_id":"cm3x7b9k2j"}

data: {"type":"status_update","job_id":"cm3x7b9k2j","status":"processing","progress":25}

data: {"type":"status_update","job_id":"cm3x7b9k2j","status":"processing","progress":50}

data: {"type":"status_update","job_id":"cm3x7b9k2j","status":"completed","progress":100,"output":{...}}
```

### JavaScript Example
```javascript
const eventSource = new EventSource(
  'https://your-url/api/jobs/cm3x7b9k2j/stream?api_key=YOUR_KEY'
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`Job ${data.job_id}: ${data.status} (${data.progress}%)`);

  if (data.status === 'completed') {
    eventSource.close();
    console.log('Output:', data.output);
  }
};

eventSource.onerror = (error) => {
  console.error('Stream error:', error);
  eventSource.close();
};
```

---

## 🔗 Test Webhook

**Endpoint:** `POST /api/webhooks/test`

Test webhook delivery to a URL.

### Request
```bash
curl -X POST https://your-url/api/webhooks/test \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhook"
  }'
```

### Response
```json
{
  "webhook_url": "https://example.com/webhook",
  "delivered": true,
  "timestamp": "2026-02-22T15:30:00Z"
}
```

---

## 🔑 API Key Management

### List API Keys (Admin)

**Endpoint:** `GET /api/admin/keys?admin_key=YOUR_ADMIN_KEY`

### Request
```bash
curl -H "Authorization: Bearer ANY_KEY" \
  "https://your-url/api/admin/keys?admin_key=$ADMIN_API_KEY"
```

### Response
```json
{
  "keys": [
    {
      "name": "lovable",
      "key": "aios_lovable_abcdefgh",
      "createdAt": "2026-02-20T10:00:00Z",
      "lastUsed": "2026-02-22T15:25:30Z"
    },
    {
      "name": "local",
      "key": "aios_dev_12345678",
      "createdAt": "2026-02-19T14:30:00Z",
      "lastUsed": "2026-02-22T14:00:00Z"
    }
  ]
}
```

### Generate API Key (Admin)

**Endpoint:** `POST /api/admin/keys`

### Request
```bash
curl -X POST https://your-url/api/admin/keys \
  -H "Authorization: Bearer ANY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "new-app",
    "requests_per_minute": 100
  }' \
  -G -d "admin_key=$ADMIN_API_KEY"
```

### Response
```json
{
  "key": "aios_newapp_xyz123abc",
  "name": "new-app",
  "created_at": "2026-02-22T15:30:00Z"
}
```

---

## 📝 Tool-Specific Examples

### aios_strategize

Create product strategy and PRD:

```bash
curl -X POST https://your-url/api/jobs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "aios_strategize",
    "input": {
      "product_name": "TaskFlow Pro",
      "description": "AI-powered task management for teams",
      "target_segments": ["SMBs", "Startups"],
      "key_problems": [
        "Task overload",
        "Team coordination",
        "Deadline tracking"
      ],
      "success_metrics": [
        "DAU growth >15% monthly",
        "NPS >60",
        "Churn <5%"
      ]
    }
  }'
```

### aios_design_ux

Generate design system and wireframes:

```bash
curl -X POST https://your-url/api/jobs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "aios_design_ux",
    "input": {
      "product_name": "TaskFlow Pro",
      "user_flows": [
        "Sign Up",
        "Create Task",
        "Assign to Team",
        "Mark Complete"
      ],
      "design_preferences": {
        "primary_color": "#6366F1",
        "font_family": "Inter",
        "style": "minimal"
      },
      "accessibility_requirements": [
        "WCAG 2.1 AA",
        "Dark mode support",
        "Keyboard navigation"
      ]
    }
  }'
```

### aios_full_pipeline

End-to-end orchestration:

```bash
curl -X POST https://your-url/api/jobs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "aios_full_pipeline",
    "input": {
      "product_name": "TaskFlow Pro",
      "description": "AI-powered task management for teams",
      "target_segments": ["SMBs", "Startups"],
      "design_preferences": {
        "primary_color": "#6366F1"
      },
      "tech_stack": "nextjs-react",
      "webhook_url": "https://lovable.app/webhooks/job"
    }
  }'
```

---

## ⚠️ Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Common Errors

| Code | HTTP | Message | Solution |
|------|------|---------|----------|
| `UNAUTHORIZED` | 401 | API key required | Add API key to request |
| `INVALID_KEY` | 401 | Invalid API key | Verify API key is correct |
| `RATE_LIMITED` | 429 | Rate limit exceeded | Wait or generate new key |
| `INVALID_REQUEST` | 400 | Missing required fields | Check input parameters |
| `JOB_NOT_FOUND` | 404 | Job not found | Job may have expired (1 hour) |
| `JOB_CREATION_FAILED` | 500 | Server error | Retry or contact support |

---

## 📈 Rate Limiting

Each API key has rate limits:
- **Per Minute:** 60 requests
- **Per Day:** 10,000 requests

Response headers indicate remaining quota:
```
X-RateLimit-Remaining: 59
```

When limit exceeded:
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded: 60 requests per minute"
  }
}
```

---

## 🔄 Webhook Payloads

When a job updates, your webhook receives:

```json
{
  "job_id": "cm3x7b9k2j",
  "status": "completed",
  "progress": 100,
  "output": {
    "strategy": { ... },
    "prd": { ... },
    "strategy_markdown": "...",
    "prd_markdown": "..."
  },
  "error": null,
  "timestamp": "2026-02-22T15:35:00Z"
}
```

**Webhook Security:**
- Includes `X-AIOS-Signature` header for verification
- Retries up to 3 times with exponential backoff
- Timeout: 10 seconds per attempt

---

## 📞 Support

- **Documentation:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues:** Check logs via `railway logs -f`
- **Status:** Health check: `GET /health`

Happy building! 🚀
