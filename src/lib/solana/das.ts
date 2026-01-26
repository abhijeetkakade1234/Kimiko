import { HELIUS_URL } from './client';

export interface DasAsset {
    id: string;
    content?: {
        metadata?: {
            name?: string;
            symbol?: string;
        };
        links?: {
            image?: string;
        };
    };
    authorities?: { address: string }[];
    compression?: { compressed: boolean };
    grouping?: { group_key: string; group_value: string }[];
    royalty?: { model: string; target: string | null; percent: number; basis_points: number; primary_sale_happened: boolean; locked: boolean };
    creators?: { address: string; share: number; verified: boolean }[];
    ownership: {
        frozen: boolean;
        delegated: boolean;
        delegate: string | null;
        ownership_model: string;
        owner: string;
    };
    supply?: { print_max_supply: number; print_current_supply: number; edition_nonce: number | null };
    mutable?: boolean;
    burnt?: boolean;
}

export interface DasResponse {
    total: number;
    limit: number;
    page: number;
    items: DasAsset[];
}

export class DasProvider {
    /**
     * Fetches all assets (NFTs and fungible tokens if supported) for a given owner.
     * This is significantly faster than standard RPC token account fetches.
     */
    static async getAssetsByOwner(owner: string, page = 1, limit = 100): Promise<DasResponse | null> {
        if (!HELIUS_URL) {
            console.warn("[DAS] Helius API key not found. Skipping DAS fetch.");
            return null;
        }

        try {
            const response = await fetch(HELIUS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'kimiko-das-fetch',
                    method: 'getAssetsByOwner',
                    params: {
                        ownerAddress: owner,
                        page,
                        limit,
                        displayOptions: {
                            showCollectionMetadata: true,
                        }
                    },
                }),
            });

            const { result } = await response.json();
            return result as DasResponse;
        } catch (error) {
            console.error("[DAS] Failed to fetch assets by owner:", error);
            return null;
        }
    }

    /**
     * Fetches details for a single asset (NFT/Token).
     */
    static async getAsset(assetId: string): Promise<DasAsset | null> {
        if (!HELIUS_URL) return null;

        try {
            const response = await fetch(HELIUS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'kimiko-das-single',
                    method: 'getAsset',
                    params: { id: assetId },
                }),
            });

            const { result } = await response.json();
            return result as DasAsset;
        } catch (error) {
            console.error("[DAS] Failed to fetch single asset:", error);
            return null;
        }
    }
}
