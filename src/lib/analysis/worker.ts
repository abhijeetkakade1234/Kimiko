/// <reference types="@cloudflare/workers-types" />
import { WalletAnalysis, TransactionNode } from '../types';
import { analyzeWallet } from './engine';

export interface Job {
    id: string;
    wallet: string;
    email?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface Env {
    DB: D1Database;
    REPORT_CACHE: KVNamespace;
    RESEND_API_KEY: string;
    HELIUS_API_KEY: string;
}

const RETENTION_DAYS_REPORTS = 3;
const RETENTION_DAYS_JOBS = 1;

/**
 * Shared Background Analysis Logic
 */
export async function handleAnalysis(job: Job, env: Env) {
    console.log(`[Worker] Starting analysis for ${job.wallet} (Job: ${job.id})`);

    try {
        // 1. Update status to processing
        await env.DB.prepare('UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind('processing', job.id)
            .run();

        // 2. Perform heavy analysis
        const result = await analyzeWallet(job.wallet);

        // 3. Save report to D1
        await env.DB.prepare('INSERT OR REPLACE INTO reports (wallet, data, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
            .bind(job.wallet, JSON.stringify(result))
            .run();

        // 4. Cache in KV
        await env.REPORT_CACHE.put(`analysis_${job.wallet}`, JSON.stringify(result), {
            expirationTtl: 86400 // 1 day cache
        });

        // 5. Send email if provided
        if (job.email && env.RESEND_API_KEY) {
            await sendResendEmail(job.email, result, env.RESEND_API_KEY);
        }

        // 6. Complete job
        await env.DB.prepare('UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind('completed', job.id)
            .run();

        console.log(`[Worker] Analysis complete for ${job.wallet}`);
    } catch (err: any) {
        console.error(`[Worker] Analysis failed for ${job.id}:`, err);
        await env.DB.prepare('UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .bind('failed', job.id)
            .run();
    }
}

/**
 * Database Maintenance Logic (The "Cron" replacement)
 */
export async function performMaintenance(env: Env) {
    console.log("[Maintenance] Starting database cleanup...");

    try {
        // Delete old jobs
        const jobsResult = await env.DB.prepare(
            "DELETE FROM jobs WHERE created_at < datetime('now', ?)"
        ).bind(`-${RETENTION_DAYS_JOBS} days`).run();

        // Delete old reports
        const reportsResult = await env.DB.prepare(
            "DELETE FROM reports WHERE created_at < datetime('now', ?)"
        ).bind(`-${RETENTION_DAYS_REPORTS} days`).run();

        // Delete old email limits (cleanup entries older than 7 days)
        await env.DB.prepare(
            "DELETE FROM email_limits WHERE created_at < datetime('now', '-7 days')"
        ).run();

        console.log(`[Maintenance] Cleaned up ${jobsResult.meta.changes} jobs and ${reportsResult.meta.changes} reports.`);
    } catch (err) {
        console.error("[Maintenance] Cleanup failed:", err);
    }
}

async function sendResendEmail(email: string, result: WalletAnalysis, apiKey: string) {
    const scoreColor = result.privacyScore > 70 ? '#22c55e' : result.privacyScore > 40 ? '#eab308' : '#ef4444';

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: white; padding: 40px; border-radius: 20px;">
            <h1 style="color: #00ffbd; margin-bottom: 5px;">Kimiko Privacy Report</h1>
            <p style="color: #666; font-size: 12px; margin-bottom: 30px;">Digital Zen & Compliance Architecture</p>
            
            <div style="background: rgba(255,255,255,0.05); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
                <div style="font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 2px;">Privacy Score</div>
                <div style="font-size: 64px; font-weight: 800; color: ${scoreColor};">${result.privacyScore}</div>
                <div style="font-size: 18px; font-weight: bold; color: white; margin-top: 10px;">${result.complianceTier.replace('_', ' ')}</div>
            </div>

            <h3 style="color: white; border-bottom: 1px solid #333; padding-bottom: 10px;">Surveillance Insights</h3>
            ${result.surveillanceInsights.map(i => `
                <div style="margin-bottom: 15px;">
                    <div style="color: #00ffbd; font-weight: bold;">${i.label}</div>
                    <div style="color: #aaa; font-size: 14px;">${i.description}</div>
                </div>
            `).join('')}

            <p style="margin-top: 40px; text-align: center;">
                <a href="https://kimiko.pages.dev/analyze/${result.wallet}" 
                   style="background: #00ffbd; color: black; padding: 12px 25px; border-radius: 8px; font-weight: bold; text-decoration: none;">
                   View Interactive Graph
                </a>
            </p>
        </div>
    `;

    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            from: 'Kimiko <no-reply@kimiko.pages.dev>',
            to: [email],
            subject: `Kimiko Privacy Report: ${result.privacyScore}/100`,
            html: html
        })
    });
}
