import { Registry, Counter, Gauge, Histogram } from 'prom-client';

export class MetricsCollector {
  private registry: Registry;
  private activeConnections: Gauge;
  private totalRequests: Counter;
  private totalErrors: Counter;
  private requestDuration: Histogram;
  private bytesIn: Counter;
  private bytesOut: Counter;

  constructor() {
    this.registry = new Registry();

    // Active connections gauge
    this.activeConnections = new Gauge({
      name: 'gtunnel_active_connections',
      help: 'Number of active tunnel connections',
      registers: [this.registry],
    });

    // Total requests counter
    this.totalRequests = new Counter({
      name: 'gtunnel_requests_total',
      help: 'Total number of requests',
      labelNames: ['method', 'status'],
      registers: [this.registry],
    });

    // Total errors counter
    this.totalErrors = new Counter({
      name: 'gtunnel_errors_total',
      help: 'Total number of errors',
      labelNames: ['type'],
      registers: [this.registry],
    });

    // Request duration histogram
    this.requestDuration = new Histogram({
      name: 'gtunnel_request_duration_seconds',
      help: 'Request duration in seconds',
      labelNames: ['method'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
      registers: [this.registry],
    });

    // Bytes in counter
    this.bytesIn = new Counter({
      name: 'gtunnel_bytes_in_total',
      help: 'Total bytes received',
      registers: [this.registry],
    });

    // Bytes out counter
    this.bytesOut = new Counter({
      name: 'gtunnel_bytes_out_total',
      help: 'Total bytes sent',
      registers: [this.registry],
    });
  }

  incrementActiveConnections(): void {
    this.activeConnections.inc();
  }

  decrementActiveConnections(): void {
    this.activeConnections.dec();
  }

  recordRequest(method: string, status: number): void {
    this.totalRequests.inc({ method, status: status.toString() });
  }

  recordError(type: string): void {
    this.totalErrors.inc({ type });
  }

  recordRequestDuration(method: string, durationSeconds: number): void {
    this.requestDuration.observe({ method }, durationSeconds);
  }

  recordBytesIn(bytes: number): void {
    this.bytesIn.inc(bytes);
  }

  recordBytesOut(bytes: number): void {
    this.bytesOut.inc(bytes);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getRegistry(): Registry {
    return this.registry;
  }
}

let metricsInstance: MetricsCollector | null = null;

export function getMetrics(): MetricsCollector {
  if (!metricsInstance) {
    metricsInstance = new MetricsCollector();
  }
  return metricsInstance;
}
