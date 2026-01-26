import { WalletAnalysis, TransactionNode } from '../types';
import { getDemoWallet } from '../demo/mock-data';

/**
 * Handles emergency fallbacks and mock data generation
 * for demo stability during RPC failures.
 */
export class ResilienceProvider {
    static getFallback(walletAddress: string): WalletAnalysis {
        console.warn(`[Zen-Resilience] Activating dynamic intelligence for ${walletAddress}`);

        const baseMock = getDemoWallet('Hv4KArfBvUpNcAsrE2HjS2mQ2z1vA8n3L9pQx7R9mK2z')!;

        const dynamicTransactions: TransactionNode[] = Array.from({ length: 15 }).map((_, i) => {
            const seed = (walletAddress.charCodeAt(i % walletAddress.length) + i) % 50;
            const mockCounterparty = `Addr${seed}x${walletAddress.slice(0, 4)}...${seed}v9`;

            return {
                signature: `mock_sig_${walletAddress.slice(0, 5)}_${i}`,
                timestamp: Date.now() - (i * 3600000),
                slot: 123456789 - i,
                type: i % 3 === 0 ? 'swap' : 'transfer',
                counterparties: [mockCounterparty],
                programs: i % 3 === 0 ? ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'] : ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA']
            };
        });

        return {
            ...baseMock,
            wallet: walletAddress,
            metadata: {
                ...baseMock.metadata,
                dataSource: 'mock-fallback',
                analyzedAt: Date.now(),
                transactions: dynamicTransactions,
                transactionCount: dynamicTransactions.length
            }
        };
    }
}
