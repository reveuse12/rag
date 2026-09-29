/**
 * Production-Grade In-Memory Sliding Window Rate Limiter
 * Designed for 1,000+ concurrent users with zero external dependency overhead.
 * Automatically evicts stale rate-limit buckets to maintain low memory footprint.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class RateLimiter {
  private map: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-cleanup expired buckets every 60 seconds
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Check if a request exceeds rate limit
   * @param key Unique key (e.g. `chat:${userId}` or `ip:${ipAddress}`)
   * @param limit Maximum number of requests allowed in window
   * @param windowMs Window duration in milliseconds (default: 10 seconds)
   * @returns { success: boolean, remaining: number, resetMs: number }
   */
  public check(
    key: string,
    limit: number = 10,
    windowMs: number = 10_000
  ): { success: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const record = this.map.get(key) || { timestamps: [] };

    // Filter out timestamps outside window
    const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (validTimestamps.length >= limit) {
      const oldest = validTimestamps[0];
      const resetMs = Math.max(0, windowMs - (now - oldest));
      return {
        success: false,
        remaining: 0,
        resetMs,
      };
    }

    validTimestamps.push(now);
    this.map.set(key, { timestamps: validTimestamps });

    return {
      success: true,
      remaining: limit - validTimestamps.length,
      resetMs: windowMs,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.map.entries()) {
      const valid = record.timestamps.filter((ts) => now - ts < 60_000);
      if (valid.length === 0) {
        this.map.delete(key);
      } else {
        this.map.set(key, { timestamps: valid });
      }
    }
  }
}

// Global instance to survive warm serverless invocations
const globalLimiterStore = globalThis as unknown as {
  __CITYCIRCLE_RATE_LIMITER__?: RateLimiter;
};

if (!globalLimiterStore.__CITYCIRCLE_RATE_LIMITER__) {
  globalLimiterStore.__CITYCIRCLE_RATE_LIMITER__ = new RateLimiter();
}

export const rateLimiter = globalLimiterStore.__CITYCIRCLE_RATE_LIMITER__;
