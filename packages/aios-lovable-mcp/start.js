#!/usr/bin/env node
import express from 'express';
import { HttpServer } from './dist/services/http-server.js';

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server instance
const httpServer = new HttpServer(port);

// Start the app
try {
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`📡 API: http://localhost:${port}/api/jobs`);
  });
  
  // Keep process alive
  process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    process.exit(0);
  });
} catch (err) {
  console.error('Failed to start:', err);
  process.exit(1);
}
