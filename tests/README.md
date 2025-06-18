# Test Suite

This directory contains comprehensive tests for the cquver CLI tool, covering unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── utils.test.ts           # Unit tests for utility functions
├── templates.test.ts       # Tests for template generation
├── generator.test.ts       # Integration tests for generator service
├── module-manager.test.ts  # Tests for module manager functionality
├── cli.test.ts            # End-to-end CLI tests
└── README.md              # This file
```

## Running Tests

### All Tests
```bash
deno task test
```

### Specific Test Categories
```bash
# Unit tests only (fast, no file system operations)
deno task test:unit

# Integration tests (tests services with file system)
deno task test:integration

# End-to-end tests (tests actual CLI commands)
deno task test:e2e

# Watch mode (re-runs tests on file changes)
deno task test:watch
```

### Individual Test Files
```bash
# Run specific test file
deno test --allow-read --allow-write tests/utils.test.ts

# Run with verbose output
deno test --allow-read --allow-write --verbose tests/utils.test.ts
```

## Test Coverage

### Unit Tests (`utils.test.ts`)
- ✅ `toPascalCase()` - String format conversions
- ✅ `toKebabCase()` - PascalCase to kebab-case conversion  
- ✅ `ensureSuffix()` - Adding type suffixes (Event, Command, Query)
- ✅ `generateHandlerName()` - Handler name generation

### Template Tests (`templates.test.ts`)
- ✅ Event templates (class & handler generation)
- ✅ Command templates (class & handler generation)
- ✅ Query templates (class & handler generation)
- ✅ Index template generation
- ✅ Correct NestJS decorators and imports

### Integration Tests (`generator.test.ts`)
- ✅ File and directory structure creation
- ✅ Correct file naming (kebab-case files, PascalCase classes)
- ✅ Multiple handlers in same type
- ✅ Generated file content validation
- ✅ Module file updates

### Module Manager Tests (`module-manager.test.ts`)
- ✅ Handler array generation
- ✅ Module file creation from scratch
- ✅ Preserving existing providers
- ✅ Multiple handlers management
- ✅ Correct import path generation

### End-to-End Tests (`cli.test.ts`)
- ✅ CLI argument validation
- ✅ Help command functionality
- ✅ Error handling for invalid inputs
- ✅ Complete workflow (CLI → files created)
- ✅ Complex naming scenarios
- ✅ Plural folder naming (commands, events, queries)

## Test Data Cleanup

Tests automatically clean up any temporary files and directories they create. The following directories are automatically removed after tests:
- `apps/` (integration test artifacts)
- `test-temp/` (module manager test artifacts)

## Writing New Tests

### Test Utilities Available
```typescript
// File system operations
import { exists } from 'https://deno.land/std@0.208.0/fs/exists.ts';

// Assertions
import { assertEquals, assert, assertStringIncludes } from 'https://deno.land/std@0.208.0/assert/mod.ts';

// Cleanup helpers (see existing tests for examples)
async function cleanupTestDir(path: string) { /* ... */ }
async function setupTestDir() { /* ... */ }
```

### Test Naming Convention
- Use descriptive test names: `'ComponentName - does specific thing'`
- Group related functionality in the same test file
- Use async/await for file system operations
- Always clean up test artifacts in `finally` blocks

## CI/CD Integration

These tests are designed to run in CI environments:
- No external dependencies required
- Automatic cleanup prevents test pollution
- Proper error codes for CI failure detection
- Comprehensive coverage of all functionality

## Performance

- **Unit tests**: ~50ms (pure logic, no I/O)
- **Integration tests**: ~200ms (file system operations)
- **E2E tests**: ~500ms (spawns CLI processes)
- **Total suite**: ~1s (all tests combined) 