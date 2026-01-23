import { fetchFullTransactionHistory } from '../solana/fetcher';
import { parseTransactionHistory } from '../solana/parser';
import { classifyLeakage } from './classifier';
import { calculatePrivacyScore } from './scorer';
import { determineComplianceTier } from './compliance';
import { generateRecommendations } from './recommender';
import { WalletAnalysis, AnalysisMetadata } from '../types';

export const analyzeWallet = async (
    walletAddress: string
): Promise<WalletAnalysis> => {
    const startTime = Date.now();

    // 1. Fetch history
    const history = await fetchFullTransactionHistory(walletAddress, 50);

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

    const endTime = Date.now();

    const metadata: AnalysisMetadata = {
        analyzedAt: startTime,
        transactionCount: nodes.length,
        accountAge: nodes.length > 0 ? (startTime - (nodes[nodes.length - 1].timestamp * 1000)) : 0,
        dataSource: 'helius',
        processingTime: endTime - startTime,
        transactions: nodes
    };

    return {
        wallet: walletAddress,
        privacyScore,
        complianceTier,
        leakageVectors,
        recommendations,
        metadata
    };
};
