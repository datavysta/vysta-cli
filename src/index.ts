#!/usr/bin/env node

import { Command } from 'commander';
import { generate } from './generate.js';

const program = new Command();

program
  .name('vysta-cli')
  .description('Generate TypeScript models from your Vysta server')
  .argument('<url>', 'URL of your Vysta server')
  .option('-o, --output <dir>', 'Output directory for generated files')
  .action((url, options) => {
    generate(url, options.output);
  });

program.parse();
