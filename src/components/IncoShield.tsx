'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, CheckCircle2, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { IncoShieldUtility } from '@/lib/inco/shield';

interface IncoShieldProps {
    wallet: string;
    score: number;
}

const IncoShield: React.FC<IncoShieldProps> = ({ wallet, score }) => {
    const [status, setStatus] = useState<'idle' | 'encrypting' | 'shielding' | 'complete'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);

    const handleShield = async () => {
        try {
            setStatus('encrypting');
            const utility = new IncoShieldUtility();

            // Artificial delay for "wow" effect and to show states
            await new Promise(r => setTimeout(r, 1500));

            setStatus('shielding');
            const result = await utility.shield(wallet, score);

            await new Promise(r => setTimeout(r, 1000));

            if (result.success) {
                setTxHash(result.txHash || null);
                setStatus('complete');
            } else {
                throw new Error(result.error || 'Unknown shielding error');
            }
        } catch (error) {
            console.error('Shielding failed:', error);
            setStatus('idle');
        }
    };

    return (
        <div className="glass p-8 relative group flex-none min-h-[340px] flex flex-col justify-between">
            {/* Background Glow - Wrapped to prevent clipping main content */}
            <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary p-[2px]">
                        <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Shield with Inco
                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-full uppercase tracking-widest">TEE Enabled</span>
                        </h3>
                        <p className="text-white/40 text-sm">Confidential Reputation Proofs</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex-1 flex flex-col justify-between gap-6"
                        >
                            <p className="text-white/60 leading-relaxed">
                                Use Inco Lightning to encrypt your privacy score. Protocols can verify your compliance without ever seeing your actual wallet or balance.
                            </p>
                            <button
                                onClick={handleShield}
                                className="shimmer-btn w-full h-14 bg-gradient-to-r from-primary to-secondary text-white font-black rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 border border-white/10"
                            >
                                <Shield className="w-5 h-5" />
                                CONFIDENTIALIZE SCORE
                            </button>
                        </motion.div>
                    )}

                    {(status === 'encrypting' || status === 'shielding') && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-6 flex flex-col items-center justify-center gap-4 text-center"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full"
                                />
                                <Lock className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg animate-pulse">
                                    {status === 'encrypting' ? 'Encrypting with FHE...' : 'Submitting to TEE relayer...'}
                                </h4>
                                <p className="text-white/40 text-sm">Kimiko is generating an attested confidential proof</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-6 flex flex-col items-center justify-center gap-4 text-center"
                        >
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center ring-4 ring-green-500/10">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-green-500 flex items-center justify-center gap-2">
                                    Score Shielded
                                    <Sparkles className="w-4 h-4" />
                                </h4>
                                <p className="text-white/60 text-sm mb-4">Your reputation is now private yet verifiable</p>
                                {txHash && (
                                    <div className="flex items-center gap-2 text-[10px] font-mono bg-white/5 p-2 rounded-lg border border-white/10 text-white/30">
                                        TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                                        <ExternalLink className="w-3 h-3 cursor-pointer hover:text-white" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default IncoShield;
