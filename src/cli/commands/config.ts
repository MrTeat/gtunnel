import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { getConfigLoader } from '../../config/config-loader';
import { defaultConfig } from '../../config/defaults';

interface ConfigOptions {
  init?: boolean;
  show?: boolean;
  validate?: boolean;
}

export async function configCommand(options: ConfigOptions): Promise<void> {
  try {
    if (options.init) {
      await initConfig();
    } else if (options.show) {
      await showConfig();
    } else if (options.validate) {
      await validateConfig();
    } else {
      console.log('Usage: gtunnel config [--init|--show|--validate]');
    }
  } catch (error) {
    console.error('Config command failed:', error);
    process.exit(1);
  }
}

async function initConfig(): Promise<void> {
  const configPath = path.join(process.cwd(), 'gtunnel.config.yml');
  
  if (fs.existsSync(configPath)) {
    console.error('Configuration file already exists: gtunnel.config.yml');
    process.exit(1);
  }

  const configYaml = yaml.stringify(defaultConfig);
  fs.writeFileSync(configPath, configYaml);
  
  console.log('✓ Configuration file created: gtunnel.config.yml');
  console.log('\nEdit the file to customize your settings, then start with:');
  console.log('  gtunnel start --config gtunnel.config.yml');
}

async function showConfig(): Promise<void> {
  const configLoader = getConfigLoader();
  configLoader.loadFromEnv();
  
  const config = configLoader.getConfig();
  console.log(yaml.stringify(config));
}

async function validateConfig(): Promise<void> {
  const configLoader = getConfigLoader();
  
  // Try to load config file
  const configPath = path.join(process.cwd(), 'gtunnel.config.yml');
  if (fs.existsSync(configPath)) {
    configLoader.loadFromFile(configPath);
  }
  
  configLoader.loadFromEnv();
  
  const validation = configLoader.validate();
  
  if (validation.valid) {
    console.log('✓ Configuration is valid');
  } else {
    console.error('✗ Configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
}
