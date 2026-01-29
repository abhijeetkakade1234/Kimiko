import { LeakageVector, LeakageCategory } from '../types';

const CATEGORY_WEIGHTS: Record<LeakageCategory, number> = {
    CEX_EXPOSURE: 30,
    LABELED_INTERACTION: 25,
    CLUSTERING_RISK: 20,
    BRIDGE_CORRELATION: 20,
    TEMPORAL_PATTERN: 15,
    ADDRESS_REUSE: 15,
    NFT_IDENTITY: 10,
    SOCIAL_GRAPH: 15,
    MIXER_CORRELATION: 25
};

export const calculatePrivacyScore = (vectors: LeakageVector[]): number => {
    if (vectors.length === 0) return 100;

    const totalPenalty = vectors.reduce((sum, vector) => {
        // Determine the max penalty for this category
        const weight = CATEGORY_WEIGHTS[vector.category] || 10;

        // Penalize based on normalized vector score [0-100] multiplied by its weight fraction
        const penalty = (vector.score / 100) * weight;
        return sum + penalty;
    }, 0);

    // Cap score between 0 and 100
    return Math.max(0, Math.min(100, 100 - totalPenalty));
};
