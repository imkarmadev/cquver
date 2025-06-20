#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

/**
 * Interactive script to create a feature branch and optionally open a pull request
 */

import { bold, cyan, green, red, yellow } from 'https://deno.land/std@0.208.0/fmt/colors.ts';

interface BranchInfo {
  type: string;
  scope?: string;
  description: string;
  branchName: string;
}

const BRANCH_TYPES = {
  'feat': { emoji: '✨', description: 'New feature' },
  'fix': { emoji: '🐛', description: 'Bug fix' },
  'docs': { emoji: '📚', description: 'Documentation' },
  'style': { emoji: '💄', description: 'Code style/formatting' },
  'refactor': { emoji: '♻️', description: 'Code refactoring' },
  'perf': { emoji: '⚡', description: 'Performance improvement' },
  'test': { emoji: '✅', description: 'Tests' },
  'build': { emoji: '👷', description: 'Build system' },
  'ci': { emoji: '💚', description: 'CI/CD' },
  'chore': { emoji: '🔧', description: 'Maintenance' },
};

async function runCommand(cmd: string[], options: { cwd?: string } = {}): Promise<string> {
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd: options.cwd,
    stdout: 'piped',
    stderr: 'piped',
  });

  const { code, stdout, stderr } = await command.output();

  if (code !== 0) {
    const errorText = new TextDecoder().decode(stderr);
    throw new Error(`Command failed: ${cmd.join(' ')}\n${errorText}`);
  }

  return new TextDecoder().decode(stdout).trim();
}

async function checkGitStatus(): Promise<void> {
  try {
    const status = await runCommand(['git', 'status', '--porcelain']);
    if (status.trim()) {
      console.log(red('⚠️  Warning: You have uncommitted changes:'));
      console.log(status);
      const proceed = confirm('\nDo you want to continue anyway?');
      if (!proceed) {
        console.log(yellow('Operation cancelled.'));
        Deno.exit(0);
      }
    }
  } catch (error) {
    console.log(
      red('❌ Error checking git status:'),
      error instanceof Error ? error.message : String(error),
    );
    Deno.exit(1);
  }
}

async function ensureMainBranch(): Promise<void> {
  try {
    const currentBranch = await runCommand(['git', 'branch', '--show-current']);

    if (currentBranch !== 'main') {
      console.log(yellow(`Current branch: ${currentBranch}`));
      const switchToMain = confirm('Switch to main branch?');
      if (switchToMain) {
        console.log(cyan('🔄 Switching to main branch...'));
        await runCommand(['git', 'checkout', 'main']);
        console.log(cyan('📥 Pulling latest changes...'));
        await runCommand(['git', 'pull', 'origin', 'main']);
      } else {
        console.log(yellow('Staying on current branch.'));
      }
    } else {
      console.log(cyan('📥 Pulling latest changes from main...'));
      await runCommand(['git', 'pull', 'origin', 'main']);
    }
  } catch (error) {
    console.log(
      red('❌ Error managing branches:'),
      error instanceof Error ? error.message : String(error),
    );
    Deno.exit(1);
  }
}

function promptBranchType(): string {
  console.log(bold('\n🌟 Select branch type:'));
  console.log('─'.repeat(50));

  Object.entries(BRANCH_TYPES).forEach(([type, { emoji, description }], index) => {
    console.log(cyan(`${index + 1}.`), `${emoji} ${bold(type)} - ${description}`);
  });
  console.log('─'.repeat(50));

  while (true) {
    const input = prompt('\nEnter the number of your choice (1-10):');
    const choice = parseInt(input || '');
    const types = Object.keys(BRANCH_TYPES);

    if (choice >= 1 && choice <= types.length) {
      return types[choice - 1];
    }

    console.log(red('❌ Invalid choice. Please enter a number between 1 and 10.'));
  }
}

function promptScope(): string | undefined {
  const scope = prompt('\n🎯 Enter scope (optional, e.g., "auth", "ui", "api"):');
  return scope?.trim() || undefined;
}

function promptDescription(): string {
  while (true) {
    const description = prompt('\n📝 Enter a brief description (e.g., "add user authentication"):');
    if (description?.trim()) {
      return description.trim();
    }
    console.log(red('❌ Description is required.'));
  }
}

function generateBranchName(info: BranchInfo): string {
  const scope = info.scope ? `${info.scope}-` : '';
  const description = info.description
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${info.type}/${scope}${description}`;
}

async function createBranch(branchName: string): Promise<void> {
  try {
    console.log(cyan(`\n🌿 Creating branch: ${branchName}`));
    await runCommand(['git', 'checkout', '-b', branchName]);
    console.log(green(`✅ Branch '${branchName}' created and checked out!`));
  } catch (error) {
    console.log(
      red('❌ Error creating branch:'),
      error instanceof Error ? error.message : String(error),
    );
    Deno.exit(1);
  }
}

async function pushBranch(branchName: string): Promise<void> {
  try {
    console.log(cyan(`\n📤 Pushing branch to origin...`));
    await runCommand(['git', 'push', '-u', 'origin', branchName]);
    console.log(green(`✅ Branch '${branchName}' pushed to origin!`));
  } catch (error) {
    console.log(
      red('❌ Error pushing branch:'),
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

async function createPullRequest(info: BranchInfo): Promise<void> {
  try {
    const { emoji } = BRANCH_TYPES[info.type as keyof typeof BRANCH_TYPES];
    const scope = info.scope ? `(${info.scope})` : '';
    const title = `${info.type}${scope}: ${info.description}`;

    console.log(cyan('\n🔄 Creating pull request...'));

    const prBody = `## ${emoji} ${BRANCH_TYPES[info.type as keyof typeof BRANCH_TYPES].description}

### 📋 Description
${info.description}

### 🔄 Type of Change
- [x] ${emoji} ${info.type}: ${BRANCH_TYPES[info.type as keyof typeof BRANCH_TYPES].description}

### ✅ Checklist
- [ ] Code follows conventional commit format
- [ ] Tests pass locally (\`deno task test\`)
- [ ] Code is properly formatted (\`deno fmt\`)
- [ ] No linting errors (\`deno lint\`)
- [ ] Documentation updated if needed

### 🎯 Version Impact
This PR will result in a **${getVersionBump(info.type)}** version bump when merged.

---
*This PR was created using \`deno task create-pr\`*`;

    const prUrl = await runCommand([
      'gh',
      'pr',
      'create',
      '--title',
      title,
      '--body',
      prBody,
      '--base',
      'main',
      '--head',
      info.branchName,
    ]);

    console.log(green('\n🎉 Pull request created successfully!'));
    console.log(cyan(`🔗 URL: ${prUrl}`));

    // Try to open in browser
    const openInBrowser = confirm('\nOpen pull request in browser?');
    if (openInBrowser) {
      try {
        await runCommand(['gh', 'pr', 'view', '--web']);
      } catch {
        console.log(yellow('Could not open browser automatically. Use the URL above.'));
      }
    }
  } catch (error) {
    console.log(
      red('❌ Error creating pull request:'),
      error instanceof Error ? error.message : String(error),
    );
    console.log(yellow('💡 You can create it manually on GitHub or run:'));
    console.log(cyan(`   gh pr create --base main --head ${info.branchName}`));
    throw error;
  }
}

function getVersionBump(type: string): string {
  if (type.endsWith('!') || type === 'feat!' || type === 'fix!') {
    return 'MAJOR';
  } else if (type === 'feat') {
    return 'MINOR';
  } else {
    return 'PATCH';
  }
}

async function main(): Promise<void> {
  console.log(bold(green('\n🚀 Create Feature Branch & Pull Request')));
  console.log('═'.repeat(50));

  // Check if gh CLI is available
  try {
    await runCommand(['gh', '--version']);
  } catch {
    console.log(yellow('\n⚠️  GitHub CLI (gh) not found. You can:'));
    console.log('   1. Install it: https://cli.github.com/');
    console.log('   2. Continue without PR creation (branch only)');

    const continueWithoutGh = confirm('\nContinue without GitHub CLI?');
    if (!continueWithoutGh) {
      console.log(yellow('Operation cancelled. Please install GitHub CLI first.'));
      Deno.exit(0);
    }
  }

  // Check git status
  await checkGitStatus();

  // Ensure we're on main and up to date
  await ensureMainBranch();

  // Gather branch information
  const type = promptBranchType();
  const scope = promptScope();
  const description = promptDescription();

  const branchInfo: BranchInfo = {
    type,
    scope,
    description,
    branchName: generateBranchName({ type, scope, description, branchName: '' }),
  };
  branchInfo.branchName = generateBranchName(branchInfo);

  // Show summary
  console.log(bold('\n📋 Summary:'));
  console.log('─'.repeat(30));
  console.log(cyan('Type:'), BRANCH_TYPES[type as keyof typeof BRANCH_TYPES].emoji, type);
  if (scope) console.log(cyan('Scope:'), scope);
  console.log(cyan('Description:'), description);
  console.log(cyan('Branch name:'), branchInfo.branchName);
  console.log(cyan('Version bump:'), getVersionBump(type));
  console.log('─'.repeat(30));

  const proceed = confirm('\nProceed with branch creation?');
  if (!proceed) {
    console.log(yellow('Operation cancelled.'));
    Deno.exit(0);
  }

  // Create branch
  await createBranch(branchInfo.branchName);

  // Ask about pushing and PR creation
  const pushAndPr = confirm('\nPush branch and create pull request?');
  if (pushAndPr) {
    try {
      await pushBranch(branchInfo.branchName);

      // Check if gh CLI is available for PR creation
      try {
        await runCommand(['gh', '--version']);
        await createPullRequest(branchInfo);
      } catch {
        console.log(yellow('\n💡 GitHub CLI not available. Create PR manually at:'));
        console.log(
          cyan(
            `   https://github.com/$(git remote get-url origin | sed 's/.*://; s/.git$//')/compare/main...${branchInfo.branchName}`,
          ),
        );
      }
    } catch (error) {
      console.log(
        red('\n❌ Error during push/PR creation:'),
        error instanceof Error ? error.message : String(error),
      );
      console.log(yellow('\n💡 You can manually push and create PR later:'));
      console.log(cyan(`   git push -u origin ${branchInfo.branchName}`));
      console.log(cyan(`   gh pr create --base main --head ${branchInfo.branchName}`));
    }
  }

  console.log(bold(green('\n🎉 Setup complete!')));
  console.log(yellow('\n💡 Next steps:'));
  console.log('   1. Make your changes');
  console.log('   2. Commit using conventional format (or use `deno task commit`)');
  console.log('   3. Push changes: `git push`');
  console.log('   4. The PR will be automatically validated');
  console.log('   5. When merged, a release will be automatically created');
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(
      red('\n❌ Unexpected error:'),
      error instanceof Error ? error.message : String(error),
    );
    Deno.exit(1);
  });
}
