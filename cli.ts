#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env

import { parseArgs } from 'https://deno.land/std@0.208.0/cli/parse_args.ts';
import { GeneratorService } from './src/generator.service.ts';

interface Args {
    _: string[];
    help?: boolean;
}

function printHelp() {
    console.log(`
cquver - NestJS DDD/CQRS Boilerplate Generator

Usage:
  cquver <app_name> create event <name>     Generate event boilerplate
  cquver <app_name> create command <name>   Generate command boilerplate
  cquver <app_name> create query <name>     Generate query boilerplate

Options:
  --help                                    Show this help message

Examples:
  cquver user-service create event UserCreatedEvent
  cquver auth-service create command CreateUserCommand
  cquver order-service create query GetOrderQuery
  `);
}

async function main() {
    const args = parseArgs(Deno.args) as Args;

    if (args.help || args._.length === 0) {
        printHelp();
        Deno.exit(0);
    }

    const [appName, action, type, name] = args._;

    if (!appName || !action || !type || !name) {
        console.error('❌ Invalid arguments. Use --help for usage information.');
        Deno.exit(1);
    }

    if (action !== 'create') {
        console.error('❌ Only "create" action is supported.');
        Deno.exit(1);
    }

    if (!['event', 'command', 'query'].includes(type as string)) {
        console.error('❌ Type must be "event", "command", or "query".');
        Deno.exit(1);
    }

    try {
        const generator = new GeneratorService();
        await generator.generate(
            appName as string,
            type as 'event' | 'command' | 'query',
            name as string
        );
        console.log(`✅ Successfully generated ${type} "${name}" for app "${appName}"`);
    } catch (error) {
        console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        Deno.exit(1);
    }
}

if (import.meta.main) {
    await main();
} 