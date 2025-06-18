import { assertEquals, assertThrows } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { ensureSuffix, generateHandlerName, toKebabCase, toPascalCase } from '../src/utils.ts';

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
