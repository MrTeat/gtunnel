import * as fs from 'fs';
import * as path from 'path';
import { TunnelServer } from '../../server/tunnel-server';
import { ConfigLoader, getConfigLoader } from '../../config/config-loader';
import { getLogger } from '../../monitoring/logger';
import { GTunnelConfig } from '../../config/types';

interface StartOptions {
  config?: string;
  host?: string;
  port?: number;
  tls?: boolean;
  cert?: string;
  key?: string;
  apiKey?: string;
  k?: string;  // Sauce Connect compatible alias for apiKey
  sauceLabs?: boolean;
  tunnelId?: string;
  tunnelName?: string;  // Sauce Connect compatible alias for tunnelId
  user?: string;  // Sauce Labs username
  region?: string;  // Sauce Labs region
  daemon?: boolean;
}

const PID_FILE = path.join(process.cwd(), '.gtunnel.pid');

export async function startCommand(options: StartOptions): Promise<void> {
  try {
    // Check if already running
    if (fs.existsSync(PID_FILE)) {
      const pid = fs.readFileSync(PID_FILE, 'utf8');
      console.error(`Tunnel already running with PID ${pid}`);
      console.error('Use "gtunnel stop" to stop it first');
      process.exit(1);
    }

    // Load configuration
    const configLoader = getConfigLoader();
    
    // Load from file if specified
    if (options.config) {
      configLoader.loadFromFile(options.config);
    }
    
    // Load from environment
    configLoader.loadFromEnv();
    
    // Apply CLI options
    const cliConfig: Partial<GTunnelConfig> = {};
    
    if (options.host) {
      cliConfig.server = { ...configLoader.getConfig().server, host: options.host };
    }
    
    if (options.port) {
      cliConfig.server = { ...configLoader.getConfig().server, port: options.port };
    }
    
    if (options.tls) {
      cliConfig.server = {
        ...configLoader.getConfig().server,
        tls: {
          ...configLoader.getConfig().server.tls,
          enabled: true,
          cert: options.cert,
          key: options.key,
        },
      };
    }
    
    // Handle API key - support both --api-key and -k (Sauce Connect compatible)
    const apiKey = options.apiKey || options.k;
    if (apiKey) {
      cliConfig.auth = {
        ...configLoader.getConfig().auth,
        apiKey: {
          enabled: true,
          keys: [{ name: 'cli', key: apiKey }],
        },
      };
    }
    
    // Handle Sauce Labs options
    // If -u, -k, --region, or --tunnel-name are provided, enable Sauce Labs mode automatically
    const useSauceLabs = options.sauceLabs || options.user || options.k || options.region || options.tunnelName;
    
    if (useSauceLabs) {
      // Use --tunnel-name if provided, otherwise --tunnel-id
      const tunnelIdentifier = options.tunnelName || options.tunnelId;
      
      cliConfig.sauceLabs = {
        compatible: true,
        tunnelId: tunnelIdentifier,
        username: options.user,
        region: options.region,
        accessKey: apiKey,  // Use the API key as access key for Sauce Labs
      };
    }
    
    configLoader.setConfig(cliConfig);
    
    // Validate configuration
    const validation = configLoader.validate();
    if (!validation.valid) {
      console.error('Configuration validation failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }
    
    const config = configLoader.getConfig();
    const logger = getLogger(config.monitoring.logging);
    
    // Create and start server
    const server = new TunnelServer(config);
    
    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down...');
      await server.stop();
      if (fs.existsSync(PID_FILE)) {
        fs.unlinkSync(PID_FILE);
      }
      process.exit(0);
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
    // Start server
    await server.start();
    
    // Save PID
    fs.writeFileSync(PID_FILE, process.pid.toString());
    
    const info = server.getInfo();
    console.log('\n✓ GTunnel started successfully!\n');
    console.log(`  Server:    ${info.tls ? 'https' : 'http'}://${info.host}:${info.port}`);
    console.log(`  Dashboard: http://localhost:${config.monitoring.dashboard.port}`);
    console.log(`  Metrics:   http://localhost:${config.monitoring.metrics.port}/metrics`);
    
    // Show Sauce Labs configuration if enabled
    if (config.sauceLabs.compatible) {
      console.log('\n  Sauce Labs Mode: Enabled');
      if (config.sauceLabs.username) {
        console.log(`  Username:  ${config.sauceLabs.username}`);
      }
      if (config.sauceLabs.tunnelId) {
        console.log(`  Tunnel:    ${config.sauceLabs.tunnelId}`);
      }
      if (config.sauceLabs.region) {
        console.log(`  Region:    ${config.sauceLabs.region}`);
      }
    }
    
    console.log('\nPress Ctrl+C to stop\n');
    
  } catch (error) {
    console.error('Failed to start tunnel:', error);
    process.exit(1);
  }
}
