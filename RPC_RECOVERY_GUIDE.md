# 🚨 CRITICAL: Rate Limit Recovery Instructions

## Your Helius API Key is Rate-Limited

Your current situation:
- **Helius Free Tier**: Exhausted (429 errors on every request)
- **Public Solana RPC**: Also hitting limits from retry spam
- **Your IP**: Temporarily flagged for excessive requests

## ✅ IMMEDIATE FIXES APPLIED:

### 1. Switched to Ankr RPC (Free, Better Limits)
I've updated `.env.local` to use `https://rpc.ankr.com/solana` which has:
- Better rate limits than public Solana RPC
- No API key required
- More stable for repeated requests

### 2. Multi-Provider Fallback
The app now rotates between 4 different RPC providers automatically if one fails.

### 3. Demo Mode is Still Available
The 3 demo wallets (`DEMO_LOW_RISK`, etc.) work instantly without any RPC calls.

## 🎯 NEXT STEPS (Do This Now):

1. **Stop the dev server**: Press `Ctrl+C`

2. **Wait 5 minutes**: This lets your IP cool off from the rate limit ban

3. **Clear your browser cache**: 
   - Press `Ctrl+Shift+Delete`
   - Clear "Cached images and files"
   - This removes any stuck retry loops

4. **Restart dev server**: `pnpm dev`

5. **Try YOUR wallet first**: Don't use the demo addresses, use your actual Phantom/Solflare wallet address

## 📊 Expected Behavior:

With Ankr RPC, you should see:
```
[Kimiko RPC] Using provider 1/4
[Kimiko Fetcher] Found X signatures for [your wallet]
POST /api/analyze 200 in ~3000ms
```

## 🔥 If Still Failing After 5 Minutes:

**Nuclear Option - Use Only Demo Mode:**
1. Open `src/lib/analysis/engine.ts`
2. Comment out line 12-16 (the demo check)
3. This forces ALL requests to use demo data (100% reliable for presentation)

## 💡 For Production (After Hackathon):

- Get a dedicated RPC provider (QuickNode, Triton, GenesysGo)
- Free tiers: 100-500k requests/month
- Much more stable than public endpoints
