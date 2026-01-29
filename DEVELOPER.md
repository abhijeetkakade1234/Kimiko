# Kimiko Developer Guide

Kimiko provides a suite of tools for protocols to verify user privacy and behavior without requiring invasive KYC.

## 📡 REST API

### 1. Get Wallet Privacy Score
A lightweight endpoint for quick checks.

**Endpoint:** `GET /api/score/[wallet]`

**Response:**
```json
{
  "success": true,
  "wallet": "DYw8jCTfw...",
  "privacyScore": 85,
  "complianceTier": "LOW_RISK",
  "lastAnalyzed": 1706123456789
}
```

### 2. Full Wallet Analysis
Deep analysis including leakage vectors and recommendations.

**Endpoint:** `POST /api/analyze`

**Body:** `{ "wallet": "..." }`

---

## 📦 TypeScript SDK

The Kimiko SDK is the easiest way to integrate privacy scores into your dApp.

### Installation

```bash
pnpm add ./sdk # For local development
# or
npm install @solana-privacy-toolkit/sdk
```

### Basic Usage

```typescript
import { KimikoClient } from '@solana-privacy-toolkit/sdk';

const kimiko = new KimikoClient({
  baseUrl: 'https://kimiko-privacy.vercel.app'
});

// Get a lightweight score
const result = await kimiko.getScore('DYw8jCTfw...');

if (result.privacyScore < 30) {
  console.log("High risk wallet detected!");
}

// Perform deep analysis
const analysis = await kimiko.analyze('DYw8jCTfw...');
console.log(analysis.leakageVectors);
```

### Integration Examples

#### Sybil Resistance
Use the `privacyScore` and `complianceTier` to filter out automated or high-risk accounts from participating in airdrops or治理.

#### Risk Mitigation
Apply dynamic fees or limits based on the user's `BRIDGE_CORRELATION` or `CEX_EXPOSURE`.

---

## 🔒 Confidential Compliance (Upcoming)
Expect **Inco Lightning** integration for zero-knowledge compliance proofs, allowing users to prove they are "Low Risk" without even revealing their privacy score.
