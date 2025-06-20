#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env

import { parseArgs } from 'https://deno.land/std@0.208.0/cli/parse_args.ts';
import { GeneratorService } from './src/generator.service.ts';

const VERSION = '1.3.0'; // Current version

interface Args {
  _: string[];
  help?: boolean;
  version?: boolean;
}

function showHelp() {
  console.log(`
🚀 cquver - NestJS DDD/CQRS Boilerplate Generator

📋 Usage:
  cquver <action> <type> <name> [app]
  cquver --version, -v      Show version information
  cquver --help, -h         Show this help message

🎯 Actions:
  create, c, generate, g    Generate a new handler
  init, i                   Initialize DDD/CQRS structure

📦 Types:
  command, cmd              Generate command handler
  query, q                  Generate query handler  
  event, e                  Generate event handler
  service, s                Generate domain service
  usecase, u                Generate use case

✨ Examples:
  cquver create command CreateUser user-service
  cquver generate query GetUser user-service
  cquver create service UserValidator user-service
  cquver create usecase ProcessUserRegistration user-service
  cquver init user-service

💡 Tips:
  - Use kebab-case for names (they'll be converted automatically)
  - App parameter is optional if you have only one NestJS app
  - Run 'cquver init <app>' first to set up the folder structure

🔗 More help: https://github.com/imkarmadev/cquver
  `);
}

function showVersion() {
  console.log(`🚀 cquver v${VERSION}`);
  console.log('📦 NestJS DDD/CQRS Boilerplate Generator');
  console.log('🔗 https://github.com/imkarmadev/cquver');
}

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ['help', 'version'],
    alias: { h: 'help', v: 'version' },
  }) as Args;

  if (args.version) {
    showVersion();
    Deno.exit(0);
  }

  if (args.help || args._.length === 0) {
    showHelp();
    Deno.exit(0);
  }

  const [appName, action, ...rest] = args._;

  if (!appName || !action) {
    console.error('❌ Invalid arguments. Use --help for usage information.');
    Deno.exit(1);
  }

  try {
    const generator = new GeneratorService();

    if (action === 'init') {
      await generator.initializeService(appName as string);
      console.log(`✅ Successfully initialized service structure for "${appName}"`);
    } else if (action === 'create') {
      const [type, name] = rest;

      if (!type || !name) {
        console.error(
          '❌ Create command requires type and name. Use --help for usage information.',
        );
        Deno.exit(1);
      }

      if (!['event', 'command', 'query', 'service', 'usecase'].includes(type as string)) {
        console.error('❌ Type must be "event", "command", "query", "service", or "usecase".');
        Deno.exit(1);
      }

      await generator.generate(
        appName as string,
        type as 'event' | 'command' | 'query' | 'service' | 'usecase',
        name as string,
      );
      console.log(`✅ Successfully generated ${type} "${name}" for app "${appName}"`);
    } else {
      console.error('❌ Action must be "init" or "create".');
      Deno.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
