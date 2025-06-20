#!/usr/bin/env deno run --allow-read --allow-run

interface ChangelogEntry {
  type: string;
  scope?: string;
  description: string;
  hash: string;
  breaking?: boolean;
}

interface ChangelogSection {
  [key: string]: ChangelogEntry[];
}

const COMMIT_TYPES = {
  feat: 'Features',
  fix: 'Bug Fixes',
  docs: 'Documentation',
  style: 'Styles',
  refactor: 'Code Refactoring',
  perf: 'Performance Improvements',
  test: 'Tests',
  build: 'Build System',
  ci: 'Continuous Integration',
  chore: 'Chores',
  revert: 'Reverts',
};

async function runCommand(cmd: string[]): Promise<string> {
  const process = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    stdout: 'piped',
    stderr: 'piped',
  });

  const { code, stdout } = await process.output();

  if (code !== 0) {
    throw new Error(`Command failed: ${cmd.join(' ')}`);
  }

  return new TextDecoder().decode(stdout).trim();
}

function parseCommit(commitLine: string): ChangelogEntry | null {
  const [hash, ...messageParts] = commitLine.split(' ');
  const message = messageParts.join(' ');

  // Parse conventional commit format: type(scope): description
  const conventionalRegex =
    /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^)]+\))?: (.+)$/;
  const match = message.match(conventionalRegex);

  if (!match) {
    // If not conventional format, categorize as chore
    return {
      type: 'chore',
      description: message,
      hash: hash.substring(0, 7),
    };
  }

  const [, type, scopeMatch, description] = match;
  const scope = scopeMatch ? scopeMatch.slice(1, -1) : undefined;
  const breaking = description.includes('BREAKING CHANGE') || description.includes('!');

  return {
    type,
    scope,
    description: breaking ? description.replace(/!/, '') : description,
    hash: hash.substring(0, 7),
    breaking,
  };
}

async function getCommitsSinceLastTag(): Promise<string[]> {
  try {
    // Get the last tag that is reachable from HEAD
    const lastTag = await runCommand(['git', 'describe', '--tags', '--abbrev=0', 'HEAD']);

    // Get commits since last tag
    const commits = await runCommand([
      'git',
      'log',
      `${lastTag}..HEAD`,
      '--oneline',
      '--no-merges',
    ]);

    return commits ? commits.split('\n').filter((line) => line.trim()) : [];
  } catch {
    try {
      // Fallback: get latest tag on current branch
      const allTags = await runCommand(['git', 'tag', '--merged', 'HEAD', '--sort=-version:refname']);
      const latestTag = allTags.split('\n')[0].trim();
      
      if (latestTag) {
        const commits = await runCommand([
          'git',
          'log',
          `${latestTag}..HEAD`,
          '--oneline',
          '--no-merges',
        ]);
        
        return commits ? commits.split('\n').filter((line) => line.trim()) : [];
      }
    } catch {
      // Ignore fallback errors
    }
    
    // If no tags exist, get all commits
    const commits = await runCommand(['git', 'log', '--oneline', '--no-merges']);
    return commits ? commits.split('\n').filter((line) => line.trim()) : [];
  }
}

function formatChangelog(version: string, entries: ChangelogEntry[], date: string): string {
  const sections: ChangelogSection = {};

  // Group entries by type
  entries.forEach((entry) => {
    const sectionKey = COMMIT_TYPES[entry.type as keyof typeof COMMIT_TYPES] || 'Other';
    if (!sections[sectionKey]) {
      sections[sectionKey] = [];
    }
    sections[sectionKey].push(entry);
  });

  let changelog = `## [${version}] - ${date}\n\n`;

  // Add breaking changes first if any
  const breakingChanges = entries.filter((e) => e.breaking);
  if (breakingChanges.length > 0) {
    changelog += `### ⚠ BREAKING CHANGES\n\n`;
    breakingChanges.forEach((entry) => {
      const scope = entry.scope ? `**${entry.scope}**: ` : '';
      changelog += `- ${scope}${entry.description} ([${entry.hash}])\n`;
    });
    changelog += '\n';
  }

  // Add other sections
  Object.entries(sections).forEach(([sectionName, sectionEntries]) => {
    if (sectionEntries.length > 0) {
      changelog += `### ${getEmoji(sectionName)} ${sectionName}\n\n`;
      sectionEntries.forEach((entry) => {
        const scope = entry.scope ? `**${entry.scope}**: ` : '';
        changelog += `- ${scope}${entry.description} ([${entry.hash}])\n`;
      });
      changelog += '\n';
    }
  });

  return changelog;
}

function getEmoji(sectionName: string): string {
  const emojiMap: { [key: string]: string } = {
    'Features': '✨',
    'Bug Fixes': '🐛',
    'Documentation': '📚',
    'Styles': '💄',
    'Code Refactoring': '♻️',
    'Performance Improvements': '⚡',
    'Tests': '✅',
    'Build System': '👷',
    'Continuous Integration': '💚',
    'Chores': '🔧',
    'Reverts': '⏪',
    'Other': '📦',
  };
  return emojiMap[sectionName] || '📦';
}

async function updateChangelog(_newVersion: string, newContent: string): Promise<void> {
  const changelogPath = 'CHANGELOG.md';
  let existingContent = '';

  try {
    existingContent = await Deno.readTextFile(changelogPath);
  } catch {
    // File doesn't exist, create header
    existingContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
  }

  // Insert new changelog entry after the header
  const lines = existingContent.split('\n');
  const headerEndIndex = lines.findIndex((line) => line.startsWith('## '));

  if (headerEndIndex === -1) {
    // No existing releases, add after header
    const headerEnd = lines.findIndex((line) => line.trim() === '') + 1;
    lines.splice(headerEnd, 0, newContent);
  } else {
    // Insert before first existing release
    lines.splice(headerEndIndex, 0, newContent);
  }

  await Deno.writeTextFile(changelogPath, lines.join('\n'));
}

async function main() {
  const args = Deno.args;

  // Parse command line arguments
  const isDryRun = args.includes('--dry-run');
  const versionArg = args.find(arg => !arg.startsWith('--'));

  if (!versionArg && !isDryRun) {
    console.error('Usage: deno run generate-changelog.ts <version> [--dry-run]');
    console.error('Example: deno run generate-changelog.ts v1.2.0');
    console.error('         deno run generate-changelog.ts v1.2.0 --dry-run');
    console.error('         deno run generate-changelog.ts --dry-run  # Preview without version');
    Deno.exit(1);
  }

  const newVersion = versionArg ? versionArg.replace(/^v/, '') : 'preview'; // Remove 'v' prefix if present
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  console.log(`📝 ${isDryRun ? 'Previewing' : 'Generating'} changelog for version ${newVersion}...`);

  try {
    const commits = await getCommitsSinceLastTag();

    if (commits.length === 0) {
      console.log('🔍 No new commits found since last release.');

      // Check if there's unreleased content to include in this version
      if (!isDryRun) {
        const changelogPath = 'CHANGELOG.md';
        try {
          const existingContent = await Deno.readTextFile(changelogPath);
          const unreleasedMatch = existingContent.match(/## \[Unreleased\]([\s\S]*?)(?=## \[|$)/);

          if (unreleasedMatch && unreleasedMatch[1].trim()) {
            console.log('📋 Found unreleased content, creating release entry...');

            // Create release entry from unreleased content
            const unreleasedContent = unreleasedMatch[1].trim();
            const releaseContent = `## [${newVersion}] - ${date}\n\n${unreleasedContent}\n\n`;

            // Replace unreleased section with new release and clean unreleased
            const updatedContent = existingContent
              .replace(/## \[Unreleased\][\s\S]*?(?=## \[|$)/, `## [Unreleased]\n\n${releaseContent}`)
              .replace(/\n{3,}/g, '\n\n'); // Clean up extra newlines

            await Deno.writeTextFile(changelogPath, updatedContent);
            console.log('✅ Changelog updated with unreleased content!');

            console.log('\n📖 New changelog entry:');
            console.log('─'.repeat(50));
            console.log(releaseContent);
            console.log('─'.repeat(50));
            return;
          }
        } catch {
          // Ignore if changelog doesn't exist
        }

        console.log('📝 No unreleased content found either.');
      } else {
        console.log('👀 Dry run mode - skipping unreleased content check');
      }
      return;
    }

    console.log(`📋 Found ${commits.length} commits to process...`);

    const entries: ChangelogEntry[] = [];

    commits.forEach((commit) => {
      const entry = parseCommit(commit);
      if (entry) {
        entries.push(entry);
      }
    });

    if (entries.length === 0) {
      console.log('📝 No valid changelog entries found.');
      return;
    }

    const changelogContent = formatChangelog(newVersion, entries, date);
    
    if (!isDryRun) {
      await updateChangelog(newVersion, changelogContent);
      console.log('✅ Changelog updated successfully!');
    } else {
      console.log('👀 Dry run - would update changelog with new entries');
    }

    console.log('\n📖 New changelog entry:');
    console.log('─'.repeat(50));
    console.log(changelogContent);
    console.log('─'.repeat(50));
  } catch (error) {
    console.error('❌ Error generating changelog:', error instanceof Error ? error.message : error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
