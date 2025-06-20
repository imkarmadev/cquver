![nestjs](https://img.shields.io/badge/Nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![alacritty](https://img.shields.io/badge/alacritty-F46D01?style=for-the-badge&logo=alacritty&logoColor=white)

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

We welcome contributions! This project uses a **protected branch workflow** with automatic releases.

### 🛡️ Protected Branch Workflow

- 🚫 **No direct pushes to `main`** - All changes must go through pull requests
- ✅ **Automatic validation** - PRs are validated for code quality and conventional commits
- 🚀 **Auto-releases** - Merging PRs automatically creates releases based on commit types
- 📝 **Smart versioning** - Semantic version bumps based on conventional commit analysis

### Quick Setup for Contributors

```bash
# Set up git configuration and commit helpers
deno task setup-git
```

### Development Workflow

```bash
# 1. Create feature branch and PR
deno task create-pr

# 2. Make commits using conventional format
deno task commit
# or use the git alias
git cc

# 3. Push changes (triggers PR validation)
git push

# 4. Get PR reviewed and merged (triggers automatic release)
```

### 📚 Documentation

- 🛡️ **Protected Branch Workflow:** [`docs/PROTECTED_BRANCH_WORKFLOW.md`](docs/PROTECTED_BRANCH_WORKFLOW.md)
- 📋 **Conventional Commits:** [`docs/CONVENTIONAL_COMMITS_CHEATSHEET.md`](docs/CONVENTIONAL_COMMITS_CHEATSHEET.md)
- 🚀 **Release Process:** [`docs/RELEASE_WORKFLOW.md`](docs/RELEASE_WORKFLOW.md)
- 🤝 **Contributing Guide:** [`CONTRIBUTING.md`](CONTRIBUTING.md)

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

### Available Commands

#### **📋 General Commands**

```bash
cquver --help, -h           # Show help information
cquver --version, -v        # Show version information
cquver <app_name> init      # Initialize DDD/Clean Architecture structure
```

#### **🎯 CQRS Components (Application Layer)**

```bash
# Commands - Write operations that change state
cquver <app_name> create command <CommandName>

# Queries - Read operations that return data  
cquver <app_name> create query <QueryName>

# Events - Domain events for side effects
cquver <app_name> create event <EventName>
```

#### **🏗️ Architecture Components**

```bash
# Domain Services - Business logic in domain layer
cquver <app_name> create service <ServiceName>

# Use Cases - Application services that orchestrate operations
cquver <app_name> create usecase <UseCaseName>
```

### Command Parameters

- `<app_name>`: The name of your NestJS application (must exist in apps/ directory)
- `<type>`: One of `command`, `query`, `event`, `service`, or `usecase`
- `<name>`: The name of the component (will be automatically normalized)

### Complete Examples

#### **🚀 Project Setup**

```bash
# 1. Create NestJS app
nest generate app user-service

# 2. Initialize DDD structure
cquver user-service init
```

#### **📝 CQRS Components**

```bash
# Commands (write operations)
cquver user-service create command CreateUser
cquver user-service create command UpdateUserProfile
cquver user-service create command DeleteUser

# Queries (read operations)
cquver user-service create query GetUserById
cquver user-service create query FindUsersByRole
cquver user-service create query GetUserStatistics

# Events (domain events)
cquver user-service create event UserCreated
cquver user-service create event UserProfileUpdated
cquver user-service create event UserDeleted
```

#### **🏛️ Domain & Application Components**

```bash
# Domain Services (business logic)
cquver user-service create service UserValidator
cquver user-service create service PasswordHasher
cquver user-service create service EmailNotificationService

# Use Cases (application orchestration)
cquver user-service create usecase RegisterNewUser
cquver user-service create usecase ProcessUserVerification
cquver user-service create usecase GenerateUserReport
```

#### **🎨 Naming Flexibility**

```bash
# All naming formats are automatically normalized:
cquver user-service create command create-user        # ✅ kebab-case
cquver user-service create command CreateUser         # ✅ PascalCase  
cquver user-service create command create_user        # ✅ snake_case
cquver user-service create event user-profile-updated # ✅ All become proper format
```

## Generated Structure

### Complete Project Structure

After running `cquver your-service init`, you get this DDD/Clean Architecture structure:

```
apps/your-service/
└── src/
    ├── application/                        # 🏗️ Application Layer (CQRS + Use Cases)
    │   ├── commands/                       # 📝 Command handlers (write operations)
    │   ├── events/                         # 📡 Event handlers (side effects)  
    │   ├── queries/                        # 🔍 Query handlers (read operations)
    │   └── usecases/                       # 🎯 Use cases (orchestration logic)
    ├── controllers/                        # 🎮 API Controllers (presentation layer)
    ├── domain/                             # 🏛️ Domain Layer (business core)
    │   ├── constants/                      # 📋 Domain constants
    │   ├── entities/                       # 🏗️ Domain entities
    │   └── services/                       # ⚙️ Domain services (business logic)
    ├── dto/                                # 📦 Data Transfer Objects
    │   ├── requests/                       # ⬇️ Request DTOs
    │   └── responses/                      # ⬆️ Response DTOs
    ├── infrastructure/                     # 🔧 Infrastructure Layer
    │   ├── adapters/                       # 🔌 External service adapters
    │   └── persistence/                    # 💾 Database persistence
    └── ports/                              # 🚪 Repository interfaces
```

### Example: Complete Service Generation

```bash
# Initialize structure
cquver user-service init

# Generate CQRS components
cquver user-service create command CreateUser
cquver user-service create event UserCreated  
cquver user-service create query GetUserById

# Generate architecture components
cquver user-service create service UserValidator
cquver user-service create usecase RegisterUser
```

**Results in:**

```
apps/user-service/src/
├── application/
│   ├── commands/
│   │   ├── create-user/
│   │   │   ├── create-user.command.ts       # Command class
│   │   │   ├── create-user.handler.ts       # Command handler
│   │   │   └── index.ts                     # Exports
│   │   └── index.ts                         # CommandHandlers array
│   ├── events/
│   │   ├── user-created/
│   │   │   ├── user-created.event.ts        # Event class  
│   │   │   ├── user-created.handler.ts      # Event handler
│   │   │   └── index.ts                     # Exports
│   │   └── index.ts                         # EventHandlers array
│   ├── queries/
│   │   ├── get-user-by-id/
│   │   │   ├── get-user-by-id.query.ts      # Query class
│   │   │   ├── get-user-by-id.handler.ts    # Query handler  
│   │   │   └── index.ts                     # Exports
│   │   └── index.ts                         # QueryHandlers array
│   └── usecases/
│       ├── register-user/
│       │   ├── register-user.usecase.ts     # Use case class
│       │   └── index.ts                     # Exports
│       └── index.ts                         # UseCases array
├── domain/
│   └── services/
│       ├── user-validator/
│       │   ├── user-validator.service.ts    # Domain service
│       │   └── index.ts                     # Exports
│       └── index.ts                         # Services array
└── user-service.module.ts                   # Auto-updated main module
```

### Generated Files & Templates

#### 📝 CQRS Components

**Command Example:**

```typescript
// create-user.command.ts
import { ICommand } from '@nestjs/cqrs';

export class CreateUserCommand implements ICommand {
  constructor(
    // Add your command properties here
    // public readonly data: CreateUserDto,
  ) {}
}
```

```typescript
// create-user.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    // Inject your repositories, services, etc.
  ) {}

  async execute(command: CreateUserCommand): Promise<any> {
    // Handle the command here
  }
}
```

**Event Example:**

```typescript
// user-created.event.ts
import { IEvent } from '@nestjs/cqrs';

export class UserCreatedEvent implements IEvent {
  constructor(
    // Add your event properties here
    // public readonly userId: string,
  ) {}
}
```

**Query Example:**

```typescript
// get-user-by-id.query.ts
import { IQuery } from '@nestjs/cqrs';

export class GetUserByIdQuery implements IQuery {
  constructor(
    // Add your query properties here
    // public readonly userId: string,
  ) {}
}
```

#### 🏗️ Architecture Components

**Domain Service Example:**

```typescript
// user-validator.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserValidatorService {
  constructor(
    // Inject your repositories, other services, etc.
    // private readonly userRepository: UserRepository,
  ) {}

  // Add your domain business logic methods here
}
```

**Use Case Example:**

```typescript
// register-user.usecase.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    // Inject your repositories, domain services, etc.
    // private readonly userRepository: UserRepository,
    // private readonly userValidator: UserValidatorService,
  ) {}

  // Add your use case application logic here
}
```

#### 📋 Auto-Generated Index Arrays

**Handler Arrays (CQRS):**

```typescript
// commands/index.ts
import { CreateUserCommandHandler } from './create-user';
export const CommandHandlers = [CreateUserCommandHandler];
export { CreateUserCommand } from './create-user';

// events/index.ts
import { UserCreatedEventHandler } from './user-created';
export const EventHandlers = [UserCreatedEventHandler];
export { UserCreatedEvent } from './user-created';

// queries/index.ts
import { GetUserByIdQueryHandler } from './get-user-by-id';
export const QueryHandlers = [GetUserByIdQueryHandler];
export { GetUserByIdQuery } from './get-user-by-id';
```

**Service Arrays (Architecture):**

```typescript
// domain/services/index.ts
import { UserValidatorService } from './user-validator';
export const Services = [UserValidatorService];
export { UserValidatorService };

// application/usecases/index.ts
import { RegisterUserUseCase } from './register-user';
export const UseCases = [RegisterUserUseCase];
export { RegisterUserUseCase };
```

#### 🏗️ Auto-Generated Module

```typescript
// user-service.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './application/commands';
import { EventHandlers } from './application/events';
import { QueryHandlers } from './application/queries';
import { UseCases } from './application/usecases';
import { Services } from './domain/services';

@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers, // CQRS command handlers
    ...EventHandlers, // CQRS event handlers
    ...QueryHandlers, // CQRS query handlers
    ...UseCases, // Application use cases
    ...Services, // Domain services
  ],
})
export class UserServiceModule {}
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

## 🔄 Automated Workflow

This project now uses an automated workflow for quality assurance and releases:

- **PR Validation**: All pull requests are automatically validated for code quality and conventional commits
- **Auto Release**: Merging to main automatically creates releases based on conventional commit analysis
- **Version Bumping**: Semantic versioning is handled automatically based on commit types

### Workflow Test Status

✅ Workflow validation system implemented and tested
✅ Version utility functions added for semantic versioning support
✅ Enhanced CLI help text with emojis and better formatting
✅ Added version command for easy version checking

### New CLI Features

- **Version Command**: Use `cquver --version` or `cquver -v` to check the current version
- **Enhanced Help**: Improved help text with better organization and visual clarity
- **User-Friendly Interface**: Emoji icons and clear sections for better usability

### New Utility Functions

The toolkit now includes utility functions for version management:

- **`formatVersion(major, minor, patch, prerelease?)`** - Format semantic version strings
- **`parseVersion(version)`** - Parse version strings into components
- **`isValidConventionalCommit(message)`** - Validate conventional commit format

These utilities support the automated release workflow and can be used in your own projects.
