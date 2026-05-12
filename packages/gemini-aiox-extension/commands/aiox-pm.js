#!/usr/bin/env node
'use strict';

const { runAgentLauncher } = require('./lib/agent-launcher');

process.exitCode = runAgentLauncher('pm');
