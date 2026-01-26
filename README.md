# Kimiko: The Digital Zen of Privacy ⛩️💎

**Kimiko** (キミコ) is a high-end Solana wallet analysis engine that transforms complex on-chain surveillance data into a "Digital Zen" experience. It empowers users with **Selective Visibility**, allowing them to navigate the blockchain without becoming a victim of mass financial surveillance.

---

## 🌟 The Philosophy: Selective Visibility

In crypto, privacy is often misunderstood as "hiding." We believe it's about **Consensual Disclosure**. 
Kimiko allows you to measure and manage your "Exposure Surface," giving you the tools to prove your legitimacy (Compliance) without revealing your entire financial history.

---

## 🚀 Hackathon Submission Details

### Track 1: Mass Financial Surveillance
- **Surveillance Insights**: Generates specific tactical reports on how institutional scrapers (Whale-watchers, etc.) profile your identity.
- **Exposure Vectors**: Detects CEX timing correlations, address reuse, and behavioral fingerprints that link your degen trading to your real-world ID.

### Track 2: Privacy Without Jargon
- **The Zen Interface**: A custom-designed "Tactical HUD" that translates raw hex data and complex heuristics into intuitive, human-readable risk assessments.
- **Privacy Guide**: In-app educational modules explaining "Consensual Visibility" in plain English.

---

## 🛠️ Technical Architecture

Kimiko is built with a focus on high-fidelity performance and institutional-grade privacy:

- **Inco Shield (FHE)**: Utilizes **Fully Homomorphic Encryption** via the Inco Lightning network. Analysis results are encrypted on-chain, allowing for "Trustless Reputation" (e.g., proving you are a low-risk user to a dApp without revealing your wallet history).
- **Tactical RPC Engine**: A resilient, non-blocking RPC rotation system that handles 429 rate limits and connection timeouts automatically across Helius, Ankr, and Alchemy.
- **Zero-AI Intentional Design**: A bespoke UI/UX built with CSS grids, CRT scanlines, and HUD elements to create a more authentic and professional "surveillance-tech" atmosphere.

---

## 🏃 How to Run & Use

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **pnpm**: Recommended (or npm/yarn)

### 2. Installation
```bash
git clone https://github.com/[your-repo]/kimiko.git
cd kimiko
pnpm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# Solana Network (mainnet-beta or devnet)
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# RPC Providers
HELIUS_API_KEY=your_helius_key
ANKR_API_KEY=your_ankr_key
ALCHEMY_API_KEY=your_alchemy_key

# Optional: Public Fallback
NEXT_PUBLIC_SOLANA_RPC_URL=https://rpc.ankr.com/solana_devnet
```

### 4. Launch
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to enter the Zen.

---

## 🧊 Selective Privacy Stack
- **Frontend**: Next.js 14 (App Router), Framer Motion, TailwindCSS.
- **Confidentiality**: Inco Lightning Network (`@inco/js`).
- **Data Engine**: Helius Digital Assets API + Custom Heuristic Classifier.
- **Resilience**: Adaptive RPC Rotation & Server-side Request Deduplication.

---

## 🏆 Project Roadmap
- [x] High-Fidelity Tactical UI Implementation
- [x] Inco Shield Encrypted Attestations
- [x] "Privacy Without Jargon" Content Modules
- [ ] ZK-Proof Generation for Compliance Tiers
- [ ] Mobile-native "Privacy Vault" App

---
*Developed for the Solana Privacy Hackathon 2026.*
