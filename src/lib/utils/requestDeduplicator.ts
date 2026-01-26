/**
 * Request Deduplicator
 * Prevents duplicate concurrent API calls by caching in-flight promises
 */

type PendingRequest<T> = {
    promise: Promise<T>;
    timestamp: number;
};

class RequestDeduplicator {
    private pending = new Map<string, PendingRequest<any>>();
    private readonly TTL = 60000; // 60 seconds max cache for pending requests
    private cleanupInterval: NodeJS.Timeout | null = null;
    private readonly CLEANUP_INTERVAL = 30000; // Clean up every 30 seconds

    constructor() {
        // Start periodic cleanup
        this.startPeriodicCleanup();
    }

    /**
     * Start periodic cleanup to prevent memory leaks
     */
    private startPeriodicCleanup() {
        if (this.cleanupInterval) return;

        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, this.CLEANUP_INTERVAL);

        // Ensure cleanup runs on Node.js exit
        if (typeof process !== 'undefined') {
            process.on('beforeExit', () => this.stopPeriodicCleanup());
        }
    }

    /**
     * Stop periodic cleanup (for graceful shutdown)
     */
    private stopPeriodicCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.clear();
    }

    /**
     * Deduplicate a request by key
     * If a request with the same key is already in progress, return that promise
     * Otherwise, execute the request and cache the promise
     */
    async deduplicate<T>(
        key: string,
        requestFn: () => Promise<T>
    ): Promise<T> {
        // Check if request is already pending
        const existing = this.pending.get(key);
        if (existing) {
            console.log(`[Deduplicator] Returning existing request for key: ${key}`);
            return existing.promise;
        }

        // Execute new request
        console.log(`[Deduplicator] Creating new request for key: ${key}`);
        const promise = requestFn()
            .finally(() => {
                // Remove from pending once completed
                this.pending.delete(key);
            });

        // Cache the pending promise
        this.pending.set(key, {
            promise,
            timestamp: Date.now()
        });

        return promise;
    }

    /**
     * Remove stale pending requests that have been cached too long
     */
    private cleanup() {
        const now = Date.now();
        let removedCount = 0;

        for (const [key, request] of this.pending.entries()) {
            if (now - request.timestamp > this.TTL) {
                this.pending.delete(key);
                removedCount++;
            }
        }

        if (removedCount > 0) {
            console.log(`[Deduplicator] Cleaned up ${removedCount} stale request(s)`);
        }
    }

    /**
     * Clear all pending requests (useful for testing/shutdown)
     */
    clear() {
        const count = this.pending.size;
        this.pending.clear();
        if (count > 0) {
            console.log(`[Deduplicator] Cleared ${count} pending request(s)`);
        }
    }

    /**
     * Get current pending request count
     */
    getPendingCount(): number {
        return this.pending.size;
    }
}

// Singleton instance
export const requestDeduplicator = new RequestDeduplicator();
