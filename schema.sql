-- Jobs table for background analysis tracking
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    wallet TEXT NOT NULL,
    email TEXT,
    status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reports table for persistent storage
CREATE TABLE IF NOT EXISTS reports (
    wallet TEXT PRIMARY KEY,
    data TEXT NOT NULL, -- JSON stringified WalletAnalysis
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email rate limiting Table
CREATE TABLE IF NOT EXISTS email_limits (
    email TEXT PRIMARY KEY,
    last_sent_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_wallet ON jobs(wallet);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_email_limits_created_at ON email_limits(created_at);
