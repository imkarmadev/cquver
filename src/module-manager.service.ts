import { join } from 'https://deno.land/std@0.208.0/path/mod.ts';
import { ensureDir } from './utils.ts';

export interface HandlerInfo {
  name: string;
  path: string;
}

export interface ClassInfo {
  name: string;
  path: string;
}

export class ModuleManagerService {
  /**
   * Updates or creates index file for a specific type (commands/events/queries)
   */
  async updateTypeIndex(
    appName: string,
    typeFolder: string,
    type: 'command' | 'event' | 'query',
    newHandler: HandlerInfo,
  ): Promise<void> {
    const typePath = join('apps', 'src', appName, 'application', typeFolder);
    const indexPath = join(typePath, 'index.ts');

    // Get all existing handlers
    const handlers = await this.getAllHandlers(typePath, type);

    // Add new handler if not already present
    const exists = handlers.some((h) => h.name === newHandler.name);
    if (!exists) {
      handlers.push(newHandler);
    }

    // Generate index content
    const indexContent = this.generateTypeIndexContent(type, handlers);

    // Write index file
    await Deno.writeTextFile(indexPath, indexContent);
    console.log(`📄 Updated index: ${indexPath}`);
  }

  /**
   * Updates or creates application index file with main class exports
   */
  async updateApplicationIndex(
    appName: string,
    _type: 'command' | 'event' | 'query',
    newClass: ClassInfo,
  ): Promise<void> {
    const applicationPath = join('apps', 'src', appName, 'application');
    const indexPath = join(applicationPath, 'index.ts');

    // Get all existing classes
    const classes = await this.getAllMainClasses(applicationPath);

    // Add new class if not already present
    const exists = classes.some((c) => c.name === newClass.name);
    if (!exists) {
      classes.push(newClass);
    }

    // Generate application index content
    const indexContent = this.generateApplicationIndexContent(classes);

    // Write index file
    await ensureDir(applicationPath);
    await Deno.writeTextFile(indexPath, indexContent);
    console.log(`📄 Updated application index: ${indexPath}`);
  }

  /**
   * Updates the service module file to include handler arrays
   */
  async updateServiceModule(appName: string): Promise<void> {
    const modulePath = join('apps', 'src', appName, 'src', `${appName}.module.ts`);

    try {
      // Check if module file exists
      let moduleContent = '';
      try {
        moduleContent = await Deno.readTextFile(modulePath);
      } catch {
        // Create new module file if it doesn't exist
        moduleContent = this.generateNewModuleContent(appName);
        await ensureDir(join('apps', 'src', appName, 'src'));
      }

      // Update module content with handler imports and providers
      const updatedContent = this.updateModuleContent(moduleContent, appName);

      await Deno.writeTextFile(modulePath, updatedContent);
      console.log(`📄 Updated module: ${modulePath}`);
    } catch (error) {
      console.warn(
        `⚠️ Could not update module file: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Gets all existing handlers for a specific type
   */
  private async getAllHandlers(
    typePath: string,
    _type: 'command' | 'event' | 'query',
  ): Promise<HandlerInfo[]> {
    const handlers: HandlerInfo[] = [];

    try {
      for await (const entry of Deno.readDir(typePath)) {
        if (entry.isDirectory) {
          const handlerFile = join(typePath, entry.name, `${entry.name}.handler.ts`);
          try {
            const content = await Deno.readTextFile(handlerFile);
            const handlerName = this.extractHandlerName(content);
            if (handlerName) {
              handlers.push({
                name: handlerName,
                path: `./${entry.name}`,
              });
            }
          } catch {
            // Handler file doesn't exist or can't be read
          }
        }
      }
    } catch {
      // Directory doesn't exist yet
    }

    return handlers;
  }

  /**
   * Extracts handler class name from file content
   */
  private extractHandlerName(content: string): string | null {
    const match = content.match(/export class (\w+Handler)/);
    return match ? match[1] : null;
  }

  /**
   * Generates content for type index file
   */
  private generateTypeIndexContent(
    type: 'command' | 'event' | 'query',
    handlers: HandlerInfo[],
  ): string {
    const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
    const handlerArrayName = `${typeCapitalized}Handlers`;

    let content = '';
    const mainClasses: string[] = [];

    // Add imports for handlers and collect main class names
    for (const handler of handlers) {
      content += `import { ${handler.name} } from '${handler.path}';\n`;

      // Extract main class name from handler name (remove "Handler" suffix)
      const mainClassName = handler.name.replace('Handler', '');
      mainClasses.push(mainClassName);
      content += `import { ${mainClassName} } from '${handler.path}';\n`;
    }

    content += '\n';

    // Add handler array export
    content += `export const ${handlerArrayName} = [\n`;
    for (const handler of handlers) {
      content += `  ${handler.name},\n`;
    }
    content += '];\n\n';

    // Add main class exports
    content += `// Export all ${type} classes\n`;
    for (const mainClass of mainClasses) {
      content += `export { ${mainClass} };\n`;
    }

    return content;
  }

  /**
   * Generates new module file content
   */
  private generateNewModuleContent(appName: string): string {
    const className =
      appName.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('') +
      'Module';

    return `import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './application/commands';
import { EventHandlers } from './application/events';
import { QueryHandlers } from './application/queries';

@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class ${className} {}
`;
  }

  /**
   * Gets all existing main classes from the application directory
   */
  private async getAllMainClasses(applicationPath: string): Promise<ClassInfo[]> {
    const classes: ClassInfo[] = [];
    const typeFolders = ['commands', 'events', 'queries'];

    for (const typeFolder of typeFolders) {
      const typePath = join(applicationPath, typeFolder);
      try {
        for await (const entry of Deno.readDir(typePath)) {
          if (entry.isDirectory) {
            const type = typeFolder.slice(0, -1); // remove 's' -> commands -> command
            const mainFile = join(typePath, entry.name, `${entry.name}.${type}.ts`);
            try {
              const content = await Deno.readTextFile(mainFile);
              const className = this.extractMainClassName(content, type);
              if (className) {
                classes.push({
                  name: className,
                  path: `./${typeFolder}/${entry.name}`,
                });
              }
            } catch {
              // Main file doesn't exist or can't be read
            }
          }
        }
      } catch {
        // Type folder doesn't exist yet
      }
    }

    return classes;
  }

  /**
   * Extracts main class name from file content
   */
  private extractMainClassName(content: string, type: string): string | null {
    const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
    const pattern = new RegExp(`export class (\\w+${typeCapitalized})`);
    const match = content.match(pattern);
    return match ? match[1] : null;
  }

  /**
   * Generates content for application index file
   */
  private generateApplicationIndexContent(classes: ClassInfo[]): string {
    let content = '';

    // Add imports for all main classes
    for (const cls of classes) {
      content += `import { ${cls.name} } from '${cls.path}';\n`;
    }

    content += '\n// Export all main classes\n';

    // Add individual exports
    for (const cls of classes) {
      content += `export { ${cls.name} };\n`;
    }

    return content;
  }

  /**
   * Updates existing module content with handler imports and providers
   */
  private updateModuleContent(content: string, _appName: string): string {
    // Add imports if not present
    const imports = [
      "import { CommandHandlers } from './application/commands';",
      "import { EventHandlers } from './application/events';",
      "import { QueryHandlers } from './application/queries';",
    ];

    let updatedContent = content;

    // Add missing imports
    for (const importStatement of imports) {
      if (!updatedContent.includes(importStatement)) {
        // Find the last import statement and add after it
        const lastImportMatch = updatedContent.match(/import.*from.*['""];/g);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          updatedContent = updatedContent.replace(lastImport, lastImport + '\n' + importStatement);
        } else {
          // No imports found, add at the beginning
          updatedContent = importStatement + '\n\n' + updatedContent;
        }
      }
    }

    // Add handler arrays to providers if not present
    const handlerArrays = ['...CommandHandlers', '...EventHandlers', '...QueryHandlers'];

    for (const handlerArray of handlerArrays) {
      if (!updatedContent.includes(handlerArray)) {
        // Find providers array and add handler array
        const providersMatch = updatedContent.match(/providers:\s*\[([\s\S]*?)\]/);
        if (providersMatch) {
          const providersContent = providersMatch[1].trim();

          // Only add if not already present
          if (!providersContent.includes(handlerArray)) {
            const newProvidersContent = providersContent
              ? `${providersContent.replace(/,$/, '')},\n    ${handlerArray},`
              : `\n    ${handlerArray},\n  `;

            updatedContent = updatedContent.replace(
              /providers:\s*\[([\s\S]*?)\]/,
              `providers: [${newProvidersContent}]`,
            );
          }
        } else {
          // No providers array found, add one
          const moduleMatch = updatedContent.match(/@Module\(\{([\s\S]*?)\}\)/);
          if (moduleMatch) {
            const moduleContent = moduleMatch[1];
            const newModuleContent = moduleContent.includes('providers:')
              ? moduleContent
              : `${moduleContent.trim()},\n  providers: [\n    ${handlerArray},\n  ],`;

            updatedContent = updatedContent.replace(
              /@Module\(\{([\s\S]*?)\}\)/,
              `@Module({${newModuleContent}})`,
            );
          }
        }
      }
    }

    return updatedContent;
  }
}
