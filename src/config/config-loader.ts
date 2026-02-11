import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { GTunnelConfig } from './types';
import { defaultConfig } from './defaults';

export class ConfigLoader {
  private config: GTunnelConfig;

  constructor() {
    this.config = { ...defaultConfig };
  }

  /**
   * Load configuration from file (YAML or JSON)
   */
  loadFromFile(filePath: string): GTunnelConfig {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const ext = path.extname(filePath).toLowerCase();

      let fileConfig: Partial<GTunnelConfig>;
      if (ext === '.json') {
        fileConfig = JSON.parse(content);
      } else if (ext === '.yml' || ext === '.yaml') {
        fileConfig = yaml.parse(content);
      } else {
        throw new Error(`Unsupported config file format: ${ext}`);
      }

      this.config = this.mergeConfig(this.config, fileConfig);
      return this.config;
    } catch (error) {
      throw new Error(`Failed to load config from ${filePath}: ${error}`);
    }
  }

  /**
   * Load configuration from environment variables
   */
  loadFromEnv(): GTunnelConfig {
    const envConfig: Partial<GTunnelConfig> = {};

    // Server config
    if (process.env.GTUNNEL_HOST) {
      envConfig.server = { ...this.config.server, host: process.env.GTUNNEL_HOST };
    }
    if (process.env.GTUNNEL_PORT) {
      envConfig.server = { ...this.config.server, port: parseInt(process.env.GTUNNEL_PORT) };
    }
    if (process.env.GTUNNEL_TLS_ENABLED) {
      envConfig.server = {
        ...this.config.server,
        tls: { ...this.config.server.tls, enabled: process.env.GTUNNEL_TLS_ENABLED === 'true' },
      };
    }

    // Auth config
    if (process.env.GTUNNEL_API_KEY) {
      envConfig.auth = {
        ...this.config.auth,
        apiKey: {
          enabled: true,
          keys: [{ name: 'default', key: process.env.GTUNNEL_API_KEY }],
        },
      };
    }

    // Sauce Labs config
    if (process.env.SAUCE_USERNAME) {
      envConfig.sauceLabs = {
        ...this.config.sauceLabs,
        compatible: true,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        tunnelId: process.env.SAUCE_TUNNEL_ID,
      };
    }

    this.config = this.mergeConfig(this.config, envConfig);
    return this.config;
  }

  /**
   * Get the current configuration
   */
  getConfig(): GTunnelConfig {
    return this.config;
  }

  /**
   * Set configuration programmatically
   */
  setConfig(config: Partial<GTunnelConfig>): void {
    this.config = this.mergeConfig(this.config, config);
  }

  /**
   * Deep merge two configuration objects
   */
  private mergeConfig(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeConfig(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Validate configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.server.port < 1 || this.config.server.port > 65535) {
      errors.push('Server port must be between 1 and 65535');
    }

    if (this.config.server.tls.enabled) {
      if (!this.config.server.tls.cert || !this.config.server.tls.key) {
        errors.push('TLS cert and key are required when TLS is enabled');
      }
    }

    if (this.config.monitoring.metrics.port < 1 || this.config.monitoring.metrics.port > 65535) {
      errors.push('Metrics port must be between 1 and 65535');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Singleton instance
let configLoader: ConfigLoader | null = null;

export function getConfigLoader(): ConfigLoader {
  if (!configLoader) {
    configLoader = new ConfigLoader();
  }
  return configLoader;
}
