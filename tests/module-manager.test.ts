import { assert, assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { exists } from 'https://deno.land/std@0.208.0/fs/exists.ts';
import { ModuleManagerService } from '../src/module-manager.service.ts';

// Test utilities
async function createTestDir(path: string) {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch {
    // Directory already exists, ignore
  }
}

async function cleanupTestDir(path: string) {
  try {
    await Deno.remove(path, { recursive: true });
  } catch {
    // Directory doesn't exist, ignore
  }
}

Deno.test('ModuleManagerService - generates correct type index content', async () => {
  const moduleManager = new ModuleManagerService();
  const testPath = 'test-temp/commands';

  await cleanupTestDir('test-temp');
  await createTestDir(testPath);

  try {
    // Create test handler directories and files
    await createTestDir(`${testPath}/create-user`);
    await createTestDir(`${testPath}/update-user`);

    await Deno.writeTextFile(
      `${testPath}/create-user/create-user.handler.ts`,
      `
export class CreateUserCommandHandler {
  async execute() {}
}
    `,
    );

    await Deno.writeTextFile(
      `${testPath}/update-user/update-user.handler.ts`,
      `
export class UpdateUserCommandHandler {
  async execute() {}
}
    `,
    );

    // Test updateTypeIndex
    await moduleManager.updateTypeIndex('test-app', 'commands', 'command', {
      name: 'CreateUserCommandHandler',
      path: './create-user',
    });

    // Check if index file was created
    assert(await exists(`${testPath}/index.ts`));

    const indexContent = await Deno.readTextFile(`${testPath}/index.ts`);
    assert(indexContent.includes('export const CommandHandlers = ['));
    assert(indexContent.includes('CreateUserCommandHandler'));
    assert(indexContent.includes('export { CreateUserCommand }'));
  } finally {
    await cleanupTestDir('test-temp');
  }
});

Deno.test('ModuleManagerService - creates new module file when none exists', async () => {
  const moduleManager = new ModuleManagerService();
  const testPath = 'test-temp';

  await cleanupTestDir(testPath);

  try {
    await moduleManager.updateServiceModule('test-service');

    assert(await exists(`apps/src/test-service/src/test-service.module.ts`));

    const moduleContent = await Deno.readTextFile(
      `apps/src/test-service/src/test-service.module.ts`,
    );
    assert(moduleContent.includes("import { Module } from '@nestjs/common';"));
    assert(moduleContent.includes("import { CqrsModule } from '@nestjs/cqrs';"));
    assert(moduleContent.includes("import { CommandHandlers } from './application/commands';"));
    assert(moduleContent.includes("import { EventHandlers } from './application/events';"));
    assert(moduleContent.includes("import { QueryHandlers } from './application/queries';"));
    assert(moduleContent.includes('...CommandHandlers'));
    assert(moduleContent.includes('...EventHandlers'));
    assert(moduleContent.includes('...QueryHandlers'));
    assert(moduleContent.includes('export class TestServiceModule'));
  } finally {
    await cleanupTestDir(testPath);
  }
});

Deno.test('ModuleManagerService - preserves existing providers in module file', async () => {
  const moduleManager = new ModuleManagerService();
  const testPath = 'test-temp/src/test-service/src';

  await cleanupTestDir('test-temp');
  await createTestDir(testPath);

  try {
    // Create existing module file with providers
    const existingModule = `import { Module } from '@nestjs/common';
import { ExistingService } from './existing.service';
import { AnotherService } from './another.service';

@Module({
  imports: [],
  providers: [
    ExistingService,
    AnotherService,
  ],
  controllers: [],
})
export class TestServiceModule {}`;

    await Deno.writeTextFile(`${testPath}/test-service.module.ts`, existingModule);

    await moduleManager.updateServiceModule('test-service');

    const updatedContent = await Deno.readTextFile(`${testPath}/test-service.module.ts`);

    // Check that existing providers are preserved
    assert(updatedContent.includes('ExistingService'));
    assert(updatedContent.includes('AnotherService'));

    // Check that new handler imports were added
    assert(updatedContent.includes("import { CommandHandlers } from './application/commands';"));
    assert(updatedContent.includes("import { EventHandlers } from './application/events';"));
    assert(updatedContent.includes("import { QueryHandlers } from './application/queries';"));

    // Check that handler arrays were added to providers
    assert(updatedContent.includes('...CommandHandlers'));
    assert(updatedContent.includes('...EventHandlers'));
    assert(updatedContent.includes('...QueryHandlers'));
  } finally {
    await cleanupTestDir('test-temp');
  }
});

Deno.test('ModuleManagerService - handles multiple handlers in same type', async () => {
  const moduleManager = new ModuleManagerService();
  const testPath = 'test-temp/commands';

  await cleanupTestDir('test-temp');
  await createTestDir(testPath);

  try {
    // Add first handler
    await moduleManager.updateTypeIndex('test-app', 'commands', 'command', {
      name: 'CreateUserCommandHandler',
      path: './create-user',
    });

    // Add second handler
    await moduleManager.updateTypeIndex('test-app', 'commands', 'command', {
      name: 'UpdateUserCommandHandler',
      path: './update-user',
    });

    const indexContent = await Deno.readTextFile(`${testPath}/index.ts`);

    // Check that both handlers are in the array
    assert(indexContent.includes('CreateUserCommandHandler'));
    assert(indexContent.includes('UpdateUserCommandHandler'));

    // Check that both main classes are exported
    assert(indexContent.includes('export { CreateUserCommand }'));
    assert(indexContent.includes('export { UpdateUserCommand }'));

    // Check array structure
    const handlerArrayMatch = indexContent.match(/export const CommandHandlers = \[([\s\S]*?)\];/);
    assert(handlerArrayMatch);
    const handlerArray = handlerArrayMatch[1];
    assert(handlerArray.includes('CreateUserCommandHandler'));
    assert(handlerArray.includes('UpdateUserCommandHandler'));
  } finally {
    await cleanupTestDir('test-temp');
  }
});
