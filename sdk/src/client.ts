export type ComplianceTier = 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'NEW_WALLET';

export interface PrivacyScoreResponse {
    success: boolean;
    wallet: string;
    privacyScore: number;
    complianceTier: ComplianceTier;
    lastAnalyzed: number;
    cached: boolean;
}

export interface KimikoConfig {
    apiKey?: string;
    baseUrl?: string;
}

export class KimikoClient {
    private baseUrl: string;
    private apiKey?: string;

    constructor(config: KimikoConfig = {}) {
        this.baseUrl = config.baseUrl || 'https://kimiko-privacy.vercel.app'; // Default to prod
        this.apiKey = config.apiKey;
    }

    /**
     * Get basic privacy score and compliance tier for a wallet.
     * Uses the lightweight GET endpoint.
     */
    async getScore(wallet: string): Promise<PrivacyScoreResponse> {
        const response = await fetch(`${this.baseUrl}/api/score/${wallet}`, {
            headers: this.apiKey ? { 'X-API-Key': this.apiKey } : {}
        });

        if (!response.ok) {
            throw new Error(`Kimiko API Error: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Perform deep analysis on a wallet.
     * Uses the POST /api/analyze endpoint.
     */
    async analyze(wallet: string) {
        const response = await fetch(`${this.baseUrl}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {})
            },
            body: JSON.stringify({ wallet })
        });

        if (!response.ok) {
            throw new Error(`Kimiko API Error: ${response.statusText}`);
        }

        return response.json();
    }
}
