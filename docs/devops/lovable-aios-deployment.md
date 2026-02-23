# Lovable-AIOS Integration Deployment Strategy

**Status:** Draft (awaiting @architect design decisions)
**Author:** @devops (Gage)
**Date:** 2026-02-22

---

## 1. Infrastructure Plan

### 1.1 API Server

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Runtime | Node.js 20+ LTS | Matches AIOS stack, CLI First principle |
| Framework | Express.js (minimal) | Lightweight, proven webhook handling |
| Process Manager | PM2 or systemd | Auto-restart, log management |
| Hosting | VPS (DigitalOcean/Railway) or Vercel Serverless | [AUTO-DECISION] VPS preferred for long-running agent jobs; Vercel for webhook receiver only (reason: agent execution can exceed serverless timeouts) |

### 1.2 Webhook Receiver

```
POST /api/webhooks/lovable  ->  Validate signature -> Parse event -> Queue job
POST /api/webhooks/lovable/status  ->  Health/status endpoint
```

**Signature Validation:**
- HMAC-SHA256 with shared secret
- Reject requests older than 5 minutes (replay protection)
- IP allowlisting if Lovable provides static IPs

### 1.3 Agent Queuing / Job System

| Option | Pros | Cons | Recommendation |
|--------|------|------|---------------|
| BullMQ + Redis | Battle-tested, retries, priority | Requires Redis | Production |
| In-memory queue | Zero deps, simple | Lost on restart | Dev/testing only |
| Inngest | Managed, durable functions | Vendor lock-in | Alternative |

**[AUTO-DECISION]** BullMQ + Redis selected for production (reason: supports retries, dead letter queues, priority lanes, and AIOS agents can be long-running).

**Queue Architecture:**
```
lovable-webhook-queue (fast, validation + parsing)
  -> agent-execution-queue (slow, runs AIOS agents)
    -> result-delivery-queue (medium, callbacks to Lovable)
```

### 1.4 Result Storage / Caching

| Data | Storage | TTL |
|------|---------|-----|
| Webhook payloads | Redis | 24h |
| Agent execution results | File system + Redis | 7 days |
| Lovable project mappings | SQLite or JSON file | Persistent |
| Agent logs per execution | File system | 30 days |

---

## 2. CI/CD Pipeline

### 2.1 Deployment Workflow

See `.github/workflows/lovable-integration-deploy.yml` for the full workflow.

**Trigger:** Push to `main` with changes in `packages/lovable-integration/` or manual dispatch.

**Steps:**
1. Install dependencies
2. Run lint + typecheck + tests
3. Build integration package
4. Deploy to target environment
5. Run health check
6. Notify on failure

### 2.2 Auto-Restart on Agent Failures

```yaml
# PM2 ecosystem config
apps:
  - name: lovable-webhook-receiver
    script: ./dist/server.js
    instances: 1
    autorestart: true
    max_restarts: 10
    restart_delay: 5000
    env:
      NODE_ENV: production
  - name: lovable-agent-worker
    script: ./dist/worker.js
    instances: 2
    autorestart: true
    max_restarts: 5
    restart_delay: 10000
```

### 2.3 Monitoring and Alerting

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Webhook response time | > 500ms | WARN |
| Agent execution time | > 5 min | WARN |
| Agent execution time | > 15 min | CRITICAL |
| Failed jobs (dead letter) | > 3 in 1h | CRITICAL |
| Queue depth | > 50 | WARN |
| Memory usage | > 80% | WARN |
| Disk usage | > 90% | CRITICAL |

**[AUTO-DECISION]** Use simple healthcheck endpoint + cron-based monitoring initially (reason: avoid over-engineering before validating the integration works).

### 2.4 Health Checks

```
GET /health              -> { status: "ok", uptime, queue_depth, redis_connected }
GET /health/agent        -> { agents_available, last_execution, error_rate }
GET /health/lovable      -> { api_reachable, last_webhook_received }
```

---

## 3. Integration Points

### 3.1 Lovable OAuth / API Key Setup

**Required from Lovable:**
- API key or OAuth client credentials
- Webhook signing secret
- Callback URL format for result delivery
- Rate limit documentation

**AIOS provides to Lovable:**
- Webhook receiver URL: `https://{domain}/api/webhooks/lovable`
- Supported event types
- Result callback format

### 3.2 Webhook Configuration in Lovable

```json
{
  "webhook_url": "https://{domain}/api/webhooks/lovable",
  "events": [
    "project.created",
    "project.updated",
    "code.review_requested",
    "agent.task_requested"
  ],
  "secret": "${LOVABLE_WEBHOOK_SECRET}",
  "content_type": "application/json"
}
```

### 3.3 AIOS Agent Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/lovable` | POST | Receive Lovable events |
| `/api/agents/status/:jobId` | GET | Check agent job status |
| `/api/agents/cancel/:jobId` | POST | Cancel running agent job |
| `/api/results/:jobId` | GET | Retrieve agent results |

### 3.4 Result Callbacks

```typescript
interface AgentResult {
  jobId: string;
  lovableProjectId: string;
  agentId: string;  // e.g., "dev", "qa", "architect"
  status: "completed" | "failed" | "timeout";
  result: {
    summary: string;
    files_changed: string[];
    suggestions: string[];
    code_diff?: string;
  };
  executionTime: number;  // ms
  timestamp: string;
}
```

Callback delivery: POST to Lovable's callback URL with retry (3 attempts, exponential backoff).

---

## 4. Deployment Checklist

### 4.1 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` / `staging` / `development` |
| `PORT` | Yes | Server port (default: 3100) |
| `LOVABLE_API_KEY` | Yes | Lovable API authentication key |
| `LOVABLE_WEBHOOK_SECRET` | Yes | HMAC signing secret for webhook validation |
| `LOVABLE_CALLBACK_URL` | Yes | URL to send results back to Lovable |
| `REDIS_URL` | Yes (prod) | Redis connection string for BullMQ |
| `AIOS_AGENT_TIMEOUT_MS` | No | Agent execution timeout (default: 900000 / 15min) |
| `LOG_LEVEL` | No | `debug` / `info` / `warn` / `error` |
| `RATE_LIMIT_MAX` | No | Max requests per window (default: 100) |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window (default: 60000) |

### 4.2 Secrets Management

- Store all secrets in environment variables, never in code
- Use GitHub Secrets for CI/CD pipeline
- Use `.env` locally (already in `.gitignore`)
- Rotate `LOVABLE_WEBHOOK_SECRET` quarterly
- Rotate `LOVABLE_API_KEY` on any suspected compromise

### 4.3 Rate Limiting Configuration

```typescript
// express-rate-limit config
const limiter = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  max: 100,                 // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-lovable-project-id'] || req.ip,
});
```

### 4.4 Monitoring Setup

- Health check endpoint: `/health`
- Uptime monitoring: UptimeRobot or similar (free tier)
- Log aggregation: stdout/stderr captured by PM2 logs
- Error tracking: Sentry (optional, Phase 2)

---

## 5. Testing Strategy

### 5.1 Webhook Signature Validation

```typescript
// Test cases
describe('Webhook Signature', () => {
  it('accepts valid HMAC-SHA256 signature');
  it('rejects invalid signature');
  it('rejects expired timestamp (> 5min)');
  it('rejects missing signature header');
  it('rejects empty body');
});
```

### 5.2 Agent Execution (Mock)

```typescript
describe('Agent Execution', () => {
  it('queues job on valid webhook');
  it('executes @dev agent for code review request');
  it('executes @qa agent for quality check request');
  it('handles agent timeout gracefully');
  it('retries failed agent execution (max 2)');
  it('moves to dead letter queue after max retries');
});
```

### 5.3 Result Delivery

```typescript
describe('Result Delivery', () => {
  it('sends result to Lovable callback URL');
  it('retries on 5xx from Lovable (3 attempts)');
  it('logs failed delivery after max retries');
  it('includes correct jobId and projectId');
});
```

### 5.4 Load Testing

| Scenario | Target | Tool |
|----------|--------|------|
| Sustained webhooks | 10 req/s for 5 min | autocannon / k6 |
| Burst | 50 req/s for 30s | autocannon / k6 |
| Concurrent agents | 5 simultaneous | Custom script |
| Memory under load | < 512MB RSS | Node.js `--max-old-space-size` |

---

## 6. Rollout Plan

### Phase 1: Internal Testing (localhost)

**Duration:** 1 week
**Environment:** Local development machine

- [ ] Webhook receiver running on `localhost:3100`
- [ ] Mock Lovable webhooks via curl/Postman
- [ ] Agent execution with test projects
- [ ] Result callback to local endpoint
- [ ] All unit tests passing
- [ ] Integration tests passing

**Exit Criteria:** All test suites green, manual end-to-end flow works.

### Phase 2: Staging (test Lovable project)

**Duration:** 1-2 weeks
**Environment:** Staging server (Railway/DigitalOcean)

- [ ] Deploy to staging URL
- [ ] Configure Lovable test project webhooks
- [ ] Real webhook delivery from Lovable
- [ ] Agent execution on real (test) code
- [ ] Result delivery back to Lovable
- [ ] Monitor error rates for 48h
- [ ] Load test at 2x expected volume

**Exit Criteria:** Zero unhandled errors in 48h, < 1% error rate, all health checks green.

### Phase 3: Production (live Lovable)

**Duration:** Ongoing
**Environment:** Production server

- [ ] Deploy to production URL
- [ ] Configure live Lovable project webhooks
- [ ] Enable monitoring and alerting
- [ ] Set up log rotation (30 day retention)
- [ ] Document runbook for on-call
- [ ] Gradual rollout: 1 project -> 5 projects -> all
- [ ] Performance baseline established

**Exit Criteria:** Stable for 1 week with real traffic, documented runbook.

---

## Architecture Diagram (text)

```
Lovable Platform
    |
    | HTTPS POST (webhook)
    v
[Webhook Receiver] -- validates signature --> [BullMQ Queue]
    |                                              |
    | /health                                      | worker picks job
    v                                              v
[Health Monitor]                           [AIOS Agent Executor]
                                                   |
                                                   | runs @dev, @qa, etc.
                                                   v
                                           [Result Storage (Redis)]
                                                   |
                                                   | callback
                                                   v
                                           [Lovable Callback URL]
```

---

## Open Questions (for @architect)

1. Should the agent executor run in-process or spawn a separate Claude Code instance?
2. What is the expected payload format from Lovable webhooks?
3. Do we need multi-tenant support (multiple Lovable organizations)?
4. Should results include full code diffs or just summaries?
5. Authentication model: API key per project or per organization?

---

## Dependencies

- **Waiting:** @architect design document for integration architecture
- **Available:** Existing AIOS agent system, CLI execution model
- **Required:** Lovable API documentation / webhook specs

---

*Prepared by Gage (@devops) -- deployment strategy v1.0*
