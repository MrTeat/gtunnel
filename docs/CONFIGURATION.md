# GTunnel Configuration Guide

## Table of Contents
- [Configuration File](#configuration-file)
- [Environment Variables](#environment-variables)
- [Server Configuration](#server-configuration)
- [Authentication](#authentication)
- [Performance Tuning](#performance-tuning)
- [Monitoring](#monitoring)
- [Sauce Labs Integration](#sauce-labs-integration)

## Configuration File

GTunnel supports both YAML and JSON configuration files.

### Create a configuration file

```bash
gtunnel config --init
```

This creates `gtunnel.config.yml` in your current directory.

### Load configuration file

```bash
gtunnel start --config ./gtunnel.config.yml
```

## Environment Variables

Environment variables take precedence over configuration file settings.

### Server Settings
- `GTUNNEL_HOST` - Server host (default: 0.0.0.0)
- `GTUNNEL_PORT` - Server port (default: 8080)
- `GTUNNEL_TLS_ENABLED` - Enable TLS (true/false)

### Authentication
- `GTUNNEL_API_KEY` - API key for authentication

### Sauce Labs
- `SAUCE_USERNAME` - Sauce Labs username
- `SAUCE_ACCESS_KEY` - Sauce Labs access key
- `SAUCE_TUNNEL_ID` - Tunnel identifier

## Server Configuration

### Basic HTTP Server

```yaml
server:
  host: 0.0.0.0
  port: 8080
  tls:
    enabled: false
```

### HTTPS Server with TLS

```yaml
server:
  host: 0.0.0.0
  port: 8443
  tls:
    enabled: true
    cert: /path/to/certificate.pem
    key: /path/to/private-key.pem
    minVersion: TLSv1.3
```

### HTTPS with Mutual TLS (mTLS)

```yaml
server:
  host: 0.0.0.0
  port: 8443
  tls:
    enabled: true
    cert: /path/to/server-cert.pem
    key: /path/to/server-key.pem
    ca: /path/to/ca-cert.pem
    rejectUnauthorized: true
    minVersion: TLSv1.3
```

## Authentication

### API Key Authentication

```yaml
auth:
  apiKey:
    enabled: true
    keys:
      - name: production
        key: your-secret-api-key-here
      - name: staging
        key: another-api-key
```

**Using API key in requests:**

```bash
curl -H "Authorization: Bearer your-secret-api-key-here" http://localhost:8080/health
```

### IP Whitelisting

```yaml
auth:
  ipWhitelist:
    - 192.168.1.0/24
    - 10.0.0.100
    - 172.16.0.0/16
```

### IP Blacklisting

```yaml
auth:
  ipBlacklist:
    - 203.0.113.0/24
    - 198.51.100.50
```

## Performance Tuning

### Connection Pool

```yaml
performance:
  connectionPool:
    maxSize: 100      # Maximum pool size
    minSize: 10       # Minimum pool size
    idleTimeout: 30000  # Idle timeout in ms
```

### Compression and Protocol Settings

```yaml
performance:
  compression: true   # Enable WebSocket compression
  keepAlive: true     # Enable keep-alive
  http2: true         # Enable HTTP/2
  maxConnections: 1000  # Max concurrent connections
```

## Monitoring

### Metrics Server

```yaml
monitoring:
  metrics:
    enabled: true
    port: 9090
```

Access metrics at: `http://localhost:9090/metrics`

### Web Dashboard

```yaml
monitoring:
  dashboard:
    enabled: true
    port: 8081
```

Access dashboard at: `http://localhost:8081`

### Logging

```yaml
monitoring:
  logging:
    level: info       # debug, info, warn, error
    format: json      # json or text
    file: /var/log/gtunnel.log  # Optional log file
```

**Log levels:**
- `debug` - Detailed debugging information
- `info` - General information messages
- `warn` - Warning messages
- `error` - Error messages only

## Sauce Labs Integration

### Enable Sauce Labs Compatibility

```yaml
sauceLabs:
  compatible: true
  tunnelId: my-tunnel-id
  region: us-west-1
  username: your-sauce-username
  accessKey: your-sauce-access-key
```

### Using CLI

```bash
gtunnel start --sauce-labs \
  --tunnel-id my-tunnel \
  --api-key $SAUCE_ACCESS_KEY
```

### Using Environment Variables

```bash
export SAUCE_USERNAME=your-username
export SAUCE_ACCESS_KEY=your-access-key
export SAUCE_TUNNEL_ID=my-tunnel

gtunnel start
```

## Complete Configuration Example

```yaml
server:
  host: 0.0.0.0
  port: 8080
  tls:
    enabled: true
    cert: /etc/gtunnel/cert.pem
    key: /etc/gtunnel/key.pem
    minVersion: TLSv1.3
    rejectUnauthorized: true

auth:
  apiKey:
    enabled: true
    keys:
      - name: production
        key: ${GTUNNEL_API_KEY}
  ipWhitelist:
    - 192.168.1.0/24
    - 10.0.0.0/8

performance:
  connectionPool:
    maxSize: 200
    minSize: 20
    idleTimeout: 30000
  compression: true
  keepAlive: true
  http2: true
  maxConnections: 2000

monitoring:
  metrics:
    enabled: true
    port: 9090
  dashboard:
    enabled: true
    port: 8081
  logging:
    level: info
    format: json
    file: /var/log/gtunnel.log

sauceLabs:
  compatible: true
  tunnelId: ${SAUCE_TUNNEL_ID}
  username: ${SAUCE_USERNAME}
  accessKey: ${SAUCE_ACCESS_KEY}
```

## Configuration Validation

Validate your configuration before starting:

```bash
gtunnel config --validate
```

This will check for:
- Valid port numbers (1-65535)
- Required TLS files exist when TLS is enabled
- Valid log levels
- Consistent settings

## Best Practices

1. **Use Environment Variables for Secrets**: Never commit API keys or passwords to version control
2. **Enable TLS in Production**: Always use TLS for production deployments
3. **Set Appropriate Connection Limits**: Tune `maxConnections` based on your server capacity
4. **Enable Monitoring**: Always enable metrics and logging in production
5. **Use IP Whitelisting**: Restrict access to known IP ranges when possible
6. **Regular Log Review**: Monitor logs for security events and errors
7. **Keep Configuration Simple**: Start with defaults and tune as needed
