#!/usr/bin/env deno run --allow-read --allow-write --allow-run

interface CommitAnalysis {
  type: string;
  scope?: string;
  description: string;
  hash: string;
  breaking: boolean;
  raw: string;
}

interface VersionBump {
  current: string;
  suggested: string;
  level: 'major' | 'minor' | 'patch';
  reason: string;
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text: string, color: string): string {
  return `${color}${text}${colors.reset}`;
}

async function runCommand(
  cmd: string[],
): Promise<{ success: boolean; output?: string; error?: string }> {
  try {
    const process = new Deno.Command(cmd[0], {
      args: cmd.slice(1),
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stdout, stderr } = await process.output();

    return {
      success: code === 0,
      output: new TextDecoder().decode(stdout).trim(),
      error: new TextDecoder().decode(stderr).trim(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function getCurrentVersion(): Promise<string | null> {
  // Try to get the latest git tag
  const result = await runCommand(['git', 'describe', '--tags', '--abbrev=0']);

  if (result.success && result.output) {
    return result.output;
  }

  return null;
}

async function getCommitsSinceLastRelease(): Promise<string[]> {
  const currentVersion = await getCurrentVersion();

  let cmd: string[];
  if (currentVersion) {
    cmd = ['git', 'log', `${currentVersion}..HEAD`, '--oneline', '--no-merges'];
  } else {
    // No previous release, get all commits
    cmd = ['git', 'log', '--oneline', '--no-merges'];
  }

  const result = await runCommand(cmd);

  if (!result.success || !result.output) {
    return [];
  }

  return result.output.split('\n').filter((line) => line.trim());
}

function parseCommit(commitLine: string): CommitAnalysis {
  const [hash, ...messageParts] = commitLine.split(' ');
  const message = messageParts.join(' ');

  // Parse conventional commit format: type(scope): description
  const conventionalRegex =
    /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^)]+\))?: (.+)$/;
  const match = message.match(conventionalRegex);

  if (!match) {
    // If not conventional format, treat as chore
    return {
      type: 'chore',
      description: message,
      hash: hash.substring(0, 7),
      breaking: false,
      raw: commitLine,
    };
  }

  const [, type, scopeMatch, description] = match;
  const scope = scopeMatch ? scopeMatch.slice(1, -1) : undefined;
  const breaking = description.includes('BREAKING CHANGE') || description.includes('!') ||
    type.includes('!');

  return {
    type: type.replace('!', ''),
    scope,
    description: breaking ? description.replace(/!/, '') : description,
    hash: hash.substring(0, 7),
    breaking,
    raw: commitLine,
  };
}

function determineVersionBump(commits: CommitAnalysis[], currentVersion: string): VersionBump {
  let hasMajor = false;
  let hasMinor = false;
  let hasPatch = false;

  const reasons: string[] = [];

  for (const commit of commits) {
    if (commit.breaking) {
      hasMajor = true;
      reasons.push(
        `Breaking change: ${commit.type}${
          commit.scope ? `(${commit.scope})` : ''
        }: ${commit.description}`,
      );
    } else if (commit.type === 'feat') {
      hasMinor = true;
      reasons.push(`New feature: ${commit.description}`);
    } else if (commit.type === 'fix') {
      hasPatch = true;
      reasons.push(`Bug fix: ${commit.description}`);
    }
  }

  // Determine version bump level
  let level: 'major' | 'minor' | 'patch';
  if (hasMajor) {
    level = 'major';
  } else if (hasMinor) {
    level = 'minor';
  } else if (hasPatch || commits.length > 0) {
    level = 'patch';
  } else {
    level = 'patch'; // Default to patch if no commits
  }

  const suggested = bumpVersion(currentVersion, level);
  const reason = reasons.length > 0 ? reasons[0] : 'No significant changes detected';

  return {
    current: currentVersion,
    suggested,
    level,
    reason,
  };
}

function bumpVersion(version: string, level: 'major' | 'minor' | 'patch'): string {
  // Remove 'v' prefix if present
  const cleanVersion = version.replace(/^v/, '');
  const parts = cleanVersion.split('.').map(Number);

  // Ensure we have at least 3 parts (major.minor.patch)
  while (parts.length < 3) {
    parts.push(0);
  }

  const [major, minor, patch] = parts;

  switch (level) {
    case 'major':
      return `v${major + 1}.0.0`;
    case 'minor':
      return `v${major}.${minor + 1}.0`;
    case 'patch':
      return `v${major}.${minor}.${patch + 1}`;
    default:
      return `v${major}.${minor}.${patch + 1}`;
  }
}

function groupCommitsByType(commits: CommitAnalysis[]): Record<string, CommitAnalysis[]> {
  const groups: Record<string, CommitAnalysis[]> = {};

  for (const commit of commits) {
    const key = commit.breaking ? 'BREAKING CHANGES' : commit.type;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(commit);
  }

  return groups;
}

async function prompt(message: string): Promise<string> {
  const buf = new Uint8Array(1024);
  await Deno.stdout.write(new TextEncoder().encode(message));
  const n = await Deno.stdin.read(buf) ?? 0;
  return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

async function confirm(message: string): Promise<boolean> {
  const answer = await prompt(colorize(`${message} (y/N): `, colors.yellow));
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

function displayCommitSummary(commits: CommitAnalysis[]): void {
  console.log(colorize('\n📋 Commits since last release:', colors.cyan));
  console.log(colorize('─'.repeat(60), colors.cyan));

  const groups = groupCommitsByType(commits);

  // Show breaking changes first
  if (groups['BREAKING CHANGES']) {
    console.log(colorize('\n⚠️  BREAKING CHANGES:', colors.red));
    for (const commit of groups['BREAKING CHANGES']) {
      const scope = commit.scope ? `(${commit.scope})` : '';
      console.log(
        colorize(`  • ${commit.type}${scope}: ${commit.description} (${commit.hash})`, colors.red),
      );
    }
    delete groups['BREAKING CHANGES'];
  }

  // Show features
  if (groups['feat']) {
    console.log(colorize('\n✨ Features:', colors.green));
    for (const commit of groups['feat']) {
      const scope = commit.scope ? `(${commit.scope})` : '';
      console.log(colorize(`  • ${scope} ${commit.description} (${commit.hash})`, colors.green));
    }
    delete groups['feat'];
  }

  // Show fixes
  if (groups['fix']) {
    console.log(colorize('\n🐛 Bug Fixes:', colors.yellow));
    for (const commit of groups['fix']) {
      const scope = commit.scope ? `(${commit.scope})` : '';
      console.log(colorize(`  • ${scope} ${commit.description} (${commit.hash})`, colors.yellow));
    }
    delete groups['fix'];
  }

  // Show other types
  const otherTypes = [
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'build',
    'ci',
    'chore',
    'revert',
  ];
  for (const type of otherTypes) {
    if (groups[type]) {
      console.log(colorize(`\n📦 ${type.charAt(0).toUpperCase() + type.slice(1)}:`, colors.blue));
      for (const commit of groups[type]) {
        const scope = commit.scope ? `(${commit.scope})` : '';
        console.log(colorize(`  • ${scope} ${commit.description} (${commit.hash})`, colors.blue));
      }
    }
  }
}

async function createRelease(version: string): Promise<boolean> {
  console.log(colorize(`\n🚀 Creating release ${version}...`, colors.cyan));

  // Create and push tag
  const tagResult = await runCommand(['git', 'tag', version]);
  if (!tagResult.success) {
    console.log(colorize(`❌ Failed to create tag: ${tagResult.error}`, colors.red));
    return false;
  }

  const pushResult = await runCommand(['git', 'push', 'origin', version]);
  if (!pushResult.success) {
    console.log(colorize(`❌ Failed to push tag: ${pushResult.error}`, colors.red));
    return false;
  }

  console.log(colorize(`✅ Release ${version} created and pushed!`, colors.green));
  console.log(
    colorize(`🔗 GitHub Actions will automatically build and publish the release.`, colors.blue),
  );

  return true;
}

async function main(): Promise<void> {
  console.log(colorize('🎯 Release Preparation Tool', colors.bright + colors.cyan));
  console.log(colorize('Analyzing commits to suggest the next version...\n', colors.cyan));

  // Check if we're in a git repository
  const gitCheck = await runCommand(['git', 'rev-parse', '--git-dir']);
  if (!gitCheck.success) {
    console.log(colorize('❌ Not in a git repository.', colors.red));
    Deno.exit(1);
  }

  // Get current version
  const currentVersion = await getCurrentVersion();
  if (!currentVersion) {
    console.log(
      colorize('⚠️  No previous releases found. This will be the first release.', colors.yellow),
    );
    const firstVersion = 'v1.0.0';
    const shouldCreate = await confirm(`Create first release as ${firstVersion}?`);

    if (shouldCreate) {
      await createRelease(firstVersion);
    }
    return;
  }

  console.log(colorize(`📌 Current version: ${currentVersion}`, colors.blue));

  // Get commits since last release
  const commits = await getCommitsSinceLastRelease();

  if (commits.length === 0) {
    console.log(colorize('🔍 No new commits since last release.', colors.yellow));
    return;
  }

  console.log(colorize(`📝 Found ${commits.length} commits since ${currentVersion}`, colors.green));

  // Parse commits
  const parsedCommits = commits.map(parseCommit);

  // Display commit summary
  displayCommitSummary(parsedCommits);

  // Analyze version bump
  const versionBump = determineVersionBump(parsedCommits, currentVersion);

  console.log(colorize('\n🎯 Version Analysis:', colors.cyan));
  console.log(colorize('─'.repeat(40), colors.cyan));
  console.log(colorize(`Current version: ${versionBump.current}`, colors.blue));
  console.log(colorize(`Suggested version: ${versionBump.suggested}`, colors.green));
  console.log(colorize(`Bump level: ${versionBump.level.toUpperCase()}`, colors.yellow));
  console.log(colorize(`Primary reason: ${versionBump.reason}`, colors.magenta));

  // Explain version bump logic
  console.log(colorize('\n💡 Version bump logic:', colors.cyan));
  console.log(
    colorize('  • MAJOR: Breaking changes (feat!, fix!, etc. with BREAKING CHANGE)', colors.red),
  );
  console.log(colorize('  • MINOR: New features (feat)', colors.yellow));
  console.log(colorize('  • PATCH: Bug fixes (fix) and other changes', colors.green));

  // Ask for confirmation
  const shouldProceed = await confirm(`\nCreate release ${versionBump.suggested}?`);

  if (shouldProceed) {
    const success = await createRelease(versionBump.suggested);

    if (success) {
      console.log(colorize('\n📋 Next steps:', colors.cyan));
      console.log(colorize('  1. Monitor GitHub Actions for build completion', colors.blue));
      console.log(colorize('  2. Check the generated release notes', colors.blue));
      console.log(colorize('  3. Update any documentation if needed', colors.blue));
    }
  } else {
    console.log(colorize('\n❌ Release creation cancelled.', colors.yellow));
    console.log(colorize('\n💡 You can also create a custom version:', colors.cyan));
    console.log(colorize('  git tag v1.2.3 && git push origin v1.2.3', colors.blue));
  }
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(colorize(`❌ Error: ${message}`, colors.red));
    Deno.exit(1);
  });
}
