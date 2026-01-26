'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Fingerprint, Lock, Loader2, Sparkles, Check, FileCheck } from 'lucide-react';
import { ZkPrivacyService, ZkProofResult } from '@/lib/zk/service';

interface ZkAttestationProps {
    score: number;
}

const ZkAttestation: React.FC<ZkAttestationProps> = ({ score }) => {
    const [status, setStatus] = useState<'idle' | 'generating' | 'verifying' | 'complete'>('idle');
    const [proof, setProof] = useState<ZkProofResult | null>(null);

    const generateProof = async () => {
        try {
            setStatus('generating');
            // We want to prove we are above the "High Privacy" threshold (e.g. 70)
            const result = await ZkPrivacyService.generateComplianceProof(score, 70);
            setProof(result);

            setStatus('verifying');
            const isValid = await ZkPrivacyService.verifyProof(result);

            if (isValid) {
                setStatus('complete');
            } else {
                alert("Score below threshold. Cannot generate ZK-Attestation.");
                setStatus('idle');
            }
        } catch (error) {
            console.error('ZK Generation failed:', error);
            setStatus('idle');
        }
    };

    return (
        <div className="glass p-8 relative overflow-hidden group border-secondary/20 bg-secondary/5">
            {/* Background Zen Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-seigaiha"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/20 text-secondary flex items-center justify-center border border-secondary/30">
                        <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            ZK-Privacy Attestation
                            <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-1 rounded-full uppercase tracking-widest">Phase 2</span>
                        </h3>
                        <p className="text-white/40 text-sm">Generate a zero-knowledge compliance proof</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <p className="text-white/60 text-sm leading-relaxed">
                                Prove your privacy status to external protocols without revealing your wallet or transaction history.
                                Uses <span className="text-secondary font-mono">Groth16</span> SNARKs for extreme confidentiality.
                            </p>
                            <button
                                onClick={generateProof}
                                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all hover:border-secondary/50 group"
                            >
                                <Fingerprint className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                                GENERATE ZK-PROOF
                            </button>
                        </motion.div>
                    )}

                    {(status === 'generating' || status === 'verifying') && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-10 flex flex-col items-center justify-center gap-4 text-center"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 border-2 border-secondary/20 border-t-secondary rounded-full"
                                />
                                <Lock className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-secondary animate-pulse uppercase tracking-widest">
                                    {status === 'generating' ? 'Computing SNARK...' : 'Verifying Proof...'}
                                </h4>
                                <p className="text-[10px] text-white/30 font-mono mt-2">CONSTAINTS: 24,502 | CURVE: BN128</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'complete' && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <Check className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-green-500 font-bold">Proof Verified</p>
                                    <p className="text-[10px] text-white/40 font-mono">HASH: {proof?.proof.slice(0, 20)}...</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                <h5 className="text-[10px] uppercase font-black text-white/40 mb-2 tracking-widest">Public Signals</h5>
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white/60">
                                    <div className="p-2 bg-white/5 rounded">THRESHOLD: 70</div>
                                    <div className="p-2 bg-white/5 rounded">STATUS: COMPLIANT</div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-secondary/20 hover:bg-secondary/30 text-secondary rounded-lg text-xs font-black uppercase tracking-widest border border-secondary/20 transition-all">
                                Download Attestation
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ZkAttestation;
