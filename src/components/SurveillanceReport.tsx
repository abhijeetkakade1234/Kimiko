'use client';

import { motion } from 'framer-motion';
import { Eye, User, DollarSign, Share2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SurveillanceInsight } from '@/lib/types';

interface SurveillanceReportProps {
    insights: SurveillanceInsight[];
}

export default function SurveillanceReport({ insights }: SurveillanceReportProps) {
    if (!insights || insights.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 flex flex-col items-center justify-center text-center gap-4"
            >
                <ShieldCheck className="w-12 h-12 text-secondary opacity-50" />
                <div>
                    <h3 className="text-xl font-bold mb-2">Private Signature</h3>
                    <p className="text-white/40 text-sm">
                        No significant behavioral labels or identity correlations detected.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                    <Eye className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Surveillance Report</h2>
                    <p className="text-white/40 text-sm">How visible is your on-chain behavior?</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {insights.map((insight, i) => (
                    <motion.div
                        key={insight.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-6 border-l-4 border-l-red-500/50 hover:bg-white/5 transition-all group"
                    >
                        <div className="flex gap-4">
                            <div className="mt-1">
                                {getIcon(insight.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-lg group-hover:text-red-400 transition-colors">
                                        {insight.label}
                                    </h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-widest ${insight.privacyImpact === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                                            insight.privacyImpact === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                                                'bg-blue-500/20 text-blue-500'
                                        }`}>
                                        {insight.privacyImpact} RISK
                                    </span>
                                </div>
                                <p className="text-sm text-white/50 leading-relaxed mb-3">
                                    {insight.description}
                                </p>
                                {insight.exposedValue && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-xs">
                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                        <span className="text-white/40 italic">Visible Data:</span>
                                        <span className="text-red-400 font-mono font-bold">{insight.exposedValue}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass p-6 bg-primary/5 border-primary/20">
                <p className="text-xs text-white/40 leading-relaxed italic">
                    <span className="text-primary font-bold mr-1">Note:</span>
                    Public blockchains are "Perpetual Surveillance Machines". Every link you create (to X, to CEX, to specific NFTs)
                    is indexed by labeling platforms like Arkham and 0xppl. Selective privacy is the only way to break these loops.
                </p>
            </div>
        </section>
    );
}

function getIcon(type: string) {
    switch (type) {
        case 'identity': return <User className="w-5 h-5 text-purple-500" />;
        case 'financial': return <DollarSign className="w-5 h-5 text-green-500" />;
        case 'social': return <Share2 className="w-5 h-5 text-blue-500" />;
        default: return <Eye className="w-5 h-5 text-red-500" />;
    }
}
