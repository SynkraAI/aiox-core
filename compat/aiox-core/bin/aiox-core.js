#!/usr/bin/env node
'use strict';

const path = require('path');

const binByName = {
  aiox: 'aiox.js',
  'aiox-core': 'aiox.js',
  'aiox-minimal': 'aiox-minimal.js',
  'aiox-graph': 'aiox-graph.js',
  'aiox-delegate': 'aiox-delegate.js',
};

const invokedAs = path.basename(process.argv[1] || 'aiox-core');
const targetBin = binByName[invokedAs] || 'aiox.js';

require(`@aiox-squads/core/bin/${targetBin}`);
