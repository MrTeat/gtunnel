import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

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
      const health = await fetchHealth();
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

function fetchHealth(): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:8080/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid response'));
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
