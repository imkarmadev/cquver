import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  ensureSuffix,
  formatVersion,
  generateHandlerName,
  isValidConventionalCommit,
  parseVersion,
  toKebabCase,
  toPascalCase,
} from '../src/utils.ts';

Deno.test('toPascalCase - converts various formats to PascalCase', () => {
  // Basic conversions
  assertEquals(toPascalCase('user-created'), 'UserCreated');
  assertEquals(toPascalCase('user_created'), 'UserCreated');
  assertEquals(toPascalCase('user created'), 'UserCreated');
  assertEquals(toPascalCase('user-created-event'), 'UserCreatedEvent');

  // Already PascalCase should remain unchanged
  assertEquals(toPascalCase('UserCreated'), 'UserCreated');
  assertEquals(toPascalCase('UserCreatedEvent'), 'UserCreatedEvent');

  // Single words
  assertEquals(toPascalCase('user'), 'User');
  assertEquals(toPascalCase('event'), 'Event');

  // Edge cases
  assertEquals(toPascalCase(''), '');
  assertEquals(toPascalCase('a'), 'A');
  assertEquals(toPascalCase('a-b'), 'AB');
});

Deno.test('toKebabCase - converts PascalCase to kebab-case', () => {
  // Basic conversions
  assertEquals(toKebabCase('UserCreated'), 'user-created');
  assertEquals(toKebabCase('UserCreatedEvent'), 'user-created-event');
  assertEquals(toKebabCase('GetOrdersByUser'), 'get-orders-by-user');

  // Single words
  assertEquals(toKebabCase('User'), 'user');
  assertEquals(toKebabCase('Event'), 'event');

  // Already kebab-case
  assertEquals(toKebabCase('user-created'), 'user-created');
  assertEquals(toKebabCase('user'), 'user');

  // Edge cases
  assertEquals(toKebabCase(''), '');
  assertEquals(toKebabCase('A'), 'a');
  assertEquals(toKebabCase('AB'), 'ab');

  // Complex cases
  assertEquals(toKebabCase('XMLHttpRequest'), 'xml-http-request');
  assertEquals(toKebabCase('JSONData'), 'json-data');
});

Deno.test('ensureSuffix - adds suffix if not present', () => {
  // Add suffix when missing
  assertEquals(ensureSuffix('UserCreated', 'Event'), 'UserCreatedEvent');
  assertEquals(ensureSuffix('CreateUser', 'Command'), 'CreateUserCommand');
  assertEquals(ensureSuffix('GetOrder', 'Query'), 'GetOrderQuery');

  // Don't add if already present (case insensitive)
  assertEquals(ensureSuffix('UserCreatedEvent', 'Event'), 'UserCreatedEvent');
  assertEquals(ensureSuffix('UserCreatedEVENT', 'Event'), 'UserCreatedEVENT');
  assertEquals(ensureSuffix('usercreatedevent', 'Event'), 'usercreatedevent');

  // Edge cases
  assertEquals(ensureSuffix('', 'Event'), 'Event');
  assertEquals(ensureSuffix('User', ''), 'User');
});

Deno.test('generateHandlerName - creates handler name from class name', () => {
  assertEquals(generateHandlerName('UserCreatedEvent'), 'UserCreatedEventHandler');
  assertEquals(generateHandlerName('CreateUserCommand'), 'CreateUserCommandHandler');
  assertEquals(generateHandlerName('GetOrderQuery'), 'GetOrderQueryHandler');

  // Edge cases
  assertEquals(generateHandlerName(''), 'Handler');
  assertEquals(generateHandlerName('A'), 'AHandler');
});

Deno.test('isValidConventionalCommit - validates conventional commit format', () => {
  // Valid commits
  assertEquals(isValidConventionalCommit('feat: add new feature'), true);
  assertEquals(isValidConventionalCommit('fix(auth): resolve login issue'), true);
  assertEquals(isValidConventionalCommit('docs: update README'), true);
  assertEquals(isValidConventionalCommit('feat!: breaking change'), true);
  assertEquals(isValidConventionalCommit('fix(scope)!: breaking fix'), true);

  // Invalid commits
  assertEquals(isValidConventionalCommit('invalid commit message'), false);
  assertEquals(isValidConventionalCommit('add new feature'), false);
  assertEquals(isValidConventionalCommit(''), false);
  assertEquals(isValidConventionalCommit('unknown: some change'), false);
});

Deno.test('formatVersion - formats semantic version strings correctly', () => {
  assertEquals(formatVersion(1, 0, 0), '1.0.0');
  assertEquals(formatVersion(2, 5, 10), '2.5.10');
  assertEquals(formatVersion(1, 0, 0, 'beta.1'), '1.0.0-beta.1');
  assertEquals(formatVersion(3, 2, 1, 'alpha'), '3.2.1-alpha');
  assertEquals(formatVersion(0, 1, 0, 'rc.2'), '0.1.0-rc.2');
});

Deno.test('parseVersion - parses semantic version strings correctly', () => {
  // Valid versions
  assertEquals(parseVersion('1.0.0'), {
    major: 1,
    minor: 0,
    patch: 0,
  });

  assertEquals(parseVersion('2.5.10'), {
    major: 2,
    minor: 5,
    patch: 10,
  });

  assertEquals(parseVersion('1.0.0-beta.1'), {
    major: 1,
    minor: 0,
    patch: 0,
    prerelease: 'beta.1',
  });

  assertEquals(parseVersion('3.2.1-alpha'), {
    major: 3,
    minor: 2,
    patch: 1,
    prerelease: 'alpha',
  });

  // Invalid versions
  assertEquals(parseVersion('invalid'), null);
  assertEquals(parseVersion('1.0'), null);
  assertEquals(parseVersion('1.0.0.0'), null);
  assertEquals(parseVersion(''), null);
});
