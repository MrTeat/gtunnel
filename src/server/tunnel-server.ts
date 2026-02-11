import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import { GTunnelConfig } from '../config/types';
import { WebSocketHandler } from './websocket-handler';
import { getLogger } from '../monitoring/logger';
import { getMetrics } from '../monitoring/metrics';
import { getHealthCheck } from '../monitoring/health-check';
import { ApiKeyAuth } from '../auth/api-key-auth';
import { IpFilter } from '../auth/ip-filter';
import { RateLimiter } from '../security/rate-limiter';

export class TunnelServer {
  private config: GTunnelConfig;
  private server: http.Server | https.Server;
  private wsHandler: WebSocketHandler | null = null;
  private metricsServer: http.Server | null = null;
  private dashboardServer: http.Server | null = null;
  private logger = getLogger();
  private metrics = getMetrics();
  private healthCheck = getHealthCheck();
  private apiKeyAuth: ApiKeyAuth;
  private ipFilter: IpFilter;
  private rateLimiter: RateLimiter;

  constructor(config: GTunnelConfig) {
    this.config = config;
    this.apiKeyAuth = new ApiKeyAuth(config.auth.apiKey);
    this.ipFilter = new IpFilter(config.auth);
    this.rateLimiter = new RateLimiter({
      windowMs: 60000,
      maxRequests: 100,
    });

    // Create HTTP or HTTPS server
    if (config.server.tls.enabled) {
      this.server = this.createHttpsServer();
    } else {
      this.server = this.createHttpServer();
    }

    this.setupHealthChecks();
  }

  private createHttpServer(): http.Server {
    return http.createServer((req, res) => {
      this.handleHttpRequest(req, res);
    });
  }

  private createHttpsServer(): https.Server {
    const options: https.ServerOptions = {
      cert: fs.readFileSync(this.config.server.tls.cert!),
      key: fs.readFileSync(this.config.server.tls.key!),
      minVersion: this.config.server.tls.minVersion as any,
    };

    if (this.config.server.tls.ca) {
      options.ca = fs.readFileSync(this.config.server.tls.ca);
      options.requestCert = true;
      options.rejectUnauthorized = this.config.server.tls.rejectUnauthorized;
    }

    return https.createServer(options, (req, res) => {
      this.handleHttpRequest(req, res);
    });
  }

  private handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    // Apply middleware
    const middlewares = [
      this.ipFilter.middleware(),
      this.rateLimiter.middleware(),
      this.apiKeyAuth.middleware(),
    ];

    let index = 0;
    const next = () => {
      if (index < middlewares.length) {
        middlewares[index++](req, res, next);
      } else {
        this.routeRequest(req, res);
      }
    };

    next();
  }

  private routeRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url || '/';

    if (url === '/health') {
      this.handleHealth(req, res);
    } else if (url === '/ready') {
      this.handleReady(req, res);
    } else if (url === '/') {
      this.handleRoot(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  }

  private async handleHealth(_req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const health = await this.healthCheck.getHealth();
    res.writeHead(health.status === 'healthy' ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health));
  }

  private async handleReady(_req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const ready = await this.healthCheck.getReadiness();
    res.writeHead(ready.ready ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ready));
  }

  private handleRoot(_req: http.IncomingMessage, res: http.ServerResponse): void {
    // Read version from package.json
    let version = '1.0.0';
    try {
      const packageJson = require('../../package.json');
      version = packageJson.version;
    } catch {
      version = process.env.npm_package_version || '1.0.0';
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      service: 'gtunnel',
      version,
      status: 'running',
    }));
  }

  private setupHealthChecks(): void {
    // Register basic health check
    this.healthCheck.registerCheck('server', async () => {
      return this.server.listening;
    });

    // Register WebSocket health check
    this.healthCheck.registerCheck('websocket', async () => {
      return this.wsHandler !== null;
    });
  }

  /**
   * Start the tunnel server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Start main server
        this.server.listen(this.config.server.port, this.config.server.host, () => {
          this.logger.info('Tunnel server started', {
            host: this.config.server.host,
            port: this.config.server.port,
            tls: this.config.server.tls.enabled,
          });

          // Initialize WebSocket handler
          this.wsHandler = new WebSocketHandler({
            server: this.server,
            path: '/tunnel',
            perMessageDeflate: this.config.performance.compression,
          });

          // Start keepalive
          this.wsHandler.startKeepalive();

          // Start metrics server
          if (this.config.monitoring.metrics.enabled) {
            this.startMetricsServer();
          }

          // Start dashboard server
          if (this.config.monitoring.dashboard.enabled) {
            this.startDashboardServer();
          }

          resolve();
        });

        this.server.on('error', (error) => {
          this.logger.error('Server error', { error: error.message });
          reject(error);
        });
      } catch (error) {
        this.logger.error('Failed to start server', { error });
        reject(error);
      }
    });
  }

  private startMetricsServer(): void {
    this.metricsServer = http.createServer(async (req, res) => {
      if (req.url === '/metrics') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        const metrics = await this.metrics.getMetrics();
        res.end(metrics);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    this.metricsServer.listen(this.config.monitoring.metrics.port, () => {
      this.logger.info('Metrics server started', {
        port: this.config.monitoring.metrics.port,
      });
    });
  }

  private startDashboardServer(): void {
    this.dashboardServer = http.createServer((req, res) => {
      if (req.url === '/') {
        this.serveDashboard(res);
      } else if (req.url === '/api/stats') {
        this.serveStats(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    this.dashboardServer.listen(this.config.monitoring.dashboard.port, () => {
      this.logger.info('Dashboard server started', {
        port: this.config.monitoring.dashboard.port,
      });
    });
  }

  private serveDashboard(res: http.ServerResponse): void {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>GTunnel Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #333; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-card h2 { margin: 0 0 10px 0; font-size: 16px; color: #666; }
    .stat-card .value { font-size: 32px; font-weight: bold; color: #007bff; }
    .refresh { margin-top: 20px; }
  </style>
</head>
<body>
  <h1>GTunnel Dashboard</h1>
  <div class="stats" id="stats"></div>
  <div class="refresh">
    <button onclick="loadStats()">Refresh</button>
    Auto-refresh: <input type="checkbox" id="autoRefresh" checked> 
  </div>
  
  <script>
    function loadStats() {
      fetch('/api/stats')
        .then(r => r.json())
        .then(data => {
          const html = Object.keys(data).map(key => 
            '<div class="stat-card"><h2>' + key + '</h2><div class="value">' + data[key] + '</div></div>'
          ).join('');
          document.getElementById('stats').innerHTML = html;
        });
    }
    
    loadStats();
    setInterval(() => {
      if (document.getElementById('autoRefresh').checked) {
        loadStats();
      }
    }, 5000);
  </script>
</body>
</html>
    `;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  private serveStats(res: http.ServerResponse): void {
    const stats = {
      'Active Connections': this.wsHandler?.getConnectionCount() || 0,
      'Uptime': Math.floor(process.uptime()),
      'Memory (MB)': Math.floor(process.memoryUsage().heapUsed / 1024 / 1024),
      'Node Version': process.version,
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
  }

  /**
   * Stop the tunnel server
   */
  async stop(): Promise<void> {
    this.logger.info('Stopping tunnel server');

    if (this.wsHandler) {
      await this.wsHandler.close();
    }

    return new Promise((resolve) => {
      this.server.close(() => {
        this.logger.info('Server closed');
        
        if (this.metricsServer) {
          this.metricsServer.close();
        }
        
        if (this.dashboardServer) {
          this.dashboardServer.close();
        }
        
        resolve();
      });
    });
  }

  /**
   * Get server info
   */
  getInfo() {
    return {
      host: this.config.server.host,
      port: this.config.server.port,
      tls: this.config.server.tls.enabled,
      connections: this.wsHandler?.getConnectionCount() || 0,
    };
  }
}
