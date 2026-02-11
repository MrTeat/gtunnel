import { AuthConfig } from '../config/types';
import { getLogger } from '../monitoring/logger';

export class IpFilter {
  private whitelist: string[];
  private blacklist: string[];
  private logger = getLogger();

  constructor(config: AuthConfig) {
    this.whitelist = config.ipWhitelist || [];
    this.blacklist = config.ipBlacklist || [];
  }

  /**
   * Check if an IP address is allowed
   */
  isAllowed(ip: string): boolean {
    // Check blacklist first
    if (this.isInList(ip, this.blacklist)) {
      this.logger.warn('IP blocked by blacklist', { ip });
      return false;
    }

    // If whitelist is empty, allow all (except blacklisted)
    if (this.whitelist.length === 0) {
      return true;
    }

    // Check whitelist
    const allowed = this.isInList(ip, this.whitelist);
    
    if (!allowed) {
      this.logger.warn('IP not in whitelist', { ip });
    }

    return allowed;
  }

  /**
   * Check if IP is in a list (supports CIDR notation)
   */
  private isInList(ip: string, list: string[]): boolean {
    for (const entry of list) {
      if (entry.includes('/')) {
        // CIDR notation
        if (this.isInCidr(ip, entry)) {
          return true;
        }
      } else {
        // Exact match
        if (ip === entry) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if IP is in CIDR range
   */
  private isInCidr(ip: string, cidr: string): boolean {
    const [range, bits] = cidr.split('/');
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);
    
    const ipNum = this.ipToNumber(ip);
    const rangeNum = this.ipToNumber(range);
    
    return (ipNum & mask) === (rangeNum & mask);
  }

  /**
   * Convert IP string to number
   */
  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  /**
   * Middleware function for IP filtering
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      const ip = req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
      const clientIp = Array.isArray(ip) ? ip[0] : ip;

      if (!this.isAllowed(clientIp)) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Forbidden: IP address not allowed' }));
        return;
      }

      next();
    };
  }
}
