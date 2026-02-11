import * as WebSocket from 'ws';
import * as http from 'http';
import * as https from 'https';
import { getLogger } from '../monitoring/logger';
import { getMetrics } from '../monitoring/metrics';

export interface WebSocketHandlerOptions {
  server: http.Server | https.Server;
  path?: string;
  perMessageDeflate?: boolean;
}

export class WebSocketHandler {
  private wss: WebSocket.Server;
  private logger = getLogger();
  private metrics = getMetrics();
  private connections: Set<WebSocket> = new Set();

  constructor(options: WebSocketHandlerOptions) {
    this.wss = new WebSocket.Server({
      server: options.server,
      path: options.path || '/tunnel',
      perMessageDeflate: options.perMessageDeflate !== false ? {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3,
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024,
        },
        threshold: 1024,
      } : false,
    });

    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error: Error) => {
      this.logger.error('WebSocket server error', { error: error.message, stack: error.stack });
    });
  }

  private handleConnection(ws: WebSocket, req: http.IncomingMessage): void {
    const clientId = req.socket.remoteAddress || 'unknown';
    this.logger.info('New WebSocket connection', { clientId });
    
    this.connections.add(ws);
    this.metrics.incrementActiveConnections();

    ws.on('message', (data: WebSocket.Data) => {
      this.handleMessage(ws, data, clientId);
    });

    ws.on('close', () => {
      this.logger.info('WebSocket connection closed', { clientId });
      this.connections.delete(ws);
      this.metrics.decrementActiveConnections();
    });

    ws.on('error', (error: Error) => {
      this.logger.error('WebSocket error', { clientId, error: error.message });
      this.metrics.recordError('websocket');
    });

    ws.on('pong', () => {
      // Handle pong for keepalive
      (ws as any).isAlive = true;
    });

    // Mark as alive
    (ws as any).isAlive = true;

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      timestamp: Date.now(),
    }));
  }

  private handleMessage(ws: WebSocket, data: WebSocket.Data, clientId: string): void {
    try {
      const startTime = Date.now();

      // Handle binary data
      if (Buffer.isBuffer(data)) {
        this.metrics.recordBytesIn(data.length);
        this.handleBinaryMessage(ws, data);
      } else {
        // Handle text data
        const message = data.toString();
        this.metrics.recordBytesIn(message.length);
        this.handleTextMessage(ws, message, clientId);
      }

      const duration = (Date.now() - startTime) / 1000;
      this.metrics.recordRequestDuration('websocket', duration);
    } catch (error) {
      this.logger.error('Error handling message', { 
        clientId, 
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.metrics.recordError('message_handling');
    }
  }

  private handleBinaryMessage(ws: WebSocket, data: Buffer): void {
    // Echo back binary data for now (will be replaced with actual proxy logic)
    ws.send(data);
    this.metrics.recordBytesOut(data.length);
  }

  private handleTextMessage(ws: WebSocket, message: string, clientId: string): void {
    try {
      const parsed = JSON.parse(message);
      
      this.logger.debug('Received message', { clientId, type: parsed.type });

      // Handle different message types
      switch (parsed.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
        case 'echo':
          ws.send(JSON.stringify({ type: 'echo', data: parsed.data }));
          break;
        default:
          this.logger.warn('Unknown message type', { clientId, type: parsed.type });
      }
    } catch (error) {
      this.logger.error('Error parsing message', { clientId, error });
    }
  }

  /**
   * Start keepalive ping/pong
   */
  startKeepalive(intervalMs: number = 30000): void {
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if ((ws as any).isAlive === false) {
          this.logger.warn('Terminating inactive connection');
          return ws.terminate();
        }

        (ws as any).isAlive = false;
        ws.ping();
      });
    }, intervalMs);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: string | Buffer): void {
    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Get number of active connections
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Close all connections and shutdown
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.wss.close(() => {
        this.logger.info('WebSocket server closed');
        resolve();
      });
    });
  }
}
