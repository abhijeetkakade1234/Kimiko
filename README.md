# Kimiko: Compliant Privacy for Solana

**Kimiko** is a privacy analysis and compliance toolkit designed for the Solana ecosystem. It helps users manage their on-chain identity and helps protocols verify users without invasive KYC.

## 🌟 Why Kimiko?

In an open blockchain, privacy is often sacrificed for legitimacy. **Kimiko** solves this by providing "Behavioral Compliance"—protecting your identity while proving your legitimacy as a user.

## 🚀 Core Features

- **Privacy Score**: A 0-100 health check of your wallet's anonymity.
- **Compliance Tiering**: Proof of legitimacy (Low, Medium, High Risk) without revealing identity.
- **Leakage Map**: Visual graph of transactional links and clustering risks.
- **Actionable Advice**: Priorities for improving your privacy residency.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 19, TailwindCSS, Framer Motion.
- **Backend**: Next.js API Routes, @solana/web3.js, Helius API.
- **Visuals**: Recharts (D3 in progress).

## 🏃 Getting Started

1. **Clone & Install**:
   ```bash
   pnpm install
   ```

2. **Env Setup**:
   Copy `.env.local.example` to `.env.local` and add your `HELIUS_API_KEY`.

3. **Run Dev Server**:
   ```bash
   pnpm dev
   ```

4. **Analyze**:
   Visit `localhost:3000` and enter a Solana address (e.g., `DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK`).

---

## 🏗️ Roadmap

See [roadmap.md](file:///C:/Users/abhij/.gemini/antigravity/brain/d23b59e1-ba0e-4203-a8ca-a2c9fcf20291/roadmap.md) for detailed project phases.

## 📖 Pitch Guide

Check our [pitch_guide.md](file:///C:/Users/abhij/.gemini/antigravity/brain/d23b59e1-ba0e-4203-a8ca-a2c9fcf20291/pitch_guide.md) to understand the project's vision for your hackathon.
