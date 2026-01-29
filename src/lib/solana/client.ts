import { Connection } from '@solana/web3.js';

/**
 * Kimiko RPC Client with Health-Aware Rotation
 */

// Define environment interface for type safety
interface KimikoEnv {
    HELIUS_API_KEY?: string;
    ANKR_API_KEY?: string;
    ALCHEMY_API_KEY?: string;
    NEXT_PUBLIC_SOLANA_NETWORK?: string;
    NEXT_PUBLIC_SOLANA_RPC_URL?: string;
}

// Utility to get environment variables safely without @ts-ignore
const getEnv = (key: keyof KimikoEnv): string | undefined => {
    // Check process.env (Node.js)
    if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
        return (process.env as any)[key];
    }
    // Check globalThis (Cloudflare Workers)
    const globalEnv = (globalThis as unknown as KimikoEnv);
    if (globalEnv && globalEnv[key]) {
        return globalEnv[key];
    }
    return undefined;
};

const HELIUS_KEY = getEnv('HELIUS_API_KEY')?.trim();
const ANKR_KEY = getEnv('ANKR_API_KEY')?.trim();
const ALCHEMY_KEY = getEnv('ALCHEMY_API_KEY')?.trim();
const NETWORK = getEnv('NEXT_PUBLIC_SOLANA_NETWORK') || 'mainnet-beta';

const isValidHeliusKey = !!(HELIUS_KEY && HELIUS_KEY.length > 0 && !HELIUS_KEY.startsWith('undefined'));
const isDevnet = NETWORK === 'devnet';

// Construct provider URLs
const HELIUS_URL = isValidHeliusKey ? `https://${isDevnet ? 'devnet' : 'mainnet'}.helius-rpc.com/?api-key=${HELIUS_KEY}` : null;
const ANKR_URL = ANKR_KEY ? `https://rpc.ankr.com/${isDevnet ? 'solana_devnet' : 'solana'}/${ANKR_KEY}` : `https://rpc.ankr.com/${isDevnet ? 'solana_devnet' : 'solana'}`;
const ALCHEMY_URL = ALCHEMY_KEY ? `https://solana-${isDevnet ? 'devnet' : 'mainnet'}.g.alchemy.com/v2/${ALCHEMY_KEY}` : null;
const PUBLIC_SOLANA_URL = isDevnet ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com';

const ALL_RPC_LIST = [
    HELIUS_URL,
    ALCHEMY_URL,
    ANKR_URL,
    getEnv('NEXT_PUBLIC_SOLANA_RPC_URL'),
    PUBLIC_SOLANA_URL,
].filter(Boolean) as string[];

// Batch providers (Ankr, Public, Custom)
const BATCH_RPC_LIST = [
    ANKR_URL,
    getEnv('NEXT_PUBLIC_SOLANA_RPC_URL'),
    PUBLIC_SOLANA_URL,
].filter(Boolean) as string[];

/**
 * Health Tracker System
 */
interface ProviderHealth {
    url: string;
    failures: number;
    lastFailure: number;
}

const HEALTH_STATS = new Map<string, ProviderHealth>(
    ALL_RPC_LIST.map(url => [url, { url, failures: 0, lastFailure: 0 }])
);

const MAX_FAILURES = 3;
const COOLDOWN_MS = 60000; // 1 minute cooldown for failed providers

const getHealthiestProvider = (list: string[]): string => {
    const now = Date.now();

    // Filter for providers that aren't in cooldown OR have low failure counts
    const available = list.filter(url => {
        const stats = HEALTH_STATS.get(url);
        if (!stats) return true;

        const isCoolingDown = stats.failures >= MAX_FAILURES && (now - stats.lastFailure < COOLDOWN_MS);
        return !isCoolingDown;
    });

    const pool = available.length > 0 ? available : list;

    // Pick the one with the fewest failures in the pool
    return pool.reduce((best, current) => {
        const statsBest = HEALTH_STATS.get(best);
        const statsCurrent = HEALTH_STATS.get(current);
        if (!statsBest || !statsCurrent) return best;
        return statsCurrent.failures < statsBest.failures ? current : best;
    }, pool[0]);
};

// State
let currentUrl = getHealthiestProvider(ALL_RPC_LIST);
let currentBatchUrl = getHealthiestProvider(BATCH_RPC_LIST);

export let connection = new Connection(currentUrl, 'confirmed');
export let batchConnection = new Connection(currentBatchUrl, 'confirmed');

/**
 * Public API
 */

export const getCurrentRPC = () => currentUrl;
export const getBatchRPC = () => currentBatchUrl;

export const reportFailure = (url: string) => {
    const stats = HEALTH_STATS.get(url);
    if (stats) {
        stats.failures++;
        stats.lastFailure = Date.now();
        console.warn(`[Kimiko RPC] Provider failure reported: ${url} (Total: ${stats.failures})`);
    }
};

export const rotateRPC = () => {
    reportFailure(currentUrl);
    currentUrl = getHealthiestProvider(ALL_RPC_LIST);
    console.log(`[Kimiko RPC] Rotating to healthiest provider: ${currentUrl}`);
    connection = new Connection(currentUrl, 'confirmed');
    return connection;
};

export const rotateBatchRPC = () => {
    reportFailure(currentBatchUrl);
    currentBatchUrl = getHealthiestProvider(BATCH_RPC_LIST);
    console.log(`[Kimiko RPC] Rotating to healthiest batch provider: ${currentBatchUrl}`);
    batchConnection = new Connection(currentBatchUrl, 'confirmed');
    return batchConnection;
};

export const checkConnection = async () => {
    try {
        const slot = await connection.getSlot();
        return { success: true, slot };
    } catch (err) {
        reportFailure(currentUrl);
        return { success: false, error: err };
    }
};

export const refreshConnection = () => {
    connection = new Connection(currentUrl, 'confirmed');
    return connection;
};

export const refreshBatchConnection = () => {
    batchConnection = new Connection(currentBatchUrl, 'confirmed');
    return batchConnection;
};
