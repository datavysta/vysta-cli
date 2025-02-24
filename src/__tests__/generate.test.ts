import { Project } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { mergeServiceClass, generate } from '../generate';
import * as fsPromises from 'fs/promises';
import { downloadFile } from '../download';
import { jest, expect } from '@jest/globals';

// Simple mock setup
const mockDownloadFile = jest.fn<(url: string) => Promise<string>>();
jest.mock('../download', () => ({
  downloadFile: mockDownloadFile
}), { virtual: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Service Merging', () => {
  const testDir = path.join(__dirname, '../../test-output');
  
  beforeEach(() => {
    mockDownloadFile.mockReset();
  });

  beforeAll(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true });
  });

  it('should preserve custom methods when regenerating service', async () => {
    const initialService = `
      import { VystaService } from '@datavysta/vysta-client';
      import { CustomerDemographics } from './types';
      
      export class CustomerDemographicsService extends VystaService<CustomerDemographics> {
        constructor(client: VystaClient) {
          super(client, 'Northwinds', {
            primaryKey: 'customerTypeId'
          });
        }
        
        async getCustomerDemographicsByCustomerTypeId(customerTypeId: string) {
          return this.client.get<CustomerDemographics[]>(\`CustomerDemographics/\${customerTypeId}\`);
        }
      }
    `;

    const servicesPath = path.join(testDir, 'services.ts');
    await fsPromises.writeFile(servicesPath, initialService);

    mockDownloadFile.mockImplementation(async (url) => {
      if (url.includes('services.ts')) {
        return `
          import { VystaService } from '@datavysta/vysta-client';
          import { CustomerDemographics } from './types';
          
          export class CustomerDemographicsService extends VystaService<CustomerDemographics> {
            constructor(client: VystaClient) {
              super(client, 'Northwinds', {
                primaryKey: 'customerTypeId'
              });
            }
          }
        `;
      }
      return '';
    });

    await generate('http://localhost:8080', testDir);
    const result = await fsPromises.readFile(servicesPath, 'utf8');
    
    expect(result).toContain('async getCustomerDemographicsByCustomerTypeId');
    expect(result).toContain('return this.client.get<CustomerDemographics[]>');
  });

  it('should update base configuration while preserving custom methods', async () => {
    const initialService = `
      import { VystaService } from '@datavysta/vysta-client';
      import { CustomerDemographics } from './types';
      
      export class CustomerDemographicsService extends VystaService<CustomerDemographics> {
        constructor(client: VystaClient) {
          super(client, 'Northwinds123', {
            primaryKey: 'customerTypeId'
          });
        }
        
        async getCustomerDemographicsByCustomerTypeId(customerTypeId: string) {
          return this.client.get<CustomerDemographics[]>(\`CustomerDemographics/\${customerTypeId}\`);
        }
      }
    `;

    const servicesPath = path.join(testDir, 'services.ts');
    await fsPromises.writeFile(servicesPath, initialService);

    mockDownloadFile.mockImplementation(async (url) => {
      if (url.includes('services.ts')) {
        return `
          import { VystaService } from '@datavysta/vysta-client';
          import { CustomerDemographics } from './types';
          
          export class CustomerDemographicsService extends VystaService<CustomerDemographics> {
            constructor(client: VystaClient) {
              super(client, 'Northwinds', {
                primaryKey: 'customerTypeId'
              });
            }
          }
        `;
      }
      return '';
    });

    await generate('http://localhost:8080', testDir);
    const result = await fsPromises.readFile(servicesPath, 'utf8');
    
    // Verify base config is updated
    expect(result).toContain("super(client, 'Northwinds'");
    expect(result).not.toContain("super(client, 'Northwinds123'");
    
    // Verify custom method is still preserved
    expect(result).toContain('async getCustomerDemographicsByCustomerTypeId');
    expect(result).toContain('return this.client.get<CustomerDemographics[]>');
  });

  it('should generate workflows file', async () => {
    const workflowsContent = `
      import { VystaClient, VystaWorkflowService } from '@datavysta/vysta-client';
      
      export interface InputTestInput {
        oneString: string;
      }

      export class WorkflowService extends VystaWorkflowService {
        constructor(client: VystaClient) {
          super(client);
        }

        async inputTest(input: InputTestInput): Promise<void> {
          return this.executeWorkflow<InputTestInput, void>('InputTest', input);
        }

        async plainWait(): Promise<void> {
          return this.executeWorkflow('PlainWait');
        }
      }
    `;

    mockDownloadFile.mockImplementation(async (url) => {
      if (url.includes('workflows.ts')) {
        return workflowsContent;
      }
      if (url.includes('services.ts')) {
        return `
          import { VystaService } from '@datavysta/vysta-client';
          import { CustomerDemographics } from './types';
          
          export class CustomerDemographicsService extends VystaService<CustomerDemographics> {
            constructor(client: VystaClient) {
              super(client, 'Northwinds', {
                primaryKey: 'customerTypeId'
              });
            }
          }
        `;
      }
      return '';  // For types.ts
    });

    await generate('http://localhost:8080', testDir);
    
    // Verify workflows file was created with correct content
    const workflowsPath = path.join(testDir, 'workflows.ts');
    const result = await fsPromises.readFile(workflowsPath, 'utf8');
    expect(result).toContain('class WorkflowService extends VystaWorkflowService');
    expect(result).toContain('interface InputTestInput');
    expect(result).toContain('async inputTest(input: InputTestInput)');
    expect(result).toContain('async plainWait()');
  });
}); 