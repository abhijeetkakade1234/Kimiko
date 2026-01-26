import { fetchFullTransactionHistory } from '../solana/fetcher';
import { parseTransactionHistory } from '../solana/parser';
import { classifyLeakage } from './classifier';
import { calculatePrivacyScore } from './scorer';
import { determineComplianceTier } from './compliance';
import { generateRecommendations } from './recommender';
import { WalletAnalysis, AnalysisMetadata, TransactionNode } from '../types';
import { getDemoWallet } from '../demo/mock-data';
import { ResilienceProvider } from './resilience';
import { DasProvider } from '../solana/das';

export const analyzeWallet = async (
    walletAddress: string
): Promise<WalletAnalysis> => {
    // Check if this is a demo wallet first
    const demoResult = getDemoWallet(walletAddress);
    if (demoResult) {
        console.log(`[Kimiko Engine] Using Static DEMO data for ${walletAddress}`);
        return demoResult;
    }

    const startTime = Date.now();

    try {
        // 1. Fetch history
        const history = await fetchFullTransactionHistory(walletAddress, 10);

        // 2. Parse
        const nodes = parseTransactionHistory(history, walletAddress);

        // 3. DAS Enrichment (Production Track)
        const assetData = await DasProvider.getAssetsByOwner(walletAddress);

        // 4. Classify Leakage
        const leakageVectors = classifyLeakage(nodes);

        // Add NFT-specific leakage if any high-risk assets found
        if (assetData?.items && assetData.items.length > 0) {
            const hasSns = assetData.items.some(a => a.id.includes('.sol') || a.content?.metadata?.name?.includes('.sol'));
            if (hasSns) {
                leakageVectors.push({
                    category: 'NFT_IDENTITY',
                    severity: 'HIGH',
                    score: 75,
                    description: 'Solana Name Service (SNS) detected. Your wallet is directly linked to a human-readable identity.',
                    evidence: [{ type: 'SNS', value: '.sol handle', confidence: 1.0 }]
                });
            }
        }

        // 5. Calculate Score
        const privacyScore = calculatePrivacyScore(leakageVectors);

        // 5. Determine Compliance
        const complianceTier = determineComplianceTier(privacyScore, leakageVectors, nodes.length);

        // 6. Generate Recommendations
        const recommendations = generateRecommendations(leakageVectors);

        // 7. Surveillance Insights
        const surveillanceInsights = generateSurveillanceInsights(nodes, privacyScore, assetData?.total || 0);

        const endTime = Date.now();

        const metadata: AnalysisMetadata = {
            analyzedAt: startTime,
            transactionCount: nodes.length,
            accountAge: nodes.length > 0 ? (startTime - (nodes[nodes.length - 1].timestamp * 1000)) : 0,
            dataSource: 'solana-rpc',
            processingTime: endTime - startTime,
            transactions: nodes
        };

        return {
            wallet: walletAddress,
            privacyScore,
            complianceTier,
            leakageVectors,
            surveillanceInsights,
            recommendations,
            metadata
        };
    } catch (error: any) {
        console.error(`[Kimiko Engine] Primary Analysis Path Failed:`, error.message);
        return ResilienceProvider.getFallback(walletAddress);
    }
};

/**
 * Generate insights about how visible/surveilled a wallet is
 */
function generateSurveillanceInsights(nodes: TransactionNode[], score: number, assetCount: number = 0): any[] {
    const insights: any[] = [];

    // 1. Behavioral Profiling
    if (nodes.length > 5) {
        insights.push({
            type: 'identity',
            label: 'High-Activity Entity',
            description: 'Your transaction volume makes you an easy target for behavioral clustering.',
            exposedValue: `${nodes.length} Txns`,
            privacyImpact: 'MEDIUM'
        });
    }

    // 2. NFT Asset Profiling (New Production Insight)
    if (assetCount > 20) {
        insights.push({
            type: 'social',
            label: 'Collection Clustering',
            description: 'You own a large number of unique assets. This creates a "Digital Fingerprint" that is almost impossible to replicate, making your move across the ecosystem highly trackable.',
            exposedValue: `${assetCount} Unique Assets`,
            privacyImpact: 'HIGH'
        });
    }
    if (nodes.length > 10) {
        insights.push({
            type: 'financial',
            label: 'Wealth Visibility',
            description: 'Significant activity is traceable, revealing potential treasury habits.',
            exposedValue: 'Trackable Habit',
            privacyImpact: 'HIGH'
        });
    }

    // 3. Selective Privacy Note
    if (score < 50) {
        insights.push({
            type: 'behavioral',
            label: 'Exposed Behavior',
            description: 'Lack of privacy tools makes your activity a public book.',
            privacyImpact: 'HIGH'
        });
    }

    return insights;
}
