'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ShieldCheck, ShieldAlert, Shield,
    ChevronLeft, Loader2, Info,
    ExternalLink, LayoutDashboard
} from 'lucide-react';
import { WalletAnalysis } from '@/lib/types';
import PrivacyScore from '@/components/PrivacyScore';
import LeakageVectors from '@/components/LeakageVectors';
import RecommendationsList from '@/components/RecommendationsList';
import TransactionGraph from '@/components/TransactionGraph';
import IncoShield from '@/components/IncoShield';
import SelectiveVisibility from '@/components/SelectiveVisibility';
import ZkAttestation from '@/components/ZkAttestation';
import SurveillanceReport from '@/components/SurveillanceReport';
import { buildGraphData } from '@/lib/graph/builder';

export default function AnalysisPage() {
    const { wallet } = useParams();
    const router = useRouter();
    const [data, setData] = useState<WalletAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Prepare graph data
    const graphData = data?.metadata?.transactions
        ? buildGraphData(data.wallet, data.metadata.transactions)
        : null;

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const res = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wallet })
                });
                const json = await res.json();

                if (json.success) {
                    setData(json.data);
                } else {
                    setError(json.error || 'Failed to analyze wallet');
                }
            } catch (err) {
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (wallet) fetchAnalysis();
    }, [wallet]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-mesh flex flex-col items-center justify-center p-6 bg-[#050505]">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mb-8"
                >
                    <Shield className="w-20 h-20 text-primary opacity-50" />
                </motion.div>
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 text-2xl font-bold">
                        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
                        <span className="text-gradient">Analyzing Privacy Leakage...</span>
                    </div>
                    <p className="text-white/40 max-w-sm text-center">
                        Fetching transaction history and checking for identity exposure vectors. This may take a few seconds.
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        const isRateLimit = error.includes('429') || error.includes('Too many requests');

        return (
            <div className="min-h-screen bg-gradient-mesh flex flex-col items-center justify-center p-6 bg-[#050505] text-center">
                <div className="glass p-12 max-w-lg">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-4">
                        {isRateLimit ? 'RPC Traffic Spike' : 'Analysis Failed'}
                    </h1>
                    <p className="text-white/60 mb-8">
                        {isRateLimit ? (
                            <>
                                The Solana RPC is experiencing high traffic. This typically happens with
                                <span className="text-white font-medium mx-1">very active wallets</span>
                                (exchanges, protocols) that have massive transaction histories.
                                <br /><br />
                                <span className="text-primary">Try using your own wallet address instead</span> -
                                personal wallets analyze much faster!
                            </>
                        ) : (
                            error
                        )}
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold transition-all"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <main className="min-h-screen bg-gradient-mesh bg-[#050505] pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors border-r border-white/10 pr-6 mr-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-semibold">Back</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <img src="/logo.svg" alt="Kimiko Logo" className="w-8 h-8 drop-shadow-glow" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">Kimiko</span>
                                <span className="text-[8px] text-primary/60 font-mono tracking-[0.3em] font-bold">キミコ</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs text-white/40 font-mono">Wallet Address</span>
                            <span className="text-sm font-mono text-secondary truncate max-w-[200px]">
                                {data.wallet}
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary p-[2px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Summary */}
                    <div className="lg:col-span-12 xl:col-span-8 flex flex-col gap-8">
                        {/* Score & Tier Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <PrivacyScore score={data.privacyScore} />

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass p-8 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.complianceTier === 'LOW_RISK' ? 'bg-green-500/20 text-green-500' :
                                            data.complianceTier === 'MEDIUM_RISK' ? 'bg-yellow-500/20 text-yellow-500' :
                                                data.complianceTier === 'HIGH_RISK' ? 'bg-red-500/20 text-red-500' :
                                                    'bg-blue-500/20 text-blue-500'
                                            }`}>
                                            {data.complianceTier === 'LOW_RISK' || data.complianceTier === 'NEW_WALLET' ? <ShieldCheck /> : <ShieldAlert />}
                                        </div>
                                        <h3 className="text-xl font-bold">Compliance Tier</h3>
                                    </div>

                                    <div className="mb-4">
                                        <span className={`text-4xl font-black uppercase tracking-tighter ${data.complianceTier === 'LOW_RISK' ? 'text-green-500' :
                                            data.complianceTier === 'MEDIUM_RISK' ? 'text-yellow-500' :
                                                data.complianceTier === 'HIGH_RISK' ? 'text-red-500' : 'text-blue-500'
                                            }`}>
                                            {data.complianceTier.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="text-white/40 leading-relaxed min-h-[60px]">
                                        {data.complianceTier === 'NEW_WALLET' ? (
                                            <p>
                                                This wallet has <span className="text-white mx-1 font-medium">no transaction history</span>.
                                                While no risks are detected, there is insufficient behavior data for a definitive assessment.
                                            </p>
                                        ) : (
                                            <p>
                                                Based on behavior patterns, this wallet is classified as
                                                <span className="text-white mx-1 font-medium ml-1 uppercase">{data.complianceTier.toLowerCase().replace('_', ' ')}</span>.
                                                {data.complianceTier === 'LOW_RISK' && " No direct links to high-risk entities or suspicious patterns detected."}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-sm text-white/40">Reference ID: {data.metadata.analyzedAt}</span>
                                    <button
                                        onClick={() => document.getElementById('surveillance-report')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="text-secondary text-sm font-bold flex items-center gap-1 hover:underline"
                                    >
                                        View Report <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Middle Section: Graph & Visibility */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <LeakageVectors vectors={data.leakageVectors} />
                            <SelectiveVisibility />
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {graphData && <TransactionGraph data={graphData} />}
                        </div>
                    </div>

                    {/* Right Column: Surveillance & Recommendations */}
                    <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-8">
                        <div id="surveillance-report">
                            <SurveillanceReport insights={data.surveillanceInsights} />
                        </div>
                        <IncoShield wallet={data.wallet} score={data.privacyScore} />
                        <ZkAttestation score={data.privacyScore} />
                        <RecommendationsList recommendations={data.recommendations} />
                    </div>
                </div>
            </div>
        </main>
    );
}
