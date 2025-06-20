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
import { serviceIndexTemplate, serviceTemplate } from './templates/service.templates.ts';
import { usecaseIndexTemplate, usecaseTemplate } from './templates/usecase.templates.ts';
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
    const usecasesPath = join(applicationPath, 'usecases');

    // Create domain layer structure
    const domainPath = join(basePath, 'domain');
    const constantsPath = join(domainPath, 'constants');
    const entitiesPath = join(domainPath, 'entities');
    const servicesPath = join(domainPath, 'services');

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

    // Helper function to create directory and log appropriate message
    const createDirectoryWithLog = async (path: string): Promise<void> => {
      try {
        await Deno.stat(path);
        console.log(`📁 Directory already exists: ${path}`);
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          await ensureDir(path);
          console.log(`📁 Created directory: ${path}`);
        } else {
          throw error;
        }
      }
    };

    // Create all directories with appropriate logging
    await Promise.all([
      // Application layer
      createDirectoryWithLog(applicationPath),
      createDirectoryWithLog(commandsPath),
      createDirectoryWithLog(eventsPath),
      createDirectoryWithLog(queriesPath),
      createDirectoryWithLog(usecasesPath),
      // Domain layer
      createDirectoryWithLog(domainPath),
      createDirectoryWithLog(constantsPath),
      createDirectoryWithLog(entitiesPath),
      createDirectoryWithLog(servicesPath),
      // Infrastructure layer
      createDirectoryWithLog(infrastructurePath),
      createDirectoryWithLog(adaptersPath),
      createDirectoryWithLog(persistencePath),
      // Other layers
      createDirectoryWithLog(controllersPath),
      createDirectoryWithLog(dtoPath),
      createDirectoryWithLog(requestsPath),
      createDirectoryWithLog(responsesPath),
      createDirectoryWithLog(portsPath),
    ]);
  }

  async generate(
    appName: string,
    type: 'event' | 'command' | 'query' | 'service' | 'usecase',
    name: string,
  ): Promise<void> {
    // Normalize the class name with proper suffix
    const className = ensureSuffix(toPascalCase(name), this.getSuffix(type));
    const handlerName = generateHandlerName(className);

    // Generate file names (use original name without type suffix for files)
    const baseFileName = toKebabCase(name);
    const folderName = toKebabCase(name);

    // Create directory path based on type
    const typeFolder = this.getTypeFolderName(type);
    const layerPath = this.getLayerPath(type);
    const basePath = join('apps', appName, 'src', layerPath, typeFolder, folderName);
    await ensureDir(basePath);

    // Generate file paths
    const mainFilePath = join(basePath, `${baseFileName}.${type}.ts`);
    const indexFilePath = join(basePath, 'index.ts');

    // Generate content based on type
    const { mainContent, handlerContent, indexContent } = this.getTemplates(
      type,
      className,
      handlerName,
      baseFileName,
    );

    // Write files (handlers only for event, command, query)
    const writePromises = [
      Deno.writeTextFile(mainFilePath, mainContent),
      Deno.writeTextFile(indexFilePath, indexContent),
    ];

    if (handlerContent) {
      const handlerFilePath = join(basePath, `${baseFileName}.handler.ts`);
      writePromises.push(Deno.writeTextFile(handlerFilePath, handlerContent));
      console.log(`📄 Created file: ${handlerFilePath}`);
    }

    await Promise.all(writePromises);

    console.log(`📁 Created directory: ${basePath}`);
    console.log(`📄 Created file: ${mainFilePath}`);
    console.log(`📄 Created file: ${indexFilePath}`);

    // Update type index and module files only for CQRS types
    if (['event', 'command', 'query'].includes(type)) {
      await this.moduleManager.updateTypeIndex(
        appName,
        typeFolder,
        type as 'event' | 'command' | 'query',
        {
          name: handlerName,
          path: `./${folderName}`,
        },
      );
    } else {
      // For services and usecases, create separate index management
      await this.moduleManager.updateNonCQRSTypeIndex(appName, typeFolder, {
        name: className,
        path: `./${folderName}`,
      });
    }

    await this.moduleManager.updateServiceModule(appName);
  }

  private getSuffix(type: 'event' | 'command' | 'query' | 'service' | 'usecase'): string {
    switch (type) {
      case 'event':
        return 'Event';
      case 'command':
        return 'Command';
      case 'query':
        return 'Query';
      case 'service':
        return 'Service';
      case 'usecase':
        return 'UseCase';
    }
  }

  private getTemplates(
    type: 'event' | 'command' | 'query' | 'service' | 'usecase',
    className: string,
    handlerName: string,
    fileName: string,
  ): { mainContent: string; handlerContent?: string; indexContent: string } {
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
      case 'service':
        return {
          mainContent: serviceTemplate(className),
          indexContent: serviceIndexTemplate(className, fileName),
        };
      case 'usecase':
        return {
          mainContent: usecaseTemplate(className),
          indexContent: usecaseIndexTemplate(className, fileName),
        };
    }
  }

  private getTypeFolderName(type: 'event' | 'command' | 'query' | 'service' | 'usecase'): string {
    switch (type) {
      case 'event':
        return 'events';
      case 'command':
        return 'commands';
      case 'query':
        return 'queries';
      case 'service':
        return 'services';
      case 'usecase':
        return 'usecases';
    }
  }

  private getLayerPath(type: 'event' | 'command' | 'query' | 'service' | 'usecase'): string {
    switch (type) {
      case 'event':
      case 'command':
      case 'query':
      case 'usecase':
        return 'application';
      case 'service':
        return 'domain';
    }
  }
}
