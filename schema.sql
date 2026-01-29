-- Jobs table: Tracks the status of analysis requests
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    wallet TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Reports table: Stores the final analysis JSON
CREATE TABLE IF NOT EXISTS reports (
    wallet TEXT PRIMARY KEY,
    data TEXT NOT NULL,          -- JSON blob of the analysis result
    score INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Email rate limits: Prevents abuse
CREATE TABLE IF NOT EXISTS email_limits (
    email TEXT NOT NULL,
    wallet TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (email, wallet)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_reports_expires ON reports(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_limits_created ON email_limits(created_at);
