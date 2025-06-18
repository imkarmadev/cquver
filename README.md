# cquver - NestJS DDD/CQRS Boilerplate Generator

A Deno CLI tool that generates boilerplate code for NestJS monorepos using Domain-Driven Design (DDD) and Command Query Responsibility Segregation (CQRS) patterns.

## Features

- ✅ Generate **Events** with handlers
- ✅ Generate **Commands** with handlers  
- ✅ Generate **Queries** with handlers
- ✅ Automatic directory structure creation
- ✅ Proper TypeScript templates with NestJS decorators
- ✅ Index files for clean exports
- ✅ Smart naming conventions (PascalCase for classes, kebab-case for files)
- ✅ **Auto-generated handler arrays** (`CommandHandlers`, `EventHandlers`, `QueryHandlers`)
- ✅ **Automatic module file updates** with provider arrays
- ✅ **Multi-handler management** - automatically maintains handler collections

## Installation

### Prerequisites
- [Deno](https://deno.land/) installed on your system

### Option 1: Quick Install Script
```bash
# Clone and install in one command
git clone <your-repo-url> && cd cquver && ./install.sh
```

### Option 2: Build Manually
```bash
# Clone or download this repository
cd cquver

# Build the executable
deno task build

# Make it executable (Linux/macOS)
chmod +x cquver
```

> **Note**: The compiled binary (`cquver`) is not included in the repository due to its large size (~77MB). You need to build it locally using the command above.

### Option 3: Run Directly (No Build Required)
```bash
# Run without compiling (smallest footprint)
deno run --allow-read --allow-write --allow-env https://raw.githubusercontent.com/<your-repo>/main/cli.ts <args>

# Or locally
deno task dev <args>
```

### Install globally (optional)
```bash
# Move to a directory in your PATH
sudo mv cquver /usr/local/bin/
```

## Usage

```bash
cquver <app_name> create <type> <name>
```

### Parameters
- `<app_name>`: The name of your NestJS application
- `<type>`: One of `event`, `command`, or `query`  
- `<name>`: The name of the event/command/query (will be normalized)

### Examples

```bash
# Generate an event
cquver user-service create event UserCreated
cquver user-service create event user-updated-event

# Generate a command  
cquver auth-service create command CreateUser
cquver auth-service create command authenticate-user-command

# Generate a query
cquver order-service create query GetOrder
cquver order-service create query find-orders-by-user-query
```

## Generated Structure

For example, running:
```bash
cquver socket-service create event ConnectWebSocket
cquver socket-service create command DisconnectWebSocket
cquver socket-service create query GetConnectionStatus
```

Will create:
```
apps/src/socket-service/
├── application/
│   ├── event/
│   │   ├── connect-web-socket/
│   │   │   ├── connect-web-socket.event.ts
│   │   │   ├── connect-web-socket.handler.ts
│   │   │   └── index.ts
│   │   └── index.ts                    # ✨ EventHandlers array
│   ├── command/
│   │   ├── disconnect-web-socket/
│   │   │   ├── disconnect-web-socket.command.ts
│   │   │   ├── disconnect-web-socket.handler.ts
│   │   │   └── index.ts
│   │   └── index.ts                    # ✨ CommandHandlers array
│   └── query/
│       ├── get-connection-status/
│       │   ├── get-connection-status.query.ts
│       │   ├── get-connection-status.handler.ts
│       │   └── index.ts
│       └── index.ts                    # ✨ QueryHandlers array
└── src/
    └── socket-service.module.ts        # ✨ Auto-updated with providers
```

### Generated Files

#### Handler Arrays
The CLI automatically creates and maintains handler arrays in each type's index file:

```typescript
// apps/src/socket-service/application/command/index.ts
import { DisconnectWebSocketCommandHandler } from './disconnect-web-socket';
import { UpdatePresenceStatusCommandHandler } from './update-presence-status';

export const CommandHandlers = [
  DisconnectWebSocketCommandHandler,
  UpdatePresenceStatusCommandHandler,
];
```

#### Auto-Generated Module
```typescript
// apps/src/socket-service/src/socket-service.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './application/command';
import { EventHandlers } from './application/event';
import { QueryHandlers } from './application/query';

@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class SocketServiceModule {}
```

#### Event Example
```typescript
// user-created-event.event.ts
import { IEvent } from '@nestjs/cqrs';

export class UserCreatedEvent implements IEvent {
  constructor(
    // Add your event properties here
    // public readonly id: string,
    // public readonly userId: string,
  ) {}
}
```

```typescript
// user-created-event.handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from './user-created-event.event';

@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
  async handle(event: UserCreatedEvent): Promise<void> {
    // Handle the event here
    console.log('Handling event:', event);
    
    // Example: Send notification, update read model, etc.
  }
}
```

```typescript
// index.ts
export { UserCreatedEvent } from './user-created-event.event';
export { UserCreatedEventHandler } from './user-created-event.handler';
```

## Development

```bash
# Run in development mode
deno task dev <args>

# Example
deno task dev user-service create event UserCreated

# Format code
deno fmt

# Check types
deno check cli.ts
```

## Naming Conventions

The CLI automatically handles naming conventions:

- **Input**: `user-created`, `UserCreated`, `user_created` → **Output**: `UserCreatedEvent`
- **Files**: Always use kebab-case (`user-created-event.event.ts`)
- **Classes**: Always use PascalCase (`UserCreatedEvent`)
- **Directories**: Use kebab-case based on the original input name

## Project Structure

```
cquver/
├── cli.ts                      # Main CLI entry point
├── deno.json                   # Deno configuration
├── src/
│   ├── generator.service.ts    # Main generator logic
│   ├── utils.ts               # Utility functions
│   └── templates/
│       ├── event.templates.ts  # Event templates
│       ├── command.templates.ts # Command templates
│       └── query.templates.ts  # Query templates
└── README.md
```

## License

MIT 