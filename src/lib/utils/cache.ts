type CacheEntry<T> = {
    data: T;
    expiry: number;
};

const cache = new Map<string, CacheEntry<any>>();

export const getCache = <T>(key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }

    return entry.data as T;
};

export const setCache = <T>(key: string, data: T, ttlSeconds: number = 3600): void => {
    cache.set(key, {
        data,
        expiry: Date.now() + ttlSeconds * 1000,
    });
};

export const clearCache = (): void => {
    cache.clear();
};
