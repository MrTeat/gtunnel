import { ApiKeyAuth } from '../../src/auth/api-key-auth';

describe('ApiKeyAuth', () => {
  describe('validate', () => {
    it('should return true when auth is disabled', () => {
      const auth = new ApiKeyAuth({ enabled: false, keys: [] });
      expect(auth.validate('any-key')).toBe(true);
    });

    it('should return true for valid API key', () => {
      const auth = new ApiKeyAuth({
        enabled: true,
        keys: [
          { name: 'test', key: 'valid-key' },
        ],
      });
      expect(auth.validate('valid-key')).toBe(true);
    });

    it('should return false for invalid API key', () => {
      const auth = new ApiKeyAuth({
        enabled: true,
        keys: [
          { name: 'test', key: 'valid-key' },
        ],
      });
      expect(auth.validate('invalid-key')).toBe(false);
    });

    it('should validate against multiple keys', () => {
      const auth = new ApiKeyAuth({
        enabled: true,
        keys: [
          { name: 'key1', key: 'first-key' },
          { name: 'key2', key: 'second-key' },
        ],
      });
      expect(auth.validate('first-key')).toBe(true);
      expect(auth.validate('second-key')).toBe(true);
      expect(auth.validate('invalid-key')).toBe(false);
    });
  });

  describe('extractFromHeader', () => {
    let auth: ApiKeyAuth;

    beforeEach(() => {
      auth = new ApiKeyAuth({ enabled: true, keys: [] });
    });

    it('should extract Bearer token', () => {
      const headers = { authorization: 'Bearer test-token' };
      expect(auth.extractFromHeader(headers)).toBe('test-token');
    });

    it('should extract plain token', () => {
      const headers = { authorization: 'plain-token' };
      expect(auth.extractFromHeader(headers)).toBe('plain-token');
    });

    it('should return null when no authorization header', () => {
      const headers = {};
      expect(auth.extractFromHeader(headers)).toBeNull();
    });

    it('should handle array authorization header', () => {
      const headers = { authorization: ['Bearer test-token'] };
      expect(auth.extractFromHeader(headers)).toBe('test-token');
    });
  });
});
