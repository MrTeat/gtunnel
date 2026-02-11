import { GTunnelConfig } from './types';

export const defaultConfig: GTunnelConfig = {
  server: {
    host: '0.0.0.0',
    port: 8080,
    tls: {
      enabled: false,
      minVersion: 'TLSv1.3',
      rejectUnauthorized: true,
    },
  },
  auth: {
    apiKey: {
      enabled: false,
      keys: [],
    },
  },
  performance: {
    connectionPool: {
      maxSize: 100,
      minSize: 10,
      idleTimeout: 30000,
    },
    compression: true,
    keepAlive: true,
    http2: true,
    maxConnections: 1000,
  },
  monitoring: {
    metrics: {
      enabled: true,
      port: 9090,
    },
    dashboard: {
      enabled: true,
      port: 8081,
    },
    logging: {
      level: 'info',
      format: 'json',
    },
  },
  sauceLabs: {
    compatible: false,
  },
};
