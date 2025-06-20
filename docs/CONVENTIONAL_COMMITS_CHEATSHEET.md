# Conventional Commits Cheatsheet

Quick reference for writing conventional commits in the cquver project.

## 📝 Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## 🎯 Types

| Type       | Emoji | Description      | Example                                   |
| ---------- | ----- | ---------------- | ----------------------------------------- |
| `feat`     | ✨    | New feature      | `feat(cli): add --dry-run flag`           |
| `fix`      | 🐛    | Bug fix          | `fix(templates): correct import path`     |
| `docs`     | 📚    | Documentation    | `docs: update README examples`            |
| `style`    | 💄    | Code style       | `style: fix indentation`                  |
| `refactor` | ♻️    | Code refactoring | `refactor(utils): simplify naming logic`  |
| `perf`     | ⚡    | Performance      | `perf(generator): optimize file creation` |
| `test`     | ✅    | Tests            | `test: add integration tests`             |
| `build`    | 👷    | Build system     | `build: update Deno to v2.4.0`            |
| `ci`       | 💚    | CI/CD            | `ci: add release automation`              |
| `chore`    | 🔧    | Maintenance      | `chore: update dependencies`              |
| `revert`   | ⏪    | Revert commit    | `revert: "feat: add feature X"`           |

## 🎯 Scopes (Optional)

- `cli` - Command-line interface
- `generator` - Code generation functionality
- `templates` - Template files
- `module` - Module management
- `utils` - Utility functions
- `tests` - Test-related changes
- `docs` - Documentation changes
- `ci` - CI/CD configuration
- `build` - Build system changes

## 🚨 Breaking Changes

Add `!` after type/scope and explain in footer:

```
feat(cli)!: change command syntax

BREAKING CHANGE: The CLI now uses `create` instead of `generate`.
```

## 💡 Examples

### ✅ Good Examples

```bash
feat(generator): add support for NestJS guards
fix(templates): correct import path in command template
docs: update README with installation instructions
test(integration): add end-to-end test for init command
chore(deps): update Deno to v2.4.0
perf(utils): optimize file path resolution
style: fix eslint warnings
refactor(cli): extract command parsing logic
ci: add automated changelog generation
build: configure cross-platform compilation
```

### ❌ Bad Examples

```bash
# Too vague
fix: stuff

# Not imperative mood
fixed: bug in templates

# Too long (over 72 characters)
feat(generator): add support for generating complex NestJS applications with multiple modules and services

# Capitalized first letter
feat: Add new feature

# Period at the end
fix: remove trailing comma.

# Not following conventional format
update readme file
```

## 🛠️ Tools

### Interactive Commit Helper

```bash
deno task commit   # or git cc
```

### Git Commit Template

```bash
git commit   # Shows helpful template
```

### Validation

- Commit messages are automatically validated
- Pre-push hooks ensure code quality

## 📚 References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Full guidelines
- [RELEASE_WORKFLOW.md](./RELEASE_WORKFLOW.md) - Release process
