import { ConfigLoader } from '../../src/config/config-loader';
import { defaultConfig } from '../../src/config/defaults';
import * as fs from 'fs';
import * as path from 'path';

describe('ConfigLoader', () => {
  let configLoader: ConfigLoader;

  beforeEach(() => {
    configLoader = new ConfigLoader();
  });

  describe('loadFromFile', () => {
    it('should load YAML configuration file', () => {
      const testConfigPath = path.join(__dirname, '../fixtures/test-config.yml');
      const testConfig = `
server:
  host: localhost
  port: 9999
`;
      
      // Create test file
      const fixturesDir = path.join(__dirname, '../fixtures');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      fs.writeFileSync(testConfigPath, testConfig);

      const config = configLoader.loadFromFile(testConfigPath);
      
      expect(config.server.host).toBe('localhost');
      expect(config.server.port).toBe(9999);

      // Cleanup
      fs.unlinkSync(testConfigPath);
    });

    it('should load JSON configuration file', () => {
      const testConfigPath = path.join(__dirname, '../fixtures/test-config.json');
      const testConfig = {
        server: {
          host: 'testhost',
          port: 7777,
        },
      };
      
      const fixturesDir = path.join(__dirname, '../fixtures');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      fs.writeFileSync(testConfigPath, JSON.stringify(testConfig));

      const config = configLoader.loadFromFile(testConfigPath);
      
      expect(config.server.host).toBe('testhost');
      expect(config.server.port).toBe(7777);

      // Cleanup
      fs.unlinkSync(testConfigPath);
    });

    it('should throw error for unsupported file format', () => {
      const testPath = path.join(__dirname, '../fixtures/test.txt');
      const fixturesDir = path.join(__dirname, '../fixtures');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      fs.writeFileSync(testPath, 'test content');
      
      expect(() => {
        configLoader.loadFromFile(testPath);
      }).toThrow('Unsupported config file format');
      
      // Cleanup
      fs.unlinkSync(testPath);
    });
  });

  describe('loadFromEnv', () => {
    beforeEach(() => {
      delete process.env.GTUNNEL_HOST;
      delete process.env.GTUNNEL_PORT;
      delete process.env.GTUNNEL_API_KEY;
      // Reset config loader for each test
      configLoader = new ConfigLoader();
    });

    it('should load configuration from environment variables', () => {
      process.env.GTUNNEL_HOST = 'envhost';
      process.env.GTUNNEL_PORT = '5555';
      
      const config = configLoader.loadFromEnv();
      
      expect(config.server.host).toBe('envhost');
      expect(config.server.port).toBe(5555);
    });

    it('should enable API key auth when GTUNNEL_API_KEY is set', () => {
      process.env.GTUNNEL_API_KEY = 'test-api-key';
      
      const config = configLoader.loadFromEnv();
      
      expect(config.auth.apiKey.enabled).toBe(true);
      expect(config.auth.apiKey.keys[0].key).toBe('test-api-key');
    });
  });

  describe('validate', () => {
    it('should pass validation for default config', () => {
      const validation = configLoader.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail validation for invalid port', () => {
      configLoader.setConfig({
        server: { ...defaultConfig.server, port: 99999 },
      });
      
      const validation = configLoader.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when TLS is enabled without cert/key', () => {
      configLoader.setConfig({
        server: {
          ...defaultConfig.server,
          tls: { ...defaultConfig.server.tls, enabled: true },
        },
      });
      
      const validation = configLoader.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('TLS'))).toBe(true);
    });
  });

  describe('mergeConfig', () => {
    it('should merge partial configuration', () => {
      configLoader.setConfig({
        server: { ...defaultConfig.server, port: 3000 },
      });
      
      const config = configLoader.getConfig();
      expect(config.server.port).toBe(3000);
      expect(config.server.host).toBe(defaultConfig.server.host);
    });
  });
});
