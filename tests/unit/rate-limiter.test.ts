import { RateLimiter } from '../../src/security/rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      windowMs: 1000,
      maxRequests: 3,
    });
  });

  describe('checkLimit', () => {
    it('should allow requests within limit', () => {
      const result1 = rateLimiter.checkLimit('client1');
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = rateLimiter.checkLimit('client1');
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = rateLimiter.checkLimit('client1');
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests exceeding limit', () => {
      rateLimiter.checkLimit('client1');
      rateLimiter.checkLimit('client1');
      rateLimiter.checkLimit('client1');
      
      const result = rateLimiter.checkLimit('client1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track different clients separately', () => {
      const result1 = rateLimiter.checkLimit('client1');
      expect(result1.allowed).toBe(true);

      const result2 = rateLimiter.checkLimit('client2');
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(2);
    });

    it('should reset limit after window expires', async () => {
      rateLimiter.checkLimit('client1');
      rateLimiter.checkLimit('client1');
      rateLimiter.checkLimit('client1');
      
      // Exceeded limit
      let result = rateLimiter.checkLimit('client1');
      expect(result.allowed).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be allowed again
      result = rateLimiter.checkLimit('client1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      rateLimiter.destroy();
      expect(rateLimiter).toBeDefined();
    });
  });

  afterEach(() => {
    rateLimiter.destroy();
  });
});
