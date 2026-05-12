# CLAUDE.md — Microservices Project

## Project Overview

- **Name:** [PROJECT_NAME]
- **Description:** [System description]
- **Type:** Microservices architecture
- **Deployment:** [Docker / Kubernetes / Cloud Run / ECS]
- **Status:** [Development / Staging / Production]

## Service Architecture

```
services/
  api-gateway/            # Entry point, routing, auth validation
  user-service/           # User management and authentication
  order-service/          # Order processing and management
  payment-service/        # Payment processing
  notification-service/   # Email, SMS, push notifications
  shared/
    proto/                # Protocol Buffer definitions (if gRPC)
    types/                # Shared TypeScript types
    events/               # Event schema definitions
infrastructure/
  docker/                 # Docker Compose files
  k8s/                    # Kubernetes manifests
  terraform/              # Infrastructure as Code
```

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Language | TypeScript / Node.js | All services |
| Framework | Express / Fastify | HTTP handlers |
| Communication | REST + Event-driven | Sync + async |
| Message Broker | RabbitMQ / Kafka | Async events |
| Database | PostgreSQL | Per-service DB |
| Cache | Redis | Session, rate limiting |
| Container | Docker | All services containerized |
| Orchestration | Docker Compose / K8s | Local / Production |
| API Docs | OpenAPI 3.0 | Per-service spec |

## Service Boundaries

### Ownership Rules
- Each service owns its data (database, cache, files)
- No direct database access between services
- All communication via defined APIs or events
- Each service has its own repository or workspace package

### Service Template
Every service follows this structure:
```
service-name/
  src/
    routes/               # HTTP route handlers
    services/             # Business logic
    repositories/         # Data access layer
    events/
      publishers/         # Event publishing
      subscribers/        # Event consumption
    middleware/            # Auth, validation, logging
    types/                # Service-specific types
  tests/
    unit/                 # Unit tests
    integration/          # Integration tests (with DB)
  Dockerfile              # Container definition
  openapi.yaml            # API specification
  package.json
  tsconfig.json
```

## API Contracts

### REST Conventions
- Base URL: `/{service-name}/api/v{version}/`
- Use plural nouns: `/users`, `/orders`, `/payments`
- HTTP methods: GET (read), POST (create), PUT (full update), PATCH (partial), DELETE
- Response envelope: `{ "data": ..., "error": null, "meta": { "page": 1, "total": 100 } }`
- Error format: `{ "error": { "code": "USER_NOT_FOUND", "message": "...", "details": [] } }`

### API Versioning
- URL-based versioning: `/api/v1/`, `/api/v2/`
- Support N-1 versions (current + previous)
- Deprecation headers: `Sunset: <date>`, `Deprecation: true`

### OpenAPI Specification
- Every service must have an `openapi.yaml` at the root
- Auto-generate TypeScript types from OpenAPI spec
- Validate requests against schema in middleware

## Inter-Service Communication

### Synchronous (HTTP/gRPC)
- Used for: Real-time queries, user-facing requests
- Circuit breaker: Required on all external calls (3 failures = open)
- Timeout: 5 seconds default, 30 seconds for long operations
- Retry: 3 attempts with exponential backoff (100ms, 200ms, 400ms)

### Asynchronous (Events)
- Used for: State changes, notifications, data sync
- Event naming: `{service}.{entity}.{action}` (e.g., `order.payment.completed`)
- Event schema: JSON Schema with version field
- Idempotency: All event handlers must be idempotent
- Dead letter queue: Required for all consumers

### Event Schema
```typescript
interface DomainEvent<T> {
  id: string;              // UUID v4
  type: string;            // order.payment.completed
  source: string;          // payment-service
  version: string;         // 1.0.0
  timestamp: string;       // ISO 8601
  correlationId: string;   // Request trace ID
  data: T;                 // Event-specific payload
}
```

## Deployment Patterns

### Local Development
```bash
docker-compose up -d       # Start all services
docker-compose up api      # Start specific service
docker-compose logs -f     # Follow logs
docker-compose down        # Stop all
```

### Environment Configuration
- `.env.local` per service for local development
- Environment variables injected at runtime (never baked into images)
- Required vars defined in each service's `.env.example`

### Health Checks
Every service exposes:
- `GET /health` — Basic liveness (returns 200)
- `GET /health/ready` — Readiness (checks DB, cache, dependencies)
- `GET /health/detailed` — Full status with dependency health

## Testing Strategy

```bash
# Per-service commands
npm test                    # Unit tests
npm run test:integration    # Integration (requires Docker)
npm run test:contract       # Consumer-driven contract tests
npm run test:e2e            # End-to-end (full system)
```

### Testing Levels
| Level | Scope | Dependencies |
|-------|-------|-------------|
| Unit | Single function/class | All mocked |
| Integration | Service + DB | Real DB, mocked services |
| Contract | Service API shape | Pact or similar |
| E2E | Full request flow | All services running |

## Common Commands

```bash
# Development
docker-compose up -d                    # Start infrastructure
npm run dev --workspace=user-service    # Dev mode for one service

# Testing
npm test --workspaces                   # Test all services
npm run test:integration --workspace=order-service

# Building
docker build -t user-service:latest ./services/user-service

# Database
npm run migrate --workspace=user-service     # Run migrations
npm run seed --workspace=user-service        # Seed data
```

## Important Notes

- Never share databases between services — each service owns its data
- Use correlation IDs for distributed tracing across services
- Log in structured JSON format for aggregation (ELK/Datadog)
- Keep services small and focused — if a service grows too large, split it
- Use feature flags for gradual rollouts across services
- Always test backward compatibility when changing event schemas
