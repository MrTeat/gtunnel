import { AuthConfig } from '../config/types';
import { getLogger } from '../monitoring/logger';

export class ApiKeyAuth {
  private config: AuthConfig['apiKey'];
  private logger = getLogger();

  constructor(config: AuthConfig['apiKey']) {
    this.config = config;
  }

  /**
   * Validate API key
   */
  validate(apiKey: string): boolean {
    if (!this.config.enabled) {
      return true;
    }

    const isValid = this.config.keys.some(k => k.key === apiKey);
    
    if (!isValid) {
      this.logger.warn('Invalid API key attempt', { apiKey: apiKey.substring(0, 8) + '...' });
    }

    return isValid;
  }

  /**
   * Get API key from request headers
   */
  extractFromHeader(headers: { [key: string]: string | string[] | undefined }): string | null {
    const authHeader = headers['authorization'];
    
    if (!authHeader) {
      return null;
    }

    const authValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    
    // Support both "Bearer <token>" and plain token
    if (authValue.startsWith('Bearer ')) {
      return authValue.substring(7);
    }

    return authValue;
  }

  /**
   * Middleware function for authentication
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      if (!this.config.enabled) {
        return next();
      }

      const apiKey = this.extractFromHeader(req.headers);
      
      if (!apiKey || !this.validate(apiKey)) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Unauthorized: Invalid or missing API key' }));
        return;
      }

      next();
    };
  }
}
