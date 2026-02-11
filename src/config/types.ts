export interface TLSConfig {
  enabled: boolean;
  cert?: string;
  key?: string;
  ca?: string;
  minVersion?: string;
  ciphers?: string;
  rejectUnauthorized?: boolean;
}

export interface ServerConfig {
  host: string;
  port: number;
  tls: TLSConfig;
}

export interface AuthConfig {
  apiKey: {
    enabled: boolean;
    keys: Array<{ name: string; key: string }>;
  };
  ipWhitelist?: string[];
  ipBlacklist?: string[];
}

export interface PerformanceConfig {
  connectionPool: {
    maxSize: number;
    minSize: number;
    idleTimeout: number;
  };
  compression: boolean;
  keepAlive: boolean;
  http2: boolean;
  maxConnections: number;
}

export interface MonitoringConfig {
  metrics: {
    enabled: boolean;
    port: number;
  };
  dashboard: {
    enabled: boolean;
    port: number;
  };
  logging: {
    level: string;
    format: string;
    file?: string;
  };
}

export interface SauceLabsConfig {
  compatible: boolean;
  tunnelId?: string;
  region?: string;
  username?: string;
  accessKey?: string;
}

export interface GTunnelConfig {
  server: ServerConfig;
  auth: AuthConfig;
  performance: PerformanceConfig;
  monitoring: MonitoringConfig;
  sauceLabs: SauceLabsConfig;
}
