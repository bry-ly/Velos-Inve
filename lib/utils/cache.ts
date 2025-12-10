/**
 * Simple in-memory cache for frequently accessed data
 * Helps reduce database queries for analytics and dashboard data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get data from cache
   * Returns null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with TTL (time to live) in milliseconds
   */
  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all cache entries matching a pattern
   */
  deletePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    const regex = new RegExp(pattern);
    
    keys.forEach((key) => {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

// Export singleton instance
export const cache = new InMemoryCache();

// Cache key generators for common data types
export const cacheKeys = {
  analytics: (userId: string) => `analytics:${userId}`,
  lowStockProducts: (userId: string) => `lowStock:${userId}`,
  stockAlerts: (userId: string) => `stockAlerts:${userId}`,
  categoryBreakdown: (userId: string) => `categoryBreakdown:${userId}`,
  manufacturerBreakdown: (userId: string) => `manufacturerBreakdown:${userId}`,
  recentSales: (userId: string, limit: number) => `recentSales:${userId}:${limit}`,
  forecast: (userId: string, days: number) => `forecast:${userId}:${days}`,
  productDemand: (userId: string, productId: string) => `demand:${userId}:${productId}`,
};

// Cache TTL constants (in milliseconds)
export const cacheTTL = {
  analytics: 5 * 60 * 1000, // 5 minutes
  lowStock: 2 * 60 * 1000, // 2 minutes
  alerts: 1 * 60 * 1000, // 1 minute
  sales: 5 * 60 * 1000, // 5 minutes
  forecast: 10 * 60 * 1000, // 10 minutes
  breakdown: 5 * 60 * 1000, // 5 minutes
};

/**
 * Invalidate cache entries for a specific user
 * Call this after any data modification (create, update, delete)
 */
export function invalidateUserCache(userId: string): void {
  cache.deletePattern(`^.*:${userId}(:|$)`);
}

/**
 * Cached wrapper function
 * Automatically handles caching logic for async functions
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Not in cache, execute function
  const result = await fn();
  
  // Store in cache
  cache.set(key, result, ttl);
  
  return result;
}

// Run cleanup every 5 minutes
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}
