# Release Process

This document describes how to create releases for the cquver CLI.

## Automated Release Process

The project uses GitHub Actions to automatically build and release binaries for multiple platforms.

### 🚀 Creating a Release

#### Method 1: Git Tags (Recommended)

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

#### Method 2: Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Release** workflow
3. Click **Run workflow**
4. Enter version (e.g., `v1.0.0`)
5. Click **Run workflow**

### 📦 What Gets Built

The release workflow builds binaries for:

| Platform | Architecture          | Binary Name              |
| -------- | --------------------- | ------------------------ |
| Linux    | x64                   | `cquver-linux-x64`       |
| Linux    | ARM64                 | `cquver-linux-arm64`     |
| macOS    | x64 (Intel)           | `cquver-macos-x64`       |
| macOS    | ARM64 (Apple Silicon) | `cquver-macos-arm64`     |
| Windows  | x64                   | `cquver-windows-x64.exe` |

### 🔄 Workflow Steps

1. **Test Phase**: Runs all tests (unit, integration, e2e)
2. **Build Phase**: Compiles binaries for all platforms
3. **Release Phase**: Creates GitHub release with:
   - Auto-generated release notes
   - Binary attachments
   - SHA256 checksums
4. **Update Phase**: Updates `install.sh` with new version

### 📄 Release Notes

Release notes are automatically generated and include:

- Feature highlights
- Installation instructions for each platform
- Usage examples
- Links to documentation

### 🔐 Security

- All binaries include SHA256 checksums
- Release workflow requires write permissions
- Checksums are verified during installation

## Manual Release (Fallback)

If automated release fails, you can create a manual release:

```bash
# Build all platforms locally
deno compile --allow-read --allow-write --allow-env --target x86_64-unknown-linux-gnu --output cquver-linux-x64 cli.ts
deno compile --allow-read --allow-write --allow-env --target aarch64-unknown-linux-gnu --output cquver-linux-arm64 cli.ts
deno compile --allow-read --allow-write --allow-env --target x86_64-apple-darwin --output cquver-macos-x64 cli.ts
deno compile --allow-read --allow-write --allow-env --target aarch64-apple-darwin --output cquver-macos-arm64 cli.ts
deno compile --allow-read --allow-write --allow-env --target x86_64-pc-windows-msvc --output cquver-windows-x64.exe cli.ts

# Generate checksums
sha256sum cquver-* > checksums.txt

# Create GitHub release manually and upload files
```

## Testing Releases

### Pre-release Testing

```bash
# Test locally built binary
./cquver --help
./cquver test-service create event TestEvent

# Test downloaded binary
curl -fsSL https://github.com/USER/REPO/releases/download/v1.0.0/cquver-linux-x64 -o cquver-test
chmod +x cquver-test
./cquver-test --help
```

### Installation Testing

```bash
# Test install script
curl -fsSL https://raw.githubusercontent.com/USER/REPO/main/install.sh | bash

# Test specific version
curl -fsSL https://raw.githubusercontent.com/USER/REPO/main/install.sh | bash -s -- --version=v1.0.0
```

## Version Naming

Follow semantic versioning:

- `v1.0.0` - Major release
- `v1.1.0` - Minor release (new features)
- `v1.1.1` - Patch release (bug fixes)
- `v1.0.0-beta.1` - Pre-release

## Release Checklist

Before creating a release:

- [ ] All tests pass (`deno task test`)
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated (if exists)
- [ ] Version follows semantic versioning
- [ ] Local build works (`deno task build`)
- [ ] Binary runs correctly (`./cquver --help`)

## Troubleshooting

### Build Failures

- Check Deno version compatibility
- Verify all dependencies are accessible
- Check cross-compilation target support

### Release Failures

- Ensure `GITHUB_TOKEN` has correct permissions
- Check GitHub Actions quota/limits
- Verify tag format matches trigger pattern

### Install Script Issues

- Update `REPO` variable in `install.sh`
- Test with different platforms
- Check binary naming consistency

## Continuous Integration

The CI workflow (`.github/workflows/ci.yml`) runs on:

- Every push to `main`
- Every pull request to `main`

CI includes:

- Linting and formatting checks
- Cross-platform testing
- Build verification
- End-to-end testing
