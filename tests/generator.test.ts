import { assert, assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { exists } from 'https://deno.land/std@0.208.0/fs/exists.ts';
import { GeneratorService } from '../src/generator.service.ts';

// Test utilities
async function cleanupTestDir(appName: string) {
  try {
    await Deno.remove(`apps/src/${appName}`, { recursive: true });
  } catch {
    // Directory doesn't exist, ignore
  }
  try {
    await Deno.remove(`apps/${appName}`, { recursive: true });
  } catch {
    // Directory doesn't exist, ignore
  }
}

async function setupTestDir() {
  try {
    await Deno.mkdir('apps', { recursive: true });
  } catch {
    // Directory already exists, ignore
  }
}

Deno.test('GeneratorService - creates event with correct structure', async () => {
  const appName = 'test-service';
  const generator = new GeneratorService();

  await cleanupTestDir(appName);
  await setupTestDir();

  try {
    // Generate event
    await generator.generate(appName, 'event', 'UserCreated');

    // Check directory structure
    assert(await exists(`apps/${appName}/src/application/events/user-created`));
    assert(
      await exists(`apps/${appName}/src/application/events/user-created/user-created.event.ts`),
    );
    assert(
      await exists(`apps/${appName}/src/application/events/user-created/user-created.handler.ts`),
    );
    assert(await exists(`apps/${appName}/src/application/events/user-created/index.ts`));
    assert(await exists(`apps/${appName}/src/application/events/index.ts`));
    assert(await exists(`apps/${appName}/src/${appName}.module.ts`));

    // Check file contents
    const eventFile = await Deno.readTextFile(
      `apps/${appName}/src/application/events/user-created/user-created.event.ts`,
    );
    assert(eventFile.includes('export class UserCreatedEvent implements IEvent'));

    const handlerFile = await Deno.readTextFile(
      `apps/${appName}/src/application/events/user-created/user-created.handler.ts`,
    );
    assert(handlerFile.includes('export class UserCreatedEventHandler implements IEventHandler'));

    const eventsIndex = await Deno.readTextFile(`apps/${appName}/src/application/events/index.ts`);
    assert(eventsIndex.includes('export const EventHandlers = ['));
    assert(eventsIndex.includes('UserCreatedEventHandler'));
    assert(eventsIndex.includes('export { UserCreatedEvent }'));
  } finally {
    await cleanupTestDir(appName);
  }
});

Deno.test('GeneratorService - creates command with correct structure', async () => {
  const appName = 'test-service';
  const generator = new GeneratorService();

  await cleanupTestDir(appName);
  await setupTestDir();

  try {
    // Generate command
    await generator.generate(appName, 'command', 'CreateUser');

    // Check directory structure
    assert(await exists(`apps/${appName}/src/application/commands/create-user`));
    assert(
      await exists(`apps/${appName}/src/application/commands/create-user/create-user.command.ts`),
    );
    assert(
      await exists(`apps/${appName}/src/application/commands/create-user/create-user.handler.ts`),
    );
    assert(await exists(`apps/${appName}/src/application/commands/index.ts`));

    // Check file contents
    const commandFile = await Deno.readTextFile(
      `apps/${appName}/src/application/commands/create-user/create-user.command.ts`,
    );
    assert(commandFile.includes('export class CreateUserCommand implements ICommand'));

    const commandsIndex = await Deno.readTextFile(
      `apps/${appName}/src/application/commands/index.ts`,
    );
    assert(commandsIndex.includes('export const CommandHandlers = ['));
    assert(commandsIndex.includes('CreateUserCommandHandler'));
    assert(commandsIndex.includes('export { CreateUserCommand }'));
  } finally {
    await cleanupTestDir(appName);
  }
});

Deno.test('GeneratorService - creates query with correct structure', async () => {
  const appName = 'test-service';
  const generator = new GeneratorService();

  await cleanupTestDir(appName);
  await setupTestDir();

  try {
    // Generate query
    await generator.generate(appName, 'query', 'GetOrder');

    // Check directory structure
    assert(await exists(`apps/${appName}/src/application/queries/get-order`));
    assert(await exists(`apps/${appName}/src/application/queries/get-order/get-order.query.ts`));
    assert(await exists(`apps/${appName}/src/application/queries/get-order/get-order.handler.ts`));
    assert(await exists(`apps/${appName}/src/application/queries/index.ts`));

    // Check file contents
    const queryFile = await Deno.readTextFile(
      `apps/${appName}/src/application/queries/get-order/get-order.query.ts`,
    );
    assert(queryFile.includes('export class GetOrderQuery implements IQuery'));

    const queriesIndex = await Deno.readTextFile(
      `apps/${appName}/src/application/queries/index.ts`,
    );
    assert(queriesIndex.includes('export const QueryHandlers = ['));
    assert(queriesIndex.includes('GetOrderQueryHandler'));
    assert(queriesIndex.includes('export { GetOrderQuery }'));
  } finally {
    await cleanupTestDir(appName);
  }
});

Deno.test('GeneratorService - handles multiple handlers in same type', async () => {
  const appName = 'test-service';
  const generator = new GeneratorService();

  await cleanupTestDir(appName);
  await setupTestDir();

  try {
    // Generate multiple commands
    await generator.generate(appName, 'command', 'CreateUser');
    await generator.generate(appName, 'command', 'UpdateUser');

    // Check that both handlers are in the index
    const commandsIndex = await Deno.readTextFile(
      `apps/${appName}/src/application/commands/index.ts`,
    );
    assert(commandsIndex.includes('CreateUserCommandHandler'));
    assert(commandsIndex.includes('UpdateUserCommandHandler'));
    assert(commandsIndex.includes('export { CreateUserCommand }'));
    assert(commandsIndex.includes('export { UpdateUserCommand }'));

    // Check that the array contains both handlers
    assert(commandsIndex.includes('export const CommandHandlers = ['));
    const handlerArrayMatch = commandsIndex.match(/export const CommandHandlers = \[([\s\S]*?)\];/);
    assert(handlerArrayMatch);
    const handlerArray = handlerArrayMatch[1];
    assert(handlerArray.includes('CreateUserCommandHandler'));
    assert(handlerArray.includes('UpdateUserCommandHandler'));
  } finally {
    await cleanupTestDir(appName);
  }
});

Deno.test('GeneratorService - initializeService creates correct folder structure', async () => {
  const appName = 'test-service';
  const generator = new GeneratorService();

  await cleanupTestDir(appName);

  try {
    // Create app directory first (simulate existing NestJS app)
    await Deno.mkdir(`apps/${appName}/src`, { recursive: true });

    // Initialize service structure
    await generator.initializeService(appName);

    // Check that all required directories were created
    assert(await exists(`apps/${appName}/src/application`));
    assert(await exists(`apps/${appName}/src/application/commands`));
    assert(await exists(`apps/${appName}/src/application/events`));
    assert(await exists(`apps/${appName}/src/application/queries`));
    assert(await exists(`apps/${appName}/src/application/usecases`));
    assert(await exists(`apps/${appName}/src/domain`));
    assert(await exists(`apps/${appName}/src/domain/constants`));
    assert(await exists(`apps/${appName}/src/domain/entities`));
    assert(await exists(`apps/${appName}/src/domain/services`));
    assert(await exists(`apps/${appName}/src/infrastructure`));
    assert(await exists(`apps/${appName}/src/infrastructure/adapters`));
    assert(await exists(`apps/${appName}/src/infrastructure/persistence`));
    assert(await exists(`apps/${appName}/src/controllers`));
    assert(await exists(`apps/${appName}/src/dto`));
    assert(await exists(`apps/${appName}/src/dto/requests`));
    assert(await exists(`apps/${appName}/src/dto/responses`));
    assert(await exists(`apps/${appName}/src/ports`));

    // Verify no files were created (only directories)
    const entries = [];
    for await (const entry of Deno.readDir(`apps/${appName}/src`)) {
      if (entry.isFile) {
        entries.push(entry.name);
      }
    }
    assertEquals(entries.length, 0, 'No files should be created by init command');
  } finally {
    await cleanupTestDir(appName);
  }
});

Deno.test('GeneratorService - initializeService fails when app does not exist', async () => {
  const appName = 'nonexistent-service';
  const generator = new GeneratorService();

  await cleanupTestDir(appName);

  try {
    // Try to initialize without creating app directory first
    let errorThrown = false;
    try {
      await generator.initializeService(appName);
    } catch (error) {
      errorThrown = true;
      assert(error instanceof Error && error.message.includes('does not exist'));
    }
    assert(errorThrown, 'Expected error to be thrown for non-existent app');
  } finally {
    await cleanupTestDir(appName);
  }
});

Deno.test('GeneratorService - initializeService works with existing structure', async () => {
  const appName = 'test-service';
  const generator = new GeneratorService();

  await cleanupTestDir(appName);

  try {
    // Create app directory and some existing structure
    await Deno.mkdir(`apps/${appName}/src/existing-folder`, { recursive: true });
    await Deno.writeTextFile(`apps/${appName}/src/existing-file.ts`, 'export const test = true;');

    // Initialize service structure
    await generator.initializeService(appName);

    // Check that new directories were created
    assert(await exists(`apps/${appName}/src/application`));
    assert(await exists(`apps/${appName}/src/domain`));
    assert(await exists(`apps/${appName}/src/infrastructure`));

    // Check that existing structure is preserved
    assert(await exists(`apps/${appName}/src/existing-folder`));
    assert(await exists(`apps/${appName}/src/existing-file.ts`));

    const fileContent = await Deno.readTextFile(`apps/${appName}/src/existing-file.ts`);
    assertEquals(fileContent, 'export const test = true;');
  } finally {
    await cleanupTestDir(appName);
  }
});

Deno.test('GeneratorService - creates service with correct structure', async () => {
  const appName = 'test-service';
  const generator = new GeneratorService();

  await cleanupTestDir(appName);
  await setupTestDir();

  try {
    // Generate service
    await generator.generate(appName, 'service', 'UserValidator');

    // Check directory structure
    assert(await exists(`apps/${appName}/src/domain/services/user-validator`));
    assert(
      await exists(`apps/${appName}/src/domain/services/user-validator/user-validator.service.ts`),
    );
    assert(await exists(`apps/${appName}/src/domain/services/user-validator/index.ts`));
    assert(await exists(`apps/${appName}/src/domain/services/index.ts`));
    assert(await exists(`apps/${appName}/src/${appName}.module.ts`));

    // Check file contents
    const serviceFile = await Deno.readTextFile(
      `apps/${appName}/src/domain/services/user-validator/user-validator.service.ts`,
    );
    assert(serviceFile.includes('export class UserValidatorService'));
    assert(serviceFile.includes('@Injectable()'));

    const servicesIndex = await Deno.readTextFile(`apps/${appName}/src/domain/services/index.ts`);
    assert(servicesIndex.includes('export const Services = ['));
    assert(servicesIndex.includes('UserValidatorService'));
    assert(servicesIndex.includes('export { UserValidatorService }'));
  } finally {
    await cleanupTestDir(appName);
  }
});

Deno.test('GeneratorService - creates usecase with correct structure', async () => {
  const appName = 'test-service';
  const generator = new GeneratorService();

  await cleanupTestDir(appName);
  await setupTestDir();

  try {
    // Generate usecase
    await generator.generate(appName, 'usecase', 'ProcessUserRegistration');

    // Check directory structure
    assert(await exists(`apps/${appName}/src/application/usecases/process-user-registration`));
    assert(
      await exists(
        `apps/${appName}/src/application/usecases/process-user-registration/process-user-registration.usecase.ts`,
      ),
    );
    assert(
      await exists(`apps/${appName}/src/application/usecases/process-user-registration/index.ts`),
    );
    assert(await exists(`apps/${appName}/src/application/usecases/index.ts`));
    assert(await exists(`apps/${appName}/src/${appName}.module.ts`));

    // Check file contents
    const usecaseFile = await Deno.readTextFile(
      `apps/${appName}/src/application/usecases/process-user-registration/process-user-registration.usecase.ts`,
    );
    assert(usecaseFile.includes('export class ProcessUserRegistrationUseCase'));
    assert(usecaseFile.includes('@Injectable()'));

    const usecasesIndex = await Deno.readTextFile(
      `apps/${appName}/src/application/usecases/index.ts`,
    );
    assert(usecasesIndex.includes('export const UseCases = ['));
    assert(usecasesIndex.includes('ProcessUserRegistrationUseCase'));
    assert(usecasesIndex.includes('export { ProcessUserRegistrationUseCase }'));
  } finally {
    await cleanupTestDir(appName);
  }
});

Deno.test('GeneratorService - generate works after initializeService', async () => {
  const appName = 'test-service';
  const generator = new GeneratorService();

  await cleanupTestDir(appName);

  try {
    // Create app directory and initialize structure
    await Deno.mkdir(`apps/${appName}/src`, { recursive: true });
    await generator.initializeService(appName);

    // Generate a command after initialization
    await generator.generate(appName, 'command', 'CreateUser');

    // Check that the command was created in the correct location
    assert(await exists(`apps/${appName}/src/application/commands/create-user`));
    assert(
      await exists(`apps/${appName}/src/application/commands/create-user/create-user.command.ts`),
    );
    assert(
      await exists(`apps/${appName}/src/application/commands/create-user/create-user.handler.ts`),
    );
    assert(await exists(`apps/${appName}/src/application/commands/index.ts`));

    // Check that the index file was properly created by the generate command
    const commandsIndex = await Deno.readTextFile(
      `apps/${appName}/src/application/commands/index.ts`,
    );
    assert(commandsIndex.includes('CreateUserCommandHandler'));
    assert(commandsIndex.includes('export { CreateUserCommand }'));
  } finally {
    await cleanupTestDir(appName);
  }
});
