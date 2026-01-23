import { Connection, clusterApiUrl } from '@solana/web3.js';

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');
const HELIUS_KEY = process.env.HELIUS_API_KEY;

export const getHeliusRPC = () => {
    if (!HELIUS_KEY) return RPC_URL;
    return `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`;
};

export const connection = new Connection(getHeliusRPC(), 'confirmed');

export const checkConnection = async () => {
    try {
        const slot = await connection.getSlot();
        return { success: true, slot };
    } catch (err) {
        console.error('Solana RPC Connection Error:', err);
        return { success: false, error: err };
    }
};
