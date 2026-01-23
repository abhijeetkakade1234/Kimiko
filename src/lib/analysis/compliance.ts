import { WalletAnalysis, LeakageVector } from '../types';

export type ComplianceTier = WalletAnalysis['complianceTier'];

export const determineComplianceTier = (
    privacyScore: number,
    vectors: LeakageVector[],
    transactionCount: number
): ComplianceTier => {
    if (transactionCount === 0) return 'NEW_WALLET';

    const hasCritical = vectors.some(v => v.severity === 'CRITICAL');
    const hasHighBridge = vectors.some(v => v.category === 'BRIDGE_CORRELATION' && v.severity === 'HIGH');
    const hasHighCEX = vectors.some(v => v.category === 'CEX_EXPOSURE' && v.severity === 'HIGH');

    // High risk if critical violations or high-confidence bridge/CEX links with low privacy
    if (hasCritical || hasHighBridge || (privacyScore < 30 && hasHighCEX)) {
        return 'HIGH_RISK';
    }

    // Low risk requires high privacy score and no high-severity leakage
    if (privacyScore >= 80 && !vectors.some(v => v.severity === 'HIGH')) {
        return 'LOW_RISK';
    }

    return 'MEDIUM_RISK';
};
