# GTunnel API Documentation

## Table of Contents
- [REST API Endpoints](#rest-api-endpoints)
- [WebSocket API](#websocket-api)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## REST API Endpoints

### Root Endpoint

**GET /**

Returns basic service information.

**Response:**
```json
{
  "service": "gtunnel",
  "version": "1.0.0",
  "status": "running"
}
```

### Health Check

**GET /health**

Returns detailed health status of all components.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123456,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "checks": {
    "server": {
      "status": "pass"
    },
    "websocket": {
      "status": "pass"
    }
  }
}
```

**Status Codes:**
- `200` - Service is healthy
- `503` - Service is unhealthy

### Readiness Check

**GET /ready**

Returns whether the service is ready to accept traffic.

**Response:**
```json
{
  "ready": true
}
```

**Status Codes:**
- `200` - Service is ready
- `503` - Service is not ready

### Metrics Endpoint

**GET /metrics** (on metrics port, default 9090)

Returns Prometheus-formatted metrics.

**Response:**
```
# HELP gtunnel_active_connections Number of active tunnel connections
# TYPE gtunnel_active_connections gauge
gtunnel_active_connections 42

# HELP gtunnel_requests_total Total number of requests
# TYPE gtunnel_requests_total counter
gtunnel_requests_total{method="GET",status="200"} 1234

# HELP gtunnel_errors_total Total number of errors
# TYPE gtunnel_errors_total counter
gtunnel_errors_total{type="websocket"} 5

# HELP gtunnel_request_duration_seconds Request duration in seconds
# TYPE gtunnel_request_duration_seconds histogram
gtunnel_request_duration_seconds_bucket{method="GET",le="0.001"} 100
gtunnel_request_duration_seconds_bucket{method="GET",le="0.005"} 200
gtunnel_request_duration_seconds_sum{method="GET"} 12.5
gtunnel_request_duration_seconds_count{method="GET"} 1234

# HELP gtunnel_bytes_in_total Total bytes received
# TYPE gtunnel_bytes_in_total counter
gtunnel_bytes_in_total 1048576

# HELP gtunnel_bytes_out_total Total bytes sent
# TYPE gtunnel_bytes_out_total counter
gtunnel_bytes_out_total 2097152
```

## WebSocket API

### Connection

**WebSocket Endpoint:** `/tunnel`

**URL:** `ws://localhost:8080/tunnel` or `wss://localhost:8080/tunnel`

### Message Format

All messages are JSON-encoded:

```json
{
  "type": "message_type",
  "data": { }
}
```

### Message Types

#### Welcome Message (Server → Client)

Sent immediately after connection is established.

```json
{
  "type": "welcome",
  "timestamp": 1705315800000
}
```

#### Ping (Client → Server)

Request a pong response.

```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong",
  "timestamp": 1705315800000
}
```

#### Echo (Client → Server)

Echo data back to client.

```json
{
  "type": "echo",
  "data": "test message"
}
```

**Response:**
```json
{
  "type": "echo",
  "data": "test message"
}
```

### Binary Messages

Binary data can be sent directly as WebSocket binary frames. The server will echo back binary data.

### Connection Events

#### Connection Opened
- Server sends welcome message
- Connection is tracked in metrics
- Keepalive mechanism starts

#### Connection Closed
- Connection is removed from tracking
- Metrics are updated
- Resources are cleaned up

#### Connection Error
- Error is logged
- Metrics are updated
- Connection may be terminated

## Authentication

### API Key Authentication

Include API key in the `Authorization` header:

```
Authorization: Bearer your-api-key-here
```

**Example:**
```bash
curl -H "Authorization: Bearer secret123" http://localhost:8080/health
```

### WebSocket Authentication

For WebSocket connections, pass the API key as a query parameter or header during the upgrade request:

```javascript
const ws = new WebSocket('ws://localhost:8080/tunnel', {
  headers: {
    'Authorization': 'Bearer your-api-key-here'
  }
});
```

## Error Handling

### HTTP Errors

**401 Unauthorized**
```json
{
  "error": "Unauthorized: Invalid or missing API key"
}
```

**403 Forbidden**
```json
{
  "error": "Forbidden: IP address not allowed"
}
```

**404 Not Found**
```json
{
  "error": "Not Found"
}
```

**429 Too Many Requests**
```json
{
  "error": "Too Many Requests",
  "retryAfter": 30
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error"
}
```

### WebSocket Errors

WebSocket errors are logged but not sent to the client. The connection will be closed with an appropriate close code.

**Close Codes:**
- `1000` - Normal closure
- `1001` - Going away
- `1002` - Protocol error
- `1008` - Policy violation (e.g., authentication failure)
- `1011` - Internal server error

## Rate Limiting

### Default Limits

- **100 requests per minute** per IP address
- Rate limit is applied to HTTP requests and WebSocket connections

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705315860000
```

### Rate Limit Exceeded

When rate limit is exceeded, the server returns:

**Status:** `429 Too Many Requests`

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705315860000
```

**Body:**
```json
{
  "error": "Too Many Requests",
  "retryAfter": 30
}
```

## Examples

### JavaScript/Node.js

```javascript
const WebSocket = require('ws');

// Connect to tunnel
const ws = new WebSocket('ws://localhost:8080/tunnel', {
  headers: {
    'Authorization': 'Bearer your-api-key'
  }
});

ws.on('open', () => {
  console.log('Connected to tunnel');
  
  // Send ping
  ws.send(JSON.stringify({ type: 'ping' }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received:', message);
});

ws.on('close', () => {
  console.log('Connection closed');
});

ws.on('error', (error) => {
  console.error('Error:', error);
});
```

### Python

```python
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    print(f"Received: {data}")

def on_open(ws):
    print("Connected to tunnel")
    ws.send(json.dumps({"type": "ping"}))

ws = websocket.WebSocketApp(
    "ws://localhost:8080/tunnel",
    header={"Authorization": "Bearer your-api-key"},
    on_message=on_message,
    on_open=on_open
)

ws.run_forever()
```

### curl

```bash
# Health check
curl http://localhost:8080/health

# With authentication
curl -H "Authorization: Bearer your-api-key" http://localhost:8080/health

# Metrics
curl http://localhost:9090/metrics
```

## Programmatic API

### TypeScript/JavaScript

```typescript
import { TunnelServer, getConfigLoader } from 'gtunnel';

// Create configuration
const configLoader = getConfigLoader();
configLoader.setConfig({
  server: {
    host: '0.0.0.0',
    port: 8080,
    tls: { enabled: false }
  }
});

// Create and start server
const server = new TunnelServer(configLoader.getConfig());
await server.start();

console.log('Server info:', server.getInfo());

// Stop server
await server.stop();
```
