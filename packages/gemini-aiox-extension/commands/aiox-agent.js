#!/usr/bin/env node
'use strict';

const { runAgentLauncher } = require('./lib/agent-launcher');

const agentId = process.argv[2];
process.exitCode = runAgentLauncher(agentId);
