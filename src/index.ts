#!/usr/bin/env node

import { Command } from 'commander';
import { generate } from './generate.js';

const program = new Command();

program
  .name('vysta-cli')
  .description('Generate TypeScript models from your Vysta server')
  .version('1.0.0');

program
  .command('generate')
  .argument('<server>', 'Vysta server URL')
  .description('Generate TypeScript models from a Vysta server')
  .action(generate);

program.parse(); 