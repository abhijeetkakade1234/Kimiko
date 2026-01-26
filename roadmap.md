# Kimiko Production Roadmap ⛩️🚀

This document outlines the architectural evolution of Kimiko from a Hackathon MVP to a global Solana privacy infrastructure.

## Phase 1: Infrastructure Hardening (Short Term)
- [x] **DAS Integration**: Replace standard RPC calls with Helius Digital Asset System (DAS) for instant portfolio and transaction indexing.
- [x] **Modular "Seishin" Engine**: Refactor `engine.ts` into a standalone service that can be hosted on high-performance compute (Rust/Go).
- [x] **Persistent Cache Layer**: Move from memory-based `Map` cache to **Redis** for globally shared analysis results.

## Phase 2: Privacy Expansion (Medium Term)
- [ ] **Mainnet Inco Integration**: Transition from Base Sepolia to Inco Mainnet for real confidential attestations.
- [x] **Zk-Privacy Scores**: Implement Zero-Knowledge Proofs (using SnarkJS) to allow users to prove they are "Low Risk" without revealing their specific score or wallet address.
- [x] **Selective Visibility Dashboard**: A portal for users to manage which protocols have permission to view their "Confidential Identity".

## Phase 3: Ecosystem Integration (Long Term)
- [ ] **Wallet Guard SDK**: A lightweight SDK for Phantom/Solflare to display Kimiko risk assessments pre-transaction.
- [ ] **Dynamic Obfuscation**: One-click "Cleaning" paths using Solana Address Lookup Tables (LUTs) and Whirlpool mixing patterns.
- [ ] **The Zen DAO**: Governance for the Kimiko privacy toolkit, allowing the community to vote on new "Surveillance Vectors" to track.

---

## Technical Debt to Resolve
1. Replace "Resilience Fallbacks" with robust error recovery.
2. Implement comprehensive unit testing for the scoring heuristics (`scorer.ts`).
3. Optimize D3.js rendering for wallets with >10,000 transactions.
