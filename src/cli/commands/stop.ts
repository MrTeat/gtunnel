import * as fs from 'fs';
import * as path from 'path';

const STOP_POLL_INTERVAL_MS = 500;
const STOP_MAX_ATTEMPTS = 10;

const PID_FILE = path.join(process.cwd(), '.gtunnel.pid');

export async function stopCommand(): Promise<void> {
  try {
    if (!fs.existsSync(PID_FILE)) {
      console.log('Tunnel is not running');
      return;
    }

    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
    
    console.log(`Stopping tunnel (PID: ${pid})...`);
    
    try {
      process.kill(pid, 'SIGTERM');
      
      // Wait for process to stop
      let attempts = 0;
      while (attempts < STOP_MAX_ATTEMPTS) {
        try {
          process.kill(pid, 0);  // Check if process exists
          await new Promise(resolve => setTimeout(resolve, STOP_POLL_INTERVAL_MS));
          attempts++;
        } catch {
          // Process stopped
          break;
        }
      }
      
      // Force kill if still running
      if (attempts >= STOP_MAX_ATTEMPTS) {
        console.log('Process not responding, forcing stop...');
        process.kill(pid, 'SIGKILL');
      }
      
      fs.unlinkSync(PID_FILE);
      console.log('✓ Tunnel stopped');
    } catch (error: any) {
      if (error.code === 'ESRCH') {
        // Process doesn't exist
        fs.unlinkSync(PID_FILE);
        console.log('Tunnel process not found, cleaned up PID file');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Failed to stop tunnel:', error);
    process.exit(1);
  }
}
