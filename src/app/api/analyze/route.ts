export const runtime = 'edge';

// GET: Fetch existing report or status
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const wallet = searchParams.get('wallet');

        if (!wallet) {
            return Response.json({ success: false, error: 'Wallet required' }, { status: 400 });
        }

        // @ts-ignore
        const env = req.context?.env || process.env;

        // 1. Check KV Cache (Fastest)
        const cached = await env.REPORT_CACHE?.get(`analysis:${wallet}`, { type: 'json' });
        if (cached) {
            return Response.json({ success: true, data: cached, cached: true });
        }

        // 2. Check D1 (Source of Truth)
        if (env.DB) {
            const report = await env.DB.prepare(
                'SELECT data FROM reports WHERE wallet = ?'
            ).bind(wallet).first();

            if (report) {
                const data = JSON.parse(report.data);
                // Backfill KV cache
                await env.REPORT_CACHE?.put(`analysis:${wallet}`, report.data, { expirationTtl: 86400 });
                return Response.json({ success: true, data });
            }

            // check if job is still pending
            const job = await env.DB.prepare(
                'SELECT status FROM jobs WHERE wallet = ? ORDER BY created_at DESC LIMIT 1'
            ).bind(wallet).first();

            if (job) {
                return Response.json({ success: true, status: job.status });
            }
        }

        return Response.json({ success: false, error: 'Report not found' }, { status: 404 });
    } catch (error: any) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Queue new analysis
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { wallet, email } = body;

        if (!wallet) {
            return Response.json({ success: false, error: 'Wallet address is required' }, { status: 400 });
        }

        if (!email) {
            return Response.json({ success: false, error: 'Email is required for report delivery' }, { status: 400 });
        }

        // @ts-ignore
        const env = req.context?.env || process.env;

        // 1. Rate Limiting: 1-day cooldown per email
        if (env.DB) {
            const lastUsage = await env.DB.prepare(`
                SELECT created_at FROM email_limits 
                WHERE email = ? 
                AND created_at > datetime('now', '-1 day')
                ORDER BY created_at DESC LIMIT 1
            `).bind(email).first();

            if (lastUsage) {
                return Response.json({
                    success: false,
                    error: 'Daily limit reached. This email can only be used for one analysis per 24 hours.'
                }, { status: 429 });
            }
        }

        // Optional: Check if we already have a fresh report (less than 1 day old)
        const cached = await env.REPORT_CACHE?.get(`analysis:${wallet}`);
        if (cached) {
            return Response.json({ success: true, data: JSON.parse(cached), message: 'Using existing report' });
        }

        // 2. Record usage in email_limits
        if (env.DB) {
            await env.DB.prepare(
                'INSERT INTO email_limits (email, wallet) VALUES (?, ?)'
            ).bind(email, wallet).run();

            // 3. Track in jobs as 'processing' since we initiate it now
            await env.DB.prepare(
                'INSERT INTO jobs (id, wallet, email, status) VALUES (?, ?, ?, ?) ON CONFLICT(wallet) DO UPDATE SET status = "processing", created_at = CURRENT_TIMESTAMP'
            ).bind(crypto.randomUUID(), wallet, email, 'processing').run();
        }

        // 4. Trigger background analysis (if in Cloudflare environment)
        // @ts-ignore
        const ctx = req.context?.ctx;
        if (ctx) {
            const { handleAnalysis } = await import('@/lib/analysis/worker');
            ctx.waitUntil(handleAnalysis(wallet, email, env));
        } else {
            console.warn('[API] Execution context not found, running analysis asynchronously (local dev)...');
            import('@/lib/analysis/worker').then(({ handleAnalysis }) => {
                handleAnalysis(wallet, email, env).catch(err => {
                    console.error('[API] Local analysis failed:', err);
                });
            });
        }

        return Response.json({
            success: true,
            message: 'Analysis initiated! Your report will be sent to your email shortly.'
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return Response.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
