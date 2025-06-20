#!/usr/bin/env deno run --allow-read --allow-write --allow-run

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

async function checkGitRepo(): Promise<boolean> {
  const result = await runCommand(['git', 'rev-parse', '--git-dir']);
  return result.success;
}

async function setupCommitTemplate(): Promise<boolean> {
  console.log(colorize('📝 Setting up git commit message template...', colors.cyan));

  const result = await runCommand(['git', 'config', 'commit.template', '.gitmessage']);

  if (result.success) {
    console.log(colorize('✅ Commit template configured', colors.green));
    return true;
  } else {
    console.log(colorize(`❌ Failed to set commit template: ${result.error}`, colors.red));
    return false;
  }
}

async function makeHooksExecutable(): Promise<boolean> {
  console.log(colorize('🔧 Making git hooks executable...', colors.cyan));

  const hooks = ['.git/hooks/commit-msg', '.git/hooks/pre-push'];
  let success = true;

  for (const hook of hooks) {
    try {
      await Deno.chmod(hook, 0o755);
      console.log(colorize(`✅ Made ${hook} executable`, colors.green));
    } catch (error) {
      console.log(colorize(`⚠️  Could not make ${hook} executable: ${error}`, colors.yellow));
      success = false;
    }
  }

  return success;
}

async function setupGitAliases(): Promise<boolean> {
  console.log(colorize('🔗 Setting up helpful git aliases...', colors.cyan));

  const aliases = [
    ['cc', '!deno task commit'], // Interactive conventional commit
    ['cz', '!deno task commit'], // Alternative name for commitizen users
  ];

  let success = true;

  for (const [alias, command] of aliases) {
    const result = await runCommand(['git', 'config', '--local', `alias.${alias}`, command]);

    if (result.success) {
      console.log(colorize(`✅ Added git alias: git ${alias}`, colors.green));
    } else {
      console.log(colorize(`❌ Failed to add alias ${alias}: ${result.error}`, colors.red));
      success = false;
    }
  }

  return success;
}

async function createVSCodeSettings(): Promise<boolean> {
  console.log(colorize('🎨 Setting up VSCode settings for conventional commits...', colors.cyan));

  const vscodeDir = '.vscode';
  const settingsFile = `${vscodeDir}/settings.json`;

  // Create .vscode directory if it doesn't exist
  try {
    await Deno.mkdir(vscodeDir, { recursive: true });
  } catch {
    // Directory might already exist
  }

  const settings = {
    'conventionalCommits.scopes': [
      'cli',
      'generator',
      'templates',
      'module',
      'utils',
      'tests',
      'docs',
      'ci',
      'build',
    ],
    'git.inputValidation': 'always',
    'git.inputValidationLength': 72,
    'git.inputValidationSubjectLength': 72,
    'gitlens.advanced.blame.customArguments': ['-w'],
    'gitlens.codeLens.enabled': true,
    'gitlens.currentLine.enabled': true,
    'extensions.recommendations': [
      'vivaxy.vscode-conventional-commits',
      'eamodio.gitlens',
    ],
  };

  let existingSettings = {};

  // Read existing settings if they exist
  try {
    const existingContent = await Deno.readTextFile(settingsFile);
    existingSettings = JSON.parse(existingContent);
  } catch {
    // File doesn't exist or is invalid JSON, start fresh
  }

  // Merge settings
  const mergedSettings = { ...existingSettings, ...settings };

  try {
    await Deno.writeTextFile(settingsFile, JSON.stringify(mergedSettings, null, 2));
    console.log(colorize('✅ VSCode settings updated', colors.green));
    return true;
  } catch (error) {
    console.log(colorize(`❌ Failed to update VSCode settings: ${error}`, colors.red));
    return false;
  }
}

function showSummary(): void {
  console.log(colorize('\n🎉 Git setup completed!', colors.bright + colors.green));
  console.log(colorize('\n📋 What was configured:', colors.cyan));
  console.log(colorize('  ✅ Git commit message template (.gitmessage)', colors.green));
  console.log(colorize('  ✅ Commit message validation hook', colors.green));
  console.log(colorize('  ✅ Pre-push quality checks hook', colors.green));
  console.log(colorize('  ✅ Git aliases for easier commits', colors.green));
  console.log(colorize('  ✅ VSCode settings for conventional commits', colors.green));

  console.log(colorize('\n🚀 How to use:', colors.cyan));
  console.log(
    colorize('  📝 Interactive commit: ', colors.yellow) +
      colorize('deno task commit', colors.blue),
  );
  console.log(colorize('  📝 or use git alias: ', colors.yellow) + colorize('git cc', colors.blue));
  console.log(
    colorize('  📝 Regular commit: ', colors.yellow) + colorize('git commit', colors.blue) +
      colorize(' (will show template)', colors.yellow),
  );
  console.log(
    colorize('  📝 Changelog: ', colors.yellow) +
      colorize('deno task changelog v1.0.0', colors.blue),
  );

  console.log(colorize('\n💡 VSCode Extensions (recommended):', colors.cyan));
  console.log(
    colorize('  - Conventional Commits (vivaxy.vscode-conventional-commits)', colors.yellow),
  );
  console.log(colorize('  - GitLens (eamodio.gitlens)', colors.yellow));

  console.log(colorize('\n📚 Learn more:', colors.cyan));
  console.log(colorize('  - CONTRIBUTING.md - Conventional commit guidelines', colors.yellow));
  console.log(
    colorize('  - docs/RELEASE_WORKFLOW.md - Release workflow documentation', colors.yellow),
  );
}

async function main(): Promise<void> {
  console.log(colorize('🛠️  Git Conventional Commits Setup', colors.bright + colors.cyan));
  console.log(
    colorize(
      'Setting up git configuration for conventional commits and automated workflows.\n',
      colors.cyan,
    ),
  );

  // Check if we're in a git repository
  if (!(await checkGitRepo())) {
    console.log(
      colorize('❌ Not in a git repository. Please run this from the project root.', colors.red),
    );
    Deno.exit(1);
  }

  let allSuccess = true;

  // Setup commit template
  if (!(await setupCommitTemplate())) {
    allSuccess = false;
  }

  // Make hooks executable
  if (!(await makeHooksExecutable())) {
    allSuccess = false;
  }

  // Setup git aliases
  if (!(await setupGitAliases())) {
    allSuccess = false;
  }

  // Create VSCode settings
  if (!(await createVSCodeSettings())) {
    allSuccess = false;
  }

  if (allSuccess) {
    showSummary();
  } else {
    console.log(
      colorize(
        '\n⚠️  Setup completed with some warnings. Check the messages above.',
        colors.yellow,
      ),
    );
  }
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(colorize(`❌ Setup failed: ${message}`, colors.red));
    Deno.exit(1);
  });
}
