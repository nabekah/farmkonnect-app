/**
 * In-memory cache implementation with TTL support
 * For production, consider using Redis
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Set a value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs || this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Delete all entries matching a pattern
   */
  deletePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const globalCache = new MemoryCache();

/**
 * Cache key generator
 */
export const cacheKey = {
  farm: (farmId: number) => `farm:${farmId}`,
  farms: (userId: number) => `farms:${userId}`,
  crop: (cropId: number) => `crop:${cropId}`,
  crops: (farmId: number) => `crops:${farmId}`,
  animal: (animalId: number) => `animal:${animalId}`,
  animals: (farmId: number) => `animals:${farmId}`,
  product: (productId: number) => `product:${productId}`,
  products: (farmId: number) => `products:${farmId}`,
  order: (orderId: number) => `order:${orderId}`,
  orders: (userId: number) => `orders:${userId}`,
  weather: (farmId: number) => `weather:${farmId}`,
  notifications: (userId: number) => `notifications:${userId}`,
  user: (userId: number) => `user:${userId}`,
};

/**
 * Cache decorator for async functions
 */
export const withCache = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyFn: (...args: T) => string,
  ttlMs?: number
) => {
  return async (...args: T): Promise<R> => {
    const key = keyFn(...args);
    const cached = globalCache.get<R>(key);

    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    globalCache.set(key, result, ttlMs);
    return result;
  };
};

/**
 * Pagination utilities
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Calculate pagination offset and limit
 */
export const calculatePagination = (page: number, limit: number) => {
  const offset = Math.max(0, (page - 1) * limit);
  return { offset, limit };
};

/**
 * Create paginated response
 */
export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Query optimization helpers
 */
export const queryOptimization = {
  /**
   * Add indexes to frequently queried fields
   * This is a helper to document which fields should be indexed
   */
  suggestedIndexes: {
    farms: ['userId', 'farmType', 'location'],
    crops: ['farmId', 'cropName', 'plantingDate'],
    animals: ['farmId', 'animalType', 'status'],
    products: ['farmId', 'category', 'price'],
    orders: ['buyerId', 'sellerId', 'status', 'createdAt'],
    workers: ['farmId', 'role', 'status'],
    attendance: ['workerId', 'date'],
    equipment: ['farmId', 'type', 'status'],
  },

  /**
   * Batch query optimization
   * Group multiple queries into a single database call
   */
  batchQuery: async <T>(
    ids: number[],
    queryFn: (ids: number[]) => Promise<T[]>
  ): Promise<Map<number, T>> => {
    const batchSize = 100;
    const results = new Map<number, T>();

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const batchResults = await queryFn(batch);
      batchResults.forEach((result: any) => {
        results.set(result.id, result);
      });
    }

    return results;
  },

  /**
   * Lazy load related data
   */
  lazyLoad: async <T>(
    items: any[],
    relationKey: string,
    loadFn: (ids: number[]) => Promise<Map<number, T>>
  ): Promise<any[]> => {
    const ids = items.map((item) => item[relationKey]).filter(Boolean);
    const relations = await loadFn(ids);

    return items.map((item) => ({
      ...item,
      [relationKey]: relations.get(item[relationKey]),
    }));
  },
};

/**
 * Database query caching decorator
 */
export const cacheQuery = <T>(
  keyPrefix: string,
  ttlMs: number = 5 * 60 * 1000
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKeyStr = `${keyPrefix}:${JSON.stringify(args)}`;
      const cached = globalCache.get<T>(cacheKeyStr);

      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      globalCache.set(cacheKeyStr, result, ttlMs);
      return result;
    };

    return descriptor;
  };
};

/**
 * Lazy loading component helper
 */
export const lazyLoadImages = (imageUrls: string[]): Promise<void> => {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    })
  ).then(() => undefined);
};

/**
 * Intersection Observer for lazy loading
 */
export const createLazyLoadObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  return new IntersectionObserver(callback, {
    threshold: 0.1,
    ...options,
  });
};

/**
 * Request debouncing for search queries
 */
export const debounce = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  delayMs: number = 300
) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        fn(...args).then(resolve).catch(reject);
      }, delayMs);
    });
  };
};

/**
 * Request throttling for frequent operations
 */
export const throttle = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  delayMs: number = 1000
) => {
  let lastCallTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;

      if (timeSinceLastCall >= delayMs) {
        lastCallTime = now;
        fn(...args).then(resolve).catch(reject);
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          lastCallTime = Date.now();
          fn(...args).then(resolve).catch(reject);
        }, delayMs - timeSinceLastCall);
      }
    });
  };
};
