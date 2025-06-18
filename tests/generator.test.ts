import { assert } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { exists } from 'https://deno.land/std@0.208.0/fs/exists.ts';
import { GeneratorService } from '../src/generator.service.ts';

// Test utilities
async function cleanupTestDir(appName: string) {
  try {
    await Deno.remove(`apps/src/${appName}`, { recursive: true });
  } catch {
    // Directory doesn't exist, ignore
  }
}

async function setupTestDir() {
  try {
    await Deno.mkdir('apps/src', { recursive: true });
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
    assert(await exists(`apps/src/${appName}/application/events/user-created`));
    assert(
      await exists(`apps/src/${appName}/application/events/user-created/user-created.event.ts`),
    );
    assert(
      await exists(`apps/src/${appName}/application/events/user-created/user-created.handler.ts`),
    );
    assert(await exists(`apps/src/${appName}/application/events/user-created/index.ts`));
    assert(await exists(`apps/src/${appName}/application/events/index.ts`));
    assert(await exists(`apps/src/${appName}/src/${appName}.module.ts`));

    // Check file contents
    const eventFile = await Deno.readTextFile(
      `apps/src/${appName}/application/events/user-created/user-created.event.ts`,
    );
    assert(eventFile.includes('export class UserCreatedEvent implements IEvent'));

    const handlerFile = await Deno.readTextFile(
      `apps/src/${appName}/application/events/user-created/user-created.handler.ts`,
    );
    assert(handlerFile.includes('export class UserCreatedEventHandler implements IEventHandler'));

    const eventsIndex = await Deno.readTextFile(`apps/src/${appName}/application/events/index.ts`);
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
    assert(await exists(`apps/src/${appName}/application/commands/create-user`));
    assert(
      await exists(`apps/src/${appName}/application/commands/create-user/create-user.command.ts`),
    );
    assert(
      await exists(`apps/src/${appName}/application/commands/create-user/create-user.handler.ts`),
    );
    assert(await exists(`apps/src/${appName}/application/commands/index.ts`));

    // Check file contents
    const commandFile = await Deno.readTextFile(
      `apps/src/${appName}/application/commands/create-user/create-user.command.ts`,
    );
    assert(commandFile.includes('export class CreateUserCommand implements ICommand'));

    const commandsIndex = await Deno.readTextFile(
      `apps/src/${appName}/application/commands/index.ts`,
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
    assert(await exists(`apps/src/${appName}/application/queries/get-order`));
    assert(await exists(`apps/src/${appName}/application/queries/get-order/get-order.query.ts`));
    assert(await exists(`apps/src/${appName}/application/queries/get-order/get-order.handler.ts`));
    assert(await exists(`apps/src/${appName}/application/queries/index.ts`));

    // Check file contents
    const queryFile = await Deno.readTextFile(
      `apps/src/${appName}/application/queries/get-order/get-order.query.ts`,
    );
    assert(queryFile.includes('export class GetOrderQuery implements IQuery'));

    const queriesIndex = await Deno.readTextFile(
      `apps/src/${appName}/application/queries/index.ts`,
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
      `apps/src/${appName}/application/commands/index.ts`,
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
