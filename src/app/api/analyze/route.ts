import { NextRequest, NextResponse } from 'next/server';
import { analyzeWallet } from '@/lib/analysis/engine';
import { getCache, setCache } from '@/lib/utils/cache';
import { requestDeduplicator } from '@/lib/utils/requestDeduplicator';
import { handleAnalysis, performMaintenance, Env } from '@/lib/analysis/worker';
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as { wallet?: string; email?: string };
        const { wallet, email } = body;

        if (!wallet) {
            return NextResponse.json(
                { success: false, error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        // Get Cloudflare context and environment
        const ctx = (req as any).context;
        // In OpenNext/Cloudflare, bindings are in req.context.cloudflare.env
        const cfEnv = ctx?.cloudflare?.env || ctx?.env;
        const env = (cfEnv || process.env) as unknown as Env;

        if (!env.DB || !env.REPORT_CACHE) {
            console.error('Missing Cloudflare Bindings:', { hasDB: !!env.DB, hasKV: !!env.REPORT_CACHE });
        }

        // 1. Perform maintenance (delete old reports/jobs)
        if (ctx && env.REPORT_CACHE) {
            ctx.waitUntil((async () => {
                try {
                    const lastCleanup = await env.REPORT_CACHE.get('LAST_CLEANUP_TS');
                    const now = Date.now();
                    if (!lastCleanup || (now - parseInt(lastCleanup)) > 86400000) {
                        await performMaintenance(env);
                        await env.REPORT_CACHE.put('LAST_CLEANUP_TS', now.toString());
                    }
                } catch (e) {
                    console.error('Maintenance task failed:', e);
                }
            })());
        }

        // 2. CACHE CHECK
        const cacheKey = `analysis_${wallet}`;
        const cachedResult = getCache(cacheKey);
        if (cachedResult) {
            console.log(`[API] Serving cached analysis for ${wallet}`);

            // Still trigger email in background if provided
            if (email && ctx && env.RESEND_API_KEY) {
                ctx.waitUntil(handleAnalysis({
                    id: `cached_${Date.now()}`,
                    wallet,
                    email,
                    status: 'completed'
                }, env));
            }

            return NextResponse.json({ success: true, data: cachedResult, cached: true });
        }

        // 3. FRESH ANALYSIS
        const result = await requestDeduplicator.deduplicate(
            `analyze_${wallet}`,
            async () => {
                console.log(`[API] Starting fresh analysis for ${wallet}`);
                const analysis = await analyzeWallet(wallet);

                // Save to internal cache
                setCache(cacheKey, analysis, 3600);

                // 4. BACKGROUND TASKS (D1 Save + Email)
                if (ctx) {
                    ctx.waitUntil(handleAnalysis({
                        id: `live_${Date.now()}`,
                        wallet,
                        email,
                        status: 'completed'
                    }, env));
                }

                return analysis;
            }
        );

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500, headers: { 'x-error-message': error.message } }
        );
    }
}
