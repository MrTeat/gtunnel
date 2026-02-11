import { HealthCheck } from '../../src/monitoring/health-check';

describe('HealthCheck', () => {
  let healthCheck: HealthCheck;

  beforeEach(() => {
    healthCheck = new HealthCheck();
  });

  describe('registerCheck', () => {
    it('should register a health check', () => {
      healthCheck.registerCheck('test', async () => true);
      expect(healthCheck).toBeDefined();
    });
  });

  describe('getHealth', () => {
    it('should return healthy status when all checks pass', async () => {
      healthCheck.registerCheck('check1', async () => true);
      healthCheck.registerCheck('check2', async () => true);

      const health = await healthCheck.getHealth();
      expect(health.status).toBe('healthy');
      expect(health.checks.check1.status).toBe('pass');
      expect(health.checks.check2.status).toBe('pass');
    });

    it('should return unhealthy status when any check fails', async () => {
      healthCheck.registerCheck('check1', async () => true);
      healthCheck.registerCheck('check2', async () => false);

      const health = await healthCheck.getHealth();
      expect(health.status).toBe('unhealthy');
      expect(health.checks.check1.status).toBe('pass');
      expect(health.checks.check2.status).toBe('fail');
    });

    it('should handle check exceptions', async () => {
      healthCheck.registerCheck('failing', async () => {
        throw new Error('Check failed');
      });

      const health = await healthCheck.getHealth();
      expect(health.status).toBe('unhealthy');
      expect(health.checks.failing.status).toBe('fail');
      expect(health.checks.failing.message).toContain('Check failed');
    });

    it('should include uptime and timestamp', async () => {
      const health = await healthCheck.getHealth();
      expect(health.uptime).toBeGreaterThanOrEqual(0);
      expect(health.timestamp).toBeDefined();
      expect(health.version).toBeDefined();
    });
  });

  describe('getReadiness', () => {
    it('should return ready when healthy', async () => {
      healthCheck.registerCheck('test', async () => true);

      const readiness = await healthCheck.getReadiness();
      expect(readiness.ready).toBe(true);
    });

    it('should return not ready when unhealthy', async () => {
      healthCheck.registerCheck('test', async () => false);

      const readiness = await healthCheck.getReadiness();
      expect(readiness.ready).toBe(false);
    });
  });
});
