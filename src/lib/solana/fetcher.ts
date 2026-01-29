import { ConfirmedSignatureInfo, ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';
import { getConnection, getBatchConnection, rotateRPC, rotateBatchRPC, refreshConnection, refreshBatchConnection } from './client';
import { getCache, setCache } from '../utils/cache';

export interface FetchOptions {
    limit?: number;
    before?: string;
    until?: string;
}

// Helper for exponential backoff on 429s with RPC rotation
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 5, useBatch = false): Promise<T> => {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const errorMsg = err.message || '';
            const isRateLimit = errorMsg.includes('429') || err.code === -32429;
            const isBatchError = errorMsg.includes('403') || errorMsg.includes('Batch requests');
            const isTimeout = errorMsg.includes('timeout') || errorMsg.includes('Timeout') || err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.code === 'ETIMEDOUT';

            if ((isBatchError && useBatch) || isTimeout) {
                console.error(`[RPC] ${isTimeout ? 'Timeout' : 'Batch blocked'} - rotating immediately`);
                if (useBatch) {
                    rotateBatchRPC();
                    refreshBatchConnection();
                } else {
                    rotateRPC();
                    refreshConnection();
                }
                continue;
            }

            if (isRateLimit) {
                // On 2nd retry, try rotating RPC provider
                if (i >= 1) {
                    console.warn(`[RPC] Rate limit rotation after ${i + 1} attempts...`);
                    if (useBatch) {
                        rotateBatchRPC();
                        refreshBatchConnection();
                    } else {
                        rotateRPC();
                        refreshConnection();
                    }
                } else {
                    // Exponential backoff
                    const waitTime = 500 + Math.random() * 200;
                    console.warn(`RPC Rate limited (429). Retrying in ${Math.round(waitTime)}ms... (Attempt ${i + 1}/${maxRetries})`);
                    await new Promise(r => setTimeout(r, waitTime));
                }
                continue;
            }
            throw err;
        }
    }
    throw lastError;
};


export const fetchTransactionSignatures = async (
    walletAddress: string,
    options: FetchOptions = { limit: 100 }
): Promise<ConfirmedSignatureInfo[]> => {
    const pubkey = new PublicKey(walletAddress);
    // Use primary connection (can be Helius) for signature fetching - not a batch operation
    return await withRetry(() => getConnection().getSignaturesForAddress(pubkey, {
        limit: options.limit,
        before: options.before,
        until: options.until,
    }), 5, false);
};

export const fetchTransactionDetails = async (
    signatures: string[]
): Promise<(ParsedTransactionWithMeta | null)[]> => {
    if (signatures.length === 0) return [];

    // Use batchConnection (Ankr) for batch operations to avoid Helius free tier limitations
    return await withRetry(() => getBatchConnection().getParsedTransactions(signatures, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
    }), 5, true);
};

export const fetchFullTransactionHistory = async (
    walletAddress: string,
    limit: number = 10 // Reduced from 20 to minimize RPC pressure
) => {
    // Check cache first for raw history to save RPC credits
    const cacheKey = `history_${walletAddress}_${limit}`;
    const cached = getCache<ParsedTransactionWithMeta[]>(cacheKey);
    if (cached) {
        console.log(`[Kimiko Fetcher] Serving ${cached.length} transactions from cache`);
        return cached;
    }

    console.log(`[Kimiko Fetcher] Fetching fresh data for ${walletAddress}...`);
    const signatures = await fetchTransactionSignatures(walletAddress, { limit });
    console.log(`[Kimiko Fetcher] Found ${signatures.length} signatures for ${walletAddress}`);
    const sigStrings = signatures.map(s => s.signature);

    // Solana RPC getParsedTransactions has a limit of 200 signatures per call
    const details: (ParsedTransactionWithMeta | null)[] = [];
    const batchSize = 5; // Reduced batch size to minimize rate limits

    for (let i = 0; i < sigStrings.length; i += batchSize) {
        const batch = sigStrings.slice(i, i + batchSize);
        console.log(`[Kimiko Fetcher] Fetching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sigStrings.length / batchSize)}`);

        const batchDetails = await fetchTransactionDetails(batch);
        details.push(...batchDetails);

        // Increased delay between batches to be gentler on the RPC
        if (i + batchSize < sigStrings.length) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    const filtered = details.filter((d): d is ParsedTransactionWithMeta => d !== null);
    console.log(`[Kimiko Fetcher] Successfully fetched ${filtered.length} transactions`);

    // Cache history for 10 minutes
    setCache(cacheKey, filtered, 600);

    return filtered;
};

