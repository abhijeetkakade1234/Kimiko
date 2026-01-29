import { analyzeWallet } from './engine';
import { WalletAnalysis } from '../types';
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

export interface Job {
    wallet: string;
    email: string;
    createdAt: number;
}

export interface Env {
    DB: D1Database;
    REPORT_CACHE: KVNamespace;
    RESEND_API_KEY: string;
    HELIUS_API_KEY?: string;
    ANKR_API_KEY?: string;
    ALCHEMY_API_KEY?: string;
}

const RETENTION_DAYS_REPORTS = 3;

/**
 * Background Analysis Handler
 */
export async function handleAnalysis(wallet: string, email: string, env: Env) {
    console.log(`[Worker] Starting background analysis for ${wallet} (${email})`);

    try {
        // 1. Run Analysis
        const report = await analyzeWallet(wallet);

        // 2. Save to D1
        await saveReportToD1(report, env);

        // 3. Send Email via Resend
        await sendEmailViaResend(email, report, env);

        // 4. Cache in KV for fast retrieval
        await env.REPORT_CACHE.put(`analysis:${wallet}`, JSON.stringify(report), {
            expirationTtl: 86400, // 24 hours
        });

        console.log(`[Worker] Analysis complete for ${wallet}`);
    } catch (err) {
        console.error(`[Worker] Analysis failed for ${wallet}:`, err);
        // Mark job as failed in D1
        await env.DB.prepare(
            'UPDATE jobs SET status = "failed" WHERE wallet = ? AND (status = "pending" OR status = "processing")'
        ).bind(wallet).run();
    }
}

async function saveReportToD1(report: WalletAnalysis, env: Env) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RETENTION_DAYS_REPORTS);

    await env.DB.prepare(`
        INSERT INTO reports (wallet, data, score, expires_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(wallet) DO UPDATE SET
            data = excluded.data,
            score = excluded.score,
            created_at = CURRENT_TIMESTAMP,
            expires_at = excluded.expires_at
    `).bind(
        report.wallet,
        JSON.stringify(report),
        report.privacyScore,
        expiresAt.toISOString()
    ).run();

    // Update job status if it exists
    await env.DB.prepare(
        'UPDATE jobs SET status = "completed" WHERE wallet = ? AND (status = "pending" OR status = "processing")'
    ).bind(report.wallet).run();
}

async function sendEmailViaResend(email: string, report: WalletAnalysis, env: Env) {
    if (!env.RESEND_API_KEY || env.RESEND_API_KEY === 'PLACEHOLDER') {
        console.warn('[Worker] Resend API key not set, skipping email.');
        return;
    }

    const reportUrl = `https://kimiko.app/report/${report.wallet}`;
    const scoreColor = report.privacyScore > 70 ? '#10b981' : report.privacyScore > 40 ? '#f59e0b' : '#ef4444';

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'Kimiko Reports <onboarding@resend.dev>',
            to: email,
            subject: `⛩️ Privacy Alert: Your Kimiko Report is Ready (${report.privacyScore}/100)`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #020204; color: #ffffff; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 40px auto; background: #0a0a0c; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; overflow: hidden; }
                        .header { padding: 40px; text-align: center; background: linear-gradient(180deg, rgba(88, 101, 242, 0.1) 0%, transparent 100%); }
                        .logo { width: 64px; height: 64px; margin-bottom: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
                        .score-card { background: rgba(255,255,255,0.02); border-radius: 20px; padding: 40px; text-align: center; margin: 0 40px; border: 1px solid rgba(255,255,255,0.05); position: relative; }
                        .score-value { font-size: 72px; font-weight: 900; color: ${scoreColor}; letter-spacing: -2px; line-height: 1; }
                        .score-label { color: rgba(255,255,255,0.4); text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 0.2em; margin-top: 8px; }
                        .content { padding: 40px; }
                        .insight-item { padding: 16px; background: rgba(255,255,255,0.02); border-radius: 12px; margin-bottom: 12px; border-left: 3px solid ${scoreColor}; }
                        .btn { display: inline-block; background: #ffffff; color: #000000; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 24px; text-transform: uppercase; letter-spacing: 1px; }
                        .footer { padding: 32px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; font-size: 11px; color: rgba(255,255,255,0.3); }
                        code { background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; font-family: monospace; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 900; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">Kimiko</h1>
                            <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px;">キミコ • Selective Visibility</p>
                        </div>

                        <div class="score-card">
                            <div class="score-value">${report.privacyScore}</div>
                            <div class="score-label">Privacy Health Score</div>
                        </div>

                        <div class="content">
                            <p style="margin-top: 0; color: rgba(255,255,255,0.6); line-height: 1.6;">
                                We've completed the privacy audit for your wallet:<br/>
                                <code style="color: #ffffff;">${report.wallet.slice(0, 12)}...${report.wallet.slice(-8)}</code>
                            </p>
                            
                            <div style="margin: 32px 0;">
                                <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.3); margin-bottom: 16px;">Critical Findings</h3>
                                <div class="insight-item">
                                    <div style="font-weight: 700; margin-bottom: 4px;">Privacy Leakage Detected</div>
                                    <div style="font-size: 13px; color: rgba(255,255,255,0.5);">${report.leakageVectors.length} vectors identified in your transaction history.</div>
                                </div>
                            </div>

                            <div style="text-align: center;">
                                <a href="${reportUrl}" class="btn">View Full Protocol Audit →</a>
                            </div>
                        </div>

                        <div class="footer">
                            ⛩️ This is an automated security transmission.<br/>
                            Kimiko Ecosystem • 2026
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Kimiko Privacy Report\n\nWallet: ${report.wallet}\nScore: ${report.privacyScore}/100\n\nView Full Report: ${reportUrl}`,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend Error: ${error}`);
    }
}
