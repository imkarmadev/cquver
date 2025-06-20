# Protected Branch Workflow

This document explains the protected branch workflow implemented for the cquver project, including automatic releases on PR merges.

## 🎯 Overview

The `main` branch is protected to ensure code quality and enable automatic releases. All changes must go through pull requests, which are automatically validated and create releases when merged.

## 🛡️ Branch Protection Rules

The `main` branch has the following protections:

### Required Status Checks

- ✅ Code formatting (`deno fmt --check`)
- ✅ Lint checks (`deno lint`)
- ✅ Type checking (`deno check cli.ts`)
- ✅ All tests pass (`deno task test`)
- ✅ Conventional commit format validation

### Required Reviews

- 🔍 At least 1 review required
- 🚫 No direct pushes to main allowed
- 🔄 PR must be up to date before merging

### Additional Rules

- 🏷️ Branch must be up to date before merging
- 🚫 Force pushes are disabled
- 🚫 Administrators cannot bypass these rules

## 🔄 Development Workflow

### 1. Create Feature Branch

Use the interactive branch creation tool:

```bash
deno task create-pr
```

This will:

- 🌿 Create a properly named branch (e.g., `feat/auth-system`)
- 📤 Push the branch to origin
- 🔄 Create a pull request with proper template
- 🎯 Show version impact analysis

**Manual workflow:**

```bash
# Switch to main and pull latest
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/your-feature-name

# Push branch
git push -u origin feat/your-feature-name

# Create PR manually on GitHub
```

### 2. Make Changes

- 📝 Make your changes
- ✅ Test locally: `deno task test`
- 🎨 Format code: `deno fmt`
- 🔍 Check lint: `deno lint`

### 3. Commit Changes

Use conventional commit format:

```bash
# Interactive commit helper (recommended)
deno task commit

# Or manual commits
git add .
git commit -m "feat: add user authentication system"
git push
```

### 4. PR Validation

When you push changes or create a PR, the system automatically:

- ✅ Validates all code quality checks
- 📋 Analyzes commit messages for conventional format
- 🎯 Determines version impact (major/minor/patch)
- 💬 Comments on PR with validation results

### 5. Review & Merge

- 👀 Get required reviews
- ✅ Ensure all checks pass
- 🔄 Merge the PR (use "Squash and merge" recommended)

### 6. Automatic Release

When a PR is merged to `main`:

- 🏷️ System analyzes all commits in the PR
- 📈 Determines version bump based on conventional commits:
  - `feat!`: Major version (breaking change)
  - `feat`: Minor version (new feature)
  - `fix`: Patch version (bug fix)
  - Other types: Patch version
- 🚀 Creates a git tag automatically
- 🎁 GitHub Actions builds and publishes the release
- 📝 Updates changelog with PR content

## 📋 Commit Types & Version Impact

| Commit Type | Example                    | Version Bump | Description      |
| ----------- | -------------------------- | ------------ | ---------------- |
| `feat!`     | `feat!: redesign API`      | **MAJOR**    | Breaking changes |
| `fix!`      | `fix!: change return type` | **MAJOR**    | Breaking bug fix |
| `feat`      | `feat: add user login`     | **MINOR**    | New features     |
| `fix`       | `fix: resolve memory leak` | **PATCH**    | Bug fixes        |
| `docs`      | `docs: update README`      | **PATCH**    | Documentation    |
| `style`     | `style: fix formatting`    | **PATCH**    | Code style       |
| `refactor`  | `refactor: simplify auth`  | **PATCH**    | Code refactoring |
| `perf`      | `perf: optimize queries`   | **PATCH**    | Performance      |
| `test`      | `test: add unit tests`     | **PATCH**    | Tests            |
| `chore`     | `chore: update deps`       | **PATCH**    | Maintenance      |

## 🚫 Blocked Operations

The following operations are **not allowed** on the `main` branch:

```bash
# ❌ Direct push to main
git push origin main

# ❌ Force push
git push --force origin main

# ❌ Merge without PR
git checkout main
git merge feature-branch
```

## 🆘 Emergency Procedures

### Hot Fixes

For urgent production fixes:

1. **Create hotfix branch from main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug-fix
   ```

2. **Make minimal fix and test:**
   ```bash
   # Make the fix
   deno task test  # Ensure tests pass
   git add .
   git commit -m "fix: resolve critical security issue"
   git push -u origin hotfix/critical-bug-fix
   ```

3. **Create PR with "hotfix" label:**
   - Mark as urgent/high priority
   - Request immediate review
   - Fast-track through validation

4. **Merge and auto-release:**
   - PR creates patch release automatically
   - Hotfix is deployed immediately

### Bypassing Protection (Admin Only)

In extreme emergencies, administrators can:

1. **Temporarily disable branch protection**
2. **Make direct changes to main**
3. **Re-enable protection immediately**
4. **Create follow-up PR to document the change**

⚠️ **Warning:** This should be used only for critical production outages.

## 🔧 Tools & Commands

### Available Commands

```bash
# Create feature branch and PR
deno task create-pr

# Interactive commit with validation
deno task commit

# Check all quality gates locally
deno task check

# Fix formatting and run checks
deno task check:fix

# Manual release (for testing)
deno task release

# Setup git hooks and config
deno task setup-git
```

### Pre-push Hooks

Local pre-push hooks run the same checks as CI:

```bash
# Automatically runs before git push:
# - Code formatting check
# - Lint validation
# - Type checking
# - Test suite
```

### GitHub CLI Integration

Install GitHub CLI for enhanced workflow:

```bash
# Install GitHub CLI
# https://cli.github.com/

# Login to GitHub
gh auth login

# View PR status
gh pr status

# Review PRs
gh pr review <number>

# Merge PR
gh pr merge <number> --squash
```

## 📊 Release Analytics

### Version Tracking

Every release includes:

- 📈 **Version bump rationale**
- 📋 **Commit analysis**
- 👤 **Contributors**
- 🔗 **PR references**
- 📝 **Automated changelog**

### Release Notes

Auto-generated release notes include:

- 🆕 **What's New** (from changelog)
- 📦 **Installation instructions**
- ✅ **Verification steps**
- 🔧 **Usage examples**

## 🤝 Best Practices

### PR Guidelines

- ✅ **Keep PRs small and focused**
- 📝 **Use descriptive titles and descriptions**
- 🎯 **Link to issues when applicable**
- ✅ **Ensure all checks pass before requesting review**
- 💬 **Respond to review feedback promptly**

### Commit Guidelines

- 📋 **Follow conventional commit format**
- 🎯 **Use clear, descriptive messages**
- 🔍 **Atomic commits (one logical change per commit)**
- 📝 **Reference issue numbers when applicable**

### Review Guidelines

- 👀 **Review code for functionality and style**
- ✅ **Verify tests cover new functionality**
- 📚 **Check documentation updates**
- 🔍 **Validate conventional commit format**
- 💭 **Provide constructive feedback**

## 🆘 Troubleshooting

### Common Issues

**PR validation fails:**

```bash
# Fix locally first
deno task check:fix
git add .
git commit -m "style: fix formatting and linting"
git push
```

**Commit message format invalid:**

```bash
# Use interactive commit helper
deno task commit

# Or fix manually
git commit --amend -m "feat: add proper conventional commit message"
git push --force-with-lease
```

**Branch out of date:**

```bash
# Update your branch
git checkout main
git pull origin main
git checkout your-feature-branch
git rebase main
git push --force-with-lease
```

**Need to update PR:**

```bash
# Make changes and push
git add .
git commit -m "fix: address review feedback"
git push
# PR updates automatically
```

### Getting Help

- 📚 **Read conventional commits guide:** `docs/CONVENTIONAL_COMMITS_CHEATSHEET.md`
- 🔄 **Check release workflow:** `docs/RELEASE_WORKFLOW.md`
- 🤝 **Contributing guide:** `CONTRIBUTING.md`
- 🆘 **Open an issue for questions**

---

This workflow ensures high code quality, consistent releases, and smooth collaboration while maintaining the ability to move quickly when needed.
