#!/usr/bin/env node
'use strict';

const { runAgentMenu } = require('./lib/agent-launcher');

process.exitCode = runAgentMenu();
