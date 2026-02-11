import { IpFilter } from '../../src/auth/ip-filter';

describe('IpFilter', () => {
  describe('isAllowed', () => {
    it('should allow all IPs when whitelist is empty', () => {
      const filter = new IpFilter({ apiKey: { enabled: false, keys: [] } });
      expect(filter.isAllowed('192.168.1.1')).toBe(true);
      expect(filter.isAllowed('10.0.0.1')).toBe(true);
    });

    it('should block IPs in blacklist', () => {
      const filter = new IpFilter({
        apiKey: { enabled: false, keys: [] },
        ipBlacklist: ['192.168.1.100', '10.0.0.50'],
      });
      expect(filter.isAllowed('192.168.1.100')).toBe(false);
      expect(filter.isAllowed('10.0.0.50')).toBe(false);
      expect(filter.isAllowed('192.168.1.1')).toBe(true);
    });

    it('should allow only whitelisted IPs', () => {
      const filter = new IpFilter({
        apiKey: { enabled: false, keys: [] },
        ipWhitelist: ['192.168.1.1', '10.0.0.1'],
      });
      expect(filter.isAllowed('192.168.1.1')).toBe(true);
      expect(filter.isAllowed('10.0.0.1')).toBe(true);
      expect(filter.isAllowed('172.16.0.1')).toBe(false);
    });

    it('should support CIDR notation in whitelist', () => {
      const filter = new IpFilter({
        apiKey: { enabled: false, keys: [] },
        ipWhitelist: ['192.168.1.0/24'],
      });
      expect(filter.isAllowed('192.168.1.1')).toBe(true);
      expect(filter.isAllowed('192.168.1.255')).toBe(true);
      expect(filter.isAllowed('192.168.2.1')).toBe(false);
    });

    it('should support CIDR notation in blacklist', () => {
      const filter = new IpFilter({
        apiKey: { enabled: false, keys: [] },
        ipBlacklist: ['10.0.0.0/24'],
      });
      expect(filter.isAllowed('10.0.0.1')).toBe(false);
      expect(filter.isAllowed('10.0.0.255')).toBe(false);
      expect(filter.isAllowed('10.0.1.1')).toBe(true);
    });

    it('should prioritize blacklist over whitelist', () => {
      const filter = new IpFilter({
        apiKey: { enabled: false, keys: [] },
        ipWhitelist: ['192.168.1.0/24'],
        ipBlacklist: ['192.168.1.100'],
      });
      expect(filter.isAllowed('192.168.1.1')).toBe(true);
      expect(filter.isAllowed('192.168.1.100')).toBe(false);
    });
  });
});
