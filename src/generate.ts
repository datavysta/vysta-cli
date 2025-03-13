import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import path from 'path';
import { Project } from 'ts-morph';
import inquirer from 'inquirer';
import { downloadFile } from './download.js';

const ENDPOINTS = {
  services: '/api/rest/typescript/services.ts',
  types: '/api/rest/typescript/types.ts',
  workflows: '/api/rest/typescript/workflows.ts',
  files: '/api/rest/typescript/files.ts'
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

export function mergeServiceClass(existingFilePath: string, newServiceCode: string): string {
  // Create directory if it doesn't exist
  const dir = path.dirname(existingFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // If file doesn't exist, return new code
  if (!fs.existsSync(existingFilePath)) {
    return newServiceCode;
  }

  const project = new Project();
  const existingFile = project.addSourceFileAtPath(existingFilePath);
  const newFile = project.createSourceFile("temp.ts", newServiceCode);
  
  const existingClass = existingFile.getClasses()[0];
  const newClass = newFile.getClasses()[0];

  if (!existingClass || !newClass) return newServiceCode;

  // Update imports first
  const existingImports = existingFile.getImportDeclarations();
  const newImports = newFile.getImportDeclarations();

  // Remove all existing imports
  existingImports.forEach(imp => imp.remove());

  // Add all imports from new file
  newImports.forEach(imp => {
    existingFile.addImportDeclaration(imp.getStructure());
  });

  // Get all method structures before any modifications
  const existingMethods = existingClass.getMethods().map(method => method.getStructure());
  const generatedMethodNames = new Set(newClass.getMethods().map(m => m.getName()));

  // Update class structure from new code
  const extendsNode = newClass.getExtends();
  if (extendsNode) {
    existingClass.setExtends(extendsNode.getText());
  }

  // Only update constructor if it significantly differs
  const existingConstructor = existingClass.getConstructors()[0];
  const newConstructor = newClass.getConstructors()[0];
  
  if (existingConstructor && newConstructor) {
    const existingBody = existingConstructor.getBodyText() || '';
    const newBody = newConstructor.getBodyText() || '';
    
    if (existingBody.replace(/\s+/g, '') !== newBody.replace(/\s+/g, '')) {
      existingConstructor.setBodyText(newBody);
    }
  }

  // Clear and add all methods
  existingClass.getMethods().forEach(method => method.remove());

  // Add generated methods first
  newClass.getMethods().forEach(method => {
    const structure = method.getStructure();
    if ('name' in structure) {
      existingClass.addMethod({
        ...structure,
        name: structure.name as string,
        returnType: structure.returnType as string || undefined,
        parameters: structure.parameters || []
      });
    }
  });

  // Add back custom methods
  existingMethods
    .filter(method => 'name' in method && !generatedMethodNames.has(method.name as string))
    .forEach(method => {
      if ('name' in method) {
        existingClass.addMethod({
          ...method,
          name: method.name as string,
          returnType: method.returnType as string || undefined,
          parameters: method.parameters || []
        });
      }
    });

  return existingFile.getFullText();
}

export async function generate(baseUrl: string, outputDir?: string) {
  const finalOutputDir = outputDir || (await inquirer.prompt([
    {
      type: 'input',
      name: 'outputDir',
      message: 'Where should we save the models?',
      default: './src/models'
    }
  ])).outputDir;

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
      fsPromises.writeFile(
        path.join(absolutePath, 'services.ts'), 
        mergeServiceClass(path.join(absolutePath, 'services.ts'), servicesContent)
      ),
      fsPromises.writeFile(path.join(absolutePath, 'types.ts'), typesContent),
      fsPromises.writeFile(path.join(absolutePath, 'workflows.ts'), workflowsContent),
      fsPromises.writeFile(path.join(absolutePath, 'files.ts'), filesContent)
    ]);
    
    console.log('\nSaved files:');
    files.sort().forEach(file => console.log(`  ${file}`));
    console.log(`\nSaved ${files.length} file(s)`);
  } catch (error) {
    console.error('Failed to download or save models:', error);
    process.exit(1);
  }
}