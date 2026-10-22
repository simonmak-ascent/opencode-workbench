#!/usr/bin/env node
import { startStdioServer } from './server.js';
startStdioServer().catch(console.error);
