export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  timestamp: string;
  version: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail';
      message?: string;
    };
  };
}

export class HealthCheck {
  private startTime: number;
  private checks: Map<string, () => Promise<boolean>>;

  constructor() {
    this.startTime = Date.now();
    this.checks = new Map();
  }

  /**
   * Register a health check
   */
  registerCheck(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check);
  }

  /**
   * Get current health status
   */
  async getHealth(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = {};
    let allHealthy = true;

    for (const [name, check] of this.checks) {
      try {
        const result = await check();
        checks[name] = {
          status: result ? 'pass' : 'fail',
          message: result ? undefined : 'Check failed',
        };
        if (!result) {
          allHealthy = false;
        }
      } catch (error) {
        checks[name] = {
          status: 'fail',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
        allHealthy = false;
      }
    }

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      checks,
    };
  }

  /**
   * Get readiness status
   */
  async getReadiness(): Promise<{ ready: boolean }> {
    const health = await this.getHealth();
    return { ready: health.status === 'healthy' };
  }
}

let healthCheckInstance: HealthCheck | null = null;

export function getHealthCheck(): HealthCheck {
  if (!healthCheckInstance) {
    healthCheckInstance = new HealthCheck();
  }
  return healthCheckInstance;
}
