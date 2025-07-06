#!/usr/bin/env node

import { Command } from 'commander';
import { generate } from './generate.js';

const program = new Command();

// Function to collect and parse tag values
function collectTags(value: string, previous: Record<string, string> = {}): Record<string, string> {
  const [tagName, tagValue] = value.split('=');
  
  if (!tagName || !tagValue) {
    console.error(`Invalid tag format: ${value}. Expected format: TagName=Value`);
    process.exit(1);
  }
  
  previous[tagName.trim()] = tagValue.trim();
  return previous;
}

program
  .name('vysta-cli')
  .description('Generate TypeScript models from your Vysta server')
  .argument('<url>', 'URL of your Vysta server')
  .option('-o, --output <dir>', 'Output directory for generated files')
  .option('-t, --tag <TagName=Value>', 'Filter by tag (can be specified multiple times)', collectTags)
  .action((url, options) => {
    generate(url, options.output, options.tag);
  });

program.parse();
