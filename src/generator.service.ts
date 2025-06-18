import { join } from 'https://deno.land/std@0.208.0/path/mod.ts';
import {
    eventTemplate,
    eventHandlerTemplate,
    eventIndexTemplate,
} from './templates/event.templates.ts';
import {
    commandTemplate,
    commandHandlerTemplate,
    commandIndexTemplate,
} from './templates/command.templates.ts';
import {
    queryTemplate,
    queryHandlerTemplate,
    queryIndexTemplate,
} from './templates/query.templates.ts';
import {
    toPascalCase,
    toKebabCase,
    ensureSuffix,
    generateHandlerName,
    ensureDir,
} from './utils.ts';
import { ModuleManagerService } from './module-manager.service.ts';

export class GeneratorService {
    private moduleManager = new ModuleManagerService();

    async generate(
        appName: string,
        type: 'event' | 'command' | 'query',
        name: string
    ): Promise<void> {
        // Normalize the class name with proper suffix
        const className = ensureSuffix(toPascalCase(name), this.getSuffix(type));
        const handlerName = generateHandlerName(className);

        // Generate file names (use original name without type suffix for files)
        const baseFileName = toKebabCase(name);
        const folderName = toKebabCase(name);

        // Create directory path (use plural folder names)
        const typeFolder = this.getTypeFolderName(type);
        const basePath = join('apps', 'src', appName, 'application', typeFolder, folderName);
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
            baseFileName
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
            path: `./${folderName}`
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
        fileName: string
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