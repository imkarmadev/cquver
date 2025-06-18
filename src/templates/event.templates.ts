export const eventTemplate = (className: string) =>
  `import { IEvent } from '@nestjs/cqrs';

export class ${className} implements IEvent {
  constructor(
    // Add your event properties here
    // public readonly id: string,
    // public readonly userId: string,
  ) {}
}
`;

export const eventHandlerTemplate = (eventName: string, handlerName: string, fileName: string) =>
  `import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ${eventName} } from './${fileName}.event';

@EventsHandler(${eventName})
export class ${handlerName} implements IEventHandler<${eventName}> {
  async handle(event: ${eventName}): Promise<void> {
    // Handle the event here
    console.log('Handling event:', event);
    
    // Example: Send notification, update read model, etc.
  }
}
`;

export const eventIndexTemplate = (eventName: string, handlerName: string, fileName: string) =>
  `export { ${eventName} } from './${fileName}.event';
export { ${handlerName} } from './${fileName}.handler';
`;
