import { ConfirmedSignatureInfo, ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';
import { connection } from './client';

export interface FetchOptions {
    limit?: number;
    before?: string;
    until?: string;
}

export const fetchTransactionSignatures = async (
    walletAddress: string,
    options: FetchOptions = { limit: 100 }
): Promise<ConfirmedSignatureInfo[]> => {
    const pubkey = new PublicKey(walletAddress);
    return await connection.getSignaturesForAddress(pubkey, {
        limit: options.limit,
        before: options.before,
        until: options.until,
    });
};

export const fetchTransactionDetails = async (
    signatures: string[]
): Promise<(ParsedTransactionWithMeta | null)[]> => {
    // Fetch details in batches to avoid RPC limits
    const details = await connection.getParsedTransactions(signatures, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
    });
    return details;
};

export const fetchFullTransactionHistory = async (
    walletAddress: string,
    limit: number = 20
) => {
    const signatures = await fetchTransactionSignatures(walletAddress, { limit });
    const sigStrings = signatures.map(s => s.signature);
    const details = await fetchTransactionDetails(sigStrings);

    return details.filter((d): d is ParsedTransactionWithMeta => d !== null);
};
