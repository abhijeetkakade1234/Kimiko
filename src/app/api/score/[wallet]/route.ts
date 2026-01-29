import { NextRequest, NextResponse } from 'next/server';
import { analyzeWallet } from '@/lib/analysis/engine';
import { getCache, setCache } from '@/lib/utils/cache';
import { WalletAnalysis } from '@/lib/types';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ wallet: string }> }
) {
    try {
        const { wallet } = await context.params;

        if (!wallet) {
            return NextResponse.json(
                { success: false, error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        // Check cache
        const cacheKey = `score_${wallet}`;
        const cachedResult = getCache<WalletAnalysis>(cacheKey);

        if (cachedResult) {
            return NextResponse.json({
                success: true,
                wallet,
                privacyScore: cachedResult.privacyScore,
                complianceTier: cachedResult.complianceTier,
                lastAnalyzed: cachedResult.metadata.analyzedAt,
                cached: true
            });
        }

        // Perform analysis
        const result = await analyzeWallet(wallet);

        // Map to lightweight response
        const responseData = {
            wallet,
            privacyScore: result.privacyScore,
            complianceTier: result.complianceTier,
            lastAnalyzed: result.metadata.analyzedAt
        };

        // Cache for 1 hour
        setCache(cacheKey, responseData, 3600);

        return NextResponse.json({
            success: true,
            ...responseData,
            cached: false
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
