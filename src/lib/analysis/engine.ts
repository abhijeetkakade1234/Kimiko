import { fetchFullTransactionHistory } from '../solana/fetcher';
import { parseTransactionHistory } from '../solana/parser';
import { classifyLeakage } from './classifier';
import { calculatePrivacyScore } from './scorer';
import { determineComplianceTier } from './compliance';
import { generateRecommendations } from './recommender';
import { WalletAnalysis, AnalysisMetadata, TransactionNode } from '../types';

export const analyzeWallet = async (
    walletAddress: string
): Promise<WalletAnalysis> => {
    const startTime = Date.now();

    try {
        // 1. Fetch history
        // Ultra-conservative limit of 10 for maximum RPC stability
        const history = await fetchFullTransactionHistory(walletAddress, 10);

        // 2. Parse
        const nodes = parseTransactionHistory(history, walletAddress);

        // 3. Classify Leakage
        const leakageVectors = classifyLeakage(nodes);

        // 4. Calculate Score
        const privacyScore = calculatePrivacyScore(leakageVectors);

        // 5. Determine Compliance
        const complianceTier = determineComplianceTier(privacyScore, leakageVectors, nodes.length);

        // 6. Generate Recommendations
        const recommendations = generateRecommendations(leakageVectors);

        // 7. Surveillance Insights (Hackathon Track 1)
        const surveillanceInsights = generateSurveillanceInsights(nodes, privacyScore);

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
        console.error(`[Kimiko Engine] RPC Failure for ${walletAddress}:`, error.message);
        throw error; // Rethrow to let the Queue or API handle it
    }
};

/**
 * Generate insights about how visible/surveilled a wallet is
 */
function generateSurveillanceInsights(nodes: TransactionNode[], score: number): any[] {
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

    // 2. Financial Visibility
    if (nodes.length > 10) {
        insights.push({
            type: 'financial',
            label: 'Wealth Visibility',
            description: 'Significant activity is traceable, revealing potential treasury habits.',
            exposedValue: 'Trackable Habit',
            privacyImpact: 'HIGH'
        });
    }

    // 3. Selective Privacy Note (Track 2)
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
