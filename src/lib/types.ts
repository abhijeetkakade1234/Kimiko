export interface WalletAnalysis {
    wallet: string;
    privacyScore: number;
    complianceTier: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'NEW_WALLET';
    leakageVectors: LeakageVector[];
    recommendations: Recommendation[];
    metadata: AnalysisMetadata;
}

export interface LeakageVector {
    category: LeakageCategory;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    score: number;
    description: string;
    evidence: Evidence[];
}

export type LeakageCategory =
    | 'CEX_EXPOSURE'
    | 'ADDRESS_REUSE'
    | 'CLUSTERING_RISK'
    | 'TEMPORAL_PATTERN'
    | 'SOCIAL_GRAPH'
    | 'BRIDGE_CORRELATION'
    | 'LABELED_INTERACTION'
    | 'NFT_IDENTITY';

export interface Evidence {
    type: string;
    value: string;
    confidence: number;
    timestamp?: number;
}

export interface Recommendation {
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    category: string;
    title: string;
    description: string;
    actionable: boolean;
    estimatedImprovement: number;
}

export interface AnalysisMetadata {
    analyzedAt: number;
    transactionCount: number;
    accountAge: number;
    dataSource: 'helius' | 'public-rpc';
    processingTime: number;
    transactions?: TransactionNode[]; // Added for visualization
}

export interface TransactionNode {
    signature: string;
    timestamp: number;
    slot: number;
    type: 'transfer' | 'swap' | 'nft' | 'program' | 'unknown';
    counterparties: string[];
    value?: number;
    programs: string[];
}
