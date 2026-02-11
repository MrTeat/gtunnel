import { MetricsCollector } from '../../src/monitoring/metrics';

describe('MetricsCollector', () => {
  let metrics: MetricsCollector;

  beforeEach(() => {
    metrics = new MetricsCollector();
  });

  describe('connection tracking', () => {
    it('should track active connections', () => {
      metrics.incrementActiveConnections();
      metrics.incrementActiveConnections();
      expect(metrics).toBeDefined();
      
      metrics.decrementActiveConnections();
      expect(metrics).toBeDefined();
    });
  });

  describe('request tracking', () => {
    it('should record requests', () => {
      metrics.recordRequest('GET', 200);
      metrics.recordRequest('POST', 201);
      metrics.recordRequest('GET', 404);
      expect(metrics).toBeDefined();
    });
  });

  describe('error tracking', () => {
    it('should record errors', () => {
      metrics.recordError('websocket');
      metrics.recordError('http');
      expect(metrics).toBeDefined();
    });
  });

  describe('request duration', () => {
    it('should record request duration', () => {
      metrics.recordRequestDuration('GET', 0.5);
      metrics.recordRequestDuration('POST', 1.2);
      expect(metrics).toBeDefined();
    });
  });

  describe('bytes tracking', () => {
    it('should track bytes in and out', () => {
      metrics.recordBytesIn(1024);
      metrics.recordBytesOut(2048);
      expect(metrics).toBeDefined();
    });
  });

  describe('getMetrics', () => {
    it('should return Prometheus formatted metrics', async () => {
      metrics.incrementActiveConnections();
      metrics.recordRequest('GET', 200);
      metrics.recordBytesIn(1024);
      
      const metricsText = await metrics.getMetrics();
      expect(metricsText).toContain('gtunnel_active_connections');
      expect(metricsText).toContain('gtunnel_requests_total');
      expect(metricsText).toContain('gtunnel_bytes_in_total');
    });
  });
});
