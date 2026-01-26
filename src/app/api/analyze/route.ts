import { NextRequest, NextResponse } from 'next/server';
import { analyzeWallet } from '@/lib/analysis/engine';
import { persistentCache } from '@/lib/utils/persistentCache';
import { requestDeduplicator } from '@/lib/utils/requestDeduplicator';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { wallet } = body;

        if (!wallet) {
            return NextResponse.json(
                { success: false, error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        // Check cache first
        const cacheKey = `analysis_${wallet}`;
        const cachedResult = persistentCache.get(cacheKey);
        if (cachedResult) {
            console.log(`[API] Serving cached analysis for ${wallet}`);
            return NextResponse.json({ success: true, data: cachedResult, cached: true });
        }

        // Deduplicate concurrent requests for the same wallet
        const result = await requestDeduplicator.deduplicate(
            `analyze_${wallet}`,
            async () => {
                console.log(`[API] Starting fresh analysis for ${wallet}`);
                const analysis = await analyzeWallet(wallet);

                // Save to cache (1 hour)
                persistentCache.set(cacheKey, analysis, 3600);

                return analysis;
            }
        );

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
