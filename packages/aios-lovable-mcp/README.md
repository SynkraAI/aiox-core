# aios-lovable-mcp

🚀 **Synkra AIOS MCP Server for Lovable Integration**

Exposes AIOS agents as MCP tools that Lovable's AI agent can invoke. Supports both stdio (local) and REST API (production) transports.

## 📊 Available Tools

### Phase 1 ✅ (Core)
| Tool | Agent | Description |
|------|-------|-------------|
| `aios_design_architecture` | @architect | System architecture from product spec |
| `aios_generate_code` | @dev | Production-ready code generation |

### Phase 2 ✅ (Expansion)
| Tool | Agent | Description |
|------|-------|-------------|
| `aios_strategize` | @pm + @analyst | Product strategy & PRD generation |
| `aios_design_ux` | @ux-design-expert | Design system & wireframes |
| `aios_full_pipeline` | All agents | End-to-end orchestration (async) |
| `aios_get_status` | Queue | Job status & progress tracking |
| `aios_get_artifact` | Storage | Retrieve generated artifacts |

### Phase 3 ✅ (Production)
- ✅ REST API with Express
- ✅ Webhook/SSE real-time updates
- ✅ API key management & rate limiting
- ✅ Docker + Railway deployment
- ✅ Production monitoring & observability

## 🚀 Quick Start

### Local Development

```bash
# Navigate to package
cd packages/aios-lovable-mcp

# Install dependencies
npm install

# Start development server (stdio + HTTP API)
npm run dev

# In another terminal, test the API
curl http://localhost:3000/health
```

### Docker Development

```bash
# Start Redis + MCP Server with docker-compose
npm run docker:run

# View logs
npm run docker:logs

# Stop services
npm run docker:stop
```

### Production Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for:
- Railway deployment guide
- Environment configuration
- API key setup
- Monitoring & scaling

## 📚 Commands

```bash
# Development
npm run dev              # Start with hot reload
npm run build            # Build TypeScript
npm run typecheck        # Type checking only

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode

# Code Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript check

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Start with docker-compose
npm run docker:stop      # Stop docker-compose
npm run docker:logs      # View logs
```

## 🧪 Testing

### MCP Inspector (Interactive)

```bash
# Start the server
npx @modelcontextprotocol/inspector npx tsx src/server.ts
```

Opens web UI at `http://localhost:3000` where you can:
- View all available tools
- Call tools with parameters
- See responses in real-time

### Manual API Testing

```bash
# Check health
curl http://localhost:3000/health

# Create a job
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer aios_dev_12345678" \
  -H "Content-Type: application/json" \
  -d '{"tool":"aios_strategize","input":{"product_name":"TestApp"}}'

# Check job status
curl -H "Authorization: Bearer aios_dev_12345678" \
  http://localhost:3000/api/jobs/JOB_ID
```

See [API.md](./docs/API.md) for complete REST API documentation.

## 🔗 Integrating with Lovable

### Local Testing (Stdio)

```bash
# In Lovable Settings > MCP Servers:
# Type: Stdio
# Command: npx tsx /path/to/src/server.ts
```

### Production (REST API)

```bash
# In Lovable Settings > MCP Servers:
# Type: REST API
# Base URL: https://your-railway-url
# API Key: Your generated API key
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md#integrating-with-lovable) for detailed setup.

## 🏗️ Architecture

```
src/
  server.ts              # MCP + HTTP server entry point

  tools/                 # MCP tool schemas (7 tools)
    aios-design-architecture.ts
    aios-generate-code.ts
    aios-strategize.ts
    aios-design-ux.ts
    aios-full-pipeline.ts
    aios-get-status.ts
    aios-get-artifact.ts
    index.ts

  adapters/              # Agent orchestration layer
    orchestrator.ts      # Routes tool calls to adapters
    architect-adapter.ts # @architect
    dev-adapter.ts       # @dev
    pm-adapter.ts        # @pm (Phase 2)
    ux-adapter.ts        # @ux-design-expert (Phase 2)

  services/              # Phase 3+ infrastructure
    queue.ts             # BullMQ job queue
    http-server.ts       # Express REST API
    webhook.ts           # Webhook delivery service
    api-keys.ts          # API key & rate limiting

  types/
    lovable.ts           # All TypeScript types

docs/
  DEPLOYMENT.md          # Railway + production setup
  API.md                 # REST API reference
```

## 📈 Roadmap

| Phase | Status | Features |
|-------|--------|----------|
| **Phase 1** | ✅ Complete | 2 MCP tools, stdio transport, synchronous |
| **Phase 2** | ✅ Complete | 7 MCP tools, BullMQ queue, async jobs, adapters |
| **Phase 3** | ✅ Complete | Express REST API, webhooks, SSE, rate limiting, Docker |
| **Phase 4** | 🔄 Planned | Bidirectional sync, template library, multi-platform |

## 📖 Documentation

- [API Reference](./docs/API.md) - Complete REST API endpoints
- [Deployment Guide](./docs/DEPLOYMENT.md) - Railway deployment & setup
- [Phase 2 Architecture](./docs/ARCHITECTURE.md) - Async pipeline design
- [Monitoring & Scaling](./docs/DEPLOYMENT.md#-monitoring--logs) - Observability

## 🤝 Contributing

This is part of **Synkra AIOS** - the AI-orchestrated system for full-stack development.

To contribute:
1. Follow AIOS conventions in `.aios-core/`
2. Add tests for new features
3. Update documentation
4. Create a PR to main

## 📞 Support

- **Issues:** Check [GitHub Issues](https://github.com/SynkraAI/aios-core/issues)
- **Docs:** See [docs/](./docs/) directory
- **Logs:** `railway logs -f` (production)
- **Health:** `curl https://your-url/health`
