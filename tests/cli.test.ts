import { assert, assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { exists } from 'https://deno.land/std@0.208.0/fs/exists.ts';

// Test utilities
async function runCLI(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ['run', '--allow-read', '--allow-write', '--allow-env', 'cli.ts', ...args],
    stdout: 'piped',
    stderr: 'piped',
  });

  const { code, stdout, stderr } = await cmd.output();

  return {
    code,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
}

async function cleanupTestApps() {
  try {
    await Deno.remove('apps', { recursive: true });
  } catch {
    // Directory doesn't exist, ignore
  }
}

Deno.test('CLI - shows help when no arguments provided', async () => {
  const result = await runCLI([]);

  assertEquals(result.code, 0);
  assert(result.stdout.includes('cquver - NestJS DDD/CQRS Boilerplate Generator'));
  assert(result.stdout.includes('Usage:'));
  assert(result.stdout.includes('Examples:'));
});

Deno.test('CLI - shows help with --help flag', async () => {
  const result = await runCLI(['--help']);

  assertEquals(result.code, 0);
  assert(result.stdout.includes('cquver - NestJS DDD/CQRS Boilerplate Generator'));
  assert(result.stdout.includes('Usage:'));
});

Deno.test('CLI - fails with invalid arguments', async () => {
  const result = await runCLI(['invalid']);

  assertEquals(result.code, 1);
  assert(result.stderr.includes('Invalid arguments'));
});

Deno.test('CLI - fails with unsupported action', async () => {
  const result = await runCLI(['test-service', 'delete', 'event', 'TestEvent']);

  assertEquals(result.code, 1);
  assert(result.stderr.includes('Action must be "init" or "create"'));
});

Deno.test('CLI - fails with unsupported type', async () => {
  const result = await runCLI(['test-service', 'create', 'repository', 'TestRepository']);

  assertEquals(result.code, 1);
  assert(
    result.stderr.includes('Type must be "event", "command", "query", "service", or "usecase"'),
  );
});

Deno.test('CLI - successfully creates event', async () => {
  await cleanupTestApps();

  try {
    const result = await runCLI(['test-service', 'create', 'event', 'UserCreated']);

    assertEquals(result.code, 0);
    assert(
      result.stdout.includes('Successfully generated event "UserCreated" for app "test-service"'),
    );
    assert(result.stdout.includes('Created directory'));
    assert(result.stdout.includes('Created file'));

    // Verify files were created
    assert(
      await exists('apps/test-service/src/application/events/user-created/user-created.event.ts'),
    );
    assert(
      await exists('apps/test-service/src/application/events/user-created/user-created.handler.ts'),
    );
    assert(await exists('apps/test-service/src/application/events/index.ts'));
    assert(await exists('apps/test-service/src/test-service.module.ts'));
  } finally {
    await cleanupTestApps();
  }
});

Deno.test('CLI - successfully creates command', async () => {
  await cleanupTestApps();

  try {
    const result = await runCLI(['auth-service', 'create', 'command', 'CreateUser']);

    assertEquals(result.code, 0);
    assert(
      result.stdout.includes('Successfully generated command "CreateUser" for app "auth-service"'),
    );

    // Verify files were created
    assert(
      await exists('apps/auth-service/src/application/commands/create-user/create-user.command.ts'),
    );
    assert(
      await exists('apps/auth-service/src/application/commands/create-user/create-user.handler.ts'),
    );
    assert(await exists('apps/auth-service/src/application/commands/index.ts'));
  } finally {
    await cleanupTestApps();
  }
});

Deno.test('CLI - successfully creates query', async () => {
  await cleanupTestApps();

  try {
    const result = await runCLI(['order-service', 'create', 'query', 'GetOrdersByUser']);

    assertEquals(result.code, 0);
    assert(
      result.stdout.includes(
        'Successfully generated query "GetOrdersByUser" for app "order-service"',
      ),
    );

    // Verify files were created with correct pluralization
    assert(
      await exists(
        'apps/order-service/src/application/queries/get-orders-by-user/get-orders-by-user.query.ts',
      ),
    );
    assert(
      await exists(
        'apps/order-service/src/application/queries/get-orders-by-user/get-orders-by-user.handler.ts',
      ),
    );
    assert(await exists('apps/order-service/src/application/queries/index.ts'));
  } finally {
    await cleanupTestApps();
  }
});

Deno.test('CLI - handles complex naming correctly', async () => {
  await cleanupTestApps();

  try {
    // Test with various naming patterns
    await runCLI(['test-service', 'create', 'event', 'XMLHttpRequestCompleted']);
    await runCLI(['test-service', 'create', 'command', 'UpdateUserProfile']);
    await runCLI(['test-service', 'create', 'query', 'FindUsersByRole']);

    // Check directory names are correctly converted to kebab-case
    assert(await exists('apps/test-service/src/application/events/xml-http-request-completed'));
    assert(await exists('apps/test-service/src/application/commands/update-user-profile'));
    assert(await exists('apps/test-service/src/application/queries/find-users-by-role'));

    // Check class names are correctly preserved/generated
    const eventFile = await Deno.readTextFile(
      'apps/test-service/src/application/events/xml-http-request-completed/xml-http-request-completed.event.ts',
    );
    assert(eventFile.includes('export class XMLHttpRequestCompletedEvent'));

    const commandFile = await Deno.readTextFile(
      'apps/test-service/src/application/commands/update-user-profile/update-user-profile.command.ts',
    );
    assert(commandFile.includes('export class UpdateUserProfileCommand'));
  } finally {
    await cleanupTestApps();
  }
});

Deno.test('CLI - init command shows help message when app does not exist', async () => {
  await cleanupTestApps();

  try {
    const result = await runCLI(['nonexistent-service', 'init']);

    assertEquals(result.code, 1);
    assert(result.stdout.includes('App "nonexistent-service" not found'));
    assert(result.stdout.includes('nest generate app nonexistent-service'));
  } finally {
    await cleanupTestApps();
  }
});

Deno.test('CLI - init command creates folder structure successfully', async () => {
  await cleanupTestApps();

  try {
    // Create app directory first (simulate existing NestJS app)
    await Deno.mkdir('apps/chat-service/src', { recursive: true });

    const result = await runCLI(['chat-service', 'init']);

    assertEquals(result.code, 0);
    assert(result.stdout.includes('Successfully initialized service structure for "chat-service"'));
    assert(result.stdout.includes('📁 Created directory'));

    // Verify all required directories were created
    assert(await exists('apps/chat-service/src/application'));
    assert(await exists('apps/chat-service/src/application/commands'));
    assert(await exists('apps/chat-service/src/application/events'));
    assert(await exists('apps/chat-service/src/application/queries'));
    assert(await exists('apps/chat-service/src/application/usecases'));
    assert(await exists('apps/chat-service/src/domain'));
    assert(await exists('apps/chat-service/src/domain/constants'));
    assert(await exists('apps/chat-service/src/domain/entities'));
    assert(await exists('apps/chat-service/src/domain/services'));
    assert(await exists('apps/chat-service/src/infrastructure'));
    assert(await exists('apps/chat-service/src/infrastructure/adapters'));
    assert(await exists('apps/chat-service/src/infrastructure/persistence'));
    assert(await exists('apps/chat-service/src/controllers'));
    assert(await exists('apps/chat-service/src/dto'));
    assert(await exists('apps/chat-service/src/dto/requests'));
    assert(await exists('apps/chat-service/src/dto/responses'));
    assert(await exists('apps/chat-service/src/ports'));

    // Verify no files were created (only directories)
    const entries = [];
    for await (const entry of Deno.readDir('apps/chat-service/src')) {
      if (entry.isFile) {
        entries.push(entry.name);
      }
    }
    assertEquals(entries.length, 0, 'No files should be created by init command');
  } finally {
    await cleanupTestApps();
  }
});

Deno.test('CLI - init command preserves existing files and folders', async () => {
  await cleanupTestApps();

  try {
    // Create app directory with existing content
    await Deno.mkdir('apps/user-service/src/existing', { recursive: true });
    await Deno.writeTextFile('apps/user-service/src/main.ts', 'console.log("existing main");');
    await Deno.writeTextFile(
      'apps/user-service/src/user-service.module.ts',
      'export class UserServiceModule {}',
    );

    const result = await runCLI(['user-service', 'init']);

    assertEquals(result.code, 0);
    assert(result.stdout.includes('Successfully initialized service structure for "user-service"'));

    // Check that new directories were created
    assert(await exists('apps/user-service/src/application'));
    assert(await exists('apps/user-service/src/domain'));
    assert(await exists('apps/user-service/src/infrastructure'));

    // Check that existing files and directories are preserved
    assert(await exists('apps/user-service/src/existing'));
    assert(await exists('apps/user-service/src/main.ts'));
    assert(await exists('apps/user-service/src/user-service.module.ts'));

    const mainContent = await Deno.readTextFile('apps/user-service/src/main.ts');
    assertEquals(mainContent, 'console.log("existing main");');

    const moduleContent = await Deno.readTextFile('apps/user-service/src/user-service.module.ts');
    assertEquals(moduleContent, 'export class UserServiceModule {}');
  } finally {
    await cleanupTestApps();
  }
});

Deno.test('CLI - create commands work after init', async () => {
  await cleanupTestApps();

  try {
    // Create app and initialize structure
    await Deno.mkdir('apps/order-service/src', { recursive: true });
    await runCLI(['order-service', 'init']);

    // Generate components after initialization
    const commandResult = await runCLI(['order-service', 'create', 'command', 'CreateOrder']);
    const eventResult = await runCLI(['order-service', 'create', 'event', 'OrderCreated']);
    const queryResult = await runCLI(['order-service', 'create', 'query', 'GetOrderById']);

    // Check all commands succeeded
    assertEquals(commandResult.code, 0);
    assertEquals(eventResult.code, 0);
    assertEquals(queryResult.code, 0);

    // Verify files were created in correct locations
    assert(
      await exists(
        'apps/order-service/src/application/commands/create-order/create-order.command.ts',
      ),
    );
    assert(
      await exists(
        'apps/order-service/src/application/events/order-created/order-created.event.ts',
      ),
    );
    assert(
      await exists(
        'apps/order-service/src/application/queries/get-order-by-id/get-order-by-id.query.ts',
      ),
    );

    // Check that index files were created with correct content
    const commandsIndex = await Deno.readTextFile(
      'apps/order-service/src/application/commands/index.ts',
    );
    assert(commandsIndex.includes('CreateOrderCommandHandler'));

    const eventsIndex = await Deno.readTextFile(
      'apps/order-service/src/application/events/index.ts',
    );
    assert(eventsIndex.includes('OrderCreatedEventHandler'));

    const queriesIndex = await Deno.readTextFile(
      'apps/order-service/src/application/queries/index.ts',
    );
    assert(queriesIndex.includes('GetOrderByIdQueryHandler'));
  } finally {
    await cleanupTestApps();
  }
});

Deno.test('CLI - successfully creates service', async () => {
  await cleanupTestApps();

  try {
    const result = await runCLI(['test-service', 'create', 'service', 'UserValidator']);

    assertEquals(result.code, 0);
    assert(
      result.stdout.includes(
        'Successfully generated service "UserValidator" for app "test-service"',
      ),
    );

    // Verify files were created
    assert(
      await exists(
        'apps/test-service/src/domain/services/user-validator/user-validator.service.ts',
      ),
    );
    assert(await exists('apps/test-service/src/domain/services/index.ts'));
  } finally {
    await cleanupTestApps();
  }
});

Deno.test('CLI - successfully creates usecase', async () => {
  await cleanupTestApps();

  try {
    const result = await runCLI(['test-service', 'create', 'usecase', 'ProcessUserRegistration']);

    assertEquals(result.code, 0);
    assert(
      result.stdout.includes(
        'Successfully generated usecase "ProcessUserRegistration" for app "test-service"',
      ),
    );

    // Verify files were created
    assert(
      await exists(
        'apps/test-service/src/application/usecases/process-user-registration/process-user-registration.usecase.ts',
      ),
    );
    assert(await exists('apps/test-service/src/application/usecases/index.ts'));
  } finally {
    await cleanupTestApps();
  }
});

Deno.test('CLI - fails with unsupported type for new types', async () => {
  await cleanupTestApps();

  try {
    const result = await runCLI(['test-service', 'create', 'repository', 'UserRepository']);

    assertEquals(result.code, 1);
    assert(
      result.stderr.includes('Type must be "event", "command", "query", "service", or "usecase"'),
    );
  } finally {
    await cleanupTestApps();
  }
});

Deno.test('CLI - init command works with kebab-case and PascalCase app names', async () => {
  await cleanupTestApps();

  try {
    // Test with kebab-case name
    await Deno.mkdir('apps/auth-service/src', { recursive: true });
    const kebabResult = await runCLI(['auth-service', 'init']);
    assertEquals(kebabResult.code, 0);
    assert(await exists('apps/auth-service/src/application'));

    // Test with PascalCase name (should still work)
    await Deno.mkdir('apps/UserManagement/src', { recursive: true });
    const pascalResult = await runCLI(['UserManagement', 'init']);
    assertEquals(pascalResult.code, 0);
    assert(await exists('apps/UserManagement/src/application'));
  } finally {
    await cleanupTestApps();
  }
});
