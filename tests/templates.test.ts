import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  eventHandlerTemplate,
  eventIndexTemplate,
  eventTemplate,
} from '../src/templates/event.templates.ts';
import {
  commandHandlerTemplate,
  commandIndexTemplate,
  commandTemplate,
} from '../src/templates/command.templates.ts';
import {
  queryHandlerTemplate,
  queryIndexTemplate,
  queryTemplate,
} from '../src/templates/query.templates.ts';

Deno.test('eventTemplate - generates correct event class', () => {
  const result = eventTemplate('UserCreatedEvent');

  assertStringIncludes(result, "import { IEvent } from '@nestjs/cqrs';");
  assertStringIncludes(result, 'export class UserCreatedEvent implements IEvent');
  assertStringIncludes(result, 'constructor(');
  assertStringIncludes(result, '// Add your event properties here');
});

Deno.test('eventHandlerTemplate - generates correct event handler', () => {
  const result = eventHandlerTemplate(
    'UserCreatedEvent',
    'UserCreatedEventHandler',
    'user-created-event',
  );

  assertStringIncludes(result, "import { EventsHandler, IEventHandler } from '@nestjs/cqrs';");
  assertStringIncludes(result, "import { UserCreatedEvent } from './user-created-event.event';");
  assertStringIncludes(result, '@EventsHandler(UserCreatedEvent)');
  assertStringIncludes(
    result,
    'export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent>',
  );
  assertStringIncludes(result, 'async handle(event: UserCreatedEvent): Promise<void>');
});

Deno.test('eventIndexTemplate - generates correct event index exports', () => {
  const result = eventIndexTemplate(
    'UserCreatedEvent',
    'UserCreatedEventHandler',
    'user-created-event',
  );

  assertStringIncludes(result, "export { UserCreatedEvent } from './user-created-event.event';");
  assertStringIncludes(
    result,
    "export { UserCreatedEventHandler } from './user-created-event.handler';",
  );
});

Deno.test('commandTemplate - generates correct command class', () => {
  const result = commandTemplate('CreateUserCommand');

  assertStringIncludes(result, "import { ICommand } from '@nestjs/cqrs';");
  assertStringIncludes(result, 'export class CreateUserCommand implements ICommand');
  assertStringIncludes(result, 'constructor(');
  assertStringIncludes(result, '// Add your command properties here');
});

Deno.test('commandHandlerTemplate - generates correct command handler', () => {
  const result = commandHandlerTemplate(
    'CreateUserCommand',
    'CreateUserCommandHandler',
    'create-user-command',
  );

  assertStringIncludes(result, "import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';");
  assertStringIncludes(
    result,
    "import { CreateUserCommand } from './create-user-command.command';",
  );
  assertStringIncludes(result, '@CommandHandler(CreateUserCommand)');
  assertStringIncludes(
    result,
    'export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand>',
  );
  assertStringIncludes(result, 'async execute(command: CreateUserCommand): Promise<any>');
});

Deno.test('queryTemplate - generates correct query class', () => {
  const result = queryTemplate('GetOrderQuery');

  assertStringIncludes(result, "import { IQuery } from '@nestjs/cqrs';");
  assertStringIncludes(result, 'export class GetOrderQuery implements IQuery');
  assertStringIncludes(result, 'constructor(');
  assertStringIncludes(result, '// Add your query properties here');
});

Deno.test('queryHandlerTemplate - generates correct query handler', () => {
  const result = queryHandlerTemplate('GetOrderQuery', 'GetOrderQueryHandler', 'get-order-query');

  assertStringIncludes(result, "import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';");
  assertStringIncludes(result, "import { GetOrderQuery } from './get-order-query.query';");
  assertStringIncludes(result, '@QueryHandler(GetOrderQuery)');
  assertStringIncludes(
    result,
    'export class GetOrderQueryHandler implements IQueryHandler<GetOrderQuery>',
  );
  assertStringIncludes(result, 'async execute(query: GetOrderQuery): Promise<any>');
});
