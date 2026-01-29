import { WalletAnalysis } from '../types';

/**
 * Pre-computed demo data for stable hackathon demos
 * Use these when RPC is unreliable or rate-limited
 * 
 * Specifically tailored for Hackathon Tracks:
 * 1. Mass Financial Surveillance (Educate Users)
 * 2. Privacy Without Jargon (Explain Selective Privacy)
 */
export const DEMO_WALLETS: Record<string, WalletAnalysis> = {
    // Demo Wallet 1: High Risk (CEX Exposure & Surveillance)
    'Hv4KArfBvUpNcAsrE2HjS2mQ2z1vA8n3L9pQx7R9mK2z': {
        wallet: 'Hv4KArfBvUpNcAsrE2HjS2mQ2z1vA8n3L9pQx7R9mK2z',
        privacyScore: 25,
        complianceTier: 'HIGH_RISK',
        leakageVectors: [
            {
                category: 'CEX_EXPOSURE',
                severity: 'HIGH',
                score: 80,
                description: 'Direct transfers from Binance Hot Wallet',
                evidence: [
                    { type: 'CEX', value: 'Binance', confidence: 0.95 }
                ]
            }
        ],
        surveillanceInsights: [
            {
                type: 'identity',
                label: 'High-Value Target',
                description: 'Your transaction volume and frequency label you as a high-net-worth individual for institutional surveillance.',
                exposedValue: 'Estimated $2.4M Volume',
                privacyImpact: 'HIGH'
            },
            {
                type: 'financial',
                label: 'Memecoin Degenerate',
                description: 'Public trading history on Pump.fun and Raydium reveals your risk appetite and speculative behavior.',
                exposedValue: '45.2 SOL Trading Loss',
                privacyImpact: 'HIGH'
            }
        ],
        recommendations: [
            {
                priority: 'HIGH',
                category: 'Privacy',
                title: 'Hide your exchange links',
                description: 'Your wallet is directly connected to a central exchange (like Binance). Use a "cleaning" wallet in between.',
                actionable: true,
                estimatedImprovement: 35
            }
        ],
        metadata: {
            analyzedAt: Date.now(),
            transactionCount: 45,
            accountAge: 90 * 24 * 60 * 60 * 1000,
            dataSource: 'helius',
            processingTime: 120,
            transactions: [
                {
                    signature: 'demo_sig_cex_1',
                    timestamp: Date.now() - 1000000,
                    slot: 2849503,
                    type: 'transfer',
                    counterparties: ['5VC9AnXv7uHCE9Vszb8hFzN2M5sL3yLd4f8zLd4f8zLd'],
                    programs: ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA']
                },
                {
                    signature: 'demo_sig_dex_1',
                    timestamp: Date.now() - 5000000,
                    slot: 2849100,
                    type: 'swap',
                    counterparties: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'],
                    programs: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4']
                },
                {
                    signature: 'demo_sig_p2p_1',
                    timestamp: Date.now() - 9000000,
                    slot: 2848500,
                    type: 'transfer',
                    counterparties: ['Gv6H5r6X7Hn9pQx7R9mK2z1vA8n3L9pQx7R9mK2z1vA8'],
                    programs: ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA']
                }
            ]
        }
    },

    // Demo Wallet 2: Low Risk (Clean Privacy & Selective Privacy)
    'Gv6H5r6X7Hn9pQx7R9mK2z1vA8n3L9pQx7R9mK2z1vA8': {
        wallet: 'Gv6H5r6X7Hn9pQx7R9mK2z1vA8n3L9pQx7R9mK2z1vA8',
        privacyScore: 92,
        complianceTier: 'LOW_RISK',
        leakageVectors: [],
        surveillanceInsights: [
            {
                type: 'identity',
                label: 'Anonymous Actor',
                description: 'Your identity remains unlinked to any physical or social identifier.',
                exposedValue: 'NULL',
                privacyImpact: 'LOW'
            }
        ],
        recommendations: [
            {
                priority: 'LOW',
                category: 'Anonymity',
                title: 'Maintain Hygiene',
                description: 'Continue rotating addresses for new DeFi experiments to maintain this high level of privacy.',
                actionable: true,
                estimatedImprovement: 5
            }
        ],
        metadata: {
            analyzedAt: Date.now(),
            transactionCount: 12,
            accountAge: 45 * 24 * 60 * 60 * 1000,
            dataSource: 'helius',
            processingTime: 85,
            transactions: [
                {
                    signature: 'demo_sig_dex_1',
                    timestamp: Date.now() - 5000000,
                    slot: 2849100,
                    type: 'swap',
                    counterparties: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'],
                    programs: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4']
                }
            ]
        }
    },

    // Demo Wallet 3: Medium Risk (Mixed Activity)
    '3z9vKArfBvUpNcAsrE2HjS2mQ2z1vA8n3L9pQx7R9mK2': {
        wallet: '3z9vKArfBvUpNcAsrE2HjS2mQ2z1vA8n3L9pQx7R9mK2',
        privacyScore: 58,
        complianceTier: 'MEDIUM_RISK',
        leakageVectors: [
            {
                category: 'BRIDGE_CORRELATION',
                severity: 'MEDIUM',
                score: 40,
                description: 'Cross-chain bridge correlation detected',
                evidence: [
                    { type: 'Bridge', value: 'Wormhole', confidence: 0.85 }
                ]
            }
        ],
        surveillanceInsights: [
            {
                type: 'financial',
                label: 'Intermediate Trader',
                description: 'Your trading volume is visible but not at institutional priority levels yet.',
                exposedValue: '120 SOL Volume',
                privacyImpact: 'MEDIUM'
            }
        ],
        recommendations: [
            {
                priority: 'MEDIUM',
                category: 'Behavior',
                title: 'Mix up your timing',
                description: 'Sending money at the exact same time every day is a "digital fingerprint". Randomize your transaction times.',
                actionable: true,
                estimatedImprovement: 20
            }
        ],
        metadata: {
            analyzedAt: Date.now(),
            transactionCount: 67,
            accountAge: 120 * 24 * 60 * 60 * 1000,
            dataSource: 'helius',
            processingTime: 156,
            transactions: [
                {
                    signature: 'demo_sig_dex_1',
                    timestamp: Date.now() - 5000000,
                    slot: 2849100,
                    type: 'swap',
                    counterparties: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'],
                    programs: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4']
                },
                {
                    signature: 'demo_sig_dex_2',
                    timestamp: Date.now() - 5000000,
                    slot: 2849100,
                    type: 'swap',
                    counterparties: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'],
                    programs: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4']
                },
                {
                    signature: 'demo_sig_dex_3',
                    timestamp: Date.now() - 5000000,
                    slot: 2849100,
                    type: 'swap',
                    counterparties: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'],
                    programs: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4']
                },
                {
                    signature: 'demo_sig_dex_4',
                    timestamp: Date.now() - 5000000,
                    slot: 2849100,
                    type: 'swap',
                    counterparties: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'],
                    programs: ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4']
                }
            ]
        }
    }
};

export function getDemoWallet(address: string): WalletAnalysis | null {
    if (address in DEMO_WALLETS) {
        return DEMO_WALLETS[address];
    }
    return null;
}
