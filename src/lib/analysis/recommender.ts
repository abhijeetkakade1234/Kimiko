import { LeakageVector, Recommendation, WalletAnalysis } from '../types';

export const generateRecommendations = (
    vectors: LeakageVector[]
): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    const categories = new Set(vectors.map(v => v.category));

    if (categories.has('CEX_EXPOSURE')) {
        recommendations.push({
            priority: 'HIGH',
            category: 'Privacy',
            title: 'Minimize Direct CEX Links',
            description: 'Use intermediary wallets or privacy protocols when moving funds to/from exchanges to obscure the direct link to your identity.',
            actionable: true,
            estimatedImprovement: 25
        });
    }

    if (categories.has('ADDRESS_REUSE')) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Anonymity',
            title: 'Rotate Wallet Addresses',
            description: 'Create new addresses for different activities (NFTs, Trading, Personal) to prevent cross-account clustering and profiling.',
            actionable: true,
            estimatedImprovement: 15
        });
    }

    if (categories.has('TEMPORAL_PATTERN')) {
        recommendations.push({
            priority: 'LOW',
            category: 'Behavior',
            title: 'Randomize Transaction Timing',
            description: 'Avoid executing transactions at predictable intervals or specific times of day to prevent temporal fingerprinting.',
            actionable: true,
            estimatedImprovement: 10
        });
    }

    // Default recommendation if score is low but no specific vectors caught (unlikely with current setup)
    if (recommendations.length === 0) {
        recommendations.push({
            priority: 'LOW',
            category: 'General',
            title: 'Perform Small Trial Transactions',
            description: 'When using new protocols, use small amounts and a fresh wallet to assess privacy leakage first.',
            actionable: true,
            estimatedImprovement: 5
        });
    }

    if (categories.has('CLUSTERING_RISK')) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Anonymity',
            title: 'Break Address Clusters',
            description: 'Your wallet is linked to too many distinct personal addresses. Use a fresh "burner" wallet for interactions with new parties.',
            actionable: true,
            estimatedImprovement: 20
        });
    }

    if (categories.has('SOCIAL_GRAPH')) {
        recommendations.push({
            priority: 'LOW',
            category: 'Privacy',
            title: 'Obscure Social Links',
            description: 'Repeated interactions with the same wallets suggest a social connection. Avoid sending direct transfers to friends/colleagues from your main treasury.',
            actionable: true,
            estimatedImprovement: 10
        });
    }

    if (categories.has('BRIDGE_CORRELATION')) {
        recommendations.push({
            priority: 'HIGH',
            category: 'Cross-Chain',
            title: 'Use Privacy-Focused Bridges',
            description: 'Known bridge interactions are easy to track across chains. Consider using privacy-preserving protocols or decentralized relayers.',
            actionable: true,
            estimatedImprovement: 30
        });
    }

    return recommendations.sort((a, b) => {
        const p = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return p[b.priority] - p[a.priority];
    });
};
