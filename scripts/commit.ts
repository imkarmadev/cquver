#!/usr/bin/env deno run --allow-read --allow-write --allow-run

interface CommitType {
  type: string;
  emoji: string;
  description: string;
  title: string;
}

const COMMIT_TYPES: CommitType[] = [
  {
    type: 'feat',
    emoji: '✨',
    title: 'Features',
    description: 'A new feature',
  },
  {
    type: 'fix',
    emoji: '🐛',
    title: 'Bug Fixes',
    description: 'A bug fix',
  },
  {
    type: 'docs',
    emoji: '📚',
    title: 'Documentation',
    description: 'Documentation only changes',
  },
  {
    type: 'style',
    emoji: '💄',
    title: 'Styles',
    description: 'Changes that do not affect the meaning of the code',
  },
  {
    type: 'refactor',
    emoji: '♻️',
    title: 'Code Refactoring',
    description: 'A code change that neither fixes a bug nor adds a feature',
  },
  {
    type: 'perf',
    emoji: '⚡',
    title: 'Performance Improvements',
    description: 'A code change that improves performance',
  },
  {
    type: 'test',
    emoji: '✅',
    title: 'Tests',
    description: 'Adding missing tests or correcting existing tests',
  },
  {
    type: 'build',
    emoji: '👷',
    title: 'Build System',
    description: 'Changes that affect the build system or external dependencies',
  },
  {
    type: 'ci',
    emoji: '💚',
    title: 'Continuous Integration',
    description: 'Changes to CI configuration files and scripts',
  },
  {
    type: 'chore',
    emoji: '🔧',
    title: 'Chores',
    description: 'Other changes that don\'t modify src or test files',
  },
  {
    type: 'revert',
    emoji: '⏪',
    title: 'Reverts',
    description: 'Reverts a previous commit',
  },
];

const SCOPES = [
  'cli',
  'generator',
  'templates',
  'module',
  'utils',
  'tests',
  'docs',
  'ci',
  'build',
];

// Colors for output
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

async function prompt(message: string): Promise<string> {
  const buf = new Uint8Array(1024);
  await Deno.stdout.write(new TextEncoder().encode(message));
  const n = await Deno.stdin.read(buf) ?? 0;
  return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

async function select(message: string, options: string[]): Promise<number> {
  console.log(colorize(`\n${message}`, colors.cyan));
  console.log();
  
  options.forEach((option, index) => {
    console.log(`  ${colorize(`${index + 1}`, colors.yellow)}. ${option}`);
  });
  
  console.log();
  const answer = await prompt(colorize('Enter your choice (number): ', colors.green));
  const choice = parseInt(answer) - 1;
  
  if (isNaN(choice) || choice < 0 || choice >= options.length) {
    console.log(colorize('❌ Invalid choice. Please try again.', colors.red));
    return await select(message, options);
  }
  
  return choice;
}

async function confirm(message: string): Promise<boolean> {
  const answer = await prompt(colorize(`${message} (y/N): `, colors.yellow));
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

function formatCommitMessage(
  type: string,
  scope: string,
  description: string,
  body: string,
  breaking: boolean,
  issues: string
): string {
  let message = type;
  
  if (scope) {
    message += `(${scope})`;
  }
  
  if (breaking) {
    message += '!';
  }
  
  message += `: ${description}`;
  
  if (body) {
    message += `\n\n${body}`;
  }
  
  if (breaking) {
    message += `\n\nBREAKING CHANGE: ${description}`;
  }
  
  if (issues) {
    message += `\n\nCloses: ${issues}`;
  }
  
  return message;
}

async function runGitCommand(args: string[]): Promise<void> {
  const process = new Deno.Command('git', {
    args,
    stdout: 'piped',
    stderr: 'piped',
  });

  const { code, stderr } = await process.output();
  
  if (code !== 0) {
    const errorMessage = new TextDecoder().decode(stderr);
    throw new Error(`Git command failed: ${errorMessage}`);
  }
}

async function main() {
  console.log(colorize('🚀 Conventional Commit Helper', colors.bright + colors.cyan));
  console.log(colorize('This tool helps you create conventional commits following the standard format.\n', colors.cyan));

  try {
    // Check if we're in a git repository
    await runGitCommand(['status', '--porcelain']);
  } catch {
    console.log(colorize('❌ Not in a git repository or no git available.', colors.red));
    Deno.exit(1);
  }

  // Step 1: Select commit type
  const typeOptions = COMMIT_TYPES.map(t => `${t.emoji} ${t.type} - ${t.description}`);
  const typeIndex = await select('What type of change are you committing?', typeOptions);
  const selectedType = COMMIT_TYPES[typeIndex];

  console.log(colorize(`\n✅ Selected: ${selectedType.emoji} ${selectedType.type}`, colors.green));

  // Step 2: Select scope (optional)
  const wantScope = await confirm('\nDo you want to add a scope?');
  let selectedScope = '';
  
  if (wantScope) {
    const scopeOptions = [...SCOPES, 'other (custom)'];
    const scopeIndex = await select('What is the scope of this change?', scopeOptions);
    
    if (scopeIndex === SCOPES.length) {
      selectedScope = await prompt(colorize('\nEnter custom scope: ', colors.green));
    } else {
      selectedScope = SCOPES[scopeIndex];
    }
    
    if (selectedScope) {
      console.log(colorize(`✅ Scope: ${selectedScope}`, colors.green));
    }
  }

  // Step 3: Short description
  const description = await prompt(colorize('\nWrite a short, imperative description of the change: ', colors.green));
  
  if (!description.trim()) {
    console.log(colorize('❌ Description is required.', colors.red));
    Deno.exit(1);
  }

  // Step 4: Long description (optional)
  const wantBody = await confirm('\nDo you want to add a longer description?');
  let body = '';
  
  if (wantBody) {
    body = await prompt(colorize('\nProvide a longer description (press Enter to finish):\n', colors.green));
  }

  // Step 5: Breaking change
  const isBreaking = await confirm('\nIs this a BREAKING CHANGE?');

  // Step 6: Issues (optional)
  const wantIssues = await confirm('\nDoes this commit close any issues?');
  let issues = '';
  
  if (wantIssues) {
    issues = await prompt(colorize('\nEnter issue numbers (e.g., #123, #456): ', colors.green));
  }

  // Generate commit message
  const commitMessage = formatCommitMessage(
    selectedType.type,
    selectedScope,
    description,
    body,
    isBreaking,
    issues
  );

  // Show preview
  console.log(colorize('\n📋 Commit Message Preview:', colors.bright + colors.yellow));
  console.log(colorize('─'.repeat(50), colors.yellow));
  console.log(commitMessage);
  console.log(colorize('─'.repeat(50), colors.yellow));

  // Confirm commit
  const shouldCommit = await confirm('\nDo you want to create this commit?');
  
  if (!shouldCommit) {
    console.log(colorize('❌ Commit cancelled.', colors.yellow));
    Deno.exit(0);
  }

  try {
    // Create the commit
    await runGitCommand(['commit', '-m', commitMessage]);
    console.log(colorize('\n🎉 Commit created successfully!', colors.green));
    
    // Show git log
    const showLog = await confirm('\nDo you want to see the commit in git log?');
    if (showLog) {
      const process = new Deno.Command('git', {
        args: ['log', '--oneline', '-1'],
        stdout: 'inherit',
      });
      await process.output();
    }
    
  } catch (error) {
    console.log(colorize(`❌ Failed to create commit: ${error.message}`, colors.red));
    console.log(colorize('\n💡 Make sure you have staged some changes first:', colors.yellow));
    console.log(colorize('   git add .', colors.cyan));
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(colorize(`❌ Error: ${message}`, colors.red));
    Deno.exit(1);
  });
} 