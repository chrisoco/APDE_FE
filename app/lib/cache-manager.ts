/**
 * Cache management utilities for React Router data fetching
 * Provides cache invalidation patterns for efficient data updates
 */

// Cache tags for different data types
export const CACHE_TAGS = {
  CAMPAIGNS: 'campaigns',
  PROSPECTS: 'prospects', 
  LANDINGPAGES: 'landingpages',
  USER: 'user'
} as const;

// In-memory cache for client-side data
const clientCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  tags?: string[];
}

export const cacheManager = {
  /**
   * Get data from cache if it's still valid
   */
  get<T>(key: string): T | null {
    const cached = clientCache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      clientCache.delete(key);
      return null;
    }
    
    return cached.data;
  },

  /**
   * Set data in cache with TTL
   */
  set(key: string, data: any, options: CacheOptions = {}) {
    const { ttl = 5 * 60 * 1000 } = options; // Default 5 minutes
    clientCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  },

  /**
   * Invalidate specific cache entries by key pattern
   */
  invalidate(keyPattern: string | RegExp) {
    for (const [key] of clientCache) {
      if (typeof keyPattern === 'string') {
        if (key.includes(keyPattern)) {
          clientCache.delete(key);
        }
      } else if (keyPattern.test(key)) {
        clientCache.delete(key);
      }
    }
  },

  /**
   * Invalidate cache entries by tags
   */
  invalidateByTags(tags: string[]) {
    tags.forEach(tag => {
      this.invalidate(tag);
    });
  },

  /**
   * Clear all cache
   */
  clear() {
    clientCache.clear();
  },

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(clientCache.entries());
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([_, cached]) => 
        now <= cached.timestamp + cached.ttl
      ).length,
      expiredEntries: entries.filter(([_, cached]) => 
        now > cached.timestamp + cached.ttl
      ).length,
      totalSize: JSON.stringify([...clientCache]).length
    };
  }
};

/**
 * Higher-order function for caching API responses in loaders
 */
export function withCache<T>(
  fetcher: () => Promise<T>,
  cacheKey: string,
  options: CacheOptions = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    const executeAsync = async () => {
      try {
        // Try to get from cache first
        const cached = cacheManager.get<T>(cacheKey);
        if (cached) {
        resolve(cached);
        return;
      }

      // Fetch fresh data
      const data = await fetcher();
      
      // Cache the result
      cacheManager.set(cacheKey, data, options);
      
      resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    executeAsync();
  });
}