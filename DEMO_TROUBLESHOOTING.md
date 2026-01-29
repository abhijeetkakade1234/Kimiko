# Kimiko Demo Troubleshooting Guide

## Current RPC Status: ULTRA-CONSERVATIVE MODE ✅

The app is now configured for **maximum RPC reliability** at the cost of analyzing fewer transactions.

### What Changed:
- **Transaction Limit**: Reduced from 20 → **10 transactions**
- **Batch Size**: Reduced from 50 → **10 per batch**
- **Inter-batch Delay**: Added **500ms delay** between batches
- **Retry Count**: Still at **5 attempts** with exponential backoff

### If You Still Get 429 Errors:

#### Option 1: Use Your Own Wallet (RECOMMENDED)
1. Open Phantom/Solflare wallet
2. Copy your address
3. Paste into Kimiko
4. Should work instantly (personal wallets are lightweight)

#### Option 2: Clear the Cache
```bash
# Stop the dev server (Ctrl+C)
# Restart it
pnpm dev
```

#### Option 3: Demo Mode (Last Resort)
If the RPC is completely down, you can:
1. Open `src/lib/analysis/engine.ts`
2. Uncomment the DEMO_MODE section (if I add it)
3. This will show pre-computed results for specific test addresses

### Working Test Addresses (Verified Low Activity):
- `7M98R89vjLh7fDAn2y5at3u5Vstz9eC9t5E8FfEaG5S8` (should work now with limit=10)
- Your own Phantom wallet address

### Why This Happens:
- **Helius Free Tier**: 100 requests/10 seconds limit
- **Each Analysis**: Uses 2-3 RPC calls minimum
- **Browser Caching**: Sometimes retries the same request multiple times

### Last Resort - Use Public RPC:
In `.env.local`, comment out Helius and use:
```env
# HELIUS_API_KEY=...
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```
⚠️ Public RPC is slower but has no rate limits for small requests.
