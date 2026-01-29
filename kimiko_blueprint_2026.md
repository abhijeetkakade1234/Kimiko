# 🛡️ Kimiko — Solana Privacy Report Engine (Resume MVP Blueprint)

Kimiko is an asynchronous privacy analysis engine for Solana wallets designed for public use.  
Users submit a wallet + email, and Kimiko generates a privacy score and exposure report, then delivers it via email.

This blueprint documents the minimal architecture required to make Kimiko production-capable, resume-worthy, and not just a hackathon demo.

---

## 🎯 1. Goals

- Provide a **simple privacy score** for Solana wallets
- Detect basic exposure vectors
- Generate **actionable recommendations**
- Deliver results via **email**, not real-time
- Avoid RPC rate limits using **queue + caching**
- Run on **zero/low-cost serverless infra**
- Be usable by **normal end users**

---

## 🧩 2. User Flow

1. User enters wallet + email
2. System validates email & limits (1 wallet/day/email)
3. Creates job in queue
4. Worker processes job asynchronously
5. Worker fetches & analyzes wallet history
6. Worker stores report in DB
7. Worker emails the report link to user
8. User views report on web
9. Cache expires (TTL = 24h or more)

---

## 🏗 3. System Architecture (Simple Overview)

Users -> Frontend (Cloudflare Pages / Next.js) -> Job Queue -> Workers -> D1 -> Email -> Web Viewer

---

## 📦 4. Components

| Component | Role |
|---|---|
| Pages | UI |
| Workers | API + compute |
| Queues | asynchronous job execution |
| D1 | persistent results DB |
| KV (optional) | caching layer |
| Postmark | email delivery |
| RPC Providers | data sources |

---

## 🔗 5. RPC Stack

Use rotated RPCs to avoid 429 limits:

- **Helius**
- **Quicknode**
- **Ankr**
- **Public Solana RPC**

---

## 🧱 6. Database Schema (D1)

```sql
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  wallet TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
  wallet TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE email_limits (
  email TEXT,
  wallet TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧾 7. Rate Limit Policies

Free tier:

- `1 wallet / email / 24h`
- `3 wallets / IP / 24h`

---

## 🧮 8. Privacy Score Model (Simple)

Score: 0-100

Bucket:

| Score | Risk |
|---|---|
| 80-100 | Low |
| 60-79 | Medium |
| 0-59 | High |

---

## 📝 9. Report Format

Includes:

- Wallet
- Score
- Risk level
- Timestamp
- Findings (Risks)
- Recommendations

---

## 📧 10. Email Delivery

Provider: **Postmark**

Subject:

```
Your Solana Privacy Report for {WALLET}
```

---

## 🏁 11. Deployment Targets

- Cloudflare Pages (Next.js UI)
- Cloudflare Workers (API/worker)
- Cloudflare Queues (jobs)
- Cloudflare D1 (storage)
- Postmark (email)
- RPC Providers (multi-source)

---

## 🔬 12. Resume Talking Points

Demonstrates:

- async compute & queues
- RPC batching & rotation
- rate-limit resilience
- serverless infra
- privacy/security awareness
- data engineering
- product thinking

---

## 📅 13. Build Timeline

| Week | Deliverable |
|---|---|
| 1 | UI + email flow |
| 2 | queue + worker + RPC |
| 3 | scoring + reporting |
| 4 | polish + deploy |

---
