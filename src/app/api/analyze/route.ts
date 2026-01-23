import { NextRequest, NextResponse } from 'next/server';
import { analyzeWallet } from '@/lib/analysis/engine';
import { getCache, setCache } from '@/lib/utils/cache';

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

        // Check cache
        const cacheKey = `analysis_${wallet}`;
        const cachedResult = getCache(cacheKey);
        if (cachedResult) {
            return NextResponse.json({ success: true, data: cachedResult, cached: true });
        }

        // Perform analysis
        const result = await analyzeWallet(wallet);

        // Save to cache (1 hour)
        setCache(cacheKey, result, 3600);

        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
