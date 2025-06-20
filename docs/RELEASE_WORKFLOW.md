# Release Workflow with Automated Changelog

This document explains how the automated changelog generation works in the cquver project.

## 🔄 How It Works

### 1. **Conventional Commits**

The project uses [Conventional Commits](https://www.conventionalcommits.org/) to automatically generate changelogs. Each commit message should follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Examples:**

```bash
feat(generator): add support for NestJS guards
fix(templates): correct import path in command template
docs: update README with new examples
```

### 2. **Automated Changelog Generation**

When you create a release (by pushing a git tag), the GitHub Actions workflow automatically:

1. **Analyzes commits** since the last release
2. **Generates changelog entries** based on conventional commit types
3. **Updates CHANGELOG.md** with the new version
4. **Includes changelog content** in the GitHub release notes
5. **Commits the updated changelog** back to the main branch

### 3. **Manual Changelog Generation**

You can also generate changelogs manually:

```bash
# Generate changelog for a specific version
deno task changelog v1.2.0

# Check what would be generated (dry run)
deno task changelog:check v1.2.0
```

## 📋 Commit Types and Changelog Sections

| Commit Type | Changelog Section         | Example                                   |
| ----------- | ------------------------- | ----------------------------------------- |
| `feat`      | ✨ Features               | `feat(cli): add --dry-run flag`           |
| `fix`       | 🐛 Bug Fixes              | `fix(templates): correct import path`     |
| `docs`      | 📚 Documentation          | `docs: update README examples`            |
| `perf`      | ⚡ Performance            | `perf(generator): optimize file creation` |
| `refactor`  | ♻️ Code Refactoring       | `refactor(utils): simplify naming logic`  |
| `test`      | ✅ Tests                  | `test: add integration tests`             |
| `build`     | 👷 Build System           | `build: update Deno to v2.4.0`            |
| `ci`        | 💚 Continuous Integration | `ci: add release automation`              |
| `chore`     | 🔧 Chores                 | `chore: update dependencies`              |
| `revert`    | ⏪ Reverts                | `revert: "feat: add feature X"`           |

## 🚀 Creating a Release

### Method 1: Git Tag (Recommended)

```bash
# Create and push a version tag
git tag v1.2.0
git push origin v1.2.0
```

### Method 2: GitHub Actions Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Release** workflow
3. Click **Run workflow**
4. Enter version (e.g., `v1.2.0`)
5. Click **Run workflow**

## 📖 What Happens During Release

1. **Tests run** to ensure code quality
2. **Binaries are built** for all platforms
3. **Changelog is generated** from commits since last release
4. **GitHub release is created** with:
   - Auto-generated release notes
   - Binary attachments
   - SHA256 checksums
   - Changelog content
5. **CHANGELOG.md is updated** and committed back to main branch
6. **Install script is updated** with new version

## ⚠️ Breaking Changes

For breaking changes, use the `!` syntax:

```bash
feat(cli)!: change command syntax

BREAKING CHANGE: The CLI now uses `create` instead of `generate` as the main command.
```

This will create a special section in the changelog:

```markdown
### ⚠ BREAKING CHANGES

- **cli**: change command syntax ([abc1234])
```

## 📝 Best Practices

### Commit Messages

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### Scopes

Use these scopes when relevant:

- `cli` - Command-line interface changes
- `generator` - Code generation functionality
- `templates` - Template file changes
- `module` - Module management features
- `utils` - Utility function changes
- `tests` - Test-related changes

### Examples of Good Commit Messages

```bash
feat(generator): add support for custom templates
fix(cli): handle missing app directory gracefully
docs(api): add JSDoc comments to public methods
test(integration): add end-to-end test for init command
chore(deps): update Deno to v2.4.0
```

## 🔍 Viewing Changelog

The changelog is available in several places:

1. **CHANGELOG.md** file in the repository
2. **GitHub release notes** for each version
3. **Manual generation** using `deno task changelog`

## 🛠️ Troubleshooting

### No Commits Found

If no commits are found since the last release:

- Check that you have commits since the last git tag
- Verify the tag exists: `git tag -l`

### Invalid Changelog Entry

If a commit doesn't appear in the changelog:

- Check that it follows conventional commit format
- Non-conventional commits are categorized as "chores"

### Permission Issues

If the changelog commit fails:

- Check that the GitHub Actions has write permissions
- Verify the `GITHUB_TOKEN` is properly configured

## 📚 References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
