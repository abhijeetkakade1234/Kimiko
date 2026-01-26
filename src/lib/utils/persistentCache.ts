/**
 * Abstraction for Persistent Caching
 * In Demo mode, this uses memory/localStorage.
 * In Prod mode, this would connect to Redis.
 */
export interface CacheProvider {
    get<T>(key: string): T | null;
    set<T>(key: string, value: T, ttlSeconds: number): void;
}

class MemoryCacheProvider implements CacheProvider {
    private cache = new Map<string, { value: any, expires: number }>();

    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        return item.value as T;
    }

    set<T>(key: string, value: T, ttlSeconds: number): void {
        this.cache.set(key, {
            value,
            expires: Date.now() + (ttlSeconds * 1000)
        });
    }
}

// Future: RedisCacheProvider implements CacheProvider { ... }

const isProd = process.env.KIMIKO_PROD_MODE === 'true';

// Export a singleton instance based on environment
export const persistentCache: CacheProvider = new MemoryCacheProvider();
