# AIOX Tools - Integrations Directory

This directory contains tool integration definitions for Synkra AIOX agents. Tools are external capabilities that agents can discover and use to accomplish tasks.

## Directory Structure

```
tools/
├── cli/            # Command-line tool integrations
├── local/          # Local system tools
└── mcp/            # Model Context Protocol (MCP) server definitions
```

## CLI Tools

Command-line tools that agents can invoke for specific operations.

### Available CLI Tools

- **github-cli.yaml** - GitHub CLI (`gh`) integration
  - Repository management
  - Pull request operations
  - Issue tracking
  - Branch protection
  - Release management

- **railway-cli.yaml** - Railway CLI integration
  - Deployment management
  - Service configuration
  - Environment variables
  - Logs and monitoring

- **supabase-cli.yaml** - Supabase CLI integration
  - Database migrations
  - Function deployment
  - Project management
  - Local development

## Local Tools

System tools available on the local machine.

### Available Local Tools

- **ffmpeg.yaml** - FFmpeg multimedia framework
  - Video/audio conversion
  - Media processing
  - Codec operations
  - Streaming preparation

## MCP Integrations

Model Context Protocol servers that provide specialized AI capabilities.

### Available MCP Servers

#### UI & Development
- **21st-dev-magic.yaml** - UI component generation
  - React component creation
  - Design pattern implementation
  - Component libraries integration

#### Web & Research
- **browser.yaml** - Browser automation
  - Web scraping
  - UI testing
  - Screenshot capture
  - Navigation automation

- **exa.yaml** - Advanced web research
  - Semantic search
  - Academic paper search
  - Competitor analysis
  - Web crawling

- **context7.yaml** - Documentation search
  - Real-time library documentation
  - Code examples
  - API reference
  - Version-specific docs

#### Project Management
- **clickup.yaml** - ClickUp integration
  - Task management
  - Sprint planning
  - Story tracking
  - Team collaboration

#### Backend Services
- **google-workspace.yaml** - Google Workspace APIs
  - Drive file operations
  - Docs editing
  - Sheets manipulation
  - Calendar management

- **supabase.yaml** - Supabase backend
  - Database operations
  - Authentication
  - Storage management
  - Edge functions

#### Automation
- **n8n.yaml** - Workflow automation
  - Integration workflows
  - Data transformation
  - API orchestration
  - Event-driven automation

## Using Tools in Agents

### Discovery

Agents can discover available tools using the tool resolver:

```javascript
const { resolveTools } = require('../utils/tool-resolver');

// Get all available tools
const tools = await resolveTools();

// Get tools by category
const mcpServers = await resolveTools({ category: 'mcp' });
const cliTools = await resolveTools({ category: 'cli' });
```

### Configuration

Each tool YAML file contains:

```yaml
name: tool-name
category: cli|local|mcp
description: "What this tool does"
capabilities:
  - capability-1
  - capability-2
installation:
  method: npm|binary|built-in
  command: "installation command"
usage:
  examples:
    - description: "Example use case"
      command: "command to execute"
authentication:
  required: true|false
  method: "auth method"
  envVars:
    - ENV_VAR_NAME
```

### Best Practices

1. **Check Tool Availability**: Always verify tool is installed before using
2. **Handle Errors**: Tools may fail - implement graceful error handling
3. **Respect Rate Limits**: Many tools have API rate limits
4. **Secure Credentials**: Never hardcode credentials - use environment variables
5. **Use tool-resolver**: Let the resolver handle tool discovery and validation

## Adding New Tools

### CLI Tool

1. Create YAML file in `cli/`
2. Define tool metadata and capabilities
3. Specify installation method
4. Provide usage examples
5. Update this README

### MCP Server

1. Create YAML file in `mcp/`
2. Define server connection details
3. Document available capabilities
4. Specify authentication requirements
5. Test with `tool-resolver.js`

### Local Tool

1. Create YAML file in `local/`
2. Verify tool is commonly available
3. Document system requirements
4. Provide installation instructions
5. Test on target platforms

## Troubleshooting

### Tool Not Found

```bash
# Verify tool is in tools/ directory
ls -la .aiox-core/tools/cli/
ls -la .aiox-core/tools/local/
ls -la .aiox-core/tools/mcp/

# Test tool resolver
node .aiox-core/infrastructure/scripts/tool-resolver.js
```

### Authentication Issues

- Check environment variables are set
- Verify API keys are valid
- Check token expiration
- Review tool-specific auth docs

### MCP Connection Failures

- Verify MCP server is running
- Check network connectivity
- Review server logs
- Validate configuration YAML

## Related Documentation

- [Tool Resolver Utility](../utils/README.md#tool-resolver)
- [Agent Guide](../../docs/agent-guide.md)
- [MCP Specification](https://modelcontextprotocol.io)
- [Core Configuration](../core-config.yaml)

---

*Last updated: 2025-10-22 - Documentation Sync Initiative*
