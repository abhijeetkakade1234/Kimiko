import { Connection, clusterApiUrl } from '@solana/web3.js';

// Safe environment variable access for Edge compatibility
const getEnv = (key: string): string | undefined => {
    // Check if process exists and has env property
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    // Fallback for some edge environments where process might be shimmed differently
    // or if we need to access bindings directly (though bindings are usually passed in handler)
    return undefined;
};

// Validate HELIUS_KEY to prevent security vulnerabilities
const HELIUS_KEY = getEnv('HELIUS_API_KEY')?.trim();
const ANKR_KEY = getEnv('ANKR_API_KEY')?.trim();
const ALCHEMY_KEY = getEnv('ALCHEMY_API_KEY')?.trim();
const NETWORK = getEnv('NEXT_PUBLIC_SOLANA_NETWORK') || 'mainnet-beta';
const NEXT_PUBLIC_SOLANA_RPC_URL = getEnv('NEXT_PUBLIC_SOLANA_RPC_URL');

const isValidHeliusKey = HELIUS_KEY && HELIUS_KEY.length > 0 && !HELIUS_KEY.startsWith('undefined');

// Construct specialized URLs based on network
const isDevnet = NETWORK === 'devnet';

const HELIUS_URL = isValidHeliusKey ? `https://${isDevnet ? 'devnet' : 'mainnet'}.helius-rpc.com/?api-key=${HELIUS_KEY}` : null;
const ANKR_URL = ANKR_KEY ? `https://rpc.ankr.com/${isDevnet ? 'solana_devnet' : 'solana'}/${ANKR_KEY}` : `https://rpc.ankr.com/${isDevnet ? 'solana_devnet' : 'solana'}`;
const ALCHEMY_URL = ALCHEMY_KEY ? `https://solana-${isDevnet ? 'devnet' : 'mainnet'}.g.alchemy.com/v2/${ALCHEMY_KEY}` : null;
const PUBLIC_SOLANA_URL = isDevnet ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com';

// RPC providers that support batch requests
const BATCH_RPC_PROVIDERS = [
    ANKR_URL,
    NEXT_PUBLIC_SOLANA_RPC_URL,
    PUBLIC_SOLANA_URL,
].filter(Boolean) as string[];

// All RPC providers
const RPC_PROVIDERS = [
    HELIUS_URL,
    ALCHEMY_URL,
    ANKR_URL,
    NEXT_PUBLIC_SOLANA_RPC_URL,
    PUBLIC_SOLANA_URL,
].filter(Boolean) as string[];

// Log status
if (!isValidHeliusKey && getEnv('HELIUS_API_KEY')) {
    console.warn('[Kimiko RPC] HELIUS_API_KEY is invalid - falling back');
}

let currentRpcIndex = 0;
let currentBatchRpcIndex = 0;

export const getCurrentRPC = () => {
    const rpc = RPC_PROVIDERS[currentRpcIndex % RPC_PROVIDERS.length];
    const providerNum = currentRpcIndex % RPC_PROVIDERS.length + 1;
    const isHelius = isValidHeliusKey && providerNum === 1;
    console.log(`[Kimiko RPC] Using provider ${providerNum}/${RPC_PROVIDERS.length}${isHelius ? ' (Helius)' : ''}`);
    return rpc;
};

export const getBatchRPC = () => {
    const rpc = BATCH_RPC_PROVIDERS[currentBatchRpcIndex % BATCH_RPC_PROVIDERS.length];
    const providerNum = currentBatchRpcIndex % BATCH_RPC_PROVIDERS.length + 1;
    console.log(`[Kimiko RPC] Using batch-compatible provider ${providerNum}/${BATCH_RPC_PROVIDERS.length} (Ankr)`);
    return rpc;
};

export const rotateRPC = () => {
    currentRpcIndex++;
    const newRPC = getCurrentRPC();
    console.log('[Kimiko RPC] Rotating to next provider due to rate limit');
    return new Connection(newRPC, 'confirmed');
};

export const rotateBatchRPC = () => {
    currentBatchRpcIndex++;
    const newRPC = getBatchRPC();
    console.log('[Kimiko RPC] Rotating to next batch provider due to rate limit');
    return new Connection(newRPC, 'confirmed');
};

// Lazy singleton instances
let connectionInstance: Connection | null = null;
let batchConnectionInstance: Connection | null = null;

// Primary connection (can use Helius for signature fetching)
export const getConnection = () => {
    if (!connectionInstance) {
        connectionInstance = new Connection(getCurrentRPC(), 'confirmed');
    }
    return connectionInstance;
};

// Separate connection for batch operations (uses Ankr, not Helius free tier)
export const getBatchConnection = () => {
    if (!batchConnectionInstance) {
        batchConnectionInstance = new Connection(getBatchRPC(), 'confirmed');
    }
    return batchConnectionInstance;
};

export const checkConnection = async () => {
    try {
        const conn = getConnection();
        const slot = await conn.getSlot();
        return { success: true, slot };
    } catch (err) {
        console.error('Solana RPC Connection Error:', err);
        return { success: false, error: err };
    }
};

// Utility to refresh connection (useful after rotation)
export const refreshConnection = () => {
    connectionInstance = new Connection(getCurrentRPC(), 'confirmed');
    return connectionInstance;
};

export const refreshBatchConnection = () => {
    batchConnectionInstance = new Connection(getBatchRPC(), 'confirmed');
    return batchConnectionInstance;
};
