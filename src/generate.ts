import * as fsPromises from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import { downloadFile } from './download.js';

const ENDPOINTS = {
  services: '/api/rest/typescript/services.ts',
  types: '/api/rest/typescript/types.ts',
  workflows: '/api/rest/typescript/workflows.ts',
  files: '/api/rest/typescript/files.ts',
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

export async function generate(baseUrl: string, outputDir?: string) {
  const finalOutputDir =
    outputDir ||
    (
      await inquirer.prompt([
        {
          type: 'input',
          name: 'outputDir',
          message: 'Where should we save the models?',
          default: './src/models',
        },
      ])
    ).outputDir;

  const absolutePath = path.resolve(process.cwd(), finalOutputDir);
  console.log('Creating directory at:', absolutePath);
  await fsPromises.mkdir(absolutePath, { recursive: true });

  try {
    const normalizedBaseUrl = normalizeUrl(baseUrl);
    console.log('Downloading from:', normalizedBaseUrl);

    // Download all files
    const servicesContent = await downloadFile(`${normalizedBaseUrl}${ENDPOINTS.services}`);
    const typesContent = await downloadFile(`${normalizedBaseUrl}${ENDPOINTS.types}`);
    const workflowsContent = await downloadFile(`${normalizedBaseUrl}${ENDPOINTS.workflows}`);
    const filesContent = await downloadFile(`${normalizedBaseUrl}${ENDPOINTS.files}`);

    // Save the files
    const files = ['services.ts', 'types.ts', 'workflows.ts', 'files.ts'];
    await Promise.all([
      fsPromises.writeFile(path.join(absolutePath, 'services.ts'), servicesContent),
      fsPromises.writeFile(path.join(absolutePath, 'types.ts'), typesContent),
      fsPromises.writeFile(path.join(absolutePath, 'workflows.ts'), workflowsContent),
      fsPromises.writeFile(path.join(absolutePath, 'files.ts'), filesContent),
    ]);

    console.log('\nSaved files:');
    files.sort().forEach((file) => console.log(`  ${file}`));
    console.log(`\nSaved ${files.length} file(s)`);
  } catch (error) {
    console.error('Failed to download or save models:', error);
    process.exit(1);
  }
}
