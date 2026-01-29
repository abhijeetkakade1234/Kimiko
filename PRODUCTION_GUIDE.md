# 🚀 Kimiko Production Guide: Cloudflare Stack (2026)

This guide details how to make Kimiko a **production-ready** application using the Cloudflare ecosystem. It covers every component from the blueprint: **Workers, Queues, D1, KV, Cron Triggers, Postmark Email, Caching, and Rate Limiting**.

---

## 📚 Table of Contents

1.  [Architecture Overview](#architecture-overview)
2.  [Prerequisites](#prerequisites)
3.  [Cloudflare Workers (+ Next.js)](#cloudflare-workers--nextjs)
4.  [Cloudflare Queues (Async Jobs)](#cloudflare-queues-async-jobs)
5.  [Cloudflare D1 (Database)](#cloudflare-d1-database)
6.  [Cloudflare KV (Caching)](#cloudflare-kv-caching)
7.  [Cron Triggers (Scheduled Jobs)](#cron-triggers-scheduled-jobs)
8.  [Postmark (Email Delivery)](#postmark-email-delivery)
9.  [Rate Limiting](#rate-limiting)
10. [Performance Optimization](#performance-optimization)
11. [Deployment Checklist](#deployment-checklist)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                               │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│              CLOUDFLARE PAGES (Next.js Frontend)                    │
│   - Static UI for wallet input + email submission                   │
│   - Report viewer page                                              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ (HTTP Request)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│               CLOUDFLARE WORKER (API Producer)                      │
│   - Validates email & wallet                                        │
│   - Checks rate limits (KV / D1)                                    │
│   - Sends job to Queue                                              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ (Queue Message)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│               CLOUDFLARE QUEUE (Job Buffer)                         │
│   - Stores pending analysis jobs                                    │
│   - Retries on failure                                              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ (Batch Consume)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│             CLOUDFLARE WORKER (Queue Consumer)                      │
│   - Fetches Solana data from RPC                                    │
│   - Runs privacy analysis                                           │
│   - Stores report in D1                                             │
│   - Sends email via Resend                                          │
└───────────────┬───────────────────────────────────┬─────────────────┘
                │                                   │
                ▼                                   ▼
┌───────────────────────────┐       ┌───────────────────────────────┐
│   CLOUDFLARE D1 (SQLite)  │       │      RESEND (Email API)       │
│   - jobs, reports tables  │       │   - Sends report link to user │
└───────────────────────────┘       └───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE KV (Cache)                         │
│   - Caches reports for 24h (read-heavy optimization)              │
│   - Stores rate limit counters                                    │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Prerequisites

Before starting, ensure you have the following:

| Tool | Version | Why |
|---|---|---|
| **Node.js** | >= 18.x | Required for Wrangler CLI |
| **pnpm / npm** | Latest | Package management |
| **Wrangler CLI** | Latest (`npm i -g wrangler`) | Cloudflare's CLI for Workers, D1, KV, Queues |
| **Cloudflare Account** | Free Tier OK | Access to Workers, D1, Queues |
| **Resend Account** | Free Tier (3,000 emails/month) | Email delivery |
| **Solana RPC Keys** | Helius, Ankr, or Alchemy | Data fetching |

---

## ⚙️ Cloudflare Workers (+ Next.js)

### What is it?
Cloudflare Workers are **serverless functions** that run at the edge (closest to the user). For Next.js, we use the `@opennextjs/cloudflare` adapter to deploy the entire app on Workers.

### Setup

1.  **Create a new Next.js project configured for Workers:**
    ```bash
    npm create cloudflare@latest -- kimiko-app --framework=next
    cd kimiko-app
    ```

2.  **Configure `wrangler.toml`:**
    ```toml
    name = "kimiko-app"
    compatibility_date = "2026-01-01"
    compatibility_flags = ["nodejs_compat"]

    # Bindings for other services (D1, KV, Queues) will be added below
    ```

3.  **Local Development:**
    ```bash
    npm run dev       # Standard Next.js dev server
    npm run preview   # Test on local Wrangler (simulates edge)
    ```

4.  **Deploy to Cloudflare Pages:**
    - Connect your GitHub repo via the Cloudflare Dashboard > Pages > Create > Connect to Git.
    - Set framework to **Next.js**, build command to `pnpm run build`, output directory to `.vercel/output/static`.

### Key Considerations
- **No Cold Starts:** Workers are always warm due to Cloudflare's V8 isolate architecture.
- **Request Limits:** Free tier allows 100,000 requests/day.

---

## 📬 Cloudflare Queues (Async Jobs)

### What is it?
Queues are a **message buffer** that decouples your API (Producer) from your analysis engine (Consumer). This prevents RPC rate limits from crashing the frontend.

### Setup

1.  **Create a Queue via Wrangler:**
    ```bash
    wrangler queues create kimiko-analysis-queue
    ```

2.  **Configure `wrangler.toml`:**
    ```toml
    [[queues.producers]]
    queue = "kimiko-analysis-queue"
    binding = "ANALYSIS_QUEUE"

    [[queues.consumers]]
    queue = "kimiko-analysis-queue"
    max_batch_size = 10
    max_batch_timeout = 30
    max_retries = 3
    dead_letter_queue = "kimiko-dlq"  # For failed jobs
    ```

3.  **Producer Worker (API Route):**
    ```typescript
    // src/app/api/analyze/route.ts
    export async function POST(request: Request, env: Env) {
        const { wallet, email } = await request.json();

        // Validate and check rate limits here...

        // Send job to queue
        await env.ANALYSIS_QUEUE.send({
            wallet,
            email,
            createdAt: Date.now(),
        });

        return Response.json({ message: 'Analysis queued. Check your email!' });
    }
    ```

4.  **Consumer Worker:**
    Create a separate Worker to handle queue messages:
    ```typescript
    // worker/consumer.ts
    export default {
        async queue(batch: MessageBatch<Job>, env: Env): Promise<void> {
            for (const message of batch.messages) {
                const { wallet, email } = message.body;

                try {
                    const report = await analyzeWallet(wallet, env);
                    await saveReportToD1(wallet, report, env);
                    await sendEmailViaResend(email, wallet, report, env);
                    message.ack(); // Acknowledge success
                } catch (err) {
                    console.error(`Failed job for ${wallet}:`, err);
                    message.retry(); // Will retry up to max_retries
                }
            }
        },
    };
    ```

### Key Considerations
- **Dead Letter Queue (DLQ):** Redirect permanently failed jobs to a DLQ for manual review.
- **Batching:** Process up to 10 messages at once to reduce overhead.

---

## 🗄️ Cloudflare D1 (Database)

### What is it?
D1 is a **serverless SQLite database** that runs at the edge. It's perfect for storing job statuses and generated reports.

### Setup

1.  **Create a D1 Database:**
    ```bash
    wrangler d1 create kimiko-db
    ```
    Copy the `database_id` from the output.

2.  **Configure `wrangler.toml`:**
    ```toml
    [[d1_databases]]
    binding = "DB"
    database_name = "kimiko-db"
    database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    ```

3.  **Create Schema (`schema.sql`):**
    ```sql
    -- Jobs table
    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        wallet TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Reports table
    CREATE TABLE IF NOT EXISTS reports (
        wallet TEXT PRIMARY KEY,
        data TEXT NOT NULL,          -- JSON blob of the analysis result
        score INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
    );

    -- Email rate limits
    CREATE TABLE IF NOT EXISTS email_limits (
        email TEXT NOT NULL,
        wallet TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (email, wallet)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_reports_expires ON reports(expires_at);
    ```

4.  **Apply Schema:**
    ```bash
    wrangler d1 execute kimiko-db --file=./schema.sql
    ```

5.  **Query from Worker:**
    ```typescript
    const { results } = await env.DB.prepare(
        'SELECT * FROM reports WHERE wallet = ?'
    ).bind(walletAddress).all();
    ```

### Key Considerations
- **10GB Limit:** Each D1 database is capped at 10GB. For larger scale, shard by tenant.
- **Time Travel:** Paid plans allow restoring data to any point in the last 30 days.

---

## 💾 Cloudflare KV (Caching)

### What is it?
KV is a **globally distributed key-value store** optimized for **read-heavy** workloads. Use it to cache reports and reduce D1 load.

### Setup

1.  **Create a KV Namespace:**
    ```bash
    wrangler kv:namespace create "REPORT_CACHE"
    ```

2.  **Configure `wrangler.toml`:**
    ```toml
    [[kv_namespaces]]
    binding = "REPORT_CACHE"
    id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ```

3.  **Caching Pattern in Worker:**
    ```typescript
    async function getReport(wallet: string, env: Env) {
        // 1. Check KV cache first
        const cached = await env.REPORT_CACHE.get(wallet, { type: 'json' });
        if (cached) {
            console.log('[Cache] HIT for', wallet);
            return cached;
        }

        // 2. Cache miss - fetch from D1
        console.log('[Cache] MISS for', wallet);
        const { results } = await env.DB.prepare(
            'SELECT data FROM reports WHERE wallet = ?'
        ).bind(wallet).first();

        if (results) {
            // 3. Store in KV with 24-hour TTL
            await env.REPORT_CACHE.put(wallet, JSON.stringify(results.data), {
                expirationTtl: 86400, // 24 hours in seconds
            });
        }

        return results?.data;
    }
    ```

### Key Considerations
- **Eventually Consistent:** Changes can take up to 60 seconds to propagate globally.
- **2MB Value Limit:** Store large reports in D1, use KV for the summary/score.

---

## ⏰ Cron Triggers (Scheduled Jobs)

### What is it?
Cron Triggers allow you to run Workers on a **schedule** (e.g., every hour, daily at midnight UTC). Perfect for cleanup tasks.

### Setup

1.  **Configure `wrangler.toml`:**
    ```toml
    [triggers]
    crons = [
        "0 */6 * * *",   # Every 6 hours: Clean expired reports
        "0 0 * * *",     # Daily at midnight UTC: Reset rate limit counters
    ]
    ```

2.  **Handle in Worker:**
    ```typescript
    export default {
        async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
            console.log('[Cron] Triggered at', new Date(event.scheduledTime).toISOString());

            // Delete expired reports
            await env.DB.prepare(
                'DELETE FROM reports WHERE expires_at < CURRENT_TIMESTAMP'
            ).run();

            // Clear old rate limit entries
            await env.DB.prepare(
                "DELETE FROM email_limits WHERE created_at < datetime('now', '-1 day')"
            ).run();

            console.log('[Cron] Cleanup complete');
        },
    };
    ```

3.  **Test Locally:**
    ```bash
    wrangler dev --test-scheduled
    # Then in another terminal:
    curl "http://localhost:8787/__scheduled?cron=0+0+*+*+*"
    ```

### Key Considerations
- **All times are UTC.**
- **No extra cost** — scheduled executions count towards your standard Worker limits.
- **Propagation delay** — Changes to cron schedules can take up to 15 minutes.

---

## ✉️ Postmark (Email Delivery)

### What is it?
Postmark is a transactional email service known for high deliverability. It's perfect for sending Kimiko's privacy reports.

### Setup

1.  **Create a Postmark Account:**
    - Sign up at [postmarkapp.com](https://postmarkapp.com).
    - Verify your sender domain (e.g., `kimiko.app`).
    - Get your **Server API Token** from the dashboard.

2.  **Store API Token as a Secret:**
    ```bash
    wrangler secret put POSTMARK_API_TOKEN
    # Paste your token when prompted
    ```

3.  **Send Email from Worker:**
    ```typescript
    async function sendEmailViaPostmark(
        toEmail: string,
        wallet: string,
        score: number,
        env: Env
    ) {
        const reportUrl = `https://kimiko.app/report/${wallet}`;

        const response = await fetch('https://api.postmarkapp.com/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Postmark-Server-Token': env.POSTMARK_API_TOKEN,
            },
            body: JSON.stringify({
                From: 'reports@kimiko.app',
                To: toEmail,
                Subject: `Your Solana Privacy Report for ${wallet.slice(0, 8)}...`,
                HtmlBody: `
                    <h1>⛩️ Your Kimiko Privacy Report</h1>
                    <p><strong>Wallet:</strong> ${wallet}</p>
                    <p><strong>Privacy Score:</strong> ${score}/100</p>
                    <p><a href="${reportUrl}">View Full Report →</a></p>
                `,
                TextBody: `Your Kimiko Privacy Report\n\nWallet: ${wallet}\nScore: ${score}/100\n\nView: ${reportUrl}`,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Postmark Error: ${error}`);
        }
    }
    ```

### Key Considerations
- **Free Tier:** 100 emails/month. Upgrade for production.
- **Domain Verification:** Required for high deliverability.
- **Track Opens/Clicks:** Postmark provides analytics in its dashboard.

---

## 🛡️ Rate Limiting

### Strategy
Implement a **multi-layer** rate limiting approach:

| Layer | Location | Purpose |
|---|---|---|
| **Cloudflare WAF** | Edge | Block bots and DDoS before reaching Workers |
| **KV Counter** | Worker | Fast per-IP or per-email limits |
| **D1 Persistent** | Worker | Long-term abuse tracking |

### Implementation

1.  **WAF Rate Limiting (Dashboard):**
    - Go to **Security > WAF > Rate Limiting Rules**.
    - Create a rule: Block IPs that exceed **5 requests/10 seconds** to `/api/analyze`.

2.  **KV-based Rate Limit in Worker:**
    ```typescript
    async function checkRateLimit(email: string, env: Env): Promise<boolean> {
        const key = `ratelimit:${email}`;
        const count = parseInt(await env.REPORT_CACHE.get(key) || '0');

        if (count >= 3) {
            return false; // Blocked
        }

        await env.REPORT_CACHE.put(key, String(count + 1), {
            expirationTtl: 86400, // 24-hour window
        });

        return true; // Allowed
    }
    ```

3.  **D1 Persistent Limit (for abuse tracking):**
    ```typescript
    async function logEmailRequest(email: string, wallet: string, env: Env) {
        await env.DB.prepare(
            'INSERT OR IGNORE INTO email_limits (email, wallet) VALUES (?, ?)'
        ).bind(email, wallet).run();
    }
    ```

### Key Considerations
- **Don't rely only on IP:** Use email, API keys, or session tokens.
- **Return 429 with `Retry-After`:** Be a good API citizen.

---

## ⚡ Performance Optimization

### 1. RPC Request Batching
Instead of individual `getTransaction` calls, batch them:
```typescript
const batchSize = 5;
for (let i = 0; i < signatures.length; i += batchSize) {
    const batch = signatures.slice(i, i + batchSize);
    const results = await connection.getParsedTransactions(batch);
    // Process results...
    await sleep(500); // Be gentle on RPC
}
```

### 2. Edge Caching with Cache API
For static assets and common report pages:
```typescript
const cache = caches.default;
const cachedResponse = await cache.match(request);
if (cachedResponse) return cachedResponse;

const freshResponse = await handleRequest(request);
ctx.waitUntil(cache.put(request, freshResponse.clone()));
return freshResponse;
```

### 3. Minimize Cold Start
- Keep Workers small (< 1MB).
- Avoid top-level `await` in module.
- Use dynamic imports for heavy libraries.

### 4. RPC Provider Rotation
Reuse the existing `src/lib/solana/client.ts` rotation logic in your Consumer Worker.

---

## ✅ Deployment Checklist

Before going live, ensure you have:

- [ ] **Environment Variables Set:**
  ```bash
  wrangler secret put POSTMARK_API_TOKEN
  wrangler secret put HELIUS_API_KEY
  wrangler secret put ANKR_API_KEY
  ```

- [ ] **D1 Schema Applied:**
  ```bash
  wrangler d1 execute kimiko-db --file=./schema.sql
  ```

- [ ] **Queues Created:**
  ```bash
  wrangler queues create kimiko-analysis-queue
  wrangler queues create kimiko-dlq
  ```

- [ ] **KV Namespace Created:**
  ```bash
  wrangler kv:namespace create "REPORT_CACHE"
  ```

- [ ] **WAF Rate Limiting Enabled** in Cloudflare Dashboard.

- [ ] **Cron Triggers Tested:**
  ```bash
  wrangler dev --test-scheduled
  curl "http://localhost:8787/__scheduled"
  ```

- [ ] **Resend Key Set.**

- [ ] **Production Deployment:**
  ```bash
  wrangler deploy
  ```

---

## 📖 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Queues Docs](https://developers.cloudflare.com/queues/)
- [Cloudflare KV Docs](https://developers.cloudflare.com/kv/)
- [Postmark Developer Docs](https://postmarkapp.com/developer)

---

*This guide was compiled based on research from the latest Cloudflare documentation (2026) and best practices for serverless Solana applications.*
