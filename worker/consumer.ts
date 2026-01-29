import type { Env } from '../src/lib/analysis/worker';
import type { ScheduledEvent } from '@cloudflare/workers-types';

export { handleAnalysis } from '../src/lib/analysis/worker';
export type { Env, Job } from '../src/lib/analysis/worker';

export default {
    async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
        console.log('[Worker] Running scheduled cleanup...');

        // 1. Clean expired reports from D1
        await env.DB.prepare(
            'DELETE FROM reports WHERE expires_at < CURRENT_TIMESTAMP'
        ).run();

        // 2. Clear old rate limit entries
        await env.DB.prepare(
            `DELETE FROM email_limits WHERE created_at < datetime('now', '-1 day')`
        ).run();

        // 3. Clean old jobs
        await env.DB.prepare(
            `DELETE FROM jobs WHERE created_at < datetime('now', '-3 days')`
        ).run();

        console.log('[Worker] Cleanup complete.');
    }
};
