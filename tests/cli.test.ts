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
  assert(result.stderr.includes('Only "create" action is supported'));
});

Deno.test('CLI - fails with unsupported type', async () => {
  const result = await runCLI(['test-service', 'create', 'service', 'TestService']);

  assertEquals(result.code, 1);
  assert(result.stderr.includes('Type must be "event", "command", or "query"'));
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
      await exists('apps/src/test-service/application/events/user-created/user-created.event.ts'),
    );
    assert(
      await exists('apps/src/test-service/application/events/user-created/user-created.handler.ts'),
    );
    assert(await exists('apps/src/test-service/application/events/index.ts'));
    assert(await exists('apps/src/test-service/src/test-service.module.ts'));
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
      await exists('apps/src/auth-service/application/commands/create-user/create-user.command.ts'),
    );
    assert(
      await exists('apps/src/auth-service/application/commands/create-user/create-user.handler.ts'),
    );
    assert(await exists('apps/src/auth-service/application/commands/index.ts'));
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
        'apps/src/order-service/application/queries/get-orders-by-user/get-orders-by-user.query.ts',
      ),
    );
    assert(
      await exists(
        'apps/src/order-service/application/queries/get-orders-by-user/get-orders-by-user.handler.ts',
      ),
    );
    assert(await exists('apps/src/order-service/application/queries/index.ts'));
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
    assert(await exists('apps/src/test-service/application/events/xml-http-request-completed'));
    assert(await exists('apps/src/test-service/application/commands/update-user-profile'));
    assert(await exists('apps/src/test-service/application/queries/find-users-by-role'));

    // Check class names are correctly preserved/generated
    const eventFile = await Deno.readTextFile(
      'apps/src/test-service/application/events/xml-http-request-completed/xml-http-request-completed.event.ts',
    );
    assert(eventFile.includes('export class XMLHttpRequestCompletedEvent'));

    const commandFile = await Deno.readTextFile(
      'apps/src/test-service/application/commands/update-user-profile/update-user-profile.command.ts',
    );
    assert(commandFile.includes('export class UpdateUserProfileCommand'));
  } finally {
    await cleanupTestApps();
  }
});
