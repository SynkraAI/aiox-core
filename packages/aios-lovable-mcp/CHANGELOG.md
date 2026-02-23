# Changelog - AIOS Lovable MCP

All notable changes to this project will be documented in this file.

## [0.2.0] - Phase 3 Production Ready - 2026-02-22

### Added (Phase 3 - Production Hardening)

#### Infrastructure
- ✅ **Express REST API Server** (`src/services/http-server.ts`)
  - `POST /api/jobs` - Create async jobs
  - `GET /api/jobs/:jobId` - Check job status
  - `GET /api/jobs/:jobId/stream` - Real-time SSE updates
  - `POST /api/webhooks/test` - Webhook testing
  - Admin endpoints for key management

- ✅ **Webhook Service** (`src/services/webhook.ts`)
  - Async webhook delivery with retry logic
  - Exponential backoff (3 retries)
  - Signature generation for security
  - Real-time status broadcasting

- ✅ **API Key & Rate Limiting** (`src/services/api-keys.ts`)
  - API key generation and validation
  - Per-minute rate limiting (60 req/min default)
  - Per-day quota limits (10,000 req/day default)
  - Key management endpoints (admin)

#### Deployment & Docker
- ✅ `Dockerfile` - Production-ready multi-stage build
- ✅ `docker-compose.yml` - Local development with Redis
- ✅ `railway.json` - Railway platform configuration
- ✅ `.env.example` - Environment variable template

#### Documentation
- ✅ `docs/DEPLOYMENT.md` - Complete Railway deployment guide
- ✅ `docs/API.md` - REST API reference with examples
- ✅ Updated `README.md` - Full Phase 1-3 overview

#### Type System
- ✅ Added types: `StrategizeOutput`, `DesignUXOutput`, `JobData`, `JobResult`
- ✅ Complete TypeScript strict mode coverage

#### Package Updates
- Added: `bullmq@^5.8.0`, `express@^4.18.2`, `redis@^4.6.0`, `nanoid@^4.0.2`, `@types/express`

### Modified

- `src/adapters/orchestrator.ts` - Added `strategize()` and `designUX()` methods
- `src/server.ts` - Registered 5 new Phase 2 tools
- `package.json` - Added Docker scripts and Phase 3 dependencies
- `README.md` - Complete documentation overhaul

### Fixed
- TypeScript type errors in queue service
- Redis client initialization for BullMQ
- Job progress tracking with proper type safety

---

## [0.1.0] - Phase 2 Async Infrastructure - 2026-02-22

### Added (Phase 2 - Expansion)

#### New MCP Tools (5)
- ✅ `aios_strategize` - Product strategy & PRD generation
- ✅ `aios_design_ux` - Design system & wireframes
- ✅ `aios_full_pipeline` - End-to-end async orchestration
- ✅ `aios_get_status` - Job status polling
- ✅ `aios_get_artifact` - Artifact retrieval

#### Agent Adapters (2)
- ✅ `pm-adapter.ts` - @pm (Product Manager) orchestration
- ✅ `ux-adapter.ts` - @ux-design-expert orchestration

#### Queue Infrastructure
- ✅ `services/queue.ts` - BullMQ job queue
  - Job creation and tracking
  - Status polling with progress
  - Result retrieval with timeout handling
  - Automatic retry logic (3 attempts)
  - Job persistence in Redis

#### Type Extensions
- ✅ `Strategy`, `PRD` types for strategize output
- ✅ `DesignSystem`, `Wireframe` types for design output
- ✅ `JobData`, `JobResult`, `AgentTask` types for queue

### Modified
- `src/adapters/orchestrator.ts` - Integrated new adapters
- `src/server.ts` - Registered new tools
- `src/types/lovable.ts` - Added Phase 2 types

---

## [0.0.1] - Phase 1 MVP - Initial Release

### Added (Phase 1 - MVP)

#### MCP Tools (2)
- ✅ `aios_design_architecture` - @architect system architecture
- ✅ `aios_generate_code` - @dev production code generation

#### Adapters
- ✅ `architect-adapter.ts` - @architect agent integration
- ✅ `dev-adapter.ts` - @dev agent integration
- ✅ `orchestrator.ts` - Tool routing layer

#### Transport
- ✅ MCP Server with stdio transport
- ✅ JSON-RPC protocol implementation

#### Testing
- ✅ 16 unit tests (Vitest)
- ✅ Tool schema validation
- ✅ Adapter integration tests

#### Documentation
- ✅ README with setup instructions
- ✅ MCP Inspector testing guide

---

## Development Notes

### Phase 1 → Phase 2
- Added async job processing with BullMQ
- Expanded tool set from 2 to 7 tools
- Integrated 4 agents (@pm, @ux-design-expert, @architect, @dev)
- Added type safety for new tool outputs

### Phase 2 → Phase 3
- Added REST API layer for job management
- Implemented real-time updates (SSE, webhooks)
- Added API key management & rate limiting
- Created production deployment configuration
- Added comprehensive documentation

### Technology Stack
- **Language**: TypeScript 5.3
- **Transport**: MCP SDK + Express
- **Queue**: BullMQ + Redis
- **Container**: Docker + docker-compose
- **Deployment**: Railway
- **Testing**: Vitest

---

## Known Limitations (Phase 3)

- Webhooks: Max 3 retries, 10s timeout
- Rate limits: Hard-coded per key (configurable)
- Job storage: Redis only (1 hour retention)
- Artifacts: In-memory only (Phase 4: Cloud storage)

## Future Improvements

- **Phase 4**: Bidirectional sync with Lovable
- **Phase 4**: Template library & artifact storage
- **Phase 4**: Multi-platform support
- **Later**: Circuit breaker pattern
- **Later**: Advanced monitoring & alerting
- **Later**: Auto-scaling policies

---

## Version History

- `v0.2.0` - Phase 3 (Production Ready) - 2026-02-22 ✅
- `v0.1.0` - Phase 2 (Async Infrastructure) - 2026-02-22 ✅
- `v0.0.1` - Phase 1 (MVP) - Initial Release ✅
