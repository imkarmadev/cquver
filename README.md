<div align="center">

![cquver Logo](assets/logo.png)

# cquver - NestJS DDD/CQRS Boilerplate Generator

_A Deno CLI tool that generates boilerplate code for NestJS monorepos using Domain-Driven Design (DDD) and Command Query Responsibility Segregation (CQRS) patterns._

</div>

## Features

- ✅ **Initialize folder structure** for DDD/Clean Architecture pattern
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

## 📋 Changelog

All notable changes are documented in [CHANGELOG.md](CHANGELOG.md). The changelog is automatically generated from conventional commits during releases.

## 🤝 Contributing

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated changelog generation. We provide tools to make this easy:

### Quick Setup for Contributors

```bash
# Set up git configuration and commit helpers
deno task setup-git
```

### Making Commits

```bash
# Interactive conventional commit helper (recommended)
deno task commit
# or use the git alias
git cc

# Regular commit with template
git commit
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Installation

### Prerequisites

- [Deno](https://deno.land/) installed on your system

### Option 1: Quick Install Script (Recommended)

```bash
# Install latest version automatically
curl -fsSL https://raw.githubusercontent.com/imkarmadev/cquver/main/install.sh | bash

# Install specific version
curl -fsSL https://raw.githubusercontent.com/imkarmadev/cquver/main/install.sh | bash -s -- --version=v1.0.0

# Install to custom directory
curl -fsSL https://raw.githubusercontent.com/imkarmadev/cquver/main/install.sh | bash -s -- --install-dir=~/bin
```

### Option 2: Download Pre-built Binary

```bash
# Linux x64
curl -fsSL https://github.com/imkarmadev/cquver/releases/latest/download/cquver-linux-x64 -o cquver
chmod +x cquver

# macOS ARM64 (Apple Silicon)
curl -fsSL https://github.com/imkarmadev/cquver/releases/latest/download/cquver-macos-arm64 -o cquver
chmod +x cquver
```

### Option 3: Build Manually (Development)

```bash
# Clone or download this repository
cd cquver

# Build the executable
deno task build

# Make it executable (Linux/macOS)
chmod +x cquver
```

### Option 4: Run Directly (No Build Required)

```bash
# Run without compiling (smallest footprint)
deno run --allow-read --allow-write --allow-env https://raw.githubusercontent.com/imkarmadev/cquver/main/cli.ts <args>

# Or locally
deno task dev <args>
```

### Install globally (optional)

```bash
# Move to a directory in your PATH
sudo mv cquver /usr/local/bin/
```

## Usage

### Initialize Service Structure

First, create your NestJS app using the NestJS CLI:

```bash
# Create the NestJS app first
nest generate app <service_name>
```

Then initialize the DDD/Clean Architecture folder structure:

```bash
cquver <app_name> init
```

### Generate Components

```bash
cquver <app_name> create <type> <n>
```

### Parameters

- `<app_name>`: The name of your NestJS application (must exist in apps/ directory)
- `<type>`: One of `event`, `command`, or `query`
- `<n>`: The name of the event/command/query (will be normalized)

### Examples

```bash
# Initialize service structure
cquver user-service init

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
apps/chat-service/
└── src/
    ├── application/                        # 🏗️ CQRS Application Layer
    │   ├── commands/                       # Command handlers (created when generating)
    │   ├── events/                         # Event handlers (created when generating)
    │   └── queries/                        # Query handlers (created when generating)
    ├── controllers/                        # 🎮 API Controllers
    ├── domain/                             # 🏛️ Domain Layer
    │   ├── constants/                      # Domain constants
    │   └── entities/                       # Domain entities
    ├── dto/                                # 📝 Data Transfer Objects
    │   ├── requests/                       # Request DTOs
    │   └── responses/                      # Response DTOs
    ├── infrastructure/                     # 🔧 Infrastructure Layer
    │   ├── adapters/                       # External adapters
    │   └── persistence/                    # Database persistence layer
    └── ports/                              # 🔌 Repository Interfaces

# Note: Additional files and folders (like mongodb/, test/, config files) 
# should be created using NestJS CLI or other specific commands as needed.
```

### Generated Files

#### Handler Arrays

The CLI automatically creates and maintains handler arrays in each type's index file:

```typescript
// apps/socket-service/src/application/commands/index.ts
import { DisconnectWebSocketCommandHandler } from './disconnect-web-socket';
import { UpdatePresenceStatusCommandHandler } from './update-presence-status';

export const CommandHandlers = [
  DisconnectWebSocketCommandHandler,
  UpdatePresenceStatusCommandHandler,
];
```

#### Auto-Generated Module

```typescript
// apps/socket-service/src/socket-service.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './application/commands';
import { EventHandlers } from './application/events';
import { QueryHandlers } from './application/queries';

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

## Testing

The project includes a comprehensive test suite covering:

- ✅ **Unit tests** - Utility functions and string operations
- ✅ **Template tests** - NestJS code generation
- ✅ **Integration tests** - File system operations and structure creation
- ✅ **End-to-end tests** - Complete CLI workflow testing

### Running Tests

```bash
# Run all tests
deno task test

# Run specific test categories
deno task test:unit        # Fast unit tests (~50ms)
deno task test:integration # File system integration tests (~200ms)
deno task test:e2e        # End-to-end CLI tests (~500ms)

# Watch mode (re-runs on file changes)
deno task test:watch
```

### Test Coverage

The test suite validates:

- String manipulation utilities (PascalCase ↔ kebab-case conversion)
- Template generation for all CQRS types (events, commands, queries)
- Directory structure creation and file naming
- Multiple handler management and deduplication
- Module file updates while preserving existing providers
- CLI argument validation and comprehensive error handling
- Complex naming scenarios (e.g., `XMLHttpRequest` → `xml-http-request`)
- Plural folder naming (commands/, events/, queries/)

All tests include automatic cleanup to prevent pollution between test runs.

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
