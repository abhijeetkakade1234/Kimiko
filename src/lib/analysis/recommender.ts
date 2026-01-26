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
            title: 'Hide your exchange links',
            description: 'Your wallet is directly connected to a central exchange (like Binance). This means your real-world identity is potentially compromised. Use a "cleaning" wallet in between.',
            actionable: true,
            estimatedImprovement: 25
        });
    }

    if (categories.has('ADDRESS_REUSE')) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Anonymity',
            title: 'Don\'t use the same wallet twice',
            description: 'Using one wallet for everything (NFTs, Trading, Shopping) makes it easy to build a profile of your life. Create a fresh wallet for new activities.',
            actionable: true,
            estimatedImprovement: 15
        });
    }

    if (categories.has('TEMPORAL_PATTERN')) {
        recommendations.push({
            priority: 'LOW',
            category: 'Behavior',
            title: 'Mix up your timing',
            description: 'Sending money at the exact same time every day is a "digital fingerprint". Randomize your transaction times to stay under the radar.',
            actionable: true,
            estimatedImprovement: 10
        });
    }

    if (categories.has('CLUSTERING_RISK')) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'Anonymity',
            title: 'Untangle your addresses',
            description: 'Your different wallets are "talking" to each other too much. This creates a cluster that reveals they all belong to you.',
            actionable: true,
            estimatedImprovement: 20
        });
    }

    if (categories.has('SOCIAL_GRAPH')) {
        recommendations.push({
            priority: 'LOW',
            category: 'Privacy',
            title: 'Hide your "Friend Graph"',
            description: 'Directly sending SOL to the same people over and over reveals your social circle. Use a temporary wallet for personal transfers.',
            actionable: true,
            estimatedImprovement: 10
        });
    }

    if (categories.has('MIXER_CORRELATION')) {
        recommendations.push({
            priority: 'HIGH',
            category: 'Privacy',
            title: 'Add delays between transfers',
            description: 'You are moving money too quickly through privacy tools. This creates a "time link" that makes the tool useless. Wait at least 24 hours between deposit and withdrawal.',
            actionable: true,
            estimatedImprovement: 40
        });
    }

    if (categories.has('BRIDGE_CORRELATION')) {
        recommendations.push({
            priority: 'HIGH',
            category: 'Cross-Chain',
            title: 'Watch out for "Bridge Leaks"',
            description: 'Moving money between blockchains (like Solana to Ethereum) is highly trackable. Use specialized tools that hide these crossover links.',
            actionable: true,
            estimatedImprovement: 30
        });
    }

    return recommendations.sort((a, b) => {
        const p = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return p[b.priority] - p[a.priority];
    });
};
