import { describe, it, expect } from 'vitest';
import { createServer } from '../src/server.js';

describe('MCP Server', () => {
  it('creates a server instance', () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});
