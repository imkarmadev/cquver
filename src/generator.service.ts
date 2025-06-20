import { join } from 'https://deno.land/std@0.208.0/path/mod.ts';
import {
  eventHandlerTemplate,
  eventIndexTemplate,
  eventTemplate,
} from './templates/event.templates.ts';
import {
  commandHandlerTemplate,
  commandIndexTemplate,
  commandTemplate,
} from './templates/command.templates.ts';
import {
  queryHandlerTemplate,
  queryIndexTemplate,
  queryTemplate,
} from './templates/query.templates.ts';
import {
  ensureDir,
  ensureSuffix,
  generateHandlerName,
  toKebabCase,
  toPascalCase,
} from './utils.ts';
import { ModuleManagerService } from './module-manager.service.ts';

export class GeneratorService {
  private moduleManager = new ModuleManagerService();

  async initializeService(appName: string): Promise<void> {
    // Check if the app exists in the apps directory
    const appPath = join('apps', appName);

    try {
      const appStat = await Deno.stat(appPath);
      if (!appStat.isDirectory) {
        throw new Error(`App "${appName}" exists but is not a directory`);
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.log(`❌ App "${appName}" not found.`);
        console.log(`💡 Please create the NestJS app first using:`);
        console.log(`   nest generate app ${appName}`);
        throw new Error(`App "${appName}" does not exist`);
      }
      throw error;
    }

    // Create the DDD/Clean Architecture folder structure
    const basePath = join('apps', appName, 'src');

    // Create application layer structure (CQRS)
    const applicationPath = join(basePath, 'application');
    const commandsPath = join(applicationPath, 'commands');
    const eventsPath = join(applicationPath, 'events');
    const queriesPath = join(applicationPath, 'queries');

    // Create domain layer structure
    const domainPath = join(basePath, 'domain');
    const constantsPath = join(domainPath, 'constants');
    const entitiesPath = join(domainPath, 'entities');

    // Create infrastructure layer structure
    const infrastructurePath = join(basePath, 'infrastructure');
    const adaptersPath = join(infrastructurePath, 'adapters');
    const persistencePath = join(infrastructurePath, 'persistence');

    // Create other required directories
    const controllersPath = join(basePath, 'controllers');
    const dtoPath = join(basePath, 'dto');
    const requestsPath = join(dtoPath, 'requests');
    const responsesPath = join(dtoPath, 'responses');
    const portsPath = join(basePath, 'ports');

    // Create all directories
    await Promise.all([
      // Application layer
      ensureDir(commandsPath),
      ensureDir(eventsPath),
      ensureDir(queriesPath),
      // Domain layer
      ensureDir(constantsPath),
      ensureDir(entitiesPath),
      // Infrastructure layer
      ensureDir(adaptersPath),
      ensureDir(persistencePath),
      // Other layers
      ensureDir(controllersPath),
      ensureDir(requestsPath),
      ensureDir(responsesPath),
      ensureDir(portsPath),
    ]);

    console.log(`📁 Created directory: ${applicationPath}`);
    console.log(`📁 Created directory: ${commandsPath}`);
    console.log(`📁 Created directory: ${eventsPath}`);
    console.log(`📁 Created directory: ${queriesPath}`);
    console.log(`📁 Created directory: ${domainPath}`);
    console.log(`📁 Created directory: ${constantsPath}`);
    console.log(`📁 Created directory: ${entitiesPath}`);
    console.log(`📁 Created directory: ${infrastructurePath}`);
    console.log(`📁 Created directory: ${adaptersPath}`);
    console.log(`📁 Created directory: ${persistencePath}`);
    console.log(`📁 Created directory: ${controllersPath}`);
    console.log(`📁 Created directory: ${dtoPath}`);
    console.log(`📁 Created directory: ${requestsPath}`);
    console.log(`📁 Created directory: ${responsesPath}`);
    console.log(`📁 Created directory: ${portsPath}`);
  }

  async generate(
    appName: string,
    type: 'event' | 'command' | 'query',
    name: string,
  ): Promise<void> {
    // Normalize the class name with proper suffix
    const className = ensureSuffix(toPascalCase(name), this.getSuffix(type));
    const handlerName = generateHandlerName(className);

    // Generate file names (use original name without type suffix for files)
    const baseFileName = toKebabCase(name);
    const folderName = toKebabCase(name);

    // Create directory path (use plural folder names)
    const typeFolder = this.getTypeFolderName(type);
    const basePath = join('apps', appName, 'src', 'application', typeFolder, folderName);
    await ensureDir(basePath);

    // Generate file paths
    const mainFilePath = join(basePath, `${baseFileName}.${type}.ts`);
    const handlerFilePath = join(basePath, `${baseFileName}.handler.ts`);
    const indexFilePath = join(basePath, 'index.ts');

    // Generate content based on type
    const { mainContent, handlerContent, indexContent } = this.getTemplates(
      type,
      className,
      handlerName,
      baseFileName,
    );

    // Write files
    await Promise.all([
      Deno.writeTextFile(mainFilePath, mainContent),
      Deno.writeTextFile(handlerFilePath, handlerContent),
      Deno.writeTextFile(indexFilePath, indexContent),
    ]);

    console.log(`📁 Created directory: ${basePath}`);
    console.log(`📄 Created file: ${mainFilePath}`);
    console.log(`📄 Created file: ${handlerFilePath}`);
    console.log(`📄 Created file: ${indexFilePath}`);

    // Update type index and module files
    await this.moduleManager.updateTypeIndex(appName, typeFolder, type, {
      name: handlerName,
      path: `./${folderName}`,
    });

    await this.moduleManager.updateServiceModule(appName);
  }

  private getSuffix(type: 'event' | 'command' | 'query'): string {
    switch (type) {
      case 'event':
        return 'Event';
      case 'command':
        return 'Command';
      case 'query':
        return 'Query';
    }
  }

  private getTemplates(
    type: 'event' | 'command' | 'query',
    className: string,
    handlerName: string,
    fileName: string,
  ): { mainContent: string; handlerContent: string; indexContent: string } {
    switch (type) {
      case 'event':
        return {
          mainContent: eventTemplate(className),
          handlerContent: eventHandlerTemplate(className, handlerName, fileName),
          indexContent: eventIndexTemplate(className, handlerName, fileName),
        };
      case 'command':
        return {
          mainContent: commandTemplate(className),
          handlerContent: commandHandlerTemplate(className, handlerName, fileName),
          indexContent: commandIndexTemplate(className, handlerName, fileName),
        };
      case 'query':
        return {
          mainContent: queryTemplate(className),
          handlerContent: queryHandlerTemplate(className, handlerName, fileName),
          indexContent: queryIndexTemplate(className, handlerName, fileName),
        };
    }
  }

  private getTypeFolderName(type: 'event' | 'command' | 'query'): string {
    switch (type) {
      case 'event':
        return 'events';
      case 'command':
        return 'commands';
      case 'query':
        return 'queries';
    }
  }
}
