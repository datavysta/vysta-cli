import inquirer from 'inquirer';
import path from 'path';
import * as fsPromises from 'fs/promises';
import { downloadFile } from './download.js';

const ENDPOINTS = {
  services: '/api/rest/typescript/services.ts',
  types: '/api/rest/typescript/types.ts'
};

function normalizeUrl(baseUrl: string): string {
    // If protocol is specified, use it
    if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
      return baseUrl.replace(/\/$/, ''); // Just remove trailing slash
    }
    
    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '');
    // Default to https if no protocol specified
    return `https://${baseUrl}`;
  }

export async function generate(baseUrl: string) {
  const { outputDir } = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputDir',
      message: 'Where should we save the models?',
      default: './src/models'
    }
  ]);

  const absolutePath = path.resolve(process.cwd(), outputDir);
  await fsPromises.mkdir(absolutePath, { recursive: true });
  console.log(`Files will be saved to ${absolutePath}...`);

  try {
    const normalizedBaseUrl = normalizeUrl(baseUrl);
    
    // Download both files
    const servicesContent = await downloadFile(`${normalizedBaseUrl}${ENDPOINTS.services}`);
    const typesContent = await downloadFile(`${normalizedBaseUrl}${ENDPOINTS.types}`);
    
    // Save the files
    const files = ['services.ts', 'types.ts'];
    await Promise.all([
      fsPromises.writeFile(path.join(absolutePath, 'services.ts'), servicesContent),
      fsPromises.writeFile(path.join(absolutePath, 'types.ts'), typesContent)
    ]);
    
    console.log('\nSaved files:');
    files.sort().forEach(file => console.log(`  ${file}`));
    console.log(`\nSaved ${files.length} file(s)`);
  } catch (error) {
    console.error('Failed to download or save models:', error);
    process.exit(1);
  }
}