# remove-mcp

Remove an MCP server from Docker MCP Toolkit.

## Purpose

Disable and remove an MCP server from the toolkit configuration.

## Usage

```bash
*remove-mcp {server-name}
```

## Parameters

- `server-name` - Name of the MCP server to remove

## Steps

1. Verify server exists: `docker mcp tools ls`
2. Confirm with user before removal
3. Remove server: `docker mcp server remove {server-name}`
4. Verify removal: `docker mcp tools ls`

## Safety

- Always confirm before removing
- Check if server is in use by other configurations
- Document removal in session notes

## Related

- `*list-mcps` - List enabled MCPs
- `*add-mcp` - Add MCP server
