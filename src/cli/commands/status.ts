import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import { getConfigLoader } from '../../config/config-loader';

const PID_FILE = path.join(process.cwd(), '.gtunnel.pid');

export async function statusCommand(): Promise<void> {
  try {
    if (!fs.existsSync(PID_FILE)) {
      console.log('Status: Not running');
      return;
    }

    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
    
    // Check if process is actually running
    try {
      process.kill(pid, 0);
    } catch {
      console.log('Status: Not running (stale PID file)');
      fs.unlinkSync(PID_FILE);
      return;
    }

    console.log('Status: Running');
    console.log(`PID: ${pid}`);
    
    // Try to get more info from health endpoint
    try {
      const configLoader = getConfigLoader();
      const configPath = path.join(process.cwd(), 'gtunnel.config.yml');
      if (fs.existsSync(configPath)) {
        configLoader.loadFromFile(configPath);
      }
      configLoader.loadFromEnv();
      const config = configLoader.getConfig();

      const host = (config.server.host === '0.0.0.0' || config.server.host === '::')
        ? 'localhost'
        : config.server.host;
      const protocol = config.server.tls.enabled ? 'https' : 'http';
      const healthUrl = `${protocol}://${host}:${config.server.port}/health`;
      const apiKey = config.auth.apiKey.enabled && config.auth.apiKey.keys.length > 0
        ? config.auth.apiKey.keys[0].key
        : undefined;

      const health = await fetchHealth(healthUrl, apiKey);
      console.log('\nHealth Check:');
      console.log(`  Status: ${health.status}`);
      console.log(`  Uptime: ${Math.floor(health.uptime / 1000)}s`);
      console.log(`  Version: ${health.version}`);
      
      if (health.checks) {
        console.log('\nComponent Status:');
        Object.entries(health.checks).forEach(([name, check]: [string, any]) => {
          console.log(`  ${name}: ${check.status}`);
        });
      }
    } catch {
      console.log('\nUnable to fetch health status');
    }
  } catch (error) {
    console.error('Failed to get status:', error);
    process.exit(1);
  }
}

function fetchHealth(url: string, apiKey?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const client = target.protocol === 'https:' ? https : http;

    const req = client.get(target, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Invalid response (status ${res.statusCode})`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}
