# Contributing to cquver

Thank you for your interest in contributing to cquver! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- [Deno](https://deno.land/) v2.3.x or later
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/cquver.git
   cd cquver
   ```
3. Run tests to ensure everything works:
   ```bash
   deno task test
   ```

## 📝 Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) to automate changelog generation and semantic versioning.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scopes (optional)

- **cli**: Command-line interface
- **generator**: Code generation functionality
- **templates**: Template files
- **module**: Module management
- **utils**: Utility functions
- **tests**: Test-related changes

### Examples

```bash
# Feature commits
feat(generator): add support for NestJS guards
feat(cli): add --dry-run flag for preview mode

# Bug fixes
fix(templates): correct import path in command template
fix(module): handle empty module files properly

# Documentation
docs: add usage examples to README
docs(api): document command generation options

# Breaking changes
feat(cli)!: change default output directory structure
```

### Breaking Changes

Breaking changes should be indicated by an `!` after the type/scope and explained in the footer:

```
feat(cli)!: change command syntax

BREAKING CHANGE: The CLI now uses `create` instead of `generate` as the main command.
```

## 🧪 Testing

Before submitting changes:

1. **Run all checks**:
   ```bash
   deno task check
   ```

2. **Run specific test types**:
   ```bash
   deno task test:unit        # Unit tests
   deno task test:integration # Integration tests
   deno task test:e2e        # End-to-end tests
   ```

3. **Format code**:
   ```bash
   deno fmt
   ```

4. **Lint code**:
   ```bash
   deno lint
   ```

## 📦 Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Write tests** for new functionality

4. **Update documentation** if needed

5. **Follow conventional commits** for your commit messages

6. **Run all checks**:
   ```bash
   deno task check
   ```

7. **Push your branch**:
   ```bash
   git push origin feat/your-feature-name
   ```

8. **Create a Pull Request** with:
   - Clear description of changes
   - Reference to any related issues
   - Screenshots/examples if applicable

## 🏗️ Project Structure

```
cquver/
├── cli.ts                 # Main CLI entry point
├── src/
│   ├── generator.service.ts    # Core generation logic
│   ├── module-manager.service.ts # Module file management
│   ├── templates/              # Code templates
│   └── utils.ts               # Utility functions
├── scripts/
│   └── generate-changelog.ts  # Changelog automation
├── tests/                     # Test files
└── .github/workflows/         # CI/CD workflows
```

## 🔄 Development Workflow

### Adding a New Feature

1. **Write tests first** (TDD approach)
2. **Implement the feature**
3. **Update templates** if needed
4. **Update documentation**
5. **Test thoroughly**

### Fixing a Bug

1. **Write a test** that reproduces the bug
2. **Fix the bug**
3. **Ensure the test passes**
4. **Check for regressions**

## 📋 Code Style

- **Use TypeScript** for type safety
- **Follow Deno conventions**
- **Use meaningful variable names**
- **Add JSDoc comments** for public APIs
- **Keep functions small and focused**
- **Use async/await** instead of promises

## 🚦 Pre-commit Hooks

The project uses pre-push hooks that run:

- Code formatting check
- Linting
- Type checking
- All tests

These hooks prevent pushing code that doesn't meet quality standards.

## 📖 Changelog

Changes are automatically documented in `CHANGELOG.md` using conventional commits. You don't need to manually update the changelog - it's generated during releases.

## 🐛 Reporting Issues

When reporting issues, please include:

1. **Clear description** of the problem
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Environment details** (OS, Deno version)
5. **Minimal reproduction case** if possible

## 💡 Feature Requests

For feature requests, please:

1. **Check existing issues** first
2. **Describe the use case** clearly
3. **Explain why** this feature would be valuable
4. **Provide examples** if possible

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 🙏 Questions?

Feel free to open an issue for questions about contributing or reach out to the maintainers.

Thank you for contributing to cquver! 🎉
