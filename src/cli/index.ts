#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { startCommand } from './commands/start';
import { stopCommand } from './commands/stop';
import { statusCommand } from './commands/status';
import { configCommand } from './commands/config';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('gtunnel')
  .description('High-Performance Sauce Labs Compatible Tunnel')
  .version('1.0.0');

// Start command
program
  .command('start')
  .description('Start the tunnel server')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-h, --host <host>', 'Server host')
  .option('-p, --port <port>', 'Server port', parseInt)
  .option('--tls', 'Enable TLS')
  .option('--cert <path>', 'TLS certificate path')
  .option('--key <path>', 'TLS key path')
  .option('--api-key <key>', 'API key for authentication')
  .option('-k <key>', 'API key (Sauce Connect compatible alias)')
  .option('--sauce-labs', 'Enable Sauce Labs compatibility mode')
  .option('--tunnel-id <id>', 'Sauce Labs tunnel ID')
  .option('--tunnel-name <name>', 'Sauce Labs tunnel name (alias for tunnel-id)')
  .option('-u, --user <username>', 'Sauce Labs username')
  .option('--region <region>', 'Sauce Labs region (e.g., us-west, eu-central)')
  .option('-d, --daemon', 'Run as daemon')
  .action(startCommand);

// Stop command
program
  .command('stop')
  .description('Stop the tunnel server')
  .action(stopCommand);

// Status command
program
  .command('status')
  .description('Check tunnel server status')
  .action(statusCommand);

// Config command
program
  .command('config')
  .description('Manage configuration')
  .option('--init', 'Initialize configuration file')
  .option('--show', 'Show current configuration')
  .option('--validate', 'Validate configuration')
  .action(configCommand);

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
